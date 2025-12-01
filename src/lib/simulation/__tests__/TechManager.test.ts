/**
 * Unit tests for TechManager
 * Tests technology research and tech tree progression
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TechManager } from '../managers/TechManager';
import { Era } from '$lib/entities/location/nation';

describe('TechManager', () => {
	let manager: TechManager;

	beforeEach(() => {
		manager = new TechManager();
	});

	describe('Initialization', () => {
		it('should start with no researched techs', () => {
			expect(manager.researchedTechs).toHaveLength(0);
		});

		it('should start in Prehistoric era', () => {
			expect(manager.currentEra).toBe(Era.Prehistoric);
		});

		it('should start with no current research', () => {
			expect(manager.currentResearch).toBeUndefined();
		});

		it('should start with 0 research progress', () => {
			expect(manager.researchProgress).toBe(0);
		});

		it('should start with 0 free techs', () => {
			expect(manager.freeTechsAvailable).toBe(0);
		});
	});

	describe('Technology Research', () => {
		it('should check if tech has been researched', () => {
			expect(manager.hasTech('agriculture')).toBe(false);

			manager.researchedTechs.push('agriculture');

			expect(manager.hasTech('agriculture')).toBe(true);
		});

		it('should start researching a technology', () => {
			manager.startResearching('agriculture', 20);

			expect(manager.currentResearch).toBe('agriculture');
		});

		it('should not start researching already researched tech', () => {
			manager.researchedTechs.push('agriculture');

			manager.startResearching('agriculture', 20);

			expect(manager.currentResearch).toBeUndefined();
		});

		it('should continue if already researching same tech', () => {
			manager.startResearching('agriculture', 20);
			manager.researchProgress = 10;

			manager.startResearching('agriculture', 20);

			expect(manager.researchProgress).toBe(10); // Progress kept
		});

		it('should allow switching research', () => {
			manager.startResearching('agriculture', 20);
			manager.researchProgress = 10;

			manager.startResearching('pottery', 20);

			expect(manager.currentResearch).toBe('pottery');
			// Progress is kept when switching (design choice)
		});
	});

	describe('Research Progress', () => {
		it('should accumulate science toward current research', () => {
			manager.startResearching('agriculture', 20);

			manager.processTurn(5, 20);

			expect(manager.researchProgress).toBe(5);

			manager.processTurn(5, 20);

			expect(manager.researchProgress).toBe(10);
		});

		it('should complete tech when cost is reached', () => {
			manager.startResearching('agriculture', 20);

			// Accumulate 20 science over 4 turns
			manager.processTurn(5, 20);
			manager.processTurn(5, 20);
			manager.processTurn(5, 20);
			const result = manager.processTurn(5, 20);

			expect(result.completed).toBe(true);
			expect(result.techId).toBe('agriculture');
		});

		it('should add completed tech to researched list', () => {
			manager.startResearching('agriculture', 20);

			manager.processTurn(20, 20);

			expect(manager.researchedTechs).toContain('agriculture');
			expect(manager.hasTech('agriculture')).toBe(true);
		});

		it('should clear current research after completion', () => {
			manager.startResearching('agriculture', 20);

			manager.processTurn(20, 20);

			expect(manager.currentResearch).toBeUndefined();
		});

		it('should reset research progress after completion', () => {
			manager.startResearching('agriculture', 20);

			manager.processTurn(20, 20);

			expect(manager.researchProgress).toBe(0);
		});

		it('should calculate science overflow when exceeding cost', () => {
			manager.startResearching('agriculture', 20);

			const result = manager.processTurn(25, 20); // 5 overflow

			expect(result.scienceOverflow).toBe(5);
		});

		it('should not complete if no research selected', () => {
			const result = manager.processTurn(20, 20);

			expect(result.completed).toBe(false);
		});
	});

	describe('Research Cost Modifiers', () => {
		it('should add research cost modifiers', () => {
			manager.addResearchCostModifier('Rationalism', -10); // -10% cost

			expect(manager.getTotalResearchCostModifier()).toBe(-10);
		});

		it('should stack modifiers from different sources', () => {
			manager.addResearchCostModifier('Rationalism', -10);
			manager.addResearchCostModifier('University', -5);

			expect(manager.getTotalResearchCostModifier()).toBe(-15);
		});

		it('should replace modifier from same source', () => {
			manager.addResearchCostModifier('Rationalism', -10);
			manager.addResearchCostModifier('Rationalism', -15); // Replace

			expect(manager.getTotalResearchCostModifier()).toBe(-15);
		});

		it('should remove modifier when set to 0', () => {
			manager.addResearchCostModifier('Rationalism', -10);
			manager.addResearchCostModifier('Rationalism', 0); // Remove

			expect(manager.getTotalResearchCostModifier()).toBe(0);
		});

		it('should apply modifiers to research cost', () => {
			manager.addResearchCostModifier('Rationalism', -20); // -20%

			const cost = manager.getResearchCost(100);

			// 100 * 0.8 = 80
			expect(cost).toBe(80);
		});

		it('should round up fractional costs', () => {
			manager.addResearchCostModifier('Rationalism', -10); // -10%

			const cost = manager.getResearchCost(25);

			// 25 * 0.9 = 22.5, rounded up to 23
			expect(cost).toBe(23);
		});
	});

	describe('Science Modifiers', () => {
		it('should add science modifiers', () => {
			manager.addScienceModifier('Library', 25); // +25%

			expect(manager.getTotalScienceModifier()).toBe(25);
		});

		it('should stack modifiers from different sources', () => {
			manager.addScienceModifier('Library', 25);
			manager.addScienceModifier('University', 50);

			expect(manager.getTotalScienceModifier()).toBe(75);
		});

		it('should replace modifier from same source', () => {
			manager.addScienceModifier('Library', 25);
			manager.addScienceModifier('Library', 33); // Upgrade

			expect(manager.getTotalScienceModifier()).toBe(33);
		});

		it('should remove modifier when set to 0', () => {
			manager.addScienceModifier('Library', 25);
			manager.addScienceModifier('Library', 0); // Remove

			expect(manager.getTotalScienceModifier()).toBe(0);
		});

		it('should apply modifiers to effective science', () => {
			manager.addScienceModifier('Library', 50); // +50%

			const science = manager.getEffectiveScience(10);

			// 10 * 1.5 = 15
			expect(science).toBe(15);
		});

		it('should floor effective science', () => {
			manager.addScienceModifier('Library', 10); // +10%

			const science = manager.getEffectiveScience(5);

			// 5 * 1.1 = 5.5, floored to 5
			expect(science).toBe(5);
		});
	});

	describe('Free Technologies', () => {
		it('should grant free tech tokens', () => {
			manager.grantFreeTech();

			expect(manager.freeTechsAvailable).toBe(1);
		});

		it('should use free tech to acquire technology', () => {
			manager.grantFreeTech();

			const success = manager.useFreeTech('agriculture');

			expect(success).toBe(true);
			expect(manager.freeTechsAvailable).toBe(0);
			expect(manager.hasTech('agriculture')).toBe(true);
		});

		it('should not use free tech if none available', () => {
			const success = manager.useFreeTech('agriculture');

			expect(success).toBe(false);
			expect(manager.hasTech('agriculture')).toBe(false);
		});

		it('should not use free tech on already researched tech', () => {
			manager.grantFreeTech();
			manager.researchedTechs.push('agriculture');

			const success = manager.useFreeTech('agriculture');

			expect(success).toBe(false);
			expect(manager.freeTechsAvailable).toBe(1); // Not consumed
		});

		it('should acquire tech directly (from ruins, events)', () => {
			const success = manager.acquireFreeTech('agriculture');

			expect(success).toBe(true);
			expect(manager.hasTech('agriculture')).toBe(true);
		});

		it('should not acquire already researched tech', () => {
			manager.researchedTechs.push('agriculture');

			const success = manager.acquireFreeTech('agriculture');

			expect(success).toBe(false);
		});

		it('should clear current research if acquiring that tech for free', () => {
			manager.startResearching('agriculture', 20);
			manager.researchProgress = 10;

			manager.acquireFreeTech('agriculture');

			expect(manager.currentResearch).toBeUndefined();
			expect(manager.researchProgress).toBe(0);
		});
	});

	describe('Tech Prerequisites', () => {
		it('should check if can research tech with prerequisites', () => {
			manager.researchedTechs = ['agriculture'];

			const canResearch = manager.canResearch('pottery', ['agriculture']);

			expect(canResearch).toBe(true);
		});

		it('should prevent research if prerequisites not met', () => {
			const canResearch = manager.canResearch('pottery', ['agriculture']);

			expect(canResearch).toBe(false);
		});

		it('should prevent research if already have tech', () => {
			manager.researchedTechs = ['agriculture'];

			const canResearch = manager.canResearch('agriculture', []);

			expect(canResearch).toBe(false);
		});

		it('should allow research with multiple prerequisites', () => {
			manager.researchedTechs = ['agriculture', 'pottery'];

			const canResearch = manager.canResearch('writing', ['agriculture', 'pottery']);

			expect(canResearch).toBe(true);
		});

		it('should prevent research if any prerequisite missing', () => {
			manager.researchedTechs = ['agriculture'];

			const canResearch = manager.canResearch('writing', ['agriculture', 'pottery']);

			expect(canResearch).toBe(false); // Missing pottery
		});

		it('should get available techs from tech tree', () => {
			manager.researchedTechs = ['agriculture'];

			const techTree = [
				{ id: 'agriculture', prerequisites: [] },
				{ id: 'pottery', prerequisites: ['agriculture'] },
				{ id: 'writing', prerequisites: ['agriculture', 'pottery'] },
				{ id: 'animal_husbandry', prerequisites: ['agriculture'] }
			];

			const available = manager.getAvailableTechs(techTree);

			expect(available).toContain('pottery');
			expect(available).toContain('animal_husbandry');
			expect(available).not.toContain('writing'); // Needs pottery too
			expect(available).not.toContain('agriculture'); // Already have
		});
	});

	describe('Era Progression', () => {
		it('should update to higher era', () => {
			manager.currentEra = Era.Prehistoric;

			manager.updateEra(Era.Ancient);

			expect(manager.currentEra).toBe(Era.Ancient);
		});

		it('should not regress to lower era', () => {
			manager.currentEra = Era.Classical;

			manager.updateEra(Era.Ancient);

			expect(manager.currentEra).toBe(Era.Classical); // Stay in Classical
		});

		it('should stay in same era if already there', () => {
			manager.currentEra = Era.Ancient;

			manager.updateEra(Era.Ancient);

			expect(manager.currentEra).toBe(Era.Ancient);
		});

		it('should progress through multiple eras', () => {
			manager.updateEra(Era.Ancient);
			expect(manager.currentEra).toBe(Era.Ancient);

			manager.updateEra(Era.Classical);
			expect(manager.currentEra).toBe(Era.Classical);

			manager.updateEra(Era.Medieval);
			expect(manager.currentEra).toBe(Era.Medieval);
		});
	});

	describe('Turns Until Completion', () => {
		it('should calculate turns until research completion', () => {
			manager.startResearching('agriculture', 20);
			manager.researchProgress = 0;

			const turns = manager.getTurnsUntilCompletion(5, 20);

			// Need 20 science, generating 5/turn = 4 turns
			expect(turns).toBe(4);
		});

		it('should return Infinity if no research selected', () => {
			const turns = manager.getTurnsUntilCompletion(5, 20);

			expect(turns).toBe(Infinity);
		});

		it('should return Infinity if no science generation', () => {
			manager.startResearching('agriculture', 20);

			const turns = manager.getTurnsUntilCompletion(0, 20);

			expect(turns).toBe(Infinity);
		});

		it('should account for current progress', () => {
			manager.startResearching('agriculture', 20);
			manager.researchProgress = 10;

			const turns = manager.getTurnsUntilCompletion(5, 20);

			// Need 10 more science, generating 5/turn = 2 turns
			expect(turns).toBe(2);
		});

		it('should round up fractional turns', () => {
			manager.startResearching('agriculture', 20);
			manager.researchProgress = 0;

			const turns = manager.getTurnsUntilCompletion(7, 20);

			// 20 / 7 = 2.857..., rounded up to 3
			expect(turns).toBe(3);
		});
	});

	describe('Research Progress Percentage', () => {
		it('should calculate progress percentage', () => {
			manager.startResearching('agriculture', 20);
			manager.researchProgress = 10;

			const percentage = manager.getResearchProgressPercentage(20);

			// 10 / 20 = 50%
			expect(percentage).toBe(50);
		});

		it('should return 0 if no research', () => {
			const percentage = manager.getResearchProgressPercentage(20);

			expect(percentage).toBe(0);
		});

		it('should floor percentage', () => {
			manager.startResearching('agriculture', 30);
			manager.researchProgress = 10;

			const percentage = manager.getResearchProgressPercentage(30);

			// 10 / 30 = 33.333..., floored to 33
			expect(percentage).toBe(33);
		});
	});

	describe('Summary', () => {
		it('should show research summary with progress', () => {
			manager.startResearching('agriculture', 'Agriculture', 20);
			manager.researchProgress = 10;

			const summary = manager.getSummary(5, 20, 'Agriculture');

			expect(summary).toContain('Agriculture');
			expect(summary).toContain('50%'); // 10/20
			expect(summary).toContain('2 turns'); // (20-10)/5
		});

		it('should show "None" when no research', () => {
			const summary = manager.getSummary(5, 20);

			expect(summary).toContain('None');
			expect(summary).toContain('0 techs discovered');
		});

		it('should show tech count in summary', () => {
			manager.researchedTechs = ['agriculture', 'pottery', 'writing'];

			const summary = manager.getSummary(5, 20);

			expect(summary).toContain('3 techs discovered');
		});
	});

	describe('Clone and Serialization', () => {
		it('should clone correctly', () => {
			manager.researchedTechs = ['agriculture', 'pottery'];
			manager.startResearching('writing', 30);
			manager.researchProgress = 15;
			manager.currentEra = Era.Ancient;
			manager.addScienceModifier('Library', 25);
			manager.freeTechsAvailable = 2;

			const cloned = manager.clone();

			expect(cloned.researchedTechs).toHaveLength(2);
			expect(cloned.currentResearch).toBe('writing');
			expect(cloned.researchProgress).toBe(15);
			expect(cloned.currentEra).toBe(Era.Ancient);
			expect(cloned.getTotalScienceModifier()).toBe(25);
			expect(cloned.freeTechsAvailable).toBe(2);
		});

		it('should not share references with clone', () => {
			manager.researchedTechs = ['agriculture'];
			const cloned = manager.clone();

			manager.researchedTechs.push('pottery');

			expect(manager.researchedTechs).toHaveLength(2);
			expect(cloned.researchedTechs).toHaveLength(1);
		});

		it('should serialize to JSON correctly', () => {
			manager.researchedTechs = ['agriculture'];
			manager.startResearching('pottery', 20);
			manager.researchProgress = 10;

			const json = manager.toJSON();

			expect(json.researchedTechs).toContain('agriculture');
			expect(json.currentResearch).toBe('pottery');
			expect(json.researchProgress).toBe(10);
		});

		it('should deserialize from JSON correctly', () => {
			const data = {
				researchedTechs: ['agriculture', 'pottery'],
				currentResearch: 'writing',
				researchProgress: 15,
				currentEra: Era.Ancient,
				sciencePerTurn: 10,
				scienceModifiers: [{ source: 'Library', value: 25 }],
				freeTechsAvailable: 1,
				researchCostModifiers: [{ source: 'Rationalism', value: -10 }]
			};

			const restored = TechManager.fromJSON(data);

			expect(restored.researchedTechs).toHaveLength(2);
			expect(restored.currentResearch).toBe('writing');
			expect(restored.getTotalScienceModifier()).toBe(25);
			expect(restored.freeTechsAvailable).toBe(1);
		});
	});
});
