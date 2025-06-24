<script lang="ts">
	import type { PlayerState } from '$lib/stores/gameState';
	import { getCategoryColor } from '$lib/utils/gameLogic';
	import { CATEGORY_LIST } from '$lib/utils/constants';

	export let playerState: PlayerState;
</script>

<div class="player-pie">
	<h3>{playerState.name}</h3>
	<div class="pie-segments">
		{#each CATEGORY_LIST as category}
			<div
				class="segment"
				class:filled={playerState.pieSegments[category]}
				style="background-color: {getCategoryColor(category)};"
			>
				{category.charAt(0).toUpperCase()}
			</div>
		{/each}
	</div>
	<p>Segments Filled: {Object.values(playerState.pieSegments).filter(Boolean).length} / 6</p>
</div>

<style>
	.player-pie {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		border: 1px solid #ccc;
		padding: 15px;
		border-radius: 8px;
		width: 200px;
	}

	.pie-segments {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: repeat(2, 1fr);
		gap: 5px;
		width: 150px;
		height: 100px;
		border: 1px dashed #eee;
		padding: 5px;
	}

	.segment {
		width: 45px;
		height: 45px;
		display: flex;
		justify-content: center;
		align-items: center;
		color: white;
		font-weight: bold;
		border-radius: 50%; /* Make them circular */
		opacity: 0.5; /* Unfilled state */
	}

	.segment.filled {
		opacity: 1; /* Filled state */
		border: 2px solid white;
	}
</style>
