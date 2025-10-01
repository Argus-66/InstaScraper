import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { getCollection, COLLECTIONS } from '@/lib/database';

export async function POST(req) {
  try {
    console.log('🤖 [DetailExtraction] Starting AI detail extraction...');
    
    const body = await req.json();
    console.log('📦 [DetailExtraction] Received data keys:', Object.keys(body));
    
    // Handle both direct scrapeResult and nested structure
    const scrapeResult = body.scrapeResult || body;
    
    if (!scrapeResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid scrape result provided'
      });
    }

    const { posts } = scrapeResult;
    
    if (!posts || !Array.isArray(posts)) {
      console.log('⚠️ [DetailExtraction] No posts found');
      return NextResponse.json({
        success: false,
        error: 'No posts found in scrape result'
      });
    }

    console.log(`🔍 [DetailExtraction] Processing ${posts.length} posts with comprehensive AI analysis...`);

    // Initialize Gemini AI with new library
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.log('⚠️ [DetailExtraction] No Gemini API key found, using fallback processing');
      return processFallback(scrapeResult, posts);
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey
    });

    const enhancedPosts = [];

    // Process each post with comprehensive analysis
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      console.log(`🔍 [DetailExtraction] Processing post ${i + 1}/${posts.length} with image analysis...`);
      
      try {
        const enhancedPost = await processPostComprehensive(ai, post, i);
        enhancedPosts.push(enhancedPost);
        
        // Rate limiting - wait between requests (longer for image analysis)
        if (i < posts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`❌ [DetailExtraction] Error processing post ${i + 1}:`, error.message);
        // Fallback for failed posts
        enhancedPosts.push(createFallbackPost(post));
      }
    }

    console.log(`✅ [DetailExtraction] Completed processing ${enhancedPosts.length} posts`);

    return NextResponse.json({
      success: true,
      ...scrapeResult,
      enhancedPosts: enhancedPosts,
      processedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [DetailExtraction] API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

async function processPostComprehensive(ai, post, index) {
  // Check if we have cached AI analysis for this post
  try {
    const cacheCollection = await getCollection(COLLECTIONS.ANALYSIS_CACHE);
    const postKey = `${post.url}_${post.description}`.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100);
    
    const cachedAnalysis = await cacheCollection.findOne({ 
      postKey: postKey 
    });

    if (cachedAnalysis && cachedAnalysis.aiAnalysis) {
      console.log(`✅ [AI CACHE HIT] Using cached analysis for post ${index + 1}`);
      return cachedAnalysis.aiAnalysis;
    }
    
    console.log(`❌ [AI CACHE MISS] Generating new analysis for post ${index + 1}`);
  } catch (cacheError) {
    console.log('⚠️ [AI CACHE ERROR] Cache check failed, proceeding with fresh analysis:', cacheError.message);
  }

  const prompt = `
You are an expert Instagram content analyst. Analyze this post comprehensively and provide detailed insights.

POST DATA:
- Type: ${post.type || 'unknown'}
- URL: ${post.url || 'No URL'}
- Description: ${post.description || 'No description provided'}
- Caption: ${post.caption || 'No caption provided'}

TASKS:
1. EXTRACT ENGAGEMENT: Look for likes/comments in description (formats like "64K likes", "1.2M likes", "234 comments")
2. IMAGE ANALYSIS: Analyze the image at the URL for content, quality, mood, objects, people, setting
3. CONTENT ANALYSIS: Understand the post's message, theme, and purpose
4. GENERATE MISSING DATA: Create caption, hashtags, vibe, quality if not provided

Return ONLY a valid JSON object with this structure:
{
  "postLikes": number,
  "postComments": number,
  "postCaption": "extracted or generated caption text",
  "postHashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "postVibe": ["vibe", "words", "describing", "mood"],
  "postQuality": ["quality", "assessment", "words"],
  "analysis": "Comprehensive analysis of the post content, message, and effectiveness (2-3 sentences)",
  "imageLevelAnalysis": {
    "objects": ["list", "of", "objects", "seen"],
    "people": "description of people if any",
    "setting": "description of location/environment",
    "colors": ["dominant", "colors"],
    "mood": "overall visual mood",
    "composition": "assessment of visual composition",
    "brandElements": ["visible", "brand", "elements"],
    "textInImage": "any text visible in the image",
    "imageQuality": "technical quality assessment",
    "engagementPotential": "prediction of how engaging this image is"
  }
}

RULES:
- Extract numbers intelligently: "64K" = 64000, "1.2M" = 1200000
- Generate 3 relevant hashtags if none exist
- Create engaging caption if none provided (based on image analysis)
- Be specific in image analysis - describe what you actually see
- Analysis should explain why this post works or doesn't work
- Return ONLY valid JSON, no extra text
`;

  try {
    // Use the new @google/genai API
    console.log(`🔄 [DetailExtraction] Using model: models/gemini-2.5-flash`);
    const response = await ai.models.generateContent({
      model: "models/gemini-2.5-flash",
      contents: prompt
    });
    console.log(`✅ [DetailExtraction] Success with model: models/gemini-2.5-flash`);

    const text = response.text;

    // Try to extract JSON from response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Ensure we have all required fields
        const enhancedData = {
          postLikes: parsed.postLikes || extractLikesFromDescription(post.description) || 0,
          postComments: parsed.postComments || extractCommentsFromDescription(post.description) || 0,
          postCaption: parsed.postCaption || post.caption || 'No caption available',
          postHashtags: parsed.postHashtags || generateFallbackHashtags(post),
          postVibe: parsed.postVibe || ['general', 'content'],
          postQuality: parsed.postQuality || ['standard', 'quality'],
          analysis: parsed.analysis || 'Content analysis not available',
          imageLevelAnalysis: parsed.imageLevelAnalysis || createFallbackImageAnalysis()
        };

        // Cache successful AI analysis
        try {
          const cacheCollection = await getCollection(COLLECTIONS.ANALYSIS_CACHE);
          const postKey = `${post.url}_${post.description}`.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100);
          
          await cacheCollection.updateOne(
            { postKey: postKey },
            {
              $set: {
                aiAnalysis: {
                  ...post,
                  ...enhancedData
                },
                cachedAt: new Date(),
                lastAccessed: new Date()
              }
            },
            { upsert: true }
          );
          
          console.log(`✅ [AI CACHE] Analysis cached for post ${index + 1}`);
        } catch (cacheError) {
          console.log('⚠️ [AI CACHE ERROR] Failed to cache analysis:', cacheError.message);
        }

        return {
          ...post,  // Keep original post data
          ...enhancedData // Add AI-extracted data
        };
      }
    } catch (parseError) {
      console.log(`⚠️ [DetailExtraction] JSON parse failed for post ${index + 1}: ${parseError.message}`);
    }

  } catch (error) {
    console.log(`⚠️ [DetailExtraction] AI analysis failed for post ${index + 1}: ${error.message}`);
  }

  // Fallback if AI analysis fails
  return createFallbackPost(post);
}

// Helper function to extract likes from description
function extractLikesFromDescription(description) {
  if (!description) return 0;
  
  const likesMatch = description.match(/(\d+(?:,\d{3})*|\d+(?:\.\d+)?[KM]?)\s*likes?/i);
  if (likesMatch) {
    const likesStr = likesMatch[1].replace(/,/g, '').toLowerCase();
    if (likesStr.includes('k')) {
      return Math.round(parseFloat(likesStr.replace('k', '')) * 1000);
    } else if (likesStr.includes('m')) {
      return Math.round(parseFloat(likesStr.replace('m', '')) * 1000000);
    } else {
      return parseInt(likesStr);
    }
  }
  return 0;
}

// Helper function to extract comments from description
function extractCommentsFromDescription(description) {
  if (!description) return 0;
  
  const commentsMatch = description.match(/(\d+(?:,\d{3})*|\d+(?:\.\d+)?[KM]?)\s*comments?/i);
  if (commentsMatch) {
    const commentsStr = commentsMatch[1].replace(/,/g, '').toLowerCase();
    if (commentsStr.includes('k')) {
      return Math.round(parseFloat(commentsStr.replace('k', '')) * 1000);
    } else if (commentsStr.includes('m')) {
      return Math.round(parseFloat(commentsStr.replace('m', '')) * 1000000);
    } else {
      return parseInt(commentsStr);
    }
  }
  return 0;
}

// Helper function to generate fallback hashtags
function generateFallbackHashtags(post) {
  const hashtags = [];
  
  // Extract existing hashtags from description or caption
  const text = (post.description || '') + ' ' + (post.caption || '');
  const hashtagMatches = text.match(/#[\w]+/g);
  if (hashtagMatches) {
    hashtags.push(...hashtagMatches.slice(0, 5));
  }
  
  // Add generic hashtags if none found
  if (hashtags.length === 0) {
    hashtags.push('#instagram', '#content', '#post');
  }
  
  return hashtags;
}

// Helper function to create fallback image analysis
function createFallbackImageAnalysis() {
  return {
    objects: ['unknown'],
    people: 'Unable to analyze',
    setting: 'Unknown setting',
    colors: ['unknown'],
    mood: 'neutral',
    composition: 'standard',
    brandElements: ['none detected'],
    textInImage: 'Unable to detect text',
    imageQuality: 'standard quality',
    engagementPotential: 'moderate'
  };
}

function createFallbackPost(post) {
  // Extract hashtags from description or caption
  const text = (post.description || '') + ' ' + (post.caption || '');
  const hashtags = generateFallbackHashtags(post);

  // Extract caption (remove like/comment counts)
  let caption = post.description || post.caption || '';
  caption = caption.replace(/^\d+[KM]?\s*likes?,\s*\d+\s*comments?\s*-\s*\w+\s+on\s+\w+\s+\d+,\s*\d+:\s*"?/, '');
  caption = caption.replace(/"$/, ''); // Remove trailing quote

  return {
    ...post,
    postLikes: extractLikesFromDescription(post.description) || post.likes || 0,
    postComments: extractCommentsFromDescription(post.description) || post.comments || 0,  
    postCaption: caption.substring(0, 300) || 'No caption available',
    postHashtags: hashtags,
    postVibe: ["general", "content"],
    postQuality: ["standard", "quality"],
    analysis: "Basic post analysis - comprehensive AI analysis not available without API key.",
    imageLevelAnalysis: createFallbackImageAnalysis()
  };
}

function processFallback(scrapeResult, posts) {
  console.log('🔄 [DetailExtraction] Using fallback processing (no AI)');
  
  const enhancedPosts = posts.map((post, index) => {
    return createFallbackPost(post);
  });

  return NextResponse.json({
    success: true,
    ...scrapeResult,
    enhancedPosts: enhancedPosts,
    processedAt: new Date().toISOString(),
    processingMethod: 'fallback'
  });
}