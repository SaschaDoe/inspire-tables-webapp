<script lang="ts">
	import type { Talent } from '$lib/entities/talent/talent';

	interface Props {
		talent: Talent;
	}

	let { talent }: Props = $props();
</script>

<div class="talent-card">
	<div class="talent-header">
		<h4 class="talent-name">{talent.name || talent.type}</h4>
		<span class="talent-category">{talent.category}</span>
	</div>
	{#if talent.description}
		<p class="talent-description">{talent.description}</p>
	{/if}
</div>

<style>
	.talent-card {
		padding: 1rem;
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.5rem;
		transition: all 0.2s;
	}

	.talent-card:hover {
		border-color: rgb(168 85 247 / 0.5);
		background: rgb(30 27 75 / 0.7);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
	}

	.talent-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.talent-name {
		font-size: 1rem;
		font-weight: 600;
		color: rgb(216 180 254);
		margin: 0;
	}

	.talent-category {
		padding: 0.25rem 0.5rem;
		background: rgb(168 85 247 / 0.3);
		border-radius: 0.25rem;
		font-size: 0.75rem;
		color: rgb(216 180 254);
		white-space: nowrap;
		text-transform: capitalize;
	}

	.talent-description {
		color: rgb(216 180 254 / 0.8);
		font-size: 0.875rem;
		line-height: 1.5;
		margin: 0;
	}
</style>
