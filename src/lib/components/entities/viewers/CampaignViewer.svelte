<script lang="ts">
	import type { Campaign } from '$lib/entities/campaign';
	import { CampaignCreator } from '$lib/creators/campaignCreator';
	import { getGenreFullName } from '$lib/entities/genre';
	import Section from '../shared/Section.svelte';
	import InfoGrid from '../shared/InfoGrid.svelte';
	import EntityList from '../shared/EntityList.svelte';
	import { createEventDispatcher, onMount } from 'svelte';
	import { autoSaveNestedEntities, createAddEntityHandler, createEventForwarders } from './viewerUtils';

	interface Props {
		campaign: Campaign;
		parentEntity?: any;
	}

	let { campaign, parentEntity }: Props = $props();

	const dispatch = createEventDispatcher();

	// DEBUG: Log the entire campaign object
	$effect(() => {
		console.log('==== CAMPAIGN VIEWER ====');
		console.log('Full campaign object:', campaign);
		console.log('campaign.genreMix:', campaign?.genreMix);
		console.log('Type of genreMix:', typeof campaign?.genreMix);
		console.log('Is genreMix an object?:', campaign?.genreMix && typeof campaign?.genreMix === 'object');
		if (campaign?.genreMix) {
			console.log('Keys in genreMix:', Object.keys(campaign.genreMix));
			console.log('primaryGenre:', campaign.genreMix.primaryGenre);
			console.log('genreWeights:', campaign.genreMix.genreWeights);
		}
		console.log('========================');
	});

	// Auto-save nested entities to navigator
	onMount(() => {
		autoSaveNestedEntities(
			{
				adventures: { entities: campaign.adventures, entityType: 'adventure' },
				universes: { entities: campaign.universes, entityType: 'universe' }
			},
			parentEntity,
			dispatch
		);
	});

	const adventureRules = CampaignCreator.NESTED_ENTITY_RULES.adventures;
	const universeRules = CampaignCreator.NESTED_ENTITY_RULES.universes;

	const { handleOpenEntity, handleEntityUpdated } = createEventForwarders(dispatch);
	const handleAddAdventure = createAddEntityHandler(campaign, 'adventures', parentEntity, dispatch);
	const handleAddUniverse = createAddEntityHandler(campaign, 'universes', parentEntity, dispatch);

	// Campaign Information
	const campaignInfo = $derived([
		{ label: 'Narrative Medium', value: campaign.narrativeMediumType },
		{ label: 'Setting/World', value: campaign.setting || 'Not specified' },
		{ label: 'Tone', value: campaign.tone || 'Not specified' },
		{ label: 'Power Scale', value: campaign.powerScale || 'Not specified' },
		{ label: 'Duration Type', value: campaign.durationType || 'Not specified' },
		{ label: 'Time Period', value: campaign.timePeriod || 'Not specified' },
		{ label: 'Blend Intensity', value: `${campaign.blendIntensity}/10` }
	]);

	// Genre Mix Info
	const genreMixInfo = $derived.by(() => {
		console.log('🎯 DERIVED RUNNING - genreMixInfo');
		// Debug logging
		console.log('Campaign genreMix:', campaign?.genreMix);
		console.log('Primary Genre:', campaign?.genreMix?.primaryGenre);
		console.log('Genre Weights:', campaign?.genreMix?.genreWeights);

		// Comprehensive null checks
		if (!campaign) {
			console.log('No campaign');
			return null;
		}
		if (!campaign.genreMix) {
			console.log('No genreMix');
			return null;
		}
		if (!campaign.genreMix.primaryGenre) {
			console.log('No primaryGenre');
			return null;
		}
		if (!campaign.genreMix.primaryGenre.name) {
			console.log('No primaryGenre.name');
			return null;
		}
		if (!campaign.genreMix.genreWeights) {
			console.log('No genreWeights');
			return null;
		}

		try {
			const primaryFullName = getGenreFullName(
				campaign.genreMix.primaryGenre.name,
				campaign.genreMix.primaryGenre.subGenreName || ''
			);
			const primaryWeight = campaign.genreMix.genreWeights[primaryFullName] || 100;

			const subGenres = campaign.genreMix.subGenres || [];

			console.log('Genre mix info successfully generated');
			return {
				primary: {
					name: campaign.genreMix.primaryGenre.name || 'Unknown',
					subGenre: campaign.genreMix.primaryGenre.subGenreName || null,
					weight: primaryWeight
				},
				additional: subGenres.map(genre => {
					if (!genre || !genre.name) return null;
					const fullName = getGenreFullName(genre.name, genre.subGenreName || '');
					return {
						name: genre.name,
						subGenre: genre.subGenreName || null,
						weight: campaign.genreMix.genreWeights[fullName] || 0
					};
				}).filter(g => g !== null)
			};
		} catch (error) {
			console.error('Error generating genreMixInfo:', error);
			return null;
		}
	});
</script>

<div class="campaign-viewer">
	<Section title="Campaign Information">
		<InfoGrid items={campaignInfo} />
	</Section>

	{#if campaign.centralConflict}
		<Section title="Central Conflict">
			<p class="description-text">{campaign.centralConflict}</p>
		</Section>
	{/if}

	{#if campaign.genreMix}
		<Section title="Genre Mix">
			{#if genreMixInfo && genreMixInfo.primary}
				<!-- Primary Genre -->
				<div class="genre-block">
					<h4 class="genre-block-title">Primary Genre</h4>
					<div class="genre-info">
						<div class="genre-name">
							{genreMixInfo.primary.name}
							{#if genreMixInfo.primary.subGenre}
								<span class="genre-sub">({genreMixInfo.primary.subGenre})</span>
							{/if}
						</div>
						<div class="genre-weight">Weight: {genreMixInfo.primary.weight}%</div>
					</div>
				</div>

				<!-- Additional Genres -->
				{#if genreMixInfo.additional && genreMixInfo.additional.length > 0}
					<div class="genre-block">
						<h4 class="genre-block-title">Additional Genres</h4>
						<div class="additional-genres">
							{#each genreMixInfo.additional as genre}
								<div class="genre-chip">
									<span class="genre-chip-name">
										{genre.name}
										{#if genre.subGenre}
											<span class="genre-chip-sub">({genre.subGenre})</span>
										{/if}
									</span>
									<span class="genre-chip-weight">{genre.weight}%</span>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			{:else}
				<p class="description-text">Genre information not available for this campaign.</p>
			{/if}
		</Section>
	{/if}

	<EntityList
		entities={campaign.universes}
		entityType={universeRules.entityType}
		displayName={universeRules.displayName}
		displayNamePlural="Universes"
		icon="🌌"
		minRequired={universeRules.min}
		maxAllowed={universeRules.max}
		{parentEntity}
		onAddEntity={handleAddUniverse}
		on:openEntity={handleOpenEntity}
		on:entityUpdated={handleEntityUpdated}
	/>

	<EntityList
		entities={campaign.adventures}
		entityType={adventureRules.entityType}
		displayName={adventureRules.displayName}
		displayNamePlural="Adventures"
		icon="🗺️"
		minRequired={adventureRules.min}
		maxAllowed={adventureRules.max}
		{parentEntity}
		onAddEntity={handleAddAdventure}
		on:openEntity={handleOpenEntity}
		on:entityUpdated={handleEntityUpdated}
	/>
</div>

<style>
	.campaign-viewer {
		padding: 0;
	}

	.overview-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
	}

	.info-item {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.75rem;
		background: rgb(30 27 75 / 0.3);
		border-radius: 0.5rem;
		border: 1px solid rgb(168 85 247 / 0.2);
	}

	.label {
		color: rgb(192 132 252);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.value {
		color: rgb(226 232 240);
		font-size: 1rem;
		font-weight: 500;
	}

	.genre-block {
		margin-top: 1.5rem;
	}

	.genre-block:first-child {
		margin-top: 0;
	}

	.genre-block-title {
		color: rgb(192 132 252);
		font-size: 0.875rem;
		font-weight: 600;
		margin: 0 0 0.75rem 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.genre-info {
		padding: 1rem;
		background: rgb(30 27 75 / 0.3);
		border-left: 3px solid rgb(147 51 234);
		border-radius: 0.5rem;
	}

	.genre-name {
		color: rgb(226 232 240);
		font-size: 1.125rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}

	.genre-sub {
		color: rgb(192 132 252);
		font-size: 0.9rem;
		font-weight: 500;
	}

	.genre-weight {
		color: rgb(216 180 254);
		font-size: 0.875rem;
	}

	.additional-genres {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.genre-chip {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 1rem;
		background: rgb(30 27 75 / 0.4);
		border: 1px solid rgb(147 51 234 / 0.5);
		border-radius: 2rem;
	}

	.genre-chip-name {
		color: rgb(226 232 240);
		font-size: 0.875rem;
		font-weight: 500;
	}

	.genre-chip-sub {
		color: rgb(192 132 252);
		font-size: 0.8125rem;
	}

	.genre-chip-weight {
		color: rgb(192 132 252);
		font-size: 0.8125rem;
		font-weight: 600;
		background: rgb(147 51 234 / 0.3);
		padding: 0.125rem 0.5rem;
		border-radius: 1rem;
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
