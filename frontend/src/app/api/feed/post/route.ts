import { NextResponse } from 'next/server';
import { Post } from '../../../../types/feed';
import OpenAI from 'openai';

// Initialiser le client OpenAI - la clé API est configurée dans le fichier .env.local
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Types possibles de posts
const postTypes = ['SCIENTIFIC', 'QUOTE', 'ROUTE', 'EVENT'] as const;

// Types d'humeur
type Mood = 'HAPPY' | 'SAD' | 'NEUTRAL' | 'ENERGETIC' | 'TIRED' | 'STRESSED' | 'CALM';

// Configuration pour optimiser les performances
const TIMEOUT_MS = 10000; // Timeout pour la génération d'un post (10 secondes)

// Fonction pour générer un post avec OpenAI
async function generatePostWithOpenAI(
  type: typeof postTypes[number], 
  id: string, 
  mood?: Mood, 
  reason?: string
): Promise<Post> {
  return new Promise(async (resolve) => {
    // Créer un timer pour le timeout
    const timer = setTimeout(() => {
      console.warn(`[OpenAI] Timeout pour la génération du post de type ${type}`);
      resolve(generateFallbackPost(type, id));
    }, TIMEOUT_MS);

    try {
      console.log(`[OpenAI] Début de la génération d'un post de type ${type}`);
      console.log(`[OpenAI] Humeur: ${mood || 'Non spécifiée'}`);
      console.log(`[OpenAI] Raison: ${reason || 'Non spécifiée'}`);
      
      // Si l'humeur est spécifiée, adapter les prompts en fonction
      const moodContext = mood ? `L'utilisateur se sent actuellement ${mood.toLowerCase()}${reason ? ` car ${reason}` : ''}. ` : '';
      console.log(`[OpenAI] Contexte d'humeur utilisé: "${moodContext}"`);
      
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
      
      console.log(`[OpenAI] Envoi du prompt pour le post de type ${type}`);
      
      // Appeler l'API OpenAI pour générer le contenu (avec des paramètres optimisés pour la vitesse)
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
      
      console.log(`[OpenAI] Réponse reçue pour le post de type ${type}`);
      
      // Extraire et parser la réponse JSON
      const responseText = completion.choices[0].message.content || '';
      let postData;
      
      try {
        // Extraire uniquement le JSON si la réponse contient d'autres textes
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? jsonMatch[0] : responseText;
        postData = JSON.parse(jsonText);
        console.log(`[OpenAI] JSON parsé avec succès pour le post de type ${type}`);
      } catch (error) {
        console.error(`[OpenAI] Erreur lors du parsing JSON pour le post de type ${type}:`, error);
        clearTimeout(timer);
        resolve(generateFallbackPost(type, id));
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
        console.log(`[OpenAI] Image sélectionnée pour le post de type ${type}: ${imageUrl}`);
      }
      
      // Créer le post avec l'ID et le type
      const post: Post = {
        id,
        type,
        ...postData,
        ...(imageUrl ? { imageUrl } : {})
      };
      
      console.log(`[OpenAI] Post généré pour le type ${type}:`, {
        id: post.id,
        type: post.type,
        title: 'title' in post ? post.title : undefined,
        content: 'content' in post ? post.content.substring(0, 50) + '...' : undefined,
        tags: 'tags' in post ? post.tags : undefined
      });
      
      clearTimeout(timer);
      resolve(post);
    } catch (error) {
      console.error(`[OpenAI] Erreur lors de la génération du post ${type}:`, error);
      clearTimeout(timer);
      resolve(generateFallbackPost(type, id));
    }
  });
}

// Fonction pour générer un post de secours en cas d'erreur
function generateFallbackPost(type: typeof postTypes[number], id: string): Post {
  console.log(`[Fallback] Génération d'un post de secours pour le type ${type}`);
  
  switch(type) {
    case 'SCIENTIFIC':
      return {
        id,
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
        id,
        type: 'QUOTE',
        content: 'Le voyage de mille lieues commence toujours par un premier pas.',
        author: 'Lao Tseu',
        backgroundColor: '#E3F2FD',
        tags: ['motivation', 'sagesse']
      };
    case 'ROUTE':
      return {
        id,
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
        id,
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
    console.log('[API] Début du traitement de la requête GET pour un post individuel');
    
    // Récupérer les paramètres d'URL
    const url = new URL(request.url);
    const type = url.searchParams.get('type') as typeof postTypes[number];
    const id = url.searchParams.get('id') || `${Date.now()}`;
    const mood = url.searchParams.get('mood') as Mood | null;
    const reason = url.searchParams.get('reason');
    
    console.log(`[API] Paramètres reçus - Type: ${type}, ID: ${id}, Humeur: ${mood || 'Non spécifiée'}, Raison: ${reason || 'Non spécifiée'}`);
    
    // Vérifier si le type est valide
    if (!type || !postTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Type de post invalide' },
        { status: 400 }
      );
    }
    
    // Génération du post avec OpenAI (avec timeout intégré)
    const post = await generatePostWithOpenAI(type, id, mood || undefined, reason || undefined);
    
    console.log(`[API] Post généré avec succès, ID: ${post.id}, Type: ${post.type}`);
    
    // Renvoyer le post
    return NextResponse.json(post);
    
  } catch (error) {
    console.error('[API] Erreur dans l\'API de post individuel:', error);
    
    // Utiliser le type demandé dans l'URL, ou un type par défaut
    const url = new URL(request.url);
    const type = url.searchParams.get('type') as typeof postTypes[number] || 'SCIENTIFIC';
    const id = url.searchParams.get('id') || `fallback-${Date.now()}`;
    
    // Renvoyer un post de fallback en cas d'erreur
    return NextResponse.json(generateFallbackPost(type, id));
  }
}
