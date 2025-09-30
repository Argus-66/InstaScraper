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

export async function GET() {
  return NextResponse.json(
    { message: 'Instagram Scraper API - Use POST method with username' },
    { status: 200 }
  );
}

export async function POST(request) {
  let browser = null;
  
  try {
    const { username, gmailCredentials } = await request.json();
    
    // Validate username
    const validation = validateUsername(username);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error }, 
        { status: 400 }
      );
    }

    console.log(`🚀 Starting scrape for username: ${username}`);
    
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
    
    return NextResponse.json(
      ResponseFormatter.formatSuccess(postsResult.posts, profileData, analytics)
    );
    
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