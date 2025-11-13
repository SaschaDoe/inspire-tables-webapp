import { Table } from '../../table';
import { TableEntry } from '../../tableEntry';
import { TableTitles } from '../../tableTitles';
import { TableType } from '../../tableType';
import { UniverseNamePrefixesTable } from './universeNamePrefixesTable';
import { UniverseNameSuffixesTable } from './universeNameSuffixesTable';

export class UniverseNameTable extends Table {
	constructor() {
		const entries = [
			new TableEntry('')
				.withCascadingRole(new UniverseNamePrefixesTable())
				.withCascadingRole(new UniverseNameSuffixesTable())
		];
		super(entries, TableTitles.UniverseName);
		this.tableType = TableType.Name;
	}
}
