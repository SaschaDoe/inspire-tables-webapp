<script lang="ts">
	import { getImageProvider } from '$lib/ai/providerRegistry';
	import type { ImageStyle, ImageGenerationResult } from '$lib/ai/types';
	import type { Entity } from '$lib/types/entity';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
		onImageGenerated: (imageData: string, mimeType: string) => void;
		entity: Entity;
		entityType: string;
	}

	let { isOpen = $bindable(false), onClose, onImageGenerated, entity, entityType }: Props = $props();

	let selectedStyle = $state<ImageStyle>('realistic');
	let additionalPrompt = $state('');
	let isGenerating = $state(false);
	let generatedImage = $state<{ data: string; mimeType: string } | null>(null);
	let error = $state<string | null>(null);
	let step = $state<'options' | 'preview'>('options');

	const styleOptions: { value: ImageStyle; label: string; description: string }[] = [
		{ value: 'realistic', label: 'Realistic', description: 'Photorealistic image with natural lighting' },
		{ value: 'drawn-color', label: 'Drawn (Color)', description: 'Colorful hand-drawn illustration' },
		{ value: 'drawn-ink', label: 'Drawn (Ink)', description: 'Black and white ink drawing' }
	];

	function buildPromptFromEntity(): string {
		const parts: string[] = [];

		// Base description based on entity type
		if (entityType === 'character' || entityType === 'villain') {
			parts.push('Portrait of a fantasy character:');

			if ((entity as any).name) parts.push(`Named ${(entity as any).name}.`);
			if ((entity as any).race) parts.push(`Race: ${(entity as any).race}.`);
			if ((entity as any).gender) parts.push(`Gender: ${(entity as any).gender}.`);
			if ((entity as any).age) parts.push(`Age: ${(entity as any).age}.`);
			if ((entity as any).profession) parts.push(`Profession: ${(entity as any).profession}.`);
			if ((entity as any).height) parts.push(`Height: ${(entity as any).height}.`);
			if ((entity as any).weight) parts.push(`Build: ${(entity as any).weight}.`);
			if ((entity as any).recognition) parts.push(`Notable feature: ${(entity as any).recognition}.`);
			if ((entity as any).alignment) parts.push(`Alignment: ${(entity as any).alignment}.`);

			// Add personality hints for expression
			if ((entity as any).bigFive) {
				const bf = (entity as any).bigFive;
				if (bf.extraversion > 60) parts.push('Confident and outgoing expression.');
				if (bf.agreeableness > 60) parts.push('Kind and approachable demeanor.');
				if (bf.neuroticism > 60) parts.push('Intense and serious expression.');
			}
		} else if (entityType === 'monster') {
			parts.push('Fantasy creature illustration:');

			if ((entity as any).name) parts.push(`A creature known as ${(entity as any).name}.`);
			if ((entity as any).type) parts.push(`Type: ${(entity as any).type}.`);
			if ((entity as any).size) parts.push(`Size: ${(entity as any).size}.`);
			if ((entity as any).habitat) parts.push(`Found in: ${(entity as any).habitat}.`);
			if ((entity as any).description) parts.push((entity as any).description);
		} else if (entityType === 'fableCharacter') {
			parts.push('Charming anthropomorphic animal character for a children\'s fable, standing upright like a person:');

			if ((entity as any).animals && Array.isArray((entity as any).animals)) {
				const animals = (entity as any).animals;
				if (animals.length === 1) {
					parts.push(`This is a ${animals[0].type} character.`);
				} else if (animals.length >= 2) {
					const animalTypes = animals.map((a: any) => a.type).join(' and ');
					parts.push(`This is a HYBRID creature - a magical mix of ${animalTypes}. Show visible features from BOTH animals combined into one creature.`);
				}
			}
			if ((entity as any).appearance) parts.push(`Appearance: ${(entity as any).appearance}.`);
			if ((entity as any).role) parts.push(`Role: ${(entity as any).role}.`);
			if ((entity as any).personality) parts.push(`Expression: ${(entity as any).personality}.`);
			if ((entity as any).artefacts && Array.isArray((entity as any).artefacts)) {
				parts.push(`Holding/wearing: ${(entity as any).artefacts.join(', ')}.`);
			}
		} else {
			// Generic entity
			parts.push(`Illustration of ${entityType}:`);
			if ((entity as any).name) parts.push(`Named ${(entity as any).name}.`);
			if ((entity as any).description) parts.push((entity as any).description);
		}

		return parts.join(' ');
	}

	async function handleGenerate() {
		const provider = getImageProvider();

		if (!provider || !provider.isConfigured()) {
			error = 'No AI provider configured. Please set up your API key in AI Settings (Menu > AI Settings).';
			return;
		}

		isGenerating = true;
		error = null;
		generatedImage = null;

		try {
			const prompt = buildPromptFromEntity();
			const result: ImageGenerationResult = await provider.generateImage({
				prompt,
				style: selectedStyle,
				additionalPrompt: additionalPrompt || undefined,
				aspectRatio: '1:1'
			});

			if (result.success && result.imageData && result.mimeType) {
				generatedImage = { data: result.imageData, mimeType: result.mimeType };
				step = 'preview';
			} else {
				error = result.error || 'Failed to generate image';
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'An unknown error occurred';
		} finally {
			isGenerating = false;
		}
	}

	function handleRetry() {
		generatedImage = null;
		step = 'options';
	}

	function handleAccept() {
		if (generatedImage) {
			onImageGenerated(generatedImage.data, generatedImage.mimeType);
			closeModal();
		}
	}

	function closeModal() {
		isOpen = false;
		step = 'options';
		generatedImage = null;
		error = null;
		additionalPrompt = '';
		onClose();
	}
</script>

{#if isOpen}
	<div
		class="modal-overlay"
		onclick={closeModal}
		onkeydown={(e) => e.key === 'Escape' && closeModal()}
		role="button"
		tabindex="0"
		aria-label="Close modal"
	>
		<div class="modal" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
			<div class="modal-header">
				<h2 class="modal-title">
					{step === 'options' ? 'Generate Character Image' : 'Preview'}
				</h2>
				<button class="close-btn" onclick={closeModal}>✕</button>
			</div>

			<div class="modal-content">
				{#if step === 'options'}
					<p class="modal-description">
						Choose a style for your character image. The AI will use the character's details to generate an appropriate portrait.
					</p>

					<div class="style-options">
						<h3 class="section-title">Image Style</h3>
						<div class="style-grid">
							{#each styleOptions as option}
								<button
									class="style-card"
									class:selected={selectedStyle === option.value}
									onclick={() => (selectedStyle = option.value)}
								>
									<span class="style-icon">
										{#if option.value === 'realistic'}
											📷
										{:else if option.value === 'drawn-color'}
											🎨
										{:else}
											✒️
										{/if}
									</span>
									<span class="style-label">{option.label}</span>
									<span class="style-description">{option.description}</span>
								</button>
							{/each}
						</div>
					</div>

					<div class="additional-prompt-section">
						<h3 class="section-title">Additional Details (Optional)</h3>
						<textarea
							bind:value={additionalPrompt}
							placeholder="Add any extra details you want the AI to include in the image..."
							class="additional-prompt-input"
							rows="3"
						></textarea>
					</div>

					{#if error}
						<div class="error-message">
							{error}
						</div>
					{/if}
				{:else if step === 'preview'}
					<div class="preview-container">
						{#if generatedImage}
							<img
								src="data:{generatedImage.mimeType};base64,{generatedImage.data}"
								alt="Generated character"
								class="preview-image"
							/>
						{/if}
					</div>
				{/if}
			</div>

			<div class="modal-footer">
				{#if step === 'options'}
					<button class="btn btn-secondary" onclick={closeModal}>Cancel</button>
					<button
						class="btn btn-primary"
						onclick={handleGenerate}
						disabled={isGenerating}
					>
						{#if isGenerating}
							<span class="spinner"></span>
							Generating...
						{:else}
							Generate Image
						{/if}
					</button>
				{:else}
					<button class="btn btn-secondary" onclick={handleRetry}>
						Retry
					</button>
					<button class="btn btn-primary" onclick={handleAccept}>
						Use This Image
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		backdrop-filter: blur(4px);
	}

	.modal {
		background: linear-gradient(to bottom right, rgb(30 27 75), rgb(88 28 135 / 0.9));
		border: 1px solid rgb(168 85 247 / 0.3);
		border-radius: 1rem;
		max-width: 600px;
		width: 90%;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem;
		border-bottom: 1px solid rgb(168 85 247 / 0.2);
	}

	.modal-title {
		font-size: 1.5rem;
		font-weight: bold;
		color: white;
		margin: 0;
	}

	.close-btn {
		background: transparent;
		border: none;
		color: rgb(216 180 254);
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		transition: all 0.2s;
	}

	.close-btn:hover {
		background: rgb(168 85 247 / 0.2);
		color: white;
	}

	.modal-content {
		flex: 1;
		overflow-y: auto;
		padding: 1.5rem;
	}

	.modal-description {
		color: rgb(216 180 254);
		margin-bottom: 1.5rem;
		font-size: 0.875rem;
		line-height: 1.5;
	}

	.section-title {
		color: rgb(192 132 252);
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 1rem 0;
	}

	.style-options {
		margin-bottom: 1.5rem;
	}

	.style-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.75rem;
	}

	.style-card {
		background: rgb(30 27 75 / 0.5);
		border: 2px solid rgb(168 85 247 / 0.2);
		border-radius: 0.75rem;
		padding: 1rem;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 0.5rem;
	}

	.style-card:hover {
		border-color: rgb(168 85 247 / 0.5);
		background: rgb(30 27 75 / 0.7);
	}

	.style-card.selected {
		border-color: rgb(168 85 247);
		background: rgb(168 85 247 / 0.2);
	}

	.style-icon {
		font-size: 2rem;
	}

	.style-label {
		color: white;
		font-weight: 600;
		font-size: 0.875rem;
	}

	.style-description {
		color: rgb(216 180 254 / 0.7);
		font-size: 0.75rem;
		line-height: 1.3;
	}

	.additional-prompt-section {
		margin-bottom: 1.5rem;
	}

	.additional-prompt-input {
		width: 100%;
		padding: 0.75rem;
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.3);
		border-radius: 0.5rem;
		color: white;
		font-size: 0.875rem;
		resize: vertical;
		font-family: inherit;
		outline: none;
		transition: all 0.2s;
	}

	.additional-prompt-input:focus {
		border-color: rgb(168 85 247);
		background: rgb(30 27 75 / 0.7);
	}

	.additional-prompt-input::placeholder {
		color: rgb(216 180 254 / 0.5);
	}

	.error-message {
		background: rgb(220 38 38 / 0.2);
		border: 1px solid rgb(220 38 38 / 0.5);
		border-radius: 0.5rem;
		padding: 1rem;
		color: rgb(252 165 165);
		font-size: 0.875rem;
	}

	.preview-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 300px;
	}

	.preview-image {
		max-width: 100%;
		max-height: 400px;
		border-radius: 0.75rem;
		border: 2px solid rgb(168 85 247 / 0.3);
	}

	.modal-footer {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.75rem;
		padding: 1.5rem;
		border-top: 1px solid rgb(168 85 247 / 0.2);
	}

	.btn {
		padding: 0.625rem 1.25rem;
		border-radius: 0.5rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		border: none;
		font-size: 0.875rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-primary {
		background: rgb(168 85 247);
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background: rgb(192 132 252);
	}

	.btn-secondary {
		background: rgb(30 27 75 / 0.5);
		color: rgb(216 180 254);
		border: 1px solid rgb(168 85 247 / 0.3);
	}

	.btn-secondary:hover:not(:disabled) {
		background: rgb(168 85 247 / 0.2);
		color: white;
	}

	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		border-top-color: white;
		animation: spin 1s ease-in-out infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 500px) {
		.style-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
