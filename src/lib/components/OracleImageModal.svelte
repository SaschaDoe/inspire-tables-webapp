<script lang="ts">
	import { onMount } from 'svelte';
	import type { OracleImage } from '$lib/data/oracleMetadata';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
	}

	let { isOpen = $bindable(false), onClose }: Props = $props();

	let currentOracle = $state<OracleImage | null>(null);
	let isLoading = $state(false);
	let imageLoaded = $state(false);
	let oracleImages: OracleImage[] = [];

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
	<div class="modal-overlay" onclick={closeModal}>
		<div class="modal" onclick={(e) => e.stopPropagation()}>
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
				{:else if currentOracle}
					<div class="oracle-display">
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

						<div class="oracle-info">
							<div class="oracle-meta">
								<span class="oracle-id">Oracle {currentOracle.oracleSet}</span>
								<span class="oracle-number">#{currentOracle.number}</span>
							</div>

							<div class="oracle-description">
								<pre class="description-text">{currentOracle.description}</pre>
							</div>
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

	.image-container {
		position: relative;
		width: 100%;
		max-width: 500px;
		margin: 0 auto;
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

	.oracle-info {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.oracle-meta {
		display: flex;
		align-items: center;
		gap: 1rem;
		justify-content: center;
	}

	.oracle-id,
	.oracle-number {
		padding: 0.25rem 0.75rem;
		background: rgb(168 85 247 / 0.2);
		color: rgb(216 180 254);
		border-radius: 9999px;
		font-size: 0.875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.oracle-description {
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.75rem;
		padding: 1.5rem;
		max-height: 400px;
		overflow-y: auto;
	}

	.description-text {
		color: rgb(216 180 254);
		font-size: 0.875rem;
		line-height: 1.6;
		margin: 0;
		white-space: pre-wrap;
		word-wrap: break-word;
		font-family: monospace;
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
