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


const mockQuestionPool: Question[] = [
  {
    id: 'mock_geo_1',
    category: 'geography',
    question: 'What is the capital city of Canada?',
    options: ['Toronto', 'Vancouver', 'Ottawa', 'Montreal'],
    correctAnswer: 'Ottawa',
    difficulty: 'easy'
  },
  {
    id: 'mock_ent_1',
    category: 'entertainment',
    question: 'Who played the lead role in the movie "Titanic"?',
    options: ['Tom Hanks', 'Leonardo DiCaprio', 'Brad Pitt', 'Johnny Depp'],
    correctAnswer: 'Leonardo DiCaprio',
    difficulty: 'easy'
  },
  {
    id: 'mock_hist_1',
    category: 'history',
    question: 'In which year did World War II end?',
    options: ['1942', '1945', '1950', '1939'],
    correctAnswer: '1945',
    difficulty: 'medium'
  },
  {
    id: 'mock_arts_1',
    category: 'arts',
    question: 'Which artist painted the Mona Lisa?',
    options: ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Claude Monet'],
    correctAnswer: 'Leonardo da Vinci',
    difficulty: 'easy'
  },
  {
    id: 'mock_sci_1',
    category: 'science',
    question: 'What is the chemical symbol for water?',
    options: ['O2', 'H2O', 'CO2', 'NaCl'],
    correctAnswer: 'H2O',
    difficulty: 'easy'
  },
  {
    id: 'mock_sport_1',
    category: 'sports',
    question: 'How many players are on a standard soccer team?',
    options: ['9', '10', '11', '12'],
    correctAnswer: '11',
    difficulty: 'easy'
  },
  {
    id: 'mock_geo_2',
    category: 'geography',
    question: 'Which desert is the largest in the world?',
    options: ['Sahara Desert', 'Arabian Desert', 'Gobi Desert', 'Antarctic Polar Desert'],
    correctAnswer: 'Antarctic Polar Desert',
    difficulty: 'hard'
  },
  {
    id: 'mock_ent_2',
    category: 'entertainment',
    question: 'Which TV show features characters named Walter White and Jesse Pinkman?',
    options: ['The Wire', 'Breaking Bad', 'Game of Thrones', 'Stranger Things'],
    correctAnswer: 'Breaking Bad',
    difficulty: 'medium'
  },
  {
    id: 'mock_hist_2',
    category: 'history',
    question: 'Who was the first President of the United States?',
    options: ['Thomas Jefferson', 'Abraham Lincoln', 'George Washington', 'John Adams'],
    correctAnswer: 'George Washington',
    difficulty: 'easy'
  },
  {
    id: 'mock_arts_2',
    category: 'arts',
    question: 'Which famous playwright wrote "Romeo and Juliet"?',
    options: ['William Shakespeare', 'Charles Dickens', 'Jane Austen', 'Mark Twain'],
    correctAnswer: 'William Shakespeare',
    difficulty: 'easy'
  },
  {
    id: 'mock_sci_2',
    category: 'science',
    question: 'What is the largest planet in our solar system?',
    options: ['Mars', 'Earth', 'Jupiter', 'Saturn'],
    correctAnswer: 'Jupiter',
    difficulty: 'easy'
  },
  {
    id: 'mock_sport_2',
    category: 'sports',
    question: 'Which country won the FIFA World Cup in 2018?',
    options: ['Brazil', 'Germany', 'France', 'Argentina'],
    correctAnswer: 'France',
    difficulty: 'medium'
  }
];

function generateMockQuestions(location: LocationData, usedQuestionIds: string[]): Question[] {
  const questionsToReturn: Question[] = [];
  const availableQuestions = mockQuestionPool.filter(q => !usedQuestionIds.includes(q.id));

  // If all questions have been used, reset the pool (or handle as needed)
  if (availableQuestions.length === 0) {
    console.warn('All mock questions used. Resetting mock question pool for demonstration.');
    // For demonstration, if all are used, we'll just cycle through the entire pool again.
    // In a real app, you might want to generate truly new questions or indicate game end.
    let tempUsedCount = 0;
    while (questionsToReturn.length < 6 && tempUsedCount < mockQuestionPool.length) {
      questionsToReturn.push(mockQuestionPool[tempUsedCount]);
      tempUsedCount++;
    }
    return questionsToReturn;
  }

  // Select 6 questions from the available pool. If less than 6 are available,
  // cycle through the available ones to fill the card.
  let currentPoolIndex = 0;
  while (questionsToReturn.length < 6) {
    if (currentPoolIndex >= availableQuestions.length) {
      currentPoolIndex = 0; // Cycle back to the beginning of available questions
    }
    questionsToReturn.push(availableQuestions[currentPoolIndex]);
    currentPoolIndex++;
  }

  return questionsToReturn;
}

export async function generateQuestionsWithAI(
  location: LocationData,
  usedQuestionIds: string[]
): Promise<Question[]> {
  if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
    console.warn('Anthropic API key is not configured. Using mock questions for development.');
    return generateMockQuestions(location, usedQuestionIds);
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
