import { NextRequest, NextResponse } from 'next/server';
import { parseStringPromise } from 'xml2js';
import { DOMParser } from 'xmldom';

interface RssFeed {
  name: string;
  url: string;
  category: string[];
  language: string;
}

// Liste des flux RSS scientifiques français
const scientificRssFeeds: RssFeed[] = [
  // Futura Sciences
  {
    name: "Futura Santé - Actualités",
    url: "https://www.futura-sciences.com/rss/sante/actualites.xml",
    category: ["santé", "bien-être", "médecine", "nutrition", "sport"],
    language: "fr"
  },
  {
    name: "Futura Santé - Dossiers",
    url: "https://www.futura-sciences.com/rss/sante/dossiers.xml",
    category: ["santé", "bien-être", "médecine", "nutrition", "sport"],
    language: "fr"
  },
  // INSERM (Institut national de la santé et de la recherche médicale)
  {
    name: "INSERM - Actualités",
    url: "https://www.inserm.fr/actualite/feed",
    category: ["santé", "recherche médicale", "biologie", "neurosciences"],
    language: "fr"
  },
  // Santé Magazine
  {
    name: "Santé Magazine - Beauté et Forme",
    url: "https://www.santemagazine.fr/feeds/rss/beaute-forme",
    category: ["santé", "bien-être", "forme", "fitness", "sport", "exercice"],
    language: "fr"
  },
  {
    name: "Santé Magazine - Alimentation",
    url: "https://www.santemagazine.fr/feeds/rss/alimentation",
    category: ["nutrition", "alimentation", "santé", "bien-être", "énergie"],
    language: "fr"
  },
  // Psychologies Magazine
  {
    name: "Psychologies Magazine",
    url: "https://www.psychologies.com/rss",
    category: ["psychologie", "bien-être", "mental", "motivation", "développement personnel"],
    language: "fr"
  },
  // RMC Sport
  {
    name: "RMC Sport",
    url: "https://rmcsport.bfmtv.com/rss/fil-sport/",
    category: ["sport", "actualités sportives", "compétition"],
    language: "fr"
  },
  // 20 Minutes Sport
  {
    name: "20 Minutes Sport",
    url: "https://www.20minutes.fr/feeds/rss-sport.xml",
    category: ["sport", "actualités sportives", "compétition"],
    language: "fr"
  },
  // Le Figaro Sport
  {
    name: "Le Figaro Sport",
    url: "https://sport24.lefigaro.fr/rssfeeds/sport24-a-la-une.xml",
    category: ["sport", "actualités sportives", "compétition"],
    language: "fr"
  },
  // Améliore ta santé
  {
    name: "Améliore ta Santé",
    url: "https://amelioretasante.com/feed/",
    category: ["santé", "bien-être", "fitness", "nutrition"],
    language: "fr"
  }
];

// Interface pour un article
interface Article {
  title: string;
  description: string;
  source: string;
  url: string;
  pubDate: string;
  imageUrl: string;
  category: string[];
}

// Fonction pour récupérer et analyser un flux RSS
async function fetchRssFeed(feed: RssFeed): Promise<any[]> {
  try {
    const response = await fetch(feed.url, { 
      next: { revalidate: 3600 } // Revalider chaque heure
    });
    
    if (!response.ok) {
      // Au lieu de lancer une erreur, enregistrer un message et renvoyer un tableau vide
      console.log(`Flux indisponible - ${feed.name}: status ${response.status}`);
      return [];
    }
    
    const xmlData = await response.text();
    
    // Essayer d'analyser les données XML avec une meilleure gestion des erreurs
    try {
      const parsedData = await parseStringPromise(xmlData, {
        trim: true,
        normalize: true,
        explicitArray: false,
        // Ajouter des options pour être plus tolérant aux erreurs XML
        strict: false,
        normalizeTags: true
      });
      
      // Vérifier si c'est un format RSS standard ou Atom
      let items = [];
      if (parsedData.rss && parsedData.rss.channel) {
        items = Array.isArray(parsedData.rss.channel.item) 
          ? parsedData.rss.channel.item 
          : [parsedData.rss.channel.item];
      } else if (parsedData.feed && parsedData.feed.entry) {
        items = Array.isArray(parsedData.feed.entry) 
          ? parsedData.feed.entry 
          : [parsedData.feed.entry];
      }
      
      // Extraire et formater les articles
      return Promise.all(items.map(async (item: any) => {
        // Extraire la description (peut être dans différents champs selon le format)
        let description = '';
        if (item.description) {
          description = stripHtml(item.description);
        } else if (item.summary) {
          description = stripHtml(item.summary);
        } else if (item.content) {
          description = stripHtml(item.content);
        }
        
        // Extraire la date de publication
        let pubDate = new Date();
        if (item.pubDate) {
          pubDate = new Date(item.pubDate);
        } else if (item.published) {
          pubDate = new Date(item.published);
        } else if (item.updated) {
          pubDate = new Date(item.updated);
        }
        
        // Extraire l'URL de l'image depuis le flux RSS
        let imageUrl = '';
        
        // Vérifier si l'image est dans le format media:content
        if (item['media:content'] && item['media:content']['$'] && item['media:content']['$'].url) {
          imageUrl = item['media:content']['$'].url;
        } 
        // Vérifier si l'image est dans le format enclosure
        else if (item.enclosure && item.enclosure['$'] && item.enclosure['$'].url) {
          imageUrl = item.enclosure['$'].url;
        }
        // Vérifier si l'image est dans le champ image
        else if (item.image) {
          imageUrl = typeof item.image === 'string' ? item.image : (item.image.url || '');
        }
        // Chercher une image dans le contenu HTML de la description
        else if (item.description && typeof item.description === 'string') {
          const imgMatch = item.description.match(/<img[^>]+src="([^">]+)"/i);
          if (imgMatch && imgMatch[1]) {
            imageUrl = imgMatch[1];
          }
        }
        
        // Si aucune image n'est trouvée dans le flux RSS, essayer de scraper la page
        if (!imageUrl && item.link) {
          try {
            imageUrl = await scrapeArticleImageUrl(item.link);
          } catch (error) {
            console.error(`Erreur lors du scraping de l'image pour ${item.link}:`, error);
          }
        }
        
        // Utiliser une image par défaut si aucune image n'est trouvée
        if (!imageUrl) {
          // Déterminer l'image par défaut en fonction de la catégorie
          if (feed.category.includes('sport')) {
            imageUrl = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=500';
          } else if (feed.category.includes('nutrition') || feed.category.includes('alimentation')) {
            imageUrl = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=500';
          } else if (feed.category.includes('psychologie') || feed.category.includes('mental')) {
            imageUrl = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=500';
          } else {
            imageUrl = 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=500';
          }
        }
        
        // Créer l'objet article
        return {
          title: item.title || "Sans titre",
          description: description || "Aucune description disponible",
          source: feed.name,
          url: item.link || item.origLink || "#",
          imageUrl: imageUrl,
          publishDate: pubDate.toISOString(),
          tags: feed.category,
          feedUrl: feed.url,
          language: feed.language
        };
      }));
    } catch (error) {
      console.error(`Erreur lors de l'analyse XML du flux ${feed.name}:`, error);
      return [];
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération du flux ${feed.name}:`, error);
    return [];
  }
}

// Fonction pour scraper l'URL de l'image d'un article
async function scrapeArticleImageUrl(url: string): Promise<string> {
  try {
    // Récupérer le contenu HTML de la page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}`);
    }
    
    const html = await response.text();
    
    // Rechercher l'image Open Graph (og:image) - généralement utilisée comme image principale
    const ogImageMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^">]+)"/i);
    if (ogImageMatch && ogImageMatch[1]) {
      return ogImageMatch[1];
    }
    
    // Chercher la première grande image dans le contenu
    const imgMatches = Array.from(html.matchAll(/<img[^>]+src="([^">]+)"[^>]*>/gi));
    for (const match of imgMatches) {
      const imgSrc = match[1];
      // Éviter les petites icônes et les images de décoration
      if (!imgSrc.includes('logo') && !imgSrc.includes('icon') && !imgSrc.includes('avatar')) {
        return imgSrc;
      }
    }
    
    return '';
  } catch (error) {
    console.error(`Erreur lors du scraping de la page ${url}:`, error);
    return '';
  }
}

// Fonction pour supprimer les balises HTML
function stripHtml(html: string): string {
  if (!html) return '';
  
  try {
    // Utiliser DOMParser pour analyser le HTML
    const doc = new DOMParser().parseFromString(html, 'text/html');
    // Extraire le texte seulement
    return doc.documentElement.textContent || '';
  } catch (error) {
    // Fallback avec regex simple si l'analyse échoue
    return html.replace(/<[^>]*>?/gm, '').trim();
  }
}

// Fonction pour filtrer les articles par émotion et cause
function filterArticlesByEmotionAndCause(articles: any[], emotion: string, cause: string): any[] {
  console.log(`Filtrage d'articles pour l'émotion: ${emotion} et la cause: ${cause}`);
  
  // Mots-clés positifs et liés au sport
  const positiveKeywords = [
    "bénéfice", "amélioration", "positif", "avantage", "bienfait", "solution", 
    "progrès", "succès", "réussite", "santé", "bien-être", "performance",
    "encourageant", "motivation", "inspir", "réussir", "conseils", "astuces",
    "technique", "méthode", "stratégie", "plaisir", "joie", "satisfaction"
  ];
  
  const sportKeywords = [
    "sport", "activité physique", "exercice", "entraînement", "mouvement", 
    "bouger", "musculation", "cardio", "fitness", "performance", "endurance", 
    "force", "souplesse", "mobilité", "course", "marche", "natation", "vélo"
  ];

  const emotionKeywords: Record<string, string[]> = {
    "HAPPY": [
      "bonheur",
      "heureux",
      "joie",
      "bien-être",
      "positif",
      "satisfaction",
      "plaisir",
      "contentement",
      "optimisme",
      "allégresse",
      "exaltation"
    ],
    "Heureux(se)": [
      "bonheur",
      "heureux",
      "joie",
      "bien-être",
      "positif",
      "satisfaction",
      "plaisir",
      "contentement",
      "comblé(e)",
      "épanoui(e)"
    ],
    "Joyeux(se)": [
      "joie",
      "joyeux",
      "enthousiasme",
      "plaisir",
      "contentement",
      "amusement",
      "rire",
      "gaieté",
      "jubilation",
      "exubérance"
    ],
    "Excité(e)": [
      "excitation",
      "enthousiasme",
      "dynamisme",
      "énergie",
      "motivation",
      "passion",
      "stimulation",
      "impatience",
      "ébullition",
      "vitalité",
      "ardeur",
      "ferveur",
      "engouement"
    ],
    "Satisfait(e)": [
      "satisfaction",
      "accomplissement",
      "réussite",
      "contentement",
      "réalisation",
      "fierté",
      "comblé(e)",
      "gratification"
    ],
    "Confiant(e)": [
      "confiance",
      "assurance",
      "certitude",
      "optimisme",
      "courage",
      "détermination",
      "CONFIDENT",
      "aplomb"
    ],
    "CONFIDENT": [
      "confiance",
      "assurance",
      "certitude",
      "optimisme",
      "courage",
      "détermination",
      "estime",
      "fermeté"
    ],
    "Triste": [
      "tristesse",
      "déprime",
      "mélancolie",
      "moral",
      "dépression",
      "solution",
      "aide",
      "surmonter",
      "chagrin",
      "morosité"
    ],
    "Mélancolique": [
      "mélancolie",
      "nostalgie",
      "tristesse",
      "contemplation",
      "introspection",
      "sérénité",
      "langueur",
      "spleen"
    ],
    "Déçu(e)": [
      "déception",
      "désillusion",
      "frustration",
      "insatisfaction",
      "rebondir",
      "améliorer",
      "amertume"
    ],
    "En colère": [
      "colère",
      "irritation",
      "frustration",
      "agacement",
      "énervement",
      "canaliser",
      "apaiser",
      "furieux",
      "rage"
    ],
    "Frustré(e)": [
      "frustration",
      "contrariété",
      "déception",
      "obstacle",
      "solution",
      "surmonter",
      "avancer",
      "irritation"
    ],
    "Anxieux(se)": [
      "anxiété",
      "stress",
      "inquiétude",
      "angoisse",
      "tension",
      "relaxation",
      "calme",
      "respiration",
      "nervosité",
      "appréhension"
    ]
  };
  

  const causeKeywords: Record<string, string[]> = {
    "manque de temps": [
      // Mots-clés initiaux
      "temps",
      "organisation",
      "planning",
      "efficacité",
      "productivité",
      "chrono",
      // 6 nouveaux mots-clés
      "priorité",
      "deadline",
      "urgence",
      "hâte",
      "emploi du temps",
      "surmenage"
    ],
    "douleurs": [
      // Mots-clés initiaux
      "douleur",
      "arthrite",
      "inflammation",
      "arthrose",
      "blessure",
      "récupération",
      "réhabilitation",
      // 6 nouveaux mots-clés
      "raideur",
      "soulagement",
      "analgésique",
      "gêne",
      "tendinite",
      "chronique"
    ],
    "motivation": [
      // Mots-clés initiaux
      "motivation",
      "objectif",
      "persévérance",
      "discipline",
      "habitude",
      "routine",
      // 7 nouveaux mots-clés
      "volonté",
      "ambition",
      "émulation",
      "inspiration",
      "esprit de réussite",
      "auto-motivation",
      "résilience"
    ],
    "fatigue": [
      // Mots-clés initiaux
      "fatigue",
      "épuisement",
      "récupération",
      "énergie",
      "sommeil",
      "endurance",
      // 6 nouveaux mots-clés
      "lassitude",
      "somnolence",
      "épuisement mental",
      "baisse de régime",
      "manque de repos",
      "apathie"
    ],
    "stress": [
      // Mots-clés initiaux
      "stress",
      "anxiété",
      "tension",
      "relaxation",
      "détente",
      "méditation",
      // 7 nouveaux mots-clés
      "pression",
      "angoisse",
      "nervosité",
      "crispation",
      "surcharge émotionnelle",
      "gestion du stress",
      "burn-out"
    ],
    "mobilité": [
      // Mots-clés initiaux
      "mobilité",
      "souplesse",
      "flexibilité",
      "articulation",
      "amplitude",
      // 6 nouveaux mots-clés
      "agilité",
      "élasticité",
      "aisance",
      "coordination",
      "stabilité",
      "prévention des blessures"
    ],
    "confiance en soi": [
      // Mots-clés initiaux
      "confiance",
      "estime",
      "image de soi",
      "perception",
      "mental",
      // 6 nouveaux mots-clés
      "affirmation de soi",
      "sécurité intérieure",
      "amour-propre",
      "valorisation",
      "respect de soi",
      "assurance"
    ],
    "respiration": [
      // Mots-clés initiaux
      "respiration",
      "souffle",
      "oxygénation",
      "poumons",
      "endurance",
      "cardio",
      // 6 nouveaux mots-clés
      "cohérence cardiaque",
      "inspiration",
      "expiration",
      "rythme respiratoire",
      "respiration profonde",
      "ventilation"
    ]
  };
  
  // Si l'émotion est définie, trouver les mots-clés correspondants, sinon utiliser des mots-clés positifs généraux
  let relevantEmotionKeywords = positiveKeywords;
  if (emotion && emotionKeywords[emotion]) {
    relevantEmotionKeywords = emotionKeywords[emotion];
    console.log(`Mots-clés pour l'émotion ${emotion}:`, relevantEmotionKeywords);
  } else {
    console.log("Aucune émotion spécifique trouvée, utilisation de mots-clés positifs généraux");
  }

  // Si la cause est définie, trouver les mots-clés correspondants
  let relevantCauseKeywords: string[] = [];
  if (cause && causeKeywords[cause.toLowerCase()]) {
    relevantCauseKeywords = causeKeywords[cause.toLowerCase()];
    console.log(`Mots-clés pour la cause ${cause}:`, relevantCauseKeywords);
  } else {
    console.log("Aucune cause spécifique trouvée");
  }

  console.log("Nombre d'articles avant filtrage:", articles.length);

  // Fonction pour vérifier si un contenu contient un mot-clé (plus souple)
  const containsKeyword = (content: string, keywords: string[]) => {
    content = content.toLowerCase();
    return keywords.some(keyword => {
      const keywordLower = keyword.toLowerCase();
      // Vérifier si le mot-clé exact est présent
      if (content.includes(keywordLower)) {
        return true;
      }
      
      // Vérifier si une forme dérivée du mot-clé est présente (pour les mots français)
      // Par exemple, "excité" pour "excitation", "enthousiaste" pour "enthousiasme"
      if (keywordLower.endsWith('tion') && content.includes(keywordLower.replace('tion', 't'))) {
        return true;
      }
      if (keywordLower.endsWith('isme') && content.includes(keywordLower.replace('isme', 'iste'))) {
        return true;
      }
      if (keywordLower.endsWith('ie') && content.includes(keywordLower.replace('ie', 'ique'))) {
        return true;
      }
      
      return false;
    });
  };

  // Filtrer les articles par mots-clés d'émotion et de cause
  const filteredArticles = articles.filter(article => {
    const content = `${article.title} ${article.description}`;
    
    // Vérifier si l'article contient au moins un mot-clé lié à l'émotion
    const hasEmotionKeyword = containsKeyword(content, relevantEmotionKeywords);
    
    // Vérifier si l'article contient au moins un mot-clé lié au sport
    const hasSportKeyword = containsKeyword(content, sportKeywords);
    
    // Si une cause est spécifiée, vérifier si l'article contient au moins un mot-clé lié à la cause
    let hasCauseKeyword = true;
    if (relevantCauseKeywords.length > 0) {
      hasCauseKeyword = containsKeyword(content, relevantCauseKeywords);
    }
    
    // Retourner true si l'article contient des mots-clés d'émotion ET de sport, 
    // et également des mots-clés de cause si une cause est spécifiée
    return hasEmotionKeyword && hasSportKeyword && hasCauseKeyword;
  });

  console.log("Nombre d'articles après filtrage:", filteredArticles.length);

  // Si nous avons trop peu d'articles après le filtrage, assouplir les critères
  if (filteredArticles.length < 5) {
    console.log("Trop peu d'articles après le filtrage strict, assouplissement des critères");
    
    // Filtrer en exigeant soit des mots-clés d'émotion, soit des mots-clés de cause (mais toujours avec du sport)
    const relaxedFilteredArticles = articles.filter(article => {
      const content = `${article.title} ${article.description}`;
      
      // Vérifier si l'article contient au moins un mot-clé lié à l'émotion
      const hasEmotionKeyword = containsKeyword(content, relevantEmotionKeywords);
      
      // Vérifier si l'article contient au moins un mot-clé lié au sport
      const hasSportKeyword = containsKeyword(content, sportKeywords);
      
      // Vérifier si l'article contient au moins un mot-clé lié à la cause
      const hasCauseKeyword = relevantCauseKeywords.length > 0 ? 
        containsKeyword(content, relevantCauseKeywords) : 
        false;
      
      // Retourner true si l'article contient des mots-clés de sport ET (des mots-clés d'émotion OU de cause)
      return hasSportKeyword && (hasEmotionKeyword || hasCauseKeyword);
    });
    
    console.log("Nombre d'articles après assouplissement:", relaxedFilteredArticles.length);
    
    // Si nous avons encore trop peu d'articles, filtrer uniquement par mots-clés de sport
    if (relaxedFilteredArticles.length < 5) {
      console.log("Encore trop peu d'articles, filtrage par sport uniquement");
      const sportFilteredArticles = articles.filter(article => {
        const content = `${article.title} ${article.description}`.toLowerCase();
        
        // Vérifier si l'article contient au moins un mot-clé lié au sport
        return sportKeywords.some(keyword => content.includes(keyword.toLowerCase()));
      });
      
      console.log("Nombre d'articles après filtrage sport uniquement:", sportFilteredArticles.length);
      return sportFilteredArticles;
    }
    
    return relaxedFilteredArticles;
  }

  return filteredArticles;
}

// Fonction pour attribuer un score de pertinence aux articles
function assignRelevanceScore(articles: any[], emotion: string, cause: string): any[] {
  // Mots-clés positifs et liés au sport
  const positiveKeywords = [
    "bénéfice", "amélioration", "positif", "avantage", "bienfait", "solution", 
    "progrès", "succès", "réussite", "santé", "bien-être", "performance",
    "encourageant", "motivation", "inspir", "réussir", "conseils", "astuces",
    "technique", "méthode", "stratégie", "plaisir", "joie", "satisfaction"
  ];
  
  const sportKeywords = [
    "sport", "activité physique", "exercice", "entraînement", "mouvement", 
    "bouger", "musculation", "cardio", "fitness", "performance", "endurance", 
    "force", "souplesse", "mobilité", "course", "marche", "natation", "vélo"
  ];

  const emotionKeywords: Record<string, string[]> = {
    "Heureux(se)": ["bonheur", "heureux", "joie", "bien-être", "positif", "satisfaction"],
    "Joyeux(se)": ["joie", "joyeux", "enthousiasme", "plaisir", "contentement"],
    "Excité(e)": ["excitation", "enthousiasme", "dynamisme", "énergie", "motivation"],
    "Satisfait(e)": ["satisfaction", "accomplissement", "réussite", "contentement"],
    "Confiant(e)": ["confiance", "assurance", "certitude", "optimisme"],
    "Triste": ["tristesse", "déprime", "mélancolie", "moral", "dépression"],
    "Mélancolique": ["mélancolie", "nostalgie", "tristesse", "contemplation"],
    "Déçu(e)": ["déception", "désillusion", "frustration", "insatisfaction"],
    "En colère": ["colère", "irritation", "frustration", "agacement", "énervement"],
    "Frustré(e)": ["frustration", "contrariété", "déception", "obstacle"],
    "Anxieux(se)": ["anxiété", "stress", "inquiétude", "angoisse", "tension"]
  };

  const causeKeywords: Record<string, string[]> = {
    "manque de temps": ["temps", "organisation", "planning", "efficacité", "productivité", "chrono"],
    "douleurs": ["douleur", "arthrite", "inflammation", "arthrose", "blessure", "récupération", "réhabilitation"],
    "motivation": ["motivation", "objectif", "persévérance", "discipline", "habitude", "routine"],
    "fatigue": ["fatigue", "épuisement", "récupération", "énergie", "sommeil", "endurance"],
    "stress": ["stress", "anxiété", "tension", "relaxation", "détente", "méditation"],
    "mobilité": ["mobilité", "souplesse", "flexibilité", "articulation", "amplitude"],
    "confiance en soi": ["confiance", "estime", "image de soi", "perception", "mental"],
    "respiration": ["respiration", "souffle", "oxygénation", "poumons", "endurance", "cardio"]
  };

  return articles.map(article => {
    let relevanceScore = 40; // Score de base
    
    const content = `${article.title} ${article.description}`;
    
    // Bonus pour les articles positifs (jusqu'à +20)
    positiveKeywords.forEach(keyword => {
      if (content.includes(keyword.toLowerCase())) {
        relevanceScore += 2;
      }
    });
    
    // Bonus pour les articles liés au sport (jusqu'à +20)
    sportKeywords.forEach(keyword => {
      if (content.includes(keyword.toLowerCase())) {
        relevanceScore += 2;
      }
    });
    
    // Augmenter le score pour chaque mot-clé d'émotion trouvé
    if (emotion && emotionKeywords[emotion]) {
      emotionKeywords[emotion].forEach(keyword => {
        if (content.includes(keyword.toLowerCase())) {
          relevanceScore += 3;
        }
      });
    }
    
    // Augmenter le score pour chaque mot-clé de cause trouvé
    if (cause && causeKeywords[cause]) {
      causeKeywords[cause].forEach(keyword => {
        if (content.includes(keyword.toLowerCase())) {
          relevanceScore += 3;
        }
      });
    }
    
    // Limiter le score à 100
    relevanceScore = Math.min(relevanceScore, 100);
    
    return {
      ...article,
      relevance: relevanceScore
    };
  });
}

export async function POST(request: NextRequest) {
  try {
    const { emotion, cause, page = 1, pageSize = 5 } = await request.json();
    
    console.log(`Requête reçue pour l'émotion: ${emotion}, cause: ${cause}, page: ${page}`);
    
    // Récupérer les articles de tous les flux RSS avec timeout raisonnable
    let rssArticles: any[] = [];
    
    try {
      // Récupérer des articles à partir des flux RSS avec gestion des timeouts et erreurs
      const fetchPromises = scientificRssFeeds.map(feed => 
        fetchRssFeed(feed).catch(err => {
          console.error(`Erreur lors de la récupération du flux ${feed.name}:`, err);
          return []; // Retourner un tableau vide en cas d'erreur
        })
      );
      
      const articlesByFeed = await Promise.all(fetchPromises);
      rssArticles = articlesByFeed.flat();
      console.log(`Total d'articles des flux RSS: ${rssArticles.length}`);
    } catch (error) {
      console.error("Erreur lors de la récupération des flux RSS:", error);
      // En cas d'erreur globale, continuer avec un tableau vide pour rssArticles
      rssArticles = [];
    }
    
    // N'utiliser que les articles réels des flux RSS
    let allArticles = [...rssArticles];
    console.log(`Total d'articles à traiter: ${allArticles.length}`);
    
    // Filtrer les articles selon l'émotion et la cause
    const filteredArticles = filterArticlesByEmotionAndCause(allArticles, emotion, cause);
    
    // Extraire les articles pour la page demandée
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const articlesForPage = filteredArticles.slice(startIndex, endIndex);
    
    console.log(`Articles trouvés pour la page ${page}: ${articlesForPage.length}/${pageSize} demandés`);
    
    return NextResponse.json({ 
      articles: articlesForPage,
      total: filteredArticles.length,
      page: page,
      pageSize: pageSize,
      hasMore: endIndex < filteredArticles.length
    });
  } catch (error) {
    console.error('Erreur route API scientificArticles:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des articles' },
      { status: 500 }
    );
  }
}
