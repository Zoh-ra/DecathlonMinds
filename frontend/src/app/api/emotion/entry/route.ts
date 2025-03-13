import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate required fields
    if (!body.emotionType) {
      return NextResponse.json(
        { error: 'Emotion type is required' },
        { status: 400 }
      );
    }
    
    // Make request to backend API
    const response = await fetch('http://localhost:8080/api/emotion/entry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emotionType: body.emotionType,
        intensityLevel: body.intensityLevel || 'MEDIUM',
        description: body.description || '',
        triggers: body.triggers || '',
        location: body.location || '',
        weatherData: body.weatherData || '',
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save emotional entry');
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in emotion entry API:', error);
    return NextResponse.json(
      { error: 'Failed to save emotional entry' },
      { status: 500 }
    );
  }
}
