import { Container, Graphics, Text, TextStyle } from 'pixi.js';
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
		// Clear existing units
		this.units.clear();
		for (const graphic of this.unitGraphics.values()) {
			this.container.removeChild(graphic);
			graphic.destroy();
		}
		this.unitGraphics.clear();

		// Add new units for nations that have starting positions
		nations.forEach((nation, index) => {
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

		// Draw settler icon
		const graphics = new Graphics();

		// Base circle (body)
		const baseSize = this.hexSize / this.gridSize * 0.4;

		// Draw a simple person-like settler icon
		// Head
		graphics.circle(0, -baseSize * 0.6, baseSize * 0.35);
		graphics.fill({ color: 0xffd699 }); // Skin color

		// Body (triangle cloak)
		graphics.moveTo(-baseSize * 0.5, baseSize * 0.5);
		graphics.lineTo(baseSize * 0.5, baseSize * 0.5);
		graphics.lineTo(0, -baseSize * 0.2);
		graphics.closePath();
		graphics.fill({ color: info.color });

		// Outline
		graphics.circle(0, -baseSize * 0.6, baseSize * 0.35);
		graphics.stroke({ color: 0x000000, width: 1 });

		graphics.moveTo(-baseSize * 0.5, baseSize * 0.5);
		graphics.lineTo(baseSize * 0.5, baseSize * 0.5);
		graphics.lineTo(0, -baseSize * 0.2);
		graphics.closePath();
		graphics.stroke({ color: 0x000000, width: 1 });

		// Nation flag/banner
		const flagPoleHeight = baseSize * 1.2;
		const flagWidth = baseSize * 0.6;
		const flagHeight = baseSize * 0.4;

		// Flag pole
		graphics.moveTo(baseSize * 0.4, -baseSize * 0.3);
		graphics.lineTo(baseSize * 0.4, -baseSize * 0.3 - flagPoleHeight);
		graphics.stroke({ color: 0x654321, width: 2 });

		// Flag
		graphics.rect(
			baseSize * 0.4,
			-baseSize * 0.3 - flagPoleHeight,
			flagWidth,
			flagHeight
		);
		graphics.fill({ color: info.color });
		graphics.stroke({ color: 0x000000, width: 1 });

		unitContainer.addChild(graphics);

		// Add nation name label
		const style = new TextStyle({
			fontFamily: 'Arial',
			fontSize: 8,
			fill: 0xffffff,
			stroke: { color: 0x000000, width: 2 },
			align: 'center'
		});

		const label = new Text({
			text: info.nation.name.substring(0, 10),
			style
		});
		label.anchor.set(0.5, 0);
		label.y = baseSize * 0.7;
		unitContainer.addChild(label);

		this.container.addChild(unitContainer);
		this.unitGraphics.set(info.nation.id, unitContainer);
	}

	/**
	 * Update visibility based on zoom level
	 */
	updateZoom(zoom: number): void {
		this.currentZoom = zoom;

		// Show units based on zoom level
		// At low zoom, show simplified markers
		// At high zoom, show full settler icons
		const showDetailed = zoom >= REGIONAL_ZOOM_START;

		for (const [nationId, graphic] of this.unitGraphics) {
			const info = this.units.get(nationId);
			if (!info) continue;

			if (zoom < REGIONAL_ZOOM_START * 0.5) {
				// Very zoomed out - hide units
				graphic.visible = false;
			} else if (zoom < REGIONAL_ZOOM_START) {
				// Partially zoomed - show simplified marker
				graphic.visible = true;
				graphic.scale.set(1 / zoom * 0.5);
			} else {
				// Zoomed in - show full detail
				graphic.visible = true;
				graphic.scale.set(1 / zoom);
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
