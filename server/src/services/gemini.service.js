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

const getMockChatResponse = (userMessage, isTamil, systemPrompt = '') => {
  const lowerMsg = userMessage.toLowerCase().trim();
  const hasTamilScript = /[\u0B80-\u0BFF]/.test(userMessage);
  const useTamil = isTamil || hasTamilScript;
  
  // Try to extract weather context from systemPrompt
  let weatherInfo = "Current weather is stable.";
  let windSpeed = 0;
  let isRainingSoon = false;
  
  const weatherMatch = systemPrompt.match(/Current Weather:\s*([^]+?)(?=\n|$)/);
  if (weatherMatch) {
    weatherInfo = weatherMatch[1];
    if (weatherInfo.includes('Wind:')) {
      const windMatch = weatherInfo.match(/Wind:\s*([\d.]+)/);
      if (windMatch) windSpeed = parseFloat(windMatch[1]);
    }
    if (weatherInfo.toLowerCase().includes('rain') || weatherInfo.toLowerCase().includes('shower')) {
      isRainingSoon = true;
    }
  }

  // Categories & Keywords
  const isGreeting = /^(hi|hello|hey|vanakkam|வணக்கம்|namaste|hlo|hii|good morning|good evening|who are you|help|start|menu)/i.test(lowerMsg);
  const isSprayingQuestion = lowerMsg.includes('spray') || lowerMsg.includes('pesticide') || lowerMsg.includes('fertilizer') || lowerMsg.includes('தெளிக்க') || lowerMsg.includes('பூச்சிக்கொல்லி') || lowerMsg.includes('உரம்');
  const isRainQuestion = lowerMsg.includes('rain') || lowerMsg.includes('weather') || lowerMsg.includes('climate') || lowerMsg.includes('மழை') || lowerMsg.includes('வானிலை');
  const isPriceQuestion = lowerMsg.includes('price') || lowerMsg.includes('rate') || lowerMsg.includes('market') || lowerMsg.includes('sell') || lowerMsg.includes('buyer') || lowerMsg.includes('cost') || lowerMsg.includes('profit') || lowerMsg.includes('விலை') || lowerMsg.includes('சந்தை') || lowerMsg.includes('விற்பனை');
  const isDiseaseQuestion = lowerMsg.includes('disease') || lowerMsg.includes('leaf') || lowerMsg.includes('pest') || lowerMsg.includes('spot') || lowerMsg.includes('yellow') || lowerMsg.includes('rot') || lowerMsg.includes('fungus') || lowerMsg.includes('insect') || lowerMsg.includes('நோய்') || lowerMsg.includes('இலை') || lowerMsg.includes('பூச்சி');
  const isCropQuestion = lowerMsg.includes('crop') || lowerMsg.includes('plant') || lowerMsg.includes('grow') || lowerMsg.includes('seed') || lowerMsg.includes('tomato') || lowerMsg.includes('onion') || lowerMsg.includes('rice') || lowerMsg.includes('paddy') || lowerMsg.includes('cotton') || lowerMsg.includes('banana') || lowerMsg.includes('mango') || lowerMsg.includes('chilli') || lowerMsg.includes('turmeric') || lowerMsg.includes('brinjal') || lowerMsg.includes('பயிர்') || lowerMsg.includes('சாகுபடி') || lowerMsg.includes('விதை');
  const isStorageQuestion = lowerMsg.includes('storage') || lowerMsg.includes('cold') || lowerMsg.includes('dry') || lowerMsg.includes('warehouse') || lowerMsg.includes('preserve') || lowerMsg.includes('குளிர்') || lowerMsg.includes('கிடங்கு') || lowerMsg.includes('உலர்த்த');
  const isSchemeQuestion = lowerMsg.includes('scheme') || lowerMsg.includes('subsidy') || lowerMsg.includes('gov') || lowerMsg.includes('loan') || lowerMsg.includes('insurance') || lowerMsg.includes('kisan') || lowerMsg.includes('pm') || lowerMsg.includes('திட்டம்') || lowerMsg.includes('மானிய') || lowerMsg.includes('அரசு');
  const isSoilQuestion = lowerMsg.includes('soil') || lowerMsg.includes('water') || lowerMsg.includes('drip') || lowerMsg.includes('irrigation') || lowerMsg.includes('மண்') || lowerMsg.includes('பாசனம்') || lowerMsg.includes('தண்ணீர்');

  if (useTamil) {
    if (isGreeting) {
      return "வணக்கம்! 🌱 நான் AgroBot, உங்கள் AI விவசாய உதவியாளர். பயிர்கள், சந்தை விலைகள், வானிலை, நோய் கண்டறிதல் அல்லது அரசு திட்டங்கள் குறித்து உங்களுக்கு எவ்வாறு உதவ வேண்டும்?";
    }
    if (isSprayingQuestion) {
      if (windSpeed > 10) return `⚠️ காற்று வேகமாக (${windSpeed} m/s) வீசுகிறது. மருந்து அடிக்கும்போது மருந்துகள் காற்றில் வீணாகும், எனவே இன்று பூச்சிக்கொல்லி தெளிக்க வேண்டாம்.`;
      if (isRainingSoon) return `🌧️ விரைவில் மழை பெய்ய வாய்ப்புள்ளது. மழை நீரில் மருந்துகள் அடித்துச் செல்லப்படும் என்பதால் இன்று தெளிக்க வேண்டாம்.`;
      return "✅ இன்று வானிலை மிகவும் சாதகமாக உள்ளது! காலை 6-9 மணி அல்லது மாலை 4-6 மணிக்குள் உரம் அல்லது பூச்சிக்கொல்லி தெளிக்கலாம்.";
    }
    if (isRainQuestion) {
      if (isRainingSoon) return "🌧️ ஆம், உங்கள் பகுதியில் மழை பெய்ய வாய்ப்புள்ளது. அறுவடை செய்த பயிர்களைப் பாதுகாப்பான இடத்தில் வைக்கவும்.";
      return "☀️ இன்று மழை பெய்ய வாய்ப்பில்லை. வானிலை சீராக இருக்கும், வயல்வெளி வேலைகளைத் தொடரலாம்.";
    }
    if (isPriceQuestion) {
      return "📈 இப்போது சந்தையில் தக்காளி, வெங்காயம் மற்றும் பருப்பு வகைகளின் தேவையும் விலையும் அதிகரித்துள்ளது. உங்கள் விளைபொருட்களை AgroConnect சந்தையில் நேரடியாகப் பதிவேற்றி இடைத்தரகர்கள் இன்றி 15-20% கூடுதல் லாபம் பெறலாம்!";
    }
    if (isDiseaseQuestion) {
      return "🔬 உங்கள் பயிரின் இலையில் புள்ளிகள், மஞ்சள் நிறம் அல்லது சுருக்கம் இருந்தால், இடது பக்க மெனுவில் உள்ள Disease Detection பிரிவில் புகைப்படத்தைப் பதிவேற்றவும். எங்கள் AI நொடியில் நோயைக் கண்டறிந்து இயற்கை & ரசாயனத் தீர்வுகளை வழங்கும்!";
    }
    if (isCropQuestion) {
      return "🌾 பயிர் சாகுபடிக்கு நல்ல வடிகால் வசதியுள்ள மண் (pH 6.0-7.5) மற்றும் பருவக்கேற்ற பயிர் தேர்வு மிக அவசியம். எங்கள் Demand Forecast பகுதியில் உங்கள் மாவட்டத்தை தேர்வு செய்து தற்போதைய சந்தை தேவை உள்ள பயிர்களை அறிந்து கொள்ளுங்கள்!";
    }
    if (isStorageQuestion) {
      return "❄️ அறுவடைக்குப் பிந்தைய இழப்புகளைத் தவிர்க்க, AgroConnect-ன் Cold Storage மற்றும் Solar Drying Plant வசதிகளை முன்பதிவு செய்து உங்கள் விளைபொருட்களின் ஆயுளை 6 மாதங்கள் வரை அதிகரித்து அதிக விலைக்கு விற்கலாம்.";
    }
    if (isSchemeQuestion) {
      return "🏛️ தமிழக விவசாயிகளுக்கான முக்கிய திட்டங்கள்:\n1. PM-KISAN: ஆண்டுக்கு ₹6,000 நிதியுதவி.\n2. PMFBY: பயிர் காப்பீட்டுத் திட்டம்.\n3. Kisan Credit Card (KCC): குறைந்த வட்டி கடன்.\n4. சொட்டு நீர் பாசன மானியம்: 100% வரை மானியம்.";
    }
    if (isSoilQuestion) {
      return "💧 மண் வளத்தை அதிகரிக்க இயற்கை தொழுஉரம் (FYM) மற்றும் பசுந்தாள் உரங்களைப் பயன்படுத்துங்கள். சொட்டு நீர் பாசனம் அமைப்பதன் மூலம் 40% வரை தண்ணீரைச் சேமித்து அதிக மகசூல் பெறலாம்.";
    }
    return `🌱 நன்றி! உங்கள் கேள்வி: "${userMessage}".\n\nவிவசாய உதவிக்கு நான் தயாராக உள்ளேன்:\n• பயிர் சாகுபடி & மண் மேலாண்மை\n• வானிலை & மருந்து தெளிக்கும் நேரம்\n• சந்தை விலை கணிப்பு & நேரடி விற்பனை\n• நோய் கண்டறிதல் & இயற்கை தீர்வுகள்\n\nஉங்களுக்கு எந்தத் தலைப்பில் கூடுதல் தகவல் தேவை?`;
  } else {
    if (isGreeting) {
      return "Hello! 🌱 I am AgroBot, your AI farming assistant. How can I help you today? You can ask me about crop selection, market prices, weather forecasts, disease diagnosis, or government schemes!";
    }
    if (isSprayingQuestion) {
      if (windSpeed > 10) return `⚠️ Wind speed is currently high (${windSpeed} m/s). Spraying is NOT recommended today as chemical drift may reduce effectiveness.`;
      if (isRainingSoon) return `🌧️ Rain is expected soon. Spraying is NOT recommended right now as rain will wash away the nutrients/pesticides.`;
      return "✅ Weather conditions are favorable today! You can safely apply NPK fertilizers or organic neem sprays during early morning or late afternoon.";
    }
    if (isRainQuestion) {
      if (isRainingSoon) return "🌧️ Rain is expected based on current satellite forecast. Please secure harvested crops and delay irrigation.";
      return "☀️ Clear weather is expected. It's a great day for harvesting, weeding, and field work.";
    }
    if (isPriceQuestion) {
      return "📈 Market trends show high demand for tomatoes, onions, and pulses. Check our Price Prediction tool to know exact price movements, and list your crop on AgroConnect Marketplace to reach direct bulk buyers!";
    }
    if (isDiseaseQuestion) {
      return "🔬 If you spot leaf curl, spots, or yellowing, navigate to the Disease Detection tab in the sidebar and upload a photo! Our AI vision model will instantly identify the pest/disease and provide chemical & organic treatments.";
    }
    if (isCropQuestion) {
      return "🌾 For high yields, select crops suited for your district's soil pH (6.0-7.5) and climate. Use our Demand Forecast feature to analyze real-time buyer demand before planting!";
    }
    if (isStorageQuestion) {
      return "❄️ To eliminate distress selling, book a nearby facility using our Cold Storage Finder or Solar Drying Plant booking module. Extend crop shelf life up to 6 months for maximum profit!";
    }
    if (isSchemeQuestion) {
      return "🏛️ Top Government Schemes for Farmers:\n1. PM-KISAN: ₹6,000 annual direct income support.\n2. PMFBY: Comprehensive crop insurance against weather hazards.\n3. Kisan Credit Card (KCC): Low-interest short-term credit.\n4. Micro-Irrigation Scheme: Up to 100% subsidy for drip & sprinkler systems.";
    }
    if (isSoilQuestion) {
      return "💧 Test soil pH annually and incorporate organic compost. Adopting drip irrigation conserves up to 40% water while improving root nutrient absorption.";
    }
    return `🌱 Thanks for reaching out regarding "${userMessage}"!\n\nI can assist you with:\n• Crop selection & fertilizing schedules\n• Weather-based spraying guidance\n• Market prices & direct buyer connections\n• AI disease diagnosis\n• Storage & government schemes\n\nWhat specific information would you like next?`;
  }
};

/* ============================================
   EXPORTED API SERVICES
   ============================================ */

/**
 * Call Gemini with a strict JSON system prompt and retry on parse failure.
 */
const callGeminiJSON = async (systemPrompt, userPrompt, retries = 2) => {
  const isPrice = systemPrompt.includes('price prediction') ||
                  systemPrompt.includes('PRICE_SYSTEM_PROMPT') ||
                  systemPrompt.includes('predictedTomorrow') ||
                  systemPrompt.includes('agricultural market analyst');
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
  const isTamil = systemPrompt.includes('Respond in Tamil') || systemPrompt.includes('(தமிழ்)') || /[\u0B80-\u0BFF]/.test(userMessage);
  
  if (!hasValidKey()) {
    return getMockChatResponse(userMessage, isTamil, systemPrompt);
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

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API call timed out')), 3500)
    );

    const result = await Promise.race([chat.sendMessage(userMessage), timeoutPromise]);
    return result.response.text();
  } catch (err) {
    logger.warn(`Gemini Chat fallback activated: ${err.message}`);
    return getMockChatResponse(userMessage, isTamil, systemPrompt);
  }
};

module.exports = { callGeminiJSON, callGeminiVision, callGeminiText };
