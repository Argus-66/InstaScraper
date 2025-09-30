export class ResponseFormatter {
  static formatSuccess(posts, profileData, analytics) {
    return {
      success: true,
      profile: profileData,
      
      // ✅ NEW: Expanded analytics with all metrics
      analytics: {
        postsCount: analytics.postsCount,
        totalLikes: analytics.totalLikes,           // ✅ NEW
        totalComments: analytics.totalComments,     // ✅ NEW
        totalViews: analytics.totalViews,           // ✅ NEW
        averageLikes: analytics.averageLikes,
        averageComments: analytics.averageComments,
        averageViews: analytics.averageViews,       // ✅ NEW
        totalEngagement: analytics.totalEngagement,
        engagementRate: analytics.engagementRate,
        engagementCategory: analytics.engagementCategory,
        postsAnalyzed: analytics.postsAnalyzed
      },
      
      // ✅ NEW: Cleaner posts structure with nested engagement
      posts: posts.map((post, index) => ({
        postIndex: index + 1,
        type: post.type,
        url: post.url,
        description: post.description,
        postLink: post.postLink,
        engagement: {                               // ✅ NEW: Nested
          likes: post.likes || 0,
          comments: post.comments || 0,
          views: post.views || null
        }
      })),
      
      // ✅ KEPT: Your original format for backward compatibility
      postEngagementDetails: posts.map((post, index) => ({
        postIndex: index + 1,
        type: post.type,
        url: post.url,
        description: post.description,
        postLink: post.postLink,
        likes: post.likes || 0,
        comments: post.comments || 0,
        views: post.views
      })),
      
      scrapedAt: new Date().toISOString()           // ✅ NEW: Timestamp
    };
  }
}