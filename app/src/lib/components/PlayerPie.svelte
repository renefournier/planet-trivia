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

			<!-- Base circle for the pie outline -->
			<circle cx="50" cy="50" r="45" class="pie-outline"></circle>

			<!-- Separator lines -->
			<line x1="50" y1="5" x2="50" y2="95" class="pie-separator"></line>
			<line x1="50" y1="5" x2="50" y2="95" class="pie-separator" transform="rotate(60 50 50)"
			></line>
			<line x1="50" y1="5" x2="50" y2="95" class="pie-separator" transform="rotate(120 50 50)"
			></line>
		</svg>
	</div>
	<div class="player-name" class:active-player={isActive}>
		{playerState.name}
	</div>
</div>

<style>
	/* Styles moved to planet-trivia.css */
</style>
