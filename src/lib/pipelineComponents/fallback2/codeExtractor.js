export class CodeExtractor {
  constructor() {
    this.patterns = this.buildPatterns();
  }

  buildPatterns() {
    return [
      // "please use the following code to confirm your identity: 019746"
      /following\s+code\s+to\s+confirm\s+your\s+identity[:\s]+(\d{6})/i,
      
      // "use the following code: 123456"
      /use\s+the\s+following\s+code[:\s]+(\d{6})/i,
      
      // "confirm your identity: 123456"
      /confirm\s+your\s+identity[:\s]+(\d{6})/i,
      
      // "Your Instagram confirmation code is 123456"
      /(?:confirmation|verification|security)\s+code\s+is\s+(\d{6})/i,
      
      // "123456 is your Instagram code"
      /(\d{6})\s+is\s+your\s+instagram\s+code/i,
      
      // "Enter this code: 123456"
      /enter\s+this\s+code\s*[:]\s*(\d{6})/i,
      
      // "Code: 123456" or "Code 123456"
      /code\s*[:]\s*(\d{6})/i,
      
      // Stand-alone 6-digit code
      /^\s*(\d{6})\s*$/m,
      
      // Just 6 consecutive digits (fallback)
      /\b(\d{6})\b/,
      
      // Instagram specific patterns
      /instagram.*?(\d{6})/i,
      
      // "Your code is 123456"
      /your\s+code\s+is\s+(\d{6})/i
    ];
  }

  extractVerificationCode(email) {
    console.log('🔍 [CodeExtractor] Extracting verification code from email...');
    
    const sender = email.parsed?.from?.text || email.from || 'unknown';
    const subject = email.parsed?.subject || email.subject || 'unknown';
    const textPreview = (email.parsed?.text || email.text || '').substring(0, 200);
    const date = new Date(email.parsed?.date || email.date || 0);
    
    console.log(`📧 [CodeExtractor] Email from: ${sender}`);
    console.log(`📧 [CodeExtractor] Email subject: ${subject}`);
    console.log(`📧 [CodeExtractor] Email date: ${date.toISOString()}`);
    console.log(`📧 [CodeExtractor] Text preview: ${textPreview}`);
    
    // Prioritize "Verify your account" emails from security@mail.instagram.com
    const isVerifyAccountEmail = subject.includes('Verify your account');
    const isFromSecurityInstagram = sender.includes('security@mail.instagram.com');
    
    if (isVerifyAccountEmail && isFromSecurityInstagram) {
      console.log('✅ [CodeExtractor] Priority email found: "Verify your account" from security@mail.instagram.com');
    }
    
    if (!this.isFromInstagram(sender)) {
      console.log(`⚠️ [CodeExtractor] Email not from Instagram: ${sender}`);
      return null;
    }
    
    console.log(`✅ [CodeExtractor] Email is from Instagram: ${sender}`);
    
    if (!this.hasEmailContent(email)) {
      console.log('❌ [CodeExtractor] No email content to parse');
      return null;
    }

    return this.extractFromAllTextSources(email);
  }

  isFromInstagram(sender) {
    return sender.toLowerCase().includes('instagram.com') || 
           sender.toLowerCase().includes('security@mail.instagram.com') ||
           sender.toLowerCase().includes('mail.instagram.com');
  }

  hasEmailContent(email) {
    return !!(email.text || email.html || email.parsed?.text);
  }

  extractFromAllTextSources(email) {
    const textSources = [
      email.parsed?.text,
      email.text,
      email.parsed?.html,
      email.html
    ].filter(Boolean);

    for (const text of textSources) {
      const code = this.extractCodeFromText(text);
      if (code) {
        console.log(`✅ [CodeExtractor] Found verification code: ${code}`);
        return code;
      }
    }

    console.log('❌ [CodeExtractor] No verification code found in email');
    return null;
  }

  extractCodeFromText(text) {
    if (!text) return null;

    console.log('🔍 [CodeExtractor] Analyzing text for verification code...');
    
    for (let i = 0; i < this.patterns.length; i++) {
      const pattern = this.patterns[i];
      const match = text.match(pattern);
      
      if (match && match[1]) {
        const code = match[1];
        console.log(`✅ [CodeExtractor] Code found with pattern ${i + 1}: ${code}`);
        
        if (/^\d{6}$/.test(code)) {
          return code;
        }
      }
    }

    return null;
  }
}