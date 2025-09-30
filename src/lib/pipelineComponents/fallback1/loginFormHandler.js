import { delay } from "@/utils/utils";

export class LoginFormHandler {
  constructor(page, debugScreenshot, credentials) {
    this.page = page;
    this.debugScreenshot = debugScreenshot;
    this.credentials = credentials;
  }

  async fillAndSubmit() {
    console.log("🔑 [LoginFormHandler] Filling and submitting login form...");

    try {
      await this._waitForLoginForm();
      await this._fillUsername();
      await this._fillPassword();
      await this._submitForm();
      
      return true;
    } catch (error) {
      console.error(`❌ [LoginFormHandler] Error: ${error.message}`);
      return false;
    }
  }

  async _waitForLoginForm() {
    console.log("⏳ [LoginFormHandler] Waiting for login form...");
    await this.page.waitForSelector('input[name="username"]', { timeout: 15000 });
    await delay(2000);
    await this.debugScreenshot.capture("login-process", "step1", "login-page-loaded");
  }

  async _fillUsername() {
    console.log("👤 [LoginFormHandler] Entering username...");
    const usernameField = await this.page.$('input[name="username"]');
    await usernameField.click({ clickCount: 3 });
    await usernameField.type(this.credentials.username, { delay: 150 });
    await delay(1000);
    await this.debugScreenshot.capture("login-process", "step2", "username-entered");
  }

  async _fillPassword() {
    console.log("🔒 [LoginFormHandler] Entering password...");
    const passwordField = await this.page.$('input[name="password"]');
    await passwordField.click({ clickCount: 3 });
    await passwordField.type(this.credentials.password, { delay: 150 });
    await delay(1000);
    await this.debugScreenshot.capture("login-process", "step3", "password-entered");
  }

  async _submitForm() {
    console.log("🚀 [LoginFormHandler] Looking for login button...");
    
    const loginButtonSelectors = [
      'button[type="submit"]',
      'button:contains("Log in")',
      'button:contains("Log In")',
      'div[role="button"]:contains("Log in")',
      "button._acan._acap._acas._aj1-._ap30",
      'button[class*="_acan"]',
    ];

    const loginButton = await this._findLoginButton(loginButtonSelectors);
    
    if (loginButton) {
      await loginButton.click();
    } else {
      await this._submitWithEnterKey();
    }

    await this.debugScreenshot.capture("login-process", "step4", "login-button-clicked");
    console.log("⏳ [LoginFormHandler] Waiting for login response...");
    await delay(8000);
    await this.debugScreenshot.capture("login-process", "step5", "login-response-received");
  }

  async _findLoginButton(selectors) {
    for (const selector of selectors) {
      try {
        const button = await this.page.$(selector);
        if (button) {
          console.log(`✅ [LoginFormHandler] Found login button with selector: ${selector}`);
          return button;
        }
      } catch (e) {
        // Try next selector
      }
    }
    return null;
  }

  async _submitWithEnterKey() {
    console.log("🔄 [LoginFormHandler] No button found, trying Enter key...");
    const passwordField = await this.page.$('input[name="password"]');
    await passwordField.press("Enter");
  }
}