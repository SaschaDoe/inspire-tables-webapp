<script lang="ts">
	import { storyboardStore, activeBoard, canUndo, canRedo, selectedNodes, boardMode } from '$lib/stores/storyboardStore';
	import StoryBoardGenerator from './StoryBoardGenerator.svelte';
	import EntityGeneratorModal from '$lib/components/entities/EntityGeneratorModal.svelte';
	import { entityStore } from '$lib/stores/entityStore';
	import { getEntityTypesList } from '$lib/entities/entityRegistry';
	import type { Entity, EntityType } from '$lib/types/entity';

	let showGenerator = $state(false);
	let showEntityModal = $state(false);

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

	function openEntityModal() {
		showEntityModal = true;
	}

	function handleEntitySave(generatedEntity: any, entityType: string) {
		if (!$activeBoard) return;

		// Get entity type info for styling
		const entityTypes = getEntityTypesList();
		const entityTypeInfo = entityTypes.find((et) => et.name === entityType);

		// Create the full entity object with required metadata
		const entity: Entity = {
			id: generatedEntity.id,
			type: entityType as EntityType,
			name: generatedEntity.name || `${entityType} ${generatedEntity.id.slice(0, 8)}`,
			description: generatedEntity.description || '',
			tags: [],
			metadata: {
				createdAt: new Date(),
				updatedAt: new Date()
			},
			relationships: [],
			customFields: { generatedEntity: generatedEntity }
		};

		// Save entity to the entity store
		entityStore.createEntity(entity);

		// Calculate center of viewport
		const viewportCenterX =
			(-$activeBoard.viewport.x + window.innerWidth / 2) / $activeBoard.viewport.zoom;
		const viewportCenterY =
			(-$activeBoard.viewport.y + window.innerHeight / 2) / $activeBoard.viewport.zoom;

		// Add entity as a node to the storyboard
		storyboardStore.addNode(
			$activeBoard.id,
			{
				x: viewportCenterX - 100,
				y: viewportCenterY - 60,
				width: 200,
				height: 120,
				label: entity.name,
				notes: entity.description,
				icon: entityTypeInfo?.icon || '✨',
				entityType: entityType as any,
				entityId: entity.id,
				layer: 0
			},
			`Create Entity: ${entity.name}`
		);
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

	let showHelp = $state(false);
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

		<button onclick={openGenerator} class="toolbar-btn generate" title="Roll on Tables (G)">
			<span class="icon">🎲</span>
			<span>Roll</span>
		</button>

		<button onclick={openEntityModal} class="toolbar-btn entity" title="Create Entity (E)">
			<span class="icon">✨</span>
			<span>Entity</span>
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

		<button onclick={() => (showHelp = !showHelp)} class="toolbar-btn" title="Help & Shortcuts">
			<span class="icon">?</span>
		</button>
	</div>
</div>

<!-- Help Modal -->
{#if showHelp}
	<div
		class="help-overlay"
		onclick={() => (showHelp = false)}
		onkeydown={(e) => e.key === 'Escape' && (showHelp = false)}
		role="button"
		tabindex="0"
		aria-label="Close help"
	>
		<div class="help-modal" role="dialog" aria-modal="true">
			<div class="help-header">
				<h2>Keyboard Shortcuts & Tips</h2>
				<button class="close-btn" onclick={() => (showHelp = false)}>✕</button>
			</div>
			<div class="help-content">
				<div class="help-section">
					<h3>🔗 Connections</h3>
					<ul>
						<li><kbd>Alt</kbd> + <kbd>Click</kbd> on first node, then <kbd>Alt</kbd> + <kbd>Click</kbd> on second node to create a connection</li>
						<li><kbd>Click</kbd> on a connection line to select it</li>
						<li><kbd>Double-click</kbd> on a connection to edit its label</li>
						<li><kbd>Delete</kbd> key to remove selected connection</li>
						<li><kbd>Ctrl</kbd> + <kbd>Click</kbd> or <kbd>Right-click</kbd> on connection for quick delete</li>
						<li><kbd>Esc</kbd> to cancel connection mode</li>
					</ul>
				</div>
				<div class="help-section">
					<h3>📝 Cards</h3>
					<ul>
						<li><kbd>Ctrl</kbd> + <kbd>N</kbd> - Add new card</li>
						<li><kbd>Delete</kbd> or <kbd>Backspace</kbd> - Delete selected cards</li>
						<li><kbd>Ctrl</kbd> + <kbd>C</kbd> / <kbd>Ctrl</kbd> + <kbd>V</kbd> - Copy/Paste</li>
						<li><kbd>Ctrl</kbd> + <kbd>D</kbd> - Duplicate selected</li>
						<li><kbd>Double-click</kbd> entity card to open in new tab</li>
					</ul>
				</div>
				<div class="help-section">
					<h3>🎯 Selection</h3>
					<ul>
						<li><kbd>Click + Drag</kbd> - Box select multiple cards</li>
						<li><kbd>Shift</kbd> + <kbd>Click</kbd> - Add to selection</li>
						<li><kbd>Ctrl</kbd> + <kbd>A</kbd> - Select all</li>
						<li><kbd>Esc</kbd> - Deselect all</li>
					</ul>
				</div>
				<div class="help-section">
					<h3>🎨 Drawing</h3>
					<ul>
						<li><kbd>D</kbd> - Toggle draw mode</li>
						<li>Draw freehand lines and shapes</li>
					</ul>
				</div>
				<div class="help-section">
					<h3>🖱️ Navigation</h3>
					<ul>
						<li><kbd>Space</kbd> + <kbd>Drag</kbd> - Pan canvas</li>
						<li><kbd>Middle Mouse</kbd> + <kbd>Drag</kbd> - Pan canvas</li>
						<li><kbd>Ctrl</kbd> + <kbd>Scroll</kbd> - Zoom in/out</li>
						<li><kbd>Arrow Keys</kbd> - Nudge selected cards (hold <kbd>Shift</kbd> for 10px)</li>
						<li><kbd>Ctrl</kbd> + <kbd>0</kbd> - Reset view</li>
					</ul>
				</div>
				<div class="help-section">
					<h3>↩️ Undo/Redo</h3>
					<ul>
						<li><kbd>Ctrl</kbd> + <kbd>Z</kbd> - Undo</li>
						<li><kbd>Ctrl</kbd> + <kbd>Y</kbd> or <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd> - Redo</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
{/if}

<StoryBoardGenerator show={showGenerator} onClose={() => (showGenerator = false)} />
<EntityGeneratorModal
	bind:isOpen={showEntityModal}
	onClose={() => (showEntityModal = false)}
	onSave={handleEntitySave}
/>

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

	.toolbar-btn.entity {
		background: linear-gradient(to right, rgb(168 85 247), rgb(139 92 246));
		border: none;
		color: white;
		font-weight: 600;
	}

	.toolbar-btn.entity:hover {
		background: linear-gradient(to right, rgb(139 92 246), rgb(124 58 237));
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

	.help-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2000;
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

	.help-modal {
		background: linear-gradient(to bottom right, rgb(30 27 75), rgb(88 28 135 / 0.9));
		border: 2px solid rgb(168 85 247);
		border-radius: 1rem;
		max-width: 800px;
		width: 90%;
		max-height: 80vh;
		display: flex;
		flex-direction: column;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
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

	.help-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem;
		border-bottom: 1px solid rgb(168 85 247 / 0.3);
	}

	.help-header h2 {
		color: white;
		font-size: 1.5rem;
		font-weight: bold;
		margin: 0;
	}

	.help-content {
		flex: 1;
		overflow-y: auto;
		padding: 1.5rem;
	}

	.help-section {
		margin-bottom: 1.5rem;
	}

	.help-section:last-child {
		margin-bottom: 0;
	}

	.help-section h3 {
		color: rgb(192 132 252);
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0 0 0.75rem 0;
	}

	.help-section ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.help-section li {
		color: rgb(216 180 254);
		padding: 0.5rem 0;
		font-size: 0.875rem;
		line-height: 1.5;
	}

	kbd {
		background: rgb(168 85 247 / 0.2);
		border: 1px solid rgb(168 85 247 / 0.4);
		border-radius: 0.25rem;
		padding: 0.125rem 0.375rem;
		font-family: monospace;
		font-size: 0.75rem;
		color: rgb(216 180 254);
		white-space: nowrap;
	}
</style>
