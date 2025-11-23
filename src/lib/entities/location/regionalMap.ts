import { Entity } from '../base/entity';

/**
 * Adjacent map connection - for cross-boundary interactions
 */
export interface AdjacentMapConnection {
	adjacentMapId: string; // ID of the adjacent RegionalMap
	direction: 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest';
	sharedBorderHexIds: string[]; // IDs of hex tiles on the border
}

/**
 * Simulation configuration for this regional map
 */
export interface SimulationConfig {
	startYear: number; // When simulation starts (e.g., -10000 for prehistoric)
	currentYear: number; // Current simulation year
	endYear?: number; // Optional end year for simulation
	turnsPerYear: number; // Default: 1 (1 turn = 1 year)

	// Nation configuration
	initialNations: number; // How many nations to start with (1-20)
	allowNewNations: boolean; // Whether new nations can emerge during simulation

	// Simulation modes
	enableFantasy: boolean; // Fantasy races vs realistic human races
	enableMagic: boolean; // Whether magic/fantasy elements are active
	enableDiplomacy: boolean; // Whether diplomacy system is active
	enableCombat: boolean; // Whether combat system is active
	enableTechnology: boolean; // Whether tech progression is active
	enableCulture: boolean; // Whether culture and policies are active
}

/**
 * RegionalMap - Container for detailed simulation hex map
 *
 * This entity represents a detailed hex map that corresponds to one PlanetaryHexTile.
 * It contains all the RegionalHexTile entities and manages the simulation state
 * for this specific region.
 *
 * Regional maps are where the Civilization 5-style simulation occurs:
 * - Nations expanding and competing
 * - Cities growing and producing
 * - Units moving and fighting
 * - Technology and culture advancing
 * - Historical events being recorded
 */
export class RegionalMap extends Entity {
	// Parent reference
	parentPlanetaryHexId = ''; // ID of the PlanetaryHexTile this map represents
	parentPlanetId = ''; // ID of the Planet entity
	parentContinentId?: string; // Optional continent reference

	// Map dimensions
	width = 20; // Number of hexes wide (default 20x20 = 400 hexes)
	height = 20; // Number of hexes tall

	// Map topology
	wrapEastWest = false; // Whether map wraps around horizontally
	wrapNorthSouth = false; // Whether map wraps around vertically

	// Hex tile references
	hexTileIds: string[] = []; // IDs of all RegionalHexTile entities in this map

	// Adjacent maps (for cross-boundary interactions)
	adjacentMaps: AdjacentMapConnection[] = [];

	// Simulation state
	simulationConfig: SimulationConfig = {
		startYear: -10000,
		currentYear: -10000,
		endYear: 2000,
		turnsPerYear: 1,
		initialNations: 3,
		allowNewNations: true,
		enableFantasy: false,
		enableMagic: false,
		enableDiplomacy: true,
		enableCombat: true,
		enableTechnology: true,
		enableCulture: true
	};

	// Participating entities
	nationIds: string[] = []; // IDs of Nation entities active in this map
	cityIds: string[] = []; // IDs of City entities in this map
	unitIds: string[] = []; // IDs of Unit entities in this map

	// Historical tracking
	historicalEventIds: string[] = []; // IDs of all HistoricalEvent entities
	battleIds: string[] = []; // IDs of all Battle entities
	snapshotYears: number[] = []; // Years where full state snapshots exist (every 100 years)

	// Simulation status
	isSimulationRunning = false;
	simulationProgress = 0; // Percentage complete (0-100)
	lastSimulatedYear = -10000; // Last year that was simulated

	// Statistics (updated during simulation)
	statistics = {
		totalEvents: 0,
		totalBattles: 0,
		totalCities: 0,
		totalPopulation: 0,
		nationsCreated: 0,
		nationsDestroyed: 0
	};

	constructor() {
		super();
		this.name = 'Regional Map';
		this.description = 'Detailed simulation map for a planetary hex region';
	}

	/**
	 * Initialize hex tiles for this map
	 * Creates the grid of RegionalHexTile entities
	 */
	initializeHexTiles(): string[] {
		// This will be implemented by the map generator
		// Returns array of created hex tile IDs
		return [];
	}

	/**
	 * Get hex tile at specific coordinates
	 */
	getHexTileIdAt(x: number, y: number): string | undefined {
		// This requires looking up in the entity store
		// Will be implemented with the simulation engine
		return undefined;
	}

	/**
	 * Get neighboring hex tile coordinates
	 * Uses axial coordinates for hex grid
	 */
	getNeighborCoordinates(x: number, y: number): Array<{ x: number; y: number }> {
		// Axial coordinate neighbors (pointy-top hexes)
		const neighbors = [
			{ x: x + 1, y: y },     // East
			{ x: x - 1, y: y },     // West
			{ x: x, y: y + 1 },     // Southeast
			{ x: x, y: y - 1 },     // Northwest
			{ x: x + 1, y: y - 1 }, // Northeast
			{ x: x - 1, y: y + 1 }  // Southwest
		];

		// Filter out invalid coordinates
		return neighbors.filter(coord => {
			let validX = coord.x >= 0 && coord.x < this.width;
			let validY = coord.y >= 0 && coord.y < this.height;

			// Handle wrapping
			if (this.wrapEastWest) {
				validX = true;
			}
			if (this.wrapNorthSouth) {
				validY = true;
			}

			return validX && validY;
		});
	}

	/**
	 * Calculate distance between two hexes (in hex tiles)
	 */
	getDistance(x1: number, y1: number, x2: number, y2: number): number {
		// Axial coordinate distance calculation
		const dx = x2 - x1;
		const dy = y2 - y1;

		if ((dx >= 0 && dy >= 0) || (dx < 0 && dy < 0)) {
			return Math.abs(dx + dy);
		} else {
			return Math.max(Math.abs(dx), Math.abs(dy));
		}
	}

	/**
	 * Add an adjacent map connection
	 */
	addAdjacentMap(
		adjacentMapId: string,
		direction: AdjacentMapConnection['direction'],
		sharedBorderHexIds: string[]
	): void {
		// Check if connection already exists
		const existing = this.adjacentMaps.find(
			conn => conn.adjacentMapId === adjacentMapId
		);

		if (existing) {
			// Update existing connection
			existing.direction = direction;
			existing.sharedBorderHexIds = sharedBorderHexIds;
		} else {
			// Add new connection
			this.adjacentMaps.push({
				adjacentMapId,
				direction,
				sharedBorderHexIds
			});
		}
	}

	/**
	 * Get all adjacent regional maps
	 */
	getAdjacentMapIds(): string[] {
		return this.adjacentMaps.map(conn => conn.adjacentMapId);
	}

	/**
	 * Check if two nations can interact across boundaries
	 */
	canInteractAcrossBoundary(nationId1: string, nationId2: string): boolean {
		// Check if nations are in this map or adjacent maps
		// Will be implemented with simulation engine
		return false;
	}

	/**
	 * Start simulation
	 */
	startSimulation(): void {
		this.isSimulationRunning = true;
		this.simulationProgress = 0;
	}

	/**
	 * Stop simulation
	 */
	stopSimulation(): void {
		this.isSimulationRunning = false;
	}

	/**
	 * Update simulation progress
	 */
	updateProgress(currentYear: number): void {
		const config = this.simulationConfig;
		const totalYears = (config.endYear || config.currentYear) - config.startYear;
		const elapsedYears = currentYear - config.startYear;
		this.simulationProgress = Math.min(100, (elapsedYears / totalYears) * 100);
		this.lastSimulatedYear = currentYear;
	}

	/**
	 * Add a snapshot year for state reconstruction
	 */
	addSnapshot(year: number): void {
		if (!this.snapshotYears.includes(year)) {
			this.snapshotYears.push(year);
			this.snapshotYears.sort((a, b) => a - b);
		}
	}

	/**
	 * Get closest snapshot year before given year
	 */
	getClosestSnapshotBefore(year: number): number | undefined {
		const validSnapshots = this.snapshotYears.filter(y => y <= year);
		return validSnapshots.length > 0 ? validSnapshots[validSnapshots.length - 1] : undefined;
	}

	/**
	 * Get map summary for display
	 */
	getSummary(): string {
		const hexCount = this.hexTileIds.length;
		const nationCount = this.nationIds.length;
		const cityCount = this.cityIds.length;
		const yearRange = `${this.simulationConfig.startYear} to ${this.lastSimulatedYear}`;

		return `${this.name}: ${hexCount} hexes, ${nationCount} nations, ${cityCount} cities. Simulated: ${yearRange}`;
	}

	/**
	 * Reset simulation to start year
	 */
	resetSimulation(): void {
		this.simulationConfig.currentYear = this.simulationConfig.startYear;
		this.lastSimulatedYear = this.simulationConfig.startYear;
		this.simulationProgress = 0;
		this.isSimulationRunning = false;

		// Clear dynamic data (cities, units, events will be cleared by simulation engine)
		this.statistics = {
			totalEvents: 0,
			totalBattles: 0,
			totalCities: 0,
			totalPopulation: 0,
			nationsCreated: 0,
			nationsDestroyed: 0
		};
	}
}
