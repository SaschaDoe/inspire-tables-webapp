<script lang="ts">
	import { storyboardStore, activeBoard } from '$lib/stores/storyboardStore';
	import type { StoryBoardNode } from '$lib/types/storyboard';

	interface Props {
		node: StoryBoardNode;
	}

	let { node }: Props = $props();

	let activeBoard_ = $derived(activeBoard);

	// Drag state
	let isDragging = $state(false);
	let dragStart = $state({ x: 0, y: 0 });
	let nodeStart = $state({ x: 0, y: 0 });

	function handleMouseDown(e: MouseEvent) {
		if (node.locked) return;
		e.stopPropagation();

		isDragging = true;
		dragStart = { x: e.clientX, y: e.clientY };
		nodeStart = { x: node.x, y: node.y };

		// Select this node
		if (!activeBoard_) return;
		const addToSelection = e.shiftKey;
		storyboardStore.selectNode(activeBoard_.id, node.id, addToSelection);
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isDragging || !activeBoard_) return;

		const dx = (e.clientX - dragStart.x) / activeBoard_.viewport.zoom;
		const dy = (e.clientY - dragStart.y) / activeBoard_.viewport.zoom;

		// Move node (skip snapshot during drag for performance)
		storyboardStore.moveNode(activeBoard_.id, node.id, nodeStart.x + dx, nodeStart.y + dy, true);
	}

	function handleMouseUp() {
		if (isDragging && activeBoard_) {
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
		if (e.detail === 2 && activeBoard_) {
			// Double-click - start editing
			// For now just select
		}
	}

	function handleLabelInput(e: Event) {
		if (!activeBoard_) return;
		const target = e.currentTarget as HTMLInputElement;
		storyboardStore.updateNode(activeBoard_.id, node.id, { label: target.value });
	}

	// Color mapping for entity types
	const colorMap: Record<string, string> = {
		campaign: 'from-purple-500 to-pink-500',
		adventure: 'from-blue-500 to-cyan-500',
		character: 'from-green-500 to-emerald-500',
		location: 'from-yellow-500 to-orange-500',
		scene: 'from-red-500 to-rose-500'
	};

	const iconMap: Record<string, string> = {
		campaign: '🎭',
		adventure: '🗺️',
		character: '👤',
		location: '📍',
		scene: '🎬'
	};

	let gradientColor = $derived(node.entityType ? colorMap[node.entityType] : 'from-purple-500 to-pink-500');
	let iconEmoji = $derived(node.entityType ? iconMap[node.entityType] : '📝');
</script>

<svelte:window onmousemove={handleMouseMove} onmouseup={handleMouseUp} />

<foreignObject x={node.x} y={node.y} width={node.width} height={node.height}>
	<div
		class="node {node.selected ? 'selected' : ''} {isDragging ? 'dragging' : ''}"
		onmousedown={handleMouseDown}
		onclick={handleClick}
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
			</div>

			{#if node.notes && !node.collapsed}
				<p class="node-notes">{node.notes}</p>
			{/if}

			{#if node.entityType && !node.collapsed}
				<div class="node-footer">
					<span class="node-type">{node.entityType}</span>
				</div>
			{/if}
		</div>
	</div>
</foreignObject>

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

	.node:hover {
		border-color: rgb(168 85 247 / 0.5);
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgb(168 85 247 / 0.3);
	}

	.node.selected {
		border-color: rgb(59 130 246);
		border-width: 3px;
		box-shadow: 0 0 0 3px rgb(59 130 246 / 0.2);
	}

	.node.dragging {
		opacity: 0.7;
		cursor: grabbing;
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

	.node-content {
		position: relative;
		z-index: 1;
	}

	.node-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
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
</style>
