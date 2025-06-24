<script lang="ts">
	import { onMount } from 'svelte'; // Import onMount
	import { location } from '$lib/stores/location';
	import { gameState } from '$lib/stores/gameState';
	import type { LocationData } from '$lib/stores/gameState';

	let permissionStatus: 'prompt' | 'granted' | 'denied' | 'unavailable' = 'prompt';
	let errorMessage: string | null = null;
	let loadingLocation = false;

	async function requestGeolocation() {
		loadingLocation = true;
		errorMessage = null;

		try {
			let latitude: number;
			let longitude: number;
			let data: LocationData;

			// Force mock location for testing purposes
			console.warn('Forcing mock location data for testing.');
			permissionStatus = 'unavailable'; // Treat as unavailable to use mock data
			latitude = 48.4284; // Default mock latitude (Victoria, BC)
			longitude = -123.3656; // Default mock longitude (Victoria, BC)
			data = {
				latitude,
				longitude,
				city: 'Victoria',
				region: 'BC',
				country: 'Canada',
				displayName: `Victoria, BC, Canada (Mock)`
			};
			console.log('Using mock location data:', data);

			location.set(data);
			gameState.update((state) => ({
				...state,
				location: data,
				gameStatus: 'playing'
			}));
			permissionStatus = 'granted';
		} catch (error: any) {
			permissionStatus = 'denied';
			if (error.code === error.PERMISSION_DENIED) {
				errorMessage =
					'Geolocation permission denied. Please enable location services for this site.';
			} else {
				errorMessage = `Error getting location: ${error.message}`;
			}
			console.error('Geolocation request failed:', errorMessage, error);
		} finally {
			loadingLocation = false;
		}
	}

	// Call requestGeolocation on component mount
	onMount(() => {
		// Always try to get location if we don't have one yet
		if (!$location) {
			requestGeolocation();
		}
	});

	// Removed reactive statement as onMount handles initial call
</script>

<div class="question-card">
	{#if permissionStatus === 'prompt' || permissionStatus === 'unavailable'}
		<p class="question-text">
			To start the game, we need your location to generate local trivia questions.
		</p>
		{#if errorMessage}
			<p class="feedback-area incorrect">{errorMessage}</p>
		{/if}
		<button on:click={requestGeolocation} disabled={loadingLocation} class="next-question-button">
			{#if loadingLocation}
				Getting Location...
			{:else}
				Allow Geolocation
			{/if}
		</button>
	{:else if permissionStatus === 'granted' && $location}
		<p class="question-text">Location Set! Generating questions for: {$location.displayName}</p>
		<!-- Game will transition to 'playing' state via gameState store update -->
	{:else if permissionStatus === 'denied'}
		<p class="question-text">
			{errorMessage || 'Please enable location services in your browser settings to play.'}
		</p>
		<button on:click={requestGeolocation} class="next-question-button">Try Again</button>
	{/if}
</div>
