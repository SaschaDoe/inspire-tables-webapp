import { Entity } from '../base/entity';
import type { Spell } from '../spell/spell';

export class MagicSystem extends Entity {
	// Basic info
	name = '';
	description = '';

	// Ability
	ability = '';
	abilityExplicitness = 0;
	abilityReliability = 0;
	abilityPersonalness = '';
	abilityOrigin = '';
	abilityExternalKnowledge = '';
	abilityInternalKnowledge = '';
	abilityTransferability = '';

	// Power
	power = '';
	powerExplicitness = 0;
	powerReliability = 0;
	powerPersonalness = '';
	powerOrigin = '';
	powerExternalKnowledge = '';
	powerInternalKnowledge = '';
	powerTransferability = '';

	// Cost
	cost = '';
	costExplicitness = 0;
	costReliability = 0;
	costPersonalness = '';
	costOrigin = '';
	costExternalKnowledge = '';
	costInternalKnowledge = '';
	costTransferability = '';

	// Limitations
	limitations: string[] = [];
	limitationExplicitness = 0;
	limitationReliability = 0;
	limitationPersonalness = '';
	limitationOrigin = '';
	limitationExternalKnowledge = '';
	limitationInternalKnowledge = '';

	// Side Effects
	sideEffect = '';
	sideEffectExplicitness = 0;
	sideEffectReliability = 0;
	sideEffectPersonalness = '';
	sideEffectOrigin = '';
	sideEffectExternalKnowledge = '';
	sideEffectInternalKnowledge = '';

	// Preparation
	preparation = '';
	preparationExplicitness = 0;
	preparationReliability = 0;
	preparationPersonalness = '';
	preparationOrigin = '';
	preparationExternalKnowledge = '';
	preparationInternalKnowledge = '';

	// Source
	source = '';
	sourceExplicitness = 0;
	sourcePersonalness = '';
	sourceOrigin = '';
	sourceExternalKnowledge = '';
	sourceInternalKnowledge = '';

	// Rules
	rules: string[] = [];
	ruleExplicitness = 0;
	ruleReliability = 0;
	rulePersonalness = '';
	ruleOrigin = '';
	ruleExternalKnowledge = '';
	ruleInternalKnowledge = '';

	// Weakness
	weakness = '';
	weaknessExplicitness = 0;
	weaknessReliability = 0;
	weaknessPersonalness = '';
	weaknessOrigin = '';
	weaknessExternalKnowledge = '';
	weaknessInternalKnowledge = '';
	weaknessTransferability = '';

	// Balancing
	balancing = '';
	balancingExplicitness = 0;
	balancingReliability = 0;
	balancingPersonalness = '';
	balancingOrigin = '';
	balancingExternalKnowledge = '';
	balancingInternalKnowledge = '';

	// Channel
	channel = '';
	channelExplicitness = 0;
	channelReliability = 0;
	channelPersonalness = '';
	channelOrigin = '';
	channelExternalKnowledge = '';
	channelInternalKnowledge = '';

	// Method
	method = '';
	methodExplicitness = 0;
	methodReliability = 0;
	methodPersonalness = '';
	methodOrigin = '';
	methodExternalKnowledge = '';
	methodInternalKnowledge = '';

	// Other properties
	commonalityPast = '';
	commonalityPresent = '';
	commonalityFuture = '';
	event = '';
	fluff = '';
	abilities: string[] = [];
	differentiation = '';
	prevalence = '';
	secondLevelUse = '';
	origin = '';
	rationality = '';
	consistency = '';
	wording = '';
	powerArc = '';
	naturalness = '';
	improvementMethods: string[] = [];
	easeOfUse = '';
	hardness = 0;
	tech = 0;
	levelOfFantasy = '';
	religionValue = 0;
	senses: string[] = [];
	magicChangeEvents: string[] = [];
	modifier = '';
	visual = '';
	spells: Spell[] = [];
}
