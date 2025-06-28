<!-- src/lib/components/LocationSetup.svelte -->

<script lang="ts">
	import { onMount } from 'svelte';
	import { dev } from '$app/environment';
	import { location } from '$lib/stores/location';
	import { gameState } from '$lib/stores/gameState';
	import type { LocationData } from '$lib/stores/gameState';
	import { clearGameState } from '$lib/utils/storage';

	let permissionStatus: 'prompt' | 'granted' | 'denied' | 'unavailable' = 'prompt';
	let errorMessage: string | null = null;
	let loadingLocation = !$location; // Initialize based on whether location is already set

	// Development flag to force Victoria, BC, Canada as location.
	// Set this to `true` in development to bypass GeoIP.
	let FORCE_VICTORIA = true;
	const USE_MOCK_LOCATION = dev && FORCE_VICTORIA;
	async function getIpGeolocation(): Promise<LocationData | null> {
		try {
			console.log('Requesting IP geolocation...');
			const response = await fetch('/api/ip-geocode');

			if (!response.ok) {
				throw new Error(`Failed to get location details: ${response.statusText}`);
			}

			const locationDetails = await response.json();
			if (locationDetails.error) {
				throw new Error(locationDetails.error);
			}

			const data: LocationData = {
				latitude: locationDetails.latitude,
				longitude: locationDetails.longitude,
				city: locationDetails.city,
				region: locationDetails.region,
				country: locationDetails.country,
				displayName: locationDetails.displayName
			};
			return data;
		} catch (error: any) {
			console.error('IP Geolocation request failed:', error);
			errorMessage = `Error getting location: ${error.message}. Defaulting to London.`;
			return null;
		}
	}

	async function requestGeolocation() {
		loadingLocation = true;
		errorMessage = null;

		try {
			let data: LocationData | null = null;

			if (USE_MOCK_LOCATION) {
				console.warn('Using mock location data for development.');
				data = {
					latitude: 48.4284, // Default mock latitude (Victoria, BC)
					longitude: -123.3656, // Default mock longitude (Victoria, BC)
					city: 'Victoria',
					region: 'BC',
					country: 'Canada',
					displayName: `Victoria, BC, Canada (Mock)`
				};
				permissionStatus = 'granted';
			} else {
				// Only use IP geolocation
				data = await getIpGeolocation();
			}

			if (data) {
				location.set(data);
				gameState.update((state) => ({
					...state,
					location: data,
					gameStatus: 'playing'
				}));
				permissionStatus = 'granted';
			} else {
				// Fallback to London if IP geolocation fails
				const londonLocation = {
					latitude: 51.5074,
					longitude: 0.1278,
					city: 'London',
					region: 'England',
					country: 'United Kingdom',
					displayName: 'London, England, United Kingdom (Default)'
				};
				location.set(londonLocation);
				gameState.update((state) => ({
					...state,
					location: londonLocation,
					gameStatus: 'playing'
				}));
				permissionStatus = 'denied'; // Indicate that a real location couldn't be obtained
				errorMessage = errorMessage || 'Could not determine your location. Defaulting to London.';
			}
		} finally {
			loadingLocation = false;
		}
	}

	onMount(async () => {
		// Clear existing location data from store and storage on mount
		// This ensures a fresh geolocation attempt each time the component mounts,
		// preventing cached incorrect locations from persisting.
		location.set(null);
		await clearGameState(); // Clear the entire game state to ensure location is reset

		requestGeolocation();
	});
</script>

<div class="question-card">
	{#if permissionStatus === 'prompt' || permissionStatus === 'unavailable'}
		<p class="question-text">
			To start the game, we are determining your approximate location to generate local trivia
			questions.
		</p>
		{#if errorMessage}
			<p class="feedback-area incorrect">{errorMessage}</p>
		{/if}
		<button on:click={requestGeolocation} disabled={loadingLocation} class="next-question-button">
			{#if loadingLocation}
				Getting Location...
			{:else}
				Get Location
			{/if}
		</button>
	{:else if permissionStatus === 'granted' && $location}
		<p class="question-text">Location Set! Generating questions for: {$location.displayName}</p>
		<!-- Game will transition to 'playing' state via gameState store update -->
	{:else if permissionStatus === 'denied'}
		<p class="question-text">
			{errorMessage || 'Could not determine your location. Defaulting to London, England.'}
		</p>
		<button on:click={requestGeolocation} class="next-question-button">Try Again</button>
	{/if}
</div>
