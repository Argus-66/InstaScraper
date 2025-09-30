import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
  try {
    const { prompt } = await request.json();
    
    console.log('🌍 Processing simple demographics request...');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1000,
      }
    });

    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const text = response.text();
    
    console.log('🤖 AI Response received');

    // Parse JSON response
    const cleanText = text.replace(/```json|```/g, '').trim();
    const parsedResult = JSON.parse(cleanText);
    
    // Validate the response structure
    if (!parsedResult.demographics || typeof parsedResult.isKnown !== 'boolean') {
      throw new Error('Invalid AI response structure');
    }

    // Ensure demographics sum to 100
    const total = Object.values(parsedResult.demographics).reduce((sum, val) => sum + val, 0);
    if (Math.abs(total - 100) > 1) {
      // Normalize to 100
      const factor = 100 / total;
      Object.keys(parsedResult.demographics).forEach(country => {
        parsedResult.demographics[country] = parsedResult.demographics[country] * factor;
      });
    }

    console.log('✅ Demographics analysis complete');
    
    return Response.json({
      success: true,
      data: parsedResult
    });

  } catch (error) {
    console.error('❌ [SimpleDemographics] Error:', error);
    
    return Response.json({
      success: false,
      error: error.message || 'Failed to analyze demographics'
    }, { status: 500 });
  }
}