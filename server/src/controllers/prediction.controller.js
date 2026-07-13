
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

const PRICE_SYSTEM_PROMPT = `You are an agricultural price prediction AI for Indian farmers.
Given crop data, analyze market trends and return ONLY valid JSON with this EXACT structure:
{
  "predictedTomorrow": <number: price per kg in INR>,
  "predictedNextWeek": <number: price per kg in INR>,
  "demandTrend": <"RISING" | "FALLING" | "STABLE">,
  "confidence": <number between 0 and 1>,
  "recommendation": <string: brief actionable advice for the farmer>,
  "expectedProfitTomorrow": <number: total profit in INR if sold tomorrow>,
  "expectedProfitNextWeek": <number: total profit in INR if sold next week>,
  "bestSellingTime": <"NOW" | "TOMORROW" | "NEXT_WEEK" | "WAIT_LONGER">,
  "marketInsights": [<string>, <string>, <string>]
}
Base your prediction on seasonal patterns, district demand, crop type, and typical Indian agricultural market behavior.
Return ONLY the JSON object, no explanation.`;

const predictPrice = async (req, res, next) => {
  try {
    const result = predictionSchema.safeParse(req.body);
    if (!result.success) {
      return sendValidationError(res, result.error.flatten().fieldErrors);
    }
    const { cropName, district, currentPrice, harvestDate, quantity, unit } = result.data;

    const userPrompt = `Crop: ${cropName}
District: ${district}, Tamil Nadu, India
Current Market Price: ₹${currentPrice}/kg
Harvest Date: ${harvestDate}
Available Quantity: ${quantity} ${unit || 'kg'}
Today's Date: ${new Date().toISOString().split('T')[0]}`;

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
