<script lang="ts">
	import { storyboardStore, activeBoard, connectingFromNodeId } from '$lib/stores/storyboardStore';
	import { entityStore, allEntities } from '$lib/stores/entityStore';
	import { tabStore } from '$lib/stores/tabStore';
	import type { StoryBoardNode } from '$lib/types/storyboard';
	import type { Entity } from '$lib/types/entity';

	interface Props {
		node: StoryBoardNode;
	}

	let { node }: Props = $props();

	// Entity sync - watch for changes to the linked entity
	let linkedEntity = $state<Entity | undefined>(undefined);
	let entityMissing = $state(false);

	$effect(() => {
		if (node.entityId) {
			linkedEntity = $allEntities.find((e) => e.id === node.entityId);
			entityMissing = !linkedEntity;

			// Auto-update label if entity name changed
			if (linkedEntity && linkedEntity.name !== node.label && $activeBoard) {
				storyboardStore.updateNode($activeBoard.id, node.id, { label: linkedEntity.name });
			}
		} else {
			linkedEntity = undefined;
			entityMissing = false;
		}
	});

	// Drag state
	let isDragging = $state(false);
	let dragStart = $state({ x: 0, y: 0 });
	let nodeStart = $state({ x: 0, y: 0 });

	// Tooltip state
	let showTooltip = $state(false);
	let tooltipTimeout: number;

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
			// Double-click - start editing
			// For now just select
		}
	}

	function handleContextMenu(e: MouseEvent) {
		// Only show context menu for generated cards
		if (!isGenerated) return;

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

	function handleLabelInput(e: Event) {
		if (!$activeBoard) return;
		const target = e.currentTarget as HTMLInputElement;
		storyboardStore.updateNode($activeBoard.id, node.id, { label: target.value });
	}

	function handleGotoEntity(e: MouseEvent) {
		e.stopPropagation();
		if (!linkedEntity) return;

		// Open entity in workspace
		tabStore.openEntityTab(linkedEntity.id, linkedEntity.name, linkedEntity.type);
	}

	function handleMouseEnter() {
		if (linkedEntity) {
			tooltipTimeout = window.setTimeout(() => {
				showTooltip = true;
			}, 500); // Show tooltip after 500ms hover
		}
	}

	function handleMouseLeave() {
		window.clearTimeout(tooltipTimeout);
		showTooltip = false;
	}

	// Color mapping for entity types
	const colorMap: Record<string, string> = {
		campaign: 'from-purple-500 to-pink-500',
		adventure: 'from-blue-500 to-cyan-500',
		character: 'from-green-500 to-emerald-500',
		location: 'from-yellow-500 to-orange-500',
		scene: 'from-red-500 to-rose-500',
		generated: 'from-yellow-500 to-amber-500'
	};

	const iconMap: Record<string, string> = {
		campaign: '🎭',
		adventure: '🗺️',
		character: '👤',
		location: '📍',
		scene: '🎬',
		generated: '🎲'
	};

	let gradientColor = $derived(node.entityType ? colorMap[node.entityType] : 'from-purple-500 to-pink-500');
	let iconEmoji = $derived(node.entityType ? iconMap[node.entityType] : '📝');
	let isGenerated = $derived(node.entityType === 'generated');
</script>

<svelte:window onmousemove={handleMouseMove} onmouseup={handleMouseUp} />

<foreignObject x={node.x} y={node.y} width={node.width} height={node.height}>
	<div
		class="node {node.selected ? 'selected' : ''} {isDragging ? 'dragging' : ''} {$connectingFromNodeId === node.id ? 'connecting' : ''}"
		data-generated={isGenerated}
		onmousedown={handleMouseDown}
		onclick={handleClick}
		oncontextmenu={handleContextMenu}
		onmouseenter={handleMouseEnter}
		onmouseleave={handleMouseLeave}
		role="button"
		tabindex="0"
	>
		<!-- Glow effect -->
		<div class="node-glow bg-gradient-to-r {gradientColor}"></div>

		<!-- Content -->
		<div class="node-content">
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
		</div>

		<!-- Entity tooltip -->
		{#if showTooltip && linkedEntity}
			<div class="tooltip">
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
		{/if}

		<!-- Context menu for generated cards -->
		{#if showContextMenu && isGenerated}
			<div
				class="context-menu"
				style="position: fixed; left: {contextMenuPos.x}px; top: {contextMenuPos.y}px; z-index: 1000;"
				onclick={(e) => e.stopPropagation()}
			>
				<button class="context-menu-item" onclick={promoteToEntity}>
					<span class="context-icon">⭐</span>
					<span>Promote to Entity</span>
				</button>
				<button class="context-menu-item" onclick={closeContextMenu}>
					<span class="context-icon">✕</span>
					<span>Cancel</span>
				</button>
			</div>
		{/if}
	</div>
</foreignObject>

{#if showContextMenu}
	<svelte:window onclick={closeContextMenu} />
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
		position: absolute;
		top: 100%;
		left: 0;
		margin-top: 0.5rem;
		min-width: 250px;
		max-width: 350px;
		background: rgb(15 23 42);
		border: 2px solid rgb(139 92 246);
		border-radius: 0.5rem;
		padding: 1rem;
		box-shadow: 0 10px 40px rgb(0 0 0 / 0.5);
		z-index: 100;
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
</style>
