import type { Entity, EntityType } from '$lib/types/entity';
import { entityStore } from '$lib/stores/entityStore';
import { getNestedEntityConfigCached } from './entityHierarchy';

/**
 * Get nested entity configuration for a specific entity type.
 * This is auto-generated from creator NESTED_ENTITY_RULES - no manual maintenance needed!
 *
 * To add a new parent-child relationship:
 * 1. Add `parentId = ''` to the child entity
 * 2. Define `NESTED_ENTITY_RULES` in the parent creator (you likely already have this!)
 * 3. Call `this.setParentReference(entity)` in child creator's create()
 * 4. Call `.withParent(parent.id)` when parent creates children
 *
 * The nested entity configuration is automatically detected from your NESTED_ENTITY_RULES.
 */
export function getNestedEntityConfig(entityType: EntityType) {
	const config = getNestedEntityConfigCached();
	return config[entityType] || [];
}

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
	const nestedConfig = getNestedEntityConfig(parentEntity.type);
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
