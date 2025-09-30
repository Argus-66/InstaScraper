export class VerificationCodeService {
  constructor(gmailReader) {
    this.gmailReader = gmailReader;
  }

  async getVerificationCode(loginStartTime) {
    console.log('⏳ [VerificationCodeService] Waiting for verification code via email...');
    
    const indiaOffset = 5.5 * 60 * 60 * 1000;
    const searchTime = new Date(loginStartTime - 60000);
    
    console.log(`🌍 [VerificationCodeService] Login started (India time): ${new Date(loginStartTime + indiaOffset).toISOString()}`);
    console.log(`🌍 [VerificationCodeService] Searching emails from (UTC): ${searchTime.toISOString()}`);
    
    const verificationCode = await this.gmailReader.waitForVerificationCode({
      timeout: 120000,
      pollInterval: 5000,
      since: searchTime
    });

    console.log('\n🎯 ================================');
    console.log(`📧 VERIFICATION CODE RECEIVED: ${verificationCode}`);
    console.log('🎯 ================================\n');
    
    return verificationCode;
  }

  disconnect() {
    try {
      this.gmailReader.disconnect();
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}