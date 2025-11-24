/**
 * TechManager - Handles technology research and tech tree progression
 *
 * Inspired by Unciv's TechManager pattern.
 *
 * Responsibilities:
 * - Track researched technologies
 * - Manage current research progress
 * - Calculate research costs
 * - Handle free techs and tech stealing
 * - Track tech era progression
 */

import { Era } from '$lib/entities/location/nation';

export interface TechResearchResult {
	completed: boolean;
	techId?: string;
	techName?: string;
	scienceOverflow: number;
}

export class TechManager {
	// Researched techs
	researchedTechs: string[] = []; // IDs of techs already researched
	currentResearch?: string; // ID of tech currently being researched
	researchProgress: number = 0; // Science accumulated toward current tech

	// Era tracking
	currentEra: Era = Era.Prehistoric;

	// Science state
	sciencePerTurn: number = 0; // Current science output
	scienceModifiers: Array<{ source: string; value: number }> = []; // % modifiers

	// Free techs (from policies, events, ruins)
	freeTechsAvailable: number = 0;

	// Cost modifiers
	researchCostModifiers: Array<{ source: string; value: number }> = []; // % cost modifiers

	constructor() {
		// Start with no techs (prehistoric)
	}

	/**
	 * Check if a technology has been researched
	 */
	hasTech(techId: string): boolean {
		return this.researchedTechs.includes(techId);
	}

	/**
	 * Start researching a technology
	 */
	startResearching(techId: string, techCost: number): void {
		// If already researched, ignore
		if (this.hasTech(techId)) {
			return;
		}

		// If already researching this tech, continue
		if (this.currentResearch === techId) {
			return;
		}

		// Switch research (lose some progress)
		this.currentResearch = techId;
		// Keep some progress when switching (optional - can be configurable)
	}

	/**
	 * Get research cost for a technology (with modifiers)
	 */
	getResearchCost(baseCost: number): number {
		let cost = baseCost;

		// Apply cost modifiers
		const totalModifier = this.getTotalResearchCostModifier();
		cost *= (1 + totalModifier / 100);

		return Math.ceil(cost);
	}

	/**
	 * Get total research cost modifier
	 */
	getTotalResearchCostModifier(): number {
		return this.researchCostModifiers.reduce((sum, mod) => sum + mod.value, 0);
	}

	/**
	 * Add a research cost modifier
	 */
	addResearchCostModifier(source: string, value: number): void {
		// Remove existing modifier from same source
		this.researchCostModifiers = this.researchCostModifiers.filter(
			m => m.source !== source
		);

		if (value !== 0) {
			this.researchCostModifiers.push({ source, value });
		}
	}

	/**
	 * Get effective science per turn (with modifiers)
	 */
	getEffectiveScience(baseScience: number): number {
		let science = baseScience;

		// Apply percentage modifiers
		const totalModifier = this.getTotalScienceModifier();
		science *= (1 + totalModifier / 100);

		return Math.floor(science);
	}

	/**
	 * Get total science modifier
	 */
	getTotalScienceModifier(): number {
		return this.scienceModifiers.reduce((sum, mod) => sum + mod.value, 0);
	}

	/**
	 * Add a science modifier
	 */
	addScienceModifier(source: string, value: number): void {
		// Remove existing modifier from same source
		this.scienceModifiers = this.scienceModifiers.filter(m => m.source !== source);

		if (value !== 0) {
			this.scienceModifiers.push({ source, value });
		}
	}

	/**
	 * Process one turn of research
	 */
	processTurn(baseScience: number, techCost: number): TechResearchResult {
		if (!this.currentResearch) {
			// No research selected, return with overflow
			return {
				completed: false,
				scienceOverflow: 0
			};
		}

		// Calculate effective science with modifiers
		const science = this.getEffectiveScience(baseScience);

		// Add to research progress
		this.researchProgress += science;

		// Check if technology is completed
		const adjustedCost = this.getResearchCost(techCost);

		if (this.researchProgress >= adjustedCost) {
			const completedTech = this.currentResearch;

			// Calculate overflow science
			const overflow = this.researchProgress - adjustedCost;

			// Mark as researched
			if (!this.researchedTechs.includes(completedTech)) {
				this.researchedTechs.push(completedTech);
			}

			// Clear current research
			this.currentResearch = undefined;
			this.researchProgress = 0;

			return {
				completed: true,
				techId: completedTech,
				scienceOverflow: overflow
			};
		}

		return {
			completed: false,
			scienceOverflow: 0
		};
	}

	/**
	 * Get a free technology (from ruins, policies, etc.)
	 */
	acquireFreeTech(techId: string): boolean {
		if (this.hasTech(techId)) {
			return false; // Already have it
		}

		if (!this.researchedTechs.includes(techId)) {
			this.researchedTechs.push(techId);
		}

		// If we were researching this tech, clear it
		if (this.currentResearch === techId) {
			this.currentResearch = undefined;
			this.researchProgress = 0;
		}

		return true;
	}

	/**
	 * Grant a free tech token (choose any tech)
	 */
	grantFreeTech(): void {
		this.freeTechsAvailable++;
	}

	/**
	 * Use a free tech token to acquire a technology
	 */
	useFreeTech(techId: string): boolean {
		if (this.freeTechsAvailable <= 0) {
			return false;
		}

		if (this.hasTech(techId)) {
			return false;
		}

		this.freeTechsAvailable--;
		return this.acquireFreeTech(techId);
	}

	/**
	 * Calculate turns until current research completes
	 */
	getTurnsUntilCompletion(baseScience: number, techCost: number): number {
		if (!this.currentResearch) {
			return Infinity;
		}

		const effectiveScience = this.getEffectiveScience(baseScience);
		if (effectiveScience <= 0) {
			return Infinity;
		}

		const adjustedCost = this.getResearchCost(techCost);
		const remaining = adjustedCost - this.researchProgress;

		return Math.ceil(remaining / effectiveScience);
	}

	/**
	 * Update era based on researched techs
	 * This would be called when a tech is researched
	 */
	updateEra(eraForTech: Era): void {
		// Only advance, never go backwards
		const eraOrder = [
			Era.Prehistoric,
			Era.Ancient,
			Era.Classical,
			Era.Medieval,
			Era.Renaissance,
			Era.Industrial,
			Era.Modern,
			Era.Atomic,
			Era.Information
		];

		const currentIndex = eraOrder.indexOf(this.currentEra);
		const newIndex = eraOrder.indexOf(eraForTech);

		if (newIndex > currentIndex) {
			this.currentEra = eraForTech;
		}
	}

	/**
	 * Check if prerequisites are met for a tech
	 */
	canResearch(techId: string, prerequisites: string[]): boolean {
		// Already have it
		if (this.hasTech(techId)) {
			return false;
		}

		// Check all prerequisites are met
		for (const prereq of prerequisites) {
			if (!this.hasTech(prereq)) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Get all techs that can currently be researched
	 */
	getAvailableTechs(allTechs: Array<{ id: string; prerequisites: string[] }>): string[] {
		return allTechs
			.filter(tech => this.canResearch(tech.id, tech.prerequisites))
			.map(tech => tech.id);
	}

	/**
	 * Get research progress percentage
	 */
	getResearchProgressPercentage(techCost: number): number {
		if (!this.currentResearch) {
			return 0;
		}

		const adjustedCost = this.getResearchCost(techCost);
		return Math.floor((this.researchProgress / adjustedCost) * 100);
	}

	/**
	 * Get summary for display
	 */
	getSummary(baseScience: number, techCost: number, techName?: string): string {
		if (!this.currentResearch) {
			return `Research: None (${this.researchedTechs.length} techs discovered)`;
		}

		const turns = this.getTurnsUntilCompletion(baseScience, techCost);
		const percentage = this.getResearchProgressPercentage(techCost);

		const name = techName || this.currentResearch;

		return `Researching: ${name} (${percentage}%, ${turns} turns)`;
	}

	/**
	 * Clone this manager (for state snapshots)
	 */
	clone(): TechManager {
		const cloned = new TechManager();
		cloned.researchedTechs = [...this.researchedTechs];
		cloned.currentResearch = this.currentResearch;
		cloned.researchProgress = this.researchProgress;
		cloned.currentEra = this.currentEra;
		cloned.sciencePerTurn = this.sciencePerTurn;
		cloned.scienceModifiers = [...this.scienceModifiers];
		cloned.freeTechsAvailable = this.freeTechsAvailable;
		cloned.researchCostModifiers = [...this.researchCostModifiers];
		return cloned;
	}

	/**
	 * Serialize to JSON
	 */
	toJSON(): any {
		return {
			researchedTechs: this.researchedTechs,
			currentResearch: this.currentResearch,
			researchProgress: this.researchProgress,
			currentEra: this.currentEra,
			sciencePerTurn: this.sciencePerTurn,
			scienceModifiers: this.scienceModifiers,
			freeTechsAvailable: this.freeTechsAvailable,
			researchCostModifiers: this.researchCostModifiers
		};
	}

	/**
	 * Restore from JSON
	 */
	static fromJSON(data: any): TechManager {
		const manager = new TechManager();
		manager.researchedTechs = data.researchedTechs ?? [];
		manager.currentResearch = data.currentResearch;
		manager.researchProgress = data.researchProgress ?? 0;
		manager.currentEra = data.currentEra ?? Era.Prehistoric;
		manager.sciencePerTurn = data.sciencePerTurn ?? 0;
		manager.scienceModifiers = data.scienceModifiers ?? [];
		manager.freeTechsAvailable = data.freeTechsAvailable ?? 0;
		manager.researchCostModifiers = data.researchCostModifiers ?? [];
		return manager;
	}
}
