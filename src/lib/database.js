import { MongoClient } from 'mongodb';

let client;
let db;

export async function connectToDatabase() {
  if (db) {
    return { client, db };
  }

  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await client.connect();
    db = client.db('instascope'); // Database name
    
    console.log('✅ Connected to MongoDB successfully');
    return { client, db };
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

export async function getCollection(collectionName) {
  const { db } = await connectToDatabase();
  return db.collection(collectionName);
}

// Collection schemas
export const COLLECTIONS = {
  PROFILES: 'profiles',
  ANALYSIS_CACHE: 'analysis_cache'
};

// Cache entry structure
export const createCacheEntry = (username, profileData, analytics, posts, enhancedPosts, scrapedAt) => ({
  username: username.toLowerCase(),
  profileData,
  analytics,
  posts,
  enhancedPosts,
  scrapedAt: new Date(scrapedAt),
  cacheCreatedAt: new Date(),
  lastAccessed: new Date(),
  accessCount: 1
});

export const updateLastAccessed = async (username) => {
  try {
    const collection = await getCollection(COLLECTIONS.ANALYSIS_CACHE);
    await collection.updateOne(
      { username: username.toLowerCase() },
      { 
        $set: { lastAccessed: new Date() },
        $inc: { accessCount: 1 }
      }
    );
  } catch (error) {
    console.error('Error updating last accessed:', error);
  }
};