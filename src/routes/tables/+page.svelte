<script lang="ts">
	import { tableMetadata } from '$lib/data/tableMetadata.generated';
	import type { TableType } from '$lib/tables/tableType';
	import { onMount } from 'svelte';

	let activeCategory = $state<TableType | null>(null);
	let categoryRefs: Map<TableType, HTMLElement> = new Map();
	let scrollContainer: HTMLElement;

	function setCategoryRef(node: HTMLElement, categoryType: TableType) {
		categoryRefs.set(categoryType, node);
		return {
			destroy() {
				categoryRefs.delete(categoryType);
			}
		};
	}

	onMount(() => {
		// Set up intersection observer for scroll-based category highlighting
		const options = {
			root: scrollContainer,
			rootMargin: '-20% 0px -70% 0px',
			threshold: 0
		};

		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					const categoryType = entry.target.getAttribute('data-category') as TableType;
					if (categoryType) {
						activeCategory = categoryType;
					}
				}
			});
		}, options);

		// Observe all category sections
		categoryRefs.forEach((element) => {
			observer.observe(element);
		});

		return () => observer.disconnect();
	});

	function scrollToCategory(categoryType: TableType) {
		const element = categoryRefs.get(categoryType);
		if (element && scrollContainer) {
			const offsetTop = element.offsetTop - scrollContainer.offsetTop - 20;
			scrollContainer.scrollTo({
				top: offsetTop,
				behavior: 'smooth'
			});
		}
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
	<!-- Header -->
	<div class="bg-slate-900/50 border-b border-purple-500/20 sticky top-0 z-10 backdrop-blur">
		<div class="container mx-auto px-4 py-4">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-3xl font-bold text-white">All Tables</h1>
					<p class="text-purple-200 text-sm mt-1">Browse and roll on all available tables</p>
				</div>
				<a
					href="/"
					class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
				>
					Back to Home
				</a>
			</div>
		</div>
	</div>

	<div class="container mx-auto px-4 py-8 max-w-7xl">
		<div class="flex gap-8">
			<!-- Left Sidebar - Categories -->
			<aside class="w-64 flex-shrink-0 sticky top-24 self-start">
				<div class="bg-slate-800/50 backdrop-blur rounded-lg p-4 border border-purple-500/20">
					<h2 class="text-lg font-semibold text-white mb-4">Categories</h2>
					<nav class="space-y-1">
						{#each tableMetadata as category}
							<button
								onclick={() => scrollToCategory(category.type)}
								class="w-full text-left px-3 py-2 rounded-md transition-all {activeCategory ===
								category.type
									? 'bg-purple-600 text-white font-medium'
									: 'text-purple-200 hover:bg-slate-700/50'}"
							>
								<div class="flex items-center justify-between">
									<span>{category.type}</span>
									<span class="text-xs opacity-70">({category.tables.length})</span>
								</div>
							</button>
						{/each}
					</nav>
				</div>
			</aside>

			<!-- Right Side - Tables List -->
			<main class="flex-1 min-w-0">
				<div
					bind:this={scrollContainer}
					class="space-y-8 max-h-[calc(100vh-200px)] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-slate-800"
				>
					{#each tableMetadata as category}
						<section
							use:setCategoryRef={category.type}
							data-category={category.type}
							class="scroll-mt-4"
						>
							<div class="mb-4">
								<h2 class="text-2xl font-bold text-white mb-2">{category.type}</h2>
								<p class="text-purple-200 text-sm">
									{category.tables.length} table{category.tables.length !== 1 ? 's' : ''} in this category
								</p>
							</div>

							<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{#each category.tables as tableInfo}
									<a
										href="/tables/{encodeURIComponent(tableInfo.title)}"
										class="block bg-slate-800/50 backdrop-blur rounded-lg p-4 border border-purple-500/20 hover:border-purple-500/40 hover:bg-slate-800/70 transition-all group"
									>
										<h3 class="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
											{tableInfo.title}
										</h3>
										<div class="flex items-center text-sm">
											<span class="text-purple-300 text-xs">
												Click to view and roll
											</span>
										</div>
									</a>
								{/each}
							</div>
						</section>
					{/each}
				</div>
			</main>
		</div>
	</div>
</div>

<style>
	/* Custom scrollbar styles */
	.scrollbar-thin::-webkit-scrollbar {
		width: 8px;
	}

	.scrollbar-thin::-webkit-scrollbar-track {
		background: rgb(30 41 59 / 0.5);
		border-radius: 4px;
	}

	.scrollbar-thin::-webkit-scrollbar-thumb {
		background: rgb(147 51 234);
		border-radius: 4px;
	}

	.scrollbar-thin::-webkit-scrollbar-thumb:hover {
		background: rgb(126 34 206);
	}
</style>
