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

			if (!navigator.geolocation) {
				console.warn('Geolocation is not supported by this browser. Using mock location data.');
				permissionStatus = 'unavailable';
				latitude = 48.4284; // Default mock latitude
				longitude = -123.3656; // Default mock longitude
				data = {
					latitude,
					longitude,
					city: 'Mock City',
					region: 'Mock Region',
					country: 'Mock Country',
					displayName: `Mock City, Mock Region, Mock Country (Fallback)`
				};
				console.log('Using mock location data:', data);
			} else {
				try {
					// Add timeout to geolocation request to prevent hanging
					const position = await Promise.race([
						new Promise<GeolocationPosition>((resolve, reject) => {
							navigator.geolocation.getCurrentPosition(resolve, reject, {
								timeout: 10000, // 10 second timeout
								enableHighAccuracy: false,
								maximumAge: 300000 // 5 minutes
							});
						}),
						new Promise<never>((_, reject) => {
							setTimeout(() => reject(new Error('Geolocation timeout')), 10000);
						})
					]);

					latitude = position.coords.latitude;
					longitude = position.coords.longitude;

					const response = await fetch(`/api/reverse-geocode?lat=${latitude}&lng=${longitude}`);
					if (!response.ok) {
						throw new Error(`HTTP error! status: ${response.status}`);
					}
					data = await response.json();
					console.log('Location obtained via geolocation:', data);
				} catch (geoError) {
					console.warn('Geolocation failed or timed out, using mock location data:', geoError);
					// Fall back to mock data if geolocation fails
					permissionStatus = 'unavailable';
					latitude = 48.4284; // Default mock latitude
					longitude = -123.3656; // Default mock longitude
					data = {
						latitude,
						longitude,
						city: 'Mock City',
						region: 'Mock Region',
						country: 'Mock Country',
						displayName: `Mock City, Mock Region, Mock Country (Fallback)`
					};
					console.log('Using mock location data after geolocation failure:', data);
				}
			}

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

<div class="location-setup">
	{#if permissionStatus === 'prompt' || permissionStatus === 'unavailable'}
		<h2>Welcome to Planet Trivia!</h2>
		<p>To start the game, we need your location to generate local trivia questions.</p>
		{#if errorMessage}
			<p class="error-message">{errorMessage}</p>
		{/if}
		<button on:click={requestGeolocation} disabled={loadingLocation}>
			{#if loadingLocation}
				Getting Location...
			{:else}
				Allow Geolocation
			{/if}
		</button>
	{:else if permissionStatus === 'granted' && $location}
		<h2>Location Set!</h2>
		<p>Generating questions for: {$location.displayName}</p>
		<!-- Game will transition to 'playing' state via gameState store update -->
	{:else if permissionStatus === 'denied'}
		<h2>Location Access Denied</h2>
		<p>{errorMessage || 'Please enable location services in your browser settings to play.'}</p>
		<button on:click={requestGeolocation}>Try Again</button>
	{/if}
</div>

<style>
	.location-setup {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 30px;
		border: 1px solid #eee;
		border-radius: 10px;
		background-color: #fff;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		max-width: 500px;
		margin: 50px auto;
	}

	h2 {
		color: #333;
		margin-bottom: 15px;
	}

	p {
		color: #666;
		margin-bottom: 20px;
		line-height: 1.5;
	}

	button {
		background-color: #28a745;
		color: white;
		border: none;
		padding: 12px 25px;
		border-radius: 5px;
		font-size: 1.1em;
		cursor: pointer;
		transition: background-color 0.3s ease;
	}

	button:hover:not(:disabled) {
		background-color: #218838;
	}

	button:disabled {
		background-color: #94d3a2;
		cursor: not-allowed;
	}

	.error-message {
		color: #dc3545;
		font-weight: bold;
		margin-top: 10px;
	}
</style>
