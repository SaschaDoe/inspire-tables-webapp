<script lang="ts">
	import { activeBoard, activeConnections, activeNodes, storyboardStore } from '$lib/stores/storyboardStore';
	import type { StoryBoardConnection, StoryBoardNode } from '$lib/types/storyboard';

	// Find node by ID
	function getNode(nodeId: string): StoryBoardNode | undefined {
		return $activeNodes.find((n) => n.id === nodeId);
	}

	// Calculate the center point of a node
	function getNodeCenter(node: StoryBoardNode): { x: number; y: number } {
		return {
			x: node.x + node.width / 2,
			y: node.y + node.height / 2
		};
	}

	// Generate SVG path for a connection
	function generatePath(connection: StoryBoardConnection): string {
		const fromNode = getNode(connection.fromNodeId);
		const toNode = getNode(connection.toNodeId);

		if (!fromNode || !toNode) return '';

		const from = getNodeCenter(fromNode);
		const to = getNodeCenter(toNode);

		// Calculate control points for curved arrow
		const dx = to.x - from.x;
		const dy = to.y - from.y;
		const dist = Math.sqrt(dx * dx + dy * dy);

		// Use quadratic bezier curve for smoother connections
		const curveFactor = Math.min(dist * 0.2, 100);
		const midX = (from.x + to.x) / 2;
		const midY = (from.y + to.y) / 2;

		// Perpendicular offset for curve
		const perpX = -dy / dist * curveFactor;
		const perpY = dx / dist * curveFactor;

		const controlX = midX + perpX;
		const controlY = midY + perpY;

		return `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`;
	}

	// Get stroke dash array based on line type
	function getDashArray(lineType: 'solid' | 'dashed' | 'dotted'): string {
		switch (lineType) {
			case 'dashed':
				return '10,5';
			case 'dotted':
				return '2,5';
			default:
				return 'none';
		}
	}

	// Get label position (midpoint of connection)
	function getLabelPosition(connection: StoryBoardConnection): { x: number; y: number } | null {
		const fromNode = getNode(connection.fromNodeId);
		const toNode = getNode(connection.toNodeId);

		if (!fromNode || !toNode) return null;

		const from = getNodeCenter(fromNode);
		const to = getNodeCenter(toNode);

		return {
			x: (from.x + to.x) / 2,
			y: (from.y + to.y) / 2
		};
	}

	// Handle connection click for deletion
	function handleConnectionClick(e: MouseEvent, connectionId: string) {
		e.stopPropagation();
		if (!$activeBoard) return;

		// Ctrl+Click or Right-click to delete
		if (e.ctrlKey || e.button === 2) {
			e.preventDefault();
			if (confirm('Delete this connection?')) {
				storyboardStore.deleteConnection($activeBoard.id, connectionId);
			}
		}
	}
</script>

<!-- Connection layer sits above nodes but below selection box -->
<g class="connection-layer" style="pointer-events: {$activeConnections.length > 0 ? 'all' : 'none'}">
	<!-- Define arrow markers -->
	<defs>
		<marker
			id="arrowhead"
			markerWidth="10"
			markerHeight="10"
			refX="9"
			refY="3"
			orient="auto"
			markerUnits="strokeWidth"
		>
			<path d="M0,0 L0,6 L9,3 z" fill="currentColor" />
		</marker>
		<marker
			id="circle-marker"
			markerWidth="8"
			markerHeight="8"
			refX="4"
			refY="4"
			markerUnits="strokeWidth"
		>
			<circle cx="4" cy="4" r="3" fill="currentColor" />
		</marker>
	</defs>

	<!-- Render connections -->
	{#each $activeConnections as connection (connection.id)}
		{@const path = generatePath(connection)}
		{@const labelPos = getLabelPosition(connection)}

		{#if path}
			<g class="connection-group">
				<!-- Main connection path -->
				<path
					d={path}
					stroke={connection.color || '#a855f7'}
					stroke-width="2"
					fill="none"
					stroke-dasharray={getDashArray(connection.lineType)}
					marker-end={connection.endMarker === 'arrow' ? 'url(#arrowhead)' : connection.endMarker === 'circle' ? 'url(#circle-marker)' : 'none'}
					class="connection-path"
					onclick={(e) => handleConnectionClick(e, connection.id)}
					oncontextmenu={(e) => handleConnectionClick(e, connection.id)}
				/>

				<!-- Invisible wider path for easier clicking -->
				<path
					d={path}
					stroke="transparent"
					stroke-width="12"
					fill="none"
					class="connection-hitbox"
					onclick={(e) => handleConnectionClick(e, connection.id)}
					oncontextmenu={(e) => handleConnectionClick(e, connection.id)}
				/>

				<!-- Connection label -->
				{#if connection.label && labelPos}
					<g class="connection-label">
						<!-- Background rectangle for better readability -->
						<rect
							x={labelPos.x - connection.label.length * 3}
							y={labelPos.y - 10}
							width={connection.label.length * 6}
							height="16"
							fill="rgba(15, 23, 42, 0.9)"
							stroke="rgba(168, 85, 247, 0.5)"
							stroke-width="1"
							rx="3"
						/>
						<text
							x={labelPos.x}
							y={labelPos.y}
							text-anchor="middle"
							dominant-baseline="middle"
							fill="rgb(216, 180, 254)"
							font-size="12"
							font-weight="500"
						>
							{connection.label}
						</text>
					</g>
				{/if}
			</g>
		{/if}
	{/each}
</g>

<style>
	.connection-layer {
		pointer-events: all;
	}

	.connection-path {
		cursor: pointer;
		transition: stroke-width 0.2s;
	}

	.connection-path:hover {
		stroke-width: 3;
		filter: drop-shadow(0 0 4px rgba(168, 85, 247, 0.6));
	}

	.connection-hitbox {
		cursor: pointer;
	}

	.connection-label text {
		pointer-events: none;
		user-select: none;
	}

	.connection-label rect {
		pointer-events: none;
	}
</style>
