import React, { useState, useEffect } from 'react';

function LockScreen({ onUnlock }) {
  const [passcode, setPasscode] = useState('');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState(false);
  const [hearts, setHearts] = useState([]);

  const CORRECT_PASSCODE = '2705'; // 27th May anniversary (as requested)

  // Spawn floating hearts
  useEffect(() => {
    const interval = setInterval(() => {
      const id = Math.random();
      const style = {
        left: `${Math.random() * 100}%`,
        fontSize: `${Math.random() * 20 + 15}px`,
        animationDuration: `${Math.random() * 4 + 4}s`,
        opacity: Math.random() * 0.6 + 0.3,
      };
      const emoji = ['❤️', '💖', '💝', '💕', '🌸'][Math.floor(Math.random() * 5)];
      
      setHearts((prev) => [...prev, { id, style, emoji }]);
      
      // Cleanup heart
      setTimeout(() => {
        setHearts((prev) => prev.filter((h) => h.id !== id));
      }, 8000);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  const handleKeyPress = (num) => {
    setError(false);
    if (passcode.length < 4) {
      const nextPasscode = passcode + num;
      setPasscode(nextPasscode);
      if (nextPasscode.length === 4) {
        // Automatically check passcode
        if (nextPasscode === CORRECT_PASSCODE) {
          // Store API Key if provided
          if (apiKey.trim()) {
            localStorage.setItem('gemini_api_key', apiKey.trim());
          }
          // Small delay for visual satisfaction
          setTimeout(() => {
            onUnlock(apiKey.trim());
          }, 400);
        } else {
          setTimeout(() => {
            setError(true);
            setPasscode('');
          }, 300);
        }
      }
    }
  };

  const handleClear = () => {
    setPasscode('');
    setError(false);
  };

  const saveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('gemini_api_key', apiKey.trim());
    setShowSettings(false);
  };

  return (
    <div style={styles.container}>
      {/* Disco Background */}
      <div className="disco-bg" />

      <button 
        style={styles.settingsToggle} 
        onClick={() => setShowSettings(!showSettings)}
        title="Settings & API Key"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.73 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
        </svg>
      </button>

      {showSettings ? (
        <div className="glass-panel" style={styles.settingsModal}>
          <h2 style={styles.modalTitle}>API Key</h2>
          <p style={styles.modalSub}>
            Provide your Gemini API Key. It's stored locally in your browser.
          </p>
          <form onSubmit={saveSettings} style={styles.form}>
            <input
              type="password"
              placeholder="AI Studio API Key"
              className="input-style"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={styles.input}
            />
            <div style={styles.btnRow}>
              <button 
                type="button" 
                style={styles.cancelBtn} 
                onClick={() => setShowSettings(false)}
              >
                Cancel
              </button>
              <button type="submit" className="romantic-button">
                Save
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div style={styles.lockCard}>
          <div style={styles.logoContainer}>
             <div style={styles.spotifyLogo}>
                <svg viewBox="0 0 24 24" fill="var(--spotify-green)" width="64" height="64">
                   <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.44-.48.12-1.02-.12-1.14-.6-.12-.48.12-1.02.6-1.14 4.32-1.32 9.66-.6 13.439 1.62.42.24.6.84.3 1.26zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.18-1.2-.18-1.38-.78-.18-.6.18-1.2.78-1.38 4.2-1.26 11.28-1.02 15.72 1.62.539.3.719 1.02.419 1.56-.239.54-.959.72-1.5.42z"/>
                </svg>
             </div>
          </div>
          <h1 style={styles.title}>Happy Birthday, Harv.</h1>
          <p style={styles.prompt}>Enter your passcode to unlock</p>
          
          {/* Dot indicators */}
          <div style={styles.dotsRow}>
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                style={{
                  ...styles.dot,
                  backgroundColor: error 
                    ? '#ff3b30' 
                    : passcode.length > idx 
                      ? 'var(--spotify-green)' 
                      : 'rgba(255, 255, 255, 0.2)',
                  transform: error ? 'translateX(5px)' : 'none',
                }}
              />
            ))}
          </div>

          {error && <p style={styles.errorText}>Incorrect passcode.</p>}

          {/* Keypad */}
          <div style={styles.keypad}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleKeyPress(num.toString())}
                className="key"
              >
                {num}
              </button>
            ))}
            <button onClick={handleClear} className="key" style={{ fontSize: '14px' }}>
              Clear
            </button>
            <button
              onClick={() => handleKeyPress('0')}
              className="key"
            >
              0
            </button>
            <div style={{ opacity: 0, pointerEvents: 'none' }} className="key" />
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100%',
    position: 'relative',
    padding: '20px',
  },
  settingsToggle: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    cursor: 'pointer',
    color: 'var(--spotify-light-gray)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    transition: 'all 0.3s ease',
  },
  lockCard: {
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 2,
  },
  logoContainer: {
    marginBottom: '20px',
  },
  spotifyLogo: {
    width: '64px',
    height: '64px',
  },
  title: {
    fontFamily: 'var(--spotify-font)',
    fontSize: '28px',
    fontWeight: '900',
    marginBottom: '10px',
    color: '#fff',
    letterSpacing: '-1px',
  },
  prompt: {
    fontSize: '14px',
    color: 'var(--spotify-light-gray)',
    marginBottom: '24px',
    fontWeight: '500',
  },
  dotsRow: {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px',
  },
  dot: {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    transition: 'all 0.2s ease',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '15px',
  },
  keypad: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    width: '100%',
    maxWidth: '280px',
    marginTop: '10px',
  },
  settingsModal: {
    maxWidth: '400px',
    width: '100%',
    zIndex: 2,
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: '900',
    marginBottom: '10px',
    color: 'white',
    letterSpacing: '-0.5px',
  },
  modalSub: {
    fontSize: '14px',
    color: 'var(--spotify-light-gray)',
    marginBottom: '20px',
    lineHeight: '1.4',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  input: {
    textAlign: 'center',
  },
  btnRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  cancelBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--spotify-light-gray)',
    padding: '12px 24px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '700',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
  },
};

// CSS active styles for buttons using direct JS event handling isn't needed, standard hover rules handle this.
export default LockScreen;
