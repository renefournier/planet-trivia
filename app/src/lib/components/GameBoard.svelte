<script lang="ts">
	import { gameState, resetGame } from '$lib/stores/gameState';
	import PlayerPie from './PlayerPie.svelte';
	import LocationSetup from './LocationSetup.svelte';
	import QuestionCard from './QuestionCard.svelte';
	import { currentQuestionCard } from '$lib/stores/questions';
	import { location } from '$lib/stores/location';
	import type { QuestionCard as QuestionCardType } from '$lib/stores/gameState';

	async function generateNewQuestionCard(currentLocation: any, usedQuestionIds: Set<string>) {
		try {
			const response = await fetch('/api/generate-questions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					location: currentLocation,
					usedQuestionIds: Array.from(usedQuestionIds)
				})
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data: { card: QuestionCardType } = await response.json();
			currentQuestionCard.set(data.card);
		} catch (error) {
			console.error('Error generating question card:', error);
			// Handle error, e.g., display a message to the user
		}
	}

	// Effect to generate a new question card when game status changes to 'playing'
	// or when currentCard becomes null (indicating a new card is needed)
	$: if ($gameState.gameStatus === 'playing' && !$currentQuestionCard && $location) {
		generateNewQuestionCard($location, $gameState.usedQuestions);
	}
</script>

<main class="game-board">
	{#if $gameState.gameStatus === 'setup'}
		<LocationSetup />
	{:else if $gameState.gameStatus === 'playing'}
		<div class="players-container">
			<PlayerPie playerState={$gameState.players.player1} />
			<PlayerPie playerState={$gameState.players.player2} />
		</div>
		<QuestionCard />
		<div class="turn-indicator">
			Current Player: {$gameState.currentPlayer === 1
				? $gameState.players.player1.name
				: $gameState.players.player2.name}
		</div>
	{:else if $gameState.gameStatus === 'finished'}
		<div class="game-finished">
			<h2>Game Over!</h2>
			{#if $gameState.winner}
				<p>
					{$gameState.winner === 1
						? $gameState.players.player1.name
						: $gameState.players.player2.name} wins!
				</p>
			{/if}
			<button on:click={resetGame}>Play Again</button>
		</div>
	{/if}
</main>

<style>
	.game-board {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20px;
		gap: 20px;
	}

	.players-container {
		display: flex;
		justify-content: space-around;
		width: 100%;
		max-width: 800px;
	}

	.turn-indicator {
		font-size: 1.5em;
		margin-top: 20px;
	}

	.game-finished {
		text-align: center;
	}
</style>
