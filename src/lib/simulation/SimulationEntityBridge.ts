import { entityStore } from '$lib/stores/entityStore';
import { EntityType } from '$lib/types/entity';
import { Nation } from '$lib/entities/location/nation';
import type { City } from '$lib/entities/location/city';
import type { Unit } from '$lib/entities/military/unit';
import type { HistoricalEvent } from '$lib/entities/simulation/historicalEvent';
import type { EntityInstance } from '$lib/stores/entityStore';

/**
 * SimulationEntityBridge - Phase 1.6
 *
 * Bridges the gap between simulation objects and the entity store.
 * Provides bidirectional synchronization:
 * - Simulation → Entity Store (persistence after each turn)
 * - Entity Store → Simulation (loading/restoration on init)
 *
 * Without this bridge, all simulation progress is lost on page refresh.
 * With this bridge, simulations are fully persistent and can be saved/loaded.
 */
export class SimulationEntityBridge {
	/**
	 * Sync a Nation simulation object to entity store
	 * Creates new entity if doesn't exist, updates if exists
	 *
	 * Note: We clone the nation to avoid circular references
	 * (Nation extends Entity which has customFields)
	 */
	async syncNationToEntity(nation: Nation): Promise<void> {
		const existingEntity = entityStore.getEntity(nation.id);

		// Create a clean copy without circular references
		// The Entity base class has customFields which creates cycles
		const nationCopy = this.cleanEntityForStorage(nation);

		if (existingEntity) {
			// Update existing entity
			existingEntity.name = nation.name;
			existingEntity.customFields = existingEntity.customFields || {};
			existingEntity.customFields.generatedEntity = nationCopy;
			await entityStore.updateEntity(nation.id, existingEntity);
		} else {
			// Create new entity
			const entityInstance: EntityInstance = {
				id: nation.id,
				type: EntityType.Nation,
				name: nation.name,
				customFields: {
					generatedEntity: nationCopy
				}
			};
			await entityStore.createEntity(entityInstance);
		}
	}

	/**
	 * Sync a City simulation object to entity store
	 * Marks city as simulation-generated
	 */
	async syncCityToEntity(city: City): Promise<void> {
		const existingEntity = entityStore.getEntity(city.id);

		// Ensure city is marked as simulation-generated
		city.isSimulationGenerated = true;

		// Create a clean copy without circular references
		const cityCopy = this.cleanEntityForStorage(city);

		if (existingEntity) {
			// Update existing entity
			existingEntity.name = city.name;
			existingEntity.customFields = existingEntity.customFields || {};
			existingEntity.customFields.generatedEntity = cityCopy;
			await entityStore.updateEntity(city.id, existingEntity);
		} else {
			// Create new entity
			const entityInstance: EntityInstance = {
				id: city.id,
				type: EntityType.City,
				name: city.name,
				customFields: {
					generatedEntity: cityCopy
				}
			};
			await entityStore.createEntity(entityInstance);
		}
	}

	/**
	 * Sync a Unit simulation object to entity store
	 */
	async syncUnitToEntity(unit: Unit): Promise<void> {
		const existingEntity = entityStore.getEntity(unit.id);

		if (existingEntity) {
			// Update existing entity
			existingEntity.name = unit.unitType || 'Unit';
			existingEntity.customFields = existingEntity.customFields || {};
			existingEntity.customFields.generatedEntity = unit;
			await entityStore.updateEntity(unit.id, existingEntity);
		} else {
			// Create new entity
			const entityInstance: EntityInstance = {
				id: unit.id,
				type: EntityType.Unit,
				name: unit.unitType || 'Unit',
				customFields: {
					generatedEntity: unit
				}
			};
			await entityStore.createEntity(entityInstance);
		}
	}

	/**
	 * Sync a HistoricalEvent simulation object to entity store
	 */
	async syncEventToEntity(event: HistoricalEvent): Promise<void> {
		const existingEntity = entityStore.getEntity(event.id);

		if (existingEntity) {
			// Update existing entity
			existingEntity.name = event.title || 'Historical Event';
			existingEntity.customFields = existingEntity.customFields || {};
			existingEntity.customFields.generatedEntity = event;
			await entityStore.updateEntity(event.id, existingEntity);
		} else {
			// Create new entity
			const entityInstance: EntityInstance = {
				id: event.id,
				type: EntityType.HistoricalEvent,
				name: event.title || 'Historical Event',
				customFields: {
					generatedEntity: event
				}
			};
			await entityStore.createEntity(entityInstance);
		}
	}

	/**
	 * Batch sync multiple entities (more efficient than individual syncs)
	 *
	 * @param entities Array of simulation objects to sync
	 */
	async batchSync(
		entities: Array<Nation | City | Unit | HistoricalEvent>
	): Promise<void> {
		// Process all updates in parallel for performance
		const syncPromises = entities.map((entity) => {
			// Type detection based on entity properties
			if ('techManager' in entity) {
				// It's a Nation
				return this.syncNationToEntity(entity as Nation);
			} else if ('populationManager' in entity || 'isSimulationGenerated' in entity) {
				// It's a City
				return this.syncCityToEntity(entity as City);
			} else if ('unitType' in entity) {
				// It's a Unit
				return this.syncUnitToEntity(entity as Unit);
			} else if ('eventType' in entity) {
				// It's a HistoricalEvent
				return this.syncEventToEntity(entity as HistoricalEvent);
			}
			return Promise.resolve();
		});

		await Promise.all(syncPromises);
	}

	/**
	 * Load a Nation from entity store
	 *
	 * @param entityId Entity ID to load
	 * @returns Nation object or null if not found
	 */
	loadNationFromEntity(entityId: string): Nation | null {
		const entity = entityStore.getEntity(entityId);
		if (!entity || entity.type !== EntityType.Nation) return null;

		if (!entity.customFields || !entity.customFields.generatedEntity) return null;

		const nationData = entity.customFields.generatedEntity;

		// Reconstruct Nation instance with proper prototype chain
		const nation = new Nation();

		// Copy all properties from stored data to new instance
		Object.assign(nation, nationData);

		// Reinitialize managers to restore their methods
		const { TechManager } = require('./managers/TechManager');
		const { PolicyManager } = require('./managers/PolicyManager');
		const { DiplomacyManager } = require('./managers/DiplomacyManager');

		nation.techManager = new TechManager();
		Object.assign(nation.techManager, nationData.techManager || {});

		nation.policyManager = new PolicyManager();
		Object.assign(nation.policyManager, nationData.policyManager || {});

		// Recreate diplomacy managers map
		nation.diplomacyManagers = new Map();
		if (nationData.diplomacyManagers) {
			// Convert serialized map back to Map instance
			const diplomacyData =
				nationData.diplomacyManagers instanceof Map
					? nationData.diplomacyManagers
					: new Map(Object.entries(nationData.diplomacyManagers || {}));

			for (const [otherNationId, managerData] of diplomacyData) {
				const manager = new DiplomacyManager(nation.id, otherNationId);
				Object.assign(manager, managerData);
				nation.diplomacyManagers.set(otherNationId, manager);
			}
		}

		return nation;
	}

	/**
	 * Load a City from entity store
	 *
	 * @param entityId Entity ID to load
	 * @returns City object or null if not found
	 */
	loadCityFromEntity(entityId: string): City | null {
		const entity = entityStore.getEntity(entityId);
		if (!entity || entity.type !== EntityType.City) return null;

		if (!entity.customFields || !entity.customFields.generatedEntity) return null;

		const cityData = entity.customFields.generatedEntity;

		// Reconstruct City instance with proper prototype chain
		// (JSON deserialization loses class methods)
		const city = new City();

		// Copy all properties from stored data to new instance
		Object.assign(city, cityData);

		// Reinitialize managers to restore their methods
		const { CityPopulationManager } = require('./managers/CityPopulationManager');
		const { CityProductionManager } = require('./managers/CityProductionManager');
		const { CityExpansionManager } = require('./managers/CityExpansionManager');

		city.populationManager = new CityPopulationManager();
		Object.assign(city.populationManager, cityData.populationManager || {});
		city.populationManager.initialize(city.population);

		city.productionManager = new CityProductionManager();
		Object.assign(city.productionManager, cityData.productionManager || {});

		city.expansionManager = new CityExpansionManager(city.hexTileId);
		Object.assign(city.expansionManager, cityData.expansionManager || {});

		return city;
	}

	/**
	 * Load a Unit from entity store
	 *
	 * @param entityId Entity ID to load
	 * @returns Unit object or null if not found
	 */
	loadUnitFromEntity(entityId: string): Unit | null {
		const entity = entityStore.getEntity(entityId);
		if (!entity || entity.type !== EntityType.Unit) return null;

		if (!entity.customFields || !entity.customFields.generatedEntity) return null;

		return entity.customFields.generatedEntity as Unit;
	}

	/**
	 * Load a HistoricalEvent from entity store
	 *
	 * @param entityId Entity ID to load
	 * @returns HistoricalEvent object or null if not found
	 */
	loadEventFromEntity(entityId: string): HistoricalEvent | null {
		const entity = entityStore.getEntity(entityId);
		if (!entity || entity.type !== EntityType.HistoricalEvent) return null;

		if (!entity.customFields || !entity.customFields.generatedEntity) return null;

		return entity.customFields.generatedEntity as HistoricalEvent;
	}

	/**
	 * Initialize simulation from existing entities for a Planet
	 *
	 * This is called when loading a saved simulation.
	 * It restores all nations, cities, units, and events from the entity store.
	 *
	 * @param planetId ID of the Planet to load
	 * @returns All simulation objects stored for that planet
	 */
	async initializeFromPlanet(planetId: string): Promise<{
		nations: Nation[];
		cities: City[];
		units: Unit[];
		events: HistoricalEvent[];
	}> {
		// Load all nations that belong to this planet
		const allEntities = entityStore.getAllEntities();

		const nations: Nation[] = [];
		const cities: City[] = [];
		const units: Unit[] = [];
		const events: HistoricalEvent[] = [];

		for (const entity of allEntities) {
			if (!entity.customFields?.generatedEntity) continue;

			const generated = entity.customFields.generatedEntity;

			// Check if entity belongs to this planet
			if (entity.type === EntityType.Nation && generated.parentPlanetId === planetId) {
				const nation = this.loadNationFromEntity(entity.id);
				if (nation) nations.push(nation);
			} else if (entity.type === EntityType.City && generated.parentPlanetId === planetId) {
				const city = this.loadCityFromEntity(entity.id);
				if (city) cities.push(city);
			} else if (entity.type === EntityType.Unit && generated.parentPlanetId === planetId) {
				const unit = this.loadUnitFromEntity(entity.id);
				if (unit) units.push(unit);
			} else if (entity.type === EntityType.HistoricalEvent && generated.parentPlanetId === planetId) {
				const event = this.loadEventFromEntity(entity.id);
				if (event) events.push(event);
			}
		}

		return { nations, cities, units, events };
	}


	/**
	 * Clean an entity for storage by removing circular references
	 * Entity classes have a customFields property that creates circular references
	 */
	private cleanEntityForStorage(entity: any): any {
		// Create a shallow copy
		const cleaned = { ...entity };

		// Remove the customFields property to break circular references
		// (It will be stored at the EntityInstance level, not inside generatedEntity)
		delete cleaned.customFields;

		return cleaned;
	}
}
