<script lang="ts">
	import { onMount } from 'svelte';
	import type { OracleImage } from '$lib/data/oracleMetadata';
	import OracleContent from './OracleContent.svelte';
	import { parseOracleText, type ParsedOracle } from '$lib/utils/oracleTextParser';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
	}

	let { isOpen = $bindable(false), onClose }: Props = $props();

	let currentOracle = $state<OracleImage | null>(null);
	let isLoading = $state(false);
	let imageLoaded = $state(false);
	let oracleImages: OracleImage[] = [];

	// Parse the current oracle description
	let parsedOracle = $derived(
		currentOracle ? parseOracleText(currentOracle.description) : null
	);

	// Lazy load oracle metadata only when modal opens
	async function loadOracleMetadata() {
		if (oracleImages.length > 0) return;

		const { getAllOracleImages } = await import('$lib/data/oracleMetadata');
		oracleImages = getAllOracleImages();
	}

	function getRandomOracle(): OracleImage {
		if (oracleImages.length === 0) {
			throw new Error('Oracle images not loaded');
		}
		const randomIndex = Math.floor(Math.random() * oracleImages.length);
		return oracleImages[randomIndex];
	}

	async function rollOracle() {
		isLoading = true;
		imageLoaded = false;

		// Load metadata if not already loaded
		await loadOracleMetadata();

		// Small delay for UX
		await new Promise((resolve) => setTimeout(resolve, 300));

		currentOracle = getRandomOracle();
		isLoading = false;
	}

	function handleImageLoad() {
		imageLoaded = true;
	}

	function closeModal() {
		isOpen = false;
		currentOracle = null;
		imageLoaded = false;
		onClose();
	}

	// Roll oracle when modal opens for the first time
	$effect(() => {
		if (isOpen && !currentOracle) {
			rollOracle();
		}
	});
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
		<div class="modal" role="dialog" aria-modal="true">
			<div class="modal-header">
				<h2 class="modal-title">🔮 Oracle Image</h2>
				<button onclick={closeModal} class="close-btn">✕</button>
			</div>

			<div class="modal-content">
				{#if isLoading}
					<div class="loading-state">
						<div class="spinner"></div>
						<p>Rolling the oracle...</p>
					</div>
				{:else if currentOracle && parsedOracle}
					<div class="oracle-display">
						<!-- Title at top -->
						<h2 class="oracle-main-title">{parsedOracle.title}</h2>

						<!-- Image and General Info side by side -->
						<div class="top-section">
							<div class="image-container">
								{#if !imageLoaded}
									<div class="image-loading">
										<div class="spinner-small"></div>
									</div>
								{/if}
								<img
									src={currentOracle.imagePath}
									alt="Oracle {currentOracle.number}"
									class="oracle-image"
									class:loaded={imageLoaded}
									onload={handleImageLoad}
								/>
							</div>

							<!-- General Info -->
							<div class="general-info">
								<div class="word-grid">
									<div class="word-item">
										<span class="word-label">Noun</span>
										<span class="word-value">{parsedOracle.general.noun}</span>
									</div>
									<div class="word-item">
										<span class="word-label">Verb</span>
										<span class="word-value">{parsedOracle.general.verb}</span>
									</div>
									<div class="word-item">
										<span class="word-label">Adjective</span>
										<span class="word-value">{parsedOracle.general.adjective}</span>
									</div>
									<div class="word-item">
										<span class="word-label">Adverb</span>
										<span class="word-value">{parsedOracle.general.adverb}</span>
									</div>
								</div>

								<div class="detailed-answer">
									<span class="answer-label">Detailed Answer</span>
									<p class="answer-text">{parsedOracle.general.detailedAnswer}</p>
								</div>
							</div>
						</div>

						<!-- Detailed sections below -->
						<div class="detailed-sections">
							<OracleContent
								description={currentOracle.description}
								showTitle={false}
								showGeneral={false}
							/>
						</div>
					</div>
				{/if}
			</div>

			<div class="modal-footer">
				<button onclick={rollOracle} class="btn btn-primary" disabled={isLoading}>
					<span class="btn-icon">🎲</span>
					<span>Roll Again</span>
				</button>
				<button onclick={closeModal} class="btn btn-secondary">Close</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.75);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2000;
		backdrop-filter: blur(4px);
		animation: fadeIn 0.2s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.modal {
		background: linear-gradient(to bottom right, rgb(30 27 75), rgb(88 28 135 / 0.95));
		border: 2px solid rgb(168 85 247 / 0.4);
		border-radius: 1rem;
		max-width: 900px;
		width: 90%;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			transform: scale(0.9);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem;
		border-bottom: 1px solid rgb(168 85 247 / 0.3);
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
		min-height: 400px;
	}

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 400px;
		gap: 1rem;
	}

	.loading-state p {
		color: rgb(216 180 254);
		font-size: 1.125rem;
	}

	.spinner {
		width: 50px;
		height: 50px;
		border: 4px solid rgb(168 85 247 / 0.3);
		border-top-color: rgb(168 85 247);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	.spinner-small {
		width: 30px;
		height: 30px;
		border: 3px solid rgb(168 85 247 / 0.3);
		border-top-color: rgb(168 85 247);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.oracle-display {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.oracle-main-title {
		font-size: 1.75rem;
		font-weight: bold;
		color: white;
		text-align: center;
		margin: 0 0 1.5rem 0;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.top-section {
		display: grid;
		grid-template-columns: 300px 1fr;
		gap: 1.5rem;
		align-items: start;
	}

	@media (max-width: 768px) {
		.top-section {
			grid-template-columns: 1fr;
		}
	}

	.image-container {
		position: relative;
		width: 100%;
		aspect-ratio: 1;
		background: rgb(30 27 75 / 0.5);
		border-radius: 0.75rem;
		border: 2px solid rgb(168 85 247 / 0.3);
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.image-loading {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgb(30 27 75 / 0.8);
	}

	.oracle-image {
		width: 100%;
		height: 100%;
		object-fit: contain;
		opacity: 0;
		transition: opacity 0.3s ease-out;
	}

	.oracle-image.loaded {
		opacity: 1;
	}

	.general-info {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.75rem;
		padding: 1.25rem;
	}

	.word-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
	}

	.word-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.75rem;
		background: rgb(30 27 75 / 0.6);
		border: 1px solid rgb(59 130 246 / 0.3);
		border-radius: 0.5rem;
	}

	.word-label {
		font-size: 0.7rem;
		color: rgb(147 197 253);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.word-value {
		font-size: 1rem;
		color: white;
		font-weight: 600;
	}

	.detailed-answer {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1rem;
		background: rgb(30 27 75 / 0.6);
		border: 1px solid rgb(59 130 246 / 0.3);
		border-radius: 0.5rem;
		margin-top: 0.5rem;
	}

	.answer-label {
		font-size: 0.7rem;
		color: rgb(147 197 253);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.answer-text {
		color: rgb(216 180 254);
		line-height: 1.6;
		margin: 0;
		font-size: 0.9rem;
	}

	.detailed-sections {
		margin-top: 1rem;
		padding-top: 1.5rem;
		border-top: 2px solid rgb(168 85 247 / 0.2);
	}

	.modal-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 1.5rem;
		border-top: 1px solid rgb(168 85 247 / 0.3);
	}

	.btn {
		padding: 0.75rem 1.5rem;
		border-radius: 0.5rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		border: none;
		font-size: 1rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-primary {
		background: linear-gradient(135deg, rgb(168 85 247), rgb(192 132 252));
		color: white;
		flex: 1;
	}

	.btn-primary:hover:not(:disabled) {
		background: linear-gradient(135deg, rgb(192 132 252), rgb(216 180 254));
		transform: translateY(-1px);
		box-shadow: 0 10px 15px -3px rgba(168, 85, 247, 0.4);
	}

	.btn-secondary {
		background: rgb(30 27 75 / 0.5);
		color: rgb(216 180 254);
		border: 1px solid rgb(168 85 247 / 0.3);
	}

	.btn-secondary:hover {
		background: rgb(168 85 247 / 0.2);
		color: white;
	}

	.btn-icon {
		font-size: 1.25rem;
	}
</style>
