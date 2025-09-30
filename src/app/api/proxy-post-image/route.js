import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');
  
  if (!imageUrl) {
    return new NextResponse('Post image URL required', { status: 400 });
  }

  console.log(`🖼️ [PostImageProxy] REQUEST RECEIVED for: ${imageUrl.substring(0, 100)}...`);
  console.log(`🖼️ [PostImageProxy] Full URL: ${imageUrl}`);

  try {
    // Fetch the post image from Instagram's CDN with specific headers for posts
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.instagram.com/',
        'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'image',
        'sec-fetch-mode': 'no-cors',
        'sec-fetch-site': 'cross-site',
      },
    });

    if (!response.ok) {
      console.error(`❌ [PostImageProxy] Failed to fetch: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch post image: ${response.status}`);
    }

    const contentType = response.headers.get('Content-Type') || 'image/jpeg';
    const imageBuffer = await response.arrayBuffer();
    
    console.log(`✅ [PostImageProxy] Successfully fetched ${imageBuffer.byteLength} bytes, type: ${contentType}`);
    
    // Return the image with proper CORS headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
    
  } catch (error) {
    console.error('❌ [PostImageProxy] Error:', error);
    
    // Return a placeholder image on error
    const placeholderSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
        <rect width="400" height="400" fill="#f0f0f0"/>
        <text x="200" y="200" text-anchor="middle" font-family="Arial" font-size="16" fill="#666">
          Image not available
        </text>
      </svg>
    `;
    
    return new NextResponse(placeholderSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=300', // Cache error for 5 minutes
      },
      status: 200, // Return 200 to prevent broken images
    });
  }
}