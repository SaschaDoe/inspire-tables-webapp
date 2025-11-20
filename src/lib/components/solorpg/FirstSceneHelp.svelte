<script lang="ts">
	/**
	 * First Scene Help Tooltip/Modal
	 * Explains the 4 strategies for starting a Mythic GME adventure
	 */

	interface Props {
		isOpen: boolean;
		onClose: () => void;
	}

	let { isOpen, onClose }: Props = $props();

	function handleClose() {
		onClose();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!isOpen) return;
		if (e.key === 'Escape') {
			handleClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<!-- Modal Backdrop -->
	<div
		class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
		onclick={handleClose}
		onkeydown={(e) => e.key === 'Escape' && handleClose()}
		role="button"
		tabindex="0"
		aria-label="Close dialog"
	>
		<!-- Modal Content -->
		<div
			class="bg-gray-900 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-blue-500/30"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
			aria-labelledby="first-scene-help-title"
			tabindex="-1"
		>
			<!-- Header -->
			<div class="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 rounded-t-lg">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<span class="text-4xl">📖</span>
						<div>
							<h2 id="first-scene-help-title" class="text-2xl font-bold text-white">
								Starting Your Adventure
							</h2>
							<p class="text-blue-100 text-sm mt-1">
								Four strategies for creating your First Scene
							</p>
						</div>
					</div>
					<button
						onclick={handleClose}
						class="text-white/80 hover:text-white text-3xl leading-none"
						aria-label="Close"
					>
						×
					</button>
				</div>
			</div>

			<!-- Body -->
			<div class="p-6 space-y-6">
				<!-- Introduction -->
				<div class="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
					<p class="text-gray-200 text-sm leading-relaxed">
						<strong>Good news!</strong> There are NO mandatory setup steps when starting a Mythic adventure.
						Your Threads and Characters Lists can start completely empty - they'll naturally fill as you play.
						You have complete freedom in how you begin!
					</p>
				</div>

				<!-- Strategy 1: Inspired Idea -->
				<div class="space-y-3">
					<div class="flex items-center gap-3">
						<span class="text-3xl">💡</span>
						<h3 class="text-xl font-bold text-cyan-300">1. Inspired Idea</h3>
					</div>
					<div class="bg-gray-800 rounded-lg p-4 space-y-2">
						<p class="text-gray-300 text-sm"><strong>What it is:</strong> Create your own starting scenario</p>
						<p class="text-gray-300 text-sm">
							<strong>Example:</strong> "My knight travels to a village to slay the monster terrorizing the locals"
						</p>
						<p class="text-gray-400 text-sm italic">
							Perfect when you have a clear vision for your adventure's beginning
						</p>
						<div class="mt-3 pt-3 border-t border-gray-700">
							<p class="text-gray-300 text-sm"><strong>How to use in UI:</strong> Just start playing!
							Set up your first scene and begin asking Fate Questions.</p>
						</div>
					</div>
				</div>

				<!-- Strategy 2: Random Event -->
				<div class="space-y-3">
					<div class="flex items-center gap-3">
						<span class="text-3xl">⚡</span>
						<h3 class="text-xl font-bold text-cyan-300">2. Random Event</h3>
					</div>
					<div class="bg-gray-800 rounded-lg p-4 space-y-2">
						<p class="text-gray-300 text-sm">
							<strong>What it is:</strong> Generate a Random Event for a surprise beginning
						</p>
						<p class="text-gray-300 text-sm">
							<strong>Example:</strong> Rolled "Praise" + "Hope" → Interpreted as haggard man stumbling from trees, begging for food
						</p>
						<p class="text-gray-400 text-sm italic">
							Best when you want to be completely surprised or don't have a specific idea
						</p>
						<div class="mt-3 pt-3 border-t border-gray-700">
							<p class="text-gray-300 text-sm"><strong>How to use in UI:</strong> Click the Random Event
							generator button. If your Lists are empty, ignore NPC/Thread results and use "Current Context" instead.</p>
						</div>
					</div>
				</div>

				<!-- Strategy 3: Meaning Tables -->
				<div class="space-y-3">
					<div class="flex items-center gap-3">
						<span class="text-3xl">🎲</span>
						<h3 class="text-xl font-bold text-cyan-300">3. Meaning Tables</h3>
					</div>
					<div class="bg-gray-800 rounded-lg p-4 space-y-2">
						<p class="text-gray-300 text-sm">
							<strong>What it is:</strong> Roll on Meaning Tables for inspiration words
						</p>
						<p class="text-gray-300 text-sm">
							<strong>Example:</strong> Actions: "Observe" + "Benefits", Locations: "Enclosed" + "Extravagant"
							→ Knight spying on enemy garrison that's more lavish than expected
						</p>
						<p class="text-gray-400 text-sm italic">
							Great when you want creative inspiration but more control than a full Random Event
						</p>
						<div class="mt-3 pt-3 border-t border-gray-700">
							<p class="text-gray-300 text-sm"><strong>How to use in UI:</strong> Use the "Discover Meaning"
							button to roll on any table. Roll multiple times on different tables to build up inspiration.</p>
						</div>
					</div>
				</div>

				<!-- Strategy 4: 4W Method -->
				<div class="space-y-3">
					<div class="flex items-center gap-3">
						<span class="text-3xl">🗺️</span>
						<h3 class="text-xl font-bold text-cyan-300">4. The 4W Method</h3>
					</div>
					<div class="bg-gray-800 rounded-lg p-4 space-y-2">
						<p class="text-gray-300 text-sm">
							<strong>What it is:</strong> Structured generation using Who, What, Where, Why
						</p>
						<div class="grid grid-cols-2 gap-2 my-2">
							<div class="bg-gray-900 p-2 rounded">
								<span class="text-cyan-400 font-medium text-sm">WHO:</span>
								<span class="text-gray-300 text-xs"> Characters Elements</span>
							</div>
							<div class="bg-gray-900 p-2 rounded">
								<span class="text-cyan-400 font-medium text-sm">WHAT:</span>
								<span class="text-gray-300 text-xs"> Actions</span>
							</div>
							<div class="bg-gray-900 p-2 rounded">
								<span class="text-cyan-400 font-medium text-sm">WHERE:</span>
								<span class="text-gray-300 text-xs"> Locations Elements</span>
							</div>
							<div class="bg-gray-900 p-2 rounded">
								<span class="text-cyan-400 font-medium text-sm">WHY:</span>
								<span class="text-gray-300 text-xs"> Actions</span>
							</div>
						</div>
						<p class="text-gray-300 text-sm">
							<strong>Example:</strong> WHO: "Excited" + "Unusual", WHAT: "Fail" + "Portal",
							WHERE: "Lively" + "Festive", WHY: "Travel" + "Project" → Mage at festival of undead
							trying to open portal to Underworld
						</p>
						<p class="text-gray-400 text-sm italic">
							Perfect for structured, comprehensive scene setup with clear elements
						</p>
						<div class="mt-3 pt-3 border-t border-gray-700">
							<p class="text-gray-300 text-sm"><strong>How to use in UI:</strong> Use the "4W Generator"
							button to automatically roll all four elements and build your First Scene.</p>
						</div>
					</div>
				</div>

				<!-- Optional: Seeding Lists -->
				<div class="space-y-3">
					<div class="flex items-center gap-3">
						<span class="text-3xl">📋</span>
						<h3 class="text-xl font-bold text-cyan-300">Optional: Seeding Lists</h3>
					</div>
					<div class="bg-gray-800 rounded-lg p-4 space-y-2">
						<p class="text-gray-300 text-sm">
							Before or after creating your First Scene, you can <strong>optionally</strong> pre-populate
							your Threads and Characters Lists with initial elements:
						</p>
						<ul class="list-disc list-inside space-y-1 text-gray-300 text-sm ml-4">
							<li><strong>Threads:</strong> Starting goals or plot lines</li>
							<li><strong>Characters:</strong> NPCs you expect to encounter</li>
						</ul>
						<p class="text-gray-400 text-sm italic mt-2">
							This makes early Random Events more meaningful, but it's completely optional!
						</p>
					</div>
				</div>

				<!-- Bottom Note -->
				<div class="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
					<p class="text-gray-200 text-sm leading-relaxed">
						<strong>Remember:</strong> These are just strategies, not rules. You can mix and match them,
						use different approaches for different adventures, or create your own method. The key is to
						start playing and let Mythic guide the story from there!
					</p>
				</div>
			</div>

			<!-- Footer -->
			<div class="bg-gray-800 p-4 border-t border-gray-700 flex justify-end rounded-b-lg">
				<button
					onclick={handleClose}
					class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
				>
					Got It!
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Custom scrollbar */
	.overflow-y-auto {
		scrollbar-width: thin;
		scrollbar-color: rgb(37, 99, 235) rgb(31, 41, 55);
	}

	.overflow-y-auto::-webkit-scrollbar {
		width: 8px;
	}

	.overflow-y-auto::-webkit-scrollbar-track {
		background: rgb(31, 41, 55);
		border-radius: 4px;
	}

	.overflow-y-auto::-webkit-scrollbar-thumb {
		background: rgb(37, 99, 235);
		border-radius: 4px;
	}

	.overflow-y-auto::-webkit-scrollbar-thumb:hover {
		background: rgb(59, 130, 246);
	}
</style>
