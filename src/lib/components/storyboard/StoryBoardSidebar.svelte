<script lang="ts">
	import { allEntities, entityStore } from '$lib/stores/entityStore';
	import { storyboardStore, activeBoard } from '$lib/stores/storyboardStore';
	import { EntityType, type Entity } from '$lib/types/entity';

	interface Props {
		adventureId: string;
	}

	let { adventureId }: Props = $props();

	// Sidebar state
	let isCollapsed = $state(false);
	let selectedType = $state<EntityType | 'all'>('all');
	let searchQuery = $state('');

	// Get entities for this adventure/campaign
	let entities = $derived(
		$allEntities.filter((e) => {
			// Filter by campaign/adventure
			const belongsToAdventure = e.id === adventureId || e.parentId === adventureId || e.campaignId === adventureId;
			if (!belongsToAdventure) return false;

			// Filter by type
			if (selectedType !== 'all' && e.type !== selectedType) return false;

			// Filter by search
			if (searchQuery) {
				const query = searchQuery.toLowerCase();
				return (
					e.name.toLowerCase().includes(query) ||
					e.description.toLowerCase().includes(query) ||
					e.tags.some((tag) => tag.toLowerCase().includes(query))
				);
			}

			return true;
		})
	);

	// Group entities by type
	let entitiesByType = $derived(
		entities.reduce(
			(acc, entity) => {
				if (!acc[entity.type]) {
					acc[entity.type] = [];
				}
				acc[entity.type].push(entity);
				return acc;
			},
			{} as Record<EntityType, Entity[]>
		)
	);

	// Get entity icon
	function getEntityIcon(entityType: EntityType): string {
		const icons: Record<string, string> = {
			campaign: '🎭',
			adventure: '🗺️',
			character: '👤',
			location: '📍',
			artifact: '⚔️',
			plot: '📖',
			faction: '⚔️',
			session: '📅',
			event: '⚡',
			monster: '👹'
		};
		return icons[entityType] || '📄';
	}

	// Get entity color
	function getEntityColor(entityType: EntityType): string {
		const colors: Record<string, string> = {
			campaign: '#a855f7', // purple
			adventure: '#3b82f6', // blue
			character: '#10b981', // green
			location: '#f59e0b', // amber
			artifact: '#ef4444', // red
			plot: '#8b5cf6', // violet
			faction: '#dc2626', // red-600
			session: '#06b6d4', // cyan
			event: '#f97316', // orange
			monster: '#991b1b' // red-800
		};
		return colors[entityType] || '#6b7280';
	}

	function addEntityToBoard(entity: Entity) {
		if (!$activeBoard) return;

		// Calculate position for new node (center of viewport)
		const viewportCenterX = (-$activeBoard.viewport.x + window.innerWidth / 2) / $activeBoard.viewport.zoom;
		const viewportCenterY = (-$activeBoard.viewport.y + window.innerHeight / 2) / $activeBoard.viewport.zoom;

		// Add node to board
		storyboardStore.addNode(
			$activeBoard.id,
			{
				entityId: entity.id,
				entityType: entity.type,
				x: viewportCenterX - 75, // Center the 150px wide card
				y: viewportCenterY - 40, // Center the 80px tall card
				label: entity.name,
				color: getEntityColor(entity.type),
				icon: getEntityIcon(entity.type)
			},
			`Add ${entity.type}`
		);
	}

	function toggleCollapse() {
		isCollapsed = !isCollapsed;
	}

	// Entity type options for filter
	const entityTypes = [
		{ value: 'all', label: 'All Types', icon: '📋' },
		{ value: EntityType.Character, label: 'Characters', icon: getEntityIcon(EntityType.Character) },
		{ value: EntityType.Location, label: 'Locations', icon: getEntityIcon(EntityType.Location) },
		{ value: EntityType.Artifact, label: 'Artifacts', icon: getEntityIcon(EntityType.Artifact) },
		{ value: EntityType.Plot, label: 'Plots', icon: getEntityIcon(EntityType.Plot) },
		{ value: EntityType.Faction, label: 'Factions', icon: getEntityIcon(EntityType.Faction) },
		{ value: EntityType.Event, label: 'Events', icon: getEntityIcon(EntityType.Event) },
		{ value: EntityType.Monster, label: 'Monsters', icon: getEntityIcon(EntityType.Monster) }
	];
</script>

<div class="sidebar {isCollapsed ? 'collapsed' : ''}">
	<div class="sidebar-header">
		<button class="collapse-btn" onclick={toggleCollapse} title={isCollapsed ? 'Expand' : 'Collapse'}>
			{isCollapsed ? '▶' : '◀'}
		</button>
		{#if !isCollapsed}
			<h3>Entities</h3>
		{/if}
	</div>

	{#if !isCollapsed}
		<div class="sidebar-content">
			<!-- Search -->
			<div class="search-box">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search entities..."
					class="search-input"
				/>
			</div>

			<!-- Type filter -->
			<div class="type-filter">
				<select bind:value={selectedType} class="type-select">
					{#each entityTypes as type}
						<option value={type.value}>
							{type.icon} {type.label}
						</option>
					{/each}
				</select>
			</div>

			<!-- Entity count -->
			<div class="entity-count">
				{entities.length} {entities.length === 1 ? 'entity' : 'entities'}
			</div>

			<!-- Entity list -->
			<div class="entity-list">
				{#if entities.length === 0}
					<div class="empty-state">
						<p>No entities found</p>
						<p class="hint">Create entities in the workspace to add them here</p>
					</div>
				{:else}
					{#each Object.entries(entitiesByType) as [type, typeEntities]}
						<div class="entity-group">
							<div class="group-header">
								<span class="group-icon">{getEntityIcon(type as EntityType)}</span>
								<span class="group-label">{type}s</span>
								<span class="group-count">({typeEntities.length})</span>
							</div>
							{#each typeEntities as entity}
								<div class="entity-item">
									<div class="entity-info">
										<div class="entity-name">{entity.name}</div>
										{#if entity.description}
											<div class="entity-description">{entity.description.slice(0, 60)}{entity.description.length > 60 ? '...' : ''}</div>
										{/if}
									</div>
									<button
										class="add-btn"
										onclick={() => addEntityToBoard(entity)}
										title="Add to board"
									>
										+
									</button>
								</div>
							{/each}
						</div>
					{/each}
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.sidebar {
		position: absolute;
		top: 60px; /* Below toolbar */
		right: 0;
		width: 300px;
		height: calc(100% - 60px);
		background: rgba(15, 23, 42, 0.95);
		border-left: 1px solid rgba(139, 92, 246, 0.3);
		display: flex;
		flex-direction: column;
		z-index: 10;
		transition: width 0.3s ease;
	}

	.sidebar.collapsed {
		width: 40px;
	}

	.sidebar-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem;
		border-bottom: 1px solid rgba(139, 92, 246, 0.3);
	}

	.collapse-btn {
		background: rgba(139, 92, 246, 0.2);
		border: 1px solid rgba(139, 92, 246, 0.4);
		color: rgb(216, 180, 254);
		padding: 0.5rem;
		border-radius: 0.25rem;
		cursor: pointer;
		font-size: 0.875rem;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 32px;
		min-height: 32px;
	}

	.collapse-btn:hover {
		background: rgba(139, 92, 246, 0.3);
		border-color: rgba(139, 92, 246, 0.6);
	}

	.sidebar-header h3 {
		margin: 0;
		color: rgb(216, 180, 254);
		font-size: 1.125rem;
		font-weight: 600;
	}

	.sidebar-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.search-box {
		padding: 1rem;
		border-bottom: 1px solid rgba(139, 92, 246, 0.2);
	}

	.search-input {
		width: 100%;
		padding: 0.5rem;
		background: rgba(30, 41, 59, 0.6);
		border: 1px solid rgba(139, 92, 246, 0.3);
		border-radius: 0.25rem;
		color: rgb(226, 232, 240);
		font-size: 0.875rem;
	}

	.search-input:focus {
		outline: none;
		border-color: rgba(139, 92, 246, 0.6);
	}

	.search-input::placeholder {
		color: rgb(148, 163, 184);
	}

	.type-filter {
		padding: 0.5rem 1rem;
		border-bottom: 1px solid rgba(139, 92, 246, 0.2);
	}

	.type-select {
		width: 100%;
		padding: 0.5rem;
		background: rgba(30, 41, 59, 0.6);
		border: 1px solid rgba(139, 92, 246, 0.3);
		border-radius: 0.25rem;
		color: rgb(226, 232, 240);
		font-size: 0.875rem;
		cursor: pointer;
	}

	.type-select:focus {
		outline: none;
		border-color: rgba(139, 92, 246, 0.6);
	}

	.entity-count {
		padding: 0.5rem 1rem;
		color: rgb(148, 163, 184);
		font-size: 0.875rem;
		border-bottom: 1px solid rgba(139, 92, 246, 0.2);
	}

	.entity-list {
		flex: 1;
		overflow-y: auto;
		padding: 0.5rem;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem 1rem;
		color: rgb(148, 163, 184);
		text-align: center;
	}

	.empty-state p {
		margin: 0.25rem 0;
	}

	.empty-state .hint {
		font-size: 0.75rem;
		color: rgb(100, 116, 139);
	}

	.entity-group {
		margin-bottom: 1rem;
	}

	.group-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem;
		background: rgba(139, 92, 246, 0.1);
		border-radius: 0.25rem;
		color: rgb(216, 180, 254);
		font-weight: 600;
		font-size: 0.875rem;
		margin-bottom: 0.5rem;
	}

	.group-icon {
		font-size: 1rem;
	}

	.group-label {
		flex: 1;
		text-transform: capitalize;
	}

	.group-count {
		color: rgb(148, 163, 184);
		font-weight: normal;
		font-size: 0.75rem;
	}

	.entity-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem;
		background: rgba(30, 41, 59, 0.6);
		border: 1px solid rgba(139, 92, 246, 0.2);
		border-radius: 0.25rem;
		margin-bottom: 0.5rem;
		transition: all 0.2s;
	}

	.entity-item:hover {
		background: rgba(30, 41, 59, 0.8);
		border-color: rgba(139, 92, 246, 0.4);
	}

	.entity-info {
		flex: 1;
		min-width: 0;
	}

	.entity-name {
		color: rgb(226, 232, 240);
		font-weight: 500;
		font-size: 0.875rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.entity-description {
		color: rgb(148, 163, 184);
		font-size: 0.75rem;
		margin-top: 0.25rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.add-btn {
		background: rgba(139, 92, 246, 0.2);
		border: 1px solid rgba(139, 92, 246, 0.4);
		color: rgb(216, 180, 254);
		width: 28px;
		height: 28px;
		border-radius: 0.25rem;
		cursor: pointer;
		font-size: 1.25rem;
		font-weight: bold;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
		flex-shrink: 0;
	}

	.add-btn:hover {
		background: rgba(139, 92, 246, 0.4);
		border-color: rgba(139, 92, 246, 0.6);
		transform: scale(1.1);
	}

	.add-btn:active {
		transform: scale(0.95);
	}
</style>
