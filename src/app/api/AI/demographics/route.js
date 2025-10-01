import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCollection, COLLECTIONS } from '@/lib/database';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Add delay function to avoid rate limits
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request) {
    let username, followers;
    
    try {
        ({ username, followers } = await request.json());

        if (!username) {
            return Response.json({ error: 'Username is required' }, { status: 400 });
        }

        console.log(`🔍 [Demographics] Analyzing ${username} (${followers || 'unknown'} followers)`);

        // Check if we already have cached demographics
        try {
            console.log(`🔍 [DEMOGRAPHICS CACHE] Checking for cached demographics for @${username}...`);
            const cacheCollection = await getCollection(COLLECTIONS.ANALYSIS_CACHE);
            const cachedResult = await cacheCollection.findOne({ 
                username: username?.toLowerCase() || '' 
            });

            if (cachedResult && cachedResult.demographics) {
                console.log(`✅ [DEMOGRAPHICS CACHE HIT] Found cached demographics for @${username}! Serving instantly...`);
                
                return Response.json({
                    demographics: cachedResult.demographics,
                    isAnalyzed: cachedResult.demographicsAnalyzed || true,
                    note: cachedResult.demographicsNote,
                    fromCache: true
                });
            } else {
                console.log(`❌ [DEMOGRAPHICS CACHE MISS] No cached demographics for @${username}. Generating new analysis...`);
            }
        } catch (cacheError) {
            console.error('⚠️ [DEMOGRAPHICS CACHE ERROR] Cache check failed, proceeding with fresh analysis:', cacheError);
        }

        // If followers are low (under 10k), return generic local data
        if (followers && followers < 10000) {
            console.log(`📊 [Demographics] Small account detected, using India-focused distribution`);
            
            const smallAccountDemographics = [
                { country: 'India', percentage: 95, color: '#ff9933' },
                { country: 'United States', percentage: 2, color: '#b22234' },
                { country: 'United Kingdom', percentage: 1, color: '#012169' },
                { country: 'Sri Lanka', percentage: 1, color: '#ffb300' },
                { country: 'Nepal', percentage: 1, color: '#dc143c' }
            ];

            const result = {
                demographics: smallAccountDemographics,
                isAnalyzed: false,
                note: 'India-focused distribution for smaller accounts'
            };

            // Store small account demographics in cache too
            try {
                console.log(`💾 [DEMOGRAPHICS CACHE] Storing small account demographics for @${username}...`);
                const cacheCollection = await getCollection(COLLECTIONS.ANALYSIS_CACHE);
                
                await cacheCollection.updateOne(
                    { username: username?.toLowerCase() || '' },
                    {
                        $set: {
                            demographics: smallAccountDemographics,
                            demographicsAnalyzed: false,
                            demographicsNote: 'India-focused distribution for smaller accounts',
                            demographicsProcessedAt: new Date().toISOString(),
                            lastAccessed: new Date()
                        }
                    },
                    { upsert: true }
                );
                
                console.log(`✅ [DEMOGRAPHICS CACHE] Small account demographics cached for @${username}!`);
            } catch (cacheError) {
                console.error('⚠️ [DEMOGRAPHICS CACHE] Failed to store small account demographics:', cacheError);
            }

            return Response.json(result);
        }

        // Add delay before API call
        await delay(1000); // 1 second delay to avoid rate limits

        // For larger accounts, use AI analysis with better prompt
        const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
        
        const prompt = `Analyze the global audience demographics for the Instagram account "${username}".
        
        This account has ${followers || 'many'} followers. Based on the username/brand, determine the likely audience distribution by country.
        
        Consider:
        - If it's a global brand/celebrity: diverse international audience
        - If it's a regional brand: concentrated in specific regions
        - If it's a sports team/athlete: global but concentrated in relevant countries
        - If it's a tech company: US, India, Europe focus
        - If it's entertainment: global spread
        
        Return ONLY a valid JSON object with proper flag colors:
        {
            "demographics": [
                {"country": "United States", "percentage": 30, "color": "#b22234"},
                {"country": "India", "percentage": 25, "color": "#ff9933"},
                {"country": "United Kingdom", "percentage": 15, "color": "#012169"},
                {"country": "Brazil", "percentage": 10, "color": "#009b3a"},
                {"country": "Germany", "percentage": 8, "color": "#000000"},
                {"country": "Others", "percentage": 12, "color": "#6b7280"}
            ]
        }
        
        Use realistic percentages that add up to 100. Use proper flag colors.`;

        console.log(`🤖 [Demographics] Sending AI request for ${username}...`);
        
        const aiResult = await model.generateContent(prompt);
        const response = await aiResult.response;
        const text = response.text();
        
        console.log(`✅ [Demographics] AI response received for ${username}`);
        
        // Parse the AI response
        const cleanText = text.replace(/```json|```/g, '').trim();
        const demographics = JSON.parse(cleanText);

        const result = {
            ...demographics,
            isAnalyzed: true
        };

        // Store demographics in cache
        try {
            console.log(`💾 [DEMOGRAPHICS CACHE] Storing demographics for @${username}...`);
            const cacheCollection = await getCollection(COLLECTIONS.ANALYSIS_CACHE);
            
            await cacheCollection.updateOne(
                { username: username?.toLowerCase() || '' },
                {
                    $set: {
                        demographics: demographics.demographics,
                        demographicsAnalyzed: true,
                        demographicsNote: 'AI-generated audience analysis',
                        demographicsProcessedAt: new Date().toISOString(),
                        lastAccessed: new Date()
                    }
                },
                { upsert: true }
            );
            
            console.log(`✅ [DEMOGRAPHICS CACHE] Demographics cached for @${username}!`);
        } catch (cacheError) {
            console.error('⚠️ [DEMOGRAPHICS CACHE] Failed to store demographics:', cacheError);
            // Don't fail the request if caching fails
        }

        return Response.json(result);

    } catch (error) {
        console.error(`❌ [Demographics] Error for ${username}:`, error);
        
        // Return realistic fallback data for large accounts
        const fallbackData = followers && followers > 1000000 ? [
            { country: 'United States', percentage: 28, color: '#b22234' },
            { country: 'India', percentage: 22, color: '#ff9933' },
            { country: 'Brazil', percentage: 12, color: '#009b3a' },
            { country: 'United Kingdom', percentage: 10, color: '#012169' },
            { country: 'Germany', percentage: 8, color: '#000000' },
            { country: 'France', percentage: 6, color: '#0055a4' },
            { country: 'Others', percentage: 14, color: '#6b7280' }
        ] : [
            { country: 'United States', percentage: 35, color: '#b22234' },
            { country: 'India', percentage: 25, color: '#ff9933' },
            { country: 'United Kingdom', percentage: 15, color: '#012169' },
            { country: 'Canada', percentage: 10, color: '#ff0000' },
            { country: 'Australia', percentage: 8, color: '#0057b7' },
            { country: 'Others', percentage: 7, color: '#6b7280' }
        ];

        // Store fallback demographics in cache
        try {
            console.log(`💾 [DEMOGRAPHICS CACHE] Storing fallback demographics for @${username}...`);
            const cacheCollection = await getCollection(COLLECTIONS.ANALYSIS_CACHE);
            
            await cacheCollection.updateOne(
                { username: username?.toLowerCase() || '' },
                {
                    $set: {
                        demographics: fallbackData,
                        demographicsAnalyzed: false,
                        demographicsNote: 'AI analysis failed, showing realistic fallback data',
                        demographicsProcessedAt: new Date().toISOString(),
                        lastAccessed: new Date()
                    }
                },
                { upsert: true }
            );
            
            console.log(`✅ [DEMOGRAPHICS CACHE] Fallback demographics cached for @${username}!`);
        } catch (cacheError) {
            console.error('⚠️ [DEMOGRAPHICS CACHE] Failed to store fallback demographics:', cacheError);
        }
        
        return Response.json({
            demographics: fallbackData,
            isAnalyzed: false,
            error: 'AI analysis failed, showing realistic fallback data'
        });
    }
}