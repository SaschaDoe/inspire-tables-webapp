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
			// Convert to lowercase to match entity registry keys
			const entityType = relationship.childType.toLowerCase();
			const creator = getEntityCreator(entityType);

			if (!creator) {
				console.error(`No creator found for type: ${relationship.childType}`);
				continue;
			}

			console.log(`Auto-generating ${count} ${relationship.childType}(s) for ${parentEntity.type} "${parentEntity.name}"`);

			for (let i = 0; i < count; i++) {
				const generatedEntity = creator.create();

				// Create workspace entity wrapping the generated entity
				const workspaceEntity = {
					id: generatedEntity.id,
					type: entityType as any,
					name: generatedEntity.name || `${relationship.label} ${generatedEntity.id.slice(0, 8)}`,
					description: generatedEntity.description || '',
					tags: [],
					parentId: parentEntity.id,
					campaignId: parentEntity.campaignId || (parentEntity.type === EntityType.Campaign ? parentEntity.id : undefined),
					metadata: {
						createdAt: new Date(),
						updatedAt: new Date()
					},
					relationships: [],
					customFields: { generatedEntity }
				};

				// Save to store
				entityStore.createEntity(workspaceEntity as any);
				createdChildren.push(workspaceEntity as any);
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
	console.log('[addOneChildEntity] Starting...', {
		parentEntity: parentEntity.name,
		parentType: parentEntity.type,
		childType: relationship.childType,
		relationship
	});

	try {
		// Convert to lowercase to match entity registry keys
		const entityType = relationship.childType.toLowerCase();
		console.log('[addOneChildEntity] Looking for creator:', entityType);

		const creator = getEntityCreator(entityType);
		if (!creator) {
			console.error(`No creator found for type: ${relationship.childType}`);
			return null;
		}

		console.log('[addOneChildEntity] Creating entity with creator...');
		const generatedEntity = creator.create();

		console.log('[addOneChildEntity] Created generated entity:', generatedEntity);

		// Create workspace entity wrapping the generated entity
		const workspaceEntity = {
			id: generatedEntity.id,
			type: entityType as any, // 'quest', 'character', etc.
			name: generatedEntity.name || `${relationship.label} ${generatedEntity.id.slice(0, 8)}`,
			description: generatedEntity.description || '',
			tags: [],
			parentId: parentEntity.id,
			campaignId: parentEntity.campaignId || (parentEntity.type === EntityType.Campaign ? parentEntity.id : undefined),
			metadata: {
				createdAt: new Date(),
				updatedAt: new Date()
			},
			relationships: [],
			customFields: { generatedEntity }
		};

		console.log('[addOneChildEntity] Saving workspace entity to store:', {
			entityId: workspaceEntity.id,
			entityType: workspaceEntity.type,
			entityName: workspaceEntity.name,
			parentId: workspaceEntity.parentId,
			campaignId: workspaceEntity.campaignId
		});

		// Save to store
		entityStore.createEntity(workspaceEntity as any);

		// Dispatch event to tell workspace to refresh its entity list
		if (typeof window !== 'undefined') {
			window.dispatchEvent(new CustomEvent('entity-created', {
				detail: { entityId: workspaceEntity.id, entityType: entityType }
			}));
		}

		console.log('[addOneChildEntity] Entity saved successfully!');
		return workspaceEntity as any;
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
		// Convert to lowercase to match entity registry keys
		const entityType = relationship.childType.toLowerCase();
		const creator = getEntityCreator(entityType);
		if (!creator) {
			console.error(`No creator found for type: ${relationship.childType}`);
			return [];
		}

		const createdChildren: Entity[] = [];

		for (let i = 0; i < count; i++) {
			const generatedEntity = creator.create();

			// Create workspace entity wrapping the generated entity
			const workspaceEntity = {
				id: generatedEntity.id,
				type: entityType as any,
				name: generatedEntity.name || `${relationship.label} ${generatedEntity.id.slice(0, 8)}`,
				description: generatedEntity.description || '',
				tags: [],
				parentId: parentEntity.id,
				campaignId: parentEntity.campaignId || (parentEntity.type === EntityType.Campaign ? parentEntity.id : undefined),
				metadata: {
					createdAt: new Date(),
					updatedAt: new Date()
				},
				relationships: [],
				customFields: { generatedEntity }
			};

			// Save to store
			entityStore.createEntity(workspaceEntity as any);
			createdChildren.push(workspaceEntity as any);
		}

		// Dispatch event to tell workspace to refresh its entity list
		if (typeof window !== 'undefined' && createdChildren.length > 0) {
			window.dispatchEvent(new CustomEvent('entity-created', {
				detail: { entityId: createdChildren[0].id, entityType: entityType }
			}));
		}

		return createdChildren;
	} catch (error) {
		console.error('Error generating entities:', error);
		return [];
	}
}
