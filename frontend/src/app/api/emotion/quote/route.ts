import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate required fields
    if (!body.emotion || !body.reason) {
      return NextResponse.json(
        { error: 'Emotion and reason are required' },
        { status: 400 }
      );
    }
    
    // Try to get a quote from the backend first
    try {
      // Check first if the backend is available to avoid connection timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000); // 1 second timeout
      
      const backendCheck = await fetch('http://localhost:8080/api/health', {
        signal: controller.signal
      }).catch(() => null);
      
      clearTimeout(timeoutId);
      
      // Only proceed if backend is available
      if (backendCheck && backendCheck.ok) {
        const backendResponse = await fetch('http://localhost:8080/api/emotion/quote', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            emotion: body.emotion,
            reason: body.reason,
          }),
          cache: 'no-store',
        });
        
        if (backendResponse.ok) {
          const data = await backendResponse.json();
          return NextResponse.json(data);
        }
      } else {
        console.log('Backend server not available, using fallback quotes');
      }
    } catch (error) {
      console.log('Failed to get quote from backend, using fallback', error);
    }
    
    // Fallback quotes based on emotion
    const quotes: Record<string, string[]> = {
      HAPPY: [
        "Le bonheur n'est pas une destination, c'est une façon de voyager.",
        "Souriez à la vie, et la vie vous sourira en retour.",
        "La joie que nous donnons aux autres est déjà une source de bonheur.",
      ],
      SAD: [
        "Après la pluie vient le beau temps. Chaque jour est une nouvelle chance.",
        "La tristesse est une étape, pas une finalité. Prenez soin de vous.",
        "Parfois, les moments difficiles nous enseignent les leçons les plus précieuses.",
      ],
      ANGRY: [
        "Respirez profondément. La colère est un nuage passager dans votre ciel intérieur.",
        "Transformez cette énergie en quelque chose de constructif.",
        "Prenez un moment pour vous. Votre paix intérieure est plus importante.",
      ],
      ANXIOUS: [
        "Une étape à la fois. Vous faites de votre mieux et c'est déjà beaucoup.",
        "L'anxiété n'est qu'une vague, laissez-la passer sans vous submerger.",
        "Concentrez-vous sur l'instant présent, c'est là que se trouve votre force.",
      ],
      TIRED: [
        "Accordez-vous le repos que vous méritez. Demain est un autre jour.",
        "Prenez soin de votre énergie comme d'un trésor précieux.",
        "Même les plus forts ont besoin de moments pour se ressourcer.",
      ],
    };
    
    // Select a quote based on emotion or provide a default
    const emotionQuotes = quotes[body.emotion] || [
      "Chaque émotion a sa valeur et son message. Écoutez ce que celle-ci veut vous dire.",
      "Vous n'êtes pas seul(e) dans ce que vous ressentez. Prenez soin de vous.",
      "Un pas à la fois, vous êtes sur votre chemin, et c'est ce qui compte.",
    ];
    
    // Return a random quote from the appropriate list
    const randomQuote = emotionQuotes[Math.floor(Math.random() * emotionQuotes.length)];
    
    return NextResponse.json({ quote: randomQuote });
    
  } catch (error) {
    console.error('Error in emotion quote API:', error);
    return NextResponse.json(
      { error: 'Failed to get emotional quote' },
      { status: 500 }
    );
  }
}
