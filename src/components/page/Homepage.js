'use client';

import React, { useState } from 'react';
import Header from '../ui/Header';
import SearchForm from '../ui/SearchForm';
import ErrorDisplay from '../ui/ErrorDisplay';
import ProfileCard from '../ui/ProfileCard';
import AnalyticsDashboard from '../AnalyticsDashboard';
import PostsGrid from '../ui/PostsGrid';
import Footer from '../ui/Footer';
import CachedProfilesSidebar from '../ui/CachedProfilesSidebar';
import PostComparisonSidebar from '../ui/PostComparisonSidebar';

export default function Homepage() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [data, setData] = useState(null);
  const [finalResult, setFinalResult] = useState(null);
  const [error, setError] = useState('');
  const [cacheInfo, setCacheInfo] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [comparisonSidebarVisible, setComparisonSidebarVisible] = useState(false);

  const handleProfileSelect = (selectedUsername) => {
    setUsername(selectedUsername);
    handleSubmit(selectedUsername);
    // Hide sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      setSidebarVisible(false);
    }
  };

  const handleSubmit = async (suggestedUsername = null, forceRefresh = false) => {
    // Use suggested username if provided, otherwise use state
    const usernameToProcess = suggestedUsername || username;
    
    // If using suggested username, update the state immediately
    if (suggestedUsername) {
      setUsername(suggestedUsername);
    }
    
    // Ensure we have a username
    if (!usernameToProcess.trim()) {
      setError('Please enter a username');
      return;
    }
    
    setLoading(true);
    setError('');
    setData(null);
    setFinalResult(null);
    setLoadingMessage('');
    setCacheInfo(null);
    
    try {
      // Step 1: Scrape the data
      if (forceRefresh) {
        setLoadingMessage('� Refreshing data... This will take approximately 4-6 minutes.');
      } else {
        setLoadingMessage('🔍 Checking for cached data...');
      }
      
      console.log('🚀 Step 1: Starting scrape request for:', usernameToProcess);
      
      const scrapeRes = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: usernameToProcess,
          forceRefresh: forceRefresh
        }),
      });
      
      if (!scrapeRes.ok) throw new Error('Failed to scrape');
      const scrapeResult = await scrapeRes.json();
      
      console.log('📦 Step 1 Complete - Scrape Result:', scrapeResult);
      
      if (!scrapeResult.success) {
        setError(scrapeResult.error || 'Failed to scrape profile');
        setLoading(false);
        setLoadingMessage('');
        return;
      }

      // Check if this is cached data
      if (scrapeResult.fromCache) {
        console.log('✅ Retrieved from cache instantly!');
        setCacheInfo(scrapeResult.cacheInfo);
        setLoadingMessage('⚡ Retrieved from cache - Processing with AI...');
      } else {
        console.log('🔄 Fresh data scraped');
        if (!forceRefresh) {
          setLoadingMessage('⏰ This is taking 4-6 minutes as this profile wasn\'t cached. We apologize for the inconvenience...');
        }
      }
      
      // Step 2: Process the scraped data through AI detail extraction
      setLoadingMessage('🤖 Processing with AI analysis...');
      console.log('🤖 Step 2: Processing data through AI detail extraction...');
      
      const detailRes = await fetch('/api/AI/detailExtraction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scrapeResult),
      });
      
      if (!detailRes.ok) throw new Error('Failed to process details');
      const finalResult = await detailRes.json();
      
      console.log('✅ Step 2 Complete - Final Processed Result:', finalResult);
      
      if (finalResult.enhancedPosts) {
        console.log('🎯 Enhanced posts returned:', finalResult.enhancedPosts.length);
        finalResult.enhancedPosts.forEach((post, i) => {
          console.log(`Enhanced Post ${i}:`, {
            likes: post.postLikes,
            comments: post.postComments,
            analysis: post.analysis?.substring(0, 50) + '...',
            vibes: post.postVibe
          });
        });
      }
      
      setData(scrapeResult);  // Original scraped data
      setFinalResult(finalResult);  // AI-enhanced data
      
      if (!finalResult.success) {
        setError(finalResult.error || 'Failed to process data');
      }
    } catch (err) {
      console.error('❌ Fetch error:', err);
      
      // Provide specific error messages based on error type
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Network error: Please check your internet connection and try again.');
      } else if (err.message.includes('Failed to scrape')) {
        setError('Failed to scrape Instagram profile. The profile might be private or the username is incorrect.');
      } else if (err.message.includes('Failed to process')) {
        setError('AI processing failed. Showing basic results without AI analysis.');
        // Still show basic scraped data if available
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      // Always cleanup loading state
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleRefreshData = () => {
    if (username) {
      handleSubmit(username, true); // Force refresh
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="flex h-screen">
        {/* Left Sidebar - Post Comparison */}
        <div className={`fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 ease-in-out ${
          comparisonSidebarVisible ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <PostComparisonSidebar
            posts={data?.posts}
            enhancedPosts={finalResult?.enhancedPosts}
            isVisible={comparisonSidebarVisible}
            onHide={() => setComparisonSidebarVisible(false)}
          />
        </div>

        {/* Main Content Area */}
        <div className={`flex-1 overflow-y-auto transition-all duration-300 ${
          comparisonSidebarVisible ? 'lg:ml-80' : ''
        } ${sidebarVisible ? 'lg:mr-80' : ''}`}>
          <div className="max-w-[95%] mx-auto px-2 py-8">
            <Header />
            
            {/* Floating Sidebar Toggle Buttons */}
            <div className="fixed top-4 left-4 right-4 z-40 flex justify-between pointer-events-none">
              {/* Left Sidebar Toggle - Only show when sidebar is hidden and posts exist */}
              {!comparisonSidebarVisible && data?.posts && data.posts.length > 0 && (
                <button
                  onClick={() => setComparisonSidebarVisible(true)}
                  className="bg-gray-800/90 hover:bg-gray-700/90 backdrop-blur-xl border border-gray-600/50 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-2xl pointer-events-auto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-sm">Compare Posts</span>
                </button>
              )}

              {/* Spacer - keeps right button aligned */}
              {!(data?.posts && data.posts.length > 0 && !comparisonSidebarVisible) && <div></div>}

              {/* Right Sidebar Toggle - Only show when sidebar is hidden */}
              {!sidebarVisible && (
                <button
                  onClick={() => setSidebarVisible(true)}
                  className="bg-gray-800/90 hover:bg-gray-700/90 backdrop-blur-xl border border-gray-600/50 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-2xl pointer-events-auto"
                >
                  <span className="text-sm">Cached Profiles</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
              )}
            </div>
            
            <SearchForm 
              username={username}
              setUsername={setUsername}
              loading={loading}
              onSubmit={handleSubmit}
            />
            
            {/* Loading Message Display */}
            {loading && loadingMessage && (
              <div className="w-full max-w-4xl mx-auto mt-6">
                <div className="bg-gray-800/80 backdrop-blur-xl rounded-xl border border-red-500/30 p-6 shadow-2xl">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
                    <span className="text-gray-200 font-medium">{loadingMessage}</span>
                  </div>
                </div>
              </div>
            )}
            
            <ErrorDisplay error={error} />
            
            {data && data.success && (
              <div className="max-w-[98rem] mx-auto">
                <ProfileCard profile={data.profile} username={username} />
                
                {/* Cache Info Display */}
                {cacheInfo && (
                  <div className="w-full max-w-4xl mx-auto mt-6 mb-6">
                    <div className="bg-green-900/40 backdrop-blur-xl rounded-xl border border-green-500/30 p-4 shadow-2xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-green-200 font-medium">
                            ⚡ Data served from cache - Retrieved instantly!
                          </span>
                        </div>
                        <div className="text-xs text-green-300">
                          Cache age: {cacheInfo.cacheAge} minutes | Accessed: {cacheInfo.accessCount} times
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* AI Analytics Dashboard - only show if we have enhanced posts */}
                {finalResult && finalResult.enhancedPosts && (
                  <AnalyticsDashboard 
                    analytics={finalResult.analytics || data.analytics}
                    enhancedPosts={finalResult.enhancedPosts}
                    profileData={data.profile}
                  />
                )}
                
                <PostsGrid 
                  posts={data.posts}
                  enhancedPosts={finalResult?.enhancedPosts}
                  message={data.message} 
                />
                
                {/* Refresh Data Button */}
                <div className="w-full max-w-4xl mx-auto mt-8 mb-6">
                  <div className="bg-gray-800/80 backdrop-blur-xl rounded-xl border border-red-500/30 p-6 shadow-2xl">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Want Fresh Data?
                      </h3>
                      <p className="text-gray-400 text-sm mb-4">
                        Click below to refresh all data and get the latest insights. This will take approximately 4-6 minutes.
                      </p>
                      <button
                        onClick={handleRefreshData}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
                      >
                        {loading ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Refreshing...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span>🔄</span>
                            <span>Refresh Data</span>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <Footer />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className={`fixed top-0 right-0 h-full z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarVisible ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <CachedProfilesSidebar 
            onProfileSelect={handleProfileSelect}
            currentUsername={username}
            onHide={() => setSidebarVisible(false)}
          />
        </div>

        {/* Sidebar Overlays for Mobile */}
        {sidebarVisible && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarVisible(false)}
          />
        )}
        {comparisonSidebarVisible && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setComparisonSidebarVisible(false)}
          />
        )}
      </div>
    </div>
  );
}