import { Table } from '../../table';
import { TableEntry } from '../../tableEntry';
import { TableTitles } from '../../tableTitles';
import { TableType } from '../../tableType';
import { Dice } from '../../../utils/dice';
import { DiceRole } from '../../diceRole';

// Planet name components for procedural generation
const NAME_PREFIXES = [
	'Aur', 'Bel', 'Cael', 'Dor', 'Eld', 'Fen', 'Gal', 'Har', 'Ith', 'Jor',
	'Kal', 'Lun', 'Mor', 'Nex', 'Orl', 'Pol', 'Quar', 'Raz', 'Sol', 'Tar',
	'Ul', 'Ven', 'Wor', 'Xen', 'Yor', 'Zel'
];

const NAME_SUFFIXES = [
	'ion', 'ara', 'oth', 'ius', 'ax', 'or', 'us', 'is', 'on', 'um',
	'ix', 'eth', 'an', 'os', 'yn', 'ia', 'el', 'ar', 'en', 'ir'
];

export function getPlanetNameFrom(dice: Dice, culture: any): { text: string } {
	// Generate a pronounceable planet name
	const prefix = NAME_PREFIXES[dice.role(new DiceRole(1, NAME_PREFIXES.length)) - 1];
	const suffix = NAME_SUFFIXES[dice.role(new DiceRole(1, NAME_SUFFIXES.length)) - 1];

	// Occasionally add a numeric designation (20% chance)
	const hasNumber = dice.role(new DiceRole(1, 100)) <= 20;
	const number = hasNumber ? ` ${dice.role(new DiceRole(1, 9))}` : '';

	return {
		text: `${prefix}${suffix}${number}`
	};
}

export function getPlanetName(dice: Dice): { text: string } {
	return getPlanetNameFrom(dice, null);
}

export class PlanetNameTable extends Table {
	constructor() {
		// Generate procedural planet names
		const entries = [
			new TableEntry('').withFunctionString(() => {
				const dice = new Dice();
				return getPlanetName(dice).text;
			})
		];
		super(entries, TableTitles.PlanetName);
		this.tableType = TableType.Name;
	}
}
