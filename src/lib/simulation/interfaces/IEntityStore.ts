/**
 * Entity Store Interface - Abstraction for entity storage
 *
 * This interface allows dependency injection and makes the simulation testable.
 */

export interface IEntity {
	id: string;
	[key: string]: any;
}

export interface IEntityStore {
	/**
	 * Get an entity by ID
	 */
	getEntity(id: string): IEntity | undefined;

	/**
	 * Set/update an entity
	 */
	setEntity(id: string, entity: IEntity): void;

	/**
	 * Delete an entity
	 */
	deleteEntity(id: string): void;

	/**
	 * Check if entity exists
	 */
	hasEntity(id: string): boolean;

	/**
	 * Get all entity IDs (optional, for testing)
	 */
	getAllEntityIds?(): string[];
}

/**
 * Adapter for the real entityStore
 */
import { entityStore } from '$lib/stores/entityStore';

export class EntityStoreAdapter implements IEntityStore {
	getEntity(id: string): IEntity | undefined {
		return entityStore.getEntity(id) as IEntity;
	}

	setEntity(id: string, entity: IEntity): void {
		entityStore.setEntity(id, entity);
	}

	deleteEntity(id: string): void {
		entityStore.deleteEntity(id);
	}

	hasEntity(id: string): boolean {
		return entityStore.getEntity(id) !== undefined;
	}

	getAllEntityIds(): string[] {
		// Note: This would need to be added to the actual entityStore
		return [];
	}
}

/**
 * Mock entity store for testing
 */
export class MockEntityStore implements IEntityStore {
	private entities: Map<string, IEntity> = new Map();

	getEntity(id: string): IEntity | undefined {
		return this.entities.get(id);
	}

	setEntity(id: string, entity: IEntity): void {
		this.entities.set(id, entity);
	}

	deleteEntity(id: string): void {
		this.entities.delete(id);
	}

	hasEntity(id: string): boolean {
		return this.entities.has(id);
	}

	getAllEntityIds(): string[] {
		return Array.from(this.entities.keys());
	}

	// Test helpers
	clear(): void {
		this.entities.clear();
	}

	size(): number {
		return this.entities.size;
	}
}
