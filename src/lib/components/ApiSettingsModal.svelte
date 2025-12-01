<script lang="ts">
	import { onMount } from 'svelte';
	import { aiProviderRegistry } from '$lib/ai/providerRegistry';
	import { saveApiKey, getApiKey, deleteApiKey, initializeProviders } from '$lib/ai/apiKeyService';
	import type { ModelInfo } from '$lib/ai/types';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
	}

	let { isOpen = $bindable(false), onClose }: Props = $props();

	let providers = $state(aiProviderRegistry.getAll());
	let apiKeys = $state<Record<string, string>>({});
	let showKeys = $state<Record<string, boolean>>({});
	let saving = $state<Record<string, boolean>>({});
	let loadingModels = $state(false);
	let models = $state<{ providerId: string; providerName: string; models: ModelInfo[] }[]>([]);
	let showModels = $state(false);

	onMount(async () => {
		// Load existing API keys
		for (const provider of providers) {
			const key = await getApiKey(provider.id);
			if (key) {
				apiKeys[provider.id] = key;
			}
		}
	});

	async function handleSaveKey(providerId: string) {
		const key = apiKeys[providerId];
		if (!key) return;

		saving[providerId] = true;
		try {
			await saveApiKey(providerId, key);
		} finally {
			saving[providerId] = false;
		}
	}

	async function handleDeleteKey(providerId: string) {
		const confirmed = confirm('Are you sure you want to remove this API key?');
		if (!confirmed) return;

		await deleteApiKey(providerId);
		apiKeys[providerId] = '';
	}

	function toggleShowKey(providerId: string) {
		showKeys[providerId] = !showKeys[providerId];
	}

	async function handleLoadModels() {
		loadingModels = true;
		try {
			await initializeProviders();
			models = await aiProviderRegistry.listAllModels();
			showModels = true;
		} catch (error) {
			console.error('Failed to load models:', error);
			alert('Failed to load models. Check your API key.');
		} finally {
			loadingModels = false;
		}
	}

	function closeModal() {
		isOpen = false;
		showModels = false;
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
				<h2 class="modal-title">AI Settings</h2>
				<button class="close-btn" onclick={closeModal}>✕</button>
			</div>

			<div class="modal-content">
				<p class="modal-description">Configure your AI provider API keys for image generation.</p>

				<div class="providers-list">
					{#each providers as provider}
						<div class="provider-card">
							<div class="provider-header">
								<h3 class="provider-name">{provider.name}</h3>
								<span class="provider-status" class:configured={apiKeys[provider.id]}>
									{apiKeys[provider.id] ? 'Configured' : 'Not configured'}
								</span>
							</div>

							<div class="api-key-input-group">
								<input
									type={showKeys[provider.id] ? 'text' : 'password'}
									placeholder="Enter API key..."
									bind:value={apiKeys[provider.id]}
									class="api-key-input"
								/>
								<button
									class="toggle-visibility-btn"
									onclick={() => toggleShowKey(provider.id)}
									title={showKeys[provider.id] ? 'Hide key' : 'Show key'}
								>
									{showKeys[provider.id] ? '👁️' : '👁️‍🗨️'}
								</button>
							</div>

							<div class="provider-actions">
								<button
									class="btn btn-primary"
									onclick={() => handleSaveKey(provider.id)}
									disabled={!apiKeys[provider.id] || saving[provider.id]}
								>
									{saving[provider.id] ? 'Saving...' : 'Save'}
								</button>
								{#if apiKeys[provider.id]}
									<button class="btn btn-danger" onclick={() => handleDeleteKey(provider.id)}>
										Remove
									</button>
								{/if}
							</div>
						</div>
					{/each}
				</div>

				<div class="models-section">
					<button
						class="btn btn-secondary"
						onclick={handleLoadModels}
						disabled={loadingModels}
					>
						{loadingModels ? 'Loading...' : 'Show Available Models'}
					</button>

					{#if showModels && models.length > 0}
						<div class="models-list">
							{#each models as providerModels}
								<div class="provider-models">
									<h4 class="provider-models-title">{providerModels.providerName}</h4>
									<div class="models-grid">
										{#each providerModels.models.slice(0, 20) as model}
											<div class="model-card">
												<span class="model-name">{model.name}</span>
												<div class="model-badges">
													{#if model.supportsImageGeneration}
														<span class="badge badge-image">Image</span>
													{/if}
													{#if model.supportsTextGeneration}
														<span class="badge badge-text">Text</span>
													{/if}
												</div>
											</div>
										{/each}
									</div>
									{#if providerModels.models.length > 20}
										<p class="models-note">...and {providerModels.models.length - 20} more models</p>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<div class="modal-footer">
				<button class="btn btn-secondary" onclick={closeModal}>Close</button>
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
	}

	.providers-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.provider-card {
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.75rem;
		padding: 1.25rem;
	}

	.provider-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
	}

	.provider-name {
		color: white;
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0;
	}

	.provider-status {
		font-size: 0.75rem;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		background: rgb(239 68 68 / 0.2);
		color: rgb(252 165 165);
	}

	.provider-status.configured {
		background: rgb(34 197 94 / 0.2);
		color: rgb(134 239 172);
	}

	.api-key-input-group {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.api-key-input {
		flex: 1;
		padding: 0.625rem;
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.3);
		border-radius: 0.5rem;
		color: white;
		font-size: 0.875rem;
		font-family: monospace;
		outline: none;
		transition: all 0.2s;
	}

	.api-key-input:focus {
		border-color: rgb(168 85 247);
		background: rgb(30 27 75 / 0.7);
	}

	.api-key-input::placeholder {
		color: rgb(216 180 254 / 0.5);
	}

	.toggle-visibility-btn {
		padding: 0.5rem 0.75rem;
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.3);
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.toggle-visibility-btn:hover {
		background: rgb(168 85 247 / 0.2);
		border-color: rgb(168 85 247 / 0.5);
	}

	.provider-actions {
		display: flex;
		gap: 0.5rem;
	}

	.models-section {
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid rgb(168 85 247 / 0.2);
	}

	.models-list {
		margin-top: 1rem;
	}

	.provider-models {
		margin-bottom: 1rem;
	}

	.provider-models-title {
		color: rgb(192 132 252);
		font-size: 1rem;
		margin: 0 0 0.75rem 0;
	}

	.models-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 0.5rem;
	}

	.model-card {
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.5rem;
		padding: 0.5rem 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.model-name {
		color: white;
		font-size: 0.75rem;
		font-family: monospace;
	}

	.model-badges {
		display: flex;
		gap: 0.25rem;
	}

	.badge {
		font-size: 0.625rem;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
	}

	.badge-image {
		background: rgb(168 85 247 / 0.3);
		color: rgb(216 180 254);
	}

	.badge-text {
		background: rgb(34 197 94 / 0.3);
		color: rgb(134 239 172);
	}

	.models-note {
		color: rgb(216 180 254 / 0.7);
		font-size: 0.75rem;
		margin: 0.5rem 0 0 0;
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

	.btn-danger {
		background: rgb(220 38 38 / 0.3);
		color: rgb(252 165 165);
		border: 1px solid rgb(220 38 38 / 0.5);
	}

	.btn-danger:hover {
		background: rgb(220 38 38 / 0.5);
		color: white;
	}
</style>
