<script lang="ts">
	import { gameState } from '$lib/stores/gameState';
	import { currentQuestion, currentQuestionCard } from '$lib/stores/questions';
	import type { Question } from '$lib/stores/gameState';
	import { checkWinCondition, advanceTurn } from '$lib/utils/gameLogic';
	import { CATEGORY_NAMES } from '$lib/utils/constants';

	let selectedAnswer: string | null = null;
	let feedbackMessage: string = '';
	let answeredCorrectly: boolean | null = null;

	$: question = $currentQuestion;
	$: card = $currentQuestionCard;

	function handleAnswer(answer: string) {
		if (!question) return;

		selectedAnswer = answer;
		if (answer === question.correctAnswer) {
			feedbackMessage = 'Correct!';
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
			feedbackMessage = `Incorrect. The correct answer was: ${question.correctAnswer}`;
			answeredCorrectly = false;
		}
	}

	function nextQuestion() {
		const wasCorrect = answeredCorrectly;

		feedbackMessage = '';
		selectedAnswer = null;
		answeredCorrectly = null;

		gameState.update((state) => {
			// Add current question to used questions
			if (question) {
				state.usedQuestions.add(question.id);
			}

			// Ensure answeredCorrectly is a boolean for advanceTurn
			const wasAnswerCorrect = wasCorrect === true;
			let nextPlayer: 1 | 2 = advanceTurn(state.currentPlayer, wasAnswerCorrect);
			let nextQuestionIndex = state.currentQuestionIndex;

			// If the current player answered correctly, advance to the next question on the card.
			// If they answered incorrectly, the question remains the same for the next player.
			if (wasAnswerCorrect) {
				nextQuestionIndex++;
			}

			// If all questions on the card are exhausted, set currentCard to null to trigger new card generation
			if (card && nextQuestionIndex >= card.questions.length) {
				currentQuestionCard.set(null);
				nextQuestionIndex = 0; // Reset index for new card
			}

			state.currentPlayer = nextPlayer;
			state.currentQuestionIndex = nextQuestionIndex;

			// Update current question based on new index and card
			if ($currentQuestionCard && $currentQuestionCard.questions[state.currentQuestionIndex]) {
				currentQuestion.set($currentQuestionCard.questions[state.currentQuestionIndex]);
			} else {
				currentQuestion.set(null); // No more questions on this card or new card needed
			}

			return state;
		});
	}

	// Effect to update currentQuestion when currentCard or currentQuestionIndex changes
	$: if (
		$currentQuestionCard &&
		$gameState.currentQuestionIndex < $currentQuestionCard.questions.length
	) {
		currentQuestion.set($currentQuestionCard.questions[$gameState.currentQuestionIndex]);
	} else {
		currentQuestion.set(null);
	}
</script>

<div class="question-card">
	{#if question}
		<p class="category">{CATEGORY_NAMES[question.category].toUpperCase()}</p>
		<p class="question-text">{question.question}</p>
		<div class="options">
			{#each question.options as option}
				<button
					on:click={() => handleAnswer(option)}
					disabled={selectedAnswer !== null}
					class:selected={selectedAnswer === option}
					class:correct={answeredCorrectly === true && selectedAnswer === option}
					class:incorrect={answeredCorrectly === false && selectedAnswer === option}
				>
					{option}
				</button>
			{/each}
		</div>
		{#if feedbackMessage}
			<p class="feedback" class:correct={answeredCorrectly} class:incorrect={!answeredCorrectly}>
				{feedbackMessage}
			</p>
			<button on:click={nextQuestion}>Next Question</button>
		{/if}
	{:else}
		<p>Loading question...</p>
	{/if}
</div>

<style>
	.question-card {
		background-color: #f9f9f9;
		border: 1px solid #ddd;
		border-radius: 8px;
		padding: 20px;
		width: 100%;
		max-width: 600px;
		text-align: center;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.category {
		font-size: 1.2em;
		font-weight: bold;
		color: #555;
		margin-bottom: 10px;
	}

	.question-text {
		font-size: 1.8em;
		margin-bottom: 20px;
		color: #333;
	}

	.options {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-bottom: 20px;
	}

	.options button {
		background-color: #007bff;
		color: white;
		border: none;
		padding: 12px 20px;
		border-radius: 5px;
		font-size: 1.1em;
		cursor: pointer;
		transition: background-color 0.3s ease;
	}

	.options button:hover:not(:disabled) {
		background-color: #0056b3;
	}

	.options button:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.options button.selected {
		border: 2px solid #000;
	}

	.options button.correct {
		background-color: #28a745; /* Green for correct */
	}

	.options button.incorrect {
		background-color: #dc3545; /* Red for incorrect */
	}

	.feedback {
		font-size: 1.3em;
		margin-top: 15px;
		font-weight: bold;
	}

	.feedback.correct {
		color: #28a745;
	}

	.feedback.incorrect {
		color: #dc3545;
	}
</style>
