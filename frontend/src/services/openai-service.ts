import { Post, PostType } from '../types/feed';

// Type pour les paramètres de la requête OpenAI
interface OpenAIFeedRequest {
  emotion?: string; // L'émotion de l'utilisateur (HAPPY, SAD, etc.)
  cause?: string;   // La cause de l'émotion (sport, travail, etc.)
  filter?: PostType | 'ALL'; // Filtre optionnel pour le type de contenu
  count?: number;   // Nombre de posts à générer
}

// Service pour gérer les interactions avec OpenAI
class OpenAIService {
  private apiKey: string = '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';
  private endpoint: string = 'https://api.openai.com/v1/chat/completions';
  private organization: string = ''; // Laissez vide si vous n'avez pas d'ID d'organisation spécifique

  constructor() {
    // La clé API est maintenant définie directement en tant que propriété
  }

  // Fonction pour générer des posts via l'API OpenAI
  async generateAdaptedFeed(params: OpenAIFeedRequest): Promise<Post[]> {
    try {
      const { emotion, cause, filter = 'ALL', count = 8 } = params;
      
      // Construire le prompt pour OpenAI avec les instructions précises
      const prompt = this.buildPrompt(emotion, cause, filter, count);
      
      // Préparer les en-têtes avec la clé API
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      };
      
      // Ajouter l'en-tête d'organisation si disponible
      if (this.organization) {
        headers['OpenAI-Organization'] = this.organization;
      }
      
      // Appeler l'API OpenAI
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: 'gpt-4-turbo',
          messages: [
            { 
              role: 'system', 
              content: `Tu es un assistant spécialisé dans la création de contenu adapté et personnalisé pour une application de bien-être émotionnel liée à la marche et l'activité physique.
              
              IMPORTANT: Pour CHAQUE requête, tu DOIS fournir un mélange équilibré de TOUS les types de posts suivants:
              1. Des articles scientifiques (type: SCIENTIFIC)
              2. Des citations inspirantes (type: QUOTE) 
              3. Des parcours de marche ou randonnée (type: ROUTE)
              4. Des événements liés à la marche (type: EVENT)
              
              Quelle que soit l'émotion ou la cause indiquée, ta réponse DOIT TOUJOURS inclure au moins un post de chaque type.
              Chaque post doit être adapté à l'émotion et/ou à la cause mentionnée.` 
            },
            { 
              role: 'user', 
              content: prompt 
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Aucun détail disponible');
        console.error(`Erreur API OpenAI (${response.status}): ${errorText}`);
        throw new Error(`Erreur API OpenAI: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      const content = data.choices && data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error("Réponse OpenAI invalide ou vide");
      }
      
      // Parser la réponse et obtenir les posts
      let posts = this.parseOpenAIResponse(content, params);
      
      // Si l'utilisateur a spécifié un filtre spécifique
      if (filter !== 'ALL') {
        posts = posts.filter(post => post.type === filter);
      }
      
      // S'assurer que tous les types de posts sont présents, sauf en cas de filtre spécifique
      if (filter === 'ALL' && posts.length > 0) {
        const postTypes = ['SCIENTIFIC', 'QUOTE', 'ROUTE', 'EVENT'];
        const missingTypes = postTypes.filter(type => 
          !posts.some(post => post.type === type)
        );
        
        // Générer des posts pour les types manquants
        if (missingTypes.length > 0) {
          const mockPosts = this.getMockPostsByTypes(missingTypes, emotion, cause);
          posts = [...posts, ...mockPosts];
        }
      }
      
      // Filtrer les posts selon l'émotion et la cause pour améliorer la pertinence
      const filteredPosts = this.filterPostsByEmotionAndCause(posts, emotion, cause);
      
      return filteredPosts;
    } catch (error) {
      console.error("Erreur lors de la génération des posts adaptés:", error);
      // Retourner des posts fictifs en cas d'erreur
      return this.getMockPosts(params);
    }
  }
  
  // Construire le prompt pour OpenAI
  private buildPrompt(emotion?: string, cause?: string, filter?: PostType | 'ALL', count = 6): string {
    let prompt = `Génère ${count} posts pour un fil d'actualité d'une application de bien-être axée sur la marche et le jogging.`;
    
    if (emotion) {
      prompt += ` L'utilisateur ressent l'émotion: ${emotion}`;
      if (cause) {
        prompt += ` liée à: ${cause}. Le contenu doit absolument prendre en compte à la fois l'émotion ET la cause pour être le plus pertinent et personnalisé possible.`;
      } else {
        prompt += `.`;
      }
    }
    
    if (filter && filter !== 'ALL') {
      prompt += ` Concentre-toi uniquement sur les posts de type: ${filter}.`;
    }
    
    prompt += ` 
    Chaque post doit appartenir à l'un de ces types:
    1. SCIENTIFIC: Articles scientifiques sur les bienfaits de la marche/jogging
    2. QUOTE: Citations motivantes
    3. ROUTE: Suggestions de parcours de marche/jogging
    4. EVENT: Événements liés à la marche/course à pied

    Format de réponse: JSON Array avec les champs appropriés pour chaque type.
    Pour SCIENTIFIC: id, type, title, content, imageUrl (laisse vide), author, date, source, tags
    Pour QUOTE: id, type, content, author, backgroundColor (une couleur hex), tags
    Pour ROUTE: id, type, title, location, distance (km), duration (minutes), difficulty (EASY/MEDIUM/HARD), description, imageUrl (laisse vide), tags
    Pour EVENT: id, type, title, date, location, description, imageUrl (laisse vide), registrationLink (optionnel), tags

    Assure-toi que le contenu soit varié, pertinent et TRÈS SPÉCIFIQUEMENT adapté à la combinaison de l'état émotionnel de l'utilisateur et de la cause qui a généré cette émotion.`;
    
    return prompt;
  }

  // Parser la réponse d'OpenAI
  private parseOpenAIResponse(content: string, params: OpenAIFeedRequest): Post[] {
    try {
      // Extraire le JSON de la réponse (parfois OpenAI enveloppe le JSON dans des ```json ```)
      const jsonMatch = content.match(/```json([\s\S]*?)```/) || content.match(/```([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      
      // Parser le JSON
      const posts = JSON.parse(jsonStr);
      
      // Valider et nettoyer chaque post
      return posts.map((post: Record<string, unknown>, index: number) => {
        // S'assurer que chaque post a un ID unique
        if (!post.id) {
          post.id = `openai-${Date.now()}-${index}`;
        }
        
        // S'assurer que chaque post a les tags appropriés
        let tags: string[] = [];
        if (Array.isArray(post.tags)) {
          tags = [...post.tags as string[]];
        }
        
        // Ajouter l'émotion comme tag si présente
        if (params.emotion) {
          tags.push(params.emotion.toLowerCase());
        }
        
        // Ajouter la cause comme tag si présente
        if (params.cause) {
          tags.push(params.cause.toLowerCase());
        }
        
        const cleanedPost = {
          ...post,
          tags
        } as unknown as Post;
        
        return cleanedPost;
      });
    } catch (error) {
      console.error('Erreur lors du parsing de la réponse OpenAI:', error);
      return this.getMockPosts(params);
    }
  }

  // Créer des posts de secours pour les types manquants
  private getMockPostsByTypes(types: string[], emotion?: string, cause?: string): Post[] {
    const posts: Post[] = [];
    
    for (const type of types) {
      const post = this.createMockPostByType(type as PostType, emotion, cause);
      posts.push(post);
    }
    
    return posts;
  }
  
  // Créer un post de secours selon le type
  private createMockPostByType(type: PostType, emotion?: string, cause?: string): Post {
    const id = `mock-${type.toLowerCase()}-${Date.now()}`;
    const tags = [];
    
    if (emotion) {
      tags.push(emotion.toLowerCase());
    }
    
    if (cause) {
      tags.push(cause.toLowerCase());
    }
    
    switch (type) {
      case 'SCIENTIFIC':
        return {
          id,
          type: 'SCIENTIFIC',
          title: 'Bienfaits de la marche sur le bien-être mental',
          content: 'La recherche montre que marcher régulièrement peut réduire le stress et améliorer l\'humeur en stimulant la production d\'endorphines.',
          imageUrl: '', // Ajout de l'imageUrl vide requis
          author: 'Dr. Martin Walker',
          date: new Date().toISOString(),
          source: 'Journal of Physical Health',
          tags
        };
        
      case 'QUOTE':
        return {
          id,
          type: 'QUOTE',
          content: 'Chaque pas est un pas vers un meilleur équilibre mental.',
          author: 'Anna Winters',
          backgroundColor: '#D1E7DD',
          tags
        };
        
      case 'ROUTE':
        return {
          id,
          type: 'ROUTE',
          title: 'Parcours du Parc Central',
          location: 'Parc de la Ville',
          distance: 3.5,
          duration: 45,
          difficulty: 'EASY',
          description: 'Un parcours tranquille le long des étangs du parc, idéal pour la méditation en mouvement.',
          imageUrl: '', // Ajout de l'imageUrl vide requis
          tags
        };
        
      case 'EVENT':
        return {
          id,
          type: 'EVENT',
          title: 'Marche collective pour le bien-être',
          date: new Date(Date.now() + 86400000).toISOString(),
          location: 'Place de la République',
          description: 'Rejoignez-nous pour une marche collective qui célèbre le bien-être par la marche et le partage.',
          imageUrl: '', // Ajout de l'imageUrl vide requis
          registrationLink: 'https://example.com/register',
          tags
        };
        
      default:
        throw new Error(`Type de post non reconnu: ${type}`);
    }
  }

  // Filtrer les posts selon l'émotion et la cause pour améliorer la pertinence
  private filterPostsByEmotionAndCause(posts: Post[], emotion?: string, cause?: string): Post[] {
    // Si pas d'émotion ni de cause, pas de filtrage spécial
    if (!emotion && !cause) {
      return posts;
    }
    
    // Les posts déjà générés par OpenAI sont censés être adaptés
    // Nous allons simplement les réorganiser en fonction de la priorité
    
    // Définir des priorités selon les combinaisons émotion/cause
    let priorities: { [key: string]: number } = {};
    
    // Mapper les types d'émotions à des catégories générales
    const positiveEmotions = ['HAPPY', 'JOYFUL', 'EXCITED', 'SATISFIED', 'CONFIDENT'];
    const negativeEmotions = ['SAD', 'MELANCHOLIC', 'DISAPPOINTED', 'ANGRY', 'FRUSTRATED', 'ANXIOUS'];
    const lowEnergyEmotions = ['TIRED', 'EXHAUSTED', 'MELANCHOLIC', 'SAD'];
    
    // Mapper les causes à des catégories
    const physicalCauses = ['SPORT', 'EXERCISE', 'TRAINING', 'HEALTH'];
    const relationalCauses = ['FAMILY', 'RELATION', 'FRIENDS', 'SOCIAL'];
    const workCauses = ['WORK', 'CAREER', 'JOB', 'STUDY', 'EDUCATION'];
    const financialCauses = ['MONEY', 'FINANCES', 'ECONOMIC'];
    
    // Déterminer des priorités de contenu en fonction des combinaisons émotion/cause
    if (emotion && cause) {
      const emotionUpper = emotion.toUpperCase();
      const causeUpper = cause.toUpperCase();
      
      // Combinaisons spécifiques émotion/cause
      if (positiveEmotions.includes(emotionUpper)) {
        if (physicalCauses.some(c => causeUpper.includes(c))) {
          // Positif + sport : routes plus difficiles, événements sportifs
          priorities = { 'ROUTE': 4, 'EVENT': 3, 'QUOTE': 2, 'SCIENTIFIC': 1 };
        } else if (relationalCauses.some(c => causeUpper.includes(c))) {
          // Positif + relations : événements sociaux, marche collective
          priorities = { 'EVENT': 4, 'ROUTE': 3, 'QUOTE': 2, 'SCIENTIFIC': 1 };
        } else if (workCauses.some(c => causeUpper.includes(c))) {
          // Positif + travail : articles scientifiques sur équilibre travail et marche
          priorities = { 'SCIENTIFIC': 4, 'ROUTE': 3, 'QUOTE': 2, 'EVENT': 1 };
        }
      } else if (negativeEmotions.includes(emotionUpper)) {
        if (physicalCauses.some(c => causeUpper.includes(c))) {
          // Négatif + sport : articles scientifiques sur récupération, routes faciles
          priorities = { 'SCIENTIFIC': 4, 'ROUTE': 3, 'QUOTE': 2, 'EVENT': 1 };
        } else if (relationalCauses.some(c => causeUpper.includes(c))) {
          // Négatif + relations : citations réconfortantes, marche solitaire
          priorities = { 'QUOTE': 4, 'ROUTE': 3, 'SCIENTIFIC': 2, 'EVENT': 1 };
        } else if (workCauses.some(c => causeUpper.includes(c))) {
          // Négatif + travail : citations motivantes, articles sur le stress
          priorities = { 'QUOTE': 4, 'SCIENTIFIC': 3, 'ROUTE': 2, 'EVENT': 1 };
        } else if (financialCauses.some(c => causeUpper.includes(c))) {
          // Négatif + finances : marche gratuite, économique
          priorities = { 'ROUTE': 4, 'QUOTE': 3, 'SCIENTIFIC': 2, 'EVENT': 1 };
        }
      } else if (lowEnergyEmotions.includes(emotionUpper)) {
        // Basse énergie : routes faciles, détente
        priorities = { 'ROUTE': 4, 'SCIENTIFIC': 3, 'QUOTE': 2, 'EVENT': 1 };
      }
    } else if (emotion) {
      // Si uniquement l'émotion est spécifiée
      const emotionUpper = emotion.toUpperCase();
      
      if (positiveEmotions.includes(emotionUpper)) {
        // Pour les émotions positives, favoriser les routes et événements
        priorities = { 'ROUTE': 3, 'EVENT': 3, 'QUOTE': 2, 'SCIENTIFIC': 1 };
      } else if (negativeEmotions.includes(emotionUpper)) {
        // Pour les émotions négatives, favoriser les articles scientifiques et citations
        priorities = { 'SCIENTIFIC': 3, 'QUOTE': 3, 'ROUTE': 2, 'EVENT': 1 };
      } else if (lowEnergyEmotions.includes(emotionUpper)) {
        // Pour la fatigue, favoriser les routes courtes et faciles
        priorities = { 'ROUTE': 3, 'SCIENTIFIC': 2, 'QUOTE': 2, 'EVENT': 1 };
      }
    } else if (cause) {
      // Si uniquement la cause est spécifiée
      const causeUpper = cause.toUpperCase();
      
      if (physicalCauses.some(c => causeUpper.includes(c))) {
        // Cause liée au sport : routes et articles scientifiques
        priorities = { 'ROUTE': 3, 'SCIENTIFIC': 3, 'EVENT': 2, 'QUOTE': 1 };
      } else if (relationalCauses.some(c => causeUpper.includes(c))) {
        // Cause liée aux relations : événements sociaux
        priorities = { 'EVENT': 3, 'QUOTE': 2, 'ROUTE': 2, 'SCIENTIFIC': 1 };
      } else if (workCauses.some(c => causeUpper.includes(c))) {
        // Cause liée au travail : équilibre travail-vie personnelle
        priorities = { 'SCIENTIFIC': 3, 'QUOTE': 2, 'ROUTE': 2, 'EVENT': 1 };
      } else if (financialCauses.some(c => causeUpper.includes(c))) {
        // Cause liée aux finances : activités gratuites
        priorities = { 'ROUTE': 3, 'SCIENTIFIC': 2, 'QUOTE': 2, 'EVENT': 1 };
      }
    }
    
    // Si des priorités spécifiques ont été définies, trier les posts en conséquence
    if (Object.keys(priorities).length > 0) {
      posts.sort((a, b) => {
        const priorityA = priorities[a.type] || 0;
        const priorityB = priorities[b.type] || 0;
        return priorityB - priorityA;
      });
    }
    
    // Ajouter l'émotion et la cause aux tags si elles sont présentes
    if (emotion || cause) {
      posts = posts.map(post => ({
        ...post,
        tags: [...(post.tags || []), ...(emotion ? [emotion.toLowerCase()] : []), ...(cause ? [cause.toLowerCase()] : [])]
      }));
    }
    
    return posts;
  }

  // Fonction pour générer des posts fictifs (post de secours)
  public getMockPosts(params: OpenAIFeedRequest): Post[] {
    const { emotion, cause, filter = 'ALL', count = 8 } = params;
    
    // Générer des posts adaptés à l'émotion et à la cause
    let posts: Post[] = [];
    
    // Option 1: Utiliser des données fictives prédéfinies
    const mockData = this.getMockPostsData();
    
    // Appliquer le filtre si nécessaire
    let filteredPosts = (filter !== 'ALL') 
      ? mockData.filter(post => post.type === filter) 
      : mockData;
      
    // Ajouter les tags d'émotion et de cause
    filteredPosts = filteredPosts.map(post => {
      const tags = [...(post.tags || [])];
      
      if (emotion) {
        tags.push(emotion.toLowerCase());
      }
      
      if (cause) {
        tags.push(cause.toLowerCase());
      }
      
      return {
        ...post,
        tags
      };
    });
    
    // Si aucun post n'est disponible après filtrage, générer des posts basiques
    if (filteredPosts.length === 0) {
      const types = filter !== 'ALL' 
        ? [filter] 
        : ['SCIENTIFIC', 'QUOTE', 'ROUTE', 'EVENT'];
      
      // Créer au moins un post de chaque type disponible
      for (const type of types) {
        posts.push(this.createMockPostByType(type as PostType, emotion, cause));
        posts.push(this.createMockPostByType(type as PostType, emotion, cause));
      }
    } else {
      posts = filteredPosts;
    }
    
    // Limiter le nombre de posts au nombre demandé
    posts = posts.slice(0, count);
    
    return posts;
  }

  // Données fictives pour le développement ou en cas d'erreur
  private getMockPostsData(): Post[] {
    // Base de données fictive
    const mockPosts: Post[] = [
      // SCIENTIFIC POSTS
      {
        id: 'sci-1',
        type: 'SCIENTIFIC',
        title: 'Les bienfaits de la marche rapide sur la santé cognitive',
        content: 'Une nouvelle étude publiée dans le Journal of Neuroscience révèle que 30 minutes de marche rapide par jour peuvent améliorer significativement les fonctions cognitives et réduire le risque de démence de 23%.',
        imageUrl: '/images/posts/walking-brain.jpg',
        author: 'Dr. Marie Laurent',
        date: '2025-02-15',
        source: 'Journal of Neuroscience',
        tags: ['santé', 'bien-être', 'cognitif']
      },
      {
        id: 'sci-2',
        type: 'SCIENTIFIC',
        title: 'Comment la marche réduit le stress et l\'anxiété',
        content: 'Des chercheurs ont découvert que marcher 45 minutes dans un environnement naturel réduit l\'activité dans les zones du cerveau associées à l\'anxiété et permet de diminuer les niveaux de cortisol de façon significative.',
        imageUrl: '/images/posts/stress-reduction.jpg',
        author: 'Prof. Thomas Dubois',
        date: '2025-01-28',
        source: 'Psychological Science',
        tags: ['stress', 'anxiété', 'nature', 'bien-être']
      },
      {
        id: 'sci-3',
        type: 'SCIENTIFIC',
        title: 'Le jogging matinal améliore la qualité du sommeil',
        content: 'Une étude sur 500 adultes montre que 20 minutes de jogging le matin augmente la qualité du sommeil et réduit le temps d\'endormissement de 37%. L\'exposition à la lumière naturelle joue un rôle crucial dans ce processus.',
        imageUrl: '/images/posts/morning-running.jpg',
        author: 'Dr. Sophie Martin',
        date: '2025-03-02',
        source: 'Sleep Medicine Journal',
        tags: ['sommeil', 'jogging', 'santé']
      },
      {
        id: 'sci-4',
        type: 'SCIENTIFIC',
        title: 'Marcher pour gérer la pression au travail',
        content: 'Une étude menée auprès de cadres stressés montre que 15 minutes de marche pendant la pause déjeuner réduit le niveau de stress professionnel de 29% et améliore la capacité de prise de décision l\'après-midi.',
        imageUrl: '/images/posts/work-stress.jpg',
        author: 'Dr. Jean Moreau',
        date: '2025-01-15',
        source: 'Journal of Occupational Health',
        tags: ['travail', 'stress', 'productivité']
      },
      {
        id: 'sci-5',
        type: 'SCIENTIFIC',
        title: 'Relations sociales améliorées grâce à la marche en groupe',
        content: 'Des psychologues ont démontré que participer à des marches en groupe peut renforcer les liens sociaux et diminuer les sentiments de solitude. Les participants ont rapporté une amélioration de 42% dans leurs relations interpersonnelles.',
        imageUrl: '/images/posts/group-walking.jpg',
        author: 'Dr. Claire Dupont',
        date: '2025-02-08',
        source: 'Journal of Social Psychology',
        tags: ['relations', 'solitude', 'groupe', 'social']
      },
      {
        id: 'sci-6',
        type: 'SCIENTIFIC',
        title: 'Marcher lentement pour économiser de l\'énergie et de l\'argent',
        content: 'Des chercheurs en économie comportementale suggèrent que remplacer les courts trajets en voiture par la marche peut faire économiser jusqu\'à 500€ par an en carburant et frais de stationnement, tout en améliorant la santé.',
        imageUrl: '/images/posts/save-money.jpg',
        author: 'Prof. Marc Lecomte',
        date: '2025-03-05',
        source: 'Journal of Consumer Economics',
        tags: ['économies', 'finances', 'transport', 'budget']
      },
      
      // QUOTE POSTS
      {
        id: 'quote-1',
        type: 'QUOTE',
        content: 'Marcher est la meilleure médecine de l\'homme.',
        author: 'Hippocrate',
        backgroundColor: '#E2F4FF',
        tags: ['inspiration', 'santé', 'médecine']
      },
      {
        id: 'quote-2',
        type: 'QUOTE',
        content: 'Tous les véritables grands penseurs ont marché beaucoup.',
        author: 'Friedrich Nietzsche',
        backgroundColor: '#FFF4E2',
        tags: ['philosophie', 'réflexion', 'pensée']
      },
      {
        id: 'quote-3',
        type: 'QUOTE',
        content: 'La marche est l\'activité humaine par excellence. La marche c\'est la liberté.',
        author: 'Jacques Lacarrière',
        backgroundColor: '#E2FFE4',
        tags: ['liberté', 'philosophie']
      },
      {
        id: 'quote-4',
        type: 'QUOTE',
        content: 'À chaque pas que tu fais pour te libérer de ton travail stressant, tu avances vers la sérénité.',
        author: 'Maria Gonzalez',
        backgroundColor: '#F5E2FF',
        tags: ['travail', 'stress', 'sérénité']
      },
      {
        id: 'quote-5',
        type: 'QUOTE',
        content: 'La marche en groupe tisse des liens que même le temps ne peut défaire.',
        author: 'Robert Johnson',
        backgroundColor: '#FFEDE2',
        tags: ['relations', 'amitié', 'groupe']
      },
      {
        id: 'quote-6',
        type: 'QUOTE',
        content: 'Marcher est gratuit. Le sourire qui en résulte est inestimable.',
        author: 'Emma Thompson',
        backgroundColor: '#E2FFFC',
        tags: ['économie', 'finances', 'bonheur']
      },
      
      // ROUTE POSTS
      {
        id: 'route-1',
        type: 'ROUTE',
        title: 'Sentier du Lac Tranquille',
        location: 'Parc National des Cèdres',
        distance: 4.5,
        duration: 60,
        difficulty: 'MEDIUM',
        description: 'Un magnifique parcours autour du lac, offrant des vues panoramiques et des zones ombragées idéales pour la méditation en mouvement.',
        imageUrl: '/images/routes/lake-path.jpg',
        tags: ['nature', 'lac', 'méditation']
      },
      {
        id: 'route-2',
        type: 'ROUTE',
        title: 'Boucle des Collines Verdoyantes',
        location: 'Réserve Naturelle des Hauteurs',
        distance: 8.2,
        duration: 120,
        difficulty: 'HARD',
        description: 'Un parcours exigeant à travers les collines qui récompensera vos efforts par des panoramas exceptionnels. Idéal pour se dépasser.',
        imageUrl: '/images/routes/hills-route.jpg',
        tags: ['défi', 'collines', 'panorama']
      },
      {
        id: 'route-3',
        type: 'ROUTE',
        title: 'Promenade du Canal Historique',
        location: 'Centre-Ville',
        distance: 2.8,
        duration: 35,
        difficulty: 'EASY',
        description: 'Une douce promenade le long du canal traversant la ville, passant par des monuments historiques et des jardins publics.',
        imageUrl: '/images/routes/canal-walk.jpg',
        tags: ['urbain', 'histoire', 'détente']
      },
      {
        id: 'route-4',
        type: 'ROUTE',
        title: 'Pause Déjeuner Express',
        location: 'Quartier des Affaires',
        distance: 1.5,
        duration: 15,
        difficulty: 'EASY',
        description: 'Circuit court idéal pour une pause pendant la journée de travail. Inclut des espaces verts et des bancs pour se reposer.',
        imageUrl: '/images/routes/lunch-break.jpg',
        tags: ['travail', 'pause', 'rapide']
      },
      {
        id: 'route-5',
        type: 'ROUTE',
        title: 'Parcours de la Convivialité',
        location: 'Parc Municipal',
        distance: 3.0,
        duration: 45,
        difficulty: 'EASY',
        description: 'Route circulaire bien aménagée, parfaite pour marcher en groupe. Nombreux points de rencontre et aires de pique-nique.',
        imageUrl: '/images/routes/social-path.jpg',
        tags: ['groupe', 'social', 'famille']
      },
      {
        id: 'route-6',
        type: 'ROUTE',
        title: 'Circuit Économique des Marchés',
        location: 'Centre-Ville',
        distance: 2.5,
        duration: 40,
        difficulty: 'EASY',
        description: 'Parcours reliant les principaux marchés locaux où vous pourrez trouver des produits frais à prix abordables. Idéal pour faire ses courses à pied.',
        imageUrl: '/images/routes/market-route.jpg',
        tags: ['économie', 'marché', 'shopping']
      },
      
      // EVENT POSTS
      {
        id: 'event-1',
        type: 'EVENT',
        title: 'Marche Méditative au Lever du Soleil',
        date: new Date(Date.now() + 7 * 86400000).toISOString(),
        location: 'Parc de la Sérénité',
        description: 'Rejoignez notre guide pour une marche en pleine conscience au lever du soleil. Techniques de respiration et méditation incluses.',
        imageUrl: '/images/events/sunrise-walk.jpg',
        registrationLink: 'https://example.com/events/sunrise-walk',
        tags: ['méditation', 'bien-être', 'aube']
      },
      {
        id: 'event-2',
        type: 'EVENT',
        title: 'Défi Randonnée des Montagnes',
        date: new Date(Date.now() + 14 * 86400000).toISOString(),
        location: 'Massif des Alpines',
        description: 'Un événement sportif pour les amateurs de défi. Trois parcours de difficulté croissante avec ravitaillement et encadrement.',
        imageUrl: '/images/events/mountain-challenge.jpg',
        registrationLink: 'https://example.com/events/mountain-challenge',
        tags: ['compétition', 'montagne', 'défi']
      },
      {
        id: 'event-3',
        type: 'EVENT',
        title: 'Festival de la Marche Urbaine',
        date: new Date(Date.now() + 21 * 86400000).toISOString(),
        location: 'Place Centrale',
        description: 'Un weekend dédié à la découverte de la ville à pied. Tours guidés, animations et conférences sur les bienfaits de la marche en ville.',
        imageUrl: '/images/events/urban-walk-fest.jpg',
        registrationLink: 'https://example.com/events/urban-walk-festival',
        tags: ['festival', 'urbain', 'culture']
      },
      {
        id: 'event-4',
        type: 'EVENT',
        title: 'Atelier Anti-Stress pour Professionnels',
        date: new Date(Date.now() + 10 * 86400000).toISOString(),
        location: 'Parc d\'Affaires',
        description: 'Session spéciale pour les professionnels stressés. Apprenez des techniques de marche anti-stress à intégrer dans votre journée de travail.',
        imageUrl: '/images/events/stress-relief.jpg',
        registrationLink: 'https://example.com/events/stress-relief',
        tags: ['travail', 'stress', 'bien-être']
      },
      {
        id: 'event-5',
        type: 'EVENT',
        title: 'Marche Sociale pour Célibataires',
        date: new Date(Date.now() + 5 * 86400000).toISOString(),
        location: 'Jardin Botanique',
        description: 'Une opportunité de rencontrer de nouvelles personnes dans un cadre détendu. Marche suivie d\'un brunch dans un café local.',
        imageUrl: '/images/events/social-walk.jpg',
        registrationLink: 'https://example.com/events/social-walk',
        tags: ['rencontre', 'social', 'célibataires']
      },
      {
        id: 'event-6',
        type: 'EVENT',
        title: 'Randonnée Économique: Nature Gratuite',
        date: new Date(Date.now() + 8 * 86400000).toISOString(),
        location: 'Forêt Communale',
        description: 'Découvrez comment profiter de la nature sans dépenser. Conseils sur l\'équipement économique et les activités gratuites en plein air.',
        imageUrl: '/images/events/free-nature.jpg',
        registrationLink: 'https://example.com/events/free-nature',
        tags: ['économie', 'gratuit', 'nature']
      }
    ];
    
    return mockPosts;
  }
}

// Export du service
export const openAIService = new OpenAIService();
