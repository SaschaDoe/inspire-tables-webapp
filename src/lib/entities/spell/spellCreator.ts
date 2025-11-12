import { Creator } from '../base/creator';
import { Spell } from './spell';
import { MagicalTalentTable } from '$lib/tables/talentTables/magicalTalentTable';
import { SpellCooldownTable } from '$lib/tables/spellTables/spellCooldownTable';
import { TimeTable } from '$lib/tables/otherTables/timeTable';
import { DistanceTable } from '$lib/tables/otherTables/distanceTable';
import { SpellAreaOfEffectTable } from '$lib/tables/spellTables/spellAreaOfEffectTable';
import { SpellPreparationTable } from '$lib/tables/spellTables/spellPreparationTable';
import { SpellLoreTable } from '$lib/tables/spellTables/spellLoreTable';
import { LimitationTable } from '$lib/tables/talentTables/limitationTable';
import { SpellCounterTable } from '$lib/tables/spellTables/spellCounterTable';
import { DifficultyTable } from '$lib/tables/otherTables/difficultyTable';
import { AmountTable } from '$lib/tables/otherTables/amountTable';
import { PowerLevelTable } from '$lib/tables/otherTables/powerLevelTable';

export class SpellCreator extends Creator<Spell> {
	create(): Spell {
		const spell = new Spell();

		// Generate magical ability
		spell.ability = new MagicalTalentTable().roleWithCascade(this.dice).text;

		// Generate spell characteristics
		spell.power = new PowerLevelTable().roleWithCascade(this.dice).text;
		spell.cooldown = new SpellCooldownTable().roleWithCascade(this.dice).text;
		spell.duration = new TimeTable().roleWithCascade(this.dice).text;
		spell.range = new DistanceTable().roleWithCascade(this.dice).text;
		spell.areaOfEffect = new SpellAreaOfEffectTable().roleWithCascade(this.dice).text;
		spell.castingTime = new TimeTable().roleWithCascade(this.dice).text;

		// 50% chance of additional preparation requirement
		if (this.dice.random() > 0.5) {
			spell.additionalPreparation = new SpellPreparationTable().roleWithCascade(this.dice).text;
		}

		// Generate lore and limitations
		spell.lore = new SpellLoreTable().roleWithCascade(this.dice).text;
		spell.limitation = new LimitationTable().roleWithCascade(this.dice).text;
		spell.counter = new SpellCounterTable().roleWithCascade(this.dice).text;
		spell.complexity = new DifficultyTable().roleWithCascade(this.dice).text;
		spell.cost = new AmountTable().roleWithCascade(this.dice).text;

		// Generate name and description
		spell.name = this.generateName(spell);
		spell.description = this.generateDescription(spell);

		return spell;
	}

	private capitalize(text: string): string {
		if (!text) return '';
		return text.charAt(0).toUpperCase() + text.slice(1);
	}

	private generateName(spell: Spell): string {
		// Extract key words from ability for spell name
		const abilityWords = spell.ability.split(' ').slice(0, 3);
		return abilityWords.map((w) => this.capitalize(w)).join(' ');
	}

	private generateDescription(spell: Spell): string {
		let desc = `A ${spell.power} spell with the ability to ${spell.ability}. `;
		desc += `Requires ${spell.castingTime} to cast and has a ${spell.range} range, affecting ${spell.areaOfEffect}. `;
		desc += `Duration: ${spell.duration}. Cooldown: ${spell.cooldown}. `;

		if (spell.additionalPreparation) {
			desc += `Preparation required: ${spell.additionalPreparation}. `;
		}

		desc += `Complexity: ${spell.complexity}. Cost: ${spell.cost} mana. `;
		desc += `Limitation: ${spell.limitation}. `;
		desc += `Counter: ${spell.counter}. `;
		desc += `Lore: ${spell.lore}`;

		return desc;
	}
}
