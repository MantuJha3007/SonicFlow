'use client';

import React from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Music 
} from 'lucide-react';

export default function AudioPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlay,
    handleNext,
    handlePrev,
    seek,
    changeVolume,
    toggleMute,
    queue
  } = usePlayer();

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

  // Generate a procedural seed-based background gradient for album art
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
    <div className="audio-player-bar glass-panel fade-in">
      {/* Left: Track Info */}
      <div className="track-info-section">
        <div 
          className={`vinyl-art-container ${isPlaying ? 'playing' : ''}`}
          style={{ background: getArtGradient(currentTrack.title) }}
        >
          {isPlaying ? (
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
            {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" style={{ marginLeft: '2px' }} />}
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

      {/* Right: Volume Controls */}
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
      </div>
    </div>
  );
}
