<script lang="ts">
	/**
	 * Generic fallback viewer for entity types without specialized viewers
	 * Provides a simple key-value display of entity properties
	 */
	import Section from '../shared/Section.svelte';
	import InfoGrid from '../shared/InfoGrid.svelte';

	interface Props {
		entity: any;
		entityType: string;
	}

	let { entity, entityType }: Props = $props();

	/**
	 * Extract displayable properties from the entity
	 * Filters out complex objects, functions, and internal properties
	 */
	const displayProperties = $derived.by(() => {
		if (!entity) return [];

		const props = Object.entries(entity)
			.filter(([key, value]) => {
				// Skip description (shown in separate section)
				if (key === 'description') return false;
				// Skip internal properties
				if (key.startsWith('_')) return false;
				// Skip functions
				if (typeof value === 'function') return false;
				// Skip complex objects (but allow arrays)
				if (typeof value === 'object' && value !== null && !Array.isArray(value)) return false;
				// Skip null/undefined
				if (value === null || value === undefined) return false;
				return true;
			})
			.map(([key, value]) => ({
				label: formatLabel(key),
				value: formatValue(value)
			}));

		return props;
	});

	/**
	 * Format property keys to be more readable
	 */
	function formatLabel(key: string): string {
		return (
			key
				// Split camelCase
				.replace(/([A-Z])/g, ' $1')
				// Capitalize first letter of each word
				.replace(/^./, (str) => str.toUpperCase())
				.trim()
		);
	}

	/**
	 * Format property values for display
	 */
	function formatValue(value: any): string {
		if (Array.isArray(value)) {
			// If array contains entities (objects with name property), extract their names
			if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
				return value.map(item => item.name || String(item)).join(', ');
			}
			return value.join(', ');
		}
		if (typeof value === 'boolean') {
			return value ? 'Yes' : 'No';
		}
		return String(value);
	}
</script>

<div class="generic-viewer">
	<Section title="{formatLabel(entityType)} Information">
		{#if displayProperties.length > 0}
			<InfoGrid items={displayProperties} />
		{:else}
			<p class="no-data">No displayable properties found for this entity.</p>
		{/if}
	</Section>

	{#if entity.description}
		<Section title="Description">
			<p class="description-text">{entity.description}</p>
		</Section>
	{/if}
</div>

<style>
	.generic-viewer {
		padding: 0;
	}

	.description-text {
		padding: 1rem;
		background: rgb(30 27 75 / 0.3);
		border-left: 3px solid rgb(168 85 247);
		border-radius: 0.5rem;
		color: rgb(216 180 254);
		font-size: 0.875rem;
		line-height: 1.6;
		margin: 0;
		white-space: pre-wrap;
	}

	.no-data {
		color: rgb(216 180 254 / 0.6);
		font-style: italic;
		text-align: center;
		padding: 2rem;
	}
</style>
