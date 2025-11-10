import { AllTablesMap } from '$lib/tables/allTablesMap';
import { TableType } from '$lib/tables/tableType';
import type { Table } from '$lib/tables/table';

const allTablesMap = new AllTablesMap();

export interface TablesByCategory {
	category: TableType;
	tables: Table[];
}

export function getAllTables(): Table[] {
	const tables: Table[] = [];
	// Create instances of all tables via allTablesMap
	const map = new AllTablesMap();
	// Since allTablesMap doesn't expose a way to get all values,
	// we'll need to collect them based on the TableTitles
	return tables;
}

export function getTablesByCategory(): TablesByCategory[] {
	const map = new AllTablesMap();
	const categoriesMap = new Map<TableType, Table[]>();

	// We'll manually organize the main tables by category
	// This is a simplified version - you could extend this based on your needs
	const categories: TablesByCategory[] = [
		{
			category: TableType.Character,
			tables: []
		},
		{
			category: TableType.Location,
			tables: []
		},
		{
			category: TableType.Dungeon,
			tables: []
		},
		{
			category: TableType.Artefact,
			tables: []
		},
		{
			category: TableType.Talent,
			tables: []
		},
		{
			category: TableType.Monster,
			tables: []
		},
		{
			category: TableType.Town,
			tables: []
		},
		{
			category: TableType.Adventure,
			tables: []
		},
		{
			category: TableType.Culture,
			tables: []
		},
		{
			category: TableType.Other,
			tables: []
		}
	];

	return categories;
}

export { allTablesMap };
