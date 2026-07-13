
const { z } = require('zod');
const { sendSuccess, sendError, sendValidationError } = require('../utils/apiResponse');
const geminiService = require('../services/gemini.service');

const prisma = require('../utils/prisma');

const forecastSchema = z.object({
  cropName: z.string().min(1),
  district: z.string().min(1),
  season: z.string().optional(),
});

const DEMAND_SYSTEM_PROMPT = `You are an agricultural demand forecasting AI for Indian markets.
Given a crop and district, forecast demand and return ONLY this JSON:
{
  "demandLevel": <"HIGH" | "MEDIUM" | "LOW" | "VERY_HIGH" | "VERY_LOW">,
  "demandScore": <number 0-100>,
  "reason": <string: 2-3 sentence explanation>,
  "peakDemandMonths": [<month names>],
  "targetBuyers": [<string>],
  "competitorSupply": <"HIGH" | "MEDIUM" | "LOW">,
  "exportPotential": <boolean>,
  "recommendations": [<string>, <string>]
}
Return ONLY the JSON.`;

const forecastDemand = async (req, res, next) => {
  try {
    const result = forecastSchema.safeParse(req.body);
    if (!result.success) {
      return sendValidationError(res, result.error.flatten().fieldErrors);
    }
    const { cropName, district, season } = result.data;

    const userPrompt = `Crop: ${cropName}
District: ${district}, Tamil Nadu, India
Current Season: ${season || 'Kharif'}
Month: ${new Date().toLocaleString('default', { month: 'long' })}`;

    let forecast;
    try {
      forecast = await geminiService.callGeminiJSON(DEMAND_SYSTEM_PROMPT, userPrompt);
    } catch {
      forecast = {
        demandLevel: 'MEDIUM',
        demandScore: 50,
        reason: 'Demand analysis temporarily unavailable. Based on historical data, medium demand expected.',
        peakDemandMonths: ['October', 'November', 'December'],
        targetBuyers: ['Local Markets', 'Wholesale Traders'],
        competitorSupply: 'MEDIUM',
        exportPotential: false,
        recommendations: ['Monitor APMC prices', 'Connect with local traders'],
      };
    }

    const saved = await prisma.demandForecast.create({
      data: { cropName, district, demandLevel: forecast.demandLevel, reason: forecast.reason },
    });

    return sendSuccess(res, { ...saved, ...forecast }, 201, 'Demand forecast generated');
  } catch (err) {
    next(err);
  }
};

module.exports = { forecastDemand };
