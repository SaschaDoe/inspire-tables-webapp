import { Table } from '../../table';
import { TableEntry } from '../../tableEntry';
import { TableTitles } from '../../tableTitles';
import { TableType } from '../../tableType';
import { GreekLetterTable } from '../../otherTables/greekLetterTable';
import { SectorSynonymsTable } from '../sectorSynonymsTable';
import { Dice } from '../../../utils/dice';

// NOTE: This is a simplified version. The original depends on:
// - GenderTable
// - CultureCreator
// - CultureToNameList
// These would need to be ported for full functionality.

export function getName(dice: Dice): { text: string; additionalData?: any } {
	// TODO: Integrate with culture and gender tables when available
	// For now, use a simplified version with just Greek letter + sector synonym
	const greekLetter = new GreekLetterTable().roleWithCascade(dice).text;
	const sector = new SectorSynonymsTable().roleWithCascade(dice).text;

	return {
		text: `${greekLetter} ${sector}`
	};
}

export class SolarSystemNameTable extends Table {
	constructor() {
		const entries = [
			new TableEntry('').withFunctionString(() => {
				const dice = new Dice();
				return getName(dice).text;
			}),
			new TableEntry('')
				.withCascadingRole(new GreekLetterTable(), 100, '')
				.withCascadingRole(new SectorSynonymsTable(), 100, ' ')
		];
		super(entries, TableTitles.SolarSystemName);
		this.tableType = TableType.Name;
	}
}
