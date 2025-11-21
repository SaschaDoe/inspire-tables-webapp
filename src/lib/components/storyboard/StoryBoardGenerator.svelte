<script lang="ts">
	import { storyboardStore, activeBoard } from '$lib/stores/storyboardStore';
	import { Dice } from '$lib/utils/dice';
	import { getAllCategories, loadTablesForCategory, type CategoryInfo } from '$lib/data/tableHelpers';
	import type { Table } from '$lib/tables/table';
	import { onMount } from 'svelte';
	import { getRandomCard, generateStorySeed } from '$lib/data/storyEngineLoader';
	import { STORY_ENGINE_CARD_TYPES, type StoryEngineCardType, type StoryEngineCard } from '$lib/types/storyEngine';
	import { getRandomCard as getRandomWorldBuilderCard, generateMicrosetting } from '$lib/data/worldBuilderLoader';
	import { WORLD_BUILDER_CARD_TYPES, type WorldBuilderCardType, type WorldBuilderCard } from '$lib/types/worldBuilder';
	import { getRandomCard as getRandomLoreMasterCard, pairWithDeityIfNeeded } from '$lib/data/loreMasterLoader';
	import { LORE_MASTER_CARD_TYPES, type LoreMasterCardType, type LoreMasterCard } from '$lib/types/loreMaster';
	import { generateSettlementStory, generateFactionTerritory, generateDivineDomain, generateAdventureSite, type CompoundGeneration } from '$lib/data/compoundGenerators';
	import { getRandomBridgeStoryEngineCard, getRandomBridgeWorldBuilderCard, getRandomBridgeLoreMasterCard } from '$lib/data/bridgeLoader';

	interface Props {
		show: boolean;
		onClose: () => void;
	}

	let { show, onClose }: Props = $props();

	// Categories with their metadata (no tables loaded yet)
	const categories = getAllCategories();

	// Add Story Engine as a special category
	const storyEngineCategory: CategoryInfo = {
		type: 'story-engine' as any,
		name: 'Story Engine',
		icon: '📖',
		metadata: [
			{ name: 'Agent', type: 'story-engine' },
			{ name: 'Engine', type: 'story-engine' },
			{ name: 'Anchor', type: 'story-engine' },
			{ name: 'Conflict', type: 'story-engine' },
			{ name: 'Aspect', type: 'story-engine' },
			{ name: 'Story Seed (5 cards)', type: 'story-engine' }
		]
	};

	const worldBuilderCategory: CategoryInfo = {
		type: 'world-builder' as any,
		name: 'World Builder',
		icon: '🌍',
		metadata: [
			{ name: 'Region', type: 'world-builder' },
			{ name: 'Landmark', type: 'world-builder' },
			{ name: 'Namesake', type: 'world-builder' },
			{ name: 'Origin', type: 'world-builder' },
			{ name: 'Attribute', type: 'world-builder' },
			{ name: 'Advent', type: 'world-builder' },
			{ name: 'Adventure', type: 'world-builder' },
			{ name: 'Keyhole', type: 'world-builder' },
			{ name: 'Opus', type: 'world-builder' },
			{ name: 'Flourish', type: 'world-builder' },
			{ name: 'Microsetting (6+ cards)', type: 'world-builder' }
		]
	};

	const loreMasterCategory: CategoryInfo = {
		type: 'lore-master' as any,
		name: "Lore Master's Deck",
		icon: '📜',
		metadata: [
			{ name: 'Faction', type: 'lore-master' },
			{ name: 'Figure', type: 'lore-master' },
			{ name: 'Event', type: 'lore-master' },
			{ name: 'Location', type: 'lore-master' },
			{ name: 'Object', type: 'lore-master' },
			{ name: 'Material', type: 'lore-master' },
			{ name: 'Creature', type: 'lore-master' }
		]
	};

	const bridgeCompoundsCategory: CategoryInfo = {
		type: 'bridge-compounds' as any,
		name: 'Bridge Compounds',
		icon: '🌉',
		metadata: [
			{ name: 'Settlement Story', type: 'bridge-compounds' },
			{ name: 'Faction Territory', type: 'bridge-compounds' },
			{ name: 'Divine Domain', type: 'bridge-compounds' },
			{ name: 'Adventure Site', type: 'bridge-compounds' }
		]
	};

	const complexPatternsCategory: CategoryInfo = {
		type: 'complex-patterns' as any,
		name: 'Complex Patterns',
		icon: '🔄',
		metadata: [
			{ name: 'Circle of Fate', type: 'complex-patterns' }
		]
	};


	// Bridge card availability by type
	const BRIDGE_AVAILABLE_TYPES = {
		'story-engine': ['Engine', 'Conflict'],
		'world-builder': ['Origin', 'Attribute', 'Advent'],
		'lore-master': ['Faction', 'Figure', 'Event', 'Location', 'Object', 'Material', 'Creature', 'Deity']
	};
	// State
	let selectedCategory = $state<CategoryInfo>(categories[0]);
	let categoryTables = $state<Table[]>([]);
	let isLoadingTables = $state(false);
	let selectedTable = $state<Table | null>(null);
	let searchQuery = $state('');
	let generatedText = $state('');
	let isRolling = $state(false);

	// Story Engine specific state
	let isStoryEngineMode = $state(false);
	let selectedStoryEngineType = $state<StoryEngineCardType | 'story-seed' | null>(null);
	let generatedStoryEngineCard = $state<StoryEngineCard | null>(null);
	let generatedStorySeed = $state<StoryEngineCard[] | null>(null);
	let showStoryEngineHelp = $state(false);
	let preferBridgeCardsStoryEngine = $state(false); // Toggle for Bridge Cards

	// Filtered Story Engine types based on bridge mode
	let availableStoryEngineTypes = $derived(
		preferBridgeCardsStoryEngine
			? storyEngineCategory.metadata.filter(m => BRIDGE_AVAILABLE_TYPES['story-engine'].includes(m.name))
			: storyEngineCategory.metadata
	);

	// World Builder specific state
	let isWorldBuilderMode = $state(false);
	let selectedWorldBuilderType = $state<WorldBuilderCardType | 'microsetting' | null>(null);
	let generatedWorldBuilderCard = $state<WorldBuilderCard | null>(null);
	let generatedMicrosetting = $state<WorldBuilderCard[] | null>(null);
	let showWorldBuilderHelp = $state(false);
	let preferBridgeCardsWorldBuilder = $state(false); // Toggle for Bridge Cards

	// Filtered World Builder types based on bridge mode
	let availableWorldBuilderTypes = $derived(
		preferBridgeCardsWorldBuilder
			? worldBuilderCategory.metadata.filter(m => BRIDGE_AVAILABLE_TYPES['world-builder'].includes(m.name))
			: worldBuilderCategory.metadata
	);

	// Lore Master specific state
	let isLoreMasterMode = $state(false);
	let selectedLoreMasterType = $state<LoreMasterCardType | null>(null);
	let useDeitiesExpansion = $state(false); // Toggle for Deities Expansion
	let preferBridgeCardsLoreMaster = $state(false); // Toggle for Bridge Cards
	let generatedLoreCluster = $state<{
		primaryCard: LoreMasterCard;
		primaryDeity?: { card: LoreMasterCard; deityName: string } | null;
		topCard: LoreMasterCard | null;
		topDeity?: { card: LoreMasterCard; deityName: string } | null;
		rightCard: LoreMasterCard | null;
		rightDeity?: { card: LoreMasterCard; deityName: string } | null;
		bottomCard: LoreMasterCard | null;
		bottomDeity?: { card: LoreMasterCard; deityName: string } | null;
		leftCard: LoreMasterCard | null;
		leftDeity?: { card: LoreMasterCard; deityName: string } | null;
	} | null>(null);

	// Bridge Compounds specific state
	let isBridgeCompoundsMode = $state(false);
	let selectedCompoundType = $state<'settlement' | 'faction-territory' | 'divine-domain' | 'adventure-site' | null>(null);
	let generatedCompound = $state<CompoundGeneration | null>(null);
	let isGeneratingCompound = $state(false);

	// Complex Patterns specific state
	let isComplexPatternsMode = $state(false);
	let selectedPatternType = $state<'circle-of-fate' | null>(null);
	let isGeneratingPattern = $state(false);

	// Load tables when category changes
	$effect(() => {
		if (selectedCategory) {
			loadCategoryTables(selectedCategory);
		}
	});

	async function loadCategoryTables(category: CategoryInfo) {
		isLoadingTables = true;
		try {
			categoryTables = await loadTablesForCategory(category.type);
		} catch (error) {
			console.error('Failed to load tables for category:', category.name, error);
			categoryTables = [];
		} finally {
			isLoadingTables = false;
		}
	}

	// Load initial category on mount
	onMount(() => {
		loadCategoryTables(selectedCategory);
	});

	// Filter tables by search
	let filteredTables = $derived(
		categoryTables.filter((table) =>
			table.title.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	// Roll on selected table
	async function rollTable() {
		if (!selectedTable || !$activeBoard) return;

		isRolling = true;
		await new Promise((resolve) => setTimeout(resolve, 500)); // Dramatic pause

		const dice = new Dice();
		const result = selectedTable.roleWithCascade(dice);
		generatedText = result.text;

		isRolling = false;
	}

	// Add result as card to storyboard
	function addToStoryboard() {
		if (!$activeBoard || !generatedText || !selectedTable) return;

		// Calculate center of viewport
		const viewportCenterX =
			(-$activeBoard.viewport.x + window.innerWidth / 2) / $activeBoard.viewport.zoom;
		const viewportCenterY =
			(-$activeBoard.viewport.y + window.innerHeight / 2) / $activeBoard.viewport.zoom;

		storyboardStore.addNode(
			$activeBoard.id,
			{
				x: viewportCenterX - 100,
				y: viewportCenterY - 60,
				width: 200,
				height: 120,
				label: generatedText,
				notes: `Generated from: ${selectedTable.title}`,
				color: '#fbbf24', // Yellow color for generated cards
				icon: '🎲',
				entityType: 'generated' as any, // Special type for generated cards
				layer: 0
			},
			`Generate: ${selectedTable.title}`
		);

		// Reset and close
		generatedText = '';
		selectedTable = null;
		onClose();
	}

	// Quick generate and add
	async function quickGenerate() {
		await rollTable();
		if (generatedText) {
			addToStoryboard();
		}
	}

	// Story Engine generation functions
	async function generateStoryEngineCard() {
		if (!selectedStoryEngineType || selectedStoryEngineType === 'story-seed') return;

		isRolling = true;
		try {
			if (preferBridgeCardsStoryEngine) {
				generatedStoryEngineCard = await getRandomBridgeStoryEngineCard(selectedStoryEngineType as StoryEngineCardType);
			} else {
				generatedStoryEngineCard = await getRandomCard(selectedStoryEngineType as StoryEngineCardType);
			}
		} catch (error) {
			console.error('Failed to generate Story Engine card:', error);
		} finally {
			isRolling = false;
		}
	}

	async function generateStoryEngineStorySeed() {
		isRolling = true;
		try {
			generatedStorySeed = await generateStorySeed();
		} catch (error) {
			console.error('Failed to generate Story Seed:', error);
		} finally {
			isRolling = false;
		}
	}

	function addStoryEngineCardToBoard(card: StoryEngineCard, offsetMultiplier: number = 0, groupId?: string) {
		if (!$activeBoard) {
			console.error('No active board!');
			return;
		}

		const viewportCenterX =
			(-$activeBoard.viewport.x + window.innerWidth / 2) / $activeBoard.viewport.zoom;
		const viewportCenterY =
			(-$activeBoard.viewport.y + window.innerHeight / 2) / $activeBoard.viewport.zoom;

		const typeInfo = STORY_ENGINE_CARD_TYPES[card.type];

		// Arrange cards in a nice horizontal spread
		const cardWidth = 400;
		const gap = 20;
		const cardSpacing = cardWidth + gap; // 420px between card starts

		// Calculate total width of all cards: 5 cards + 4 gaps
		const totalWidth = (5 * cardWidth) + (4 * gap); // 2080px

		// Place cards starting from a safe left position
		// Ensure leftmost card is always visible (min 50px from left edge)
		const minLeftMargin = 50;
		let startX = viewportCenterX - (totalWidth / 2);

		// If startX would be negative or too close to edge, adjust it
		if (startX < minLeftMargin) {
			startX = minLeftMargin;
		}

		const xOffset = offsetMultiplier * cardSpacing;
		const finalX = startX + xOffset;
		const finalY = viewportCenterY - 200;

		const nodeData = {
			x: finalX,
			y: finalY,
			width: 400,
			height: 400,
			label: '', // Story Engine cards don't use label
			notes: `Story Engine: ${typeInfo.name}`,
			icon: typeInfo.icon,
			layer: 0,
			groupId: groupId, // Add group ID for moving cards together
			storyEngineCard: {
				type: card.type,
				cues: Array.from(card.cues), // Convert Proxy to plain array
				activeCueIndex: 0, // Start with first cue
				expansion: card.expansion
			}
		};

		storyboardStore.addNode(
			$activeBoard.id,
			nodeData,
			`Generate: Story Engine ${typeInfo.name}`
		);
	}

	// World Builder generation functions
	async function generateWorldBuilderCard() {
		if (!selectedWorldBuilderType || selectedWorldBuilderType === 'microsetting') return;

		isRolling = true;
		try {
			if (preferBridgeCardsWorldBuilder) {
				generatedWorldBuilderCard = await getRandomBridgeWorldBuilderCard(selectedWorldBuilderType as WorldBuilderCardType);
			} else {
				generatedWorldBuilderCard = await getRandomWorldBuilderCard(selectedWorldBuilderType as WorldBuilderCardType);
			}
		} catch (error) {
			console.error('Failed to generate World Builder card:', error);
		} finally {
			isRolling = false;
		}
	}

	async function generateWorldBuilderMicrosetting() {
		isRolling = true;
		try {
			const microsetting = await generateMicrosetting();
			// Convert to array for easy rendering
			generatedMicrosetting = [
				microsetting.region,
				...microsetting.landmarks,
				microsetting.namesake,
				microsetting.origin,
				microsetting.attribute,
				microsetting.advent
			];
		} catch (error) {
			console.error('Failed to generate Microsetting:', error);
		} finally {
			isRolling = false;
		}
	}

	function addWorldBuilderCardToBoard(card: WorldBuilderCard, offsetMultiplier: number = 0, groupId?: string) {
		if (!$activeBoard) return;

		const viewportCenterX =
			(-$activeBoard.viewport.x + window.innerWidth / 2) / $activeBoard.viewport.zoom;
		const viewportCenterY =
			(-$activeBoard.viewport.y + window.innerHeight / 2) / $activeBoard.viewport.zoom;

		const typeInfo = WORLD_BUILDER_CARD_TYPES[card.type];

		// Same spacing logic as Story Engine
		const cardWidth = 400;
		const gap = 20;
		const cardSpacing = cardWidth + gap;
		const totalWidth = (7 * cardWidth) + (6 * gap); // 7 cards for microsetting

		const minLeftMargin = 50;
		let startX = viewportCenterX - (totalWidth / 2);
		if (startX < minLeftMargin) {
			startX = minLeftMargin;
		}

		const xOffset = offsetMultiplier * cardSpacing;
		const finalX = startX + xOffset;
		const finalY = viewportCenterY - 200;

		const nodeData = {
			x: finalX,
			y: finalY,
			width: 400,
			height: 400,
			label: '',
			notes: `World Builder: ${typeInfo.name}`,
			icon: typeInfo.icon,
			layer: 0,
			groupId: groupId,
			worldBuilderCard: {
				type: card.type,
				cues: card.cues ? Array.from(card.cues) : undefined,
				cue: card.cue,
				interpretations: card.interpretations,
				title: card.title,
				summary: card.summary,
				questions: card.questions ? Array.from(card.questions) : undefined,
				activeCueIndex: 0,
				expansion: card.expansion
			}
		};

		storyboardStore.addNode(
			$activeBoard.id,
			nodeData,
			`Generate: World Builder ${typeInfo.name}`
		);
	}

	// Lore Master generation functions
	async function generateLoreCluster() {
		if (!selectedLoreMasterType) return;

		isRolling = true;
		try {
			// Helper to get card with bridge preference
			const getCard = async (type: LoreMasterCardType) => {
				if (preferBridgeCardsLoreMaster) {
					return await getRandomBridgeLoreMasterCard(type);
				} else {
					return await getRandomLoreMasterCard(
						type,
						useDeitiesExpansion, // expansionOnly
						!useDeitiesExpansion // baseOnly
					);
				}
			};

			// Draw primary card of selected type
			const primaryCard = await getCard(selectedLoreMasterType);

			// If expansion mode and card has ⚪ placeholders, pair with deity
			const primaryDeity = useDeitiesExpansion && !preferBridgeCardsLoreMaster ? await pairWithDeityIfNeeded(primaryCard) : null;

			// Draw 4 random secondary cards (any type except modifier and deity)
			const cardTypes: LoreMasterCardType[] = ['faction', 'figure', 'event', 'location', 'object', 'material', 'creature'];
			const availableTypes = cardTypes.filter(t => t !== selectedLoreMasterType); // Avoid same type as primary

			// Shuffle and pick 4 random types for secondary cards
			const shuffled = availableTypes.sort(() => Math.random() - 0.5);

			const topCard = shuffled.length > 0 ? await getCard(shuffled[0]) : null;
			const topDeity = topCard && useDeitiesExpansion && !preferBridgeCardsLoreMaster ? await pairWithDeityIfNeeded(topCard) : null;

			const rightCard = shuffled.length > 1 ? await getCard(shuffled[1]) : null;
			const rightDeity = rightCard && useDeitiesExpansion && !preferBridgeCardsLoreMaster ? await pairWithDeityIfNeeded(rightCard) : null;

			const bottomCard = shuffled.length > 2 ? await getCard(shuffled[2]) : null;
			const bottomDeity = bottomCard && useDeitiesExpansion && !preferBridgeCardsLoreMaster ? await pairWithDeityIfNeeded(bottomCard) : null;

			const leftCard = shuffled.length > 3 ? await getCard(shuffled[3]) : null;
			const leftDeity = leftCard && useDeitiesExpansion && !preferBridgeCardsLoreMaster ? await pairWithDeityIfNeeded(leftCard) : null;

			generatedLoreCluster = {
				primaryCard,
				primaryDeity,
				topCard,
				topDeity,
				rightCard,
				rightDeity,
				bottomCard,
				bottomDeity,
				leftCard,
				leftDeity
			};
		} catch (error) {
			console.error('Failed to generate Lore Cluster:', error);
		} finally {
			isRolling = false;
		}
	}

	function addLoreClusterToBoard() {
		if (!$activeBoard || !generatedLoreCluster) return;

		const viewportCenterX =
			(-$activeBoard.viewport.x + window.innerWidth / 2) / $activeBoard.viewport.zoom;
		const viewportCenterY =
			(-$activeBoard.viewport.y + window.innerHeight / 2) / $activeBoard.viewport.zoom;

		const primaryTypeInfo = LORE_MASTER_CARD_TYPES[generatedLoreCluster.primaryCard.type];

		const nodeData = {
			x: viewportCenterX - 300, // Larger width for cluster
			y: viewportCenterY - 300,
			width: 600, // Larger to accommodate tucked cards
			height: 600,
			label: '',
			notes: `Lore Master's Deck: ${primaryTypeInfo.name} Cluster${useDeitiesExpansion ? ' (Deities Expansion)' : ''}`,
			icon: primaryTypeInfo.emoji,
			layer: 0,
			loreCluster: {
				primaryCard: {
					card: generatedLoreCluster.primaryCard,
					activeCueIndex: 0,
					pairedDeity: generatedLoreCluster.primaryDeity || undefined
				},
				topCard: generatedLoreCluster.topCard ? {
					card: generatedLoreCluster.topCard,
					activeCueIndex: 0,
					position: 'top' as const,
					pairedDeity: generatedLoreCluster.topDeity || undefined
				} : null,
				rightCard: generatedLoreCluster.rightCard ? {
					card: generatedLoreCluster.rightCard,
					activeCueIndex: 0,
					position: 'right' as const,
					pairedDeity: generatedLoreCluster.rightDeity || undefined
				} : null,
				bottomCard: generatedLoreCluster.bottomCard ? {
					card: generatedLoreCluster.bottomCard,
					activeCueIndex: 0,
					position: 'bottom' as const,
					pairedDeity: generatedLoreCluster.bottomDeity || undefined
				} : null,
				leftCard: generatedLoreCluster.leftCard ? {
					card: generatedLoreCluster.leftCard,
					activeCueIndex: 0,
					position: 'left' as const,
					pairedDeity: generatedLoreCluster.leftDeity || undefined
				} : null
			}
		};

		storyboardStore.addNode(
			$activeBoard.id,
			nodeData,
			`Generate: Lore Master ${primaryTypeInfo.name} Cluster`
		);

		// Clear generated cluster
		generatedLoreCluster = null;
	}

	// Bridge Compounds generation functions
	async function generateCompound() {
		if (!selectedCompoundType) return;

		isGeneratingCompound = true;
		try {
			switch (selectedCompoundType) {
				case 'settlement':
					generatedCompound = await generateSettlementStory();
					break;
				case 'faction-territory':
					generatedCompound = await generateFactionTerritory();
					break;
				case 'divine-domain':
					generatedCompound = await generateDivineDomain();
					break;
				case 'adventure-site':
					generatedCompound = await generateAdventureSite();
					break;
			}
		} catch (error) {
			console.error('Failed to generate compound:', error);
		} finally {
			isGeneratingCompound = false;
		}
	}

	function addCompoundToBoard() {
		if (!$activeBoard || !generatedCompound) return;

		const viewportCenterX =
			(-$activeBoard.viewport.x + window.innerWidth / 2) / $activeBoard.viewport.zoom;
		const viewportCenterY =
			(-$activeBoard.viewport.y + window.innerHeight / 2) / $activeBoard.viewport.zoom;

		// Calculate offset to center the compound
		const offsetX = viewportCenterX - 400;
		const offsetY = viewportCenterY - 300;

		// Add all nodes
		const addedNodeIds: string[] = [];
		for (const nodeData of generatedCompound.nodes) {
			const finalNodeData = {
				...nodeData,
				x: (nodeData.x || 0) + offsetX,
				y: (nodeData.y || 0) + offsetY
			};

			const newNode = storyboardStore.addNode(
				$activeBoard.id,
				finalNodeData,
				`Generate Compound: ${selectedCompoundType}`
			);

			if (newNode) {
				addedNodeIds.push(newNode.id);
			}
		}

		// Add connections between nodes
		for (const connection of generatedCompound.connections) {
			if (addedNodeIds[connection.fromIndex] && addedNodeIds[connection.toIndex]) {
				storyboardStore.addConnection($activeBoard.id, {
					fromNodeId: addedNodeIds[connection.fromIndex],
					toNodeId: addedNodeIds[connection.toIndex],
					label: connection.label,
					color: connection.color,
					lineType: connection.lineType || 'solid',
					endMarker: 'arrow'
				});
			}
		}

		// Clear generated compound
		generatedCompound = null;
	}

	async function generateCircleOfFate() {
		if (!$activeBoard) return;

		isGeneratingPattern = true;
		try {
			// Generate 2 agents, 2 engines, and 2 conflicts
			const agent1 = await getRandomCard('agent');
			const agent2 = await getRandomCard('agent');
			const engine1 = await getRandomCard('engine');
			const engine2 = await getRandomCard('engine');
			const conflict1 = await getRandomCard('conflict');
			const conflict2 = await getRandomCard('conflict');

			// Calculate center position (viewport center)
			const viewportCenterX =
				(-$activeBoard.viewport.x + window.innerWidth / 2) / $activeBoard.viewport.zoom;
			const viewportCenterY =
				(-$activeBoard.viewport.y + window.innerHeight / 2) / $activeBoard.viewport.zoom;

			const radius = 450; // Distance from center (increased for larger cards)
			const cardWidth = 400; // Same as normal Story Engine cards
			const cardHeight = 400; // Same as normal Story Engine cards

			// Create a group ID for all cards in this pattern
			const patternGroupId = crypto.randomUUID();

			// Position cards in a circle
			// Agent 1 - Left
			const agent1Node = storyboardStore.addNode(
				$activeBoard.id,
				{
					x: viewportCenterX - radius,
					y: viewportCenterY,
					width: cardWidth,
					height: cardHeight,
					groupId: patternGroupId,
					storyEngineCard: {
						type: 'agent',
						cues: Array.from(agent1.cues),
						activeCueIndex: 0,
						expansion: agent1.expansion
					}
				},
				'Generate Circle of Fate'
			);

			// Engine 1 - Top
			const engine1Node = storyboardStore.addNode(
				$activeBoard.id,
				{
					x: viewportCenterX,
					y: viewportCenterY - radius,
					width: cardWidth,
					height: cardHeight,
					groupId: patternGroupId,
					storyEngineCard: {
						type: 'engine',
						cues: Array.from(engine1.cues),
						activeCueIndex: 0,
						expansion: engine1.expansion
					}
				},
				'Generate Circle of Fate'
			);

			// Agent 2 - Right
			const agent2Node = storyboardStore.addNode(
				$activeBoard.id,
				{
					x: viewportCenterX + radius,
					y: viewportCenterY,
					width: cardWidth,
					height: cardHeight,
					groupId: patternGroupId,
					storyEngineCard: {
						type: 'agent',
						cues: Array.from(agent2.cues),
						activeCueIndex: 0,
						expansion: agent2.expansion
					}
				},
				'Generate Circle of Fate'
			);

			// Engine 2 - Bottom
			const engine2Node = storyboardStore.addNode(
				$activeBoard.id,
				{
					x: viewportCenterX,
					y: viewportCenterY + radius,
					width: cardWidth,
					height: cardHeight,
					groupId: patternGroupId,
					storyEngineCard: {
						type: 'engine',
						cues: Array.from(engine2.cues),
						activeCueIndex: 0,
						expansion: engine2.expansion
					}
				},
				'Generate Circle of Fate'
			);

			// Add conflict cards stacked above each engine
			const gap = 5; // Small gap for tight stacking

			// Conflict 1 - Above Engine 1 (Top)
			if (engine1Node) {
				storyboardStore.addNode(
					$activeBoard.id,
					{
						x: engine1Node.x,
						y: engine1Node.y - cardHeight - gap,
						width: cardWidth,
						height: cardHeight,
						groupId: patternGroupId,
						parentNodeId: engine1Node.id,
						storyEngineCard: {
							type: 'conflict',
							cues: Array.from(conflict1.cues),
							activeCueIndex: 0,
							expansion: conflict1.expansion
						}
					},
					'Generate Circle of Fate'
				);
			}

			// Conflict 2 - Above Engine 2 (Bottom)
			if (engine2Node) {
				storyboardStore.addNode(
					$activeBoard.id,
					{
						x: engine2Node.x,
						y: engine2Node.y - cardHeight - gap,
						width: cardWidth,
						height: cardHeight,
						groupId: patternGroupId,
						parentNodeId: engine2Node.id,
						storyEngineCard: {
							type: 'conflict',
							cues: Array.from(conflict2.cues),
							activeCueIndex: 0,
							expansion: conflict2.expansion
						}
					},
					'Generate Circle of Fate'
				);
			}

			// Add connections in circular pattern
			if (agent1Node && engine1Node && agent2Node && engine2Node) {
				// Agent 1 → Engine 1
				storyboardStore.addConnection($activeBoard.id, agent1Node.id, engine1Node.id);

				// Engine 1 → Agent 2
				storyboardStore.addConnection($activeBoard.id, engine1Node.id, agent2Node.id);

				// Agent 2 → Engine 2
				storyboardStore.addConnection($activeBoard.id, agent2Node.id, engine2Node.id);

				// Engine 2 → Agent 1
				storyboardStore.addConnection($activeBoard.id, engine2Node.id, agent1Node.id);
			}

			// Close the generator panel
			onClose();
		} catch (error) {
			console.error('Failed to generate Circle of Fate:', error);
		} finally {
			isGeneratingPattern = false;
		}
	}


	// Handle escape to close
	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape' && show) {
			onClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

{#if show}
	<div
		class="modal-overlay"
		onclick={onClose}
		onkeydown={(e) => e.key === 'Escape' && onClose()}
		role="button"
		tabindex="0"
		aria-label="Close modal"
	>
		<div class="modal-content" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="-1">
			<div class="modal-header">
				<div class="header-icon">🎲</div>
				<h2 class="modal-title">Generate Story Elements</h2>
				<button class="close-btn" onclick={onClose} aria-label="Close">×</button>
			</div>

			<div class="modal-body">
				<!-- Category selector -->
				<div class="category-grid">
					{#each categories as category (category.type)}
						<button
							class="category-btn {category.type === selectedCategory.type && !isStoryEngineMode && !isWorldBuilderMode ? 'active' : ''}"
							onclick={() => {
								selectedCategory = category;
								selectedTable = null;
								searchQuery = '';
								isStoryEngineMode = false;
								generatedStoryEngineCard = null;
								generatedStorySeed = null;
								selectedStoryEngineType = null;
								isWorldBuilderMode = false;
								generatedWorldBuilderCard = null;
								generatedMicrosetting = null;
								selectedWorldBuilderType = null;
							}}
						>
							<span class="category-icon">{category.icon}</span>
							<span class="category-name">{category.name}</span>
							<span class="category-count">{category.metadata.length}</span>
						</button>
					{/each}
					<!-- Story Engine Category -->
					<button
						class="category-btn story-engine-btn {isStoryEngineMode ? 'active' : ''}"
						onclick={() => {
							isStoryEngineMode = true;
							isWorldBuilderMode = false;
							selectedTable = null;
							searchQuery = '';
							generatedText = '';
							generatedStoryEngineCard = null;
							generatedStorySeed = null;
							selectedStoryEngineType = null;
							generatedWorldBuilderCard = null;
							generatedMicrosetting = null;
							selectedWorldBuilderType = null;
						}}
					>
						<span class="category-icon">{storyEngineCategory.icon}</span>
						<span class="category-name">{storyEngineCategory.name}</span>
						<span class="category-count">6</span>
					</button>
					<!-- World Builder Category -->
					<button
						class="category-btn world-builder-btn {isWorldBuilderMode ? 'active' : ''}"
						onclick={() => {
							isWorldBuilderMode = true;
							isStoryEngineMode = false;
							isLoreMasterMode = false;
							selectedTable = null;
							searchQuery = '';
							generatedText = '';
							generatedWorldBuilderCard = null;
							generatedMicrosetting = null;
							selectedWorldBuilderType = null;
							generatedStoryEngineCard = null;
							generatedStorySeed = null;
							selectedStoryEngineType = null;
							generatedLoreCluster = null;
							selectedLoreMasterType = null;
						}}
					>
						<span class="category-icon">{worldBuilderCategory.icon}</span>
						<span class="category-name">{worldBuilderCategory.name}</span>
						<span class="category-count">11</span>
					</button>
					<!-- Lore Master Category -->
					<button
						class="category-btn lore-master-btn {isLoreMasterMode ? 'active' : ''}"
						onclick={() => {
							isLoreMasterMode = true;
							isStoryEngineMode = false;
							isWorldBuilderMode = false;
							isBridgeCompoundsMode = false;
							selectedTable = null;
							searchQuery = '';
							generatedText = '';
							generatedLoreCluster = null;
							selectedLoreMasterType = null;
							generatedWorldBuilderCard = null;
							generatedMicrosetting = null;
							selectedWorldBuilderType = null;
							generatedStoryEngineCard = null;
							generatedStorySeed = null;
							selectedStoryEngineType = null;
							generatedCompound = null;
							selectedCompoundType = null;
						}}
					>
						<span class="category-icon">{loreMasterCategory.icon}</span>
						<span class="category-name">{loreMasterCategory.name}</span>
						<span class="category-count">7</span>
					</button>
					<!-- Bridge Compounds Category -->
					<button
						class="category-btn bridge-compounds-btn {isBridgeCompoundsMode ? 'active' : ''}"
						onclick={() => {
							isBridgeCompoundsMode = true;
							isLoreMasterMode = false;
							isStoryEngineMode = false;
							isWorldBuilderMode = false;
							selectedTable = null;
							searchQuery = '';
							generatedText = '';
							generatedLoreCluster = null;
							selectedLoreMasterType = null;
							generatedWorldBuilderCard = null;
							generatedMicrosetting = null;
							selectedWorldBuilderType = null;
							generatedStoryEngineCard = null;
							generatedStorySeed = null;
							selectedStoryEngineType = null;
							generatedCompound = null;
							selectedCompoundType = null;
						}}
					>
						<span class="category-icon">{bridgeCompoundsCategory.icon}</span>
						<span class="category-name">{bridgeCompoundsCategory.name}</span>
						<span class="category-count">4</span>
					</button>
			<!-- Complex Patterns Category -->
			<button
				class="category-btn complex-patterns-btn {isComplexPatternsMode ? 'active' : ''}"
				onclick={() => {
					isComplexPatternsMode = true;
					isBridgeCompoundsMode = false;
					isLoreMasterMode = false;
					isStoryEngineMode = false;
					isWorldBuilderMode = false;
					selectedTable = null;
					searchQuery = '';
					generatedText = '';
					generatedLoreCluster = null;
					selectedLoreMasterType = null;
					generatedWorldBuilderCard = null;
					generatedMicrosetting = null;
					selectedWorldBuilderType = null;
					generatedStoryEngineCard = null;
					generatedStorySeed = null;
					selectedStoryEngineType = null;
					generatedCompound = null;
					selectedCompoundType = null;
					selectedPatternType = null;
				}}
			>
				<span class="category-icon">{complexPatternsCategory.icon}</span>
				<span class="category-name">{complexPatternsCategory.name}</span>
				<span class="category-count">1</span>
			</button>
				</div>

				{#if !isStoryEngineMode && !isWorldBuilderMode && !isLoreMasterMode && !isBridgeCompoundsMode && !isComplexPatternsMode}
					<!-- Search bar -->
					<div class="search-bar">
						<span class="search-icon">🔍</span>
						<input
							type="text"
							bind:value={searchQuery}
							placeholder="Search {selectedCategory.name.toLowerCase()} tables..."
							class="search-input"
						/>
					</div>

					<!-- Table list -->
					<div class="table-list">
						{#each filteredTables as table (table.title)}
							<button
								class="table-item {table === selectedTable ? 'selected' : ''}"
								onclick={() => (selectedTable = table)}
							>
								<span class="table-name">{table.title}</span>
							</button>
						{/each}
					</div>
				{:else if isWorldBuilderMode}
					<!-- World Builder card type selector -->
					<div class="story-engine-header">
						<h3 class="story-engine-title">Select Card Type</h3>
						<button class="help-btn" onclick={() => (showWorldBuilderHelp = true)} title="How to use World Builder">
							<span class="help-icon">?</span>
							<span class="help-text">Help</span>
						</button>
					</div>

					<!-- Bridge Cards Toggle -->
					<div class="expansion-toggle-section">
						<label class="expansion-toggle bridge-toggle">
							<input type="checkbox" bind:checked={preferBridgeCardsWorldBuilder} onchange={() => { generatedWorldBuilderCard = null; generatedMicrosetting = null; }} />
							<span class="expansion-label">
								<span class="expansion-icon">🌉</span>
								<span class="expansion-text">Prefer Bridge Cards</span>
							</span>
						</label>
						{#if preferBridgeCardsWorldBuilder}
							<div class="expansion-note bridge-note">
								Cards with cross-deck links will be prioritized
							</div>
						{/if}
					</div>

					<div class="story-engine-types">
						{#each Object.values(WORLD_BUILDER_CARD_TYPES).filter(t => !preferBridgeCardsWorldBuilder || BRIDGE_AVAILABLE_TYPES['world-builder'].includes(t.name)) as typeInfo}
							<button
								class="story-engine-type-btn {selectedWorldBuilderType === typeInfo.type ? 'selected' : ''}"
								onclick={() => {
									selectedWorldBuilderType = typeInfo.type;
									generatedWorldBuilderCard = null;
									generatedMicrosetting = null;
								}}
							>
								<span class="type-icon">{typeInfo.icon}</span>
								<div class="type-info">
									<span class="type-name">{typeInfo.name}</span>
									<span class="type-desc">{typeInfo.description}</span>
								</div>
							</button>
						{/each}
						<!-- Microsetting option -->
						{#if !preferBridgeCardsWorldBuilder}
						<button
							class="story-engine-type-btn story-seed-btn {selectedWorldBuilderType === 'microsetting' ? 'selected' : ''}"
							onclick={() => {
								selectedWorldBuilderType = 'microsetting';
								generatedWorldBuilderCard = null;
								generatedMicrosetting = null;
							}}
						>
							<span class="type-icon">🗺️</span>
							<div class="type-info">
								<span class="type-name">Microsetting</span>
								<span class="type-desc">Complete worldbuilding prompt (6+ cards)</span>
							</div>
						</button>
						{/if}
					</div>
				{:else if isLoreMasterMode}
					<!-- Lore Master card type selector -->
					<div class="story-engine-header">
						<h3 class="story-engine-title">Select Card Type</h3>
					</div>

					<!-- Deities Expansion Toggle -->
					<div class="expansion-toggle-section">
						<label class="expansion-toggle">
							<input type="checkbox" bind:checked={useDeitiesExpansion} onchange={() => { generatedLoreCluster = null; }} />
							<span class="expansion-label">
								<span class="expansion-icon">✨</span>
								<span class="expansion-text">Use Deities Expansion</span>
							</span>
						</label>
						{#if useDeitiesExpansion}
							<div class="expansion-note">
								Expansion cards will be paired with Deity cards
							</div>
						{/if}
					</div>

					<!-- Bridge Cards Toggle -->
					<div class="expansion-toggle-section">
						<label class="expansion-toggle bridge-toggle">
							<input type="checkbox" bind:checked={preferBridgeCardsLoreMaster} onchange={() => { generatedLoreCluster = null; }} />
							<span class="expansion-label">
								<span class="expansion-icon">🌉</span>
								<span class="expansion-text">Prefer Bridge Cards</span>
							</span>
						</label>
						{#if preferBridgeCardsLoreMaster}
							<div class="expansion-note bridge-note">
								Cards with cross-deck links will be prioritized
							</div>
						{/if}
					</div>

					<div class="story-engine-types">
						{#each Object.values(LORE_MASTER_CARD_TYPES).filter(t => t.type !== 'modifier' && t.type !== 'deity') as typeInfo}
							<button
								class="story-engine-type-btn {selectedLoreMasterType === typeInfo.type ? 'selected' : ''}"
								onclick={() => {
									selectedLoreMasterType = typeInfo.type;
									generatedLoreCluster = null;
								}}
							>
								<span class="type-icon">{typeInfo.emoji}</span>
								<div class="type-info">
									<span class="type-name">{typeInfo.name}</span>
									<span class="type-desc">{typeInfo.description}</span>
								</div>
							</button>
						{/each}
					</div>
				{:else if isBridgeCompoundsMode}
					<!-- Bridge Compounds type selector -->
					<div class="story-engine-header">
						<h3 class="story-engine-title">Select Compound Type</h3>
					</div>
					<div class="story-engine-types compound-types">
						<button
							class="story-engine-type-btn compound-type-btn {selectedCompoundType === 'settlement' ? 'selected' : ''}"
							onclick={() => {
								selectedCompoundType = 'settlement';
								generatedCompound = null;
							}}
						>
							<span class="type-icon">🏰</span>
							<div class="type-info">
								<span class="type-name">Settlement Story</span>
								<span class="type-desc">Landmark + Location cluster (6 cards)</span>
							</div>
						</button>
						<button
							class="story-engine-type-btn compound-type-btn {selectedCompoundType === 'faction-territory' ? 'selected' : ''}"
							onclick={() => {
								selectedCompoundType = 'faction-territory';
								generatedCompound = null;
							}}
						>
							<span class="type-icon">🗺️</span>
							<div class="type-info">
								<span class="type-name">Faction Territory</span>
								<span class="type-desc">Microsetting + Faction (12 cards)</span>
							</div>
						</button>
						<button
							class="story-engine-type-btn compound-type-btn {selectedCompoundType === 'divine-domain' ? 'selected' : ''}"
							onclick={() => {
								selectedCompoundType = 'divine-domain';
								generatedCompound = null;
							}}
						>
							<span class="type-icon">⚡</span>
							<div class="type-info">
								<span class="type-name">Divine Domain</span>
								<span class="type-desc">Deity + Sacred lands + Worshippers (13+ cards)</span>
							</div>
						</button>
						<button
							class="story-engine-type-btn compound-type-btn {selectedCompoundType === 'adventure-site' ? 'selected' : ''}"
							onclick={() => {
								selectedCompoundType = 'adventure-site';
								generatedCompound = null;
							}}
						>
							<span class="type-icon">🎭</span>
							<div class="type-info">
								<span class="type-name">Adventure Site</span>
								<span class="type-desc">All 3 decks combined (14+ cards)</span>
							</div>
						</button>
					</div>
t		{:else if isComplexPatternsMode}
				<!-- Complex Patterns type selector -->
				<div class="story-engine-header">
					<h3 class="story-engine-title">Select Pattern Type</h3>
				</div>
				<div class="story-engine-types pattern-types">
					<button
						class="story-engine-type-btn pattern-type-btn {selectedPatternType === 'circle-of-fate' ? 'selected' : ''}"
						onclick={() => {
							selectedPatternType = 'circle-of-fate';
						}}
					>
						<span class="type-icon">🔄</span>
						<div class="type-info">
							<span class="type-name">Circle of Fate</span>
							<span class="type-desc">2 Agents + 2 Engines in circular relationship</span>
						</div>
					</button>
				</div>
				{:else}
					<!-- Story Engine card type selector -->
					<div class="story-engine-header">
						<h3 class="story-engine-title">Select Card Type</h3>
						<button class="help-btn" onclick={() => (showStoryEngineHelp = true)} title="How to use Story Engine">
							<span class="help-icon">?</span>
							<span class="help-text">Help</span>
						</button>
					</div>

					<!-- Bridge Cards Toggle -->
					<div class="expansion-toggle-section">
						<label class="expansion-toggle bridge-toggle">
							<input type="checkbox" bind:checked={preferBridgeCardsStoryEngine} onchange={() => { generatedStoryEngineCard = null; generatedStorySeed = null; }} />
							<span class="expansion-label">
								<span class="expansion-icon">🌉</span>
								<span class="expansion-text">Prefer Bridge Cards</span>
							</span>
						</label>
						{#if preferBridgeCardsStoryEngine}
							<div class="expansion-note bridge-note">
								Cards with cross-deck links will be prioritized
							</div>
						{/if}
					</div>

					<div class="story-engine-types">
						{#each Object.values(STORY_ENGINE_CARD_TYPES).filter(t => !preferBridgeCardsStoryEngine || BRIDGE_AVAILABLE_TYPES['story-engine'].includes(t.name)) as typeInfo}
							<button
								class="story-engine-type-btn {selectedStoryEngineType === typeInfo.type ? 'selected' : ''}"
								onclick={() => {
									selectedStoryEngineType = typeInfo.type;
									generatedStoryEngineCard = null;
									generatedStorySeed = null;
								}}
							>
								<span class="type-icon">{typeInfo.icon}</span>
								<div class="type-info">
									<span class="type-name">{typeInfo.name}</span>
									<span class="type-desc">{typeInfo.description}</span>
								</div>
							</button>
						{/each}
						<!-- Story Seed option -->
						{#if !preferBridgeCardsStoryEngine}
						<button
							class="story-engine-type-btn story-seed-btn {selectedStoryEngineType === 'story-seed' ? 'selected' : ''}"
							onclick={() => {
								selectedStoryEngineType = 'story-seed';
								generatedStoryEngineCard = null;
								generatedStorySeed = null;
							}}
						>
							<span class="type-icon">✨</span>
							<div class="type-info">
								<span class="type-name">Story Seed</span>
								<span class="type-desc">Complete 5-card prompt</span>
							</div>
						</button>
						{/if}
					</div>
				{/if}

				<!-- Roll section -->
				{#if !isStoryEngineMode && !isWorldBuilderMode && selectedTable}
					<!-- Regular table generation -->
					<div class="roll-section">
						<div class="selected-table">
							<span class="label">Selected:</span>
							<span class="value">{selectedTable.title}</span>
						</div>

						{#if !generatedText}
							<button class="roll-btn" onclick={rollTable} disabled={isRolling}>
								{#if isRolling}
									<span class="rolling">🎲 Rolling...</span>
								{:else}
									<span>🎲 Roll Table</span>
								{/if}
							</button>
						{:else}
							<div class="result-display">
								<div class="result-label">Result:</div>
								<div class="result-text">{generatedText}</div>
							</div>

							<div class="action-buttons">
								<button class="add-btn" onclick={addToStoryboard}> ✓ Add to Storyboard </button>
								<button class="reroll-btn" onclick={rollTable}> 🔄 Reroll </button>
							</div>
						{/if}
					</div>
				{:else if isStoryEngineMode && selectedStoryEngineType}
					<!-- Story Engine generation -->
					<div class="roll-section story-engine-roll">
						{#if selectedStoryEngineType !== 'story-seed'}
							<!-- Single card generation -->
							{#if !generatedStoryEngineCard}
								<button class="roll-btn" onclick={generateStoryEngineCard} disabled={isRolling}>
									{#if isRolling}
										<span class="rolling">🎲 Drawing...</span>
									{:else}
										<span>🎲 Draw Card</span>
									{/if}
								</button>
							{:else}
								<div class="story-engine-result">
									<div class="result-label">
										{STORY_ENGINE_CARD_TYPES[generatedStoryEngineCard.type].icon}
										{STORY_ENGINE_CARD_TYPES[generatedStoryEngineCard.type].name}
									</div>
									<div class="cues-preview">
										{#each generatedStoryEngineCard.cues as cue, index}
											<div class="cue-preview-item">
												<span class="cue-number">{index + 1}.</span>
												<span class="cue-preview-text">{cue}</span>
											</div>
										{/each}
									</div>
								</div>

								<div class="action-buttons">
									<button
										class="add-btn"
										onclick={() => {
											addStoryEngineCardToBoard(generatedStoryEngineCard!);
											generatedStoryEngineCard = null;
										}}
									>
										✓ Add to Storyboard
									</button>
									<button class="reroll-btn" onclick={generateStoryEngineCard}> 🔄 Draw Again </button>
								</div>
							{/if}
						{:else}
							<!-- Story Seed generation (5 cards) -->
							{#if !generatedStorySeed}
								<button class="roll-btn" onclick={generateStoryEngineStorySeed} disabled={isRolling}>
									{#if isRolling}
										<span class="rolling">🎲 Generating...</span>
									{:else}
										<span>✨ Generate Story Seed</span>
									{/if}
								</button>
							{:else}
								<div class="story-seed-result">
									<div class="result-label">Story Seed - Add cards one by one:</div>
									{#each generatedStorySeed as card, index}
										{@const typeInfo = STORY_ENGINE_CARD_TYPES[card.type]}
										<div class="story-seed-card">
											<div class="seed-card-header">
												<span class="seed-card-icon">{typeInfo.icon}</span>
												<span class="seed-card-type">{typeInfo.name}</span>
												<span class="seed-card-cue">{card.cues[0]}</span>
											</div>
											<button
												class="add-seed-btn"
												onclick={() => {
													addStoryEngineCardToBoard(card, index);
												}}
											>
												+ Add
											</button>
										</div>
									{/each}
								</div>

								<div class="action-buttons">
									<button
										class="add-btn"
										onclick={() => {
											// Generate a single groupId for all cards in this Story Seed
											const storySeedGroupId = crypto.randomUUID();
											generatedStorySeed!.forEach((card, index) => {
												addStoryEngineCardToBoard(card, index, storySeedGroupId);
											});
											generatedStorySeed = null;
										}}
									>
										✓ Add All to Storyboard
									</button>
									<button class="reroll-btn" onclick={generateStoryEngineStorySeed}>
										🔄 Generate New Seed
									</button>
								</div>
							{/if}
						{/if}
					</div>
				{:else if isWorldBuilderMode && selectedWorldBuilderType}
					<!-- World Builder generation -->
					<div class="roll-section story-engine-roll">
						{#if selectedWorldBuilderType !== 'microsetting'}
							<!-- Single card generation -->
							{#if !generatedWorldBuilderCard}
								<button class="roll-btn" onclick={generateWorldBuilderCard} disabled={isRolling}>
									{#if isRolling}
										<span class="rolling">🎲 Drawing...</span>
									{:else}
										<span>🎲 Draw Card</span>
									{/if}
								</button>
							{:else}
								<div class="story-engine-result">
									<div class="result-label">
										{WORLD_BUILDER_CARD_TYPES[generatedWorldBuilderCard.type].icon}
										{WORLD_BUILDER_CARD_TYPES[generatedWorldBuilderCard.type].name}
									</div>
									<div class="cues-preview">
										{#if generatedWorldBuilderCard.type === 'adventure'}
											<!-- Adventure card with title, summary, and question cues -->
											{#if generatedWorldBuilderCard.title}
												<div class="adventure-title-preview">
													<span class="adventure-label">Quest:</span>
													<span class="adventure-title-text">{generatedWorldBuilderCard.title}</span>
												</div>
											{/if}
											{#if generatedWorldBuilderCard.summary}
												<div class="adventure-summary-preview">
													<span class="adventure-label">Summary:</span>
													<span class="adventure-summary-text">{generatedWorldBuilderCard.summary}</span>
												</div>
											{/if}
											{#if generatedWorldBuilderCard.cues}
												<div class="adventure-questions">
													<span class="adventure-label">Questions:</span>
													{#each generatedWorldBuilderCard.cues as cue, index}
														<div class="cue-preview-item">
															<span class="cue-number">{index + 1}.</span>
															<span class="cue-preview-text">{cue}</span>
														</div>
													{/each}
												</div>
											{/if}
										{:else if generatedWorldBuilderCard.type === 'keyhole'}
											<!-- Keyhole card with cultural questions -->
											{#if generatedWorldBuilderCard.questions}
												<div class="keyhole-questions">
													<span class="keyhole-label">Cultural Questions:</span>
													{#each generatedWorldBuilderCard.questions as question, index}
														<div class="cue-preview-item">
															<span class="cue-number">{index + 1}.</span>
															<span class="cue-preview-text">{question}</span>
														</div>
													{/each}
												</div>
											{/if}
										{:else if generatedWorldBuilderCard.type === 'opus'}
											<!-- Opus card: Lore format prompts -->
											{#if generatedWorldBuilderCard.cues}
												<div class="opus-cues">
													<span class="opus-label">Lore Formats:</span>
													{#each generatedWorldBuilderCard.cues as cue, index}
														<div class="cue-preview-item">
															<span class="cue-number">{index + 1}.</span>
															<span class="cue-preview-text">{cue}</span>
														</div>
													{/each}
												</div>
											{/if}
										{:else if generatedWorldBuilderCard.type === 'flourish'}
											<!-- Flourish card: Stylistic modifiers -->
											{#if generatedWorldBuilderCard.cues}
												<div class="flourish-cues">
													<span class="flourish-label">Stylistic Quirks:</span>
													{#each generatedWorldBuilderCard.cues as cue, index}
														<div class="cue-preview-item">
															<span class="cue-number">{index + 1}.</span>
															<span class="cue-preview-text">{cue}</span>
														</div>
													{/each}
												</div>
											{/if}
										{:else if generatedWorldBuilderCard.cues}
											{#each generatedWorldBuilderCard.cues as cue, index}
												<div class="cue-preview-item">
													<span class="cue-number">{index + 1}.</span>
													<span class="cue-preview-text">{cue}</span>
												</div>
											{/each}
										{:else if generatedWorldBuilderCard.cue}
											<div class="cue-preview-item">
												<span class="cue-preview-text">{generatedWorldBuilderCard.cue}</span>
											</div>
											{#if generatedWorldBuilderCard.interpretations}
												<div class="interpretations">
													<div class="interpretations-label">Interpretations:</div>
													{#each generatedWorldBuilderCard.interpretations as interpretation}
														<div class="interpretation-item">• {interpretation}</div>
													{/each}
												</div>
											{/if}
										{/if}
									</div>
								</div>

								<div class="action-buttons">
									<button
										class="add-btn"
										onclick={() => {
											addWorldBuilderCardToBoard(generatedWorldBuilderCard!);
											generatedWorldBuilderCard = null;
										}}
									>
										✓ Add to Storyboard
									</button>
									<button class="reroll-btn" onclick={generateWorldBuilderCard}> 🔄 Draw Again </button>
								</div>
							{/if}
						{:else}
							<!-- Microsetting generation (6+ cards) -->
							{#if !generatedMicrosetting}
								<button class="roll-btn" onclick={generateWorldBuilderMicrosetting} disabled={isRolling}>
									{#if isRolling}
										<span class="rolling">🎲 Generating...</span>
									{:else}
										<span>🗺️ Generate Microsetting</span>
									{/if}
								</button>
							{:else}
								<div class="story-seed-result">
									<div class="result-label">Microsetting - Add cards one by one:</div>
									{#each generatedMicrosetting as card, index}
										{@const typeInfo = WORLD_BUILDER_CARD_TYPES[card.type]}
										<div class="story-seed-card">
											<div class="seed-card-header">
												<span class="seed-card-icon">{typeInfo.icon}</span>
												<span class="seed-card-type">{typeInfo.name}</span>
												<span class="seed-card-cue">{card.cues ? card.cues[0] : card.cue}</span>
											</div>
											<button
												class="add-seed-btn"
												onclick={() => {
													addWorldBuilderCardToBoard(card, index);
												}}
											>
												+ Add
											</button>
										</div>
									{/each}
								</div>

								<div class="action-buttons">
									<button
										class="add-btn"
										onclick={() => {
											const microsettingGroupId = crypto.randomUUID();
											generatedMicrosetting!.forEach((card, index) => {
												addWorldBuilderCardToBoard(card, index, microsettingGroupId);
											});
											generatedMicrosetting = null;
										}}
									>
										✓ Add All to Storyboard
									</button>
									<button class="reroll-btn" onclick={generateWorldBuilderMicrosetting}>
										🔄 Generate New Microsetting
									</button>
								</div>
							{/if}
						{/if}
					</div>
				{:else if isLoreMasterMode && selectedLoreMasterType}
					<!-- Lore Master cluster generation -->
					<div class="roll-section story-engine-roll">
						{#if !generatedLoreCluster}
							<button class="roll-btn" onclick={generateLoreCluster} disabled={isRolling}>
								{#if isRolling}
									<span class="rolling">🎲 Drawing...</span>
								{:else}
									<span>🎲 Draw Cluster (5 cards)</span>
								{/if}
							</button>
						{:else}
							<div class="lore-cluster-result">
								<div class="result-label">
									{LORE_MASTER_CARD_TYPES[selectedLoreMasterType].emoji}
									{LORE_MASTER_CARD_TYPES[selectedLoreMasterType].name} Cluster
								</div>
								<div class="cluster-preview">
									<!-- Primary Card -->
									<div class="cluster-card primary-card">
										<div class="cluster-card-header">
											<span class="cluster-card-icon">{LORE_MASTER_CARD_TYPES[generatedLoreCluster.primaryCard.type].emoji}</span>
											<span class="cluster-card-type">{LORE_MASTER_CARD_TYPES[generatedLoreCluster.primaryCard.type].name}</span>
										</div>
										<div class="cluster-card-cues">
											<div class="cue-type-label">Primary Cues:</div>
											{#each generatedLoreCluster.primaryCard.primaryCues as cue, index}
												<div class="cue-preview-item">
													<span class="cue-number">{index + 1}.</span>
													<span class="cue-preview-text">{cue}</span>
												</div>
											{/each}
											<div class="cue-type-label">Secondary Cues:</div>
											{#each generatedLoreCluster.primaryCard.secondaryCues as cue, index}
												<div class="cue-preview-item">
													<span class="cue-number">{index + 1}.</span>
													<span class="cue-preview-text">{cue}</span>
												</div>
											{/each}
										</div>
									</div>

									<!-- Secondary Cards -->
									<div class="secondary-cards-preview">
										{#if generatedLoreCluster.topCard}
											<div class="cluster-card secondary-card">
												<div class="cluster-card-header">
													<span class="position-badge">Top</span>
													<span class="cluster-card-icon">{LORE_MASTER_CARD_TYPES[generatedLoreCluster.topCard.type].emoji}</span>
													<span class="cluster-card-type">{LORE_MASTER_CARD_TYPES[generatedLoreCluster.topCard.type].name}</span>
												</div>
												<div class="cluster-card-cues compact">
													{#each generatedLoreCluster.topCard.secondaryCues.slice(0, 2) as cue}
														<div class="cue-preview-item small">• {cue}</div>
													{/each}
												</div>
											</div>
										{/if}
										{#if generatedLoreCluster.rightCard}
											<div class="cluster-card secondary-card">
												<div class="cluster-card-header">
													<span class="position-badge">Right</span>
													<span class="cluster-card-icon">{LORE_MASTER_CARD_TYPES[generatedLoreCluster.rightCard.type].emoji}</span>
													<span class="cluster-card-type">{LORE_MASTER_CARD_TYPES[generatedLoreCluster.rightCard.type].name}</span>
												</div>
												<div class="cluster-card-cues compact">
													{#each generatedLoreCluster.rightCard.secondaryCues.slice(0, 2) as cue}
														<div class="cue-preview-item small">• {cue}</div>
													{/each}
												</div>
											</div>
										{/if}
										{#if generatedLoreCluster.bottomCard}
											<div class="cluster-card secondary-card">
												<div class="cluster-card-header">
													<span class="position-badge">Bottom</span>
													<span class="cluster-card-icon">{LORE_MASTER_CARD_TYPES[generatedLoreCluster.bottomCard.type].emoji}</span>
													<span class="cluster-card-type">{LORE_MASTER_CARD_TYPES[generatedLoreCluster.bottomCard.type].name}</span>
												</div>
												<div class="cluster-card-cues compact">
													{#each generatedLoreCluster.bottomCard.secondaryCues.slice(0, 2) as cue}
														<div class="cue-preview-item small">• {cue}</div>
													{/each}
												</div>
											</div>
										{/if}
										{#if generatedLoreCluster.leftCard}
											<div class="cluster-card secondary-card">
												<div class="cluster-card-header">
													<span class="position-badge">Left</span>
													<span class="cluster-card-icon">{LORE_MASTER_CARD_TYPES[generatedLoreCluster.leftCard.type].emoji}</span>
													<span class="cluster-card-type">{LORE_MASTER_CARD_TYPES[generatedLoreCluster.leftCard.type].name}</span>
												</div>
												<div class="cluster-card-cues compact">
													{#each generatedLoreCluster.leftCard.secondaryCues.slice(0, 2) as cue}
														<div class="cue-preview-item small">• {cue}</div>
													{/each}
												</div>
											</div>
										{/if}
									</div>
								</div>
							</div>

							<div class="action-buttons">
								<button class="add-btn" onclick={addLoreClusterToBoard}>
									✓ Add to Storyboard
								</button>
								<button class="reroll-btn" onclick={generateLoreCluster}> 🔄 Draw New Cluster </button>
							</div>
						{/if}
					</div>
				{:else if isBridgeCompoundsMode && selectedCompoundType}
					<!-- Bridge Compounds generation -->
					<div class="roll-section story-engine-roll">
						{#if !generatedCompound}
							<button class="roll-btn compound-btn" onclick={generateCompound} disabled={isGeneratingCompound}>
								{#if isGeneratingCompound}
									<span class="rolling">✨ Generating...</span>
								{:else}
									<span>🌉 Generate Compound</span>
								{/if}
							</button>
						{:else}
							<div class="compound-result">
								<div class="result-label">
									🌉 {selectedCompoundType === 'settlement' ? 'Settlement Story' :
										selectedCompoundType === 'faction-territory' ? 'Faction Territory' :
										selectedCompoundType === 'divine-domain' ? 'Divine Domain' : 'Adventure Site'}
								</div>
								<div class="compound-preview">
									<div class="compound-stats">
										<div class="stat-item">
											<span class="stat-icon">📇</span>
											<span class="stat-value">{generatedCompound.nodes.length}</span>
											<span class="stat-label">Cards</span>
										</div>
										<div class="stat-item">
											<span class="stat-icon">🔗</span>
											<span class="stat-value">{generatedCompound.connections.length}</span>
											<span class="stat-label">Connections</span>
										</div>
										<div class="stat-item">
											<span class="stat-icon">📐</span>
											<span class="stat-value">{generatedCompound.layout}</span>
											<span class="stat-label">Layout</span>
										</div>
									</div>
									<div class="compound-description">
										{#if selectedCompoundType === 'settlement'}
											<p>Creates a settlement with geographic location and lore details.</p>
											<ul>
												<li>1 World Builder Landmark card</li>
												<li>1 Lore Master Location cluster (5 cards)</li>
												<li>Auto-connected with bridge relationship</li>
											</ul>
										{:else if selectedCompoundType === 'faction-territory'}
											<p>Creates a complete region with the faction that controls it.</p>
											<ul>
												<li>1 Microsetting (7 cards: region, landmarks, namesake, origin, attribute, advent)</li>
												<li>1 Lore Master Faction cluster (5 cards)</li>
												<li>Multiple connections showing control and history</li>
											</ul>
										{:else if selectedCompoundType === 'divine-domain'}
											<p>Creates a complete deity worship system with sacred geography.</p>
											<ul>
												<li>1 Deity card (center)</li>
												<li>1 Sacred Region + 1 Temple/Shrine</li>
												<li>1 Faction (worshippers) cluster (5 cards)</li>
												<li>1 Location (temple interior) cluster (5 cards)</li>
												<li>1 Divine attribute card</li>
												<li>Radial layout with deity at center</li>
											</ul>
										{:else}
											<p>Creates a complete adventure location combining all three decks.</p>
											<ul>
												<li>Story Engine: Conflict + Aspect (plot hooks)</li>
												<li>World Builder: Region, Landmark, Origin, Attribute (geography)</li>
												<li>Lore Master: Location cluster + Faction cluster (people & things)</li>
												<li>Narrative connections throughout</li>
											</ul>
										{/if}
									</div>
								</div>
							</div>

							<div class="action-buttons">
								<button class="add-btn compound-add-btn" onclick={addCompoundToBoard}>
									✓ Add All to Storyboard
								</button>
								<button class="reroll-btn" onclick={generateCompound}>
									🔄 Generate New Compound
								</button>
							</div>
						{/if}
					</div>
t		{:else if isComplexPatternsMode && selectedPatternType}
				<!-- Complex Patterns generation -->
				<div class="roll-section story-engine-roll">
					{#if !isGeneratingPattern}
						<button class="roll-btn pattern-btn" onclick={generateCircleOfFate} disabled={isGeneratingPattern}>
							{#if isGeneratingPattern}
								<span class="rolling">✨ Generating...</span>
							{:else}
								<span>🔄 Generate Circle of Fate</span>
							{/if}
						</button>
					{:else}
						<div class="pattern-generating">
							<span class="generating-icon">✨</span>
							<span class="generating-text">Generating Circle of Fate pattern...</span>
						</div>
					{/if}
				</div>
				{:else}
					<div class="placeholder">
						<p class="placeholder-icon">{isComplexPatternsMode ? '🔄' : isBridgeCompoundsMode ? '🌉' : isLoreMasterMode ? '📜' : isWorldBuilderMode ? '🌍' : isStoryEngineMode ? '📖' : selectedCategory.icon}</p>
						<p class="placeholder-text">
							{isComplexPatternsMode ? 'Select a pattern type to generate' : isBridgeCompoundsMode ? 'Select a compound type to generate' : isLoreMasterMode ? 'Select a card type to generate' : isWorldBuilderMode ? 'Select a card type to generate' : isStoryEngineMode ? 'Select a card type to generate' : 'Select a table to generate content'}
						</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<!-- Story Engine Help Modal -->
{#if showStoryEngineHelp}
	<div
		class="modal-overlay"
		onclick={() => (showStoryEngineHelp = false)}
		onkeydown={(e) => e.key === 'Escape' && (showStoryEngineHelp = false)}
		role="button"
		tabindex="0"
		aria-label="Close help"
	>
		<div class="help-modal" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="-1">
			<div class="help-header">
				<h2 class="help-title">📖 Story Engine Guide</h2>
				<button class="close-btn" onclick={() => (showStoryEngineHelp = false)}>×</button>
			</div>

			<div class="help-content">
				<section class="help-section">
					<h3>What is Story Engine?</h3>
					<p>Story Engine is a storytelling card system that helps you create characters, conflicts, and complete story prompts through visual card arrangements. Combine five card types to generate everything from simple character concepts to complex multi-character narratives.</p>
				</section>

				<section class="help-section">
					<h3>Card Types</h3>
					<div class="card-types-grid">
						<div class="card-type-help">
							<span class="type-help-icon">🟠</span>
							<div class="type-help-info">
								<strong>Agent</strong>
								<p>Characters who make choices. People, creatures, or entities.</p>
								<em>Examples: Caretaker, Detective, Scholar</em>
							</div>
						</div>
						<div class="card-type-help">
							<span class="type-help-icon">🟣</span>
							<div class="type-help-info">
								<strong>Engine</strong>
								<p>What characters want or how they relate to others.</p>
								<em>Examples: "wants to protect", "is hunting"</em>
							</div>
						</div>
						<div class="card-type-help">
							<span class="type-help-icon">🔵</span>
							<div class="type-help-info">
								<strong>Anchor</strong>
								<p>Objects, places, or events that ground the story.</p>
								<em>Examples: Ship, Tower, Artifact, Storm</em>
							</div>
						</div>
						<div class="card-type-help">
							<span class="type-help-icon">🔴</span>
							<div class="type-help-info">
								<strong>Conflict</strong>
								<p>Problems, consequences, or dilemmas.</p>
								<em>Examples: "time is running out", "it's forbidden"</em>
							</div>
						</div>
						<div class="card-type-help">
							<span class="type-help-icon">🟢</span>
							<div class="type-help-info">
								<strong>Aspect</strong>
								<p>Adjectives that modify other cards.</p>
								<em>Examples: Ancient, Haunted, Forgotten</em>
							</div>
						</div>
					</div>
				</section>

				<section class="help-section">
					<h3>How to Use</h3>
					<div class="usage-steps">
						<div class="usage-step">
							<span class="step-number">1</span>
							<div class="step-content">
								<strong>Generate Cards</strong>
								<p>Choose a card type and click "Draw Card", or generate a complete "Story Seed" (5 cards).</p>
							</div>
						</div>
						<div class="usage-step">
							<span class="step-number">2</span>
							<div class="step-content">
								<strong>Add to Storyboard</strong>
								<p>Click "Add to Storyboard" to place cards on your canvas.</p>
							</div>
						</div>
						<div class="usage-step">
							<span class="step-number">3</span>
							<div class="step-content">
								<strong>Rotate Cues</strong>
								<p>Each card has multiple cues. Use the ◄ ► buttons to rotate through different options.</p>
							</div>
						</div>
						<div class="usage-step">
							<span class="step-number">4</span>
							<div class="step-content">
								<strong>Arrange & Connect</strong>
								<p>Drag cards to arrange them. Place related cards near each other to form relationships and story patterns.</p>
							</div>
						</div>
					</div>
				</section>

				<section class="help-section">
					<h3>Story Seed Pattern</h3>
					<p>The simplest complete story prompt uses 5 cards:</p>
					<div class="pattern-example">
						<div class="pattern-formula">
							<span class="pattern-part">🟠 Agent</span>
							<span class="pattern-plus">+</span>
							<span class="pattern-part">🟣 Engine</span>
							<span class="pattern-plus">+</span>
							<span class="pattern-part">🔵 Anchor</span>
							<span class="pattern-plus">+</span>
							<span class="pattern-part">🔴 Conflict</span>
							<span class="pattern-plus">+</span>
							<span class="pattern-part">🟢 Aspect</span>
						</div>
						<div class="pattern-result">
							<strong>Example:</strong> "A detective wants to find a haunted ship but time is running out."
						</div>
					</div>
				</section>

				<section class="help-section">
					<h3>Creating Adventures</h3>
					<p>Build complex adventures by combining multiple cards in patterns:</p>

					<div class="adventure-patterns">
						<div class="adventure-pattern">
							<h4>🔄 Circle of Fate</h4>
							<p class="pattern-desc">Two characters with reciprocal motivations:</p>
							<ul class="pattern-cards">
								<li>2 Agents</li>
								<li>2 Engines (one pointing each direction)</li>
								<li>2 Conflicts (paired with Engines)</li>
							</ul>
							<div class="pattern-mini-example">
								<strong>Example:</strong> "A caretaker wants to protect an automaton but the wrong people are asking questions. The automaton wants to find its creator but it was awakened under false pretenses."
							</div>
						</div>

						<div class="adventure-pattern">
							<h4>⚔️ Clash of Wills</h4>
							<p class="pattern-desc">Two characters competing for the same thing:</p>
							<ul class="pattern-cards">
								<li>2 Agents</li>
								<li>1 Anchor (center - what they both want)</li>
								<li>2 Engines + 2 Conflicts</li>
							</ul>
							<div class="pattern-mini-example">
								<strong>Example:</strong> "A scholar wants to protect an ancient artifact but it's forbidden. A merchant wants to steal the same artifact but they're being hunted."
							</div>
						</div>

						<div class="adventure-pattern">
							<h4>💔 Soul Divided</h4>
							<p class="pattern-desc">One character torn between two desires:</p>
							<ul class="pattern-cards">
								<li>1 Agent (center)</li>
								<li>2 Anchors (different goals)</li>
								<li>2 Engines + 2 Conflicts</li>
							</ul>
							<div class="pattern-mini-example">
								<strong>Example:</strong> A detective torn between saving their partner (one Anchor) and solving the case (another Anchor).
							</div>
						</div>
					</div>

					<div class="worldbuilding-tips">
						<h4>For Worldbuilding & Adventure Design:</h4>
						<ul>
							<li><strong>Generate NPCs:</strong> Create multiple Agents with Engines for quick character concepts</li>
							<li><strong>Adventure Hooks:</strong> Use Conflicts to design story hooks and obstacles</li>
							<li><strong>Locations:</strong> Combine Anchors with Aspects to create interesting places</li>
							<li><strong>Factions:</strong> Create multiple Agents with shared Engines</li>
							<li><strong>Create Webs:</strong> Connect 3+ characters with interlocking motivations</li>
						</ul>
					</div>
				</section>

				<section class="help-section">
					<h3>Tips</h3>
					<ul class="tips-list">
						<li>💡 Don't overthink - the first interpretation that comes to mind is usually good</li>
						<li>🔄 Rotate cards freely to find cues that spark ideas</li>
						<li>✂️ Not every cue needs to fit perfectly - ignore what doesn't work</li>
						<li>🎭 Place related cards near each other to show relationships</li>
						<li>🔗 Put Engine and Conflict cards near each other to read as "wants to [ENGINE] but [CONFLICT]"</li>
					</ul>
				</section>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		animation: fadeIn 0.2s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.modal-content {
		background: rgb(15 23 42);
		border: 2px solid rgb(168 85 247);
		border-radius: 1rem;
		width: 90%;
		max-width: 800px;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		box-shadow:
			0 0 0 1px rgb(168 85 247 / 0.2),
			0 20px 60px rgb(0 0 0 / 0.5);
		animation: slideUp 0.3s ease-out;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.modal-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1.5rem;
		border-bottom: 1px solid rgb(168 85 247 / 0.3);
	}

	.header-icon {
		font-size: 2rem;
	}

	.modal-title {
		flex: 1;
		font-size: 1.5rem;
		font-weight: bold;
		color: white;
	}

	.close-btn {
		width: 2rem;
		height: 2rem;
		border-radius: 0.5rem;
		background: rgb(168 85 247 / 0.2);
		border: 1px solid rgb(168 85 247 / 0.4);
		color: rgb(216 180 254);
		font-size: 1.5rem;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 1;
	}

	.close-btn:hover {
		background: rgb(168 85 247 / 0.4);
		border-color: rgb(168 85 247 / 0.6);
	}

	.modal-body {
		padding: 1.5rem;
		overflow-y: auto;
		flex: 1;
	}

	.category-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.category-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		padding: 0.75rem;
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.2s;
		color: rgb(216 180 254);
	}

	.category-btn:hover {
		background: rgb(30 27 75 / 0.8);
		border-color: rgb(168 85 247 / 0.4);
	}

	.category-btn.active {
		background: rgb(168 85 247 / 0.3);
		border-color: rgb(168 85 247);
		box-shadow: 0 0 12px rgb(168 85 247 / 0.4);
	}

	.category-icon {
		font-size: 1.5rem;
	}

	.category-name {
		font-size: 0.75rem;
		font-weight: 600;
	}

	.category-count {
		font-size: 0.625rem;
		opacity: 0.7;
	}

	.search-bar {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem;
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.5rem;
		margin-bottom: 1rem;
	}

	.search-icon {
		font-size: 1.25rem;
		opacity: 0.7;
	}

	.search-input {
		flex: 1;
		background: transparent;
		border: none;
		color: white;
		font-size: 0.875rem;
		outline: none;
	}

	.search-input::placeholder {
		color: rgb(148 163 184);
	}

	.table-list {
		max-height: 200px;
		overflow-y: auto;
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.5rem;
		background: rgb(30 27 75 / 0.3);
		margin-bottom: 1rem;
	}

	.table-item {
		width: 100%;
		padding: 0.75rem 1rem;
		background: transparent;
		border: none;
		border-bottom: 1px solid rgb(168 85 247 / 0.1);
		color: rgb(216 180 254);
		font-size: 0.875rem;
		cursor: pointer;
		text-align: left;
		transition: all 0.2s;
	}

	.table-item:last-child {
		border-bottom: none;
	}

	.table-item:hover {
		background: rgb(168 85 247 / 0.1);
	}

	.table-item.selected {
		background: rgb(168 85 247 / 0.3);
		font-weight: 600;
		color: white;
	}

	.table-name {
		display: block;
	}

	.roll-section {
		background: rgb(30 27 75 / 0.5);
		border: 2px solid rgb(168 85 247 / 0.3);
		border-radius: 0.75rem;
		padding: 1.5rem;
	}

	.selected-table {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
		font-size: 0.875rem;
	}

	.label {
		color: rgb(168 85 247);
		font-weight: 600;
	}

	.value {
		color: white;
		font-weight: 600;
	}

	.roll-btn {
		width: 100%;
		padding: 1rem;
		background: linear-gradient(135deg, rgb(168 85 247), rgb(139 92 246));
		border: none;
		border-radius: 0.75rem;
		color: white;
		font-size: 1rem;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.2s;
	}

	.roll-btn:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgb(168 85 247 / 0.4);
	}

	.roll-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.rolling {
		display: inline-block;
		animation: bounce 1s infinite;
	}

	@keyframes bounce {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-5px);
		}
	}

	.result-display {
		background: rgb(15 23 42);
		border: 2px solid rgb(250 204 21 / 0.5);
		border-radius: 0.75rem;
		padding: 1.5rem;
		margin-bottom: 1rem;
	}

	.result-label {
		color: rgb(250 204 21);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		margin-bottom: 0.5rem;
	}

	.result-text {
		color: white;
		font-size: 1.125rem;
		font-weight: 600;
		line-height: 1.5;
	}

	.action-buttons {
		display: flex;
		gap: 0.75rem;
	}

	.add-btn {
		flex: 2;
		padding: 1rem;
		background: linear-gradient(135deg, rgb(34 197 94), rgb(22 163 74));
		border: none;
		border-radius: 0.75rem;
		color: white;
		font-size: 1rem;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.2s;
	}

	.add-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgb(34 197 94 / 0.4);
	}

	.reroll-btn {
		flex: 1;
		padding: 1rem;
		background: rgb(30 27 75);
		border: 2px solid rgb(168 85 247 / 0.5);
		border-radius: 0.75rem;
		color: rgb(216 180 254);
		font-size: 1rem;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.2s;
	}

	.reroll-btn:hover {
		background: rgb(30 27 75 / 0.8);
		border-color: rgb(168 85 247);
	}

	.placeholder {
		text-align: center;
		padding: 3rem 1rem;
		color: rgb(148 163 184);
	}

	.placeholder-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
		opacity: 0.5;
	}

	.placeholder-text {
		font-size: 1rem;
	}

	/* Story Engine Styles */
	.story-engine-btn {
		background: linear-gradient(135deg, rgb(139 92 246), rgb(124 58 237));
	}

	.story-engine-btn.active {
		background: linear-gradient(135deg, rgb(168 85 247), rgb(147 51 234));
		box-shadow: 0 0 20px rgb(168 85 247 / 0.6);
	}

	/* World Builder Styles */
	.world-builder-btn {
		background: linear-gradient(135deg, rgb(14 165 233), rgb(3 105 161));
	}

	.world-builder-btn.active {
		background: linear-gradient(135deg, rgb(6 182 212), rgb(8 145 178));
		box-shadow: 0 0 20px rgb(6 182 212 / 0.6);
	}

	.interpretations {
		margin-top: 1rem;
		padding: 1rem;
		background: rgb(30 27 75 / 0.3);
		border-radius: 0.5rem;
		border-left: 3px solid rgb(6 182 212);
	}

	.interpretations-label {
		color: rgb(6 182 212);
		font-weight: 600;
		font-size: 0.875rem;
		margin-bottom: 0.5rem;
	}

	.interpretation-item {
		color: rgb(203 213 225);
		font-size: 0.8125rem;
		margin-bottom: 0.375rem;
		padding-left: 0.5rem;
	}

	/* Lore Master Styles */
	.lore-master-btn {
		background: linear-gradient(135deg, rgb(217 119 6), rgb(180 83 9));
	}

	.lore-master-btn.active {
		background: linear-gradient(135deg, rgb(245 158 11), rgb(217 119 6));
		box-shadow: 0 0 20px rgb(245 158 11 / 0.6);
	}

	.lore-cluster-result {
		margin-top: 1rem;
	}

	.cluster-preview {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.cluster-card {
		background: rgb(30 27 75 / 0.4);
		border: 1px solid rgb(99 102 241 / 0.3);
		border-radius: 0.5rem;
		padding: 1rem;
	}

	.cluster-card.primary-card {
		border-color: rgb(245 158 11);
		background: rgb(120 53 15 / 0.2);
	}

	.cluster-card.secondary-card {
		border-color: rgb(217 119 6 / 0.5);
		background: rgb(120 53 15 / 0.1);
		padding: 0.75rem;
	}

	.cluster-card-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid rgb(99 102 241 / 0.2);
	}

	.cluster-card-icon {
		font-size: 1.25rem;
	}

	.cluster-card-type {
		font-weight: 600;
		color: rgb(245 158 11);
		font-size: 0.875rem;
	}

	.position-badge {
		font-size: 0.75rem;
		color: rgb(203 213 225);
		background: rgb(30 27 75 / 0.5);
		padding: 0.125rem 0.5rem;
		border-radius: 0.25rem;
		font-weight: 500;
	}

	.cluster-card-cues {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.cluster-card-cues.compact {
		gap: 0.25rem;
	}

	.cue-type-label {
		color: rgb(245 158 11);
		font-weight: 600;
		font-size: 0.75rem;
		margin-top: 0.5rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.cue-preview-item.small {
		font-size: 0.75rem;
		color: rgb(203 213 225 / 0.8);
	}

	.secondary-cards-preview {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 0.75rem;
	}

	/* Adventure Card Styles */
	.adventure-title-preview {
		margin-bottom: 0.75rem;
		padding: 0.75rem;
		background: rgb(239 68 68 / 0.1);
		border-left: 3px solid rgb(239 68 68);
		border-radius: 0.375rem;
	}

	.adventure-summary-preview {
		margin-bottom: 0.75rem;
		padding: 0.75rem;
		background: rgb(249 115 22 / 0.1);
		border-left: 3px solid rgb(249 115 22);
		border-radius: 0.375rem;
	}

	.adventure-questions {
		margin-top: 0.75rem;
	}

	.adventure-label {
		display: block;
		color: rgb(251 146 60);
		font-weight: 700;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.5rem;
	}

	.adventure-title-text {
		display: block;
		color: white;
		font-size: 1.125rem;
		font-weight: 700;
		line-height: 1.4;
	}

	.adventure-summary-text {
		display: block;
		color: rgb(226 232 240);
		font-size: 0.9375rem;
		line-height: 1.5;
	}

	/* Keyhole Card Styles */
	.keyhole-questions {
		margin-top: 0.75rem;
	}

	.keyhole-label {
		display: block;
		color: rgb(245 158 11);
		font-weight: 700;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.625rem;
		padding-left: 0.25rem;
	}

	/* Opus Card Styles */
	.opus-cues {
		margin-top: 0.75rem;
	}

	.opus-label {
		display: block;
		color: rgb(147 51 234);
		font-weight: 700;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.625rem;
		padding-left: 0.25rem;
	}

	/* Flourish Card Styles */
	.flourish-cues {
		margin-top: 0.75rem;
	}

	.flourish-label {
		display: block;
		color: rgb(192 38 211);
		font-weight: 700;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.625rem;
		padding-left: 0.25rem;
	}

	/* Deities Expansion Toggle */
	.expansion-toggle-section {
		margin: 1rem 0;
		padding: 0.75rem;
		background: rgb(59 130 246 / 0.1);
		border: 1px solid rgb(59 130 246 / 0.3);
		border-radius: 0.5rem;
	}

	.expansion-toggle {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		cursor: pointer;
		user-select: none;
	}

	.expansion-toggle input[type="checkbox"] {
		width: 1.25rem;
		height: 1.25rem;
		cursor: pointer;
		accent-color: rgb(59 130 246);
	}

	.expansion-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: rgb(226 232 240);
		font-size: 0.9375rem;
		font-weight: 500;
	}

	.expansion-icon {
		font-size: 1.125rem;
	}

	.expansion-note {
		margin-top: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: rgb(59 130 246 / 0.15);
		border-left: 3px solid rgb(59 130 246);
		border-radius: 0.25rem;
		font-size: 0.875rem;
		color: rgb(191 219 254);
		line-height: 1.4;
	}

	.story-engine-types {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1rem;
		max-height: 300px;
		overflow-y: auto;
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.5rem;
		background: rgb(30 27 75 / 0.3);
		padding: 0.5rem;
	}

	.story-engine-type-btn {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		background: transparent;
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
	}

	.story-engine-type-btn:hover {
		background: rgb(168 85 247 / 0.1);
		border-color: rgb(168 85 247 / 0.4);
	}

	.story-engine-type-btn.selected {
		background: rgb(168 85 247 / 0.3);
		border-color: rgb(168 85 247);
		box-shadow: 0 0 12px rgb(168 85 247 / 0.4);
	}

	.story-seed-btn {
		border-color: rgb(250 204 21 / 0.4);
	}

	.story-seed-btn:hover {
		background: rgb(250 204 21 / 0.1);
		border-color: rgb(250 204 21 / 0.6);
	}

	.story-seed-btn.selected {
		background: rgb(250 204 21 / 0.3);
		border-color: rgb(250 204 21);
		box-shadow: 0 0 12px rgb(250 204 21 / 0.4);
	}

	.type-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
	}

	.type-info {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		flex: 1;
	}

	.type-name {
		font-size: 0.875rem;
		font-weight: 600;
		color: white;
	}

	.type-desc {
		font-size: 0.75rem;
		color: rgb(216 180 254);
		opacity: 0.8;
	}

	.story-engine-result {
		background: rgb(15 23 42);
		border: 2px solid rgb(168 85 247 / 0.5);
		border-radius: 0.75rem;
		padding: 1.5rem;
		margin-bottom: 1rem;
	}

	.cues-preview {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.cue-preview-item {
		display: flex;
		gap: 0.5rem;
		padding: 0.5rem;
		background: rgb(30 27 75 / 0.5);
		border-radius: 0.25rem;
		border-left: 3px solid rgb(168 85 247);
	}

	.cue-number {
		color: rgb(168 85 247);
		font-weight: 600;
		font-size: 0.875rem;
		flex-shrink: 0;
	}

	.cue-preview-text {
		color: white;
		font-size: 0.875rem;
		flex: 1;
	}

	.story-seed-result {
		background: rgb(15 23 42);
		border: 2px solid rgb(250 204 21 / 0.5);
		border-radius: 0.75rem;
		padding: 1.5rem;
		margin-bottom: 1rem;
	}

	.story-seed-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem;
		background: rgb(30 27 75 / 0.5);
		border-radius: 0.5rem;
		margin-top: 0.75rem;
		border: 1px solid rgb(168 85 247 / 0.2);
	}

	.seed-card-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex: 1;
	}

	.seed-card-icon {
		font-size: 1.25rem;
	}

	.seed-card-type {
		font-size: 0.75rem;
		font-weight: 600;
		color: rgb(168 85 247);
		min-width: 4rem;
	}

	.seed-card-cue {
		font-size: 0.875rem;
		color: white;
		flex: 1;
	}

	.add-seed-btn {
		padding: 0.5rem 1rem;
		background: linear-gradient(135deg, rgb(34 197 94), rgb(22 163 74));
		border: none;
		border-radius: 0.5rem;
		color: white;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.add-seed-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgb(34 197 94 / 0.4);
	}

	/* Story Engine Help Styles */
	.story-engine-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		margin-bottom: 0.5rem;
		background: rgb(30 27 75 / 0.3);
		border-radius: 0.5rem;
	}

	.story-engine-title {
		font-size: 1rem;
		font-weight: 700;
		color: white;
		margin: 0;
	}

	.help-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: rgba(59, 130, 246, 0.2);
		border: 1.5px solid rgba(59, 130, 246, 0.4);
		border-radius: 0.5rem;
		color: rgb(147, 197, 253);
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.help-btn:hover {
		background: rgba(59, 130, 246, 0.3);
		border-color: rgba(59, 130, 246, 0.6);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
	}

	.help-icon {
		font-size: 1.125rem;
		font-weight: 900;
		line-height: 1;
	}

	.help-text {
		font-weight: 600;
	}

	.help-modal {
		background: rgb(15 23 42);
		border: 2px solid rgb(59 130 246);
		border-radius: 1rem;
		max-width: 700px;
		max-height: 85vh;
		width: 100%;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.help-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem 2rem;
		background: linear-gradient(135deg, rgb(30 58 138), rgb(29 78 216));
		border-bottom: 2px solid rgb(59 130 246);
	}

	.help-title {
		font-size: 1.5rem;
		font-weight: 800;
		color: white;
		margin: 0;
	}

	.help-content {
		padding: 2rem;
		overflow-y: auto;
		flex: 1;
	}

	.help-section {
		margin-bottom: 2rem;
	}

	.help-section:last-child {
		margin-bottom: 0;
	}

	.help-section h3 {
		font-size: 1.25rem;
		font-weight: 700;
		color: rgb(147, 197, 253);
		margin: 0 0 1rem 0;
		padding-bottom: 0.5rem;
		border-bottom: 2px solid rgba(59, 130, 246, 0.3);
	}

	.help-section p {
		color: rgb(203, 213, 225);
		line-height: 1.6;
		margin: 0 0 1rem 0;
	}

	.card-types-grid {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.card-type-help {
		display: flex;
		gap: 1rem;
		padding: 1rem;
		background: rgba(30, 58, 138, 0.2);
		border: 1.5px solid rgba(59, 130, 246, 0.3);
		border-radius: 0.5rem;
		transition: all 0.2s;
	}

	.card-type-help:hover {
		background: rgba(30, 58, 138, 0.3);
		border-color: rgba(59, 130, 246, 0.5);
	}

	.type-help-icon {
		font-size: 2rem;
		flex-shrink: 0;
	}

	.type-help-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.type-help-info strong {
		color: white;
		font-size: 1rem;
		font-weight: 700;
	}

	.type-help-info p {
		color: rgb(203, 213, 225);
		font-size: 0.875rem;
		margin: 0;
	}

	.type-help-info em {
		color: rgb(148, 163, 184);
		font-size: 0.8125rem;
		font-style: normal;
	}

	.usage-steps {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.usage-step {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
	}

	.step-number {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		background: linear-gradient(135deg, rgb(59, 130, 246), rgb(37, 99, 235));
		border-radius: 50%;
		color: white;
		font-weight: 800;
		font-size: 1rem;
		flex-shrink: 0;
	}

	.step-content {
		flex: 1;
	}

	.step-content strong {
		display: block;
		color: white;
		font-size: 1rem;
		margin-bottom: 0.25rem;
	}

	.step-content p {
		color: rgb(203, 213, 225);
		font-size: 0.875rem;
		margin: 0;
	}

	.pattern-example {
		background: rgba(30, 58, 138, 0.2);
		border: 1.5px solid rgba(59, 130, 246, 0.3);
		border-radius: 0.75rem;
		padding: 1.5rem;
		margin-top: 1rem;
	}

	.pattern-formula {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.pattern-part {
		padding: 0.5rem 1rem;
		background: rgba(59, 130, 246, 0.2);
		border: 1px solid rgba(59, 130, 246, 0.3);
		border-radius: 0.5rem;
		color: white;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.pattern-plus {
		color: rgb(148, 163, 184);
		font-weight: 700;
	}

	.pattern-result {
		padding: 1rem;
		background: rgba(34, 197, 94, 0.1);
		border-left: 3px solid rgb(34, 197, 94);
		border-radius: 0.375rem;
	}

	.pattern-result strong {
		display: block;
		color: rgb(134, 239, 172);
		font-size: 0.875rem;
		margin-bottom: 0.5rem;
	}

	.tips-list {
		margin: 0;
		padding-left: 1.5rem;
		color: rgb(203, 213, 225);
	}

	.tips-list li {
		margin-bottom: 0.75rem;
		line-height: 1.5;
	}

	.tips-list li:last-child {
		margin-bottom: 0;
	}

	/* Adventure Patterns Styles */
	.adventure-patterns {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		margin-top: 1rem;
	}

	.adventure-pattern {
		background: rgba(30, 58, 138, 0.2);
		border: 1.5px solid rgba(59, 130, 246, 0.3);
		border-radius: 0.75rem;
		padding: 1.25rem;
	}

	.adventure-pattern h4 {
		font-size: 1.125rem;
		font-weight: 700;
		color: rgb(147, 197, 253);
		margin: 0 0 0.75rem 0;
	}

	.pattern-desc {
		color: rgb(203, 213, 225);
		font-size: 0.875rem;
		margin: 0 0 0.75rem 0;
		font-weight: 600;
	}

	.pattern-cards {
		list-style: none;
		padding: 0;
		margin: 0 0 1rem 0;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.pattern-cards li {
		color: rgb(203, 213, 225);
		font-size: 0.8125rem;
		padding: 0.375rem 0.75rem;
		background: rgba(59, 130, 246, 0.1);
		border-left: 3px solid rgba(59, 130, 246, 0.5);
		border-radius: 0.25rem;
	}

	.pattern-mini-example {
		background: rgba(34, 197, 94, 0.1);
		border-left: 3px solid rgb(34, 197, 94);
		border-radius: 0.375rem;
		padding: 0.875rem;
		font-size: 0.8125rem;
		color: rgb(203, 213, 225);
		font-style: italic;
		line-height: 1.5;
	}

	.pattern-mini-example strong {
		color: rgb(134, 239, 172);
		font-style: normal;
		display: block;
		margin-bottom: 0.375rem;
	}

	.worldbuilding-tips {
		margin-top: 1.5rem;
		padding: 1.25rem;
		background: rgba(168, 85, 247, 0.1);
		border: 1.5px solid rgba(168, 85, 247, 0.3);
		border-radius: 0.75rem;
	}

	.worldbuilding-tips h4 {
		font-size: 1rem;
		font-weight: 700;
		color: rgb(216, 180, 254);
		margin: 0 0 0.875rem 0;
	}

	.worldbuilding-tips ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.worldbuilding-tips li {
		color: rgb(203, 213, 225);
		font-size: 0.875rem;
		padding: 0.5rem 0.75rem;
		background: rgba(168, 85, 247, 0.1);
		border-left: 3px solid rgba(168, 85, 247, 0.4);
		border-radius: 0.25rem;
		line-height: 1.5;
	}

	.worldbuilding-tips strong {
		color: rgb(216, 180, 254);
		font-weight: 700;
	}

	/* Bridge Compounds Styles */
	.bridge-compounds-btn {
		background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(14, 165, 233, 0.1));
		border-color: rgba(168, 85, 247, 0.3);
	}

	.bridge-compounds-btn:hover {
		background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(14, 165, 233, 0.15));
		border-color: rgba(168, 85, 247, 0.5);
	}

	.bridge-compounds-btn.active {
		background: linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(14, 165, 233, 0.25));
		border-color: rgb(168, 85, 247);
		box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
	}

	.compound-result {
		background: linear-gradient(135deg, rgba(168, 85, 247, 0.05), rgba(14, 165, 233, 0.05));
		border: 2px solid rgba(168, 85, 247, 0.3);
		border-radius: 1rem;
		padding: 1.5rem;
		margin-top: 1.25rem;
	}

	.compound-result .result-label {
		font-size: 1.25rem;
		font-weight: 700;
		color: rgb(216, 180, 254);
		margin-bottom: 1.25rem;
		text-align: center;
		background: linear-gradient(135deg, rgb(168, 85, 247), rgb(14, 165, 233));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.compound-preview {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.compound-stats {
		display: flex;
		gap: 1rem;
		justify-content: center;
		padding: 1rem;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 0.75rem;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.375rem;
		padding: 0.75rem 1.25rem;
		background: rgba(168, 85, 247, 0.1);
		border: 1px solid rgba(168, 85, 247, 0.3);
		border-radius: 0.5rem;
	}

	.stat-icon {
		font-size: 1.5rem;
	}

	.stat-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: rgb(216, 180, 254);
	}

	.stat-label {
		font-size: 0.75rem;
		color: rgb(148, 163, 184);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.compound-description {
		background: rgba(0, 0, 0, 0.2);
		padding: 1.25rem;
		border-radius: 0.75rem;
		border-left: 4px solid rgba(168, 85, 247, 0.5);
	}

	.compound-description p {
		color: rgb(203, 213, 225);
		font-size: 0.9375rem;
		margin: 0 0 1rem 0;
		line-height: 1.6;
	}

	.compound-description ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.compound-description li {
		color: rgb(203, 213, 225);
		font-size: 0.875rem;
		padding: 0.625rem 1rem;
		background: linear-gradient(90deg, rgba(168, 85, 247, 0.1), rgba(14, 165, 233, 0.05));
		border-left: 3px solid rgba(168, 85, 247, 0.4);
		border-radius: 0.375rem;
		line-height: 1.5;
	}

	.compound-btn {
		background: linear-gradient(135deg, rgb(168, 85, 247), rgb(14, 165, 233));
		box-shadow: 0 4px 20px rgba(168, 85, 247, 0.3);
	}

	.compound-btn:hover:not(:disabled) {
		box-shadow: 0 6px 30px rgba(168, 85, 247, 0.4);
		transform: translateY(-2px);
	}

	.compound-add-btn {
		background: linear-gradient(135deg, rgb(34, 197, 94), rgb(14, 165, 233));
	}

	.compound-add-btn:hover {
		background: linear-gradient(135deg, rgb(22, 163, 74), rgb(3, 105, 161));
		box-shadow: 0 6px 30px rgba(34, 197, 94, 0.4);
	}

	.compound-type-btn {
		border-color: rgba(168, 85, 247, 0.3);
	}

	.compound-type-btn:hover {
		border-color: rgba(168, 85, 247, 0.5);
		background: rgba(168, 85, 247, 0.1);
	}

	.compound-type-btn.selected {
		border-color: rgb(168, 85, 247);
		background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(14, 165, 233, 0.15));
		box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
	}
</style>
