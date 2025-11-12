import { Creator } from '../base/creator';
import { Villain } from './villain';
import { CharacterCreator } from './characterCreator';
import { CharacterShadowArchetypeTable } from '$lib/tables/charTables/characterShadowArchetypeTable';
import { VillainAdjectiveTable } from '$lib/tables/adventureTables/villainAdjectiveTable';
import { PlanTable } from '$lib/tables/adventureTables/planTable';

export class VillainCreator extends Creator<Villain> {
	create(): Villain {
		const villain = new Villain();

		// Use CharacterCreator to populate base character fields
		const baseCharacter = new CharacterCreator().withDice(this.dice).create();

		// Copy all character properties
		Object.assign(villain, baseCharacter);

		// Add villain-specific properties
		villain.archetype = new CharacterShadowArchetypeTable().roleWithCascade(this.dice).text;

		const adjective = new VillainAdjectiveTable().roleWithCascade(this.dice).text;
		const plan = new PlanTable().roleWithCascade(this.dice).text;
		villain.scheme = `${adjective} plan to ${plan}`;

		// Villains tend to have stronger attributes (add +2 to key stats)
		villain.attributes.intelligence += 2;
		villain.attributes.charisma += 2;
		villain.attributes.willpower += 2;

		return villain;
	}
}
