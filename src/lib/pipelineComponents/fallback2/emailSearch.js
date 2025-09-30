import { simpleParser } from 'mailparser';

export class EmailSearch {
  constructor(imapConnection) {
    this.imapConnection = imapConnection;
  }

  buildSearchCriteria(searchSince) {
    // Calculate time range: current time to 20 minutes ago
    const now = new Date();
    const twentyMinutesAgo = new Date(now.getTime() - 20 * 60 * 1000);
    const since = searchSince || twentyMinutesAgo;
    
    console.log(`🕐 [EmailSearch] Searching emails since: ${since.toISOString()}`);
    console.log(`🕐 [EmailSearch] Current time: ${now.toISOString()}`);
    console.log(`🕐 [EmailSearch] Search window: ${Math.floor((now.getTime() - since.getTime()) / (60 * 1000))} minutes`);
    
    // CRITICAL: node-imap requires Date object for SINCE, not ISO string
    // Also, FROM must be formatted correctly
    const criteria = [
      ['FROM', 'security@mail.instagram.com'],
      ['SINCE', since] // Pass Date object, NOT string
    ];
    
    console.log('🔍 [EmailSearch] Search criteria built for IMAP');
    
    return criteria;
  }

  async searchEmails(searchCriteria) {
    return new Promise((resolve, reject) => {
      const imap = this.imapConnection.getImap();
      
      if (!this.imapConnection.isConnected) {
        reject(new Error('Not connected to Gmail'));
        return;
      }

      console.log('🔍 [EmailSearch] Searching for Instagram emails...');

      imap.search(searchCriteria, (err, results) => {
        if (err) {
          console.error('❌ [EmailSearch] Search error:', err.message);
          reject(err);
          return;
        }

        if (!results || results.length === 0) {
          console.log('📧 [EmailSearch] No Instagram emails found');
          resolve([]);
          return;
        }

        console.log(`📧 [EmailSearch] Found ${results.length} Instagram emails`);
        this.fetchEmailResults(results, resolve, reject);
      });
    });
  }

  fetchEmailResults(results, resolve, reject) {
    const imap = this.imapConnection.getImap();
    const fetch = imap.fetch(results, { 
      bodies: ['HEADER', 'TEXT', ''],
      struct: true
    });
    
    const emails = [];
    
    fetch.on('message', (msg, seqno) => {
      console.log(`📧 [EmailSearch] Processing email ${seqno}`);
      this.processEmailMessage(msg, seqno, emails);
    });
    
    fetch.once('error', (err) => {
      console.error('❌ [EmailSearch] Fetch error:', err.message);
      reject(err);
    });
    
    fetch.once('end', () => {
      console.log(`✅ [EmailSearch] Retrieved ${emails.length} emails`);
      const sortedEmails = this.sortEmailsByDate(emails);
      resolve(sortedEmails);
    });
  }

  processEmailMessage(msg, seqno, emails) {
    let emailData = { seqno };
    let bufferComplete = '';
    
    msg.on('body', (stream, info) => {
      let buffer = '';
      
      stream.on('data', (chunk) => {
        buffer += chunk.toString('utf8');
      });
      
      stream.once('end', async () => {
        if (info.which === '') {
          bufferComplete = buffer;
          // Parse the complete email
          try {
            const parsed = await simpleParser(buffer);
            emailData.parsed = parsed;
            emailData.subject = parsed.subject;
            emailData.from = parsed.from?.text || '';
            emailData.date = parsed.date;
            emailData.html = parsed.html;
            emailData.text = parsed.text;
          } catch (err) {
            console.error('❌ [EmailSearch] Parse error:', err.message);
          }
        }
      });
    });
    
    msg.once('end', () => {
      emails.push(emailData);
    });
  }

  sortEmailsByDate(emails) {
    const sorted = emails.sort((a, b) => {
      const dateA = new Date(a.parsed?.date || a.date || 0);
      const dateB = new Date(b.parsed?.date || b.date || 0);
      return dateB.getTime() - dateA.getTime(); // Latest first
    });
    
    console.log('📅 [EmailSearch] Sorted emails by date (latest first):');
    sorted.forEach((email, index) => {
      const date = new Date(email.parsed?.date || email.date || 0);
      const subject = email.parsed?.subject || email.subject || 'No subject';
      const from = email.parsed?.from?.text || email.from || 'Unknown sender';
      console.log(`   ${index + 1}. ${date.toISOString()} - "${subject}" from ${from}`);
    });
    
    return sorted;
  }
}