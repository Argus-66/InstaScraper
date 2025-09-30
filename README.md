# 🔍 InstaScope

**Advanced Instagram Intelligence with Precision Analytics**

InstaScope is a powerful Instagram analytics tool that provides comprehensive insights into Instagram profiles and posts using advanced AI analysis and audience demographics. Built with Next.js and powered by Google Gemini AI.

![InstaScope](https://img.shields.io/badge/Next.js-15.5.4-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-blue?style=for-the-badge&logo=react)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![AI Powered](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-orange?style=for-the-badge&logo=google)

## ✨ Features

### 📊 **Profile Analytics**
- **Complete Profile Scraping**: Extract followers, following, posts count, bio, and engagement metrics
- **Engagement Analysis**: Calculate average likes, comments, and engagement rates
- **Post Performance**: Detailed analysis of individual post metrics

### 🤖 **AI-Powered Analysis**
- **Content Intelligence**: AI analysis of post content, captions, and themes
- **Sentiment Analysis**: Understand the emotional tone of posts
- **Category Detection**: Automatic classification of content types
- **Engagement Insights**: AI-driven recommendations for better engagement

### 🌍 **Audience Demographics**
- **Geographic Distribution**: Visual bubble chart showing audience locations
- **Country Analysis**: Percentage breakdown by country with flag colors
- **Celebrity Detection**: Automatic recognition of famous accounts (>10k followers)
- **AI-Enhanced Demographics**: Advanced analysis for high-follower accounts

### 🎨 **Modern UI/UX**
- **Dark Theme**: Sophisticated dark interface with red accent colors
- **Glass Morphism**: Beautiful backdrop blur effects
- **Responsive Design**: Optimized for all screen sizes
- **Interactive Charts**: LeetCode-style bubble visualizations
- **Real-time Updates**: Live progress indicators and loading states

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Gemini API key
- Instagram account credentials

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd scrapper
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Setup environment variables**
Create a `.env` file in the root directory:
```env
# Google Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Instagram Login Credentials  
INSTAGRAM_USERNAME=your_instagram_username
INSTAGRAM_PASSWORD=your_instagram_password

# Gmail Credentials for Email Verification (optional)
GMAIL_EMAIL=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_app_password
```

4. **Run the development server**
```bash
npm run dev
# or
yarn dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 15.5.4** - React framework with App Router
- **React 19.1.0** - Latest React with concurrent features
- **TailwindCSS 4.0** - Utility-first CSS framework
- **CSS Animations** - Custom bounce and fade effects

### **Backend & APIs**
- **Next.js API Routes** - Serverless API endpoints
- **Google Gemini AI** - Advanced language model for analysis
- **Puppeteer** - Web scraping and automation
- **Chromium** - Headless browser engine

### **Data Processing**
- **AI Analysis Pipeline** - Multi-stage content processing
- **Rate Limiting** - Intelligent request throttling
- **Error Handling** - Comprehensive retry logic
- **Data Validation** - Input sanitization and validation

## 📝 Usage

### **Basic Profile Analysis**
1. Enter an Instagram username in the search field
2. Click "Analyze Profile" or press Enter
3. Wait for the scraping and AI analysis to complete
4. View comprehensive analytics dashboard

### **Famous Profile Suggestions**
Try these pre-loaded famous profiles:
- `therock` - Dwayne Johnson
- `ferrari` - Ferrari Official
- `nasa` - NASA
- `nike` - Nike Official
- `google` - Google

### **Understanding Results**

#### **Profile Metrics**
- **Total Reach**: Combined followers and engagement
- **Excellence Metrics**: AI-calculated quality score
- **Engagement Analytics**: Like-to-comment ratios
- **Content Diversity**: Variety of post types

#### **Demographics Chart**
- **Bubble Size**: Represents audience percentage
- **Colors**: Based on country flag colors
- **Position**: Packed layout similar to LeetCode
- **Disclaimer**: Estimates based on AI analysis

## 🔧 Configuration

### **AI Analysis Settings**
```javascript
// Retry configuration
const RETRY_DELAYS = [2000, 5000, 10000]; // Exponential backoff
const MAX_RETRIES = 3;

// Model selection
const AI_MODEL = "models/gemini-2.5-flash"; // Fast and efficient
```

### **Scraping Configuration**
```javascript
// Browser settings
const BROWSER_CONFIG = {
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
};

// Timeouts
const PAGE_TIMEOUT = 30000;
const ELEMENT_TIMEOUT = 10000;
```

## 🚨 Rate Limiting & Best Practices

### **API Limits**
- **Gemini AI**: Automatic retry with exponential backoff
- **Instagram**: Respectful scraping with delays
- **Error Handling**: Graceful degradation on failures

### **Usage Guidelines**
- Don't overuse the tool to avoid IP blocking
- Respect Instagram's terms of service
- Use for educational and research purposes
- Consider implementing additional delays for production

## 🛡️ Security

### **Environment Variables**
- Never commit `.env` files to version control
- Use strong, unique passwords
- Enable 2FA on Instagram accounts
- Use Gmail app passwords instead of main password

### **Data Privacy**
- No user data is stored permanently
- All analysis happens in real-time
- Credentials are used only for authentication
- No data sharing with third parties

## 🐛 Troubleshooting

### **Common Issues**

#### **503 Service Unavailable**
```
Error: The model is overloaded. Please try again later.
```
**Solution**: Google's Gemini API is temporarily overloaded. Wait and retry.

#### **Instagram Login Failed**
```
Error: Login credentials invalid
```
**Solution**: Check username/password in `.env` file. Enable 2FA if required.

#### **Model Not Found**
```
Error: models/gemini-pro is not found
```
**Solution**: Update to `models/gemini-2.5-flash` in API routes.

### **Performance Optimization**
- Use `--turbopack` for faster builds
- Enable browser caching for static assets
- Implement request debouncing for searches
- Use React.memo for expensive components

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

InstaScope is for educational and research purposes only. Users are responsible for complying with Instagram's Terms of Service and applicable laws. The demographic data provided is estimated and may not be 100% accurate.

## 🙏 Acknowledgments

- **Google Gemini AI** for powerful language processing
- **Next.js Team** for the excellent React framework  
- **TailwindCSS** for the utility-first styling approach
- **Puppeteer** for reliable web automation
- **Instagram** for the social platform that makes this analysis possible

---

**Made with ❤️ by the InstaScope Team**

For support or questions, please open an issue on GitHub.
