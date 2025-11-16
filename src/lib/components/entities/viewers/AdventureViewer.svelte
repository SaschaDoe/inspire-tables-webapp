<script lang="ts">
	import type { Adventure } from '$lib/entities/adventure/adventure';
	import Section from '../shared/Section.svelte';
	import InfoGrid from '../shared/InfoGrid.svelte';
	import StoryBoard from '$lib/components/storyboard/StoryBoard.svelte';
	import { getTvTropesUrl } from '$lib/utils/tvTropesUtils';

	interface Props {
		adventure: Adventure;
	}

	let { adventure }: Props = $props();

	const basicInfo = $derived([{ label: 'Name', value: adventure.name }]);
</script>

<div class="adventure-viewer">
	<!-- Adventure Information Section -->
	<Section title="Adventure Overview">
		<InfoGrid items={basicInfo} />
	</Section>

	<Section title="Story Structure">
		<div class="story-timeline">
			<div class="story-phase">
				<h4 class="phase-title">Beginning</h4>
				<p class="phase-content">{adventure.beginning}</p>
			</div>

			<div class="story-phase">
				<h4 class="phase-title">Rising Action</h4>
				<ul class="phase-list">
					{#each adventure.risingAction as event, i (i)}
						<li class="phase-item">{event}</li>
					{/each}
				</ul>
			</div>

			<div class="story-phase climax-phase">
				<h4 class="phase-title">Climax</h4>
				<p class="phase-content">{adventure.climax}</p>
			</div>

			<div class="story-phase">
				<h4 class="phase-title">Ending</h4>
				<p class="phase-content">{adventure.ending}</p>
			</div>
		</div>
	</Section>

	{#if adventure.plotTropes && adventure.plotTropes.length > 0}
		<Section title="Plot Tropes">
			<ul class="trope-list">
				{#each adventure.plotTropes as trope, i (i)}
					<li class="trope-item">
						<a
							href={getTvTropesUrl(trope)}
							target="_blank"
							rel="noopener noreferrer"
							class="trope-link"
						>
							{trope}
							<span class="external-icon">↗</span>
						</a>
					</li>
				{/each}
			</ul>
		</Section>
	{/if}

	<Section title="Full Description">
		<p class="description-text">{adventure.description}</p>
	</Section>

	<!-- Storyboard Section - Now integrated below -->
	<div class="storyboard-section">
		<h3 class="storyboard-title">🎬 Story Board</h3>
		<div class="storyboard-container">
			{#key adventure.id}
				<StoryBoard adventureId={adventure.id} />
			{/key}
		</div>
	</div>
</div>

<style>
	.adventure-viewer {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.storyboard-section {
		margin-top: 2rem;
		padding-top: 2rem;
		border-top: 2px solid rgb(168 85 247 / 0.3);
	}

	.storyboard-title {
		margin: 0 0 1.5rem 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: rgb(216 180 254);
		padding: 0 1.5rem;
	}

	.storyboard-container {
		min-height: 600px;
		height: 600px;
		background: rgb(30 27 75 / 0.2);
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.75rem;
		overflow: hidden;
	}

	.story-timeline {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.story-phase {
		padding: 1.25rem;
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.5rem;
		border-left: 4px solid rgb(168 85 247 / 0.5);
		transition: all 0.2s;
	}

	.story-phase:hover {
		border-color: rgb(168 85 247 / 0.5);
		background: rgb(30 27 75 / 0.7);
		transform: translateX(4px);
	}

	.climax-phase {
		border-left-color: rgb(220 38 38);
		background: rgb(88 28 135 / 0.2);
	}

	.phase-title {
		font-size: 1rem;
		font-weight: 600;
		color: rgb(216 180 254);
		margin: 0 0 0.75rem 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.phase-content {
		color: rgb(216 180 254 / 0.9);
		font-size: 0.875rem;
		line-height: 1.6;
		margin: 0;
	}

	.phase-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.phase-item {
		padding: 0.5rem 0.75rem;
		background: rgb(30 27 75 / 0.5);
		border-left: 2px solid rgb(168 85 247 / 0.5);
		border-radius: 0.25rem;
		color: rgb(216 180 254 / 0.9);
		font-size: 0.875rem;
	}

	.trope-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.trope-item {
		padding: 0.75rem;
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.375rem;
		font-size: 0.875rem;
		transition: all 0.2s;
	}

	.trope-item:hover {
		background: rgb(30 27 75 / 0.7);
		border-color: rgb(168 85 247 / 0.4);
		transform: translateX(2px);
	}

	.trope-link {
		color: rgb(216 180 254);
		text-decoration: none;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		transition: color 0.2s;
	}

	.trope-link:hover {
		color: rgb(233 213 255);
	}

	.external-icon {
		font-size: 0.75rem;
		color: rgb(168 85 247);
		opacity: 0.7;
		transition: opacity 0.2s;
	}

	.trope-link:hover .external-icon {
		opacity: 1;
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
