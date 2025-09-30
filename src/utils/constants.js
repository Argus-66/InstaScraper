export const USER_AGENTS = [
  // Desktop browsers (12 agents - 75%)
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/118.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/119.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/119.0',
  
  // Mobile phones (2 agents - 12.5%)
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36',
  
  // Tablets (2 agents - 12.5%)
  'Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 13; SM-X906C) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
];


export const POST_SELECTORS = [
  // Simple selectors that should work
  'img',
  'a img',
  'div img'
];

export const VIDEO_SELECTORS = [
  'article video',
  'video[playsinline]',
  '[role="main"] video'
];

export const CONTINUE_BUTTON_SELECTORS = [
  'button[data-testid="mobile-web-login-button"]',
  'a[href="#"]',
  'button:contains("Continue")',
  'a:contains("Continue on web")',
  'a:contains("Continue without app")',
  'button:contains("Not now")',
  'button:contains("Close")',
  '[role="button"]:contains("Continue")',
  'div[role="button"]:contains("Continue")',
  'span:contains("Continue on web")',
  'div:contains("Continue without downloading")',
];

export const CLOSE_BUTTON_SELECTORS = [
  'button[aria-label="Close"]',
  'button[aria-label="close"]',
  'svg[aria-label="Close"]',
  '[data-testid="modal-close-button"]',
  '[data-testid="close-button"]',
  'button:has(svg[aria-label="Close"])',
  '[role="button"][aria-label="Close"]',
  'div[role="button"]:has(svg)',
  'button > svg[viewBox="0 0 24 24"]',
  'span[aria-label="Close"]',
  '.close',
  '.modal-close',
  'button[title="Close"]',
  '[aria-label="Dismiss"]',
  'button:contains("×")',
  'button:contains("✕")',
  'button:contains("Close")',
];

export const BROWSER_ARGS = [
  '--no-sandbox', 
  '--disable-setuid-sandbox',
  '--disable-blink-features=AutomationControlled',
  '--disable-web-security',
  '--disable-features=VizDisplayCompositor'
];