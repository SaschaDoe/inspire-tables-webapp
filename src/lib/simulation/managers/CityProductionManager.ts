/**
 * CityProductionManager - Handles production queue, building construction, and unit creation
 *
 * Inspired by Unciv's CityConstructions pattern for clean separation of concerns.
 *
 * Responsibilities:
 * - Manage production queue (what to build next)
 * - Track production progress toward current item
 * - Handle completion of buildings/units/wonders
 * - Apply production modifiers
 * - Handle overflow production
 */

export enum ProductionItemType {
	Building = 'building',
	Unit = 'unit',
	Wonder = 'wonder',
	Project = 'project' // Great Person, Apollo Program, etc.
}

export interface ProductionQueueItem {
	type: ProductionItemType;
	itemId: string; // Building/Unit ID from game data
	itemName: string;
	productionCost: number;
	productionProgress: number;
	turnsRemaining: number;
}

export interface ProductionCompletionResult {
	completed: boolean;
	item?: ProductionQueueItem;
	overflowProduction: number;
}

export class CityProductionManager {
	// Production queue
	productionQueue: ProductionQueueItem[] = [];
	currentProduction?: ProductionQueueItem;

	// Production state
	productionPerTurn: number = 1; // Base production
	productionModifiers: Array<{ source: string; value: number }> = []; // % modifiers

	// Built items
	builtBuildings: string[] = []; // IDs of buildings already built
	builtWonders: string[] = []; // IDs of wonders built (world wonders)

	// Overflow
	overflowProduction: number = 0; // Excess production from last completion

	constructor() {}

	/**
	 * Add item to production queue
	 */
	addToQueue(
		type: ProductionItemType,
		itemId: string,
		itemName: string,
		productionCost: number
	): void {
		const turnsRemaining = Math.ceil(
			productionCost / Math.max(1, this.productionPerTurn)
		);

		const item: ProductionQueueItem = {
			type,
			itemId,
			itemName,
			productionCost,
			productionProgress: 0,
			turnsRemaining
		};

		this.productionQueue.push(item);

		// If nothing is being produced, start this item
		if (!this.currentProduction) {
			this.currentProduction = item;
		}
	}

	/**
	 * Remove item from queue
	 */
	removeFromQueue(index: number): void {
		if (index < 0 || index >= this.productionQueue.length) {
			return;
		}

		const item = this.productionQueue[index];

		// If removing current production, move to next
		if (this.currentProduction === item) {
			this.productionQueue.shift();
			this.currentProduction = this.productionQueue.length > 0
				? this.productionQueue[0]
				: undefined;
		} else {
			this.productionQueue.splice(index, 1);
		}
	}

	/**
	 * Set what to build now (moves to front of queue)
	 */
	setCurrentProduction(
		type: ProductionItemType,
		itemId: string,
		itemName: string,
		productionCost: number
	): void {
		// Remove from queue if already in it
		const existingIndex = this.productionQueue.findIndex(
			item => item.itemId === itemId && item.type === type
		);

		if (existingIndex >= 0) {
			this.productionQueue.splice(existingIndex, 1);
		}

		// Add to front of queue
		const item: ProductionQueueItem = {
			type,
			itemId,
			itemName,
			productionCost,
			productionProgress: 0,
			turnsRemaining: Math.ceil(productionCost / Math.max(1, this.productionPerTurn))
		};

		this.productionQueue.unshift(item);
		this.currentProduction = item;
	}

	/**
	 * Calculate total production modifiers
	 */
	getTotalProductionModifier(): number {
		return this.productionModifiers.reduce((sum, mod) => sum + mod.value, 0);
	}

	/**
	 * Get effective production per turn (with modifiers)
	 */
	getEffectiveProduction(baseProduction: number): number {
		let production = baseProduction;

		// Apply percentage modifiers
		const totalModifier = this.getTotalProductionModifier();
		production *= (1 + totalModifier / 100);

		return Math.floor(production);
	}

	/**
	 * Add a production modifier (e.g., from buildings, policies)
	 */
	addProductionModifier(source: string, value: number): void {
		// Remove existing modifier from same source
		this.productionModifiers = this.productionModifiers.filter(
			m => m.source !== source
		);

		if (value !== 0) {
			this.productionModifiers.push({ source, value });
		}
	}

	/**
	 * Process one turn of production
	 */
	processTurn(baseProduction: number): ProductionCompletionResult {
		if (!this.currentProduction) {
			// No production selected, accumulate overflow
			this.overflowProduction += baseProduction;

			return {
				completed: false,
				overflowProduction: this.overflowProduction
			};
		}

		// Calculate effective production with modifiers
		let production = this.getEffectiveProduction(baseProduction);

		// Add overflow from previous completion
		if (this.overflowProduction > 0) {
			production += this.overflowProduction;
			this.overflowProduction = 0;
		}

		// Add to current production progress
		this.currentProduction.productionProgress += production;

		// Update turns remaining
		const remaining =
			this.currentProduction.productionCost - this.currentProduction.productionProgress;
		this.currentProduction.turnsRemaining = Math.ceil(
			remaining / Math.max(1, this.getEffectiveProduction(baseProduction))
		);

		// Check if completed
		if (this.currentProduction.productionProgress >= this.currentProduction.productionCost) {
			const completedItem = { ...this.currentProduction };

			// Calculate overflow (excess production)
			const overflow =
				this.currentProduction.productionProgress - this.currentProduction.productionCost;
			this.overflowProduction = Math.floor(overflow * 0.5); // 50% overflow (Civ 5 rule)

			// Mark as built
			if (completedItem.type === ProductionItemType.Building) {
				if (!this.builtBuildings.includes(completedItem.itemId)) {
					this.builtBuildings.push(completedItem.itemId);
				}
			} else if (completedItem.type === ProductionItemType.Wonder) {
				if (!this.builtWonders.includes(completedItem.itemId)) {
					this.builtWonders.push(completedItem.itemId);
				}
			}

			// Remove from queue and start next
			this.productionQueue.shift();
			this.currentProduction = this.productionQueue.length > 0
				? this.productionQueue[0]
				: undefined;

			return {
				completed: true,
				item: completedItem,
				overflowProduction: this.overflowProduction
			};
		}

		return {
			completed: false,
			overflowProduction: 0
		};
	}

	/**
	 * Check if a building has been built
	 */
	hasBuilding(buildingId: string): boolean {
		return this.builtBuildings.includes(buildingId);
	}

	/**
	 * Check if a wonder has been built
	 */
	hasWonder(wonderId: string): boolean {
		return this.builtWonders.includes(wonderId);
	}

	/**
	 * Check if currently producing an item
	 */
	isProducing(type: ProductionItemType, itemId: string): boolean {
		return this.currentProduction?.type === type && this.currentProduction?.itemId === itemId;
	}

	/**
	 * Get turns until completion of current production
	 */
	getTurnsUntilCompletion(baseProduction: number): number {
		if (!this.currentProduction) {
			return Infinity;
		}

		const effectiveProduction = this.getEffectiveProduction(baseProduction);
		if (effectiveProduction <= 0) {
			return Infinity;
		}

		const remaining =
			this.currentProduction.productionCost - this.currentProduction.productionProgress;
		return Math.ceil(remaining / effectiveProduction);
	}

	/**
	 * Rush production with gold (buy building/unit)
	 */
	rushProduction(goldCost: number, payGold: () => boolean): boolean {
		if (!this.currentProduction) {
			return false;
		}

		if (!payGold()) {
			return false; // Not enough gold
		}

		// Complete immediately
		const completedItem = { ...this.currentProduction };

		// Mark as built
		if (completedItem.type === ProductionItemType.Building) {
			if (!this.builtBuildings.includes(completedItem.itemId)) {
				this.builtBuildings.push(completedItem.itemId);
			}
		} else if (completedItem.type === ProductionItemType.Wonder) {
			if (!this.builtWonders.includes(completedItem.itemId)) {
				this.builtWonders.push(completedItem.itemId);
			}
		}

		// Remove from queue and start next
		this.productionQueue.shift();
		this.currentProduction = this.productionQueue.length > 0
			? this.productionQueue[0]
			: undefined;

		return true;
	}

	/**
	 * Clear production queue
	 */
	clearQueue(): void {
		this.productionQueue = [];
		this.currentProduction = undefined;
	}

	/**
	 * Get summary for display
	 */
	getSummary(baseProduction: number): string {
		if (!this.currentProduction) {
			return 'Production: None';
		}

		const turns = this.getTurnsUntilCompletion(baseProduction);
		const progress = this.currentProduction.productionProgress;
		const cost = this.currentProduction.productionCost;
		const percentage = Math.floor((progress / cost) * 100);

		return `Producing: ${this.currentProduction.itemName} (${percentage}%, ${turns} turns)`;
	}

	/**
	 * Clone this manager (for state snapshots)
	 */
	clone(): CityProductionManager {
		const cloned = new CityProductionManager();
		cloned.productionQueue = this.productionQueue.map(item => ({ ...item }));
		cloned.currentProduction = this.currentProduction
			? { ...this.currentProduction }
			: undefined;
		cloned.productionPerTurn = this.productionPerTurn;
		cloned.productionModifiers = [...this.productionModifiers];
		cloned.builtBuildings = [...this.builtBuildings];
		cloned.builtWonders = [...this.builtWonders];
		cloned.overflowProduction = this.overflowProduction;
		return cloned;
	}

	/**
	 * Serialize to JSON
	 */
	toJSON(): any {
		return {
			productionQueue: this.productionQueue,
			currentProduction: this.currentProduction,
			productionPerTurn: this.productionPerTurn,
			productionModifiers: this.productionModifiers,
			builtBuildings: this.builtBuildings,
			builtWonders: this.builtWonders,
			overflowProduction: this.overflowProduction
		};
	}

	/**
	 * Restore from JSON
	 */
	static fromJSON(data: any): CityProductionManager {
		const manager = new CityProductionManager();
		manager.productionQueue = data.productionQueue ?? [];
		manager.currentProduction = data.currentProduction;
		manager.productionPerTurn = data.productionPerTurn ?? 1;
		manager.productionModifiers = data.productionModifiers ?? [];
		manager.builtBuildings = data.builtBuildings ?? [];
		manager.builtWonders = data.builtWonders ?? [];
		manager.overflowProduction = data.overflowProduction ?? 0;
		return manager;
	}
}
