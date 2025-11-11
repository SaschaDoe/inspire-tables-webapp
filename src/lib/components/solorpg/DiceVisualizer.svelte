<script lang="ts">
	// Dice rolling visualization component
	// Shows animated dice rolls with results

	interface Props {
		diceType: 'd4' | 'd6' | 'd8' | 'd10' | 'd100' | '2d10';
		result?: number;
		isRolling?: boolean;
		size?: 'small' | 'medium' | 'large';
		showLabel?: boolean;
	}

	let {
		diceType,
		result = undefined,
		isRolling = false,
		size = 'medium',
		showLabel = true
	}: Props = $props();

	// Animation frames for rolling effect
	let animatedValue = $state(result || 0);
	let animationFrame = $state(0);

	$effect(() => {
		if (isRolling) {
			// Animate random numbers while rolling
			const interval = setInterval(() => {
				animationFrame = (animationFrame + 1) % 10;
				// Show random values during animation
				if (diceType === 'd100') {
					animatedValue = Math.floor(Math.random() * 100) + 1;
				} else if (diceType === '2d10') {
					animatedValue = Math.floor(Math.random() * 19) + 2;
				} else {
					const max = parseInt(diceType.substring(1));
					animatedValue = Math.floor(Math.random() * max) + 1;
				}
			}, 100);

			return () => clearInterval(interval);
		} else if (result !== undefined) {
			// Show final result
			animatedValue = result;
		}
	});

	const sizeClasses = {
		small: 'w-12 h-12 text-2xl',
		medium: 'w-20 h-20 text-4xl',
		large: 'w-32 h-32 text-6xl'
	};

	const diceEmojis: Record<string, string> = {
		'd4': '🎲',
		'd6': '🎲',
		'd8': '🎲',
		'd10': '🎲',
		'd100': '🎲',
		'2d10': '🎲🎲'
	};
</script>

<div class="dice-visualizer flex flex-col items-center gap-2">
	<!-- Dice Display -->
	<div
		class="dice-container {sizeClasses[size]} {isRolling ? 'rolling' : ''} flex items-center justify-center bg-gradient-to-br from-orange-600 to-red-600 rounded-xl shadow-lg transition-all duration-300 {isRolling ? 'animate-bounce scale-110' : ''}"
	>
		{#if isRolling}
			<span class="dice-emoji animate-spin">{diceEmojis[diceType]}</span>
		{:else if result !== undefined}
			<span class="text-white font-bold">{animatedValue}</span>
		{:else}
			<span class="dice-emoji">{diceEmojis[diceType]}</span>
		{/if}
	</div>

	<!-- Label -->
	{#if showLabel}
		<div class="text-center">
			<span class="text-sm text-orange-300">{diceType}</span>
			{#if result !== undefined && !isRolling}
				<div class="text-xs text-slate-400">Result: {result}</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.dice-visualizer {
		user-select: none;
	}

	.dice-container {
		position: relative;
	}

	.rolling {
		animation: roll 0.5s ease-in-out infinite;
	}

	@keyframes roll {
		0%, 100% {
			transform: rotate(0deg);
		}
		25% {
			transform: rotate(-10deg);
		}
		75% {
			transform: rotate(10deg);
		}
	}

	.dice-emoji {
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
	}
</style>
