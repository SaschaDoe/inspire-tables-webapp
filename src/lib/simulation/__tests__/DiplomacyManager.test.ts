/**
 * Unit tests for DiplomacyManager
 * Tests diplomatic relationships between two nations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DiplomacyManager } from '../managers/DiplomacyManager';
import { DiplomacyState } from '$lib/entities/location/nation';

describe('DiplomacyManager', () => {
	let manager: DiplomacyManager;
	const targetNationId = 'nation-rome';
	const targetNationName = 'Rome';

	beforeEach(() => {
		manager = new DiplomacyManager(targetNationId, targetNationName);
	});

	describe('Initialization', () => {
		it('should initialize with target nation info', () => {
			expect(manager.targetNationId).toBe(targetNationId);
			expect(manager.targetNationName).toBe(targetNationName);
		});

		it('should start in Neutral state', () => {
			expect(manager.diplomaticState).toBe(DiplomacyState.Neutral);
		});

		it('should start with 0 opinion', () => {
			expect(manager.opinion).toBe(0);
		});

		it('should start with no opinion modifiers', () => {
			expect(manager.opinionModifiers).toHaveLength(0);
		});

		it('should start with no diplomatic history', () => {
			expect(manager.diplomaticHistory).toHaveLength(0);
		});

		it('should start not denounced', () => {
			expect(manager.isDenounced).toBe(false);
		});
	});

	describe('Diplomatic State Changes', () => {
		it('should change to War state', () => {
			manager.setDiplomaticState(DiplomacyState.War, 1);

			expect(manager.diplomaticState).toBe(DiplomacyState.War);
		});

		it('should track when war started', () => {
			manager.setDiplomaticState(DiplomacyState.War, 5);

			expect(manager.atWarSince).toBe(5);
		});

		it('should add negative opinion when declaring war', () => {
			manager.setDiplomaticState(DiplomacyState.War, 1);

			expect(manager.opinion).toBeLessThan(0);
		});

		it('should change to Peace state', () => {
			manager.setDiplomaticState(DiplomacyState.War, 1);
			manager.setDiplomaticState(DiplomacyState.Peace, 5);

			expect(manager.diplomaticState).toBe(DiplomacyState.Peace);
		});

		it('should track when peace treaty signed', () => {
			manager.setDiplomaticState(DiplomacyState.War, 1);
			manager.setDiplomaticState(DiplomacyState.Peace, 5);

			expect(manager.peaceTreatySince).toBe(5);
			expect(manager.atWarSince).toBeUndefined();
		});

		it('should add positive opinion when signing peace', () => {
			manager.setDiplomaticState(DiplomacyState.War, 1);
			const opinionDuringWar = manager.opinion;

			manager.setDiplomaticState(DiplomacyState.Peace, 5);

			expect(manager.opinion).toBeGreaterThan(opinionDuringWar);
		});

		it('should change to Alliance state', () => {
			manager.setDiplomaticState(DiplomacyState.Alliance, 1);

			expect(manager.diplomaticState).toBe(DiplomacyState.Alliance);
		});

		it('should track when alliance formed', () => {
			manager.setDiplomaticState(DiplomacyState.Alliance, 10);

			expect(manager.allianceSince).toBe(10);
		});

		it('should change to Trade state', () => {
			manager.setDiplomaticState(DiplomacyState.Trade, 1);

			expect(manager.diplomaticState).toBe(DiplomacyState.Trade);
		});

		it('should update last interaction turn', () => {
			manager.setDiplomaticState(DiplomacyState.War, 7);

			expect(manager.lastInteractionTurn).toBe(7);
		});

		it('should add diplomatic action to history', () => {
			manager.setDiplomaticState(DiplomacyState.War, 1);

			expect(manager.diplomaticHistory).toHaveLength(1);
			expect(manager.diplomaticHistory[0].action).toBe('war_declared');
		});
	});

	describe('Opinion Modifiers', () => {
		it('should add opinion modifier', () => {
			manager.addOpinionModifier('Trade agreement', +10, 1);

			expect(manager.opinion).toBe(10);
		});

		it('should stack modifiers', () => {
			manager.addOpinionModifier('Trade agreement', +10, 1);
			manager.addOpinionModifier('Alliance', +30, 1);

			expect(manager.opinion).toBe(40);
		});

		it('should replace existing modifier from same source', () => {
			manager.addOpinionModifier('Trade agreement', +10, 1);
			manager.addOpinionModifier('Trade agreement', +15, 2);

			expect(manager.opinion).toBe(15); // Not 25
		});

		it('should remove modifier when set to 0', () => {
			manager.addOpinionModifier('Trade agreement', +10, 1);
			manager.addOpinionModifier('Trade agreement', 0, 2);

			expect(manager.opinion).toBe(0);
		});

		it('should clamp opinion to -100 to +100', () => {
			manager.addOpinionModifier('Huge bonus', +200, 1);

			expect(manager.opinion).toBe(100); // Clamped

			manager.addOpinionModifier('Huge bonus', -300, 2);

			expect(manager.opinion).toBe(-100); // Clamped
		});

		it('should handle negative modifiers', () => {
			manager.addOpinionModifier('Declared war', -50, 1);

			expect(manager.opinion).toBe(-50);
		});

		it('should store modifier details', () => {
			manager.addOpinionModifier('Trade agreement', +10, 5, 0.5);

			expect(manager.opinionModifiers[0].source).toBe('Trade agreement');
			expect(manager.opinionModifiers[0].value).toBe(10);
			expect(manager.opinionModifiers[0].turnAdded).toBe(5);
			expect(manager.opinionModifiers[0].decayPerTurn).toBe(0.5);
		});
	});

	describe('Opinion Decay', () => {
		it('should decay positive modifiers toward zero', () => {
			manager.addOpinionModifier('Peace treaty', +20, 1, 0.5);

			manager.processTurnDecay(2);

			expect(manager.opinionModifiers[0].value).toBe(19.5); // 20 - 0.5
		});

		it('should decay negative modifiers toward zero', () => {
			manager.addOpinionModifier('Denounced', -30, 1, 0.5);

			manager.processTurnDecay(2);

			expect(manager.opinionModifiers[0].value).toBe(-29.5); // -30 + 0.5
		});

		it('should remove modifiers that decay to zero', () => {
			manager.addOpinionModifier('Small bonus', +1, 1, 0.5);

			manager.processTurnDecay(2); // Decays to 0.5
			manager.processTurnDecay(3); // Decays to 0

			expect(manager.opinionModifiers).toHaveLength(0);
		});

		it('should recalculate opinion after decay', () => {
			manager.addOpinionModifier('Peace treaty', +20, 1, 1);

			manager.processTurnDecay(2);

			expect(manager.opinion).toBe(19); // Recalculated
		});

		it('should not decay modifiers without decay rate', () => {
			manager.addOpinionModifier('Permanent bonus', +30, 1); // No decay

			manager.processTurnDecay(2);

			expect(manager.opinionModifiers[0].value).toBe(30);
		});

		it('should track turns at war', () => {
			manager.setDiplomaticState(DiplomacyState.War, 1);

			manager.processTurnDecay(2);
			manager.processTurnDecay(3);
			manager.processTurnDecay(4);

			expect(manager.turnsAtWar).toBe(3);
		});

		it('should track turns at peace', () => {
			manager.setDiplomaticState(DiplomacyState.Peace, 1);

			manager.processTurnDecay(2);
			manager.processTurnDecay(3);

			expect(manager.turnsAtPeace).toBe(2);
		});
	});

	describe('Grievances', () => {
		it('should add grievances', () => {
			manager.addGrievance('Settled near our borders');

			expect(manager.grievances).toContain('Settled near our borders');
		});

		it('should not duplicate grievances', () => {
			manager.addGrievance('Settled near our borders');
			manager.addGrievance('Settled near our borders');

			const count = manager.grievances.filter(g => g === 'Settled near our borders').length;
			expect(count).toBe(1);
		});

		it('should add negative opinion modifier for grievance', () => {
			manager.addGrievance('Settled near our borders');

			expect(manager.opinion).toBeLessThan(0);
		});

		it('should remove grievances', () => {
			manager.addGrievance('Settled near our borders');

			manager.removeGrievance('Settled near our borders');

			expect(manager.grievances).not.toContain('Settled near our borders');
		});

		it('should track multiple grievances', () => {
			manager.addGrievance('Settled near our borders');
			manager.addGrievance('Stole our land');
			manager.addGrievance('Broke promise');

			expect(manager.grievances).toHaveLength(3);
		});
	});

	describe('Treaty Proposals', () => {
		it('should propose treaty', () => {
			manager.proposeTreaty('peace', false, 5);

			expect(manager.pendingProposals).toHaveLength(1);
			expect(manager.pendingProposals[0].type).toBe('peace');
		});

		it('should track who proposed', () => {
			manager.proposeTreaty('alliance', true, 5);

			expect(manager.pendingProposals[0].proposedByThem).toBe(true);
		});

		it('should track when proposed', () => {
			manager.proposeTreaty('trade', false, 10);

			expect(manager.pendingProposals[0].turnProposed).toBe(10);
		});

		it('should store treaty terms', () => {
			manager.proposeTreaty('peace', false, 5, { gold: 100 });

			expect(manager.pendingProposals[0].terms).toEqual({ gold: 100 });
		});

		it('should accept treaty and update state', () => {
			manager.setDiplomaticState(DiplomacyState.War, 1, false);
			manager.proposeTreaty('peace', true, 5);

			const success = manager.acceptTreaty(0, 10);

			expect(success).toBe(true);
			expect(manager.diplomaticState).toBe(DiplomacyState.Peace);
		});

		it('should remove proposal after acceptance', () => {
			manager.proposeTreaty('peace', true, 5);

			manager.acceptTreaty(0, 10);

			expect(manager.pendingProposals).toHaveLength(0);
		});

		it('should handle trade agreement treaty', () => {
			manager.proposeTreaty('trade', true, 5);

			manager.acceptTreaty(0, 10);

			expect(manager.tradeAgreementSince).toBe(10);
			expect(manager.opinion).toBeGreaterThan(0);
		});

		it('should handle open borders treaty', () => {
			manager.proposeTreaty('open_borders', true, 5);

			manager.acceptTreaty(0, 10);

			expect(manager.openBordersSince).toBe(10);
		});

		it('should handle research agreement treaty', () => {
			manager.proposeTreaty('research', true, 5);

			manager.acceptTreaty(0, 10);

			expect(manager.researchAgreementSince).toBe(10);
		});

		it('should reject treaty', () => {
			manager.proposeTreaty('peace', true, 5);

			const success = manager.rejectTreaty(0);

			expect(success).toBe(true);
			expect(manager.pendingProposals).toHaveLength(0);
		});

		it('should fail to accept invalid proposal index', () => {
			const success = manager.acceptTreaty(5, 10);

			expect(success).toBe(false);
		});

		it('should fail to reject invalid proposal index', () => {
			const success = manager.rejectTreaty(5);

			expect(success).toBe(false);
		});
	});

	describe('Denouncement', () => {
		it('should denounce nation', () => {
			manager.denounce(10);

			expect(manager.isDenounced).toBe(true);
			expect(manager.denouncedSince).toBe(10);
		});

		it('should add negative opinion when denouncing', () => {
			manager.denounce(10);

			expect(manager.opinion).toBeLessThan(0);
		});

		it('should add diplomatic action for denouncement', () => {
			manager.denounce(10);

			const denouncement = manager.diplomaticHistory.find(h => h.action === 'denouncement');
			expect(denouncement).toBeDefined();
		});

		it('should cancel denouncement', () => {
			manager.denounce(10);

			manager.cancelDenouncement();

			expect(manager.isDenounced).toBe(false);
			expect(manager.denouncedSince).toBeUndefined();
		});
	});

	describe('Relationship Description', () => {
		it('should describe war relationship', () => {
			manager.setDiplomaticState(DiplomacyState.War, 1);

			expect(manager.getRelationshipDescription()).toBe('At War');
		});

		it('should describe alliance relationship', () => {
			manager.setDiplomaticState(DiplomacyState.Alliance, 1);

			expect(manager.getRelationshipDescription()).toBe('Allied');
		});

		it('should describe friendly relationship', () => {
			manager.addOpinionModifier('Great relations', +80, 1);

			expect(manager.getRelationshipDescription()).toBe('Friendly');
		});

		it('should describe favorable relationship', () => {
			manager.addOpinionModifier('Good relations', +60, 1);

			expect(manager.getRelationshipDescription()).toBe('Favorable');
		});

		it('should describe cordial relationship', () => {
			manager.addOpinionModifier('Decent relations', +30, 1);

			expect(manager.getRelationshipDescription()).toBe('Cordial');
		});

		it('should describe neutral relationship', () => {
			expect(manager.getRelationshipDescription()).toBe('Neutral');
		});

		it('should describe unfavorable relationship', () => {
			manager.addOpinionModifier('Slight tension', -20, 1);

			expect(manager.getRelationshipDescription()).toBe('Unfavorable');
		});

		it('should describe hostile relationship', () => {
			manager.addOpinionModifier('Strong tension', -40, 1);

			expect(manager.getRelationshipDescription()).toBe('Hostile');
		});

		it('should describe hateful relationship', () => {
			manager.addOpinionModifier('Ancient enemies', -60, 1);

			expect(manager.getRelationshipDescription()).toBe('Hateful');
		});
	});

	describe('Diplomatic History', () => {
		it('should add diplomatic actions', () => {
			manager.addDiplomaticAction('trade_started', 10, 'Trade agreement signed', +10);

			expect(manager.diplomaticHistory).toHaveLength(1);
			expect(manager.diplomaticHistory[0].action).toBe('trade_started');
		});

		it('should track action details', () => {
			manager.addDiplomaticAction('war_declared', 5, 'War declared!', -50);

			const action = manager.diplomaticHistory[0];
			expect(action.year).toBe(5);
			expect(action.description).toBe('War declared!');
			expect(action.opinionChange).toBe(-50);
		});

		it('should maintain chronological history', () => {
			manager.addDiplomaticAction('first_contact', 1, 'Met', 0);
			manager.addDiplomaticAction('trade_started', 5, 'Trade', +10);
			manager.addDiplomaticAction('war_declared', 10, 'War', -50);

			expect(manager.diplomaticHistory).toHaveLength(3);
			expect(manager.diplomaticHistory[0].action).toBe('first_contact');
			expect(manager.diplomaticHistory[2].action).toBe('war_declared');
		});
	});

	describe('Summary', () => {
		it('should show diplomatic summary', () => {
			manager.addOpinionModifier('Trade', +20, 1);

			const summary = manager.getSummary();

			expect(summary).toContain(targetNationName);
			expect(summary).toContain('20'); // Opinion
		});

		it('should show relationship description in summary', () => {
			manager.addOpinionModifier('Friendship', +80, 1);

			const summary = manager.getSummary();

			expect(summary).toContain('Friendly');
		});

		it('should show diplomatic state if not neutral', () => {
			manager.setDiplomaticState(DiplomacyState.War, 1, false);

			const summary = manager.getSummary();

			expect(summary).toContain('war');
		});
	});

	describe('Clone and Serialization', () => {
		it('should clone correctly', () => {
			manager.setDiplomaticState(DiplomacyState.Alliance, 5);
			manager.addOpinionModifier('Trade', +10, 5);
			manager.addGrievance('Settled near us');
			manager.proposeTreaty('trade', true, 7);
			manager.denounce(10);

			const cloned = manager.clone();

			expect(cloned.diplomaticState).toBe(DiplomacyState.Alliance);
			// Alliance: +30, Trade: +10, Grievance: -10, Denounced: -30 = 0
			expect(cloned.opinion).toBe(0);
			expect(cloned.grievances).toContain('Settled near us');
			expect(cloned.pendingProposals).toHaveLength(1);
			expect(cloned.isDenounced).toBe(true);
		});

		it('should not share references with clone', () => {
			manager.addOpinionModifier('Trade', +10, 1);
			const cloned = manager.clone();

			manager.addOpinionModifier('Alliance', +30, 2);

			expect(manager.opinionModifiers).toHaveLength(2);
			expect(cloned.opinionModifiers).toHaveLength(1);
		});

		it('should serialize to JSON correctly', () => {
			manager.setDiplomaticState(DiplomacyState.War, 5);
			// setDiplomaticState already adds -50 opinion modifier
			manager.addOpinionModifier('Additional grievance', -50, 5);

			const json = manager.toJSON();

			expect(json.diplomaticState).toBe(DiplomacyState.War);
			// 'Declared war': -50, 'Additional grievance': -50 = -100 (clamped)
			expect(json.opinion).toBe(-100);
			expect(json.atWarSince).toBe(5);
		});

		it('should deserialize from JSON correctly', () => {
			const data = {
				targetNationId: 'nation-greece',
				targetNationName: 'Greece',
				diplomaticState: DiplomacyState.Alliance,
				opinion: 40,
				allianceSince: 10,
				opinionModifiers: [{ source: 'Trade', value: +10, turnAdded: 5 }],
				diplomaticHistory: [{ action: 'alliance_formed', year: 10, description: 'Allied', opinionChange: +30 }],
				pendingProposals: [],
				grievances: [],
				lastInteractionTurn: 10,
				turnsAtWar: 0,
				turnsAtPeace: 5,
				isDenounced: false
			};

			const restored = DiplomacyManager.fromJSON(data);

			expect(restored.targetNationId).toBe('nation-greece');
			expect(restored.diplomaticState).toBe(DiplomacyState.Alliance);
			expect(restored.opinion).toBe(40);
			expect(restored.allianceSince).toBe(10);
		});
	});
});
