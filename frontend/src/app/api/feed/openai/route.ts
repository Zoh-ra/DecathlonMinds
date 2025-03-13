import { NextRequest, NextResponse } from 'next/server';
import { openAIService } from '../../../../services/openai-service';
import { PostType } from '../../../../types/feed';

export async function GET(request: NextRequest) {
  // Récupérer les paramètres de la requête
  const searchParams = request.nextUrl.searchParams;
  const emotion = searchParams.get('emotion') || undefined;
  const cause = searchParams.get('cause') || undefined;
  const filter = (searchParams.get('filter') as PostType | 'ALL') || 'ALL';
  const count = Number(searchParams.get('count') || 6);

  try {
    console.log(`Génération de posts avec émotion: ${emotion}, cause: ${cause}, filtre: ${filter}`);
    
    // Essayer de générer des posts via OpenAI
    try {
      const posts = await openAIService.generateAdaptedFeed({
        emotion,
        cause,
        filter,
        count
      });
      console.log(`${posts.length} posts générés avec succès via OpenAI`);
      return NextResponse.json({ posts }, { status: 200 });
    } catch (openaiError) {
      console.warn(`Erreur OpenAI, utilisation des posts de démonstration: ${openaiError}`);
      
      // En cas d'erreur avec OpenAI, utiliser les posts de démonstration
      const demoPostsForEmotion = openAIService.getMockPosts({
        emotion,
        cause,
        filter,
        count
      });
      
      console.log(`${demoPostsForEmotion.length} posts de démonstration générés`);
      return NextResponse.json({ posts: demoPostsForEmotion }, { status: 200 });
    }
  } catch (error) {
    console.error('Erreur lors de la génération des posts:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération des posts' },
      { status: 500 }
    );
  }
}
