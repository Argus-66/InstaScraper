import React, { useState, useEffect } from 'react';
import DemographicsBubbleChart from './ui/DemographicsBubbleChart';
import { useDemographics } from '../hooks/useDemographics';

const AnalyticsDashboard = ({ analytics, enhancedPosts = [], profileData = null }) => {
  // Use the demographics hook
  const { 
    demographics, 
    loading: demographicsLoading, 
    error: demographicsError,
    refetch: loadDemographics
  } = useDemographics(
    profileData?.username, 
    profileData?.followers
  );

  // Validate input data
  if (!enhancedPosts || !Array.isArray(enhancedPosts) || enhancedPosts.length === 0) {
    console.log('ℹ️ AnalyticsDashboard: No enhanced posts data available');
    return null;
  }

  // Calculate aggregated metrics from enhanced posts
  const calculateMetrics = () => {
    try {
    const totalEngagement = enhancedPosts.reduce((sum, post) => 
      sum + (post.postLikes || 0) + (post.postComments || 0), 0);
    
    const avgLikes = enhancedPosts.reduce((sum, post) => sum + (post.postLikes || 0), 0) / enhancedPosts.length;
    const avgComments = enhancedPosts.reduce((sum, post) => sum + (post.postComments || 0), 0) / enhancedPosts.length;
    
    // Collect all vibes and qualities
    const allVibes = enhancedPosts.flatMap(post => post.postVibe || []);
    const allQualities = enhancedPosts.flatMap(post => post.postQuality || []);
    
    // Count vibe frequencies
    const vibeFrequency = allVibes.reduce((acc, vibe) => {
      acc[vibe] = (acc[vibe] || 0) + 1;
      return acc;
    }, {});
    
    // Count quality frequencies
    const qualityFrequency = allQualities.reduce((acc, quality) => {
      acc[quality] = (acc[quality] || 0) + 1;
      return acc;
    }, {});
    
    // Get top vibes and qualities
    const topVibes = Object.entries(vibeFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([vibe, count]) => ({ vibe, count }));
      
    const topQualities = Object.entries(qualityFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([quality, count]) => ({ quality, count }));

    // Analyze image level data
    const allMoods = enhancedPosts
      .map(post => post.imageLevelAnalysis?.mood)
      .filter(Boolean);
      
    const allColors = enhancedPosts
      .flatMap(post => post.imageLevelAnalysis?.colors || []);
      
    const colorFrequency = allColors.reduce((acc, color) => {
      acc[color] = (acc[color] || 0) + 1;
      return acc;
    }, {});
    
    const topColors = Object.entries(colorFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .map(([color, count]) => ({ color, count }));

    return {
      totalEngagement,
      avgLikes: Math.round(avgLikes),
      avgComments: Math.round(avgComments),
      topVibes,
      topQualities,
      allMoods,
      topColors
    };
    } catch (error) {
      console.error('❌ Error calculating metrics in AnalyticsDashboard:', error);
      // Return fallback metrics
      return {
        totalEngagement: 0,
        avgLikes: 0,
        avgComments: 0,
        topVibes: [],
        topQualities: [],
        allMoods: [],
        topColors: []
      };
    }
  };

  const metrics = calculateMetrics();

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <h2 className="text-2xl font-bold text-white">AI Intelligence Hub</h2>
        <span className="bg-gradient-to-r from-red-600 to-red-700 text-white text-sm px-3 py-1 rounded-full border border-red-500/30">
          🧠 Powered by AI
        </span>
      </div>

      {/* Enhanced Main Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            
            {/* Total Engagement */}
            <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl rounded-xl p-4 border border-gray-700/50 hover:border-red-500/40 transition-all duration-300 group hover:scale-105">
              <div className="flex flex-col items-center text-center space-y-2">
                <span className="text-4xl group-hover:scale-110 transition-transform duration-300">🚀</span>
                <div className="text-2xl font-bold text-green-400">{formatNumber(metrics.totalEngagement)}</div>
                <div className="text-sm font-semibold text-white">Total Reach</div>
                <div className="text-xs text-gray-400 leading-tight">Combined likes and comments across all posts</div>
              </div>
            </div>

            {/* Average Likes */}
            <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl rounded-xl p-4 border border-gray-700/50 hover:border-red-500/40 transition-all duration-300 group hover:scale-105">
              <div className="flex flex-col items-center text-center space-y-2">
                <span className="text-4xl group-hover:scale-110 transition-transform duration-300">❤️</span>
                <div className="text-2xl font-bold text-red-400">{formatNumber(metrics.avgLikes)}</div>
                <div className="text-sm font-semibold text-white">Avg Likes</div>
                <div className="text-xs text-gray-400 leading-tight">Average likes received per post</div>
              </div>
            </div>

            {/* Average Comments */}
            <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl rounded-xl p-4 border border-gray-700/50 hover:border-red-500/40 transition-all duration-300 group hover:scale-105">
              <div className="flex flex-col items-center text-center space-y-2">
                <span className="text-4xl group-hover:scale-110 transition-transform duration-300">💬</span>
                <div className="text-2xl font-bold text-blue-400">{formatNumber(metrics.avgComments)}</div>
                <div className="text-sm font-semibold text-white">Avg Comments</div>
                <div className="text-xs text-gray-400 leading-tight">Average comments received per post</div>
              </div>
            </div>

            {/* Posts Analyzed */}
            <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl rounded-xl p-4 border border-gray-700/50 hover:border-red-500/40 transition-all duration-300 group hover:scale-105">
              <div className="flex flex-col items-center text-center space-y-2">
                <span className="text-4xl group-hover:scale-110 transition-transform duration-300">📊</span>
                <div className="text-2xl font-bold text-purple-400">{enhancedPosts.length}</div>
                <div className="text-sm font-semibold text-white">Posts Analyzed</div>
                <div className="text-xs text-gray-400 leading-tight">Total posts scanned and analyzed by AI</div>
              </div>
            </div>

          </div>

          {/* Compact Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            
            {/* Content Patterns - Enhanced */}
            <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl rounded-xl p-5 border border-gray-700/50 hover:border-red-500/40 transition-all duration-300">
              <h3 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
                <span>✨</span>
                <span>Content Patterns</span>
              </h3>
              <div className="space-y-3">
                {metrics.topVibes.slice(0, 4).map(({ vibe, count }, index) => (
                  <div key={vibe} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-200 capitalize font-medium">{vibe}</span>
                      <span className="text-red-400 font-bold">{count}</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-red-500 to-red-400 h-3 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-red-500/30" 
                        style={{ width: `${Math.max((count / enhancedPosts.length) * 100, 15)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Excellence Metrics - Enhanced */}
            <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl rounded-xl p-5 border border-gray-700/50 hover:border-red-500/40 transition-all duration-300">
              <h3 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
                <span>⭐</span>
                <span>Excellence Metrics</span>
              </h3>
              <div className="space-y-3">
                {metrics.topQualities.slice(0, 4).map(({ quality, count }, index) => (
                  <div key={quality} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-200 capitalize font-medium">{quality}</span>
                      <span className="text-green-400 font-bold">{count}</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-green-500/30" 
                        style={{ width: `${Math.max((count / enhancedPosts.length) * 100, 15)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Palette - Enhanced */}
            <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl rounded-xl p-5 border border-gray-700/50 hover:border-red-500/40 transition-all duration-300">
              <h3 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
                <span>🎨</span>
                <span>Visual Palette</span>
              </h3>
              <div className="space-y-3">
                {metrics.topColors.slice(0, 4).map(({ color, count }, index) => (
                  <div key={color} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded-full border-2 border-gray-500 shadow-md flex-shrink-0"
                          style={{ backgroundColor: color.includes('#') ? color : `var(--${color}, #6B7280)` }}
                        ></div>
                        <span className="text-gray-200 capitalize font-medium">{color}</span>
                      </div>
                      <span className="text-purple-400 font-bold">{count}</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden ml-6">
                      <div 
                        className="h-3 rounded-full transition-all duration-1000 ease-out shadow-lg"
                        style={{ 
                          width: `${Math.max((count / enhancedPosts.length) * 100, 15)}%`,
                          background: `linear-gradient(to right, ${color.includes('#') ? color : '#8B5CF6'}, ${color.includes('#') ? color + '80' : '#A855F7'})`
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Content Mood - Full Width */}
          {metrics.allMoods.length > 0 && (
            <div className="bg-gray-800/40 backdrop-blur-xl rounded-lg p-6 border border-gray-700/50 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <span>😊</span>
                <span>Emotional Insights</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {[...new Set(metrics.allMoods)].map((mood, index) => (
                  <span 
                    key={mood} 
                    className="bg-amber-600/20 text-amber-300 px-3 py-1 rounded-full text-sm border border-amber-500/30"
                  >
                    {mood}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Demographics - Enhanced with Bubble Chart */}
          <div className="bg-gray-800/40 backdrop-blur-xl rounded-lg border border-gray-700/50">
            {demographicsLoading ? (
              <div className="p-6 text-center">
                <div className="mb-4">
                  <span className="text-4xl animate-spin">🌍</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Analyzing Audience Demographics</h3>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  {profileData?.followers >= 10000 ? 'Using AI analysis for famous account...' : 'Preparing regional demographics...'}
                </p>
              </div>
            ) : demographics && demographics.length > 0 ? (
              <DemographicsBubbleChart 
                demographics={demographics} 
              />
            ) : demographicsError ? (
              <div className="p-6 text-center">
                <div className="mb-4">
                  <span className="text-4xl">⚠️</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Demographics Analysis Failed</h3>
                <p className="text-gray-400 text-sm mb-4">
                  {demographicsError}
                </p>
                <button 
                  onClick={loadDemographics}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Retry Analysis
                </button>
              </div>
            ) : (
              <div className="p-6 text-center">
                <div className="mb-4">
                  <span className="text-4xl">🌍</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Audience Demographics</h3>
                <p className="text-gray-400 text-sm">
                  Profile data required for demographic analysis
                </p>
              </div>
            )}
        </div>
    </div>
  );
};

export default AnalyticsDashboard;