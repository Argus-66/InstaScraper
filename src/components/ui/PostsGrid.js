function EnhancedPostCard({ post, index }) {
  // Validate post data
  if (!post || !post.url) {
    console.warn(`⚠️ Invalid post data at index ${index}:`, post);
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-center">
        <span className="text-red-400 text-sm">Invalid post data</span>
      </div>
    );
  }

  const proxyUrl = `/api/proxy-post-image?url=${encodeURIComponent(post.url)}&t=${Date.now()}`;
  
  const formatNumber = (num) => {
    if (!num || isNaN(num)) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const {
    postLikes = 0,
    postComments = 0,
    postCaption = '',
    postHashtags = [],
    postVibe = [],
    postQuality = [],
    analysis = '',
    imageLevelAnalysis = {}
  } = post;

  return (
    <div className="group h-full">
      <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl rounded-2xl overflow-hidden border-2 border-gray-700/50 hover:border-red-500/60 transition-all duration-300 transform hover:scale-[1.03] hover:shadow-2xl hover:shadow-red-500/10 h-full flex flex-col min-h-[500px]">
        
        {/* Header with AI badge */}
        <div className="p-4 text-sm bg-gray-900/70 flex justify-between items-center border-b-2 border-gray-700/40 flex-shrink-0">
          <span className="text-white font-bold tracking-wide">Post {index + 1}</span>
          <div className="flex items-center space-x-2">
            {analysis && <span className="bg-gradient-to-r from-red-600/30 to-red-500/30 text-red-200 px-3 py-1.5 rounded-full border-2 border-red-500/50 font-bold text-xs shadow-lg">🤖 AI</span>}
            {postQuality.length > 0 && (
              <span className="bg-gradient-to-r from-green-600/30 to-green-500/30 text-green-200 px-3 py-1.5 rounded-full text-xs border-2 border-green-500/50 font-bold shadow-lg">
                {postQuality[0]}
              </span>
            )}
          </div>
        </div>

        {/* Image */}
        <div className="relative">
          {post.type === 'image' ? (
            <img 
              src={proxyUrl}
              alt={`Instagram post ${index + 1}`}
              className="w-full aspect-square object-cover"
              loading="lazy"
              onError={(e) => {
                console.log(`⚠️ Proxy failed for post ${index}, trying original URL`);
                if (e.target.src !== post.url) {
                  e.target.src = post.url; // Fallback to original URL
                } else {
                  // If original also fails, show placeholder
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }
              }}
              onLoad={() => console.log(`✅ Image loaded for post ${index + 1}`)}
            />
          ) : (
            <video 
              src={proxyUrl}
              controls 
              className="w-full aspect-square object-cover"
              loading="lazy"
              onError={(e) => {
                console.log(`⚠️ Video proxy failed for post ${index}, trying original URL`);
                if (e.target.src !== post.url) {
                  e.target.src = post.url;
                }
              }}
            />
          )}
          
          {/* Fallback placeholder (hidden by default) */}
          <div 
            className="w-full aspect-square bg-gray-800 flex items-center justify-center text-gray-400 text-sm"
            style={{ display: 'none' }}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🖼️</div>
              <div>Image unavailable</div>
            </div>
          </div>
          
          {/* Engagement overlay */}
          <div className="absolute bottom-3 left-3 flex space-x-3">
            <div className="bg-black/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm flex items-center space-x-2 border-2 border-gray-600/50 shadow-xl">
              <span className="text-red-400 text-base">❤️</span>
              <span className="font-bold">{formatNumber(postLikes)}</span>
            </div>
            <div className="bg-black/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm flex items-center space-x-2 border-2 border-gray-600/50 shadow-xl">
              <span className="text-blue-400 text-base">💬</span>
              <span className="font-bold">{formatNumber(postComments)}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 bg-gray-800/30 flex-grow flex flex-col justify-between">
          
          {/* Caption preview */}
          {postCaption && (
            <div className="text-sm text-gray-200 line-clamp-2 leading-relaxed font-medium">
              {postCaption.length > 80 ? `${postCaption.substring(0, 80)}...` : postCaption}
            </div>
          )}

          {/* Vibe tags */}
          {postVibe.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {postVibe.slice(0, 3).map((vibe, i) => (
                <span key={i} className="bg-gradient-to-r from-red-600/30 to-red-500/30 text-red-200 text-xs px-3 py-1.5 rounded-full border border-red-500/50 font-semibold shadow-md hover:scale-105 transition-transform">
                  {vibe}
                </span>
              ))}
            </div>
          )}

          {/* Hashtags */}
          {postHashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 text-sm">
              {postHashtags.slice(0, 2).map((hashtag, i) => (
                <span key={i} className="text-blue-300 hover:text-blue-200 transition-colors font-semibold hover:scale-105 transform">
                  {hashtag.startsWith('#') ? hashtag : `#${hashtag}`}
                </span>
              ))}
            </div>
          )}

          {/* AI Analysis preview */}
          {analysis && (
            <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-xl p-4 border-2 border-gray-600/40 hover:border-red-500/40 transition-all duration-300 shadow-lg">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm text-red-300 font-bold">🤖 Intelligence Analysis</span>
              </div>
              <p className="text-sm text-gray-200 line-clamp-3 hover:line-clamp-none leading-relaxed font-medium transition-all duration-300">
                {analysis.length > 100 ? `${analysis.substring(0, 100)}...` : analysis}
              </p>
            </div>
          )}

          {/* Image analysis mood indicator */}
          {imageLevelAnalysis.mood && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Mood:</span>
              <span className="text-yellow-300">{imageLevelAnalysis.mood}</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function NoPosts({ message }) {
  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-700">
        <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-300 mb-2">No posts found</h3>
      <p className="text-gray-500">{message || 'This profile might be private or have no posts yet.'}</p>
    </div>
  );
}

export default function PostsGrid({ posts, enhancedPosts, message }) {
  // Use enhancedPosts if available, otherwise fall back to regular posts
  const postsToDisplay = enhancedPosts && Array.isArray(enhancedPosts) ? enhancedPosts : posts;
  
  if (!postsToDisplay || !Array.isArray(postsToDisplay) || postsToDisplay.length === 0) {
    return <NoPosts message={message} />;
  }

  const isEnhanced = !!(enhancedPosts && Array.isArray(enhancedPosts) && enhancedPosts.length > 0);
  
  console.log(`📊 PostsGrid: Displaying ${postsToDisplay.length} posts (Enhanced: ${isEnhanced})`);
  if (isEnhanced) {
    console.log('✨ Using AI-enhanced posts with analysis data');
  } else {
    console.log('📋 Using basic posts without AI analysis');
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-white flex items-center space-x-3">
          <span>Content Portfolio</span>
          {isEnhanced && (
            <span className="bg-gradient-to-r from-red-600 to-red-700 text-white text-sm px-3 py-1 rounded-full border border-red-500/30">
              ✨ Intelligence Enhanced
            </span>
          )}
        </h2>
        <div className="bg-gray-800/60 backdrop-blur-xl rounded-full px-4 py-2 border border-gray-600/50">
          <span className="text-gray-300">{postsToDisplay.length} posts found</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {postsToDisplay.map((post, index) => (
          <EnhancedPostCard key={index} post={post} index={index} />
        ))}
      </div>
    </>
  );
}