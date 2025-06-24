import { writable } from 'svelte/store';
import type { LocationData } from './gameState';

export const location = writable<LocationData | null>(null);
