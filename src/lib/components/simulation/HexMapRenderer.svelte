<script lang="ts">
	import type { RegionalHexTile } from '$lib/entities/location/regionalHexTile';
	import type { City } from '$lib/entities/location/city';
	import type { Unit } from '$lib/entities/military/unit';
	import { entityStore } from '$lib/stores/entityStore';
	import { AssetLoader } from '$lib/utils/assetLoader';

	interface Props {
		hexTiles: RegionalHexTile[];
		hexSize?: number;
		panX?: number;
		panY?: number;
		scale?: number;
		selectedHexId?: string;
		hoveredHexId?: string;
		onHexClick?: (tile: RegionalHexTile, event: MouseEvent) => void;
		onCityClick?: (city: City, event: MouseEvent) => void;
		onUnitClick?: (unit: Unit, event: MouseEvent) => void;
		showCities?: boolean;
		showUnits?: boolean;
		showBorders?: boolean;
		showLabels?: boolean;
	}

	let {
		hexTiles,
		hexSize = 30,
		panX = 0,
		panY = 0,
		scale = 1,
		selectedHexId,
		hoveredHexId,
		onHexClick,
		onCityClick,
		onUnitClick,
		showCities = true,
		showUnits = true,
		showBorders = true,
		showLabels = true
	}: Props = $props();

	// Terrain colors (fallback if assets not available)
	const terrainColors: Record<string, string> = {
		water: '#3b82f6',
		ocean: '#1e40af',
		grass: '#22c55e',
		grassland: '#22c55e',
		plains: '#a3e635',
		desert: '#fbbf24',
		tundra: '#cbd5e1',
		snow: '#f1f5f9',
		mountain: '#64748b',
		hill: '#94a3b8',
		coast: '#60a5fa'
	};

	// Nation colors (for borders)
	const nationColors = [
		'#ef4444',
		'#3b82f6',
		'#10b981',
		'#f59e0b',
		'#8b5cf6',
		'#ec4899',
		'#14b8a6',
		'#f97316'
	];

	// Get hex center point
	function getHexCenter(tile: RegionalHexTile, size: number): { x: number; y: number } {
		const width = size * 2;
		const height = Math.sqrt(3) * size;
		const x = tile.x * width * 0.75;
		const y = tile.y * height + (tile.x % 2) * (height / 2);
		return { x, y };
	}

	// Get hex corner points for polygon
	function getHexPoints(tile: RegionalHexTile, size: number): string {
		const center = getHexCenter(tile, size);
		const points: string[] = [];
		for (let i = 0; i < 6; i++) {
			const angle = (Math.PI / 3) * i;
			const x = center.x + size * Math.cos(angle);
			const y = center.y + size * Math.sin(angle);
			points.push(`${x},${y}`);
		}
		return points.join(' ');
	}

	// Get hex edge points for rivers
	function getHexEdgePoints(
		tile: RegionalHexTile,
		side: number,
		size: number
	): { x1: number; y1: number; x2: number; y2: number } {
		const center = getHexCenter(tile, size);
		const angle1 = (Math.PI / 3) * side;
		const angle2 = (Math.PI / 3) * ((side + 1) % 6);
		return {
			x1: center.x + size * Math.cos(angle1),
			y1: center.y + size * Math.sin(angle1),
			x2: center.x + size * Math.cos(angle2),
			y2: center.y + size * Math.sin(angle2)
		};
	}

	// Get resource label
	function getResourceLabel(tile: RegionalHexTile): string | null {
		if (tile.strategicResource && tile.strategicResource !== 'none') {
			return tile.strategicResource;
		}
		if (tile.luxuryResource && tile.luxuryResource !== 'none') {
			return tile.luxuryResource;
		}
		if (tile.bonusResource && tile.bonusResource !== 'none') {
			return tile.bonusResource;
		}
		return null;
	}

	// Get nation color by index
	function getNationColor(nationId: string): string {
		const hash = nationId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
		return nationColors[hash % nationColors.length];
	}

	// Get cities on the map
	const cities = $derived.by(() => {
		if (!showCities) return [];
		return hexTiles
			.filter((tile) => tile.hasCity && tile.cityId)
			.map((tile) => {
				const city = entityStore.getEntity(tile.cityId!) as City;
				return city ? { city, tile } : null;
			})
			.filter((c) => c !== null);
	});

	// Get units on the map
	const units = $derived.by(() => {
		if (!showUnits) return [];
		const allUnits: Array<{ unit: Unit; tile: RegionalHexTile }> = [];
		hexTiles.forEach((tile) => {
			if (tile.hasUnit && tile.unitIds && tile.unitIds.length > 0) {
				tile.unitIds.forEach((unitId) => {
					const unit = entityStore.getEntity(unitId) as Unit;
					if (unit) {
						allUnits.push({ unit, tile });
					}
				});
			}
		});
		return allUnits;
	});

	// Get city size category for sprite
	function getCitySizeCategory(population: number): string {
		if (population >= 20) return 'huge';
		if (population >= 10) return 'large';
		if (population >= 5) return 'medium';
		return 'small';
	}

	// Handle hex click
	function handleHexClick(tile: RegionalHexTile, event: MouseEvent) {
		event.stopPropagation();
		onHexClick?.(tile, event);
	}

	// Handle hex key press
	function handleHexKeydown(tile: RegionalHexTile, event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onHexClick?.(tile, event as any);
		}
	}

	// Handle city click
	function handleCityClick(city: City, event: MouseEvent) {
		event.stopPropagation();
		onCityClick?.(city, event);
	}

	// Handle city key press
	function handleCityKeydown(city: City, event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onCityClick?.(city, event as any);
		}
	}

	// Handle unit click
	function handleUnitClick(unit: Unit, event: MouseEvent) {
		event.stopPropagation();
		onUnitClick?.(unit, event);
	}

	// Handle unit key press
	function handleUnitKeydown(unit: Unit, event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onUnitClick?.(unit, event as any);
		}
	}
</script>

<g
	style="transform: translate({panX}px, {panY}px) scale({scale}); transition: transform 0.1s ease-out;"
>
	<!-- Layer 1: TERRAIN (Base layer) -->
	<g id="terrain-layer">
		{#each hexTiles as tile (tile.id)}
			{@const center = getHexCenter(tile, hexSize)}
			{@const terrainAsset = AssetLoader.getTerrainAsset(tile.terrainType)}
			{@const size = hexSize * 2.2}

			{#if terrainAsset}
				<!-- Terrain image -->
				<image
					x={center.x - size / 2}
					y={center.y - size / 2}
					width={size}
					height={size}
					href={terrainAsset}
					class="terrain-tile clickable"
					role="button"
					tabindex="0"
					onclick={(e) => handleHexClick(tile, e)}
					onkeydown={(e) => handleHexKeydown(tile, e)}
				/>
			{:else}
				<!-- Fallback colored hex -->
				{@const color = terrainColors[tile.terrainType.toLowerCase()] || '#64748b'}
				<polygon
					points={getHexPoints(tile, hexSize)}
					fill={color}
					stroke="#334155"
					stroke-width="0.5"
					class="terrain-tile clickable"
					role="button"
					tabindex="0"
					onclick={(e) => handleHexClick(tile, e)}
					onkeydown={(e) => handleHexKeydown(tile, e)}
				/>
			{/if}
		{/each}
	</g>

	<!-- Layer 2: FEATURES (Forests, Jungles, Marshes, etc.) -->
	<g id="features-layer">
		{#each hexTiles as tile (tile.id)}
			{#if tile.feature}
				{@const center = getHexCenter(tile, hexSize)}
				{@const featureAsset = AssetLoader.getFeatureAsset(tile.feature)}
				{@const size = hexSize * 2.2}

				{#if featureAsset}
					<!-- Feature sprite overlay -->
					<image
						x={center.x - size / 2}
						y={center.y - size / 2}
						width={size}
						height={size}
						href={featureAsset}
						opacity="0.9"
						pointer-events="none"
					/>
				{:else}
					<!-- Fallback: Single letter -->
					<text
						x={center.x}
						y={center.y - 3}
						text-anchor="middle"
						font-size="8"
						fill="#ffffff"
						opacity="0.9"
						pointer-events="none"
						style="text-shadow: 0 0 2px #000;"
					>
						{tile.feature.charAt(0).toUpperCase()}
					</text>
				{/if}
			{/if}
		{/each}
	</g>

	<!-- Layer 2.5: RIVERS (Blue lines on hex edges) -->
	<g id="rivers-layer">
		{#each hexTiles as tile (tile.id)}
			{#if tile.hasRiver && tile.riverSides}
				{#each tile.riverSides as side (side)}
					{@const riverPoints = getHexEdgePoints(tile, side, hexSize)}
					<line
						x1={riverPoints.x1}
						y1={riverPoints.y1}
						x2={riverPoints.x2}
						y2={riverPoints.y2}
						stroke="#60a5fa"
						stroke-width="2"
						stroke-linecap="round"
						opacity="0.8"
						pointer-events="none"
					/>
				{/each}
			{/if}
		{/each}
	</g>

	<!-- Layer 3: RESOURCES (Strategic, Luxury, Bonus) -->
	<g id="resources-layer">
		{#each hexTiles as tile (tile.id)}
			{@const resourceLabel = getResourceLabel(tile)}
			{#if resourceLabel}
				{@const center = getHexCenter(tile, hexSize)}
				{@const resourceAsset = AssetLoader.getResourceAsset(resourceLabel)}
				{@const iconSize = hexSize * 1.2}

				{#if resourceAsset}
					<!-- Resource icon -->
					<image
						x={center.x - iconSize / 2}
						y={center.y - iconSize / 2}
						width={iconSize}
						height={iconSize}
						href={resourceAsset}
						pointer-events="none"
					/>
				{:else}
					<!-- Fallback: Text label -->
					<text
						x={center.x}
						y={center.y + 5}
						text-anchor="middle"
						font-size="6"
						fill="#fbbf24"
						font-weight="bold"
						opacity="0.95"
						pointer-events="none"
						style="text-shadow: 0 0 3px #000;"
					>
						{resourceLabel.substring(0, 3).toUpperCase()}
					</text>
				{/if}
			{/if}
		{/each}
	</g>

	<!-- Layer 4: IMPROVEMENTS (Farms, Mines, Roads, etc.) -->
	<g id="improvements-layer">
		{#each hexTiles as tile (tile.id)}
			{#if tile.improvement && tile.improvement !== 'none'}
				{@const center = getHexCenter(tile, hexSize)}
				<!-- For now, show text indicator - we can add improvement sprites later -->
				<text
					x={center.x}
					y={center.y - 8}
					text-anchor="middle"
					font-size="7"
					fill="#10b981"
					font-weight="bold"
					opacity="0.9"
					pointer-events="none"
					style="text-shadow: 0 0 3px #000;"
				>
					{tile.improvement.substring(0, 1).toUpperCase()}
				</text>
			{/if}
		{/each}
	</g>

	<!-- Layer 5: NATION BORDERS (30% opacity colored overlays) -->
	{#if showBorders}
		<g id="borders-layer" style="opacity: 0.3">
			{#each hexTiles as tile (tile.id)}
				{#if tile.ownerNationId}
					<polygon
						points={getHexPoints(tile, hexSize)}
						fill={getNationColor(tile.ownerNationId)}
						stroke={getNationColor(tile.ownerNationId)}
						stroke-width="2"
						pointer-events="none"
					/>
				{/if}
			{/each}
		</g>
	{/if}

	<!-- Layer 6: CITIES (City sprites + labels) -->
	{#if showCities}
		<g id="cities-layer">
			{#each cities as { city, tile } (city.id)}
				{@const center = getHexCenter(tile, hexSize)}
				{@const citySize = getCitySizeCategory(city.population)}
				{@const iconSize = hexSize * 1.8}

				<!-- City icon (placeholder - we'll use a simple circle for now) -->
				<g
					role="button"
					tabindex="0"
					onclick={(e) => handleCityClick(city, e)}
					onkeydown={(e) => handleCityKeydown(city, e)}
					style="cursor: pointer"
				>
					<!-- City base -->
					<circle
						cx={center.x}
						cy={center.y}
						r={hexSize * 0.6}
						fill={city.ownerNationId ? getNationColor(city.ownerNationId) : '#94a3b8'}
						stroke="#ffffff"
						stroke-width="2"
					/>

					<!-- Capital star -->
					{#if city.isCapital}
						<text
							x={center.x}
							y={center.y - hexSize * 0.8}
							text-anchor="middle"
							font-size={hexSize * 0.8}
							fill="#fbbf24"
							style="text-shadow: 0 0 3px #000;"
							pointer-events="none"
						>
							⭐
						</text>
					{/if}

					<!-- Population indicator -->
					<text
						x={center.x}
						y={center.y + 4}
						text-anchor="middle"
						font-size="10"
						fill="#ffffff"
						font-weight="bold"
						pointer-events="none"
					>
						{city.population}
					</text>

					<!-- City name label -->
					{#if showLabels}
						<text
							x={center.x}
							y={center.y + hexSize + 12}
							text-anchor="middle"
							fill="#ffffff"
							stroke="#000000"
							stroke-width="3"
							paint-order="stroke"
							style="font-size: 12px; font-weight: 600; cursor: pointer;"
						>
							{city.name}
						</text>
					{/if}
				</g>
			{/each}
		</g>
	{/if}

	<!-- Layer 7: UNITS (Unit sprites + health bars) -->
	{#if showUnits}
		<g id="units-layer">
			{#each units as { unit, tile } (unit.id)}
				{@const center = getHexCenter(tile, hexSize)}
				{@const unitSize = hexSize * 0.8}

				<g
					role="button"
					tabindex="0"
					onclick={(e) => handleUnitClick(unit, e)}
					onkeydown={(e) => handleUnitKeydown(unit, e)}
					style="cursor: pointer"
				>
					<!-- Unit icon (placeholder - simple square for now) -->
					<rect
						x={center.x - unitSize / 2}
						y={center.y - unitSize / 2}
						width={unitSize}
						height={unitSize}
						fill={unit.ownerNationId ? getNationColor(unit.ownerNationId) : '#64748b'}
						stroke="#ffffff"
						stroke-width="1.5"
						rx="2"
					/>

					<!-- Unit type indicator -->
					<text
						x={center.x}
						y={center.y + 3}
						text-anchor="middle"
						font-size="8"
						fill="#ffffff"
						font-weight="bold"
						pointer-events="none"
					>
						{unit.unitType?.substring(0, 1).toUpperCase() || 'U'}
					</text>

					<!-- Health bar -->
					{#if unit.health < unit.maxHealth}
						{@const healthPercent = (unit.health / unit.maxHealth) * 100}
						{@const barWidth = unitSize}
						{@const barHeight = 3}
						<!-- Background -->
						<rect
							x={center.x - barWidth / 2}
							y={center.y + unitSize / 2 + 2}
							width={barWidth}
							height={barHeight}
							fill="#7f1d1d"
							rx="1"
						/>
						<!-- Health fill -->
						<rect
							x={center.x - barWidth / 2}
							y={center.y + unitSize / 2 + 2}
							width={(barWidth * healthPercent) / 100}
							height={barHeight}
							fill={healthPercent > 50 ? '#22c55e' : healthPercent > 25 ? '#f59e0b' : '#ef4444'}
							rx="1"
						/>
					{/if}
				</g>
			{/each}
		</g>
	{/if}

	<!-- Layer 8: SELECTION HIGHLIGHT -->
	<g id="selection-layer">
		{#if selectedHexId}
			{@const selectedTile = hexTiles.find((t) => t.id === selectedHexId)}
			{#if selectedTile}
				<polygon
					points={getHexPoints(selectedTile, hexSize)}
					fill="none"
					stroke="#fbbf24"
					stroke-width="3"
					pointer-events="none"
				/>
			{/if}
		{/if}
	</g>

	<!-- Layer 9: HOVER HIGHLIGHT -->
	<g id="hover-layer">
		{#if hoveredHexId && hoveredHexId !== selectedHexId}
			{@const hoveredTile = hexTiles.find((t) => t.id === hoveredHexId)}
			{#if hoveredTile}
				<polygon
					points={getHexPoints(hoveredTile, hexSize)}
					fill="none"
					stroke="#ffffff"
					stroke-width="2"
					opacity="0.6"
					pointer-events="none"
				/>
			{/if}
		{/if}
	</g>
</g>

<style>
	.clickable {
		cursor: pointer;
	}

	.terrain-tile:hover {
		opacity: 0.9;
	}
</style>
