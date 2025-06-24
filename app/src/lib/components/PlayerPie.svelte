<script lang="ts">
	import type { PlayerState, CategoryType } from '$lib/stores/gameState';
	import { CATEGORIES } from '$lib/utils/constants';
	import { getCategoryColor, getSegmentPath } from '$lib/utils/gameLogic';

	export let playerState: PlayerState;
	export let isActive: boolean = false;
</script>

<div class="player-section">
	<div class="player-pie">
		<svg viewBox="0 0 100 100" class="pie-chart">
			<!-- Empty segments (outlines) -->
			<circle
				cx="50"
				cy="50"
				r="45"
				fill="none"
				stroke="var(--color-geography)"
				stroke-width="10"
				stroke-dasharray="15 85"
				transform="rotate(-15 50 50)"
			></circle>
			<circle
				cx="50"
				cy="50"
				r="45"
				fill="none"
				stroke="var(--color-entertainment)"
				stroke-width="10"
				stroke-dasharray="15 85"
				transform="rotate(45 50 50)"
			></circle>
			<circle
				cx="50"
				cy="50"
				r="45"
				fill="none"
				stroke="var(--color-history)"
				stroke-width="10"
				stroke-dasharray="15 85"
				transform="rotate(105 50 50)"
			></circle>
			<circle
				cx="50"
				cy="50"
				r="45"
				fill="none"
				stroke="var(--color-arts-literature)"
				stroke-width="10"
				stroke-dasharray="15 85"
				transform="rotate(165 50 50)"
			></circle>
			<circle
				cx="50"
				cy="50"
				r="45"
				fill="none"
				stroke="var(--color-science-nature)"
				stroke-width="10"
				stroke-dasharray="15 85"
				transform="rotate(225 50 50)"
			></circle>
			<circle
				cx="50"
				cy="50"
				r="45"
				fill="none"
				stroke="var(--color-sports-leisure)"
				stroke-width="10"
				stroke-dasharray="15 85"
				transform="rotate(285 50 50)"
			></circle>

			<!-- Filled segments -->
			{#each Object.entries(playerState.pieSegments) as [category, filled]}
				{#if filled}
					<path
						class="segment filled"
						class:geography={category === CATEGORIES.GEOGRAPHY}
						class:entertainment={category === CATEGORIES.ENTERTAINMENT}
						class:history={category === CATEGORIES.HISTORY}
						class:arts-literature={category === CATEGORIES.ARTS}
						class:science-nature={category === CATEGORIES.SCIENCE}
						class:sports-leisure={category === CATEGORIES.SPORTS}
						d={getSegmentPath(category as CategoryType)}
					></path>
				{/if}
			{/each}
		</svg>
	</div>
	<div class="player-name" class:active-player={isActive}>
		{playerState.name}
	</div>
</div>

<style>
	/* Styles moved to planet-trivia.css */
</style>
