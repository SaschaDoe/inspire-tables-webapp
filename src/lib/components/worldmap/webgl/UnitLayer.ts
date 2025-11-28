import { Container, Graphics, Text, TextStyle, Sprite, Assets, Texture } from 'pixi.js';
import type { Nation } from '$lib/entities/location/nation';
import { hexToPixel, getRegionalHexCenter, type Point } from './HexGeometry';
import {
	PLANETARY_HEX_SIZE,
	REGIONAL_GRID_SIZE,
	REGIONAL_ZOOM_START,
	REGIONAL_ZOOM_FULL
} from './constants';

// Settler sprite path
const SETTLER_SPRITE_PATH = '/civ5-assets/units/Settler.png';

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
	private currentZoom = 1;
	private settlerTexture: Texture | null = null;
	private textureLoading = false;

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
			this.settlerTexture = await Assets.load(SETTLER_SPRITE_PATH);
			console.log('[UnitLayer] Settler texture loaded successfully');

			// Recreate existing unit graphics with the loaded texture
			this.recreateAllGraphics();
		} catch (error) {
			console.warn('[UnitLayer] Failed to load settler texture, using fallback:', error);
			this.settlerTexture = null;
		}
	}

	/**
	 * Recreate all unit graphics (called after textures load)
	 */
	private recreateAllGraphics(): void {
		for (const [nationId, info] of this.units) {
			// Remove old graphic
			const oldGraphic = this.unitGraphics.get(nationId);
			if (oldGraphic) {
				this.container.removeChild(oldGraphic);
				oldGraphic.destroy();
			}
			// Create new graphic with texture
			this.createUnitGraphic(info);
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
		this.container.destroy();
	}
}
