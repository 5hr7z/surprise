import React, { useState, useEffect } from 'react';

function SurpriseBox() {
  const [candlesLit, setCandlesLit] = useState([true, true, true]);
  const [cakeBlown, setCakeBlown] = useState(false);
  const [letterOpen, setLetterOpen] = useState(false);
  const [confetti, setConfetti] = useState([]);

  // Trigger confetti explosion
  const triggerConfetti = () => {
    const newConfetti = [];
    const colors = ['#ff6584', '#8e2de2', '#4a00e0', '#ffd166', '#06d6a0', '#118ab2'];
    
    for (let i = 0; i < 100; i++) {
      const id = Math.random();
      const style = {
        left: `${Math.random() * 100}%`,
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        width: `${Math.random() * 8 + 6}px`,
        height: `${Math.random() * 15 + 8}px`,
        animationDelay: `${Math.random() * 2}s`,
        animationDuration: `${Math.random() * 3 + 2}s`,
        transform: `rotate(${Math.random() * 360}deg)`,
      };
      newConfetti.push({ id, style });
    }
    setConfetti(newConfetti);
    
    // Clear confetti after animation completes
    setTimeout(() => {
      setConfetti([]);
    }, 6000);
  };

  const blowCandle = (index) => {
    if (cakeBlown) return;
    
    setCandlesLit((prev) => {
      const updated = [...prev];
      updated[index] = false;
      
      // If all candles are blown
      if (updated.every((c) => !c)) {
        setCakeBlown(true);
        triggerConfetti();
      }
      return updated;
    });
  };

  const resetCake = () => {
    setCandlesLit([true, true, true]);
    setCakeBlown(false);
    setLetterOpen(false);
  };

  return (
    <div style={styles.container}>
      {/* Confetti */}
      {confetti.map((c) => (
        <div key={c.id} style={{ ...styles.confettiPiece, ...c.style }} />
      ))}

      <div style={styles.header}>
        <h1 style={styles.title}>The Surprise Box 🎁</h1>
        <p style={styles.subtitle}>
          {!cakeBlown 
            ? "Click on each candle to blow it out and make a wish, Harvey! 🎂" 
            : "Happy Birthday, my love! Click the envelope to open your letter. 💌"}
        </p>
      </div>

      {/* Cake Container */}
      <div style={styles.cakeWrapper}>
        <div style={styles.cakeContainer}>
          {/* Candles */}
          <div style={styles.candlesRow}>
            {candlesLit.map((lit, idx) => (
              <div 
                key={idx} 
                style={{ ...styles.candle, cursor: lit ? 'pointer' : 'default' }}
                onClick={() => blowCandle(idx)}
              >
                {lit && <div style={styles.flame} />}
                <div style={styles.wick} />
                <div style={styles.candleBody} />
              </div>
            ))}
          </div>

          {/* Cake Layers */}
          <div style={styles.cakeTop} />
          <div style={styles.cakeMiddle} />
          <div style={styles.cakeBottom} />
          <div style={styles.cakeStand} />
        </div>
      </div>

      {cakeBlown && (
        <div style={styles.letterWrapper}>
          {!letterOpen ? (
            <div 
              style={styles.envelope} 
              onClick={() => setLetterOpen(true)}
            >
              <div style={styles.envelopeTop} />
              <div style={styles.envelopeSeal}>❤️</div>
              <p style={styles.envelopeText}>For Harvey Deason</p>
            </div>
          ) : (
            <div className="glass-panel" style={styles.letterCard}>
              <button style={styles.closeLetterBtn} onClick={() => setLetterOpen(false)}>✕</button>
              <h2 style={styles.letterHeader}>Dearest Harv,</h2>
              <div style={styles.letterBody}>
                <p>
                  Happy Birthday, my love! 🎂✨
                </p>
                <p>
                  I wanted to build you something truly special this year—something that captures how much we talk, laugh, argue, and share our lives. Over half a million messages! Who would have thought we yapped that much? 😂
                </p>
                <p>
                  Thank you for being the one who always checks in, the one who texts first when things are quiet, and the person who brings so much colour, voice notes, and stickers into my life.
                </p>
                <p>
                  I love every single crease of your face, I love the way your eyes light up in videos, and yes, I even love your silly worries. I promise to always be here to listen to your vents, appreciate your new haircuts, and hype you up dramatically whenever you need it.
                </p>
                <p>
                  Here's to celebrating many, many more birthdays together, building more memories, and yapping for another million messages.
                </p>
                <p style={styles.letterSignature}>
                  Forever yours,<br />
                  <strong>Shruti 💋</strong>
                </p>
              </div>
              <button 
                style={styles.resetBtn} 
                onClick={resetCake}
              >
                Relight Candles 🎂
              </button>
            </div>
          )}
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
    width: '100%',
    padding: '30px 15px 100px 15px',
    minHeight: 'calc(100vh - 70px)',
    position: 'relative',
    overflowX: 'hidden',
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px',
    maxWidth: '500px',
  },
  title: {
    fontFamily: 'var(--serif-font)',
    fontSize: '32px',
    color: '#fff',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
  },
  cakeWrapper: {
    height: '240px',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: '30px',
    width: '100%',
  },
  cakeContainer: {
    position: 'relative',
    width: '200px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  candlesRow: {
    display: 'flex',
    gap: '25px',
    position: 'absolute',
    bottom: '95px',
    justifyContent: 'center',
    width: '100%',
  },
  candle: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '8px',
  },
  flame: {
    width: '10px',
    height: '18px',
    background: 'radial-gradient(ellipse at bottom, #ffd166 0%, #ff6b6b 100%)',
    borderRadius: '50% 50% 20% 20%',
    position: 'absolute',
    top: '-20px',
    animation: 'pulseGlow 1.5s ease-in-out infinite',
    boxShadow: '0 0 10px rgba(255, 209, 102, 0.8)',
  },
  wick: {
    width: '2px',
    height: '6px',
    background: '#333',
  },
  candleBody: {
    width: '8px',
    height: '35px',
    background: 'repeating-linear-gradient(45deg, #ff6584, #ff6584 5px, #fff 5px, #fff 10px)',
    borderRadius: '2px 2px 0 0',
  },
  cakeTop: {
    width: '120px',
    height: '30px',
    background: '#8e2de2',
    borderTop: '5px solid #ff6584',
    borderRadius: '15px 15px 0 0',
    zIndex: 3,
  },
  cakeMiddle: {
    width: '150px',
    height: '35px',
    background: '#4a00e0',
    borderTop: '5px solid #ffd166',
    zIndex: 2,
  },
  cakeBottom: {
    width: '180px',
    height: '40px',
    background: '#1d0933',
    borderTop: '5px solid #06d6a0',
    borderRadius: '5px 5px 0 0',
    zIndex: 1,
  },
  cakeStand: {
    width: '210px',
    height: '8px',
    background: '#ccc',
    borderRadius: '4px',
    zIndex: 4,
  },
  letterWrapper: {
    width: '100%',
    maxWidth: '450px',
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',
  },
  envelope: {
    width: '260px',
    height: '160px',
    background: '#1d1730',
    border: '1px solid rgba(255, 101, 132, 0.3)',
    borderRadius: '12px',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-premium)',
    transition: 'all 0.3s ease',
  },
  envelopeTop: {
    position: 'absolute',
    top: 0,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderWidth: '80px 130px 0 130px',
    borderColor: 'rgba(255, 101, 132, 0.08) transparent transparent transparent',
  },
  envelopeSeal: {
    fontSize: '36px',
    zIndex: 2,
    animation: 'floatBackground 4s ease-in-out infinite',
  },
  envelopeText: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    marginTop: '10px',
    fontWeight: '500',
    zIndex: 2,
  },
  letterCard: {
    width: '100%',
    padding: '30px',
    textAlign: 'left',
    position: 'relative',
  },
  closeLetterBtn: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '18px',
    cursor: 'pointer',
  },
  letterHeader: {
    fontFamily: 'var(--serif-font)',
    fontSize: '24px',
    color: 'white',
    marginBottom: '20px',
  },
  letterBody: {
    fontSize: '14px',
    color: 'var(--text-light)',
    lineHeight: '1.7',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  letterSignature: {
    fontFamily: 'var(--serif-font)',
    fontSize: '16px',
    marginTop: '20px',
    lineHeight: '1.4',
  },
  resetBtn: {
    background: 'none',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: 'var(--text-muted)',
    padding: '8px 16px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '12px',
    marginTop: '30px',
    display: 'block',
    width: 'fit-content',
    marginInline: 'auto 0',
    transition: 'all 0.3s ease',
  },
  confettiPiece: {
    position: 'absolute',
    top: '-20px',
    zIndex: 99,
    animationName: 'confettiFall',
    animationTimingFunction: 'linear',
    animationIterationCount: '1',
    animationFillMode: 'forwards',
  },
};

export default SurpriseBox;
