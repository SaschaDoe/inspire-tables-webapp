<script lang="ts">
	import { onMount } from 'svelte';
	import type { Universe } from '$lib/entities/celestial/universe';
	import type { Entity } from '$lib/types/entity';
	import { EntityType } from '$lib/types/entity';
	import { createEventDispatcher } from 'svelte';
	import cytoscape from 'cytoscape';
	import type { Core, NodeSingular } from 'cytoscape';
	import { entityStore } from '$lib/stores/entityStore';
	import type { SphereConnection } from '$lib/entities/celestial/sphereConnection';
	import type { Sphere } from '$lib/entities/celestial/sphere';

	interface Props {
		universe: Universe;
	}

	let { universe }: Props = $props();
	const dispatch = createEventDispatcher<{
		openEntity: { entity: Entity };
		entityUpdated: { entity: Entity };
	}>();

	let container: HTMLDivElement;
	let cy: Core;

	/**
	 * Wraps a nested sphere entity with full Entity interface properties
	 */
	function wrapNestedEntity(sphere: Sphere, parentUniverse: Universe): Entity {
		return {
			id: sphere.id,
			type: EntityType.Sphere,
			name: sphere.name || `Sphere ${sphere.id.slice(0, 8)}`,
			description: sphere.description || '',
			tags: sphere.tags || [],
			parentId: parentUniverse.id,
			metadata: sphere.metadata || {
				createdAt: new Date(),
				updatedAt: new Date()
			},
			relationships: sphere.relationships || [],
			customFields: sphere.customFields || {}
		};
	}

	function buildGraph() {
		if (!cy) return;

		const nodes = [];
		const edges = [];

		// Add sphere nodes
		const sphereIds = new Set<string>();
		for (const sphere of universe.spheres || []) {
			if (!sphere.id) {
				console.warn('Sphere missing ID:', sphere);
				continue;
			}
			sphereIds.add(sphere.id);
			const wrappedSphere = wrapNestedEntity(sphere, universe);
			nodes.push({
				data: {
					id: sphere.id,
					label: sphere.name || 'Unnamed Sphere',
					type: 'sphere',
					rule: sphere.rule || '',
					galaxyCount: sphere.galaxies?.length || 0,
					layer: sphere.layer,
					entity: wrappedSphere
				}
			});
		}

		console.log('[SphereGraphViewer] Sphere IDs:', Array.from(sphereIds));
		console.log('[SphereGraphViewer] Connection IDs:', universe.sphereConnectionIds);

		// Add connection edges from sphere connection entities
		for (const connectionId of universe.sphereConnectionIds || []) {
			const connection = entityStore.getEntity(connectionId) as SphereConnection | undefined;
			if (connection) {
				console.log('[SphereGraphViewer] Connection:', {
					id: connection.id,
					from: connection.fromSphereId,
					to: connection.toSphereId,
					fromName: connection.fromSphereName,
					toName: connection.toSphereName
				});

				// Validate that source and target nodes exist
				if (!sphereIds.has(connection.fromSphereId)) {
					console.warn(
						`[SphereGraphViewer] Connection ${connection.id} has invalid fromSphereId: ${connection.fromSphereId}`
					);
					continue;
				}
				if (!sphereIds.has(connection.toSphereId)) {
					console.warn(
						`[SphereGraphViewer] Connection ${connection.id} has invalid toSphereId: ${connection.toSphereId}`
					);
					continue;
				}

				edges.push({
					data: {
						id: connection.id,
						source: connection.fromSphereId,
						target: connection.toSphereId,
						label: connection.name || '',
						connectionType: connection.connectionType,
						travelMethod: connection.travelMethod,
						isOneWay: connection.isOneWay,
						connection: connection
					}
				});
			}
		}

		console.log('[SphereGraphViewer] Building graph with', nodes.length, 'nodes and', edges.length, 'edges');

		// Update graph
		cy.elements().remove();
		cy.add({ nodes, edges });

		// Apply layout based on structure type
		applyLayout();
	}

	function applyLayout() {
		if (!cy) return;

		let layoutConfig: any;

		switch (universe.structureType) {
			case 'schalen':
				// Concentric circles layout
				layoutConfig = {
					name: 'concentric',
					animate: true,
					animationDuration: 500,
					concentric: (node: NodeSingular) => {
						const layer = node.data('layer');
						return layer !== undefined ? -layer : 0; // Negative so inner layers are in center
					},
					levelWidth: () => 1,
					minNodeSpacing: 100,
					padding: 50
				};
				break;

			case 'tree':
				// Hierarchical tree layout
				layoutConfig = {
					name: 'breadthfirst',
					animate: true,
					animationDuration: 500,
					directed: true,
					spacingFactor: 1.5,
					padding: 50,
					avoidOverlap: true
				};
				break;

			case 'linear':
				// Linear chain layout
				layoutConfig = {
					name: 'breadthfirst',
					animate: true,
					animationDuration: 500,
					directed: true,
					grid: false,
					spacingFactor: 2,
					padding: 50
				};
				break;

			case 'web':
			case 'cluster':
			case 'custom':
			default:
				// Force-directed organic layout
				layoutConfig = {
					name: 'cose',
					animate: true,
					animationDuration: 500,
					nodeDimensionsIncludeLabels: true,
					idealEdgeLength: 200,
					nodeRepulsion: 10000,
					padding: 50
				};
				break;
		}

		cy.layout(layoutConfig).run();
	}

	onMount(() => {
		// Initialize Cytoscape
		cy = cytoscape({
			container: container,
			elements: [],
			style: [
				{
					selector: 'node',
					style: {
						'background-color': '#8b5cf6',
						'label': 'data(label)',
						'color': '#ffffff',
						'text-valign': 'center',
						'text-halign': 'center',
						'font-size': '14px',
						'width': '100px',
						'height': '100px',
						'border-width': '4px',
						'border-color': '#6d28d9',
						'font-weight': 'bold',
						'text-wrap': 'wrap',
						'text-max-width': '90px',
						'shape': 'ellipse'
					}
				},
				{
					selector: 'node:selected',
					style: {
						'border-width': '6px',
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
						'text-background-opacity': 0.9,
						'text-background-padding': '4px',
						'text-rotation': 'autorotate'
					}
				},
				// Connection type styles
				{
					selector: 'edge[connectionType="aligned"]',
					style: {
						'line-color': '#10b981',
						'target-arrow-color': '#10b981'
					}
				},
				{
					selector: 'edge[connectionType="conflicting"]',
					style: {
						'line-color': '#ef4444',
						'target-arrow-color': '#ef4444'
					}
				},
				{
					selector: 'edge[connectionType="adjacent"]',
					style: {
						'line-color': '#3b82f6',
						'target-arrow-color': '#3b82f6'
					}
				},
				{
					selector: 'edge[connectionType="distant"]',
					style: {
						'line-color': '#6366f1',
						'target-arrow-color': '#6366f1',
						'line-style': 'dashed'
					}
				},
				{
					selector: 'edge[connectionType="merged"]',
					style: {
						'line-color': '#8b5cf6',
						'target-arrow-color': '#8b5cf6',
						'width': 5
					}
				},
				{
					selector: 'edge[connectionType="portal"]',
					style: {
						'line-color': '#f59e0b',
						'target-arrow-color': '#f59e0b',
						'line-style': 'dotted'
					}
				},
				{
					selector: 'edge[connectionType="natural"]',
					style: {
						'line-color': '#84cc16',
						'target-arrow-color': '#84cc16'
					}
				},
				{
					selector: 'edge[connectionType="divine"]',
					style: {
						'line-color': '#fbbf24',
						'target-arrow-color': '#fbbf24',
						'width': 4
					}
				},
				// Bidirectional connections (two-way) have arrows on both ends
				{
					selector: 'edge[?isOneWay][isOneWay = false]',
					style: {
						'target-arrow-shape': 'triangle',
						'source-arrow-shape': 'triangle'
					}
				},
				// One-way connections have arrow only on target
				{
					selector: 'edge[?isOneWay][isOneWay = true]',
					style: {
						'target-arrow-shape': 'triangle',
						'source-arrow-shape': 'none'
					}
				}
			],
			minZoom: 0.3,
			maxZoom: 3,
			wheelSensitivity: 0.2
		});

		// Build initial graph
		buildGraph();

		// Handle node click to open sphere entity
		cy.on('tap', 'node', (event) => {
			const node: NodeSingular = event.target;
			const entity = node.data('entity');
			if (entity) {
				dispatch('openEntity', { entity });
			}
		});

		// Handle edge click to open connection entity
		cy.on('tap', 'edge', (event) => {
			const edge = event.target;
			const connection = edge.data('connection');
			if (connection) {
				// Wrap as Entity
				const connectionEntity: Entity = {
					id: connection.id,
					type: EntityType.SphereConnection,
					name: connection.name,
					description: connection.description,
					tags: connection.tags || [],
					parentId: universe.id,
					metadata: connection.metadata,
					relationships: connection.relationships || [],
					customFields: connection.customFields || {}
				};
				dispatch('openEntity', { entity: connectionEntity });
			}
		});

		// Cleanup
		return () => {
			if (cy) {
				cy.destroy();
			}
		};
	});

	// Reactively update graph when universe changes
	$effect(() => {
		// Watch for changes in spheres or connections
		if (cy && universe) {
			buildGraph();
		}
	});

	function resetLayout() {
		applyLayout();
	}

	function resetZoom() {
		if (cy) {
			cy.fit(undefined, 50);
		}
	}

	function changeLayout(layoutName: string) {
		if (!cy) return;

		let layoutConfig: any;

		switch (layoutName) {
			case 'concentric':
				layoutConfig = {
					name: 'concentric',
					animate: true,
					animationDuration: 500,
					concentric: (node: NodeSingular) => node.data('galaxyCount') || 1,
					levelWidth: () => 1,
					minNodeSpacing: 100,
					padding: 50
				};
				break;
			case 'circle':
				layoutConfig = {
					name: 'circle',
					animate: true,
					animationDuration: 500,
					padding: 50
				};
				break;
			case 'grid':
				layoutConfig = {
					name: 'grid',
					animate: true,
					animationDuration: 500,
					padding: 50
				};
				break;
			default:
				layoutConfig = {
					name: 'cose',
					animate: true,
					animationDuration: 500,
					idealEdgeLength: 200,
					nodeRepulsion: 10000,
					padding: 50
				};
		}

		cy.layout(layoutConfig).run();
	}
</script>

<div class="graph-viewer">
	<div class="graph-controls">
		<div class="legend">
			<div class="legend-item">
				<div class="legend-symbol sphere-symbol"></div>
				<span>Sphere</span>
			</div>
			<div class="legend-separator"></div>
			<div class="legend-item">
				<div class="legend-line aligned-line"></div>
				<span>Aligned</span>
			</div>
			<div class="legend-item">
				<div class="legend-line conflicting-line"></div>
				<span>Conflicting</span>
			</div>
			<div class="legend-item">
				<div class="legend-line adjacent-line"></div>
				<span>Adjacent</span>
			</div>
			<div class="legend-item">
				<div class="legend-line portal-line"></div>
				<span>Portal</span>
			</div>
			<div class="legend-item">
				<div class="legend-line divine-line"></div>
				<span>Divine</span>
			</div>
		</div>
		<div class="control-buttons">
			<select onchange={(e) => changeLayout(e.currentTarget.value)} class="layout-select">
				<option value="cose">Organic</option>
				<option value="concentric">Concentric</option>
				<option value="circle">Circle</option>
				<option value="grid">Grid</option>
			</select>
			<button onclick={resetLayout} class="control-btn">Reset Layout</button>
			<button onclick={resetZoom} class="control-btn">Fit to View</button>
		</div>
	</div>
	<div bind:this={container} class="graph-container"></div>
	<div class="instructions">
		<p>
			💡 Drag nodes to rearrange • Click nodes to view spheres • Click edges to view connections •
			Scroll to zoom • Drag background to pan • ⟷ Two arrows = bidirectional • → One arrow = one-way
		</p>
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
		width: 24px;
		height: 24px;
		border: 3px solid;
	}

	.sphere-symbol {
		background-color: #8b5cf6;
		border-color: #6d28d9;
		border-radius: 50%;
	}

	.legend-line {
		width: 30px;
		height: 3px;
	}

	.aligned-line {
		background-color: #10b981;
	}

	.conflicting-line {
		background-color: #ef4444;
	}

	.adjacent-line {
		background-color: #3b82f6;
	}

	.portal-line {
		background: repeating-linear-gradient(
			to right,
			#f59e0b 0,
			#f59e0b 2px,
			transparent 2px,
			transparent 6px
		);
	}

	.divine-line {
		background-color: #fbbf24;
		height: 4px;
	}

	.control-buttons {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.layout-select {
		padding: 0.5rem 1rem;
		background: var(--surface-4, #333);
		border: 1px solid var(--border-color, #444);
		border-radius: 6px;
		color: var(--text-1, #e0e0e0);
		font-size: 0.875rem;
		cursor: pointer;
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
