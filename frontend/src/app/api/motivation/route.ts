import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-proj-BkwSrFMB0PH2lLvlHBwANqsUiT2BFLFPskWFCb90eBLYJTtHvmLmxQeIJjPOPAhV7U69VnbPtmCrEOGu58BdPwVVxljhqMxZ19Z3n0Qe4gjx',
});

export async function POST(req: NextRequest) {
  try {
    const { emotion, cause } = await req.json();
    
    if (!emotion || !cause) {
      return NextResponse.json(
        { error: 'Emotion and cause are required' },
        { status: 400 }
      );
    }
    
    // Créer un prompt évitant le mot "sport"
    let systemPrompt = "Vous êtes un ambassadeur bienveillant des valeurs de Decathlon. ";
    systemPrompt += "IMPORTANT : N'utilisez JAMAIS le mot 'sport' ou ses dérivés dans votre réponse car cela peut créer de l'anxiété. ";
    systemPrompt += "Votre mission est d'inspirer subtilement les gens à découvrir le bien-être par le mouvement, accessible à tous quels que soient l'âge, le niveau ou la condition physique. ";
    systemPrompt += "Générez une phrase INSPIRANTE qui encourage le mouvement, l'activité physique et le bien-être sans jamais mentionner explicitement le 'sport'. ";
    systemPrompt += "Utilisez plutôt des termes comme : mouvement, activité, bien-être physique, énergie du corps, plaisir de bouger, jeu, etc. ";
    systemPrompt += "La phrase doit être douce mais motivante et montrer que le mouvement est à la portée de CHACUN. ";
    systemPrompt += "ÉVITEZ tout vocabulaire technique, compétitif ou intimidant lié à l'entraînement ou la performance. ";
    systemPrompt += "PRIVILÉGIEZ des messages sur le plaisir du mouvement, la joie d'être actif et le bien-être accessible à tous. ";
    
    // Indications spécifiques selon l'émotion
    systemPrompt += `L'utilisateur ressent de la ${emotion.toLowerCase()} en lien avec ${cause.toLowerCase()}. `;
    
    // Exemples adaptés sans utiliser le mot sport
    if (emotion.includes('Heureux')) {
      systemPrompt += "Exemple: 'Ta joie est contagieuse ! Partage-la en explorant une activité qui te fait du bien - le mouvement n'attend que toi, à ton propre rythme !'";
    } else if (emotion.includes('Triste')) {
      systemPrompt += "Exemple: 'Le simple fait de bouger est accessible à tous, même dans les moments difficiles. Un petit mouvement aujourd'hui peut être le premier pas vers ton mieux-être !'";
    } else if (emotion.includes('Énervé')) {
      systemPrompt += "Exemple: 'Le mouvement est un allié universel contre la frustration - bouge à ton rythme, à ta façon, et redécouvre le plaisir simple d'être actif !'";
    } else if (emotion.includes('Excité')) {
      systemPrompt += "Exemple: 'Canalise cette énergie dans une activité qui te ressemble - le mouvement est un terrain de jeu ouvert à tous, où chacun trouve sa place !'";
    } else if (emotion.includes('Anxieux')) {
      systemPrompt += "Exemple: 'Un pas après l'autre, à ton propre rythme. L'activité physique douce est une expérience qui t'apportera calme et confiance, sans pression aucune !'";
    } else if (emotion.includes('Satisfait')) {
      systemPrompt += "Exemple: 'Célèbre ce sentiment en partageant le plaisir du mouvement avec d'autres - l'activité physique rassemble et appartient à chacun de nous !'";
    }
    
    // Message principal demandant la génération
    const userMessage = `Génère une phrase motivante pour quelqu'un qui ressent de la ${emotion.toLowerCase()} concernant ${cause.toLowerCase()}. 
    IMPORTANT: N'utilise JAMAIS le mot 'sport' ou ses dérivés.
    Opte plutôt pour des termes comme : mouvement, activité, énergie du corps, bien-être physique, joie de bouger.
    La phrase doit être douce mais inspirante, sans aucune pression ou attente de performance.`;
    
    // Call OpenAI API
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 150,
      temperature: 0.8,
    });
    
    // Extract response
    const response = chatCompletion.choices[0]?.message?.content || 
      "Le mouvement est pour tous, à chaque instant ! Peu importe ton niveau ou ton état actuel - l'énergie de ton corps n'attend que toi pour s'exprimer, pas à pas, à ton rythme.";
    
    return NextResponse.json({ quote: response });
    
  } catch (error: any) {
    console.error('Error generating motivation quote:', error);
    return NextResponse.json(
      { error: 'Failed to generate motivation quote', details: error.message },
      { status: 500 }
    );
  }
}
