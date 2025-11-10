<script lang="ts">
	import { storyboardStore, activeBoard, activeDrawings, boardMode } from '$lib/stores/storyboardStore';
	import type { StoryBoardDrawing } from '$lib/types/storyboard';

	// Drawing state
	let isDrawing = $state(false);
	let currentPath = $state<{ x: number; y: number }[]>([]);
	let svgElement = $state<SVGSVGElement | null>(null);

	function getCanvasCoordinates(e: PointerEvent): { x: number; y: number } | null {
		if (!$activeBoard) return null;

		// Get the SVG element by traversing up the DOM tree
		let target = e.target as Element;
		while (target && !(target instanceof SVGSVGElement)) {
			target = target.parentElement as Element;
		}

		if (!target) return null;

		const svg = target as SVGSVGElement;
		const rect = svg.getBoundingClientRect();

		// Calculate coordinates relative to the SVG, accounting for viewport transform
		const x = (e.clientX - rect.left - $activeBoard.viewport.x) / $activeBoard.viewport.zoom;
		const y = (e.clientY - rect.top - $activeBoard.viewport.y) / $activeBoard.viewport.zoom;

		return { x, y };
	}

	function handlePointerDown(e: PointerEvent) {
		if (!$activeBoard || $boardMode !== 'draw') return;

		const coords = getCanvasCoordinates(e);
		if (!coords) return;

		// Start new drawing
		isDrawing = true;
		currentPath = [coords];
	}

	function handlePointerMove(e: PointerEvent) {
		if (!$activeBoard || !isDrawing || $boardMode !== 'draw') return;

		const coords = getCanvasCoordinates(e);
		if (!coords) return;

		currentPath = [...currentPath, coords];
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
<g class="drawing-layer" style="pointer-events: {$boardMode === 'draw' ? 'all' : 'none'}">
	<!-- Invisible rect to capture pointer events across entire canvas -->
	{#if $boardMode === 'draw'}
		<rect
			x="-5000"
			y="-5000"
			width="10000"
			height="10000"
			fill="transparent"
			onpointerdown={handlePointerDown}
			onpointermove={handlePointerMove}
			onpointerup={handlePointerUp}
			style="cursor: crosshair"
		/>
	{/if}

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
