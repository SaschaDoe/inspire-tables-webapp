<script lang="ts">
	import { tableMetadata } from '$lib/data/tableMetadata.generated';
	import type { TableType } from '$lib/tables/tableType';
	import type { TableMetadata } from '$lib/data/tableMetadata.generated';
	import { onMount } from 'svelte';

	let activeCategory = $state<TableType | null>(null);
	let categoryRefs: Map<TableType, HTMLElement> = new Map();
	let subcategoryRefs: Map<string, HTMLElement> = new Map();
	let scrollContainer: HTMLElement;
	let expandedCategories = $state<Set<TableType>>(new Set());

	// Group tables by subcategory within each category
	interface SubcategoryGroup {
		subcategory: string | null;
		tables: TableMetadata[];
	}

	const categoriesWithSubcategories = tableMetadata.map((category) => {
		const subcategoryMap = new Map<string | null, TableMetadata[]>();

		for (const table of category.tables) {
			const subcategory = table.subcategory || null;
			if (!subcategoryMap.has(subcategory)) {
				subcategoryMap.set(subcategory, []);
			}
			subcategoryMap.get(subcategory)!.push(table);
		}

		const groups: SubcategoryGroup[] = Array.from(subcategoryMap.entries())
			.map(([subcategory, tables]) => ({ subcategory, tables }))
			.sort((a, b) => {
				// Put null (no subcategory) first
				if (a.subcategory === null) return -1;
				if (b.subcategory === null) return 1;
				return a.subcategory.localeCompare(b.subcategory);
			});

		// Get unique subcategories (excluding null)
		const subcategories = groups
			.filter((g) => g.subcategory !== null)
			.map((g) => g.subcategory as string);

		return {
			...category,
			subcategoryGroups: groups,
			subcategories
		};
	});

	function toggleCategory(categoryType: TableType) {
		const newSet = new Set(expandedCategories);
		if (newSet.has(categoryType)) {
			newSet.delete(categoryType);
		} else {
			newSet.add(categoryType);
		}
		expandedCategories = newSet;
	}

	function setCategoryRef(node: HTMLElement, categoryType: TableType) {
		categoryRefs.set(categoryType, node);
		return {
			destroy() {
				categoryRefs.delete(categoryType);
			}
		};
	}

	function setSubcategoryRef(node: HTMLElement, key: string) {
		subcategoryRefs.set(key, node);
		return {
			destroy() {
				subcategoryRefs.delete(key);
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

	function scrollToSubcategory(categoryType: TableType, subcategory: string) {
		const key = `${categoryType}-${subcategory}`;
		const element = subcategoryRefs.get(key);
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
						{#each categoriesWithSubcategories as category}
							<div>
								<button
									onclick={() => {
										scrollToCategory(category.type);
										if (category.subcategories.length > 0) {
											toggleCategory(category.type);
										}
									}}
									class="w-full text-left px-3 py-2 rounded-md transition-all {activeCategory ===
									category.type
										? 'bg-purple-600 text-white font-medium'
										: 'text-purple-200 hover:bg-slate-700/50'}"
								>
									<div class="flex items-center justify-between">
										<div class="flex items-center gap-2">
											{#if category.subcategories.length > 0}
												<svg
													class="w-4 h-4 transition-transform {expandedCategories.has(
														category.type
													)
														? 'rotate-90'
														: ''}"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M9 5l7 7-7 7"
													/>
												</svg>
											{/if}
											<span>{category.type}</span>
										</div>
										<span class="text-xs opacity-70">({category.tables.length})</span>
									</div>
								</button>

								{#if category.subcategories.length > 0 && expandedCategories.has(category.type)}
									<div class="ml-6 mt-1 space-y-1 border-l-2 border-purple-500/30 pl-3">
										{#each category.subcategories as subcategory}
											<button
												onclick={() => scrollToSubcategory(category.type, subcategory)}
												class="w-full text-left px-2 py-1.5 text-sm rounded transition-all text-purple-300 hover:bg-slate-700/30 hover:text-purple-200"
											>
												{subcategory}
											</button>
										{/each}
									</div>
								{/if}
							</div>
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
					{#each categoriesWithSubcategories as category}
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

							{#each category.subcategoryGroups as group}
								{#if group.subcategory}
									<div
										class="mb-8"
										use:setSubcategoryRef={`${category.type}-${group.subcategory}`}
									>
										<!-- Subcategory Header with improved styling -->
										<div class="mb-5">
											<h3
												class="text-xl font-bold text-purple-400 pb-2 border-b-2 border-purple-500/40 inline-block"
											>
												{group.subcategory}
											</h3>
										</div>

										<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-4 border-l-2 border-purple-500/30">
											{#each group.tables as tableInfo}
												<a
													href="/tables/{encodeURIComponent(tableInfo.title)}"
													class="block bg-slate-800/50 backdrop-blur rounded-lg p-4 border border-purple-500/20 hover:border-purple-400 hover:bg-slate-800/70 transition-all group"
												>
													<h4 class="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
														{tableInfo.title}
													</h4>
													<div class="flex items-center text-sm">
														<span class="text-purple-300 text-xs">
															Click to view and roll
														</span>
													</div>
												</a>
											{/each}
										</div>
									</div>
								{:else}
									<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
										{#each group.tables as tableInfo}
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
								{/if}
							{/each}
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
