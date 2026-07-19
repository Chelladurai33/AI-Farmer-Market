const { sendSuccess, sendError } = require('../utils/apiResponse');
const geminiService = require('../services/gemini.service');

const CHAT_SYSTEM_PROMPT = `You are AgroBot, an AI assistant for AI Farmer Marketplace - a platform connecting Indian farmers with buyers.
You help with:
- Crop price information and market trends
- Farming best practices and crop selection
- Disease identification and treatment
- Cold storage advice
- Weather-based farming decisions
- Government schemes for farmers
- Selling tips and market access
- Fertilizer and pesticide guidance
You support both English and Tamil. Respond in the same language as the user's message.
Keep responses concise, practical, and farmer-friendly.
If asked about unrelated topics, politely redirect to farming topics.`;

const sendMessage = async (req, res, next) => {
  try {
    const { message, history = [], language = 'en', context = null } = req.body;
    if (!message || !message.trim()) {
      return sendError(res, 'Message is required', 400);
    }

    let finalPrompt = CHAT_SYSTEM_PROMPT;
    if (context) {
      finalPrompt += `\n\nUSER CONTEXT:\nLocation: ${context.location || 'Unknown'}\nCurrent Weather: ${context.weather || 'Unknown'}\nUse this context to give highly personalized, accurate advice. E.g., if wind speed is high, advise against spraying pesticides. If it's raining soon, advise against irrigation.`;
    }

    const systemPrompt = language === 'ta'
      ? finalPrompt + '\nRespond in Tamil (தமிழ்) language.'
      : finalPrompt;

    let reply;
    try {
      reply = await geminiService.callGeminiText(systemPrompt, history, message);
    } catch {
      reply = language === 'ta'
        ? 'மன்னிக்கவும், தற்போது சேவை கிடைக்கவில்லை. சிறிது நேரம் கழித்து முயற்சிக்கவும்.'
        : 'Sorry, the AI assistant is temporarily unavailable. Please try again in a moment.';
    }

    return sendSuccess(res, { reply, language });
  } catch (err) {
    next(err);
  }
};

module.exports = { sendMessage };
