<script lang="ts">
	import { gameState, resetGame } from '$lib/stores/gameState';
	import { get } from 'svelte/store';
	import PlayerPie from './PlayerPie.svelte';
	import LocationSetup from './LocationSetup.svelte';
	import QuestionCard from './QuestionCard.svelte';
	import { currentQuestionCard } from '$lib/stores/questions';
	import { location } from '$lib/stores/location';
	import type { QuestionCard as QuestionCardType, CategoryType } from '$lib/stores/gameState';
	import { CATEGORIES } from '$lib/utils/constants';
	import { checkWinCondition } from '$lib/utils/gameLogic';
	import { onMount } from 'svelte';
	import { getCategoryColor } from '$lib/utils/gameLogic';
	import { getSegmentPath } from '$lib/utils/gameLogic';
	import { getCategoryDisplayName } from '$lib/utils/gameLogic';
	import { getCategoryIcon } from '$lib/utils/gameLogic';
	import { currentQuestion } from '$lib/stores/questions';
	import { advanceTurn } from '$lib/utils/gameLogic';

	let feedbackMessage: string = '';
	let selectedAnswer: string | null = null;
	let answeredCorrectly: boolean | null = null;

	function handleAnswer(answer: string) {
		const question = get(currentQuestion);
		if (!question) return;

		selectedAnswer = answer;
		if (answer === question.correctAnswer) {
			feedbackMessage = `✓ Correct! Player ${get(gameState).currentPlayer}'s turn`;
			answeredCorrectly = true;
			// Update game state for correct answer
			gameState.update((state) => {
				const player = state.players[`player${state.currentPlayer}`];
				if (question) {
					player.pieSegments[question.category] = true;
				}
				// Check for win condition
				if (checkWinCondition(player)) {
					state.gameStatus = 'finished';
					state.winner = state.currentPlayer;
				}
				return state;
			});
		} else {
			feedbackMessage = `Incorrect. The correct answer was: ${question.correctAnswer}. Player ${get(gameState).currentPlayer === 1 ? 2 : 1}'s turn`;
			answeredCorrectly = false;
		}
	}

	function nextQuestion() {
		const wasCorrect = answeredCorrectly;

		feedbackMessage = '';
		selectedAnswer = null;
		answeredCorrectly = null;

		gameState.update((state) => {
			const question = get(currentQuestion);
			const card = get(currentQuestionCard);
			// Add current question to used questions
			if (question) {
				state.usedQuestions.add(question.id);
			}

			// Ensure answeredCorrectly is a boolean for advanceTurn
			const wasAnswerCorrect = wasCorrect === true;
			let nextPlayer: 1 | 2 = advanceTurn(state.currentPlayer, wasAnswerCorrect);
			let nextQuestionIndex = state.currentQuestionIndex;

			// Always advance to the next question on the card, regardless of correctness.
			nextQuestionIndex++;

			// If all questions on the card are exhausted, set currentCard to null to trigger new card generation
			if (card && nextQuestionIndex >= card.questions.length) {
				currentQuestionCard.set(null);
				nextQuestionIndex = 0; // Reset index for new card
				currentQuestion.set(null); // Explicitly clear current question
			}

			state.currentPlayer = nextPlayer;
			state.currentQuestionIndex = nextQuestionIndex;

			return state;
		});
	}

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
		<div class="scrollable-content">
			<div class="player-pies-container">
				<PlayerPie
					playerState={$gameState.players.player1}
					isActive={$gameState.currentPlayer === 1}
				/>
				<PlayerPie
					playerState={$gameState.players.player2}
					isActive={$gameState.currentPlayer === 2}
				/>
			</div>

			<!-- Question Area -->
			<QuestionCard {handleAnswer} {selectedAnswer} {answeredCorrectly} />
		</div>

		<footer class="controls">
			<div class="feedback-area">{feedbackMessage}</div>
			<button
				class="next-question-button"
				on:click={nextQuestion}
				disabled={selectedAnswer === null}>Next Question →</button
			>
		</footer>
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
			<button on:click={resetGame} class="next-question-button">Play Again</button>
		</div>
	{/if}
</main>

<style>
	/* Styles moved to planet-trivia.css */
</style>
