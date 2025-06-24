import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { QuestionCard, Question, LocationData } from '$lib/stores/gameState';
import { generateQuestionsWithAI } from '$lib/api/ai';

export const POST: RequestHandler = async ({ request }) => {
  const { location, usedQuestionIds } = await request.json() as { location: LocationData, usedQuestionIds: string[] };

  if (!location) {
    return json({ error: 'Location data is required' }, { status: 400 });
  }

  try {
    const questions: Question[] = await generateQuestionsWithAI(location, usedQuestionIds);

    const newCard: QuestionCard = {
      id: `card_${Date.now()}`, // Unique ID for the card
      location: location.displayName,
      questions: questions,
      generated: new Date(),
    };

    return json({ card: newCard });
  } catch (error: unknown) {
    console.error('Error generating questions:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return json({ error: `Failed to generate questions: ${errorMessage}` }, { status: 500 });
  }
};
