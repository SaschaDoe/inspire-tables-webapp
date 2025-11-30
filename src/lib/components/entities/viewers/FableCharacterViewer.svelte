<script lang="ts">
	import type { FableCharacter } from '$lib/entities/fableCharacter/fableCharacter';
	import type { EntityImage } from '$lib/entities/base/entity';
	import ImageGenerationModal from '$lib/components/ImageGenerationModal.svelte';
	import { createEventDispatcher } from 'svelte';
	import { entityStore } from '$lib/stores/entityStore';

	interface Props {
		fableCharacter: FableCharacter;
		parentEntity?: any;
	}

	let { fableCharacter, parentEntity }: Props = $props();

	const dispatch = createEventDispatcher();
	let isImageModalOpen = $state(false);

	// Use $derived for image - it syncs with prop and can be temporarily overridden
	let currentImage = $derived<EntityImage | undefined>(fableCharacter.image);

	function handleImageGenerated(imageData: string, mimeType: string) {
		const newImage = { data: imageData, mimeType };
		currentImage = newImage; // Temporarily override derived value for immediate UI update
		fableCharacter.image = newImage;
		entityStore.updateEntity(fableCharacter.id, { image: newImage });
		dispatch('entityUpdated', { entity: fableCharacter });
	}
</script>

<div class="fable-character-viewer">
	<!-- Hero Section: Portrait + Key Info -->
	<div class="hero-section">
		<div class="portrait-container">
			{#if currentImage}
				<img
					src="data:{currentImage.mimeType};base64,{currentImage.data}"
					alt="{fableCharacter.name}'s portrait"
					class="fable-portrait"
				/>
			{:else}
				<div class="no-portrait">
					<span class="no-portrait-icon">
						{#if fableCharacter.size === 'little'}
							🐛
						{:else if fableCharacter.size === 'small'}
							🦊
						{:else}
							🐻
						{/if}
					</span>
				</div>
			{/if}
			<button class="generate-image-btn" onclick={() => isImageModalOpen = true}>
				{currentImage ? 'Regenerate' : 'Generate Portrait'}
			</button>
		</div>

		<div class="hero-info">
			<h2 class="character-name">{fableCharacter.name} {fableCharacter.role}</h2>

			<div class="size-animal-badges">
				<span class="size-badge size-{fableCharacter.size}">{fableCharacter.size}</span>
				{#each fableCharacter.animals as animal (animal.type)}
					<span class="animal-tag">{animal.type}</span>
				{/each}
			</div>

			<p class="appearance-text">{fableCharacter.appearance}</p>

			<div class="trait-chips">
				<span class="trait-chip personality">{fableCharacter.personality}</span>
				<span class="trait-chip talent">+ {fableCharacter.talent}</span>
				<span class="trait-chip flaw">- {fableCharacter.flaw}</span>
			</div>

			<div class="hero-details">
				<div class="detail-item">
					<span class="detail-icon">🎯</span>
					<span class="detail-text"><strong>Motivation:</strong> {fableCharacter.motivation}</span>
				</div>
				<div class="detail-item">
					<span class="detail-icon">🏠</span>
					<span class="detail-text"><strong>Home:</strong> {fableCharacter.home}</span>
				</div>
			</div>

			<div class="catchphrase">
				<span class="quote-mark">"</span>
				<span class="quote-text">{fableCharacter.catchphrase}</span>
				<span class="quote-mark">"</span>
			</div>
		</div>
	</div>

	<!-- Artefacts -->
	{#if fableCharacter.artefacts.length > 0}
		<div class="artefacts-section">
			<h3 class="section-title">Possessions</h3>
			<div class="artefacts-list">
				{#each fableCharacter.artefacts as artefact}
					<div class="artefact-item">
						<span class="artefact-icon">
							{#if fableCharacter.size === 'little'}
								🌸
							{:else if fableCharacter.size === 'small'}
								🍂
							{:else}
								⚔️
							{/if}
						</span>
						<span class="artefact-name">{artefact}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Story/Description -->
	<div class="story-section">
		<p class="story-text">{fableCharacter.description}</p>
	</div>
</div>

<ImageGenerationModal
	bind:isOpen={isImageModalOpen}
	onClose={() => isImageModalOpen = false}
	onImageGenerated={handleImageGenerated}
	entity={fableCharacter}
	entityType="fableCharacter"
/>

<style>
	.fable-character-viewer {
		padding: 0;
	}

	/* Hero Section - Portrait + Key Info side by side */
	.hero-section {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 2rem;
		padding: 1.5rem;
		background: linear-gradient(135deg, rgb(30 27 75 / 0.8), rgb(88 28 135 / 0.4));
		border-radius: 1rem;
		border: 1px solid rgb(168 85 247 / 0.2);
		margin-bottom: 1.5rem;
	}

	.portrait-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}

	.fable-portrait {
		width: 160px;
		height: auto;
		max-height: 220px;
		object-fit: contain;
		border-radius: 1rem;
		border: 3px solid rgb(251 146 60 / 0.6);
		box-shadow: 0 8px 32px rgba(251, 146, 60, 0.2);
	}

	.no-portrait {
		width: 160px;
		height: 200px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, rgb(30 27 75), rgb(55 48 107));
		border: 2px dashed rgb(251 146 60 / 0.4);
		border-radius: 1rem;
	}

	.no-portrait-icon {
		font-size: 4rem;
		opacity: 0.6;
	}

	.generate-image-btn {
		padding: 0.5rem 1rem;
		background: rgb(251 146 60);
		color: white;
		border: none;
		border-radius: 0.5rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 0.75rem;
		width: 100%;
	}

	.generate-image-btn:hover {
		background: rgb(253 186 116);
		transform: translateY(-1px);
	}

	/* Hero Info */
	.hero-info {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.character-name {
		margin: 0;
		font-size: 1.4rem;
		color: white;
		font-weight: 600;
		line-height: 1.3;
	}

	.size-animal-badges {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.hero-details {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.detail-item {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
	}

	.detail-item .detail-icon {
		font-size: 1rem;
		flex-shrink: 0;
	}

	.detail-item .detail-text {
		color: rgb(203 213 225);
		font-size: 0.875rem;
		line-height: 1.4;
	}

	.detail-item .detail-text strong {
		color: rgb(192 132 252);
	}

	.size-badge {
		padding: 0.25rem 0.75rem;
		border-radius: 1rem;
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.size-badge.size-little {
		background: rgb(236 72 153 / 0.3);
		color: rgb(251 207 232);
		border: 1px solid rgb(236 72 153 / 0.5);
	}

	.size-badge.size-small {
		background: rgb(251 146 60 / 0.3);
		color: rgb(254 215 170);
		border: 1px solid rgb(251 146 60 / 0.5);
	}

	.size-badge.size-big {
		background: rgb(139 92 246 / 0.3);
		color: rgb(221 214 254);
		border: 1px solid rgb(139 92 246 / 0.5);
	}

	.animal-tag {
		padding: 0.375rem 0.875rem;
		background: rgb(34 197 94 / 0.2);
		border: 1px solid rgb(34 197 94 / 0.4);
		border-radius: 2rem;
		color: rgb(187 247 208);
		font-size: 0.875rem;
		font-weight: 500;
	}

	.appearance-text {
		margin: 0;
		color: rgb(203 213 225);
		font-size: 0.9rem;
		line-height: 1.5;
		font-style: italic;
	}

	.trait-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.trait-chip {
		padding: 0.375rem 0.75rem;
		border-radius: 0.5rem;
		font-size: 0.8rem;
		font-weight: 500;
	}

	.trait-chip.personality {
		background: rgb(59 130 246 / 0.2);
		border: 1px solid rgb(59 130 246 / 0.4);
		color: rgb(191 219 254);
	}

	.trait-chip.talent {
		background: rgb(34 197 94 / 0.2);
		border: 1px solid rgb(34 197 94 / 0.4);
		color: rgb(187 247 208);
	}

	.trait-chip.flaw {
		background: rgb(239 68 68 / 0.2);
		border: 1px solid rgb(239 68 68 / 0.4);
		color: rgb(254 202 202);
	}

	.catchphrase {
		display: flex;
		align-items: flex-start;
		gap: 0.25rem;
		padding: 0.75rem 1rem;
		background: rgb(30 27 75 / 0.6);
		border-radius: 0.5rem;
		border-left: 3px solid rgb(251 146 60);
	}

	.quote-mark {
		color: rgb(251 146 60);
		font-size: 1.5rem;
		font-family: Georgia, serif;
		line-height: 1;
	}

	.quote-text {
		color: rgb(226 232 240);
		font-style: italic;
		font-size: 0.9rem;
		line-height: 1.4;
	}

	/* Artefacts Section */
	.artefacts-section {
		margin-bottom: 1.5rem;
	}

	.section-title {
		color: rgb(192 132 252);
		font-size: 0.9rem;
		font-weight: 600;
		margin: 0 0 0.75rem 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.artefacts-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.artefact-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.875rem;
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 2rem;
		transition: all 0.2s;
	}

	.artefact-item:hover {
		border-color: rgb(168 85 247 / 0.5);
		background: rgb(30 27 75 / 0.7);
		transform: translateY(-2px);
	}

	.artefact-icon {
		font-size: 0.875rem;
	}

	.artefact-name {
		color: white;
		font-size: 0.8rem;
	}

	/* Story Section */
	.story-section {
		padding: 1.25rem;
		background: linear-gradient(135deg, rgb(30 27 75 / 0.6), rgb(55 48 107 / 0.4));
		border-radius: 0.75rem;
		border: 1px solid rgb(168 85 247 / 0.15);
		border-left: 4px solid rgb(251 146 60);
	}

	.story-text {
		margin: 0;
		color: rgb(226 232 240);
		font-size: 0.925rem;
		line-height: 1.7;
	}

	/* Responsive */
	@media (max-width: 640px) {
		.hero-section {
			grid-template-columns: 1fr;
			text-align: center;
		}

		.portrait-container {
			margin: 0 auto;
		}

		.size-animal-badges {
			justify-content: center;
		}

		.trait-chips {
			justify-content: center;
		}

		.hero-details {
			align-items: center;
		}
	}
</style>
