<script lang="ts">
	import type { Attributes } from '$lib/entities/character/attributes';

	interface Props {
		attributes: Attributes;
	}

	let { attributes }: Props = $props();

	const attributeList = [
		{ name: 'STR', key: 'strength' as keyof Attributes },
		{ name: 'DEX', key: 'dexterity' as keyof Attributes },
		{ name: 'CON', key: 'constitution' as keyof Attributes },
		{ name: 'INT', key: 'intelligence' as keyof Attributes },
		{ name: 'WIS', key: 'intuition' as keyof Attributes },
		{ name: 'CHA', key: 'charisma' as keyof Attributes },
		{ name: 'AGI', key: 'agility' as keyof Attributes },
		{ name: 'WIL', key: 'willpower' as keyof Attributes }
	];

	const displayedAttributes = $derived(
		attributeList.filter((attr) => attributes[attr.key] !== undefined)
	);
</script>

<div class="attributes-grid">
	{#each displayedAttributes as attr}
		<div class="attribute">
			<span class="attr-name">{attr.name}</span>
			<span class="attr-value">{attributes[attr.key]}</span>
		</div>
	{/each}
</div>

<style>
	.attributes-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
		gap: 1rem;
	}

	.attribute {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.75rem;
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.5rem;
		transition: all 0.2s;
	}

	.attribute:hover {
		border-color: rgb(168 85 247 / 0.5);
		background: rgb(30 27 75 / 0.7);
		transform: translateY(-2px);
	}

	.attr-name {
		font-size: 0.75rem;
		color: rgb(216 180 254 / 0.7);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.25rem;
	}

	.attr-value {
		font-size: 1.5rem;
		color: white;
		font-weight: 600;
	}
</style>
