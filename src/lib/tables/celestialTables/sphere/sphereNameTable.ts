import { Table } from '../../table';
import { TableEntry } from '../../tableEntry';
import { TableTitles } from '../../tableTitles';
import { TableType } from '../../tableType';
import { SphereNamePrefixesTable } from './sphereNamePrefixesTable';
import { SphereNameSuffixesTable } from './sphereNameSuffixesTable';

export class SphereNameTable extends Table {
	constructor() {
		const entries = [
			new TableEntry('')
				.withCascadingRole(new SphereNamePrefixesTable())
				.withCascadingRole(new SphereNameSuffixesTable())
		];
		super(entries, TableTitles.SphereName);
		this.tableType = TableType.Other;
	}
}
