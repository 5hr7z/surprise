import React, { useState } from 'react';
import coreMemories from '../assets/core_memories.json';

function MemoryLane() {
  const [activeTrack, setActiveTrack] = useState(null);

  const toggleTrack = (index) => {
    setActiveTrack(activeTrack === index ? null : index);
  };

  return (
    <div style={styles.container}>
      <div style={styles.playlistHeader}>
        <div style={styles.coverArt}>
          <div className="disco-bg" style={{ borderRadius: '8px', opacity: 0.8 }} />
          <span style={styles.coverEmoji}>👩‍❤️‍👨</span>
        </div>
        <div style={styles.headerInfo}>
          <span style={styles.playlistTag}>PLAYLIST</span>
          <h1 style={styles.title}>Core Memories</h1>
          <p style={styles.subtitle}>Our favourite milestones, on repeat. 🔂</p>
          <div style={styles.statsRow}>
            <span style={styles.spotifyLogoSmall}>
              <svg viewBox="0 0 24 24" fill="#1db954" width="16" height="16">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.44-.48.12-1.02-.12-1.14-.6-.12-.48.12-1.02.6-1.14 4.32-1.32 9.66-.6 13.439 1.62.42.24.6.84.3 1.26zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.18-1.2-.18-1.38-.78-.18-.6.18-1.2.78-1.38 4.2-1.26 11.28-1.02 15.72 1.62.539.3.719 1.02.419 1.56-.239.54-.959.72-1.5.42z"/>
              </svg>
            </span>
            <span>Shruti & Harv</span>
            <span>•</span>
            <span>{coreMemories.length} songs</span>
          </div>
        </div>
      </div>

      <div style={styles.controlsRow}>
        <button style={styles.playButton}>▶</button>
      </div>

      <div style={styles.trackList}>
        {coreMemories.map((mem, index) => {
          const isActive = activeTrack === index;
          return (
            <div key={mem.date} style={styles.trackContainer}>
              <div 
                style={{ ...styles.trackRow, background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent' }}
                onClick={() => toggleTrack(index)}
              >
                <div style={styles.trackNumber}>
                  {isActive ? <span style={{ color: '#1db954' }}>▶</span> : index + 1}
                </div>
                <div style={styles.trackDetails}>
                  <h4 style={{ ...styles.trackTitle, color: isActive ? '#1db954' : 'white' }}>{mem.title}</h4>
                  <p style={styles.trackMeta}>{mem.date} • {mem.emoji}</p>
                </div>
              </div>
              
              {isActive && (
                <div style={styles.expandedContainer}>
                  {mem.trackId && (
                    <iframe
                      src={`https://open.spotify.com/embed/track/${mem.trackId}?utm_source=generator`}
                      width="100%"
                      height="152"
                      frameBorder="0"
                      allowFullScreen=""
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      style={styles.spotifyIframe}
                    ></iframe>
                  )}
                  <div style={styles.lyricsContainer}>
                    <p style={styles.lyricsTitle}>The Memory</p>
                    <p style={styles.lyricsText}>"{mem.quote}"</p>
                    <p style={styles.lyricsContext}>{mem.context}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '600px',
    padding: '40px 20px 120px 20px',
    overflowY: 'auto',
    minHeight: 'calc(100vh - 70px)',
  },
  playlistHeader: {
    display: 'flex',
    alignItems: 'flex-end',
    width: '100%',
    gap: '20px',
    marginBottom: '20px',
  },
  coverArt: {
    width: '120px',
    height: '120px',
    background: '#282828',
    borderRadius: '8px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    overflow: 'hidden',
    flexShrink: 0,
  },
  coverEmoji: {
    fontSize: '48px',
    position: 'relative',
    zIndex: 2,
  },
  headerInfo: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  playlistTag: {
    fontSize: '11px',
    color: 'white',
    fontWeight: '700',
    letterSpacing: '1px',
    marginBottom: '4px',
  },
  title: {
    fontFamily: 'var(--spotify-font)',
    fontSize: '32px',
    fontWeight: '900',
    color: '#fff',
    letterSpacing: '-1.5px',
    lineHeight: '1.1',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--spotify-light-gray)',
    fontWeight: '500',
    marginBottom: '8px',
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: 'var(--spotify-light-gray)',
    fontWeight: '600',
  },
  spotifyLogoSmall: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsRow: {
    width: '100%',
    padding: '16px 0',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    marginBottom: '10px',
  },
  playButton: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: '#1db954',
    color: 'black',
    border: 'none',
    fontSize: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 8px 8px rgba(0,0,0,0.3)',
    transition: 'transform 0.1s ease',
  },
  trackList: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  trackContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  trackRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
  },
  trackNumber: {
    width: '30px',
    fontSize: '14px',
    color: 'var(--spotify-light-gray)',
    fontWeight: '500',
    textAlign: 'center',
    marginRight: '12px',
  },
  trackDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  trackTitle: {
    fontSize: '16px',
    fontWeight: '600',
  },
  trackMeta: {
    fontSize: '13px',
    color: 'var(--spotify-light-gray)',
  },
  expandedContainer: {
    padding: '0 20px 20px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  spotifyIframe: {
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
  lyricsContainer: {
    background: '#121212',
    padding: '20px',
    borderRadius: '8px',
    borderLeft: '4px solid #1db954',
  },
  lyricsTitle: {
    color: '#1db954',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '10px',
  },
  lyricsText: {
    color: 'white',
    fontSize: '1.1rem',
    lineHeight: '1.5',
    fontStyle: 'italic',
    marginBottom: '10px',
  },
  lyricsContext: {
    color: '#b3b3b3',
    fontSize: '0.9rem',
  },
  transcriptScroll: {
    maxHeight: '300px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingRight: '10px',
  },
  chatMessage: {
    fontSize: '14px',
    lineHeight: '1.4',
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '8px 12px',
    borderRadius: '8px',
  }
};

export default MemoryLane;
