import React, { useState, useRef, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import api from '../lib/api';

const ChatWidget = () => {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', content: 'Hello! I\'m AgroBot 🌱 Your AI farming assistant. How can I help you today? (You can also chat in Tamil!)' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  
  // Voice & Context states
  const [isListening, setIsListening] = useState(false);
  const [weatherContext, setWeatherContext] = useState(null);
  
  const endRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      
      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  // Update language for speech recognition
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language === 'ta' ? 'ta-IN' : 'en-US';
    }
  }, [language]);

  // Fetch weather context when chat opens
  useEffect(() => {
    if (open && user?.district && !weatherContext) {
      const fetchContext = async () => {
        try {
          const res = await api.get(`/weather/${encodeURIComponent(user.district)}`);
          const data = res.data.data;
          setWeatherContext({
            location: data.location || user.district,
            weather: `Temp: ${data.current?.temp}°C, Wind: ${data.current?.windSpeed} m/s, Condition: ${data.current?.description}, Next few days: ${data.farmingAdvice?.join(' ')}`
          });
        } catch (err) {
          console.error("Could not fetch weather context", err);
        }
      };
      fetchContext();
    }
  }, [open, user, weatherContext]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        alert("Your browser does not support voice input.");
      }
    }
  };

  const speakText = (text, lang) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();

      // Auto-detect Tamil script characters
      const isTamilText = /[\u0B80-\u0BFF]/.test(text);
      const targetLang = isTamilText || lang === 'ta' ? 'ta-IN' : 'en-US';

      const doSpeak = () => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = targetLang;
        utterance.rate = 0.9;

        // Try to find the best matching voice
        const voices = window.speechSynthesis.getVoices();
        const exactMatch = voices.find(v => v.lang === targetLang);
        const partialMatch = voices.find(v => v.lang.startsWith(targetLang.split('-')[0]));
        const chosenVoice = exactMatch || partialMatch || null;

        if (chosenVoice) {
          utterance.voice = chosenVoice;
        }

        utterance.onerror = (e) => console.error('TTS Error:', e.error);
        window.speechSynthesis.speak(utterance);
      };

      // Voices may not be loaded yet — wait for them
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        doSpeak();
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.onvoiceschanged = null;
          doSpeak();
        };
        // Trigger voice list load
        window.speechSynthesis.getVoices();
      }
    } catch (err) {
      console.error("TTS Error:", err);
    }
  };

  const sendMessage = async (msgText = input) => {
    if (!msgText.trim() || loading) return;
    const userMsg = msgText.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const history = messages.slice(-10).map(m => ({ role: m.role === 'bot' || m.role === 'model' ? 'model' : 'user', content: m.content }));
      
      const payload = { 
        message: userMsg, 
        history, 
        language,
        context: weatherContext
      };
      
      const res = await api.post('/chatbot/message', payload);
      const reply = res.data.data.reply;
      
      setMessages(prev => [...prev, { role: 'model', content: reply }]);
      
      // Auto-speak the reply
      speakText(reply, language);
      
    } catch {
      const fallbackMsg = language === 'ta' 
        ? '🌱 மன்னிக்கவும், தற்காலிக இணைப்பு பிரச்சனை. எனினும் நான் பயிர் சாகுபடி, சந்தை விலைகள், வானிலை மற்றும் நோய் மேலாண்மைக்கு உங்களுக்கு உதவ தயார்!' 
        : '🌱 I apologize for the momentary connection issue. However, I am ready to help you with crop advice, market prices, weather conditions, and disease management!';
      setMessages(prev => [...prev, { role: 'model', content: fallbackMsg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-window" style={{ width: '380px', height: '550px' }}>
          <div className="chat-header" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="d-flex align-items-center justify-content-between w-100">
              <div className="d-flex align-items-center gap-2">
                <span style={{ fontSize: '1.5rem' }}>🤖</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>AgroBot</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Smart Farming Assistant</div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <button
                  onClick={() => {
                    setLanguage(l => l === 'en' ? 'ta' : 'en');
                    window.speechSynthesis.cancel(); // Stop speaking if language changes
                  }}
                  style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '20px', padding: '3px 12px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  {language === 'en' ? 'தமிழ்' : 'English'}
                </button>
                <button onClick={() => { setOpen(false); window.speechSynthesis.cancel(); }} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
              </div>
            </div>
            {weatherContext && (
              <div style={{ fontSize: '0.7rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>📍</span> Connected to {weatherContext.location} weather
              </div>
            )}
          </div>

          <div className="chat-messages" style={{ flex: 1, padding: '1rem', overflowY: 'auto', background: '#f8fafc' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '1rem' }}>
                <div style={{ 
                  maxWidth: '85%', 
                  padding: '0.75rem 1rem', 
                  borderRadius: '1rem',
                  borderBottomRightRadius: msg.role === 'user' ? '4px' : '1rem',
                  borderBottomLeftRadius: msg.role !== 'user' ? '4px' : '1rem',
                  background: msg.role === 'user' ? 'var(--primary)' : 'white',
                  color: msg.role === 'user' ? 'white' : '#334155',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                  position: 'relative'
                }}>
                  {msg.content}
                  {msg.role !== 'user' && (
                    <button 
                      onClick={() => speakText(msg.content, language)}
                      title="Read aloud"
                      style={{
                        position: 'absolute', right: '-30px', bottom: '0px',
                        background: 'white', border: '1px solid #e2e8f0', borderRadius: '50%',
                        width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', fontSize: '0.7rem', color: 'var(--primary)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                    >
                      🔊
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ background: 'white', padding: '0.75rem 1rem', borderRadius: '1rem', borderBottomLeftRadius: '4px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                  <span style={{ color: 'var(--primary)', letterSpacing: '2px' }}>● ● ●</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 2 && (
            <div style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', background: '#f8fafc' }}>
              {[
                { en: 'Can I spray pesticide today?', ta: 'இன்று பூச்சிக்கொல்லி தெளிக்கலாமா?' },
                { en: 'Market prices today?', ta: 'இன்றைய சந்தை விலை?' },
                { en: 'Plant disease help', ta: 'பயிர் நோய் தீர்வு' },
                { en: 'Government schemes', ta: 'அரசு திட்டங்கள்' },
                { en: 'Cold storage advice', ta: 'குளிர் பதனக் கிடங்கு' }
              ].map((q, i) => (
                <button 
                  key={i}
                  onClick={() => sendMessage(language === 'ta' ? q.ta : q.en)}
                  style={{ whiteSpace: 'nowrap', padding: '0.4rem 0.8rem', borderRadius: '20px', border: '1px solid var(--primary)', background: 'var(--primary-pale)', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500 }}
                >
                  {language === 'ta' ? q.ta : q.en}
                </button>
              ))}
            </div>
          )}

          <div className="chat-input-area" style={{ display: 'flex', gap: '0.5rem', padding: '1rem', background: 'white', borderTop: '1px solid #e2e8f0' }}>
            <button
              onClick={toggleListen}
              style={{ 
                width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
                border: 'none', 
                background: isListening ? '#ef4444' : '#f1f5f9', 
                color: isListening ? 'white' : '#64748b',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
                animation: isListening ? 'pulse 1.5s infinite' : 'none'
              }}
              title="Voice Input"
            >
              🎤
            </button>
            <input
              style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: '20px', padding: '0 1rem', fontSize: '0.9rem', outline: 'none' }}
              placeholder={isListening ? (language === 'ta' ? 'கேட்கிறது...' : 'Listening...') : (language === 'ta' ? 'உங்கள் கேள்வியை தட்டவும்...' : 'Type a message...')}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{ 
                width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
                border: 'none', background: input.trim() ? 'var(--primary)' : '#cbd5e1', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: input.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s'
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      <button 
        className="chat-toggle-btn" 
        onClick={() => {
          setOpen(o => !o);
          if (open) window.speechSynthesis.cancel();
        }}
        style={{ 
          width: '60px', height: '60px', borderRadius: '50%', 
          background: 'var(--primary)', color: 'white', border: 'none',
          boxShadow: '0 4px 12px rgba(34,197,94,0.3)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.8rem', transition: 'transform 0.2s'
        }}
      >
        {open ? '✕' : '🤖'}
      </button>

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </div>
  );
};

export default ChatWidget;
