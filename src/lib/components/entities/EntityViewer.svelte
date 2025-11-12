<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Entity } from '$lib/types/entity';
	import type { Character } from '$lib/entities/character/character';
	import type { Villain } from '$lib/entities/character/villain';
	import type { Monster } from '$lib/entities/monster/monster';
	import type { Dungeon, Room } from '$lib/entities/dungeon/dungeon';
	import type { Entrance } from '$lib/entities/dungeon/entrance';

	// Import specialized viewers
	import CharacterViewer from './viewers/CharacterViewer.svelte';
	import VillainViewer from './viewers/VillainViewer.svelte';
	import MonsterViewer from './viewers/MonsterViewer.svelte';
	import DungeonViewer from './DungeonViewer.svelte';
	import RoomViewer from './RoomViewer.svelte';
	import EntranceViewer from './EntranceViewer.svelte';

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
	}>();

	function handleOpenEntity(event: CustomEvent<{ entity: Entity }>) {
		dispatch('openEntity', event.detail);
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
			default:
				return { entity, entityType };
		}
	});
</script>

<div class="entity-viewer">
	<svelte:component this={viewerComponent} {...viewerProps} on:openEntity={handleOpenEntity} />
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
