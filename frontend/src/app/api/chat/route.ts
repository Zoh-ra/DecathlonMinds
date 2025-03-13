import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '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',
});

export async function POST(req: NextRequest) {
  try {
    const { message, emotion, reason } = await req.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    // Create system prompt based on emotion and reason
    let systemPrompt = "Vous êtes un assistant bienveillant et empathique pour l'application Décathlon Minds, spécialisé dans le bien-être émotionnel, la marche et le jogging. ";
    
    if (emotion) {
      systemPrompt += `L'utilisateur ressent actuellement de la ${emotion.toLowerCase()}`;
      if (reason) {
        systemPrompt += ` en raison de ${reason.toLowerCase()}. `;
      } else {
        systemPrompt += ". ";
      }
    }
    
    systemPrompt += "Adaptez vos réponses pour être encourageant et positif, tout en proposant des conseils pratiques pour améliorer le bien-être. Gardez vos réponses concises et personnelles.";
    
    // Call OpenAI API
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      max_tokens: 500, // Increased from 300 for more comprehensive responses
    });
    
    // Extract response
    const response = chatCompletion.choices[0]?.message?.content || 
      "Je suis désolé, je n'ai pas pu traiter votre demande. Comment puis-je vous aider autrement ?";
    
    // Store conversation in the backend (if available)
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
        await fetch('http://localhost:8080/api/conversation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userMessage: message,
            botResponse: response,
            emotion: emotion || '',
            reason: reason || '',
            timestamp: new Date().toISOString(),
          }),
        });
      } else {
        console.log('Backend server not available, skipping conversation storage');
      }
    } catch (error) {
      console.error('Failed to store conversation in backend:', error);
      // Continue even if backend storage fails
    }
    
    return NextResponse.json({ response });
    
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to get response from OpenAI' },
      { status: 500 }
    );
  }
}
