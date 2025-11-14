/**
 * Registry for entity viewer components
 * Maps entity types to their corresponding viewer components
 */

import type { ComponentType } from 'svelte';

// Import specialized viewers
import CharacterViewer from './viewers/CharacterViewer.svelte';
import VillainViewer from './viewers/VillainViewer.svelte';
import MonsterViewer from './viewers/MonsterViewer.svelte';
import DungeonViewer from './DungeonViewer.svelte';
import RoomViewer from './RoomViewer.svelte';
import EntranceViewer from './EntranceViewer.svelte';
import SceneViewer from './viewers/SceneViewer.svelte';
import ArtefactViewer from './viewers/ArtefactViewer.svelte';
import AdventureViewer from './viewers/AdventureViewer.svelte';
import QuestViewer from './viewers/QuestViewer.svelte';
import FactionViewer from './viewers/FactionViewer.svelte';
import SettlementViewer from './viewers/SettlementViewer.svelte';
import UniverseViewer from './viewers/UniverseViewer.svelte';
import SphereViewer from './viewers/SphereViewer.svelte';
import SphereConnectionViewer from './viewers/SphereConnectionViewer.svelte';
import GalaxyViewer from './viewers/GalaxyViewer.svelte';
import SolarSystemViewer from './viewers/SolarSystemViewer.svelte';
import PlanetViewer from './viewers/PlanetViewer.svelte';

export interface ViewerConfig {
	component: ComponentType;
	propName: string; // The name of the entity prop (e.g., 'character', 'villain', etc.)
	needsParentEntity?: boolean; // Whether this viewer needs access to the parent entity wrapper
}

/**
 * Registry mapping entity types to their viewer components
 */
export const viewerRegistry: Record<string, ViewerConfig> = {
	character: {
		component: CharacterViewer,
		propName: 'character'
	},
	villain: {
		component: VillainViewer,
		propName: 'villain'
	},
	monster: {
		component: MonsterViewer,
		propName: 'monster'
	},
	dungeon: {
		component: DungeonViewer,
		propName: 'dungeon'
	},
	room: {
		component: RoomViewer,
		propName: 'room',
		needsParentEntity: true
	},
	entrance: {
		component: EntranceViewer,
		propName: 'entrance'
	},
	scene: {
		component: SceneViewer,
		propName: 'scene'
	},
	artefact: {
		component: ArtefactViewer,
		propName: 'artefact'
	},
	adventure: {
		component: AdventureViewer,
		propName: 'adventure'
	},
	quest: {
		component: QuestViewer,
		propName: 'quest'
	},
	faction: {
		component: FactionViewer,
		propName: 'faction'
	},
	settlement: {
		component: SettlementViewer,
		propName: 'settlement'
	},
	universe: {
		component: UniverseViewer,
		propName: 'universe',
		needsParentEntity: true
	},
	sphere: {
		component: SphereViewer,
		propName: 'sphere',
		needsParentEntity: true
	},
	sphereConnection: {
		component: SphereConnectionViewer,
		propName: 'sphereConnection',
		needsParentEntity: true
	},
	galaxy: {
		component: GalaxyViewer,
		propName: 'galaxy',
		needsParentEntity: true
	},
	solarSystem: {
		component: SolarSystemViewer,
		propName: 'solarSystem',
		needsParentEntity: true
	},
	planet: {
		component: PlanetViewer,
		propName: 'planet',
		needsParentEntity: true
	}
};

/**
 * Get viewer configuration for an entity type
 */
export function getViewerConfig(entityType: string): ViewerConfig | null {
	return viewerRegistry[entityType] || null;
}

/**
 * Check if an entity type has a specialized viewer
 */
export function hasSpecializedViewer(entityType: string): boolean {
	return entityType in viewerRegistry;
}
