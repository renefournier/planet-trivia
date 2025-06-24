import type { GameState, QuestionCard, PlayerState, LocationData } from '$lib/stores/gameState';
import type LocalForage from 'localforage';

const GAME_STATE_KEY = 'planet_trivia_game_state';

let localforageInstance: LocalForage | undefined;
let initPromise: Promise<void> | undefined;

export async function initStorage(): Promise<void> {
  if (initPromise) {
    return initPromise;
  }

  initPromise = new Promise(async (resolve, reject) => { // eslint-disable-line no-async-promise-executor
    if (typeof window === 'undefined') {
      console.warn('localforage is not available in SSR environment.');
      resolve();
      return;
    }
    try {
      const lf = await import('localforage');
      localforageInstance = lf.default;
      console.log('localforage initialized successfully.');
      resolve();
    } catch (error) {
      console.error('Failed to load localforage in browser environment:', error);
      reject(error);
    }
  });
  return initPromise;
}

/**
 * Saves the current game state to localforage.
 * @param state The GameState object to save.
 */
export async function saveGameState(state: GameState): Promise<void> {
  await initStorage(); // Ensure localforage is initialized
  if (!localforageInstance) {
    console.warn('localforage not available, skipping saveGameState.');
    return;
  }
  try {
    const stateToSave = {
      ...state,
      usedQuestions: Array.from(state.usedQuestions),
      currentCard: state.currentCard ? {
        ...state.currentCard,
        generated: state.currentCard.generated.toISOString()
      } : null
    };
    await localforageInstance.setItem(GAME_STATE_KEY, stateToSave);
    console.log('Game state saved successfully.');
  } catch (error) {
    console.error('Error saving game state:', error);
  }
}

/**
 * Loads the game state from localforage.
 * @returns The loaded GameState object, or null if no state is found.
 */
export async function loadGameState(): Promise<GameState | null> {
  await initStorage(); // Ensure localforage is initialized
  if (!localforageInstance) {
    console.warn('localforage not available, skipping loadGameState.');
    return null;
  }
  try {
    const storedState = await localforageInstance.getItem<Partial<GameState>>(GAME_STATE_KEY);
    if (storedState) {
      const defaultPlayerState: PlayerState = {
        name: '',
        pieSegments: {
          geography: false, entertainment: false, history: false,
          arts: false, science: false, sports: false
        }
      };
      const defaultLocationData: LocationData = {
        latitude: 0, longitude: 0, city: '', region: '', country: '', displayName: ''
      };

      const defaultGameState: GameState = {
        players: { player1: defaultPlayerState, player2: defaultPlayerState },
        currentPlayer: 1,
        currentQuestionIndex: 0,
        currentCard: null,
        location: defaultLocationData,
        usedQuestions: new Set<string>(),
        gameStatus: 'setup',
        winner: undefined,
      };

      const loadedState: GameState = {
        ...defaultGameState,
        ...storedState,
        usedQuestions: new Set(storedState.usedQuestions || []),
        currentCard: storedState.currentCard ? {
          id: storedState.currentCard.id || '',
          location: storedState.currentCard.location || '',
          questions: storedState.currentCard.questions || [],
          generated: new Date(storedState.currentCard.generated || new Date())
        } as QuestionCard : null,
        players: {
          player1: { ...defaultPlayerState, ...storedState.players?.player1 },
          player2: { ...defaultPlayerState, ...storedState.players?.player2 },
        },
        location: { ...defaultLocationData, ...storedState.location },
      };

      console.log('Game state loaded successfully.');
      return loadedState;
    }
  } catch (error) {
    console.error('Error loading game state:', error);
  }
  return null;
}

/**
 * Clears the saved game state from localforage.
 */
export async function clearGameState(): Promise<void> {
  await initStorage(); // Ensure localforage is initialized
  if (!localforageInstance) {
    console.warn('localforage not available, skipping clearGameState.');
    return;
  }
  try {
    await localforageInstance.removeItem(GAME_STATE_KEY);
    console.log('Game state cleared successfully.');
  } catch (error) {
    console.error('Error clearing game state:', error);
  }
}
