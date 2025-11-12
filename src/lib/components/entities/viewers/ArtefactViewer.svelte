<script lang="ts">
	import type { Artefact } from '$lib/entities/artefact/artefact';
	import Section from '../shared/Section.svelte';
	import InfoGrid from '../shared/InfoGrid.svelte';

	interface Props {
		artefact: Artefact;
	}

	let { artefact }: Props = $props();

	const basicInfo = $derived([
		{ label: 'Name', value: artefact.name },
		{ label: 'Type', value: artefact.type },
		{ label: 'Quality', value: artefact.quality },
		{ label: 'Material', value: artefact.material },
		{ label: 'Rarity', value: artefact.rarity }
	]);
</script>

<div class="artefact-viewer">
	<Section title="Artefact Details">
		<InfoGrid items={basicInfo} />
	</Section>

	{#if artefact.talents && artefact.talents.length > 0}
		<Section title="Magical Properties">
			<ul class="property-list">
				{#each artefact.talents as talent}
					<li class="property-item">{talent}</li>
				{/each}
			</ul>
		</Section>
	{/if}
</div>

<style>
	.artefact-viewer {
		padding: 0;
	}

	.property-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.property-item {
		padding: 0.75rem;
		background: rgb(88 28 135 / 0.2);
		border: 1px solid rgb(168 85 247 / 0.3);
		border-radius: 0.375rem;
		color: rgb(216 180 254);
		font-size: 0.875rem;
		border-left: 3px solid rgb(168 85 247);
	}
</style>
