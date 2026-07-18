import React, { useState, useEffect, useRef } from 'react';
import useAuthStore from '../../store/authStore';
import api from '../../lib/api';

/* ─── Static district/taluk map (mirrors backend) ─────────────────────── */
const TN_DISTRICTS = {
  'Ariyalur': ['Ariyalur', 'Jayankondam', 'Sendurai', 'Udayarpalayam'],
  'Chengalpattu': ['Chengalpattu', 'Cheyyur', 'Madurantakam', 'Thiruporur', 'Tambaram', 'Vandalur'],
  'Chennai': ['Egmore-Nungambakkam', 'Fort-Tondiarpet', 'Mambalam-Guindy', 'Perambur-Purasaiwalkam', 'Sholinganallur', 'Tiruvottiyur'],
  'Coimbatore': ['Coimbatore North', 'Coimbatore South', 'Annur', 'Mettupalayam', 'Pollachi', 'Sulur', 'Valparai'],
  'Cuddalore': ['Cuddalore', 'Bhuvanagiri', 'Chidambaram', 'Kattumannarkoil', 'Panruti', 'Virudhachalam'],
  'Dharmapuri': ['Dharmapuri', 'Harur', 'Nammakkal (Papparapatti)', 'Palacode', 'Pennagaram'],
  'Dindigul': ['Dindigul', 'Athoor', 'Gujiliamparai', 'Natham', 'Nilakottai', 'Oddanchatram', 'Palani', 'Vedasandur'],
  'Erode': ['Erode', 'Bhavani', 'Gobichettipalayam', 'Kodumudi', 'Nambiyur', 'Perundurai', 'Sathyamangalam'],
  'Kallakurichi': ['Kallakurichi', 'Chinnasalem', 'Kalvarayan Hills', 'Sankarapuram', 'Tirukoilur', 'Ulundurpet'],
  'Kancheepuram': ['Kancheepuram', 'Sriperumbudur', 'Uthiramerur', 'Walajabad'],
  'Kanyakumari': ['Kanyakumari', 'Agastheeswaram', 'Killiyoor', 'Thovalai', 'Vilavancode'],
  'Karur': ['Karur', 'Aravakurichi', 'Kadavur', 'Krishnarayapuram', 'Kulithalai', 'Manapparai'],
  'Krishnagiri': ['Krishnagiri', 'Bargur', 'Denkanikottai', 'Hosur', 'Kaveripattinam', 'Pochampalli', 'Shoolagiri', 'Uthangarai'],
  'Madurai': ['Madurai North', 'Madurai South', 'Melur', 'Peraiyur', 'Thirumangalam', 'Usilampatti', 'Vadipatti'],
  'Mayiladuthurai': ['Mayiladuthurai', 'Kuthalam', 'Sirkali', 'Tharangambadi'],
  'Nagapattinam': ['Nagapattinam', 'Kilvelur', 'Kuttalam', 'Tharangambadi', 'Thirukkuvalai', 'Vedaranyam'],
  'Namakkal': ['Namakkal', 'Kumarapalayam', 'Mohanur', 'Paramathi-Velur', 'Rasipuram', 'Sendamangalam', 'Tiruchengode'],
  'Nilgiris': ['Ooty', 'Coonoor', 'Gudalur', 'Kotagiri', 'Kundah', 'Pandalur'],
  'Perambalur': ['Perambalur', 'Alathur', 'Kunnam', 'Veppanthattai'],
  'Pudukottai': ['Pudukottai', 'Alangudi', 'Aranthangi', 'Avudayarkoil', 'Gandarvakottai', 'Illuppur', 'Karambakudi', 'Kulattur', 'Manamelkudi', 'Thiruvarankulam', 'Viralimalai'],
  'Ramanathapuram': ['Ramanathapuram', 'Kadaladi', 'Kamuthi', 'Mudukulathur', 'Paramakudi', 'Rajasingamangalam', 'Rameswaram', 'Thiruvadanai'],
  'Ranipet': ['Arcot', 'Arakkonam', 'Nemili', 'Sholingur', 'Walajah'],
  'Salem': ['Salem', 'Attur', 'Edappadi', 'Gangavalli', 'Mettur', 'Omalur', 'Sangagiri', 'Vazhapadi', 'Yercaud'],
  'Sivaganga': ['Sivaganga', 'Devakottai', 'Ilayangudi', 'Kalayarkoil', 'Karaikudi', 'Manamadurai', 'Tiruppattur', 'Thiruppuvanam'],
  'Tenkasi': ['Tenkasi', 'Alangulam', 'Kadayanallur', 'Sankarankoil', 'Shencottai', 'Veerakeralampudur'],
  'Thanjavur': ['Thanjavur', 'Budalur', 'Kumbakonam', 'Orathanadu', 'Papanasam', 'Pattukkottai', 'Peravurani', 'Thiruvaiyaru', 'Thiruvidaimarudur'],
  'Theni': ['Theni', 'Andipatti', 'Bodinayakanur', 'Periyakulam', 'Uthamapalayam'],
  'Thoothukudi': ['Thoothukudi', 'Ettayapuram', 'Kovilpatti', 'Ottapidaram', 'Sattankulam', 'Tiruchendur', 'Vilathikulam'],
  'Tiruchirappalli': ['Tiruchirappalli', 'Lalgudi', 'Manachanallur', 'Manapparai', 'Musiri', 'Srirangam', 'Thottiyam', 'Tiruverumbur', 'Uppiliyapuram'],
  'Tirunelveli': ['Tirunelveli', 'Ambasamudram', 'Cheranmahadevi', 'Manur', 'Nanguneri', 'Palayamkottai', 'Radhapuram', 'Tenkasi'],
  'Tirupathur': ['Tirupathur', 'Ambur', 'Natrampalli', 'Vaniyambadi'],
  'Tiruppur': ['Tiruppur North', 'Tiruppur South', 'Avinashi', 'Dharapuram', 'Gudimangalam', 'Kangeyam', 'Madathukulam', 'Palladam', 'Udumalaipettai'],
  'Tiruvallur': ['Tiruvallur', 'Ambattur', 'Avadi', 'Gummidipoondi', 'Minjur', 'Pallipet', 'Poonamallee', 'Ponneri', 'RK Pet', 'Tiruttani', 'Uthukkottai'],
  'Tiruvannamalai': ['Tiruvannamalai', 'Arni', 'Chetpet', 'Chengam', 'Jawadhu Hills', 'Kilpennathur', 'Polur', 'Thellar', 'Vandavasi', 'Vembakkam'],
  'Tiruvarur': ['Tiruvarur', 'Kodavasal', 'Koradacherry', 'Kudavasal', 'Mannargudi', 'Nannilam', 'Needamangalam', 'Papanasam', 'Thiruthuraipoondi', 'Valangaiman'],
  'Vellore': ['Vellore', 'Anaicut', 'Gudiyattam', 'Kaniyambadi', 'Katpadi', 'Pernambut'],
  'Viluppuram': ['Viluppuram', 'Gingee', 'Kandachipuram', 'Marakanam', 'Melmalaiyanur', 'Mugaiyur', 'Rishivandiyam', 'Thiruvennainallur', 'Ulundurpet', 'Vanur'],
  'Virudhunagar': ['Virudhunagar', 'Aruppukkottai', 'Kariapatti', 'Rajapalayam', 'Sathur', 'Sivakasi', 'Srivilliputhur', 'Tiruchuli', 'Watrap'],
};

const DISTRICT_NAMES = Object.keys(TN_DISTRICTS).sort();

const weatherIcons = {
  'sunny': '☀️', 'clear sky': '☀️', 'clear': '☀️',
  'partly cloudy': '⛅', 'few clouds': '🌤️', 'scattered clouds': '⛅',
  'overcast clouds': '☁️', 'broken clouds': '⛅', 'cloudy': '☁️',
  'light rain': '🌦️', 'moderate rain': '🌧️', 'heavy rain': '⛈️',
  'heavy intensity rain': '⛈️', 'thunderstorm': '⛈️', 'very heavy rain': '🌊',
  'light drizzle': '🌦️', 'drizzle': '🌦️',
  'mist': '🌫️', 'fog': '🌫️', 'haze': '🌫️', 'smoke': '🌫️',
  'snow': '❄️', 'sleet': '🌨️',
};
const getIcon = (desc) => {
  if (!desc) return '🌤️';
  const lower = desc.toLowerCase();
  return weatherIcons[lower] || (lower.includes('rain') ? '🌧️' : lower.includes('cloud') ? '⛅' : lower.includes('sun') || lower.includes('clear') ? '☀️' : '🌤️');
};

const getUVLabel = (uv) => {
  if (!uv) return { label: 'N/A', color: '#6b7280' };
  if (uv <= 2) return { label: 'Low', color: '#22c55e' };
  if (uv <= 5) return { label: 'Moderate', color: '#f59e0b' };
  if (uv <= 7) return { label: 'High', color: '#f97316' };
  return { label: 'Very High', color: '#ef4444' };
};

export default function WeatherDashboard() {
  const { user } = useAuthStore();
  const [district, setDistrict] = useState(() => {
    const userDist = user?.district;
    return userDist && TN_DISTRICTS[userDist] ? userDist : 'Coimbatore';
  });
  const [taluk, setTaluk] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const fetchWeather = async (d, t) => {
    setLoading(true);
    setError('');
    try {
      const url = t ? `/weather/${encodeURIComponent(d)}?taluk=${encodeURIComponent(t)}` : `/weather/${encodeURIComponent(d)}`;
      const res = await api.get(url);
      setWeather(res.data.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load weather data. Please try again.');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWeather(district, taluk); }, [district, taluk]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDistrictDropdown(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const taluks = TN_DISTRICTS[district] || [];
  const filteredDistricts = DISTRICT_NAMES.filter(d => d.toLowerCase().includes(districtSearch.toLowerCase()));

  const handleDistrictSelect = (d) => {
    setDistrict(d);
    setTaluk('');
    setDistrictSearch('');
    setShowDistrictDropdown(false);
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">🌤️ Weather Dashboard</h1>
        <p className="page-subtitle">Live 7-day forecast & farming advice for all Tamil Nadu districts</p>
      </div>

      {/* Location Selectors */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        {/* District picker */}
        <div style={{ flex: '1 1 220px', minWidth: 200 }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            📍 District (38 available)
          </label>
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <div
              onClick={() => setShowDistrictDropdown(v => !v)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--primary)', background: 'var(--bg-card)', cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}
            >
              <span>{district}</span>
              <span style={{ fontSize: '0.75rem' }}>{showDistrictDropdown ? '▲' : '▼'}</span>
            </div>
            {showDistrictDropdown && (
              <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 999, background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', maxHeight: 280, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <input
                  autoFocus
                  placeholder="Search district..."
                  value={districtSearch}
                  onChange={e => setDistrictSearch(e.target.value)}
                  style={{ padding: '0.5rem 0.75rem', border: 'none', borderBottom: '1px solid var(--border)', outline: 'none', fontSize: '0.85rem', background: 'transparent', color: 'var(--text-primary)' }}
                />
                <div style={{ overflowY: 'auto', maxHeight: 220 }}>
                  {filteredDistricts.map(d => (
                    <div
                      key={d}
                      onClick={() => handleDistrictSelect(d)}
                      style={{ padding: '0.5rem 0.9rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: d === district ? 700 : 400, background: d === district ? 'var(--primary-pale)' : 'transparent', color: d === district ? 'var(--primary)' : 'var(--text-secondary)', transition: 'background 0.15s' }}
                      onMouseEnter={e => { if (d !== district) e.currentTarget.style.background = 'var(--bg-hover, #f5f5f5)'; }}
                      onMouseLeave={e => { if (d !== district) e.currentTarget.style.background = 'transparent'; }}
                    >
                      {d}
                    </div>
                  ))}
                  {filteredDistricts.length === 0 && <div style={{ padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>No results</div>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Taluk / Sub-district picker */}
        <div style={{ flex: '1 1 220px', minWidth: 200 }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            🏘️ Taluk / Sub-District (optional)
          </label>
          <select
            value={taluk}
            onChange={e => setTaluk(e.target.value)}
            style={{ width: '100%', padding: '0.6rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.9rem', cursor: 'pointer', outline: 'none' }}
          >
            <option value="">— Whole District —</option>
            {taluks.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Refresh button */}
        <button
          onClick={() => fetchWeather(district, taluk)}
          disabled={loading}
          style={{ padding: '0.6rem 1.2rem', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontSize: '0.875rem', transition: 'all 0.2s', alignSelf: 'flex-end' }}
        >
          {loading ? '⏳ Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', marginBottom: '1.25rem', color: '#dc2626', fontWeight: 600, fontSize: '0.9rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '1.25rem' }}>⚠️</span>
          <div>
            <div>{error}</div>
            <div style={{ fontWeight: 400, fontSize: '0.8rem', marginTop: 4, opacity: 0.8 }}>The weather service will fall back to estimated data automatically. Try refreshing.</div>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'spin 2s linear infinite', display: 'inline-block' }}>🌍</div>
          <div style={{ fontWeight: 600 }}>Fetching weather for {taluk ? `${taluk}, ` : ''}{district}...</div>
        </div>
      )}

      {/* Weather Data */}
      {!loading && weather && (
        <>
          {/* Alerts */}
          {weather.alerts?.length > 0 && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1.1rem', marginBottom: '1.25rem', color: '#dc2626', fontWeight: 600, fontSize: '0.875rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
              <span>🚨</span>
              <div>{weather.alerts.map((a, i) => <div key={i}>{a}</div>)}</div>
            </div>
          )}



          {/* Current Weather Card */}
          <div className="weather-card mb-4" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '8rem', opacity: 0.08, userSelect: 'none' }}>{getIcon(weather.current?.description)}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: 6 }}>📍 {weather.location}</div>
                <div style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1 }}>{weather.current?.temp?.toFixed(1)}°C</div>
                <div style={{ fontSize: '1.1rem', opacity: 0.9, marginTop: 6, textTransform: 'capitalize' }}>{weather.current?.description}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '4rem' }}>{getIcon(weather.current?.description)}</div>
                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Feels like {weather.current?.feelsLike?.toFixed(1)}°C</div>
                {weather.current?.pressure && <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: 2 }}>Pressure: {weather.current.pressure} hPa</div>}
              </div>
            </div>

            {/* Metrics grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
              {[
                { icon: '💧', label: 'Humidity', value: `${weather.current?.humidity?.toFixed(0)}%` },
                { icon: '💨', label: 'Wind Speed', value: `${weather.current?.windSpeed?.toFixed(1)} m/s` },
                { icon: '👁️', label: 'Visibility', value: weather.current?.visibility ? `${(weather.current.visibility / 1000).toFixed(0)} km` : 'N/A' },
              ].map(m => (
                <div key={m.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{m.icon}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700 }}>{m.value}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.75 }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 7-Day Forecast */}
          <div className="glass-card p-4 mb-4">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>📅 7-Day Forecast</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', overflowX: 'auto' }}>
              {weather.sevenDay?.slice(0, 7).map((day, i) => (
                <div
                  key={i}
                  style={{ textAlign: 'center', padding: '0.75rem 0.4rem', borderRadius: 'var(--radius-md)', background: i === 0 ? 'var(--primary-pale)' : 'transparent', border: i === 0 ? '1px solid var(--border)' : '1px solid transparent', minWidth: 70 }}
                >
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                    {i === 0 ? 'Today' : new Date(day.date + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'short' })}
                  </div>
                  <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{getIcon(day.description)}</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>{day.maxTemp?.toFixed(0)}°</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{day.minTemp?.toFixed(0)}°</div>
                  {day.rainMm > 0 && (
                    <div style={{ fontSize: '0.68rem', color: '#3b82f6', marginTop: 2 }}>💧 {day.rainMm?.toFixed(0)}mm</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Farming Advice */}
          <div className="glass-card p-4">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>🌾 Farming Advice for {weather.location}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {weather.farmingAdvice?.map((advice, i) => (
                <div
                  key={i}
                  style={{ display: 'flex', gap: '0.75rem', padding: '0.8rem 1rem', background: 'var(--primary-pale)', borderRadius: 'var(--radius-md)', alignItems: 'flex-start' }}
                >
                  <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>💡</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{advice}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* No data state */}
      {!loading && !weather && !error && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌤️</div>
          <div style={{ fontWeight: 600 }}>Select a district to view weather data</div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
