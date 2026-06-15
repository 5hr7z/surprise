import React, { useState } from 'react';
import LockScreen from './components/LockScreen';
import StoryWrapped from './components/StoryWrapped';
import MemoryLane from './components/MemoryLane';
import ChatBot from './components/ChatBot';
import SurpriseBox from './components/SurpriseBox';

function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [activeTab, setActiveTab] = useState('wrapped'); // 'wrapped', 'timeline', 'chat', 'cake'

  const handleUnlock = (key) => {
    setApiKey(key);
    setIsUnlocked(true);
  };

  if (!isUnlocked) {
    return <LockScreen onUnlock={handleUnlock} />;
  }

  return (
    <div style={styles.appContainer}>
      {/* Main Content Area */}
      <main style={styles.contentArea}>
        {activeTab === 'wrapped' && <StoryWrapped />}
        {activeTab === 'timeline' && <MemoryLane />}
        {activeTab === 'chat' && <ChatBot apiKey={apiKey} />}
        {activeTab === 'cake' && <SurpriseBox />}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="nav-bar">
        <button
          className={`nav-item ${activeTab === 'wrapped' ? 'active' : ''}`}
          onClick={() => setActiveTab('wrapped')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          Stats Wrapped
        </button>

        <button
          className={`nav-item ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          Memory Lane
        </button>

        <button
          className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          ShrutiBot Chat
        </button>

        <button
          className={`nav-item ${activeTab === 'cake' ? 'active' : ''}`}
          onClick={() => setActiveTab('cake')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
          </svg>
          Surprise Box
        </button>
      </nav>
    </div>
  );
}

const styles = {
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    width: '100%',
    position: 'relative',
    background: 'transparent',
  },
  contentArea: {
    flex: 1,
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
};

export default App;
