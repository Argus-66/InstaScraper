import { NextResponse } from 'next/server';
import { getRandomUserAgent, validateUsername, getViewportConfig } from '@/utils/utils';
import { BrowserManager } from '@/utils/browser';
import { PopupHandler } from '@/utils/popupHandler';
import { PostScraper } from '@/lib/pipelineComponents/postScrapper/main';
import { ProfileScraper } from '@/lib/pipelineComponents/profileScrapper/profileScraper';
import { MainLoginHandler as LoginHandler } from '@/lib/pipelineComponents/fallback1/mainLoginHandler';
import { NavigationService } from '@/lib/scrapperRouteServices/navigationService';
import { ProfileService } from '@/lib/scrapperRouteServices/profileService';
import { PostsService } from '@/lib/scrapperRouteServices/postsService';
import { ResponseFormatter } from '@/lib/scrapperRouteServices/responseFormatter';
import { getCollection, COLLECTIONS, createCacheEntry, updateLastAccessed } from '@/lib/database';

export async function GET() {
  return NextResponse.json(
    { message: 'Instagram Scraper API - Use POST method with username' },
    { status: 200 }
  );
}

export async function POST(request) {
  let browser = null;
  const startTime = Date.now();
  
  try {
    const { username, gmailCredentials, forceRefresh = false } = await request.json();
    
    // Validate username
    const validation = validateUsername(username);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error }, 
        { status: 400 }
      );
    }

    const normalizedUsername = username.toLowerCase();
    
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      try {
        console.log(`🔍 [CACHE] Checking cache for @${normalizedUsername}...`);
        const cacheCollection = await getCollection(COLLECTIONS.ANALYSIS_CACHE);
        const cachedResult = await cacheCollection.findOne({ 
          username: normalizedUsername 
        });

        if (cachedResult) {
          console.log(`✅ [CACHE HIT] Found cached data for @${normalizedUsername}! Serving instantly...`);
          
          // Update access tracking
          await updateLastAccessed(normalizedUsername);
          
          // Remove MongoDB internal fields and format response
          const { _id, cacheCreatedAt, lastAccessed, accessCount, ...cleanData } = cachedResult;
          
          return NextResponse.json({
            success: true,
            profile: cleanData.profileData,
            analytics: cleanData.analytics,
            posts: cleanData.posts,
            enhancedPosts: cleanData.enhancedPosts || [],
            scrapedAt: cleanData.scrapedAt,
            fromCache: true,
            processingTime: Date.now() - startTime,
            cacheInfo: {
              cacheAge: Math.floor((Date.now() - new Date(cacheCreatedAt).getTime()) / 1000 / 60), // minutes
              lastAccessed: new Date(lastAccessed).toISOString(),
              accessCount
            }
          });
        } else {
          console.log(`❌ [CACHE MISS] No cached data for @${normalizedUsername}. Starting fresh analysis...`);
          console.log(`⏰ [NOTICE] This will take approximately 4-6 minutes. We apologize for the inconvenience.`);
        }
      } catch (cacheError) {
        console.error('⚠️ [CACHE ERROR] Cache check failed, proceeding with fresh scrape:', cacheError);
      }
    } else {
      console.log(`� [FORCE REFRESH] Refresh requested for @${normalizedUsername}. Bypassing cache...`);
    }

    console.log(`�🚀 Starting fresh scrape for username: ${username}`);
    
    // Setup browser and page
    const randomUserAgent = getRandomUserAgent();
    const viewportConfig = getViewportConfig(randomUserAgent);
    
    console.log(`🤖 Using User Agent: ${randomUserAgent}`);
    console.log(`📱 Viewport: ${viewportConfig.width}x${viewportConfig.height}`);
    console.log(`🌐 Step 2/8: Launching browser...`);
    
    browser = await BrowserManager.launchBrowser();
    const page = await BrowserManager.createPage(browser, randomUserAgent, viewportConfig);
    console.log(`✅ Browser and page created successfully`);
    
    // Initialize handlers
    console.log(`🔧 Step 3/8: Initializing scraper modules...`);
    const popupHandler = new PopupHandler(page, username);
    const postScraper = new PostScraper(page, username);
    const profileScraper = new ProfileScraper(page, username);
    const loginHandler = new LoginHandler(page, username, gmailCredentials);
    
    console.log(`✅ PopupHandler, PostScraper, ProfileScraper, and LoginHandler initialized`);
    
    // Test Gmail connection
    console.log(`📧 Testing Gmail connection for 2FA support...`);
    const gmailTest = await loginHandler.testGmailConnection();
    console.log(`📧 Gmail connection test: ${gmailTest ? 'SUCCESS ✅' : 'FAILED ❌'}`);

    // Initialize services
    const navigationService = new NavigationService(page, loginHandler);
    const profileService = new ProfileService(profileScraper, postScraper, popupHandler);
    const postsService = new PostsService(postScraper);

    // Navigate to profile
    const navigationSuccess = await navigationService.navigateToProfile(username);
    if (!navigationSuccess) {
      await BrowserManager.closeBrowser(browser);
      return NextResponse.json(
        ResponseFormatter.formatError('Unable to access profile. It may be private, deleted, or blocked.'), 
        { status: 404 }
      );
    }

    // Initial screenshot
    await postScraper.debugScreenshot.capture('api-workflow', 'after', 'page-loaded');

    // Handle popups and get profile data
    const profileData = await profileService.handlePopupsAndExtract(navigationService);

    // Scrape posts
    const postsResult = await postsService.scrapePosts();
    if (!postsResult.postsFound) {
      await BrowserManager.closeBrowser(browser);
      return NextResponse.json(ResponseFormatter.formatNoPosts(profileData));
    }

    // Analyze engagement
    const analytics = await postsService.analyzeEngagement(profileData, postsResult.posts);

    // Final screenshots
    await postsService.captureDebugScreenshots();

    console.log(`🎉 Scraping completed successfully for @${username}`);
    await BrowserManager.closeBrowser(browser);
    console.log(`🚪 Browser closed`);
    
    const scrapedAt = new Date().toISOString();
    const finalResponse = ResponseFormatter.formatSuccess(postsResult.posts, profileData, analytics);
    
    // Add metadata
    finalResponse.scrapedAt = scrapedAt;
    finalResponse.fromCache = false;
    finalResponse.processingTime = Date.now() - startTime;

    // Store in cache
    try {
      console.log(`💾 [CACHE] Storing results for @${normalizedUsername}...`);
      const cacheCollection = await getCollection(COLLECTIONS.ANALYSIS_CACHE);
      
      const cacheEntry = createCacheEntry(
        normalizedUsername,
        finalResponse.profile,
        finalResponse.analytics,
        finalResponse.posts,
        finalResponse.enhancedPosts || [],
        scrapedAt
      );

      // Upsert (insert or replace)
      await cacheCollection.replaceOne(
        { username: normalizedUsername },
        cacheEntry,
        { upsert: true }
      );
      
      console.log(`✅ [CACHE] Successfully cached results for @${normalizedUsername}`);
    } catch (cacheError) {
      console.error('⚠️ [CACHE ERROR] Failed to cache results:', cacheError);
      // Don't fail the request if caching fails
    }
    
    return NextResponse.json(finalResponse);
    
  } catch (error) {
    console.error('API error:', error);
    
    if (browser) {
      await BrowserManager.closeBrowser(browser);
    }
    
    return NextResponse.json(
      ResponseFormatter.formatError('Failed to scrape profile or Instagram blocked access.'), 
      { status: 500 }
    );
  }
}