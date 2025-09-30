/**
 * Centralized screenshot utility for debugging the Instagram scraping pipeline
 * Uses only 5 fixed filenames that get overwritten on each request
 */

export class DebugScreenshot {
  constructor(page, username = 'unknown') {
    this.page = page;
    this.username = username;
    this.screenshotCounter = 0;
    this.maxScreenshots = 5;
  }

  /**
   * Take a screenshot with fixed naming (debug-1.png to debug-5.png)
   * @param {string} operation - The operation being performed (for logging only)
   * @param {string} stage - The stage within the operation (for logging only)
   * @param {string} detail - Additional detail (for logging only)
   */
  async capture(operation, stage = 'during', detail = '') {
    try {
      this.screenshotCounter = (this.screenshotCounter % this.maxScreenshots) + 1;
      const filename = `debug-${this.screenshotCounter}.png`;
      
      await this.page.screenshot({ 
        path: filename,
        fullPage: false
      });
      
      console.log(`📸 Debug screenshot saved: ${filename} (${operation}-${stage}${detail ? `-${detail}` : ''})`);
      return filename;
    } catch (error) {
      console.log(`❌ Failed to take screenshot for ${operation}-${stage}: ${error.message}`);
      return null;
    }
  }

  /**
   * Take a full page screenshot (still uses fixed naming)
   */
  async captureFullPage(operation, stage = 'full', detail = '') {
    try {
      this.screenshotCounter = (this.screenshotCounter % this.maxScreenshots) + 1;
      const filename = `debug-${this.screenshotCounter}.png`;
      
      await this.page.screenshot({ 
        path: filename,
        fullPage: true
      });
      
      console.log(`📸 Full page screenshot saved: ${filename} (${operation}-${stage}${detail ? `-${detail}` : ''})`);
      return filename;
    } catch (error) {
      console.log(`❌ Failed to take full page screenshot for ${operation}-${stage}: ${error.message}`);
      return null;
    }
  }

  /**
   * Capture element-specific screenshot (uses fixed naming)
   */
  async captureElement(selector, operation, detail = 'element') {
    try {
      const element = await this.page.$(selector);
      if (!element) {
        console.log(`⚠️  Element not found for screenshot: ${selector}`);
        return null;
      }

      this.screenshotCounter = (this.screenshotCounter % this.maxScreenshots) + 1;
      const filename = `debug-${this.screenshotCounter}.png`;
      
      await element.screenshot({ 
        path: filename
      });
      
      console.log(`📸 Element screenshot saved: ${filename} (${operation}-${detail})`);
      return filename;
    } catch (error) {
      console.log(`❌ Failed to take element screenshot for ${operation}: ${error.message}`);
      return null;
    }
  }

  /**
   * Quick screenshot (uses fixed naming)
   */
  async quick(name) {
    try {
      this.screenshotCounter = (this.screenshotCounter % this.maxScreenshots) + 1;
      const filename = `debug-${this.screenshotCounter}.png`;
      
      await this.page.screenshot({ path: filename });
      console.log(`📸 Quick screenshot: ${filename} (${name})`);
      return filename;
    } catch (error) {
      console.log(`❌ Quick screenshot failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Update username for subsequent screenshots
   */
  updateUsername(username) {
    this.username = username;
  }
}

// Export convenience functions
export const createDebugScreenshot = (page, username) => new DebugScreenshot(page, username);