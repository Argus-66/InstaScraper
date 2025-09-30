export class CodeWaiter {
  constructor(emailSearch, codeExtractor) {
    this.emailSearch = emailSearch;
    this.codeExtractor = codeExtractor;
    this.lastCheckedCode = null; // Track last code to avoid duplicates
    this.processedEmailIds = new Set(); // Track processed emails
  }

  async waitForVerificationCode(options = {}) {
    const {
      timeout = 120000, // 2 minutes
      pollInterval = 5000, // 5 seconds
      maxRetries = 24, // 24 * 5s = 120s
      onCodeFound = null // Callback when code is found for verification attempt
    } = options;

    console.log(`⏳ [CodeWaiter] Waiting for Instagram verification code (timeout: ${timeout}ms)...`);
    console.log(`🔄 [CodeWaiter] Will fetch fresh emails every ${pollInterval}ms between verification attempts`);
    
    let retries = 0;
    const startTime = Date.now();

    while (this.shouldContinueWaiting(retries, maxRetries, startTime, timeout)) {
      try {
        console.log(`\n🔍 [CodeWaiter] === Attempt ${retries + 1}/${maxRetries} ===`);
        
        // Fetch fresh emails on each attempt
        const code = await this.pollForCode(options.since);
        
        if (code) {
          console.log(`✅ [CodeWaiter] New verification code found: ${code}`);
          
          // If callback provided, try verification immediately
          if (onCodeFound) {
            console.log(`🔐 [CodeWaiter] Attempting verification with code: ${code}`);
            const verificationResult = await onCodeFound(code);
            
            if (verificationResult.success) {
              console.log(`✅ [CodeWaiter] Verification successful with code: ${code}`);
              return code;
            } else {
              console.log(`❌ [CodeWaiter] Verification failed with code: ${code}`);
              console.log(`📝 [CodeWaiter] Reason: ${verificationResult.reason || 'Unknown'}`);
              
              // Mark this code as tried
              this.lastCheckedCode = code;
              
              // Continue to next iteration to fetch new emails
              retries++;
              console.log(`🔄 [CodeWaiter] Will fetch fresh emails in ${pollInterval}ms...`);
              await this.delay(pollInterval);
              continue;
            }
          } else {
            // No callback, just return the code
            return code;
          }
        }

        retries++;
        console.log(`❌ [CodeWaiter] No new code found on attempt ${retries}`);
        console.log(`🔄 [CodeWaiter] Waiting ${pollInterval}ms before next attempt...`);
        await this.delay(pollInterval);

      } catch (error) {
        retries = await this.handlePollError(error, retries, maxRetries, pollInterval);
      }
    }

    console.log('⏰ [CodeWaiter] Timeout waiting for verification code');
    throw new Error('Timeout waiting for Instagram verification code');
  }

  shouldContinueWaiting(retries, maxRetries, startTime, timeout) {
    return retries < maxRetries && (Date.now() - startTime) < timeout;
  }

  async pollForCode(searchSince) {
    // Search emails from 20 minutes ago to now
    const now = new Date();
    const twentyMinutesAgo = new Date(now.getTime() - 20 * 60 * 1000);
    const since = searchSince || twentyMinutesAgo;
    
    console.log(`🔍 [CodeWaiter] Fetching fresh emails since: ${since.toISOString()}`);
    console.log(`🌍 [CodeWaiter] Current server time: ${now.toISOString()}`);
    console.log(`🔍 [CodeWaiter] Search window: ${Math.floor((now.getTime() - since.getTime()) / (60 * 1000))} minutes`);
    
    // Ensure Gmail connection is established before searching
    await this.ensureGmailConnection();
    
    const emails = await this.emailSearch.searchEmails(
      this.emailSearch.buildSearchCriteria(since)
    );
    
    console.log(`📧 [CodeWaiter] Found ${emails.length} total emails in this fetch`);

    return this.findCodeInEmails(emails);
  }

  findCodeInEmails(emails) {
    // Prioritize "Verify your account" emails from security@mail.instagram.com
    const priorityEmails = emails.filter(email => {
      const subject = email.parsed?.subject || email.subject || '';
      const from = email.parsed?.from?.text || email.from || '';
      const isVerifyAccount = subject.toLowerCase().includes('verify your account');
      const isFromSecurity = from.toLowerCase().includes('security@mail.instagram.com');
      return isVerifyAccount && isFromSecurity;
    });
    
    const otherEmails = emails.filter(email => {
      const subject = email.parsed?.subject || email.subject || '';
      const from = email.parsed?.from?.text || email.from || '';
      const isVerifyAccount = subject.toLowerCase().includes('verify your account');
      const isFromSecurity = from.toLowerCase().includes('security@mail.instagram.com');
      return !(isVerifyAccount && isFromSecurity);
    });
    
    // Process priority emails first (already sorted by date, latest first)
    const orderedEmails = [...priorityEmails, ...otherEmails];
    
    console.log(`🎯 [CodeWaiter] Processing ${priorityEmails.length} priority "Verify your account" emails first`);
    console.log(`📋 [CodeWaiter] Then ${otherEmails.length} other Instagram emails`);
    
    for (const email of orderedEmails) {
      const subject = email.parsed?.subject || email.subject || 'unknown';
      const from = email.parsed?.from?.text || email.from || 'unknown';
      const date = email.parsed?.date || 'unknown';
      const emailId = `${from}-${subject}-${date}`; // Create unique ID
      
      console.log(`\n📧 [CodeWaiter] Checking email:`);
      console.log(`   From: ${from}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   Date: ${date}`);
      
      // Skip if we've already processed this email
      if (this.processedEmailIds.has(emailId)) {
        console.log(`⏭️  [CodeWaiter] Already processed this email, skipping...`);
        continue;
      }
      
      const code = this.codeExtractor.extractVerificationCode(email);
      
      if (code) {
        // Skip if this is the same code we just tried
        if (code === this.lastCheckedCode) {
          console.log(`⏭️  [CodeWaiter] Code ${code} already tried, skipping...`);
          this.processedEmailIds.add(emailId);
          continue;
        }
        
        console.log(`✅ [CodeWaiter] NEW verification code found: ${code}`);
        console.log(`📧 [CodeWaiter] From email: "${subject}"`);
        console.log(`📅 [CodeWaiter] Email date: ${date}`);
        
        // Mark as processed
        this.processedEmailIds.add(emailId);
        
        return code;
      } else {
        console.log(`❌ [CodeWaiter] No code found in this email`);
      }
    }

    console.log(`\n📭 [CodeWaiter] No new codes found in this batch`);
    return null;
  }

  async handlePollError(error, retries, maxRetries, pollInterval) {
    console.error(`❌ [CodeWaiter] Error during retry ${retries}:`, error.message);
    console.error(`❌ [CodeWaiter] Full error:`, error);
    retries++;
    
    if (retries < maxRetries) {
      console.log(`🔄 [CodeWaiter] Retrying in ${pollInterval}ms...`);
      await this.delay(pollInterval);
    }
    
    return retries;
  }

  async ensureGmailConnection() {
    const connection = this.emailSearch.imapConnection;
    
    if (!connection.isConnected) {
      console.log('📧 [CodeWaiter] Gmail not connected, establishing connection...');
      await connection.connect();
      await connection.openInbox();
      console.log('✅ [CodeWaiter] Gmail connection established');
    }
  }

  // Reset tracking when starting a new verification session
  resetTracking() {
    console.log('🔄 [CodeWaiter] Resetting code tracking for new session');
    this.lastCheckedCode = null;
    this.processedEmailIds.clear();
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}