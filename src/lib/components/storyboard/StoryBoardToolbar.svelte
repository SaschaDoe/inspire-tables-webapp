<script lang="ts">
	import { storyboardStore, activeBoard, canUndo, canRedo, selectedNodes, boardMode } from '$lib/stores/storyboardStore';
	import StoryBoardGenerator from './StoryBoardGenerator.svelte';

	let showGenerator = $state(false);

	function addCard() {
		if (!$activeBoard) return;

		// Add card at center of viewport
		const centerX = -$activeBoard.viewport.x / $activeBoard.viewport.zoom + 400;
		const centerY = -$activeBoard.viewport.y / $activeBoard.viewport.zoom + 300;

		storyboardStore.addNode($activeBoard.id, {
			x: centerX,
			y: centerY,
			label: 'New Card'
		});
	}

	function openGenerator() {
		showGenerator = true;
	}

	function deleteSelected() {
		if (!$activeBoard || $selectedNodes.length === 0) return;

		const nodeIds = $selectedNodes.map((n) => n.id);
		storyboardStore.deleteNodes($activeBoard.id, nodeIds);
	}

	function undo() {
		if (!$activeBoard) return;
		storyboardStore.undo($activeBoard.id);
	}

	function redo() {
		if (!$activeBoard) return;
		storyboardStore.redo($activeBoard.id);
	}

	function clearAll() {
		if (!$activeBoard) return;
		if (confirm('Clear all cards from this board? This cannot be undone.')) {
			const nodeIds = $activeBoard.nodes.map((n) => n.id);
			storyboardStore.deleteNodes($activeBoard.id, nodeIds, 'Clear all');
		}
	}

	function zoomIn() {
		if (!$activeBoard) return;
		storyboardStore.zoomIn($activeBoard.id);
	}

	function zoomOut() {
		if (!$activeBoard) return;
		storyboardStore.zoomOut($activeBoard.id);
	}

	function resetView() {
		if (!$activeBoard) return;
		storyboardStore.resetViewport($activeBoard.id);
	}

	function toggleDrawMode() {
		if (!$activeBoard) return;
		const newMode = $boardMode === 'draw' ? 'select' : 'draw';
		storyboardStore.setMode($activeBoard.id, newMode);
	}
</script>

<div class="toolbar">
	<div class="toolbar-section">
		<button
			onclick={toggleDrawMode}
			class="toolbar-btn {$boardMode === 'draw' ? 'active' : ''}"
			title="Toggle Draw Mode (D)"
		>
			<span class="icon">✏️</span>
			<span>{$boardMode === 'draw' ? 'Select' : 'Draw'}</span>
		</button>

		<button onclick={addCard} class="toolbar-btn primary" title="Add Card (Ctrl+N)">
			<span class="icon">+</span>
			<span>Add Card</span>
		</button>

		<button onclick={openGenerator} class="toolbar-btn generate" title="Generate from Tables (G)">
			<span class="icon">🎲</span>
			<span>Generate</span>
		</button>

		<button
			onclick={deleteSelected}
			class="toolbar-btn danger"
			disabled={!$selectedNodes || $selectedNodes.length === 0}
			title="Delete Selected (Delete)"
		>
			<span class="icon">🗑️</span>
			<span>Delete</span>
		</button>

		<button onclick={clearAll} class="toolbar-btn danger-outline" title="Clear All">
			<span class="icon">✕</span>
			<span>Clear All</span>
		</button>
	</div>

	<div class="toolbar-section">
		<button onclick={undo} class="toolbar-btn" disabled={!$canUndo} title="Undo (Ctrl+Z)">
			<span class="icon">↶</span>
			<span>Undo</span>
		</button>

		<button onclick={redo} class="toolbar-btn" disabled={!$canRedo} title="Redo (Ctrl+Y)">
			<span class="icon">↷</span>
			<span>Redo</span>
		</button>
	</div>

	<div class="toolbar-section">
		<button onclick={zoomOut} class="toolbar-btn" title="Zoom Out (Ctrl+Scroll)">
			<span class="icon">−</span>
		</button>

		<span class="zoom-level">{$activeBoard ? Math.round($activeBoard.viewport.zoom * 100) : 100}%</span>

		<button onclick={zoomIn} class="toolbar-btn" title="Zoom In (Ctrl+Scroll)">
			<span class="icon">+</span>
		</button>

		<button onclick={resetView} class="toolbar-btn" title="Reset View (Ctrl+0)">
			<span class="icon">⊙</span>
		</button>
	</div>
</div>

<StoryBoardGenerator show={showGenerator} onClose={() => (showGenerator = false)} />

<style>
	.toolbar {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem 1rem;
		background: rgb(30 27 75 / 0.95);
		border-bottom: 1px solid rgb(168 85 247 / 0.2);
		backdrop-filter: blur(8px);
	}

	.toolbar-section {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding-right: 1rem;
		border-right: 1px solid rgb(168 85 247 / 0.1);
	}

	.toolbar-section:last-child {
		border-right: none;
	}

	.toolbar-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: rgb(168 85 247 / 0.1);
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.5rem;
		color: rgb(216 180 254);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
	}

	.toolbar-btn:hover:not(:disabled) {
		background: rgb(168 85 247 / 0.2);
		border-color: rgb(168 85 247 / 0.4);
		transform: translateY(-1px);
	}

	.toolbar-btn:active:not(:disabled) {
		transform: translateY(0);
	}

	.toolbar-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.toolbar-btn.active {
		background: rgb(168 85 247 / 0.3);
		border-color: rgb(168 85 247);
		box-shadow: 0 0 0 2px rgb(168 85 247 / 0.2);
	}

	.toolbar-btn.primary {
		background: linear-gradient(to right, rgb(147 51 234), rgb(219 39 119));
		border: none;
		color: white;
	}

	.toolbar-btn.primary:hover {
		background: linear-gradient(to right, rgb(126 34 206), rgb(190 24 93));
	}

	.toolbar-btn.danger {
		background: rgb(220 38 38 / 0.2);
		border-color: rgb(220 38 38 / 0.3);
		color: rgb(252 165 165);
	}

	.toolbar-btn.danger:hover:not(:disabled) {
		background: rgb(220 38 38 / 0.3);
		border-color: rgb(220 38 38 / 0.5);
	}

	.toolbar-btn.danger-outline {
		background: transparent;
		border-color: rgb(220 38 38 / 0.3);
		color: rgb(252 165 165);
	}

	.toolbar-btn.danger-outline:hover {
		background: rgb(220 38 38 / 0.1);
	}

	.toolbar-btn.generate {
		background: linear-gradient(to right, rgb(251 191 36), rgb(245 158 11));
		border: none;
		color: rgb(15 23 42);
		font-weight: 600;
	}

	.toolbar-btn.generate:hover {
		background: linear-gradient(to right, rgb(245 158 11), rgb(217 119 6));
	}

	.icon {
		font-size: 1.125rem;
		line-height: 1;
	}

	.zoom-level {
		padding: 0 0.5rem;
		font-size: 0.875rem;
		font-weight: 600;
		color: rgb(216 180 254);
		min-width: 3.5rem;
		text-align: center;
	}
</style>
