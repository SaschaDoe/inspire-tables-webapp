<script lang="ts">
	import { storyboardStore, activeBoard, activeDrawings, boardMode } from '$lib/stores/storyboardStore';
	import type { StoryBoardDrawing } from '$lib/types/storyboard';

	// Drawing state
	let isDrawing = $state(false);
	let currentPath = $state<{ x: number; y: number }[]>([]);

	function handlePointerDown(e: PointerEvent) {
		if (!$activeBoard || $boardMode !== 'draw') return;

		// Start new drawing
		isDrawing = true;
		const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
		const x = (e.clientX - rect.left - $activeBoard.viewport.x) / $activeBoard.viewport.zoom;
		const y = (e.clientY - rect.top - $activeBoard.viewport.y) / $activeBoard.viewport.zoom;

		currentPath = [{ x, y }];
	}

	function handlePointerMove(e: PointerEvent) {
		if (!$activeBoard || !isDrawing || $boardMode !== 'draw') return;

		const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
		const x = (e.clientX - rect.left - $activeBoard.viewport.x) / $activeBoard.viewport.zoom;
		const y = (e.clientY - rect.top - $activeBoard.viewport.y) / $activeBoard.viewport.zoom;

		currentPath = [...currentPath, { x, y }];
	}

	function handlePointerUp() {
		if (!$activeBoard || !isDrawing || currentPath.length < 2) {
			isDrawing = false;
			currentPath = [];
			return;
		}

		// Save the drawing
		storyboardStore.addDrawing($activeBoard.id, {
			type: 'freehand',
			points: currentPath,
			stroke: $activeBoard.settings.drawingColor,
			strokeWidth: $activeBoard.settings.drawingWidth,
			opacity: 1,
			layer: 0
		});

		isDrawing = false;
		currentPath = [];
	}

	// Convert points array to SVG path string
	function pointsToPath(points: { x: number; y: number }[]): string {
		if (points.length === 0) return '';

		let path = `M ${points[0].x} ${points[0].y}`;
		for (let i = 1; i < points.length; i++) {
			path += ` L ${points[i].x} ${points[i].y}`;
		}
		return path;
	}

	// Convert points to smoothed SVG path using quadratic curves
	function pointsToSmoothPath(points: { x: number; y: number }[]): string {
		if (points.length === 0) return '';
		if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
		if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;

		let path = `M ${points[0].x} ${points[0].y}`;

		for (let i = 1; i < points.length - 1; i++) {
			const midX = (points[i].x + points[i + 1].x) / 2;
			const midY = (points[i].y + points[i + 1].y) / 2;
			path += ` Q ${points[i].x} ${points[i].y} ${midX} ${midY}`;
		}

		// Add final point
		const last = points[points.length - 1];
		path += ` L ${last.x} ${last.y}`;

		return path;
	}
</script>

<!-- Drawing layer sits below nodes but above grid -->
<g
	class="drawing-layer"
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
	style="pointer-events: {$boardMode === 'draw' ? 'all' : 'none'}"
>
	<!-- Render saved drawings -->
	{#each $activeDrawings as drawing (drawing.id)}
		{#if drawing.type === 'freehand' && drawing.points}
			<path
				d={pointsToSmoothPath(drawing.points)}
				stroke={drawing.stroke}
				stroke-width={drawing.strokeWidth}
				fill="none"
				opacity={drawing.opacity}
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		{/if}
	{/each}

	<!-- Render current drawing path (preview while drawing) -->
	{#if isDrawing && currentPath.length > 0}
		<path
			d={pointsToSmoothPath(currentPath)}
			stroke={$activeBoard?.settings.drawingColor || '#a855f7'}
			stroke-width={$activeBoard?.settings.drawingWidth || 2}
			fill="none"
			opacity="0.8"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	{/if}
</g>

<style>
	.drawing-layer {
		cursor: crosshair;
	}
</style>
