import { writable } from 'svelte/store';
import { loadGameState, saveGameState, initStorage } from '$lib/utils/storage'; // Import initStorage
import type { CategoryType } from '$lib/utils/constants';

export type { CategoryType };

export interface PlayerState {
  name: string;
  pieSegments: Record<CategoryType, boolean>;
}

export interface Question {
  id: string;
  category: CategoryType;
  question: string;
  options: string[]; // For multiple choice
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuestionCard {
  id: string;
  location: string;
  questions: Question[];
  generated: Date;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  region: string;
  country: string;
  displayName: string;
}

export interface GameState {
  players: {
    player1: PlayerState;
    player2: PlayerState;
  };
  currentPlayer: 1 | 2;
  currentQuestionIndex: number;
  location: LocationData | null;
  usedQuestions: Set<string>; // Question IDs to prevent repeats
  gameStatus: 'setup' | 'playing' | 'finished';
  winner?: 1 | 2;
}

const initialGameState: GameState = {
  players: {
    player1: {
      name: 'Player 1',
      pieSegments: {
        geography: false,
        entertainment: false,
        history: false,
        arts: false,
        science: false,
        sports: false,
      },
    },
    player2: {
      name: 'Player 2',
      pieSegments: {
        geography: false,
        entertainment: false,
        history: false,
        arts: false,
        science: false,
        sports: false,
      },
    },
  },
  currentPlayer: 1,
  currentQuestionIndex: 0,
  location: null,
  usedQuestions: new Set(),
  gameStatus: 'setup',
  winner: undefined,
};

export const gameState = writable<GameState>(initialGameState);

// Only attempt to load and save game state in the browser environment
if (typeof window !== 'undefined') {
  // Initialize storage and then load game state
  initStorage().then(() => {
    loadGameState().then(storedState => {
      if (storedState) {
        gameState.set(storedState);
      }
    });
  });

  // Subscribe to changes in game state and save to storage
  gameState.subscribe(async (value) => {
    // Only save if the game is not in 'setup' and location is available,
    // or if it's explicitly finished (to save winner)
    if (value.gameStatus !== 'setup' || value.winner !== undefined) {
      await saveGameState(value);
    }
  });
}
