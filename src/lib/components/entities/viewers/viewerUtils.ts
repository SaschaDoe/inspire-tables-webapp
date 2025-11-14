import { entityStore } from '$lib/stores/entityStore';
import type { Entity } from '$lib/types/entity';
import type { EventDispatcher } from 'svelte';

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
 * Handles array reassignment and event dispatching.
 */
export function createAddEntityHandler<T extends Record<string, any>>(
	parentObject: T,
	arrayKey: keyof T,
	parentEntity: any,
	dispatch: EventDispatcher<any>
) {
	return (entity: any) => {
		parentObject[arrayKey] = [...parentObject[arrayKey], entity] as T[keyof T];
		if (parentEntity) {
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
