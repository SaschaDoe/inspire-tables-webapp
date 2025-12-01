/**
 * Unit tests for PolicyManager
 * Tests social policy trees and culture accumulation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PolicyManager } from '../managers/PolicyManager';

describe('PolicyManager', () => {
	let manager: PolicyManager;

	beforeEach(() => {
		manager = new PolicyManager();
	});

	describe('Initialization', () => {
		it('should start with no unlocked policies', () => {
			expect(manager.unlockedPolicies).toHaveLength(0);
		});

		it('should start with no adopted policy trees', () => {
			expect(manager.adoptedPolicyTrees).toHaveLength(0);
		});

		it('should start with 0 culture stored', () => {
			expect(manager.cultureStored).toBe(0);
		});

		it('should start with initial policy cost of 25', () => {
			// Formula: 25 + (policiesAdopted^2 * 2.5)
			// With policiesAdopted = 0: 25 + 0 = 25
			expect(manager.cultureNeededForPolicy).toBe(25);
		});

		it('should start with 0 policies adopted', () => {
			expect(manager.policiesAdopted).toBe(0);
		});

		it('should start with 0 free policies', () => {
			expect(manager.freePoliciesAvailable).toBe(0);
		});
	});

	describe('Policy Cost Calculation', () => {
		it('should calculate cost for first policy', () => {
			manager.policiesAdopted = 0;
			manager.calculatePolicyCost();

			// 25 + (0^2 * 2.5) = 25
			expect(manager.cultureNeededForPolicy).toBe(25);
		});

		it('should calculate cost for second policy', () => {
			manager.policiesAdopted = 1;
			manager.calculatePolicyCost();

			// 25 + (1^2 * 2.5) = 25 + 2.5 = 28 (rounded up)
			expect(manager.cultureNeededForPolicy).toBe(28);
		});

		it('should calculate cost for third policy', () => {
			manager.policiesAdopted = 2;
			manager.calculatePolicyCost();

			// 25 + (2^2 * 2.5) = 25 + 10 = 35
			expect(manager.cultureNeededForPolicy).toBe(35);
		});

		it('should calculate cost for fifth policy', () => {
			manager.policiesAdopted = 4;
			manager.calculatePolicyCost();

			// 25 + (4^2 * 2.5) = 25 + 40 = 65
			expect(manager.cultureNeededForPolicy).toBe(65);
		});

		it('should apply policy cost modifiers', () => {
			manager.policiesAdopted = 1;
			manager.addPolicyCostModifier('Representation', -33); // -33% cost
			// Cost auto-recalculates in addPolicyCostModifier

			// Base: 28, with -33%: 28 * 0.67 = 18.76, rounded up to 19
			expect(manager.cultureNeededForPolicy).toBe(19);
		});

		it('should recalculate cost when adding modifier', () => {
			manager.policiesAdopted = 1;
			const costBefore = manager.cultureNeededForPolicy;

			manager.addPolicyCostModifier('Representation', -33);

			expect(manager.cultureNeededForPolicy).toBeLessThan(costBefore);
		});
	});

	describe('Policy Cost Modifiers', () => {
		it('should add policy cost modifiers', () => {
			manager.addPolicyCostModifier('Representation', -33);

			expect(manager.getTotalPolicyCostModifier()).toBe(-33);
		});

		it('should stack modifiers from different sources', () => {
			manager.addPolicyCostModifier('Representation', -33);
			manager.addPolicyCostModifier('Wonder', -10);

			expect(manager.getTotalPolicyCostModifier()).toBe(-43);
		});

		it('should replace modifier from same source', () => {
			manager.addPolicyCostModifier('Representation', -33);
			manager.addPolicyCostModifier('Representation', -50); // Replace

			expect(manager.getTotalPolicyCostModifier()).toBe(-50);
		});

		it('should remove modifier when set to 0', () => {
			manager.addPolicyCostModifier('Representation', -33);
			manager.addPolicyCostModifier('Representation', 0); // Remove

			expect(manager.getTotalPolicyCostModifier()).toBe(0);
		});
	});

	describe('Culture Accumulation', () => {
		it('should accumulate culture over turns', () => {
			manager.processTurn(5);
			expect(manager.cultureStored).toBe(5);

			manager.processTurn(5);
			expect(manager.cultureStored).toBe(10);
		});

		it('should track total culture generated', () => {
			manager.processTurn(5);
			manager.processTurn(5);
			manager.processTurn(5);

			expect(manager.totalCultureGenerated).toBe(15);
		});

		it('should track culture per turn', () => {
			manager.processTurn(7);

			expect(manager.culturePerTurn).toBe(7);
		});

		it('should apply culture modifiers', () => {
			manager.addCultureModifier('Monument', 15); // +15%

			manager.processTurn(10);

			// 10 * 1.15 = 11.5, floored to 11
			expect(manager.cultureStored).toBe(11);
		});
	});

	describe('Culture Modifiers', () => {
		it('should add culture modifiers', () => {
			manager.addCultureModifier('Monument', 25);

			expect(manager.getTotalCultureModifier()).toBe(25);
		});

		it('should stack modifiers from different sources', () => {
			manager.addCultureModifier('Monument', 25);
			manager.addCultureModifier('Amphitheater', 33);

			expect(manager.getTotalCultureModifier()).toBe(58);
		});

		it('should replace modifier from same source', () => {
			manager.addCultureModifier('Monument', 25);
			manager.addCultureModifier('Monument', 33); // Upgrade

			expect(manager.getTotalCultureModifier()).toBe(33);
		});

		it('should remove modifier when set to 0', () => {
			manager.addCultureModifier('Monument', 25);
			manager.addCultureModifier('Monument', 0); // Remove

			expect(manager.getTotalCultureModifier()).toBe(0);
		});

		it('should floor effective culture', () => {
			manager.addCultureModifier('Monument', 10); // +10%

			const culture = manager.getEffectiveCulture(5);

			// 5 * 1.1 = 5.5, floored to 5
			expect(culture).toBe(5);
		});
	});

	describe('Policy Adoption', () => {
		it('should adopt policy when enough culture', () => {
			manager.cultureStored = 25;

			const result = manager.adoptPolicy('tradition_opener', 'tradition');

			expect(result.adopted).toBe(true);
			expect(result.policyId).toBe('tradition_opener');
		});

		it('should add policy to unlocked list', () => {
			manager.cultureStored = 25;

			manager.adoptPolicy('tradition_opener', 'tradition');

			expect(manager.unlockedPolicies).toContain('tradition_opener');
			expect(manager.hasPolicy('tradition_opener')).toBe(true);
		});

		it('should spend culture when adopting', () => {
			manager.cultureStored = 30;

			manager.adoptPolicy('tradition_opener', 'tradition');

			expect(manager.cultureStored).toBe(5); // 30 - 25
		});

		it('should increment policies adopted', () => {
			manager.cultureStored = 25;

			manager.adoptPolicy('tradition_opener', 'tradition');

			expect(manager.policiesAdopted).toBe(1);
		});

		it('should recalculate cost after adoption', () => {
			manager.cultureStored = 25;
			const costBefore = manager.cultureNeededForPolicy; // 25

			manager.adoptPolicy('tradition_opener', 'tradition');

			// Cost should increase to 28 (25 + 1^2 * 2.5)
			expect(manager.cultureNeededForPolicy).toBeGreaterThan(costBefore);
		});

		it('should fail if not enough culture', () => {
			manager.cultureStored = 10; // Need 25

			const result = manager.adoptPolicy('tradition_opener', 'tradition');

			expect(result.adopted).toBe(false);
		});

		it('should fail if policy already unlocked', () => {
			manager.cultureStored = 50;
			manager.unlockedPolicies.push('tradition_opener');

			const result = manager.adoptPolicy('tradition_opener', 'tradition');

			expect(result.adopted).toBe(false);
			expect(manager.cultureStored).toBe(50); // Not spent
		});

		it('should track adopted policy trees', () => {
			manager.cultureStored = 25;

			manager.adoptPolicy('tradition_opener', 'tradition');

			expect(manager.adoptedPolicyTrees).toContain('tradition');
			expect(manager.hasAdoptedTree('tradition')).toBe(true);
		});

		it('should not duplicate policy trees in adopted list', () => {
			manager.cultureStored = 100;

			manager.adoptPolicy('tradition_opener', 'tradition');
			manager.adoptPolicy('tradition_landed_elite', 'tradition');

			const traditionCount = manager.adoptedPolicyTrees.filter(t => t === 'tradition').length;
			expect(traditionCount).toBe(1);
		});
	});

	describe('Policy Prerequisites', () => {
		it('should adopt policy with met prerequisites', () => {
			manager.unlockedPolicies = ['tradition_opener'];
			manager.cultureStored = 30;

			const result = manager.adoptPolicy('tradition_landed_elite', 'tradition', ['tradition_opener']);

			expect(result.adopted).toBe(true);
		});

		it('should fail if prerequisites not met', () => {
			manager.cultureStored = 30;

			const result = manager.adoptPolicy('tradition_landed_elite', 'tradition', ['tradition_opener']);

			expect(result.adopted).toBe(false);
		});

		it('should check multiple prerequisites', () => {
			manager.unlockedPolicies = ['policy_a', 'policy_b'];
			manager.cultureStored = 30;

			const result = manager.adoptPolicy('advanced_policy', 'tree', ['policy_a', 'policy_b']);

			expect(result.adopted).toBe(true);
		});

		it('should fail if any prerequisite missing', () => {
			manager.unlockedPolicies = ['policy_a'];
			manager.cultureStored = 30;

			const result = manager.adoptPolicy('advanced_policy', 'tree', ['policy_a', 'policy_b']);

			expect(result.adopted).toBe(false); // Missing policy_b
		});
	});

	describe('Free Policies', () => {
		it('should grant free policies', () => {
			manager.grantFreePolicy();

			expect(manager.freePoliciesAvailable).toBe(1);
		});

		it('should use free policy instead of culture', () => {
			manager.grantFreePolicy();
			manager.cultureStored = 0; // No culture

			const result = manager.adoptPolicy('tradition_opener', 'tradition');

			expect(result.adopted).toBe(true);
			expect(manager.freePoliciesAvailable).toBe(0);
			expect(manager.cultureStored).toBe(0); // No culture spent
		});

		it('should prioritize free policy over culture', () => {
			manager.grantFreePolicy();
			manager.cultureStored = 30;

			manager.adoptPolicy('tradition_opener', 'tradition');

			expect(manager.freePoliciesAvailable).toBe(0); // Free policy used
			expect(manager.cultureStored).toBe(30); // Culture not spent
		});

		it('should indicate can afford policy with free policy', () => {
			manager.grantFreePolicy();
			manager.cultureStored = 0;

			expect(manager.canAffordPolicy()).toBe(true);
		});
	});

	describe('Policy Tree Completion', () => {
		it('should complete policy tree', () => {
			const success = manager.completeTree('tradition');

			expect(success).toBe(true);
			expect(manager.completedPolicyTrees).toContain('tradition');
			expect(manager.hasCompletedTree('tradition')).toBe(true);
		});

		it('should not complete already completed tree', () => {
			manager.completeTree('tradition');

			const success = manager.completeTree('tradition');

			expect(success).toBe(false);
		});

		it('should track multiple completed trees', () => {
			manager.completeTree('tradition');
			manager.completeTree('liberty');
			manager.completeTree('honor');

			expect(manager.completedPolicyTrees).toHaveLength(3);
		});
	});

	describe('Can Afford Policy', () => {
		it('should return true if enough culture', () => {
			manager.cultureStored = 25;

			expect(manager.canAffordPolicy()).toBe(true);
		});

		it('should return false if not enough culture', () => {
			manager.cultureStored = 10;

			expect(manager.canAffordPolicy()).toBe(false);
		});

		it('should return true if free policy available', () => {
			manager.grantFreePolicy();
			manager.cultureStored = 0;

			expect(manager.canAffordPolicy()).toBe(true);
		});
	});

	describe('Turns Until Next Policy', () => {
		it('should calculate turns until next policy', () => {
			manager.cultureStored = 10;
			manager.cultureNeededForPolicy = 25;

			const turns = manager.getTurnsUntilNextPolicy(5);

			// Need 15 more, at 5/turn = 3 turns
			expect(turns).toBe(3);
		});

		it('should return 0 if free policy available', () => {
			manager.grantFreePolicy();

			const turns = manager.getTurnsUntilNextPolicy(5);

			expect(turns).toBe(0);
		});

		it('should return Infinity if no culture generation', () => {
			const turns = manager.getTurnsUntilNextPolicy(0);

			expect(turns).toBe(Infinity);
		});

		it('should account for current culture stored', () => {
			manager.cultureStored = 20;
			manager.cultureNeededForPolicy = 25;

			const turns = manager.getTurnsUntilNextPolicy(2);

			// Need 5 more, at 2/turn = 2.5, rounded up to 3
			expect(turns).toBe(3);
		});

		it('should round up fractional turns', () => {
			manager.cultureStored = 0;
			manager.cultureNeededForPolicy = 25;

			const turns = manager.getTurnsUntilNextPolicy(7);

			// 25 / 7 = 3.571..., rounded up to 4
			expect(turns).toBe(4);
		});
	});

	describe('Culture Progress Percentage', () => {
		it('should calculate progress percentage', () => {
			manager.cultureStored = 10;
			manager.cultureNeededForPolicy = 25;

			const percentage = manager.getCultureProgressPercentage();

			// 10 / 25 = 40%
			expect(percentage).toBe(40);
		});

		it('should floor percentage', () => {
			manager.cultureStored = 10;
			manager.cultureNeededForPolicy = 30;

			const percentage = manager.getCultureProgressPercentage();

			// 10 / 30 = 33.333..., floored to 33
			expect(percentage).toBe(33);
		});

		it('should handle 100% completion', () => {
			manager.cultureStored = 25;
			manager.cultureNeededForPolicy = 25;

			const percentage = manager.getCultureProgressPercentage();

			expect(percentage).toBe(100);
		});
	});

	describe('Policies in Tree', () => {
		it('should get policies from specific tree', () => {
			manager.unlockedPolicies = ['tradition_opener', 'liberty_opener', 'tradition_landed_elite'];

			const allPolicies = [
				{ id: 'tradition_opener', treeId: 'tradition' },
				{ id: 'liberty_opener', treeId: 'liberty' },
				{ id: 'tradition_landed_elite', treeId: 'tradition' }
			];

			const traditionPolicies = manager.getPoliciesInTree('tradition', allPolicies);

			expect(traditionPolicies).toHaveLength(2);
			expect(traditionPolicies).toContain('tradition_opener');
			expect(traditionPolicies).toContain('tradition_landed_elite');
		});

		it('should return empty array if no policies in tree', () => {
			manager.unlockedPolicies = ['liberty_opener'];

			const allPolicies = [
				{ id: 'tradition_opener', treeId: 'tradition' },
				{ id: 'liberty_opener', treeId: 'liberty' }
			];

			const traditionPolicies = manager.getPoliciesInTree('tradition', allPolicies);

			expect(traditionPolicies).toHaveLength(0);
		});
	});

	describe('Summary', () => {
		it('should show policy summary with progress', () => {
			manager.unlockedPolicies = ['tradition_opener', 'liberty_opener'];
			manager.cultureStored = 10;
			manager.cultureNeededForPolicy = 28;

			const summary = manager.getSummary(6);

			expect(summary).toContain('2'); // Policy count
			expect(summary).toContain('35%'); // 10/28 = 35.7%, floored to 35
			expect(summary).toContain('3 turns'); // (28-10)/6 = 3
		});

		it('should show free policy available', () => {
			manager.grantFreePolicy();

			const summary = manager.getSummary(5);

			expect(summary).toContain('Free policy available');
		});

		it('should show "No culture generation" when no culture', () => {
			const summary = manager.getSummary(0);

			expect(summary).toContain('No culture generation');
		});
	});

	describe('Clone and Serialization', () => {
		it('should clone correctly', () => {
			manager.unlockedPolicies = ['tradition_opener', 'liberty_opener'];
			manager.adoptedPolicyTrees = ['tradition', 'liberty'];
			manager.completedPolicyTrees = ['tradition'];
			manager.cultureStored = 10;
			manager.policiesAdopted = 2;
			manager.addCultureModifier('Monument', 25);
			manager.freePoliciesAvailable = 1;

			const cloned = manager.clone();

			expect(cloned.unlockedPolicies).toHaveLength(2);
			expect(cloned.adoptedPolicyTrees).toHaveLength(2);
			expect(cloned.completedPolicyTrees).toContain('tradition');
			expect(cloned.cultureStored).toBe(10);
			expect(cloned.policiesAdopted).toBe(2);
			expect(cloned.getTotalCultureModifier()).toBe(25);
			expect(cloned.freePoliciesAvailable).toBe(1);
		});

		it('should not share references with clone', () => {
			manager.unlockedPolicies = ['tradition_opener'];
			const cloned = manager.clone();

			manager.unlockedPolicies.push('liberty_opener');

			expect(manager.unlockedPolicies).toHaveLength(2);
			expect(cloned.unlockedPolicies).toHaveLength(1);
		});

		it('should serialize to JSON correctly', () => {
			manager.unlockedPolicies = ['tradition_opener'];
			manager.cultureStored = 10;
			manager.policiesAdopted = 1;

			const json = manager.toJSON();

			expect(json.unlockedPolicies).toContain('tradition_opener');
			expect(json.cultureStored).toBe(10);
			expect(json.policiesAdopted).toBe(1);
		});

		it('should deserialize from JSON correctly', () => {
			const data = {
				unlockedPolicies: ['tradition_opener', 'liberty_opener'],
				adoptedPolicyTrees: ['tradition', 'liberty'],
				completedPolicyTrees: ['tradition'],
				cultureStored: 15,
				cultureNeededForPolicy: 28,
				totalCultureGenerated: 50,
				culturePerTurn: 5,
				cultureModifiers: [{ source: 'Monument', value: 25 }],
				policyCostModifiers: [{ source: 'Representation', value: -33 }],
				freePoliciesAvailable: 1,
				policiesAdopted: 2
			};

			const restored = PolicyManager.fromJSON(data);

			expect(restored.unlockedPolicies).toHaveLength(2);
			expect(restored.cultureStored).toBe(15);
			expect(restored.policiesAdopted).toBe(2);
			expect(restored.getTotalCultureModifier()).toBe(25);
			expect(restored.freePoliciesAvailable).toBe(1);
		});
	});
});
