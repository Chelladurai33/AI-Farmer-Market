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
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const history = messages.slice(-10).map(m => ({ role: m.role === 'bot' || m.role === 'model' ? 'model' : 'user', content: m.content }));
      const res = await api.post('/chatbot/message', { message: userMsg, history, language });
      setMessages(prev => [...prev, { role: 'model', content: res.data.data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'model', content: 'Sorry, I\'m having trouble responding right now. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="d-flex align-items-center gap-2">
              <span style={{ fontSize: '1.5rem' }}>🤖</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>AgroBot</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>AI Farming Assistant</div>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button
                onClick={() => setLanguage(l => l === 'en' ? 'ta' : 'en')}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '20px', padding: '2px 10px', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                {language === 'en' ? 'தமிழ்' : 'English'}
              </button>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.role === 'user' ? 'user' : 'bot'}`}>
                {msg.content}
              </div>
            ))}
            {loading && (
              <div className="chat-message bot">
                <span>●</span><span style={{ animation: 'blink 1s infinite 0.2s' }}>●</span><span style={{ animation: 'blink 1s infinite 0.4s' }}>●</span>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="chat-input-area">
            <input
              className="form-control-custom"
              style={{ borderRadius: '50px', fontSize: '0.875rem' }}
              placeholder={language === 'ta' ? 'உங்கள் கேள்வியை தட்டவும்...' : 'Ask anything about farming...'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
            />
            <button
              className="btn-primary-custom"
              style={{ borderRadius: '50%', width: '38px', height: '38px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              onClick={sendMessage}
              disabled={loading}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      <button className="chat-toggle-btn" onClick={() => setOpen(o => !o)}>
        {open ? '✕' : '💬'}
      </button>
    </div>
  );
};

export default ChatWidget;
