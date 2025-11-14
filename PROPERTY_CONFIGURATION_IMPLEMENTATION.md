# Property Configuration Implementation Guide

## Overview
This guide explains how to implement the property configuration feature for entity generation, allowing users to pre-configure specific properties (like setting building type to "tower") before generating entities.

## What's Been Created

### 1. Configuration Metadata System
**File:** `src/lib/entities/entityConfigMetadata.ts`

This file defines:
- `PropertyConfig`: Configuration for each configurable property
- `EntityConfigMetadata`: Metadata for entity types
- `entityConfigRegistry`: Registry mapping entity types to their configurable properties
- Helper functions to get table options

Currently configured:
- **Building**: type, adjective, quality (all with dropdowns)
- **Dungeon**: type, adjective, state, size (dropdowns), name (text input)

## What Needs To Be Done

### Step 1: Update Creator Base Class
**File:** `src/lib/entities/base/creator.ts`

Add the overrides property and method:

```typescript
export abstract class Creator<T> {
	generationOption: GenerationOption = GenerationOption.Gonzo;
	dice: Dice = new Dice();
	protected parentId?: string;
	protected overrides: Record<string, any> = {}; // ADD THIS

	// ... existing methods ...

	// ADD THIS METHOD
	withOverrides(overrides: Record<string, any>): this {
		this.overrides = overrides;
		return this;
	}

	abstract create(): T;
}
```

### Step 2: Update Individual Creators
Modify creators to check for overrides before rolling on tables.

**Example - BuildingCreator** (`src/lib/entities/location/buildingCreator.ts`):

```typescript
create(): Building {
	const building = new Building();

	// Check for overrides, otherwise roll on table
	building.type = this.overrides['type'] || new BuildingTable().roleWithCascade(this.dice).text;
	building.adjective = this.overrides['adjective'] || new BuildingAdjectiveTable().roleWithCascade(this.dice).text;
	building.quality = this.overrides['quality'] || new QualityTable().roleWithCascade(this.dice).text;

	building.name = this.overrides['name'] || this.generateName(building);
	building.description = this.generateDescription(building);

	return building;
}
```

Apply the same pattern to:
- `DungeonCreator` (`src/lib/entities/dungeon/dungeonCreator.ts`)
- Other creators as needed

### Step 3: Update EntityGeneratorModal
**File:** `src/lib/components/entities/EntityGeneratorModal.svelte`

Add a new "configure" step between "select" and "view":

```svelte
<script lang="ts">
	import { getEntityTypesList, getEntityCreator } from '$lib/entities/entityRegistry';
	import { getEntityConfigMetadata, getTableOptions } from '$lib/entities/entityConfigMetadata';
	import type { EntityTypeInfo } from '$lib/entities/entityRegistry';
	import EntityViewer from './EntityViewer.svelte';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
		onSave?: (entity: any, entityType: string) => void;
	}

	let { isOpen = $bindable(false), onClose, onSave }: Props = $props();

	let currentStep = $state<'select' | 'configure' | 'view'>('select'); // ADD 'configure'
	let selectedEntityType = $state<string | null>(null);
	let generatedEntity = $state<any>(null);
	let entityTypes = $state<EntityTypeInfo[]>(getEntityTypesList());
	let entityName = $state<string>('');
	let propertyOverrides = $state<Record<string, any>>({}); // ADD THIS

	function selectEntityType(type: string) {
		selectedEntityType = type;
		propertyOverrides = {}; // Reset overrides
	}

	function proceedToGenerate() {
		const metadata = selectedEntityType ? getEntityConfigMetadata(selectedEntityType) : null;

		if (metadata && metadata.properties.length > 0) {
			// Entity has configurable properties, show configuration step
			currentStep = 'configure';
		} else {
			// No configuration needed, generate immediately
			generateEntity();
		}
	}

	function generateEntity() {
		if (!selectedEntityType) return;

		const creator = getEntityCreator(selectedEntityType);
		if (creator) {
			// Pass overrides to creator
			creator.withOverrides(propertyOverrides);
			generatedEntity = creator.create();
			entityName = generatedEntity.name || `${selectedEntityType} ${generatedEntity.id.slice(0, 8)}`;
			currentStep = 'view';
		}
	}

	function handleSave() {
		if (generatedEntity && selectedEntityType && onSave) {
			generatedEntity.name = entityName;
			onSave(generatedEntity, selectedEntityType);
		}
		closeModal();
	}

	function closeModal() {
		isOpen = false;
		currentStep = 'select';
		selectedEntityType = null;
		generatedEntity = null;
		propertyOverrides = {};
		onClose();
	}

	function regenerate() {
		generateEntity();
	}

	function skipConfiguration() {
		propertyOverrides = {}; // Clear any partial configuration
		generateEntity();
	}
</script>

{#if isOpen}
	<div class="modal-overlay" onclick={closeModal}>
		<div class="modal" onclick={(e) => e.stopPropagation()}>
			{#if currentStep === 'select'}
				<!-- Existing select UI -->
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
						onclick={proceedToGenerate}
					>
						Continue
					</button>
				</div>

			{:else if currentStep === 'configure'}
				<!-- NEW: Configuration UI -->
				{@const metadata = selectedEntityType ? getEntityConfigMetadata(selectedEntityType) : null}

				<div class="modal-header">
					<h2 class="modal-title">Configure {selectedEntityType}</h2>
					<button class="close-btn" onclick={closeModal}>✕</button>
				</div>

				<div class="modal-content">
					<p class="modal-description">
						Customize properties before generating (leave empty for random):
					</p>

					{#if metadata}
						<div class="config-grid">
							{#each metadata.properties as prop}
								<div class="config-field">
									<label for={prop.propertyName}>{prop.label}</label>

									{#if prop.inputType === 'table' && prop.table}
										{@const options = getTableOptions(prop.table())}
										<select
											id={prop.propertyName}
											bind:value={propertyOverrides[prop.propertyName]}
											class="config-select"
										>
											<option value="">-- Random --</option>
											{#each options as option}
												<option value={option}>{option}</option>
											{/each}
										</select>
									{:else if prop.inputType === 'text'}
										<input
											type="text"
											id={prop.propertyName}
											bind:value={propertyOverrides[prop.propertyName]}
											placeholder={prop.placeholder || `Enter ${prop.label.toLowerCase()}`}
											class="config-input"
										/>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<div class="modal-footer">
					<button class="btn btn-secondary" onclick={skipConfiguration}>
						Skip & Generate Random
					</button>
					<button class="btn btn-primary" onclick={generateEntity}>
						Generate with Configuration
					</button>
				</div>

			{:else if currentStep === 'view'}
				<!-- Existing view UI -->
				<div class="modal-header">
					<h2 class="modal-title">Generated {selectedEntityType}</h2>
					<button class="close-btn" onclick={closeModal}>✕</button>
				</div>

				<div class="modal-content entity-view-content">
					<div class="name-input-section">
						<label for="entity-name" class="name-label">Entity Name:</label>
						<input
							id="entity-name"
							type="text"
							bind:value={entityName}
							placeholder="Enter a name for this entity"
							class="name-input"
						/>
					</div>
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
	/* ... existing styles ... */

	/* NEW: Configuration styles */
	.config-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
		margin-top: 1rem;
	}

	.config-field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.config-field label {
		color: rgb(216 180 254);
		font-size: 0.875rem;
		font-weight: 600;
	}

	.config-select,
	.config-input {
		padding: 0.75rem;
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.3);
		border-radius: 0.5rem;
		color: white;
		font-size: 1rem;
		outline: none;
		transition: all 0.2s;
	}

	.config-select:focus,
	.config-input:focus {
		border-color: rgb(168 85 247);
		background: rgb(30 27 75 / 0.7);
	}

	.config-input::placeholder {
		color: rgb(216 180 254 / 0.5);
	}
</style>
```

## How to Use

Once implemented, users can:

1. Click "New Entity" in workspace
2. Select entity type (e.g., "Building")
3. **NEW:** Configure properties:
   - Select "tower" from Building Type dropdown
   - Optionally set adjective, quality, etc.
4. Click "Generate with Configuration"
5. See the generated mage tower!

## Adding More Entity Types

To add configuration for more entity types, update `entityConfigMetadata.ts`:

```typescript
export const entityConfigRegistry: Record<string, EntityConfigMetadata> = {
	// ... existing entries ...

	room: {
		properties: [
			{
				propertyName: 'furnishing',
				label: 'Furnishing',
				inputType: 'table',
				table: () => new FurnishingTable()
			},
			// ... more properties
		]
	}
};
```

Then update the corresponding creator to check overrides.

## Benefits

- **Generic**: Works for any entity type
- **Flexible**: Supports both dropdowns (from tables) and text inputs
- **Optional**: Users can skip configuration for random generation
- **Extensible**: Easy to add more entity types

## Example Use Case

To generate a **mage tower**:
1. Select "Building"
2. Set Type: "tower"
3. Set Adjective: "arcane" or "mystical"
4. Generate!

Result: "The Arcane Tower" with all properties set appropriately.
