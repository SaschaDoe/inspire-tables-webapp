<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { getEntityCreator } from '$lib/entities/entityRegistry';
	import { entityStore } from '$lib/stores/entityStore';
	import EntityViewer from './EntityViewer.svelte';

	interface Props {
		isOpen: boolean;
		entityType: string;
		displayName: string;
		onClose: () => void;
		onAdd?: (entity: any) => void;
	}

	let { isOpen = $bindable(false), entityType, displayName, onClose, onAdd }: Props = $props();

	const dispatch = createEventDispatcher();

	let currentTab = $state<'generate' | 'select'>('generate');
	let generatedEntity = $state<any>(null);
	let selectedExistingEntity = $state<any>(null);
	let entityName = $state<string>('');

	// Get all existing entities of this type
	const existingEntities = $derived(entityStore.getEntitiesByType(entityType as any));

	function switchTab(tab: 'generate' | 'select') {
		currentTab = tab;
		// Reset selections when switching tabs
		generatedEntity = null;
		selectedExistingEntity = null;
	}

	function generateNew() {
		const creator = getEntityCreator(entityType);
		if (creator) {
			generatedEntity = creator.create();
			entityName = generatedEntity.name || `${displayName} ${generatedEntity.id.slice(0, 8)}`;
		}
	}

	function selectExisting(entity: any) {
		selectedExistingEntity = entity;
	}

	function handleAdd() {
		let entityToAdd = null;

		if (currentTab === 'generate' && generatedEntity) {
			// Update name with user input
			generatedEntity.name = entityName;
			entityToAdd = generatedEntity;

			// Save newly generated entity to the store
			const newEntity = {
				id: generatedEntity.id,
				type: entityType,
				name: entityName,
				created: Date.now(),
				lastModified: Date.now(),
				relationships: [],
				customFields: {
					generatedEntity: generatedEntity
				}
			};
			entityStore.createEntity(newEntity);
		} else if (currentTab === 'select' && selectedExistingEntity) {
			entityToAdd = selectedExistingEntity;
		}

		if (entityToAdd && onAdd) {
			onAdd(entityToAdd);
		}

		closeModal();
	}

	function closeModal() {
		isOpen = false;
		currentTab = 'generate';
		generatedEntity = null;
		selectedExistingEntity = null;
		entityName = '';
		onClose();
	}
</script>

{#if isOpen}
	<div class="modal-overlay" onclick={closeModal} role="button" tabindex="0" onkeydown={(e) => e.key === 'Escape' && closeModal()} aria-label="Close modal">
		<div class="modal" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="-1">
			<div class="modal-header">
				<h2 class="modal-title">Add {displayName}</h2>
				<button class="close-btn" onclick={closeModal}>✕</button>
			</div>

			<!-- Tab Switcher -->
			<div class="tab-switcher">
				<button
					class="tab-btn"
					class:active={currentTab === 'generate'}
					onclick={() => switchTab('generate')}
				>
					Generate New
				</button>
				<button
					class="tab-btn"
					class:active={currentTab === 'select'}
					onclick={() => switchTab('select')}
				>
					Select Existing
				</button>
			</div>

			<div class="modal-content">
				{#if currentTab === 'generate'}
					{#if !generatedEntity}
						<div class="generate-prompt">
							<p class="prompt-text">Generate a new {displayName} to add</p>
							<button class="btn btn-primary" onclick={generateNew}>
								Generate {displayName}
							</button>
						</div>
					{:else}
						<div class="entity-preview">
							<div class="name-input-section">
								<label for="entity-name" class="name-label">Name:</label>
								<input
									id="entity-name"
									type="text"
									bind:value={entityName}
									placeholder="Enter a name"
									class="name-input"
								/>
							</div>
							<EntityViewer entity={generatedEntity} {entityType} />
						</div>
					{/if}
				{:else}
					<!-- Select Existing Tab -->
					<div class="existing-list">
						{#if existingEntities.length === 0}
							<p class="empty-message">No existing {displayName.toLowerCase()}s found</p>
						{:else}
							{#each existingEntities as entity (entity.id)}
								<button
									class="existing-item"
									class:selected={selectedExistingEntity?.id === entity.id}
									onclick={() => selectExisting(entity)}
								>
									<span class="entity-icon">🌀</span>
									<span class="entity-name">{entity.name}</span>
									{#if selectedExistingEntity?.id === entity.id}
										<span class="check-icon">✓</span>
									{/if}
								</button>
							{/each}
						{/if}
					</div>
				{/if}
			</div>

			<div class="modal-footer">
				{#if currentTab === 'generate' && generatedEntity}
					<button class="btn btn-secondary" onclick={generateNew}>Regenerate</button>
				{/if}
				<button class="btn btn-secondary" onclick={closeModal}>Cancel</button>
				<button
					class="btn btn-primary"
					disabled={!generatedEntity && !selectedExistingEntity}
					onclick={handleAdd}
				>
					Add {displayName}
				</button>
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
		max-width: 900px;
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
		font-weight: 600;
		color: white;
		margin: 0;
	}

	.close-btn {
		background: transparent;
		border: none;
		color: rgb(216 180 254);
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0.25rem;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.25rem;
		transition: all 0.2s;
	}

	.close-btn:hover {
		background: rgb(168 85 247 / 0.2);
		color: white;
	}

	.tab-switcher {
		display: flex;
		border-bottom: 1px solid rgb(168 85 247 / 0.2);
		padding: 0 1.5rem;
		gap: 0.5rem;
	}

	.tab-btn {
		padding: 0.75rem 1.5rem;
		background: transparent;
		border: none;
		color: rgb(216 180 254);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		border-bottom: 2px solid transparent;
		transition: all 0.2s;
	}

	.tab-btn:hover {
		color: white;
		background: rgb(168 85 247 / 0.1);
	}

	.tab-btn.active {
		color: white;
		border-bottom-color: rgb(168 85 247);
		background: rgb(168 85 247 / 0.1);
	}

	.modal-content {
		flex: 1;
		overflow-y: auto;
		padding: 1.5rem;
	}

	.generate-prompt {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
		padding: 3rem;
		text-align: center;
	}

	.prompt-text {
		font-size: 1rem;
		color: rgb(216 180 254);
		margin: 0;
	}

	.entity-preview {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.name-input-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.name-label {
		color: rgb(216 180 254);
		font-size: 0.875rem;
		font-weight: 500;
	}

	.name-input {
		padding: 0.75rem;
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.3);
		border-radius: 0.5rem;
		color: white;
		font-size: 1rem;
	}

	.name-input:focus {
		outline: none;
		border-color: rgb(168 85 247);
	}

	.existing-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.existing-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem;
		background: rgb(30 27 75 / 0.4);
		border: 1px solid rgb(168 85 247 / 0.3);
		border-radius: 0.5rem;
		color: rgb(216 180 254);
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
	}

	.existing-item:hover {
		background: rgb(168 85 247 / 0.2);
		border-color: rgb(168 85 247 / 0.6);
		color: white;
	}

	.existing-item.selected {
		background: rgb(168 85 247 / 0.3);
		border-color: rgb(168 85 247);
		color: white;
	}

	.entity-icon {
		font-size: 1.5rem;
	}

	.entity-name {
		flex: 1;
		font-weight: 500;
	}

	.check-icon {
		color: rgb(34 197 94);
		font-size: 1.25rem;
	}

	.empty-message {
		text-align: center;
		color: rgb(216 180 254 / 0.6);
		font-style: italic;
		padding: 2rem;
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
		padding: 0.75rem 1.5rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		border: none;
	}

	.btn-primary {
		background: linear-gradient(135deg, rgb(168 85 247), rgb(192 132 252));
		color: white;
		box-shadow: 0 4px 6px -1px rgba(168, 85, 247, 0.3);
	}

	.btn-primary:hover:not(:disabled) {
		background: linear-gradient(135deg, rgb(192 132 252), rgb(216 180 254));
		transform: translateY(-1px);
		box-shadow: 0 10px 15px -3px rgba(168, 85, 247, 0.4);
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}

	.btn-secondary {
		background: rgb(30 27 75 / 0.5);
		color: rgb(216 180 254);
		border: 1px solid rgb(168 85 247 / 0.3);
	}

	.btn-secondary:hover {
		background: rgb(168 85 247 / 0.2);
		color: white;
		border-color: rgb(168 85 247 / 0.6);
	}
</style>
