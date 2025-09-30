export default function ProfileCard({ profile, username }) {
  if (!profile) return null;

  return (
    <div className="bg-gray-800/70 backdrop-blur-xl rounded-2xl p-8 mb-8 border-2 border-red-500/40 shadow-2xl transform hover:scale-[1.01] transition-all duration-300">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        {/* Profile Picture */}
        <div className="flex-shrink-0">
          {profile.profilePicture ? (
            <img
              src={`/api/proxy-image?url=${encodeURIComponent(profile.profilePicture)}`}
              alt={`${profile.username}'s profile`}
              className="w-32 h-32 rounded-full border-4 border-red-500/50 object-cover shadow-xl"
              onError={(e) => {
                console.log('Profile picture failed to load');
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 24 24' fill='%23666'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";
              }}
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border-4 border-red-500/50 flex items-center justify-center shadow-xl">
              <svg className="w-16 h-16 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
            </div>
          )}
        </div>

        {/* Profile Details */}
        <div className="flex-1 text-center md:text-left">
          <div className="mb-4">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h2 className="text-2xl font-bold text-white">
                @{profile.username || username}
              </h2>
              {profile.isVerified && (
                <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              )}
              {profile.isPrivate && (
                <span className="bg-amber-600/20 text-amber-400 px-3 py-1 rounded-full text-xs border border-amber-500/30">
                  Private
                </span>
              )}
            </div>
            {profile.influencerName ? (
              <h3 className="text-xl text-gray-300 font-medium">
                {profile.influencerName}
              </h3>
            ) : (
              <p className="text-gray-500 text-sm italic">
                Display name not available
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mb-4">
            <div className="text-center p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
              <div className="text-2xl font-bold text-white">
                {profile.postsCount?.toLocaleString() || 'N/A'}
              </div>
              <div className="text-sm text-gray-400">Posts</div>
            </div>
            <div className="text-center p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
              <div className="text-2xl font-bold text-white">
                {profile.followersCount?.toLocaleString() || 'N/A'}
              </div>
              <div className="text-sm text-gray-400">Followers</div>
            </div>
            <div className="text-center p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
              <div className="text-2xl font-bold text-white">
                {profile.followingCount?.toLocaleString() || 'N/A'}
              </div>
              <div className="text-sm text-gray-400">Following</div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-gray-300 text-sm mb-4 max-w-md leading-relaxed">
              {profile.bio}
            </p>
          )}

          {/* Website */}
          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 text-sm transition-colors duration-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
              {profile.website.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}