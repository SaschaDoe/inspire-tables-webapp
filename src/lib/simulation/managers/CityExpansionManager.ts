/**
 * CityExpansionManager - Handles cultural border expansion and tile acquisition
 *
 * Inspired by Unciv's CityExpansionManager pattern.
 *
 * Responsibilities:
 * - Track culture toward next border expansion
 * - Calculate cost of next tile acquisition
 * - Determine which tiles can be claimed
 * - Handle culture bomb and instant tile acquisition
 * - Manage territory control
 */

export interface TileScore {
	hexTileId: string;
	score: number;
	distance: number;
}

export interface ExpansionResult {
	expanded: boolean;
	acquiredHexId?: string;
	cultureStored: number;
}

export class CityExpansionManager {
	// Owned tiles
	ownedHexTileIds: string[] = []; // All tiles owned by this city
	workRadius: number = 3; // How far citizens can work (default 3 tiles)

	// Culture accumulation
	cultureStored: number = 0;
	cultureNeededForExpansion: number = 10; // Cost of next tile
	totalCultureGenerated: number = 0;

	// Expansion tracking
	tilesAcquired: number = 0; // Number of tiles acquired through culture
	lastExpansionTurn: number = 0;

	// Modifiers
	cultureCostModifiers: Array<{ source: string; value: number }> = []; // % modifiers to cost

	constructor(centerHexId: string) {
		// Start with center hex
		this.ownedHexTileIds = [centerHexId];
		this.calculateCultureCost();
	}

	/**
	 * Calculate culture cost for next expansion (Civ 5 formula)
	 * Formula: 10 + (tilesAcquired * 4) + (tilesAcquired ^ 1.5)
	 */
	calculateCultureCost(): void {
		const base = 10;
		const linearCost = this.tilesAcquired * 4;
		const exponentialCost = Math.pow(this.tilesAcquired, 1.5);

		let cost = base + linearCost + exponentialCost;

		// Apply cost modifiers (e.g., "-25% culture cost" from Tradition policy)
		const totalModifier = this.getTotalCultureCostModifier();
		cost *= (1 + totalModifier / 100);

		this.cultureNeededForExpansion = Math.ceil(cost);
	}

	/**
	 * Get total culture cost modifier
	 */
	getTotalCultureCostModifier(): number {
		return this.cultureCostModifiers.reduce((sum, mod) => sum + mod.value, 0);
	}

	/**
	 * Add a culture cost modifier
	 */
	addCultureCostModifier(source: string, value: number): void {
		// Remove existing modifier from same source
		this.cultureCostModifiers = this.cultureCostModifiers.filter(
			m => m.source !== source
		);

		if (value !== 0) {
			this.cultureCostModifiers.push({ source, value });
		}

		// Recalculate cost
		this.calculateCultureCost();
	}

	/**
	 * Process one turn of cultural expansion
	 */
	processTurn(culturePerTurn: number, currentTurn: number, availableTiles: string[]): ExpansionResult {
		this.cultureStored += culturePerTurn;
		this.totalCultureGenerated += culturePerTurn;

		// Check if enough culture for expansion
		if (this.cultureStored >= this.cultureNeededForExpansion) {
			// Find best tile to claim
			const bestTile = this.selectNextTileToAcquire(availableTiles);

			if (bestTile) {
				// Claim the tile
				this.acquireTile(bestTile, currentTurn);

				// Reset culture
				this.cultureStored = 0;
				this.calculateCultureCost();

				return {
					expanded: true,
					acquiredHexId: bestTile,
					cultureStored: this.cultureStored
				};
			}
		}

		return {
			expanded: false,
			cultureStored: this.cultureStored
		};
	}

	/**
	 * Acquire a specific tile
	 */
	acquireTile(hexTileId: string, currentTurn: number): void {
		if (!this.ownedHexTileIds.includes(hexTileId)) {
			this.ownedHexTileIds.push(hexTileId);
			this.tilesAcquired++;
			this.lastExpansionTurn = currentTurn;
		}
	}

	/**
	 * Buy a tile with gold (instant acquisition)
	 */
	buyTile(hexTileId: string, goldCost: number, payGold: () => boolean, currentTurn: number): boolean {
		if (this.ownedHexTileIds.includes(hexTileId)) {
			return false; // Already owned
		}

		if (!payGold()) {
			return false; // Not enough gold
		}

		this.acquireTile(hexTileId, currentTurn);
		return true;
	}

	/**
	 * Culture bomb - acquire all tiles in range instantly
	 */
	cultureBomb(availableTiles: string[], currentTurn: number): string[] {
		const acquiredTiles: string[] = [];

		for (const tileId of availableTiles) {
			if (!this.ownedHexTileIds.includes(tileId)) {
				this.acquireTile(tileId, currentTurn);
				acquiredTiles.push(tileId);
			}
		}

		return acquiredTiles;
	}

	/**
	 * Select next tile to acquire based on value scoring
	 * @param availableTiles - Tiles that can be claimed (in work radius, not owned by another city)
	 */
	selectNextTileToAcquire(availableTiles: string[]): string | null {
		// This is a simplified version - real implementation would score tiles based on:
		// - Resources (luxury > strategic > bonus)
		// - Yields (food, production, gold)
		// - Strategic value (chokepoints, defense)
		// - Distance from city center

		// For now, just return the first available tile
		// TODO: Implement proper tile scoring algorithm
		return availableTiles[0] || null;
	}

	/**
	 * Score a tile for acquisition priority
	 * Higher score = higher priority
	 */
	scoreTileForAcquisition(
		hexTileId: string,
		distance: number,
		hasLuxuryResource: boolean,
		hasStrategicResource: boolean,
		yields: { food: number; production: number; gold: number; science: number; culture: number }
	): number {
		let score = 0;

		// Resources are valuable
		if (hasLuxuryResource) score += 100;
		if (hasStrategicResource) score += 75;

		// Yields matter
		score += yields.food * 3;
		score += yields.production * 3;
		score += yields.gold * 2;
		score += yields.science * 2;
		score += yields.culture * 1;

		// Closer tiles are better
		score -= distance * 5;

		return score;
	}

	/**
	 * Check if a tile can be worked by citizens
	 */
	canWork(hexTileId: string, distance: number): boolean {
		return this.ownedHexTileIds.includes(hexTileId) && distance <= this.workRadius;
	}

	/**
	 * Get workable tiles (owned and within work radius)
	 */
	getWorkableTiles(): string[] {
		// TODO: Filter by actual distance calculation
		return this.ownedHexTileIds;
	}

	/**
	 * Get turns until next expansion (estimate)
	 */
	getTurnsUntilExpansion(culturePerTurn: number): number {
		if (culturePerTurn <= 0) {
			return Infinity;
		}

		const cultureNeeded = this.cultureNeededForExpansion - this.cultureStored;
		return Math.ceil(cultureNeeded / culturePerTurn);
	}

	/**
	 * Get summary for display
	 */
	getSummary(culturePerTurn: number): string {
		const turns = this.getTurnsUntilExpansion(culturePerTurn);

		if (turns < Infinity) {
			return `Territory: ${this.ownedHexTileIds.length} tiles (${turns} turns to expand)`;
		} else {
			return `Territory: ${this.ownedHexTileIds.length} tiles (No expansion)`;
		}
	}

	/**
	 * Clone this manager (for state snapshots)
	 */
	clone(): CityExpansionManager {
		const centerHex = this.ownedHexTileIds[0] || '';
		const cloned = new CityExpansionManager(centerHex);
		cloned.ownedHexTileIds = [...this.ownedHexTileIds];
		cloned.workRadius = this.workRadius;
		cloned.cultureStored = this.cultureStored;
		cloned.cultureNeededForExpansion = this.cultureNeededForExpansion;
		cloned.totalCultureGenerated = this.totalCultureGenerated;
		cloned.tilesAcquired = this.tilesAcquired;
		cloned.lastExpansionTurn = this.lastExpansionTurn;
		cloned.cultureCostModifiers = [...this.cultureCostModifiers];
		return cloned;
	}

	/**
	 * Serialize to JSON
	 */
	toJSON(): any {
		return {
			ownedHexTileIds: this.ownedHexTileIds,
			workRadius: this.workRadius,
			cultureStored: this.cultureStored,
			cultureNeededForExpansion: this.cultureNeededForExpansion,
			totalCultureGenerated: this.totalCultureGenerated,
			tilesAcquired: this.tilesAcquired,
			lastExpansionTurn: this.lastExpansionTurn,
			cultureCostModifiers: this.cultureCostModifiers
		};
	}

	/**
	 * Restore from JSON
	 */
	static fromJSON(data: any): CityExpansionManager {
		const centerHex = data.ownedHexTileIds?.[0] || '';
		const manager = new CityExpansionManager(centerHex);
		manager.ownedHexTileIds = data.ownedHexTileIds ?? [centerHex];
		manager.workRadius = data.workRadius ?? 3;
		manager.cultureStored = data.cultureStored ?? 0;
		manager.cultureNeededForExpansion = data.cultureNeededForExpansion ?? 10;
		manager.totalCultureGenerated = data.totalCultureGenerated ?? 0;
		manager.tilesAcquired = data.tilesAcquired ?? 0;
		manager.lastExpansionTurn = data.lastExpansionTurn ?? 0;
		manager.cultureCostModifiers = data.cultureCostModifiers ?? [];
		return manager;
	}
}
