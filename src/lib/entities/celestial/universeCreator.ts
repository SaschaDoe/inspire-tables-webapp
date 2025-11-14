import { Creator } from '../base/creator';
import { Universe, type UniverseStructureType } from './universe';
import { UniverseNameTable } from '$lib/tables/celestialTables/universe/universeNameTable';
import { DimensionalStructureTable } from '$lib/tables/celestialTables/universe/dimensionalStructureTable';
import { UniverseAgeTable } from '$lib/tables/celestialTables/universe/universeAgeTable';
import { SphereCreator } from './sphereCreator';
import { Sphere } from './sphere';
import { SphereConnectionCreator } from './sphereConnectionCreator';
import type { SphereConnection } from './sphereConnection';

export class UniverseCreator extends Creator<Universe> {
	// Connection generation probabilities (as percentages)
	private static readonly PROBABILITY_MULTIPLE_PATHS = 10;
	private static readonly PROBABILITY_BIDIRECTIONAL = 40;
	private static readonly PROBABILITY_REVERSE_CONNECTION = 60;
	private static readonly MIN_MULTIPLE_PATHS = 2;
	private static readonly MAX_MULTIPLE_PATHS = 3;

	// Nested entity requirements
	static readonly NESTED_ENTITY_RULES = {
		spheres: {
			min: 1,
			max: undefined, // No maximum
			entityType: 'sphere' as const,
			displayName: 'Sphere'
		},
		sphereConnections: {
			min: 0,
			max: undefined, // No maximum
			entityType: 'sphereConnection' as const,
			displayName: 'Sphere Connection'
		}
	};

	create(): Universe {
		const universe = new Universe();
		universe.name = new UniverseNameTable().roleWithCascade(this.dice).text;
		universe.dimensionalStructure = new DimensionalStructureTable().roleWithCascade(this.dice).text;
		universe.age = new UniverseAgeTable().roleWithCascade(this.dice).text;

		// Generate structure type
		const structureTypes: UniverseStructureType[] = [
			'schalen',
			'tree',
			'web',
			'cluster',
			'linear',
			'custom'
		];
		universe.structureType = structureTypes[this.dice.rollInterval(0, structureTypes.length - 1)];

		// Always create the normal "Material Sphere" first with standard physics
		const materialSphere = new Sphere();
		materialSphere.id = crypto.randomUUID();
		materialSphere.parentId = universe.id; // Set parent reference
		materialSphere.name = 'Material Sphere';
		materialSphere.birth = 'Big Bang';
		materialSphere.rule =
			'Standard physics with fundamental forces: gravity, electromagnetism, strong and weak nuclear forces';
		materialSphere.galaxies = []; // Will be populated if accessed
		universe.spheres.push(materialSphere);

		// Create 0-9 additional random spheres
		const additionalSpheresCount = this.dice.rollInterval(0, 9); // 0 to 9
		const sphereCreator = new SphereCreator();
		sphereCreator.dice = this.dice;

		for (let i = 0; i < additionalSpheresCount; i++) {
			const sphere = sphereCreator.withParent(universe.id).create();
			sphere.id = crypto.randomUUID();
			universe.spheres.push(sphere);
		}

		// Assign layers for schalen structure
		if (universe.structureType === 'schalen' && universe.spheres.length > 1) {
			universe.spheres.forEach((sphere, index) => {
				sphere.layer = index; // Material Sphere is layer 0
			});
		}

		// Generate connections between spheres
		const connections = this.generateConnections(universe);
		universe.sphereConnectionIds = connections.map((conn) => conn.id);

		// Store connections as a property on Universe for extraction
		// @ts-ignore - adding custom property for nested entity extraction
		universe.sphereConnections = connections;

		// Update spheres with connection IDs
		for (const connection of connections) {
			const fromSphere = universe.spheres.find((s) => s.id === connection.fromSphereId);
			const toSphere = universe.spheres.find((s) => s.id === connection.toSphereId);

			if (fromSphere) {
				if (!fromSphere.outgoingConnectionIds) fromSphere.outgoingConnectionIds = [];
				fromSphere.outgoingConnectionIds.push(connection.id);
			}

			if (toSphere) {
				if (!toSphere.incomingConnectionIds) toSphere.incomingConnectionIds = [];
				toSphere.incomingConnectionIds.push(connection.id);
			}
		}

		this.generateDescription(universe);
		return universe;
	}

	/**
	 * Helper to create connections between two spheres
	 * Handles bidirectional, one-way, and multiple path scenarios
	 *
	 * Connection types:
	 * - Bidirectional: One connection that works both ways (arrows on both ends)
	 * - One-way: Single directional connection (arrow on one end)
	 * - Two separate one-ways: Two connections, one for each direction
	 * - Multiple paths: 2-3 different connection options between same spheres
	 */
	private createConnectionsBetweenSpheres(
		fromSphere: Sphere,
		toSphere: Sphere,
		connectionCreator: SphereConnectionCreator
	): SphereConnection[] {
		const createdConnections: SphereConnection[] = [];

		// Determine if there are multiple path options
		const hasMultiplePaths = this.rollPercentage(UniverseCreator.PROBABILITY_MULTIPLE_PATHS);
		const pathCount = hasMultiplePaths
			? this.dice.rollInterval(
				UniverseCreator.MIN_MULTIPLE_PATHS,
				UniverseCreator.MAX_MULTIPLE_PATHS
			)
			: 1;

		// Create each path
		for (let pathIndex = 0; pathIndex < pathCount; pathIndex++) {
			const isFirstPath = pathIndex === 0;

			if (isFirstPath) {
				// For the primary connection, decide on directionality
				const connections = this.createPrimaryConnection(
					fromSphere,
					toSphere,
					connectionCreator
				);
				createdConnections.push(...connections);
			} else {
				// Additional alternate paths - randomly one-way or bidirectional
				const isOneWay = this.rollPercentage(50);
				const connection = connectionCreator
					.withSpheres(fromSphere.id, fromSphere.name, toSphere.id, toSphere.name)
					.withDirectionality(isOneWay)
					.create();
				createdConnections.push(connection);
			}
		}

		return createdConnections;
	}

	/**
	 * Creates the primary connection between two spheres
	 * Returns either:
	 * - One bidirectional connection
	 * - One one-way connection
	 * - Two one-way connections (one each direction)
	 */
	private createPrimaryConnection(
		fromSphere: Sphere,
		toSphere: Sphere,
		connectionCreator: SphereConnectionCreator
	): SphereConnection[] {
		const isBidirectional = this.rollPercentage(UniverseCreator.PROBABILITY_BIDIRECTIONAL);

		if (isBidirectional) {
			// Create single bidirectional connection
			const connection = connectionCreator
				.withSpheres(fromSphere.id, fromSphere.name, toSphere.id, toSphere.name)
				.withDirectionality(false)
				.create();
			return [connection];
		}

		// Create one-way connection
		const forwardConnection = connectionCreator
			.withSpheres(fromSphere.id, fromSphere.name, toSphere.id, toSphere.name)
			.withDirectionality(true)
			.create();

		// Possibly create reverse connection
		const shouldCreateReverse = this.rollPercentage(UniverseCreator.PROBABILITY_REVERSE_CONNECTION);
		if (shouldCreateReverse) {
			const reverseConnection = connectionCreator
				.withSpheres(toSphere.id, toSphere.name, fromSphere.id, fromSphere.name)
				.withDirectionality(true)
				.create();
			return [forwardConnection, reverseConnection];
		}

		return [forwardConnection];
	}

	/**
	 * Helper to roll a percentage check
	 * @param percentage - The percentage chance (0-100)
	 * @returns true if the roll succeeds
	 */
	private rollPercentage(percentage: number): boolean {
		return this.dice.rollInterval(1, 100) <= percentage;
	}

	private generateConnections(universe: Universe): SphereConnection[] {
		const connections: SphereConnection[] = [];

		// Need at least 2 spheres to create connections
		if (universe.spheres.length < 2) {
			return connections;
		}

		console.log('[UniverseCreator] Generating connections for spheres:', universe.spheres.map(s => ({id: s.id, name: s.name})));

		const connectionCreator = new SphereConnectionCreator();
		connectionCreator.dice = this.dice;
		connectionCreator.withParent(universe.id);

		switch (universe.structureType) {
			case 'schalen':
				// Connect adjacent layers
				for (let i = 0; i < universe.spheres.length - 1; i++) {
					const fromSphere = universe.spheres[i];
					const toSphere = universe.spheres[i + 1];

					const layerConnections = this.createConnectionsBetweenSpheres(
						fromSphere,
						toSphere,
						connectionCreator
					);
					connections.push(...layerConnections);
				}
				break;

			case 'tree':
				// First sphere is root, others branch from it or from branches
				const root = universe.spheres[0];
				for (let i = 1; i < universe.spheres.length; i++) {
					const sphere = universe.spheres[i];
					// Connect to root or to a previous sphere (creates branching)
					const parentIndex =
						i > 2 && this.dice.rollInterval(1, 100) > 40
							? this.dice.rollInterval(0, i - 1)
							: 0;
					const parent = universe.spheres[parentIndex];

					const treeConnections = this.createConnectionsBetweenSpheres(
						parent,
						sphere,
						connectionCreator
					);
					connections.push(...treeConnections);
				}
				break;

			case 'linear':
				// Chain: A -> B -> C -> D
				for (let i = 0; i < universe.spheres.length - 1; i++) {
					const fromSphere = universe.spheres[i];
					const toSphere = universe.spheres[i + 1];

					const linearConnections = this.createConnectionsBetweenSpheres(
						fromSphere,
						toSphere,
						connectionCreator
					);
					connections.push(...linearConnections);
				}
				break;

			case 'web':
				// Highly interconnected - each sphere connects to 2-4 others
				for (const sphere of universe.spheres) {
					const numConnections = this.dice.rollInterval(2, Math.min(4, universe.spheres.length - 1));
					const connectedTo = new Set<string>();

					for (let i = 0; i < numConnections; i++) {
						const targetSphere =
							universe.spheres[this.dice.rollInterval(0, universe.spheres.length - 1)];

						// Don't connect to self or already connected
						if (targetSphere.id !== sphere.id && !connectedTo.has(targetSphere.id)) {
							connectedTo.add(targetSphere.id);

							const webConnections = this.createConnectionsBetweenSpheres(
								sphere,
								targetSphere,
								connectionCreator
							);
							connections.push(...webConnections);
						}
					}
				}
				break;

			case 'cluster':
				// Form 2-3 clusters, spheres within cluster highly connected
				const clusterCount = Math.min(3, Math.ceil(universe.spheres.length / 3));
				const clusters: Sphere[][] = Array.from({ length: clusterCount }, () => []);

				// Assign spheres to clusters
				universe.spheres.forEach((sphere, index) => {
					clusters[index % clusterCount].push(sphere);
				});

				// Connect within clusters
				for (const cluster of clusters) {
					for (let i = 0; i < cluster.length; i++) {
						for (let j = i + 1; j < cluster.length; j++) {
							const fromSphere = cluster[i];
							const toSphere = cluster[j];

							if (this.dice.rollInterval(1, 100) > 30) {
								// 70% chance to connect
								const clusterConnections = this.createConnectionsBetweenSpheres(
									fromSphere,
									toSphere,
									connectionCreator
								);
								connections.push(...clusterConnections);
							}
						}
					}
				}

				// Occasional cross-cluster connections
				if (clusters.length > 1) {
					for (let i = 0; i < clusterCount - 1; i++) {
						if (this.dice.rollInterval(1, 100) > 50) {
							const fromCluster = clusters[i];
							const toCluster = clusters[i + 1];
							const fromSphere = fromCluster[this.dice.rollInterval(0, fromCluster.length - 1)];
							const toSphere = toCluster[this.dice.rollInterval(0, toCluster.length - 1)];

							const crossClusterConnections = this.createConnectionsBetweenSpheres(
								fromSphere,
								toSphere,
								connectionCreator
							);
							connections.push(...crossClusterConnections);
						}
					}
				}
				break;

			case 'custom':
			default:
				// Random connections - each sphere connects to at least 1 other
				for (const sphere of universe.spheres) {
					const numConnections = this.dice.rollInterval(1, Math.min(3, universe.spheres.length - 1));

					for (let i = 0; i < numConnections; i++) {
						const targetSphere =
							universe.spheres[this.dice.rollInterval(0, universe.spheres.length - 1)];

						if (targetSphere.id !== sphere.id) {
							const customConnections = this.createConnectionsBetweenSpheres(
								sphere,
								targetSphere,
								connectionCreator
							);
							connections.push(...customConnections);
						}
					}
				}
				break;
		}

		return connections;
	}

	private generateDescription(universe: Universe): void {
		const sphereText =
			universe.spheres.length === 1 ? '1 sphere' : `${universe.spheres.length} spheres`;
		universe.description = `${universe.name}, ${universe.age}. It has ${universe.dimensionalStructure}. Contains ${sphereText}.`;
	}
}
