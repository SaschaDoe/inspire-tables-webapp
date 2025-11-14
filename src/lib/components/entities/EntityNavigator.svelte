<script lang="ts">
	import {
		entityStore,
		recentlyUsedEntities,
		favoriteEntities,
		campaignEntities,
		adventureEntities,
		questEntities,
		universeEntities,
		sphereEntities,
		galaxyEntities,
		solarSystemEntities,
		planetEntities,
		continentEntities,
		nationEntities,
		regionEntities,
		settlementEntities,
		dungeonEntities,
		characterEntities,
		factionEntities,
		roomEntities,
		entranceEntities
	} from '$lib/stores/entityStore';
	import { EntityType, type Entity } from '$lib/types/entity';
	import { SvelteSet } from 'svelte/reactivity';

	interface Props {
		selectedEntityId?: string;
		onselectEntity?: (event: CustomEvent<{ entity: Entity }>) => void;
		oncreateEntity?: (event: CustomEvent<{ type: EntityType }>) => void;
	}

	let { selectedEntityId, onselectEntity, oncreateEntity }: Props = $props();

	// Navigation categories organized by domain
	const categories = [
		{
			name: 'Quick Access',
			icon: '⚡',
			sections: [
				{ type: 'recent' as const, label: 'Recently Used', icon: '🕐' },
				{ type: 'favorites' as const, label: 'Favorites', icon: '⭐' }
			]
		},
		{
			name: 'Meta',
			icon: '📚',
			sections: [
				{ type: EntityType.Campaign, label: 'Campaigns', icon: '🎭' },
				{ type: EntityType.Adventure, label: 'Adventures', icon: '🗺️' },
				{ type: EntityType.Quest, label: 'Quests', icon: '🎯' },
				{ type: EntityType.Scene, label: 'Scenes', icon: '🎬' },
				{ type: EntityType.StoryBeat, label: 'Story Beats', icon: '📝' },
				{ type: EntityType.InitialMeeting, label: 'Initial Meetings', icon: '🤝' }
			]
		},
		{
			name: 'Locations',
			icon: '🌍',
			sections: [
				{ type: EntityType.Universe, label: 'Universes', icon: '🌐' },
				{ type: EntityType.Sphere, label: 'Spheres', icon: '🌌' },
				{ type: EntityType.SphereConnection, label: 'Sphere Connections', icon: '🔗' },
				{ type: EntityType.Galaxy, label: 'Galaxies', icon: '🌠' },
				{ type: EntityType.SolarSystem, label: 'Solar Systems', icon: '☀️' },
				{ type: EntityType.Star, label: 'Stars', icon: '⭐' },
				{ type: EntityType.Planet, label: 'Planets', icon: '🪐' },
				{ type: EntityType.Continent, label: 'Continents', icon: '🗾' },
				{ type: EntityType.Nation, label: 'Nations', icon: '🏛️' },
				{ type: EntityType.Region, label: 'Regions', icon: '🏞️' },
				{ type: EntityType.Settlement, label: 'Settlements', icon: '🏘️' },
				{ type: EntityType.Building, label: 'Buildings', icon: '🏛️' },
				{ type: EntityType.HexTile, label: 'Hex Tiles', icon: '⬡' },
				{ type: EntityType.Dungeon, label: 'Dungeons', icon: '🏰' },
				{ type: EntityType.Room, label: 'Rooms', icon: '🚪' },
				{ type: EntityType.Entrance, label: 'Entrances', icon: '🗿' }
			]
		},
		{
			name: 'Characters',
			icon: '👥',
			sections: [
				{ type: EntityType.Character, label: 'Characters', icon: '🧙' },
				{ type: EntityType.Villain, label: 'Villains', icon: '😈' },
				{ type: EntityType.Monster, label: 'Monsters', icon: '👹' },
				{ type: EntityType.Faction, label: 'Factions', icon: '⚔️' },
				{ type: EntityType.Organization, label: 'Organizations', icon: '🏢' }
			]
		},
		{
			name: 'Artefacts',
			icon: '⚔️',
			sections: [
				{ type: EntityType.Artifact, label: 'Artefacts', icon: '⚔️' },
				{ type: EntityType.Treasure, label: 'Treasures', icon: '💰' },
				{ type: EntityType.Vehicle, label: 'Vehicles', icon: '🚗' },
				{ type: EntityType.Sign, label: 'Signs', icon: '🛡️' }
			]
		},
		{
			name: 'Others',
			icon: '📦',
			sections: [
				{ type: EntityType.MagicSystem, label: 'Magic Systems', icon: '🔮' },
				{ type: EntityType.Spell, label: 'Spells', icon: '✨' },
				{ type: EntityType.Ritual, label: 'Rituals', icon: '🕯️' },
				{ type: EntityType.God, label: 'Gods', icon: '⚡' },
				{ type: EntityType.Talent, label: 'Talents', icon: '✨' },
				{ type: EntityType.Trap, label: 'Traps', icon: '🪤' },
				{ type: EntityType.Event, label: 'Events', icon: '🎭' },
				{ type: EntityType.WeatherEvent, label: 'Weather Events', icon: '🌪️' },
				{ type: EntityType.Rumor, label: 'Rumors', icon: '💬' },
				{ type: EntityType.Prophecy, label: 'Prophecies', icon: '🔮' },
				{ type: EntityType.Clue, label: 'Clues', icon: '🔍' },
				{ type: EntityType.Illness, label: 'Illnesses', icon: '🦠' }
			]
		}
	];

	// Use Svelte 5 runes for reactive state
	let expandedCategories = new SvelteSet<string>(['Quick Access', 'Meta']);
	let expandedSections = new SvelteSet<string>();

	// Auto-expand section containing the selected entity
	$effect(() => {
		if (!selectedEntityId) return;

		// Find which section contains this entity
		for (const category of categories) {
			for (const section of category.sections) {
				if (section.type === 'recent' || section.type === 'favorites') continue;

				const entities = getEntitiesForSection(section.type);
				const hasEntity = entities.some(e => e.id === selectedEntityId);

				if (hasEntity) {
					// Expand both the category and the section
					expandedCategories.add(category.name);
					expandedSections.add(section.type);
					break;
				}
			}
		}
	});

	function toggleCategory(categoryName: string) {
		if (expandedCategories.has(categoryName)) {
			expandedCategories.delete(categoryName);
		} else {
			expandedCategories.add(categoryName);
		}
	}

	function toggleSection(sectionType: string) {
		if (expandedSections.has(sectionType)) {
			expandedSections.delete(sectionType);
		} else {
			expandedSections.add(sectionType);
		}
	}

	// Map entity types to their reactive stores
	function getEntitiesForSection(type: string): Entity[] {
		if (type === 'recent') return $recentlyUsedEntities;
		if (type === 'favorites') return $favoriteEntities;

		// Return reactive store values for each entity type
		switch (type) {
			case EntityType.Campaign:
				return $campaignEntities;
			case EntityType.Adventure:
				return $adventureEntities;
			case EntityType.Quest:
				return $questEntities;
			case EntityType.Universe:
				return $universeEntities;
			case EntityType.Sphere:
				return $sphereEntities;
			case EntityType.Galaxy:
				return $galaxyEntities;
			case EntityType.SolarSystem:
				return $solarSystemEntities;
			case EntityType.Planet:
				return $planetEntities;
			case EntityType.Continent:
				return $continentEntities;
			case EntityType.Nation:
				return $nationEntities;
			case EntityType.Region:
				return $regionEntities;
			case EntityType.Settlement:
				return $settlementEntities;
			case EntityType.Dungeon:
				return $dungeonEntities;
			case EntityType.Character:
				return $characterEntities;
			case EntityType.Faction:
				return $factionEntities;
			case EntityType.Room:
				return $roomEntities;
			case EntityType.Entrance:
				return $entranceEntities;
			default:
				return [];
		}
	}

	function handleEntityClick(entity: Entity) {
		console.log('[EntityNavigator] Entity clicked:', {
			id: entity.id,
			type: entity.type,
			name: entity.name
		});
		entityStore.markAsRecentlyUsed(entity.id);
		onselectEntity?.(new CustomEvent('selectEntity', { detail: { entity } }));
	}

	function handleCreateClick(type: EntityType) {
		oncreateEntity?.(new CustomEvent('createEntity', { detail: { type } }));
	}
</script>

<div class="entity-navigator">
	<div class="navigator-header">
		<h2>Workspace</h2>
	</div>

	<div class="navigator-content">
		{#each categories as category (category.name)}
			<div class="category">
				<button
					class="category-header"
					class:expanded={expandedCategories.has(category.name)}
					onclick={() => toggleCategory(category.name)}
				>
					<span class="icon">{expandedCategories.has(category.name) ? '▼' : '▶'}</span>
					<span class="category-icon">{category.icon}</span>
					<span class="category-name">{category.name}</span>
				</button>

				{#if expandedCategories.has(category.name)}
					<div class="sections">
						{#each category.sections as section (section.type)}
							{@const entities = getEntitiesForSection(section.type)}
							{@const count = entities.length}

							<div class="section">
								<button
									class="section-header"
									class:expanded={expandedSections.has(section.type)}
									onclick={() => toggleSection(section.type)}
								>
									<span class="icon">{expandedSections.has(section.type) ? '▼' : '▶'}</span>
									<span class="section-icon">{section.icon}</span>
									<span class="section-name">{section.label}</span>
									<span class="count">{count}</span>
								</button>

								{#if expandedSections.has(section.type)}
									<div class="entity-list">
										{#if entities.length === 0}
											<div class="empty-message">No {section.label.toLowerCase()} yet</div>
										{:else}
											{#each entities as entity (entity.id)}
												<button
													class="entity-item"
													class:selected={entity.id === selectedEntityId}
													onclick={() => handleEntityClick(entity)}
												>
													<span class="entity-name">{entity.name}</span>
													{#if entityStore.isFavorite(entity.id)}
														<span class="favorite-badge">⭐</span>
													{/if}
												</button>
											{/each}
										{/if}

										{#if section.type !== 'recent' && section.type !== 'favorites'}
											<button
												class="create-button"
												onclick={() => handleCreateClick(section.type)}
											>
												<span class="plus-icon">+</span> New {section.label.slice(0, -1)}
											</button>
										{/if}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.entity-navigator {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: var(--surface-1, #1a1a1a);
		color: var(--text-1, #e0e0e0);
		border-right: 1px solid var(--border-color, #333);
		overflow: hidden;
	}

	.navigator-header {
		padding: 1rem;
		border-bottom: 1px solid var(--border-color, #333);
		background: var(--surface-2, #252525);
	}

	.navigator-header h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.navigator-content {
		flex: 1;
		overflow-y: auto;
		padding: 0.5rem 0;
	}

	.category {
		margin-bottom: 0.25rem;
	}

	.category-header {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: none;
		border: none;
		color: var(--text-1, #e0e0e0);
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		text-align: left;
		transition: background-color 0.2s;
	}

	.category-header:hover {
		background: var(--surface-2, #252525);
	}

	.category-header.expanded {
		background: var(--surface-2, #252525);
	}

	.icon {
		font-size: 0.75rem;
		color: var(--text-2, #999);
		width: 1rem;
	}

	.category-icon {
		font-size: 1rem;
	}

	.category-name {
		flex: 1;
	}

	.sections {
		padding-left: 0.5rem;
	}

	.section {
		margin-bottom: 0.125rem;
	}

	.section-header {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: none;
		border: none;
		color: var(--text-1, #e0e0e0);
		font-size: 0.8125rem;
		cursor: pointer;
		text-align: left;
		transition: background-color 0.2s;
	}

	.section-header:hover {
		background: var(--surface-3, #2a2a2a);
	}

	.section-header.expanded {
		background: var(--surface-3, #2a2a2a);
	}

	.section-icon {
		font-size: 0.875rem;
	}

	.section-name {
		flex: 1;
	}

	.count {
		font-size: 0.75rem;
		color: var(--text-2, #999);
		background: var(--surface-4, #333);
		padding: 0.125rem 0.5rem;
		border-radius: 10px;
		min-width: 1.5rem;
		text-align: center;
	}

	.entity-list {
		padding-left: 2rem;
	}

	.entity-item {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.75rem;
		background: none;
		border: none;
		color: var(--text-1, #e0e0e0);
		font-size: 0.8125rem;
		cursor: pointer;
		text-align: left;
		transition: background-color 0.2s;
		border-radius: 4px;
		margin-bottom: 0.125rem;
	}

	.entity-item:hover {
		background: var(--accent-hover, #3a3a3a);
	}

	.entity-item.selected {
		background: rgb(168 85 247 / 0.3);
		border-left: 3px solid rgb(168 85 247);
		padding-left: calc(0.75rem - 3px);
		color: white;
		font-weight: 600;
	}

	.entity-name {
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.favorite-badge {
		font-size: 0.75rem;
	}

	.empty-message {
		padding: 0.5rem 0.75rem;
		font-size: 0.75rem;
		color: var(--text-2, #999);
		font-style: italic;
	}

	.create-button {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.75rem;
		background: none;
		border: 1px dashed var(--border-color, #444);
		color: var(--accent, #60a5fa);
		font-size: 0.75rem;
		cursor: pointer;
		text-align: left;
		transition: all 0.2s;
		border-radius: 4px;
		margin-top: 0.25rem;
	}

	.create-button:hover {
		background: var(--accent-hover, #3a3a3a);
		border-color: var(--accent, #60a5fa);
	}

	.plus-icon {
		font-size: 1rem;
		font-weight: bold;
	}

	/* Custom scrollbar */
	.navigator-content::-webkit-scrollbar {
		width: 8px;
	}

	.navigator-content::-webkit-scrollbar-track {
		background: var(--surface-1, #1a1a1a);
	}

	.navigator-content::-webkit-scrollbar-thumb {
		background: var(--surface-4, #444);
		border-radius: 4px;
	}

	.navigator-content::-webkit-scrollbar-thumb:hover {
		background: var(--surface-5, #555);
	}
</style>
