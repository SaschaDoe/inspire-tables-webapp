/**
 * DiplomacyManager - Handles diplomatic relationship between two nations
 *
 * Inspired by Unciv's DiplomacyManager pattern.
 *
 * Responsibilities:
 * - Track diplomatic state (peace, war, alliance, etc.)
 * - Manage opinion modifiers
 * - Handle treaties and agreements
 * - Track diplomatic history
 * - Calculate relationship status
 */

import { DiplomacyState } from '$lib/entities/location/nation';

export interface OpinionModifier {
	source: string; // "Declared war on us", "Trade agreement", etc.
	value: number; // -100 to +100
	turnAdded: number;
	decayPerTurn?: number; // How much the modifier fades each turn (optional)
}

export interface DiplomaticAction {
	action: string; // 'war_declared', 'peace_treaty', 'alliance_formed', etc.
	year: number;
	description: string;
	opinionChange: number;
}

export interface TreatyProposal {
	type: 'peace' | 'alliance' | 'trade' | 'open_borders' | 'research';
	proposedByThem: boolean;
	turnProposed: number;
	terms?: Record<string, any>; // Trade terms, gold amounts, etc.
}

export class DiplomacyManager {
	// Target nation
	targetNationId: string = '';
	targetNationName: string = '';

	// Current state
	diplomaticState: DiplomacyState = DiplomacyState.Neutral;
	opinion: number = 0; // -100 to +100 (aggregate of all modifiers)

	// Treaties
	atWarSince?: number; // Year war started
	peaceTreatySince?: number; // Year peace treaty signed
	allianceSince?: number; // Year alliance formed
	tradeAgreementSince?: number; // Year trade agreement started
	openBordersSince?: number; // Year open borders agreed
	researchAgreementSince?: number; // Year research agreement started

	// Opinion tracking
	opinionModifiers: OpinionModifier[] = [];

	// Diplomatic history
	diplomaticHistory: DiplomaticAction[] = [];

	// Pending proposals
	pendingProposals: TreatyProposal[] = [];

	// Grievances
	grievances: string[] = []; // Active grievances

	// Interaction tracking
	lastInteractionTurn: number = 0;
	turnsAtWar: number = 0;
	turnsAtPeace: number = 0;

	// Denouncement
	isDenounced: boolean = false;
	denouncedSince?: number;

	constructor(targetNationId: string, targetNationName: string) {
		this.targetNationId = targetNationId;
		this.targetNationName = targetNationName;
	}

	/**
	 * Set diplomatic state and update related properties
	 */
	setDiplomaticState(state: DiplomacyState, currentTurn: number, recordHistory: boolean = true): void {
		const previousState = this.diplomaticState;
		this.diplomaticState = state;
		this.lastInteractionTurn = currentTurn;

		// Update treaty timestamps
		switch (state) {
			case DiplomacyState.War:
				if (previousState !== DiplomacyState.War) {
					this.atWarSince = currentTurn;
					this.peaceTreatySince = undefined;
					this.turnsAtWar = 0;

					if (recordHistory) {
						this.addDiplomaticAction('war_declared', currentTurn, 'War declared!', -50);
						this.addOpinionModifier('Declared war', -50, currentTurn);
					}
				}
				break;

			case DiplomacyState.Peace:
				if (previousState === DiplomacyState.War) {
					this.peaceTreatySince = currentTurn;
					this.atWarSince = undefined;
					this.turnsAtPeace = 0;

					if (recordHistory) {
						this.addDiplomaticAction('peace_treaty', currentTurn, 'Peace treaty signed', +20);
						this.addOpinionModifier('Peace treaty', +20, currentTurn, 0.5); // Decays 0.5/turn
					}
				}
				break;

			case DiplomacyState.Alliance:
				this.allianceSince = currentTurn;
				this.atWarSince = undefined;

				if (recordHistory) {
					this.addDiplomaticAction('alliance_formed', currentTurn, 'Alliance formed', +30);
					this.addOpinionModifier('Alliance', +30, currentTurn);
				}
				break;

			case DiplomacyState.Trade:
				this.tradeAgreementSince = currentTurn;

				if (recordHistory) {
					this.addDiplomaticAction('trade_agreement', currentTurn, 'Trade agreement signed', +10);
					this.addOpinionModifier('Trade agreement', +10, currentTurn);
				}
				break;
		}
	}

	/**
	 * Add an opinion modifier
	 */
	addOpinionModifier(source: string, value: number, turnAdded: number, decayPerTurn?: number): void {
		// Remove existing modifier from same source
		this.opinionModifiers = this.opinionModifiers.filter(m => m.source !== source);

		if (value !== 0) {
			this.opinionModifiers.push({
				source,
				value,
				turnAdded,
				decayPerTurn
			});
		}

		this.calculateOpinion();
	}

	/**
	 * Calculate total opinion from all modifiers
	 */
	calculateOpinion(): void {
		let totalOpinion = 0;

		for (const modifier of this.opinionModifiers) {
			totalOpinion += modifier.value;
		}

		// Clamp to -100 to +100
		this.opinion = Math.max(-100, Math.min(100, totalOpinion));
	}

	/**
	 * Process opinion decay each turn
	 */
	processTurnDecay(currentTurn: number): void {
		let decayed = false;

		for (const modifier of this.opinionModifiers) {
			if (modifier.decayPerTurn && modifier.decayPerTurn > 0) {
				// Decay toward zero
				if (modifier.value > 0) {
					modifier.value = Math.max(0, modifier.value - modifier.decayPerTurn);
				} else if (modifier.value < 0) {
					modifier.value = Math.min(0, modifier.value + modifier.decayPerTurn);
				}

				decayed = true;
			}
		}

		// Remove modifiers that have decayed to zero
		this.opinionModifiers = this.opinionModifiers.filter(m => m.value !== 0);

		if (decayed) {
			this.calculateOpinion();
		}

		// Track war/peace duration
		if (this.diplomaticState === DiplomacyState.War) {
			this.turnsAtWar++;
		} else if (this.diplomaticState === DiplomacyState.Peace) {
			this.turnsAtPeace++;
		}
	}

	/**
	 * Add a diplomatic action to history
	 */
	addDiplomaticAction(action: string, year: number, description: string, opinionChange: number): void {
		this.diplomaticHistory.push({
			action,
			year,
			description,
			opinionChange
		});
	}

	/**
	 * Add a grievance
	 */
	addGrievance(grievance: string): void {
		if (!this.grievances.includes(grievance)) {
			this.grievances.push(grievance);
		}

		// Add opinion modifier for grievance
		this.addOpinionModifier(`Grievance: ${grievance}`, -10, this.lastInteractionTurn, 0.2);
	}

	/**
	 * Remove a grievance
	 */
	removeGrievance(grievance: string): void {
		this.grievances = this.grievances.filter(g => g !== grievance);
	}

	/**
	 * Propose a treaty
	 */
	proposeTreaty(type: TreatyProposal['type'], proposedByThem: boolean, currentTurn: number, terms?: Record<string, any>): void {
		this.pendingProposals.push({
			type,
			proposedByThem,
			turnProposed: currentTurn,
			terms
		});
	}

	/**
	 * Accept a treaty proposal
	 */
	acceptTreaty(proposalIndex: number, currentTurn: number): boolean {
		if (proposalIndex < 0 || proposalIndex >= this.pendingProposals.length) {
			return false;
		}

		const proposal = this.pendingProposals[proposalIndex];

		// Update diplomatic state based on treaty type
		switch (proposal.type) {
			case 'peace':
				this.setDiplomaticState(DiplomacyState.Peace, currentTurn);
				break;
			case 'alliance':
				this.setDiplomaticState(DiplomacyState.Alliance, currentTurn);
				break;
			case 'trade':
				this.tradeAgreementSince = currentTurn;
				this.addOpinionModifier('Trade agreement', +10, currentTurn);
				break;
			case 'open_borders':
				this.openBordersSince = currentTurn;
				this.addOpinionModifier('Open borders', +5, currentTurn);
				break;
			case 'research':
				this.researchAgreementSince = currentTurn;
				this.addOpinionModifier('Research agreement', +10, currentTurn);
				break;
		}

		// Remove proposal
		this.pendingProposals.splice(proposalIndex, 1);

		return true;
	}

	/**
	 * Reject a treaty proposal
	 */
	rejectTreaty(proposalIndex: number): boolean {
		if (proposalIndex < 0 || proposalIndex >= this.pendingProposals.length) {
			return false;
		}

		this.pendingProposals.splice(proposalIndex, 1);
		return true;
	}

	/**
	 * Denounce the target nation
	 */
	denounce(currentTurn: number): void {
		this.isDenounced = true;
		this.denouncedSince = currentTurn;
		this.addOpinionModifier('Denounced', -30, currentTurn, 0.5);
		this.addDiplomaticAction('denouncement', currentTurn, 'Denounced!', -30);
	}

	/**
	 * Cancel denouncement
	 */
	cancelDenouncement(): void {
		this.isDenounced = false;
		this.denouncedSince = undefined;
	}

	/**
	 * Get relationship description based on opinion
	 */
	getRelationshipDescription(): string {
		if (this.diplomaticState === DiplomacyState.War) {
			return 'At War';
		} else if (this.diplomaticState === DiplomacyState.Alliance) {
			return 'Allied';
		}

		if (this.opinion >= 75) {
			return 'Friendly';
		} else if (this.opinion >= 50) {
			return 'Favorable';
		} else if (this.opinion >= 25) {
			return 'Cordial';
		} else if (this.opinion >= 0) {
			return 'Neutral';
		} else if (this.opinion >= -25) {
			return 'Unfavorable';
		} else if (this.opinion >= -50) {
			return 'Hostile';
		} else {
			return 'Hateful';
		}
	}

	/**
	 * Get summary for display
	 */
	getSummary(): string {
		const relationship = this.getRelationshipDescription();
		const stateStr = this.diplomaticState !== DiplomacyState.Neutral
			? `${this.diplomaticState}`
			: '';

		return `${this.targetNationName}: ${relationship} (${this.opinion}) ${stateStr}`.trim();
	}

	/**
	 * Clone this manager (for state snapshots)
	 */
	clone(): DiplomacyManager {
		const cloned = new DiplomacyManager(this.targetNationId, this.targetNationName);
		cloned.diplomaticState = this.diplomaticState;
		cloned.opinion = this.opinion;
		cloned.atWarSince = this.atWarSince;
		cloned.peaceTreatySince = this.peaceTreatySince;
		cloned.allianceSince = this.allianceSince;
		cloned.tradeAgreementSince = this.tradeAgreementSince;
		cloned.openBordersSince = this.openBordersSince;
		cloned.researchAgreementSince = this.researchAgreementSince;
		cloned.opinionModifiers = this.opinionModifiers.map(m => ({ ...m }));
		cloned.diplomaticHistory = this.diplomaticHistory.map(h => ({ ...h }));
		cloned.pendingProposals = this.pendingProposals.map(p => ({ ...p }));
		cloned.grievances = [...this.grievances];
		cloned.lastInteractionTurn = this.lastInteractionTurn;
		cloned.turnsAtWar = this.turnsAtWar;
		cloned.turnsAtPeace = this.turnsAtPeace;
		cloned.isDenounced = this.isDenounced;
		cloned.denouncedSince = this.denouncedSince;
		return cloned;
	}

	/**
	 * Serialize to JSON
	 */
	toJSON(): any {
		return {
			targetNationId: this.targetNationId,
			targetNationName: this.targetNationName,
			diplomaticState: this.diplomaticState,
			opinion: this.opinion,
			atWarSince: this.atWarSince,
			peaceTreatySince: this.peaceTreatySince,
			allianceSince: this.allianceSince,
			tradeAgreementSince: this.tradeAgreementSince,
			openBordersSince: this.openBordersSince,
			researchAgreementSince: this.researchAgreementSince,
			opinionModifiers: this.opinionModifiers,
			diplomaticHistory: this.diplomaticHistory,
			pendingProposals: this.pendingProposals,
			grievances: this.grievances,
			lastInteractionTurn: this.lastInteractionTurn,
			turnsAtWar: this.turnsAtWar,
			turnsAtPeace: this.turnsAtPeace,
			isDenounced: this.isDenounced,
			denouncedSince: this.denouncedSince
		};
	}

	/**
	 * Restore from JSON
	 */
	static fromJSON(data: any): DiplomacyManager {
		const manager = new DiplomacyManager(
			data.targetNationId ?? '',
			data.targetNationName ?? ''
		);
		manager.diplomaticState = data.diplomaticState ?? DiplomacyState.Neutral;
		manager.opinion = data.opinion ?? 0;
		manager.atWarSince = data.atWarSince;
		manager.peaceTreatySince = data.peaceTreatySince;
		manager.allianceSince = data.allianceSince;
		manager.tradeAgreementSince = data.tradeAgreementSince;
		manager.openBordersSince = data.openBordersSince;
		manager.researchAgreementSince = data.researchAgreementSince;
		manager.opinionModifiers = data.opinionModifiers ?? [];
		manager.diplomaticHistory = data.diplomaticHistory ?? [];
		manager.pendingProposals = data.pendingProposals ?? [];
		manager.grievances = data.grievances ?? [];
		manager.lastInteractionTurn = data.lastInteractionTurn ?? 0;
		manager.turnsAtWar = data.turnsAtWar ?? 0;
		manager.turnsAtPeace = data.turnsAtPeace ?? 0;
		manager.isDenounced = data.isDenounced ?? false;
		manager.denouncedSince = data.denouncedSince;
		return manager;
	}
}
