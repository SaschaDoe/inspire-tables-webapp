<script lang="ts">
	interface InfoItem {
		label: string;
		value: string | number;
		valueClass?: string;
	}

	interface Props {
		items: InfoItem[];
	}

	let { items }: Props = $props();
</script>

<div class="info-grid">
	{#each items as item}
		<div class="info-item">
			<span class="info-label">{item.label}:</span>
			<span class="info-value {item.valueClass || ''}">{item.value}</span>
		</div>
	{/each}
</div>

<style>
	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
	}

	.info-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.info-label {
		font-size: 0.75rem;
		color: rgb(216 180 254 / 0.7);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 600;
	}

	.info-value {
		font-size: 0.875rem;
		color: white;
	}

	.info-value.positive {
		color: rgb(134 239 172);
	}

	.info-value.negative {
		color: rgb(252 165 165);
	}
</style>
