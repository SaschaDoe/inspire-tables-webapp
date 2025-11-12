import { Creator } from '../base/creator';
import { Artefact } from './artefact';
import { ProfaneArtefactTable } from '$lib/tables/artefactTables/profaneArtefactTable';
import { QualityTable } from '$lib/tables/otherTables/qualityTable';
import { MaterialsTable } from '$lib/tables/artefactTables/materialsTable';
import { RarityTable } from '$lib/tables/otherTables/rarityTable';

export class ArtefactCreator extends Creator<Artefact> {
	create(): Artefact {
		const artefact = new Artefact();

		artefact.type = new ProfaneArtefactTable().roleWithCascade(this.dice).text;
		artefact.quality = new QualityTable().roleWithCascade(this.dice).text;
		artefact.material = new MaterialsTable().roleWithCascade(this.dice).text;
		artefact.rarity = new RarityTable().roleWithCascade(this.dice).text;

		// Generate a name based on the type
		artefact.name = `${artefact.quality} ${artefact.type}`;

		// TODO: Add talents when talent system is implemented
		// const numberOfTalents = Math.floor(this.dice.random() * 3);
		// for (let i = 0; i < numberOfTalents; i++) {
		//     artefact.talents.push(new TalentCreator().withDice(this.dice).create());
		// }

		return artefact;
	}
}
