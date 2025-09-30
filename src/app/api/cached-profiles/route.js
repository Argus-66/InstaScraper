import { NextResponse } from 'next/server';
import { getCollection, COLLECTIONS } from '@/lib/database';

export async function GET() {
  try {
    console.log('🔍 [CachedProfiles] Fetching cached profiles...');
    
    const cacheCollection = await getCollection(COLLECTIONS.ANALYSIS_CACHE);
    
    // Fetch all cached profiles, sorted by last accessed (most recent first)
    const cachedProfiles = await cacheCollection
      .find({})
      .sort({ lastAccessed: -1 })
      .limit(100) // Limit to 100 most recent profiles
      .toArray();

    console.log(`✅ [CachedProfiles] Found ${cachedProfiles.length} cached profiles`);

    // Transform the data to include only necessary fields
    const profiles = cachedProfiles.map(profile => ({
      username: profile.username,
      lastAccessed: profile.lastAccessed,
      accessCount: profile.accessCount || 1,
      cacheCreatedAt: profile.cacheCreatedAt,
      profileData: profile.profileData ? {
        followers: profile.profileData.followers,
        following: profile.profileData.following,
        postsCount: profile.profileData.postsCount
      } : null,
      posts: profile.posts || [],
      hasAIAnalysis: !!(profile.enhancedPosts && profile.enhancedPosts.length > 0),
      hasDemographics: !!(profile.demographics && profile.demographics.length > 0)
    }));

    return NextResponse.json({
      success: true,
      profiles: profiles,
      total: profiles.length
    });

  } catch (error) {
    console.error('❌ [CachedProfiles] Error fetching cached profiles:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch cached profiles',
      profiles: []
    }, { status: 500 });
  }
}