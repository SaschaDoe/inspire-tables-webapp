/**
 * PolicyManager - Handles social policy trees and culture accumulation
 *
 * Inspired by Unciv's PolicyManager pattern.
 *
 * Responsibilities:
 * - Track unlocked policies
 * - Manage culture accumulation toward next policy
 * - Calculate policy costs
 * - Handle policy tree completion bonuses
 * - Track adopted policy trees
 */

export interface PolicyAdoptionResult {
	adopted: boolean;
	policyId?: string;
	policyName?: string;
	treeCompleted?: boolean;
	treeId?: string;
}

export class PolicyManager {
	// Unlocked policies
	unlockedPolicies: string[] = []; // IDs of policies already unlocked
	adoptedPolicyTrees: string[] = []; // IDs of policy trees that have been started
	completedPolicyTrees: string[] = []; // IDs of policy trees fully completed

	// Culture accumulation
	cultureStored: number = 0;
	cultureNeededForPolicy: number = 25; // Cost of next policy
	totalCultureGenerated: number = 0;

	// Culture state
	culturePerTurn: number = 0;
	cultureModifiers: Array<{ source: string; value: number }> = []; // % modifiers

	// Policy cost modifiers
	policyCostModifiers: Array<{ source: string; value: number }> = []; // % cost modifiers

	// Free policies
	freePoliciesAvailable: number = 0;

	// Tracking
	policiesAdopted: number = 0; // Number of policies unlocked

	constructor() {}

	/**
	 * Check if a policy has been unlocked
	 */
	hasPolicy(policyId: string): boolean {
		return this.unlockedPolicies.includes(policyId);
	}

	/**
	 * Check if a policy tree has been adopted (started)
	 */
	hasAdoptedTree(treeId: string): boolean {
		return this.adoptedPolicyTrees.includes(treeId);
	}

	/**
	 * Check if a policy tree has been completed
	 */
	hasCompletedTree(treeId: string): boolean {
		return this.completedPolicyTrees.includes(treeId);
	}

	/**
	 * Calculate culture cost for next policy (Civ 5 formula)
	 * Formula: 25 + (policiesAdopted * policiesAdopted) * 2.5
	 */
	calculatePolicyCost(): void {
		const base = 25;
		const scalingCost = Math.pow(this.policiesAdopted, 2) * 2.5;

		let cost = base + scalingCost;

		// Apply cost modifiers
		const totalModifier = this.getTotalPolicyCostModifier();
		cost *= (1 + totalModifier / 100);

		this.cultureNeededForPolicy = Math.ceil(cost);
	}

	/**
	 * Get total policy cost modifier
	 */
	getTotalPolicyCostModifier(): number {
		return this.policyCostModifiers.reduce((sum, mod) => sum + mod.value, 0);
	}

	/**
	 * Add a policy cost modifier
	 */
	addPolicyCostModifier(source: string, value: number): void {
		// Remove existing modifier from same source
		this.policyCostModifiers = this.policyCostModifiers.filter(
			m => m.source !== source
		);

		if (value !== 0) {
			this.policyCostModifiers.push({ source, value });
		}

		// Recalculate cost
		this.calculatePolicyCost();
	}

	/**
	 * Get effective culture per turn (with modifiers)
	 */
	getEffectiveCulture(baseCulture: number): number {
		let culture = baseCulture;

		// Apply percentage modifiers
		const totalModifier = this.getTotalCultureModifier();
		culture *= (1 + totalModifier / 100);

		return Math.floor(culture);
	}

	/**
	 * Get total culture modifier
	 */
	getTotalCultureModifier(): number {
		return this.cultureModifiers.reduce((sum, mod) => sum + mod.value, 0);
	}

	/**
	 * Add a culture modifier
	 */
	addCultureModifier(source: string, value: number): void {
		// Remove existing modifier from same source
		this.cultureModifiers = this.cultureModifiers.filter(m => m.source !== source);

		if (value !== 0) {
			this.cultureModifiers.push({ source, value });
		}
	}

	/**
	 * Process one turn of culture accumulation
	 * Note: Policy adoption is manual - culture just accumulates
	 */
	processTurn(baseCulture: number): void {
		const culture = this.getEffectiveCulture(baseCulture);
		this.cultureStored += culture;
		this.totalCultureGenerated += culture;
		this.culturePerTurn = culture;
	}

	/**
	 * Adopt a policy (spend culture)
	 */
	adoptPolicy(
		policyId: string,
		policyTreeId: string,
		prerequisites: string[] = []
	): PolicyAdoptionResult {
		// Already have it
		if (this.hasPolicy(policyId)) {
			return { adopted: false };
		}

		// Check prerequisites
		for (const prereq of prerequisites) {
			if (!this.hasPolicy(prereq)) {
				return { adopted: false }; // Prerequisites not met
			}
		}

		// Check if we have enough culture or a free policy
		if (this.freePoliciesAvailable > 0) {
			// Use free policy
			this.freePoliciesAvailable--;
		} else {
			// Check if enough culture
			if (this.cultureStored < this.cultureNeededForPolicy) {
				return { adopted: false }; // Not enough culture
			}

			// Spend culture
			this.cultureStored -= this.cultureNeededForPolicy;
		}

		// Adopt the policy
		if (!this.unlockedPolicies.includes(policyId)) {
			this.unlockedPolicies.push(policyId);
		}

		// Track policy tree adoption
		if (!this.adoptedPolicyTrees.includes(policyTreeId)) {
			this.adoptedPolicyTrees.push(policyTreeId);
		}

		// Increment policies adopted
		this.policiesAdopted++;

		// Recalculate cost for next policy
		this.calculatePolicyCost();

		return {
			adopted: true,
			policyId,
			policyName: policyId // Would be looked up from game data
		};
	}

	/**
	 * Complete a policy tree (all policies in tree unlocked)
	 */
	completeTree(treeId: string): boolean {
		if (this.hasCompletedTree(treeId)) {
			return false; // Already completed
		}

		if (!this.completedPolicyTrees.includes(treeId)) {
			this.completedPolicyTrees.push(treeId);
		}

		return true;
	}

	/**
	 * Grant a free policy
	 */
	grantFreePolicy(): void {
		this.freePoliciesAvailable++;
	}

	/**
	 * Check if can afford a policy
	 */
	canAffordPolicy(): boolean {
		return this.cultureStored >= this.cultureNeededForPolicy || this.freePoliciesAvailable > 0;
	}

	/**
	 * Calculate turns until can afford next policy
	 */
	getTurnsUntilNextPolicy(baseCulture: number): number {
		if (this.freePoliciesAvailable > 0) {
			return 0; // Free policy available
		}

		const effectiveCulture = this.getEffectiveCulture(baseCulture);
		if (effectiveCulture <= 0) {
			return Infinity;
		}

		const cultureNeeded = this.cultureNeededForPolicy - this.cultureStored;
		return Math.ceil(cultureNeeded / effectiveCulture);
	}

	/**
	 * Get culture progress percentage
	 */
	getCultureProgressPercentage(): number {
		return Math.floor((this.cultureStored / this.cultureNeededForPolicy) * 100);
	}

	/**
	 * Get summary for display
	 */
	getSummary(baseCulture: number): string {
		const turns = this.getTurnsUntilNextPolicy(baseCulture);
		const percentage = this.getCultureProgressPercentage();

		if (this.freePoliciesAvailable > 0) {
			return `Policies: ${this.unlockedPolicies.length} (Free policy available!)`;
		} else if (turns < Infinity) {
			return `Policies: ${this.unlockedPolicies.length} (${percentage}%, ${turns} turns to next)`;
		} else {
			return `Policies: ${this.unlockedPolicies.length} (No culture generation)`;
		}
	}

	/**
	 * Get policies from a specific tree
	 */
	getPoliciesInTree(treeId: string, allPolicies: Array<{ id: string; treeId: string }>): string[] {
		return this.unlockedPolicies.filter(policyId => {
			const policy = allPolicies.find(p => p.id === policyId);
			return policy?.treeId === treeId;
		});
	}

	/**
	 * Clone this manager (for state snapshots)
	 */
	clone(): PolicyManager {
		const cloned = new PolicyManager();
		cloned.unlockedPolicies = [...this.unlockedPolicies];
		cloned.adoptedPolicyTrees = [...this.adoptedPolicyTrees];
		cloned.completedPolicyTrees = [...this.completedPolicyTrees];
		cloned.cultureStored = this.cultureStored;
		cloned.cultureNeededForPolicy = this.cultureNeededForPolicy;
		cloned.totalCultureGenerated = this.totalCultureGenerated;
		cloned.culturePerTurn = this.culturePerTurn;
		cloned.cultureModifiers = [...this.cultureModifiers];
		cloned.policyCostModifiers = [...this.policyCostModifiers];
		cloned.freePoliciesAvailable = this.freePoliciesAvailable;
		cloned.policiesAdopted = this.policiesAdopted;
		return cloned;
	}

	/**
	 * Serialize to JSON
	 */
	toJSON(): any {
		return {
			unlockedPolicies: this.unlockedPolicies,
			adoptedPolicyTrees: this.adoptedPolicyTrees,
			completedPolicyTrees: this.completedPolicyTrees,
			cultureStored: this.cultureStored,
			cultureNeededForPolicy: this.cultureNeededForPolicy,
			totalCultureGenerated: this.totalCultureGenerated,
			culturePerTurn: this.culturePerTurn,
			cultureModifiers: this.cultureModifiers,
			policyCostModifiers: this.policyCostModifiers,
			freePoliciesAvailable: this.freePoliciesAvailable,
			policiesAdopted: this.policiesAdopted
		};
	}

	/**
	 * Restore from JSON
	 */
	static fromJSON(data: any): PolicyManager {
		const manager = new PolicyManager();
		manager.unlockedPolicies = data.unlockedPolicies ?? [];
		manager.adoptedPolicyTrees = data.adoptedPolicyTrees ?? [];
		manager.completedPolicyTrees = data.completedPolicyTrees ?? [];
		manager.cultureStored = data.cultureStored ?? 0;
		manager.cultureNeededForPolicy = data.cultureNeededForPolicy ?? 25;
		manager.totalCultureGenerated = data.totalCultureGenerated ?? 0;
		manager.culturePerTurn = data.culturePerTurn ?? 0;
		manager.cultureModifiers = data.cultureModifiers ?? [];
		manager.policyCostModifiers = data.policyCostModifiers ?? [];
		manager.freePoliciesAvailable = data.freePoliciesAvailable ?? 0;
		manager.policiesAdopted = data.policiesAdopted ?? 0;
		return manager;
	}
}
