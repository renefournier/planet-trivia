<script lang="ts">
	import GameBoard from '$lib/components/GameBoard.svelte';
	import { location } from '$lib/stores/location';
</script>

<div class="app-container">
	<header class="header">
		<div class="app-title">
			<span class="icon">🌍</span> Planet Trivia
		</div>
		<div class="location">
			<span class="icon">📍</span>
			{$location?.displayName || 'Loading Location...'}
		</div>
	</header>

	<GameBoard />
</div>

<style>
	/* Global styles are now in app.css */
</style>
