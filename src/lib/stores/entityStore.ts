import { writable, derived } from 'svelte/store';
import type { Entity, EntityType } from '$lib/types/entity';
import type { Campaign } from '$lib/entities/campaign';

interface EntityState {
	entities: Map<string, Entity>;
	campaigns: Campaign[]; // Legacy campaign objects
}

function createEntityStore() {
	const { subscribe, set, update } = writable<EntityState>({
		entities: new Map(),
		campaigns: []
	});

	// Load from localStorage on init
	function loadFromStorage() {
		try {
			// Load legacy campaigns
			const stored = localStorage.getItem('campaigns');
			if (stored) {
				const campaigns = JSON.parse(stored);
				update(state => ({ ...state, campaigns }));
			}

			// Load new entities
			const entitiesStored = localStorage.getItem('entities');
			if (entitiesStored) {
				const entitiesArray = JSON.parse(entitiesStored);
				const entitiesMap = new Map(entitiesArray.map((e: Entity) => [e.id, e]));
				update(state => ({ ...state, entities: entitiesMap }));
			}
		} catch (error) {
			console.error('Error loading from storage:', error);
		}
	}

	function saveToStorage(state: EntityState) {
		try {
			// Save legacy campaigns
			localStorage.setItem('campaigns', JSON.stringify(state.campaigns));

			// Save new entities
			const entitiesArray = Array.from(state.entities.values());
			localStorage.setItem('entities', JSON.stringify(entitiesArray));
		} catch (error) {
			console.error('Error saving to storage:', error);
		}
	}

	// Initialize
	loadFromStorage();

	return {
		subscribe,

		// CRUD operations for entities
		createEntity(entity: Entity) {
			update(state => {
				const newEntities = new Map(state.entities);
				newEntities.set(entity.id, entity);
				const newState = { ...state, entities: newEntities };
				saveToStorage(newState);
				return newState;
			});
		},

		getEntity(id: string): Entity | undefined {
			let entity: Entity | undefined;
			subscribe(state => {
				entity = state.entities.get(id);
			})();
			return entity;
		},

		updateEntity(id: string, updates: Partial<Entity>) {
			update(state => {
				const entity = state.entities.get(id);
				if (!entity) return state;

				const updatedEntity = {
					...entity,
					...updates,
					metadata: {
						...entity.metadata,
						updatedAt: new Date()
					}
				};

				const newEntities = new Map(state.entities);
				newEntities.set(id, updatedEntity);
				const newState = { ...state, entities: newEntities };
				saveToStorage(newState);
				return newState;
			});
		},

		deleteEntity(id: string) {
			update(state => {
				const newEntities = new Map(state.entities);
				newEntities.delete(id);

				// Also delete any child entities
				const entitiesToDelete: string[] = [];
				for (const [entityId, entity] of newEntities.entries()) {
					if (entity.parentId === id) {
						entitiesToDelete.push(entityId);
					}
				}

				entitiesToDelete.forEach(entityId => newEntities.delete(entityId));

				const newState = { ...state, entities: newEntities };
				saveToStorage(newState);
				return newState;
			});
		},

		// Get entities by type
		getEntitiesByType(type: EntityType): Entity[] {
			let entities: Entity[] = [];
			subscribe(state => {
				entities = Array.from(state.entities.values()).filter(e => e.type === type);
			})();
			return entities;
		},

		// Get entities by campaign
		getEntitiesByCampaign(campaignId: string): Entity[] {
			let entities: Entity[] = [];
			subscribe(state => {
				entities = Array.from(state.entities.values()).filter(
					e => e.campaignId === campaignId
				);
			})();
			return entities;
		},

		// Get child entities
		getChildEntities(parentId: string): Entity[] {
			let entities: Entity[] = [];
			subscribe(state => {
				entities = Array.from(state.entities.values()).filter(e => e.parentId === parentId);
			})();
			return entities;
		},

		// Search entities
		searchEntities(query: string, filters?: { type?: EntityType; campaignId?: string }): Entity[] {
			let results: Entity[] = [];
			subscribe(state => {
				results = Array.from(state.entities.values()).filter(entity => {
					// Apply type filter
					if (filters?.type && entity.type !== filters.type) {
						return false;
					}

					// Apply campaign filter
					if (filters?.campaignId && entity.campaignId !== filters.campaignId) {
						return false;
					}

					// Apply search query
					const searchTerm = query.toLowerCase();
					return (
						entity.name.toLowerCase().includes(searchTerm) ||
						entity.description.toLowerCase().includes(searchTerm) ||
						entity.tags.some(tag => tag.toLowerCase().includes(searchTerm))
					);
				});
			})();
			return results;
		},

		// Legacy campaign operations
		getCampaigns(): Campaign[] {
			let campaigns: Campaign[] = [];
			subscribe(state => {
				campaigns = state.campaigns;
			})();
			return campaigns;
		},

		updateCampaigns(campaigns: Campaign[]) {
			update(state => {
				const newState = { ...state, campaigns };
				saveToStorage(newState);
				return newState;
			});
		},

		// Clear all data
		clearAll() {
			set({ entities: new Map(), campaigns: [] });
			localStorage.removeItem('entities');
			localStorage.removeItem('campaigns');
		}
	};
}

export const entityStore = createEntityStore();

// Derived stores for common queries
export const allEntities = derived(
	entityStore,
	$entityStore => Array.from($entityStore.entities.values())
);

export const campaignEntities = derived(
	entityStore,
	$entityStore => Array.from($entityStore.entities.values()).filter(e => e.type === 'campaign')
);

export const adventureEntities = derived(
	entityStore,
	$entityStore => Array.from($entityStore.entities.values()).filter(e => e.type === 'adventure')
);

export const characterEntities = derived(
	entityStore,
	$entityStore => Array.from($entityStore.entities.values()).filter(e => e.type === 'character')
);
