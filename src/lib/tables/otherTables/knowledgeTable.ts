import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

export function knowledgeToNumber(knowledge: string): number {
	switch (knowledge) {
		case 'general known':
			return 10;
		case 'known by many persons':
			return 8;
		case 'known by certain groups':
			return 6;
		case 'known by certain group':
			return 4;
		case 'known by some persons':
			return 3;
		case 'unknown':
			return 1;
		default:
			return 0;
	}
}

export const knowledge = [
	'general known', // 10
	'known by many persons', // 8
	'known by certain groups', // 6
	'known by certain group', // 4
	'known by some persons', // 3
	'unknown' // 1
];

export class KnowledgeTable extends Table {
	constructor() {
		const entries = knowledge.map((k) => new TableEntry(k));
		super(entries, TableTitles.Default);
	}
}
