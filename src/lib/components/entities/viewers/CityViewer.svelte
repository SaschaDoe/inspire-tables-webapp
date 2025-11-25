<script lang="ts">
	import type { City } from '$lib/entities/location/city';
	import { entityStore } from '$lib/stores/entityStore';
	import type { Nation } from '$lib/entities/location/nation';
	import Section from '../shared/Section.svelte';
	import InfoGrid from '../shared/InfoGrid.svelte';
	import { EntityType } from '$lib/types/entity';

	interface Props {
		city: City;
	}

	let { city }: Props = $props();

	// Determine mode
	const isSimulationMode = $derived(city.isSimulationGenerated);

	// Get nation name for simulation mode
	function getNationName(nationId: string): string {
		if (!nationId) return 'Independent';
		const nation = entityStore.getEntity(nationId) as Nation;
		return nation?.name || 'Unknown Nation';
	}

	// RPG Mode Info
	const rpgInfo = $derived(
		isSimulationMode
			? []
			: [
					{ label: 'Name', value: city.name },
					{ label: 'Size', value: city.size || 'Unknown' },
					{ label: 'Fame', value: city.fame || 'Unknown' },
					{ label: 'Population', value: city.population.toLocaleString() }
				]
	);

	// Simulation Mode Overview
	const simulationOverview = $derived(
		!isSimulationMode
			? []
			: [
					{ label: 'Name', value: city.name },
					{ label: 'Owner', value: getNationName(city.ownerNationId) },
					{ label: 'Founded', value: city.foundedYear },
					{ label: 'Population', value: city.population },
					{ label: 'Capital', value: city.isCapital ? '⭐ Yes' : 'No' }
				]
	);

	// Simulation Mode Yields
	const yieldsInfo = $derived(
		!isSimulationMode || !city.yields
			? []
			: [
					{ label: '🌾 Food', value: `+${city.yields.food.toFixed(1)}`, valueClass: 'positive' },
					{
						label: '⚙️ Production',
						value: `+${city.yields.production.toFixed(1)}`,
						valueClass: 'positive'
					},
					{ label: '💰 Gold', value: `+${city.yields.gold.toFixed(1)}`, valueClass: 'positive' },
					{
						label: '🔬 Science',
						value: `+${city.yields.science.toFixed(1)}`,
						valueClass: 'positive'
					},
					{
						label: '🎭 Culture',
						value: `+${city.yields.culture.toFixed(1)}`,
						valueClass: 'positive'
					}
				]
	);

	// Population Manager Info
	const populationInfo = $derived(
		!isSimulationMode || !city.populationManager
			? []
			: [
					{ label: 'Food Stored', value: `${city.populationManager.foodStored.toFixed(1)}` },
					{
						label: 'Food Required',
						value: `${city.populationManager.foodRequiredForNextPop.toFixed(1)}`
					},
					{
						label: 'Turns to Grow',
						value:
							city.yields?.food > 0
								? Math.ceil(
										(city.populationManager.foodRequiredForNextPop -
											city.populationManager.foodStored) /
											city.yields.food
									)
								: '∞'
					},
					{ label: 'Growth Rate', value: city.populationManager.growthRate }
				]
	);

	// Production Manager Info
	const productionInfo = $derived(
		!isSimulationMode || !city.productionManager || !city.productionManager.currentProduction
			? null
			: {
					name: city.productionManager.currentProduction.itemName,
					progress: city.productionManager.currentProduction.productionProgress,
					cost: city.productionManager.currentProduction.productionCost,
					turnsRemaining: city.productionManager.currentProduction.turnsRemaining,
					type: city.productionManager.currentProduction.type
				}
	);

	// Buildings list
	const buildings = $derived(
		!isSimulationMode || !city.buildings ? [] : city.buildings.map((b) => b.toString())
	);

	// Territory Info
	const territoryInfo = $derived(
		!isSimulationMode || !city.expansionManager
			? []
			: [
					{ label: 'Owned Tiles', value: city.ownedHexTileIds?.length || 0 },
					{ label: 'Worked Tiles', value: city.workedHexTileIds?.length || 0 },
					{
						label: 'Culture Stored',
						value: `${city.expansionManager.cultureStored.toFixed(1)}`
					},
					{
						label: 'Culture Required',
						value: `${city.expansionManager.cultureRequiredForNextTile.toFixed(1)}`
					}
				]
	);

	// Combat Info
	const combatInfo = $derived(
		!isSimulationMode
			? []
			: [
					{ label: 'Hit Points', value: `${city.hitPoints} / ${city.maxHitPoints}` },
					{ label: 'Combat Strength', value: city.combatStrength },
					{ label: 'Ranged Strength', value: city.rangedStrength || 'None' },
					{ label: 'Garrisoned Units', value: city.garrisonedUnitIds?.length || 0 }
				]
	);
</script>

{#if isSimulationMode}
	<!-- SIMULATION CITY VIEW -->
	<div class="city-viewer simulation-mode">
		<!-- Overview Section -->
		<Section title="Overview">
			<InfoGrid items={simulationOverview} />
		</Section>

		<!-- Yields Section -->
		<Section title="Yields">
			<InfoGrid items={yieldsInfo} />
		</Section>

		<!-- Population Section -->
		{#if city.populationManager}
			<Section title="Population Growth">
				<InfoGrid items={populationInfo} />
				<div class="progress-bar">
					<div
						class="progress-fill"
						style="width: {(city.populationManager.foodStored /
							city.populationManager.foodRequiredForNextPop) *
							100}%"
					></div>
				</div>
			</Section>
		{/if}

		<!-- Production Section -->
		{#if productionInfo}
			<Section title="Production">
				<div class="production-display">
					<div class="production-item">
						<span class="production-type">{productionInfo.type.toUpperCase()}</span>
						<span class="production-name">{productionInfo.name}</span>
						<div class="production-progress">
							<span class="progress-text">
								{productionInfo.progress.toFixed(0)} / {productionInfo.cost} ⚙️
								<span class="turns-remaining">({productionInfo.turnsRemaining} turns)</span>
							</span>
							<div class="progress-bar">
								<div
									class="progress-fill production"
									style="width: {(productionInfo.progress / productionInfo.cost) * 100}%"
								></div>
							</div>
						</div>
					</div>
				</div>
			</Section>
		{:else}
			<Section title="Production">
				<p class="no-production">No production queue</p>
			</Section>
		{/if}

		<!-- Buildings Section -->
		{#if buildings.length > 0}
			<Section title="Buildings ({buildings.length})">
				<ul class="buildings-list">
					{#each buildings as building (building)}
						<li class="building-item">{building}</li>
					{/each}
				</ul>
			</Section>
		{/if}

		<!-- Territory Section -->
		<Section title="Territory">
			<InfoGrid items={territoryInfo} />
		</Section>

		<!-- Combat Section -->
		<Section title="Defense">
			<InfoGrid items={combatInfo} />
		</Section>

		<!-- Description -->
		{#if city.description}
			<Section title="Description">
				<p class="description-text">{city.description}</p>
			</Section>
		{/if}
	</div>
{:else}
	<!-- RPG CITY VIEW (Simple Settlement-style) -->
	<div class="city-viewer rpg-mode">
		<Section title="Settlement Overview">
			<InfoGrid items={rpgInfo} />
		</Section>

		{#if city.rpgDescription || city.description}
			<Section title="Description">
				<p class="description-text">{city.rpgDescription || city.description}</p>
			</Section>
		{/if}

		{#if city.rpgEvents && city.rpgEvents.length > 0}
			<Section title="Recent Events">
				<ul class="event-list">
					{#each city.rpgEvents as event, index (index)}
						<li class="event-item">{event}</li>
					{/each}
				</ul>
			</Section>
		{/if}
	</div>
{/if}

<style>
	.city-viewer {
		padding: 0;
	}

	/* RPG Mode Styling */
	.event-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.event-item {
		padding: 0.75rem;
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.375rem;
		color: rgb(216 180 254);
		font-size: 0.875rem;
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

	/* Simulation Mode Styling */
	.progress-bar {
		width: 100%;
		height: 12px;
		background: rgb(30 27 75 / 0.5);
		border-radius: 6px;
		overflow: hidden;
		margin-top: 0.5rem;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, rgb(34 197 94), rgb(22 163 74));
		transition: width 0.3s ease;
	}

	.progress-fill.production {
		background: linear-gradient(90deg, rgb(251 146 60), rgb(249 115 22));
	}

	.production-display {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.production-item {
		padding: 1rem;
		background: rgb(30 27 75 / 0.4);
		border: 1px solid rgb(168 85 247 / 0.3);
		border-radius: 0.5rem;
	}

	.production-type {
		display: inline-block;
		padding: 0.25rem 0.5rem;
		background: rgb(168 85 247 / 0.3);
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: 600;
		color: rgb(216 180 254);
		margin-bottom: 0.5rem;
	}

	.production-name {
		display: block;
		font-size: 1rem;
		font-weight: 600;
		color: white;
		margin-bottom: 0.75rem;
	}

	.production-progress {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.progress-text {
		display: flex;
		justify-content: space-between;
		font-size: 0.875rem;
		color: rgb(216 180 254);
	}

	.turns-remaining {
		color: rgb(216 180 254 / 0.7);
		font-style: italic;
	}

	.no-production {
		padding: 1rem;
		background: rgb(30 27 75 / 0.3);
		border-radius: 0.5rem;
		color: rgb(216 180 254 / 0.6);
		font-style: italic;
		text-align: center;
		margin: 0;
	}

	.buildings-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 0.5rem;
	}

	.building-item {
		padding: 0.5rem 0.75rem;
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.375rem;
		color: rgb(216 180 254);
		font-size: 0.875rem;
		text-align: center;
	}
</style>
