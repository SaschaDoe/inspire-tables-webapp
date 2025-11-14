import type { Table } from '$lib/tables/table';
import { BuildingTable } from '$lib/tables/locationTables/buildingTable';
import { BuildingAdjectiveTable } from '$lib/tables/locationTables/buildingAdjectiveTable';
import { QualityTable } from '$lib/tables/otherTables/qualityTable';
import { DungeonTypeTable } from '$lib/tables/dungeonTables/dungeonTypeTable';
import { DungeonAdjectiveTable } from '$lib/tables/dungeonTables/dungeonAdjectiveTable';
import { DungeonStateTable } from '$lib/tables/dungeonTables/dungeonStateTable';
import { SizeTable } from '$lib/tables/otherTables/sizeTable';
import { AllPlanetTypeTable } from '$lib/tables/celestialTables/planet/planetTypeTable';
import { CampaignNameTable } from '$lib/tables/campaignTables/campaignNameTable';

/**
 * Configuration for a single property that can be configured
 */
export interface PropertyConfig {
	/**  Property name in the entity */
	propertyName: string;
	/** Display label for the UI */
	label: string;
	/** Type of input: 'table' for dropdown from table entries, 'select' for dropdown from fixed options, 'text' for free text input, 'number' for numeric input, 'genre' for genre editor */
	inputType: 'table' | 'select' | 'text' | 'number' | 'genre';
	/** Optional: Table class to use for dropdowns (required if inputType is 'table') */
	table?: () => Table;
	/** Optional: Fixed options for select dropdowns (required if inputType is 'select') */
	options?: string[];
	/** Optional: Placeholder text for text inputs */
	placeholder?: string;
}

/**
 * Configuration metadata for entity types
 */
export interface EntityConfigMetadata {
	/** List of configurable properties for this entity type */
	properties: PropertyConfig[];
}

/**
 * Registry of configuration metadata for each entity type
 */
export const entityConfigRegistry: Record<string, EntityConfigMetadata> = {
	campaign: {
		properties: [
			{
				propertyName: 'name',
				label: 'Campaign Name',
				inputType: 'table',
				table: () => new CampaignNameTable()
			},
			{
				propertyName: 'narrativeMediumType',
				label: 'Narrative Medium',
				inputType: 'select',
				options: ['RPG', 'Book', 'Movie', 'Video Game']
			},
			{
				propertyName: 'blendIntensity',
				label: 'Blend Intensity (1-10)',
				inputType: 'number',
				placeholder: '5'
			},
			{
				propertyName: 'genreMix',
				label: 'Genre Mix',
				inputType: 'genre'
			}
		]
	},
	building: {
		properties: [
			{
				propertyName: 'type',
				label: 'Building Type',
				inputType: 'table',
				table: () => new BuildingTable()
			},
			{
				propertyName: 'adjective',
				label: 'Adjective',
				inputType: 'table',
				table: () => new BuildingAdjectiveTable()
			},
			{
				propertyName: 'quality',
				label: 'Quality',
				inputType: 'table',
				table: () => new QualityTable()
			}
		]
	},
	dungeon: {
		properties: [
			{
				propertyName: 'type',
				label: 'Dungeon Type',
				inputType: 'table',
				table: () => new DungeonTypeTable()
			},
			{
				propertyName: 'adjective',
				label: 'Adjective',
				inputType: 'table',
				table: () => new DungeonAdjectiveTable()
			},
			{
				propertyName: 'state',
				label: 'State',
				inputType: 'table',
				table: () => new DungeonStateTable()
			},
			{
				propertyName: 'size',
				label: 'Size',
				inputType: 'table',
				table: () => new SizeTable()
			},
			{
				propertyName: 'name',
				label: 'Name',
				inputType: 'text',
				placeholder: 'Enter custom dungeon name (optional)'
			}
		]
	},
	planet: {
		properties: [
			{
				propertyName: 'name',
				label: 'Name',
				inputType: 'text',
				placeholder: 'Enter custom planet name'
			},
			{
				propertyName: 'type',
				label: 'Planet Type',
				inputType: 'table',
				table: () => new AllPlanetTypeTable()
			},
			{
				propertyName: 'size',
				label: 'Size',
				inputType: 'select',
				options: ['tiny', 'small', 'medium', 'large', 'gigantic']
			},
			{
				propertyName: 'atmosphere',
				label: 'Atmosphere',
				inputType: 'select',
				options: ['none', 'nitrogen-oxygen', 'carbon-dioxide', 'toxic', 'methane']
			},
			{
				propertyName: 'weather',
				label: 'Weather',
				inputType: 'select',
				options: ['clear', 'moderate', 'foggy', 'stormy']
			},
			{
				propertyName: 'surfaceGravity',
				label: 'Surface Gravity (g)',
				inputType: 'number',
				placeholder: '1.0'
			},
			{
				propertyName: 'rotationPeriod',
				label: 'Rotation Period (hours)',
				inputType: 'number',
				placeholder: '24'
			},
			{
				propertyName: 'obliquity',
				label: 'Axial Tilt (degrees)',
				inputType: 'number',
				placeholder: '23'
			}
		]
	}
};

/**
 * Get configuration metadata for a specific entity type
 */
export function getEntityConfigMetadata(entityType: string): EntityConfigMetadata | null {
	return entityConfigRegistry[entityType] || null;
}

/**
 * Get all available values from a table
 */
export function getTableOptions(table: Table): string[] {
	return table.entries.map(entry => entry.text);
}
