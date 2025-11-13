<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Entity } from '$lib/types/entity';
	import type { Character } from '$lib/entities/character/character';
	import type { Villain } from '$lib/entities/character/villain';
	import type { Monster } from '$lib/entities/monster/monster';
	import type { Dungeon, Room } from '$lib/entities/dungeon/dungeon';
	import type { Entrance } from '$lib/entities/dungeon/entrance';
	import type { Scene } from '$lib/entities/scene/scene';
	import type { Artefact } from '$lib/entities/artefact/artefact';
	import type { Adventure } from '$lib/entities/adventure/adventure';
	import type { Quest } from '$lib/entities/quest/quest';
	import type { Faction } from '$lib/entities/faction/faction';
	import type { Settlement } from '$lib/entities/location/settlement';
	import type { Universe } from '$lib/entities/celestial/universe';
	import type { Sphere } from '$lib/entities/celestial/sphere';

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

	// Import generic fallback viewer for entity types without specialized viewers
	import GenericEntityViewer from './viewers/GenericEntityViewer.svelte';

	interface Props {
		entity: any;
		entityType: string;
		parentEntity?: Entity;
	}

	let { entity, entityType, parentEntity }: Props = $props();

	const dispatch = createEventDispatcher<{
		openEntity: { entity: Entity };
		entityUpdated: { entity: Entity };
	}>();

	function handleOpenEntity(event: CustomEvent<{ entity: Entity }>) {
		dispatch('openEntity', event.detail);
	}

	function handleEntityUpdated(event: CustomEvent<{ entity: Entity }>) {
		dispatch('entityUpdated', event.detail);
	}

	/**
	 * Determine which viewer component to use based on entity type
	 */
	const viewerComponent = $derived.by(() => {
		switch (entityType) {
			case 'character':
				return CharacterViewer;
			case 'villain':
				return VillainViewer;
			case 'monster':
				return MonsterViewer;
			case 'dungeon':
				return DungeonViewer;
			case 'room':
				return RoomViewer;
			case 'entrance':
				return EntranceViewer;
			case 'scene':
				return SceneViewer;
			case 'artefact':
				return ArtefactViewer;
			case 'adventure':
				return AdventureViewer;
			case 'quest':
				return QuestViewer;
			case 'faction':
				return FactionViewer;
			case 'settlement':
				return SettlementViewer;
			case 'universe':
				return UniverseViewer;
			case 'sphere':
				return SphereViewer;
			default:
				return GenericEntityViewer;
		}
	});

	/**
	 * Get the appropriate props for the viewer component
	 */
	const viewerProps = $derived.by(() => {
		const baseProps: any = { entity };

		// Some viewers need special prop names or additional props
		switch (entityType) {
			case 'character':
				return { character: entity as Character };
			case 'villain':
				return { villain: entity as Villain };
			case 'monster':
				return { monster: entity as Monster };
			case 'dungeon':
				return { dungeon: entity as Dungeon };
			case 'room':
				return { room: entity as Room, parentEntity };
			case 'entrance':
				return { entrance: entity as Entrance };
			case 'scene':
				return { scene: entity as Scene };
			case 'artefact':
				return { artefact: entity as Artefact };
			case 'adventure':
				return { adventure: entity as Adventure };
			case 'quest':
				return { quest: entity as Quest };
			case 'faction':
				return { faction: entity as Faction };
			case 'settlement':
				return { settlement: entity as Settlement };
			case 'universe':
				return { universe: entity as Universe };
			case 'sphere':
				return { sphere: entity as Sphere, parentEntity };
			default:
				return { entity, entityType };
		}
	});
</script>

<div class="entity-viewer">
	<svelte:component
		this={viewerComponent}
		{...viewerProps}
		on:openEntity={handleOpenEntity}
		on:entityUpdated={handleEntityUpdated}
	/>
</div>

<style>
	.entity-viewer {
		padding: 1.5rem;
		color: white;
		max-height: 60vh;
		overflow-y: auto;
	}

	.entity-viewer::-webkit-scrollbar {
		width: 8px;
	}

	.entity-viewer::-webkit-scrollbar-track {
		background: rgb(30 27 75 / 0.3);
		border-radius: 4px;
	}

	.entity-viewer::-webkit-scrollbar-thumb {
		background: rgb(168 85 247 / 0.5);
		border-radius: 4px;
	}

	.entity-viewer::-webkit-scrollbar-thumb:hover {
		background: rgb(168 85 247 / 0.7);
	}
</style>
