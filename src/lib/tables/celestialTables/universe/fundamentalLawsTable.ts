import { Table } from '../../table';
import { TableEntry } from '../../tableEntry';
import { TableTitles } from '../../tableTitles';
import { TableType } from '../../tableType';

const fundamentalLaws: string[] = [
	'thermodynamics dictates entropy always increases',
	'conservation of energy and matter applies universally',
	'causality flows strictly forward in time',
	'action and reaction are always equal and opposite',
	'information cannot be created or destroyed',
	'consciousness shapes quantum probability',
	'symmetry breaking creates all diversity',
	'resonance and harmony govern interactions',
	'balance must be maintained between opposing forces',
	'chaos and order eternally dance in equilibrium',
	'willpower can bend reality through belief',
	'sacrifice is required for all creation',
	'names and true words hold power over things',
	'everything is connected through hidden threads',
	'cycles repeat but never identically',
	'complexity emerges from simple rules',
	'all possibilities exist until observed',
	'intention creates reality from potential',
	'suffering is the price of existence',
	'love is the fundamental force binding all things'
];

export class FundamentalLawsTable extends Table {
	constructor() {
		const entries = fundamentalLaws.map((law) => new TableEntry(law));
		super(entries, TableTitles.FundamentalLaws);
		this.tableType = TableType.Other;
	}
}
