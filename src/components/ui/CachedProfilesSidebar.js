'use client';

import React, { useState, useEffect } from 'react';

export default function CachedProfilesSidebar({ onProfileSelect, currentUsername }) {
  const [cachedProfiles, setCachedProfiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch cached profiles from MongoDB
  const fetchCachedProfiles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cached-profiles');
      if (response.ok) {
        const data = await response.json();
        setCachedProfiles(data.profiles || []);
      }
    } catch (error) {
      console.error('Failed to fetch cached profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCachedProfiles();
  }, []);

  // Filter profiles based on search term
  const filteredProfiles = cachedProfiles.filter(profile =>
    profile.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProfileClick = (username) => {
    onProfileSelect(username);
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="w-80 h-full bg-gray-900/80 backdrop-blur-xl border-l border-gray-700/50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <h3 className="text-lg font-semibold text-white">Cached Profiles</h3>
          <span className="bg-red-600/20 text-red-400 text-xs px-2 py-1 rounded-full">
            {cachedProfiles.length}
          </span>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search cached profiles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 text-sm"
          />
          <div className="absolute right-2 top-2.5">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        {/* Refresh Button */}
        <button
          onClick={fetchCachedProfiles}
          disabled={loading}
          className="w-full mt-2 bg-gray-800/50 hover:bg-gray-700/50 disabled:opacity-50 text-gray-300 text-xs py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg 
            className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Profiles List */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-red-500 border-t-transparent"></div>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {searchTerm ? (
              <>
                <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-sm">No profiles found matching "{searchTerm}"</p>
              </>
            ) : (
              <>
                <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-sm">No cached profiles yet</p>
                <p className="text-xs mt-1">Search profiles to build cache</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredProfiles.map((profile) => (
              <div
                key={profile.username}
                onClick={() => handleProfileClick(profile.username)}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                  currentUsername === profile.username
                    ? 'bg-red-600/20 border-red-500/50 hover:bg-red-600/30'
                    : 'bg-gray-800/50 border-gray-700/30 hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Profile Avatar */}
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {profile.username[0].toUpperCase()}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-white font-medium text-sm truncate">
                        @{profile.username}
                      </h4>
                      {currentUsername === profile.username && (
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                      <span>{formatTimeAgo(profile.lastAccessed)}</span>
                      <span className="bg-gray-700/50 px-2 py-0.5 rounded">
                        {profile.accessCount || 1}x
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Quick Stats */}
                {profile.profileData && (
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-2 pt-2 border-t border-gray-700/30">
                    <span>
                      {profile.profileData.followers ? 
                        `${(profile.profileData.followers / 1000000).toFixed(1)}M` : 
                        'N/A'
                      } followers
                    </span>
                    <span>
                      {profile.posts ? profile.posts.length : 0} posts
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}