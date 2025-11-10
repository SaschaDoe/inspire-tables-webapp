<script lang="ts">
	import { activeBoard, activeNodes, storyboardStore } from '$lib/stores/storyboardStore';
	import StoryBoardNode from './StoryBoardNode.svelte';
	import StoryBoardGrid from './StoryBoardGrid.svelte';

	let activeBoard_ = $derived(activeBoard);
	let activeNodes_ = $derived(activeNodes);

	let canvasElement = $state<HTMLDivElement>();

	// Pan state
	let isPanning = $state(false);
	let panStart = $state({ x: 0, y: 0 });
	let isSpacePressed = $state(false);

	function handleMouseDown(e: MouseEvent) {
		if (!activeBoard_) return;

		// Middle mouse or Space+click for panning
		if (e.button === 1 || (isSpacePressed && e.button === 0)) {
			e.preventDefault();
			isPanning = true;
			panStart = {
				x: e.clientX - activeBoard_.viewport.x,
				y: e.clientY - activeBoard_.viewport.y
			};
		}
	}

	function handleMouseMove(e: MouseEvent) {
		if (!activeBoard_ || !isPanning) return;

		const newX = e.clientX - panStart.x;
		const newY = e.clientY - panStart.y;

		storyboardStore.setViewport(activeBoard_.id, {
			...activeBoard_.viewport,
			x: newX,
			y: newY
		});
	}

	function handleMouseUp() {
		isPanning = false;
	}

	function handleWheel(e: WheelEvent) {
		if (!activeBoard_) return;

		// Only zoom with Ctrl
		if (e.ctrlKey) {
			e.preventDefault();

			const delta = e.deltaY > 0 ? 0.9 : 1.1;
			const newZoom = Math.max(0.5, Math.min(2, activeBoard_.viewport.zoom * delta));

			// Zoom toward mouse position
			const rect = canvasElement?.getBoundingClientRect();
			if (rect) {
				const mouseX = e.clientX - rect.left;
				const mouseY = e.clientY - rect.top;

				const oldZoom = activeBoard_.viewport.zoom;
				const zoomDiff = newZoom - oldZoom;

				// Adjust pan to zoom toward mouse
				const newX = activeBoard_.viewport.x - (mouseX - activeBoard_.viewport.x) * (zoomDiff / oldZoom);
				const newY = activeBoard_.viewport.y - (mouseY - activeBoard_.viewport.y) * (zoomDiff / oldZoom);

				storyboardStore.setViewport(activeBoard_.id, {
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
		style="transform: translate({activeBoard_?.viewport.x || 0}px, {activeBoard_?.viewport.y || 0}px) scale({activeBoard_?.viewport.zoom || 1})"
	>
		<StoryBoardGrid showGrid={activeBoard_?.settings.showGrid} gridSize={activeBoard_?.settings.gridSize} />

		<!-- Nodes -->
		{#each activeNodes_ as node (node.id)}
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
