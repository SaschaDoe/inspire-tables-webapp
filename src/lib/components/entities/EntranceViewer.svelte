<script lang="ts">
	import type { Entrance } from '$lib/entities/dungeon/entrance';
	import type { Entity } from '$lib/types/entity';

	interface Props {
		entrance: Entrance | Entity;
	}

	let { entrance: entranceProp }: Props = $props();

	// Handle both direct Entrance objects and wrapped Entity objects
	const entrance: Entrance = $derived(
		(entranceProp as any).customFields?.generatedEntity || (entranceProp as Entrance)
	);
</script>

<div class="entrance-viewer">
	<!-- Entrance Overview -->
	<div class="section">
		<h3 class="section-title">Entrance Details</h3>
		<div class="info-grid">
			<div class="info-item">
				<span class="info-label">Name:</span>
				<span class="info-value">{entrance.name}</span>
			</div>
			{#if entrance.entranceType}
				<div class="info-item">
					<span class="info-label">Type:</span>
					<span class="info-value">{entrance.entranceType}</span>
				</div>
			{/if}
			{#if entrance.adjective}
				<div class="info-item">
					<span class="info-label">Adjective:</span>
					<span class="info-value">{entrance.adjective}</span>
				</div>
			{/if}
			{#if entrance.description}
				<div class="info-item full-width">
					<span class="info-label">Description:</span>
					<span class="info-value">{entrance.description}</span>
				</div>
			{/if}
		</div>
	</div>

	<!-- Traps -->
	{#if entrance.traps && entrance.traps.length > 0}
		<div class="section">
			<h3 class="section-title">⚠️ Traps ({entrance.traps.length})</h3>
			<div class="traps-grid">
				{#each entrance.traps as trap, index (index)}
					<div class="trap-card">
						<div class="trap-header">
							<span class="trap-icon">🪤</span>
							<span class="trap-name">{trap.name || `Trap ${index + 1}`}</span>
						</div>
						<div class="trap-details">
							{#if trap.trigger}
								<div class="trap-detail">
									<span class="detail-label">Trigger:</span>
									<span class="detail-value">{trap.trigger}</span>
								</div>
							{/if}
							{#if trap.function}
								<div class="trap-detail">
									<span class="detail-label">Function:</span>
									<span class="detail-value">{trap.function}</span>
								</div>
							{/if}
							{#if trap.description}
								<p class="trap-description">{trap.description}</p>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Connections -->
	{#if entrance.connectedRoomIds && entrance.connectedRoomIds.length > 0}
		<div class="section">
			<h3 class="section-title">Connections</h3>
			<p class="connection-info">
				This entrance leads to {entrance.connectedRoomIds.length} room{entrance.connectedRoomIds
					.length > 1
					? 's'
					: ''}.
			</p>
		</div>
	{/if}
</div>

<style>
	.entrance-viewer {
		padding: 0;
	}

	.section {
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: var(--surface-2, #1e1e1e);
		border-radius: 8px;
		border: 1px solid var(--border-color, #333);
	}

	.section-title {
		margin: 0 0 1rem 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-1, #e0e0e0);
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
	}

	.info-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.info-item.full-width {
		grid-column: 1 / -1;
	}

	.info-label {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		color: var(--text-2, #999);
		letter-spacing: 0.05em;
	}

	.info-value {
		font-size: 0.9375rem;
		color: var(--text-1, #e0e0e0);
		line-height: 1.5;
	}

	.traps-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1rem;
	}

	.trap-card {
		background: var(--surface-3, #2a2a2a);
		border: 2px solid #ef4444;
		border-radius: 8px;
		padding: 1rem;
		background: rgba(239, 68, 68, 0.1);
	}

	.trap-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--border-color, #444);
	}

	.trap-icon {
		font-size: 1.5rem;
	}

	.trap-name {
		font-weight: 600;
		color: var(--text-1, #e0e0e0);
		font-size: 1rem;
	}

	.trap-details {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.trap-detail {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.detail-label {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		color: var(--text-2, #999);
		letter-spacing: 0.05em;
	}

	.detail-value {
		font-size: 0.875rem;
		color: var(--text-1, #e0e0e0);
	}

	.trap-description {
		margin: 0.5rem 0 0 0;
		font-size: 0.875rem;
		color: var(--text-2, #999);
		line-height: 1.4;
		font-style: italic;
	}

	.connection-info {
		margin: 0;
		color: var(--text-2, #999);
		font-size: 0.9375rem;
	}
</style>
