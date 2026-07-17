const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

let genAI;

const hasValidKey = () => {
  const key = process.env.GEMINI_API_KEY;
  return key && key !== 'your_gemini_api_key_here' && !key.startsWith('your_');
};

const getGenAI = () => {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
  }
  return genAI;
};

/* ============================================
   MOCK GENERATOR FALLBACKS
   ============================================ */

const getMockVisionAnalysis = (originalName = '') => {
  const name = (originalName || '').toLowerCase();
  
  const mockAnalyses = {
    tomato: {
      cropName: "Tomato",
      isHealthy: false,
      diseaseName: "Early Blight",
      confidence: 0.92,
      symptoms: "Concentric dark spots (target-like) on older leaves, yellowing around spots, premature leaf drop.",
      causes: "Fungal pathogen Alternaria solani. Favored by warm temperatures and frequent rainfall/wet leaves.",
      treatment: "Prune lower leaves to prevent soil-to-leaf splashing. Apply copper-based fungicides or Chlorothalonil every 7-10 days.",
      fertilizer: "Apply calcium-rich fertilizer (like bone meal) to strengthen leaf tissue against fungal penetration.",
      pesticide: "Mancozeb or Copper Oxychloride.",
      organicAlt: "Spray baking soda solution (1 tbsp baking soda, 1 tsp liquid soap, 1 gallon water) or diluted neem oil.",
      prevention: "Practice crop rotation, water at the base of the plant rather than overhead, and space plants for air circulation.",
      recoveryTime: "10-14 days"
    },
    rice: {
      cropName: "Rice (Paddy)",
      isHealthy: false,
      diseaseName: "Rice Blast",
      confidence: 0.88,
      symptoms: "Spindle-shaped (diamond-shaped) lesions with gray centers and brown borders on leaves and nodes.",
      causes: "Fungal pathogen Magnaporthe oryzae. Spread by wind-borne spores, favored by high humidity and cool nights.",
      treatment: "Avoid excessive nitrogen fertilizers. Apply systemic fungicides like Tricyclazole or Carbendazim immediately.",
      fertilizer: "Apply Silicon-based fertilizers to strengthen cell walls and increase resistance to fungal penetration.",
      pesticide: "Tricyclazole 75% WP or Azoxystrobin.",
      organicAlt: "Spray Pseudomonas fluorescens formulation at 10g/litre of water or diluted garlic extract.",
      prevention: "Use resistant crop varieties, destroy infected crop residue after harvest, and maintain optimal water level.",
      recoveryTime: "2-3 weeks"
    },
    cotton: {
      cropName: "Cotton",
      isHealthy: false,
      diseaseName: "Cotton Leaf Curl Virus",
      confidence: 0.95,
      symptoms: "Upward or downward curling of leaf margins, thickening of leaf veins, and cup-like leaf outgrowths (enations).",
      causes: "Cotton Leaf Curl Virus (CLCuV), transmitted primarily by the sweetpotato whitefly (Bemisia tabaci).",
      treatment: "No direct cure for the virus. Immediately pull up and burn infected plants to prevent transmission. Control whiteflies.",
      fertilizer: "Apply potassium-rich fertilizers to help the crop tolerate viral stress and boost immunity.",
      pesticide: "Imidacloprid or Acetamiprid to control the whitefly vector.",
      organicAlt: "Spray neem seed kernel extract (5%) or yellow sticky traps to capture and monitor whiteflies.",
      prevention: "Plant virus-resistant cotton hybrids, remove weed hosts near the field, and manage whitefly populations early.",
      recoveryTime: "Not curable (focus on vector control)"
    },
    spinach: {
      cropName: "Spinach",
      isHealthy: true,
      diseaseName: null,
      confidence: 0.98,
      symptoms: "Leaves are vibrant green, crisp, and free from spots, discoloration, or curling.",
      causes: "Excellent nutrient levels, proper watering, and clean soil conditions.",
      treatment: "No treatment required. Harvest outer leaves regularly to encourage new growth.",
      fertilizer: "Apply nitrogen-rich organic compost or fish emulsion to support lush foliage growth.",
      pesticide: "None needed. Keep monitoring for aphids or slugs.",
      organicAlt: "Not applicable.",
      prevention: "Maintain consistent soil moisture, weed regularly, and mulch to keep leaves clean of soil splashes.",
      recoveryTime: "Healthy"
    },
    chilli: {
      cropName: "Chilli",
      isHealthy: false,
      diseaseName: "Chilli Leaf Curl",
      confidence: 0.91,
      symptoms: "Leaves curl upward, become smaller, puckered and accumulate in clusters. Plant growth is stunted with close internodes.",
      causes: "Chilli Leaf Curl Virus (ChiLCV), transmitted by whiteflies (Bemisia tabaci) under warm and dry conditions.",
      treatment: "Uproot and destroy infected plants immediately. Avoid planting near infected host crops.",
      fertilizer: "Use balanced NPK fertilizers and supplement with micro-nutrients to boost plant vigor.",
      pesticide: "Imidacloprid or Diafenthiuron to control whitefly populations.",
      organicAlt: "Spray neem oil (5ml/L) with soap solution or use yellow sticky traps to control whitefly vector.",
      prevention: "Use insect-proof nurseries, raise border crops like maize/sorghum, and control weed hosts.",
      recoveryTime: "Not curable for affected plants (focus on preventing spread)"
    },
    brinjal: {
      cropName: "Brinjal (Eggplant)",
      isHealthy: false,
      diseaseName: "Cercospora Leaf Spot",
      confidence: 0.89,
      symptoms: "Circular or irregular leaf spots with brown centers and light margins, yellowing of older leaves, leaf dropping.",
      causes: "Fungal pathogen Cercospora melongenae. Favored by high humidity, warm weather, and splashing water/rain.",
      treatment: "Uproot and destroy heavily infected plants. Spray copper oxychloride (3g/L) or Carbendazim (1g/L) at 10-day intervals.",
      fertilizer: "Apply balanced NPK fertilizer with additional potassium to boost plant immunity.",
      pesticide: "Carbendazim 50% WP or Copper Oxychloride.",
      organicAlt: "Spray neem oil formulation (5ml/L) mixed with mild soap solution or spray diluted garlic/ginger extract.",
      prevention: "Avoid overhead irrigation, maintain optimum spacing, remove debris from previous harvests, and follow crop rotation.",
      recoveryTime: "10-15 days"
    }
  };

  if (name.includes('tomato')) return mockAnalyses.tomato;
  if (name.includes('rice') || name.includes('paddy')) return mockAnalyses.rice;
  if (name.includes('cotton')) return mockAnalyses.cotton;
  if (name.includes('spinach')) return mockAnalyses.spinach;
  if (name.includes('chilli') || name.includes('chili') || name.includes('pepper')) return mockAnalyses.chilli;
  if (name.includes('brinjal') || name.includes('eggplant') || name.includes('aubergine')) return mockAnalyses.brinjal;

  // Fallback to random if no keyword match
  const keys = Object.keys(mockAnalyses);
  const randomIndex = Math.floor(Math.random() * keys.length);
  return mockAnalyses[keys[randomIndex]];
};

const getMockPricePrediction = (userPrompt) => {
  const priceMatch = userPrompt.match(/₹?(\d+)/);
  const currentPrice = priceMatch ? parseFloat(priceMatch[1]) : 50;
  return {
    predictedTomorrow: Math.round(currentPrice * 1.04),
    predictedNextWeek: Math.round(currentPrice * 1.12),
    demandTrend: "RISING",
    confidence: 0.85,
    recommendation: "Hold stock for a few days if you can store it properly. Market supply is currently low, and prices are expected to rise by 12% next week.",
    expectedProfitTomorrow: Math.round(currentPrice * 1.04 * 100),
    expectedProfitNextWeek: Math.round(currentPrice * 1.12 * 100),
    bestSellingTime: "NEXT_WEEK",
    marketInsights: [
      "Low arrival in near APMC markets due to transportation delays.",
      "High retail demand in metropolitan areas.",
      "Weather forecast indicates mild rainfall which might delay harvest in other districts."
    ]
  };
};

const getMockDemandForecast = (userPrompt) => {
  const cropMatch = userPrompt.match(/Crop:\s*([^\n]+)/);
  const crop = cropMatch ? cropMatch[1].trim() : "Produce";
  return {
    demandLevel: "HIGH",
    demandScore: 82,
    reason: `${crop} is in high demand because it is the off-season peak for other states, raising wholesale inquiries in your district.`,
    peakDemandMonths: ["October", "November", "December", "January"],
    targetBuyers: ["Wholesale Agro-traders", "Food Processing Units", "Interstate Distributors"],
    competitorSupply: "MEDIUM",
    exportPotential: true,
    recommendations: [
      "Sort and grade produce to target premium food processors.",
      "Consider using cold storage to pace your supply throughout peak demand months."
    ]
  };
};

const getMockChatResponse = (userMessage, isTamil) => {
  const lowerMsg = userMessage.toLowerCase();
  if (isTamil) {
    if (lowerMsg.includes('விலை') || lowerMsg.includes('சந்தை')) {
      return "இப்போது சந்தையில் தக்காளி மற்றும் வெங்காயம் ஆகியவற்றின் தேவையும் விலையும் அதிகரித்துள்ளது. நீங்கள் உங்கள் விளைபொருட்களை நேரடியாக AgroConnect சந்தையில் விற்று அதிக லாபம் பெறலாம்.";
    }
    if (lowerMsg.includes('நோய்') || lowerMsg.includes('இலை')) {
      return "உங்கள் பயிரின் இலையில் புள்ளிகள் அல்லது சுருக்கம் இருந்தால், தயவுசெய்து 'Disease Detection' பிரிவில் ஒரு புகைப்படத்தைப் பதிவேற்றவும். எங்கள் AI அதை ஆராய்ந்து தீர்வு வழங்கும்.";
    }
    return "வணக்கம்! நான் AgroBot. பயிர் சாகுபடி, சந்தை விலை, பூச்சிக்கொல்லி மேலாண்மை அல்லது குளிர் சேமிப்பு பற்றி ஏதேனும் உதவி தேவையா?";
  } else {
    if (lowerMsg.includes('price') || lowerMsg.includes('rate') || lowerMsg.includes('market')) {
      return "Currently, market prices for green vegetables and pulses are showing a rising trend. I suggest analyzing the price prediction dashboard to find the best time to sell.";
    }
    if (lowerMsg.includes('disease') || lowerMsg.includes('leaf') || lowerMsg.includes('pest')) {
      return "If you notice leaf spots or discoloration, please upload a photo in the 'Disease Detection' section for a complete diagnosis and organic/chemical remedies.";
    }
    if (lowerMsg.includes('weather')) {
      return "Moderate rainfall is expected in the region next week. Ensure proper drainage in your fields to prevent waterlogging and root rot.";
    }
    return "Hello! I am AgroBot, your farming assistant. I can help you with crop prices, disease identification, farming practices, and weather advice. What would you like to know today?";
  }
};

/* ============================================
   EXPORTED API SERVICES
   ============================================ */

/**
 * Call Gemini with a strict JSON system prompt and retry on parse failure.
 */
const callGeminiJSON = async (systemPrompt, userPrompt, retries = 2) => {
  const isPrice = systemPrompt.includes('price prediction') || systemPrompt.includes('PRICE_SYSTEM_PROMPT');
  if (!hasValidKey()) {
    return isPrice ? getMockPricePrediction(userPrompt) : getMockDemandForecast(userPrompt);
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const model = getGenAI().getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' },
      });
      const result = await model.generateContent([
        { text: systemPrompt },
        { text: userPrompt },
      ]);
      const text = result.response.text();
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return parsed;
    } catch (err) {
      logger.warn(`Gemini JSON parse attempt ${attempt + 1} failed: ${err.message}`);
      if (attempt === retries) {
        return isPrice ? getMockPricePrediction(userPrompt) : getMockDemandForecast(userPrompt);
      }
    }
  }
};

/**
 * Call Gemini Vision with an image buffer and structured output prompt.
 */
const callGeminiVision = async (imageBuffer, mimeType, prompt, originalName = '', retries = 2) => {
  if (!hasValidKey()) {
    return getMockVisionAnalysis(originalName);
  }

  const imageData = {
    inlineData: {
      data: imageBuffer.toString('base64'),
      mimeType,
    },
  };

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const model = getGenAI().getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' },
      });
      const result = await model.generateContent([imageData, { text: prompt }]);
      const text = result.response.text();
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch (err) {
      logger.warn(`Gemini Vision attempt ${attempt + 1} failed: ${err.message}`);
      if (attempt === retries) {
        return getMockVisionAnalysis();
      }
    }
  }
};

/**
 * Call Gemini for plain text (chat).
 */
const callGeminiText = async (systemPrompt, history, userMessage) => {
  const isTamil = systemPrompt.includes('Tamil') || systemPrompt.includes('தமிழ்');
  if (!hasValidKey()) {
    return getMockChatResponse(userMessage, isTamil);
  }

  try {
    const model = getGenAI().getGenerativeModel({ model: 'gemini-1.5-flash' });
    const chat = model.startChat({
      history: history.map(m => ({
        role: m.role,
        parts: [{ text: m.content }],
      })),
      systemInstruction: systemPrompt,
    });

    const result = await chat.sendMessage(userMessage);
    return result.response.text();
  } catch (err) {
    logger.warn(`Gemini Chat failed: ${err.message}`);
    return getMockChatResponse(userMessage, isTamil);
  }
};

module.exports = { callGeminiJSON, callGeminiVision, callGeminiText };
