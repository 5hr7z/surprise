import React, { useState, useEffect } from 'react';
import statsData from '../assets/stats-data.json';
import knowledgeGraph from '../assets/knowledge_graph.json';

function StoryWrapped() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 9;
  const slideDuration = 8000;

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, slideDuration);
    return () => clearTimeout(timer);
  }, [currentSlide]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const getPercentage = (part, total) => {
    return Math.round((part / total) * 100);
  };

  const shrutiCount = statsData.user_stats.Shruti.message_count;
  const harveyCount = statsData.user_stats["Harvey Deason"].message_count;
  const combinedCount = shrutiCount + harveyCount;

  const shrutiEmojis = statsData.user_stats.Shruti.top_emojis.slice(0, 5);
  const harveyEmojis = statsData.user_stats["Harvey Deason"].top_emojis.slice(0, 5);

  const shrutiPhotos = statsData.media_omitted_counts.Shruti;
  const harveyPhotos = statsData.media_omitted_counts["Harvey Deason"];
  
  const shrutiFirst = statsData.initiator_stats.Shruti;
  const harveyFirst = statsData.initiator_stats["Harvey Deason"];

  return (
    <div style={styles.container}>
      <div className="disco-bg" />

      <div style={styles.progressBarContainer}>
        {Array.from({ length: totalSlides }).map((_, idx) => (
          <div key={idx} style={styles.progressTrack}>
            <div
              className={idx === currentSlide ? "progress-anim" : ""}
              style={{
                ...styles.progressFill,
                width: idx < currentSlide ? '100%' : '0%',
                animationDuration: `${slideDuration}ms`
              }}
            />
          </div>
        ))}
      </div>

      <div style={styles.slideArea}>
        {currentSlide === 0 && (
          <div className="spotify-story-card" style={styles.coverCard}>
            <span style={styles.tag}>#WRAPPED</span>
            <h1 className="spotify-bold-title">Our Year<br /><span className="spotify-neon-text">Wrapped</span></h1>
            <p style={styles.subtitle}>The story of us, told in {statsData.total_messages.toLocaleString()} texts.</p>
            <div style={styles.giantStatGlow}>
              <span style={styles.giantStat}>1 Year</span>
              <span style={styles.giantStatLabel}>Of loving you ❤️</span>
            </div>
          </div>
        )}

        {currentSlide === 1 && (
          <div className="spotify-story-card">
            <div>
              <span style={styles.tag}>THE YAPPER RATIO</span>
              <h2 className="spotify-bold-title">Who yaps the most?</h2>
            </div>
            
            <div style={styles.chartContainer}>
              <div style={styles.chartRow}>
                <div style={styles.chartHeader}>
                  <span style={styles.chartLabel}>Shruti</span>
                  <span style={styles.chartValue}>{shrutiCount.toLocaleString()} ({getPercentage(shrutiCount, combinedCount)}%)</span>
                </div>
                <div style={styles.barContainer}>
                  <div style={{ ...styles.bar, width: `${getPercentage(shrutiCount, combinedCount)}%`, background: '#ff007f' }} />
                </div>
              </div>

              <div style={styles.chartRow}>
                <div style={styles.chartHeader}>
                  <span style={styles.chartLabel}>Harvey</span>
                  <span style={styles.chartValue}>{harveyCount.toLocaleString()} ({getPercentage(harveyCount, combinedCount)}%)</span>
                </div>
                <div style={styles.barContainer}>
                  <div style={{ ...styles.bar, width: `${getPercentage(harveyCount, combinedCount)}%`, background: '#1db954' }} />
                </div>
              </div>
            </div>

            <p style={styles.commentary}>
              Looks like someone loves talking just a little bit more 😏
            </p>
          </div>
        )}

        {currentSlide === 2 && (
          <div className="spotify-story-card" style={styles.centeredCard}>
            <span style={styles.tag}>THE OBSESSIONS</span>
            <h2 className="spotify-bold-title">What did we even talk about?</h2>
            <div style={styles.topicsGrid}>
              <div style={styles.topicCard}>
                <span style={styles.topicIcon}>💼</span>
                <span style={styles.topicTitle}>Work</span>
                <span style={styles.topicCount}>5,494x</span>
              </div>
              <div style={styles.topicCard}>
                <span style={styles.topicIcon}>💊</span>
                <span style={styles.topicTitle}>Health</span>
                <span style={styles.topicCount}>5,037x</span>
              </div>
              <div style={styles.topicCard}>
                <span style={styles.topicIcon}>🍿</span>
                <span style={styles.topicTitle}>Movies</span>
                <span style={styles.topicCount}>4,702x</span>
              </div>
              <div style={styles.topicCard}>
                <span style={styles.topicIcon}>🍕</span>
                <span style={styles.topicTitle}>Food</span>
                <span style={styles.topicCount}>3,542x</span>
              </div>
            </div>
            <p style={styles.commentary}>
              Basically, we complain about work, check if we're dying, watch movies, and eat. Peak relationship goals.
            </p>
          </div>
        )}

        {currentSlide === 3 && (
          <div className="spotify-story-card" style={styles.centeredCard}>
            <span style={styles.tag}>THE 'BABE' COUNTER</span>
            <h2 className="spotify-bold-title">Are you guys okay?</h2>
            <div style={styles.giantStatGlow}>
              <span style={{...styles.giantStat, color: '#ff007f'}}>9,991</span>
              <span style={styles.giantStatLabel}>Times you called each other "babe"</span>
            </div>
            <div style={styles.splitStats}>
              <div style={styles.splitBox}>
                <span style={styles.splitName}>Shruti</span>
                <span style={styles.splitCount}>5,660x</span>
              </div>
              <div style={styles.splitBox}>
                <span style={styles.splitName}>Harvey</span>
                <span style={styles.splitCount}>4,331x</span>
              </div>
            </div>
            <p style={styles.commentary}>
              That's literally 27 "babes" per day. Disgustingly cute. 🤢❤️
            </p>
          </div>
        )}

        {currentSlide === 4 && (
          <div className="spotify-story-card" style={styles.centeredCard}>
            <span style={styles.tag}>THE PHOTOGRAPHER</span>
            <h2 className="spotify-bold-title">Who sent more pics?</h2>
            <div style={styles.splitStats}>
              <div style={styles.splitBox}>
                <span style={styles.topicIcon}>📸</span>
                <span style={styles.splitName}>Shruti</span>
                <span style={styles.splitCount}>{shrutiPhotos.toLocaleString()}</span>
              </div>
              <div style={styles.splitBox}>
                <span style={styles.topicIcon}>📸</span>
                <span style={styles.splitName}>Harvey</span>
                <span style={styles.splitCount}>{harveyPhotos.toLocaleString()}</span>
              </div>
            </div>
            <p style={styles.commentary}>
              Harvey loves showing off what he's doing 😂
            </p>
          </div>
        )}

        {currentSlide === 5 && (
          <div className="spotify-story-card" style={styles.centeredCard}>
            <span style={styles.tag}>THE INITIATOR</span>
            <h2 className="spotify-bold-title">Who texts first in the morning?</h2>
            <div style={styles.splitStats}>
              <div style={styles.splitBox}>
                <span style={styles.topicIcon}>🌅</span>
                <span style={styles.splitName}>Shruti</span>
                <span style={styles.splitCount}>{shrutiFirst}x</span>
              </div>
              <div style={styles.splitBox}>
                <span style={styles.topicIcon}>🌅</span>
                <span style={styles.splitName}>Harvey</span>
                <span style={styles.splitCount}>{harveyFirst}x</span>
              </div>
            </div>
            <p style={styles.commentary}>
              Harvey is definitely the morning person in this relationship.
            </p>
          </div>
        )}

        {currentSlide === 6 && (
          <div className="spotify-story-card" style={styles.centeredCard}>
            <span style={styles.tag}>THE EMOJI AWARDS</span>
            <h2 className="spotify-bold-title">Your most used emojis</h2>
            <div style={styles.emojisFlex}>
              <div style={styles.emojiColumn}>
                <div style={styles.emojiColHeader}>Shruti</div>
                {shrutiEmojis.map((e, i) => (
                  <div key={i} style={styles.emojiRow}>
                    <span style={styles.emojiIcon}>{e.emoji}</span>
                    <span style={styles.emojiCount}>{e.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div style={styles.emojiColumn}>
                <div style={styles.emojiColHeader}>Harvey</div>
                {harveyEmojis.map((e, i) => (
                  <div key={i} style={styles.emojiRow}>
                    <span style={styles.emojiIcon}>{e.emoji}</span>
                    <span style={styles.emojiCount}>{e.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            <p style={styles.commentary}>
              Who cries laughing this much?! You two are literally unhinged 😂
            </p>
          </div>
        )}

        {currentSlide === 7 && (
          <div className="spotify-story-card" style={styles.centeredCard}>
            <span style={styles.tag}>NIGHT OWLS</span>
            <h2 className="spotify-bold-title">When do you text?</h2>
            <div style={styles.hourlyList}>
              <div style={styles.hourItem}>
                <span style={styles.hourTime}>11:00 PM</span>
                <span style={styles.hourCount}>34,860 messages</span>
                <span style={styles.hourTag}>Peak</span>
              </div>
              <div style={styles.hourItem}>
                <span style={styles.hourTime}>10:00 PM</span>
                <span style={styles.hourCount}>25,549 messages</span>
              </div>
            </div>
            <p style={styles.commentary}>
              Ah yes, 11 PM. When the deep conversations (and the crazy emojis) finally come out to play. 🌚
            </p>
          </div>
        )}

        {currentSlide === 8 && (
          <div className="spotify-story-card" style={styles.centeredCard}>
            <span style={styles.tag}>THE L WORD</span>
            <h2 className="spotify-bold-title">Love is in the air</h2>
            <div style={styles.giantStatGlow}>
              <span style={{...styles.giantStat, color: '#1db954'}}>1,853</span>
              <span style={styles.giantStatLabel}>Times you said "I Love You" to each other</span>
            </div>
            <p style={styles.commentary} className="spotify-neon-text">
              Every single one meant it.
            </p>
          </div>
        )}
      </div>

      <div style={styles.navAreaLeft} onClick={handlePrev}></div>
      <div style={styles.navAreaRight} onClick={handleNext}></div>
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #121212 0%, #000000 100%)',
    overflow: 'hidden',
    fontFamily: "'Inter', sans-serif",
  },
  progressBarContainer: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    right: '20px',
    display: 'flex',
    gap: '6px',
    zIndex: 10,
  },
  progressTrack: {
    flex: 1,
    height: '4px',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: '#fff',
    borderRadius: '2px',
  },
  slideArea: {
    position: 'absolute',
    top: '40px',
    left: 0,
    right: 0,
    bottom: '80px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
  },
  coverCard: {
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: '40px 20px',
  },
  centeredCard: {
    alignItems: 'center',
    textAlign: 'center',
  },
  tag: {
    fontSize: '12px',
    fontWeight: '900',
    letterSpacing: '2px',
    color: '#1db954',
    marginBottom: '20px',
  },
  subtitle: {
    fontSize: '18px',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: '10px',
  },
  giantStatGlow: {
    margin: '30px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'radial-gradient(circle, rgba(29, 185, 84, 0.2) 0%, transparent 70%)',
    padding: '40px',
    borderRadius: '50%',
  },
  giantStat: {
    fontSize: '72px',
    fontWeight: '900',
    color: 'white',
    lineHeight: '1',
    textShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
  },
  giantStatLabel: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#b3b3b3',
    marginTop: '10px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  chartContainer: {
    margin: '40px 0',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  chartRow: {
    width: '100%',
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  chartLabel: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'white',
  },
  chartValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--spotify-light-gray)',
  },
  barContainer: {
    width: '100%',
    height: '24px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: '12px',
  },
  topicsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    width: '100%',
    marginTop: '30px',
    marginBottom: '30px',
  },
  topicCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  topicIcon: {
    fontSize: '32px',
  },
  topicTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'white',
    textTransform: 'uppercase',
  },
  topicCount: {
    fontSize: '18px',
    fontWeight: '900',
    color: '#1db954',
  },
  splitStats: {
    display: 'flex',
    gap: '20px',
    width: '100%',
    margin: '30px 0',
  },
  splitBox: {
    flex: 1,
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '30px 20px',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  splitName: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#b3b3b3',
    textTransform: 'uppercase',
  },
  splitCount: {
    fontSize: '24px',
    fontWeight: '900',
    color: 'white',
  },
  emojisFlex: {
    display: 'flex',
    gap: '20px',
    width: '100%',
    margin: '30px 0',
  },
  emojiColumn: {
    flex: 1,
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  emojiColHeader: {
    fontSize: '16px',
    fontWeight: '900',
    color: 'white',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    paddingBottom: '10px',
    textAlign: 'center',
  },
  emojiRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emojiIcon: {
    fontSize: '28px',
  },
  emojiCount: {
    fontSize: '16px',
    color: '#b3b3b3',
    fontWeight: '700',
  },
  hourlyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
    margin: '30px 0',
  },
  hourItem: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hourTime: {
    fontSize: '20px',
    fontWeight: '900',
    color: 'white',
  },
  hourCount: {
    fontSize: '16px',
    color: '#b3b3b3',
    fontWeight: '600',
  },
  hourTag: {
    fontSize: '12px',
    fontWeight: '900',
    color: 'black',
    background: '#1db954',
    padding: '6px 12px',
    borderRadius: '12px',
    textTransform: 'uppercase',
  },
  commentary: {
    fontSize: '18px',
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: '1.4',
    padding: '0 20px',
  },
  navAreaLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '30%',
    height: '100%',
    zIndex: 20,
    cursor: 'pointer',
  },
  navAreaRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '70%',
    height: '100%',
    zIndex: 20,
    cursor: 'pointer',
  },
};

export default StoryWrapped;
