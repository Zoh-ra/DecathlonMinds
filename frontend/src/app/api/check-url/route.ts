import { NextRequest, NextResponse } from 'next/server';

/**
 * API pour vérifier si une URL est accessible
 * @route GET /api/check-url?url=https://example.com
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    // Vérifier si l'URL est valide
    new URL(url);
    
    // Effectuer une requête HEAD pour vérifier l'accessibilité
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'DecathlonMinds/1.0'
      },
      redirect: 'follow',
    });

    const isAccessible = response.ok;

    return NextResponse.json({ 
      url, 
      isAccessible, 
      status: response.status 
    });
  } catch (error) {
    console.error('Error checking URL:', error);
    return NextResponse.json({ 
      url, 
      isAccessible: false, 
      error: 'Failed to check URL accessibility' 
    }, { status: 500 });
  }
}
