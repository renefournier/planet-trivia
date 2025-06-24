import Anthropic from '@anthropic-ai/sdk';
import type { Question, LocationData } from '$lib/stores/gameState';
import { CATEGORY_LIST, CATEGORY_NAMES, type CategoryType } from '$lib/utils/constants';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
  console.warn('ANTHROPIC_API_KEY is not set. AI question generation will not work.');
}

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
});


function generateMockQuestions(location: LocationData): Question[] {
  const locationName = `${location.city}, ${location.region}`;

  return [
    {
      id: `mock_geo_${Date.now()}`,
      category: 'geography',
      question: `What is a notable geographic feature near ${locationName}?`,
      options: [
        'Mountain range',
        'Large lake',
        'River delta',
        'Coastal inlet'
      ],
      correctAnswer: 'Coastal inlet',
      difficulty: 'medium'
    },
    {
      id: `mock_ent_${Date.now() + 1}`,
      category: 'entertainment',
      question: `What type of entertainment venue is commonly found in ${locationName}?`,
      options: [
        'Opera house',
        'Concert hall',
        'Theater district',
        'Music festival grounds'
      ],
      correctAnswer: 'Concert hall',
      difficulty: 'medium'
    },
    {
      id: `mock_hist_${Date.now() + 2}`,
      category: 'history',
      question: `When was ${location.city} approximately founded or established?`,
      options: [
        'Early 1800s',
        'Mid 1800s',
        'Late 1800s',
        'Early 1900s'
      ],
      correctAnswer: 'Mid 1800s',
      difficulty: 'medium'
    },
    {
      id: `mock_arts_${Date.now() + 3}`,
      category: 'arts',
      question: `What type of cultural institution might you find in ${locationName}?`,
      options: [
        'Art gallery',
        'Museum',
        'Cultural center',
        'All of the above'
      ],
      correctAnswer: 'All of the above',
      difficulty: 'easy'
    },
    {
      id: `mock_sci_${Date.now() + 4}`,
      category: 'science',
      question: `What natural phenomenon is common in the ${location.region} region?`,
      options: [
        'Seasonal weather patterns',
        'Unique wildlife',
        'Natural formations',
        'All of the above'
      ],
      correctAnswer: 'All of the above',
      difficulty: 'easy'
    },
    {
      id: `mock_sport_${Date.now() + 5}`,
      category: 'sports',
      question: `What recreational activity is popular in ${locationName}?`,
      options: [
        'Water sports',
        'Hiking',
        'Winter sports',
        'Depends on the season'
      ],
      correctAnswer: 'Depends on the season',
      difficulty: 'easy'
    }
  ];
}

export async function generateQuestionsWithAI(
  location: LocationData,
  usedQuestionIds: string[]
): Promise<Question[]> {
  if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
    console.warn('Anthropic API key is not configured. Using mock questions for development.');
    return generateMockQuestions(location);
  }

  const locationName = `${location.city}, ${location.region}, ${location.country}`;
  const usedQuestionsString = usedQuestionIds.length > 0 ? `Exclude these previously used question IDs: ${usedQuestionIds.join(', ')}` : '';

  const prompt = `Generate 6 Trivial Pursuit questions specifically about ${locationName} and the surrounding area within 50km.

Categories required:
1. ${CATEGORY_NAMES.geography} - local landmarks, physical features, location facts
2. ${CATEGORY_NAMES.entertainment} - local theaters, festivals, celebrity connections, venues
3. ${CATEGORY_NAMES.history} - local historical events, founding, notable figures
4. ${CATEGORY_NAMES.arts} - local artists, museums, literary connections
5. ${CATEGORY_NAMES.science} - local wildlife, climate, natural phenomena, research institutions
6. ${CATEGORY_NAMES.sports} - local teams, sports venues, recreational activities

Requirements:
- Questions should be answerable by locals or visitors with moderate knowledge
- Avoid overly obscure details that require internet search
- Provide 4 multiple choice options per question
- Focus on ${location.city}, ${location.region}, ${location.country} but can include nearby areas
- Make questions engaging and varied in difficulty
- Return the category for each question as a simplified key: 'geography', 'entertainment', 'history', 'arts', 'science', 'sports'.
- The 'answer' field should be the index of the correct choice in the 'choices' array.

${usedQuestionsString}

Format as valid JSON. Ensure the response is a JSON array of 6 objects, each with 'question', 'choices', 'answer', and 'category' fields.
`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307', // Using Haiku as chosen
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const firstContent = response.content[0];
    if (!firstContent || firstContent.type !== 'text') {
      throw new Error('No text content received from AI.');
    }
    const content = firstContent.text;

    // Attempt to parse the JSON. The AI might wrap it in markdown.
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
    const jsonString = jsonMatch ? jsonMatch[1] : content;

    type AIQuestion = {
      question: string;
      choices: string[];
      answer: number;
      category: CategoryType;
    };

    const aiQuestions: AIQuestion[] = JSON.parse(jsonString);

    const questions: Question[] = aiQuestions.map((q, index) => {
      if (!q.choices || !Array.isArray(q.choices) || typeof q.answer !== 'number') {
        throw new Error(`Invalid AI response format for question at index ${index}`);
      }
      if (!CATEGORY_LIST.includes(q.category)) {
        throw new Error(`Invalid category from AI: ${q.category}`);
      }
      return {
        id: `ai_q_${Date.now()}_${index}`,
        category: q.category,
        question: q.question,
        options: q.choices,
        correctAnswer: q.choices[q.answer],
        difficulty: 'medium', // Or determine from AI response if available
      };
    });

    // Basic validation to ensure 6 questions and correct categories
    if (questions.length !== 6) {
      throw new Error(`Expected 6 questions, but received ${questions.length}.`);
    }
    for (const question of questions) {
      if (!CATEGORY_LIST.includes(question.category)) {
        console.warn(`AI generated question with invalid category: ${question.category}`);
        // Optionally filter out or re-generate if categories are strict
      }
      if (!question.options || !Array.isArray(question.options)) {
        console.error('Invalid or missing options for question:', question);
        throw new Error(`Invalid or missing options for question ID: ${question.id}`);
      }
    }

    return questions;
  } catch (error) {
    console.error('Error generating questions with Anthropic AI:', error);
    throw new Error(`Failed to generate questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
