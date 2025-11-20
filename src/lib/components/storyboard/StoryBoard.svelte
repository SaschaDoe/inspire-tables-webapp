<script lang="ts">
	import { storyboardStore, activeBoard, selectedNodes, boardMode, connectingFromNodeId } from '$lib/stores/storyboardStore';
	import StoryBoardToolbar from './StoryBoardToolbar.svelte';
	import StoryBoardCanvas from './StoryBoardCanvas.svelte';
	import StoryBoardDrawingTools from './StoryBoardDrawingTools.svelte';
	import StoryBoardSearch from './StoryBoardSearch.svelte';

	interface Props {
		adventureId: string;
	}

	let { adventureId }: Props = $props();

	// Clipboard for copy/paste
	let clipboard = $state<typeof $selectedNodes>([]);

	// Load the board whenever adventureId changes
	$effect(() => {
		// Load or create board for this adventure
		const boards = storyboardStore.getBoardsByAdventure(adventureId);
		if (boards.length === 0) {
			storyboardStore.createBoard(adventureId, 'Story Board');
		} else {
			storyboardStore.setActiveBoard(boards[0].id);
		}
	});

	// Keyboard shortcuts
	function handleKeyDown(e: KeyboardEvent) {
		if (!$activeBoard) return;

		// Delete / Backspace - Delete selected
		if ((e.key === 'Delete' || e.key === 'Backspace') && $selectedNodes.length > 0) {
			e.preventDefault();
			const nodeIds = $selectedNodes.map((n) => n.id);

			// Confirm if deleting many cards
			if (nodeIds.length > 3) {
				if (!confirm(`Delete ${nodeIds.length} cards?`)) return;
			}

			storyboardStore.deleteNodes($activeBoard.id, nodeIds);
		}

		// Ctrl+Z - Undo
		if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
			e.preventDefault();
			storyboardStore.undo($activeBoard.id);
		}

		// Ctrl+Y or Ctrl+Shift+Z - Redo
		if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
			e.preventDefault();
			storyboardStore.redo($activeBoard.id);
		}

		// Escape - Cancel connection or deselect all
		if (e.key === 'Escape') {
			e.preventDefault();
			if ($connectingFromNodeId) {
				storyboardStore.cancelConnection();
			} else {
				storyboardStore.deselectAll($activeBoard.id);
			}
		}

		// Ctrl+A - Select all
		if (e.ctrlKey && e.key === 'a') {
			e.preventDefault();
			storyboardStore.selectAll($activeBoard.id);
		}

		// Arrow keys - Rotate Story Engine card OR nudge nodes
		if ($selectedNodes.length > 0 && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
			// If exactly one Story Engine card is selected, use Left/Right to rotate it
			if ($selectedNodes.length === 1 && $selectedNodes[0].storyEngineCard && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
				e.preventDefault();
				const direction = e.key === 'ArrowLeft' ? 'prev' : 'next';
				storyboardStore.rotateStoryEngineCard($activeBoard.id, $selectedNodes[0].id, direction);
			} else {
				// Otherwise, nudge the selected nodes
				e.preventDefault();
				const distance = e.shiftKey ? 10 : 1;
				let deltaX = 0;
				let deltaY = 0;

				if (e.key === 'ArrowLeft') deltaX = -distance;
				if (e.key === 'ArrowRight') deltaX = distance;
				if (e.key === 'ArrowUp') deltaY = -distance;
				if (e.key === 'ArrowDown') deltaY = distance;

				const nodeIds = $selectedNodes.map((n) => n.id);
				storyboardStore.moveNodes($activeBoard.id, nodeIds, deltaX, deltaY);
			}
		}

		// D key - Toggle draw mode
		if (e.key === 'd' || e.key === 'D') {
			e.preventDefault();
			const newMode = $boardMode === 'draw' ? 'select' : 'draw';
			storyboardStore.setMode($activeBoard.id, newMode);
		}

		// Ctrl+C - Copy selected nodes
		if (e.ctrlKey && e.key === 'c' && $selectedNodes.length > 0) {
			e.preventDefault();
			clipboard = JSON.parse(JSON.stringify($selectedNodes)); // Deep clone
		}

		// Ctrl+V - Paste nodes
		if (e.ctrlKey && e.key === 'v' && clipboard.length > 0) {
			e.preventDefault();
			// Paste nodes with offset
			clipboard.forEach((copiedNode) => {
				storyboardStore.addNode(
					$activeBoard.id,
					{
						entityId: copiedNode.entityId,
						entityType: copiedNode.entityType,
						x: copiedNode.x + 20,
						y: copiedNode.y + 20,
						width: copiedNode.width,
						height: copiedNode.height,
						color: copiedNode.color,
						icon: copiedNode.icon,
						label: copiedNode.label,
						notes: copiedNode.notes,
						layer: copiedNode.layer
					},
					`Paste ${clipboard.length} ${clipboard.length === 1 ? 'card' : 'cards'}`
				);
			});
		}

		// Ctrl+D - Duplicate selected nodes
		if (e.ctrlKey && e.key === 'd' && $selectedNodes.length > 0) {
			e.preventDefault();
			// Duplicate nodes with offset
			$selectedNodes.forEach((node) => {
				storyboardStore.addNode(
					$activeBoard.id,
					{
						entityId: node.entityId,
						entityType: node.entityType,
						x: node.x + 20,
						y: node.y + 20,
						width: node.width,
						height: node.height,
						color: node.color,
						icon: node.icon,
						label: node.label,
						notes: node.notes,
						layer: node.layer
					},
					`Duplicate ${$selectedNodes.length} ${$selectedNodes.length === 1 ? 'card' : 'cards'}`
				);
			});
		}

		// Ctrl+G - Group selected nodes
		if (e.ctrlKey && e.key === 'g' && $selectedNodes.length > 1) {
			e.preventDefault();
			const groupId = crypto.randomUUID();
			const nodeIds = $selectedNodes.map((n) => n.id);
			storyboardStore.groupNodes($activeBoard.id, nodeIds, groupId);
		}

		// Ctrl+Shift+G - Ungroup selected nodes
		if (e.ctrlKey && e.shiftKey && e.key === 'G' && $selectedNodes.length > 0) {
			e.preventDefault();
			const nodeIds = $selectedNodes.map((n) => n.id);
			storyboardStore.ungroupNodes($activeBoard.id, nodeIds);
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

<div class="storyboard-container">
	{#if $activeBoard}
		<StoryBoardToolbar />
		<StoryBoardDrawingTools />
		<StoryBoardCanvas />
		<StoryBoardSearch />
	{:else}
		<div class="loading">
			<p>Loading story board...</p>
		</div>
	{/if}
</div>

<style>
	.storyboard-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
		background: rgb(15 23 42);
	}

	.loading {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		color: rgb(216 180 254);
		font-size: 1.125rem;
	}
</style>
