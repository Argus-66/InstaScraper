import { ImapConnection } from './imapConnection';
import { EmailSearch } from './emailSearch';
import { CodeExtractor } from './codeExtractor';
import { CodeWaiter } from './codeWaiter';

export class GmailReader {
  constructor(credentials) {
    this.connection = new ImapConnection(credentials);
    this.emailSearch = new EmailSearch(this.connection);
    this.codeExtractor = new CodeExtractor();
    this.codeWaiter = new CodeWaiter(this.emailSearch, this.codeExtractor);
  }

  async connect() {
    return this.connection.connect();
  }

  disconnect() {
    this.connection.disconnect();
  }

  async searchInstagramEmails(searchCriteria = {}) {
    const criteria = this.emailSearch.buildSearchCriteria(searchCriteria.since);
    return this.emailSearch.searchEmails(criteria);
  }

  extractVerificationCode(email) {
    return this.codeExtractor.extractVerificationCode(email);
  }

  async waitForVerificationCode(options = {}) {
    return this.codeWaiter.waitForVerificationCode(options);
  }

  async testConnection() {
    try {
      console.log('🧪 [GmailReader] Testing Gmail connection...');
      
      await this.connect();
      await this.connection.openInbox();
      
      this.disconnect();
      return true;
      
    } catch (error) {
      console.error('❌ [GmailReader] Connection test failed:', error.message);
      return false;
    }
  }

  getConnectionStatus() {
    return this.connection.getConnectionStatus();
  }
}

// Helper function to create Gmail reader instance
export function createGmailReader(credentials = {}) {
  return new GmailReader(credentials);
}

export default GmailReader;