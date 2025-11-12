<script lang="ts">
	import type { Character } from '$lib/entities/character/character';
	import Section from '../shared/Section.svelte';
	import InfoGrid from '../shared/InfoGrid.svelte';
	import AttributesGrid from '../shared/AttributesGrid.svelte';

	interface Props {
		character: Character;
	}

	let { character }: Props = $props();

	const basicInfo = $derived([
		{ label: 'Name', value: character.name || 'Unnamed' },
		{ label: 'Race', value: character.race },
		{ label: 'Gender', value: character.gender },
		{ label: 'Profession', value: character.profession },
		{ label: 'Alignment', value: character.alignment },
		{ label: 'Nobility', value: character.nobility }
	]);

	const personalityTraits = $derived([
		{ label: 'Conscientiousness', value: character.bigFive.conscientiousness },
		{ label: 'Agreeableness', value: character.bigFive.agreeableness },
		{ label: 'Neuroticism', value: character.bigFive.neuroticism },
		{ label: 'Openness', value: character.bigFive.openness },
		{ label: 'Extraversion', value: character.bigFive.extraversion }
	]);

	const specialFeatures = $derived(
		[
			character.advantage
				? { label: 'Advantage', value: character.advantage, valueClass: 'positive' }
				: null,
			character.disadvantage
				? { label: 'Disadvantage', value: character.disadvantage, valueClass: 'negative' }
				: null,
			character.curse ? { label: 'Curse', value: character.curse, valueClass: 'negative' } : null,
			{ label: 'Motivation', value: character.motivation },
			{ label: 'Device', value: character.device }
		].filter(Boolean)
	);
</script>

<div class="character-viewer">
	<Section title="Basic Information">
		<InfoGrid items={basicInfo} />
	</Section>

	<Section title="Attributes">
		<AttributesGrid attributes={character.attributes} />
	</Section>

	<Section title="Personality (Big Five)">
		<div class="personality-grid">
			{#each personalityTraits as trait}
				<div class="personality-trait">
					<span class="trait-name">{trait.label}:</span>
					<span class="trait-value">{trait.value}</span>
				</div>
			{/each}
		</div>
	</Section>

	<Section title="Special Features">
		<InfoGrid items={specialFeatures} />
	</Section>
</div>

<style>
	.character-viewer {
		padding: 0;
	}

	.personality-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1rem;
	}

	.personality-trait {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.5rem;
		transition: all 0.2s;
	}

	.personality-trait:hover {
		border-color: rgb(168 85 247 / 0.5);
		background: rgb(30 27 75 / 0.7);
		transform: translateY(-2px);
	}

	.trait-name {
		font-size: 0.875rem;
		color: rgb(216 180 254);
	}

	.trait-value {
		font-size: 1rem;
		color: white;
		font-weight: 600;
	}
</style>
