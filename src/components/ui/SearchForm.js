export default function SearchForm({ username, setUsername, loading, onSubmit }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const handleSuggestionClick = (suggestedUsername) => {
    // Set the input field value for visual feedback
    setUsername(suggestedUsername);
    // Immediately call onSubmit with the suggested username
    onSubmit(suggestedUsername);
  };

  const famousProfiles = [
    { username: 'therock', name: 'Dwayne Johnson', icon: '🎬' },
    { username: 'ferrari', name: 'Ferrari', icon: '🏎️' },
    { username: 'nasa', name: 'NASA', icon: '🚀' },
    { username: 'cristiano', name: 'Cristiano Ronaldo', icon: '⚽' },
    { username: 'natgeo', name: 'National Geographic', icon: '📸' },
    { username: 'nike', name: 'Nike', icon: '👟' },
    { username: 'instagram', name: 'Instagram Official', icon: '📱' },
    { username: 'selenagomez', name: 'Selena Gomez', icon: '🎤' }
  ];

  return (
    <div className="max-w-2xl mx-auto mb-12">
      <div className="relative bg-gray-800/70 backdrop-blur-xl rounded-2xl p-8 border-2 border-red-500/40 shadow-2xl transform hover:scale-[1.02] transition-all duration-300 overflow-hidden">
        {/* Instagram Icon Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg className="w-64 h-64 text-red-500/10" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.40z"/>
          </svg>
        </div>
        
        {/* Content with higher z-index */}
        <div className="relative z-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-white mb-2">Begin Intelligence Analysis</h3>
            <p className="text-gray-400 text-sm">Enter any Instagram username to unlock deep insights</p>
          </div>
          <div>
            <div className="relative group">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[@\s]/g, ''))}
                placeholder="Enter Instagram username"
                className="w-full px-6 py-5 bg-gray-900/60 backdrop-blur-xl border-2 border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 focus:outline-none transition-all duration-300 shadow-lg text-lg font-medium group-hover:border-red-500/70"
                required
              />
            <div className="absolute inset-y-0 right-0 flex items-center pr-6">
              <span className="text-gray-500 text-lg">@</span>
            </div>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-2xl border-2 border-red-500/40 text-lg"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>🔬 Analyzing Intelligence...</span>
            </div>
          ) : (
            <span className="flex items-center justify-center gap-2">
              🎯 <span>Begin Analysis</span>
            </span>
          )}
        </button>

        {/* Processing Time Notice */}
        <div className="mt-4 p-4 bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-600/30">
          <div className="flex items-start gap-3">
            <div className="text-yellow-400 text-lg mt-0.5">⏱️</div>
            <div>
              <p className="text-sm text-gray-300 font-medium mb-1">
                Processing Time Notice
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">
                New profiles may take <span className="text-yellow-400 font-semibold">6-7 minutes</span> for complete AI analysis. 
                Cached profiles load instantly! Sorry for any inconvenience.
              </p>
            </div>
          </div>
        </div>

        {/* Famous Profiles Suggestions */}
        <div className="mt-8 pt-6 border-t border-gray-600/30">
          <div className="text-center mb-4">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">🌟 Try Popular Profiles</h4>
            <p className="text-xs text-gray-500">Click any profile to analyze instantly</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {famousProfiles.map((profile) => (
              <button
                key={profile.username}
                type="button"
                onClick={() => handleSuggestionClick(profile.username)}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-700/50 to-gray-600/50 hover:from-red-600/20 hover:to-red-500/20 text-white rounded-full border border-gray-600/30 hover:border-red-500/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group text-sm font-medium shadow-lg hover:shadow-red-500/20"
              >
                <span className="group-hover:scale-110 transition-transform duration-300">{profile.icon}</span>
                <span className="text-gray-200 group-hover:text-white transition-colors duration-300">@{profile.username}</span>
              </button>
            ))}
          </div>
          <div className="text-center mt-4">
            <p className="text-xs text-gray-500">
              ✨ Or enter any public Instagram username above
            </p>
          </div>
        </div>
        </form>
        </div>
      </div>
    </div>
  );
}