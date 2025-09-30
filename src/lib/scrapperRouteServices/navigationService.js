import { delay } from '@/utils/utils';

export class NavigationService {
  constructor(page, loginHandler) {
    this.page = page;
    this.loginHandler = loginHandler;
  }

  async logCurrentLocation(context = '') {
    try {
      const url = this.page.url();
      const title = await this.page.title();
      console.log(`📍 [Location${context ? ` - ${context}` : ''}] URL: ${url}`);
      console.log(`📄 [Location${context ? ` - ${context}` : ''}] Title: ${title}`);
    } catch (error) {
      console.log(`⚠️ [Location${context ? ` - ${context}` : ''}] Could not get page info: ${error.message}`);
    }
  }

  async navigateToProfile(username) {
    console.log(`🌍 Step 4/8: ATTEMPT 1 - Navigating to Instagram profile (no login): ${username}`);
    const targetUrl = `https://www.instagram.com/${username}/`;
    console.log(`📍 [Navigation] Target URL: ${targetUrl}`);
    
    let navigationSuccess = false;
    let loginRequired = false;
    let navigationFailed = false;

    try {
      await this.page.goto(targetUrl, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });
      
      const currentUrl = this.page.url();
      console.log(`📍 [Navigation] Current URL: ${currentUrl}`);
      
      await delay(3000);
      console.log(`⏱️  Page load delay completed`);

      console.log(`🔍 Step 4A/8: Checking if login is required...`);
      loginRequired = await this.loginHandler.isLoginRequired();
      
      if (!loginRequired) {
        console.log(`✅ ATTEMPT 1 SUCCESS - Profile accessible without login`);
        navigationSuccess = true;
      } else {
        console.log(`🔐 ATTEMPT 1 BLOCKED - Instagram requires login for this profile`);
        navigationSuccess = false;
      }

    } catch (error) {
      console.log(`❌ ATTEMPT 1 FAILED - Navigation error: ${error.message}`);
      navigationFailed = true;
    }

    // ATTEMPT 2: Try with login if needed
    if (!navigationSuccess && (loginRequired || navigationFailed)) {
      const loginSuccess = await this.handleLoginFallback(username, loginRequired, navigationFailed);
      if (loginSuccess) {
        navigationSuccess = true;
      }
    }

    return navigationSuccess;
  }

  async handleLoginFallback(username, loginRequired, navigationFailed) {
    if (loginRequired) {
      console.log(`🔑 Step 4B/8: ATTEMPT 2 - Instagram requires login, attempting authentication...`);
    } else if (navigationFailed) {
      console.log(`🔑 Step 4B/8: ATTEMPT 2 - Navigation failed, trying with login as fallback...`);
    }
    
    const loginSuccess = await this.loginHandler.loginWithRetry(username, 2);
    
    if (loginSuccess) {
      console.log(`✅ ATTEMPT 2 SUCCESS - Logged in and navigated to profile`);
      return true;
    } else {
      console.log(`❌ ATTEMPT 2 FAILED - Login unsuccessful`);
      return false;
    }
  }
}