'use client';

import React, { useState, useEffect } from 'react';
import { Bar, Line, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale
);

export default function PostComparisonSidebar({ posts, enhancedPosts, isVisible, onHide }) {
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [comparisonType, setComparisonType] = useState('engagement'); // engagement, performance, quality

  // Combine posts with enhanced data
  const allPosts = posts?.map((post, index) => {
    const enhanced = enhancedPosts?.find(ep => ep.url === post.url) || {};
    return {
      id: index + 1,
      ...post,
      ...enhanced,
      postLikes: enhanced.postLikes || 0,
      postComments: enhanced.postComments || 0,
      postVibe: enhanced.postVibe || ['general'],
      postQuality: enhanced.postQuality || ['standard'],
      analysis: enhanced.analysis || 'No analysis available'
    };
  }) || [];

  const togglePostSelection = (postId) => {
    setSelectedPosts(prev => {
      if (prev.includes(postId)) {
        return prev.filter(id => id !== postId);
      } else if (prev.length < 4) { // Limit to 4 posts for comparison
        return [...prev, postId];
      }
      return prev;
    });
  };

  const clearSelection = () => {
    setSelectedPosts([]);
  };

  const getSelectedPostsData = () => {
    return selectedPosts.map(id => allPosts.find(post => post.id === id)).filter(Boolean);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getEngagementRate = (post) => {
    const total = post.postLikes + post.postComments;
    return total;
  };

  const getChartData = () => {
    const selectedData = getSelectedPostsData();
    if (selectedData.length === 0) return null;

    const labels = selectedData.map(post => `Post ${post.id}`);

    switch (comparisonType) {
      case 'engagement':
        return {
          likes: {
            labels,
            datasets: [{
              label: 'Likes',
              data: selectedData.map(post => post.postLikes),
              backgroundColor: 'rgba(239, 68, 68, 0.8)',
              borderColor: 'rgba(239, 68, 68, 1)',
              borderWidth: 2,
            }]
          },
          comments: {
            labels,
            datasets: [{
              label: 'Comments',
              data: selectedData.map(post => post.postComments),
              backgroundColor: 'rgba(59, 130, 246, 0.8)',
              borderColor: 'rgba(59, 130, 246, 1)',
              borderWidth: 2,
            }]
          }
        };

      case 'performance':
        return {
          performance: {
            labels,
            datasets: [{
              label: 'Total Engagement',
              data: selectedData.map(post => getEngagementRate(post)),
              backgroundColor: 'rgba(16, 185, 129, 0.8)',
              borderColor: 'rgba(16, 185, 129, 1)',
              borderWidth: 2,
            }]
          }
        };

      case 'quality':
        return {
          quality: {
            labels,
            datasets: [{
              label: 'Content Quality Score',
              data: selectedData.map(post => {
                // Calculate quality score based on vibe and quality keywords
                const qualityScore = (post.postVibe?.length || 1) * (post.postQuality?.length || 1);
                return Math.min(qualityScore * 10, 100); // Normalize to 100
              }),
              backgroundColor: 'rgba(168, 85, 247, 0.8)',
              borderColor: 'rgba(168, 85, 247, 1)',
              borderWidth: 2,
            }]
          }
        };

      default:
        return null;
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e5e7eb',
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: `Post ${comparisonType.charAt(0).toUpperCase() + comparisonType.slice(1)} Comparison`,
        color: '#f3f4f6',
        font: {
          size: 14,
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#9ca3af',
          font: {
            size: 11
          },
          callback: function(value) {
            return formatNumber(value);
          }
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)'
        }
      },
      x: {
        ticks: {
          color: '#9ca3af',
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)'
        }
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div className="w-80 h-full bg-gray-900/80 backdrop-blur-xl border-r border-gray-700/50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <h3 className="text-lg font-semibold text-white">Post Comparison</h3>
            <span className="bg-blue-600/20 text-blue-400 text-xs px-2 py-1 rounded-full">
              {selectedPosts.length}/4
            </span>
          </div>
          
          {/* Hide Button */}
          <button
            onClick={onHide}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-200 text-gray-400 hover:text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Comparison Type Selector */}
        <div className="space-y-2">
          <label className="text-xs text-gray-400">Comparison Type</label>
          <select
            value={comparisonType}
            onChange={(e) => setComparisonType(e.target.value)}
            className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
          >
            <option value="engagement">Engagement (Likes vs Comments)</option>
            <option value="performance">Performance (Total Engagement)</option>
            <option value="quality">Quality (Content Score)</option>
          </select>
        </div>

        {/* Clear Selection Button */}
        {selectedPosts.length > 0 && (
          <button
            onClick={clearSelection}
            className="w-full mt-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear Selection
          </button>
        )}
      </div>

      {/* Posts List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-2">
          {allPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => togglePostSelection(post.id)}
              className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                selectedPosts.includes(post.id)
                  ? 'bg-blue-600/20 border-blue-500/50 hover:bg-blue-600/30'
                  : 'bg-gray-800/50 border-gray-700/30 hover:bg-gray-700/50'
              } ${selectedPosts.length >= 4 && !selectedPosts.includes(post.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-3">
                {/* Post Number */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                  selectedPosts.includes(post.id) ? 'bg-blue-600' : 'bg-gray-600'
                }`}>
                  {post.id}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-medium text-sm">
                      Post {post.id}
                    </h4>
                    {selectedPosts.includes(post.id) && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  
                  {/* Engagement Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      {formatNumber(post.postLikes)}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {formatNumber(post.postComments)}
                    </span>
                  </div>

                  {/* Vibe Tags */}
                  {post.postVibe && post.postVibe.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {post.postVibe.slice(0, 2).map((vibe, index) => (
                        <span key={index} className="bg-purple-600/20 text-purple-400 text-xs px-2 py-0.5 rounded">
                          {vibe}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Charts */}
      {selectedPosts.length >= 2 && (
        <div className="border-t border-gray-700/50 p-4">
          {comparisonType === 'engagement' ? (
            <div className="space-y-4">
              {/* Likes Chart */}
              <div className="h-48 bg-gray-800/30 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-red-400 mb-2">Likes Comparison</h4>
                <Bar 
                  data={getChartData().likes} 
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      title: {
                        display: false
                      }
                    }
                  }} 
                />
              </div>
              
              {/* Comments Chart */}
              <div className="h-48 bg-gray-800/30 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-blue-400 mb-2">Comments Comparison</h4>
                <Bar 
                  data={getChartData().comments} 
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      title: {
                        display: false
                      }
                    }
                  }} 
                />
              </div>
            </div>
          ) : (
            <div className="h-64 bg-gray-800/30 rounded-lg p-3">
              <Bar 
                data={getChartData()[comparisonType]} 
                options={chartOptions} 
              />
            </div>
          )}
          
          {/* Quick Stats */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            {getSelectedPostsData().map((post, index) => (
              <div key={post.id} className="bg-gray-800/50 rounded-lg p-2">
                <div className="text-xs text-gray-400">Post {post.id}</div>
                <div className="text-xs text-white">
                  <div className="flex items-center gap-1 text-red-400">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    {formatNumber(post.postLikes)}
                  </div>
                  <div className="flex items-center gap-1 text-blue-400 mt-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {formatNumber(post.postComments)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {selectedPosts.length === 0 && (
        <div className="p-4 border-t border-gray-700/50">
          <div className="text-center text-gray-400">
            <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm mb-1">Select posts to compare</p>
            <p className="text-xs">Click on posts above to start comparing performance</p>
          </div>
        </div>
      )}

      {selectedPosts.length === 1 && (
        <div className="p-4 border-t border-gray-700/50">
          <div className="text-center text-gray-400">
            <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <p className="text-sm mb-1">Select one more post</p>
            <p className="text-xs">Choose another post to see the comparison</p>
          </div>
        </div>
      )}
    </div>
  );
}