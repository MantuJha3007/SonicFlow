'use client';

import React, { useEffect } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Music,
  ChevronDown,
  Maximize2,
  Disc,
  Sparkles
} from 'lucide-react';

export default function AudioPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isExpanded,
    openExpanded,
    closeExpanded,
    toggleExpanded,
    togglePlay,
    handleNext,
    handlePrev,
    seek,
    changeVolume,
    toggleMute,
    queue,
    currentIndex
  } = usePlayer();

  // Close expanded view on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isExpanded) {
        closeExpanded();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded, closeExpanded]);

  if (!currentTrack) return null;

  const formatTime = (time) => {
    if (isNaN(time) || time === null) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleProgressChange = (e) => {
    seek(Number(e.target.value));
  };

  const handleVolumeChange = (e) => {
    changeVolume(Number(e.target.value));
  };

  // Generate a procedural seed-based background gradient for album art fallback
  const getArtGradient = (title = '') => {
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue1 = Math.abs(hash % 360);
    const hue2 = (hue1 + 120) % 360;
    return `linear-gradient(135deg, hsl(${hue1}, 70%, 50%) 0%, hsl(${hue2}, 80%, 40%) 100%)`;
  };

  return (
    <>
      {/* ── 1. Mini Bottom Audio Player Bar ── */}
      <div className="audio-player-bar glass-panel fade-in">
        {/* Left: Track Info & Click to Expand */}
        <div 
          className="track-info-section clickable-track-info" 
          onClick={openExpanded}
          title="Click to expand song view"
        >
          <div 
            className={`vinyl-art-container ${isPlaying ? 'playing' : ''}`}
            style={{ 
              background: currentTrack.coverArt ? 'transparent' : getArtGradient(currentTrack.title) 
            }}
          >
            {currentTrack.coverArt ? (
              <img 
                src={currentTrack.coverArt} 
                alt={currentTrack.title} 
                className="mini-cover-img" 
              />
            ) : isPlaying ? (
              <div className="vinyl-record animate-spin-slow">
                <div className="vinyl-center" />
              </div>
            ) : (
              <Music size={22} className="fallback-art-icon" />
            )}
          </div>
          
          <div className="track-details">
            <span className="track-title">{currentTrack.title}</span>
            <span className="track-artist">
              {currentTrack.artist?.username || 'Unknown Artist'}
            </span>
          </div>
        </div>

        {/* Center: Playback Controls */}
        <div className="playback-controls-section">
          <div className="control-buttons">
            <button 
              onClick={handlePrev} 
              className="control-btn" 
              disabled={queue.length <= 1}
              title="Previous Track"
            >
              <SkipBack size={20} />
            </button>
            
            <button 
              onClick={togglePlay} 
              className="play-pause-btn"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause size={22} fill="currentColor" />
              ) : (
                <Play size={22} fill="currentColor" style={{ marginLeft: '2px' }} />
              )}
            </button>

            <button 
              onClick={handleNext} 
              className="control-btn" 
              disabled={queue.length <= 1}
              title="Next Track"
            >
              <SkipForward size={20} />
            </button>
          </div>

          <div className="progress-bar-container">
            <span className="time-text">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleProgressChange}
              className="progress-slider"
            />
            <span className="time-text">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Volume & Expand Control */}
        <div className="volume-controls-section">
          <button onClick={toggleMute} className="volume-btn" title={isMuted ? 'Unmute' : 'Mute'}>
            {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="volume-slider"
          />

          <button 
            onClick={openExpanded} 
            className="expand-player-btn"
            title="Expand full song view"
          >
            <Maximize2 size={18} />
          </button>
        </div>
      </div>

      {/* ── 2. Full-Screen / Modal Expanded Song View ── */}
      {isExpanded && (
        <div className="expanded-player-overlay fade-in">
          {/* Ambient Glow Backdrop */}
          <div 
            className="expanded-ambient-backdrop"
            style={{
              backgroundImage: currentTrack.coverArt 
                ? `url(${currentTrack.coverArt})` 
                : getArtGradient(currentTrack.title)
            }}
          />

          <div className="expanded-player-inner">
            {/* Header: Minimize Button & Status */}
            <div className="expanded-header">
              <button 
                onClick={closeExpanded} 
                className="expanded-minimize-btn"
                title="Minimize player (keep playing in background)"
              >
                <ChevronDown size={28} />
              </button>

              <div className="expanded-header-info">
                <span className="expanded-tag">
                  <Sparkles size={13} style={{ color: 'var(--secondary)' }} />
                  NOW PLAYING
                </span>
                <span className="expanded-queue-info">
                  {queue.length > 1 ? `Track ${currentIndex + 1} of ${queue.length}` : 'SonicFlow Studio'}
                </span>
              </div>

              <div style={{ width: '40px' }} /> {/* Spacer to balance layout */}
            </div>

            {/* Artwork Showcase */}
            <div className="expanded-showcase">
              <div 
                className={`expanded-art-card ${isPlaying ? 'playing' : ''}`}
                style={{
                  background: currentTrack.coverArt ? 'transparent' : getArtGradient(currentTrack.title)
                }}
              >
                {currentTrack.coverArt ? (
                  <img 
                    src={currentTrack.coverArt} 
                    alt={currentTrack.title} 
                    className="expanded-art-img" 
                  />
                ) : (
                  <div className="expanded-art-disc-placeholder">
                    <Disc size={80} style={{ opacity: 0.25 }} />
                  </div>
                )}

                {/* Spinning vinyl disc element peeking on playback */}
                <div className={`expanded-spinning-vinyl ${isPlaying ? 'active' : ''}`}>
                  <div className="vinyl-center" />
                </div>
              </div>
            </div>

            {/* Track Title & Artist Metadata */}
            <div className="expanded-track-meta">
              <h1 className="expanded-title">{currentTrack.title}</h1>
              <p className="expanded-artist">
                {currentTrack.artist?.username || 'Unknown Artist'}
                {currentTrack.artist?.email && (
                  <span className="expanded-artist-email"> • {currentTrack.artist.email}</span>
                )}
              </p>
            </div>

            {/* Interactive Scrubber & Duration Control */}
            <div className="expanded-scrubber-section">
              <div className="expanded-slider-wrapper">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleProgressChange}
                  className="expanded-progress-slider"
                />
              </div>
              <div className="expanded-time-row">
                <span className="expanded-time-text">{formatTime(currentTime)}</span>
                <span className="expanded-time-text">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Center Playback Controls */}
            <div className="expanded-controls-row">
              <button 
                onClick={handlePrev} 
                className="expanded-ctrl-btn"
                disabled={queue.length <= 1}
                title="Previous Track"
              >
                <SkipBack size={26} />
              </button>

              <button 
                onClick={togglePlay} 
                className="expanded-play-btn"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause size={34} fill="currentColor" />
                ) : (
                  <Play size={34} fill="currentColor" style={{ marginLeft: '4px' }} />
                )}
              </button>

              <button 
                onClick={handleNext} 
                className="expanded-ctrl-btn"
                disabled={queue.length <= 1}
                title="Next Track"
              >
                <SkipForward size={26} />
              </button>
            </div>

            {/* Volume & Bottom Actions */}
            <div className="expanded-bottom-bar">
              <div className="expanded-volume-control">
                <button onClick={toggleMute} className="expanded-volume-btn" title={isMuted ? 'Unmute' : 'Mute'}>
                  {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="expanded-volume-slider"
                />
              </div>

              <div className="expanded-minimize-hint" onClick={closeExpanded}>
                <span>Minimize to browse other songs ⌄</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
