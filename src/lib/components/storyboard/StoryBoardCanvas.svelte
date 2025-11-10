<script lang="ts">
	import { activeBoard, activeNodes, storyboardStore, boardMode } from '$lib/stores/storyboardStore';
	import StoryBoardNode from './StoryBoardNode.svelte';
	import StoryBoardGrid from './StoryBoardGrid.svelte';
	import StoryBoardDrawingLayer from './StoryBoardDrawingLayer.svelte';

	let canvasElement = $state<HTMLDivElement>();

	// Pan state
	let isPanning = $state(false);
	let panStart = $state({ x: 0, y: 0 });
	let isSpacePressed = $state(false);

	// Selection box state
	let isBoxSelecting = $state(false);
	let selectionBoxStart = $state({ x: 0, y: 0 });
	let selectionBoxEnd = $state({ x: 0, y: 0 });

	function handleMouseDown(e: MouseEvent) {
		if (!$activeBoard) return;

		// Middle mouse or Space+click for panning
		if (e.button === 1 || (isSpacePressed && e.button === 0)) {
			e.preventDefault();
			isPanning = true;
			panStart = {
				x: e.clientX - $activeBoard.viewport.x,
				y: e.clientY - $activeBoard.viewport.y
			};
		} else if (e.button === 0 && !isSpacePressed) {
			// Left click on canvas background - start box selection or deselect
			const rect = canvasElement?.getBoundingClientRect();
			if (rect) {
				// Convert screen coordinates to canvas coordinates
				const canvasX = (e.clientX - rect.left - $activeBoard.viewport.x) / $activeBoard.viewport.zoom;
				const canvasY = (e.clientY - rect.top - $activeBoard.viewport.y) / $activeBoard.viewport.zoom;

				isBoxSelecting = true;
				selectionBoxStart = { x: canvasX, y: canvasY };
				selectionBoxEnd = { x: canvasX, y: canvasY };

				// Deselect all unless shift is held
				if (!e.shiftKey) {
					storyboardStore.deselectAll($activeBoard.id);
				}
			}
		}
	}

	function handleMouseMove(e: MouseEvent) {
		if (!$activeBoard) return;

		// Handle panning
		if (isPanning) {
			const newX = e.clientX - panStart.x;
			const newY = e.clientY - panStart.y;

			storyboardStore.setViewport($activeBoard.id, {
				...$activeBoard.viewport,
				x: newX,
				y: newY
			});
		}

		// Handle box selection
		if (isBoxSelecting) {
			const rect = canvasElement?.getBoundingClientRect();
			if (rect) {
				const canvasX = (e.clientX - rect.left - $activeBoard.viewport.x) / $activeBoard.viewport.zoom;
				const canvasY = (e.clientY - rect.top - $activeBoard.viewport.y) / $activeBoard.viewport.zoom;

				selectionBoxEnd = { x: canvasX, y: canvasY };
			}
		}
	}

	function handleMouseUp() {
		// Complete box selection
		if (isBoxSelecting && $activeBoard) {
			// Calculate selection box bounds
			const boxLeft = Math.min(selectionBoxStart.x, selectionBoxEnd.x);
			const boxRight = Math.max(selectionBoxStart.x, selectionBoxEnd.x);
			const boxTop = Math.min(selectionBoxStart.y, selectionBoxEnd.y);
			const boxBottom = Math.max(selectionBoxStart.y, selectionBoxEnd.y);

			// Only select if the box has some size (not just a click)
			const boxWidth = boxRight - boxLeft;
			const boxHeight = boxBottom - boxTop;

			if (boxWidth > 5 || boxHeight > 5) {
				// Find nodes that intersect with selection box
				const nodesToSelect = $activeNodes.filter((node) => {
					const nodeRight = node.x + node.width;
					const nodeBottom = node.y + node.height;

					return !(
						nodeRight < boxLeft ||
						node.x > boxRight ||
						nodeBottom < boxTop ||
						node.y > boxBottom
					);
				});

				// Select the nodes
				const nodeIds = nodesToSelect.map((n) => n.id);
				if (nodeIds.length > 0) {
					storyboardStore.selectNodes($activeBoard.id, nodeIds);
				}
			}

			isBoxSelecting = false;
		}

		isPanning = false;
	}

	function handleWheel(e: WheelEvent) {
		if (!$activeBoard) return;

		// Only zoom with Ctrl
		if (e.ctrlKey) {
			e.preventDefault();

			const delta = e.deltaY > 0 ? 0.9 : 1.1;
			const newZoom = Math.max(0.5, Math.min(2, $activeBoard.viewport.zoom * delta));

			// Zoom toward mouse position
			const rect = canvasElement?.getBoundingClientRect();
			if (rect) {
				const mouseX = e.clientX - rect.left;
				const mouseY = e.clientY - rect.top;

				const oldZoom = $activeBoard.viewport.zoom;
				const zoomDiff = newZoom - oldZoom;

				// Adjust pan to zoom toward mouse
				const newX = $activeBoard.viewport.x - (mouseX - $activeBoard.viewport.x) * (zoomDiff / oldZoom);
				const newY = $activeBoard.viewport.y - (mouseY - $activeBoard.viewport.y) * (zoomDiff / oldZoom);

				storyboardStore.setViewport($activeBoard.id, {
					x: newX,
					y: newY,
					zoom: newZoom
				});
			}
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.code === 'Space') {
			e.preventDefault();
			isSpacePressed = true;
		}
	}

	function handleKeyUp(e: KeyboardEvent) {
		if (e.code === 'Space') {
			isSpacePressed = false;
		}
	}

	let cursorStyle = $derived(
		isPanning || isSpacePressed ? 'grabbing' : $boardMode === 'draw' ? 'crosshair' : 'default'
	);

	// Calculate selection box dimensions for rendering
	let selectionBox = $derived(() => {
		if (!isBoxSelecting) return null;

		const x = Math.min(selectionBoxStart.x, selectionBoxEnd.x);
		const y = Math.min(selectionBoxStart.y, selectionBoxEnd.y);
		const width = Math.abs(selectionBoxEnd.x - selectionBoxStart.x);
		const height = Math.abs(selectionBoxEnd.y - selectionBoxStart.y);

		return { x, y, width, height };
	});
</script>

<svelte:window onkeydown={handleKeyDown} onkeyup={handleKeyUp} />

<div
	bind:this={canvasElement}
	class="canvas-container"
	style="cursor: {cursorStyle}"
	onmousedown={handleMouseDown}
	onmousemove={handleMouseMove}
	onmouseup={handleMouseUp}
	onwheel={handleWheel}
	role="application"
	tabindex="-1"
>
	<svg
		class="canvas-svg"
		style="transform: translate({$activeBoard?.viewport.x || 0}px, {$activeBoard?.viewport.y || 0}px) scale({$activeBoard?.viewport.zoom || 1})"
	>
		<StoryBoardGrid showGrid={$activeBoard?.settings.showGrid} gridSize={$activeBoard?.settings.gridSize} />

		<!-- Drawing layer -->
		<StoryBoardDrawingLayer />

		<!-- Nodes -->
		{#each $activeNodes as node (node.id)}
			<StoryBoardNode {node} />
		{/each}

		<!-- Selection box -->
		{#if isBoxSelecting && selectionBox && (selectionBox.width > 0 || selectionBox.height > 0)}
			<rect
				x={selectionBox.x}
				y={selectionBox.y}
				width={selectionBox.width}
				height={selectionBox.height}
				fill="rgba(59, 130, 246, 0.1)"
				stroke="rgba(59, 130, 246, 0.5)"
				stroke-width="2"
				stroke-dasharray="5,5"
				pointer-events="none"
			/>
		{/if}
	</svg>
</div>

<style>
	.canvas-container {
		flex: 1;
		position: relative;
		overflow: hidden;
		background: linear-gradient(to bottom right, rgb(15 23 42), rgb(88 28 135), rgb(15 23 42));
	}

	.canvas-svg {
		width: 100%;
		height: 100%;
		transform-origin: 0 0;
	}
</style>
