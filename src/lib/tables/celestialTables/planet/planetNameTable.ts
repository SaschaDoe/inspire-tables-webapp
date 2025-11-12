import { Table } from '../../table';
import { TableEntry } from '../../tableEntry';
import { TableTitles } from '../../tableTitles';
import { TableType } from '../../tableType';
import { Dice } from '../../../utils/dice';
import { DiceRole } from '../../diceRole';

// NOTE: This is a simplified version of the planet name table.
// The original version depends on CultureCreator and CultureToNameList which would need to be ported.
// This function signature is preserved for compatibility but returns a simple placeholder.
export function getPlanetNameFrom(dice: Dice, culture: any): { text: string } {
	// TODO: Integrate with culture system when culture tables are fully ported
	// For now, return a placeholder
	const randomSuffix = dice.role(new DiceRole(1, 6)) > 3 ? 'prime' : '';
	return {
		text: `Planet-${dice.role(new DiceRole(1, 100))}${randomSuffix ? '-' + randomSuffix : ''}`
	};
}

export function getPlanetName(dice: Dice): { text: string } {
	// TODO: Integrate with CultureCreator when available
	return getPlanetNameFrom(dice, null);
}

export class PlanetNameTable extends Table {
	constructor() {
		// Simplified version - just returns generic planet names
		const entries = [
			new TableEntry('planet').withFunctionString(() => {
				const dice = new Dice();
				return getPlanetName(dice).text;
			})
		];
		super(entries, TableTitles.PlanetName);
		this.tableType = TableType.Other;
	}
}
