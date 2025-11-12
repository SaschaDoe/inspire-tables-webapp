<script lang="ts">
	import type { Faction } from '$lib/entities/faction/faction';
	import Section from '../shared/Section.svelte';
	import InfoGrid from '../shared/InfoGrid.svelte';

	interface Props {
		faction: Faction;
	}

	let { faction }: Props = $props();

	const basicInfo = $derived([
		{ label: 'Name', value: faction.name },
		{ label: 'Alignment', value: faction.alignment },
		{ label: 'Size', value: faction.size },
		{ label: 'Influence', value: faction.influence },
		{ label: 'Wealth', value: faction.wealth },
		{ label: 'Motivation', value: faction.motivation }
	]);
</script>

<div class="faction-viewer">
	<Section title="Faction Overview">
		<InfoGrid items={basicInfo} />
	</Section>

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
