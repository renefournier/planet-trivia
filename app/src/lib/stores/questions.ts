import { writable } from 'svelte/store';
import type { QuestionCard, Question } from './gameState';

export const currentQuestionCard = writable<QuestionCard | null>(null);
export const currentQuestion = writable<Question | null>(null);
