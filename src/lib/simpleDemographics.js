// Simple Audience Demographics Analysis using username and follower count

export async function analyzeSimpleDemographics(username, followerCount = 0) {
  try {
    console.log(`🌍 Analyzing demographics for @${username} (${followerCount} followers)...`);
    
    // Determine if this is a famous account based on follower count
    const isFamous = followerCount >= 10000;
    
    if (isFamous) {
      // Use AI to analyze famous account
      console.log(`🌟 Famous account detected - using AI analysis`);
      const aiResult = await getAIDemographics(username, followerCount);
      
      if (aiResult.success) {
        return aiResult;
      }
    }
    
    // Fallback for regular users or if AI fails
    console.log(`👤 Regular user - using standard distribution`);
    return getRegularUserDemographics();
    
  } catch (error) {
    console.error('❌ Demographics Error:', error);
    return getRegularUserDemographics();
  }
}

// AI analysis for famous accounts
async function getAIDemographics(username, followerCount) {
  try {
    const prompt = `
    Analyze the Instagram username "@${username}" with ${followerCount} followers.
    
    Determine:
    1. Is this a celebrity, brand, or famous personality?
    2. What type: Global Celebrity, Indian Celebrity, International Brand, Indian Brand, Influencer, etc.
    3. Where is their likely audience from geographically?
    
    Based on the username and follower count, estimate the geographic distribution of their audience.
    
    Consider:
    - If it's a global brand/celebrity: international distribution
    - If it's Indian: heavy India focus with diaspora
    - If it's regional: local focus
    - Brand vs personality differences
    
    Respond with ONLY this JSON format:
    {
      "isKnown": true/false,
      "category": "GLOBAL_CELEBRITY/INDIAN_CELEBRITY/GLOBAL_BRAND/INDIAN_BRAND/INFLUENCER/UNKNOWN",
      "reasoning": "brief explanation",
      "demographics": {
        "India": 70,
        "United States": 15,
        "United Kingdom": 8,
        "Canada": 4,
        "Australia": 3
      }
    }
    
    Demographics must sum to 100. Include 5-10 countries max.
    If you don't recognize the username, set isKnown to false.
    `;

    const response = await fetch('/api/simple-demographics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error('AI request failed');
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error('AI analysis failed');
    }

    const aiData = result.data;
    
    // If AI doesn't know this account, treat as regular user
    if (!aiData.isKnown) {
      return { success: false };
    }

    // Convert to our format with flag colors
    const demographicsWithColors = await addFlagColors(aiData.demographics);
    
    return {
      success: true,
      category: aiData.category,
      reasoning: aiData.reasoning,
      demographics: demographicsWithColors,
      isAiGenerated: true
    };

  } catch (error) {
    console.error('❌ AI Demographics Error:', error);
    return { success: false };
  }
}

// Regular user demographics (India-focused)
function getRegularUserDemographics() {
  const regularDemographics = {
    'India': 95,
    'United States': 2,
    'United Kingdom': 1,
    'Canada': 1,
    'Australia': 1
  };

  const demographicsWithColors = [
    { country: 'India', percentage: 95, flagColors: ['#FF9933', '#FFFFFF', '#138808'] },
    { country: 'United States', percentage: 2, flagColors: ['#B22234', '#FFFFFF', '#3C3B6E'] },
    { country: 'United Kingdom', percentage: 1, flagColors: ['#012169', '#FFFFFF', '#C8102E'] },
    { country: 'Canada', percentage: 1, flagColors: ['#FF0000', '#FFFFFF'] },
    { country: 'Australia', percentage: 1, flagColors: ['#012169', '#FFFFFF', '#E4002B'] }
  ];

  return {
    success: true,
    category: 'REGULAR_USER',
    reasoning: 'Regular user with local/regional audience',
    demographics: demographicsWithColors,
    isAiGenerated: false
  };
}

// Add flag colors to countries
async function addFlagColors(demographicsObj) {
  const countries = Object.keys(demographicsObj);
  
  const flagColorMap = {
    'India': ['#FF9933', '#FFFFFF', '#138808'],
    'United States': ['#B22234', '#FFFFFF', '#3C3B6E'],
    'United Kingdom': ['#012169', '#FFFFFF', '#C8102E'],
    'Canada': ['#FF0000', '#FFFFFF'],
    'Australia': ['#012169', '#FFFFFF', '#E4002B'],
    'Germany': ['#000000', '#DD0000', '#FFCE00'],
    'France': ['#0055A4', '#FFFFFF', '#EF4135'],
    'Brazil': ['#009B3A', '#FEDF00', '#002776'],
    'Japan': ['#BC002D', '#FFFFFF'],
    'South Korea': ['#C60C30', '#003478', '#FFFFFF'],
    'Italy': ['#009246', '#FFFFFF', '#CE2B37'],
    'Spain': ['#AA151B', '#F1BF00'],
    'Netherlands': ['#21468B', '#FFFFFF', '#AE1C28'],
    'Mexico': ['#006847', '#FFFFFF', '#CE1126'],
    'UAE': ['#00732F', '#FFFFFF', '#000000', '#CE1126'],
    'Pakistan': ['#01411C', '#FFFFFF'],
    'Bangladesh': ['#006A4E', '#F42A41'],
    'Nepal': ['#DC143C', '#003893'],
    'Sri Lanka': ['#FFB800', '#B22222', '#00534E'],
    'Singapore': ['#ED2939', '#FFFFFF']
  };

  return Object.entries(demographicsObj).map(([country, percentage]) => ({
    country,
    percentage: Math.round(percentage * 10) / 10,
    flagColors: flagColorMap[country] || ['#6B7280', '#9CA3AF']
  })).sort((a, b) => b.percentage - a.percentage);
}