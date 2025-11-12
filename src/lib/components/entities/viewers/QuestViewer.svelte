<script lang="ts">
	import type { Quest } from '$lib/entities/quest/quest';
	import Section from '../shared/Section.svelte';
	import InfoGrid from '../shared/InfoGrid.svelte';

	interface Props {
		quest: Quest;
	}

	let { quest }: Props = $props();

	const basicInfo = $derived([
		{ label: 'Name', value: quest.name },
		{ label: 'Type', value: quest.type },
		{ label: 'Difficulty', value: quest.difficulty },
		{ label: 'Location', value: quest.location },
		{ label: 'Quest Giver', value: quest.giver },
		{ label: 'Reward', value: quest.reward, valueClass: 'positive' }
	]);
</script>

<div class="quest-viewer">
	<Section title="Quest Details">
		<InfoGrid items={basicInfo} />
	</Section>

	<Section title="Objective">
		<p class="description-text objective">{quest.objective}</p>
	</Section>

	<Section title="Description">
		<p class="description-text">{quest.description}</p>
	</Section>
</div>

<style>
	.quest-viewer {
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

	.objective {
		border-left-color: rgb(34 197 94);
		background: rgb(34 197 94 / 0.1);
		font-weight: 500;
	}
</style>
