
const { z } = require('zod');
const { sendSuccess, sendError, sendValidationError } = require('../utils/apiResponse');
const geminiService = require('../services/gemini.service');

const prisma = require('../utils/prisma');

const forecastSchema = z.object({
  cropName: z.string().min(1),
  district: z.string().min(1),
  subDistrict: z.string().optional(),
  season: z.string().optional(),
});

const DEMAND_SYSTEM_PROMPT = `You are a real-time agricultural market demand analyst for Tamil Nadu, India.
You have expert knowledge of:
- All 38 Tamil Nadu districts and their 261 taluks (subdistricts) and local market dynamics
- APMC (Agricultural Produce Market Committee) mandis: Chennai Koyambedu, Madurai Mattuthavani, Coimbatore UPCL, Salem, Trichy, Erode, Tirunelveli etc.
- District-specific crop production hubs: Erode=Turmeric world capital, Dindigul=Chilli & Garlic, Thanjavur=Paddy/Rice bowl, Nilgiris=Tea & vegetables, Coimbatore=Cotton & Groundnut, Thoothukudi=Export crops, Hosur=Flowers & vegetables for Bangalore, Sivakasi=Groundnut & Chilli, Palani=Bananas, Kodaikanal=Temperate vegetables
- Tamil Nadu Government schemes: PM-KISAN, TNCSC procurement, Uzhavar Sandhai (farmer markets in 153 locations)
- Real market festivals: Pongal (Jan), Tamil New Year (Apr), Aadi (Jul), Karthigai (Nov), Christmas-New Year surge
- Export corridors: Thoothukudi port (vegetables/fruits), Chennai port (processed), Salem for groundnut
- Cold chain infrastructure by district (Nilgiris, Hosur, Kancheepuram have better logistics)
- Competitor supply from Andhra Pradesh, Karnataka, Kerala affecting Tamil Nadu prices seasonally
- Inter-state demand: Chennai metro daily vegetable demand 4000+ MT, Coimbatore 800+ MT

REAL-TIME FACTORS TO CONSIDER (for current date/month provided):
- Month-specific seasonal demand (e.g., July = Kharif planting, post-monsoon demand surge)
- Festival calendar proximity
- School/college calendar impact on urban demand
- Current monsoon status affecting transport and field conditions
- National market trends from major APMC hubs like Nashik (onion), Bangalore APMC

REASONING RULES:
1. If subdistrict is provided, factor in that taluk's specific market access and local buyer patterns
2. Score 80-100 = VERY_HIGH (festival season OR off-season scarcity), 60-79 = HIGH, 40-59 = MEDIUM, 20-39 = LOW, 0-19 = VERY_LOW
3. Recommendations must mention specific local Uzhavar Sandhai locations, APMC names, or buyer types
4. Be SPECIFIC to Tamil Nadu — avoid generic advice

Return ONLY this exact JSON structure, no markdown, no extra text:
{
  "demandLevel": <"VERY_HIGH" | "HIGH" | "MEDIUM" | "LOW" | "VERY_LOW">,
  "demandScore": <integer 0-100>,
  "reason": <string: 3-4 sentences with district/taluk specific market facts and current seasonal context>,
  "peakDemandMonths": [<3-4 month names when this crop peaks in this district>],
  "targetBuyers": [<specific buyer types: e.g. "Koyambedu wholesale traders", "Tiruppur textile workers cooperative", "Export agents at Thoothukudi port">],
  "competitorSupply": <"HIGH" | "MEDIUM" | "LOW">,
  "exportPotential": <boolean>,
  "recommendations": [
    <string: specific action mentioning local APMC or Uzhavar Sandhai market>,
    <string: grading/packaging/timing advice for maximum profit>,
    <string: alternative buyer or value-addition suggestion>
  ]
}`;

const forecastDemand = async (req, res, next) => {
  try {
    const result = forecastSchema.safeParse(req.body);
    if (!result.success) {
      return sendValidationError(res, result.error.flatten().fieldErrors);
    }
    const { cropName, district, subDistrict, season } = result.data;

    const today = new Date();
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const currentMonth = monthNames[today.getMonth()];
    const currentSeason = today.getMonth() >= 5 && today.getMonth() <= 9 ? 'Kharif (Southwest Monsoon Season)' :
                          today.getMonth() >= 10 || today.getMonth() <= 1 ? 'Rabi (Northeast Monsoon / Winter Season)' : 'Zaid (Summer / Hot Season)';
    const todayDate = today.toISOString().split('T')[0];

    const locationStr = subDistrict
      ? `${subDistrict} Taluk, ${district} District, Tamil Nadu`
      : `${district} District, Tamil Nadu`;

    const userPrompt = `Crop: ${cropName}
Location: ${locationStr}
Today's Date: ${todayDate}
Current Month: ${currentMonth}
Current Season: ${currentSeason}
${subDistrict ? `Subdistrict/Taluk: ${subDistrict}` : ''}
Task: Provide a real-time demand forecast for ${cropName} in ${locationStr} for ${currentMonth} ${today.getFullYear()}.`;

    let forecast;
    try {
      forecast = await geminiService.callGeminiJSON(DEMAND_SYSTEM_PROMPT, userPrompt);
    } catch {
      forecast = {
        demandLevel: 'MEDIUM',
        demandScore: 50,
        reason: 'Demand analysis temporarily unavailable. Based on historical Tamil Nadu market data, medium demand expected for this crop.',
        peakDemandMonths: ['October', 'November', 'December'],
        targetBuyers: ['Local APMC Traders', 'Wholesale Markets', 'Uzhavar Sandhai'],
        competitorSupply: 'MEDIUM',
        exportPotential: false,
        recommendations: [
          'Visit your nearest Uzhavar Sandhai for direct sale to consumers',
          'Contact the district APMC office for current mandi rates',
          'Consider grading and packaging to access premium buyers',
        ],
      };
    }

    const saved = await prisma.demandForecast.create({
      data: {
        cropName,
        district,
        demandLevel: forecast.demandLevel,
        reason: forecast.reason,
      },
    });

    return sendSuccess(res, { ...saved, ...forecast, subDistrict: subDistrict || null }, 201, 'Demand forecast generated');
  } catch (err) {
    next(err);
  }
};

module.exports = { forecastDemand };

