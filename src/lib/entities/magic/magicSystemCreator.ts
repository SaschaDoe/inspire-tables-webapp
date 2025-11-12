import { Creator } from '../base/creator';
import { MagicSystem } from './magicSystem';
import { MagicAbilityTable } from '$lib/tables/magicTables/magicAbilityTable';
import { MagicOriginTable } from '$lib/tables/magicTables/magicOriginTable';
import { knowledge, KnowledgeTable, knowledgeToNumber } from '$lib/tables/otherTables/knowledgeTable';
import { PowerLevelTable } from '$lib/tables/otherTables/powerLevelTable';
import { MagicCostTable } from '$lib/tables/magicTables/magicCostTable';
import { LimitationForTalentTable } from '$lib/tables/talentTables/limitationForTalentTable';
import { SideEffectTable } from '$lib/tables/talentTables/sideEffectTable';
import { SpellPreparationTable } from '$lib/tables/spellTables/spellPreparationTable';
import { magicAbilitySourcesFromEntity, MagicSourceTable } from '$lib/tables/magicTables/magicSourceTable';
import { QuantityTable } from '$lib/tables/otherTables/quantityTable';
import { MagicEventTable } from '$lib/tables/magicTables/magicEventTable';
import { MagicFluffTable } from '$lib/tables/magicTables/magicFluffTable';
import { MagicRuleTable } from '$lib/tables/magicTables/magicRuleTable';
import { MagicWeaknessTable } from '$lib/tables/magicTables/magicWeaknessTable';
import { MagicalTalentTable } from '$lib/tables/talentTables/magicalTalentTable';
import { MagicDifferentiationTable } from '$lib/tables/magicTables/magicDifferentiationTable';
import { BalancingForTalentTable } from '$lib/tables/talentTables/balancingForTalentTable';
import { transferabilities, TransferabilityTable, transferToNumber } from '$lib/tables/otherTables/transferabilityTable';
import { prevalences, PrevalenceTable } from '$lib/tables/otherTables/prevalenceTable';
import { MagicSecondLevelUseTable } from '$lib/tables/magicTables/magicSecondLevelUseTable';
import { MagicSystemWordingTable } from '$lib/tables/magicTables/magicSystemWordingTable';
import { PowerArcTable } from '$lib/tables/otherTables/powerArcTable';
import { MagicChannelTable } from '$lib/tables/magicTables/magicChannelTable';
import { CastingMethodTable } from '$lib/tables/magicTables/castingMethodTable';
import { AmountTable } from '$lib/tables/otherTables/amountTable';
import { ImprovementTable } from '$lib/tables/talentTables/improvementTable';
import { DifficultyTable } from '$lib/tables/otherTables/difficultyTable';
import { MagicSensesTable } from '$lib/tables/magicTables/magicSensesTable';
import { MagicAttributeTable } from '$lib/tables/magicTables/magicAttributeTable';
import { MagicSpellModifierTable } from '$lib/tables/magicTables/magicSpellModifierTable';
import { MagicVisualTable } from '$lib/tables/magicTables/magicVisualTable';
import { ProfaneTalentTable } from '$lib/tables/talentTables/profaneTalentTable';
import { SpellCreator } from '../spell/spellCreator';
import { MagicSystemSciFiNameFirstTable } from '$lib/tables/magicTables/magicSystemSciFiNameFirstTable';
import { MagicSystemFantasyNameSecondTable } from '$lib/tables/magicTables/magicSystemFantasyNameSecondTable';
import { MagicSystemReligionNameFirstTable } from '$lib/tables/magicTables/magicSystemReligionNameFirstTable';
import { MagicSystemReligionNameSecondTable } from '$lib/tables/magicTables/magicSystemReligionNameSecondTable';
import { MagicSystemSciFiNameSecondTable } from '$lib/tables/magicTables/magicSystemSciFiNameSecondTable';
import { MagicSystemFantasyNameFirstTable } from '$lib/tables/magicTables/magicSystemFantasyNameFirstTable';
import { rpgTypicallyMagic } from '$lib/tables/magicTables/magicAbilityTable';

export class MagicSystemCreator extends Creator<MagicSystem> {
	property = 'none';

	create(): MagicSystem {
		const magicSystem = new MagicSystem();

		let isHard = this.dice.rollInterval(1, 3);
		if (this.property === 'soft') {
			isHard = 1;
		}
		let isTech = this.dice.rollInterval(1, 3);
		if (this.property === 'tech') {
			isTech = 3;
		} else if (this.property === 'no tech') {
			isTech = 1;
		}
		let isReligion = this.dice.rollInterval(1, 3);

		// Generate name based on type
		let name = '';
		if (isTech === 3) {
			name = new MagicSystemSciFiNameFirstTable().roleWithCascade(this.dice).text;
			name += ' ' + new MagicSystemSciFiNameSecondTable().roleWithCascade(this.dice).text;
		} else if (isReligion === 3) {
			name = new MagicSystemReligionNameFirstTable().roleWithCascade(this.dice).text;
			name += ' ' + new MagicSystemReligionNameSecondTable().roleWithCascade(this.dice).text;
		} else {
			name = new MagicSystemFantasyNameFirstTable().roleWithCascade(this.dice).text;
			name += new MagicSystemFantasyNameSecondTable().roleWithCascade(this.dice).text;
		}
		magicSystem.name = name;

		// Generate ability
		magicSystem.ability = new MagicAbilityTable().roleWithCascade(this.dice).text;

		if (magicSystem.ability === 'a set of magic talents') {
			const numberOfTalents = this.dice.rollInterval(3, 18);
			for (let i = 0; i < numberOfTalents; i++) {
				const magicTalent = new MagicalTalentTable().roleWithCascade(this.dice).text;
				if (!magicSystem.abilities.includes(magicTalent)) {
					magicSystem.abilities.push(magicTalent);
				}
			}
		} else if (magicSystem.ability === 'certain professions and profane talents') {
			const numberOfTalents = this.dice.rollInterval(3, 18);
			for (let i = 0; i < numberOfTalents; i++) {
				const profaneTalent = new ProfaneTalentTable().roleWithCascade(this.dice).text;
				if (!magicSystem.abilities.includes(profaneTalent)) {
					magicSystem.abilities.push(profaneTalent);
				}
			}
		} else if (magicSystem.ability === 'rpg typically magic') {
			const numberOfTalents = this.dice.rollInterval(3, 18);
			for (let i = 0; i < numberOfTalents; i++) {
				const roll = this.dice.rollInterval(0, rpgTypicallyMagic.length - 1);
				const ability = rpgTypicallyMagic[roll];
				if (!magicSystem.abilities.includes(ability)) {
					magicSystem.abilities.push(ability);
				}
			}
		}

		// Generate spells
		const spellCreator = new SpellCreator();
		spellCreator.dice = this.dice;
		if (magicSystem.abilities.length > 0) {
			magicSystem.spells.push(spellCreator.create());
		} else {
			for (let i = 0; i < 3; i++) {
				magicSystem.spells.push(spellCreator.create());
			}
		}

		// Ability properties
		magicSystem.abilityExplicitness = this.dice.rollInterval(1, 10);
		magicSystem.abilityReliability = this.dice.rollInterval(1, 10);
		magicSystem.abilityPersonalness = this.dice.random() > 0.5 ? 'impersonal' : 'personal';

		if (magicSystem.abilityPersonalness === 'personal') {
			magicSystem.differentiation = new MagicDifferentiationTable().roleWithCascade(this.dice).text;
		}

		magicSystem.abilityOrigin = new MagicOriginTable().roleWithCascade(this.dice).text;
		magicSystem.abilityExternalKnowledge = new KnowledgeTable().roleWithCascade(this.dice).text;
		magicSystem.abilityInternalKnowledge = new KnowledgeTable().roleWithCascade(this.dice).text;
		magicSystem.abilityTransferability = new TransferabilityTable().roleWithCascade(this.dice).text;

		// Power properties
		magicSystem.power = new PowerLevelTable().roleWithCascade(this.dice).text;
		magicSystem.powerExplicitness = this.dice.rollInterval(1, 10);
		magicSystem.powerReliability = this.dice.rollInterval(1, 10);
		magicSystem.powerPersonalness = this.dice.random() > 0.5 ? 'impersonal' : 'personal';
		magicSystem.powerOrigin = new MagicOriginTable().roleWithCascade(this.dice).text;
		magicSystem.powerExternalKnowledge = new KnowledgeTable().roleWithCascade(this.dice).text;
		magicSystem.powerInternalKnowledge = new KnowledgeTable().roleWithCascade(this.dice).text;
		magicSystem.powerTransferability = new TransferabilityTable().roleWithCascade(this.dice).text;

		// Rules
		const numberOfRules = this.dice.rollInterval(1, 3);
		for (let i = 0; i < numberOfRules; i++) {
			magicSystem.rules.push(new MagicRuleTable().roleWithCascade(this.dice).text);
		}
		magicSystem.ruleExplicitness = this.dice.rollInterval(1, 10);
		magicSystem.ruleReliability = this.dice.rollInterval(1, 10);
		magicSystem.rulePersonalness = this.dice.random() > 0.5 ? 'impersonal' : 'personal';
		magicSystem.ruleOrigin = new MagicOriginTable().roleWithCascade(this.dice).text;
		magicSystem.ruleExternalKnowledge = new KnowledgeTable().roleWithCascade(this.dice).text;
		magicSystem.ruleInternalKnowledge = new KnowledgeTable().roleWithCascade(this.dice).text;

		// Weakness
		magicSystem.weakness = new MagicWeaknessTable().roleWithCascade(this.dice).text;
		magicSystem.weaknessExplicitness = this.dice.rollInterval(1, 10);
		magicSystem.weaknessReliability = this.dice.rollInterval(1, 10);
		magicSystem.weaknessPersonalness = this.dice.random() > 0.5 ? 'impersonal' : 'personal';
		magicSystem.weaknessOrigin = new MagicOriginTable().roleWithCascade(this.dice).text;
		magicSystem.weaknessExternalKnowledge = new KnowledgeTable().roleWithCascade(this.dice).text;
		magicSystem.weaknessInternalKnowledge = new KnowledgeTable().roleWithCascade(this.dice).text;
		magicSystem.weaknessTransferability = new TransferabilityTable().roleWithCascade(this.dice).text;

		// Cost
		magicSystem.cost = new MagicCostTable().roleWithCascade(this.dice).text;
		const isModifier = this.dice.random() > 0.5;
		if (isModifier) {
			magicSystem.modifier = new MagicSpellModifierTable().roleWithCascade(this.dice).text;
		}

		magicSystem.costExplicitness = this.dice.rollInterval(1, 10);
		magicSystem.costReliability = this.dice.rollInterval(1, 10);
		magicSystem.costPersonalness = this.dice.random() > 0.5 ? 'impersonal' : 'personal';
		magicSystem.costOrigin = new MagicOriginTable().roleWithCascade(this.dice).text;
		magicSystem.costExternalKnowledge = new KnowledgeTable().roleWithCascade(this.dice).text;
		magicSystem.costInternalKnowledge = new KnowledgeTable().roleWithCascade(this.dice).text;
		magicSystem.costTransferability = new TransferabilityTable().roleWithCascade(this.dice).text;

		// Limitations
		const numberOfLimitations = this.dice.rollInterval(1, 3);
		for (let i = 0; i < numberOfLimitations; i++) {
			magicSystem.limitations.push(new LimitationForTalentTable().roleWithCascade(this.dice).text);
		}
		magicSystem.limitationExplicitness = this.dice.rollInterval(1, 10);
		magicSystem.limitationReliability = this.dice.rollInterval(1, 10);
		magicSystem.limitationPersonalness = this.dice.random() > 0.5 ? 'impersonal' : 'personal';
		magicSystem.limitationOrigin = new MagicOriginTable().roleWithCascade(this.dice).text;
		magicSystem.limitationExternalKnowledge = new KnowledgeTable().roleWithCascade(this.dice).text;
		magicSystem.limitationInternalKnowledge = new KnowledgeTable().roleWithCascade(this.dice).text;

		// Balancing
		magicSystem.balancing = new BalancingForTalentTable().roleWithCascade(this.dice).text;
		magicSystem.balancingExplicitness = this.dice.rollInterval(1, 10);
		magicSystem.balancingReliability = this.dice.rollInterval(1, 10);
		magicSystem.balancingPersonalness = this.dice.random() > 0.5 ? 'impersonal' : 'personal';
		magicSystem.balancingOrigin = new MagicOriginTable().roleWithCascade(this.dice).text;
		magicSystem.balancingExternalKnowledge = new KnowledgeTable().roleWithCascade(this.dice).text;
		magicSystem.balancingInternalKnowledge = new KnowledgeTable().roleWithCascade(this.dice).text;

		// Side effects
		magicSystem.sideEffect = new SideEffectTable().roleWithCascade(this.dice).text;
		magicSystem.sideEffectExplicitness = this.dice.rollInterval(1, 10);
		magicSystem.sideEffectReliability = this.dice.rollInterval(1, 10);
		magicSystem.sideEffectPersonalness = this.dice.random() > 0.5 ? 'impersonal' : 'personal';
		magicSystem.sideEffectOrigin = new MagicOriginTable().roleWithCascade(this.dice).text;
		magicSystem.sideEffectExternalKnowledge = new KnowledgeTable().roleWithCascade(this.dice).text;
		magicSystem.sideEffectInternalKnowledge = new KnowledgeTable().roleWithCascade(this.dice).text;

		// Preparation
		magicSystem.preparation = new SpellPreparationTable().roleWithCascade(this.dice).text;
		magicSystem.preparationExplicitness = this.dice.rollInterval(1, 10);
		magicSystem.preparationReliability = this.dice.rollInterval(1, 10);
		magicSystem.preparationPersonalness = this.dice.random() > 0.5 ? 'impersonal' : 'personal';
		magicSystem.preparationOrigin = new MagicOriginTable().roleWithCascade(this.dice).text;
		magicSystem.preparationExternalKnowledge = new KnowledgeTable().roleWithCascade(this.dice).text;
		magicSystem.preparationInternalKnowledge = new KnowledgeTable().roleWithCascade(this.dice).text;

		// Source
		magicSystem.source = new MagicSourceTable().roleWithCascade(this.dice).text;
		magicSystem.sourceExplicitness = this.dice.rollInterval(1, 10);
		magicSystem.sourcePersonalness = this.dice.random() > 0.5 ? 'impersonal' : 'personal';
		magicSystem.sourceOrigin = new MagicOriginTable().roleWithCascade(this.dice).text;
		magicSystem.sourceExternalKnowledge = new KnowledgeTable().roleWithCascade(this.dice).text;
		magicSystem.sourceInternalKnowledge = new KnowledgeTable().roleWithCascade(this.dice).text;

		// Channel
		magicSystem.channel = new MagicChannelTable().roleWithCascade(this.dice).text;
		magicSystem.channelExplicitness = this.dice.rollInterval(1, 10);
		magicSystem.channelReliability = this.dice.rollInterval(1, 10);
		magicSystem.channelPersonalness = this.dice.random() > 0.5 ? 'impersonal' : 'personal';
		magicSystem.channelOrigin = new MagicOriginTable().roleWithCascade(this.dice).text;
		magicSystem.channelExternalKnowledge = new KnowledgeTable().roleWithCascade(this.dice).text;
		magicSystem.channelInternalKnowledge = new KnowledgeTable().roleWithCascade(this.dice).text;

		// Method
		magicSystem.method = new CastingMethodTable().roleWithCascade(this.dice).text;
		magicSystem.methodExplicitness = this.dice.rollInterval(1, 10);
		magicSystem.methodReliability = this.dice.rollInterval(1, 10);
		magicSystem.methodPersonalness = this.dice.random() > 0.5 ? 'impersonal' : 'personal';
		magicSystem.methodOrigin = new MagicOriginTable().roleWithCascade(this.dice).text;
		magicSystem.methodExternalKnowledge = new KnowledgeTable().roleWithCascade(this.dice).text;
		magicSystem.methodInternalKnowledge = new KnowledgeTable().roleWithCascade(this.dice).text;

		// Visual
		magicSystem.visual = new MagicVisualTable().roleWithCascade(this.dice).text;

		// Senses
		const numberOfSenses = this.dice.rollInterval(1, 3);
		for (let i = 0; i < numberOfSenses; i++) {
			const sense = new MagicSensesTable().roleWithCascade(this.dice).text;
			if (!magicSystem.senses.includes(sense)) {
				magicSystem.senses.push(sense);
			}
		}

		// Other properties
		magicSystem.easeOfUse = new DifficultyTable().roleWithCascade(this.dice).text;
		if (this.property === 'natural') {
			magicSystem.naturalness = this.dice.random() > 0.5 ? 'all' : 'large';
		} else {
			magicSystem.naturalness = new AmountTable().roleWithCascade(this.dice).text;
		}
		magicSystem.rationality = this.dice.random() > 0.5 ? 'rational' : 'irrational';
		magicSystem.consistency = this.dice.random() > 0.5 ? 'consistent' : 'inconsistent';
		magicSystem.prevalence = new PrevalenceTable().roleWithCascade(this.dice).text;
		magicSystem.secondLevelUse = new MagicSecondLevelUseTable().roleWithCascade(this.dice).text;
		magicSystem.origin = this.dice.random() > 0.5 ? 'internal' : 'external';
		magicSystem.wording = new MagicSystemWordingTable().roleWithCascade(this.dice).text;
		magicSystem.powerArc = new PowerArcTable().roleWithCascade(this.dice).text;

		// Improvement methods
		const numberOfImprovementMethods = this.dice.rollInterval(1, 6);
		for (let i = 0; i < numberOfImprovementMethods; i++) {
			magicSystem.improvementMethods.push(new ImprovementTable().roleWithCascade(this.dice).text);
		}

		// Magic change events
		const numberOfMagicChangeEvents = this.dice.rollInterval(0, 2);
		for (let i = 0; i < numberOfMagicChangeEvents; i++) {
			const event = new MagicAttributeTable().roleWithCascade(this.dice).text;
			const change = this.dice.random() > 0.5 ? 'more' : 'less';
			if (!magicSystem.magicChangeEvents.includes(event)) {
				magicSystem.magicChangeEvents.push(event + ' - ' + change);
			}
		}

		// Optional event and fluff
		if (this.dice.random() > 0.5) {
			magicSystem.event = new MagicEventTable().roleWithCascade(this.dice).text;
		}
		if (this.dice.random() > 0.5) {
			magicSystem.fluff = new MagicFluffTable().roleWithCascade(this.dice).text;
		}

		// Commonality
		magicSystem.commonalityPast = new QuantityTable().roleWithCascade(this.dice).text;
		magicSystem.commonalityPresent = new QuantityTable().roleWithCascade(this.dice).text;
		magicSystem.commonalityFuture = new QuantityTable().roleWithCascade(this.dice).text;

		// Apply hardness modifiers
		if (isHard === 3) {
			this.changeHardness(magicSystem, 5, 5);
			magicSystem.consistency = 'consistent';
		} else if (isHard === 1) {
			this.changeHardness(magicSystem, 0, 5);
		}

		// Apply tech modifiers
		if (isTech === 3) {
			this.changeInternalKnowledge(magicSystem, 3, 0);
			this.changeTransferability(magicSystem, 2, 0);
			magicSystem.rationality = 'rational';
			magicSystem.consistency = 'consistent';
			const isOnceOnlyUseSystem = this.dice.random() > 0.7;
			if (isOnceOnlyUseSystem) {
				magicSystem.method = 'create item and use it once';
			} else {
				magicSystem.method = 'create item and use it sometimes';
			}
		} else if (isTech === 2) {
			this.changeInternalKnowledge(magicSystem, 3, 3);
			this.changeTransferability(magicSystem, 2, 1);
		}

		// Apply religion modifiers
		if (isReligion === 3) {
			this.changeExternalKnowledge(magicSystem, 3, 0);
			const diceRoll = this.dice.rollInterval(0, 2);
			magicSystem.prevalence = prevalences[diceRoll];
			const sourceRoll = this.dice.rollInterval(0, magicAbilitySourcesFromEntity.length - 1);
			magicSystem.source = magicAbilitySourcesFromEntity[sourceRoll];
		} else if (isReligion === 2) {
			this.changeExternalKnowledge(magicSystem, 3, 3);
			const diceRoll = this.dice.rollInterval(1, 3);
			magicSystem.prevalence = prevalences[diceRoll];
		}

		// Calculate derived values
		this.setHardness(magicSystem);
		this.setTech(magicSystem);
		this.setLevelOfFantasy(magicSystem);
		this.setReligion(magicSystem);

		// Generate description
		magicSystem.description = this.generateDescription(magicSystem);

		return magicSystem;
	}

	private changeInternalKnowledge(magicSystem: MagicSystem, sides: number, offset: number) {
		magicSystem.abilityInternalKnowledge = this.getKnowledge(sides, offset);
		magicSystem.powerInternalKnowledge = this.getKnowledge(sides, offset);
		magicSystem.ruleInternalKnowledge = this.getKnowledge(sides, offset);
		magicSystem.weaknessInternalKnowledge = this.getKnowledge(sides, offset);
		magicSystem.costInternalKnowledge = this.getKnowledge(sides, offset);
		magicSystem.limitationInternalKnowledge = this.getKnowledge(sides, offset);
		magicSystem.balancingInternalKnowledge = this.getKnowledge(sides, offset);
		magicSystem.sideEffectInternalKnowledge = this.getKnowledge(sides, offset);
		magicSystem.preparationInternalKnowledge = this.getKnowledge(sides, offset);
		magicSystem.sourceInternalKnowledge = this.getKnowledge(sides, offset);
		magicSystem.channelInternalKnowledge = this.getKnowledge(sides, offset);
		magicSystem.methodInternalKnowledge = this.getKnowledge(sides, offset);
	}

	private getKnowledge(sides: number, offset: number): string {
		const diceRoll = this.dice.rollInterval(0 + offset, sides - 1 + offset);
		return knowledge[Math.min(diceRoll, knowledge.length - 1)];
	}

	private changeHardness(magicSystem: MagicSystem, offset: number, sides: number) {
		magicSystem.abilityExplicitness = this.dice.rollInterval(offset, sides + offset);
		magicSystem.abilityReliability = this.dice.rollInterval(offset, sides + offset);
		magicSystem.powerExplicitness = this.dice.rollInterval(offset, sides + offset);
		magicSystem.powerReliability = this.dice.rollInterval(offset, sides + offset);
		magicSystem.ruleExplicitness = this.dice.rollInterval(offset, sides + offset);
		magicSystem.ruleReliability = this.dice.rollInterval(offset, sides + offset);
		magicSystem.weaknessExplicitness = this.dice.rollInterval(offset, sides + offset);
		magicSystem.weaknessReliability = this.dice.rollInterval(offset, sides + offset);
		magicSystem.costExplicitness = this.dice.rollInterval(offset, sides + offset);
		magicSystem.costReliability = this.dice.rollInterval(offset, sides + offset);
		magicSystem.limitationExplicitness = this.dice.rollInterval(offset, sides + offset);
		magicSystem.limitationReliability = this.dice.rollInterval(offset, sides + offset);
		magicSystem.balancingExplicitness = this.dice.rollInterval(offset, sides + offset);
		magicSystem.balancingReliability = this.dice.rollInterval(offset, sides + offset);
		magicSystem.sideEffectExplicitness = this.dice.rollInterval(offset, sides + offset);
		magicSystem.sideEffectReliability = this.dice.rollInterval(offset, sides + offset);
		magicSystem.preparationExplicitness = this.dice.rollInterval(offset, sides + offset);
		magicSystem.preparationReliability = this.dice.rollInterval(offset, sides + offset);
		magicSystem.sourceExplicitness = this.dice.rollInterval(offset, sides + offset);
		magicSystem.channelExplicitness = this.dice.rollInterval(offset, sides + offset);
		magicSystem.channelReliability = this.dice.rollInterval(offset, sides + offset);
		magicSystem.methodExplicitness = this.dice.rollInterval(offset, sides + offset);
		magicSystem.methodReliability = this.dice.rollInterval(offset, sides + offset);
	}

	private setReligion(magicSystem: MagicSystem) {
		let prevalenceFactor = 0;
		switch (magicSystem.prevalence) {
			case 'rare':
				prevalenceFactor = 1;
				break;
			case 'uncommon':
				prevalenceFactor = 4;
				break;
			case 'common':
				prevalenceFactor = 6;
				break;
			case 'very common':
				prevalenceFactor = 8;
				break;
			case 'all':
				prevalenceFactor = 10;
				break;
		}

		magicSystem.religionValue = Math.round(
			((prevalenceFactor +
				knowledgeToNumber(magicSystem.abilityExternalKnowledge) +
				knowledgeToNumber(magicSystem.powerExternalKnowledge) +
				knowledgeToNumber(magicSystem.ruleExternalKnowledge) +
				knowledgeToNumber(magicSystem.weaknessExternalKnowledge) +
				knowledgeToNumber(magicSystem.costExternalKnowledge) +
				knowledgeToNumber(magicSystem.limitationExternalKnowledge) +
				knowledgeToNumber(magicSystem.balancingExternalKnowledge) +
				knowledgeToNumber(magicSystem.sideEffectExternalKnowledge) +
				knowledgeToNumber(magicSystem.preparationExternalKnowledge) +
				knowledgeToNumber(magicSystem.sourceExternalKnowledge) +
				knowledgeToNumber(magicSystem.channelExternalKnowledge) +
				knowledgeToNumber(magicSystem.methodExternalKnowledge)) *
				100) /
				130
		);
	}

	private setLevelOfFantasy(magicSystem: MagicSystem) {
		const isMighty = magicSystem.power === 'mighty' || magicSystem.power === 'strong';
		const isCommon = magicSystem.commonalityPresent === 'all' || magicSystem.commonalityPresent === 'many';

		magicSystem.levelOfFantasy = 'Low';
		if (isMighty && isCommon) {
			magicSystem.levelOfFantasy = 'High';
		}
	}

	private setTech(magicSystem: MagicSystem) {
		magicSystem.tech = Math.round(
			((magicSystem.hardness +
				transferToNumber(magicSystem.abilityTransferability) +
				transferToNumber(magicSystem.costTransferability) +
				transferToNumber(magicSystem.powerTransferability) +
				transferToNumber(magicSystem.weaknessTransferability) +
				knowledgeToNumber(magicSystem.abilityInternalKnowledge) +
				knowledgeToNumber(magicSystem.costInternalKnowledge) +
				knowledgeToNumber(magicSystem.powerInternalKnowledge) +
				knowledgeToNumber(magicSystem.weaknessInternalKnowledge) +
				knowledgeToNumber(magicSystem.ruleInternalKnowledge) +
				knowledgeToNumber(magicSystem.limitationInternalKnowledge) +
				knowledgeToNumber(magicSystem.balancingInternalKnowledge) +
				knowledgeToNumber(magicSystem.sideEffectInternalKnowledge) +
				knowledgeToNumber(magicSystem.preparationInternalKnowledge) +
				knowledgeToNumber(magicSystem.sourceInternalKnowledge) +
				knowledgeToNumber(magicSystem.channelInternalKnowledge) +
				knowledgeToNumber(magicSystem.methodInternalKnowledge)) *
				100) /
				260
		);
	}

	private setHardness(magicSystem: MagicSystem) {
		magicSystem.hardness = Math.round(
			((magicSystem.abilityExplicitness +
				magicSystem.abilityReliability +
				knowledgeToNumber(magicSystem.abilityInternalKnowledge) +
				magicSystem.powerExplicitness +
				magicSystem.powerReliability +
				knowledgeToNumber(magicSystem.powerInternalKnowledge) +
				magicSystem.ruleExplicitness +
				magicSystem.ruleReliability +
				knowledgeToNumber(magicSystem.ruleInternalKnowledge) +
				magicSystem.weaknessExplicitness +
				magicSystem.weaknessReliability +
				knowledgeToNumber(magicSystem.weaknessInternalKnowledge) +
				magicSystem.costExplicitness +
				magicSystem.costReliability +
				knowledgeToNumber(magicSystem.costInternalKnowledge) +
				magicSystem.limitationExplicitness +
				magicSystem.limitationReliability +
				knowledgeToNumber(magicSystem.limitationInternalKnowledge) +
				magicSystem.balancingExplicitness +
				magicSystem.balancingReliability +
				knowledgeToNumber(magicSystem.balancingInternalKnowledge) +
				magicSystem.sideEffectExplicitness +
				magicSystem.sideEffectReliability +
				knowledgeToNumber(magicSystem.sideEffectInternalKnowledge) +
				magicSystem.preparationExplicitness +
				magicSystem.preparationReliability +
				knowledgeToNumber(magicSystem.preparationInternalKnowledge) +
				magicSystem.sourceExplicitness +
				knowledgeToNumber(magicSystem.sourceInternalKnowledge) +
				magicSystem.channelExplicitness +
				magicSystem.channelReliability +
				knowledgeToNumber(magicSystem.channelInternalKnowledge) +
				magicSystem.methodExplicitness +
				magicSystem.methodReliability +
				knowledgeToNumber(magicSystem.methodInternalKnowledge)) *
				100) /
				350
		);
	}

	private changeTransferability(magicSystem: MagicSystem, sides: number, offset: number) {
		magicSystem.abilityTransferability = this.getTransferability(sides, offset);
		magicSystem.powerTransferability = this.getTransferability(sides, offset);
		magicSystem.weaknessTransferability = this.getTransferability(sides, offset);
		magicSystem.costTransferability = this.getTransferability(sides, offset);
	}

	private getTransferability(sides: number, offset: number): string {
		const diceRoll = this.dice.rollInterval(0 + offset, sides - 1 + offset);
		return transferabilities[Math.min(diceRoll, transferabilities.length - 1)];
	}

	private changeExternalKnowledge(magicSystem: MagicSystem, sides: number, offset: number) {
		magicSystem.abilityExternalKnowledge = this.getKnowledge(sides, offset);
		magicSystem.powerExternalKnowledge = this.getKnowledge(sides, offset);
		magicSystem.ruleExternalKnowledge = this.getKnowledge(sides, offset);
		magicSystem.weaknessExternalKnowledge = this.getKnowledge(sides, offset);
		magicSystem.costExternalKnowledge = this.getKnowledge(sides, offset);
		magicSystem.limitationExternalKnowledge = this.getKnowledge(sides, offset);
		magicSystem.balancingExternalKnowledge = this.getKnowledge(sides, offset);
		magicSystem.sideEffectExternalKnowledge = this.getKnowledge(sides, offset);
		magicSystem.preparationExternalKnowledge = this.getKnowledge(sides, offset);
		magicSystem.sourceExternalKnowledge = this.getKnowledge(sides, offset);
		magicSystem.channelExternalKnowledge = this.getKnowledge(sides, offset);
		magicSystem.methodExternalKnowledge = this.getKnowledge(sides, offset);
	}

	private generateDescription(magicSystem: MagicSystem): string {
		let desc = `${magicSystem.name} is a magic system with ${magicSystem.power} power. `;
		desc += `Magic comes from ${magicSystem.source} and is channeled through ${magicSystem.channel}. `;
		desc += `The cost of using magic is ${magicSystem.cost}. `;

		if (magicSystem.hardness > 66) {
			desc += `This is a hard magic system with clear rules and limitations. `;
		} else if (magicSystem.hardness < 33) {
			desc += `This is a soft magic system with mysterious and unpredictable effects. `;
		}

		if (magicSystem.tech > 66) {
			desc += `Magic is highly technological and scientific. `;
		}

		if (magicSystem.religionValue > 66) {
			desc += `Magic has strong religious or divine connections. `;
		}

		return desc;
	}

	withMagicSystemProperty(magicSystemProperty: string): MagicSystemCreator {
		this.property = magicSystemProperty;
		return this;
	}
}
