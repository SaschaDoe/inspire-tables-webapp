import { entityStore } from '$lib/stores/entityStore';
import type { Entity } from '$lib/types/entity';
import type { EventDispatcher } from 'svelte';
import { extractAndSaveNestedEntities } from '$lib/utils/nestedEntityExtractor';

/**
 * Auto-saves nested entities to the entityStore so they appear in the navigator.
 * Call this in onMount() for any viewer with nested entities.
 */
export function autoSaveNestedEntities(
	nestedEntitiesMap: Record<string, { entities: any[]; entityType: string }>,
	parentEntity: any,
	dispatch: EventDispatcher<any>
) {
	let savedAny = false;

	Object.entries(nestedEntitiesMap).forEach(([_key, { entities, entityType }]) => {
		if (entities && entities.length > 0) {
			entities.forEach((entity) => {
				// Skip entities without an id
				if (!entity.id) {
					console.warn(`Skipping entity without id:`, entity);
					return;
				}

				const existingEntity = entityStore.getEntity(entity.id);
				if (!existingEntity) {
					const wrapperEntity: Entity = {
						id: entity.id,
						type: entityType as any,
						name: entity.name || `${entityType} ${entity.id.slice(0, 8)}`,
						description: entity.description || '',
						tags: [],
						metadata: {
							createdAt: new Date(),
							updatedAt: new Date()
						},
						relationships: [],
						customFields: { generatedEntity: entity }
					};
					entityStore.createEntity(wrapperEntity);
					savedAny = true;
				}
			});
		}
	});

	if (savedAny && parentEntity) {
		dispatch('entityUpdated', { entity: parentEntity });
	}
}

/**
 * Creates a handler function for adding nested entities.
 *
 * CRITICAL FLOW - DO NOT MODIFY WITHOUT UNDERSTANDING:
 *
 * This handler works in tandem with AddNestedEntityModal:
 *
 * TWO CREATION PATHS:
 *
 * PATH 1: Modal Creation (Campaign -> Add Universe)
 * 1. Modal generates entity and saves to entityStore
 * 2. Modal calls this handler with the raw entity
 * 3. Handler finds entity already exists
 * 4. Handler extracts nested entities (sphere connections, etc.)
 * 5. Handler adds entity to parent array
 * 6. Handler updates parent in store
 *
 * PATH 2: Direct Creation (Workspace Navigator -> New Universe)
 * 1. Workspace creates entity wrapper and saves to entityStore
 * 2. Workspace extracts nested entities directly
 * 3. Workspace opens entity in tab
 * (This handler is not used in this path)
 *
 * KEY INSIGHT: We ALWAYS extract nested entities, even if entity exists,
 * because the modal saves the entity but doesn't extract. This ensures
 * sphere connections and other nested entities are properly saved.
 */
export function createAddEntityHandler<T extends Record<string, any>>(
	parentObject: T,
	arrayKey: keyof T,
	parentEntity: any,
	dispatch: EventDispatcher<any>,
	entityType?: string
) {
	return (entity: any) => {
		// Save the nested entity to the entity store so it can be navigated to
		if (entityType && entity && entity.id) {
			let wrapperEntity: Entity;
			const existingNestedEntity = entityStore.getEntity(entity.id);

			if (!existingNestedEntity) {
				// PATH 2: Entity doesn't exist yet - create it
				wrapperEntity = {
					id: entity.id,
					type: entityType as any,
					name: entity.name || `${entityType} ${entity.id.slice(0, 8)}`,
					description: entity.description || '',
					tags: [],
					metadata: {
						createdAt: new Date(),
						updatedAt: new Date()
					},
					relationships: [],
					customFields: { generatedEntity: entity }
				};
				entityStore.createEntity(wrapperEntity);
			} else {
				// PATH 1: Entity already exists (saved by modal)
				wrapperEntity = existingNestedEntity;
			}

			// CRITICAL: Always extract nested entities, regardless of path
			// This is what saves sphere connections to the entity store
			const extractedEntities = extractAndSaveNestedEntities(wrapperEntity);
			if (extractedEntities.length > 0) {
				console.log(`[viewerUtils] Extracted ${extractedEntities.length} nested entities from ${entityType}`);
			}
		}

		// Add entity to parent's array (e.g., campaign.universes)
		parentObject[arrayKey] = [...parentObject[arrayKey], entity] as T[keyof T];

		if (parentEntity) {
			// Update the parent entity in the store with the modified object
			const existingEntity = entityStore.getEntity(parentEntity.id);
			if (existingEntity) {
				// Create a deep copy to ensure reactivity
				const updatedGeneratedEntity = JSON.parse(JSON.stringify(parentObject));

				entityStore.updateEntity(parentEntity.id, {
					...existingEntity,
					customFields: {
						...existingEntity.customFields,
						generatedEntity: updatedGeneratedEntity
					},
					metadata: {
						...existingEntity.metadata,
						updatedAt: new Date()
					}
				});
			}

			dispatch('entityUpdated', { entity: parentEntity });
		}
	};
}

/**
 * Creates a handler function for adding a single nested entity.
 * Replaces the array with a single-item array containing the new entity.
 */
export function createAddSingleEntityHandler<T extends Record<string, any>>(
	parentObject: T,
	arrayKey: keyof T,
	parentEntity: any,
	dispatch: EventDispatcher<any>,
	entityType: string
) {
	return (entity: any) => {
		// Save the nested entity to the entity store so it can be navigated to
		if (entity && entity.id) {
			let wrapperEntity: Entity;
			const existingNestedEntity = entityStore.getEntity(entity.id);

			if (!existingNestedEntity) {
				// Create new entity in store
				wrapperEntity = {
					id: entity.id,
					type: entityType as any,
					name: entity.name || `${entityType} ${entity.id.slice(0, 8)}`,
					description: entity.description || '',
					tags: [],
					metadata: {
						createdAt: new Date(),
						updatedAt: new Date()
					},
					relationships: [],
					customFields: { generatedEntity: entity }
				};
				entityStore.createEntity(wrapperEntity);
			} else {
				// Entity already exists (e.g., saved by modal)
				wrapperEntity = existingNestedEntity;
			}

			// Always extract nested entities, even if the entity already exists
			// This handles the case where modal saves the entity but hasn't extracted yet
			const extractedEntities = extractAndSaveNestedEntities(wrapperEntity);
			if (extractedEntities.length > 0) {
				console.log(`[viewerUtils] Extracted ${extractedEntities.length} nested entities from ${entityType}`);
			}
		}

		// Replace array with single-item array
		parentObject[arrayKey] = [entity] as T[keyof T];

		if (parentEntity) {
			// Update the parent entity in the store with the modified object
			const existingEntity = entityStore.getEntity(parentEntity.id);
			if (existingEntity) {
				// Create a deep copy to ensure reactivity
				const updatedGeneratedEntity = JSON.parse(JSON.stringify(parentObject));

				entityStore.updateEntity(parentEntity.id, {
					...existingEntity,
					customFields: {
						...existingEntity.customFields,
						generatedEntity: updatedGeneratedEntity
					},
					metadata: {
						...existingEntity.metadata,
						updatedAt: new Date()
					}
				});

				// Get the freshly updated entity from the store
				const freshEntity = entityStore.getEntity(parentEntity.id);
				if (freshEntity) {
					dispatch('entityUpdated', { entity: freshEntity });
				}
			}
		}
	};
}

/**
 * Creates a handler function for removing a single nested entity.
 * Clears the array.
 */
export function createRemoveSingleEntityHandler<T extends Record<string, any>>(
	parentObject: T,
	arrayKey: keyof T,
	parentEntity: any,
	dispatch: EventDispatcher<any>
) {
	return () => {
		// Clear the array
		parentObject[arrayKey] = [] as T[keyof T];

		if (parentEntity) {
			// Update the parent entity in the store with the modified object
			const existingEntity = entityStore.getEntity(parentEntity.id);
			if (existingEntity) {
				// Create a deep copy to ensure reactivity
				const updatedGeneratedEntity = JSON.parse(JSON.stringify(parentObject));

				entityStore.updateEntity(parentEntity.id, {
					...existingEntity,
					customFields: {
						...existingEntity.customFields,
						generatedEntity: updatedGeneratedEntity
					},
					metadata: {
						...existingEntity.metadata,
						updatedAt: new Date()
					}
				});
			}

			dispatch('entityUpdated', { entity: parentEntity });
		}
	};
}

/**
 * Creates standard event forwarding handlers.
 * Returns handleOpenEntity and handleEntityUpdated functions.
 */
export function createEventForwarders(dispatch: EventDispatcher<any>) {
	return {
		handleOpenEntity(event: CustomEvent<{ entity: any }>) {
			dispatch('openEntity', { entity: event.detail.entity });
		},
		handleEntityUpdated(event: CustomEvent<{ entity: any }>) {
			dispatch('entityUpdated', { entity: event.detail.entity });
		}
	};
}
