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
		{ label: 'Blend Intensity', value: `${campaign.blendIntensity}/10` }
	]);

	// Primary genre info
	const primaryGenreInfo = $derived(() => {
		if (!campaign.genreMix?.primaryGenre) return [];

		const primaryName = getGenreFullName(
			campaign.genreMix.primaryGenre.name,
			campaign.genreMix.primaryGenre.subGenreName
		);
		const primaryWeight = campaign.genreMix.genreWeights[primaryName] || 100;

		return [
			{ label: 'Main Genre', value: campaign.genreMix.primaryGenre.name },
			{ label: 'Sub-Type', value: campaign.genreMix.primaryGenre.subGenreName || 'None' },
			{ label: 'Weight', value: `${primaryWeight}%` }
		];
	});

	// Sub-genres info
	const subGenresInfo = $derived(() => {
		if (!campaign.genreMix) return [];

		return campaign.genreMix.subGenres.map((genre, index) => {
			const fullName = getGenreFullName(genre.name, genre.subGenreName);
			const weight = campaign.genreMix!.genreWeights[fullName] || 0;
			return {
				mainGenre: genre.name,
				subType: genre.subGenreName || 'None',
				weight: weight,
				index: index + 1
			};
		});
	});
</script>

<div class="campaign-viewer">
	<!-- Campaign name as heading -->
	<h2 class="campaign-name">{campaign.name || 'Unnamed Campaign'}</h2>

	<!-- Genre Mix -->
	{#if campaign.genreMix}
		<Section title="Genre Mix">
			<div class="genre-description">
				<p class="genre-desc-text">{campaign.genreMix.description}</p>
			</div>

			<!-- Primary Genre -->
			<div class="genre-section">
				<h3 class="genre-section-title">Primary Genre</h3>
				<InfoGrid items={primaryGenreInfo()} />
			</div>

			<!-- Sub-Genres -->
			{#if subGenresInfo().length > 0}
				<div class="genre-section">
					<h3 class="genre-section-title">
						Additional Genres ({subGenresInfo().length})
					</h3>
					{#each subGenresInfo() as subGenre}
						<div class="sub-genre-card">
							<div class="sub-genre-header">
								<span class="sub-genre-number">#{subGenre.index}</span>
								<span class="sub-genre-name">{subGenre.mainGenre}</span>
								<span class="sub-genre-weight">{subGenre.weight}%</span>
							</div>
							{#if subGenre.subType !== 'None'}
								<div class="sub-genre-type">{subGenre.subType}</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
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

	.genre-section {
		margin-top: 1.5rem;
	}

	.genre-section-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: rgb(192 132 252);
		margin: 0 0 0.75rem 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.sub-genre-card {
		margin-bottom: 0.75rem;
		padding: 0.75rem 1rem;
		background: rgb(30 27 75 / 0.4);
		border-left: 3px solid rgb(147 51 234 / 0.6);
		border-radius: 0.375rem;
	}

	.sub-genre-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.sub-genre-number {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		background: rgb(147 51 234 / 0.3);
		border-radius: 50%;
		font-size: 0.75rem;
		font-weight: 600;
		color: rgb(192 132 252);
	}

	.sub-genre-name {
		flex: 1;
		font-size: 0.9375rem;
		font-weight: 600;
		color: rgb(226 232 240);
		text-transform: capitalize;
	}

	.sub-genre-weight {
		font-size: 0.875rem;
		font-weight: 600;
		color: rgb(192 132 252);
		background: rgb(147 51 234 / 0.2);
		padding: 0.25rem 0.625rem;
		border-radius: 0.25rem;
	}

	.sub-genre-type {
		margin-top: 0.5rem;
		padding-left: 2.25rem;
		font-size: 0.8125rem;
		color: rgb(148 163 184);
		font-style: italic;
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
