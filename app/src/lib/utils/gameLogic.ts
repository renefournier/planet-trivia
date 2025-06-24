import type { PlayerState } from '$lib/stores/gameState';
import { CATEGORIES, type CategoryType } from '$lib/utils/constants';

/**
 * Checks if a player has filled all 6 pie segments.
 * @param playerState The state of the player.
 * @returns True if all segments are filled, false otherwise.
 */
export function checkWinCondition(playerState: PlayerState): boolean {
  return Object.values(playerState.pieSegments).filter(Boolean).length === 6;
}

/**
 * Determines the next player based on the current player and whether the answer was correct.
 * @param currentPlayer The current player (1 or 2).
 * @param answeredCorrectly Whether the current player answered correctly.
 * @returns The player who should go next.
 */
export function advanceTurn(currentPlayer: 1 | 2, answeredCorrectly: boolean): 1 | 2 {
  if (answeredCorrectly) {
    // If current player answered correctly, next turn goes to the other player
    return currentPlayer === 1 ? 2 : 1;
  } else {
    // If current player answered incorrectly, the other player attempts the same question
    // So, the turn effectively stays with the current player for the next attempt,
    // but for the purpose of advancing the game loop, we switch to the other player
    // to give them a chance at the same question.
    return currentPlayer === 1 ? 2 : 1;
  }
}

/**
 * Returns the standard Trivial Pursuit color for a given category.
 * @param category The category type.
 * @returns A string representing the color.
 */
export function getCategoryColor(category: CategoryType): string {
  switch (category) {
    case CATEGORIES.GEOGRAPHY: return '#007bff'; // Blue
    case CATEGORIES.ENTERTAINMENT: return '#ff69b4'; // Pink
    case CATEGORIES.HISTORY: return '#ffd700'; // Yellow
    case CATEGORIES.ARTS: return '#800080'; // Purple
    case CATEGORIES.SCIENCE: return '#32cd32'; // Green
    case CATEGORIES.SPORTS: return '#ffa500'; // Orange
    default: return '#808080'; // Gray for unknown
  }
}
