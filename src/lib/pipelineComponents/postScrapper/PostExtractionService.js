import { delay } from '@/utils/utils.js';

export class PostExtractionService {
  
  static async extractPostsWithEngagement(page, maxPosts = 10, debugScreenshot = null) {
    console.log('🎯 Starting enhanced post extraction with engagement...');
    
    const posts = [];
    const seenUrls = new Set();
    
    try {
      // First, get all post links from the profile grid
      const postLinks = await page.$$eval(
        'a[href*="/p/"], a[href*="/reel/"]',
        links => links
          .map(link => link.href)
          .filter(href => href.includes('/p/') || href.includes('/reel/'))
          .slice(0, 15) // Get a few extra in case some fail
      );
      
      console.log(`📍 Found ${postLinks.length} post links to process`);
      
      // Store the profile URL to navigate back
      const profileUrl = page.url();
      
      // Now visit each post and extract engagement
      for (let i = 0; i < Math.min(postLinks.length, maxPosts); i++) {
        const postUrl = postLinks[i];
        console.log(`\n🔍 Processing post ${i + 1}/${Math.min(postLinks.length, maxPosts)}: ${postUrl}`);
        
        try {
          // Navigate to the post
          await page.goto(postUrl, { 
            waitUntil: 'domcontentloaded',
            timeout: 20000 
          });
          
          // Wait for article or main content to load
          await page.waitForSelector('article, main', { timeout: 10000 }).catch(() => {
            console.log('⚠️ Article/main not found, continuing anyway...');
          });
          
          // Wait a bit for dynamic content to load
          await delay(2500);
          
          // Take screenshot after page loads
          if (debugScreenshot) {
            await debugScreenshot.capture('post-extraction', 'during', `post-${i + 1}-loaded`);
          }
          
          // Extract post data including engagement
          const postData = await page.evaluate((postUrl) => {
            const extractNumber = (text) => {
              if (!text) return 0;
              
              // Remove commas and extra spaces
              const cleaned = text.replace(/,/g, '').replace(/\s+/g, ' ').trim();
              
              // Match patterns like "1234", "1.2k", "1.5m", "1,234"
              const match = cleaned.match(/(\d+(?:\.\d+)?)\s*([kmb])?/i);
              if (!match) return 0;
              
              let num = parseFloat(match[1]);
              const unit = match[2]?.toLowerCase();
              
              if (unit === 'k') num *= 1000;
              if (unit === 'm') num *= 1000000;
              if (unit === 'b') num *= 1000000000;
              
              return Math.round(num);
            };
            
            // Get image URL - try multiple methods
            let imageUrl = null;
            
            // Method 1: Look for og:image meta tag
            const ogImage = document.querySelector('meta[property="og:image"]');
            if (ogImage) {
              imageUrl = ogImage.content;
            }
            
            // Method 2: Look for main article image
            if (!imageUrl) {
              const img = document.querySelector('article img[src*="scontent"], article img[src*="cdninstagram"]');
              if (img) imageUrl = img.src;
            }
            
            // Method 3: Any large image
            if (!imageUrl) {
              const imgs = document.querySelectorAll('img');
              for (const img of imgs) {
                const src = img.src || img.getAttribute('src');
                if (src && (src.includes('scontent') || src.includes('cdninstagram'))) {
                  const width = img.naturalWidth || img.width || 0;
                  if (width > 300) {
                    imageUrl = src;
                    break;
                  }
                }
              }
            }
            
            // Get description/caption
            let description = null;
            
            // Method 1: og:description meta tag
            const ogDesc = document.querySelector('meta[property="og:description"]');
            if (ogDesc) {
              description = ogDesc.content;
            }
            
            // Method 2: Look for caption text in article
            if (!description) {
              const captionSpans = document.querySelectorAll('article h1, article span[dir="auto"]');
              for (const span of captionSpans) {
                const text = span.textContent?.trim();
                if (text && text.length > 10 && !text.includes('like') && !text.includes('comment')) {
                  description = text;
                  break;
                }
              }
            }
            
            // Extract likes - MULTIPLE STRATEGIES
            let likes = 0;
            
            console.log('🔍 Searching for likes...');
            
            // Strategy 1: Look for button with likes count
            const likeButtons = document.querySelectorAll('button, a, section span');
            for (const el of likeButtons) {
              const text = (el.textContent || '').toLowerCase();
              const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();
              const combined = text + ' ' + ariaLabel;
              
              // Look for patterns like "1,234 likes" or "liked by 1,234"
              if (/\d/.test(combined) && (combined.includes('like') || combined.includes('liked'))) {
                const num = extractNumber(combined);
                if (num > likes) {
                  likes = num;
                  console.log(`✅ Found likes via button/link: ${likes}`);
                }
              }
            }
            
            // Strategy 2: Look in section elements
            if (likes === 0) {
              const sections = document.querySelectorAll('section');
              for (const section of sections) {
                const text = section.textContent || '';
                if (/\d+\s*(like|liked)/i.test(text)) {
                  const num = extractNumber(text);
                  if (num > 0) {
                    likes = num;
                    console.log(`✅ Found likes in section: ${likes}`);
                    break;
                  }
                }
              }
            }
            
            // Strategy 3: Look for specific span patterns
            if (likes === 0) {
              const spans = document.querySelectorAll('span');
              for (const span of spans) {
                const text = span.textContent || '';
                const parent = span.parentElement?.textContent || '';
                
                // Check if this span contains just a number and parent mentions likes
                if (/^\d{1,10}$/.test(text.trim()) && /like/i.test(parent)) {
                  const num = extractNumber(text);
                  if (num > 0) {
                    likes = num;
                    console.log(`✅ Found likes via span pattern: ${likes}`);
                    break;
                  }
                }
              }
            }
            
            // Extract comments - MULTIPLE STRATEGIES
            let comments = 0;
            
            console.log('🔍 Searching for comments...');
            
            // Strategy 1: Count visible comment elements
            const commentItems = document.querySelectorAll('ul li[role="menuitem"], ul li div[role="button"]');
            if (commentItems.length > 0) {
              comments = commentItems.length;
              console.log(`✅ Counted ${comments} visible comments`);
            }
            
            // Strategy 2: Look for "View all X comments" text
            if (comments === 0) {
              const allElements = document.querySelectorAll('button, a, span');
              for (const el of allElements) {
                const text = (el.textContent || '').toLowerCase();
                if (/view\s+all\s+\d+\s+comment/i.test(text) || /\d+\s+comment/i.test(text)) {
                  const num = extractNumber(text);
                  if (num > comments) {
                    comments = num;
                    console.log(`✅ Found comments via "view all": ${comments}`);
                  }
                }
              }
            }
            
            // Strategy 3: Look for comment button aria-label
            if (comments === 0) {
              const commentBtns = document.querySelectorAll('button[aria-label*="comment"], a[aria-label*="comment"]');
              for (const btn of commentBtns) {
                const ariaLabel = btn.getAttribute('aria-label') || '';
                if (/\d+\s*comment/i.test(ariaLabel)) {
                  const num = extractNumber(ariaLabel);
                  if (num > 0) {
                    comments = num;
                    console.log(`✅ Found comments via aria-label: ${comments}`);
                    break;
                  }
                }
              }
            }
            
            // Extract views (for video posts)
            let views = null;
            const viewElements = document.querySelectorAll('span, div');
            for (const el of viewElements) {
              const text = (el.textContent || '').toLowerCase();
              if (/\d+\s*view/i.test(text)) {
                views = extractNumber(text);
                if (views > 0) {
                  console.log(`✅ Found views: ${views}`);
                  break;
                }
              }
            }
            
            console.log(`📊 Final extraction: likes=${likes}, comments=${comments}, views=${views}`);
            
            return {
              imageUrl,
              description,
              likes,
              comments,
              views,
              postUrl
            };
          }, postUrl);
          
          console.log(`📊 Extracted from post ${i + 1}:`, {
            likes: postData.likes,
            comments: postData.comments,
            views: postData.views,
            hasImage: !!postData.imageUrl,
            hasDescription: !!postData.description
          });
          
          // Only add if we have an image URL
          if (postData.imageUrl && !seenUrls.has(postData.imageUrl)) {
            seenUrls.add(postData.imageUrl);
            
            posts.push({
              type: 'image',
              url: postData.imageUrl,
              likes: postData.likes || 0,
              comments: postData.comments || 0,
              views: postData.views,
              description: postData.description,
              postLink: postUrl
            });
            
            console.log(`✅ POST ${posts.length} ADDED:`, {
              likes: postData.likes,
              comments: postData.comments,
              url: postData.imageUrl?.substring(0, 50) + '...'
            });
          } else {
            console.log(`⚠️ Skipping post ${i + 1} - no valid image URL or duplicate`);
          }
          
          // Take screenshot after extraction
          if (debugScreenshot) {
            await debugScreenshot.capture('post-extraction', 'after', `post-${i + 1}-extracted`);
          }
          
        } catch (postError) {
          console.error(`❌ Error processing post ${i + 1}:`, postError.message);
          
          // Take error screenshot
          if (debugScreenshot) {
            await debugScreenshot.capture('post-extraction', 'error', `post-${i + 1}-failed`);
          }
        }
        
        // Small delay between posts to avoid rate limiting
        await delay(1500);
      }
      
      // Navigate back to profile
      console.log(`\n🔙 Navigating back to profile: ${profileUrl}`);
      await page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await delay(1000);
      
    } catch (error) {
      console.error('❌ Error in post extraction:', error);
    }
    
    console.log(`\n🎯 Final result: ${posts.length} posts with engagement data`);
    
    // Log summary
    if (posts.length > 0) {
      const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);
      const totalComments = posts.reduce((sum, p) => sum + p.comments, 0);
      console.log(`📊 Summary: ${totalLikes} total likes, ${totalComments} total comments`);
    }
    
    return posts;
  }
  
  // Legacy method - kept for backward compatibility
  static async extractPosts(page, maxPosts = 10) {
    console.log('⚠️ Using legacy extraction method - use extractPostsWithEngagement() instead');
    return this.extractPostsWithEngagement(page, maxPosts);
  }
}