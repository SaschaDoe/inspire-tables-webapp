<script lang="ts">
	import { getEntityTypesList, getEntityCreator } from '$lib/entities/entityRegistry';
	import type { EntityTypeInfo } from '$lib/entities/entityRegistry';
	import EntityViewer from './EntityViewer.svelte';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
		onSave?: (entity: any, entityType: string) => void;
	}

	let { isOpen = $bindable(false), onClose, onSave }: Props = $props();

	let currentStep = $state<'select' | 'view'>('select');
	let selectedEntityType = $state<string | null>(null);
	let generatedEntity = $state<any>(null);
	let entityTypes = $state<EntityTypeInfo[]>(getEntityTypesList());

	function selectEntityType(type: string) {
		selectedEntityType = type;
	}

	function generateEntity() {
		if (!selectedEntityType) return;

		const creator = getEntityCreator(selectedEntityType);
		if (creator) {
			generatedEntity = creator.create();
			currentStep = 'view';
		}
	}

	function handleSave() {
		if (generatedEntity && selectedEntityType && onSave) {
			onSave(generatedEntity, selectedEntityType);
		}
		closeModal();
	}

	function closeModal() {
		isOpen = false;
		currentStep = 'select';
		selectedEntityType = null;
		generatedEntity = null;
		onClose();
	}

	function regenerate() {
		generateEntity();
	}
</script>

{#if isOpen}
	<div class="modal-overlay" onclick={closeModal}>
		<div class="modal" onclick={(e) => e.stopPropagation()}>
			{#if currentStep === 'select'}
				<div class="modal-header">
					<h2 class="modal-title">Generate New Entity</h2>
					<button class="close-btn" onclick={closeModal}>✕</button>
				</div>

				<div class="modal-content">
					<p class="modal-description">Select an entity type to generate:</p>

					<div class="entity-type-grid">
						{#each entityTypes as entityType}
							<button
								class="entity-type-card {selectedEntityType === entityType.name ? 'selected' : ''}"
								onclick={() => selectEntityType(entityType.name)}
							>
								<div class="entity-icon">{entityType.icon}</div>
								<h3 class="entity-type-name">{entityType.displayName}</h3>
								<p class="entity-type-description">{entityType.description}</p>
							</button>
						{/each}
					</div>
				</div>

				<div class="modal-footer">
					<button class="btn btn-secondary" onclick={closeModal}>Cancel</button>
					<button
						class="btn btn-primary"
						disabled={!selectedEntityType}
						onclick={generateEntity}
					>
						Generate
					</button>
				</div>
			{:else if currentStep === 'view'}
				<div class="modal-header">
					<h2 class="modal-title">Generated {selectedEntityType}</h2>
					<button class="close-btn" onclick={closeModal}>✕</button>
				</div>

				<div class="modal-content entity-view-content">
					<EntityViewer entity={generatedEntity} entityType={selectedEntityType || ''} />
				</div>

				<div class="modal-footer">
					<button class="btn btn-secondary" onclick={regenerate}>Regenerate</button>
					<button class="btn btn-secondary" onclick={closeModal}>Discard</button>
					<button class="btn btn-primary" onclick={handleSave}>Save</button>
				</div>
			{/if}
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

	.entity-view-content {
		padding: 0;
	}

	.modal-description {
		color: rgb(216 180 254);
		margin-bottom: 1.5rem;
		font-size: 0.875rem;
	}

	.entity-type-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1rem;
	}

	.entity-type-card {
		background: rgb(30 27 75 / 0.5);
		border: 2px solid rgb(168 85 247 / 0.2);
		border-radius: 0.75rem;
		padding: 1.5rem;
		cursor: pointer;
		transition: all 0.2s;
		text-align: center;
	}

	.entity-type-card:hover {
		border-color: rgb(168 85 247 / 0.5);
		background: rgb(30 27 75 / 0.7);
		transform: translateY(-2px);
	}

	.entity-type-card.selected {
		border-color: rgb(168 85 247);
		background: rgb(168 85 247 / 0.2);
	}

	.entity-icon {
		font-size: 3rem;
		margin-bottom: 0.75rem;
	}

	.entity-type-name {
		color: white;
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
	}

	.entity-type-description {
		color: rgb(216 180 254 / 0.8);
		font-size: 0.875rem;
		margin: 0;
		line-height: 1.4;
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

	.btn-secondary:hover {
		background: rgb(168 85 247 / 0.2);
		color: white;
	}
</style>
