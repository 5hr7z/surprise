import React, { useState, useEffect, useRef } from 'react';
import { getShrutiBotResponse } from '../utils/gemini';

function ChatBot({ apiKey }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "Shruti",
      text: "hey babe! happy birthday! 😂❤️",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    {
      id: 2,
      sender: "Shruti",
      text: "hope you like this little surprise i made for you tbh",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setError(null);
    const userText = input.trim();
    setInput('');

    // Append user message
    const userMsg = {
      id: Date.now(),
      sender: "Harvey",
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);

    // Check for API Key
    if (!apiKey) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: "Shruti",
            text: "babe, you need to add your Gemini API Key in the settings (gear icon on Lock Screen) so I can reply! 😂⚙️",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 800);
      return;
    }

    // Trigger typing indicator
    setIsTyping(true);

    try {
      // Map message history to the format required
      const history = messages.map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const chunks = await getShrutiBotResponse(userText, history, apiKey);
      
      setIsTyping(false);

      // Process chunks asynchronously to prevent UI hanging
      const displayChunks = async (chunkList, index = 0) => {
        if (index >= chunkList.length) return;
        
        setIsTyping(true);
        const chunk = chunkList[index];
        const typingDelay = Math.min(2000, Math.max(600, chunk.length * 20));
        await new Promise((resolve) => setTimeout(resolve, typingDelay));
        
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + index,
            sender: "Shruti",
            text: chunk,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);

        if (index < chunkList.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 450));
          displayChunks(chunkList, index + 1);
        }
      };

      displayChunks(chunks);
    } catch (err) {
      console.error(err);
      setIsTyping(false);
      setError("Failed to get response. Check your API key or connection.");
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 3,
          sender: "System",
          text: `API Error: ${err.message || "Quota exceeded or bad key."}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerInfo}>
          <div style={styles.avatar}>🥰</div>
          <div>
            <h3 style={styles.headerName}>Shruti Bot</h3>
            <span style={styles.headerStatus}>online</span>
          </div>
        </div>
        {!apiKey && (
          <div style={styles.apiKeyWarning} title="API Key missing">
            ⚠️ API Key Missing
          </div>
        )}
      </div>

      <div style={styles.chatArea}>
        {messages.map((msg) => {
          if (msg.sender === "System") {
            return (
              <div key={msg.id} style={styles.systemAlert}>
                <span style={styles.systemAlertText}>{msg.text}</span>
              </div>
            );
          }

          const isHarvey = msg.sender === "Harvey";
          return (
            <div
              key={msg.id}
              style={{
                ...styles.messageRow,
                justifyContent: isHarvey ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  ...styles.bubble,
                  backgroundColor: isHarvey ? '#1db954' : '#282828',
                  color: isHarvey ? '#000' : '#fff',
                  borderTopRightRadius: isHarvey ? '4px' : '18px',
                  borderTopLeftRadius: isHarvey ? '18px' : '4px',
                  border: isHarvey ? 'none' : '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <p style={{...styles.messageText, color: isHarvey ? '#000' : '#fff'}}>{msg.text}</p>
                <span style={{...styles.messageTime, color: isHarvey ? 'rgba(0,0,0,0.6)' : 'var(--spotify-light-gray)'}}>{msg.time}</span>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <div style={styles.messageRow}>
            <div style={{ ...styles.bubble, ...styles.typingBubble }}>
              <div className="typing-dots">
                <span className="dot-blink" style={styles.dotBlink1}>.</span>
                <span className="dot-blink" style={styles.dotBlink2}>.</span>
                <span className="dot-blink" style={styles.dotBlink3}>.</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer input form */}
      <form onSubmit={handleSend} style={styles.inputForm}>
        <input
          type="text"
          placeholder="Type a message babe..."
          className="input-style"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={styles.textInput}
        />
        <button type="submit" className="romantic-button" style={styles.sendBtn}>
          ➔
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '500px',
    height: 'calc(100vh - 70px)',
    background: '#121212',
    borderInline: '1px solid rgba(255,255,255,0.05)',
    margin: '0 auto',
    position: 'relative',
  },
  header: {
    padding: '16px 20px',
    background: 'rgba(18, 18, 18, 0.95)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 5,
  },
  headerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  avatar: {
    fontSize: '24px',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: '#1db954',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #121212',
  },
  headerName: {
    fontSize: '16px',
    fontWeight: '800',
    color: 'white',
    fontFamily: 'var(--spotify-font)',
  },
  headerStatus: {
    fontSize: '12px',
    color: '#1db954',
    display: 'block',
    fontWeight: '600',
  },
  apiKeyWarning: {
    fontSize: '11px',
    background: 'rgba(255, 179, 0, 0.1)',
    color: '#ffb300',
    border: '1px solid rgba(255, 179, 0, 0.2)',
    padding: '6px 10px',
    borderRadius: '8px',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  chatArea: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    background: 'transparent',
  },
  systemAlert: {
    display: 'flex',
    justifyContent: 'center',
    margin: '10px 0',
  },
  systemAlertText: {
    fontSize: '11px',
    color: '#ff4d4d',
    background: 'rgba(255, 77, 77, 0.1)',
    border: '1px solid rgba(255, 77, 77, 0.2)',
    padding: '6px 12px',
    borderRadius: '8px',
    fontWeight: '700',
    textAlign: 'center',
    maxWidth: '80%',
  },
  messageRow: {
    display: 'flex',
    width: '100%',
  },
  bubble: {
    maxWidth: '80%',
    padding: '12px 16px',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  typingBubble: {
    backgroundColor: '#181818',
    borderTopLeftRadius: '4px',
    border: '1px solid rgba(255,255,255,0.05)',
    padding: '12px 20px',
    minWidth: '60px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageText: {
    fontSize: '15px',
    color: 'white',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap',
    textAlign: 'left',
    fontWeight: '500',
  },
  messageTime: {
    fontSize: '10px',
    color: 'var(--spotify-light-gray)',
    alignSelf: 'flex-end',
    fontWeight: '600',
  },
  inputForm: {
    padding: '16px 20px',
    background: 'rgba(18, 18, 18, 0.95)',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    borderRadius: '500px',
    padding: '14px 20px',
    fontSize: '15px',
    background: '#282828',
    color: 'white',
    border: '1px solid transparent',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
  sendBtn: {
    width: '46px',
    height: '46px',
    padding: 0,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    background: '#1db954',
    color: 'black',
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  },
  dotBlink1: { animation: 'pulseGlow 1.2s infinite', fontSize: '24px', lineHeight: '10px', color: '#1db954' },
  dotBlink2: { animation: 'pulseGlow 1.2s infinite 0.2s', fontSize: '24px', lineHeight: '10px', color: '#1db954' },
  dotBlink3: { animation: 'pulseGlow 1.2s infinite 0.4s', fontSize: '24px', lineHeight: '10px', color: '#1db954' },
};

export default ChatBot;
