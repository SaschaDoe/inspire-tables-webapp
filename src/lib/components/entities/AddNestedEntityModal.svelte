<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { getEntityCreator } from '$lib/entities/entityRegistry';
	import { entityStore } from '$lib/stores/entityStore';
	import { extractAndSaveNestedEntities } from '$lib/utils/nestedEntityExtractor';
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
	let previewEntityIds = $state<string[]>([]); // Track all entities created for preview
	let errorMessage = $state<string>(''); // Error message to display in UI

	// Get all existing entities of this type
	const existingEntities = $derived(entityStore.getEntitiesByType(entityType as any));

	function switchTab(tab: 'generate' | 'select') {
		currentTab = tab;
		// Clear any error messages
		errorMessage = '';
		// Clean up preview entities when switching tabs
		cleanupPreviewEntities();
		// Reset selections when switching tabs
		generatedEntity = null;
		selectedExistingEntity = null;
	}

	/**
	 * Delete all preview entities from the store to free up localStorage
	 */
	function cleanupPreviewEntities() {
		for (const entityId of previewEntityIds) {
			entityStore.deleteEntity(entityId);
		}
		previewEntityIds = [];
		console.log('[AddNestedEntityModal] Cleaned up preview entities');
	}

	/**
	 * Generates a new entity for preview in the modal
	 *
	 * IMPORTANT: We save and extract nested entities immediately for the preview.
	 * This allows the graph in the modal to show sphere connections.
	 * When the user clicks "Add Universe", we skip re-extraction (see handleAdd).
	 *
	 * We also track all created entity IDs so we can clean them up if user:
	 * - Regenerates (creates new preview)
	 * - Cancels (doesn't add to parent)
	 * - Switches tabs
	 */
	function generateNew() {
		// Clear any previous errors
		errorMessage = '';

		try {
			// Clean up previous preview entities before generating new ones
			cleanupPreviewEntities();

			const creator = getEntityCreator(entityType);
			if (creator) {
				generatedEntity = creator.create();
				entityName = generatedEntity.name || `${displayName} ${generatedEntity.id.slice(0, 8)}`;

				// Save to store temporarily so preview can access nested entities
				const previewEntity = {
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
				entityStore.createEntity(previewEntity);

				// Track this entity ID for cleanup
				previewEntityIds.push(previewEntity.id);

				// Extract nested entities for preview (sphere connections, etc.)
				const extractedEntities = extractAndSaveNestedEntities(previewEntity);
				if (extractedEntities.length > 0) {
					console.log(`[AddNestedEntityModal] Extracted ${extractedEntities.length} nested entities for preview`);
					// Track all extracted entity IDs for cleanup
					previewEntityIds.push(...extractedEntities.map(e => e.id));
				}
			}
		} catch (error) {
			console.error('[AddNestedEntityModal] Error generating entity:', error);

			// Handle QuotaExceededError specifically
			if (error instanceof Error && error.name === 'QuotaExceededError') {
				errorMessage = '❌ Storage Quota Exceeded!\n\n' +
					'Your browser storage is full. Please:\n' +
					'1. Delete some entities from the workspace\n' +
					'2. Or clear browser storage in DevTools (F12 → Application → Local Storage → Clear)\n' +
					'3. Then try again';
			} else {
				errorMessage = `❌ Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
			}
		}
	}

	function selectExisting(entity: any) {
		selectedExistingEntity = entity;
	}

	/**
	 * CRITICAL FLOW - DO NOT MODIFY WITHOUT UNDERSTANDING:
	 *
	 * UPDATED FLOW (with preview extraction):
	 * 1. generateNew() saves entity and extracts nested entities FOR PREVIEW
	 * 2. User sees preview with sphere connections in graph
	 * 3. User clicks "Add Universe"
	 * 4. handleAdd() updates the entity name in the store
	 * 5. handleAdd() calls onAdd callback with the raw generated entity
	 * 6. The onAdd handler (from viewerUtils.createAddEntityHandler):
	 *    a. Finds entity already exists in store
	 *    b. Calls extractAndSaveNestedEntities() - but entities already extracted!
	 *    c. Adds entity to parent's array (e.g., campaign.universes)
	 *    d. Updates parent entity in store
	 *
	 * This ensures:
	 * - Preview shows sphere connections (extracted in generateNew)
	 * - Entity appears in navigation immediately
	 * - Parent-child relationships are established
	 * - Reactivity triggers properly
	 * - Preview entities are kept (not cleaned up) since user is adding them
	 */
	function handleAdd() {
		// Clear any previous errors
		errorMessage = '';

		try {
			let entityToAdd = null;

			if (currentTab === 'generate' && generatedEntity) {
				// Update name with user input
				generatedEntity.name = entityName;
				entityToAdd = generatedEntity;

				// Update the existing entity in store (created during generateNew)
				// with the final user-edited name
				const existingEntity = entityStore.getEntity(generatedEntity.id);
				if (existingEntity) {
					entityStore.updateEntity(generatedEntity.id, {
						...existingEntity,
						name: entityName,
						customFields: {
							...existingEntity.customFields,
							generatedEntity: generatedEntity
						}
					});
				}

				// Clear preview tracking since we're keeping these entities
				previewEntityIds = [];
			} else if (currentTab === 'select' && selectedExistingEntity) {
				entityToAdd = selectedExistingEntity;
			}

			// Call onAdd handler which will:
			// - Extract nested entities (already done, but handler will skip duplicates)
			// - Add to parent array
			// - Update parent in store
			if (entityToAdd && onAdd) {
				onAdd(entityToAdd);
			}

			closeModal();
		} catch (error) {
			console.error('[AddNestedEntityModal] Error adding entity:', error);

			// Handle QuotaExceededError specifically
			if (error instanceof Error && error.name === 'QuotaExceededError') {
				errorMessage = '❌ Storage Quota Exceeded!\n\n' +
					'Cannot add entity - your browser storage is full. Please:\n' +
					'1. Delete some entities from the workspace\n' +
					'2. Or clear browser storage in DevTools (F12 → Application → Local Storage → Clear)\n' +
					'3. Then try again';
			} else {
				errorMessage = `❌ Error adding entity: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
			}
		}
	}

	function closeModal() {
		// Clean up preview entities if user is canceling (not adding)
		cleanupPreviewEntities();

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

			<!-- Error Message -->
			{#if errorMessage}
				<div class="error-banner">
					<div class="error-icon">⚠️</div>
					<div class="error-text">{errorMessage}</div>
					<button class="error-close" onclick={() => errorMessage = ''} aria-label="Dismiss error">✕</button>
				</div>
			{/if}

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

	.error-banner {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		padding: 1rem 1.5rem;
		background: rgb(239 68 68 / 0.15);
		border: 1px solid rgb(239 68 68 / 0.5);
		border-left: 4px solid rgb(239 68 68);
		margin: 0 1.5rem;
		margin-top: 1rem;
		border-radius: 0.5rem;
		animation: slideDown 0.3s ease-out;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.error-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
	}

	.error-text {
		flex: 1;
		color: rgb(254 202 202);
		font-size: 0.875rem;
		line-height: 1.5;
		white-space: pre-line;
	}

	.error-close {
		background: transparent;
		border: none;
		color: rgb(254 202 202);
		font-size: 1.25rem;
		cursor: pointer;
		padding: 0;
		width: 1.5rem;
		height: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.25rem;
		transition: all 0.2s;
		flex-shrink: 0;
	}

	.error-close:hover {
		background: rgb(239 68 68 / 0.2);
		color: white;
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
