<script lang="ts">
	import type { Villain } from '$lib/entities/character/villain';
	import type { EntityImage } from '$lib/entities/base/entity';
	import Section from '../shared/Section.svelte';
	import InfoGrid from '../shared/InfoGrid.svelte';
	import AttributesGrid from '../shared/AttributesGrid.svelte';
	import ImageGenerationModal from '$lib/components/ImageGenerationModal.svelte';
	import { createEventDispatcher } from 'svelte';
	import { entityStore } from '$lib/stores/entityStore';

	interface Props {
		villain: Villain;
	}

	let { villain }: Props = $props();

	const dispatch = createEventDispatcher();
	let isImageModalOpen = $state(false);

	// Use $derived for image - it syncs with prop and can be temporarily overridden
	let currentImage = $derived<EntityImage | undefined>(villain.image);

	function handleImageGenerated(imageData: string, mimeType: string) {
		const newImage = { data: imageData, mimeType };
		currentImage = newImage; // Temporarily override derived value for immediate UI update
		villain.image = newImage;
		entityStore.updateEntity(villain.id, { image: newImage });
		dispatch('entityUpdated', { entity: villain });
	}

	const basicInfo = $derived([
		{ label: 'Name', value: villain.name || 'Unnamed' },
		{ label: 'Race', value: villain.race },
		{ label: 'Gender', value: villain.gender },
		{ label: 'Profession', value: villain.profession },
		{ label: 'Alignment', value: villain.alignment },
		{ label: 'Shadow Archetype', value: villain.archetype, valueClass: 'negative' }
	]);

	const personalityTraits = $derived([
		{ label: 'Conscientiousness', value: villain.bigFive.conscientiousness },
		{ label: 'Agreeableness', value: villain.bigFive.agreeableness },
		{ label: 'Neuroticism', value: villain.bigFive.neuroticism },
		{ label: 'Openness', value: villain.bigFive.openness },
		{ label: 'Extraversion', value: villain.bigFive.extraversion }
	]);

	const specialFeatures = $derived(
		[
			villain.advantage
				? { label: 'Advantage', value: villain.advantage, valueClass: 'positive' }
				: null,
			villain.disadvantage
				? { label: 'Disadvantage', value: villain.disadvantage, valueClass: 'negative' }
				: null,
			villain.curse ? { label: 'Curse', value: villain.curse, valueClass: 'negative' } : null,
			{ label: 'Motivation', value: villain.motivation }
		].filter(Boolean)
	);
</script>

<div class="villain-viewer">
	<Section title="Portrait">
		<div class="portrait-section">
			{#if currentImage}
				<img
					src="data:{currentImage.mimeType};base64,{currentImage.data}"
					alt="{villain.name}'s portrait"
					class="character-portrait"
				/>
			{:else}
				<div class="no-portrait">
					<span class="no-portrait-icon">😈</span>
					<span class="no-portrait-text">No portrait yet</span>
				</div>
			{/if}
			<button class="generate-image-btn" onclick={() => isImageModalOpen = true}>
				{currentImage ? 'Regenerate Portrait' : 'Generate Portrait'}
			</button>
		</div>
	</Section>

	<Section title="Villain Profile">
		<InfoGrid items={basicInfo} />
	</Section>

	<Section title="Evil Scheme">
		<p class="scheme-text">{villain.scheme}</p>
	</Section>

	<Section title="Attributes">
		<AttributesGrid attributes={villain.attributes} />
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

<ImageGenerationModal
	bind:isOpen={isImageModalOpen}
	onClose={() => isImageModalOpen = false}
	onImageGenerated={handleImageGenerated}
	entity={villain}
	entityType="villain"
/>

<style>
	.villain-viewer {
		padding: 0;
	}

	.portrait-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.character-portrait {
		max-width: 300px;
		max-height: 300px;
		border-radius: 0.75rem;
		border: 2px solid rgb(220 38 38 / 0.5);
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
	}

	.no-portrait {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 200px;
		height: 200px;
		background: rgb(30 27 75 / 0.5);
		border: 2px dashed rgb(220 38 38 / 0.3);
		border-radius: 0.75rem;
		gap: 0.5rem;
	}

	.no-portrait-icon {
		font-size: 3rem;
		opacity: 0.5;
	}

	.no-portrait-text {
		color: rgb(216 180 254 / 0.7);
		font-size: 0.875rem;
	}

	.generate-image-btn {
		padding: 0.625rem 1.25rem;
		background: rgb(220 38 38);
		color: white;
		border: none;
		border-radius: 0.5rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 0.875rem;
	}

	.generate-image-btn:hover {
		background: rgb(248 113 113);
		transform: translateY(-2px);
	}

	.scheme-text {
		padding: 1rem;
		background: rgb(88 28 135 / 0.2);
		border-left: 4px solid rgb(220 38 38);
		border-radius: 0.5rem;
		color: rgb(252 165 165);
		font-size: 1rem;
		font-style: italic;
		margin: 0;
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
