<script lang="ts">
	import type { Nation } from '$lib/entities/location/nation';
	import { entityStore } from '$lib/stores/entityStore';
	import type { City } from '$lib/entities/location/city';
	import Section from '../shared/Section.svelte';
	import InfoGrid from '../shared/InfoGrid.svelte';
	import { EntityType } from '$lib/types/entity';

	interface Props {
		nation: Nation;
	}

	let { nation }: Props = $props();

	// Determine mode
	const isSimulationMode = $derived(nation.isSimulationGenerated);

	// Get capital city name
	function getCapitalName(): string {
		if (!nation.capitalCityId) return 'None';
		const city = entityStore.getEntity(nation.capitalCityId) as City;
		return city?.name || 'Unknown';
	}

	// RPG Mode Info
	const rpgInfo = $derived(
		isSimulationMode
			? []
			: [
					{ label: 'Name', value: nation.name },
					{ label: 'Adjective', value: nation.adjective || 'Unknown' },
					{ label: 'Government', value: nation.government || 'Unknown' },
					{ label: 'Population', value: nation.populationSize || 'Unknown' },
					{ label: 'Technology Level', value: nation.technologyLevel || 'Unknown' },
					{ label: 'Primary Resource', value: nation.primaryResource || 'Unknown' },
					{ label: 'Landscape', value: nation.landscape || 'Unknown' }
				]
	);

	// Simulation Mode Overview
	const simulationOverview = $derived(
		!isSimulationMode
			? []
			: [
					{ label: 'Name', value: nation.name },
					{ label: 'Adjective', value: nation.adjective },
					{ label: 'Race', value: nation.race || 'Unknown' },
					{ label: 'Founded', value: nation.foundingYear },
					{ label: 'Era', value: nation.currentEra },
					{ label: 'Leader', value: `${nation.leaderName} (${nation.leaderTitle})` },
					{ label: 'Government', value: nation.governmentType },
					{ label: 'Capital', value: getCapitalName() },
					{ label: 'Status', value: nation.isEliminated ? '💀 Eliminated' : '✓ Active' }
				]
	);

	// Resources & Yields
	const resourcesInfo = $derived(
		!isSimulationMode || !nation.resources
			? []
			: [
					{
						label: '💰 Gold',
						value: `${nation.resources.gold.toFixed(0)} (+${nation.yields.gold.toFixed(1)}/turn)`,
						valueClass: 'positive'
					},
					{
						label: '🔬 Science',
						value: `${nation.resources.science.toFixed(0)} (+${nation.yields.science.toFixed(1)}/turn)`,
						valueClass: 'positive'
					},
					{
						label: '🎭 Culture',
						value: `${nation.resources.culture.toFixed(0)} (+${nation.yields.culture.toFixed(1)}/turn)`,
						valueClass: 'positive'
					},
					{
						label: '😊 Happiness',
						value: `${nation.resources.happiness > 0 ? '+' : ''}${nation.resources.happiness.toFixed(0)}`,
						valueClass: nation.resources.happiness >= 0 ? 'positive' : 'negative'
					}
				]
	);

	// Culture Traits (as percentage bars)
	const cultureTraits = $derived(
		!isSimulationMode || !nation.cultureTraits
			? []
			: [
					{ label: '⚔️ Militaristic', value: nation.cultureTraits.militaristic },
					{ label: '🗺️ Expansionist', value: nation.cultureTraits.expansionist },
					{ label: '💼 Commercial', value: nation.cultureTraits.commercial },
					{ label: '🔬 Scientific', value: nation.cultureTraits.scientific },
					{ label: '⛵ Seafaring', value: nation.cultureTraits.seafaring },
					{ label: '🤝 Diplomatic', value: nation.cultureTraits.diplomatic }
				]
	);

	// Technology Info
	const techInfo = $derived(
		!isSimulationMode || !nation.techManager
			? null
			: {
					researched: nation.discoveredTechs?.length || 0,
					current: nation.currentResearch || 'None',
					progress: nation.researchProgress || 0,
					sciencePerTurn: nation.sciencePerTurn || 0
				}
	);

	// Policy Info
	const policyInfo = $derived(
		!isSimulationMode || !nation.policyManager
			? null
			: {
					unlocked: nation.unlockedPolicies?.length || 0,
					cultureStored: nation.policyManager.cultureStored || 0,
					canAfford: nation.policyManager.canAffordPolicy()
				}
	);

	// Territory Info
	const territoryInfo = $derived(
		!isSimulationMode
			? []
			: [
					{ label: 'Cities', value: nation.cityIds?.length || 0 },
					{ label: 'Territory Tiles', value: nation.territoryHexIds?.length || 0 },
					{ label: 'Total Population', value: nation.totalPopulation.toLocaleString() }
				]
	);

	// Military Info
	const militaryInfo = $derived(
		!isSimulationMode
			? []
			: [
					{ label: 'Units', value: nation.militaryUnits?.length || 0 },
					{
						label: 'Military Strength',
						value: nation.militaryStrength.toFixed(0),
						valueClass: 'positive'
					},
					{ label: 'Armies', value: nation.armies?.length || 0 },
					{ label: 'Fleets', value: nation.fleets?.length || 0 }
				]
	);

	// Diplomacy Summary
	const diplomacySummary = $derived(
		!isSimulationMode
			? []
			: [
					{ label: 'Allies', value: nation.alliedNations?.length || 0 },
					{ label: 'At War With', value: nation.atWarWith?.length || 0, valueClass: 'negative' },
					{ label: 'Trade Partners', value: nation.tradePartners?.length || 0 }
				]
	);

	// Cities list
	const cities = $derived.by(() => {
		if (!isSimulationMode || !nation.cityIds) return [];
		return nation.cityIds
			.map((id) => {
				const city = entityStore.getEntity(id) as City;
				return city
					? {
							id: city.id,
							name: city.name,
							population: city.population,
							isCapital: city.isCapital
						}
					: null;
			})
			.filter((c) => c !== null);
	});
</script>

{#if isSimulationMode}
	<!-- SIMULATION NATION VIEW -->
	<div class="nation-viewer simulation-mode">
		<!-- Overview Section -->
		<Section title="Overview">
			<InfoGrid items={simulationOverview} />
		</Section>

		<!-- Resources & Yields Section -->
		<Section title="Resources & Yields">
			<InfoGrid items={resourcesInfo} />
		</Section>

		<!-- Culture Traits Section -->
		<Section title="Culture Traits">
			<div class="culture-traits">
				{#each cultureTraits as trait (trait.label)}
					<div class="trait-item">
						<div class="trait-header">
							<span class="trait-label">{trait.label}</span>
							<span class="trait-value">{trait.value}</span>
						</div>
						<div class="trait-bar">
							<div class="trait-fill" style="width: {trait.value}%"></div>
						</div>
					</div>
				{/each}
			</div>
		</Section>

		<!-- Technology Section -->
		{#if techInfo}
			<Section title="Technology">
				<InfoGrid
					items={[
						{ label: 'Researched Techs', value: techInfo.researched },
						{ label: 'Current Research', value: techInfo.current },
						{
							label: 'Science/Turn',
							value: `+${techInfo.sciencePerTurn.toFixed(1)}`,
							valueClass: 'positive'
						}
					]}
				/>
				{#if techInfo.current !== 'None'}
					<div class="progress-section">
						<span class="progress-label">Research Progress</span>
						<div class="progress-bar">
							<div class="progress-fill" style="width: {(techInfo.progress / 100) * 100}%"></div>
						</div>
					</div>
				{/if}
			</Section>
		{/if}

		<!-- Social Policies Section -->
		{#if policyInfo}
			<Section title="Social Policies">
				<InfoGrid
					items={[
						{ label: 'Unlocked Policies', value: policyInfo.unlocked },
						{ label: 'Culture Stored', value: policyInfo.cultureStored.toFixed(0) },
						{
							label: 'Can Adopt',
							value: policyInfo.canAfford ? 'Yes' : 'No',
							valueClass: policyInfo.canAfford ? 'positive' : ''
						}
					]}
				/>
			</Section>
		{/if}

		<!-- Territory Section -->
		<Section title="Territory">
			<InfoGrid items={territoryInfo} />
		</Section>

		<!-- Cities Section -->
		{#if cities.length > 0}
			<Section title="Cities ({cities.length})">
				<ul class="cities-list">
					{#each cities as city (city.id)}
						<li class="city-item">
							<span class="city-name">
								{#if city.isCapital}⭐{/if}
								{city.name}
							</span>
							<span class="city-pop">Pop: {city.population}</span>
						</li>
					{/each}
				</ul>
			</Section>
		{/if}

		<!-- Military Section -->
		<Section title="Military">
			<InfoGrid items={militaryInfo} />
		</Section>

		<!-- Diplomacy Section -->
		<Section title="Diplomacy">
			<InfoGrid items={diplomacySummary} />
		</Section>

		<!-- Description -->
		{#if nation.description}
			<Section title="Description">
				<p class="description-text">{nation.description}</p>
			</Section>
		{/if}
	</div>
{:else}
	<!-- RPG NATION VIEW (Simple narrative) -->
	<div class="nation-viewer rpg-mode">
		<Section title="Nation Overview">
			<InfoGrid items={rpgInfo} />
		</Section>

		{#if nation.description}
			<Section title="Description">
				<p class="description-text">{nation.description}</p>
			</Section>
		{/if}
	</div>
{/if}

<style>
	.nation-viewer {
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

	/* Culture Traits Styling */
	.culture-traits {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.trait-item {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.trait-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.trait-label {
		font-size: 0.875rem;
		color: rgb(216 180 254);
		font-weight: 500;
	}

	.trait-value {
		font-size: 0.875rem;
		color: rgb(251 146 60);
		font-weight: 600;
	}

	.trait-bar {
		width: 100%;
		height: 8px;
		background: rgb(30 27 75 / 0.5);
		border-radius: 4px;
		overflow: hidden;
	}

	.trait-fill {
		height: 100%;
		background: linear-gradient(90deg, rgb(168 85 247), rgb(139 92 246));
		transition: width 0.3s ease;
	}

	/* Progress Bar */
	.progress-section {
		margin-top: 1rem;
	}

	.progress-label {
		display: block;
		font-size: 0.875rem;
		color: rgb(216 180 254);
		margin-bottom: 0.5rem;
	}

	.progress-bar {
		width: 100%;
		height: 12px;
		background: rgb(30 27 75 / 0.5);
		border-radius: 6px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, rgb(59 130 246), rgb(139 92 246));
		transition: width 0.3s ease;
	}

	/* Cities List */
	.cities-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.city-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem;
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.375rem;
		color: rgb(216 180 254);
		font-size: 0.875rem;
	}

	.city-name {
		font-weight: 600;
	}

	.city-pop {
		color: rgb(216 180 254 / 0.7);
	}
</style>
