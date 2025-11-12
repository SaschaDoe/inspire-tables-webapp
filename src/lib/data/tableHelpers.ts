/**
 * Helper utilities for working with the auto-generated table metadata
 */

import { tableMetadata, loadTable, type TableMetadata } from './tableMetadata.generated';
import type { Table } from '$lib/tables/table';
import { TableType } from '$lib/tables/tableType';

/**
 * Category info with icon and color for UI
 */
export interface CategoryInfo {
	name: string;
	type: TableType;
	icon: string;
	color: string;
	metadata: TableMetadata[];
}

/**
 * Category display configuration
 */
const categoryConfig: Record<TableType, { icon: string; color: string }> = {
	[TableType.Adventure]: { icon: '🗺️', color: 'blue' },
	[TableType.Character]: { icon: '👤', color: 'green' },
	[TableType.Monster]: { icon: '👹', color: 'red' },
	[TableType.Talent]: { icon: '✨', color: 'purple' },
	[TableType.Location]: { icon: '📍', color: 'yellow' },
	[TableType.Dungeon]: { icon: '🏰', color: 'gray' },
	[TableType.Town]: { icon: '🏘️', color: 'cyan' },
	[TableType.Artefact]: { icon: '⚔️', color: 'orange' },
	[TableType.Other]: { icon: '🎲', color: 'slate' },
	[TableType.Fraction]: { icon: '⚔️', color: 'red' },
	[TableType.Nation]: { icon: '🏛️', color: 'indigo' },
	[TableType.Culture]: { icon: '🎭', color: 'pink' },
	[TableType.Campaign]: { icon: '📖', color: 'amber' },
	[TableType.SoloRPG]: { icon: '🎲', color: 'purple' }
};

/**
 * Get all categories with their metadata
 */
export function getAllCategories(): CategoryInfo[] {
	return tableMetadata.map((category) => {
		const config = categoryConfig[category.type] || { icon: '📋', color: 'gray' };
		return {
			name: category.type,
			type: category.type,
			icon: config.icon,
			color: config.color,
			metadata: category.tables
		};
	});
}

/**
 * Get category by type
 */
export function getCategoryByType(type: TableType): CategoryInfo | undefined {
	const category = tableMetadata.find((cat) => cat.type === type);
	if (!category) return undefined;

	const config = categoryConfig[type] || { icon: '📋', color: 'gray' };
	return {
		name: category.type,
		type: category.type,
		icon: config.icon,
		color: config.color,
		metadata: category.tables
	};
}

/**
 * Load all tables for a category
 * Returns an array of loaded Table instances
 */
export async function loadTablesForCategory(type: TableType): Promise<Table[]> {
	const category = tableMetadata.find((cat) => cat.type === type);
	if (!category) return [];

	// Load all tables in parallel
	const tablePromises = category.tables.map((metadata) => loadTable(metadata));
	return await Promise.all(tablePromises);
}

/**
 * Find table metadata by title
 */
export function findTableByTitle(title: string): TableMetadata | undefined {
	for (const category of tableMetadata) {
		const table = category.tables.find((t) => t.title === title);
		if (table) return table;
	}
	return undefined;
}

/**
 * Load a specific table by title
 */
export async function loadTableByTitle(title: string): Promise<Table | null> {
	const metadata = findTableByTitle(title);
	if (!metadata) return null;
	return await loadTable(metadata);
}

/**
 * Get table count by category
 */
export function getTableCountsByCategory(): Record<string, number> {
	const counts: Record<string, number> = {};
	for (const category of tableMetadata) {
		counts[category.type] = category.tables.length;
	}
	return counts;
}

/**
 * Get total table count
 */
export function getTotalTableCount(): number {
	return tableMetadata.reduce((total, category) => total + category.tables.length, 0);
}
