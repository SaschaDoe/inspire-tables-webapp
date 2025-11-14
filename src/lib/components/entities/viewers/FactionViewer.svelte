<script lang="ts">
	import type { Faction } from '$lib/entities/faction/faction';
	import { FactionCreator } from '$lib/entities/faction/factionCreator';
	import Section from '../shared/Section.svelte';
	import InfoGrid from '../shared/InfoGrid.svelte';
	import EntityList from '../shared/EntityList.svelte';
	import { createEventDispatcher, onMount } from 'svelte';
	import { autoSaveNestedEntities, createAddEntityHandler, createEventForwarders } from './viewerUtils';

	interface Props {
		faction: Faction;
		parentEntity?: any;
	}

	let { faction, parentEntity }: Props = $props();

	const dispatch = createEventDispatcher();

	// Auto-save nested entities to navigator
	onMount(() => {
		autoSaveNestedEntities(
			{
				rituals: { entities: faction.rituals, entityType: 'ritual' }
			},
			parentEntity,
			dispatch
		);
	});

	const basicInfo = $derived([
		{ label: 'Name', value: faction.name },
		{ label: 'Alignment', value: faction.alignment },
		{ label: 'Size', value: faction.size },
		{ label: 'Influence', value: faction.influence },
		{ label: 'Wealth', value: faction.wealth },
		{ label: 'Motivation', value: faction.motivation }
	]);

	const ritualRules = FactionCreator.NESTED_ENTITY_RULES.rituals;

	const { handleOpenEntity, handleEntityUpdated } = createEventForwarders(dispatch);
	const handleAddRitual = createAddEntityHandler(faction, 'rituals', parentEntity, dispatch);
</script>

<div class="faction-viewer">
	<Section title="Faction Overview">
		<InfoGrid items={basicInfo} />
	</Section>

	<EntityList
		entities={faction.rituals}
		entityType={ritualRules.entityType}
		displayName={ritualRules.displayName}
		displayNamePlural="Rituals"
		icon="🔮"
		minRequired={ritualRules.min}
		maxAllowed={ritualRules.max}
		{parentEntity}
		onAddEntity={handleAddRitual}
		on:openEntity={handleOpenEntity}
		on:entityUpdated={handleEntityUpdated}
	/>

	<Section title="Description">
		<p class="description-text">{faction.description}</p>
	</Section>
</div>

<style>
	.faction-viewer {
		padding: 0;
	}

	.description-text {
		padding: 1rem;
		background: rgb(30 27 75 / 0.3);
		border-left: 3px solid rgb(168 85 247);
		border-radius: 0.5rem;
		color: rgb(216 180 254);
		font-size: 0.875rem;
		line-height: 1.6;
		margin: 0;
		white-space: pre-wrap;
	}
</style>
