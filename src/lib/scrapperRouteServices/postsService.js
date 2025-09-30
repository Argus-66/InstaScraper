export class PostsService {
  constructor(postScraper) {
    this.postScraper = postScraper;
  }

  async scrapePosts() {
    console.log(`📸 Step 7/8: Detecting and scraping posts...`);
    const postsFound = await this.postScraper.waitForPosts();
    
    if (!postsFound) {
      console.log(`❌ No posts found on profile`);
      await this.postScraper.takeDebugScreenshot('debug-instagram-no-posts.png');
      return { posts: [], postsFound: false };
    }
    
    console.log(`✅ Posts detected successfully`);
    console.log(`🔥 Starting ENHANCED extraction with individual post engagement...`);
    
    // 🔥 CHANGED: Use the new method that clicks into each post
    const posts = await this.postScraper.scrapePostsWithEngagement(10);
    
    console.log(`✅ Posts scraped: ${posts.length} items found`);
    
    // Log engagement summary
    const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0);
    const totalComments = posts.reduce((sum, p) => sum + (p.comments || 0), 0);
    const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
    
    console.log(`📊 Individual Post Engagement Summary:`);
    console.log(`   Total Likes: ${totalLikes}`);
    console.log(`   Total Comments: ${totalComments}`);
    console.log(`   Total Views: ${totalViews}`);
    console.log(`   Posts with engagement: ${posts.filter(p => p.likes > 0 || p.comments > 0).length}/${posts.length}`);
    
    return { posts, postsFound: true };
  }

  async analyzeEngagement(profileData, posts) {
    console.log(`📊 Step 8/8: Analyzing engagement metrics...`);
    
    // Calculate engagement from the actual scraped posts data
    const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0);
    const totalComments = posts.reduce((sum, p) => sum + (p.comments || 0), 0);
    const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
    const postsCount = posts.length;
    
    const averageLikes = postsCount > 0 ? Math.round(totalLikes / postsCount) : 0;
    const averageComments = postsCount > 0 ? Math.round(totalComments / postsCount) : 0;
    const averageViews = postsCount > 0 && totalViews > 0 ? Math.round(totalViews / postsCount) : 0;
    const totalEngagement = totalLikes + totalComments;
    
    console.log(`✅ Engagement data analyzed: ${postsCount} posts processed`);
    console.log(`   Average Likes: ${averageLikes}`);
    console.log(`   Average Comments: ${averageComments}`);
    console.log(`   Average Views: ${averageViews}`);
    
    console.log(`🧮 Calculating engagement rate...`);
    const engagementRate = this.postScraper.calculateEngagementRate(
      averageLikes,
      averageComments,
      profileData?.followersCount || profileData?.followers
    );
    
    console.log(`✅ Engagement rate calculated: ${engagementRate.rate}% (${engagementRate.category})`);
    
    const analytics = {
      postsCount: postsCount,
      totalLikes: totalLikes,
      totalComments: totalComments,
      totalViews: totalViews,
      averageLikes: averageLikes,
      averageComments: averageComments,
      averageViews: averageViews,
      totalEngagement: totalEngagement,
      engagementRate: engagementRate.rate,
      engagementCategory: engagementRate.category,
      postsAnalyzed: postsCount
    };
    
    console.log(`📈 Final Analytics:`, {
      posts: analytics.postsCount,
      totalLikes: analytics.totalLikes,
      totalComments: analytics.totalComments,
      avgLikes: analytics.averageLikes,
      avgComments: analytics.averageComments,
      engagementRate: `${analytics.engagementRate}% (${analytics.engagementCategory})`
    });
    
    return analytics;
  }

  async captureDebugScreenshots() {
    await this.postScraper.debugScreenshot.capture('api-workflow', 'after', 'posts-scraped');
    await this.postScraper.debugScreenshot.capture('final-state', 'complete', 'scraping-finished');
    console.log('📸 Final debug screenshot taken - scraping complete!');
  }
}