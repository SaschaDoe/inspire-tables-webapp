/**
 * CityPopulationManager - Handles population growth, food consumption, and starvation
 *
 * Inspired by Unciv's CityPopulationManager pattern for clean separation of concerns.
 *
 * Responsibilities:
 * - Calculate food needed for growth
 * - Track food storage toward next population
 * - Handle food consumption (2 food per population)
 * - Manage starvation (negative food)
 * - Calculate growth rate
 */

export interface PopulationGrowthResult {
	grew: boolean;
	starved: boolean;
	newPopulation: number;
	foodStored: number;
}

export class CityPopulationManager {
	// Current state
	population: number = 1;
	foodStored: number = 0;
	foodNeededForGrowth: number = 10;

	// Growth tracking
	growthRate: number = 0; // Food per turn after consumption
	isStarving: boolean = false;
	starvationTurns: number = 0;

	// Configuration
	foodConsumptionPerPop: number = 2; // Each population eats 2 food per turn
	starvationTurnsBeforeLoss: number = 3; // Lose population after 3 turns of starvation

	// Modifiers
	growthModifiers: Array<{ source: string; value: number }> = []; // % modifiers to growth
	foodModifiers: Array<{ source: string; value: number }> = []; // Flat food bonuses

	constructor(initialPopulation: number = 1) {
		this.population = initialPopulation;
		this.calculateFoodNeededForGrowth();
	}

	/**
	 * Calculate food needed for next population growth (Civ 5 formula)
	 * Formula: 15 + (8 * (population - 1))
	 */
	calculateFoodNeededForGrowth(): void {
		this.foodNeededForGrowth = 15 + 8 * (this.population - 1);
	}

	/**
	 * Calculate food consumption for current population
	 */
	getFoodConsumption(): number {
		return this.population * this.foodConsumptionPerPop;
	}

	/**
	 * Calculate growth rate (food surplus/deficit after consumption)
	 */
	calculateGrowthRate(foodYield: number): number {
		const consumption = this.getFoodConsumption();
		let surplus = foodYield - consumption;

		// Apply food modifiers (e.g., from buildings, policies)
		for (const modifier of this.foodModifiers) {
			surplus += modifier.value;
		}

		this.growthRate = surplus;
		this.isStarving = surplus < 0;

		return surplus;
	}

	/**
	 * Process one turn of population growth/starvation
	 */
	processTurn(foodYield: number): PopulationGrowthResult {
		// Calculate growth rate
		const surplus = this.calculateGrowthRate(foodYield);

		// Add to food storage
		this.foodStored += surplus;

		// Apply growth modifiers (e.g., "+10% growth")
		let actualGrowth = this.foodStored;
		for (const modifier of this.growthModifiers) {
			actualGrowth *= (1 + modifier.value / 100);
		}

		// Check for population growth
		if (actualGrowth >= this.foodNeededForGrowth) {
			this.population++;
			this.foodStored = 0; // Reset food storage
			this.starvationTurns = 0;
			this.calculateFoodNeededForGrowth();

			return {
				grew: true,
				starved: false,
				newPopulation: this.population,
				foodStored: this.foodStored
			};
		}

		// Check for starvation
		if (this.isStarving) {
			this.starvationTurns++;
			this.foodStored = Math.max(0, this.foodStored); // Can't go below 0

			// Lose population after sustained starvation
			if (this.starvationTurns >= this.starvationTurnsBeforeLoss && this.population > 1) {
				this.population--;
				this.starvationTurns = 0;
				this.foodStored = 0;
				this.calculateFoodNeededForGrowth();

				return {
					grew: false,
					starved: true,
					newPopulation: this.population,
					foodStored: this.foodStored
				};
			}
		} else {
			this.starvationTurns = 0;
		}

		return {
			grew: false,
			starved: false,
			newPopulation: this.population,
			foodStored: this.foodStored
		};
	}

	/**
	 * Add a growth modifier (e.g., from buildings, policies)
	 */
	addGrowthModifier(source: string, value: number): void {
		// Remove existing modifier from same source
		this.growthModifiers = this.growthModifiers.filter(m => m.source !== source);

		if (value !== 0) {
			this.growthModifiers.push({ source, value });
		}
	}

	/**
	 * Add a food modifier (flat bonus)
	 */
	addFoodModifier(source: string, value: number): void {
		// Remove existing modifier from same source
		this.foodModifiers = this.foodModifiers.filter(m => m.source !== source);

		if (value !== 0) {
			this.foodModifiers.push({ source, value });
		}
	}

	/**
	 * Get total growth modifier percentage
	 */
	getTotalGrowthModifier(): number {
		return this.growthModifiers.reduce((sum, mod) => sum + mod.value, 0);
	}

	/**
	 * Get total food modifier
	 */
	getTotalFoodModifier(): number {
		return this.foodModifiers.reduce((sum, mod) => sum + mod.value, 0);
	}

	/**
	 * Calculate turns until next population (estimate)
	 */
	getTurnsUntilGrowth(foodYield: number): number {
		const surplus = this.calculateGrowthRate(foodYield);

		if (surplus <= 0) {
			return Infinity; // Never grow with negative surplus
		}

		const foodNeeded = this.foodNeededForGrowth - this.foodStored;
		return Math.ceil(foodNeeded / surplus);
	}

	/**
	 * Calculate turns until starvation death (if currently starving)
	 */
	getTurnsUntilStarvation(): number {
		if (!this.isStarving) {
			return Infinity;
		}

		return this.starvationTurnsBeforeLoss - this.starvationTurns;
	}

	/**
	 * Get population in thousands (for display)
	 */
	getTotalPopulation(): number {
		return this.population * 1000;
	}

	/**
	 * Set population directly (e.g., after conquest)
	 */
	setPopulation(newPopulation: number): void {
		this.population = Math.max(1, newPopulation);
		this.foodStored = 0;
		this.starvationTurns = 0;
		this.calculateFoodNeededForGrowth();
	}

	/**
	 * Reset to avoid growth (useful for certain city states)
	 */
	resetGrowth(): void {
		this.foodStored = 0;
		this.starvationTurns = 0;
	}

	/**
	 * Get summary for display
	 */
	getSummary(): string {
		const turnsToGrow = this.getTurnsUntilGrowth(this.growthRate);

		if (this.isStarving) {
			const turnsToStarve = this.getTurnsUntilStarvation();
			return `Pop: ${this.population} (Starving! ${turnsToStarve} turns until loss)`;
		} else if (turnsToGrow < Infinity) {
			return `Pop: ${this.population} (${turnsToGrow} turns to grow)`;
		} else {
			return `Pop: ${this.population} (Stagnant)`;
		}
	}

	/**
	 * Clone this manager (for state snapshots)
	 */
	clone(): CityPopulationManager {
		const cloned = new CityPopulationManager(this.population);
		cloned.foodStored = this.foodStored;
		cloned.foodNeededForGrowth = this.foodNeededForGrowth;
		cloned.growthRate = this.growthRate;
		cloned.isStarving = this.isStarving;
		cloned.starvationTurns = this.starvationTurns;
		cloned.growthModifiers = [...this.growthModifiers];
		cloned.foodModifiers = [...this.foodModifiers];
		return cloned;
	}

	/**
	 * Serialize to JSON
	 */
	toJSON(): any {
		return {
			population: this.population,
			foodStored: this.foodStored,
			foodNeededForGrowth: this.foodNeededForGrowth,
			growthRate: this.growthRate,
			isStarving: this.isStarving,
			starvationTurns: this.starvationTurns,
			growthModifiers: this.growthModifiers,
			foodModifiers: this.foodModifiers
		};
	}

	/**
	 * Restore from JSON
	 */
	static fromJSON(data: any): CityPopulationManager {
		const manager = new CityPopulationManager(data.population);
		manager.foodStored = data.foodStored ?? 0;
		manager.foodNeededForGrowth = data.foodNeededForGrowth ?? 15;
		manager.growthRate = data.growthRate ?? 0;
		manager.isStarving = data.isStarving ?? false;
		manager.starvationTurns = data.starvationTurns ?? 0;
		manager.growthModifiers = data.growthModifiers ?? [];
		manager.foodModifiers = data.foodModifiers ?? [];
		return manager;
	}
}
