<script lang="ts">
	import { getEntityTypesList, getEntityCreator } from '$lib/entities/entityRegistry';
	import { getEntityConfigMetadata, getTableOptions } from '$lib/entities/entityConfigMetadata';
	import type { EntityTypeInfo } from '$lib/entities/entityRegistry';
	import EntityViewer from './EntityViewer.svelte';
	import { SvelteSet } from 'svelte/reactivity';

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
	let editedProperties = $state<Record<string, any>>({}); // Track user edits
	let lockedProperties = $state<Set<string>>(new Set()); // Track locked properties

	// Group entities by category
	const categorizedEntities = $derived(() => {
		const categories: Record<string, EntityTypeInfo[]> = {};
		entityTypes.forEach(entity => {
			const category = entity.category || 'Other';
			if (!categories[category]) {
				categories[category] = [];
			}
			categories[category].push(entity);
		});
		return categories;
	});

	function selectEntityType(type: string) {
		selectedEntityType = type;
	}

	function generateEntity() {
		if (!selectedEntityType) return;

		const creator = getEntityCreator(selectedEntityType);
		if (creator) {
			// Apply only locked properties as overrides
			const overrides: Record<string, any> = {};
			lockedProperties.forEach(propName => {
				if (editedProperties[propName] !== undefined) {
					overrides[propName] = editedProperties[propName];
				}
			});

			if (Object.keys(overrides).length > 0) {
				creator.withOverrides(overrides);
			}

			generatedEntity = creator.create();
			currentStep = 'view';

			// Update editedProperties with current values so they show in the UI
			const metadata = getEntityConfigMetadata(selectedEntityType);
			if (metadata) {
				metadata.properties.forEach(prop => {
					if (generatedEntity[prop.propertyName] !== undefined) {
						editedProperties[prop.propertyName] = generatedEntity[prop.propertyName];
					}
				});
			}
		}
	}

	function handlePropertyChange(propertyName: string, value: any) {
		editedProperties[propertyName] = value;
		// Also update the generated entity so it displays correctly
		if (generatedEntity) {
			generatedEntity[propertyName] = value;
		}
	}

	function toggleLock(propertyName: string) {
		if (lockedProperties.has(propertyName)) {
			lockedProperties.delete(propertyName);
		} else {
			lockedProperties.add(propertyName);
		}
		// Trigger reactivity
		lockedProperties = new Set(lockedProperties);
	}

	function handleSave() {
		if (generatedEntity && selectedEntityType && onSave) {
			// Name is already updated in generatedEntity via handlePropertyChange
			onSave(generatedEntity, selectedEntityType);
		}
		closeModal();
	}

	function closeModal() {
		isOpen = false;
		currentStep = 'select';
		selectedEntityType = null;
		generatedEntity = null;
		editedProperties = {};
		lockedProperties = new Set();
		onClose();
	}

	function regenerate() {
		// Keep edited properties and regenerate
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

					{#if true}
						{@const categories = categorizedEntities()}
						{@const categoryOrder = ['Meta', 'Locations', 'Characters', 'Artefacts', 'Others', 'Cosmic']}
						{#each categoryOrder as category}
						{#if categories[category]}
							<div class="category-section">
								<h3 class="category-title">{category}</h3>
								<div class="entity-type-grid">
									{#each categories[category] as entityType}
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
						{/if}
					{/each}
					{/if}
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
				{@const metadata = selectedEntityType ? getEntityConfigMetadata(selectedEntityType) : null}

				<div class="modal-header">
					<h2 class="modal-title">Generated {selectedEntityType}</h2>
					<button class="close-btn" onclick={closeModal}>✕</button>
				</div>

				<div class="modal-content entity-view-content">
					<!-- Editable Properties Section -->
					{#if metadata && metadata.properties.length > 0}
						<div class="editable-properties-section">
							<div class="properties-grid">
								{#each metadata.properties as prop}
									<div class="property-field">
										<div class="property-header">
											<label for="prop-{prop.propertyName}" class="property-label">
												{prop.label}
											</label>
											<button
												class="lock-btn {lockedProperties.has(prop.propertyName) ? 'locked' : ''}"
												onclick={() => toggleLock(prop.propertyName)}
												title={lockedProperties.has(prop.propertyName) ? 'Locked (will be kept on regenerate)' : 'Unlocked (will regenerate)'}
											>
												{lockedProperties.has(prop.propertyName) ? '🔒' : '🔓'}
											</button>
										</div>

										{#if prop.inputType === 'table' && prop.table}
											{@const options = getTableOptions(prop.table())}
											<select
												id="prop-{prop.propertyName}"
												value={editedProperties[prop.propertyName] || ''}
												onchange={(e) => handlePropertyChange(prop.propertyName, e.currentTarget.value)}
												class="property-select"
											>
												{#each options as option}
													<option value={option}>{option}</option>
												{/each}
											</select>
										{:else if prop.inputType === 'select' && prop.options}
											<select
												id="prop-{prop.propertyName}"
												value={editedProperties[prop.propertyName] || ''}
												onchange={(e) => handlePropertyChange(prop.propertyName, e.currentTarget.value)}
												class="property-select"
											>
												{#each prop.options as option}
													<option value={option}>{option}</option>
												{/each}
											</select>
										{:else if prop.inputType === 'number'}
											<input
												type="number"
												id="prop-{prop.propertyName}"
												value={editedProperties[prop.propertyName] || ''}
												oninput={(e) => handlePropertyChange(prop.propertyName, parseFloat(e.currentTarget.value) || 0)}
												placeholder={prop.placeholder || '0'}
												class="property-input"
												step="any"
											/>
										{:else if prop.inputType === 'text'}
											<input
												type="text"
												id="prop-{prop.propertyName}"
												value={editedProperties[prop.propertyName] || ''}
												oninput={(e) => handlePropertyChange(prop.propertyName, e.currentTarget.value)}
												placeholder={prop.placeholder || `Enter ${prop.label.toLowerCase()}`}
												class="property-input"
											/>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Full Entity View (Read-only details) -->
					<div class="entity-viewer-section">
								<EntityViewer entity={generatedEntity} entityType={selectedEntityType || ''} />
					</div>
				</div>

				<div class="modal-footer">
					<button class="btn btn-secondary" onclick={regenerate}>🔄 Regenerate</button>
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

	.category-section {
		margin-bottom: 2rem;
	}

	.category-section:last-child {
		margin-bottom: 0;
	}

	.category-title {
		color: rgb(192 132 252);
		font-size: 1.125rem;
		font-weight: 600;
		margin-bottom: 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 2px solid rgb(168 85 247 / 0.3);
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

	.name-input-section {
		padding: 1.5rem;
		background: rgb(30 27 75 / 0.3);
		border-bottom: 1px solid rgb(168 85 247 / 0.2);
		margin-bottom: 0;
	}

	.name-label {
		display: block;
		color: rgb(216 180 254);
		font-size: 0.875rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}

	.name-input {
		width: 100%;
		padding: 0.75rem;
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.3);
		border-radius: 0.5rem;
		color: white;
		font-size: 1rem;
		outline: none;
		transition: all 0.2s;
	}

	.name-input:focus {
		border-color: rgb(168 85 247);
		background: rgb(30 27 75 / 0.7);
	}

	.name-input::placeholder {
		color: rgb(216 180 254 / 0.5);
	}

	/* Editable Properties Section */
	.editable-properties-section {
		padding: 1.5rem;
		background: rgb(30 27 75 / 0.3);
		border-bottom: 1px solid rgb(168 85 247 / 0.2);
	}

	.entity-viewer-section {
		padding: 1.5rem;
	}

	.section-title {
		color: rgb(216 180 254);
		font-size: 0.875rem;
		font-weight: 600;
		margin: 0 0 1rem 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.properties-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.property-field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.property-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.property-label {
		color: rgb(216 180 254);
		font-size: 0.875rem;
		font-weight: 500;
		flex: 1;
	}

	.lock-btn {
		background: transparent;
		border: 1px solid rgb(168 85 247 / 0.3);
		border-radius: 0.25rem;
		padding: 0.25rem 0.5rem;
		cursor: pointer;
		font-size: 0.875rem;
		transition: all 0.2s;
		color: rgb(216 180 254);
	}

	.lock-btn:hover {
		background: rgb(168 85 247 / 0.2);
		border-color: rgb(168 85 247 / 0.5);
	}

	.lock-btn.locked {
		background: rgb(168 85 247 / 0.3);
		border-color: rgb(168 85 247);
	}

	.property-select,
	.property-input {
		padding: 0.625rem;
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.3);
		border-radius: 0.5rem;
		color: white;
		font-size: 0.875rem;
		outline: none;
		transition: all 0.2s;
	}

	.property-select:focus,
	.property-input:focus {
		border-color: rgb(168 85 247);
		background: rgb(30 27 75 / 0.7);
	}

	.property-input::placeholder {
		color: rgb(216 180 254 / 0.5);
	}

	.property-select {
		cursor: pointer;
	}
</style>
