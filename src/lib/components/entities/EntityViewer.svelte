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
	import type { City } from '$lib/entities/location/city';
	import type { Universe } from '$lib/entities/celestial/universe';
	import type { Sphere } from '$lib/entities/celestial/sphere';
	import type { SphereConnection } from '$lib/entities/celestial/sphereConnection';
	import type { Galaxy } from '$lib/entities/celestial/galaxy';
	import type { SolarSystem } from '$lib/entities/celestial/solarSystem';
	import type { Planet } from '$lib/entities/celestial/planet';
	import type { Continent } from '$lib/entities/location/continent';
	import type { Campaign } from '$lib/entities/campaign';

	// Import specialized viewers
	import CampaignViewer from './viewers/CampaignViewer.svelte';
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
	import CityViewer from './viewers/CityViewer.svelte';
	import UniverseViewer from './viewers/UniverseViewer.svelte';
	import SphereViewer from './viewers/SphereViewer.svelte';
	import SphereConnectionViewer from './viewers/SphereConnectionViewer.svelte';
	import GalaxyViewer from './viewers/GalaxyViewer.svelte';
	import SolarSystemViewer from './viewers/SolarSystemViewer.svelte';
	import PlanetViewer from './viewers/PlanetViewer.svelte';
	import ContinentViewer from './viewers/ContinentViewer.svelte';

	// Import generic fallback viewer for entity types without specialized viewers
	import GenericEntityViewer from './viewers/GenericEntityViewer.svelte';

	interface Props {
		entity: any;
		entityType: string;
		parentEntity?: Entity;
		hideEditableFields?: boolean; // Pass to viewers to hide editable fields in modal
	}

	let { entity, entityType, parentEntity, hideEditableFields = false }: Props = $props();

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
			case 'campaign':
				return CampaignViewer;
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
			case 'city':
				return CityViewer;
			case 'universe':
				return UniverseViewer;
			case 'sphere':
				return SphereViewer;
			case 'sphereConnection':
				return SphereConnectionViewer;
			case 'galaxy':
				return GalaxyViewer;
			case 'solarSystem':
				return SolarSystemViewer;
			case 'planet':
				return PlanetViewer;
			case 'continent':
				return ContinentViewer;
			default:
				return GenericEntityViewer;
		}
	});

	/**
	 * Get the appropriate props for the viewer component
	 * Make entity and parentEntity reactive by wrapping in $derived
	 */
	const viewerProps = $derived.by(() => {
		const baseProps: any = { entity };

		// Some viewers need special prop names or additional props
		switch (entityType) {
			case 'campaign':
				return { campaign: entity as Campaign, parentEntity, hideEditableFields };
			case 'character':
				return { character: entity as Character, parentEntity };
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
				return { faction: entity as Faction, parentEntity };
			case 'settlement':
				return { settlement: entity as Settlement };
			case 'city':
				return { city: entity as City };
			case 'universe':
				return { universe: entity as Universe, parentEntity };
			case 'sphere':
				return { sphere: entity as Sphere, parentEntity };
			case 'sphereConnection':
				return { sphereConnection: entity as SphereConnection, parentEntity };
			case 'galaxy':
				return { galaxy: entity as Galaxy, parentEntity };
			case 'solarSystem':
				return { solarSystem: entity as SolarSystem, parentEntity };
			case 'planet':
				return { planet: entity as Planet, parentEntity };
			case 'continent':
				return { continent: entity as Continent, parentEntity };
			default:
				return { entity, entityType };
		}
	});
</script>

<div class="entity-viewer">
	{#if entityType === 'campaign'}
		<CampaignViewer {...viewerProps} on:openEntity={handleOpenEntity} on:entityUpdated={handleEntityUpdated} />
	{:else if entityType === 'character'}
		<CharacterViewer {...viewerProps} on:openEntity={handleOpenEntity} on:entityUpdated={handleEntityUpdated} />
	{:else if entityType === 'villain'}
		<VillainViewer {...viewerProps} on:openEntity={handleOpenEntity} on:entityUpdated={handleEntityUpdated} />
	{:else if entityType === 'monster'}
		<MonsterViewer {...viewerProps} on:openEntity={handleOpenEntity} on:entityUpdated={handleEntityUpdated} />
	{:else if entityType === 'dungeon'}
		<DungeonViewer {...viewerProps} on:openEntity={handleOpenEntity} on:entityUpdated={handleEntityUpdated} />
	{:else if entityType === 'room'}
		<RoomViewer {...viewerProps} on:openEntity={handleOpenEntity} on:entityUpdated={handleEntityUpdated} />
	{:else if entityType === 'entrance'}
		<EntranceViewer {...viewerProps} on:openEntity={handleOpenEntity} on:entityUpdated={handleEntityUpdated} />
	{:else if entityType === 'scene'}
		<SceneViewer {...viewerProps} on:openEntity={handleOpenEntity} on:entityUpdated={handleEntityUpdated} />
	{:else if entityType === 'artefact'}
		<ArtefactViewer {...viewerProps} on:openEntity={handleOpenEntity} on:entityUpdated={handleEntityUpdated} />
	{:else if entityType === 'adventure'}
		<AdventureViewer {...viewerProps} on:openEntity={handleOpenEntity} on:entityUpdated={handleEntityUpdated} />
	{:else if entityType === 'quest'}
		<QuestViewer {...viewerProps} on:openEntity={handleOpenEntity} on:entityUpdated={handleEntityUpdated} />
	{:else if entityType === 'faction'}
		<FactionViewer {...viewerProps} on:openEntity={handleOpenEntity} on:entityUpdated={handleEntityUpdated} />
	{:else if entityType === 'settlement'}
		<SettlementViewer {...viewerProps} on:openEntity={handleOpenEntity} on:entityUpdated={handleEntityUpdated} />
	{:else if entityType === 'city'}
		<CityViewer {...viewerProps} on:openEntity={handleOpenEntity} on:entityUpdated={handleEntityUpdated} />
	{:else if entityType === 'universe'}
		<UniverseViewer {...viewerProps} on:openEntity={handleOpenEntity} on:entityUpdated={handleEntityUpdated} />
	{:else if entityType === 'sphere'}
		<SphereViewer {...viewerProps} on:openEntity={handleOpenEntity} on:entityUpdated={handleEntityUpdated} />
	{:else if entityType === 'sphereConnection'}
		<SphereConnectionViewer {...viewerProps} on:openEntity={handleOpenEntity} on:entityUpdated={handleEntityUpdated} />
	{:else if entityType === 'galaxy'}
		<GalaxyViewer {...viewerProps} on:openEntity={handleOpenEntity} on:entityUpdated={handleEntityUpdated} />
	{:else if entityType === 'solarSystem'}
		<SolarSystemViewer {...viewerProps} on:openEntity={handleOpenEntity} on:entityUpdated={handleEntityUpdated} />
	{:else if entityType === 'planet'}
		<PlanetViewer {...viewerProps} on:openEntity={handleOpenEntity} on:entityUpdated={handleEntityUpdated} />
	{:else if entityType === 'continent'}
		<ContinentViewer {...viewerProps} on:openEntity={handleOpenEntity} on:entityUpdated={handleEntityUpdated} />
	{:else}
		<GenericEntityViewer {...viewerProps} on:openEntity={handleOpenEntity} on:entityUpdated={handleEntityUpdated} />
	{/if}
</div>

<style>
	.entity-viewer {
		padding: 1.5rem;
		color: white;
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
