import { Creator } from '../base/creator';
import { Illness } from './illness';
import { TimeTable } from '$lib/tables/otherTables/timeTable';
import { IllnessTypeTable } from '$lib/tables/illnessTables/illnessTypeTable';
import { IllnessSymptomTable } from '$lib/tables/illnessTables/illnessSymptomTable';
import { IllnessCureTable } from '$lib/tables/illnessTables/illnessCureTable';
import { IllnessOriginTable } from '$lib/tables/illnessTables/illnessOriginTable';
import { IllnessWorldEffectTable } from '$lib/tables/illnessTables/illnessWorldEffectTable';
import { IllnessLoreTable } from '$lib/tables/illnessTables/illnessLoreTable';
import { MagicalTalentTable } from '$lib/tables/talentTables/magicalTalentTable';
import { IllnessTransmissionTable } from '$lib/tables/illnessTables/illnessTransmissionTable';
import { IllnessAdjectiveTable } from '$lib/tables/illnessTables/illnessAdjectiveTable';

export class IllnessCreator extends Creator<Illness> {
	create(): Illness {
		const illness = new Illness();

		illness.adjective = new IllnessAdjectiveTable().roleWithCascade(this.dice).text;
		illness.time = new TimeTable().roleWithCascade(this.dice).text;
		illness.type = new IllnessTypeTable().roleWithCascade(this.dice).text;

		// Generate 1-3 beginning symptoms
		const numBeginningSymptoms = this.dice.rollInterval(1, 3);
		for (let i = 0; i < numBeginningSymptoms; i++) {
			illness.beginningSymptoms.push(
				new IllnessSymptomTable().roleWithCascade(this.dice).text
			);
		}

		// Generate 1-3 symptoms
		const numSymptoms = this.dice.rollInterval(1, 3);
		for (let i = 0; i < numSymptoms; i++) {
			illness.symptoms.push(new IllnessSymptomTable().roleWithCascade(this.dice).text);
		}

		// Generate 0-1 magical symptoms (50% chance)
		if (this.dice.random() < 0.5) {
			illness.symptoms.push(new MagicalTalentTable().roleWithCascade(this.dice).text);
		}

		illness.cure = new IllnessCureTable().roleWithCascade(this.dice).text;
		illness.origin = new IllnessOriginTable().roleWithCascade(this.dice).text;
		illness.worldEffect = new IllnessWorldEffectTable().roleWithCascade(this.dice).text;
		illness.lore = new IllnessLoreTable().roleWithCascade(this.dice).text;
		illness.age = new TimeTable().roleWithCascade(this.dice).text;
		illness.transmission = new IllnessTransmissionTable().roleWithCascade(this.dice).text;

		// Generate name and description
		illness.name = this.generateName(illness);
		illness.description = this.generateDescription(illness);

		return illness;
	}

	private capitalize(text: string): string {
		return text.charAt(0).toUpperCase() + text.slice(1);
	}

	private generateName(illness: Illness): string {
		return `The ${this.capitalize(illness.adjective)} ${this.capitalize(illness.type)}`;
	}

	private generateDescription(illness: Illness): string {
		const beginningSymptomsList = illness.beginningSymptoms.join(', ');
		const symptomsList = illness.symptoms.join(', ');

		return `A ${illness.time}-lasting ${illness.adjective} ${illness.type} that originated from ${illness.origin}. Initially presents with ${beginningSymptomsList}, progressing to ${symptomsList}. Transmitted through ${illness.transmission}. World effect: ${illness.worldEffect}. Lore: ${illness.lore}. Age: ${illness.age}. Cure: ${illness.cure}.`;
	}
}
