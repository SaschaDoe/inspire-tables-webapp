/**
 * Entity Relationship Configuration
 * Defines parent-child relationships between entity types for auto-generation and navigation
 */

export interface EntityRelationship {
	/** The property name on the parent entity that holds the children */
	propertyName: string;
	/** The type of child entity */
	childType: string;
	/** Minimum number to generate */
	minCount: number;
	/** Maximum number to generate */
	maxCount: number;
	/** Human-readable label for the relationship */
	label: string;
	/** Whether this relationship should auto-generate on parent creation */
	autoGenerate: boolean;
}

export interface EntityRelationships {
	[parentType: string]: EntityRelationship[];
}

/**
 * Defines all parent-child relationships in the entity system
 */
export const entityRelationships: EntityRelationships = {
	// Campaign Structure
	Campaign: [
		{
			propertyName: 'adventures',
			childType: 'Adventure',
			minCount: 1,
			maxCount: 3,
			label: 'Adventures',
			autoGenerate: true
		},
		{
			propertyName: 'world',
			childType: 'Sphere',
			minCount: 1,
			maxCount: 1,
			label: 'World',
			autoGenerate: true
		}
	],

	// Celestial Hierarchy
	Sphere: [
		{
			propertyName: 'galaxies',
			childType: 'Galaxy',
			minCount: 1,
			maxCount: 6,
			label: 'Galaxies',
			autoGenerate: false // User must explicitly generate
		}
	],

	Galaxy: [
		{
			propertyName: 'solarSystems',
			childType: 'SolarSystem',
			minCount: 2,
			maxCount: 12,
			label: 'Solar Systems',
			autoGenerate: false
		}
	],

	SolarSystem: [
		{
			propertyName: 'planets',
			childType: 'Planet',
			minCount: 1,
			maxCount: 8,
			label: 'Planets',
			autoGenerate: false
		},
		{
			propertyName: 'stars',
			childType: 'Star',
			minCount: 1,
			maxCount: 3,
			label: 'Stars',
			autoGenerate: false
		}
	],

	Planet: [
		{
			propertyName: 'continents',
			childType: 'Continent',
			minCount: 1,
			maxCount: 7,
			label: 'Continents',
			autoGenerate: false
		}
	],

	// Location Hierarchy
	Continent: [
		{
			propertyName: 'nations',
			childType: 'Nation',
			minCount: 1,
			maxCount: 10,
			label: 'Nations',
			autoGenerate: false
		},
		{
			propertyName: 'regions',
			childType: 'Region',
			minCount: 3,
			maxCount: 15,
			label: 'Regions',
			autoGenerate: false
		}
	],

	Nation: [
		{
			propertyName: 'coatOfArms',
			childType: 'Sign',
			minCount: 1,
			maxCount: 1,
			label: 'Coat of Arms',
			autoGenerate: true
		},
		{
			propertyName: 'cities',
			childType: 'City',
			minCount: 1,
			maxCount: 20,
			label: 'Cities',
			autoGenerate: false
		},
		{
			propertyName: 'regions',
			childType: 'Region',
			minCount: 1,
			maxCount: 12,
			label: 'Regions',
			autoGenerate: false
		}
	],

	Region: [
		{
			propertyName: 'cities',
			childType: 'City',
			minCount: 1,
			maxCount: 5,
			label: 'Cities',
			autoGenerate: false
		},
		{
			propertyName: 'dungeons',
			childType: 'Dungeon',
			minCount: 0,
			maxCount: 3,
			label: 'Dungeons',
			autoGenerate: false
		}
	],

	City: [
		{
			propertyName: 'coatOfArms',
			childType: 'Sign',
			minCount: 1,
			maxCount: 1,
			label: 'Coat of Arms',
			autoGenerate: true
		},
		{
			propertyName: 'buildings',
			childType: 'Building',
			minCount: 5,
			maxCount: 50,
			label: 'Buildings',
			autoGenerate: false
		},
		{
			propertyName: 'npcs',
			childType: 'Character',
			minCount: 3,
			maxCount: 20,
			label: 'NPCs',
			autoGenerate: false
		}
	],

	// Dungeon Structure (already implemented)
	Dungeon: [
		{
			propertyName: 'entrances',
			childType: 'Entrance',
			minCount: 1,
			maxCount: 3,
			label: 'Entrances',
			autoGenerate: false // DungeonCreator already creates these as nested entities
		},
		{
			propertyName: 'monsters',
			childType: 'Monster',
			minCount: 2,
			maxCount: 4,
			label: 'Monsters',
			autoGenerate: false // DungeonCreator already creates these as nested entities
		},
		{
			propertyName: 'rooms',
			childType: 'Room',
			minCount: 3,
			maxCount: 12,
			label: 'Rooms',
			autoGenerate: false // DungeonCreator already creates these as nested entities
		}
	],

	Entrance: [
		{
			propertyName: 'traps',
			childType: 'Trap',
			minCount: 0,
			maxCount: 2,
			label: 'Traps',
			autoGenerate: true // Already auto-generates
		}
	],

	// Adventure Structure
	Adventure: [
		{
			propertyName: 'quests',
			childType: 'Quest',
			minCount: 1,
			maxCount: 5,
			label: 'Quests',
			autoGenerate: false
		},
		{
			propertyName: 'npcs',
			childType: 'Character',
			minCount: 2,
			maxCount: 8,
			label: 'NPCs',
			autoGenerate: false
		},
		{
			propertyName: 'villains',
			childType: 'Villain',
			minCount: 1,
			maxCount: 3,
			label: 'Villains',
			autoGenerate: false
		}
	],

	// Faction Structure
	Faction: [
		{
			propertyName: 'sign',
			childType: 'Sign',
			minCount: 1,
			maxCount: 1,
			label: 'Faction Sign',
			autoGenerate: true
		},
		{
			propertyName: 'members',
			childType: 'Character',
			minCount: 5,
			maxCount: 20,
			label: 'Members',
			autoGenerate: false
		},
		{
			propertyName: 'rituals',
			childType: 'Ritual',
			minCount: 1,
			maxCount: 5,
			label: 'Rituals',
			autoGenerate: false
		}
	],

	// Magic System Structure
	MagicSystem: [
		{
			propertyName: 'spells',
			childType: 'Spell',
			minCount: 5,
			maxCount: 20,
			label: 'Spells',
			autoGenerate: true
		}
	],

	// Character Structure
	Character: [
		{
			propertyName: 'talents',
			childType: 'Talent',
			minCount: 1,
			maxCount: 3,
			label: 'Talents',
			autoGenerate: true
		}
	],

	// Monster Structure
	Monster: [
		{
			propertyName: 'talents',
			childType: 'Talent',
			minCount: 1,
			maxCount: 3,
			label: 'Talents',
			autoGenerate: true
		}
	],

	// Villain Structure
	Villain: [
		{
			propertyName: 'talents',
			childType: 'Talent',
			minCount: 1,
			maxCount: 3,
			label: 'Talents',
			autoGenerate: true
		}
	],

	// Sign Structure
	Sign: [
		{
			propertyName: 'characters',
			childType: 'Character',
			minCount: 0,
			maxCount: 1,
			label: 'Characters Depicted',
			autoGenerate: true
		},
		{
			propertyName: 'buildings',
			childType: 'Building',
			minCount: 0,
			maxCount: 1,
			label: 'Buildings Depicted',
			autoGenerate: true
		}
	],

	// God Structure
	God: [
		{
			propertyName: 'habitat',
			childType: 'Sphere',
			minCount: 1,
			maxCount: 1,
			label: 'Divine Realm',
			autoGenerate: true
		}
	],

	// HexTile Structure
	HexTile: [
		{
			propertyName: 'dungeons',
			childType: 'Dungeon',
			minCount: 0,
			maxCount: 2,
			label: 'Dungeons',
			autoGenerate: false
		},
		{
			propertyName: 'settlements',
			childType: 'Settlement',
			minCount: 0,
			maxCount: 1,
			label: 'Settlements',
			autoGenerate: false
		}
	]
};

/**
 * Get relationships for a specific entity type
 */
export function getEntityRelationships(entityType: string): EntityRelationship[] {
	// Capitalize first letter to match keys in entityRelationships
	const capitalizedType = entityType.charAt(0).toUpperCase() + entityType.slice(1);
	return entityRelationships[capitalizedType] || entityRelationships[entityType] || [];
}

/**
 * Get auto-generating relationships only
 */
export function getAutoGeneratingRelationships(entityType: string): EntityRelationship[] {
	return getEntityRelationships(entityType).filter((rel) => rel.autoGenerate);
}

/**
 * Check if an entity type has any child relationships
 */
export function hasChildEntities(entityType: string): boolean {
	return getEntityRelationships(entityType).length > 0;
}

/**
 * Get random count within relationship bounds
 */
export function getRandomCount(relationship: EntityRelationship): number {
	const range = relationship.maxCount - relationship.minCount;
	return relationship.minCount + Math.floor(Math.random() * (range + 1));
}
