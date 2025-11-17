<script lang="ts">
	import { storyboardStore, activeBoard, connectingFromNodeId } from '$lib/stores/storyboardStore';
	import { entityStore, allEntities } from '$lib/stores/entityStore';
	import { tabStore } from '$lib/stores/tabStore';
	import type { StoryBoardNode } from '$lib/types/storyboard';
	import type { Entity } from '$lib/types/entity';
	import { getEntityTypesList } from '$lib/entities/entityRegistry';
	import { STORY_ENGINE_CARD_TYPES } from '$lib/types/storyEngine';

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
		// Show context menu for generated cards OR grouped nodes
		if (!isGenerated && !node.groupId) return;

		e.preventDefault();
		e.stopPropagation();

		contextMenuPos = { x: e.clientX, y: e.clientY };
		showContextMenu = true;
	}

	function closeContextMenu() {
		showContextMenu = false;
	}

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
			: node.entityType && colorMap[node.entityType]
				? colorMap[node.entityType]
				: 'from-purple-500 to-pink-500'
	);
	let iconEmoji = $derived(
		node.storyEngineCard
			? STORY_ENGINE_CARD_TYPES[node.storyEngineCard.type].icon
			: entityTypeInfo?.icon || node.icon || '📝'
	);
	let isGenerated = $derived(node.entityType === 'generated');

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

	// Handle window click for context menu
	function handleWindowClick(e: MouseEvent) {
		if (showContextMenu) {
			closeContextMenu();
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
					</div>
					<div class="se-controls">
						<button class="se-rotate-btn" onclick={handleRotatePrev} title="Previous cue">◄</button>
						<button class="se-rotate-btn" onclick={handleRotateNext} title="Next cue">►</button>
					</div>
				</div>

				<!-- Active Cue Display -->
				<div class="se-active-cue">{seCard.cues[seCard.activeCueIndex]}</div>

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


		<!-- Context menu for generated cards and grouped nodes -->
		{#if showContextMenu}
			<div
				class="context-menu"
				style="position: fixed; left: {contextMenuPos.x}px; top: {contextMenuPos.y}px; z-index: 1000;"
				onclick={(e) => e.stopPropagation()}
			>
				{#if isGenerated}
					<button class="context-menu-item" onclick={promoteToEntity}>
						<span class="context-icon">⭐</span>
						<span>Promote to Entity</span>
					</button>
				{/if}
				{#if node.groupId}
					<button class="context-menu-item" onclick={ungroupNode}>
						<span class="context-icon">🔓</span>
						<span>Ungroup This Card</span>
					</button>
					<button class="context-menu-item" onclick={ungroupAll}>
						<span class="context-icon">💥</span>
						<span>Ungroup All Cards</span>
					</button>
				{/if}
				<button class="context-menu-item" onclick={closeContextMenu}>
					<span class="context-icon">✕</span>
					<span>Cancel</span>
				</button>
			</div>
		{/if}
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
</style>
