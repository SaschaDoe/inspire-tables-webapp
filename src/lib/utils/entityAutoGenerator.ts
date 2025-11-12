import { getEntityRelationships, getRandomCount, type EntityRelationship } from '$lib/config/entityRelationships';
import { getEntityCreator } from '$lib/entities/entityRegistry';
import { EntityType, type Entity } from '$lib/types/entity';
import { entityStore } from '$lib/stores/entityStore';

/**
 * Auto-generates child entities for a parent entity based on entityRelationships configuration.
 * This function is called automatically when an entity is created to generate its nested entities.
 *
 * @param parentEntity - The parent entity that was just created
 * @returns Array of created child entities
 */
export function autoGenerateChildEntities(parentEntity: Entity): Entity[] {
	const relationships = getEntityRelationships(parentEntity.type);
	const createdChildren: Entity[] = [];

	// Only process relationships marked for auto-generation
	const autoGenRelationships = relationships.filter(rel => rel.autoGenerate);

	for (const relationship of autoGenRelationships) {
		try {
			const count = getRandomCount(relationship);
			const creator = getEntityCreator(relationship.childType);

			if (!creator) {
				console.error(`No creator found for type: ${relationship.childType}`);
				continue;
			}

			console.log(`Auto-generating ${count} ${relationship.childType}(s) for ${parentEntity.type} "${parentEntity.name}"`);

			for (let i = 0; i < count; i++) {
				const newEntity = creator.create();

				// Set parent relationship
				newEntity.parentId = parentEntity.id;

				// Inherit or set campaignId
				if (parentEntity.campaignId) {
					newEntity.campaignId = parentEntity.campaignId;
				} else if (parentEntity.type === EntityType.Campaign) {
					newEntity.campaignId = parentEntity.id;
				}

				// Save to store
				entityStore.createEntity(newEntity);
				createdChildren.push(newEntity);
			}
		} catch (error) {
			console.error(`Error auto-generating ${relationship.childType}:`, error);
		}
	}

	return createdChildren;
}

/**
 * Manually generates a single child entity of the specified type for a parent.
 * Used when the user clicks the "Add One" button.
 *
 * @param parentEntity - The parent entity
 * @param relationship - The relationship configuration
 * @returns The created child entity or null if creation failed
 */
export function addOneChildEntity(parentEntity: Entity, relationship: EntityRelationship): Entity | null {
	try {
		const creator = getEntityCreator(relationship.childType);
		if (!creator) {
			console.error(`No creator found for type: ${relationship.childType}`);
			return null;
		}

		const newEntity = creator.create();

		// Set parent relationship
		newEntity.parentId = parentEntity.id;
		if (parentEntity.campaignId) {
			newEntity.campaignId = parentEntity.campaignId;
		} else if (parentEntity.type === EntityType.Campaign) {
			newEntity.campaignId = parentEntity.id;
		}

		// Save to store
		entityStore.createEntity(newEntity);
		return newEntity;
	} catch (error) {
		console.error('Error creating entity:', error);
		return null;
	}
}

/**
 * Manually generates multiple child entities based on the relationship's random count range.
 * Used when the user clicks the "Generate Multiple" button.
 *
 * @param parentEntity - The parent entity
 * @param relationship - The relationship configuration
 * @returns Array of created child entities
 */
export function generateMultipleChildEntities(parentEntity: Entity, relationship: EntityRelationship): Entity[] {
	try {
		const count = getRandomCount(relationship);
		const creator = getEntityCreator(relationship.childType);
		if (!creator) {
			console.error(`No creator found for type: ${relationship.childType}`);
			return [];
		}

		const createdChildren: Entity[] = [];

		for (let i = 0; i < count; i++) {
			const newEntity = creator.create();

			// Set parent relationship
			newEntity.parentId = parentEntity.id;
			if (parentEntity.campaignId) {
				newEntity.campaignId = parentEntity.campaignId;
			} else if (parentEntity.type === EntityType.Campaign) {
				newEntity.campaignId = parentEntity.id;
			}

			// Save to store
			entityStore.createEntity(newEntity);
			createdChildren.push(newEntity);
		}

		return createdChildren;
	} catch (error) {
		console.error('Error generating entities:', error);
		return [];
	}
}
