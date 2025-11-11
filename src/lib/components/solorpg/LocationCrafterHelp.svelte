<script lang="ts">
	/**
	 * Location Crafter Help Modal (Phase 5B)
	 * Comprehensive help documentation for the Location Crafter system
	 */

	interface Props {
		isOpen: boolean;
		onClose: () => void;
	}

	let { isOpen, onClose }: Props = $props();

	// Keyboard handler
	function handleKeydown(e: KeyboardEvent) {
		if (!isOpen) return;
		if (e.key === 'Escape') {
			onClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<!-- Modal Backdrop -->
	<div
		class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
		onclick={onClose}
		role="presentation"
	>
		<!-- Modal Content -->
		<div
			class="bg-slate-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-emerald-500/30"
			onclick={(e) => e.stopPropagation()}
			role="dialog"
			aria-labelledby="help-title"
		>
			<!-- Header -->
			<div class="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 p-6 z-10">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<span class="text-4xl">🗺️</span>
						<div>
							<h2 id="help-title" class="text-2xl font-bold text-white">
								Location Crafter Guide
							</h2>
							<p class="text-emerald-100 text-sm mt-1">
								Randomized location generation from Mythic Magazine Volume 2
							</p>
						</div>
					</div>
					<button
						onclick={onClose}
						class="text-white/80 hover:text-white text-3xl leading-none"
						aria-label="Close"
					>
						×
					</button>
				</div>
			</div>

			<!-- Content -->
			<div class="p-6 space-y-6 text-slate-200">
				<!-- Overview -->
				<section>
					<h3 class="text-xl font-bold text-emerald-400 mb-3 flex items-center gap-2">
						<span>📖</span>
						<span>What is Location Crafter?</span>
					</h3>
					<p class="mb-3">
						Location Crafter is a procedural location generation system that helps you dynamically
						create and explore regions without pre-planning every detail. It uses randomized tables
						and a Progress Points mechanic to generate locations, encounters, and objects as you
						explore.
					</p>
					<p class="text-slate-400">
						Perfect for solo RPG play where you want to be surprised by what you discover!
					</p>
				</section>

				<!-- Regions -->
				<section class="p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-lg">
					<h3 class="text-xl font-bold text-emerald-400 mb-3 flex items-center gap-2">
						<span>🌲</span>
						<span>Regions</span>
					</h3>
					<p class="mb-3">
						A <strong>Region</strong> is the top-level location you're exploring. It could be a forest,
						a city, a dungeon, a spaceship, or any location that makes sense for your adventure.
					</p>
					<div class="space-y-2 ml-4">
						<div>
							<h4 class="font-bold text-emerald-300 mb-1">Region Types:</h4>
							<ul class="list-disc list-inside space-y-1 text-sm">
								<li>
									<strong>Wilderness:</strong> Natural areas (forests, deserts, mountains, oceans, tundra)
								</li>
								<li>
									<strong>City:</strong> Civilized settlements (towns, cities, villages, space stations)
								</li>
								<li>
									<strong>Structure:</strong> Built locations (buildings, castles, dungeons, ships, temples)
								</li>
							</ul>
						</div>
						<div>
							<h4 class="font-bold text-emerald-300 mb-1">Region Descriptors:</h4>
							<p class="text-sm">
								Each region gets two descriptors rolled from a table. These are intentionally generic
								words that you interpret to fit your region. Examples: "Dry and arid" + "Dangerous",
								or "Sprawling and large" + "Thriving". Combine them to imagine what the region is
								like.
							</p>
						</div>
					</div>
				</section>

				<!-- Areas -->
				<section class="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
					<h3 class="text-xl font-bold text-blue-400 mb-3 flex items-center gap-2">
						<span>🏗️</span>
						<span>Areas</span>
					</h3>
					<p class="mb-3">
						<strong>Areas</strong> are specific locations within a region that you visit as you explore.
						Each area has three elements that you roll for:
					</p>
					<div class="space-y-3 ml-4">
						<div>
							<h4 class="font-bold text-blue-300">🏔️ Large Location</h4>
							<p class="text-sm">A major geographical or structural feature (mountain, lake, plaza, hall)</p>
						</div>
						<div>
							<h4 class="font-bold text-blue-300">🏕️ Small Location</h4>
							<p class="text-sm">
								A smaller feature within the large location (clearing, dock, fountain, alcove)
							</p>
						</div>
						<div>
							<h4 class="font-bold text-blue-300">⚔️ Encounters & Objects</h4>
							<p class="text-sm">
								Something you encounter or find (creatures, NPCs, items, obstacles)
							</p>
						</div>
					</div>
				</section>

				<!-- Progress Points -->
				<section class="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
					<h3 class="text-xl font-bold text-yellow-400 mb-3 flex items-center gap-2">
						<span>📊</span>
						<span>Progress Points (PP)</span>
					</h3>
					<p class="mb-3">
						<strong>Progress Points</strong> track how much of a region you've explored. They start at
						0 and increase as you explore. Higher PP makes it more likely to complete the region or
						encounter special elements.
					</p>
					<div class="space-y-2 ml-4 text-sm">
						<div>
							<h4 class="font-bold text-yellow-300 mb-1">How PP Works:</h4>
							<p class="mb-2">
								When generating an area, you roll <strong>1d10 + Progress Points</strong> for each
								of the three elements. The result determines what type of element you get.
							</p>
						</div>
						<div>
							<h4 class="font-bold text-yellow-300 mb-1">PP Increases When:</h4>
							<ul class="list-disc list-inside space-y-1">
								<li>You generate a "Special" element (increases by the modifier rolled)</li>
								<li>You manually add PP through the history panel</li>
							</ul>
						</div>
						<div class="p-3 bg-yellow-800/20 border border-yellow-500/20 rounded">
							<p class="text-yellow-200 font-medium mb-1">💡 Tip:</p>
							<p>
								As PP increases, you'll encounter more Expected elements (things you define yourself)
								and eventually Complete elements (signaling the region is fully explored).
							</p>
						</div>
					</div>
				</section>

				<!-- Area Element Types -->
				<section>
					<h3 class="text-xl font-bold text-purple-400 mb-3 flex items-center gap-2">
						<span>🎲</span>
						<span>Area Element Types</span>
					</h3>
					<div class="space-y-2">
						<div class="p-3 bg-slate-800/50 rounded border border-slate-600">
							<h4 class="font-bold text-white mb-1">📝 Expected</h4>
							<p class="text-sm text-slate-300">
								Something you expect to find. You describe it yourself based on what makes sense for
								the region. Common at higher PP.
							</p>
						</div>
						<div class="p-3 bg-slate-800/50 rounded border border-slate-600">
							<h4 class="font-bold text-white mb-1">🎲 Random</h4>
							<p class="text-sm text-slate-300">
								Generates two random descriptive words. Combine and interpret them for this element.
								Example: "Ancient" + "Cursed" might be ancient cursed ruins.
							</p>
						</div>
						<div class="p-3 bg-slate-800/50 rounded border border-slate-600">
							<h4 class="font-bold text-white mb-1">📋 Known</h4>
							<p class="text-sm text-slate-300">
								Pulls from your Known Elements list (pre-defined locations/encounters/objects you
								expect in this region). Rolls 1d10 to select which element.
							</p>
						</div>
						<div class="p-3 bg-slate-800/50 rounded border border-slate-600">
							<h4 class="font-bold text-white mb-1">✨ Special</h4>
							<p class="text-sm text-slate-300">
								Roll again AND get a second element, plus modify Progress Points! This makes the area
								more complex and interesting.
							</p>
						</div>
						<div class="p-3 bg-slate-800/50 rounded border border-slate-600">
							<h4 class="font-bold text-white mb-1">✅ Complete</h4>
							<p class="text-sm text-slate-300">
								The region has reached its natural conclusion. Time to mark it complete and move on to
								a new region if needed.
							</p>
						</div>
						<div class="p-3 bg-slate-800/50 rounded border border-slate-600">
							<h4 class="font-bold text-white mb-1">➖ None</h4>
							<p class="text-sm text-slate-300">
								Nothing notable in this category. The area is simpler with fewer elements.
							</p>
						</div>
					</div>
				</section>

				<!-- Known Elements -->
				<section class="p-4 bg-teal-900/20 border border-teal-500/30 rounded-lg">
					<h3 class="text-xl font-bold text-teal-400 mb-3 flex items-center gap-2">
						<span>📋</span>
						<span>Known Elements</span>
					</h3>
					<p class="mb-3">
						<strong>Known Elements</strong> are locations, encounters, or objects you expect to find
						in this region. You define them ahead of time, and they can appear when rolling "Known" on
						the Area Elements Table.
					</p>
					<div class="space-y-2 ml-4 text-sm">
						<div>
							<h4 class="font-bold text-teal-300 mb-1">How to Use:</h4>
							<ul class="list-disc list-inside space-y-1">
								<li>Add elements before generating areas (or add them as you go)</li>
								<li>Each element is assigned a position number (1-10)</li>
								<li>When "Known" is rolled, roll 1d10 to see which element appears</li>
								<li>Mark elements as "crossed" when they're exhausted or used up</li>
							</ul>
						</div>
						<div class="p-3 bg-teal-800/20 border border-teal-500/20 rounded">
							<p class="text-teal-200 font-medium mb-1">💡 Example:</p>
							<p>
								In a haunted castle region, you might add Known Elements like: "Throne Room" (Locations),
								"Ghostly Knight" (Encounters), "Ancient Sword" (Objects).
							</p>
						</div>
					</div>
				</section>

				<!-- Quick Start Guide -->
				<section class="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
					<h3 class="text-xl font-bold text-green-400 mb-3 flex items-center gap-2">
						<span>🚀</span>
						<span>Quick Start Guide</span>
					</h3>
					<ol class="list-decimal list-inside space-y-2 text-sm">
						<li>
							<strong>Create a Region:</strong> Click "Create New Region", choose a type, roll
							descriptors, and give it a name
						</li>
						<li>
							<strong>(Optional) Add Known Elements:</strong> Switch to the "Known Elements" tab and
							add any locations/encounters/objects you expect
						</li>
						<li>
							<strong>Generate Your First Area:</strong> Switch to "Areas" tab and click "Generate New
							Area"
						</li>
						<li>
							<strong>Roll Area Elements:</strong> Click "Roll Area Elements" to generate the three
							elements
						</li>
						<li>
							<strong>Interpret Results:</strong> Read the element types and descriptions, then imagine
							what the area is like
						</li>
						<li>
							<strong>Create the Area:</strong> Add any notes and click "Create Area"
						</li>
						<li>
							<strong>Repeat:</strong> Generate more areas as you explore. Watch PP increase and the
							region evolve!
						</li>
					</ol>
				</section>

				<!-- Tips -->
				<section class="p-4 bg-slate-800/50 border border-slate-600 rounded-lg">
					<h3 class="text-xl font-bold text-slate-200 mb-3 flex items-center gap-2">
						<span>💡</span>
						<span>Pro Tips</span>
					</h3>
					<ul class="list-disc list-inside space-y-2 text-sm">
						<li>
							<strong>Don't overthink it:</strong> The random words are meant to spark your
							imagination, not constrain it
						</li>
						<li>
							<strong>Reroll if needed:</strong> Each element can be rerolled if the result doesn't
							fit or inspire you
						</li>
						<li>
							<strong>Use History:</strong> Track major events in the History tab to see how the
							region evolved
						</li>
						<li>
							<strong>Manual override:</strong> You can edit any generated text to better fit your
							story
						</li>
						<li>
							<strong>Region complete?:</strong> When you get "Complete" elements, consider wrapping
							up the region and starting a new one
						</li>
						<li>
							<strong>Mix with Mythic GME:</strong> Use Location Crafter alongside Fate Questions,
							Random Events, and other Mythic tools!
						</li>
					</ul>
				</section>
			</div>

			<!-- Footer -->
			<div class="sticky bottom-0 bg-slate-900 p-4 border-t border-emerald-500/30">
				<button
					onclick={onClose}
					class="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors"
				>
					Got it! Let's Explore
				</button>
			</div>
		</div>
	</div>
{/if}
