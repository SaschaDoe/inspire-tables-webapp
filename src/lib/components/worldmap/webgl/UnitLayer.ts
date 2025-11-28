import { Container, Graphics, Text, TextStyle, Sprite, Assets } from 'pixi.js';
import type { Nation } from '$lib/entities/location/nation';
import { hexToPixel, getRegionalHexCenter, type Point } from './HexGeometry';
import {
	PLANETARY_HEX_SIZE,
	REGIONAL_GRID_SIZE,
	REGIONAL_ZOOM_START,
	REGIONAL_ZOOM_FULL
} from './constants';

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

	constructor(hexSize: number, gridSize: number = REGIONAL_GRID_SIZE) {
		this.container = new Container();
		this.container.eventMode = 'passive';
		this.hexSize = hexSize;
		this.gridSize = gridSize;
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

		// Draw settler icon - make it much larger and more visible
		const graphics = new Graphics();

		// Size based on regional hex size (not tiny fraction)
		const regionalHexSize = this.hexSize / this.gridSize;
		const baseSize = regionalHexSize * 0.8; // 80% of hex size

		// Background circle for visibility
		graphics.circle(0, 0, baseSize * 0.6);
		graphics.fill({ color: info.color, alpha: 0.3 });
		graphics.stroke({ color: info.color, width: 2 });

		// Draw a covered wagon / settler wagon icon
		// Wagon body
		graphics.roundRect(-baseSize * 0.4, -baseSize * 0.1, baseSize * 0.8, baseSize * 0.35, 3);
		graphics.fill({ color: 0x8B4513 }); // Brown wood
		graphics.stroke({ color: 0x000000, width: 1 });

		// Wagon cover (canvas top)
		graphics.ellipse(0, -baseSize * 0.15, baseSize * 0.45, baseSize * 0.3);
		graphics.fill({ color: 0xF5DEB3 }); // Wheat/canvas color
		graphics.stroke({ color: 0x000000, width: 1 });

		// Wheels
		const wheelRadius = baseSize * 0.12;
		const wheelY = baseSize * 0.25;
		// Left wheel
		graphics.circle(-baseSize * 0.25, wheelY, wheelRadius);
		graphics.fill({ color: 0x654321 });
		graphics.stroke({ color: 0x000000, width: 1 });
		// Right wheel
		graphics.circle(baseSize * 0.25, wheelY, wheelRadius);
		graphics.fill({ color: 0x654321 });
		graphics.stroke({ color: 0x000000, width: 1 });

		// Nation color banner on wagon
		graphics.rect(-baseSize * 0.15, -baseSize * 0.35, baseSize * 0.3, baseSize * 0.15);
		graphics.fill({ color: info.color });
		graphics.stroke({ color: 0x000000, width: 1 });

		unitContainer.addChild(graphics);

		// Add nation name label - larger font
		const style = new TextStyle({
			fontFamily: 'Arial',
			fontSize: 12,
			fontWeight: 'bold',
			fill: 0xffffff,
			stroke: { color: 0x000000, width: 3 },
			align: 'center'
		});

		const label = new Text({
			text: info.nation.name.substring(0, 12),
			style
		});
		label.anchor.set(0.5, 0);
		label.y = baseSize * 0.5;
		unitContainer.addChild(label);

		this.container.addChild(unitContainer);
		this.unitGraphics.set(info.nation.id, unitContainer);
	}

	/**
	 * Update visibility based on zoom level
	 */
	updateZoom(zoom: number): void {
		this.currentZoom = zoom;

		// Show units at all zoom levels, but scale appropriately
		for (const [nationId, graphic] of this.unitGraphics) {
			const info = this.units.get(nationId);
			if (!info) continue;

			// Always show units
			graphic.visible = true;

			// Scale units to maintain reasonable size on screen
			// At zoom 1.0, scale = 1.0 (natural size)
			// At zoom 3.0, scale = 1.0 (same size - unit fills hex nicely)
			// At zoom 10.0+, scale down slightly so it doesn't dominate
			if (zoom < REGIONAL_ZOOM_START) {
				// Before regional view - show larger marker
				graphic.scale.set(2.0 / zoom);
			} else if (zoom < 5.0) {
				// Regional view - natural size (1.0)
				graphic.scale.set(1.0);
			} else {
				// Very zoomed in - scale down slightly
				graphic.scale.set(5.0 / zoom);
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
