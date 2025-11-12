<script lang="ts">
	import { onMount } from 'svelte';
	import type { Dungeon } from '$lib/entities/dungeon/dungeon';
	import type { Entity } from '$lib/types/entity';
	import { EntityType } from '$lib/types/entity';
	import { createEventDispatcher } from 'svelte';
	import cytoscape from 'cytoscape';
	import type { Core, NodeSingular } from 'cytoscape';

	interface Props {
		dungeon: Dungeon;
	}

	let { dungeon }: Props = $props();
	const dispatch = createEventDispatcher<{
		openEntity: { entity: Entity };
	}>();

	let container: HTMLDivElement;
	let cy: Core;

	/**
	 * Wraps a nested entity (room/entrance) with full Entity interface properties
	 */
	function wrapNestedEntity(nestedEntity: any, type: EntityType, parentDungeon: Dungeon): Entity {
		return {
			id: nestedEntity.id,
			type: type,
			name: nestedEntity.name || `${type} ${nestedEntity.id.slice(0, 8)}`,
			description: nestedEntity.description || '',
			tags: [],
			parentId: parentDungeon.id,
			metadata: {
				createdAt: new Date(),
				updatedAt: new Date()
			},
			relationships: [],
			customFields: { generatedEntity: nestedEntity }
		};
	}

	onMount(() => {
		// Build graph data
		const nodes = [];
		const edges = [];

		// Add entrance nodes
		for (const entrance of dungeon.entrances || []) {
			const wrappedEntrance = wrapNestedEntity(entrance, EntityType.Entrance, dungeon);
			nodes.push({
				data: {
					id: entrance.id,
					label: entrance.name || 'Entrance',
					type: 'entrance',
					entity: wrappedEntrance
				}
			});
		}

		// Add room nodes
		for (const room of dungeon.rooms || []) {
			const wrappedRoom = wrapNestedEntity(room, EntityType.Room, dungeon);
			nodes.push({
				data: {
					id: room.id,
					label: room.name,
					type: 'room',
					entity: wrappedRoom
				}
			});
		}

		// Add connector edges
		for (const connector of dungeon.roomConnectors || []) {
			edges.push({
				data: {
					id: connector.id,
					source: connector.fromRoomId,
					target: connector.toRoomId,
					label: connector.name,
					connectorType: connector.connectorType,
					connector: connector
				}
			});
		}

		// Initialize Cytoscape
		cy = cytoscape({
			container: container,
			elements: {
				nodes: nodes,
				edges: edges
			},
			style: [
				{
					selector: 'node',
					style: {
						'background-color': '#60a5fa',
						'label': 'data(label)',
						'color': '#ffffff',
						'text-valign': 'center',
						'text-halign': 'center',
						'font-size': '12px',
						'width': '80px',
						'height': '80px',
						'border-width': '3px',
						'border-color': '#1e40af',
						'font-weight': 'bold',
						'text-wrap': 'wrap',
						'text-max-width': '70px'
					}
				},
				{
					selector: 'node[type="entrance"]',
					style: {
						'background-color': '#f59e0b',
						'border-color': '#b45309',
						'shape': 'diamond'
					}
				},
				{
					selector: 'node[type="room"]',
					style: {
						'background-color': '#8b5cf6',
						'border-color': '#6d28d9',
						'shape': 'roundrectangle'
					}
				},
				{
					selector: 'node:selected',
					style: {
						'border-width': '5px',
						'border-color': '#fbbf24',
						'background-color': '#7c3aed'
					}
				},
				{
					selector: 'edge',
					style: {
						'width': 3,
						'line-color': '#94a3b8',
						'target-arrow-color': '#94a3b8',
						'target-arrow-shape': 'triangle',
						'curve-style': 'bezier',
						'label': 'data(label)',
						'font-size': '10px',
						'color': '#cbd5e1',
						'text-background-color': '#1e1e1e',
						'text-background-opacity': 0.8,
						'text-background-padding': '3px'
					}
				},
				{
					selector: 'edge[connectorType="door"]',
					style: {
						'line-color': '#3b82f6',
						'target-arrow-color': '#3b82f6'
					}
				},
				{
					selector: 'edge[connectorType="tunnel"]',
					style: {
						'line-color': '#84cc16',
						'target-arrow-color': '#84cc16',
						'line-style': 'dashed'
					}
				},
				{
					selector: 'edge[connectorType="obstacle"]',
					style: {
						'line-color': '#ef4444',
						'target-arrow-color': '#ef4444',
						'line-style': 'dotted',
						'width': 2
					}
				}
			],
			layout: {
				name: 'cose',
				animate: true,
				animationDuration: 500,
				nodeDimensionsIncludeLabels: true,
				idealEdgeLength: 150,
				nodeRepulsion: 8000,
				padding: 30
			},
			minZoom: 0.5,
			maxZoom: 2,
			wheelSensitivity: 0.2
		});

		// Handle node click to open entity
		cy.on('tap', 'node', (event) => {
			const node: NodeSingular = event.target;
			const entity = node.data('entity');
			if (entity) {
				dispatch('openEntity', { entity });
			}
		});

		// Cleanup
		return () => {
			if (cy) {
				cy.destroy();
			}
		};
	});

	function resetLayout() {
		if (cy) {
			cy.layout({
				name: 'cose',
				animate: true,
				animationDuration: 500,
				nodeDimensionsIncludeLabels: true,
				idealEdgeLength: 150,
				nodeRepulsion: 8000,
				padding: 30
			}).run();
		}
	}

	function resetZoom() {
		if (cy) {
			cy.fit(undefined, 50);
		}
	}
</script>

<div class="graph-viewer">
	<div class="graph-controls">
		<div class="legend">
			<div class="legend-item">
				<div class="legend-symbol entrance-symbol"></div>
				<span>Entrance</span>
			</div>
			<div class="legend-item">
				<div class="legend-symbol room-symbol"></div>
				<span>Room</span>
			</div>
			<div class="legend-separator"></div>
			<div class="legend-item">
				<div class="legend-line door-line"></div>
				<span>Door</span>
			</div>
			<div class="legend-item">
				<div class="legend-line tunnel-line"></div>
				<span>Tunnel</span>
			</div>
			<div class="legend-item">
				<div class="legend-line obstacle-line"></div>
				<span>Obstacle</span>
			</div>
		</div>
		<div class="control-buttons">
			<button onclick={resetLayout} class="control-btn">Reset Layout</button>
			<button onclick={resetZoom} class="control-btn">Fit to View</button>
		</div>
	</div>
	<div bind:this={container} class="graph-container"></div>
	<div class="instructions">
		<p>💡 Drag nodes to rearrange • Click nodes to view details • Scroll to zoom • Drag background to pan</p>
	</div>
</div>

<style>
	.graph-viewer {
		display: flex;
		flex-direction: column;
		height: 600px;
		background: var(--surface-3, #2a2a2a);
		border-radius: 8px;
		border: 2px solid var(--border-color, #333);
		overflow: hidden;
	}

	.graph-controls {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background: var(--surface-2, #1e1e1e);
		border-bottom: 1px solid var(--border-color, #333);
		flex-wrap: wrap;
		gap: 1rem;
	}

	.legend {
		display: flex;
		gap: 1.5rem;
		align-items: center;
		flex-wrap: wrap;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: var(--text-2, #999);
	}

	.legend-separator {
		width: 1px;
		height: 20px;
		background: var(--border-color, #333);
	}

	.legend-symbol {
		width: 20px;
		height: 20px;
		border: 2px solid;
	}

	.entrance-symbol {
		background-color: #f59e0b;
		border-color: #b45309;
		transform: rotate(45deg);
	}

	.room-symbol {
		background-color: #8b5cf6;
		border-color: #6d28d9;
		border-radius: 4px;
	}

	.legend-line {
		width: 30px;
		height: 3px;
	}

	.door-line {
		background-color: #3b82f6;
	}

	.tunnel-line {
		background: repeating-linear-gradient(
			to right,
			#84cc16 0,
			#84cc16 5px,
			transparent 5px,
			transparent 10px
		);
		height: 3px;
	}

	.obstacle-line {
		background: repeating-linear-gradient(
			to right,
			#ef4444 0,
			#ef4444 2px,
			transparent 2px,
			transparent 6px
		);
		height: 2px;
	}

	.control-buttons {
		display: flex;
		gap: 0.5rem;
	}

	.control-btn {
		padding: 0.5rem 1rem;
		background: var(--surface-4, #333);
		border: 1px solid var(--border-color, #444);
		border-radius: 6px;
		color: var(--text-1, #e0e0e0);
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.control-btn:hover {
		background: var(--accent, #60a5fa);
		border-color: var(--accent, #60a5fa);
		color: #000;
	}

	.graph-container {
		flex: 1;
		width: 100%;
		background: var(--surface-4, #1a1a1a);
	}

	.instructions {
		padding: 0.75rem 1rem;
		background: var(--surface-2, #1e1e1e);
		border-top: 1px solid var(--border-color, #333);
	}

	.instructions p {
		margin: 0;
		font-size: 0.8125rem;
		color: var(--text-2, #999);
		text-align: center;
	}
</style>
