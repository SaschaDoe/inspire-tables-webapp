import { Table } from '../../table';
import { TableEntry } from '../../tableEntry';
import { TableTitles } from '../../tableTitles';
import { TableType } from '../../tableType';

const sphereRules: string[] = [
	'time flows slower',
	'no death',
	'gravity is reversed',
	'magic is amplified',
	'technology does not function',
	'healing is rapid',
	'aging is halted',
	'dreams manifest physically',
	'constant daylight',
	'perpetual night',
	'language barriers don\'t exist',
	'sound is muted',
	'extreme weather conditions',
	'animals can speak',
	'plants are sentient',
	'memory is unstable',
	'shadows have substance',
	'water flows upward',
	'fire is cold',
	'emotions are visible',
	'thoughts can be heard',
	'physical size is changeable',
	'mirrors show alternate realities',
	'stars are within reach',
	'spirits are tangible'
];

export class SphereRuleTable extends Table {
	constructor() {
		const entries = sphereRules.map((rule) => new TableEntry(rule));
		super(entries, TableTitles.SphereRules);
		this.tableType = TableType.Other;
	}
}
