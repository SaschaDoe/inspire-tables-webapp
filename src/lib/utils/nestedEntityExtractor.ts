import type { Entity, EntityType } from '$lib/types/entity';
import { entityStore } from '$lib/stores/entityStore';
import { EntityType as ET } from '$lib/types/entity';

/**
 * Configuration mapping entity types to their nested entity properties
 * This defines which properties on a generated entity contain nested entities
 */
const nestedEntityConfig: Record<string, Array<{ propertyName: string; childType: EntityType }>> = {
	[ET.Dungeon]: [
		{ propertyName: 'rooms', childType: ET.Room },
		{ propertyName: 'entrances', childType: ET.Entrance },
		{ propertyName: 'monsters', childType: ET.Monster }
	],
	[ET.MagicSystem]: [
		{ propertyName: 'spells', childType: ET.Spell }
	],
	[ET.Character]: [
		{ propertyName: 'talents', childType: ET.Talent }
	],
	[ET.Monster]: [
		{ propertyName: 'talents', childType: ET.Talent }
	],
	[ET.Villain]: [
		{ propertyName: 'talents', childType: ET.Talent }
	],
	[ET.Entrance]: [
		{ propertyName: 'traps', childType: ET.Trap }
	],
	[ET.Sign]: [
		{ propertyName: 'characters', childType: ET.Character },
		{ propertyName: 'buildings', childType: ET.Building }
	],
	[ET.God]: [
		{ propertyName: 'habitat', childType: ET.Sphere }
	],
	[ET.Faction]: [
		{ propertyName: 'sign', childType: ET.Sign },
		{ propertyName: 'members', childType: ET.Character },
		{ propertyName: 'rituals', childType: ET.Ritual }
	],
	[ET.Universe]: [
		{ propertyName: 'sphereConnections', childType: ET.SphereConnection }
	],
	[ET.Galaxy]: [
		{ propertyName: 'solarSystems', childType: ET.SolarSystem }
	]
};

/**
 * Wraps a nested entity object with full Entity interface properties
 */
function wrapNestedEntity(
	nestedEntity: any,
	type: EntityType,
	parentEntity: Entity
): Entity {
	return {
		// Spread all properties from the nested entity first
		...nestedEntity,
		// Then override with Entity interface requirements
		id: nestedEntity.id || crypto.randomUUID(),
		type: type,
		name: nestedEntity.name || `${type} ${(nestedEntity.id || '').slice(0, 8)}`,
		description: nestedEntity.description || '',
		tags: nestedEntity.tags || [],
		parentId: parentEntity.id,
		campaignId: parentEntity.campaignId,
		metadata: {
			createdAt: new Date(),
			updatedAt: new Date()
		},
		relationships: [
			{
				targetId: parentEntity.id,
				type: 'parent',
				label: 'part of'
			}
		],
		customFields: { generatedEntity: nestedEntity }
	};
}

/**
 * Extracts nested entities from a generated entity and saves them to the store
 * This handles entities like Dungeons that have nested rooms, entrances, etc.
 *
 * @param parentEntity - The parent Entity (already wrapped and saved to store)
 * @returns Array of extracted and saved nested entities
 */
export function extractAndSaveNestedEntities(parentEntity: Entity): Entity[] {
	const extractedEntities: Entity[] = [];

	// Get the generated entity from customFields
	const generatedEntity = parentEntity.customFields?.generatedEntity;
	if (!generatedEntity) {
		console.log('[nestedEntityExtractor] No generatedEntity in customFields for', parentEntity.type);
		return extractedEntities;
	}

	// Get nested entity configuration for this entity type
	const nestedConfig = nestedEntityConfig[parentEntity.type];
	if (!nestedConfig) {
		console.log('[nestedEntityExtractor] No config for entity type:', parentEntity.type);
		return extractedEntities;
	}

	console.log(`[nestedEntityExtractor] Extracting nested entities from ${parentEntity.type} (${parentEntity.name})`);

	// Extract each type of nested entity
	for (const config of nestedConfig) {
		const nestedArray = generatedEntity[config.propertyName];

		// Handle both arrays and single objects
		const items = Array.isArray(nestedArray)
			? nestedArray
			: (nestedArray ? [nestedArray] : []);

		console.log(`[nestedEntityExtractor] Found ${items.length} ${config.childType} entities in ${config.propertyName}`);

		for (const nestedEntity of items) {
			if (!nestedEntity || typeof nestedEntity !== 'object') continue;

			// Wrap the nested entity with full Entity properties
			const wrappedEntity = wrapNestedEntity(nestedEntity, config.childType, parentEntity);
			console.log(`[nestedEntityExtractor] Wrapped ${config.childType}:`, {
				id: wrappedEntity.id,
				type: wrappedEntity.type,
				name: wrappedEntity.name
			});

			// Save to entity store
			entityStore.createEntity(wrappedEntity);
			extractedEntities.push(wrappedEntity);

			// Recursively extract nested entities from this entity
			// (e.g., talents from characters, traps from entrances)
			const childNestedEntities = extractAndSaveNestedEntities(wrappedEntity);
			extractedEntities.push(...childNestedEntities);
		}
	}

	return extractedEntities;
}

/**
 * Get nested entity configuration for a specific entity type
 */
export function getNestedEntityConfig(entityType: EntityType) {
	return nestedEntityConfig[entityType] || [];
}
