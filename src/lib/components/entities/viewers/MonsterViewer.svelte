<script lang="ts">
	import type { Monster } from '$lib/entities/monster/monster';
	import Section from '../shared/Section.svelte';
	import InfoGrid from '../shared/InfoGrid.svelte';
	import AttributesGrid from '../shared/AttributesGrid.svelte';
	import TalentCard from '../shared/TalentCard.svelte';
	import { formatList } from '$lib/utils/entityViewerUtils';

	interface Props {
		monster: Monster;
	}

	let { monster }: Props = $props();

	const basicInfo = $derived(
		[
			{ label: 'Name', value: monster.name },
			{ label: 'Race(s)', value: formatList(monster.races) },
			{ label: 'Gender', value: monster.gender },
			{ label: 'Age', value: monster.age },
			{ label: 'Number', value: monster.number },
			monster.curse ? { label: 'Curse', value: monster.curse, valueClass: 'negative' } : null
		].filter(Boolean)
	);

	const behaviorInfo = $derived([
		{ label: 'Diet', value: monster.eaterType },
		{ label: 'Reproduction', value: monster.reproduction },
		{ label: 'Encounter Type', value: monster.encounterType },
		{ label: 'Movement', value: monster.movementType },
		{ label: 'Tracks', value: monster.tracks }
	]);
</script>

<div class="monster-viewer">
	<Section title="Monster Profile">
		<InfoGrid items={basicInfo} />
	</Section>

	<Section title="Attributes">
		<AttributesGrid attributes={monster.attributes} />
	</Section>

	<Section title="Behavior & Ecology">
		<InfoGrid items={behaviorInfo} />
	</Section>

	{#if monster.talents && monster.talents.length > 0}
		<Section title="Special Abilities">
			<div class="talents-grid">
				{#each monster.talents as talent}
					<TalentCard {talent} />
				{/each}
			</div>
		</Section>
	{/if}
</div>

<style>
	.monster-viewer {
		padding: 0;
	}

	.talents-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1rem;
	}
</style>
