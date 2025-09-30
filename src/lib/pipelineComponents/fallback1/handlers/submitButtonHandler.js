import { delay } from "@/utils/utils";

export class SubmitButtonHandler {
  constructor(page) {
    this.page = page;
  }

  async submitVerification(codeField) {
    console.log('🚀 [SubmitButtonHandler] Submitting verification code...');
    
    const buttonClicked = await this.clickSubmitButton();
    
    if (!buttonClicked) {
      await this.pressEnterKey(codeField);
    }
    
    console.log('✅ [SubmitButtonHandler] Verification submitted!');
  }

  async clickSubmitButton() {
    const submitButtonSelectors = [
      'button[type="submit"]',
      'button:contains("Confirm")',
      'button:contains("Verify")',
      'button:contains("Continue")',
      'button:contains("Next")',
      'div[role="button"]:contains("Confirm")',
      'div[role="button"]:contains("Continue")',
      'form button',
      'button[class*="continue"]',
      'button[data-testid*="continue"]'
    ];

    for (const selector of submitButtonSelectors) {
      const button = await this.findButtonBySelector(selector);
      if (button) {
        await button.click();
        console.log(`✅ [SubmitButtonHandler] Clicked submit button with: ${selector}`);
        return true;
      }
    }
    
    return false;
  }

  async findButtonBySelector(selector) {
    try {
      if (selector.includes(':contains')) {
        const text = selector.split(':contains("')[1].split('")')[0];
        const elements = await this.page.$x(`//button[contains(text(), '${text}')]`);
        return elements.length > 0 ? elements[0] : null;
      } else {
        return await this.page.$(selector);
      }
    } catch (e) {
      return null;
    }
  }

  async pressEnterKey(codeField) {
    console.log('🔄 [SubmitButtonHandler] No submit button found, trying Enter key...');
    await codeField.press('Enter');
  }
}