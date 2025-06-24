<script lang="ts">
	import { gameState } from '$lib/stores/gameState';
	import { currentQuestion, currentQuestionCard } from '$lib/stores/questions';
	import type { Question, CategoryType } from '$lib/stores/gameState';
	import { advanceTurn, checkWinCondition, getCategoryDisplayName } from '$lib/utils/gameLogic';
	import { CATEGORIES } from '$lib/utils/constants';

	export let handleAnswer: (answer: string) => void;
	export let selectedAnswer: string | null = null;
	export let answeredCorrectly: boolean | null = null;

	$: question = $currentQuestion;
	$: card = $currentQuestionCard;
	$: currentCategory = question?.category;

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
		<div
			class="category-indicator"
			class:geography={currentCategory === CATEGORIES.GEOGRAPHY}
			class:entertainment={currentCategory === CATEGORIES.ENTERTAINMENT}
			class:history={currentCategory === CATEGORIES.HISTORY}
			class:arts-literature={currentCategory === CATEGORIES.ARTS}
			class:science-nature={currentCategory === CATEGORIES.SCIENCE}
			class:sports-leisure={currentCategory === CATEGORIES.SPORTS}
		>
			{getCategoryDisplayName(currentCategory as CategoryType)}
		</div>
		<p class="question-text">{question.question}</p>
		<div class="options-grid">
			{#each question.options as option, i}
				<button
					on:click={() => handleAnswer(option)}
					disabled={selectedAnswer !== null}
					class="option-button"
					class:selected={selectedAnswer === option}
					class:correct={answeredCorrectly === true && selectedAnswer === option}
					class:incorrect={answeredCorrectly === false && selectedAnswer === option}
				>
					<span
						class="option-prefix"
						class:geography={currentCategory === CATEGORIES.GEOGRAPHY}
						class:entertainment={currentCategory === CATEGORIES.ENTERTAINMENT}
						class:history={currentCategory === CATEGORIES.HISTORY}
						class:arts-literature={currentCategory === CATEGORIES.ARTS}
						class:science-nature={currentCategory === CATEGORIES.SCIENCE}
						class:sports-leisure={currentCategory === CATEGORIES.SPORTS}
					>
						{String.fromCharCode(65 + i)}
					</span>
					{option}
				</button>
			{/each}
		</div>
		<div class="round-counter">Round {$gameState.round}</div>
	{:else}
		<p>Loading question...</p>
	{/if}
</div>

<style>
	/* Styles moved to planet-trivia.css */
</style>
