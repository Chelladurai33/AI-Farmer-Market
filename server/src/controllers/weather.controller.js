const axios = require('axios');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const prisma = require('../utils/prisma');

const CACHE_TTL_MS = 30 * 60 * 1000;
const weatherCache = new Map();

// All 38 Tamil Nadu districts with coordinates + their taluks
const districtData = {
  'Ariyalur': { lat: 11.1400, lon: 79.0780, taluks: ['Ariyalur', 'Jayankondam', 'Sendurai', 'Udayarpalayam'] },
  'Chengalpattu': { lat: 12.6921, lon: 79.9766, taluks: ['Chengalpattu', 'Cheyyur', 'Madurantakam', 'Thiruporur', 'Tambaram', 'Vandalur'] },
  'Chennai': { lat: 13.0827, lon: 80.2707, taluks: ['Egmore-Nungambakkam', 'Fort-Tondiarpet', 'Mambalam-Guindy', 'Perambur-Purasaiwalkam', 'Sholinganallur', 'Tiruvottiyur'] },
  'Coimbatore': { lat: 11.0168, lon: 76.9558, taluks: ['Coimbatore North', 'Coimbatore South', 'Annur', 'Mettupalayam', 'Pollachi', 'Sulur', 'Valparai'] },
  'Cuddalore': { lat: 11.7447, lon: 79.7689, taluks: ['Cuddalore', 'Bhuvanagiri', 'Chidambaram', 'Kattumannarkoil', 'Panruti', 'Virudhachalam'] },
  'Dharmapuri': { lat: 12.1211, lon: 78.1582, taluks: ['Dharmapuri', 'Harur', 'Nammakkal (Papparapatti)', 'Palacode', 'Pennagaram'] },
  'Dindigul': { lat: 10.3673, lon: 77.9803, taluks: ['Dindigul', 'Athoor', 'Gujiliamparai', 'Natham', 'Nilakottai', 'Oddanchatram', 'Palani', 'Vedasandur'] },
  'Erode': { lat: 11.3428, lon: 77.7272, taluks: ['Erode', 'Bhavani', 'Gobichettipalayam', 'Kodumudi', 'Nambiyur', 'Perundurai', 'Sathyamangalam'] },
  'Kallakurichi': { lat: 11.7380, lon: 78.9610, taluks: ['Kallakurichi', 'Chinnasalem', 'Kalvarayan Hills', 'Sankarapuram', 'Tirukoilur', 'Ulundurpet'] },
  'Kancheepuram': { lat: 12.8333, lon: 79.7000, taluks: ['Kancheepuram', 'Sriperumbudur', 'Uthiramerur', 'Walajabad'] },
  'Kanyakumari': { lat: 8.0883, lon: 77.5385, taluks: ['Kanyakumari', 'Agastheeswaram', 'Killiyoor', 'Thovalai', 'Vilavancode'] },
  'Karur': { lat: 10.9601, lon: 78.0766, taluks: ['Karur', 'Aravakurichi', 'Kadavur', 'Krishnarayapuram', 'Kulithalai', 'Manapparai'] },
  'Krishnagiri': { lat: 12.5186, lon: 78.2137, taluks: ['Krishnagiri', 'Bargur', 'Denkanikottai', 'Hosur', 'Kaveripattinam', 'Pochampalli', 'Shoolagiri', 'Uthangarai'] },
  'Madurai': { lat: 9.9252, lon: 78.1198, taluks: ['Madurai North', 'Madurai South', 'Melur', 'Peraiyur', 'Thirumangalam', 'Usilampatti', 'Vadipatti'] },
  'Mayiladuthurai': { lat: 11.1015, lon: 79.6545, taluks: ['Mayiladuthurai', 'Kuthalam', 'Sirkali', 'Tharangambadi'] },
  'Nagapattinam': { lat: 10.7672, lon: 79.8449, taluks: ['Nagapattinam', 'Kilvelur', 'Kuttalam', 'Tharangambadi', 'Thirukkuvalai', 'Vedaranyam'] },
  'Namakkal': { lat: 11.2190, lon: 78.1682, taluks: ['Namakkal', 'Kumarapalayam', 'Mohanur', 'Paramathi-Velur', 'Rasipuram', 'Sendamangalam', 'Tiruchengode'] },
  'Nilgiris': { lat: 11.4102, lon: 76.6950, taluks: ['Ooty', 'Coonoor', 'Gudalur', 'Kotagiri', 'Kundah', 'Pandalur'] },
  'Perambalur': { lat: 11.2340, lon: 78.8819, taluks: ['Perambalur', 'Alathur', 'Kunnam', 'Veppanthattai'] },
  'Pudukottai': { lat: 10.3797, lon: 78.8200, taluks: ['Pudukottai', 'Alangudi', 'Aranthangi', 'Avudayarkoil', 'Gandarvakottai', 'Illuppur', 'Karambakudi', 'Kulattur', 'Manamelkudi', 'Thiruvarankulam', 'Viralimalai'] },
  'Ramanathapuram': { lat: 9.3762, lon: 78.8302, taluks: ['Ramanathapuram', 'Kadaladi', 'Kamuthi', 'Mudukulathur', 'Paramakudi', 'Rajasingamangalam', 'Rameswaram', 'Thiruvadanai'] },
  'Ranipet': { lat: 12.9249, lon: 79.3327, taluks: ['Arcot', 'Arakkonam', 'Nemili', 'Sholingur', 'Walajah'] },
  'Salem': { lat: 11.6643, lon: 78.1460, taluks: ['Salem', 'Attur', 'Edappadi', 'Gangavalli', 'Mettur', 'Omalur', 'Sangagiri', 'Vazhapadi', 'Yercaud'] },
  'Sivaganga': { lat: 9.8478, lon: 78.4800, taluks: ['Sivaganga', 'Devakottai', 'Ilayangudi', 'Kalayarkoil', 'Karaikudi', 'Manamadurai', 'Tiruppattur', 'Thiruppuvanam'] },
  'Tenkasi': { lat: 8.9597, lon: 77.3152, taluks: ['Tenkasi', 'Alangulam', 'Kadayanallur', 'Sankarankoil', 'Shencottai', 'Veerakeralampudur'] },
  'Thanjavur': { lat: 10.7870, lon: 79.1378, taluks: ['Thanjavur', 'Budalur', 'Kumbakonam', 'Orathanadu', 'Papanasam', 'Pattukkottai', 'Peravurani', 'Thiruvaiyaru', 'Thiruvidaimarudur'] },
  'Theni': { lat: 10.0104, lon: 77.4765, taluks: ['Theni', 'Andipatti', 'Bodinayakanur', 'Periyakulam', 'Uthamapalayam'] },
  'Thoothukudi': { lat: 8.7642, lon: 78.1348, taluks: ['Thoothukudi', 'Ettayapuram', 'Kovilpatti', 'Ottapidaram', 'Sattankulam', 'Tiruchendur', 'Vilathikulam'] },
  'Tiruchirappalli': { lat: 10.7905, lon: 78.7047, taluks: ['Tiruchirappalli', 'Lalgudi', 'Manachanallur', 'Manapparai', 'Musiri', 'Srirangam', 'Thottiyam', 'Tiruverumbur', 'Uppiliyapuram'] },
  'Tirunelveli': { lat: 8.7139, lon: 77.7567, taluks: ['Tirunelveli', 'Ambasamudram', 'Cheranmahadevi', 'Manur', 'Nanguneri', 'Palayamkottai', 'Radhapuram', 'Tenkasi'] },
  'Tirupathur': { lat: 12.4970, lon: 78.5730, taluks: ['Tirupathur', 'Ambur', 'Natrampalli', 'Vaniyambadi'] },
  'Tiruppur': { lat: 11.1085, lon: 77.3411, taluks: ['Tiruppur North', 'Tiruppur South', 'Avinashi', 'Dharapuram', 'Gudimangalam', 'Kangeyam', 'Madathukulam', 'Palladam', 'Udumalaipettai'] },
  'Tiruvallur': { lat: 13.1439, lon: 79.9081, taluks: ['Tiruvallur', 'Ambattur', 'Avadi', 'Gummidipoondi', 'Minjur', 'Pallipet', 'Poonamallee', 'Ponneri', 'RK Pet', 'Tiruttani', 'Uthukkottai'] },
  'Tiruvannamalai': { lat: 12.2253, lon: 79.0747, taluks: ['Tiruvannamalai', 'Arni', 'Chetpet', 'Chengam', 'Jawadhu Hills', 'Kilpennathur', 'Polur', 'Thellar', 'Vandavasi', 'Vembakkam'] },
  'Tiruvarur': { lat: 10.7727, lon: 79.6366, taluks: ['Tiruvarur', 'Kodavasal', 'Koradacherry', 'Kudavasal', 'Mannargudi', 'Nannilam', 'Needamangalam', 'Papanasam', 'Thiruthuraipoondi', 'Valangaiman'] },
  'Vellore': { lat: 12.9165, lon: 79.1325, taluks: ['Vellore', 'Anaicut', 'Gudiyattam', 'Kaniyambadi', 'Katpadi', 'Pernambut'] },
  'Viluppuram': { lat: 11.9386, lon: 79.4938, taluks: ['Viluppuram', 'Gingee', 'Kandachipuram', 'Marakanam', 'Melmalaiyanur', 'Mugaiyur', 'Rishivandiyam', 'Thiruvennainallur', 'Ulundurpet', 'Vanur'] },
  'Virudhunagar': { lat: 9.5851, lon: 77.9618, taluks: ['Virudhunagar', 'Aruppukkottai', 'Kariapatti', 'Rajapalayam', 'Sathur', 'Sivakasi', 'Srivilliputhur', 'Tiruchuli', 'Watrap'] },
};

const generateFarmingAdvice = (temp, humidity, rainTotal) => {
  const advice = [];
  if (humidity > 80) advice.push('High humidity detected — monitor crops for fungal infections like blight and mildew. Ensure proper spacing and drainage.');
  if (rainTotal > 20) advice.push('Significant rainfall expected this week. Consider early harvest for ripe crops and avoid field operations on wet days.');
  if (rainTotal > 50) advice.push('Heavy rain alert! Check irrigation channels and drainage to avoid waterlogging and root rot.');
  if (temp > 38) advice.push('Extreme heat expected. Irrigate fields in early morning or evening to minimize evaporation and heat stress.');
  else if (temp > 33) advice.push('Hot weather ahead. Increase irrigation frequency and provide shade for nursery seedlings if possible.');
  if (temp < 15) advice.push('Cool temperatures — good for Rabi crops (wheat, gram). Protect seedlings from frost at night.');
  if (humidity < 40) advice.push('Low humidity — dry conditions. Mulching the soil will help retain moisture and reduce watering frequency.');
  if (rainTotal === 0 && humidity < 60) advice.push('Dry week ahead — plan irrigation schedule and check water storage levels.');
  if (!advice.length) advice.push('Favorable weather conditions this week. Good time for sowing, transplanting, and regular crop maintenance.');
  advice.push('Check soil moisture levels before irrigation to avoid over-watering and nutrient leaching.');
  return advice;
};

const getMockWeather = (location) => {
  const temp = 28 + Math.random() * 7;
  const humidity = 55 + Math.random() * 30;
  const descriptions = ['partly cloudy', 'clear sky', 'few clouds', 'overcast clouds', 'light rain'];
  const desc = descriptions[Math.floor(Math.random() * descriptions.length)];
  return {
    location,
    current: {
      temp,
      feelsLike: temp + 3,
      humidity,
      windSpeed: 2 + Math.random() * 5,
      description: desc,
      icon: '02d',
      pressure: 1010 + Math.random() * 10,
      uvIndex: Math.floor(Math.random() * 8) + 1,
    },
    sevenDay: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
      minTemp: 22 + Math.random() * 3,
      maxTemp: 30 + Math.random() * 7,
      avgHumidity: 55 + Math.random() * 25,
      rainMm: Math.random() > 0.6 ? Math.random() * 20 : 0,
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      icon: '02d',
    })),
    farmingAdvice: generateFarmingAdvice(temp, humidity, 5),
    alerts: [],
    source: 'mock',
  };
};

const getWeather = async (req, res, next) => {
  try {
    const { district } = req.params;
    const taluk = req.query.taluk || null;
    const location = taluk ? `${taluk}, ${district}` : district;
    const cacheKey = location.toLowerCase();

    const cached = weatherCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return sendSuccess(res, cached.data, 200, 'Weather data (cached)');
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      const mockData = getMockWeather(location);
      weatherCache.set(cacheKey, { data: mockData, timestamp: Date.now() });
      return sendSuccess(res, mockData, 200, 'Weather data (mock - no API key configured)');
    }

    // Get coordinates: taluk uses district coords (OWM free tier doesn't have taluk-level)
    const distInfo = districtData[district];
    const coords = distInfo ? { lat: distInfo.lat, lon: distInfo.lon } : { lat: 11.0168, lon: 76.9558 };

    let curData, fcastData;
    try {
      const [cur, fcast] = await Promise.all([
        axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}&units=metric`, { timeout: 10000 }),
        axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}&units=metric`, { timeout: 10000 }),
      ]);
      curData = cur.data;
      fcastData = fcast.data;
    } catch (apiErr) {
      console.error('OpenWeather API Error:', apiErr.response?.data || apiErr.message);
      // Fallback to mock if OpenWeather call fails
      const mockData = getMockWeather(location);
      mockData.apiError = apiErr.response?.data?.message || apiErr.message;
      weatherCache.set(cacheKey, { data: mockData, timestamp: Date.now() });
      return sendSuccess(res, mockData, 200, 'Weather data (mock - API error)');
    }

    const daily = {};
    fcastData.list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!daily[date]) daily[date] = { temps: [], humidity: [], rain: 0, description: item.weather[0].description, icon: item.weather[0].icon };
      daily[date].temps.push(item.main.temp);
      daily[date].humidity.push(item.main.humidity);
      if (item.rain) daily[date].rain += item.rain['3h'] || 0;
    });

    const sevenDay = Object.entries(daily).slice(0, 7).map(([date, d]) => ({
      date,
      minTemp: Math.min(...d.temps),
      maxTemp: Math.max(...d.temps),
      avgHumidity: d.humidity.reduce((a, b) => a + b, 0) / d.humidity.length,
      rainMm: d.rain,
      description: d.description,
      icon: d.icon,
    }));

    const totalRain = sevenDay.reduce((sum, d) => sum + d.rainMm, 0);
    const advices = generateFarmingAdvice(curData.main.temp, curData.main.humidity, totalRain);
    const alerts = [];
    if (totalRain > 50) alerts.push('Heavy rainfall expected this week. Ensure proper drainage and avoid spray operations.');
    if (curData.main.temp > 38) alerts.push('Extreme heat warning. Increase irrigation and protect livestock.');

    const data = {
      location,
      district,
      taluk: taluk || null,
      current: {
        temp: curData.main.temp,
        feelsLike: curData.main.feels_like,
        humidity: curData.main.humidity,
        windSpeed: curData.wind.speed,
        description: curData.weather[0].description,
        icon: curData.weather[0].icon,
        pressure: curData.main.pressure,
        visibility: curData.visibility,
      },
      sevenDay,
      farmingAdvice: advices,
      alerts,
      source: 'live',
    };

    weatherCache.set(cacheKey, { data, timestamp: Date.now() });

    // Try to log to DB (non-blocking)
    prisma.weatherLog.create({
      data: { district: location, temperature: curData.main.temp, humidity: curData.main.humidity, windSpeed: curData.wind.speed, rainProb: 0 },
    }).catch(() => {});

    return sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

const getDistrictList = async (req, res) => {
  const list = Object.entries(districtData).map(([name, info]) => ({
    name,
    taluks: info.taluks,
  }));
  return sendSuccess(res, list, 200, 'Tamil Nadu districts and taluks');
};

module.exports = { getWeather, getDistrictList, districtData };
