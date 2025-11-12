import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class MythicalCreatureTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		const creatures = [
			'dragon',
			'unicorn',
			'phoenix',
			'griffin',
			'chimera',
			'sphinx',
			'centaur',
			'mermaid',
			'manticore',
			'werewolf',
			'minotaur',
			'basilisk',
			'kraken',
			'harpy',
			'gorgon',
			'cyclops',
			'nymph',
			'siren',
			'valkyrie',
			'pixie',
			'faun',
			'banshee',
			'kelpie',
			'wendigo',
			'djinn',
			'troll',
			'ogre',
			'kappa',
			'selkie',
			'kitsune',
			'vampire',
			'zombie',
			'yeti',
			'bigfoot',
			'loch ness monster',
			'cthulhu',
			'naga',
			'pegasus',
			'lindworm',
			'yokai',
			'jinn',
			'fenrir',
			'roc',
			'medusa',
			'lamia',
			'sylph',
			'fairy'
		];
		creatures.forEach((creature) => entries.push(new TableEntry(creature)));
		super(entries, TableTitles.MythicalCreature);
		this.tableType = TableType.Monster;
	}
}