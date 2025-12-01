<script lang="ts">
	import type { Unit } from '$lib/entities/military/unit';
	import type { City } from '$lib/entities/location/city';
	import type { DetailedHexTile } from '$lib/entities/location/detailedHexTile';
	import { createEventDispatcher } from 'svelte';
	import { UnitType } from '$lib/entities/military/unit';

	interface Props {
		tile: DetailedHexTile | null;
		units: Unit[];
		cities: City[];
	}

	let { tile, units, cities }: Props = $props();

	const dispatch = createEventDispatcher();

	// Filter entities on this tile
	const tileUnits = $derived(
		tile ? units.filter((u) => u.coordinates.x === tile.globalX && u.coordinates.y === tile.globalY) : []
	);

	const tileCity = $derived(tile ? cities.find((c) => c.hexTileId === tile.id) : null);

	function getUnitIcon(type: UnitType): string {
		switch (type) {
			case UnitType.Settler:
				return '🏕️';
			case UnitType.Worker:
				return '⛏️';
			case UnitType.Warrior:
				return '🗡️';
			case UnitType.Scout:
				return '🔭';
			case UnitType.Archer:
				return '🏹';
			case UnitType.Spearman:
				return '🔱';
			case UnitType.Swordsman:
				return '⚔️';
			case UnitType.Knight:
				return '🐴';
			default:
				return '🛡️';
		}
	}

	function handleEntityClick(entity: Unit | City) {
		dispatch('openEntity', { entity });
	}

	function handleUnitAction(unit: Unit, action: string) {
		dispatch('unitAction', { unit, action });
	}
</script>

<div class="tile-entity-panel">
	{#if !tile}
		<p class="no-tile">Select a tile to see entities</p>
	{:else}
		<div class="tile-header">
			<span class="tile-coords">Tile ({tile.globalX}, {tile.globalY})</span>
		</div>

		<!-- City on this tile -->
		{#if tileCity}
			<div class="entity-section">
				<h5>City</h5>
				<button class="entity-card city" onclick={() => handleEntityClick(tileCity)}>
					<span class="entity-icon">🏛️</span>
					<div class="entity-info">
						<span class="entity-name">{tileCity.name}</span>
						<span class="entity-details">
							Pop: {tileCity.population} |
							{#if tileCity.isCapital}⭐ Capital{/if}
						</span>
					</div>
				</button>
			</div>
		{/if}

		<!-- Units on this tile -->
		{#if tileUnits.length > 0}
			<div class="entity-section">
				<h5>Units ({tileUnits.length})</h5>
				<ul class="entity-list">
					{#each tileUnits as unit (unit.id)}
						<li class="entity-card unit">
							<button class="entity-button" onclick={() => handleEntityClick(unit)}>
								<span class="entity-icon">{getUnitIcon(unit.unitType)}</span>
								<div class="entity-info">
									<span class="entity-name">{unit.name}</span>
									<span class="entity-details">
										HP: {unit.hitPoints}/{unit.maxHitPoints} |
										STR: {unit.combatStrength}
									</span>
								</div>
							</button>
							<!-- Unit actions -->
							<div class="unit-actions">
								{#if unit.unitType === UnitType.Settler}
									<button
										class="action-btn found-city"
										onclick={() => handleUnitAction(unit, 'foundCity')}
										title="Found City"
									>
										🏛️ Found City
									</button>
								{/if}
								{#if unit.unitType === UnitType.Worker}
									<button
										class="action-btn"
										onclick={() => handleUnitAction(unit, 'build')}
										title="Build Improvement"
									>
										🏗️ Build
									</button>
								{/if}
								{#if !unit.isFortified && unit.combatStrength > 0}
									<button
										class="action-btn"
										onclick={() => handleUnitAction(unit, 'fortify')}
										title="Fortify"
									>
										🛡️
									</button>
								{/if}
							</div>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<!-- No entities message -->
		{#if !tileCity && tileUnits.length === 0}
			<p class="no-entities">No entities on this tile</p>
		{/if}
	{/if}
</div>

<style>
	.tile-entity-panel {
		background: rgb(30 27 75 / 0.4);
		border-radius: 0.5rem;
		border: 2px solid rgb(34 197 94 / 0.3);
		padding: 0.75rem;
	}

	.no-tile,
	.no-entities {
		text-align: center;
		color: rgb(148 163 184);
		font-size: 0.875rem;
		margin: 0;
		padding: 1rem;
	}

	.tile-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid rgb(71 85 105 / 0.5);
	}

	.tile-coords {
		color: rgb(134 239 172);
		font-size: 0.875rem;
		font-weight: 600;
	}

	.entity-section {
		margin-bottom: 0.75rem;
	}

	.entity-section h5 {
		margin: 0 0 0.5rem 0;
		color: rgb(203 213 225);
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.entity-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.entity-card {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: rgb(15 23 42 / 0.6);
		border-radius: 0.375rem;
		border: 1px solid rgb(71 85 105 / 0.5);
		transition: all 0.2s;
	}

	.entity-card:hover {
		background: rgb(15 23 42 / 0.8);
		border-color: rgb(147 51 234 / 0.5);
	}

	button.entity-card {
		width: 100%;
		text-align: left;
		cursor: pointer;
		flex-direction: row;
	}

	.entity-button {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		width: 100%;
		text-align: left;
	}

	.entity-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
	}

	.entity-info {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		flex: 1;
	}

	.entity-name {
		color: rgb(226 232 240);
		font-weight: 600;
		font-size: 0.875rem;
	}

	.entity-details {
		color: rgb(148 163 184);
		font-size: 0.75rem;
	}

	.unit-actions {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		padding-top: 0.5rem;
		border-top: 1px solid rgb(71 85 105 / 0.3);
	}

	.action-btn {
		padding: 0.35rem 0.6rem;
		background: rgb(51 65 85);
		border: 1px solid rgb(71 85 105);
		border-radius: 0.25rem;
		color: rgb(203 213 225);
		font-size: 0.75rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.action-btn:hover {
		background: rgb(71 85 105);
		color: white;
	}

	.action-btn.found-city {
		background: linear-gradient(135deg, rgb(34 197 94), rgb(22 163 74));
		border-color: rgb(34 197 94);
		color: white;
		font-weight: 600;
	}

	.action-btn.found-city:hover {
		background: linear-gradient(135deg, rgb(22 163 74), rgb(21 128 61));
	}

	.entity-card.city {
		border-left: 3px solid rgb(250 204 21);
	}

	.entity-card.unit {
		border-left: 3px solid rgb(59 130 246);
	}
</style>
