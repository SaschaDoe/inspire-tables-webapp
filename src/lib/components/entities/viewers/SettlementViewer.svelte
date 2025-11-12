<script lang="ts">
	import type { Settlement } from '$lib/entities/location/settlement';
	import Section from '../shared/Section.svelte';
	import InfoGrid from '../shared/InfoGrid.svelte';

	interface Props {
		settlement: Settlement;
	}

	let { settlement }: Props = $props();

	const basicInfo = $derived([
		{ label: 'Name', value: settlement.name },
		{ label: 'Size', value: settlement.size },
		{ label: 'Population', value: settlement.population.toLocaleString() },
		{ label: 'Fame', value: settlement.fame }
	]);
</script>

<div class="settlement-viewer">
	<Section title="Settlement Overview">
		<InfoGrid items={basicInfo} />
	</Section>

	{#if settlement.events && settlement.events.length > 0}
		<Section title="Recent Events">
			<ul class="event-list">
				{#each settlement.events as event}
					<li class="event-item">{event}</li>
				{/each}
			</ul>
		</Section>
	{/if}

	<Section title="Description">
		<p class="description-text">{settlement.description}</p>
	</Section>
</div>

<style>
	.settlement-viewer {
		padding: 0;
	}

	.event-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.event-item {
		padding: 0.75rem;
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.375rem;
		color: rgb(216 180 254);
		font-size: 0.875rem;
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
