<script lang="ts">
	import type { Monster } from '$lib/entities/monster/monster';
	import type { EntityImage } from '$lib/entities/base/entity';
	import Section from '../shared/Section.svelte';
	import InfoGrid from '../shared/InfoGrid.svelte';
	import AttributesGrid from '../shared/AttributesGrid.svelte';
	import TalentCard from '../shared/TalentCard.svelte';
	import ImageGenerationModal from '$lib/components/ImageGenerationModal.svelte';
	import { formatList } from '$lib/utils/entityViewerUtils';
	import { createEventDispatcher } from 'svelte';
	import { entityStore } from '$lib/stores/entityStore';

	interface Props {
		monster: Monster;
	}

	let { monster }: Props = $props();

	const dispatch = createEventDispatcher();
	let isImageModalOpen = $state(false);

	// Use $derived for image - it syncs with prop and can be temporarily overridden
	let currentImage = $derived<EntityImage | undefined>(monster.image);

	function handleImageGenerated(imageData: string, mimeType: string) {
		const newImage = { data: imageData, mimeType };
		currentImage = newImage; // Temporarily override derived value for immediate UI update
		monster.image = newImage;
		entityStore.updateEntity(monster.id, { image: newImage });
		dispatch('entityUpdated', { entity: monster });
	}

	const basicInfo = $derived(
		[
			{ label: 'Name', value: monster.name },
			{ label: 'Race(s)', value: formatList(monster.races) },
			{ label: 'Gender', value: monster.gender },
			{ label: 'Age', value: monster.age },
			{ label: 'Number', value: monster.number },
			monster.curse ? { label: 'Curse', value: monster.curse, valueClass: 'negative' } : null
		].filter(Boolean)
	);

	const behaviorInfo = $derived([
		{ label: 'Diet', value: monster.eaterType },
		{ label: 'Reproduction', value: monster.reproduction },
		{ label: 'Encounter Type', value: monster.encounterType },
		{ label: 'Movement', value: monster.movementType },
		{ label: 'Tracks', value: monster.tracks }
	]);
</script>

<div class="monster-viewer">
	<Section title="Portrait">
		<div class="portrait-section">
			{#if currentImage}
				<img
					src="data:{currentImage.mimeType};base64,{currentImage.data}"
					alt="{monster.name}'s portrait"
					class="monster-portrait"
				/>
			{:else}
				<div class="no-portrait">
					<span class="no-portrait-icon">👹</span>
					<span class="no-portrait-text">No portrait yet</span>
				</div>
			{/if}
			<button class="generate-image-btn" onclick={() => isImageModalOpen = true}>
				{currentImage ? 'Regenerate Portrait' : 'Generate Portrait'}
			</button>
		</div>
	</Section>

	<Section title="Monster Profile">
		<InfoGrid items={basicInfo} />
	</Section>

	<Section title="Attributes">
		<AttributesGrid attributes={monster.attributes} />
	</Section>

	<Section title="Behavior & Ecology">
		<InfoGrid items={behaviorInfo} />
	</Section>

	{#if monster.talents && monster.talents.length > 0}
		<Section title="Special Abilities">
			<div class="talents-grid">
				{#each monster.talents as talent}
					<TalentCard {talent} />
				{/each}
			</div>
		</Section>
	{/if}
</div>

<ImageGenerationModal
	bind:isOpen={isImageModalOpen}
	onClose={() => isImageModalOpen = false}
	onImageGenerated={handleImageGenerated}
	entity={monster}
	entityType="monster"
/>

<style>
	.monster-viewer {
		padding: 0;
	}

	.portrait-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.monster-portrait {
		max-width: 300px;
		max-height: 300px;
		border-radius: 0.75rem;
		border: 2px solid rgb(239 68 68 / 0.5);
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
		border: 2px dashed rgb(239 68 68 / 0.3);
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
		background: rgb(239 68 68);
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

	.talents-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1rem;
	}
</style>
