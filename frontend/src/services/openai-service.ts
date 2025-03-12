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
        prompt += ` liée à: ${cause}`;
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

    Assure-toi que le contenu soit varié, pertinent et adapté à l'état émotionnel de l'utilisateur.`;
    
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
    // Des règles simples pour adapter le contenu à l'émotion (dans un vrai système, ce serait beaucoup plus sophistiqué)
    if (emotion) {
      const positiveEmotions = ['HAPPY', 'JOYFUL', 'EXCITED', 'SATISFIED', 'CONFIDENT'];
      const negativeEmotions = ['SAD', 'MELANCHOLIC', 'DISAPPOINTED', 'ANGRY', 'FRUSTRATED', 'ANXIOUS'];
      
      if (positiveEmotions.includes(emotion)) {
        // Pour les émotions positives, favoriser les routes et événements
        posts.sort((a, b) => {
          if ((a.type === 'ROUTE' || a.type === 'EVENT') && (b.type !== 'ROUTE' && b.type !== 'EVENT')) {
            return -1;
          } else if ((b.type === 'ROUTE' || b.type === 'EVENT') && (a.type !== 'ROUTE' && a.type !== 'EVENT')) {
            return 1;
          }
          return 0;
        });
      } else if (negativeEmotions.includes(emotion)) {
        // Pour les émotions négatives, favoriser les articles scientifiques et citations
        posts.sort((a, b) => {
          if ((a.type === 'SCIENTIFIC' || a.type === 'QUOTE') && (b.type !== 'SCIENTIFIC' && b.type !== 'QUOTE')) {
            return -1;
          } else if ((b.type === 'SCIENTIFIC' || b.type === 'QUOTE') && (a.type !== 'SCIENTIFIC' && a.type !== 'QUOTE')) {
            return 1;
          }
          return 0;
        });
      }
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
        content: 'Une étude clinique sur 5 ans montre que les personnes pratiquant le jogging avant 9h du matin ont un sommeil plus profond et réparateur, avec 27% moins de réveils nocturnes que les non-coureurs.',
        imageUrl: '/images/posts/morning-jog.jpg',
        author: 'Dr. Sophie Martin',
        date: '2025-03-05',
        source: 'Sleep Health Journal',
        tags: ['sommeil', 'jogging', 'routine matinale']
      },
      
      // QUOTE POSTS
      {
        id: 'quote-1',
        type: 'QUOTE',
        content: 'Le voyage de mille lieues commence toujours par un premier pas.',
        author: 'Lao Tseu',
        backgroundColor: '#4A6FA5',
        tags: ['motivation', 'début', 'persévérance']
      },
      {
        id: 'quote-2',
        type: 'QUOTE',
        content: 'Chaque pas est un pas en avant, peu importe sa taille.',
        author: 'Anonyme',
        backgroundColor: '#6B5B95',
        tags: ['progrès', 'motivation', 'quotidien']
      },
      {
        id: 'quote-3',
        type: 'QUOTE',
        content: 'La seule personne que tu dois dépasser est celle que tu étais hier.',
        author: 'Anonyme',
        backgroundColor: '#878C36',
        tags: ['challenge', 'amélioration', 'compétition']
      },
      
      // ROUTE POSTS
      {
        id: 'route-1',
        type: 'ROUTE',
        title: 'Sentier du Lac Bleu',
        location: 'Parc National des Écrins',
        distance: 5.2,
        duration: 90,
        difficulty: 'MEDIUM',
        description: 'Une randonnée magnifique autour du Lac Bleu avec des vues panoramiques sur les montagnes environnantes. Idéal pour une matinée revigorante.',
        imageUrl: '/images/posts/blue-lake.jpg',
        tags: ['nature', 'montagne', 'lac', 'vue panoramique']
      },
      {
        id: 'route-2',
        type: 'ROUTE',
        title: 'Circuit urbain du Vieux Port',
        location: 'Marseille',
        distance: 4.0,
        duration: 60,
        difficulty: 'EASY',
        description: 'Un parcours urbain qui vous fait découvrir le patrimoine historique de Marseille tout en profitant de la vue sur la Méditerranée.',
        imageUrl: '/images/posts/marseille-port.jpg',
        tags: ['urbain', 'mer', 'histoire', 'facile']
      },
      {
        id: 'route-3',
        type: 'ROUTE',
        title: 'Boucle de la Forêt des Cèdres',
        location: 'Mont Ventoux',
        distance: 7.8,
        duration: 150,
        difficulty: 'HARD',
        description: 'Un parcours exigeant à travers la magnifique forêt de cèdres du Mont Ventoux. Dénivelé important mais récompensé par des paysages à couper le souffle.',
        imageUrl: '/images/posts/cedar-forest.jpg',
        tags: ['forêt', 'dénivelé', 'nature sauvage', 'challenge']
      },
      
      // EVENT POSTS
      {
        id: 'event-1',
        type: 'EVENT',
        title: 'Marathon de Paris 2025',
        date: '2025-04-06',
        location: 'Paris',
        description: 'Le marathon mythique de la capitale française vous emmène à travers les monuments emblématiques de Paris. Parcours plat et rapide, idéal pour réaliser un record personnel.',
        imageUrl: '/images/posts/paris-marathon.jpg',
        registrationLink: 'https://www.marathondeparis.fr',
        tags: ['marathon', 'compétition', 'urban', 'international']
      },
      {
        id: 'event-2',
        type: 'EVENT',
        title: 'Marche collective pour la Santé Mentale',
        date: '2025-05-18',
        location: 'Lyon',
        description: 'Une marche solidaire de 5km pour sensibiliser à l\'importance de la santé mentale. Accessible à tous, familles bienvenues. Les fonds récoltés seront reversés à des associations.',
        imageUrl: '/images/posts/mental-health-walk.jpg',
        registrationLink: 'https://www.marchesantementale.fr',
        tags: ['solidarité', 'santé mentale', 'famille', 'accessible']
      },
      {
        id: 'event-3',
        type: 'EVENT',
        title: 'Trail des Calanques',
        date: '2025-06-22',
        location: 'Cassis',
        description: 'Un trail exceptionnel dans le cadre idyllique du Parc National des Calanques. Plusieurs distances disponibles: 15km, 25km et 45km pour les plus courageux.',
        imageUrl: '/images/posts/calanques-trail.jpg',
        registrationLink: 'https://www.trailcalanques.fr',
        tags: ['trail', 'nature', 'mer', 'challenge']
      }
    ];
    
    // Retourner la liste complète des posts fictifs
    return mockPosts;
  }
}

// Export du service
export const openAIService = new OpenAIService();
