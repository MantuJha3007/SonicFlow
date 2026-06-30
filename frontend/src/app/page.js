'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePlayer } from '@/context/PlayerContext';
import Sidebar from '@/components/Sidebar';
import AudioPlayer from '@/components/AudioPlayer';
import { 
  Play, 
  Pause, 
  Music, 
  Disc, 
  UploadCloud, 
  FolderPlus, 
  ChevronRight, 
  ArrowLeft,
  CheckCircle,
  FileAudio,
  Plus
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { playTrack, playAlbum, currentTrack, isPlaying, togglePlay } = usePlayer();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Library & Album States
  const [tracks, setTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [loadingAlbums, setLoadingAlbums] = useState(false);
  const [loadingAlbumDetails, setLoadingAlbumDetails] = useState(false);

  // Upload States
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const uploadFileInputRef = useRef(null);

  // Album Creation States
  const [albumTitle, setAlbumTitle] = useState('');
  const [selectedTrackIds, setSelectedTrackIds] = useState([]);
  const [albumCreationError, setAlbumCreationError] = useState('');
  const [albumCreationSuccess, setAlbumCreationSuccess] = useState(false);
  const [creatingAlbum, setCreatingAlbum] = useState(false);

  // Fetch Tracks
  const fetchTracks = async () => {
    setLoadingTracks(true);
    try {
      const res = await fetch(`${API_URL}/api/music`);
      const data = await res.json();
      if (res.ok) {
        setTracks(data.musics || []);
      }
    } catch (err) {
      console.error('Error fetching tracks:', err);
    } finally {
      setLoadingTracks(false);
    }
  };

  // Fetch Albums
  const fetchAlbums = async () => {
    setLoadingAlbums(true);
    try {
      const res = await fetch(`${API_URL}/api/music/albums`);
      const data = await res.json();
      if (res.ok) {
        setAlbums(data.albums || []);
      }
    } catch (err) {
      console.error('Error fetching albums:', err);
    } finally {
      setLoadingAlbums(false);
    }
  };

  // Fetch Album Details by ID
  const fetchAlbumDetails = async (id) => {
    setLoadingAlbumDetails(true);
    try {
      const res = await fetch(`${API_URL}/api/music/albums/${id}`);
      const data = await res.json();
      if (res.ok) {
        setSelectedAlbum(data.album);
      }
    } catch (err) {
      console.error('Error fetching album details:', err);
    } finally {
      setLoadingAlbumDetails(false);
    }
  };

  // Run on mount
  useEffect(() => {
    if (user) {
      fetchTracks();
      fetchAlbums();
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="auth-page-container">
        <div className="animate-pulse-slow" style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
          Loading SonicFlow...
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Handle music upload
  const handleUploadSubmit = (e) => {
    e.preventDefault();
    setUploadError('');
    setUploadSuccess(false);
    setUploadProgress(0);

    if (!uploadTitle.trim()) {
      setUploadError('Please provide a title for the track');
      return;
    }
    if (!uploadFile) {
      setUploadError('Please select an audio file');
      return;
    }

    const formData = new FormData();
    formData.append('title', uploadTitle);
    formData.append('music', uploadFile);

    // Using XMLHttpRequest to display actual progress bar
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_URL}/api/music/upload`, true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 201) {
        setUploadSuccess(true);
        setUploadTitle('');
        setUploadFile(null);
        if (uploadFileInputRef.current) uploadFileInputRef.current.value = '';
        fetchTracks(); // refresh libraries
      } else {
        try {
          const response = JSON.parse(xhr.responseText);
          setUploadError(response.message || 'Upload failed');
        } catch {
          setUploadError('Upload failed. Please verify credentials/size.');
        }
      }
    };

    xhr.onerror = () => {
      setUploadError('Network error during upload');
    };

    xhr.send(formData);
  };

  // Handle Album creation
  const handleCreateAlbumSubmit = async (e) => {
    e.preventDefault();
    setAlbumCreationError('');
    setAlbumCreationSuccess(false);
    setCreatingAlbum(true);

    if (!albumTitle.trim()) {
      setAlbumCreationError('Album title is required');
      setCreatingAlbum(false);
      return;
    }

    if (selectedTrackIds.length === 0) {
      setAlbumCreationError('Please select at least one track to include in the album');
      setCreatingAlbum(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/music/album`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: albumTitle,
          musics: selectedTrackIds,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create album');
      }

      setAlbumCreationSuccess(true);
      setAlbumTitle('');
      setSelectedTrackIds([]);
      fetchAlbums();
    } catch (err) {
      setAlbumCreationError(err.message);
    } finally {
      setCreatingAlbum(false);
    }
  };

  // Handle track selection for album creation
  const handleTrackSelectToggle = (id) => {
    if (selectedTrackIds.includes(id)) {
      setSelectedTrackIds(selectedTrackIds.filter(tid => tid !== id));
    } else {
      setSelectedTrackIds([...selectedTrackIds, id]);
    }
  };

  // Generate procedural album cover color
  const getArtGradient = (title = '') => {
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue1 = Math.abs(hash % 360);
    const hue2 = (hue1 + 120) % 360;
    return `linear-gradient(135deg, hsl(${hue1}, 70%, 45%) 0%, hsl(${hue2}, 85%, 30%) 100%)`;
  };

  // Filter tracks to only show current artist's uploads (for album creation)
  const artistTracks = tracks.filter(t => t.artist?.id === user.id || t.artist?._id === user.id);

  // Time Greeting
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={(tab) => {
        setActiveTab(tab);
        setSelectedAlbum(null); // Clear active album detail on sidebar click
      }} />

      <main className="main-content">
        
        {/* ================== TAB: DASHBOARD ================== */}
        {activeTab === 'dashboard' && !selectedAlbum && (
          <div className="fade-in">
            <div className="dashboard-title-section">
              <h1>{getGreeting()}, {user.username} ✨</h1>
              <p className="dashboard-subtitle">
                {user.role === 'artist' 
                  ? 'Manage your releases, check studio metrics, and enjoy music.'
                  : 'Stream tracks, explore albums, and discover new creators.'
                }
              </p>
            </div>

            {/* Quick Actions / Info Cards */}
            <div className="grid-3">
              <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>Listen Now</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Jump straight into the library. Listen to recent user uploads.</p>
                <button 
                  onClick={() => setActiveTab('tracks')} 
                  className="btn-primary" 
                  style={{ width: 'fit-content', padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  Browse Tracks <ChevronRight size={14} />
                </button>
              </div>

              {user.role === 'artist' ? (
                <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--secondary)' }}>Artist Studio</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>You have uploaded {artistTracks.length} track(s). Launch a new release today.</p>
                  <button 
                    onClick={() => setActiveTab('upload')} 
                    className="btn-secondary" 
                    style={{ width: 'fit-content', padding: '8px 16px', fontSize: '0.85rem', borderColor: 'var(--secondary-rgb)' }}
                  >
                    Upload Track <UploadCloud size={14} />
                  </button>
                </div>
              ) : (
                <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--secondary)' }}>Support Artists</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Explore albums uploaded by creators. Check out the latest collaborations.</p>
                  <button 
                    onClick={() => setActiveTab('albums')} 
                    className="btn-secondary" 
                    style={{ width: 'fit-content', padding: '8px 16px', fontSize: '0.85rem' }}
                  >
                    Explore Albums <Disc size={14} />
                  </button>
                </div>
              )}

              <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--accent)' }}>Global Library</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Browse all public albums available on our server.</p>
                <button 
                  onClick={() => setActiveTab('albums')} 
                  className="btn-primary" 
                  style={{ width: 'fit-content', padding: '8px 16px', fontSize: '0.85rem', background: 'linear-gradient(135deg, var(--accent) 0%, #a20056 100%)', boxShadow: '0 4px 15px var(--accent-glow)' }}
                >
                  View Albums <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Dashboard Sub-Feeds */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px', marginTop: '20px' }}>
              <div>
                <h2 className="section-title">
                  <span>Recently Uploaded Tracks</span>
                  <button onClick={() => setActiveTab('tracks')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
                    See all
                  </button>
                </h2>
                {loadingTracks ? (
                  <div className="animate-pulse-slow" style={{ color: 'var(--text-muted)' }}>Loading library tracks...</div>
                ) : tracks.length === 0 ? (
                  <div className="glass-card" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No tracks uploaded yet. {user.role === 'artist' && 'Be the first to upload one!'}
                  </div>
                ) : (
                  <div className="track-list-container">
                    {tracks.slice(0, 5).map((track, i) => {
                      const isActive = currentTrack?._id === track._id;
                      return (
                        <div 
                          key={track._id || i} 
                          className={`track-row ${isActive ? 'active' : ''}`}
                          onClick={() => playTrack(track, tracks)}
                        >
                          <div className="track-row-play">
                            {isActive && isPlaying ? (
                              <div className="animate-pulse-slow" style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '14px' }}>
                                <span style={{ width: '3px', height: '14px', background: 'var(--primary)', animation: 'pulse 1s infinite' }} />
                                <span style={{ width: '3px', height: '8px', background: 'var(--primary)', animation: 'pulse 0.7s infinite' }} />
                                <span style={{ width: '3px', height: '12px', background: 'var(--primary)', animation: 'pulse 1.3s infinite' }} />
                              </div>
                            ) : (
                              <Play size={16} fill={isActive ? 'var(--primary)' : 'none'} />
                            )}
                          </div>
                          <div className="track-row-details">
                            <span className="track-row-title">{track.title}</span>
                            <span className="track-row-artist">{track.artist?.username || 'Unknown Artist'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================== TAB: TRACKS (LIBRARY) ================== */}
        {activeTab === 'tracks' && !selectedAlbum && (
          <div className="fade-in">
            <div className="dashboard-title-section">
              <h1>Global Library</h1>
              <p className="dashboard-subtitle">Listen to user creations. Select any track to stream instantly.</p>
            </div>

            {loadingTracks ? (
              <div className="animate-pulse-slow" style={{ color: 'var(--text-muted)' }}>Loading music...</div>
            ) : tracks.length === 0 ? (
              <div className="empty-state glass-card">
                <Music size={48} className="empty-icon" />
                <h3>No Tracks Available</h3>
                <p>There are no uploaded songs in the system.</p>
                {user.role === 'artist' && (
                  <button onClick={() => setActiveTab('upload')} className="btn-primary">
                    Upload Your First Track
                  </button>
                )}
              </div>
            ) : (
              <div className="track-list-container">
                {tracks.map((track, i) => {
                  const isActive = currentTrack?._id === track._id;
                  return (
                    <div 
                      key={track._id || i} 
                      className={`track-row ${isActive ? 'active' : ''}`}
                      onClick={() => playTrack(track, tracks)}
                    >
                      <div className="track-row-play">
                        {isActive && isPlaying ? (
                          <Pause size={16} fill="var(--primary)" />
                        ) : (
                          <Play size={16} fill={isActive ? 'var(--primary)' : 'none'} />
                        )}
                      </div>
                      <div className="track-row-details">
                        <span className="track-row-title">{track.title}</span>
                        <span className="track-row-artist">{track.artist?.username || 'Unknown Artist'} ({track.artist?.email || ''})</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================== TAB: ALBUMS ================== */}
        {activeTab === 'albums' && !selectedAlbum && (
          <div className="fade-in">
            <div className="dashboard-title-section">
              <h1>Explore Albums</h1>
              <p className="dashboard-subtitle">Browse curated sets compiled by artists.</p>
            </div>

            {loadingAlbums ? (
              <div className="animate-pulse-slow" style={{ color: 'var(--text-muted)' }}>Loading albums...</div>
            ) : albums.length === 0 ? (
              <div className="empty-state glass-card">
                <Disc size={48} className="empty-icon" />
                <h3>No Albums Yet</h3>
                <p>No albums have been published yet.</p>
                {user.role === 'artist' && (
                  <button onClick={() => setActiveTab('create-album')} className="btn-primary">
                    Create Curated Album
                  </button>
                )}
              </div>
            ) : (
              <div className="grid-3">
                {albums.map((album, i) => (
                  <div 
                    key={album._id || i} 
                    className="glass-card album-card-item"
                    onClick={() => fetchAlbumDetails(album._id)}
                  >
                    <div 
                      className="album-cover-gradient"
                      style={{ background: getArtGradient(album.title) }}
                    >
                      <div className="album-cover-disc">
                        <Disc size={40} style={{ opacity: 0.2 }} />
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchAlbumDetails(album._id).then(() => {
                            if (album.musics && album.musics.length > 0) {
                              playAlbum(album.musics);
                            }
                          });
                        }}
                        className="play-overlay-btn"
                        title="Play Album"
                      >
                        <Play size={20} fill="currentColor" style={{ marginLeft: '2px' }} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className="album-title">{album.title}</span>
                      <span className="album-artist">by {album.artist?.username || 'Unknown Artist'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================== ALBUM DETAILS DETAIL VIEW ================== */}
        {selectedAlbum && (
          <div className="fade-in">
            <button 
              onClick={() => setSelectedAlbum(null)} 
              className="btn-secondary" 
              style={{ marginBottom: '30px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ArrowLeft size={16} /> Back to Albums
            </button>

            {loadingAlbumDetails ? (
              <div className="animate-pulse-slow" style={{ color: 'var(--text-muted)' }}>Fetching album tracks...</div>
            ) : (
              <>
                <div className="album-detail-header">
                  <div 
                    className="album-detail-cover" 
                    style={{ background: getArtGradient(selectedAlbum.title) }}
                  >
                    <div className="album-cover-disc">
                      <Disc size={64} style={{ opacity: 0.15 }} />
                    </div>
                  </div>
                  <div className="album-detail-meta">
                    <span className="album-detail-type">Album</span>
                    <h1 className="album-detail-title">{selectedAlbum.title}</h1>
                    <span className="album-detail-author">
                      Created by <strong style={{ color: '#fff' }}>{selectedAlbum.artist?.username || 'Unknown Artist'}</strong> ({selectedAlbum.artist?.email || ''}) • {selectedAlbum.musics?.length || 0} track(s)
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>Tracks</h3>
                  
                  {(!selectedAlbum.musics || selectedAlbum.musics.length === 0) ? (
                    <div className="glass-card" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      This album does not contain any tracks.
                    </div>
                  ) : (
                    <div className="track-list-container">
                      {selectedAlbum.musics.map((track, i) => {
                        const isActive = currentTrack?._id === track._id;
                        return (
                          <div 
                            key={track._id || i} 
                            className={`track-row ${isActive ? 'active' : ''}`}
                            onClick={() => playTrack(track, selectedAlbum.musics)}
                          >
                            <div className="track-row-play">
                              {isActive && isPlaying ? (
                                <Pause size={16} fill="var(--primary)" />
                              ) : (
                                <Play size={16} fill={isActive ? 'var(--primary)' : 'none'} />
                              )}
                            </div>
                            <div className="track-row-details">
                              <span className="track-row-title">{track.title}</span>
                              <span className="track-row-artist">{selectedAlbum.artist?.username || 'Artist'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ================== TAB: ARTIST UPLOAD ================== */}
        {activeTab === 'upload' && user.role === 'artist' && (
          <div className="fade-in">
            <div className="dashboard-title-section" style={{ textAlign: 'center' }}>
              <h1>Studio Control Room</h1>
              <p className="dashboard-subtitle">Upload high fidelity audio tracks directly to ImageKit cloud.</p>
            </div>

            <div className="glass-panel upload-form-card">
              {uploadSuccess && (
                <div className="upload-success-badge fade-in">
                  <CheckCircle size={20} />
                  <span>Track successfully published!</span>
                </div>
              )}

              {uploadError && (
                <div className="auth-error">
                  {uploadError}
                </div>
              )}

              <form onSubmit={handleUploadSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="trackTitle">
                    Track Title
                  </label>
                  <input
                    id="trackTitle"
                    type="text"
                    className="form-input"
                    placeholder="Enter track title"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    disabled={uploadProgress > 0 && uploadProgress < 100}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label">Audio File</label>
                  <div 
                    className={`upload-dropzone ${uploadFile ? 'has-file' : ''}`}
                    onClick={() => {
                      if (!(uploadProgress > 0 && uploadProgress < 100)) {
                        uploadFileInputRef.current.click();
                      }
                    }}
                  >
                    <input
                      type="file"
                      accept="audio/*"
                      ref={uploadFileInputRef}
                      onChange={(e) => setUploadFile(e.target.files[0] || null)}
                      className="file-input-hidden"
                    />
                    
                    {uploadFile ? (
                      <>
                        <FileAudio size={40} style={{ color: 'var(--secondary)' }} />
                        <span style={{ fontWeight: 600, color: '#fff' }}>{uploadFile.name}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB • Click to replace file
                        </span>
                      </>
                    ) : (
                      <>
                        <UploadCloud size={40} className="logo-icon" />
                        <span style={{ fontWeight: 600 }}>Click to choose or drag audio file</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Supports MP3, WAV, M4A up to 15MB
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {uploadProgress > 0 && (
                  <div className="upload-progress-container">
                    <div className="upload-progress-bar">
                      <div 
                        className="upload-progress-fill" 
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span>{uploadProgress === 100 ? 'Processing file...' : 'Uploading file...'}</span>
                      <span>{uploadProgress}%</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '20px' }}
                  disabled={uploadProgress > 0 && uploadProgress < 100}
                >
                  {uploadProgress > 0 && uploadProgress < 100 ? (
                    <span>Uploading...</span>
                  ) : (
                    <>
                      <UploadCloud size={18} />
                      <span>Publish Track</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================== TAB: CREATE ALBUM ================== */}
        {activeTab === 'create-album' && user.role === 'artist' && (
          <div className="fade-in">
            <div className="dashboard-title-section" style={{ textAlign: 'center' }}>
              <h1>Create Album</h1>
              <p className="dashboard-subtitle">Compile your uploaded audio tracks into an album.</p>
            </div>

            <div className="glass-panel upload-form-card">
              {albumCreationSuccess && (
                <div className="upload-success-badge fade-in">
                  <CheckCircle size={20} />
                  <span>Album successfully compiled and published!</span>
                </div>
              )}

              {albumCreationError && (
                <div className="auth-error">
                  {albumCreationError}
                </div>
              )}

              <form onSubmit={handleCreateAlbumSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="albumTitleInput">
                    Album Title
                  </label>
                  <input
                    id="albumTitleInput"
                    type="text"
                    className="form-input"
                    placeholder="Enter album title"
                    value={albumTitle}
                    onChange={(e) => setAlbumTitle(e.target.value)}
                    disabled={creatingAlbum}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Select Tracks (Select 1 or more)</label>
                  {loadingTracks ? (
                    <div className="animate-pulse-slow" style={{ color: 'var(--text-muted)' }}>Loading your studio tracks...</div>
                  ) : artistTracks.length === 0 ? (
                    <div style={{ padding: '16px', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.85rem' }}>
                      No tracks found! You must upload at least one track before compiling an album.
                    </div>
                  ) : (
                    <div className="album-track-picker">
                      {artistTracks.map((track, i) => (
                        <div 
                          key={track._id || i}
                          className="picker-item"
                          onClick={() => handleTrackSelectToggle(track._id)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedTrackIds.includes(track._id)}
                            onChange={() => {}} // Swallowed, handled on parent click
                            className="picker-checkbox"
                          />
                          <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem' }}>
                            <span style={{ fontWeight: 600, color: '#fff' }}>{track.title}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '30px' }}
                  disabled={creatingAlbum || artistTracks.length === 0}
                >
                  {creatingAlbum ? (
                    <span>Creating Album...</span>
                  ) : (
                    <>
                      <FolderPlus size={18} />
                      <span>Compile Album</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================== TAB: SETTINGS ================== */}
        {activeTab === 'settings' && (
          <div className="fade-in">
            <div className="dashboard-title-section">
              <h1>Settings</h1>
              <p className="dashboard-subtitle">Manage your account and view your information.</p>
            </div>
            
            <div className="glass-card" style={{ padding: '30px', maxWidth: '600px', marginTop: '20px' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'var(--primary)' }}>Account Information</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Username</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>{user.username}</div>
                </div>
                
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Email Address</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>{user.email}</div>
                </div>
                
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Account Type</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '500', textTransform: 'capitalize' }}>
                    <span className={`role-badge ${user.role}`} style={{ fontSize: '0.85rem', padding: '4px 10px' }}>
                      {user.role}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Status</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '500', color: 'var(--secondary)' }}>
                    Verified Account
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Sticky Bottom Audio Player Controls */}
      <AudioPlayer />
    </div>
  );
}
