
const { z } = require('zod');
const { sendSuccess, sendError, sendValidationError } = require('../utils/apiResponse');
const geminiService = require('../services/gemini.service');

const prisma = require('../utils/prisma');

const predictionSchema = z.object({
  cropName: z.string().min(1),
  district: z.string().min(1),
  currentPrice: z.number().positive(),
  harvestDate: z.string(),
  quantity: z.number().positive(),
  unit: z.string().optional(),
});

const PRICE_SYSTEM_PROMPT = `You are an expert agricultural market analyst specializing in Tamil Nadu, India.
You have deep knowledge of:
- All 38 Tamil Nadu district APMC (Agricultural Produce Market Committee) price data and historical trends
- Tamil Nadu seasonal crop calendars: Kharif (June-Oct), Rabi (Nov-Feb), Zaid (Mar-May)
- District-specific market demand: e.g., Coimbatore is a textile hub (cotton, turmeric), Thanjavur is the rice bowl, Dindigul is famous for chilli and garlic, Nilgiris for tea and vegetables, Madurai for jasmine and banana, Erode for turmeric, Namakkal for eggs and poultry feed crops
- APMC mandi rates across Tamil Nadu (Chennai CMDA, Koyambedu market, Salem, Madurai Mattuthavani, etc.)
- Seasonal demand fluctuations: festival seasons (Pongal, Diwali, Ramadan), school calendar, and monsoon impact
- Supply chain factors: transportation costs from district to major cities, cold storage availability
- Government MSP (Minimum Support Price) policies for paddy, pulses, oilseeds
- Export demand from Tamil Nadu ports (Thoothukudi, Chennai) for specific crops

REASONING PROCESS (do this internally before outputting):
1. Identify the current month/season from the harvest date
2. Check if district is a major production hub OR consumption center for this crop
3. Factor in typical 30-day seasonal price movement for this crop in this district
4. Consider festival/event demand within the next week
5. Calculate realistic price range (do NOT vary more than ±25% from current price unless seasonal logic demands it)
6. Ensure predictedNextWeek price reflects REAL market volatility (not just +5%)

OUTPUT FORMAT - Return ONLY this valid JSON, no markdown, no explanation:
{
  "predictedTomorrow": <number: realistic price per kg in INR based on district APMC trends>,
  "predictedNextWeek": <number: realistic price per kg in INR based on seasonal forecast>,
  "demandTrend": <"RISING" | "FALLING" | "STABLE">,
  "confidence": <number 0.0-1.0: higher if crop is in-season for this district>,
  "recommendation": <string: specific actionable advice mentioning the district's nearest APMC or market>,
  "expectedProfitTomorrow": <number: predictedTomorrow * quantity>,
  "expectedProfitNextWeek": <number: predictedNextWeek * quantity>,
  "bestSellingTime": <"NOW" | "TOMORROW" | "NEXT_WEEK" | "WAIT_LONGER">,
  "marketInsights": [
    <string: district-specific supply/demand insight>,
    <string: seasonal or weather factor affecting price>,
    <string: actionable market tip e.g. nearest APMC, buyer type, grading advice>
  ]
}
CRITICAL: Base predictions on REAL Tamil Nadu market economics. Do NOT use fictional prices.`;

const predictPrice = async (req, res, next) => {
  try {
    const result = predictionSchema.safeParse(req.body);
    if (!result.success) {
      return sendValidationError(res, result.error.flatten().fieldErrors);
    }
    const { cropName, district, currentPrice, harvestDate, quantity, unit } = result.data;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const currentMonth = monthNames[today.getMonth()];
    const harvestDateObj = new Date(harvestDate);
    const daysToHarvest = Math.max(0, Math.round((harvestDateObj - today) / (1000 * 60 * 60 * 24)));
    const season = today.getMonth() >= 5 && today.getMonth() <= 9 ? 'Kharif (Monsoon Season)' :
                   today.getMonth() >= 10 || today.getMonth() <= 1 ? 'Rabi (Winter Season)' : 'Zaid (Summer Season)';

    const userPrompt = `Crop: ${cropName}
District: ${district}, Tamil Nadu, India
Current Market Price: ₹${currentPrice}/kg
Available Quantity: ${quantity} ${unit || 'kg'}
Harvest Date: ${harvestDate} (${daysToHarvest} days from today)
Today's Date: ${todayStr} (${currentMonth}, ${season})
Note: Calculate expectedProfitTomorrow = predictedTomorrow × ${quantity} and expectedProfitNextWeek = predictedNextWeek × ${quantity}`;

    let prediction;
    try {
      prediction = await geminiService.callGeminiJSON(PRICE_SYSTEM_PROMPT, userPrompt);
    } catch {
      // Graceful fallback
      prediction = {
        predictedTomorrow: currentPrice * 1.02,
        predictedNextWeek: currentPrice * 1.05,
        demandTrend: 'STABLE',
        confidence: 0.5,
        recommendation: 'Market analysis temporarily unavailable. Check local APMC rates for accurate pricing.',
        expectedProfitTomorrow: currentPrice * 1.02 * quantity,
        expectedProfitNextWeek: currentPrice * 1.05 * quantity,
        bestSellingTime: 'NOW',
        marketInsights: ['Check local APMC', 'Monitor weather conditions', 'Contact local traders'],
      };
    }

    const saved = await prisma.pricePrediction.create({
      data: {
        userId: req.user.id,
        cropName,
        district,
        currentPrice,
        predictedTomorrow: prediction.predictedTomorrow,
        predictedNextWeek: prediction.predictedNextWeek,
        demandTrend: prediction.demandTrend,
        confidence: prediction.confidence,
        recommendation: prediction.recommendation,
      },
    });

    return sendSuccess(res, { ...saved, ...prediction }, 201, 'Price prediction generated');
  } catch (err) {
    next(err);
  }
};

const getPriceHistory = async (req, res, next) => {
  try {
    const predictions = await prisma.pricePrediction.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return sendSuccess(res, predictions);
  } catch (err) {
    next(err);
  }
};

module.exports = { predictPrice, getPriceHistory };
