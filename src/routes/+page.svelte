<script lang="ts">
	import { GenderTable } from '$lib/tables/charTables/genderTable';
	import { RaceTable } from '$lib/tables/charTables/raceTable';
	import { ProfessionTable } from '$lib/tables/charTables/professionTable';
	import { AlignmentTable } from '$lib/tables/charTables/alignmentTable';
	import { MonsterEncounterTypeTable } from '$lib/tables/monsterTables/monsterEncounterTypeTable';
	import { TreasureTable } from '$lib/tables/artefactTables/treasureTable';
	import type { Table } from '$lib/tables/table';
	import { Dice } from '$lib/utils/dice';

	interface FeaturedTable {
		table: Table;
		description: string;
		icon: string;
		color: string;
	}

	const featuredTables: FeaturedTable[] = [
		{
			table: new RaceTable(),
			description: 'Generate a random character race',
			icon: '🧙',
			color: 'from-blue-500 to-cyan-500'
		},
		{
			table: new ProfessionTable(),
			description: 'Roll a random profession',
			icon: '⚔️',
			color: 'from-green-500 to-emerald-500'
		},
		{
			table: new AlignmentTable(),
			description: 'Determine character alignment',
			icon: '⚖️',
			color: 'from-yellow-500 to-orange-500'
		},
		{
			table: new MonsterEncounterTypeTable(),
			description: 'Generate a monster encounter',
			icon: '👹',
			color: 'from-red-500 to-pink-500'
		},
		{
			table: new TreasureTable(),
			description: 'Roll for treasure',
			icon: '💎',
			color: 'from-purple-500 to-indigo-500'
		}
	];

	let results = $state<Map<string, string>>(new Map());
	let rollingTable = $state<string | null>(null);

	function rollTable(table: Table) {
		rollingTable = table.title;
		setTimeout(() => {
			const dice = new Dice();
			const result = table.roleWithCascade(dice);
			results.set(table.title, result.text);
			results = results;
			rollingTable = null;
		}, 500);
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
	<!-- Animated background elements -->
	<div class="absolute inset-0 overflow-hidden pointer-events-none">
		<div class="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
		<div class="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
		<div class="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
	</div>

	<div class="container mx-auto px-4 py-16 max-w-7xl relative z-10">
		<!-- Hero Header -->
		<div class="text-center mb-20 animate-fade-in">
			<div class="inline-block mb-6">
				<div class="text-8xl mb-4 animate-bounce-slow">🎲</div>
			</div>
			<h1 class="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-6 tracking-tight leading-tight">
				Inspire Tables
			</h1>
			<p class="text-2xl md:text-3xl text-purple-100 max-w-3xl mx-auto font-light leading-relaxed mb-8">
				Roll the dice. <span class="text-pink-400 font-semibold">Generate epic stories.</span>
			</p>
			<p class="text-lg text-purple-300 max-w-2xl mx-auto leading-relaxed">
				A powerful random table generator for tabletop RPGs with cascading results that create rich, interconnected narratives
			</p>
		</div>

		<!-- Quick Action Buttons -->
		<div class="flex justify-center gap-4 mb-20 flex-wrap">
			<a
				href="/workspace"
				class="group relative px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xl font-bold rounded-2xl shadow-2xl shadow-indigo-500/50 transition-all duration-300 hover:scale-105 hover:shadow-indigo-500/70"
			>
				<span class="relative z-10 flex items-center gap-3">
					<span class="text-3xl">🚀</span>
					<span>Open Workspace</span>
				</span>
			</a>
			<a
				href="/campaigns"
				class="group relative px-10 py-5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xl font-bold rounded-2xl shadow-2xl shadow-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-blue-500/70"
			>
				<span class="relative z-10 flex items-center gap-3">
					<span class="text-3xl">🎭</span>
					<span>Create Campaign</span>
				</span>
			</a>
			<a
				href="/solo-rpg"
				class="group relative px-10 py-5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white text-xl font-bold rounded-2xl shadow-2xl shadow-orange-500/50 transition-all duration-300 hover:scale-105 hover:shadow-orange-500/70"
			>
				<span class="relative z-10 flex items-center gap-3">
					<span class="text-3xl">🎮</span>
					<span>Play Solo RPG</span>
				</span>
			</a>
			<a
				href="/tables"
				class="group relative px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xl font-bold rounded-2xl shadow-2xl shadow-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-purple-500/70"
			>
				<span class="relative z-10 flex items-center gap-3">
					<span>Browse Tables</span>
					<svg class="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
					</svg>
				</span>
			</a>
		</div>

		<!-- Featured Tables Section -->
		<div class="mb-12">
			<h2 class="text-4xl md:text-5xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 mb-4">
				Quick Roll
			</h2>
			<p class="text-center text-purple-200 text-lg mb-12">
				Try these popular tables instantly
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
			{#each featuredTables as { table, description, icon, color }, index}
				<div class="group relative transform hover:scale-105 transition-all duration-300" style="animation-delay: {index * 100}ms">
					<!-- Glow effect -->
					<div class="absolute -inset-1 bg-gradient-to-r {color} rounded-2xl blur-lg opacity-25 group-hover:opacity-75 transition-opacity"></div>

					<!-- Card -->
					<div class="relative bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 hover:border-purple-400/40 transition-all shadow-xl">
						<!-- Icon -->
						<div class="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
							{icon}
						</div>

						<!-- Content -->
						<h3 class="text-2xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
							{table.title}
						</h3>
						<p class="text-purple-200 text-sm mb-3 leading-relaxed">{description}</p>

						<!-- Dice info -->
						<div class="flex items-center gap-2 mb-4">
							<span class="text-purple-400 text-xs font-mono bg-purple-900/30 px-3 py-1 rounded-full">
								🎲 {table.diceRole.toString()}
							</span>
							<span class="text-purple-400 text-xs">
								{table.entries.length} entries
							</span>
						</div>

						<!-- Roll Button -->
						<button
							onclick={() => rollTable(table)}
							disabled={rollingTable === table.title}
							class="w-full px-6 py-3 bg-gradient-to-r {color} hover:opacity-90 disabled:opacity-50 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none"
						>
							{#if rollingTable === table.title}
								<span class="flex items-center justify-center gap-2">
									<span class="animate-spin">🎲</span>
									<span>Rolling...</span>
								</span>
							{:else}
								Roll Now
							{/if}
						</button>

						<!-- Result Display -->
						{#if results.has(table.title)}
							<div class="mt-4 p-4 bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl border border-purple-400/30 animate-slide-in">
								<p class="text-sm font-bold text-purple-300 mb-2 flex items-center gap-2">
									<span>✨</span>
									<span>Result:</span>
								</p>
								<p class="text-white text-base font-medium leading-relaxed">{results.get(table.title)}</p>
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>

		<!-- How It Works Section -->
		<div class="mt-24 bg-gradient-to-br from-slate-900/50 to-purple-900/30 backdrop-blur-xl rounded-3xl p-10 border border-purple-500/20 shadow-2xl">
			<h2 class="text-4xl font-bold text-center text-white mb-12">How It Works</h2>
			<div class="grid md:grid-cols-3 gap-8">
				<div class="text-center group">
					<div class="text-6xl mb-4 group-hover:scale-110 transition-transform">📚</div>
					<div class="bg-purple-500/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
						<span class="text-2xl font-bold text-purple-400">1</span>
					</div>
					<h3 class="text-xl font-bold text-purple-300 mb-3">Choose a Table</h3>
					<p class="text-purple-100 leading-relaxed">Browse through dozens of themed tables organized by category - from characters to locations</p>
				</div>
				<div class="text-center group">
					<div class="text-6xl mb-4 group-hover:scale-110 transition-transform">🎲</div>
					<div class="bg-pink-500/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
						<span class="text-2xl font-bold text-pink-400">2</span>
					</div>
					<h3 class="text-xl font-bold text-pink-300 mb-3">Roll the Dice</h3>
					<p class="text-purple-100 leading-relaxed">Each table uses specific dice combinations (d6, 3d6, etc.) to generate unique results</p>
				</div>
				<div class="text-center group">
					<div class="text-6xl mb-4 group-hover:scale-110 transition-transform">✨</div>
					<div class="bg-blue-500/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
						<span class="text-2xl font-bold text-blue-400">3</span>
					</div>
					<h3 class="text-xl font-bold text-blue-300 mb-3">Get Results</h3>
					<p class="text-purple-100 leading-relaxed">Some entries cascade into other tables, creating complex and interconnected outcomes</p>
				</div>
			</div>
		</div>

		<!-- Footer CTA -->
		<div class="mt-16 text-center">
			<p class="text-purple-300 text-lg mb-4">Ready to inspire your next adventure?</p>
			<a href="/tables" class="text-pink-400 hover:text-pink-300 text-xl font-semibold underline decoration-2 underline-offset-4 transition-colors">
				Explore All Tables →
			</a>
		</div>
	</div>
</div>

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes slide-in {
		from {
			opacity: 0;
			transform: translateX(-10px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@keyframes bounce-slow {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-20px);
		}
	}

	.animate-fade-in {
		animation: fade-in 0.8s ease-out;
	}

	.animate-slide-in {
		animation: slide-in 0.3s ease-out;
	}

	.animate-bounce-slow {
		animation: bounce-slow 3s ease-in-out infinite;
	}

	.delay-500 {
		animation-delay: 500ms;
	}

	.delay-1000 {
		animation-delay: 1000ms;
	}
</style>
