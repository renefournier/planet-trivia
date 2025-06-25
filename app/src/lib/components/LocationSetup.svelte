<!-- src/lib/components/LocationSetup.svelte -->

<script lang="ts">
	import { onMount } from 'svelte';
	import { dev } from '$app/environment';
	import { location } from '$lib/stores/location';
	import { gameState } from '$lib/stores/gameState';
	import type { LocationData } from '$lib/stores/gameState';

	let permissionStatus: 'prompt' | 'granted' | 'denied' | 'unavailable' = 'prompt';
	let errorMessage: string | null = null;
	let loadingLocation = !$location; // Initialize based on whether location is already set

	// Development flag to enable/disable mock location
	const USE_MOCK_LOCATION = dev && false; // Set to false to use real location in dev

	async function requestGeolocation() {
		loadingLocation = true;
		errorMessage = null;

		try {
			let latitude: number;
			let longitude: number;
			let data: LocationData;

			// Use mock location only in development when flag is enabled
			if (USE_MOCK_LOCATION) {
				console.warn('Using mock location data for development.');
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
				console.log('Mock location data:', data);
			} else {
				// Use real geolocation
				console.log('Requesting real geolocation...');
				const position = await new Promise<GeolocationPosition>((resolve, reject) => {
					if (!navigator.geolocation) {
						reject(new Error('Geolocation is not supported by this browser.'));
						return;
					}

					const timeoutId = setTimeout(() => {
						reject(new Error('Geolocation request timed out'));
					}, 15000); // 15 second timeout

					navigator.geolocation.getCurrentPosition(
						(pos) => {
							clearTimeout(timeoutId);
							resolve(pos);
						},
						(err) => {
							clearTimeout(timeoutId);
							reject(err);
						},
						{
							enableHighAccuracy: false, // Changed to false for faster response
							timeout: 10000,
							maximumAge: 300000 // 5 minutes
						}
					);
				});

				latitude = position.coords.latitude;
				longitude = position.coords.longitude;
				console.log('Got coordinates:', { latitude, longitude });

				// Get location details via reverse geocoding
				console.log('Fetching location details...');
				const response = await fetch(`/api/reverse-geocode?lat=${latitude}&lng=${longitude}`);
				if (!response.ok) {
					throw new Error(`Failed to get location details: ${response.statusText}`);
				}

				const locationDetails = await response.json();
				if (locationDetails.error) {
					throw new Error(locationDetails.error);
				}

				data = {
					latitude,
					longitude,
					city: locationDetails.city,
					region: locationDetails.region,
					country: locationDetails.country,
					displayName: locationDetails.displayName
				};
				console.log('Real location data:', data);
			}

			location.set(data);
			gameState.update((state) => ({
				...state,
				location: data,
				gameStatus: 'playing'
			}));
			permissionStatus = 'granted';
		} catch (error: any) {
			console.error('Geolocation request failed:', error);
			permissionStatus = 'denied';
			if (error.code === 1 || error.code === error.PERMISSION_DENIED) {
				errorMessage =
					'Geolocation permission denied. Please enable location services for this site.';
			} else if (error.message?.includes('timeout')) {
				errorMessage = 'Location request timed out. Please try again or check your connection.';
			} else {
				errorMessage = `Error getting location: ${error.message}`;
			}
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
