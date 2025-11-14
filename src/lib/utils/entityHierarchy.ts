import type { EntityType } from '$lib/types/entity';
import { entityRegistry } from '$lib/entities/entityRegistry';

/**
 * Auto-generates nested entity configuration from creator NESTED_ENTITY_RULES.
 * This eliminates the need to manually maintain nestedEntityConfig.
 *
 * When you create a new parent-child relationship:
 * 1. Add `parentId = ''` to the child entity
 * 2. Define `NESTED_ENTITY_RULES` in the parent creator
 * 3. Call `this.setParentReference(entity)` in the child creator
 * 4. Call `.withParent(parent.id)` when creating children
 *
 * That's it! The system automatically handles the rest.
 */
export function buildNestedEntityConfig(): Record<
	string,
	Array<{ propertyName: string; childType: EntityType }>
> {
	const config: Record<string, Array<{ propertyName: string; childType: EntityType }>> = {};

	// Iterate through all registered entity types
	for (const [entityType, entityInfo] of Object.entries(entityRegistry)) {
		try {
			// Get a creator instance to check for NESTED_ENTITY_RULES
			const creator = entityInfo.creator();
			const creatorClass = creator.constructor as any;

			// Check if this creator has nested entity rules
			if (creatorClass.NESTED_ENTITY_RULES) {
				const rules = creatorClass.NESTED_ENTITY_RULES;
				const nestedConfigs: Array<{ propertyName: string; childType: EntityType }> = [];

				// Convert NESTED_ENTITY_RULES to config format
				for (const [propertyName, rule] of Object.entries(rules) as Array<
					[string, { entityType: EntityType }]
				>) {
					nestedConfigs.push({
						propertyName,
						childType: rule.entityType
					});
				}

				if (nestedConfigs.length > 0) {
					config[entityType] = nestedConfigs;
				}
			}
		} catch (error) {
			console.warn(`[entityHierarchy] Could not process creator for ${entityType}:`, error);
		}
	}

	return config;
}

/**
 * Get the auto-generated nested entity configuration.
 * Call this instead of using a static nestedEntityConfig.
 */
export function getNestedEntityConfig(
	entityType: EntityType
): Array<{ propertyName: string; childType: EntityType }> {
	const config = buildNestedEntityConfig();
	return config[entityType] || [];
}

/**
 * Cached version of the config for performance.
 * The config is built once on first access and reused.
 */
let cachedConfig: Record<string, Array<{ propertyName: string; childType: EntityType }>> | null =
	null;

export function getNestedEntityConfigCached(): Record<
	string,
	Array<{ propertyName: string; childType: EntityType }>
> {
	if (!cachedConfig) {
		cachedConfig = buildNestedEntityConfig();
		console.log('[entityHierarchy] Auto-generated nested entity config:', cachedConfig);
	}
	return cachedConfig;
}
