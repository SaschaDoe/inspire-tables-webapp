import type { Entity } from '$lib/types/entity';
import { getNestedEntityConfig } from './nestedEntityExtractor';

/**
 * Removes an entity from its parent's nested entity array
 * Uses the nestedEntityConfig to find which array contains the entity
 */
export function removeFromParentArray(parent: Entity, childEntity: Entity): boolean {
	const config = getNestedEntityConfig(parent.type);
	const generatedParent = parent.customFields?.generatedEntity;

	if (!generatedParent) {
		console.warn('[entityDeletion] Parent has no generatedEntity:', parent.id);
		return false;
	}

	let modified = false;

	// Find which array contains this entity type
	for (const { propertyName, childType } of config) {
		if (childType === childEntity.type) {
			const array = generatedParent[propertyName];
			if (Array.isArray(array)) {
				const initialLength = array.length;
				// Remove the entity from the array by id
				generatedParent[propertyName] = array.filter((item) => item.id !== childEntity.id);

				if (generatedParent[propertyName].length < initialLength) {
					console.log(
						`[entityDeletion] Removed ${childEntity.type} ${childEntity.id} from ${parent.type} ${parent.id}`
					);
					modified = true;
				}
			}
		}
	}

	return modified;
}

/**
 * Result of cascading deletion operation
 */
export interface DeletionResult {
	deletedEntityIds: string[];
	updatedParentIds: string[];
}

/**
 * Cascading delete: removes entity, updates parent, and recursively deletes children
 * This is a pure function that returns what should be deleted/updated
 * The actual store mutations happen in entityStore
 *
 * @param entityId - ID of entity to delete
 * @param getEntity - Function to get entity by ID
 * @param getAllEntities - Function to get all entities
 * @returns Object describing what was deleted and what parents were updated
 */
export function calculateCascadingDeletion(
	entityId: string,
	getEntity: (id: string) => Entity | undefined,
	getAllEntities: () => Entity[]
): DeletionResult {
	const result: DeletionResult = {
		deletedEntityIds: [],
		updatedParentIds: []
	};

	const entity = getEntity(entityId);
	if (!entity) {
		console.warn('[entityDeletion] Entity not found:', entityId);
		return result;
	}

	// Mark this entity for deletion
	result.deletedEntityIds.push(entityId);

	// If entity has a parent, mark parent for update
	if (entity.parentId) {
		const parent = getEntity(entity.parentId);
		if (parent && !result.updatedParentIds.includes(parent.id)) {
			result.updatedParentIds.push(parent.id);
		}
	}

	// Recursively find all children and mark them for deletion
	const allEntities = getAllEntities();
	const children = allEntities.filter((e) => e.parentId === entityId);

	for (const child of children) {
		// Recursive call
		const childResult = calculateCascadingDeletion(child.id, getEntity, getAllEntities);

		// Merge results
		result.deletedEntityIds.push(...childResult.deletedEntityIds);
		for (const parentId of childResult.updatedParentIds) {
			if (!result.updatedParentIds.includes(parentId)) {
				result.updatedParentIds.push(parentId);
			}
		}
	}

	return result;
}
