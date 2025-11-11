<script lang="ts">
	// Chaos Factor Panel Component
	// Manages the Chaos Factor (1-9) for Mythic GME

	import { soloRpgStore } from '$lib/stores/soloRpgStore.svelte';

	let chaosFactor = $derived(soloRpgStore.currentSession?.chaosFactor || 5);

	function increment() {
		soloRpgStore.incrementChaosFactor();
	}

	function decrement() {
		soloRpgStore.decrementChaosFactor();
	}

	function setCF(value: number) {
		soloRpgStore.updateChaosFactor(value);
	}

	// Visual properties based on CF level
	const cfColors = $derived.by(() => {
		if (chaosFactor <= 3) return 'from-blue-500 to-cyan-500';
		if (chaosFactor <= 6) return 'from-purple-500 to-pink-500';
		return 'from-orange-500 to-red-500';
	});

	const cfLabel = $derived.by(() => {
		if (chaosFactor <= 3) return 'Ordered';
		if (chaosFactor <= 6) return 'Balanced';
		return 'Chaotic';
	});

	const cfDescription = $derived.by(() => {
		if (chaosFactor <= 3) return 'Low chaos - predictable, controlled environment';
		if (chaosFactor <= 6) return 'Moderate chaos - balanced adventure';
		return 'High chaos - unpredictable, wild events';
	});
</script>

<div class="chaos-factor-panel bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/20 shadow-xl">
	<!-- Header -->
	<div class="text-center mb-4">
		<h3 class="text-xl font-bold text-white mb-1">Chaos Factor</h3>
		<p class="text-sm text-orange-300">{cfLabel}</p>
	</div>

	<!-- Large CF Display -->
	<div class="flex items-center justify-center mb-6">
		<div class="relative">
			<!-- Circular Gauge Background -->
			<svg width="160" height="160" class="transform -rotate-90">
				<!-- Background circle -->
				<circle
					cx="80"
					cy="80"
					r="70"
					fill="none"
					stroke="rgba(255, 255, 255, 0.1)"
					stroke-width="8"
				/>
				<!-- Progress circle -->
				<circle
					cx="80"
					cy="80"
					r="70"
					fill="none"
					stroke="url(#cfGradient)"
					stroke-width="8"
					stroke-linecap="round"
					stroke-dasharray="{(chaosFactor / 9) * 439.8} 439.8"
					class="transition-all duration-500"
				/>
				<!-- Gradient definition -->
				<defs>
					<linearGradient id="cfGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						{#if chaosFactor <= 3}
							<stop offset="0%" style="stop-color: rgb(59, 130, 246)" />
							<stop offset="100%" style="stop-color: rgb(6, 182, 212)" />
						{:else if chaosFactor <= 6}
							<stop offset="0%" style="stop-color: rgb(168, 85, 247)" />
							<stop offset="100%" style="stop-color: rgb(236, 72, 153)" />
						{:else}
							<stop offset="0%" style="stop-color: rgb(249, 115, 22)" />
							<stop offset="100%" style="stop-color: rgb(239, 68, 68)" />
						{/if}
					</linearGradient>
				</defs>
			</svg>

			<!-- CF Number -->
			<div class="absolute inset-0 flex items-center justify-center">
				<span class="text-6xl font-black text-white drop-shadow-lg">{chaosFactor}</span>
			</div>
		</div>
	</div>

	<!-- Controls -->
	<div class="flex items-center justify-center gap-4 mb-4">
		<button
			onclick={decrement}
			disabled={chaosFactor <= 1}
			class="w-12 h-12 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-2xl font-bold transition-colors shadow-lg hover:scale-105 active:scale-95 disabled:transform-none disabled:cursor-not-allowed"
			aria-label="Decrease Chaos Factor"
		>
			−
		</button>

		<button
			onclick={increment}
			disabled={chaosFactor >= 9}
			class="w-12 h-12 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-2xl font-bold transition-colors shadow-lg hover:scale-105 active:scale-95 disabled:transform-none disabled:cursor-not-allowed"
			aria-label="Increase Chaos Factor"
		>
			+
		</button>
	</div>

	<!-- Number Selector -->
	<div class="grid grid-cols-9 gap-1 mb-4">
		{#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as cf}
			<button
				onclick={() => setCF(cf)}
				class="h-8 rounded-lg text-sm font-medium transition-all {cf === chaosFactor
					? `bg-gradient-to-r ${cfColors} text-white shadow-lg scale-110`
					: 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white'}"
			>
				{cf}
			</button>
		{/each}
	</div>

	<!-- Description -->
	<div class="text-center">
		<p class="text-sm text-slate-400 leading-relaxed">
			{cfDescription}
		</p>
	</div>

	<!-- Impact Info -->
	<div class="mt-4 pt-4 border-t border-slate-700/50">
		<div class="text-xs text-slate-500 space-y-1">
			<div class="flex justify-between">
				<span>Random Event Chance:</span>
				<span class="text-orange-400 font-medium">{chaosFactor}/9</span>
			</div>
			<div class="flex justify-between">
				<span>Fate Question Impact:</span>
				<span class="text-orange-400 font-medium">{chaosFactor <= 3 ? 'Lower' : chaosFactor >= 7 ? 'Higher' : 'Normal'}</span>
			</div>
		</div>
	</div>

	<!-- Tooltip/Help -->
	<details class="mt-4 text-xs text-slate-500">
		<summary class="cursor-pointer hover:text-slate-400 transition-colors">
			What does Chaos Factor do?
		</summary>
		<div class="mt-2 p-3 bg-slate-800/50 rounded-lg space-y-2">
			<p>The Chaos Factor represents how chaotic and unpredictable your adventure is.</p>
			<ul class="list-disc list-inside space-y-1 ml-2">
				<li><strong>1-3:</strong> Ordered, predictable (fewer random events)</li>
				<li><strong>4-6:</strong> Balanced adventure</li>
				<li><strong>7-9:</strong> Chaotic, wild (more random events)</li>
			</ul>
			<p class="mt-2">It affects:</p>
			<ul class="list-disc list-inside space-y-1 ml-2">
				<li>Fate Question probabilities</li>
				<li>Random Event frequency (doubles ≤ CF)</li>
				<li>Scene alteration chances</li>
			</ul>
		</div>
	</details>
</div>

<style>
	details summary {
		list-style: none;
	}

	details summary::-webkit-details-marker {
		display: none;
	}
</style>
