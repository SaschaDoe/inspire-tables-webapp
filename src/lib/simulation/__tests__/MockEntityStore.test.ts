/**
 * Unit tests for MockEntityStore
 * Tests the foundation of our testing infrastructure
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MockEntityStore, type IEntity } from '../interfaces/IEntityStore';

describe('MockEntityStore', () => {
	let store: MockEntityStore;

	beforeEach(() => {
		store = new MockEntityStore();
	});

	describe('Basic Operations', () => {
		it('should store and retrieve entities', () => {
			const entity: IEntity = { id: 'test-1', name: 'Test Entity' };

			store.setEntity(entity.id, entity);
			const retrieved = store.getEntity(entity.id);

			expect(retrieved).toEqual(entity);
		});

		it('should return undefined for non-existent entities', () => {
			const result = store.getEntity('non-existent');
			expect(result).toBeUndefined();
		});

		it('should update existing entities', () => {
			const entity: IEntity = { id: 'test-1', name: 'Original' };
			store.setEntity(entity.id, entity);

			const updated: IEntity = { id: 'test-1', name: 'Updated' };
			store.setEntity(entity.id, updated);

			const retrieved = store.getEntity(entity.id);
			expect(retrieved?.name).toBe('Updated');
		});

		it('should delete entities', () => {
			const entity: IEntity = { id: 'test-1', name: 'Test' };
			store.setEntity(entity.id, entity);

			store.deleteEntity(entity.id);

			const retrieved = store.getEntity(entity.id);
			expect(retrieved).toBeUndefined();
		});
	});

	describe('Entity Existence', () => {
		it('should correctly track entity existence with hasEntity()', () => {
			const entity: IEntity = { id: 'test-1', name: 'Test' };

			expect(store.hasEntity(entity.id)).toBe(false);

			store.setEntity(entity.id, entity);
			expect(store.hasEntity(entity.id)).toBe(true);

			store.deleteEntity(entity.id);
			expect(store.hasEntity(entity.id)).toBe(false);
		});
	});

	describe('Bulk Operations', () => {
		it('should return all entity IDs', () => {
			store.setEntity('id-1', { id: 'id-1' });
			store.setEntity('id-2', { id: 'id-2' });
			store.setEntity('id-3', { id: 'id-3' });

			const ids = store.getAllEntityIds();

			expect(ids).toHaveLength(3);
			expect(ids).toContain('id-1');
			expect(ids).toContain('id-2');
			expect(ids).toContain('id-3');
		});

		it('should clear all entities', () => {
			store.setEntity('id-1', { id: 'id-1' });
			store.setEntity('id-2', { id: 'id-2' });

			expect(store.size()).toBe(2);

			store.clear();

			expect(store.size()).toBe(0);
			expect(store.getAllEntityIds()).toHaveLength(0);
		});

		it('should return correct size', () => {
			expect(store.size()).toBe(0);

			store.setEntity('id-1', { id: 'id-1' });
			expect(store.size()).toBe(1);

			store.setEntity('id-2', { id: 'id-2' });
			expect(store.size()).toBe(2);

			store.deleteEntity('id-1');
			expect(store.size()).toBe(1);
		});
	});

	describe('Complex Entities', () => {
		it('should handle entities with nested properties', () => {
			const complexEntity: IEntity = {
				id: 'complex-1',
				name: 'Complex',
				nested: {
					deep: {
						value: 42
					}
				},
				array: [1, 2, 3]
			};

			store.setEntity(complexEntity.id, complexEntity);
			const retrieved = store.getEntity(complexEntity.id);

			expect(retrieved).toEqual(complexEntity);
			expect(retrieved?.nested?.deep?.value).toBe(42);
			expect(retrieved?.array).toEqual([1, 2, 3]);
		});

		it('should handle multiple entity types', () => {
			const nation: IEntity = { id: 'nation-1', type: 'nation', name: 'Romans' };
			const city: IEntity = { id: 'city-1', type: 'city', name: 'Rome' };
			const event: IEntity = { id: 'event-1', type: 'event', title: 'Founded' };

			store.setEntity(nation.id, nation);
			store.setEntity(city.id, city);
			store.setEntity(event.id, event);

			expect(store.size()).toBe(3);
			expect(store.getEntity('nation-1')?.type).toBe('nation');
			expect(store.getEntity('city-1')?.type).toBe('city');
			expect(store.getEntity('event-1')?.type).toBe('event');
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty string ID', () => {
			const entity: IEntity = { id: '', name: 'Empty ID' };
			store.setEntity(entity.id, entity);

			const retrieved = store.getEntity('');
			expect(retrieved).toEqual(entity);
		});

		it('should handle rapid consecutive operations', () => {
			for (let i = 0; i < 100; i++) {
				store.setEntity(`id-${i}`, { id: `id-${i}` });
			}

			expect(store.size()).toBe(100);

			for (let i = 0; i < 100; i++) {
				expect(store.hasEntity(`id-${i}`)).toBe(true);
			}
		});

		it('should handle deletion of non-existent entity gracefully', () => {
			expect(() => {
				store.deleteEntity('non-existent');
			}).not.toThrow();

			expect(store.size()).toBe(0);
		});
	});
});
