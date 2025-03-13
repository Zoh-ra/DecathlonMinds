import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Post } from '../../../../types/feed';

// Initialiser le client OpenAI - la clé API est configurée dans le fichier .env.local
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Types possibles de posts
const postTypes = ['SCIENTIFIC', 'QUOTE', 'ROUTE', 'EVENT'] as const;

// Types d'humeur
type Mood = 'HAPPY' | 'SAD' | 'NEUTRAL' | 'ENERGETIC' | 'TIRED' | 'STRESSED' | 'CALM';

// Configuration pour optimiser les performances
const CONCURRENCY_LIMIT = 4; // Nombre de posts générés en parallèle
const TIMEOUT_MS = 10000; // Timeout pour la génération d'un post (10 secondes)

// Fonction pour générer plusieurs posts en parallèle avec OpenAI
async function generatePostsWithOpenAI(
  count: number = 5,
  mood?: Mood,
  reason?: string
): Promise<Post[]> {
  console.log('[OpenAI] Début de la génération de posts');
  console.log(`[OpenAI] Nombre de posts demandés: ${count}`);
  console.log(`[OpenAI] Humeur: ${mood || 'Non spécifiée'}`);
  console.log(`[OpenAI] Raison: ${reason || 'Non spécifiée'}`);

  // Si l'humeur est spécifiée, adapter les prompts en fonction
  const moodContext = mood ? `L'utilisateur se sent actuellement ${mood.toLowerCase()}${reason ? ` car ${reason}` : ''}. ` : '';
  console.log(`[OpenAI] Contexte d'humeur utilisé: "${moodContext}"`);

  // Distribution des types de posts
  // Cette distribution assure une variété de contenus
  const typeDistribution = [
    ...Array(Math.ceil(count * 0.4)).fill('SCIENTIFIC'),
    ...Array(Math.ceil(count * 0.2)).fill('QUOTE'),
    ...Array(Math.ceil(count * 0.2)).fill('ROUTE'),
    ...Array(Math.ceil(count * 0.2)).fill('EVENT')
  ].slice(0, count);

  // Mélanger les types pour une distribution aléatoire
  for (let i = typeDistribution.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [typeDistribution[i], typeDistribution[j]] = [typeDistribution[j], typeDistribution[i]];
  }

  console.log(`[OpenAI] Distribution des types de posts: ${typeDistribution.join(', ')}`);

  // Fonction pour générer un post avec un timeout
  const generatePostWithTimeout = async (type: typeof postTypes[number], index: number): Promise<Post | null> => {
    return new Promise(async (resolve) => {
      // Créer un timer pour le timeout
      const timer = setTimeout(() => {
        console.warn(`[OpenAI] Timeout pour la génération du post ${index} de type ${type}`);
        resolve(null); // Résoudre avec null en cas de timeout
      }, TIMEOUT_MS);

      try {
        // Créer un prompt adapté au type de post
        let prompt = '';
        
        switch (type) {
          case 'SCIENTIFIC':
            prompt = `${moodContext}Génère un article scientifique court sur les bienfaits de la marche, la randonnée ou l'activité physique en plein air${mood ? ` pour une personne qui se sent ${mood.toLowerCase()}` : ''}. 
            Format: JSON avec les propriétés suivantes:
            {
              "title": "Un titre accrocheur sur l'étude scientifique",
              "content": "Un paragraphe de 2-3 phrases décrivant les résultats principaux",
              "author": "Nom d'un chercheur fictif avec titre Dr. ou Prof.",
              "date": "Une date au format YYYY-MM-DD dans les 3 derniers mois",
              "tags": "3-4 tags pertinents sous forme d'array",
              "source": "Nom d'une revue scientifique crédible"
            }`;
            break;
            
          case 'QUOTE':
            prompt = `${moodContext}Génère une citation inspirante sur la marche, le dépassement de soi, la nature ou le mouvement${mood ? ` qui pourrait motiver une personne qui se sent ${mood.toLowerCase()}` : ''}.
            Format: JSON avec les propriétés suivantes:
            {
              "content": "La citation inspirante",
              "author": "Auteur de la citation (réel ou fictif)",
              "backgroundColor": "Un code couleur pastel au format hexadécimal (par exemple #E3F2FD)",
              "tags": "2-3 tags pertinents sous forme d'array"
            }`;
            break;
            
          case 'ROUTE':
            prompt = `${moodContext}Génère un parcours de randonnée ou de marche fictif en France${mood ? ` qui serait idéal pour une personne qui se sent ${mood.toLowerCase()}` : ''}.
            Format: JSON avec les propriétés suivantes:
            {
              "title": "Nom attrayant du parcours",
              "location": "Lieu en France (ville ou région)",
              "distance": "Nombre entre 2 et 15 (en km)",
              "duration": "Durée en minutes (entre 30 et 240)",
              "difficulty": "Un niveau parmi: EASY, MEDIUM, HARD",
              "description": "Description attrayante du parcours en 2-3 phrases",
              "tags": "3-4 tags pertinents sous forme d'array"
            }`;
            break;
            
          case 'EVENT':
            prompt = `${moodContext}Génère un événement fictif lié à la marche, la course ou la randonnée en France${mood ? ` qui pourrait intéresser une personne qui se sent ${mood.toLowerCase()}` : ''}.
            Format: JSON avec les propriétés suivantes:
            {
              "title": "Nom de l'événement",
              "date": "Une date au format YYYY-MM-DD dans les 6 prochains mois",
              "location": "Lieu en France (ville ou région)",
              "description": "Description de l'événement en 2-3 phrases",
              "registrationLink": "Un lien fictif d'inscription",
              "tags": "3-4 tags pertinents sous forme d'array"
            }`;
            break;
        }
        
        // Appeler l'API OpenAI pour générer le contenu (avec une température basse pour une réponse plus rapide)
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { 
              role: "system", 
              content: "Tu es un assistant spécialisé dans la création de contenu pour une application sur la marche, la randonnée et la santé mentale. Réponds uniquement avec le JSON demandé, sans commentaires supplémentaires."
            },
            { role: "user", content: prompt }
          ],
          temperature: 0.5, // Température plus basse pour des réponses plus rapides et plus cohérentes
          max_tokens: 300, // Limiter la longueur pour accélérer la génération
        });
        
        const responseText = completion.choices[0].message.content || '';
        let postData;
        
        try {
          // Extraire uniquement le JSON si la réponse contient d'autres textes
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          const jsonText = jsonMatch ? jsonMatch[0] : responseText;
          postData = JSON.parse(jsonText);
        } catch (error) {
          console.error(`[OpenAI] Erreur lors du parsing JSON pour le post ${index} de type ${type}:`, error);
          clearTimeout(timer);
          resolve(null);
          return;
        }
        
        // Pour l'instant, utiliser des images d'Unsplash plutôt que de générer avec OpenAI DALL-E
        // car cela nécessiterait des crédits supplémentaires
        const imageUrls = {
          'SCIENTIFIC': [
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            'https://images.unsplash.com/photo-1557674961-3ccc0c7c5086?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
          ],
          'ROUTE': [
            'https://images.unsplash.com/photo-1569314039022-94ec5ff559bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            'https://images.unsplash.com/photo-1550591713-4e392ce78e19?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            'https://images.unsplash.com/photo-1522163182402-834f871fd851?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
          ],
          'EVENT': [
            'https://images.unsplash.com/photo-1479936343636-73cdc5aae0c3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            'https://images.unsplash.com/photo-1566104544262-bbefdce7592d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            'https://images.unsplash.com/photo-1533923156502-be31530547c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
          ]
        };
        
        // Sélectionner une image aléatoire dans le tableau correspondant au type de post
        let imageUrl = '';
        if (type !== 'QUOTE') {
          const imageArray = imageUrls[type as keyof typeof imageUrls];
          imageUrl = imageArray[Math.floor(Math.random() * imageArray.length)];
        }
        
        // Créer le post avec l'ID et le type
        const post: Post = {
          id: `${type.toLowerCase()}-${Date.now()}-${index}`,
          type,
          ...postData,
          ...(imageUrl ? { imageUrl } : {})
        };
        
        clearTimeout(timer);
        resolve(post);
      } catch (error) {
        console.error(`[OpenAI] Erreur lors de la génération du post ${index} de type ${type}:`, error);
        clearTimeout(timer);
        resolve(null);
      }
    });
  };

  // Fonction pour traiter les posts par lots
  const processBatch = async (startIdx: number): Promise<Post[]> => {
    const endIdx = Math.min(startIdx + CONCURRENCY_LIMIT, typeDistribution.length);
    const batch = typeDistribution.slice(startIdx, endIdx);
    
    console.log(`[OpenAI] Traitement du lot de ${batch.length} posts (${startIdx} à ${endIdx - 1})`);
    
    // Générer tous les posts du lot en parallèle
    const results = await Promise.all(
      batch.map((type, i) => generatePostWithTimeout(type, startIdx + i))
    );
    
    // Filtrer les résultats null (timeouts ou erreurs)
    return results.filter(post => post !== null) as Post[];
  };

  // Traiter tous les posts par lots avec concurrence limitée
  const allPosts: Post[] = [];
  for (let i = 0; i < typeDistribution.length; i += CONCURRENCY_LIMIT) {
    const batchResults = await processBatch(i);
    allPosts.push(...batchResults);
    
    // Si nous avons déjà assez de posts, arrêter la génération
    if (allPosts.length >= Math.ceil(count * 0.6)) {
      console.log(`[OpenAI] Assez de posts générés (${allPosts.length}/${count}), arrêt anticipé`);
      break;
    }
  }

  // Si nous n'avons pas assez de posts (en raison de timeouts ou d'erreurs), 
  // compléter avec des posts génériques de fallback
  if (allPosts.length < count) {
    console.log(`[OpenAI] Complétion avec ${count - allPosts.length} posts de fallback`);
    for (let i = allPosts.length; i < count; i++) {
      const type = typeDistribution[i % typeDistribution.length];
      allPosts.push(generateFallbackPost(type, i));
    }
  }

  console.log(`[OpenAI] Génération terminée, ${allPosts.length} posts créés`);
  return allPosts;
}

// Fonction pour générer un post de secours en cas d'erreur
function generateFallbackPost(type: typeof postTypes[number], index: number): Post {
  console.log(`[Fallback] Génération d'un post de secours pour le type ${type}`);
  
  switch(type) {
    case 'SCIENTIFIC':
      return {
        id: `fallback-scientific-${Date.now()}-${index}`,
        type: 'SCIENTIFIC',
        title: 'Les bienfaits de la marche rapide sur la santé cognitive',
        content: 'Une nouvelle étude révèle que 30 minutes de marche rapide par jour peuvent améliorer significativement les fonctions cognitives et réduire le risque de démence.',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        author: 'Dr. Marie Dupont',
        date: '2025-03-10',
        tags: ['santé', 'marche', 'cognition'],
        source: 'Journal of Neuroscience'
      };
    case 'QUOTE':
      return {
        id: `fallback-quote-${Date.now()}-${index}`,
        type: 'QUOTE',
        content: 'Le voyage de mille lieues commence toujours par un premier pas.',
        author: 'Lao Tseu',
        backgroundColor: '#E3F2FD',
        tags: ['motivation', 'sagesse']
      };
    case 'ROUTE':
      return {
        id: `fallback-route-${Date.now()}-${index}`,
        type: 'ROUTE',
        title: 'Parcours du Parc de la Villette',
        location: 'Paris 19ème',
        distance: 5.2,
        duration: 65,
        difficulty: 'EASY',
        description: 'Un parcours idéal pour les débutants, entièrement plat et verdoyant au cœur de Paris.',
        imageUrl: 'https://images.unsplash.com/photo-1569314039022-94ec5ff559bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        tags: ['paris', 'débutant', 'parc']
      };
    case 'EVENT':
    default:
      return {
        id: `fallback-event-${Date.now()}-${index}`,
        type: 'EVENT',
        title: 'Marathon de Paris 2025',
        date: '2025-04-06',
        location: 'Paris, France',
        description: 'Rejoignez-nous pour le marathon annuel de Paris, un parcours emblématique à travers les monuments les plus célèbres de la capitale française.',
        imageUrl: 'https://images.unsplash.com/photo-1479936343636-73cdc5aae0c3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        registrationLink: 'https://www.marathondeparis.com',
        tags: ['marathon', 'paris', 'compétition']
      };
  }
}

export async function GET(request: Request) {
  try {
    console.log('[API] Début du traitement de la requête GET pour les posts');
    
    // Récupérer les paramètres d'URL
    const url = new URL(request.url);
    const countParam = url.searchParams.get('count');
    const count = countParam ? parseInt(countParam) : 5;
    const mood = url.searchParams.get('mood') as Mood | null;
    const reason = url.searchParams.get('reason');
    
    console.log(`[API] Paramètres reçus - Count: ${count}, Humeur: ${mood || 'Non spécifiée'}, Raison: ${reason || 'Non spécifiée'}`);
    
    // Génération des posts avec OpenAI
    const feedPosts = await generatePostsWithOpenAI(count, mood || undefined, reason || undefined);
    
    console.log(`[API] ${feedPosts.length} posts générés avec succès`);
    
    // Renvoyer les posts
    return NextResponse.json({ posts: feedPosts });
    
  } catch (error) {
    console.error('[API] Erreur dans l\'API de posts:', error);
    
    // En cas d'erreur grave, retourner des posts génériques de fallback
    const fallbackPosts = [];
    const countParam = new URL(request.url).searchParams.get('count');
    const count = countParam ? parseInt(countParam) : 5;
    
    for (let i = 0; i < count; i++) {
      const type = postTypes[i % postTypes.length];
      fallbackPosts.push(generateFallbackPost(type, i));
    }
    
    return NextResponse.json(
      { 
        posts: fallbackPosts,
        error: "Une erreur est survenue lors de la génération des posts avec OpenAI. Des posts génériques sont affichés à la place."
      }
    );
  }
}
