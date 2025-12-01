import { Container, Graphics, Text, TextStyle, Sprite, Assets, Texture } from 'pixi.js';
import type { Nation } from '$lib/entities/location/nation';
import type { City } from '$lib/entities/location/city';
import type { Unit } from '$lib/entities/military/unit';
import { hexToPixel, getRegionalHexCenter, type Point } from './HexGeometry';
import {
	PLANETARY_HEX_SIZE,
	REGIONAL_GRID_SIZE,
	REGIONAL_ZOOM_START,
	REGIONAL_ZOOM_FULL
} from './constants';

// Asset paths
const SETTLER_SPRITE_PATH = '/civ5-assets/units/Settler.png';
const CITY_SPRITE_PATH = '/civ5-assets/cities/City center-Ancient era.png';

/**
 * Unit position information
 */
interface UnitInfo {
	nation: Nation;
	globalX: number;
	globalY: number;
	centerX: number;
	centerY: number;
	color: number;
}

/**
 * City position information
 */
interface CityInfo {
	city: City;
	globalX: number;
	globalY: number;
	centerX: number;
	centerY: number;
	color: number;
}

/**
 * Generic unit position info
 */
interface GenericUnitInfo {
	unit: Unit;
	globalX: number;
	globalY: number;
	centerX: number;
	centerY: number;
	color: number;
}

/**
 * Predefined nation colors
 */
const NATION_COLORS = [
	0xe74c3c, // Red
	0x3498db, // Blue
	0x2ecc71, // Green
	0xf39c12, // Orange
	0x9b59b6, // Purple
	0x1abc9c, // Teal
	0xe91e63, // Pink
	0x00bcd4, // Cyan
	0xff9800, // Amber
	0x795548 // Brown
];

/**
 * Renders units (settlers, cities) on the hex map
 */
export class UnitLayer {
	container: Container;
	private hexSize: number;
	private gridSize: number;
	private units: Map<string, UnitInfo> = new Map();
	private unitGraphics: Map<string, Container> = new Map();
	private cities: Map<string, CityInfo> = new Map();
	private cityGraphics: Map<string, Container> = new Map();
	private genericUnits: Map<string, GenericUnitInfo> = new Map();
	private genericUnitGraphics: Map<string, Container> = new Map();
	private currentZoom = 1;
	private settlerTexture: Texture | null = null;
	private cityTexture: Texture | null = null;
	private textureLoading = false;
	private nationColors: Map<string, number> = new Map();

	constructor(hexSize: number, gridSize: number = REGIONAL_GRID_SIZE) {
		this.container = new Container();
		this.container.eventMode = 'passive';
		this.hexSize = hexSize;
		this.gridSize = gridSize;

		// Load settler texture
		this.loadTextures();
	}

	/**
	 * Load unit textures
	 */
	private async loadTextures(): Promise<void> {
		if (this.textureLoading) return;
		this.textureLoading = true;

		try {
			// Load settler texture
			this.settlerTexture = await Assets.load(SETTLER_SPRITE_PATH);
			console.log('[UnitLayer] Settler texture loaded successfully');
		} catch (error) {
			console.warn('[UnitLayer] Failed to load settler texture, using fallback:', error);
			this.settlerTexture = null;
		}

		try {
			// Load city texture
			this.cityTexture = await Assets.load(CITY_SPRITE_PATH);
			console.log('[UnitLayer] City texture loaded successfully');
		} catch (error) {
			console.warn('[UnitLayer] Failed to load city texture, using fallback:', error);
			this.cityTexture = null;
		}

		// Recreate existing graphics with loaded textures
		this.recreateAllGraphics();
	}

	/**
	 * Recreate all unit graphics (called after textures load)
	 */
	private recreateAllGraphics(): void {
		// Recreate settler graphics
		for (const [nationId, info] of this.units) {
			const oldGraphic = this.unitGraphics.get(nationId);
			if (oldGraphic) {
				this.container.removeChild(oldGraphic);
				oldGraphic.destroy();
			}
			this.createUnitGraphic(info);
		}

		// Recreate city graphics
		for (const [cityId, info] of this.cities) {
			const oldGraphic = this.cityGraphics.get(cityId);
			if (oldGraphic) {
				this.container.removeChild(oldGraphic);
				oldGraphic.destroy();
			}
			this.createCityGraphic(info);
		}
	}

	/**
	 * Update nations to display
	 */
	updateNations(nations: Nation[]): void {
		console.log('[UnitLayer] updateNations called with', nations.length, 'nations');

		// Clear existing units
		this.units.clear();
		for (const graphic of this.unitGraphics.values()) {
			this.container.removeChild(graphic);
			graphic.destroy();
		}
		this.unitGraphics.clear();

		// Add new units for nations that have starting positions
		nations.forEach((nation, index) => {
			console.log(`[UnitLayer] Nation ${index}: ${nation.name}`, {
				startingHexX: nation.startingHexX,
				startingHexY: nation.startingHexY,
				hasFoundedFirstCity: nation.hasFoundedFirstCity
			});
			if (nation.startingHexX !== undefined && nation.startingHexY !== undefined && !nation.hasFoundedFirstCity) {
				const color = NATION_COLORS[index % NATION_COLORS.length];
				const globalX = nation.startingHexX;
				const globalY = nation.startingHexY;

				// Calculate planetary hex coordinates
				const px = Math.floor(globalX / this.gridSize);
				const py = Math.floor(globalY / this.gridSize);

				// Calculate regional hex coordinates within the planetary hex
				const rx = globalX % this.gridSize;
				const ry = globalY % this.gridSize;

				// Get planetary hex center
				const planetaryCenter = hexToPixel(px, py, this.hexSize);

				// Get regional hex center
				const center = getRegionalHexCenter(
					planetaryCenter,
					rx,
					ry,
					this.hexSize,
					this.gridSize
				);

				console.log(`[UnitLayer] Creating settler for ${nation.name} at global (${globalX}, ${globalY}), planetary (${px}, ${py}), regional (${rx}, ${ry}), pixel (${center.x.toFixed(1)}, ${center.y.toFixed(1)})`);

				const unitInfo: UnitInfo = {
					nation,
					globalX,
					globalY,
					centerX: center.x,
					centerY: center.y,
					color
				};

				this.units.set(nation.id, unitInfo);
				this.createUnitGraphic(unitInfo);
			} else {
				console.log(`[UnitLayer] Skipping nation ${nation.name}: startingHexX=${nation.startingHexX}, startingHexY=${nation.startingHexY}, hasFoundedFirstCity=${nation.hasFoundedFirstCity}`);
			}
		});
	}

	/**
	 * Create graphic for a unit (settler)
	 */
	private createUnitGraphic(info: UnitInfo): void {
		const unitContainer = new Container();
		unitContainer.x = info.centerX;
		unitContainer.y = info.centerY;

		// Settler slightly larger than 1 regional hex
		const regionalHexSize = this.hexSize / this.gridSize; // 80/10 = 8
		const spriteSize = regionalHexSize * 1.4; // Bigger sprite

		// Use settler sprite if loaded, otherwise draw fallback
		if (this.settlerTexture) {
			const sprite = new Sprite(this.settlerTexture);
			sprite.anchor.set(0.5, 0.5);
			const spriteScale = spriteSize / Math.max(sprite.width, sprite.height);
			sprite.scale.set(spriteScale);
			unitContainer.addChild(sprite);
		} else {
			// Fallback: colored circle
			const graphics = new Graphics();
			graphics.circle(0, 0, spriteSize * 0.4);
			graphics.fill({ color: info.color });
			unitContainer.addChild(graphics);
		}

		// No label - just the sprite

		this.container.addChild(unitContainer);
		this.unitGraphics.set(info.nation.id, unitContainer);
	}

	/**
	 * Update visibility based on zoom level
	 */
	updateZoom(zoom: number): void {
		this.currentZoom = zoom;

		// Show units at all zoom levels with constant scale
		// The settler is drawn at a fixed world size, so it naturally scales with zoom
		for (const [nationId, graphic] of this.unitGraphics) {
			const info = this.units.get(nationId);
			if (!info) continue;

			// Always show units
			graphic.visible = true;

			// Keep constant scale - let the world zoom handle sizing
			// At low zoom, make settler larger so it's visible on planetary view
			if (zoom < REGIONAL_ZOOM_START) {
				// Before regional view - show larger marker for visibility
				graphic.scale.set(3.0 / zoom);
			} else {
				// Regional view and beyond - constant size, settler fills hex nicely
				graphic.scale.set(1.0);
			}
		}

		// Apply same logic to cities (smaller scale than before)
		for (const [cityId, graphic] of this.cityGraphics) {
			graphic.visible = true;
			if (zoom < REGIONAL_ZOOM_START) {
				// Smaller scale for planetary view
				graphic.scale.set(1.5 / zoom);
			} else {
				// Constant size in regional view
				graphic.scale.set(1.0);
			}

			// Show labels only when zoomed in to regional view or beyond
			const labelContainer = graphic.getChildByName('labelContainer');
			if (labelContainer) {
				labelContainer.visible = zoom >= REGIONAL_ZOOM_START;
			}
		}

		// Apply same logic to generic units
		for (const [unitId, graphic] of this.genericUnitGraphics) {
			graphic.visible = true;
			if (zoom < REGIONAL_ZOOM_START) {
				graphic.scale.set(3.0 / zoom);
			} else {
				graphic.scale.set(1.0);
			}
		}
	}

	/**
	 * Update cities to display
	 */
	updateCities(cities: City[]): void {
		console.log('[UnitLayer] updateCities called with', cities.length, 'cities');

		// Clear existing city graphics
		for (const graphic of this.cityGraphics.values()) {
			this.container.removeChild(graphic);
			graphic.destroy();
		}
		this.cityGraphics.clear();
		this.cities.clear();

		// Add city graphics
		cities.forEach((city, index) => {
			if (city.coordinates) {
				const globalX = city.coordinates.x;
				const globalY = city.coordinates.y;

				// Calculate position
				const px = Math.floor(globalX / this.gridSize);
				const py = Math.floor(globalY / this.gridSize);
				const rx = globalX % this.gridSize;
				const ry = globalY % this.gridSize;

				const planetaryCenter = hexToPixel(px, py, this.hexSize);
				const center = getRegionalHexCenter(
					planetaryCenter,
					rx,
					ry,
					this.hexSize,
					this.gridSize
				);

				// Get nation color or use default
				const color = this.nationColors.get(city.ownerNationId) || NATION_COLORS[index % NATION_COLORS.length];

				const cityInfo: CityInfo = {
					city,
					globalX,
					globalY,
					centerX: center.x,
					centerY: center.y,
					color
				};

				this.cities.set(city.id, cityInfo);
				this.createCityGraphic(cityInfo);

				console.log(`[UnitLayer] Created city graphic for ${city.name} at (${globalX}, ${globalY})`);
			}
		});
	}

	/**
	 * Create graphic for a city
	 */
	private createCityGraphic(info: CityInfo): void {
		const cityContainer = new Container();
		cityContainer.x = info.centerX;
		cityContainer.y = info.centerY;

		const regionalHexSize = this.hexSize / this.gridSize;
		const spriteSize = regionalHexSize * 1.5; // City sprite size

		// Use city texture if loaded, otherwise draw fallback
		if (this.cityTexture) {
			const sprite = new Sprite(this.cityTexture);
			sprite.anchor.set(0.5, 0.5);
			const spriteScale = spriteSize / Math.max(sprite.width, sprite.height);
			sprite.scale.set(spriteScale);
			cityContainer.addChild(sprite);
		} else {
			// Fallback: simple colored square with roof (house shape)
			const graphics = new Graphics();
			const size = spriteSize * 0.6;

			// House body
			graphics.rect(-size * 0.4, -size * 0.2, size * 0.8, size * 0.5);
			graphics.fill({ color: info.color });

			// Roof
			graphics.moveTo(-size * 0.5, -size * 0.2);
			graphics.lineTo(0, -size * 0.5);
			graphics.lineTo(size * 0.5, -size * 0.2);
			graphics.fill({ color: info.color });

			graphics.stroke({ color: 0xffffff, width: 1 });
			cityContainer.addChild(graphics);
		}

		// Create a separate container for labels (so we can control visibility independently)
		const labelContainer = new Container();
		labelContainer.name = 'labelContainer';

		// City name label
		const style = new TextStyle({
			fontFamily: 'Arial',
			fontSize: regionalHexSize * 0.6,
			fill: 0xffffff,
			stroke: { color: 0x000000, width: 2 },
			align: 'center'
		});
		const label = new Text({ text: info.city.name, style });
		label.anchor.set(0.5, 0);
		label.y = spriteSize * 0.5;
		labelContainer.addChild(label);

		// Population indicator (small number below name)
		const popStyle = new TextStyle({
			fontFamily: 'Arial',
			fontSize: regionalHexSize * 0.4,
			fill: 0xffd700,
			stroke: { color: 0x000000, width: 1 },
			align: 'center'
		});
		const popLabel = new Text({ text: `Pop: ${info.city.population}`, style: popStyle });
		popLabel.anchor.set(0.5, 0);
		popLabel.y = spriteSize * 0.5 + regionalHexSize * 0.7;
		labelContainer.addChild(popLabel);

		cityContainer.addChild(labelContainer);

		this.container.addChild(cityContainer);
		this.cityGraphics.set(info.city.id, cityContainer);
	}

	/**
	 * Update generic units to display
	 */
	updateUnits(units: Unit[]): void {
		console.log('[UnitLayer] updateUnits called with', units.length, 'units');

		// Clear existing generic unit graphics
		for (const graphic of this.genericUnitGraphics.values()) {
			this.container.removeChild(graphic);
			graphic.destroy();
		}
		this.genericUnitGraphics.clear();
		this.genericUnits.clear();

		// Add unit graphics
		units.forEach((unit, index) => {
			if (unit.coordinates) {
				const globalX = unit.coordinates.x;
				const globalY = unit.coordinates.y;

				// Calculate position
				const px = Math.floor(globalX / this.gridSize);
				const py = Math.floor(globalY / this.gridSize);
				const rx = globalX % this.gridSize;
				const ry = globalY % this.gridSize;

				const planetaryCenter = hexToPixel(px, py, this.hexSize);
				const center = getRegionalHexCenter(
					planetaryCenter,
					rx,
					ry,
					this.hexSize,
					this.gridSize
				);

				const color = this.nationColors.get(unit.ownerNationId) || NATION_COLORS[index % NATION_COLORS.length];

				const unitInfo: GenericUnitInfo = {
					unit,
					globalX,
					globalY,
					centerX: center.x,
					centerY: center.y,
					color
				};

				this.genericUnits.set(unit.id, unitInfo);
				this.createGenericUnitGraphic(unitInfo);

				console.log(`[UnitLayer] Created unit graphic for ${unit.name} at (${globalX}, ${globalY})`);
			}
		});
	}

	/**
	 * Create graphic for a generic unit
	 */
	private createGenericUnitGraphic(info: GenericUnitInfo): void {
		const unitContainer = new Container();
		unitContainer.x = info.centerX;
		unitContainer.y = info.centerY;

		const regionalHexSize = this.hexSize / this.gridSize;
		const unitSize = regionalHexSize * 1.2;

		// Use settler texture if available and unit is settler, otherwise draw fallback
		if (this.settlerTexture && info.unit.unitType === 'settler') {
			const sprite = new Sprite(this.settlerTexture);
			sprite.anchor.set(0.5, 0.5);
			const spriteScale = unitSize / Math.max(sprite.width, sprite.height);
			sprite.scale.set(spriteScale);
			unitContainer.addChild(sprite);
		} else {
			// Draw unit as colored shield
			const graphics = new Graphics();
			graphics.moveTo(0, -unitSize * 0.5);
			graphics.lineTo(unitSize * 0.4, -unitSize * 0.2);
			graphics.lineTo(unitSize * 0.4, unitSize * 0.3);
			graphics.lineTo(0, unitSize * 0.5);
			graphics.lineTo(-unitSize * 0.4, unitSize * 0.3);
			graphics.lineTo(-unitSize * 0.4, -unitSize * 0.2);
			graphics.closePath();
			graphics.fill({ color: info.color });
			graphics.stroke({ color: 0xffffff, width: 1 });
			unitContainer.addChild(graphics);
		}

		// Add unit type label
		const style = new TextStyle({
			fontFamily: 'Arial',
			fontSize: regionalHexSize * 0.5,
			fill: 0xffffff,
			stroke: { color: 0x000000, width: 1 },
			align: 'center'
		});
		const label = new Text({ text: info.unit.name, style });
		label.anchor.set(0.5, 0);
		label.y = unitSize * 0.6;
		unitContainer.addChild(label);

		this.container.addChild(unitContainer);
		this.genericUnitGraphics.set(info.unit.id, unitContainer);
	}

	/**
	 * Store nation color for a nation ID (called when nations are updated)
	 */
	setNationColor(nationId: string, color: number): void {
		this.nationColors.set(nationId, color);
	}

	/**
	 * Clean up resources
	 */
	destroy(): void {
		for (const graphic of this.unitGraphics.values()) {
			graphic.destroy();
		}
		this.unitGraphics.clear();
		this.units.clear();

		for (const graphic of this.cityGraphics.values()) {
			graphic.destroy();
		}
		this.cityGraphics.clear();
		this.cities.clear();

		for (const graphic of this.genericUnitGraphics.values()) {
			graphic.destroy();
		}
		this.genericUnitGraphics.clear();
		this.genericUnits.clear();

		this.container.destroy();
	}
}
