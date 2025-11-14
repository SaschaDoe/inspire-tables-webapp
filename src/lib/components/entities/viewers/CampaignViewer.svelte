<script lang="ts">
	import type { Campaign } from '$lib/entities/campaign';
	import { getGenreFullName } from '$lib/entities/genre';
	import Section from '../shared/Section.svelte';

	interface Props {
		campaign: Campaign;
		parentEntity?: any;
	}

	let { campaign, parentEntity }: Props = $props();
</script>

<div class="campaign-viewer">
	<!-- Campaign Overview -->
	<Section title="Campaign Overview">
		<div class="overview-grid">
			<div class="info-item">
				<span class="label">Narrative Medium:</span>
				<span class="value">{campaign.narrativeMediumType}</span>
			</div>
			<div class="info-item">
				<span class="label">Blend Intensity:</span>
				<span class="value">{campaign.blendIntensity}/10</span>
			</div>
		</div>
	</Section>

	<!-- Genre Mix -->
	{#if campaign.genreMix}
		<Section title="Genre Mix">
			<!-- Primary Genre -->
			<div class="genre-block">
				<h4 class="genre-block-title">Primary Genre</h4>
				<div class="genre-info">
					<div class="genre-name">
						{campaign.genreMix.primaryGenre?.name || 'None'}
						{#if campaign.genreMix.primaryGenre?.subGenreName}
							<span class="genre-sub">({campaign.genreMix.primaryGenre.subGenreName})</span>
						{/if}
					</div>
					{#if campaign.genreMix.primaryGenre}
						{@const fullName = getGenreFullName(
							campaign.genreMix.primaryGenre.name,
							campaign.genreMix.primaryGenre.subGenreName
						)}
						<div class="genre-weight">
							Weight: {campaign.genreMix.genreWeights[fullName] || 100}%
						</div>
					{/if}
				</div>
			</div>

			<!-- Additional Genres -->
			{#if campaign.genreMix.subGenres.length > 0}
				<div class="genre-block">
					<h4 class="genre-block-title">Additional Genres</h4>
					<div class="additional-genres">
						{#each campaign.genreMix.subGenres as genre, index}
							{@const fullName = getGenreFullName(genre.name, genre.subGenreName)}
							<div class="genre-chip">
								<span class="genre-chip-name">
									{genre.name}
									{#if genre.subGenreName}
										<span class="genre-chip-sub">({genre.subGenreName})</span>
									{/if}
								</span>
								<span class="genre-chip-weight">
									{campaign.genreMix.genreWeights[fullName] || 0}%
								</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</Section>
	{/if}
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
</style>
