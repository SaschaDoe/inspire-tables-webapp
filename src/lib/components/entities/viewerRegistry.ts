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
