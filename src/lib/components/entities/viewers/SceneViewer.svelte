<script lang="ts">
	import type { Scene } from '$lib/entities/scene/scene';
	import Section from '../shared/Section.svelte';
	import InfoGrid from '../shared/InfoGrid.svelte';

	interface Props {
		scene: Scene;
	}

	let { scene }: Props = $props();

	const basicInfo = $derived([
		{ label: 'Name', value: scene.name },
		{ label: 'Location', value: scene.location },
		{ label: 'Mood', value: scene.mood },
		{ label: 'Purpose', value: scene.purpose }
	]);
</script>

<div class="scene-viewer">
	<Section title="Scene Overview">
		<InfoGrid items={basicInfo} />
	</Section>

	{#if scene.sensoryDetails && scene.sensoryDetails.length > 0}
		<Section title="Sensory Details">
			<ul class="detail-list">
				{#each scene.sensoryDetails as detail}
					<li class="detail-item">{detail}</li>
				{/each}
			</ul>
		</Section>
	{/if}

	<Section title="Description">
		<p class="description-text">{scene.description}</p>
	</Section>
</div>

<style>
	.scene-viewer {
		padding: 0;
	}

	.detail-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.detail-item {
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
