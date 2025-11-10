<script lang="ts">
	import { onMount } from 'svelte';
	import { storyboardStore, activeBoard, selectedNodes } from '$lib/stores/storyboardStore';
	import StoryBoardToolbar from './StoryBoardToolbar.svelte';
	import StoryBoardCanvas from './StoryBoardCanvas.svelte';

	interface Props {
		adventureId: string;
	}

	let { adventureId }: Props = $props();

	onMount(() => {
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

		// Escape - Deselect all
		if (e.key === 'Escape') {
			e.preventDefault();
			storyboardStore.deselectAll($activeBoard.id);
		}

		// Ctrl+A - Select all
		if (e.ctrlKey && e.key === 'a') {
			e.preventDefault();
			storyboardStore.selectAll($activeBoard.id);
		}

		// Arrow keys - Nudge selected nodes
		if ($selectedNodes.length > 0 && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
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
</script>

<svelte:window onkeydown={handleKeyDown} />

<div class="storyboard-container">
	{#if $activeBoard}
		<StoryBoardToolbar />
		<StoryBoardCanvas />
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
