<script lang="ts">
	/**
	 * Area Generator Component (Phase 4B)
	 * Generates new areas within a region using Progress Points logic
	 */

	import { soloRpgStore } from '$lib/stores/soloRpgStore.svelte';
	import {
		rollAreaElement,
		rollRandomElementDescriptor,
		rollSpecialElement,
		type AreaElement,
		type CategoryType
	} from '$lib/utils/locationCrafterTables';
	import { rollD10 } from '$lib/utils/mythicDice';
	import type { Region } from '$lib/stores/soloRpgStore.svelte';
	import { rollDungeonConnector } from '$lib/tables/mythicTables/dungeonConnectorsTable';

	interface Props {
		regionId: string;
		onAreaCreated?: () => void;
	}

	let { regionId, onAreaCreated }: Props = $props();

	// Element result interface
	interface ElementResult {
		element: AreaElement;
		description: string;
		roll?: number;
		ppModifier?: number; // For Special elements
		alternate?: AreaElement; // For Special elements (second roll)
		alternateDescription?: string;
		knownElementId?: string; // For Known elements (to auto-cross out)
	}

	// State
	let showForm = $state(false);
	let hasGenerated = $state(false);
	let largeLoc = $state<ElementResult | null>(null);
	let smallLoc = $state<ElementResult | null>(null);
	let encounterObj = $state<ElementResult | null>(null);
	let notes = $state('');

	// Mythic Vol 3: Dungeon connectors and secret doors
	let connector = $state('');
	let connectorDescription = $state('');
	let isSecretArea = $state(false);
	let showConnectorSection = $state(false);

	// Derived
	let currentSession = $derived(soloRpgStore.currentSession);
	let region = $derived(
		currentSession?.regions.find((r: Region) => r.id === regionId) || null
	);
	let isDungeon = $derived(
		region?.type === 'Cavern Dungeon' ||
			region?.type === 'Ancient Dungeon' ||
			region?.type === 'Palatial Dungeon'
	);
	let nextAreaNumber = $derived(region ? region.currentAreaNumber + 1 : 1);
	let currentPP = $derived(region?.progressPoints || 0);
	let canCreate = $derived(hasGenerated && largeLoc && smallLoc && encounterObj);

	function startNewArea() {
		showForm = true;
		resetForm();
	}

	function resetForm() {
		hasGenerated = false;
		largeLoc = null;
		smallLoc = null;
		encounterObj = null;
		notes = '';
		connector = '';
		connectorDescription = '';
		isSecretArea = false;
		showConnectorSection = false;
	}

	function rollConnector() {
		if (!isDungeon || !region) return;
		const isFirst = region.areas.length === 0;
		connector = rollDungeonConnector(region.type as any, undefined, isFirst);
	}

	function generateDescription(
		element: AreaElement,
		category: CategoryType
	): { description: string; roll?: number; knownElementId?: string } {
		switch (element) {
			case 'Expected':
				return { description: '(Describe what you expect to find)' };
			case 'Random': {
				const categoryName =
					category === 'Locations-Large'
						? 'Locations'
						: category === 'Locations-Small'
							? 'Locations'
							: 'Encounters';
				const result = rollRandomElementDescriptor(
					categoryName as 'Locations' | 'Encounters' | 'Objects'
				);
				return {
					description: `${result.word1} / ${result.word2}`,
					roll: result.roll1 // Store first roll for display
				};
			}
			case 'Known':
				if (!region || region.knownElements.length === 0) {
					return { description: '(No Known Elements defined - treat as Random or Expected)' };
				} else {
					// Filter out crossed (used) elements
					const availableElements = region.knownElements.filter((ke) => !ke.crossed);

					if (availableElements.length === 0) {
						return { description: '(All Known Elements used - treat as Random or Expected)' };
					}

					const roll = rollD10();
					let element = availableElements.find((ke) => ke.position === roll);

					// If roll hits empty position, choose first available
					if (!element && availableElements.length > 0) {
						element = availableElements[0];
					}

					return {
						description: element ? `📋 KNOWN: ${element.name}` : '(No element at position ' + roll + ')',
						roll,
						knownElementId: element?.id // Store ID for auto-crossing out
					};
				}
			case 'Special':
				return { description: '(Roll again and apply special modifier)' };
			case 'Complete':
				return { description: '(Region is complete! No more areas to explore)' };
			case 'None':
				return { description: '(Nothing in this category)' };
			default:
				return { description: '' };
		}
	}

	function rollElement(category: CategoryType): ElementResult {
		const result = rollAreaElement(currentPP, category);
		const descResult = generateDescription(result.element, category);

		const elementResult: ElementResult = {
			element: result.element,
			description: descResult.description,
			roll: result.roll,
			knownElementId: descResult.knownElementId // Pass through Known Element ID
		};

		// Handle Special elements
		if (result.element === 'Special' && result.alternate) {
			elementResult.ppModifier = result.ppModifier;
			elementResult.alternate = result.alternate;
			const alternateDesc = generateDescription(result.alternate, category);
			elementResult.alternateDescription = alternateDesc.description;
		}

		return elementResult;
	}

	function generateAllAreas() {
		// If secret area, apply +1 modifier to all rolls by temporarily increasing PP
		const ppModifier = isSecretArea ? 1 : 0;
		const effectivePP = currentPP + ppModifier;

		// Store current PP temporarily
		const originalPP = region?.progressPoints;
		if (region && ppModifier > 0) {
			// Temporarily increase PP for rolls
			soloRpgStore.updateRegion(regionId, { progressPoints: effectivePP });
		}

		largeLoc = rollElement('Locations-Large');
		smallLoc = rollElement('Locations-Small');
		encounterObj = rollElement('Encounters-Objects');

		// Restore original PP if we modified it
		if (region && ppModifier > 0 && originalPP !== undefined) {
			soloRpgStore.updateRegion(regionId, { progressPoints: originalPP });
		}

		hasGenerated = true;
	}

	function rerollLargeLoc() {
		largeLoc = rollElement('Locations-Large');
	}

	function rerollSmallLoc() {
		smallLoc = rollElement('Locations-Small');
	}

	function rerollEncounterObj() {
		encounterObj = rollElement('Encounters-Objects');
	}

	function createArea() {
		if (!canCreate || !largeLoc || !smallLoc || !encounterObj) return;

		const area = soloRpgStore.addArea(
			regionId,
			largeLoc.element,
			largeLoc.description,
			smallLoc.element,
			smallLoc.description,
			encounterObj.element,
			encounterObj.description,
			notes.trim()
		);

		// Add connector and secret door info for dungeons
		if (area && isDungeon) {
			soloRpgStore.updateArea(regionId, area.id, {
				connectorFromPrevious: connector.trim() || undefined,
				connectorDescription: connectorDescription.trim() || undefined,
				isSecretArea: isSecretArea || undefined
			});
		}

		// Auto-cross out Known Elements that were used
		if (largeLoc.knownElementId) {
			soloRpgStore.toggleKnownElementCrossed(regionId, largeLoc.knownElementId);
		}
		if (smallLoc.knownElementId) {
			soloRpgStore.toggleKnownElementCrossed(regionId, smallLoc.knownElementId);
		}
		if (encounterObj.knownElementId) {
			soloRpgStore.toggleKnownElementCrossed(regionId, encounterObj.knownElementId);
		}

		// Apply PP modifiers from Special elements
		if (largeLoc.ppModifier) {
			soloRpgStore.updateRegion(regionId, {
				progressPoints: currentPP + largeLoc.ppModifier
			});
		}
		if (smallLoc.ppModifier) {
			soloRpgStore.updateRegion(regionId, {
				progressPoints: currentPP + smallLoc.ppModifier
			});
		}
		if (encounterObj.ppModifier) {
			soloRpgStore.updateRegion(regionId, {
				progressPoints: currentPP + encounterObj.ppModifier
			});
		}

		resetForm();
		showForm = false;
		onAreaCreated?.();
	}

	function cancel() {
		resetForm();
		showForm = false;
	}

	// Element type guidance
	const elementGuidance = {
		Expected: 'Something you expect to find based on the region. Describe it yourself.',
		Random: 'Randomly generated element. Interpret the two words for this area.',
		Known: 'Element from your Known Elements list. This element will be automatically marked as used when you create the area.',
		Special:
			'Special element! Roll again for an additional element AND modify Progress Points.',
		Complete: 'This region is complete! No more areas to explore here.',
		None: 'Nothing of note in this category for this area.'
	};
</script>

{#if !showForm}
	<div class="p-4">
		<button
			onclick={startNewArea}
			disabled={!region}
			class="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-700 disabled:to-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all shadow-lg hover:scale-105 active:scale-95"
		>
			<span class="flex items-center justify-center gap-2">
				<span>🏗️</span>
				<span>Generate New Area</span>
			</span>
		</button>
	</div>
{:else if region}
	<div class="space-y-4 p-4 bg-slate-800/50 rounded-lg border border-blue-500/30">
		<!-- Header -->
		<div class="flex items-center gap-3 pb-3 border-b border-blue-500/30">
			<span class="text-3xl">🏗️</span>
			<div>
				<h3 class="text-xl font-bold text-blue-300">New Area #{nextAreaNumber}</h3>
				<p class="text-sm text-slate-400 mt-1">
					Region: {region.name} • Progress Points: {currentPP}
				</p>
			</div>
		</div>

		<!-- Region Context -->
		<div class="p-3 bg-emerald-900/20 border border-emerald-500/30 rounded">
			<div class="text-xs text-emerald-400 mb-1">Region Descriptors:</div>
			<div class="text-sm text-white">
				{region.descriptor1} / {region.descriptor2}
			</div>
		</div>

		<!-- Dungeon-specific: Secret Door Search (Vol 3) -->
		{#if isDungeon && !hasGenerated && region.areas.length > 0}
			<div class="p-4 bg-orange-900/20 border border-orange-500/30 rounded-lg">
				<h4 class="text-orange-300 font-medium mb-2">🔍 Search for Secret Door</h4>
				<p class="text-sm text-slate-300 mb-3">
					Before exploring this area, you can search for a secret door. Ask a Fate Question: "Is a
					secret door found?" If yes, the next area gets +1 to all element rolls.
				</p>
				<label class="flex items-center gap-2 text-sm text-white cursor-pointer">
					<input
						type="checkbox"
						bind:checked={isSecretArea}
						class="w-4 h-4 rounded border-gray-300"
					/>
					<span>This area was found via secret door (+1 to rolls)</span>
				</label>
			</div>
		{/if}

		{#if !hasGenerated}
			<!-- Generate Button -->
			<div class="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
				<h4 class="text-blue-300 font-medium mb-2">Area Elements</h4>
				<p class="text-sm text-slate-300 mb-3">
					Roll on the Area Elements Table for three categories: Large Locations, Small
					Locations, and Encounters & Objects. The rolls use 1d10 + {currentPP + (isSecretArea ? 1 : 0)} Progress
					Points{isSecretArea ? ' (+1 from secret door)' : ''}.
				</p>
				<button
					onclick={generateAllAreas}
					class="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
				>
					🎲 Roll Area Elements
				</button>
			</div>
		{:else}
			<!-- Generated Elements -->
			<div class="space-y-3">
				<!-- Large Location -->
				{#if largeLoc}
					<div class="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
						<div class="flex items-center justify-between mb-2">
							<h4 class="text-purple-300 font-medium">Large Location</h4>
							<button
								onclick={rerollLargeLoc}
								class="text-xs px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
							>
								🎲 Reroll
							</button>
						</div>
						<div class="mb-2">
							<div class="text-sm text-slate-400 mb-1">
								Element Type: <span class="text-purple-300 font-medium">{largeLoc.element}</span>
								{#if largeLoc.roll}
									<span class="text-xs ml-2">(Roll: {largeLoc.roll})</span>
								{/if}
								{#if largeLoc.element === 'Known'}
									<span class="text-xs ml-2 px-2 py-0.5 bg-blue-600/40 text-blue-200 rounded font-medium">📋 From Your List</span>
								{/if}
							</div>
							<textarea
								bind:value={largeLoc.description}
								placeholder="Describe the large location..."
								class="w-full px-3 py-2 rounded text-white text-sm placeholder-slate-500 resize-none {largeLoc.element === 'Known' ? 'bg-blue-900/30 border-2 border-blue-500 focus:outline-none focus:border-blue-400' : 'bg-slate-700 border border-slate-600 focus:outline-none focus:border-purple-500'}"
								rows="2"
							></textarea>
						</div>
						{#if largeLoc.alternate}
							<div class="mt-2 p-2 bg-purple-800/30 rounded border border-purple-500/20">
								<div class="text-xs text-purple-300 mb-1">
									Special! Also includes: {largeLoc.alternate}
									{#if largeLoc.ppModifier}
										<span class="text-yellow-300"
											>(PP {largeLoc.ppModifier > 0 ? '+' : ''}{largeLoc.ppModifier})</span>
									{/if}
								</div>
								<input
									type="text"
									bind:value={largeLoc.alternateDescription}
									class="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs focus:outline-none focus:border-purple-500"
								/>
							</div>
						{/if}
						<p class="text-xs text-slate-400 mt-2">
							{elementGuidance[largeLoc.element]}
						</p>
					</div>
				{/if}

				<!-- Small Location -->
				{#if smallLoc}
					<div class="p-4 bg-teal-900/20 border border-teal-500/30 rounded-lg">
						<div class="flex items-center justify-between mb-2">
							<h4 class="text-teal-300 font-medium">Small Location</h4>
							<button
								onclick={rerollSmallLoc}
								class="text-xs px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded transition-colors"
							>
								🎲 Reroll
							</button>
						</div>
						<div class="mb-2">
							<div class="text-sm text-slate-400 mb-1">
								Element Type: <span class="text-teal-300 font-medium">{smallLoc.element}</span>
								{#if smallLoc.roll}
									<span class="text-xs ml-2">(Roll: {smallLoc.roll})</span>
								{/if}
								{#if smallLoc.element === 'Known'}
									<span class="text-xs ml-2 px-2 py-0.5 bg-blue-600/40 text-blue-200 rounded font-medium">📋 From Your List</span>
								{/if}
							</div>
							<textarea
								bind:value={smallLoc.description}
								placeholder="Describe the small location..."
								class="w-full px-3 py-2 rounded text-white text-sm placeholder-slate-500 resize-none {smallLoc.element === 'Known' ? 'bg-blue-900/30 border-2 border-blue-500 focus:outline-none focus:border-blue-400' : 'bg-slate-700 border border-slate-600 focus:outline-none focus:border-teal-500'}"
								rows="2"
							></textarea>
						</div>
						{#if smallLoc.alternate}
							<div class="mt-2 p-2 bg-teal-800/30 rounded border border-teal-500/20">
								<div class="text-xs text-teal-300 mb-1">
									Special! Also includes: {smallLoc.alternate}
									{#if smallLoc.ppModifier}
										<span class="text-yellow-300"
											>(PP {smallLoc.ppModifier > 0 ? '+' : ''}{smallLoc.ppModifier})</span>
									{/if}
								</div>
								<input
									type="text"
									bind:value={smallLoc.alternateDescription}
									class="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs focus:outline-none focus:border-teal-500"
								/>
							</div>
						{/if}
						<p class="text-xs text-slate-400 mt-2">
							{elementGuidance[smallLoc.element]}
						</p>
					</div>
				{/if}

				<!-- Encounters & Objects -->
				{#if encounterObj}
					<div class="p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg">
						<div class="flex items-center justify-between mb-2">
							<h4 class="text-amber-300 font-medium">Encounters & Objects</h4>
							<button
								onclick={rerollEncounterObj}
								class="text-xs px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded transition-colors"
							>
								🎲 Reroll
							</button>
						</div>
						<div class="mb-2">
							<div class="text-sm text-slate-400 mb-1">
								Element Type: <span class="text-amber-300 font-medium">{encounterObj.element}</span>
								{#if encounterObj.roll}
									<span class="text-xs ml-2">(Roll: {encounterObj.roll})</span>
								{/if}
								{#if encounterObj.element === 'Known'}
									<span class="text-xs ml-2 px-2 py-0.5 bg-blue-600/40 text-blue-200 rounded font-medium">📋 From Your List</span>
								{/if}
							</div>
							<textarea
								bind:value={encounterObj.description}
								placeholder="Describe the encounter or object..."
								class="w-full px-3 py-2 rounded text-white text-sm placeholder-slate-500 resize-none {encounterObj.element === 'Known' ? 'bg-blue-900/30 border-2 border-blue-500 focus:outline-none focus:border-blue-400' : 'bg-slate-700 border border-slate-600 focus:outline-none focus:border-amber-500'}"
								rows="2"
							></textarea>
						</div>
						{#if encounterObj.alternate}
							<div class="mt-2 p-2 bg-amber-800/30 rounded border border-amber-500/20">
								<div class="text-xs text-amber-300 mb-1">
									Special! Also includes: {encounterObj.alternate}
									{#if encounterObj.ppModifier}
										<span class="text-yellow-300"
											>(PP {encounterObj.ppModifier > 0 ? '+' : ''}{encounterObj.ppModifier})</span>
									{/if}
								</div>
								<input
									type="text"
									bind:value={encounterObj.alternateDescription}
									class="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs focus:outline-none focus:border-amber-500"
								/>
							</div>
						{/if}
						<p class="text-xs text-slate-400 mt-2">
							{elementGuidance[encounterObj.element]}
						</p>
					</div>
				{/if}

				<!-- Complete Region Warning -->
				{#if largeLoc?.element === 'Complete' || smallLoc?.element === 'Complete' || encounterObj?.element === 'Complete'}
					<div class="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
						<h4 class="text-green-300 font-medium mb-2">🎉 Region Complete!</h4>
						<p class="text-sm text-slate-300">
							This region has reached its natural conclusion. Consider marking it as completed and
							starting a new region if you want to continue exploring.
						</p>
					</div>
				{/if}

				<!-- Dungeon Connector (Vol 3) -->
				{#if isDungeon}
					<div class="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
						<h4 class="text-purple-300 font-medium mb-3">🚪 Dungeon Connector</h4>
						<p class="text-sm text-slate-300 mb-3">
							How does this area connect to the dungeon? Roll on the Dungeon Connectors Table.
						</p>
						{#if !connector}
							<button
								onclick={rollConnector}
								class="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors"
							>
								🎲 Roll Connector
							</button>
						{:else}
							<div class="space-y-2">
								<div class="p-3 bg-slate-800/50 rounded border border-purple-500/20">
									<div class="flex items-center justify-between mb-2">
										<label class="text-sm text-slate-400">Connector:</label>
										<button
											onclick={rollConnector}
											class="text-xs px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
										>
											🎲 Reroll
										</button>
									</div>
									<input
										type="text"
										bind:value={connector}
										placeholder="e.g., Simple hallway, Stairs going down..."
										class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-purple-500"
									/>
								</div>
								<div>
									<label class="block text-sm text-slate-400 mb-1">
										Connector Details (optional)
									</label>
									<textarea
										bind:value={connectorDescription}
										placeholder="Describe special features of this connector..."
										class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
										rows="2"
									></textarea>
								</div>
							</div>
						{/if}
					</div>
				{/if}

				<!-- Notes -->
				<div>
					<label for="area-notes" class="block text-sm font-medium text-white mb-2">
						Notes (optional)
					</label>
					<textarea
						id="area-notes"
						bind:value={notes}
						placeholder="Any additional notes about this area..."
						class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
						rows="2"
					></textarea>
				</div>

				<!-- Actions -->
				<div class="flex gap-2 pt-2 border-t border-blue-500/30">
					<button
						onclick={createArea}
						disabled={!canCreate}
						class="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
					>
						✓ Create Area #{nextAreaNumber}
					</button>
					<button
						onclick={cancel}
						class="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
					>
						Cancel
					</button>
				</div>
			</div>
		{/if}
	</div>
{/if}
