<script lang="ts">
	import { activeBoard, activeNodes, storyboardStore } from '$lib/stores/storyboardStore';
	import StoryBoardNode from './StoryBoardNode.svelte';
	import StoryBoardGrid from './StoryBoardGrid.svelte';

	let canvasElement = $state<HTMLDivElement>();

	// Pan state
	let isPanning = $state(false);
	let panStart = $state({ x: 0, y: 0 });
	let isSpacePressed = $state(false);

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
		}
	}

	function handleMouseMove(e: MouseEvent) {
		if (!$activeBoard || !isPanning) return;

		const newX = e.clientX - panStart.x;
		const newY = e.clientY - panStart.y;

		storyboardStore.setViewport($activeBoard.id, {
			...$activeBoard.viewport,
			x: newX,
			y: newY
		});
	}

	function handleMouseUp() {
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

	let cursorStyle = $derived(isPanning || isSpacePressed ? 'grabbing' : 'default');
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

		<!-- Nodes -->
		{#each $activeNodes as node (node.id)}
			<StoryBoardNode {node} />
		{/each}
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
