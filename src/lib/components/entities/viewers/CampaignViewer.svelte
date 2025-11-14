<script lang="ts">
	import type { Campaign } from '$lib/entities/campaign';
	import { NarrativeMediumType } from '$lib/entities/campaign';
	import Section from '../shared/Section.svelte';
	import InfoGrid from '../shared/InfoGrid.svelte';
	import { createEventDispatcher } from 'svelte';
	import { getGenreFullName } from '$lib/entities/genre';

	interface Props {
		campaign: Campaign;
		parentEntity?: any;
	}

	let { campaign, parentEntity }: Props = $props();

	const dispatch = createEventDispatcher();

	// Basic info derived state
	const basicInfo = $derived([
		{ label: 'ID', value: campaign.id },
		{ label: 'Narrative Medium', value: campaign.narrativeMediumType },
		{
			label: 'Created',
			value: campaign.id ? new Date().toLocaleDateString() : '-'
		}
	]);

	// Genre mix info
	const genreMixInfo = $derived(() => {
		if (!campaign.genreMix) return [];

		const items: Array<{ label: string; value: string }> = [];

		if (campaign.genreMix.primaryGenre) {
			const primaryName = getGenreFullName(
				campaign.genreMix.primaryGenre.name,
				campaign.genreMix.primaryGenre.subGenreName
			);
			const primaryWeight = campaign.genreMix.genreWeights[primaryName] || 100;
			items.push({
				label: 'Primary Genre',
				value: `${primaryName} (${primaryWeight}%)`
			});
		}

		campaign.genreMix.subGenres.forEach((genre, index) => {
			const fullName = getGenreFullName(genre.name, genre.subGenreName);
			const weight = campaign.genreMix!.genreWeights[fullName] || 0;
			items.push({
				label: `Sub-Genre ${index + 1}`,
				value: `${fullName} (${weight}%)`
			});
		});

		items.push({
			label: 'Blend Intensity',
			value: `${campaign.genreMix.blendIntensity}/10`
		});

		return items;
	});
</script>

<div class="campaign-viewer">
	<!-- Campaign name as heading -->
	<h2 class="campaign-name">{campaign.name || 'Unnamed Campaign'}</h2>

	<!-- Basic Information -->
	<Section title="Campaign Information">
		<InfoGrid items={basicInfo} />
	</Section>

	<!-- Genre Mix -->
	{#if campaign.genreMix}
		<Section title="Genre Mix">
			<div class="genre-description">
				<p class="genre-desc-text">{campaign.genreMix.description}</p>
			</div>
			<InfoGrid items={genreMixInfo()} />
		</Section>
	{/if}

	<!-- Creation Log -->
	{#if campaign.creationLog && campaign.creationLog.length > 0}
		<Section title="Creation Log">
			<div class="creation-log">
				{#each campaign.creationLog as logEntry}
					<div class="log-entry">{logEntry}</div>
				{/each}
			</div>
		</Section>
	{/if}

	<!-- Description -->
	{#if campaign.description}
		<Section title="Description">
			<p class="description-text">{campaign.description}</p>
		</Section>
	{/if}
</div>

<style>
	.campaign-viewer {
		padding: 0;
	}

	.campaign-name {
		font-size: 2rem;
		font-weight: 700;
		color: rgb(192 132 252);
		margin: 0 0 1.5rem 0;
		text-align: center;
		letter-spacing: 0.02em;
	}

	.genre-description {
		margin-bottom: 1rem;
		padding: 1rem;
		background: rgb(30 27 75 / 0.4);
		border-left: 3px solid rgb(147 51 234);
		border-radius: 0.5rem;
	}

	.genre-desc-text {
		color: rgb(216 180 254);
		font-size: 0.9375rem;
		line-height: 1.6;
		margin: 0;
		font-style: italic;
	}

	.creation-log {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1rem;
		background: rgb(30 27 75 / 0.3);
		border-radius: 0.5rem;
		max-height: 400px;
		overflow-y: auto;
	}

	.log-entry {
		padding: 0.5rem 0.75rem;
		background: rgb(30 27 75 / 0.5);
		border-left: 2px solid rgb(147 51 234 / 0.5);
		border-radius: 0.375rem;
		font-size: 0.8125rem;
		color: rgb(203 213 225);
		font-family: 'Courier New', monospace;
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

	/* Custom scrollbar for creation log */
	.creation-log::-webkit-scrollbar {
		width: 8px;
	}

	.creation-log::-webkit-scrollbar-track {
		background: rgb(30 27 75 / 0.3);
		border-radius: 4px;
	}

	.creation-log::-webkit-scrollbar-thumb {
		background: rgb(147 51 234 / 0.5);
		border-radius: 4px;
	}

	.creation-log::-webkit-scrollbar-thumb:hover {
		background: rgb(147 51 234 / 0.7);
	}
</style>
