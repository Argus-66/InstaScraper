'use client';

import React, { useState } from 'react';
import Header from '../ui/Header';
import SearchForm from '../ui/SearchForm';
import ErrorDisplay from '../ui/ErrorDisplay';
import ProfileCard from '../ui/ProfileCard';
import AnalyticsDashboard from '../AnalyticsDashboard';
import PostsGrid from '../ui/PostsGrid';
import Footer from '../ui/Footer';

export default function Homepage() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [data, setData] = useState(null);
  const [finalResult, setFinalResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setData(null);
    setFinalResult(null);
    setLoadingMessage('');
    
    try {
      // Step 1: Scrape the data
      setLoadingMessage('🚀 Step 1/2: Scraping Instagram profile...');
      console.log('🚀 Step 1: Starting scrape request for:', username);
      
      const scrapeRes = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
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
      
      // Step 2: Process the scraped data through AI detail extraction
      setLoadingMessage('🤖 Step 2/2: Processing with AI detail extraction...');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="max-w-[95%] mx-auto px-2 py-8">
        <Header />
        
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
          </div>
        )}
        
        <Footer />
      </div>
    </div>
  );
}