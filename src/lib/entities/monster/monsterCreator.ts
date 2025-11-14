import { Creator } from '../base/creator';
import { Monster } from './monster';
import { GenderTable } from '$lib/tables/charTables/genderTable';
import { MonsterNumberTable } from '$lib/tables/monsterTables/monsterNumberTable';
import { MonsterMealTable } from '$lib/tables/monsterTables/monsterMealTable';
import { MonsterReproductionTable } from '$lib/tables/monsterTables/monsterReproductionTable';
import { AgeTable } from '$lib/tables/otherTables/ageTable';
import { MonsterEncounterTypeTable } from '$lib/tables/monsterTables/monsterEncounterTypeTable';
import { MovementTypeTable } from '$lib/tables/monsterTables/movementTypeTable';
import { TracksTable } from '$lib/tables/monsterTables/tracksTable';
import { EnemyTable } from '$lib/tables/monsterTables/enemyTable';
import { CurseTable } from '$lib/tables/charTables/curseTable';
import { MythicalCreatureTable } from '$lib/tables/monsterTables/mythicalCreatureTable';
import { TalentCreator } from '../talent/talentCreator';

export class MonsterCreator extends Creator<Monster> {
	create(): Monster {
		const monster = new Monster();
		this.setParentReference(monster); // Automatically sets parentId

		monster.gender = new GenderTable().roleWithCascade(this.dice).text;
		monster.name = this.generateMonsterName();
		monster.number = new MonsterNumberTable().roleWithCascade(this.dice).text;
		monster.eaterType = new MonsterMealTable().roleWithCascade(this.dice).text;
		monster.reproduction = new MonsterReproductionTable().roleWithCascade(this.dice).text;
		monster.age = new AgeTable().roleWithCascade(this.dice).text;
		monster.encounterType = new MonsterEncounterTypeTable().roleWithCascade(this.dice).text;
		monster.movementType = new MovementTypeTable().roleWithCascade(this.dice).text;
		monster.tracks = new TracksTable().roleWithCascade(this.dice).text;

		// 50% chance of being a cursed human
		const isOnlyCursed = this.dice.random() > 0.5;
		if (isOnlyCursed) {
			monster.races.push('human');
			monster.curse = new CurseTable().roleWithCascade(this.dice).text;
		} else {
			// 50% chance of being a chimera (hybrid of multiple races)
			const isChimera = this.dice.random() > 0.5;
			if (isChimera) {
				const numberOfRaces = this.dice.rollInterval(2, 3);
				for (let i = 0; i < numberOfRaces; i++) {
					monster.races.push(new EnemyTable().roleWithCascade(this.dice).text);
				}
			} else {
				// Single mythical creature
				monster.races.push(new MythicalCreatureTable().roleWithCascade(this.dice).text);
			}
		}

		// Generate 1-3 talents
		const numberOfTalents = this.dice.rollInterval(1, 3);
		const talentCreator = new TalentCreator();
		talentCreator.dice = this.dice;
		for (let i = 0; i < numberOfTalents; i++) {
			monster.talents.push(talentCreator.withParent(monster.id).create());
		}

		// Generate attributes (3d6 for each - stronger than regular characters)
		this.setAttributes(monster);

		return monster;
	}

	private setAttributes(monster: Monster): void {
		// Roll 3d6 for each attribute (range 3-18)
		monster.attributes.willpower =
			this.dice.rollInterval(1, 6) + this.dice.rollInterval(1, 6) + this.dice.rollInterval(1, 6);
		monster.attributes.strength =
			this.dice.rollInterval(1, 6) + this.dice.rollInterval(1, 6) + this.dice.rollInterval(1, 6);
		monster.attributes.constitution =
			this.dice.rollInterval(1, 6) + this.dice.rollInterval(1, 6) + this.dice.rollInterval(1, 6);
		monster.attributes.dexterity =
			this.dice.rollInterval(1, 6) + this.dice.rollInterval(1, 6) + this.dice.rollInterval(1, 6);
		monster.attributes.agility =
			this.dice.rollInterval(1, 6) + this.dice.rollInterval(1, 6) + this.dice.rollInterval(1, 6);
		monster.attributes.intelligence =
			this.dice.rollInterval(1, 6) + this.dice.rollInterval(1, 6) + this.dice.rollInterval(1, 6);
		monster.attributes.charisma =
			this.dice.rollInterval(1, 6) + this.dice.rollInterval(1, 6) + this.dice.rollInterval(1, 6);
		monster.attributes.intuition =
			this.dice.rollInterval(1, 6) + this.dice.rollInterval(1, 6) + this.dice.rollInterval(1, 6);
	}

	private generateMonsterName(): string {
		// Simple procedural name generator
		const consonants = 'bcdfghjklmnpqrstvwxyz';
		const vowels = 'aeiou';
		const length = this.dice.rollInterval(4, 8);
		let name = '';

		for (let i = 0; i < length; i++) {
			if (i % 2 === 0) {
				// Consonant
				name += consonants[this.dice.rollInterval(0, consonants.length - 1)];
			} else {
				// Vowel
				name += vowels[this.dice.rollInterval(0, vowels.length - 1)];
			}
		}

		// Capitalize first letter
		return name.charAt(0).toUpperCase() + name.slice(1);
	}
}
