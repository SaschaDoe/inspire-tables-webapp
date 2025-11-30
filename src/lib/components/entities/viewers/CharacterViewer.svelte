<script lang="ts">
	import type { Character } from '$lib/entities/character/character';
	import type { EntityImage } from '$lib/entities/base/entity';
	import { CharacterCreator } from '$lib/entities/character/characterCreator';
	import Section from '../shared/Section.svelte';
	import InfoGrid from '../shared/InfoGrid.svelte';
	import AttributesGrid from '../shared/AttributesGrid.svelte';
	import EntityList from '../shared/EntityList.svelte';
	import ImageGenerationModal from '$lib/components/ImageGenerationModal.svelte';
	import { createEventDispatcher, onMount } from 'svelte';
	import { autoSaveNestedEntities, createAddEntityHandler, createEventForwarders } from './viewerUtils';
	import { entityStore } from '$lib/stores/entityStore';

	interface Props {
		character: Character;
		parentEntity?: any;
	}

	let { character, parentEntity }: Props = $props();

	const dispatch = createEventDispatcher();

	let isImageModalOpen = $state(false);

	// Use $derived for image - it syncs with prop and can be temporarily overridden
	let currentImage = $derived<EntityImage | undefined>(character.image);

	function handleImageGenerated(imageData: string, mimeType: string) {
		const newImage = { data: imageData, mimeType };
		currentImage = newImage; // Temporarily override derived value for immediate UI update
		character.image = newImage;
		entityStore.updateEntity(character.id, { image: newImage });
		dispatch('entityUpdated', { entity: character });
	}

	// Auto-save nested entities to navigator
	onMount(() => {
		autoSaveNestedEntities(
			{
				talents: { entities: character.talents, entityType: 'talent' }
			},
			parentEntity,
			dispatch
		);
	});

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

	const talentRules = CharacterCreator.NESTED_ENTITY_RULES.talents;

	const { handleOpenEntity, handleEntityUpdated } = createEventForwarders(dispatch);
	const handleAddTalent = createAddEntityHandler(character, 'talents', parentEntity, dispatch, talentRules.entityType);
</script>

<div class="character-viewer">
	<!-- Character Image Section -->
	<Section title="Portrait">
		<div class="portrait-section">
			{#if currentImage}
				<img
					src="data:{currentImage.mimeType};base64,{currentImage.data}"
					alt="{character.name}'s portrait"
					class="character-portrait"
				/>
			{:else}
				<div class="no-portrait">
					<span class="no-portrait-icon">👤</span>
					<span class="no-portrait-text">No portrait yet</span>
				</div>
			{/if}
			<button class="generate-image-btn" onclick={() => isImageModalOpen = true}>
				{currentImage ? 'Regenerate Portrait' : 'Generate Portrait'}
			</button>
		</div>
	</Section>

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

	<EntityList
		entities={character.talents}
		entityType={talentRules.entityType}
		displayName={talentRules.displayName}
		displayNamePlural="Talents"
		icon="✨"
		minRequired={talentRules.min}
		maxAllowed={talentRules.max}
		{parentEntity}
		onAddEntity={handleAddTalent}
		on:openEntity={handleOpenEntity}
		on:entityUpdated={handleEntityUpdated}
	/>
</div>

<ImageGenerationModal
	bind:isOpen={isImageModalOpen}
	onClose={() => isImageModalOpen = false}
	onImageGenerated={handleImageGenerated}
	entity={character}
	entityType="character"
/>

<style>
	.character-viewer {
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
		border: 2px solid rgb(168 85 247 / 0.3);
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
		border: 2px dashed rgb(168 85 247 / 0.3);
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
		background: rgb(168 85 247);
		color: white;
		border: none;
		border-radius: 0.5rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 0.875rem;
	}

	.generate-image-btn:hover {
		background: rgb(192 132 252);
		transform: translateY(-2px);
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
