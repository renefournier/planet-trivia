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
    // If current player answered correctly, they keep playing
    return currentPlayer;
  } else {
    // If current player answered incorrectly, switch to the other player
    return currentPlayer === 1 ? 2 : 1;
  }
}

/**
 * Returns the display name for a given category.
 * @param category The category type.
 * @returns A string representing the display name.
 */
export function getCategoryDisplayName(category: CategoryType): string {
  switch (category) {
    case CATEGORIES.GEOGRAPHY: return 'Geography';
    case CATEGORIES.ENTERTAINMENT: return 'Entertainment';
    case CATEGORIES.HISTORY: return 'History';
    case CATEGORIES.ARTS: return 'Arts & Literature';
    case CATEGORIES.SCIENCE: return 'Science & Nature';
    case CATEGORIES.SPORTS: return 'Sports & Leisure';
    default: return 'Unknown';
  }
}

/**
 * Calculates the coordinates for a point on a circle.
 * @param angleInDegrees The angle in degrees (0 at 3 o'clock, clockwise positive).
 * @param radius The radius of the circle.
 * @param centerX The x-coordinate of the circle's center.
 * @param centerY The y-coordinate of the circle's center.
 * @returns An object with x and y coordinates.
 */
function polarToCartesian(angleInDegrees: number, radius: number, centerX: number, centerY: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0; // Adjust for 12 o'clock start

  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

/**
 * Returns the SVG path for a pie segment.
 * @param category The category type.
 * @param totalSegments The total number of segments in the pie (default 6).
 * @returns A string representing the SVG path data.
 */
export function getSegmentPath(category: CategoryType, totalSegments: number = 6): string {
  const segmentAngle = 360 / totalSegments;
  const radius = 45; // Corresponds to r="45" in the circle elements
  const centerX = 50;
  const centerY = 50;

  // Determine the start and end angles for the given category
  let startAngle = 0;
  switch (category) {
    case CATEGORIES.GEOGRAPHY: startAngle = 0; break;
    case CATEGORIES.ENTERTAINMENT: startAngle = 60; break;
    case CATEGORIES.HISTORY: startAngle = 120; break;
    case CATEGORIES.ARTS: startAngle = 180; break;
    case CATEGORIES.SCIENCE: startAngle = 240; break;
    case CATEGORIES.SPORTS: startAngle = 300; break;
    default: return ''; // Should not happen with valid categories
  }
  const endAngle = startAngle + segmentAngle;

  const start = polarToCartesian(startAngle, radius, centerX, centerY);
  const end = polarToCartesian(endAngle, radius, centerX, centerY);

  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  const sweepFlag = '1'; // Clockwise

  return [
    `M ${centerX},${centerY}`, // Move to center
    `L ${start.x},${start.y}`, // Line to start of arc
    `A ${radius},${radius} 0 ${largeArcFlag},${sweepFlag} ${end.x},${end.y}`, // Arc
    `Z` // Close path back to center
  ].join(' ');
}

/**
 * Returns a simple icon for a given category.
 * @param category The category type.
 * @returns A string representing an emoji icon.
 */
export function getCategoryIcon(category: CategoryType): string {
  switch (category) {
    case CATEGORIES.GEOGRAPHY: return '🌍';
    case CATEGORIES.ENTERTAINMENT: return '🎭';
    case CATEGORIES.HISTORY: return '📜';
    case CATEGORIES.ARTS: return '🎨';
    case CATEGORIES.SCIENCE: return '🔬';
    case CATEGORIES.SPORTS: return '🏅';
    default: return '❓';
  }
}

/**
 * Returns the standard Trivial Pursuit color for a given category.
 * @param category The category type.
 * @returns A string representing the color.
 */
export function getCategoryColor(category: CategoryType): string {
  switch (category) {
    case CATEGORIES.GEOGRAPHY: return '#4285F4'; // Blue
    case CATEGORIES.ENTERTAINMENT: return '#EA4335'; // Pink
    case CATEGORIES.HISTORY: return '#FBBC04'; // Yellow
    case CATEGORIES.ARTS: return '#9C27B0'; // Purple
    case CATEGORIES.SCIENCE: return '#34A853'; // Green
    case CATEGORIES.SPORTS: return '#FF9800'; // Orange
    default: return '#808080'; // Gray for unknown
  }
}
