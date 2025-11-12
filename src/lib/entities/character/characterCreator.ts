import { Creator } from '../base/creator';
import { Character } from './character';
import { GenderTable } from '$lib/tables/charTables/genderTable';
import { RaceTable } from '$lib/tables/charTables/raceTable';
import { AlignmentTable } from '$lib/tables/charTables/alignmentTable';
import { AdvantageTable } from '$lib/tables/charTables/advantageTable';
import { DisadvantageTable } from '$lib/tables/charTables/disadvantageTable';
import { CurseTable } from '$lib/tables/charTables/curseTable';
import { MotivationTable } from '$lib/tables/charTables/motivationTable';
import { NobilityTable } from '$lib/tables/charTables/nobilityTable';
import { ProfessionTable } from '$lib/tables/charTables/professionTable';
import { CharacterAsDeviceTable } from '$lib/tables/charTables/characterAsDeviceTable';
import { TalentCreator } from '../talent/talentCreator';

export class CharacterCreator extends Creator<Character> {
	create(): Character {
		const character = new Character();

		character.gender = new GenderTable().roleWithCascade(this.dice).text;
		character.race = new RaceTable().roleWithCascade(this.dice).text;
		character.alignment = new AlignmentTable().roleWithCascade(this.dice).text;
		character.device = new CharacterAsDeviceTable().roleWithCascade(this.dice).text;

		// Conditionally add curse (10% chance)
		if (this.dice.random() > 0.9) {
			character.curse = new CurseTable().roleWithCascade(this.dice).text;
		}

		// Conditionally add disadvantage (50% chance)
		if (this.dice.random() > 0.5) {
			character.disadvantage = new DisadvantageTable().roleWithCascade(this.dice).text;
		}

		character.motivation = new MotivationTable().roleWithCascade(this.dice).text;
		character.nobility = new NobilityTable().roleWithCascade(this.dice).text;

		// Conditionally add advantage (50% chance)
		if (this.dice.random() > 0.5) {
			character.advantage = new AdvantageTable().roleWithCascade(this.dice).text;
		}

		character.profession = new ProfessionTable().roleWithCascade(this.dice).text;

		// Generate talents (1-3 talents)
		const numberOfTalents = this.dice.rollInterval(1, 3);
		for (let i = 0; i < numberOfTalents; i++) {
			const talentCreator = new TalentCreator();
			talentCreator.dice = this.dice;
			character.talents.push(talentCreator.create());
		}

		// Generate basic attributes (1-6 range for simplicity)
		character.attributes.willpower = this.dice.rollInterval(1, 6);
		character.attributes.charisma = this.dice.rollInterval(1, 6);
		character.attributes.intelligence = this.dice.rollInterval(1, 6);
		character.attributes.intuition = this.dice.rollInterval(1, 6);
		character.attributes.agility = this.dice.rollInterval(1, 6);
		character.attributes.dexterity = this.dice.rollInterval(1, 6);
		character.attributes.constitution = this.dice.rollInterval(1, 6);
		character.attributes.strength = this.dice.rollInterval(1, 6);

		// Generate Big Five personality traits (-3 to +3 range)
		character.bigFive.conscientiousness = this.dice.rollInterval(-3, 3);
		character.bigFive.agreeableness = this.dice.rollInterval(-3, 3);
		character.bigFive.neuroticism = this.dice.rollInterval(-3, 3);
		character.bigFive.openness = this.dice.rollInterval(-3, 3);
		character.bigFive.extraversion = this.dice.rollInterval(-3, 3);

		// Generate a simple name based on race (placeholder for now)
		character.name = this.generateName(character.race, character.gender);

		return character;
	}

	private generateName(race: string, gender: string): string {
		// Simplified name generation - will be enhanced with name tables later
		const prefixes = ['Ara', 'Bel', 'Cal', 'Dor', 'El', 'Fal', 'Gor', 'Hal'];
		const suffixes = ['dor', 'win', 'ric', 'beth', 'wen', 'mir', 'dren', 'thar'];

		const prefix = prefixes[this.dice.rollInterval(0, prefixes.length - 1)];
		const suffix = suffixes[this.dice.rollInterval(0, suffixes.length - 1)];

		return prefix + suffix;
	}
}
