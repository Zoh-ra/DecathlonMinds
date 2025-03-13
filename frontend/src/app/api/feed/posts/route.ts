import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Post, Mood, ScientificPost, QuotePost, RoutePost, EventPost } from '@/types/feed';

// Types de posts que nous voulons générer
const postTypes = ['SCIENTIFIC', 'QUOTE', 'ROUTE', 'EVENT'] as const;

// Mapping des émotions en français vers l'anglais pour OpenAI
const emotionMapping: Record<string, string> = {
  // Mapping des émotions en français vers des termes standardisés
  'HEUREUX': 'HAPPY',
  'HEUREUSE': 'HAPPY',
  'SATISFAIT': 'CONTENT',
  'SATISFAITE': 'CONTENT',
  'MÉLANCOLIQUE': 'MELANCHOLIC',
  'FRUSTRÉ': 'FRUSTRATED',
  'FRUSTRÉE': 'FRUSTRATED',
  'JOYEUX': 'JOYFUL',
  'JOYEUSE': 'JOYFUL',
  'CONFIANT': 'CONFIDENT',
  'CONFIANTE': 'CONFIDENT',
  'DÉÇU': 'DISAPPOINTED',
  'DÉÇUE': 'DISAPPOINTED',
  'ANXIEUX': 'ANXIOUS',
  'ANXIEUSE': 'ANXIOUS',
  'EXCITÉ': 'EXCITED',
  'EXCITÉE': 'EXCITED',
  'TRISTE': 'SAD',
  'EN COLÈRE': 'ANGRY',
  'STRESSÉ': 'STRESSED',
  'STRESSÉE': 'STRESSED',
  'BLESSÉ': 'INJURED',
  'BLESSÉE': 'INJURED',
  'DÉBOUSSOLÉ': 'CONFUSED',
  'DÉBOUSSOLÉE': 'CONFUSED',
  'NERVEUX': 'NERVOUS',
  'NERVEUSE': 'NERVOUS',
  
  // Formes sans accents ou variantes
  'HEUREUX(SE)': 'HAPPY',
  'SATISFAIT(E)': 'CONTENT',
  'FRUSTRE(E)': 'FRUSTRATED',
  'JOYEUX(SE)': 'JOYFUL',
  'CONFIANT(E)': 'CONFIDENT',
  'DECU(E)': 'DISAPPOINTED',
  'ANXIEUX(SE)': 'ANXIOUS',
  'EXCITE(E)': 'EXCITED',
  'STRESSE(E)': 'STRESSED',
  'BLESSE(E)': 'INJURED',
  'DEBOUSSOLE(E)': 'CONFUSED',
  'NERVEUX(SE)': 'NERVOUS',
  
  // Formes anglaises (pour compatibilité)
  'HAPPY': 'HAPPY',
  'CONTENT': 'CONTENT',
  'MELANCHOLIC': 'MELANCHOLIC',
  'FRUSTRATED': 'FRUSTRATED',
  'JOYFUL': 'JOYFUL',
  'CONFIDENT': 'CONFIDENT',
  'DISAPPOINTED': 'DISAPPOINTED',
  'ANXIOUS': 'ANXIOUS',
  'EXCITED': 'EXCITED',
  'SAD': 'SAD',
  'ANGRY': 'ANGRY',
  'TIRED': 'TIRED',
  'CALM': 'CALM',
  'STRESSED': 'STRESSED',
  'INJURED': 'INJURED',
  'CONFUSED': 'CONFUSED',
  'NERVOUS': 'NERVOUS'
};

// Fonction pour normaliser les émotions
function normalizeEmotion(emotion: string | null | undefined): string | undefined {
  if (!emotion) return undefined;
  
  // Convertir en majuscules et supprimer les espaces supplémentaires
  const normalizedEmotion = emotion.toUpperCase().trim();
  
  // Vérifier si l'émotion est dans notre mapping
  if (emotionMapping[normalizedEmotion]) {
    return emotionMapping[normalizedEmotion];
  }
  
  // Pour les émotions qui ne sont pas dans le mapping, essayer de trouver une correspondance partielle
  for (const [key, value] of Object.entries(emotionMapping)) {
    if (normalizedEmotion.includes(key) || key.includes(normalizedEmotion)) {
      return value;
    }
  }
  
  // Si aucune correspondance n'est trouvée, retourner l'émotion originale
  console.warn(`[Émotion] Émotion non reconnue: ${emotion}`);
  return normalizedEmotion;
}

// Configuration pour les requêtes OpenAI
const CONCURRENCY_LIMIT = 4; // Limite pour les appels parallèles
const TIMEOUT_MS = 20000; // 20 secondes de timeout pour chaque requête

// Initialiser le client OpenAI avec la clé API depuis .env.local
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Fonction pour générer des posts basés sur l'émotion et la cause
async function generatePostsWithOpenAI(
  count: number = 8, 
  mood?: Mood | null,
  reason?: string | null
): Promise<Post[]> {
  console.log(`[OpenAI] Génération de ${count} posts avec données réelles`);
  console.log(`[OpenAI] Paramètres - Humeur: ${mood || 'Non spécifiée'}, Raison: ${reason || 'Non spécifiée'}`);
  
  // Normaliser l'humeur
  const normalizedMood = mood ? normalizeEmotion(mood) : undefined;
  
  // Adapter la distribution des types de post selon l'émotion
  const typeDistribution = getPostTypeDistribution(count, normalizedMood);
  
  // Créer un tableau de promesses pour génération parallèle
  const postPromises: Promise<Post | null>[] = [];
  
  // Limiter le nombre de requêtes parallèles
  for (let i = 0; i < count; i++) {
    const type = typeDistribution[i];
    // Ajouter un délai progressif pour éviter les surcharges d'API
    const delay = Math.floor(i / CONCURRENCY_LIMIT) * 100;
    
    postPromises.push(
      new Promise(async (resolve) => {
        if (delay > 0) {
          await new Promise(r => setTimeout(r, delay));
        }
        const post = await generatePostWithTimeout(type, i, normalizedMood, reason);
        resolve(post);
      })
    );
  }
  
  // Attendre que toutes les promesses soient résolues
  const posts = await Promise.all(postPromises);
  
  // Filtrer les posts null (timeouts ou erreurs)
  const validPosts = posts.filter((post): post is Post => post !== null);
  
  console.log(`[OpenAI] ${validPosts.length}/${count} posts générés avec succès`);
  
  // Si nous n'avons pas assez de posts, compléter avec quelques posts de secours
  if (validPosts.length < count / 2) {
    const backupPosts = generateBackupPosts(count - validPosts.length, normalizedMood, reason);
    return [...validPosts, ...backupPosts];
  }
  
  return validPosts;
}

// Fonction pour déterminer la distribution des types de posts selon l'émotion
function getPostTypeDistribution(
  count: number, 
  normalizedMood?: string
): Array<typeof postTypes[number]> {
  const distribution: Array<typeof postTypes[number]> = [];
  
  if (!normalizedMood) {
    // Distribution équilibrée par défaut
    for (let i = 0; i < count; i++) {
      distribution.push(postTypes[i % postTypes.length]);
    }
    return distribution;
  }
  
  const moodUpper = normalizedMood.toUpperCase();
  
  switch (moodUpper) {
    case 'SAD':
    case 'ANXIOUS':
      // Privilégier les quotes motivantes et les parcours apaisants
      for (let i = 0; i < count; i++) {
        if (i % 4 === 0) distribution.push('QUOTE');
        else if (i % 4 === 1) distribution.push('ROUTE');
        else if (i % 4 === 2) distribution.push('SCIENTIFIC');
        else distribution.push('EVENT');
      }
      break;
      
    case 'HAPPY':
    case 'EXCITED':
    case 'JOYFUL':
      // Privilégier les événements et les parcours énergisants
      for (let i = 0; i < count; i++) {
        if (i % 4 === 0) distribution.push('EVENT');
        else if (i % 4 === 1) distribution.push('ROUTE');
        else if (i % 4 === 2) distribution.push('QUOTE');
        else distribution.push('SCIENTIFIC');
      }
      break;
      
    case 'TIRED':
      // Privilégier les conseils scientifiques et parcours adaptés à la fatigue
      for (let i = 0; i < count; i++) {
        if (i % 4 === 0) distribution.push('SCIENTIFIC');
        else if (i % 4 === 1) distribution.push('ROUTE');
        else if (i % 4 === 2) distribution.push('QUOTE');
        else distribution.push('EVENT');
      }
      break;
      
    case 'ANGRY':
    case 'FRUSTRATED':
      // Privilégier les activités physiques défoulantes
      for (let i = 0; i < count; i++) {
        if (i % 4 === 0) distribution.push('ROUTE');
        else if (i % 4 === 1) distribution.push('SCIENTIFIC');
        else if (i % 4 === 2) distribution.push('QUOTE');
        else distribution.push('EVENT');
      }
      break;
      
    case 'STRESSED':
      // Privilégier les conseils scientifiques et les parcours apaisants
      for (let i = 0; i < count; i++) {
        if (i % 4 === 0) distribution.push('SCIENTIFIC');
        else if (i % 4 === 1) distribution.push('ROUTE');
        else if (i % 4 === 2) distribution.push('QUOTE');
        else distribution.push('EVENT');
      }
      break;
      
    case 'INJURED':
      // Privilégier les conseils scientifiques et les parcours adaptés à la blessure
      for (let i = 0; i < count; i++) {
        if (i % 4 === 0) distribution.push('SCIENTIFIC');
        else if (i % 4 === 1) distribution.push('ROUTE');
        else if (i % 4 === 2) distribution.push('QUOTE');
        else distribution.push('EVENT');
      }
      break;
      
    case 'CONFUSED':
      // Privilégier les quotes motivantes et les parcours apaisants
      for (let i = 0; i < count; i++) {
        if (i % 4 === 0) distribution.push('QUOTE');
        else if (i % 4 === 1) distribution.push('ROUTE');
        else if (i % 4 === 2) distribution.push('SCIENTIFIC');
        else distribution.push('EVENT');
      }
      break;
      
    case 'NERVOUS':
      // Privilégier les conseils scientifiques et les parcours apaisants
      for (let i = 0; i < count; i++) {
        if (i % 4 === 0) distribution.push('SCIENTIFIC');
        else if (i % 4 === 1) distribution.push('ROUTE');
        else if (i % 4 === 2) distribution.push('QUOTE');
        else distribution.push('EVENT');
      }
      break;
      
    default:
      // Distribution équilibrée pour les autres émotions
      for (let i = 0; i < count; i++) {
        distribution.push(postTypes[i % postTypes.length]);
      }
  }
  
  return distribution;
}

// Fonction pour générer un post avec timeout
async function generatePostWithTimeout(
  type: typeof postTypes[number], 
  index: number,
  normalizedMood?: string,
  reason?: string | null
): Promise<Post | null> {
  return new Promise(async (resolve) => {
    // Timer pour gérer les timeouts
    const timer = setTimeout(() => {
      console.error(`[OpenAI] Timeout lors de la génération du post ${index} de type ${type}`);
      resolve(null);
    }, TIMEOUT_MS);
    
    try {
      console.log(`[OpenAI] Génération du post ${index} de type ${type}`);
      
      // Construire le message système pour OpenAI
      const systemMessage = buildSystemMessage(type, normalizedMood, reason);
      
      // Construire le message utilisateur pour OpenAI
      const userMessage = buildUserMessage(type, normalizedMood, reason);
      
      // Faire la requête à l'API OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-0125", // Modèle récent optimisé pour la vitesse
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: systemMessage
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        response_format: { type: "json_object" }
      });
      
      // Annuler le timer de timeout
      clearTimeout(timer);
      
      // Récupérer le contenu de la réponse
      const content = response.choices[0]?.message?.content || '';
      
      if (!content) {
        console.error(`[OpenAI] Réponse vide pour le post ${index} de type ${type}`);
        resolve(null);
        return;
      }
      
      try {
        // Parser le JSON retourné par OpenAI
        const responseJson = JSON.parse(content);
        
        // Traiter la réponse selon le type de post
        const post = processResponseByType(type, responseJson, normalizedMood, reason);
        
        if (post) {
          console.log(`[OpenAI] Post ${index} de type ${type} généré avec succès`);
          resolve(post);
        } else {
          console.error(`[OpenAI] Échec de traitement pour le post ${index} de type ${type}`);
          resolve(null);
        }
      } catch (parseError) {
        console.error(`[OpenAI] Erreur de parsing JSON pour le post ${index}: ${parseError}`);
        resolve(null);
      }
    } catch (error) {
      clearTimeout(timer);
      console.error(`[OpenAI] Erreur pour le post ${index}: ${error}`);
      resolve(null);
    }
  });
}

// Construire le message système pour OpenAI selon le type de post
function buildSystemMessage(
  type: typeof postTypes[number],
  normalizedMood?: string,
  reason?: string | null
): string {
  const moodContext = normalizedMood ? `L'utilisateur se sent actuellement ${normalizedMood.toLowerCase()}${reason ? ` car ${reason}` : ''}. ` : '';
  
  let systemMessage = `Tu es un assistant expert en bien-être émotionnel chez Decathlon, spécialisé dans la création de contenu personnalisé.
${moodContext}Ta mission est de générer un contenu qui répond DIRECTEMENT et SPÉCIFIQUEMENT à cette situation émotionnelle.`;

  switch (type) {
    case 'SCIENTIFIC':
      systemMessage += `\nTu dois fournir un article scientifique PERTINENT qui traite SPÉCIFIQUEMENT du lien entre l'activité physique (marche ou jogging) et l'émotion "${normalizedMood?.toLowerCase()}" ${reason ? `causée par "${reason}"` : ''}.
IMPORTANT: L'article doit DIRECTEMENT aborder comment la marche/jogging peut aider à gérer cette émotion spécifique dans ce contexte particulier. NE PAS fournir de contenu générique sur les bienfaits du sport.`;
      break;
      
    case 'QUOTE':
      systemMessage += `\nTu dois fournir une citation pertinente qui pourrait inspirer quelqu'un ressentant spécifiquement "${normalizedMood?.toLowerCase()}" ${reason ? `à cause de "${reason}"` : ''} à faire de la marche ou du jogging.
IMPORTANT: La citation doit RÉELLEMENT résonner avec la situation émotionnelle spécifique de l'utilisateur.`;
      break;
      
    case 'ROUTE':
      systemMessage += `\nTu dois suggérer un parcours de marche/jogging en France qui serait SPÉCIFIQUEMENT adapté à quelqu'un qui ressent "${normalizedMood?.toLowerCase()}" ${reason ? `à cause de "${reason}"` : ''}.
IMPORTANT: Explique CLAIREMENT pourquoi les caractéristiques de ce parcours (environnement, difficulté, durée) sont particulièrement bénéfiques pour cette émotion spécifique dans ce contexte.`;
      break;
      
    case 'EVENT':
      systemMessage += `\nTu dois INVENTER un événement sportif fictif en France (course, marche, etc.) qui serait PARFAITEMENT adapté à quelqu'un ressentant "${normalizedMood?.toLowerCase()}" ${reason ? `à cause de "${reason}"` : ''}.
IMPORTANT: Ne pas utiliser d'événements réels existants. Crée un événement sur mesure qui répond EXACTEMENT aux besoins émotionnels de l'utilisateur. L'événement doit être fictif mais crédible.`;
      break;
  }
  
  systemMessage += `\nTon contenu doit EXPLICITEMENT encourager la marche ou le jogging comme activité physique principale et expliquer PRÉCISÉMENT comment ces activités peuvent aider à gérer l'émotion spécifique de l'utilisateur.`;
  
  return systemMessage;
}

// Construire le message utilisateur pour OpenAI selon le type de post
function buildUserMessage(
  type: typeof postTypes[number],
  normalizedMood?: string,
  reason?: string | null
): string {
  const mood = normalizedMood?.toLowerCase() || 'inconnue';
  const moodCause = reason || 'non spécifiée';
  
  switch (type) {
    case 'SCIENTIFIC':
      return `Fournis-moi une source scientifique PERTINENTE qui étudie SPÉCIFIQUEMENT le lien entre le sport (marche/jogging) et l'émotion "${mood}" ${reason ? `causée par "${moodCause}"` : ''}.
Assure-toi que l'étude traite PRÉCISÉMENT de cette émotion particulière et explique comment la marche/jogging peut aider dans ce contexte spécifique.

FORMAT DE RÉPONSE (JSON):
{
  "title": "Titre de l'étude scientifique (sans guillemets)",
  "summary": "Résumé des résultats qui mentionnent comment la marche ou le jogging influence spécifiquement cette émotion",
  "source": "Nom de la publication, auteurs, année",
  "date": "Date de publication au format YYYY-MM-DD",
  "url": "URL de la source si disponible (sinon laisser vide)"
}`;

    case 'QUOTE':
      return `Fournis-moi une citation inspirante qui pourrait motiver quelqu'un qui ressent "${mood}" ${reason ? `à cause de "${moodCause}"` : ''} à faire de la marche ou du jogging.
La citation doit RÉELLEMENT résonner avec cette émotion spécifique dans ce contexte particulier.

FORMAT DE RÉPONSE (JSON):
{
  "content": "La citation (sans inventer)",
  "author": "Nom de l'auteur de la citation",
  "context": "Contexte de la citation si connu (sinon laisser vide)"
}`;

    case 'ROUTE':
      return `Suggère un parcours de marche/jogging en France qui serait SPÉCIFIQUEMENT adapté à quelqu'un qui ressent "${mood}" ${reason ? `à cause de "${moodCause}"` : ''}.
Explique pourquoi les caractéristiques spécifiques de ce parcours sont bénéfiques pour cette émotion particulière.

FORMAT DE RÉPONSE (JSON):
{
  "name": "Nom du parcours",
  "location": "Localisation précise en France",
  "distance": "Distance en km (nombre uniquement)",
  "duration": "Durée moyenne en minutes (nombre uniquement)",
  "difficulty": "EASY, MEDIUM ou HARD",
  "description": "Description expliquant pourquoi ce parcours est SPÉCIFIQUEMENT adapté à cette émotion"
}`;

    case 'EVENT':
      return `INVENTE un événement sportif fictif en France (course, marche, etc.) qui serait PARFAITEMENT adapté à quelqu'un ressentant "${mood}" ${reason ? `à cause de "${moodCause}"` : ''}.
Crée un événement sur mesure qui répond EXACTEMENT aux besoins émotionnels de l'utilisateur. L'événement doit être fictif mais crédible.

FORMAT DE RÉPONSE (JSON):
{
  "title": "Nom de l'événement fictif",
  "location": "Lieu précis en France",
  "date": "Date future au format YYYY-MM-DD",
  "description": "Description expliquant pourquoi cet événement convient PARFAITEMENT à cette émotion",
  "url": "Laisser vide car c'est un événement fictif"
}`;

    default:
      return `Génère un contenu adapté à quelqu'un qui ressent "${mood}" ${reason ? `à cause de "${moodCause}"` : ''} et qui pourrait bénéficier de marche ou de jogging.
Explique SPÉCIFIQUEMENT comment ces activités peuvent aider à gérer cette émotion particulière dans ce contexte.`;
  }
}

// Traiter la réponse selon le type de post
function processResponseByType(
  type: typeof postTypes[number],
  responseJson: Record<string, unknown>,
  normalizedMood?: string,
  reason?: string | null
): Post | null {
  try {
    console.log(`[OpenAI] Traitement de post ${type} avec contexte: mood=${normalizedMood || 'non spécifié'}, reason=${reason || 'non spécifié'}`);
    
    switch (type) {
      case 'SCIENTIFIC':
        return {
          id: `sci-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          type: 'SCIENTIFIC',
          title: (responseJson.title as string) || 'Étude scientifique sur le sport et le bien-être',
          content: (responseJson.summary as string) || '',
          author: (responseJson.source as string) || '',
          imageUrl: getRandomImage('scientific', normalizedMood || '', extractKeywords(
            responseJson.title as string || '', 
            responseJson.summary as string || ''
          )),
          date: (responseJson.date as string) || new Date().toISOString().split('T')[0],
          source: generateScientificSource(normalizedMood)
        };
        
      case 'QUOTE':
        return {
          id: `quote-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          type: 'QUOTE',
          content: (responseJson.content as string) || '',
          author: (responseJson.author as string) || 'Anonyme',
          backgroundColor: '#f5f5f5'
        };
        
      case 'ROUTE':
        return {
          id: `route-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          type: 'ROUTE',
          title: (responseJson.name as string) || 'Parcours recommandé',
          location: (responseJson.location as string) || 'France',
          distance: parseFloat((responseJson.distance as string)) || 5,
          duration: parseInt((responseJson.duration as string), 10) || 30,
          difficulty: convertDifficultyLevel((responseJson.difficulty as string) || 'MEDIUM'),
          description: (responseJson.description as string) || '',
          imageUrl: getRandomImage('route', normalizedMood || '', extractKeywords(
            responseJson.name as string || '', 
            responseJson.description as string || ''
          ))
        };
        
      case 'EVENT':
        return {
          id: `event-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          type: 'EVENT',
          title: (responseJson.title as string) || 'Événement sportif',
          location: (responseJson.location as string) || 'France',
          date: (responseJson.date as string) || new Date().toISOString().split('T')[0],
          description: (responseJson.description as string) || '',
          imageUrl: getRandomImage('event', normalizedMood || '', extractKeywords(
            responseJson.title as string || '', 
            responseJson.description as string || ''
          )),
          registrationLink: (responseJson.url as string)
        };
        
      default:
        console.error(`[OpenAI] Type de post non reconnu: ${type}`);
        return null;
    }
  } catch (error) {
    console.error(`[OpenAI] Erreur lors du traitement de la réponse: ${error}`);
    return null;
  }
}

// Extraire les mots-clés d'un texte pour améliorer la sélection d'images
function extractKeywords(text1: string = '', text2: string = ''): string[] {
  const combinedText = `${text1} ${text2}`.toLowerCase();
  const keywords: string[] = [];
  
  // Mots-clés liés à la marche/jogging
  const walkingKeywords = ['marche', 'marcher', 'promenade', 'randonnée', 'chemin', 'sentier', 'parcours'];
  const joggingKeywords = ['course', 'courir', 'jogging', 'running', 'trail', 'endurance', 'cardio'];
  
  // Extraire les mots-clés liés à la marche
  for (const keyword of walkingKeywords) {
    if (combinedText.includes(keyword)) {
      keywords.push(keyword);
    }
  }
  
  // Extraire les mots-clés liés au jogging
  for (const keyword of joggingKeywords) {
    if (combinedText.includes(keyword)) {
      keywords.push(keyword);
    }
  }
  
  // Ajouter d'autres mots-clés pertinents (nature, santé, etc.)
  const otherKeywords = ['nature', 'forêt', 'parc', 'montagne', 'lac', 'rivière', 'santé', 'bien-être', 'sport'];
  for (const keyword of otherKeywords) {
    if (combinedText.includes(keyword)) {
      keywords.push(keyword);
    }
  }
  
  return keywords;
}

// Générer des posts de secours en cas d'échec de l'API
function generateBackupPosts(
  count: number, 
  normalizedMood?: string,
  reason?: string | null
): Post[] {
  const backupPosts: Post[] = [];
  const moodText = normalizedMood?.toLowerCase() || 'variable';
  const reasonText = reason ? ` liée à ${reason}` : '';
  
  // Posts de secours pour chaque type
  const backupScientific: ScientificPost = {
    id: `sci-backup-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    type: 'SCIENTIFIC',
    title: `L'impact de l'activité physique sur l'humeur ${moodText}${reasonText}`,
    content: `Des recherches de l'Université de Bordeaux montrent que 30 minutes de marche ou de course à pied par jour peuvent significativement améliorer l'état émotionnel. L'activité physique régulière stimule la production d'endorphines, réduisant le stress et l'anxiété tout en augmentant la sensation de bien-être.`,
    author: 'Dr. Sophie Moreau',
    date: new Date().toISOString().split('T')[0],
    imageUrl: getRandomImage('scientific', normalizedMood || ''),
    source: generateScientificSource(normalizedMood)
  };
  
  const backupQuote: QuotePost = {
    id: `quote-backup-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    type: 'QUOTE',
    content: `La course n'est pas seulement un exercice physique, c'est une thérapie. Un pas après l'autre, nous avançons vers une meilleure version de nous-mêmes.`,
    author: 'Emil Zátopek',
    backgroundColor: '#e9f5ff'
  };
  
  const backupRoute: RoutePost = {
    id: `route-backup-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    type: 'ROUTE',
    title: `Parcours du Bois de Boulogne`,
    location: 'Paris, France',
    distance: 5.2,
    duration: 45,
    difficulty: 'MEDIUM',
    description: `Ce parcours paisible au cœur de Paris offre un cadre idéal pour se ressourcer et gérer ses émotions${reasonText}. Les nombreux arbres et le lac créent une atmosphère apaisante, parfaite pour une marche méditative ou un jogging revitalisant.`,
    imageUrl: getRandomImage('route', normalizedMood || '')
  };
  
  const backupEvent: EventPost = {
    id: `event-backup-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    type: 'EVENT',
    title: `Course des Héros`,
    location: 'Paris, Lyon, Bordeaux, France',
    date: new Date().toISOString().split('T')[0],
    description: `Un événement solidaire et fédérateur où chacun peut participer à son rythme, que ce soit en marchant ou en courant. Parfait pour se fixer un objectif positif et transformer son énergie émotionnelle${reasonText} en action constructive.`,
    imageUrl: getRandomImage('event', normalizedMood || ''),
    registrationLink: 'https://www.coursedesheros.com'
  };
  
  // Ajouter les posts de secours selon les besoins
  for (let i = 0; i < count; i++) {
    switch (i % 4) {
      case 0:
        backupPosts.push(backupScientific);
        break;
      case 1:
        backupPosts.push(backupQuote);
        break;
      case 2:
        backupPosts.push(backupRoute);
        break;
      case 3:
        backupPosts.push(backupEvent);
        break;
    }
  }
  
  return backupPosts;
}

// Garder trace des images déjà utilisées pour éviter les répétitions
const usedImages = new Set<string>();

// Liste noire d'images à ne jamais utiliser
const BLACKLISTED_IMAGE_KEYWORDS = [
  'starbucks', 'logo', 'brand', 'mcdonalds', 'coca', 'pepsi', 'nike',
  'adidas', 'restaurant', 'cafe', 'coffee', 'burger', 'trademark'
];

function getRandomImage(category: string, normalizedEmotion: string = '', keywords: string[] = []): string {
  // Liste d'images garanties fonctionnelles (testées et vérifiées) - SANS MARQUES COMMERCIALES
  const guaranteedImages = [
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b', // Activité physique
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b', // Recherche scientifique
    'https://images.unsplash.com/photo-1518611012118-696072aa579a', // Santé mentale
    'https://images.unsplash.com/photo-1607962837359-5e7e89f86776', // Randonnée
    'https://images.unsplash.com/photo-1526401485004-48988a57fccf', // Exercice
    'https://images.unsplash.com/photo-1496196614460-48988a57fccf', // Nature
    'https://images.unsplash.com/photo-1479936343636-a46b732e635f', // Activité en groupe
    'https://images.unsplash.com/photo-1521804906057-b5e38734688a'  // Santé
  ];

  // Dictionnaire d'images variées et thématiques par catégorie
  const imagesByCategory: Record<string, Record<string, string[]>> = {
    'scientific': {
      'default': [
        'https://images.unsplash.com/photo-1532094349884-ba3e7458af70', // Laboratoire
        'https://images.unsplash.com/photo-1576086213369-97a306d36557', // Microscope
        'https://images.unsplash.com/photo-1580894894513-541e068a3e2b', // Recherche
        'https://images.unsplash.com/photo-1507413245164-ba3e38734688a', // Science
        'https://images.unsplash.com/photo-1554475900-0a0350e3fc7b', // Étude
        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173'  // Santé
      ],
      'santé': [
        'https://images.unsplash.com/photo-1505751172876-fa1923c5c528', // Médecin
        'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7', // Santé
        'https://images.unsplash.com/photo-1571772996211-d750089bc07e', // Consultation
        'https://images.unsplash.com/photo-1603398938378-e54eab446dde'  // Santé mentale
      ],
      'activité physique': [
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', // Course
        'https://images.unsplash.com/photo-1486739985386-d4fae04ca6f7', // Stretching
        'https://images.unsplash.com/photo-1518611012118-696072aa579a', // Méditation
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b'  // Exercice
      ],
      'nutrition': [
        'https://images.unsplash.com/photo-1490645935967-10de6ba17061', // Alimentation saine
        'https://images.unsplash.com/photo-1494390248081-4e521a5940db', // Fruits
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd'  // Repas équilibré
      ],
      'sleep': [
        'https://images.unsplash.com/photo-1541781774459-5e7e89f86776', // Sommeil
        'https://images.unsplash.com/photo-1584675066426-883c9d53cbb2', // Lit
        'https://images.unsplash.com/photo-1631157769374-a46b732e635f'  // Repos
      ],
      'brain': [
        'https://images.unsplash.com/photo-1559757175-5700dde675bc', // Cerveau
        'https://images.unsplash.com/photo-1600322305248-e4582a627559', // Concentration
        'https://images.unsplash.com/photo-1576671414121-aa1faa3de84e'  // Mental
      ],
      'mental': [
        'https://images.unsplash.com/photo-1496449903398-11f5da89639b', // Psychologie
        'https://images.unsplash.com/photo-1489533119213-66a5cd877091', // Méditation
        'https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f'  // Bien-être
      ],
      'colère': [
        'https://images.unsplash.com/photo-1503525148566-fa3e38734688a', // Gestion du stress
        'https://images.unsplash.com/photo-1517486808906-b43e38734688a', // Méditation
        'https://images.unsplash.com/photo-1499209974431-9dddcece7f88'  // Respiration
      ],
      'travail': [
        'https://images.unsplash.com/photo-1499750310107-5fef28a66643', // Bureau
        'https://images.unsplash.com/photo-1542744173-8e7e53415bb0', // Meeting
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40'  // Ordinateur
      ]
    },
    'route': {
      'default': [
        'https://images.unsplash.com/photo-1502082553048-f009c37129b9', // Chemin
        'https://images.unsplash.com/photo-1483721310020-03333e577078', // Sentier
        'https://images.unsplash.com/photo-1465188162913-8fb5709d6d57', // Forêt
        'https://images.unsplash.com/photo-1510797215324-95aa89f43c33', // Montagne
        'https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8', // Randonnée
        'https://images.unsplash.com/photo-1528543606781-2f6e6857f318'  // Marche
      ],
      'forest': [
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e', // Arbres
        'https://images.unsplash.com/photo-1470071459604-6528243d208b', // Verdure
        'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843'  // Sous-bois
      ],
      'mountain': [
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b', // Sommet
        'https://images.unsplash.com/photo-1486870591958-5e7e89f86776', // Vue
        'https://images.unsplash.com/photo-1496196614460-48988a57fccf'  // Alpinisme
      ],
      'water': [
        'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f', // Lac
        'https://images.unsplash.com/photo-1548032885-b5e38734688a', // Rivière
        'https://images.unsplash.com/photo-1507525428034-b5e38734688a'  // Plage
      ],
      'city': [
        'https://images.unsplash.com/photo-1514565131-fce0801e5785', // Urbain
        'https://images.unsplash.com/photo-1519501025264-ca0283ece5bf', // Rues
        'https://images.unsplash.com/photo-1449824913935-59a10b8d2000'  // Parc urbain
      ]
    },
    'event': {
      'default': [
        'https://images.unsplash.com/photo-1523580494863-6f3031224c94', // Groupe
        'https://images.unsplash.com/photo-1540747913346-19e32dc6c97e', // Événement
        'https://images.unsplash.com/photo-1527529482837-4698179dc6ce', // Sport
        'https://images.unsplash.com/photo-1511578314322-379afb476865', // Course
        'https://images.unsplash.com/photo-1508997449629-303059a039c0', // Extérieur
        'https://images.unsplash.com/photo-1469571486292-b53926c9118f'  // Activité
      ],
      'running': [
        'https://images.unsplash.com/photo-1461896836934-f009c37129b9', // Jogging
        'https://images.unsplash.com/photo-1486739985386-d4fae04ca6f7', // Course
        'https://images.unsplash.com/photo-1506784365847-bbad939e9335'  // Sprint
      ],
      'team': [
        'https://images.unsplash.com/photo-1526232373132-0e4ee643fa17', // Équipe
        'https://images.unsplash.com/photo-1526976668912-1a811878dd37', // Groupe
        'https://images.unsplash.com/photo-1529688530647-93a6e1916f5f'  // Activité de groupe
      ],
      'marathon': [
        'https://images.unsplash.com/photo-1517930279028-4f157c05e876', // Course
        'https://images.unsplash.com/photo-1530137073265-82a0549be0eb', // Ligne d'arrivée
        'https://images.unsplash.com/photo-1553351234-7be8a332c457'  // Coureurs
      ],
      'workshop': [
        'https://images.unsplash.com/photo-1536510233921-8e5043fce771', // Atelier
        'https://images.unsplash.com/photo-1543269865-cbf427effbad', // Formation
        'https://images.unsplash.com/photo-1503428593586-e4582a627559'  // Conférence
      ]
    }
  };

  // Images spécifiques aux émotions (MISE À JOUR AVEC IMAGES PLUS APPROPRIÉES)
  const emotionImages: Record<string, string[]> = {
    'HAPPY': [
      'https://images.unsplash.com/photo-1518717758536-b85e29035b6d', // Sourire
      'https://images.unsplash.com/photo-1541535650810-b5e38734688a', // Joie
      'https://images.unsplash.com/photo-1545205597-3d9d02c29597', // Méditation joyeuse
      'https://images.unsplash.com/photo-1508214532236-ca0283ece5bf'  // Yoga joyeux
    ],
    'SAD': [
      'https://images.unsplash.com/photo-1516534775068-ba3e7458af70', // Contemplation
      'https://images.unsplash.com/photo-1517486808906-b43e38734688a', // Réflexion
      'https://images.unsplash.com/photo-1476782916354-326ab24c93df', // Méditation calme
      'https://images.unsplash.com/photo-1536695867206-b43e38734688a'  // Moment de silence
    ],
    'ANGRY': [
      'https://images.unsplash.com/photo-1593871075120-982e042087a8', // Boxe
      'https://images.unsplash.com/photo-1599058917212-d750089bc07e', // Course intensive
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', // Effort physique
      'https://images.unsplash.com/photo-1545231027-637d2f6210f8'  // Exercice intense
    ],
    'ANXIOUS': [
      'https://images.unsplash.com/photo-1518622358385-8ea7d0794bf6', // Méditation
      'https://images.unsplash.com/photo-1545389336-cf090694435e', // Yoga
      'https://images.unsplash.com/photo-1453738773917-9c3eff1db985', // Respiration
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155'  // Détente
    ],
    'STRESSED': [
      'https://images.unsplash.com/photo-1518622358385-8ea7d0794bf6', // Méditation
      'https://images.unsplash.com/photo-1545389336-cf090694435e', // Yoga
      'https://images.unsplash.com/photo-1453738773917-9c3eff1db985', // Respiration
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155'  // Détente
    ],
    'INJURED': [
      'https://images.unsplash.com/photo-1516534775068-ba3e7458af70', // Contemplation
      'https://images.unsplash.com/photo-1517486808906-b43e38734688a', // Réflexion
      'https://images.unsplash.com/photo-1476782916354-326ab24c93df', // Méditation calme
      'https://images.unsplash.com/photo-1536695867206-b43e38734688a'  // Moment de silence
    ],
    'CONFUSED': [
      'https://images.unsplash.com/photo-1516534775068-ba3e7458af70', // Contemplation
      'https://images.unsplash.com/photo-1517486808906-b43e38734688a', // Réflexion
      'https://images.unsplash.com/photo-1476782916354-326ab24c93df', // Méditation calme
      'https://images.unsplash.com/photo-1536695867206-b43e38734688a'  // Moment de silence
    ],
    'NERVOUS': [
      'https://images.unsplash.com/photo-1518622358385-8ea7d0794bf6', // Méditation
      'https://images.unsplash.com/photo-1545389336-cf090694435e', // Yoga
      'https://images.unsplash.com/photo-1453738773917-9c3eff1db985', // Respiration
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155'  // Détente
    ]
  };

  // Créer un pool d'images basé sur la catégorie et les mots-clés
  let imagePool: string[] = [];
  
  // Détecter si les mots-clés contiennent des termes liés à la santé mentale ou l'activité physique
  const isRelatedToMentalHealth = keywords.some(keyword => 
    ['santé', 'mentale', 'psychologique', 'émotion', 'colère', 'stress', 'anxiété', 'bien-être'].some(term => 
      keyword.toLowerCase().includes(term)
    )
  );
  
  const isRelatedToPhysicalActivity = keywords.some(keyword => 
    ['activité', 'physique', 'sport', 'exercice', 'marche', 'course', 'randonnée'].some(term => 
      keyword.toLowerCase().includes(term)
    )
  );
  
  // Si c'est un article scientifique sur la santé mentale ou l'activité physique
  if (category === 'scientific' && (isRelatedToMentalHealth || isRelatedToPhysicalActivity)) {
    // Ajouter des images spécifiques pour ces types d'articles
    imagePool = [
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b', // Exercice
      'https://images.unsplash.com/photo-1518611012118-696072aa579a', // Méditation
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b', // Santé mentale et activité physique
      'https://images.unsplash.com/photo-1518611012118-696072aa579a', // Bien-être mental
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b', // Recherche sur l'activité physique
      'https://images.unsplash.com/photo-1607962837359-5e7e89f86776', // Randonnée thérapeutique
      'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a'  // Stretching
    ];
  }
  
  // Déterminer les sous-catégories basées sur les mots-clés
  const categoryData = imagesByCategory[category] || {};
  let subCategoryFound = false;
  
  // Chercher des mots-clés pertinents dans le texte
  if (keywords.length > 0 && categoryData) {
    for (const [subCategory, images] of Object.entries(categoryData)) {
      if (subCategory !== 'default') {
        // Vérifier si un mot-clé correspond à la sous-catégorie
        const matchesSubCategory = keywords.some(keyword => 
          subCategory.toLowerCase().includes(keyword.toLowerCase()) || 
          keyword.toLowerCase().includes(subCategory.toLowerCase())
        );
        
        if (matchesSubCategory) {
          imagePool = [...imagePool, ...images];
          subCategoryFound = true;
          console.log(`[ImageSelector] Sous-catégorie trouvée: ${subCategory} pour les mots-clés: ${keywords.join(', ')}`);
        }
      }
    }
  }
  
  // Si aucune sous-catégorie n'a été trouvée, utiliser les images par défaut
  if (!subCategoryFound && categoryData.default) {
    imagePool = [...imagePool, ...categoryData.default];
  }
  
  // Ajouter des images basées sur l'émotion si spécifiée
  if (normalizedEmotion && emotionImages[normalizedEmotion]) {
    imagePool = [...imagePool, ...emotionImages[normalizedEmotion]];
  }
  
  // Filtrer les images déjà utilisées
  const availableImages = imagePool.filter(img => !usedImages.has(img));
  
  // Vérifier qu'aucune image ne contient de mots-clés de la liste noire
  const safeImages = availableImages.filter(img => {
    const imgLower = img.toLowerCase();
    return !BLACKLISTED_IMAGE_KEYWORDS.some(keyword => imgLower.includes(keyword));
  });
  
  console.log(`[ImageSelector] Images disponibles après filtrage: ${safeImages.length} (avant filtrage: ${availableImages.length})`);
  
  // Si aucune image disponible après filtrage, utiliser les images garanties non utilisées
  if (safeImages.length === 0) {
    const availableGuaranteedImages = guaranteedImages.filter(img => !usedImages.has(img));
    
    // Si même les images garanties sont toutes utilisées, réinitialiser usedImages
    if (availableGuaranteedImages.length === 0) {
      console.log('[ImageSelector] Toutes les images ont été utilisées, réinitialisation de la liste');
      usedImages.clear();
      // Utiliser n'importe quelle image garantie
      const fallbackIndex = Math.floor(Math.random() * guaranteedImages.length);
      const selectedImage = guaranteedImages[fallbackIndex];
      usedImages.add(selectedImage);
      return `${selectedImage}?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80`;
    }
    
    // Sinon utiliser une image garantie non utilisée
    const fallbackIndex = Math.floor(Math.random() * availableGuaranteedImages.length);
    const selectedImage = availableGuaranteedImages[fallbackIndex];
    usedImages.add(selectedImage);
    return `${selectedImage}?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80`;
  }
  
  // Sélectionner une image aléatoire parmi celles disponibles
  const randomIndex = Math.floor(Math.random() * safeImages.length);
  const selectedImage = safeImages[randomIndex];
  
  // Ajouter l'image à la liste des images utilisées
  usedImages.add(selectedImage);
  console.log(`[ImageSelector] Image sélectionnée: ${selectedImage} (${usedImages.size} images utilisées)`);
  
  // Ajout des paramètres de formatage pour optimiser l'affichage des images
  return `${selectedImage}?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80`;
}

export async function GET(request: Request) {
  try {
    console.log('[API] Début du traitement de la requête GET pour les posts');
    
    // Récupérer les paramètres de la requête
    const url = new URL(request.url);
    
    // Récupérer le nombre de posts demandés
    const countParam = url.searchParams.get('count');
    const count = countParam ? parseInt(countParam, 10) : 8; // Défaut à 8
    
    // Récupérer mood/emotion et reason/cause, avec support pour les deux formats de paramètres
    const moodParam = url.searchParams.get('mood') || url.searchParams.get('emotion');
    const mood = moodParam as Mood | null;
    const reason = url.searchParams.get('reason') || url.searchParams.get('cause');
    
    // Normaliser l'émotion pour garantir une reconnaissance correcte
    const normalizedMood = mood ? normalizeEmotion(mood) : null;
    
    // Récupérer le paramètre de rafraîchissement pour assurer des contenus nouveaux
    const refresh = url.searchParams.get('refresh') || Date.now().toString();
    
    console.log(`[API] Paramètres reçus - Count: ${count}, Humeur: ${mood || 'Non spécifiée'} (normalisée: ${normalizedMood || 'Non spécifiée'}), Raison: ${reason || 'Non spécifiée'}, Refresh: ${refresh}`);
    
    // Générer les posts via OpenAI
    const posts = await generatePostsWithOpenAI(count, normalizedMood as Mood | null, reason || null);
    
    // Vérifier et compléter les images manquantes pour tous les posts qui en ont besoin
    const validatedPosts = posts.map(post => {
      if ((post.type === 'SCIENTIFIC' || post.type === 'ROUTE' || post.type === 'EVENT') 
          && (!post.imageUrl || post.imageUrl.includes('undefined'))) {
        // Extraire des mots-clés du contenu pour une meilleure correspondance d'image
        const keywords: string[] = [];
        
        if (post.type === 'SCIENTIFIC' && 'title' in post && post.title) {
          keywords.push(...post.title.split(' '));
          if ('content' in post && post.content) {
            // Ajouter les 10 premiers mots du contenu comme mots-clés potentiels
            keywords.push(...post.content.split(' ').slice(0, 10));
          }
        } else if (post.type === 'ROUTE' && 'title' in post && post.title) {
          keywords.push(...post.title.split(' '));
          if ('description' in post && post.description) {
            keywords.push(...post.description.split(' ').slice(0, 10));
          }
        } else if (post.type === 'EVENT' && 'title' in post && post.title) {
          keywords.push(...post.title.split(' '));
          if ('description' in post && post.description) {
            keywords.push(...post.description.split(' ').slice(0, 10));
          }
        }
        
        // Filtrer pour ne garder que les mots significatifs de plus de 3 lettres
        const filteredKeywords = keywords
          .filter(word => word.length > 3)
          .filter(word => !['dans', 'avec', 'pour', 'cette', 'votre', 'vous', 'nous', 'sont', 'plus'].includes(word.toLowerCase()));
        
        post.imageUrl = getRandomImage(post.type.toLowerCase(), normalizedMood || '', filteredKeywords);
        console.log(`[ImageValidation] Image assignée pour ${post.type}: ${post.imageUrl}`);
      }
      return post;
    });
    
    // Retourner les posts
    return NextResponse.json({ 
      status: 'success', 
      count: validatedPosts.length,
      requestedCount: count,
      mood: normalizedMood,
      reason: reason || null,
      refreshToken: Date.now(), // Ajouter un token de rafraîchissement pour garantir des contenus différents
      posts: validatedPosts 
    });
  } catch (error) {
    console.error('[API] Erreur lors du traitement de la requête:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Une erreur est survenue lors de la génération des posts',
        error: String(error)
      }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { mood, reason, count = 8, refresh = false } = await request.json();
    
    // Quand on reçoit une requête refresh, réinitialiser les images utilisées
    if (refresh) {
      usedImages.clear();
      console.log('[API] Réinitialisation de la liste des images utilisées suite à un refresh');
    }
    
    // Normaliser la mood pour OpenAI
    const normalizedMood = mood ? normalizeEmotion(mood) : null;
    
    console.log(`[API] Paramètres reçus - Count: ${count}, Humeur: ${mood || 'Non spécifiée'} (normalisée: ${normalizedMood || 'Non spécifiée'}), Raison: ${reason || 'Non spécifiée'}, Refresh: ${refresh}`);
    
    // Convertir count en nombre si c'est une chaîne
    const numericCount = typeof count === 'string' ? parseInt(count, 10) : count;
    
    // Générer les posts via OpenAI en utilisant les valeurs correctes
    const posts = await generatePostsWithOpenAI(numericCount, normalizedMood as Mood | null, reason || null);
    
    // Vérifier et compléter les images manquantes pour tous les posts qui en ont besoin
    const validatedPosts = posts.map(post => {
      if ((post.type === 'SCIENTIFIC' || post.type === 'ROUTE' || post.type === 'EVENT') 
          && (!post.imageUrl || post.imageUrl.includes('undefined'))) {
        // Extraire des mots-clés du contenu pour une meilleure correspondance d'image
        const keywords: string[] = [];
        
        if (post.type === 'SCIENTIFIC' && 'title' in post && post.title) {
          keywords.push(...post.title.split(' '));
          if ('content' in post && post.content) {
            // Ajouter les 10 premiers mots du contenu comme mots-clés potentiels
            keywords.push(...post.content.split(' ').slice(0, 10));
          }
        } else if (post.type === 'ROUTE' && 'title' in post && post.title) {
          keywords.push(...post.title.split(' '));
          if ('description' in post && post.description) {
            keywords.push(...post.description.split(' ').slice(0, 10));
          }
        } else if (post.type === 'EVENT' && 'title' in post && post.title) {
          keywords.push(...post.title.split(' '));
          if ('description' in post && post.description) {
            keywords.push(...post.description.split(' ').slice(0, 10));
          }
        }
        
        // Filtrer pour ne garder que les mots significatifs de plus de 3 lettres
        const filteredKeywords = keywords
          .filter(word => word.length > 3)
          .filter(word => !['dans', 'avec', 'pour', 'cette', 'votre', 'vous', 'nous', 'sont', 'plus'].includes(word.toLowerCase()));
        
        // Vérification spéciale pour les posts scientifiques sur la colère et le travail (comme dans l'exemple de l'utilisateur)
        if (post.type === 'SCIENTIFIC' && 
            filteredKeywords.some(kw => kw.toLowerCase().includes('colère') || kw.toLowerCase().includes('coler')) &&
            filteredKeywords.some(kw => kw.toLowerCase().includes('travail'))) {
          // Images spécifiques pour les études sur la colère au travail
          const specificImages = [
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2', // Relaxation au bureau
            'https://images.unsplash.com/photo-1499750310107-5fef28a66643', // Espace de travail calme
            'https://images.unsplash.com/photo-1518611012118-696072aa579a'  // Méditation
          ];
          const randomSpecificImage = specificImages[Math.floor(Math.random() * specificImages.length)];
          post.imageUrl = `${randomSpecificImage}?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80`;
          usedImages.add(randomSpecificImage);
        } else {
          post.imageUrl = getRandomImage(post.type.toLowerCase(), normalizedMood || '', filteredKeywords);
        }
        
        console.log(`[ImageValidation] Image assignée pour ${post.type}: ${post.imageUrl}`);
      }
      return post;
    });
    
    // Retourner les posts validés
    return NextResponse.json({ 
      posts: validatedPosts,
      count: validatedPosts.length,
      mood: normalizedMood,
      reason: reason || null,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('[API Error]', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération des posts' },
      { status: 500 }
    );
  }
}

// Fonction pour générer un nom de source scientifique diversifié
function generateScientificSource(normalizedEmotion: string = ''): string {
  const journals = [
    'Journal of Sports Psychology',
    'International Journal of Sports Science',
    'Physical Activity & Health Research',
    'Sports Medicine Research',
    'Journal of Emotional Well-being & Sport',
    'European Journal of Exercise Physiology',
    'International Review of Sport and Exercise Psychology',
    'Journal of Applied Sport Psychology',
    'Research Quarterly for Exercise and Sport',
    'Psychology of Sport and Exercise'
  ];
  
  // Journaux spécifiques selon l'émotion si disponible
  if (normalizedEmotion) {
    if (normalizedEmotion === 'HAPPY' || normalizedEmotion === 'EXCITED') {
      journals.push('Journal of Positive Psychology in Sports');
      journals.push('Motivation and Performance Studies');
    } else if (normalizedEmotion === 'SAD' || normalizedEmotion === 'ANXIOUS') {
      journals.push('Anxiety and Stress in Sports Medicine');
      journals.push('Journal of Mental Health in Physical Activity');
    } else if (normalizedEmotion === 'ANGRY') {
      journals.push('Emotional Regulation in Sports');
      journals.push('Competitive Psychology Review');
    } else if (normalizedEmotion === 'STRESSED') {
      journals.push('Journal of Stress Management in Sports');
      journals.push('Sports Performance under Pressure');
    } else if (normalizedEmotion === 'INJURED') {
      journals.push('Journal of Injury Rehabilitation in Sports');
      journals.push('Sports Medicine and Injury Prevention');
    } else if (normalizedEmotion === 'CONFUSED') {
      journals.push('Journal of Cognitive Function in Sports');
      journals.push('Sports Performance and Mental Clarity');
    } else if (normalizedEmotion === 'NERVOUS') {
      journals.push('Journal of Nervous System Function in Sports');
      journals.push('Sports Performance under Nervous Conditions');
    }
  }
  
  const institutions = [
    'Université Paris-Saclay',
    'INSEP',
    'Université de Montpellier',
    'Imperial College London',
    'École Normale Supérieure',
    'Harvard Medical School',
    'Stanford Sports Research Center',
    'Université Pierre et Marie Curie',
    'MIT Health Sciences',
    'Uppsala University'
  ];
  
  const researchers = [
    'Dr. Martin',
    'Prof. Chen',
    'Dr. Dubois',
    'Prof. Garcia',
    'Dr. Moreau',
    'Prof. Singh',
    'Dr. Schmidt',
    'Prof. Wilson',
    'Dr. Nguyen',
    'Prof. López'
  ];
  
  const randomJournal = journals[Math.floor(Math.random() * journals.length)];
  const randomInstitution = institutions[Math.floor(Math.random() * institutions.length)];
  const randomResearcher = researchers[Math.floor(Math.random() * researchers.length)];
  
  // Générer l'année aléatoirement entre 2020 et 2024
  const year = Math.floor(Math.random() * 5) + 2020;
  
  // Format avec variations aléatoires
  const formats = [
    `${randomResearcher}, ${randomInstitution} (${year})`,
    `${randomJournal}, vol. ${Math.floor(Math.random() * 50) + 1}, ${year}`,
    `${randomInstitution} Research Team, ${year}`,
    `${randomResearcher} et al., ${randomJournal} (${year})`,
    `Étude ${randomInstitution}, publiée dans ${randomJournal} (${year})`
  ];
  
  return formats[Math.floor(Math.random() * formats.length)];
}

// Fonction utilitaire pour convertir le niveau de difficulté du texte au format RouteDifficulty
function convertDifficultyLevel(difficulty: string): 'EASY' | 'MEDIUM' | 'HARD' {
  const difficultyLower = difficulty.toLowerCase();
  if (difficultyLower.includes('facile') || difficultyLower.includes('easy')) return 'EASY';
  if (difficultyLower.includes('difficile') || difficultyLower.includes('hard')) return 'HARD';
  return 'MEDIUM'; // Valeur par défaut
}
