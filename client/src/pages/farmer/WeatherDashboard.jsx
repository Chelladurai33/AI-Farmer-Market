import React, { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import api from '../../lib/api';

const WeatherDashboard = () => {
  const { user } = useAuthStore();
  const [district, setDistrict] = useState(user?.district || 'Coimbatore');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const DISTRICTS = ['Chennai','Coimbatore','Madurai','Salem','Trichy','Tirunelveli','Erode','Vellore','Thanjavur','Tiruppur'];

  const fetchWeather = async (d) => {
    setLoading(true);
    try {
      const res = await api.get(`/weather/${d}`);
      setWeather(res.data.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchWeather(district); }, [district]);

  const weatherIcons = {
    sunny: '☀️', 'clear sky': '☀️', 'partly cloudy': '⛅', 'overcast clouds': '☁️', 'broken clouds': '⛅',
    'light rain': '🌧️', 'moderate rain': '🌧️', 'heavy rain': '⛈️', 'thunderstorm': '⛈️',
    'few clouds': '🌤️', cloudy: '☁️', rain: '🌧️', mist: '🌫️',
  };
  const getIcon = (desc) => weatherIcons[desc?.toLowerCase()] || '🌤️';

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading weather data...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🌤️ Weather Dashboard</h1>
        <p className="page-subtitle">7-day forecast and farming advice</p>
      </div>

      {/* District Selector */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {DISTRICTS.map(d => (
          <button key={d} onClick={() => setDistrict(d)}
            style={{ padding: '0.4rem 0.9rem', borderRadius: 50, border: `1.5px solid ${d === district ? 'var(--primary)' : 'var(--border)'}`, background: d === district ? 'var(--primary)' : 'transparent', color: d === district ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: d === district ? 700 : 400, fontSize: '0.85rem', transition: 'all 0.2s' }}>
            {d}
          </button>
        ))}
      </div>

      {weather && (
        <>
          {/* Alerts */}
          {weather.alerts?.length > 0 && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#dc2626', fontWeight: 600, fontSize: '0.875rem' }}>
              ⚠️ {weather.alerts[0]}
            </div>
          )}

          {/* Current Weather */}
          <div className="weather-card mb-4">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: 4 }}>📍 {weather.district}</div>
                <div style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1 }}>{weather.current?.temp?.toFixed(0)}°C</div>
                <div style={{ fontSize: '1.1rem', opacity: 0.9, marginTop: 4 }}>{weather.current?.description}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '3.5rem' }}>{getIcon(weather.current?.description)}</div>
                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Feels like {weather.current?.feelsLike?.toFixed(0)}°C</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
              {[
                { icon: '💧', label: 'Humidity', value: `${weather.current?.humidity?.toFixed(0)}%` },
                { icon: '💨', label: 'Wind', value: `${weather.current?.windSpeed?.toFixed(1)} m/s` },
                { icon: '👁️', label: 'Visibility', value: weather.current?.visibility ? `${(weather.current.visibility / 1000).toFixed(0)} km` : 'N/A' },
              ].map(m => (
                <div key={m.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem' }}>{m.icon}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700 }}>{m.value}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.75 }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 7-Day Forecast */}
          <div className="glass-card p-4 mb-4">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>📅 7-Day Forecast</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
              {weather.sevenDay?.slice(0, 7).map((day, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '0.75rem 0.5rem', borderRadius: 'var(--radius-md)', background: i === 0 ? 'var(--primary-pale)' : 'transparent', border: i === 0 ? '1px solid var(--border)' : '1px solid transparent' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                    {i === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                  </div>
                  <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{getIcon(day.description)}</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>{day.maxTemp?.toFixed(0)}°</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{day.minTemp?.toFixed(0)}°</div>
                  {day.rainMm > 0 && <div style={{ fontSize: '0.7rem', color: '#3b82f6', marginTop: 2 }}>💧{day.rainMm?.toFixed(0)}mm</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Farming Advice */}
          <div className="glass-card p-4">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>🌾 Farming Advice</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {weather.farmingAdvice?.map((advice, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', background: 'var(--primary-pale)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>💡</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{advice}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default WeatherDashboard;
