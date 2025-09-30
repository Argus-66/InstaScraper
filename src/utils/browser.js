import chromium from '@sparticuz/chromium';
import { BROWSER_ARGS } from './constants';

let puppeteer;

const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.RAILWAY_ENVIRONMENT;

if (isServerless) {
  puppeteer = require('puppeteer-core');
} else {
  puppeteer = require('puppeteer');
}

export class BrowserManager {
  static async launchBrowser() {
    console.log('🚀 [BrowserManager] Launching Puppeteer browser with headless mode...');
    
    // Use serverless chromium only in actual serverless environments
    const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.RAILWAY_ENVIRONMENT;
    const isProduction = process.env.NODE_ENV === 'production';
    
    console.log(`🔍 [BrowserManager] Environment: production=${isProduction}, serverless=${!!isServerless}`);
    
    const launchOptions = isServerless ? {
      args: [...chromium.args, ...BROWSER_ARGS],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    } : {
      headless: 'new',
      args: BROWSER_ARGS
    };

    const browser = await puppeteer.launch(launchOptions);
    console.log('✅ [BrowserManager] Browser launched successfully');
    return browser;
  }

  static async createPage(browser, userAgent, viewportConfig) {
    console.log(`📄 [BrowserManager] Creating new page with viewport ${viewportConfig.width}x${viewportConfig.height}...`);
    const page = await browser.newPage();
   
    console.log(`🤖 [BrowserManager] Setting user agent: ${userAgent.substring(0, 50)}...`);
    await page.setUserAgent(userAgent);
   
    console.log(`🖥️ [BrowserManager] Setting viewport: ${viewportConfig.width}x${viewportConfig.height}`);
    await page.setViewport(viewportConfig);
   
    const initialUrl = page.url();
    console.log(`📍 [BrowserManager] Initial page URL: ${initialUrl}`);
   
    console.log('✅ [BrowserManager] Page setup completed');
    return page;
  }

  static async closeBrowser(browser) {
    if (browser) {
      console.log('🔒 [BrowserManager] Closing browser...');
      await browser.close();
      console.log('✅ [BrowserManager] Browser closed successfully');
    }
  }
}