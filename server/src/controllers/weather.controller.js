const axios = require('axios');

const { sendSuccess, sendError } = require('../utils/apiResponse');

const prisma = require('../utils/prisma');
const CACHE_TTL_MS = 30 * 60 * 1000;
const weatherCache = new Map();

const districtCoords = {
  'Chennai': { lat: 13.0827, lon: 80.2707 },
  'Coimbatore': { lat: 11.0168, lon: 76.9558 },
  'Madurai': { lat: 9.9252, lon: 78.1198 },
  'Salem': { lat: 11.6643, lon: 78.146 },
  'Trichy': { lat: 10.7905, lon: 78.7047 },
};

const getMockWeather = (district) => ({
  district,
  current: { temp: 28, feelsLike: 32, humidity: 65, windSpeed: 4.5, description: 'partly cloudy', icon: '02d' },
  sevenDay: Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
    minTemp: 22 + Math.random() * 3,
    maxTemp: 30 + Math.random() * 5,
    avgHumidity: 60 + Math.random() * 20,
    rainMm: Math.random() * 5,
    description: 'partly cloudy',
    icon: '02d',
  })),
  farmingAdvice: ['Good conditions for farming. Regular irrigation recommended.'],
  alerts: [],
});

const getWeather = async (req, res, next) => {
  try {
    const { district } = req.params;
    const cacheKey = district.toLowerCase();
    const cached = weatherCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return sendSuccess(res, cached.data, 200, 'Weather data (cached)');
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return sendSuccess(res, getMockWeather(district), 200, 'Weather data (mock)');
    }

    const coords = districtCoords[district] || { lat: 11.0168, lon: 76.9558 };
    const [cur, fcast] = await Promise.all([
      axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}&units=metric`),
      axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}&units=metric`),
    ]);

    const daily = {};
    fcast.data.list.forEach(item => {
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

    await prisma.weatherLog.create({
      data: { district, temperature: cur.data.main.temp, humidity: cur.data.main.humidity, windSpeed: cur.data.wind.speed, rainProb: 0 },
    });

    const advices = [];
    if (cur.data.main.humidity > 80) advices.push('High humidity. Watch for fungal diseases.');
    if (sevenDay.some(d => d.rainMm > 15)) advices.push('Rain expected. Consider early harvest for ripe crops.');
    if (cur.data.main.temp > 38) advices.push('Heat stress. Increase irrigation frequency.');
    if (!advices.length) advices.push('Good weather conditions for farming this week.');

    const data = {
      district,
      current: { temp: cur.data.main.temp, feelsLike: cur.data.main.feels_like, humidity: cur.data.main.humidity, windSpeed: cur.data.wind.speed, description: cur.data.weather[0].description, icon: cur.data.weather[0].icon },
      sevenDay,
      farmingAdvice: advices,
      alerts: sevenDay.some(d => d.rainMm > 20) ? ['Heavy rainfall expected. Check drainage.'] : [],
    };

    weatherCache.set(cacheKey, { data, timestamp: Date.now() });
    return sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

module.exports = { getWeather };
