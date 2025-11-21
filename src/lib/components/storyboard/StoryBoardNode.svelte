<script lang="ts">
	import { storyboardStore, activeBoard, connectingFromNodeId } from '$lib/stores/storyboardStore';
	import { entityStore, allEntities } from '$lib/stores/entityStore';
	import { tabStore } from '$lib/stores/tabStore';
	import type { StoryBoardNode } from '$lib/types/storyboard';
	import type { Entity } from '$lib/types/entity';
	import { getEntityTypesList } from '$lib/entities/entityRegistry';
	import { STORY_ENGINE_CARD_TYPES } from '$lib/types/storyEngine';
	import { WORLD_BUILDER_CARD_TYPES } from '$lib/types/worldBuilder';
	import { LORE_MASTER_CARD_TYPES } from '$lib/types/loreMaster';
	import { getDisplayCue, detectBridgeLinks, hasBridgeLinks } from '$lib/utils/linkIconParser';
	import type { DetectedBridgeLink } from '$lib/types/bridge';
	import { getRandomCard as getRandomLoreMasterCard } from '$lib/data/loreMasterLoader';
	import { getRandomCard as getRandomWorldBuilderCard, generateMicrosetting } from '$lib/data/worldBuilderLoader';
	import { generateStorySeed, getRandomCard as getRandomStoryEngineCard } from '$lib/data/storyEngineLoader';
	import type { StoryEngineCard } from '$lib/types/storyEngine';
	import type { WorldBuilderCard } from '$lib/types/worldBuilder';

	interface Props {
		node: StoryBoardNode;
	}

	let { node }: Props = $props();

	// Entity sync - watch for changes to the linked entity
	let linkedEntity = $derived(
		node.entityId ? $allEntities.find((e) => e.id === node.entityId) : undefined
	);
	let entityMissing = $derived(node.entityId ? !linkedEntity : false);

	// Drag state
	let isDragging = $state(false);
	let dragStart = $state({ x: 0, y: 0 });
	let nodeStart = $state({ x: 0, y: 0 });

	// Tooltip state
	let showTooltip = $state(false);
	let tooltipTimeout: number;
	let tooltipPos = $state({ x: 0, y: 0 });

	// Context menu for generated cards
	let showContextMenu = $state(false);
	let contextMenuPos = $state({ x: 0, y: 0 });
	let contextMenuOpenedAt = 0;
	let contextMenuElement: HTMLDivElement | null = null;

	function handleMouseDown(e: MouseEvent) {
		if (node.locked) return;
		e.stopPropagation();

		// Alt+Click to create connection
		if (e.altKey) {
			if ($connectingFromNodeId) {
				// Complete connection
				const label = prompt('Connection label (optional):');
				storyboardStore.completeConnection(node.id, label || undefined);
			} else {
				// Start connection
				storyboardStore.startConnection(node.id);
			}
			return;
		}

		isDragging = true;
		dragStart = { x: e.clientX, y: e.clientY };
		nodeStart = { x: node.x, y: node.y };

		// Select this node
		if (!$activeBoard) return;
		const addToSelection = e.shiftKey;
		storyboardStore.selectNode($activeBoard.id, node.id, addToSelection);
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isDragging || !$activeBoard) return;

		const dx = (e.clientX - dragStart.x) / $activeBoard.viewport.zoom;
		const dy = (e.clientY - dragStart.y) / $activeBoard.viewport.zoom;

		// Move node (skip snapshot during drag for performance)
		storyboardStore.moveNode($activeBoard.id, node.id, nodeStart.x + dx, nodeStart.y + dy, true);
	}

	function handleMouseUp() {
		if (isDragging && $activeBoard) {
			isDragging = false;
			// Create snapshot now that drag is complete
			// The current position is already updated, just need to save and create snapshot
			// We'll do this by triggering a final moveNode with skipSnapshot=false
			// But actually the position is already set, so we just need to save
			// For now, let's just mark it as done - the store will handle it
		}
		isDragging = false;
	}

	function handleClick(e: MouseEvent) {
		if (e.detail === 2 && $activeBoard) {
			// Double-click
			// If node has a linked entity, open it in a new tab
			if (linkedEntity) {
				// Open in new browser tab
				const url = `/workspace?entity=${linkedEntity.id}`;
				window.open(url, '_blank');
			}
		}
	}

	function handleContextMenu(e: MouseEvent) {
		// Show context menu for:
		// - Generated cards
		// - Grouped nodes (generic ungroup options)
		// - Story Engine cards (not in a group) - can generate story seed
		// - World Builder cards (not in a group) - can generate mini setting
		// - World Builder cards (in a group) - can complete mini setting
		const hasStoryEngineCard = node.storyEngineCard && !node.groupId;
		const hasWorldBuilderCard = node.worldBuilderCard && !node.groupId;
		const hasGroupedWorldBuilderCard = node.worldBuilderCard && node.groupId;

		// Check if we should show the context menu
		const shouldShowMenu = isGenerated || node.groupId || hasStoryEngineCard || hasWorldBuilderCard || hasGroupedWorldBuilderCard;

		if (!shouldShowMenu) return;

		e.preventDefault();
		e.stopPropagation();

		// Use client coordinates directly - they're relative to the viewport
		contextMenuPos = { x: e.clientX, y: e.clientY };
		contextMenuOpenedAt = Date.now();
		showContextMenu = true;
	}

	function closeContextMenu() {
		showContextMenu = false;
		if (contextMenuElement) {
			contextMenuElement.remove();
			contextMenuElement = null;
		}
	}

	// Create and position context menu in document.body
	$effect(() => {
		if (showContextMenu) {
			// Clean up old menu if it exists
			if (contextMenuElement) {
				contextMenuElement.remove();
			}

			// Create menu element
			const menu = document.createElement('div');
			menu.className = 'storyboard-context-menu';
			menu.style.cssText = `
				position: fixed;
				left: ${contextMenuPos.x}px;
				top: ${contextMenuPos.y}px;
				z-index: 99999;
				background: white;
				border: 2px solid #333;
				border-radius: 8px;
				padding: 4px;
				box-shadow: 0 4px 12px rgba(0,0,0,0.25);
				min-width: 200px;
			`;

			menu.onclick = (e) => e.stopPropagation();
			menu.oncontextmenu = (e) => e.preventDefault();

			// Build menu content
			let menuHTML = '';

			if (isGenerated) {
				menuHTML += `<button class="ctx-btn" data-action="promote">⭐ Promote to Entity</button>`;
			}

			if (node.storyEngineCard && !node.groupId) {
				menuHTML += `<button class="ctx-btn" data-action="generate-seed">🎲 Generate Story Seed</button>`;
			}

		// Add Aspect option for agents and anchors
			if (node.storyEngineCard && (node.storyEngineCard.type === 'agent' || node.storyEngineCard.type === 'anchor')) {
				menuHTML += `<button class="ctx-btn" data-action="add-aspect">🟢 Add Aspect</button>`;
			}

			// Add Aspect and Conflict options for engines
			if (node.storyEngineCard && node.storyEngineCard.type === 'engine') {
				menuHTML += `<button class="ctx-btn" data-action="add-aspect">🟢 Add Aspect</button>`;
				menuHTML += `<button class="ctx-btn" data-action="add-conflict">🔴 Add Conflict</button>`;
			}

			if (node.worldBuilderCard && !node.groupId) {
				menuHTML += `<button class="ctx-btn" data-action="generate-setting">🗺️ Generate Mini Setting</button>`;
			}

			if (node.worldBuilderCard && node.groupId) {
				menuHTML += `<button class="ctx-btn" data-action="complete-setting">✨ Complete Mini Setting</button>`;
			}

			if (node.groupId) {
				menuHTML += `<button class="ctx-btn" data-action="ungroup-one">🔓 Ungroup This Card</button>`;
				menuHTML += `<button class="ctx-btn" data-action="ungroup-all">💥 Ungroup All Cards</button>`;
			}

			menuHTML += `<button class="ctx-btn" data-action="cancel">✕ Cancel</button>`;

			menu.innerHTML = menuHTML;

			// Add click handlers
			menu.querySelectorAll('.ctx-btn').forEach(btn => {
				const button = btn as HTMLButtonElement;
				button.onclick = (e) => {
					e.stopPropagation();
					const action = button.getAttribute('data-action');

					switch (action) {
						case 'promote':
							promoteToEntity();
							break;
						case 'generate-seed':
							generateStorySeedFromCard();
							break;
					case 'add-aspect':
						addAspectCard();
						break;
					case 'add-conflict':
						addConflictCard();
						break;
					case 'generate-setting':
							generateMiniSettingFromCard();
							break;
						case 'complete-setting':
							completeMiniSettingFromGroupedCard();
							break;
						case 'ungroup-one':
							ungroupNode();
							break;
						case 'ungroup-all':
							ungroupAll();
							break;
						case 'cancel':
							closeContextMenu();
							break;
					}
				};
			});

			document.body.appendChild(menu);
			contextMenuElement = menu;
		} else {
			// Clean up when hiding
			if (contextMenuElement) {
				contextMenuElement.remove();
				contextMenuElement = null;
			}
		}
	});

	function promoteToEntity() {
		if (!$activeBoard || !isGenerated) return;

		// Determine entity type based on user selection
		const entityTypes = ['character', 'location', 'scene', 'adventure'];
		const typeIndex = Math.floor(Math.random() * entityTypes.length);
		const newType = entityTypes[typeIndex];

		// Prompt user for entity type
		const selectedType = prompt(
			`Convert "${node.label}" to entity.\n\nChoose type:\n1. Character\n2. Location\n3. Scene\n4. Adventure\n\nEnter 1-4:`,
			'1'
		);

		if (!selectedType) {
			closeContextMenu();
			return;
		}

		const typeMap: Record<string, string> = {
			'1': 'character',
			'2': 'location',
			'3': 'scene',
			'4': 'adventure'
		};

		const chosenType = typeMap[selectedType] || 'character';

		// Update node to remove 'generated' type and convert to entity reference
		// For now, we'll just change the visual style by updating entityType
		storyboardStore.updateNode($activeBoard.id, node.id, {
			entityType: chosenType as any,
			notes: `Promoted from generated: ${node.notes}`
		});

		closeContextMenu();
	}

	function ungroupNode() {
		if (!$activeBoard || !node.groupId) return;

		// Ungroup just this node
		storyboardStore.ungroupNodes($activeBoard.id, [node.id]);
		closeContextMenu();
	}

	function ungroupAll() {
		if (!$activeBoard || !node.groupId) return;

		// Find all nodes in this group and ungroup them
		const groupedNodes = $activeBoard.nodes.filter((n) => n.groupId === node.groupId);
		const nodeIds = groupedNodes.map((n) => n.id);
		storyboardStore.ungroupNodes($activeBoard.id, nodeIds);
		closeContextMenu();
	}

	async function addAspectCard() {
		if (!$activeBoard) return;

		closeContextMenu();

		try {
			// Generate a random aspect card
			const aspectCard = await getRandomStoryEngineCard('aspect');

			// Find all existing child cards of this node
			const existingAspects = $activeBoard.nodes.filter(
				(n) => n.parentNodeId === node.id && n.storyEngineCard?.type === 'aspect'
			);
			const existingConflicts = $activeBoard.nodes.filter(
				(n) => n.parentNodeId === node.id && n.storyEngineCard?.type === 'conflict'
			);

			// Calculate position: stack above the parent or above the topmost existing aspect
			// But always below conflicts
			const cardHeight = 150; // Default card height
			const gap = 10; // Gap between stacked cards

			let yPosition: number;

			if (existingAspects.length === 0 && existingConflicts.length === 0) {
				// No existing children - position above the parent card
				yPosition = node.y - (cardHeight + gap);
			} else if (existingAspects.length === 0 && existingConflicts.length > 0) {
				// No aspects but there are conflicts - position directly above parent (below conflicts)
				yPosition = node.y - (cardHeight + gap);
			} else {
				// Find the topmost aspect (lowest y value)
				const topmostAspect = existingAspects.reduce((top, current) =>
					current.y < top.y ? current : top
				);
				// Position above the topmost aspect
				yPosition = topmostAspect.y - (cardHeight + gap);
			}

			const typeInfo = STORY_ENGINE_CARD_TYPES['aspect'];

			// Add the new aspect node
			storyboardStore.addNode(
				$activeBoard.id,
				{
					x: node.x, // Same x as parent
					y: yPosition,
					width: node.width, // Same width as parent
					height: cardHeight,
					parentNodeId: node.id, // Track parent relationship
					storyEngineCard: {
						type: 'aspect',
						cues: Array.from(aspectCard.cues),
						activeCueIndex: 0,
						expansion: aspectCard.expansion
					}
				},
				`Add Aspect to ${STORY_ENGINE_CARD_TYPES[node.storyEngineCard!.type].name}`
			);
		} catch (error) {
			console.error('Failed to add aspect card:', error);
			alert('Failed to add aspect card. Please try again.');
		}
	}

	async function addConflictCard() {
		if (!$activeBoard) return;

		closeContextMenu();

		try {
			// Generate a random conflict card
			const conflictCard = await getRandomStoryEngineCard('conflict');

			// Find all existing child cards of this node
			const existingAspects = $activeBoard.nodes.filter(
				(n) => n.parentNodeId === node.id && n.storyEngineCard?.type === 'aspect'
			);
			const existingConflicts = $activeBoard.nodes.filter(
				(n) => n.parentNodeId === node.id && n.storyEngineCard?.type === 'conflict'
			);

			// Calculate position: conflicts always stack at the top (above aspects and parent)
			const cardHeight = 150; // Default card height
			const gap = 10; // Gap between stacked cards

			let yPosition: number;

			if (existingConflicts.length === 0) {
				// No existing conflicts
				if (existingAspects.length === 0) {
					// No aspects either - position above the parent card
					yPosition = node.y - (cardHeight + gap);
				} else {
					// Stack above the topmost aspect
					const topmostAspect = existingAspects.reduce((top, current) =>
						current.y < top.y ? current : top
					);
					yPosition = topmostAspect.y - (cardHeight + gap);
				}
			} else {
				// Find the topmost conflict (lowest y value) and stack above it
				const topmostConflict = existingConflicts.reduce((top, current) =>
					current.y < top.y ? current : top
				);
				yPosition = topmostConflict.y - (cardHeight + gap);
			}

			const typeInfo = STORY_ENGINE_CARD_TYPES['conflict'];

			// Add the new conflict node
			storyboardStore.addNode(
				$activeBoard.id,
				{
					x: node.x, // Same x as parent
					y: yPosition,
					width: node.width, // Same width as parent
					height: cardHeight,
					parentNodeId: node.id, // Track parent relationship
					storyEngineCard: {
						type: 'conflict',
						cues: Array.from(conflictCard.cues),
						activeCueIndex: 0,
						expansion: conflictCard.expansion
					}
				},
				`Add Conflict to ${STORY_ENGINE_CARD_TYPES[node.storyEngineCard!.type].name}`
			);
		} catch (error) {
			console.error('Failed to add conflict card:', error);
			alert('Failed to add conflict card. Please try again.');
		}
	}

	async function generateStorySeedFromCard() {
		if (!$activeBoard || !node.storyEngineCard) return;

		closeContextMenu();

		try {
			// Generate a complete story seed (5 cards)
			const storySeed = await generateStorySeed();

			// Determine which card types we need to generate
			// Story seed is: [Agent, Engine, Anchor, Conflict, Aspect]
			const currentType = node.storyEngineCard.type;
			const typeOrder = ['agent', 'engine', 'anchor', 'conflict', 'aspect'];
			const currentIndex = typeOrder.indexOf(currentType);

			// Create a new groupId for all cards
			const groupId = `group-${Date.now()}`;

			// Update the current node to be part of the group
			storyboardStore.updateNode($activeBoard.id, node.id, { groupId });

			// Calculate positioning
			const cardWidth = 400;
			const gap = 20;
			const cardSpacing = cardWidth + gap; // 420px

			// Position cards relative to the current node
			// Current node stays in place, other cards are added around it
			let offsetMultiplier = 0 - currentIndex; // Offset so current card is at correct position

			// Add all cards from story seed
			storySeed.forEach((card: StoryEngineCard, index: number) => {
				if (index === currentIndex) {
					// Skip - this is the current card's position
					offsetMultiplier++;
					return;
				}

				const xOffset = offsetMultiplier * cardSpacing;
				const finalX = node.x + xOffset;
				const finalY = node.y;

				const typeInfo = STORY_ENGINE_CARD_TYPES[card.type];

				storyboardStore.addNode(
					$activeBoard.id,
					{
						x: finalX,
						y: finalY,
						width: 400,
						height: 400,
						groupId: groupId,
						storyEngineCard: {
							type: card.type,
							cues: Array.from(card.cues),
							activeCueIndex: 0,
							expansion: card.expansion
						}
					},
					`Generate Story Seed: ${typeInfo.name}`
				);

				offsetMultiplier++;
			});
		} catch (error) {
			console.error('Failed to generate story seed:', error);
			alert('Failed to generate story seed. Please try again.');
		}
	}

	async function generateMiniSettingFromCard() {
		if (!$activeBoard || !node.worldBuilderCard) return;

		closeContextMenu();

		try {
			// Generate a complete microsetting
			const microsetting = await generateMicrosetting();

			// Determine which card type we have and what we need to generate
			const currentType = node.worldBuilderCard.type;

			// Microsetting structure: region, 3 landmarks, namesake, origin, attribute, advent (8 total cards)
			const typeOrder = ['region', 'landmark', 'landmark', 'landmark', 'namesake', 'origin', 'attribute', 'advent'];

			// Find the position of current type in the sequence
			// For landmarks, we'll use the first landmark position
			let currentIndex = typeOrder.indexOf(currentType);

			// Create a new groupId for all cards
			const groupId = `group-${Date.now()}`;

			// Update the current node to be part of the group
			storyboardStore.updateNode($activeBoard.id, node.id, { groupId });

			// Calculate positioning
			const cardWidth = 400;
			const gap = 20;
			const cardSpacing = cardWidth + gap;

			// Position cards relative to the current node
			let offsetMultiplier = 0 - currentIndex;

			// Add region card
			if (currentType !== 'region') {
				const card = microsetting.region;
				const xOffset = offsetMultiplier * cardSpacing;
				const typeInfo = WORLD_BUILDER_CARD_TYPES[card.type];

				storyboardStore.addNode(
					$activeBoard.id,
					{
						x: node.x + xOffset,
						y: node.y,
						width: 400,
						height: 400,
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
					},
					`Generate Mini Setting: ${typeInfo.name}`
				);
			}
			offsetMultiplier++;

			// Add landmark cards
			microsetting.landmarks.forEach((card: WorldBuilderCard, landmarkIndex: number) => {
				if (currentType === 'landmark' && landmarkIndex === 0) {
					// Skip first landmark if current card is a landmark
					offsetMultiplier++;
					return;
				}

				const xOffset = offsetMultiplier * cardSpacing;
				const typeInfo = WORLD_BUILDER_CARD_TYPES[card.type];

				storyboardStore.addNode(
					$activeBoard.id,
					{
						x: node.x + xOffset,
						y: node.y,
						width: 400,
						height: 400,
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
					},
					`Generate Mini Setting: ${typeInfo.name}`
				);

				offsetMultiplier++;
			});

			// Add remaining cards (namesake, origin, attribute, advent)
			const remainingCards = [
				microsetting.namesake,
				microsetting.origin,
				microsetting.attribute,
				microsetting.advent
			];

			remainingCards.forEach((card: WorldBuilderCard) => {
				if (currentType === card.type) {
					// Skip if this is the current card type
					offsetMultiplier++;
					return;
				}

				const xOffset = offsetMultiplier * cardSpacing;
				const typeInfo = WORLD_BUILDER_CARD_TYPES[card.type];

				storyboardStore.addNode(
					$activeBoard.id,
					{
						x: node.x + xOffset,
						y: node.y,
						width: 400,
						height: 400,
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
					},
					`Generate Mini Setting: ${typeInfo.name}`
				);

				offsetMultiplier++;
			});
		} catch (error) {
			console.error('Failed to generate mini setting:', error);
			alert('Failed to generate mini setting. Please try again.');
		}
	}

	async function completeMiniSettingFromGroupedCard() {
		if (!$activeBoard || !node.worldBuilderCard || !node.groupId) return;

		closeContextMenu();

		try {
			// Find all nodes in the same group
			const groupedNodes = $activeBoard.nodes.filter((n) => n.groupId === node.groupId);

			// Count what card types we already have
			const existingTypes = new Map<string, number>();
			groupedNodes.forEach((n) => {
				if (n.worldBuilderCard) {
					const type = n.worldBuilderCard.type;
					existingTypes.set(type, (existingTypes.get(type) || 0) + 1);
				}
			});

			// A complete mini setting needs:
			// 1 region, 3 landmarks, 1 namesake, 1 origin, 1 attribute, 1 advent
			const neededTypes: Array<{ type: string; count: number }> = [
				{ type: 'region', count: 1 },
				{ type: 'landmark', count: 3 },
				{ type: 'namesake', count: 1 },
				{ type: 'origin', count: 1 },
				{ type: 'attribute', count: 1 },
				{ type: 'advent', count: 1 }
			];

			// Generate a complete microsetting
			const microsetting = await generateMicrosetting();

			// Calculate positioning - find rightmost card in group
			let maxX = node.x;
			groupedNodes.forEach((n) => {
				if (n.x > maxX) {
					maxX = n.x;
				}
			});

			const cardWidth = 400;
			const gap = 20;
			const cardSpacing = cardWidth + gap;
			let currentX = maxX + cardSpacing;

			// Generate missing cards
			for (const needed of neededTypes) {
				const existing = existingTypes.get(needed.type) || 0;
				const toGenerate = needed.count - existing;

				if (toGenerate > 0) {
					// Generate the missing cards
					for (let i = 0; i < toGenerate; i++) {
						let card: WorldBuilderCard;

						if (needed.type === 'region') {
							card = microsetting.region;
						} else if (needed.type === 'landmark') {
							card = microsetting.landmarks[i];
						} else if (needed.type === 'namesake') {
							card = microsetting.namesake;
						} else if (needed.type === 'origin') {
							card = microsetting.origin;
						} else if (needed.type === 'attribute') {
							card = microsetting.attribute;
						} else if (needed.type === 'advent') {
							card = microsetting.advent;
						} else {
							continue;
						}

						const typeInfo = WORLD_BUILDER_CARD_TYPES[card.type];

						storyboardStore.addNode(
							$activeBoard.id,
							{
								x: currentX,
								y: node.y,
								width: 400,
								height: 400,
								groupId: node.groupId,
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
							},
							`Complete Mini Setting: ${typeInfo.name}`
						);

						currentX += cardSpacing;
					}
				}
			}
		} catch (error) {
			console.error('Failed to complete mini setting:', error);
			alert('Failed to complete mini setting. Please try again.');
		}
	}

	function handleLabelInput(e: Event) {
		if (!$activeBoard) return;
		const target = e.currentTarget as HTMLInputElement;
		storyboardStore.updateNode($activeBoard.id, node.id, { label: target.value });
	}

	function handleGotoEntity(e: MouseEvent) {
		e.stopPropagation();
		if (!linkedEntity) return;

		// Open entity in workspace in new tab
		const url = `/workspace?entity=${linkedEntity.id}`;
		window.open(url, '_blank');
	}

	function handleMouseEnter(e: MouseEvent) {
		if (linkedEntity) {
			// Calculate tooltip position in screen coordinates
			const target = e.currentTarget as HTMLElement;
			const rect = target.getBoundingClientRect();
			tooltipPos = {
				x: rect.left,
				y: rect.bottom + 8 // 8px below the node
			};

			tooltipTimeout = window.setTimeout(() => {
				showTooltip = true;
			}, 500); // Show tooltip after 500ms hover
		}
	}

	function handleMouseLeave() {
		window.clearTimeout(tooltipTimeout);
		showTooltip = false;
	}

	// Color mapping for entity types (expanded for all types)
	const colorMap: Record<string, string> = {
		// Meta
		campaign: 'from-purple-500 to-pink-500',
		adventure: 'from-blue-500 to-cyan-500',
		quest: 'from-indigo-500 to-blue-500',
		storyBeat: 'from-violet-500 to-purple-500',

		// Characters
		character: 'from-green-500 to-emerald-500',
		villain: 'from-red-600 to-rose-600',
		monster: 'from-orange-600 to-red-500',

		// Locations - Celestial
		universe: 'from-indigo-900 to-purple-900',
		sphere: 'from-purple-700 to-indigo-700',
		sphereConnection: 'from-cyan-600 to-blue-600',
		galaxy: 'from-purple-600 to-pink-600',
		solarSystem: 'from-yellow-500 to-orange-500',
		planet: 'from-blue-400 to-green-400',
		star: 'from-yellow-300 to-orange-300',

		// Locations - Terrestrial
		continent: 'from-green-600 to-teal-600',
		nation: 'from-blue-600 to-indigo-600',
		region: 'from-teal-500 to-green-500',
		settlement: 'from-amber-500 to-yellow-500',
		building: 'from-stone-500 to-gray-500',
		location: 'from-yellow-500 to-orange-500',

		// Dungeons
		dungeon: 'from-gray-700 to-stone-700',
		entrance: 'from-stone-600 to-gray-600',
		room: 'from-slate-500 to-gray-500',
		trap: 'from-red-500 to-orange-500',

		// Factions
		faction: 'from-red-500 to-pink-500',
		organization: 'from-indigo-500 to-purple-500',

		// Magic & Religion
		magicSystem: 'from-purple-500 to-fuchsia-500',
		spell: 'from-violet-400 to-purple-400',
		ritual: 'from-purple-600 to-indigo-600',
		god: 'from-yellow-400 to-amber-400',

		// Items & Objects
		artifact: 'from-amber-600 to-orange-600',
		treasure: 'from-yellow-500 to-amber-500',
		vehicle: 'from-gray-600 to-slate-600',
		talent: 'from-pink-500 to-rose-500',

		// Events
		event: 'from-cyan-500 to-blue-500',
		rumor: 'from-slate-400 to-gray-400',
		prophecy: 'from-purple-400 to-pink-400',
		illness: 'from-green-700 to-emerald-700',
		clue: 'from-blue-400 to-cyan-400',
		weatherEvent: 'from-sky-400 to-blue-400',

		// Misc
		scene: 'from-red-500 to-rose-500',
		initialMeeting: 'from-pink-400 to-rose-400',
		generated: 'from-yellow-500 to-amber-500'
	};

	// Get entity type info for icon
	const entityTypes = getEntityTypesList();
	const entityTypeInfo = $derived(
		node.entityType ? entityTypes.find((et) => et.name === node.entityType) : null
	);

	// Derived values for card styling
	let gradientColor = $derived(
		node.storyEngineCard
			? STORY_ENGINE_CARD_TYPES[node.storyEngineCard.type].color
			: node.worldBuilderCard
				? WORLD_BUILDER_CARD_TYPES[node.worldBuilderCard.type].color
				: node.loreCluster
					? LORE_MASTER_CARD_TYPES[node.loreCluster.primaryCard.card.type].color
					: node.entityType && colorMap[node.entityType]
						? colorMap[node.entityType]
						: 'from-purple-500 to-pink-500'
	);
	let iconEmoji = $derived(
		node.storyEngineCard
			? STORY_ENGINE_CARD_TYPES[node.storyEngineCard.type].icon
			: node.worldBuilderCard
				? WORLD_BUILDER_CARD_TYPES[node.worldBuilderCard.type].icon
				: node.loreCluster
					? LORE_MASTER_CARD_TYPES[node.loreCluster.primaryCard.card.type].emoji
					: entityTypeInfo?.icon || node.icon || '📝'
	);
	let isGenerated = $derived(node.entityType === 'generated');

	// Bridge link detection for current card
	let currentBridgeLinks = $derived(() => {
		// Story Engine card
		if (node.storyEngineCard) {
			const activeCue = node.storyEngineCard.cues[node.storyEngineCard.activeCueIndex];
			return detectBridgeLinks(activeCue);
		}
		// World Builder card
		if (node.worldBuilderCard) {
			let activeCue = '';
			if (node.worldBuilderCard.cues) {
				activeCue = node.worldBuilderCard.cues[node.worldBuilderCard.activeCueIndex];
			} else if (node.worldBuilderCard.cue) {
				activeCue = node.worldBuilderCard.cue;
			}
			return detectBridgeLinks(activeCue);
		}
		// Lore Cluster
		if (node.loreCluster) {
			const primaryCue = node.loreCluster.primaryCard.card.primaryCues[node.loreCluster.primaryCard.activeCueIndex];
			return detectBridgeLinks(primaryCue);
		}
		return [];
	});

	// Story Engine rotation handlers
	function handleRotateNext(e: MouseEvent) {
		e.stopPropagation();
		if (!$activeBoard || !node.storyEngineCard) return;

		storyboardStore.rotateStoryEngineCard($activeBoard.id, node.id, 'next');
	}

	function handleRotatePrev(e: MouseEvent) {
		e.stopPropagation();
		if (!$activeBoard || !node.storyEngineCard) return;

		storyboardStore.rotateStoryEngineCard($activeBoard.id, node.id, 'prev');
	}

	function handleSelectCue(cueIndex: number) {
		if (!$activeBoard || !node.storyEngineCard) return;

		storyboardStore.setStoryEngineCue($activeBoard.id, node.id, cueIndex);
	}

	// World Builder rotation handlers
	function handleWorldBuilderRotateNext(e: MouseEvent) {
		e.stopPropagation();
		if (!$activeBoard || !node.worldBuilderCard) return;

		storyboardStore.rotateWorldBuilderCard($activeBoard.id, node.id, 'next');
	}

	function handleWorldBuilderRotatePrev(e: MouseEvent) {
		e.stopPropagation();
		if (!$activeBoard || !node.worldBuilderCard) return;

		storyboardStore.rotateWorldBuilderCard($activeBoard.id, node.id, 'prev');
	}

	function handleWorldBuilderSelectCue(cueIndex: number) {
		if (!$activeBoard || !node.worldBuilderCard) return;

		storyboardStore.setWorldBuilderCue($activeBoard.id, node.id, cueIndex);
	}

	// Lore Master rotation handlers
	function handleLoreMasterRotatePrimary(e: MouseEvent, direction: 'next' | 'prev') {
		e.stopPropagation();
		if (!$activeBoard || !node.loreCluster) return;

		storyboardStore.rotateLoreMasterCard($activeBoard.id, node.id, 'primary', direction);
	}

	function handleLoreMasterRotateSecondary(e: MouseEvent, position: 'top' | 'right' | 'bottom' | 'left', direction: 'next' | 'prev') {
		e.stopPropagation();
		if (!$activeBoard || !node.loreCluster) return;

		storyboardStore.rotateLoreMasterCard($activeBoard.id, node.id, position, direction);
	}

	// Handle window click for context menu
	function handleWindowClick(e: MouseEvent) {
		// Ignore right-clicks (button 2)
		if (e.button === 2) {
			return;
		}

		// Prevent closing immediately after opening (within 100ms)
		const timeSinceOpened = Date.now() - contextMenuOpenedAt;
		if (timeSinceOpened < 100) {
			return;
		}

		if (showContextMenu) {
			closeContextMenu();
		}
	}

	// Bridge Link Handlers
	async function handleSpawnBridgeLink(e: MouseEvent, link: DetectedBridgeLink) {
		e.stopPropagation();
		if (!$activeBoard) return;

		try {
		// Get fresh node data from store (prop may be stale)
		const currentNode = $activeBoard.nodes.find(n => n.id === node.id);
		if (!currentNode) return;

		// Check if this link was already used - if so, navigate to existing node
		console.log('[Bridge Link] Check:', { linkText: link.linkText, tracking: currentNode.bridgeLinksSpawned });
		if (currentNode.bridgeLinksSpawned?.[link.linkText]) {
			const existingNodeId = currentNode.bridgeLinksSpawned[link.linkText].nodeId;
			console.log('[Bridge Link] Found existing:', existingNodeId);
			const existingNode = $activeBoard.nodes.find(n => n.id === existingNodeId);
			if (existingNode) {
				console.log('[Bridge Link] Selecting existing node');
				// Select the existing node instead of spawning a new one
				storyboardStore.selectNode($activeBoard.id, existingNodeId, false);
				return;
			}
			// If node was deleted, remove from tracking and continue to spawn new one
			const updatedTracking = { ...currentNode.bridgeLinksSpawned };
			delete updatedTracking[link.linkText];
			storyboardStore.updateNode($activeBoard.id, node.id, { bridgeLinksSpawned: updatedTracking });
		}

			// Generate a card from the linked deck/type
			if (link.targetDeck === 'lore-master') {
				const loreMasterCard = await getRandomLoreMasterCard(link.targetCardType as any);

				// Add as a lore cluster near this node
				const offsetX = node.width + 50; // Place to the right
				const offsetY = 0;

				const nodeData = {
					x: node.x + offsetX,
					y: node.y + offsetY,
					width: 500,
					height: 600,
					label: link.linkText, // Use link text as label
					notes: `Spawned from bridge link: ${link.linkText}`,
					layer: node.layer,
					loreCluster: {
						primaryCard: {
							card: loreMasterCard,
							activeCueIndex: 0
						},
						topCard: null,
						rightCard: null,
						bottomCard: null,
						leftCard: null
					}
				};

				const newNode = storyboardStore.addNode($activeBoard.id, nodeData, `Spawn bridge link: ${link.linkText}`);

				console.log('[Bridge Link] Spawning new node for:', link.linkText);
				// Track this spawned link with the actual cue text as display name
				if (newNode) {
					const displayName = loreMasterCard.primaryCues[0]; // Use the first primary cue as display name
					const updatedTracking = {
						...currentNode.bridgeLinksSpawned,
						[link.linkText]: { nodeId: newNode.id, displayName }
					};
					storyboardStore.updateNode($activeBoard.id, node.id, { bridgeLinksSpawned: updatedTracking });
				}

				// Create connection between cards (no label on line)
				if (newNode) {
					storyboardStore.addConnection($activeBoard.id, node.id, newNode.id);
				}
			} else if (link.targetDeck === 'world-builder') {
				const worldBuilderCard = await getRandomWorldBuilderCard(link.targetCardType as any);

				// Add as a world builder card near this node
				const offsetX = node.width + 50;
				const offsetY = 0;

				const typeInfo = WORLD_BUILDER_CARD_TYPES[worldBuilderCard.type];

				const nodeData = {
					x: node.x + offsetX,
					y: node.y + offsetY,
					width: 400,
					height: 400,
					label: link.linkText, // Use link text as label
					notes: `Spawned from bridge link: ${link.linkText}`,
					icon: typeInfo.icon,
					layer: node.layer,
					worldBuilderCard: {
						type: worldBuilderCard.type,
						cues: worldBuilderCard.cues ? Array.from(worldBuilderCard.cues) : undefined,
						cue: worldBuilderCard.cue,
						interpretations: worldBuilderCard.interpretations,
						activeCueIndex: 0,
						expansion: worldBuilderCard.expansion
					}
				};

				const newNode = storyboardStore.addNode($activeBoard.id, nodeData, `Spawn bridge link: ${link.linkText}`);


				// Track this spawned link with the actual cue text as display name
				if (newNode) {
					const displayName = worldBuilderCard.cues ? worldBuilderCard.cues[0] : (worldBuilderCard.cue || link.linkText);
					const updatedTracking = {
						...currentNode.bridgeLinksSpawned,
						[link.linkText]: { nodeId: newNode.id, displayName }
					};
					storyboardStore.updateNode($activeBoard.id, node.id, { bridgeLinksSpawned: updatedTracking });
				}


				// Create connection (no label on line)
				if (newNode) {
					storyboardStore.addConnection($activeBoard.id, node.id, newNode.id);
				}
			} else if (link.targetDeck === 'story-engine') {
				const storyEngineCard = await getRandomStoryEngineCard(link.targetCardType as any);

				// Add as a story engine card near this node
				const offsetX = node.width + 50;
				const offsetY = 0;

				const typeInfo = STORY_ENGINE_CARD_TYPES[storyEngineCard.type];

				const nodeData = {
					x: node.x + offsetX,
					y: node.y + offsetY,
					width: 400,
					height: 400,
					label: link.linkText, // Use link text as label
					notes: `Spawned from bridge link: ${link.linkText}`,
					icon: typeInfo.icon,
					layer: node.layer,
					storyEngineCard: {
						type: storyEngineCard.type,
						cues: Array.from(storyEngineCard.cues),
						activeCueIndex: 0,
						expansion: storyEngineCard.expansion
					}
				};

				const newNode = storyboardStore.addNode($activeBoard.id, nodeData, `Spawn bridge link: ${link.linkText}`);

				// Track this spawned link with the actual cue text as display name
				if (newNode) {
					const displayName = storyEngineCard.cues[0]; // Use first cue as display name
					const updatedTracking = {
						...currentNode.bridgeLinksSpawned,
						[link.linkText]: { nodeId: newNode.id, displayName }
					};
					storyboardStore.updateNode($activeBoard.id, node.id, { bridgeLinksSpawned: updatedTracking });
				}

				// Create connection (no label on line)
				if (newNode) {
					storyboardStore.addConnection($activeBoard.id, node.id, newNode.id);
				}
			}
		} catch (error) {
			console.error('Failed to spawn bridge link:', error);
		}
	}
</script>

<svelte:window onmousemove={handleMouseMove} onmouseup={handleMouseUp} onclick={handleWindowClick} />

<foreignObject x={node.x} y={node.y} width={node.width} height={node.height}>
	<div
		class="node {node.selected ? 'selected' : ''} {isDragging ? 'dragging' : ''} {$connectingFromNodeId === node.id ? 'connecting' : ''} {node.groupId ? 'grouped' : ''}"
		data-generated={isGenerated}
		onmousedown={handleMouseDown}
		onclick={handleClick}
		onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(e); }}
		oncontextmenu={handleContextMenu}
		onmouseenter={handleMouseEnter}
		onmouseleave={handleMouseLeave}
		role="button"
		tabindex="0"
	>
		<!-- Group indicator badge -->
		{#if node.groupId}
			<div class="group-badge" title="Grouped - will move together">
				<span class="group-icon">🔗</span>
			</div>
		{/if}

		<!-- Glow effect -->
		<div class="node-glow bg-gradient-to-r {gradientColor}"></div>

		<!-- Content -->
		<div class="node-content">
			{#if node.storyEngineCard?.type}
				{@const seCard = {
					type: node.storyEngineCard.type,
					cues: Array.from(node.storyEngineCard.cues),
					activeCueIndex: node.storyEngineCard.activeCueIndex
				}}
				{@const typeInfo = STORY_ENGINE_CARD_TYPES[seCard.type]}

				<!-- Story Engine Card Header -->
				<div class="story-engine-header">
					<div class="se-header-top">
						<span class="se-icon">{typeInfo.icon}</span>
						<span class="se-type">{typeInfo.name.toUpperCase()}</span>
						<span class="se-cue-count">{seCard.activeCueIndex + 1}/{seCard.cues.length}</span>
						{#if node.storyEngineCard.expansion?.startsWith('bridge-')}
							<span class="bridge-badge" title="Bridge Expansion Card">🌉</span>
						{/if}
					</div>
					<div class="se-controls">
						<button class="se-rotate-btn" onclick={handleRotatePrev} title="Previous cue">◄</button>
						<button class="se-rotate-btn" onclick={handleRotateNext} title="Next cue">►</button>
					</div>
				</div>

				<!-- Active Cue Display -->
				<div class="se-active-cue">{seCard.cues[seCard.activeCueIndex]}</div>

				<!-- Bridge Links (if any) -->
				{#if currentBridgeLinks().length > 0}
					<div class="bridge-links">
						<div class="bridge-links-label">🌉 Bridge Links:</div>
						{#each currentBridgeLinks() as link}
							{@const spawnedLink = node.bridgeLinksSpawned?.[link.linkText]}
							{@const displayText = spawnedLink?.displayName || link.linkText}
							<button class="bridge-link-btn" onclick={(e) => handleSpawnBridgeLink(e, link)} title="Generate a {link.targetCardType} from {link.targetDeck}">
								<span class="bridge-link-icon">🔗</span>
								<span class="bridge-link-text">{displayText}</span>
								<span class="bridge-link-arrow">→</span>
							</button>
						{/each}
					</div>
				{/if}

				<!-- All Cues List (shown when selected) -->
				{#if node.selected && !node.collapsed}
					<div class="se-cues-list">
						<div class="se-list-title">All Cues:</div>
						{#each seCard.cues as cue, index (index)}
							<button
								class="se-cue-item {index === seCard.activeCueIndex ? 'se-active' : ''}"
								onclick={() => handleSelectCue(index)}
							>
								<span class="se-bullet">{index === seCard.activeCueIndex ? '►' : '•'}</span>
								<span class="se-cue-text">{cue}</span>
							</button>
						{/each}
					</div>
				{/if}
			{:else if node.worldBuilderCard?.type}
				{@const wbCard = node.worldBuilderCard}
				{@const typeInfo = WORLD_BUILDER_CARD_TYPES[wbCard.type]}

				<!-- World Builder Card Header -->
				<div class="story-engine-header">
					<div class="se-header-top">
						<span class="se-icon">{typeInfo.icon}</span>
						<span class="se-type">{typeInfo.name.toUpperCase()}</span>
						{#if wbCard.cues}
							<span class="se-cue-count">{wbCard.activeCueIndex + 1}/{wbCard.cues.length}</span>
						{/if}
						{#if wbCard.expansion?.startsWith('bridge-')}
							<span class="bridge-badge" title="Bridge Expansion Card">🌉</span>
						{/if}
					</div>
					{#if wbCard.cues && wbCard.cues.length > 1}
						<div class="se-controls">
							<button class="se-rotate-btn" onclick={handleWorldBuilderRotatePrev} title="Previous cue">◄</button>
							<button class="se-rotate-btn" onclick={handleWorldBuilderRotateNext} title="Next cue">►</button>
						</div>
					{/if}
				</div>

				<!-- Active Cue Display -->
				{#if wbCard.type === 'adventure'}
					<!-- Adventure Card: Title, Summary, and Question Cues -->
					{#if wbCard.title}
						<div class="wb-adventure-title">{wbCard.title}</div>
					{/if}
					{#if wbCard.summary}
						<div class="wb-adventure-summary">{wbCard.summary}</div>
					{/if}
					{#if wbCard.cues && wbCard.cues.length > 0}
						<div class="wb-adventure-questions">
							<div class="wb-questions-label">Questions:</div>
							{#each wbCard.cues as cue, index}
								<div class="wb-question-item">
									<span class="wb-question-number">{index + 1}.</span>
									<span class="wb-question-text">{cue}</span>
								</div>
							{/each}
						</div>
					{/if}
				{:else if wbCard.type === 'keyhole'}
					<!-- Keyhole Card: Cultural Questions -->
					{#if wbCard.questions && wbCard.questions.length > 0}
						<div class="wb-keyhole-questions">
							<div class="wb-keyhole-label">Cultural Questions:</div>
							{#each wbCard.questions as question, index}
								<div class="wb-keyhole-item">
									<span class="wb-keyhole-number">{index + 1}.</span>
									<span class="wb-keyhole-text">{question}</span>
								</div>
							{/each}
						</div>
					{/if}
				{:else if wbCard.cues}
					<div class="se-active-cue">{wbCard.cues[wbCard.activeCueIndex]}</div>

					<!-- Bridge Links (if any) -->
					{#if currentBridgeLinks().length > 0}
						<div class="bridge-links">
							<div class="bridge-links-label">🌉 Bridge Links:</div>
							{#each currentBridgeLinks() as link}
								{@const spawnedLink = node.bridgeLinksSpawned?.[link.linkText]}
								{@const displayText = spawnedLink?.displayName || link.linkText}
								<button class="bridge-link-btn" onclick={(e) => handleSpawnBridgeLink(e, link)} title="Generate a {link.targetCardType} from {link.targetDeck}">
									<span class="bridge-link-icon">🔗</span>
									<span class="bridge-link-text">{displayText}</span>
									<span class="bridge-link-arrow">→</span>
								</button>
							{/each}
						</div>
					{/if}

					<!-- All Cues List (shown when selected) -->
					{#if node.selected && !node.collapsed && wbCard.cues.length > 1}
						<div class="se-cues-list">
							<div class="se-list-title">All Cues:</div>
							{#each wbCard.cues as cue, index (index)}
								<button
									class="se-cue-item {index === wbCard.activeCueIndex ? 'se-active' : ''}"
									onclick={() => handleWorldBuilderSelectCue(index)}
								>
									<span class="se-bullet">{index === wbCard.activeCueIndex ? '►' : '•'}</span>
									<span class="se-cue-text">{cue}</span>
								</button>
							{/each}
						</div>
					{/if}
				{:else if wbCard.cue}
					<!-- Advent card with single cue + interpretations -->
					<div class="se-active-cue wb-advent-cue">{wbCard.cue}</div>

					{#if wbCard.interpretations && wbCard.interpretations.length > 0}
						<div class="wb-interpretations">
							<div class="wb-interpretations-label">Interpretations:</div>
							{#each wbCard.interpretations as interpretation}
								<div class="wb-interpretation-item">• {interpretation}</div>
							{/each}
						</div>
					{/if}
				{/if}
			{:else if node.loreCluster}
				{@const loreCluster = node.loreCluster}
				{@const primaryCard = loreCluster.primaryCard.card}
				{@const primaryTypeInfo = LORE_MASTER_CARD_TYPES[primaryCard.type]}
				{@const primaryActiveCueRaw = primaryCard.primaryCues[loreCluster.primaryCard.activeCueIndex]}
				{@const primaryActiveCue = getDisplayCue(primaryActiveCueRaw, loreCluster.primaryCard.pairedDeity)}

				<!-- Lore Cluster Layout -->
				<div class="lore-cluster">
					<!-- Primary Card (Center) -->
					<div class="lore-primary-card">
						<div class="lore-card-header">
							<span class="lore-icon">{primaryTypeInfo.emoji}</span>
							<span class="lore-type">{primaryTypeInfo.name.toUpperCase()}</span>
							<span class="lore-cue-count">{loreCluster.primaryCard.activeCueIndex + 1}/{primaryCard.primaryCues.length}</span>
							{#if primaryCard.expansion?.startsWith('bridge-')}
								<span class="bridge-badge" title="Bridge Expansion Card">🌉</span>
							{/if}
							{#if loreCluster.primaryCard.pairedDeity}
								<span class="deity-indicator" title="Paired with {loreCluster.primaryCard.pairedDeity.deityName}">🌟</span>
							{/if}
						</div>
						<div class="lore-controls">
							<button class="lore-rotate-btn" onclick={(e) => handleLoreMasterRotatePrimary(e, 'prev')} title="Previous cue">◄</button>
							<button class="lore-rotate-btn" onclick={(e) => handleLoreMasterRotatePrimary(e, 'next')} title="Next cue">►</button>
						</div>
						<div class="lore-primary-cue">{primaryActiveCue}</div>
						{#if loreCluster.primaryCard.pairedDeity}
							<div class="deity-tag">✨ {loreCluster.primaryCard.pairedDeity.deityName}</div>
						{/if}

						<!-- Bridge Links (if any) -->
						{#if currentBridgeLinks().length > 0}
							<div class="bridge-links bridge-links-lore">
								<div class="bridge-links-label">🌉 Bridge Links:</div>
								{#each currentBridgeLinks() as link}
									{@const spawnedLink = node.bridgeLinksSpawned?.[link.linkText]}
									{@const displayText = spawnedLink?.displayName || link.linkText}
									<button class="bridge-link-btn" onclick={(e) => handleSpawnBridgeLink(e, link)} title="Generate a {link.targetCardType} from {link.targetDeck}">
										<span class="bridge-link-icon">🔗</span>
										<span class="bridge-link-text">{displayText}</span>
										<span class="bridge-link-arrow">→</span>
									</button>
								{/each}
							</div>
						{/if}
					</div>

					<!-- Secondary Cards (Tucked on Edges) -->
					{#if loreCluster.topCard}
						{@const topCard = loreCluster.topCard.card}
						{@const topTypeInfo = LORE_MASTER_CARD_TYPES[topCard.type]}
						{@const topActiveCueRaw = topCard.secondaryCues[loreCluster.topCard.activeCueIndex]}
						{@const topActiveCue = getDisplayCue(topActiveCueRaw, loreCluster.topCard.pairedDeity)}
						<div class="lore-secondary-card lore-top-card">
							<div class="lore-secondary-header">
								<span class="lore-secondary-icon">{topTypeInfo.emoji}</span>
								<span class="lore-secondary-type">{topTypeInfo.name}</span>
								{#if loreCluster.topCard.pairedDeity}
									<span class="deity-indicator-small" title="{loreCluster.topCard.pairedDeity.deityName}">🌟</span>
								{/if}
							</div>
							<div class="lore-secondary-cue">{topActiveCue}</div>
							<div class="lore-secondary-controls">
								<button class="lore-rotate-small" onclick={(e) => handleLoreMasterRotateSecondary(e, 'top', 'prev')}>◄</button>
								<button class="lore-rotate-small" onclick={(e) => handleLoreMasterRotateSecondary(e, 'top', 'next')}>►</button>
							</div>
						</div>
					{/if}

					{#if loreCluster.rightCard}
						{@const rightCard = loreCluster.rightCard.card}
						{@const rightTypeInfo = LORE_MASTER_CARD_TYPES[rightCard.type]}
						{@const rightActiveCueRaw = rightCard.secondaryCues[loreCluster.rightCard.activeCueIndex]}
						{@const rightActiveCue = getDisplayCue(rightActiveCueRaw, loreCluster.rightCard.pairedDeity)}
						<div class="lore-secondary-card lore-right-card">
							<div class="lore-secondary-header">
								<span class="lore-secondary-icon">{rightTypeInfo.emoji}</span>
								<span class="lore-secondary-type">{rightTypeInfo.name}</span>
								{#if loreCluster.rightCard.pairedDeity}
									<span class="deity-indicator-small" title="{loreCluster.rightCard.pairedDeity.deityName}">🌟</span>
								{/if}
							</div>
							<div class="lore-secondary-cue">{rightActiveCue}</div>
							<div class="lore-secondary-controls">
								<button class="lore-rotate-small" onclick={(e) => handleLoreMasterRotateSecondary(e, 'right', 'prev')}>◄</button>
								<button class="lore-rotate-small" onclick={(e) => handleLoreMasterRotateSecondary(e, 'right', 'next')}>►</button>
							</div>
						</div>
					{/if}

					{#if loreCluster.bottomCard}
						{@const bottomCard = loreCluster.bottomCard.card}
						{@const bottomTypeInfo = LORE_MASTER_CARD_TYPES[bottomCard.type]}
						{@const bottomActiveCueRaw = bottomCard.secondaryCues[loreCluster.bottomCard.activeCueIndex]}
						{@const bottomActiveCue = getDisplayCue(bottomActiveCueRaw, loreCluster.bottomCard.pairedDeity)}
						<div class="lore-secondary-card lore-bottom-card">
							<div class="lore-secondary-header">
								<span class="lore-secondary-icon">{bottomTypeInfo.emoji}</span>
								<span class="lore-secondary-type">{bottomTypeInfo.name}</span>
								{#if loreCluster.bottomCard.pairedDeity}
									<span class="deity-indicator-small" title="{loreCluster.bottomCard.pairedDeity.deityName}">🌟</span>
								{/if}
							</div>
							<div class="lore-secondary-cue">{bottomActiveCue}</div>
							<div class="lore-secondary-controls">
								<button class="lore-rotate-small" onclick={(e) => handleLoreMasterRotateSecondary(e, 'bottom', 'prev')}>◄</button>
								<button class="lore-rotate-small" onclick={(e) => handleLoreMasterRotateSecondary(e, 'bottom', 'next')}>►</button>
							</div>
						</div>
					{/if}

					{#if loreCluster.leftCard}
						{@const leftCard = loreCluster.leftCard.card}
						{@const leftTypeInfo = LORE_MASTER_CARD_TYPES[leftCard.type]}
						{@const leftActiveCueRaw = leftCard.secondaryCues[loreCluster.leftCard.activeCueIndex]}
						{@const leftActiveCue = getDisplayCue(leftActiveCueRaw, loreCluster.leftCard.pairedDeity)}
						<div class="lore-secondary-card lore-left-card">
							<div class="lore-secondary-header">
								<span class="lore-secondary-icon">{leftTypeInfo.emoji}</span>
								<span class="lore-secondary-type">{leftTypeInfo.name}</span>
								{#if loreCluster.leftCard.pairedDeity}
									<span class="deity-indicator-small" title="{loreCluster.leftCard.pairedDeity.deityName}">🌟</span>
								{/if}
							</div>
							<div class="lore-secondary-cue">{leftActiveCue}</div>
							<div class="lore-secondary-controls">
								<button class="lore-rotate-small" onclick={(e) => handleLoreMasterRotateSecondary(e, 'left', 'prev')}>◄</button>
								<button class="lore-rotate-small" onclick={(e) => handleLoreMasterRotateSecondary(e, 'left', 'next')}>►</button>
							</div>
						</div>
					{/if}

					<!-- Modifier Card (if present) -->
					{#if loreCluster.modifierCard}
						{@const modifierCard = loreCluster.modifierCard.card}
						{@const modifierCue = modifierCard.secondaryCues[loreCluster.modifierCard.activeCueIndex]}
						<div class="lore-modifier-card">
							<div class="modifier-header">
								<span class="modifier-icon">⭕</span>
								<span class="modifier-type">MODIFIER</span>
							</div>
							<div class="modifier-cue">{modifierCue}</div>
							{#if loreCluster.expandedFromNodeId}
								<div class="expansion-arrow">↗️ Expanded</div>
							{/if}
						</div>
					{/if}
				</div>
			{:else}
				<!-- Regular Card Layout -->
				<div class="node-header">
					<span class="node-icon">{node.icon || iconEmoji}</span>
					{#if node.selected}
						<input
							type="text"
							value={node.label}
							oninput={handleLabelInput}
							class="node-title-input"
							placeholder="Card name..."
						/>
					{:else}
						<span class="node-title">{node.label || 'Unnamed'}</span>
					{/if}
					{#if isGenerated}
						<span class="generated-badge" title="Generated from table">⚡</span>
					{/if}
				</div>

				{#if node.notes && !node.collapsed}
					<p class="node-notes">{node.notes}</p>
				{/if}

				{#if entityMissing && !node.collapsed}
					<div class="entity-warning">
						<span class="warning-icon">⚠️</span>
						<span class="warning-text">Entity deleted</span>
					</div>
				{/if}

				{#if node.entityType && !node.collapsed}
					<div class="node-footer">
						<span class="node-type">{node.entityType}</span>
						{#if linkedEntity}
							<button class="goto-btn" onclick={handleGotoEntity} title="Open in workspace">
								→
							</button>
						{/if}
					</div>
				{/if}
			{/if}
		</div>
	</div>
</foreignObject>

<!-- Entity tooltip (rendered outside foreignObject with fixed positioning) -->
{#if showTooltip && linkedEntity}
	<foreignObject x="0" y="0" width="100%" height="100%" style="pointer-events: none; overflow: visible;">
		<div
			class="tooltip"
			style="position: fixed; left: {tooltipPos.x}px; top: {tooltipPos.y}px;"
		>
			<div class="tooltip-header">
				<span class="tooltip-icon">{node.icon || iconEmoji}</span>
				<span class="tooltip-title">{linkedEntity.name}</span>
			</div>
			<div class="tooltip-type">{linkedEntity.type}</div>
			{#if linkedEntity.description}
				<div class="tooltip-description">{linkedEntity.description}</div>
			{/if}
			{#if linkedEntity.tags && linkedEntity.tags.length > 0}
				<div class="tooltip-tags">
					{#each linkedEntity.tags as tag}
						<span class="tag">{tag}</span>
					{/each}
				</div>
			{/if}
		</div>
	</foreignObject>
{/if}

<style>
	.node {
		position: relative;
		background: rgb(30 27 75 / 0.95);
		border: 2px solid rgb(168 85 247 / 0.3);
		border-radius: 0.75rem;
		padding: 0.75rem;
		cursor: move;
		transition: all 0.2s;
		user-select: none;
		backdrop-filter: blur(8px);
		box-shadow: 0 4px 12px rgb(0 0 0 / 0.3);
	}

	/* Grouped nodes styling */
	.node.grouped {
		border-color: rgb(59 130 246 / 0.5);
		box-shadow:
			0 0 0 2px rgb(59 130 246 / 0.2),
			0 4px 12px rgb(0 0 0 / 0.3);
	}

	.node.grouped:hover {
		border-color: rgb(59 130 246 / 0.7);
		box-shadow:
			0 0 0 2px rgb(59 130 246 / 0.3),
			0 8px 24px rgb(59 130 246 / 0.3);
	}

	/* Generated cards styling */
	:global(.node[data-generated='true']) {
		background: rgb(69 26 3 / 0.95);
		border-color: rgb(251 191 36 / 0.5);
	}

	:global(.node[data-generated='true']:hover) {
		border-color: rgb(251 191 36 / 0.7);
		box-shadow: 0 8px 24px rgb(251 191 36 / 0.3);
	}

	.node:hover {
		border-color: rgb(168 85 247 / 0.5);
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgb(168 85 247 / 0.3);
	}

	.node.selected {
		border-color: rgb(59 130 246);
		border-width: 3px;
		box-shadow:
			0 0 0 3px rgb(59 130 246 / 0.3),
			0 0 20px rgb(59 130 246 / 0.4),
			0 8px 32px rgb(59 130 246 / 0.3);
		transform: translateY(-2px);
		z-index: 10;
	}

	.node.dragging {
		opacity: 0.7;
		cursor: grabbing;
	}

	.node.connecting {
		border-color: rgb(34 197 94);
		border-width: 3px;
		box-shadow:
			0 0 0 3px rgb(34 197 94 / 0.3),
			0 0 20px rgb(34 197 94 / 0.4),
			0 8px 32px rgb(34 197 94 / 0.3);
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%, 100% {
			box-shadow:
				0 0 0 3px rgb(34 197 94 / 0.3),
				0 0 20px rgb(34 197 94 / 0.4),
				0 8px 32px rgb(34 197 94 / 0.3);
		}
		50% {
			box-shadow:
				0 0 0 6px rgb(34 197 94 / 0.5),
				0 0 30px rgb(34 197 94 / 0.6),
				0 8px 32px rgb(34 197 94 / 0.5);
		}
	}

	.node-glow {
		position: absolute;
		inset: -2px;
		border-radius: 0.75rem;
		opacity: 0;
		transition: opacity 0.2s;
		pointer-events: none;
		filter: blur(8px);
		z-index: -1;
	}

	.node:hover .node-glow {
		opacity: 0.3;
	}

	.node.selected .node-glow {
		opacity: 0.5;
	}

	.node-content {
		position: relative;
		z-index: 1;
	}

	.node-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
		position: relative;
	}

	.generated-badge {
		margin-left: auto;
		font-size: 0.875rem;
		animation: sparkle 2s infinite;
	}

	@keyframes sparkle {
		0%, 100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.7;
			transform: scale(1.2);
		}
	}

	.node-icon {
		font-size: 1.25rem;
		flex-shrink: 0;
	}

	.node-title {
		font-weight: 600;
		color: white;
		font-size: 0.875rem;
		flex: 1;
	}

	.node-title-input {
		flex: 1;
		background: transparent;
		border: none;
		border-bottom: 1px solid rgb(168 85 247 / 0.5);
		color: white;
		font-size: 0.875rem;
		font-weight: 600;
		padding: 0.125rem 0;
		outline: none;
	}

	.node-title-input:focus {
		border-bottom-color: rgb(59 130 246);
	}

	.node-notes {
		color: rgb(216 180 254);
		font-size: 0.75rem;
		margin-bottom: 0.5rem;
		line-height: 1.4;
	}

	.node-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 0.5rem;
	}

	.node-type {
		font-size: 0.625rem;
		text-transform: uppercase;
		color: rgb(168 85 247);
		background: rgb(168 85 247 / 0.2);
		padding: 0.125rem 0.5rem;
		border-radius: 9999px;
		font-weight: 600;
	}

	.entity-warning {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem 0.5rem;
		background: rgb(239 68 68 / 0.2);
		border: 1px solid rgb(239 68 68 / 0.4);
		border-radius: 0.25rem;
		margin-bottom: 0.5rem;
	}

	.warning-icon {
		font-size: 0.875rem;
	}

	.warning-text {
		font-size: 0.625rem;
		color: rgb(252 165 165);
		font-weight: 600;
	}

	.goto-btn {
		background: rgba(59, 130, 246, 0.2);
		border: 1px solid rgba(59, 130, 246, 0.4);
		color: rgb(147, 197, 253);
		padding: 0.125rem 0.5rem;
		border-radius: 0.25rem;
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: bold;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.goto-btn:hover {
		background: rgba(59, 130, 246, 0.4);
		border-color: rgba(59, 130, 246, 0.6);
		transform: scale(1.1);
	}

	.goto-btn:active {
		transform: scale(0.95);
	}

	.tooltip {
		min-width: 250px;
		max-width: 350px;
		background: rgb(15 23 42);
		border: 2px solid rgb(139 92 246);
		border-radius: 0.5rem;
		padding: 1rem;
		box-shadow: 0 10px 40px rgb(0 0 0 / 0.5);
		z-index: 1000;
		pointer-events: none;
		animation: fadeIn 0.2s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-5px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.tooltip-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.tooltip-icon {
		font-size: 1.5rem;
	}

	.tooltip-title {
		font-size: 1rem;
		font-weight: 600;
		color: rgb(226 232 240);
	}

	.tooltip-type {
		font-size: 0.75rem;
		text-transform: uppercase;
		color: rgb(168 85 247);
		background: rgb(168 85 247 / 0.2);
		padding: 0.25rem 0.5rem;
		border-radius: 9999px;
		font-weight: 600;
		display: inline-block;
		margin-bottom: 0.5rem;
	}

	.tooltip-description {
		color: rgb(203 213 225);
		font-size: 0.875rem;
		line-height: 1.5;
		margin-bottom: 0.5rem;
	}

	.tooltip-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		margin-top: 0.5rem;
	}

	.tooltip-tags .tag {
		font-size: 0.75rem;
		color: rgb(147 197 253);
		background: rgb(59 130 246 / 0.2);
		padding: 0.125rem 0.5rem;
		border-radius: 9999px;
		border: 1px solid rgb(59 130 246 / 0.3);
	}

	.context-menu {
		background: rgb(15 23 42);
		border: 2px solid rgb(251 191 36);
		border-radius: 0.5rem;
		padding: 0.5rem;
		box-shadow: 0 10px 40px rgb(0 0 0 / 0.8);
		min-width: 200px;
		animation: fadeIn 0.15s ease-out;
	}

	.context-menu-item {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		background: transparent;
		border: none;
		border-radius: 0.25rem;
		color: white;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
	}

	.context-menu-item:hover {
		background: rgb(251 191 36 / 0.2);
	}

	.context-icon {
		font-size: 1.125rem;
	}

	/* Story Engine Card Styles */
	.story-engine-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
		padding-bottom: 0.75rem;
		border-bottom: 2px solid rgba(255, 255, 255, 0.15);
	}

	.se-header-top {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex: 1;
	}

	.se-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
	}

	.se-type {
		font-size: 0.75rem;
		font-weight: 800;
		color: white;
		letter-spacing: 0.1em;
		flex: 1;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.se-cue-count {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.8);
		font-weight: 700;
		background: rgba(0, 0, 0, 0.2);
		padding: 0.25rem 0.5rem;
		border-radius: 0.375rem;
	}

	.se-controls {
		display: flex;
		gap: 0.375rem;
		flex-shrink: 0;
	}

	.se-rotate-btn {
		background: rgba(255, 255, 255, 0.15);
		border: 1.5px solid rgba(255, 255, 255, 0.3);
		border-radius: 0.375rem;
		color: white;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 0.875rem;
		font-weight: bold;
		padding: 0;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.se-rotate-btn:hover {
		background: rgba(255, 255, 255, 0.25);
		border-color: rgba(255, 255, 255, 0.5);
		transform: scale(1.1);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
	}

	.se-rotate-btn:active {
		transform: scale(0.95);
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
	}

	.se-active-cue {
		font-size: 1.125rem;
		font-weight: 800;
		color: white;
		text-align: center;
		padding: 1rem;
		line-height: 1.4;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		background: rgba(0, 0, 0, 0.15);
		border-radius: 0.5rem;
		min-height: 4rem;
		display: flex;
		align-items: center;
		justify-content: center;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.se-cues-list {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 2px solid rgba(255, 255, 255, 0.15);
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.se-list-title {
		font-size: 0.75rem;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.7);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.5rem;
	}

	.se-cue-item {
		display: flex;
		align-items: flex-start;
		gap: 0.625rem;
		padding: 0.5rem 0.75rem;
		background: rgba(0, 0, 0, 0.15);
		border: 1.5px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.375rem;
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
		width: 100%;
	}

	.se-cue-item:hover {
		background: rgba(255, 255, 255, 0.15);
		border-color: rgba(255, 255, 255, 0.3);
		transform: translateX(4px);
	}

	.se-cue-item.se-active {
		background: rgba(255, 255, 255, 0.2);
		border-color: rgba(255, 255, 255, 0.4);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}

	.se-bullet {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.6);
		width: 1rem;
		flex-shrink: 0;
		margin-top: 0.125rem;
	}

	.se-cue-item.se-active .se-bullet {
		color: white;
	}

	.se-cue-text {
		font-size: 0.8125rem;
		color: rgba(255, 255, 255, 0.8);
		flex: 1;
		line-height: 1.4;
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}

	.se-cue-item.se-active .se-cue-text {
		color: white;
		font-weight: 700;
	}

	/* Group badge styling */
	.group-badge {
		position: absolute;
		top: -8px;
		right: -8px;
		width: 24px;
		height: 24px;
		background: linear-gradient(135deg, rgb(59 130 246), rgb(37 99 235));
		border: 2px solid rgb(15 23 42);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10;
		box-shadow: 0 2px 8px rgb(0 0 0 / 0.4);
		animation: groupPulse 2s infinite;
	}

	@keyframes groupPulse {
		0%, 100% {
			box-shadow: 0 2px 8px rgb(59 130 246 / 0.4);
		}
		50% {
			box-shadow: 0 2px 12px rgb(59 130 246 / 0.6);
		}
	}

	.group-icon {
		font-size: 0.75rem;
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
	}

	/* World Builder Card Styles */
	.wb-advent-cue {
		font-size: 0.9375rem;
		text-transform: none;
		letter-spacing: 0.025em;
	}

	.wb-interpretations {
		margin-top: 1rem;
		padding: 0.875rem;
		background: rgba(6, 182, 212, 0.1);
		border-left: 3px solid rgb(6, 182, 212);
		border-radius: 0.375rem;
	}

	.wb-interpretations-label {
		font-size: 0.75rem;
		font-weight: 700;
		color: rgb(6, 182, 212);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.5rem;
	}

	.wb-interpretation-item {
		font-size: 0.8125rem;
		color: rgba(255, 255, 255, 0.85);
		line-height: 1.5;
		margin-bottom: 0.375rem;
		padding-left: 0.5rem;
	}

	.wb-interpretation-item:last-child {
		margin-bottom: 0;
	}

	/* Adventure Card Styles */
	.wb-adventure-title {
		font-size: 1.25rem;
		font-weight: 800;
		color: white;
		line-height: 1.3;
		margin-bottom: 0.75rem;
		padding: 0.875rem;
		background: rgba(239, 68, 68, 0.15);
		border-left: 4px solid rgb(239, 68, 68);
		border-radius: 0.375rem;
		letter-spacing: 0.025em;
	}

	.wb-adventure-summary {
		font-size: 0.9375rem;
		color: rgba(255, 255, 255, 0.9);
		line-height: 1.6;
		margin-bottom: 0.875rem;
		padding: 0.875rem;
		background: rgba(249, 115, 22, 0.1);
		border-left: 3px solid rgb(249, 115, 22);
		border-radius: 0.375rem;
	}

	.wb-adventure-questions {
		margin-top: 0.875rem;
	}

	.wb-questions-label {
		font-size: 0.75rem;
		font-weight: 700;
		color: rgb(251, 146, 60);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.625rem;
		padding-left: 0.25rem;
	}

	.wb-question-item {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
		padding: 0.625rem 0.75rem;
		background: rgba(249, 115, 22, 0.08);
		border-left: 2px solid rgba(251, 146, 60, 0.4);
		border-radius: 0.25rem;
		transition: all 0.2s;
	}

	.wb-question-item:hover {
		background: rgba(249, 115, 22, 0.15);
		border-left-color: rgb(251, 146, 60);
	}

	.wb-question-item:last-child {
		margin-bottom: 0;
	}

	.wb-question-number {
		font-size: 0.8125rem;
		font-weight: 700;
		color: rgb(251, 146, 60);
		flex-shrink: 0;
		min-width: 1.25rem;
	}

	.wb-question-text {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.9);
		line-height: 1.5;
		flex: 1;
	}

	/* Keyhole Card Styles */
	.wb-keyhole-questions {
		margin-top: 0.875rem;
	}

	.wb-keyhole-label {
		font-size: 0.75rem;
		font-weight: 700;
		color: rgb(245, 158, 11);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.625rem;
		padding-left: 0.25rem;
	}

	.wb-keyhole-item {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
		padding: 0.625rem 0.75rem;
		background: rgba(245, 158, 11, 0.08);
		border-left: 2px solid rgba(245, 158, 11, 0.4);
		border-radius: 0.25rem;
		transition: all 0.2s;
	}

	.wb-keyhole-item:hover {
		background: rgba(245, 158, 11, 0.15);
		border-left-color: rgb(245, 158, 11);
	}

	.wb-keyhole-item:last-child {
		margin-bottom: 0;
	}

	.wb-keyhole-number {
		font-size: 0.8125rem;
		font-weight: 700;
		color: rgb(245, 158, 11);
		flex-shrink: 0;
		min-width: 1.25rem;
	}

	.wb-keyhole-text {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.9);
		line-height: 1.5;
		flex: 1;
	}

	/* Lore Master's Deck Cluster Styles */
	.lore-cluster {
		position: relative;
		width: 100%;
		min-height: 500px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.lore-primary-card {
		position: relative;
		background: rgba(0, 0, 0, 0.3);
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 0.75rem;
		padding: 1rem;
		min-width: 250px;
		max-width: 300px;
		z-index: 5;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
	}

	.lore-card-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
		padding-bottom: 0.5rem;
		border-bottom: 2px solid rgba(255, 255, 255, 0.15);
	}

	.lore-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
	}

	.lore-type {
		font-size: 0.75rem;
		font-weight: 800;
		color: white;
		letter-spacing: 0.1em;
		flex: 1;
	}

	.lore-cue-count {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.8);
		font-weight: 700;
		background: rgba(0, 0, 0, 0.2);
		padding: 0.25rem 0.5rem;
		border-radius: 0.375rem;
	}

	.lore-controls {
		display: flex;
		gap: 0.375rem;
		justify-content: center;
		margin-bottom: 0.75rem;
	}

	.lore-rotate-btn {
		background: rgba(255, 255, 255, 0.15);
		border: 1.5px solid rgba(255, 255, 255, 0.3);
		border-radius: 0.375rem;
		color: white;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 0.875rem;
		font-weight: bold;
		padding: 0;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.lore-rotate-btn:hover {
		background: rgba(255, 255, 255, 0.25);
		border-color: rgba(255, 255, 255, 0.5);
		transform: scale(1.1);
	}

	.lore-primary-cue {
		font-size: 1rem;
		font-weight: 700;
		color: white;
		text-align: center;
		padding: 1rem;
		line-height: 1.4;
		background: rgba(0, 0, 0, 0.15);
		border-radius: 0.5rem;
		min-height: 3rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* Bridge Badge */
	.bridge-badge {
		font-size: 0.875rem;
		margin-left: 0.25rem;
		opacity: 0.9;
		cursor: help;
		filter: drop-shadow(0 0 2px rgba(139, 92, 246, 0.5));
	}

	/* Deity Pairing Indicators */
	.deity-indicator {
		font-size: 1rem;
		margin-left: auto;
		animation: sparkle 2s infinite;
		cursor: help;
	}

	.deity-indicator-small {
		font-size: 0.75rem;
		margin-left: auto;
		animation: sparkle 2s infinite;
		cursor: help;
	}

	.deity-tag {
		margin-top: 0.5rem;
		padding: 0.375rem 0.75rem;
		background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3));
		border: 1px solid rgba(147, 51, 234, 0.5);
		border-radius: 0.375rem;
		font-size: 0.75rem;
		font-weight: 600;
		color: rgba(191, 219, 254, 1);
		text-align: center;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	@keyframes sparkle {
		0%, 100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.7;
			transform: scale(1.1);
		}
	}

	.lore-secondary-card {
		position: absolute;
		background: rgba(0, 0, 0, 0.4);
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-radius: 0.5rem;
		padding: 0.75rem;
		width: 180px;
		z-index: 4;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		transition: all 0.2s;
	}

	.lore-secondary-card:hover {
		border-color: rgba(255, 255, 255, 0.4);
		transform: scale(1.05);
		z-index: 6;
	}

	.lore-top-card {
		top: 0;
		left: 50%;
		transform: translateX(-50%);
	}

	.lore-right-card {
		right: 0;
		top: 50%;
		transform: translateY(-50%);
	}

	.lore-bottom-card {
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
	}

	.lore-left-card {
		left: 0;
		top: 50%;
		transform: translateY(-50%);
	}

	.lore-secondary-header {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		margin-bottom: 0.5rem;
		padding-bottom: 0.375rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.lore-secondary-icon {
		font-size: 1.125rem;
	}

	.lore-secondary-type {
		font-size: 0.6875rem;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.9);
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.lore-secondary-cue {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.85);
		line-height: 1.3;
		margin-bottom: 0.5rem;
		min-height: 2.5rem;
		display: flex;
		align-items: center;
	}

	.lore-secondary-controls {
		display: flex;
		gap: 0.25rem;
		justify-content: center;
	}

	.lore-rotate-small {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 0.25rem;
		color: white;
		width: 1.5rem;
		height: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 0.75rem;
		font-weight: bold;
		padding: 0;
	}

	.lore-rotate-small:hover {
		background: rgba(255, 255, 255, 0.2);
		border-color: rgba(255, 255, 255, 0.4);
		transform: scale(1.1);
	}

	.lore-modifier-card {
		position: absolute;
		bottom: -60px;
		right: 10px;
		background: rgba(100, 100, 100, 0.3);
		border: 2px solid rgba(150, 150, 150, 0.4);
		border-radius: 0.5rem;
		padding: 0.625rem;
		width: 150px;
		z-index: 3;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	}

	.modifier-header {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		margin-bottom: 0.375rem;
	}

	.modifier-icon {
		font-size: 1rem;
	}

	.modifier-type {
		font-size: 0.625rem;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.8);
		letter-spacing: 0.05em;
	}

	.modifier-cue {
		font-size: 0.6875rem;
		color: rgba(255, 255, 255, 0.75);
		line-height: 1.3;
		margin-bottom: 0.375rem;
	}

	.expansion-arrow {
		font-size: 0.625rem;
		color: rgba(255, 255, 255, 0.6);
		text-align: center;
		font-weight: 600;
	}

	/* Bridge Links Styles */
	.bridge-links {
		margin-top: 0.75rem;
		padding: 0.75rem;
		background: rgba(147, 51, 234, 0.1);
		border: 1px solid rgba(147, 51, 234, 0.3);
		border-radius: 0.5rem;
	}

	.bridge-links-lore {
		background: rgba(14, 165, 233, 0.1);
		border-color: rgba(14, 165, 233, 0.3);
	}

	.bridge-links-label {
		font-size: 0.6875rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.8);
		margin-bottom: 0.5rem;
		letter-spacing: 0.05em;
	}

	.bridge-link-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.5rem 0.75rem;
		margin-top: 0.375rem;
		background: rgba(147, 51, 234, 0.2);
		border: 1px solid rgba(147, 51, 234, 0.4);
		border-radius: 0.375rem;
		color: white;
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.bridge-link-btn:hover {
		background: rgba(147, 51, 234, 0.3);
		border-color: rgba(147, 51, 234, 0.6);
		transform: translateX(3px);
		box-shadow: 0 0 10px rgba(147, 51, 234, 0.4);
	}

	.bridge-link-btn:active {
		transform: scale(0.98) translateX(3px);
	}

	.bridge-link-icon {
		font-size: 0.875rem;
	}

	.bridge-link-text {
		flex: 1;
		text-align: left;
		font-size: 0.6875rem;
	}

	.bridge-link-arrow {
		font-size: 0.875rem;
		opacity: 0.7;
	}

	/* Context menu button styles (global since menu is added to body) */
	:global(.ctx-btn) {
		display: block;
		width: 100%;
		padding: 8px 12px;
		text-align: left;
		background: white;
		border: none;
		margin-bottom: 2px;
		cursor: pointer;
		border-radius: 4px;
		font-size: 14px;
		color: #333;
		transition: background 0.2s;
	}

	:global(.ctx-btn:hover) {
		background: #f0f0f0;
	}

	:global(.ctx-btn:active) {
		background: #e0e0e0;
	}
</style>
