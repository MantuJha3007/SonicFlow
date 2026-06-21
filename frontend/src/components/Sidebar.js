'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Home, 
  Music, 
  Disc, 
  UploadCloud, 
  FolderPlus, 
  LogOut, 
  User,
  Radio
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();

  if (!user) return null;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'tracks', label: 'Library', icon: Music },
    { id: 'albums', label: 'Albums', icon: Disc },
  ];

  const artistItems = [
    { id: 'upload', label: 'Upload Track', icon: UploadCloud },
    { id: 'create-album', label: 'Create Album', icon: FolderPlus },
  ];

  return (
    <aside className="sidebar-container glass-panel">
      <div className="logo-section">
        <Radio className="logo-icon" />
        <span className="logo-text">SonicFlow</span>
      </div>

      <nav className="nav-menu">
        <div className="menu-group">
          <span className="menu-label">Discover</span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {user.role === 'artist' && (
          <div className="menu-group">
            <span className="menu-label">Artist Studio</span>
            {artistItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </nav>

      <div className="user-profile-section">
        <div className="profile-details">
          <div className="avatar">
            <User size={18} />
          </div>
          <div className="user-info">
            <span className="username">{user.username}</span>
            <span className={`role-badge ${user.role}`}>
              {user.role}
            </span>
          </div>
        </div>
        <button onClick={logout} className="logout-btn" title="Log Out">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
