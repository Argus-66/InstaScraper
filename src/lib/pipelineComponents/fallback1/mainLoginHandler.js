import { delay } from "@/utils/utils";
import GmailReader from "../fallback2/main.js";
import { EmailVerificationHandler } from "./emailVerificationHandler.js";
import { PopupHandler } from "./popupHandler.js";
import { LoginFormHandler } from "./loginFormHandler.js";

export class MainLoginHandler {
  constructor(page, username = "unknown", gmailCredentials = {}) {
    this.page = page;
    this.username = username;
    
    this._initializeConfiguration(gmailCredentials);
    this._initializeComponents();
    
    this.isLoggedIn = false;
  }

  _initializeConfiguration(gmailCredentials) {
    this.credentials = {
      username: process.env.INSTAGRAM_USERNAME || "",
      password: process.env.INSTAGRAM_PASSWORD || ""
    };
    
    this.gmailConfig = {
      email: gmailCredentials.email || process.env.GMAIL_EMAIL || "",
      appPassword: gmailCredentials.appPassword || process.env.GMAIL_APP_PASSWORD || "",
      ...gmailCredentials
    };
  }

  _initializeComponents() {
    // Debug Screenshot
    const { DebugScreenshot } = require("../../../utils/debugScreenshot.js");
    this.debugScreenshot = new DebugScreenshot(this.page, `login-${this.username}`);
    
    // Gmail Reader
    this.gmailReader = new GmailReader(this.gmailConfig);
    this.emailVerificationEnabled = true;
    
    // Handlers
    this.emailVerificationHandler = new EmailVerificationHandler(
      this.page,
      this.gmailReader,
      this.debugScreenshot,
      this.username
    );
    
    this.popupHandler = new PopupHandler(this.page, this.debugScreenshot);
    this.loginFormHandler = new LoginFormHandler(this.page, this.debugScreenshot, this.credentials);
  }

  async isLoginRequired() {
    console.log("🔍 [LoginHandler] Checking if login is required...");

    try {
      const currentUrl = this.page.url();
      console.log(`📍 [LoginHandler] Current URL: ${currentUrl}`);

      const loginRequired = currentUrl.includes("accounts/login");
      console.log(loginRequired ? 
        "🔐 [LoginHandler] Login required - on login page" : 
        "✅ [LoginHandler] No login required - not on login page"
      );

      return loginRequired;
    } catch (error) {
      console.log(`❌ [LoginHandler] Error checking login requirement: ${error.message}`);
      return false;
    }
  }

  async performLogin() {
    console.log("🔑 [LoginHandler] Starting login process...");
    
    this.loginStartTime = Date.now();
    console.log(`⏰ [LoginHandler] Login started at: ${new Date(this.loginStartTime).toISOString()}`);

    try {
      await this._navigateToLoginPage();
      
      const formSubmitted = await this.loginFormHandler.fillAndSubmit();
      if (!formSubmitted) return false;

      const verificationSuccess = await this._handleEmailVerificationIfRequired();
      if (!verificationSuccess) return false;

      const loginSuccess = await this.checkLoginSuccess();
      
      if (loginSuccess) {
        await this._handleSuccessfulLogin();
        return true;
      } else {
        await this._handleFailedLogin();
        return false;
      }
    } catch (error) {
      console.error(`❌ [LoginHandler] Login error: ${error.message}`);
      return false;
    }
  }

  async _navigateToLoginPage() {
    const currentUrl = this.page.url();
    if (!currentUrl.includes("/accounts/login/")) {
      console.log("📍 [LoginHandler] Navigating to login page...");
      await this.page.goto("https://www.instagram.com/accounts/login/", {
        waitUntil: "networkidle2",
        timeout: 30000,
      });
      await delay(3000);
    }
  }

  async _handleEmailVerificationIfRequired() {
    const emailVerificationRequired = await this.emailVerificationHandler.isRequired();
    
    if (emailVerificationRequired) {
      console.log('📧 [LoginHandler] Email verification required, handling...');
      return await this.emailVerificationHandler.handle(this.loginStartTime);
    }
    
    return true;
  }

  async _handleSuccessfulLogin() {
    console.log("✅ [LoginHandler] Login successful!");
    this.isLoggedIn = true;
    await this.popupHandler.handlePostLoginPopups();
  }

  async _handleFailedLogin() {
    await this.logLoginErrors();
    console.log("❌ [LoginHandler] Login failed");
  }

  async checkLoginSuccess() {
    try {
      const currentUrl = this.page.url();
      console.log(`📍 [LoginHandler] Post-login URL: ${currentUrl}`);

      const loginSuccess = await this.page.evaluate(() => {
        const indicators = {
          notOnLoginPage: !window.location.href.includes("/accounts/login/"),
          noErrorMessage: !document.querySelector('[role="alert"]'),
        };

        console.log("🔍 Login success indicators:", indicators);
        return indicators.notOnLoginPage && indicators.noErrorMessage;
      });

      return loginSuccess;
    } catch (error) {
      console.log(`❌ [LoginHandler] Error checking login success: ${error.message}`);
      return false;
    }
  }

  async navigateToProfile(targetUsername) {
    console.log(`🌍 [LoginHandler] Navigating to profile: ${targetUsername}`);

    try {
      const profileUrl = `https://www.instagram.com/${targetUsername}/`;
      console.log(`📍 [LoginHandler] Target profile URL: ${profileUrl}`);

      await this.page.goto(profileUrl, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      await delay(3000);
      return true;
    } catch (error) {
      console.error(`❌ [LoginHandler] Error navigating to profile: ${error.message}`);
      return false;
    }
  }

  async loginWithRetry(targetUsername, maxAttempts = 2) {
    console.log(`🔄 [LoginHandler] Starting login workflow for ${targetUsername} (max ${maxAttempts} attempts)`);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`🔄 [LoginHandler] Login attempt ${attempt}/${maxAttempts}`);

      const success = await this._attemptLoginWithNavigation(targetUsername);
      if (success) return true;

      if (attempt < maxAttempts) {
        console.log(`🔄 [LoginHandler] Waiting before retry...`);
        await delay(5000);
      }
    }

    console.log(`❌ [LoginHandler] All login attempts failed`);
    return false;
  }

  async _attemptLoginWithNavigation(targetUsername) {
    try {
      const loginSuccess = await this.performLogin();
      if (loginSuccess) {
        const navSuccess = await this.navigateToProfile(targetUsername);
        if (navSuccess) {
          console.log(`✅ [LoginHandler] Login workflow completed successfully`);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error(`❌ [LoginHandler] Attempt error: ${error.message}`);
      return false;
    }
  }

  async logLoginErrors() {
    try {
      const errorMessages = await this.page.evaluate(() => {
        const errors = [];
        const errorSelectors = [
          '[role="alert"]',
          ".error",
          '[id*="error"]',
          ".invalid-feedback",
          '[data-testid="login-error"]',
        ];

        errorSelectors.forEach((selector) => {
          const elements = document.querySelectorAll(selector);
          elements.forEach((el) => {
            if (el.textContent && el.textContent.trim()) {
              errors.push(el.textContent.trim());
            }
          });
        });

        const bodyText = document.body.innerText.toLowerCase();
        if (bodyText.includes("incorrect username") || bodyText.includes("wrong password")) {
          errors.push("Invalid credentials detected in page content");
        }
        if (bodyText.includes("try again later")) {
          errors.push("Rate limit or temporary block detected");
        }

        return errors;
      });

      if (errorMessages.length > 0) {
        console.log("🚨 [LoginHandler] Login errors detected:");
        errorMessages.forEach((msg, i) => console.log(`   ${i + 1}. ${msg}`));
      }
    } catch (error) {
      console.log("⚠️ [LoginHandler] Could not check for login errors");
    }
  }

  async testGmailConnection() {
    if (!this.emailVerificationEnabled) {
      console.log('⚠️ [LoginHandler] Gmail credentials not configured');
      return false;
    }

    try {
      console.log('🧪 [LoginHandler] Testing Gmail connection...');
      const result = await this.gmailReader.testConnection();
      console.log(result ? 
        '✅ [LoginHandler] Gmail connection test successful' : 
        '❌ [LoginHandler] Gmail connection test failed'
      );
      return result;
    } catch (error) {
      console.error(`❌ [LoginHandler] Gmail test error: ${error.message}`);
      return false;
    }
  }

  getLoginStatus() {
    return {
      isLoggedIn: this.isLoggedIn,
      username: this.credentials.username,
      emailVerificationEnabled: this.emailVerificationEnabled
    };
  }
}