import { Container, Graphics } from 'pixi.js';
import type { WorldMap } from '$lib/entities/location/worldMap';
import type { HexTile } from '$lib/entities/location/hexTile';
import { hexToPixel, getHexCorners } from './HexGeometry';
import { TERRAIN_COLORS_HEX, SELECTION_COLOR, HOVER_COLOR, STROKE_COLOR } from './constants';

/**
 * Renders the planetary (Level 1) hex layer
 * Uses Graphics batching for performance
 */
export class PlanetaryHexLayer {
	container: Container;
	private hexSize: number;
	private worldMap: WorldMap;
	private hexGraphics: Map<string, Graphics> = new Map();
	private selectedHex: HexTile | null = null;
	private hoveredHex: HexTile | null = null;

	onHexClick: ((hex: HexTile) => void) | null = null;
	onHexHover: ((hex: HexTile | null) => void) | null = null;

	constructor(worldMap: WorldMap, hexSize: number) {
		this.container = new Container();
		this.hexSize = hexSize;
		this.worldMap = worldMap;

		this.buildHexes();
	}

	/**
	 * Build all planetary hexes
	 */
	private buildHexes(): void {
		this.container.removeChildren();
		this.hexGraphics.clear();

		for (let y = 0; y < this.worldMap.height; y++) {
			for (let x = 0; x < this.worldMap.width; x++) {
				const hexTile = this.worldMap.hexTiles[y][x];
				const graphics = this.createHexGraphics(hexTile);
				this.container.addChild(graphics);
				this.hexGraphics.set(`${x},${y}`, graphics);
			}
		}
	}

	/**
	 * Create graphics for a single hex
	 */
	private createHexGraphics(hexTile: HexTile): Graphics {
		const graphics = new Graphics();
		const center = hexToPixel(hexTile.x, hexTile.y, this.hexSize);
		const corners = getHexCorners(center.x, center.y, this.hexSize);
		const color = TERRAIN_COLORS_HEX[hexTile.terrainType] ?? 0x888888;

		// Draw filled hex
		graphics.poly(corners.flatMap((c) => [c.x, c.y]));
		graphics.fill({ color });
		graphics.stroke({ color: STROKE_COLOR, width: 0.5, alpha: 0.3 });

		// Make interactive
		graphics.eventMode = 'static';
		graphics.cursor = 'pointer';

		// Store reference to hex tile
		(graphics as any).hexTile = hexTile;

		// Event handlers
		graphics.on('pointerdown', () => {
			this.selectHex(hexTile);
		});

		graphics.on('pointerover', () => {
			this.hoverHex(hexTile);
		});

		graphics.on('pointerout', () => {
			this.hoverHex(null);
		});

		return graphics;
	}

	/**
	 * Select a hex
	 */
	private selectHex(hexTile: HexTile): void {
		const previousSelection = this.selectedHex;

		// Update selectedHex FIRST before calling updateHexAppearance
		// This is critical because updateHexAppearance checks this.selectedHex
		this.selectedHex = hexTile;

		// Deselect previous
		if (previousSelection && previousSelection !== hexTile) {
			this.updateHexAppearance(previousSelection);
		}

		this.updateHexAppearance(hexTile);

		if (this.onHexClick) {
			this.onHexClick(hexTile);
		}
	}

	/**
	 * Hover over a hex
	 */
	private hoverHex(hexTile: HexTile | null): void {
		const previousHover = this.hoveredHex;

		// Update hoveredHex FIRST before calling updateHexAppearance
		// This is critical because updateHexAppearance checks this.hoveredHex
		this.hoveredHex = hexTile;

		// Restore previous hover to normal state
		if (previousHover && previousHover !== this.selectedHex && previousHover !== hexTile) {
			this.updateHexAppearance(previousHover);
		}

		// Apply hover to new hex
		if (hexTile && hexTile !== this.selectedHex) {
			this.updateHexAppearance(hexTile);
		}

		if (this.onHexHover) {
			this.onHexHover(hexTile);
		}
	}

	/**
	 * Update hex appearance (selection/hover states)
	 */
	private updateHexAppearance(hexTile: HexTile): void {
		const key = `${hexTile.x},${hexTile.y}`;
		const graphics = this.hexGraphics.get(key);
		if (!graphics) return;

		const center = hexToPixel(hexTile.x, hexTile.y, this.hexSize);
		const corners = getHexCorners(center.x, center.y, this.hexSize);
		const baseColor = TERRAIN_COLORS_HEX[hexTile.terrainType] ?? 0x888888;

		graphics.clear();
		graphics.poly(corners.flatMap((c) => [c.x, c.y]));
		graphics.fill({ color: baseColor });

		// Determine stroke based on state
		if (this.selectedHex === hexTile) {
			graphics.stroke({ color: SELECTION_COLOR, width: 2 });
		} else if (this.hoveredHex === hexTile) {
			graphics.stroke({ color: HOVER_COLOR, width: 1.5 });
		} else {
			graphics.stroke({ color: STROKE_COLOR, width: 0.5, alpha: 0.3 });
		}
	}

	/**
	 * Rebuild with new world map data
	 */
	rebuild(worldMap: WorldMap): void {
		this.worldMap = worldMap;
		this.selectedHex = null;
		this.hoveredHex = null;
		this.buildHexes();
	}

	/**
	 * Get currently selected hex
	 */
	getSelectedHex(): HexTile | null {
		return this.selectedHex;
	}
}
