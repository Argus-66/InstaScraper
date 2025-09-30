import { CONTINUE_BUTTON_SELECTORS, CLOSE_BUTTON_SELECTORS } from './constants';
import { delay } from './utils';
import { DebugScreenshot } from './debugScreenshot';

export class PopupHandler {
  constructor(page, username = 'unknown') {
    this.page = page;
    this.debugScreenshot = new DebugScreenshot(page, username);
  }

  async handleContinueButtons() {
    console.log('🔍 [PopupHandler] Scanning for app redirect or continue buttons...');
    
    // Screenshot before continue button detection
    await this.debugScreenshot.capture('popup-handling', 'before', 'continue-detection');
    
    // Try standard selectors
    console.log(`🔎 [PopupHandler] Testing ${CONTINUE_BUTTON_SELECTORS.length} continue button selectors...`);
    for (const selector of CONTINUE_BUTTON_SELECTORS) {
      try {
        console.log(`   Checking: ${selector}`);
        const button = await this.page.$(selector);
        if (button) {
          console.log(`✅ [PopupHandler] Found continue button with selector: ${selector}`);
          
          // Screenshot when button is found
          await this.debugScreenshot.capture('popup-handling', 'during', 'continue-button-found');
          await this.debugScreenshot.captureElement(selector, 'popup-handling', 'continue-button');
          
          await button.click();
          console.log('✅ [PopupHandler] Clicked continue button, waiting for page to load...');
          await delay(2000);
          
          // Log URL after continue button click
          const newUrl = this.page.url();
          console.log(`📍 [PopupHandler] URL after continue click: ${newUrl}`);
          
          // Screenshot after clicking
          await this.debugScreenshot.capture('popup-handling', 'after', 'continue-clicked');
          return true;
        }
      } catch (error) {
        console.log(`   ⚠️ Error with selector ${selector}: ${error.message}`);
        continue;
      }
    }
    console.log('🚫 [PopupHandler] No standard continue buttons found');

    // Try text-based elements
    console.log('📝 [PopupHandler] Searching for text-based continue elements...');
    await this.debugScreenshot.capture('popup-handling', 'during', 'text-based-search');
    const clicked = await this.clickTextBasedContinue();
    if (clicked) {
      console.log('✅ [PopupHandler] Successfully clicked text-based continue');
      await delay(2000);
      return true;
    }

    // Screenshot if no continue buttons found
    console.log('🚫 [PopupHandler] No continue buttons found (standard or text-based)');
    await this.debugScreenshot.capture('popup-handling', 'after', 'no-continue-found');
    return false;
  }

  async clickTextBasedContinue() {
    try {
      await this.debugScreenshot.capture('text-continue', 'before', 'text-search');
      
      const continueElement = await this.page.evaluateHandle(() => {
        const textPatterns = [
          'Continue on web',
          'Continue without app',
          'Continue to website',
          'Open in browser',
          'Not now',
          'Skip',
          'Continue'
        ];
        
        for (const pattern of textPatterns) {
          const elements = [...document.querySelectorAll('*')];
          const element = elements.find(el => 
            el.textContent && 
            el.textContent.toLowerCase().includes(pattern.toLowerCase()) &&
            (el.tagName === 'BUTTON' || el.tagName === 'A' || el.role === 'button' || 
             el.onclick || el.style.cursor === 'pointer' || 
             el.classList.contains('clickable') || el.getAttribute('data-testid'))
          );
          if (element) {
            return element;
          }
        }
        return null;
      });

      if (continueElement && continueElement.asElement) {
        console.log('Found continue element by text content');
        
        // Screenshot before clicking text-based continue
        await this.debugScreenshot.capture('text-continue', 'during', 'text-element-found');
        
        await continueElement.asElement().click();
        
        // Screenshot after clicking
        await this.debugScreenshot.capture('text-continue', 'after', 'text-clicked');
        return true;
      }
    } catch (error) {
      console.log('No text-based continue elements found:', error.message);
    }
    
    // Screenshot if no text continue found
    await this.debugScreenshot.capture('text-continue', 'after', 'no-text-continue');
    return false;
  }

  async handleCloseButtons() {
    console.log('🔍 [PopupHandler] Scanning for popups and close buttons...');
    
    // Screenshot before close button detection
    await this.debugScreenshot.capture('close-buttons', 'before', 'close-detection');
    
    console.log(`🔎 [PopupHandler] Testing ${CLOSE_BUTTON_SELECTORS.length} close button selectors...`);
    for (const selector of CLOSE_BUTTON_SELECTORS) {
      try {
        console.log(`   Checking: ${selector}`);
        await this.page.waitForSelector(selector, { timeout: 1000 });
        const closeButton = await this.page.$(selector);
        if (closeButton) {
          console.log(`✅ [PopupHandler] Found close button with selector: ${selector}`);
          
          // Screenshot when close button found
          await this.debugScreenshot.capture('close-buttons', 'during', 'close-button-found');
          await this.debugScreenshot.captureElement(selector, 'close-buttons', 'close-button');
          
          await closeButton.click();
          console.log('✅ [PopupHandler] Clicked close button, waiting for popup to disappear...');
          await delay(1500);
          
          // Log URL after close button click
          const currentUrl = this.page.url();
          console.log(`📍 [PopupHandler] URL after close click: ${currentUrl}`);
          
          // Screenshot after clicking close button
          await this.debugScreenshot.capture('close-buttons', 'after', 'close-clicked');
          return true;
        }
      } catch (error) {
        console.log(`   ⚠️ Selector ${selector} not found or error: ${error.message}`);
        continue;
      }
    }
    console.log('🚫 [PopupHandler] No standard close buttons found, trying X buttons...');

    return await this.clickXButtons();
  }

  async clickXButtons() {
    try {
      await this.debugScreenshot.capture('x-buttons', 'before', 'x-search');
      
      const xButton = await this.page.evaluateHandle(() => {
        const allElements = [...document.querySelectorAll('*')];
        const xPatterns = ['×', '✕', '✖', '⨯', 'X'];
        
        for (const pattern of xPatterns) {
          const xElement = allElements.find(el => 
            el.textContent === pattern &&
            (el.tagName === 'BUTTON' || el.role === 'button' || 
             el.onclick || el.style.cursor === 'pointer' ||
             el.parentElement?.tagName === 'BUTTON' ||
             el.parentElement?.role === 'button')
          );
          if (xElement) {
            return xElement.tagName === 'BUTTON' ? xElement : xElement.parentElement;
          }
        }
        return null;
      });

      if (xButton && xButton.asElement) {
        console.log('Found X/close button by content analysis');
        
        // Screenshot when X button found
        await this.debugScreenshot.capture('x-buttons', 'during', 'x-button-found');
        
        await xButton.asElement().click();
        
        // Screenshot after clicking X button
        await this.debugScreenshot.capture('x-buttons', 'after', 'x-clicked');
        return true;
      }
    } catch (error) {
      console.log('No X/close buttons found by content analysis:', error.message);
    }
    
    // Screenshot if no X buttons found
    await this.debugScreenshot.capture('x-buttons', 'after', 'no-x-found');
    return false;
  }

  async handleSpecificPopups() {
    try {
      console.log('🔍 [PopupHandler] Checking for Instagram-specific popups...');
      await this.debugScreenshot.capture('specific-popups', 'before', 'popup-detection');
      
      // Instagram login popup
      console.log('🔑 [PopupHandler] Checking for "Not Now" login buttons...');
      const notNowButton = await this.page.$('button:contains("Not Now")');
      if (notNowButton) {
        console.log('✅ [PopupHandler] Found "Not Now" button, dismissing login prompt...');
        
        // Screenshot when specific popup found
        await this.debugScreenshot.capture('specific-popups', 'during', 'not-now-found');
        
        await notNowButton.click();
        
        // Screenshot after clicking specific popup
        await this.debugScreenshot.capture('specific-popups', 'after', 'not-now-clicked');
        await delay(1000);
      } else {
        console.log('🚫 [PopupHandler] No "Not Now" buttons found');
      }

      // Cookie notice
      console.log('🍪 [PopupHandler] Checking for cookie consent buttons...');
      const acceptCookies = await this.page.$('button:contains("Accept"), button:contains("OK"), button:contains("Got it")');
      if (acceptCookies) {
        console.log('✅ [PopupHandler] Found cookie acceptance button, accepting...');
        await this.debugScreenshot.capture('specific-popups', 'during', 'cookies-found');
        await acceptCookies.click();
        await this.debugScreenshot.capture('specific-popups', 'after', 'cookies-clicked');
        await delay(1000);
      } else {
        console.log('🚫 [PopupHandler] No cookie consent buttons found');
      }

      // App install banner close
      console.log('📱 [PopupHandler] Checking for app install banner...');
      const dismissBanner = await this.page.$('[data-testid="app-install-banner-close"], [aria-label="Dismiss"]');
      if (dismissBanner) {
        console.log('✅ [PopupHandler] Found app install banner close button, dismissing...');
        await this.debugScreenshot.capture('specific-popups', 'during', 'banner-found');
        await dismissBanner.click();
        await this.debugScreenshot.capture('specific-popups', 'after', 'banner-clicked');
        await delay(1000);
      } else {
        console.log('🚫 [PopupHandler] No app install banner found');
      }
    } catch (error) {
      console.log('⚠️ [PopupHandler] Error handling specific popups:', error.message);
    }
    
    // Final screenshot after all popup handling
    await this.debugScreenshot.capture('specific-popups', 'after', 'all-complete');
  }

  async handleAllPopups() {
    console.log('🚫 [PopupHandler] Starting comprehensive popup handling workflow');
    
    // Helper function to log current URL
    const logCurrentUrl = async (step) => {
      try {
        const url = this.page.url();
        console.log(`📍 [PopupHandler - ${step}] Current URL: ${url}`);
      } catch (error) {
        console.log(`⚠️ [PopupHandler - ${step}] Could not get URL: ${error.message}`);
      }
    };
    
    await logCurrentUrl('Start');
    await this.debugScreenshot.capture('all-popups', 'before', 'pipeline-start');
    
    console.log('🚀 [PopupHandler] Step 1/3: Handling continue buttons...');
    await this.handleContinueButtons();
    await logCurrentUrl('After Continue Buttons');
    
    console.log('❌ [PopupHandler] Step 2/3: Handling close buttons...');
    await this.handleCloseButtons();
    await logCurrentUrl('After Close Buttons');
    
    console.log('🎯 [PopupHandler] Step 3/3: Handling specific Instagram popups...');
    await this.handleSpecificPopups();
    await logCurrentUrl('After Specific Popups');
    
    await this.debugScreenshot.capture('all-popups', 'after', 'pipeline-complete');
    console.log('✅ [PopupHandler] All popup handling completed successfully');
    await logCurrentUrl('Complete');
  }
  
  updateUsername(username) {
    this.debugScreenshot.updateUsername(username);
  }
}