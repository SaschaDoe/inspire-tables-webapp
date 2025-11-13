<script lang="ts">
	/**
	 * EntityLink - A clickable link component for navigating to related entities
	 * Displays entity name with icon and emits event when clicked
	 */
	import { createEventDispatcher } from 'svelte';

	interface Props {
		entity: any; // The entity object with at least {id, name} properties
		icon?: string; // Optional icon to display before name
		showId?: boolean; // Whether to show entity ID
	}

	let { entity, icon, showId = false }: Props = $props();

	const dispatch = createEventDispatcher();

	function handleClick() {
		dispatch('click', { entity });
	}
</script>

<button class="entity-link" onclick={handleClick} type="button">
	{#if icon}
		<span class="entity-icon">{icon}</span>
	{/if}
	<span class="entity-name">{entity.name || 'Unnamed'}</span>
	{#if showId}
		<span class="entity-id">#{entity.id}</span>
	{/if}
	<span class="arrow">→</span>
</button>

<style>
	.entity-link {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: rgb(30 27 75 / 0.4);
		border: 1px solid rgb(168 85 247 / 0.3);
		border-radius: 0.5rem;
		color: rgb(216 180 254);
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s;
		width: 100%;
		text-align: left;
	}

	.entity-link:hover {
		background: rgb(168 85 247 / 0.2);
		border-color: rgb(168 85 247 / 0.6);
		color: white;
		transform: translateX(4px);
	}

	.entity-link:active {
		transform: translateX(2px);
	}

	.entity-icon {
		font-size: 1.25rem;
		flex-shrink: 0;
	}

	.entity-name {
		flex: 1;
		font-weight: 500;
	}

	.entity-id {
		font-size: 0.75rem;
		color: rgb(216 180 254 / 0.6);
		font-family: monospace;
	}

	.arrow {
		color: rgb(168 85 247);
		font-size: 1rem;
		flex-shrink: 0;
		transition: transform 0.2s;
	}

	.entity-link:hover .arrow {
		transform: translateX(4px);
	}
</style>
