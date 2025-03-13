'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './page.module.css';

interface Article {
  id: string;
  title: string;
  description: string;
  source: string;
  url: string;
  imageUrl?: string;
  publishDate: string | Date;
  tags: string[];
  relevance: number;
  emotion?: string;
  emotionColor?: string;
}

interface MockArticle {
  title: string;
  description: string;
  source: string;
  tags: string[];
  imageUrl?: string;
}

type MockTagsType = {
  [key: string]: string[];
};

type MockArticlesByCauseType = {
  [key: string]: MockArticle[];
};

export default function FeedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Récupérer les paramètres de l'URL
  const emotionParam = searchParams.get('emotion');
  const causeParam = searchParams.get('cause');

  // Utilisez les paramètres ou valeurs par défaut
  const [emotion, setEmotion] = useState<string | null>(emotionParam);
  const [cause, setCause] = useState<string | null>(causeParam);

  // Même définition des couleurs des émotions que sur la page /today
  const emotions = [
    { text: "Heureux(se)", icon: "😊", emotion: "HAPPY", color: "#FFD700" }, // Jaune doré
    { text: "Joyeux(se)", icon: "🥳", emotion: "JOYFUL", color: "#FF8C00" }, // Orange vif
    { text: "Excité(e)", icon: "😃", emotion: "EXCITED", color: "#FF4500" }, // Rouge-orangé
    { text: "Satisfait(e)", icon: "😌", emotion: "SATISFIED", color: "#9ACD32" }, // Vert jaune
    { text: "Confiant(e)", icon: "😎", emotion: "CONFIDENT", color: "#32CD32" }, // Vert lime
    { text: "Triste", icon: "😔", emotion: "SAD", color: "#FFB6C1" }, // Rose clair
    { text: "Mélancolique", icon: "😔", emotion: "MELANCHOLIC", color: "#FFC0CB" }, // Rose
    { text: "Déçu(e)", icon: "😞", emotion: "DISAPPOINTED", color: "#FFFFE0" }, // Jaune pâle
    { text: "En colère", icon: "😡", emotion: "ANGRY", color: "#E0FFFF" }, // Cyan clair
    { text: "Frustré(e)", icon: "😤", emotion: "FRUSTRATED", color: "#F0FFF0" }, // Vert menthe
    { text: "Anxieux(se)", icon: "😰", emotion: "ANXIOUS", color: "#FFF8DC" }, // Blanc-crème
  ];

  // Définition des couleurs pour les causes
  const causes = [
    { text: "manque de temps", cause: "manque de temps", color: "#6A5ACD" }, // Bleu-violet
    { text: "douleurs", cause: "douleurs", color: "#FF6347" }, // Rouge tomate
    { text: "motivation", cause: "motivation", color: "#20B2AA" }, // Turquoise
    { text: "fatigue", cause: "fatigue", color: "#9370DB" }, // Violet moyen
    { text: "stress", cause: "stress", color: "#40E0D0" }, // Turquoise
    { text: "confiance", cause: "confiance", color: "#7B68EE" }, // Bleu moyen
    { text: "sédentarité", cause: "sédentarité", color: "#FF69B4" }, // Rose vif
    { text: "surpoids", cause: "surpoids", color: "#3CB371" }, // Vert mer
    { text: "sommeil", cause: "sommeil", color: "#4682B4" }, // Bleu acier
    { text: "nutrition", cause: "nutrition", color: "#32CD32" }, // Vert lime
  ];

  // Fonction pour obtenir la couleur correspondant à une cause
  const getCauseColor = (causeName: string | null): string => {
    if (!causeName) return "#7B68EE"; // Couleur par défaut
    
    const causeObj = causes.find((c) => c.cause === causeName);
    return causeObj ? causeObj.color : "#7B68EE"; // Retourne la couleur de la cause ou la couleur par défaut
  };

  // Vérifier si la chaîne est une couleur hexadécimale
  const isHexColor = (str: string | null): boolean => {
    if (!str) return false;
    return /^#([0-9A-F]{3}){1,2}$/i.test(str);
  };

  // Vérifier si nous sommes côté client
  const isClient = typeof window !== 'undefined';

  // Fonction pour obtenir la couleur de l'émotion
  const getEmotionColor = (): string => {
    // D'abord, vérifier les paramètres d'URL
    if (causeParam && isHexColor(causeParam)) {
      return causeParam; // Si la cause contient une couleur hex valide, l'utiliser
    }
    
    // Ensuite, vérifier localStorage (seulement côté client)
    if (isClient) {
      const storedColor = localStorage.getItem('selectedEmotionColor');
      if (storedColor && isHexColor(storedColor)) {
        return storedColor;
      }
    }
    
    // Rechercher dans le tableau des émotions
    if (emotion) {
      const emotionObj = emotions.find((e) => e.emotion === emotion);
      if (emotionObj) return emotionObj.color;
    }
    
    // Cas spécial pour "Confiant"
    if (emotion === "CONFIDENT" || emotionParam === "CONFIDENT") {
      return "#32CD32"; // Vert lime pour confiant
    }
    
    // Couleur par défaut (vert confiant)
    return "#32CD32";
  };

  // Couleur de l'émotion actuelle
  const emotionColor = getEmotionColor();

  // Fonction pour charger plus d'articles
  const loadMoreArticles = async () => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;

    try {
      const response = await fetch('/api/scientificArticles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emotion,
          cause,
          page: nextPage,
          pageSize: 5
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des articles');
      }

      const data = await response.json();

      if (data.articles.length > 0) {
        // Ajouter la couleur de l'émotion aux articles
        const articlesWithEmotionColor = data.articles.map((article: Article) => ({
          ...article,
          emotionColor: emotionColor
        }));
        
        setArticles(prevArticles => [...prevArticles, ...articlesWithEmotionColor]);
        setPage(nextPage);
        setHasMore(data.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de plus d\'articles:', error);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    // Si les paramètres d'URL ne sont pas disponibles, essayez de récupérer du localStorage
    if (!emotion || !cause) {
      // Vérifier que nous sommes côté client avant d'accéder à localStorage
      if (isClient) {
        const storedEmotion = localStorage.getItem('selectedEmotion');
        const storedCause = localStorage.getItem('selectedCause');

        console.log("Émotion stockée:", storedEmotion);
        console.log("Cause stockée:", storedCause);
        console.log("Couleur de l'émotion stockée:", localStorage.getItem('selectedEmotionColor'));

        if (storedEmotion) setEmotion(storedEmotion);
        if (storedCause) setCause(storedCause);
      }
    }

    console.log("Émotion actuelle:", emotion);
    console.log("Couleur de l'émotion:", emotionColor);

    // Réinitialiser les articles et la pagination quand l'émotion ou la cause change
    setArticles([]);
    setPage(1);
    setHasMore(true);

    // Fonction pour récupérer des articles scientifiques pertinents
    const fetchRelevantArticles = async () => {
      setLoading(true);

      try {
        const response = await fetch('/api/scientificArticles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            emotion,
            cause,
            page: 1,
            pageSize: 5
          }),
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des articles');
        }

        const data = await response.json();
        
        // Ajouter la couleur de l'émotion aux articles
        const articlesWithEmotionColor = data.articles.map((article: Article) => ({
          ...article,
          emotionColor: emotionColor
        }));
        
        setArticles(articlesWithEmotionColor);
        setHasMore(data.hasMore);
      } catch (error) {
        console.error('Erreur:', error);
        // Générer des articles simulés en cas d'erreur
        generateMockArticles();
      } finally {
        setLoading(false);
      }
    };

    fetchRelevantArticles();

    // Récupérer le mode sombre des préférences (seulement côté client)
    if (isClient) {
      const savedDarkMode = localStorage.getItem('darkMode');
      if (savedDarkMode !== null) {
        setDarkMode(savedDarkMode === 'true');
      }
    }
  }, [emotion, cause, emotionColor]);

  useEffect(() => {
    // Configurer l'observateur d'intersection pour le chargement infini
    if (loadMoreRef.current && hasMore) {
      // Détruire l'observateur précédent si présent
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      // Créer un nouvel observateur
      observerRef.current = new IntersectionObserver(
        (entries) => {
          // Si l'élément de référence est visible et qu'il y a plus d'articles
          if (entries[0].isIntersecting && hasMore && !isLoadingMore && !loading) {
            loadMoreArticles();
          }
        },
        {
          rootMargin: '100px', // Commencer à charger quand l'élément est à 100px du viewport
          threshold: 0.1, // Déclencher quand au moins 10% de l'élément est visible
        }
      );

      // Observer l'élément de référence
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      // Nettoyer l'observateur quand le composant est démonté
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoadingMore, loading]);

  // Fonction pour générer des articles simulés basés sur l'émotion et la cause
  const generateMockArticles = () => {
    const mockTags: MockTagsType = {
      "Anxieux(se)": ["gestion du stress", "anxiété", "science cognitive", "neurologie"],
      "Triste": ["neurosciences", "dopamine", "sérotonine", "endorphines"],
      "Heureux(se)": ["bien-être", "psychologie positive", "endorphines", "activité physique"],
      "Satisfait(e)": ["psychologie", "accomplissement", "neurobiologie", "satisfaction"],
      "En colère": ["gestion de la colère", "relaxation", "psychologie comportementale"],
      "Fatigué(e)": ["sommeil", "récupération", "chronobiologie", "énergie"],
      "Stressé(e)": ["cortisol", "relaxation", "neurofeedback", "méditation"],
      "Frustré(e)": ["psychologie cognitive", "réorientation", "objectifs"],
    };

    const mockArticlesByCause: MockArticlesByCauseType = {
      "manque de temps": [
        {
          title: "L'optimisation du temps libre améliore la santé mentale selon une nouvelle étude",
          description: "Des chercheurs de l'Université de Stanford ont découvert que 15 minutes d'activité ciblée par jour peuvent significativement améliorer le bien-être mental.",
          source: "Journal of Psychological Science",
          tags: ["gestion du temps", "santé mentale", "productivité", "bien-être"],
          imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500'
        },
        {
          title: "Micro-pauses actives : Maximiser les bénéfices en un minimum de temps",
          description: "Des exercices de haute intensité de 2 minutes peuvent fournir des avantages cardiovasculaires significatifs selon une nouvelle recherche.",
          source: "International Journal of Exercise Science",
          tags: ["micro-exercices", "optimisation du temps", "HIIT", "santé cardiovasculaire"],
          imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500'
        }
      ],
      "douleurs": [
        {
          title: "Nouvelle approche biomécanique pour la gestion des douleurs chroniques",
          description: "Des chercheurs ont développé un protocole d'exercices qui réduit significativement les douleurs musculo-squelettiques en 3 semaines.",
          source: "European Journal of Pain",
          tags: ["biomécanique", "douleur chronique", "exercices thérapeutiques", "rééducation"],
          imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500'
        },
        {
          title: "L'impact des mouvements doux sur l'inflammation articulaire",
          description: "Une étude longitudinale de 5 ans démontre comment des exercices à faible impact réduisent l'inflammation et améliorent la mobilité articulaire.",
          source: "Arthritis Research & Therapy",
          tags: ["inflammation", "mobilité articulaire", "exercices doux", "rhumatologie"],
          imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500'
        }
      ],
      "motivation": [
        {
          title: "La neuropsychologie de la motivation : comprendre les déclencheurs d'action",
          description: "Les neuroscientifiques identifient les circuits cérébraux spécifiques qui s'activent lorsque nous trouvons la motivation pour bouger.",
          source: "Nature Neuroscience",
          tags: ["neuropsychologie", "motivation", "circuits cérébraux", "comportement"],
          imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500'
        },
        {
          title: "Comment les microréussites augmentent la motivation à long terme",
          description: "Une analyse de 10 ans montre que célébrer de petites victoires augmente significativement l'adhésion aux activités physiques régulières.",
          source: "Journal of Personality and Social Psychology",
          tags: ["microréussites", "psychologie positive", "adhésion", "objectifs"],
          imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500'
        }
      ],
      "fatigue": [
        {
          title: "L'effet paradoxal de l'activité physique sur les niveaux d'énergie",
          description: "Contrairement aux croyances populaires, une étude démontre que l'exercice modéré augmente les niveaux d'énergie de 65% chez les personnes souffrant de fatigue chronique.",
          source: "Journal of Clinical Endocrinology & Metabolism",
          tags: ["fatigue chronique", "niveaux d'énergie", "mitochondries", "endocrinologie"],
          imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500'
        },
        {
          title: "Nouvelles découvertes sur les mécanismes moléculaires de la récupération musculaire",
          description: "Des chercheurs ont identifié une protéine clé impliquée dans la récupération musculaire qui peut être stimulée par des exercices spécifiques.",
          source: "Science Translational Medicine",
          tags: ["récupération musculaire", "biologie moléculaire", "protéines", "adaptation"],
          imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500'
        }
      ]
    };

    const defaultArticles: MockArticle[] = [
      {
        title: "L'impact du mouvement sur la plasticité cérébrale",
        description: "Une méta-analyse de 50 études révèle comment différents types d'activités physiques affectent la neuroplasticité à tout âge.",
        source: "Frontiers in Neuroscience",
        tags: ["neuroplasticité", "cognition", "neurosciences", "activité physique"],
        imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500'
      },
      {
        title: "Le mouvement comme médecine préventive : perspectives scientifiques",
        description: "Des chercheurs quantifient les effets préventifs de l'activité physique régulière sur 27 pathologies chroniques.",
        source: "British Journal of Sports Medicine",
        tags: ["médecine préventive", "pathologies chroniques", "santé publique", "longévité"],
        imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500'
      }
    ];

    // Déterminer les articles en fonction de l'émotion et de la cause
    let relevantArticles: MockArticle[] = [];

    // Articles basés sur la cause si disponible
    if (cause && cause in mockArticlesByCause) {
      relevantArticles = [...mockArticlesByCause[cause]];
    }

    // Ajouter des articles basés sur l'émotion
    if (emotion && emotion in mockTags) {
      const emotionBasedArticle: MockArticle = {
        title: `Comment l'activité physique influence l'état émotionnel: focus sur le sentiment de ${emotion}`,
        description: `Une recherche approfondie sur les mécanismes neurobiologiques qui lient l'activité physique et la régulation des émotions, particulièrement dans les états de ${emotion.toLowerCase()}.`,
        source: "Journal of Affective Disorders",
        tags: [...mockTags[emotion]],
        imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500'
      };

      relevantArticles.push(emotionBasedArticle);
    }

    // Compléter avec des articles par défaut si nécessaire
    if (relevantArticles.length < 3) {
      relevantArticles = [...relevantArticles, ...defaultArticles];
    }

    // Formater les articles avec les informations manquantes
    const formattedArticles: Article[] = relevantArticles.slice(0, 5).map((article, index) => {
      return {
        id: `mock-${index}`,
        title: article.title,
        description: article.description,
        source: article.source,
        url: "#",
        publishDate: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)), // Dates échelonnées
        tags: article.tags,
        relevance: 85 - (index * 10), // Pertinence décroissante
        emotion: emotion || undefined,
        emotionColor: emotionColor, // Ajouter la couleur de l'émotion
        imageUrl: article.imageUrl
      };
    });

    setArticles(formattedArticles);
  };

  const handleBackClick = () => {
    router.back();
  };

  const formatDate = (dateString: string | Date): string => {
    const date = new Date(dateString);
    
    // Vérifier si la date est valide
    if (isNaN(date.getTime())) return 'Date inconnue';
    
    // Formater la date: JJ/MM/AAAA
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Fonction pour obtenir une couleur pour un tag basée sur l'émotion
  const getTagColor = (tag: string, article: Article) => {
    if (article.emotion) {
      const baseColor = article.emotionColor;
      // Utilisation de la couleur de l'émotion avec opacité réduite
      return {
        backgroundColor: `${baseColor}25`,
        borderColor: `${baseColor}40`,
        color: darkMode ? 'white' : '#333'
      };
    }

    // Couleur par défaut
    return {};
  };

  // Fonction pour récupérer les couleurs complémentaires à partir de la couleur principale
  const getThemeColors = (mainColor: string) => {
    // Convertir la couleur hex en RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
    };

    const rgb = hexToRgb(mainColor);
    
    // Créer des variations de la couleur principale pour un thème complet
    return {
      main: mainColor,
      light: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.07)`,
      medium: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
      dark: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`,
      ultraLight: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.02)`,
      ultraDark: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.85)`,
      accent: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`,
      border: darkMode 
        ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)` 
        : `rgba(255, 255, 255, 0.25)`,
      text: darkMode ? '#ffffff' : '#222222',
      textAccent: mainColor,
      luxeGold: darkMode ? '#d4af37' : '#d4af37',
      luxeSilver: darkMode ? '#c0c0c0' : '#c0c0c0',
      luxeGlow: `0 0 10px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15), 0 0 20px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
      luxeShadow: `0 10px 25px rgba(0, 0, 0, 0.08), 0 5px 10px rgba(0, 0, 0, 0.04)`,
      glassShadow: darkMode 
        ? `0 10px 30px rgba(0, 0, 0, 0.2)` 
        : `0 10px 30px rgba(0, 0, 0, 0.07)`,
      cardOverlay: darkMode 
        ? `linear-gradient(135deg, rgba(40, 40, 50, 0.85), rgba(30, 30, 40, 0.9))` 
        : `linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(250, 250, 255, 0.95))`,
      headerOverlay: darkMode 
        ? `linear-gradient(135deg, rgba(35, 35, 45, 0.9), rgba(30, 30, 40, 0.95))` 
        : `linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(250, 250, 255, 0.98))`,
      buttonGradient: darkMode 
        ? `linear-gradient(135deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4), rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2))` 
        : `linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(245, 245, 250, 0.8))`,
      goldAccent: `linear-gradient(135deg, #d4af37, #f9e076)`,
      backgroundGradient: darkMode 
        ? `radial-gradient(circle at 20% 20%, rgba(40, 40, 55, 0.4), transparent 70%), 
           radial-gradient(circle at 80% 80%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05), transparent 50%),
           linear-gradient(135deg, rgba(20, 20, 30, 0.97), rgba(25, 25, 35, 0.95))`
        : `radial-gradient(circle at 20% 20%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.03), transparent 70%), 
           radial-gradient(circle at 80% 80%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.02), transparent 50%),
           linear-gradient(135deg, rgba(248, 248, 252, 0.97), rgba(255, 255, 255, 0.99))`,
    };
  };

  // Obtenir le thème de couleurs basé sur l'émotion actuelle
  const themeColors = getThemeColors(emotionColor);

  // Styles communs pour les éléments avec glassmorphisme
  const glassStyle = {
    background: themeColors.cardOverlay,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '22px',
    border: `1px solid ${themeColors.border}`,
    boxShadow: themeColors.glassShadow,
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  };

  // Style pour les pilules interactives
  const pillStyle = {
    ...glassStyle,
    padding: '8px 18px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    color: themeColors.text,
    letterSpacing: '0.3px',
  };

  // Style luxueux pour les accents
  const luxeAccentStyle = {
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: '-2px',
      left: '0',
      width: '30px',
      height: '2px',
      background: themeColors.goldAccent,
      boxShadow: '0 0 5px rgba(212, 175, 55, 0.5)',
    }
  };

  return (
    <div 
      className={`${styles.container} ${!darkMode ? styles.lightModeContainer : ''}`}
      style={{
        background: themeColors.backgroundGradient,
        color: themeColors.text,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '100vw',
        overflow: 'hidden',
        fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div 
        className={styles.header}
        style={{
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${themeColors.border}`,
          background: themeColors.headerOverlay,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <button 
          className="pillButton"
          onClick={() => router.back()}
          aria-label="Retour"
          style={{
            ...pillStyle,
            width: '40px',
            height: '40px',
            padding: '0',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={themeColors.textAccent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 
          className={styles.title}
          style={{
            color: themeColors.text,
            fontSize: '1.4rem',
            fontWeight: 600,
            margin: 0,
            letterSpacing: '-0.5px',
            position: 'relative',
            display: 'inline-block',
            paddingBottom: '5px',
          }}
        >
          Articles Scientifiques
          <span 
            style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              width: '40px',
              height: '2px',
              background: themeColors.goldAccent,
              boxShadow: '0 0 5px rgba(212, 175, 55, 0.3)',
              borderRadius: '2px',
            }}
          ></span>
        </h1>
        <button 
          className="pillButton"
          onClick={() => setDarkMode(!darkMode)}
          aria-label={darkMode ? "Mode clair" : "Mode sombre"}
          style={{
            ...pillStyle,
            width: '40px',
            height: '40px',
            padding: '0',
          }}
        >
          {darkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={themeColors.textAccent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={themeColors.textAccent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </button>
      </div>

      <div 
        className={styles.feedContainer}
        style={{
          padding: '18px',
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {loading ? (
          <div 
            style={{
              ...glassStyle,
              padding: '30px 20px',
              textAlign: 'center',
              maxWidth: '90%',
              margin: '30px auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div 
              className={styles.loadingSpinner}
              style={{
                border: `3px solid ${themeColors.ultraLight}`,
                borderTopColor: themeColors.luxeGold,
                width: '40px',
                height: '40px',
                marginBottom: '16px',
              }}
            ></div>
            <p style={{ margin: '0', fontSize: '15px', fontWeight: 500, letterSpacing: '0.3px' }}>Chargement des articles...</p>
          </div>
        ) : (
          <>
            {articles.length > 0 ? (
              <div 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  width: '100%',
                  padding: '0 2px',
                }}
              >
                {articles.map((article, index) => (
                  <div 
                    key={index} 
                    className={styles.articleCard}
                    style={{
                      ...glassStyle,
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      position: 'relative',
                      transform: 'translateY(0)',
                      transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                      width: '100%',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = themeColors.luxeShadow;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = themeColors.glassShadow;
                    }}
                  >
                    {article.imageUrl && (
                      <div 
                        style={{
                          width: '100%',
                          height: '160px',
                          overflow: 'hidden',
                          borderTopLeftRadius: '20px',
                          borderTopRightRadius: '20px',
                          position: 'relative',
                        }}
                      >
                        <div 
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundImage: `url(${article.imageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            transition: 'transform 0.8s ease',
                            filter: darkMode ? 'brightness(0.9) contrast(1.05)' : 'brightness(1.02) contrast(1.02)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.08)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        ></div>
                        <div 
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: `linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.3) 100%)`,
                          }}
                        ></div>
                        <div
                          style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: 'rgba(0, 0, 0, 0.5)',
                            backdropFilter: 'blur(4px)',
                            WebkitBackdropFilter: 'blur(4px)',
                            color: '#fff',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={themeColors.textAccent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                          {formatDate(article.publishDate)}
                        </div>
                      </div>
                    )}
                    <div 
                      style={{
                        padding: '18px',
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <div 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: '8px',
                          fontSize: '12px',
                          opacity: 0.7,
                          letterSpacing: '0.2px',
                          fontWeight: 500,
                        }}
                      >
                        <span style={{ color: themeColors.luxeGold, marginRight: '5px' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={themeColors.textAccent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="5"></circle>
                            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
                          </svg>
                        </span>
                        <span style={{ margin: '0 5px' }}>{article.source}</span>
                      </div>
                      <h2 
                        style={{ 
                          margin: '0 0 12px 0',
                          fontSize: '17px',
                          fontWeight: 600,
                          lineHeight: 1.4,
                          color: themeColors.text,
                          borderBottom: `1px solid ${themeColors.border}`,
                          paddingBottom: '12px',
                          position: 'relative',
                          letterSpacing: '-0.3px',
                        }}
                      >
                        <span 
                          style={{
                            display: 'block',
                            position: 'relative',
                          }}
                        >
                          {article.title}
                          <span 
                            style={{
                              display: 'block',
                              position: 'absolute',
                              bottom: '-13px',
                              left: 0,
                              width: '40px',
                              height: '2px',
                              background: themeColors.goldAccent,
                              boxShadow: '0 0 5px rgba(212, 175, 55, 0.3)',
                              borderRadius: '2px',
                            }}
                          ></span>
                        </span>
                      </h2>
                      <p 
                        style={{
                          margin: '0 0 14px 0',
                          fontSize: '14px',
                          lineHeight: 1.5,
                          flex: 1,
                          color: darkMode ? 'rgba(255, 255, 255, 0.85)' : 'rgba(30, 30, 30, 0.75)',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          letterSpacing: '0.1px',
                        }}
                      >
                        {article.description}
                      </p>
                      <div 
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '8px',
                          marginBottom: '18px',
                        }}
                      >
                        {article.tags && article.tags.map((tag, tagIndex) => (
                          <span 
                            key={tagIndex}
                            style={{
                              display: 'inline-flex',
                              padding: '4px 10px',
                              fontSize: '11px',
                              background: 'transparent',
                              border: `1px solid ${themeColors.border}`,
                              color: darkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(40, 40, 40, 0.85)',
                              fontWeight: 500,
                              borderRadius: '12px',
                              letterSpacing: '0.2px',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div style={{ marginTop: 'auto' }}>
                        <a 
                          href={article.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            width: '100%',
                            padding: '12px 18px',
                            background: themeColors.buttonGradient,
                            color: themeColors.text,
                            fontWeight: 600,
                            fontSize: '14px',
                            textDecoration: 'none',
                            position: 'relative',
                            overflow: 'hidden',
                            border: `1px solid ${themeColors.border}`,
                            borderRadius: '16px',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
                            letterSpacing: '0.2px',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.07)';
                            e.currentTarget.style.borderColor = themeColors.luxeGold;
                            const svg = e.currentTarget.querySelector('svg');
                            if (svg) {
                              svg.style.transform = 'translateX(3px)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.03)';
                            e.currentTarget.style.borderColor = themeColors.border;
                            const svg = e.currentTarget.querySelector('svg');
                            if (svg) {
                              svg.style.transform = 'translateX(0)';
                            }
                          }}
                        >
                          <span>Lire l'article</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={themeColors.textAccent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.3s ease' }}>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div 
                style={{
                  ...glassStyle,
                  padding: '30px 20px',
                  textAlign: 'center',
                  maxWidth: '500px',
                  margin: '60px auto',
                }}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="60" 
                  height="60" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke={themeColors.medium} 
                  strokeWidth="1" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  style={{ marginBottom: '20px' }}
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <p style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 10px 0' }}>
                  Aucun article trouvé
                </p>
                <p style={{ fontSize: '14px', opacity: 0.7, margin: 0 }}>
                  Aucun article trouvé pour cette combinaison d'émotion et de cause.
                </p>
              </div>
            )}
          </>
        )}

        {hasMore && !loading && (
          <div 
            ref={loadMoreRef}
            style={{
              padding: '30px 0',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isLoadingMore ? 1 : 0.01, // 0.01 au lieu de 0 pour que l'élément reste détectable
              transition: 'opacity 0.3s ease',
              height: '60px', // Hauteur fixe pour que l'observateur puisse le détecter même quand il est invisible
            }}
          >
            {isLoadingMore && (
              <>
                <div 
                  className={styles.loadingSpinner}
                  style={{
                    border: `3px solid ${themeColors.ultraLight}`,
                    borderTopColor: themeColors.luxeGold,
                    width: '30px',
                    height: '30px',
                  }}
                ></div>
                <p style={{ 
                  margin: '10px 0 0 0', 
                  fontSize: '14px',
                  fontWeight: 500,
                  color: themeColors.text,
                  letterSpacing: '0.2px',
                }}>
                  Chargement d'articles supplémentaires...
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
