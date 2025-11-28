import { Container, Graphics } from 'pixi.js';
import type { WorldMap } from '$lib/entities/location/worldMap';
import type { HexTile } from '$lib/entities/location/hexTile';
import type { RegionalHexData } from '$lib/entities/location/regionalHexData';
import type { DetailedHexTile } from '$lib/entities/location/detailedHexTile';
import { hexToPixel, getHexCorners, getRegionalHexCenter, getVisibleHexRange } from './HexGeometry';
import {
	TERRAIN_COLORS_HEX,
	FEATURE_COLORS,
	STROKE_COLOR,
	SELECTION_COLOR,
	PLANETARY_HEX_SIZE,
	REGIONAL_GRID_SIZE,
	CHUNK_SIZE,
	CHUNK_BUFFER
} from './constants';

interface RegionalHexInfo {
	planetaryHex: HexTile;
	regionalHex: RegionalHexData;
	rx: number;
	ry: number;
	px: number;  // Parent general hex coordinates
	py: number;
	centerX: number;
	centerY: number;
	size: number;
}

interface Chunk {
	key: string;
	graphics: Graphics;
	hexInfo: RegionalHexInfo[];
}

/**
 * Renders the regional (Level 2) hex layer with chunking
 * Uses batched drawing for performance - one Graphics object per chunk
 */
export class RegionalHexLayer {
	container: Container;
	private hexSize: number;
	private worldMap: WorldMap;

	private chunks: Map<string, Chunk> = new Map();
	private visibleChunkKeys: Set<string> = new Set();

	private selectedRegionalHex: { planetaryHex: HexTile; regionalHex: RegionalHexData } | null = null;
	private selectedGlobalCoords: { globalX: number; globalY: number; px: number; py: number } | null = null;
	private selectionHighlight: Graphics;

	onRegionalHexClick: ((
		planetaryHex: HexTile,
		regionalHex: RegionalHexData,
		detailedHex: DetailedHexTile | undefined,
		globalX: number,
		globalY: number
	) => void) | null = null;

	constructor(worldMap: WorldMap, hexSize: number) {
		this.container = new Container();
		this.container.eventMode = 'passive';
		this.hexSize = hexSize;
		this.worldMap = worldMap;

		// Create selection highlight graphics (rendered on top of chunks)
		this.selectionHighlight = new Graphics();
		this.selectionHighlight.visible = false;
		this.container.addChild(this.selectionHighlight);
	}

	/**
	 * Draw selection highlight on the selected detailed hex
	 */
	private drawSelectionHighlight(info: RegionalHexInfo): void {
		this.selectionHighlight.clear();

		const gridSize = info.planetaryHex.regionalGridSize || REGIONAL_GRID_SIZE;
		const regionalHexSize = this.hexSize / gridSize;
		const corners = getHexCorners(info.centerX, info.centerY, regionalHexSize);

		// Draw selection border
		this.selectionHighlight.poly(corners.flatMap((c) => [c.x, c.y]));
		this.selectionHighlight.stroke({ color: SELECTION_COLOR, width: 2 });

		// Also draw a subtle fill
		this.selectionHighlight.poly(corners.flatMap((c) => [c.x, c.y]));
		this.selectionHighlight.fill({ color: SELECTION_COLOR, alpha: 0.2 });

		this.selectionHighlight.visible = true;

		// Store coordinates for reference
		this.selectedGlobalCoords = {
			globalX: info.px * gridSize + info.rx,
			globalY: info.py * gridSize + info.ry,
			px: info.px,
			py: info.py
		};
	}

	/**
	 * Clear selection highlight
	 */
	clearSelection(): void {
		this.selectionHighlight.clear();
		this.selectionHighlight.visible = false;
		this.selectedRegionalHex = null;
		this.selectedGlobalCoords = null;
	}

	/**
	 * Update which chunks are visible based on viewport
	 */
	updateVisibleChunks(
		viewportX: number,
		viewportY: number,
		viewportWidth: number,
		viewportHeight: number
	): void {
		const visibleRange = getVisibleHexRange(
			viewportX,
			viewportY,
			viewportWidth,
			viewportHeight,
			this.hexSize,
			this.worldMap.width,
			this.worldMap.height
		);

		const minChunkX = Math.floor(visibleRange.minX / CHUNK_SIZE) - CHUNK_BUFFER;
		const maxChunkX = Math.ceil(visibleRange.maxX / CHUNK_SIZE) + CHUNK_BUFFER;
		const minChunkY = Math.floor(visibleRange.minY / CHUNK_SIZE) - CHUNK_BUFFER;
		const maxChunkY = Math.ceil(visibleRange.maxY / CHUNK_SIZE) + CHUNK_BUFFER;

		const newVisibleKeys = new Set<string>();

		for (let cy = minChunkY; cy <= maxChunkY; cy++) {
			for (let cx = minChunkX; cx <= maxChunkX; cx++) {
				const key = `${cx},${cy}`;
				newVisibleKeys.add(key);

				if (!this.chunks.has(key)) {
					this.createChunk(cx, cy);
				}
			}
		}

		for (const key of this.visibleChunkKeys) {
			if (!newVisibleKeys.has(key)) {
				this.unloadChunk(key);
			}
		}

		this.visibleChunkKeys = newVisibleKeys;
	}

	/**
	 * Create a chunk - uses single batched Graphics for all hexes in chunk
	 */
	private createChunk(chunkX: number, chunkY: number): void {
		const key = `${chunkX},${chunkY}`;
		if (this.chunks.has(key)) return;

		const startX = chunkX * CHUNK_SIZE;
		const startY = chunkY * CHUNK_SIZE;
		const endX = Math.min(startX + CHUNK_SIZE, this.worldMap.width);
		const endY = Math.min(startY + CHUNK_SIZE, this.worldMap.height);

		if (startX >= this.worldMap.width || startY >= this.worldMap.height || startX < 0 || startY < 0) {
			return;
		}

		const graphics = new Graphics();
		const hexInfo: RegionalHexInfo[] = [];

		// Draw all regional hexes in this chunk into single Graphics
		for (let py = Math.max(0, startY); py < endY; py++) {
			for (let px = Math.max(0, startX); px < endX; px++) {
				const planetaryHex = this.worldMap.hexTiles[py]?.[px];
				if (!planetaryHex || !planetaryHex.regionalHexes?.length) continue;

				const planetaryCenter = hexToPixel(px, py, this.hexSize);
				const gridSize = planetaryHex.regionalGridSize || REGIONAL_GRID_SIZE;
				const regionalHexSize = this.hexSize / gridSize;

				for (let ry = 0; ry < planetaryHex.regionalHexes.length; ry++) {
					const regionalRow = planetaryHex.regionalHexes[ry];
					if (!regionalRow) continue;

					for (let rx = 0; rx < regionalRow.length; rx++) {
						const regionalHex = regionalRow[rx];
						if (!regionalHex) continue;

						const center = getRegionalHexCenter(
							planetaryCenter,
							rx,
							ry,
							this.hexSize,
							gridSize
						);

						// Store info for hit-testing
						hexInfo.push({
							planetaryHex,
							regionalHex,
							rx,
							ry,
							px,
							py,
							centerX: center.x,
							centerY: center.y,
							size: regionalHexSize
						});

						// Draw the hex
						this.drawRegionalHex(graphics, center, regionalHexSize, regionalHex);
					}
				}
			}
		}

		if (hexInfo.length > 0) {
			// Setup click handler on the single graphics object
			graphics.eventMode = 'static';
			graphics.cursor = 'pointer';

			graphics.on('pointerdown', (event) => {
				const localPos = event.getLocalPosition(graphics);
				this.handleChunkClick(hexInfo, localPos.x, localPos.y);
			});

			this.container.addChild(graphics);
			this.chunks.set(key, { key, graphics, hexInfo });

			// Ensure selection highlight stays on top of all chunks
			if (this.selectionHighlight.parent) {
				this.container.removeChild(this.selectionHighlight);
				this.container.addChild(this.selectionHighlight);
			}
		}
	}

	/**
	 * Draw a single regional hex into the graphics batch
	 */
	private drawRegionalHex(
		graphics: Graphics,
		center: { x: number; y: number },
		size: number,
		regionalHex: RegionalHexData
	): void {
		const corners = getHexCorners(center.x, center.y, size);

		// Determine fill color
		let color = TERRAIN_COLORS_HEX[regionalHex.terrainType] ?? 0x888888;
		if (regionalHex.feature && FEATURE_COLORS[regionalHex.feature]) {
			color = FEATURE_COLORS[regionalHex.feature];
		}

		// Draw filled hex with stroke
		graphics.poly(corners.flatMap((c) => [c.x, c.y]));
		graphics.fill({ color });
		graphics.stroke({ color: STROKE_COLOR, width: 0.1, alpha: 0.2 });

		// Draw river if present
		if (regionalHex.hasRiver && regionalHex.riverSides?.length > 0) {
			for (const side of regionalHex.riverSides) {
				const c1 = corners[side];
				const c2 = corners[(side + 1) % 6];
				graphics.moveTo(c1.x, c1.y);
				graphics.lineTo(c2.x, c2.y);
				graphics.stroke({ color: 0x4a90d9, width: 0.3 });
			}
		}
	}

	/**
	 * Handle click on a chunk by finding which hex was clicked
	 */
	private handleChunkClick(hexInfo: RegionalHexInfo[], clickX: number, clickY: number): void {
		// Find the closest hex to the click point
		let closestHex: RegionalHexInfo | null = null;
		let closestDist = Infinity;

		for (const info of hexInfo) {
			const dx = clickX - info.centerX;
			const dy = clickY - info.centerY;
			const dist = dx * dx + dy * dy;

			// Quick distance check - hex radius squared
			const maxDist = info.size * info.size;
			if (dist < maxDist && dist < closestDist) {
				closestDist = dist;
				closestHex = info;
			}
		}

		if (closestHex && this.onRegionalHexClick) {
			const gridSize = closestHex.planetaryHex.regionalGridSize || REGIONAL_GRID_SIZE;
			const globalX = closestHex.px * gridSize + closestHex.rx;
			const globalY = closestHex.py * gridSize + closestHex.ry;

			this.selectedRegionalHex = {
				planetaryHex: closestHex.planetaryHex,
				regionalHex: closestHex.regionalHex
			};

			// Draw selection highlight on the clicked hex
			this.drawSelectionHighlight(closestHex);

			// Look up the DetailedHexTile entity from worldMap
			const key = `${globalX},${globalY}`;
			let detailedHex: DetailedHexTile | undefined;

			// Handle all possible storage formats:
			// 1. WorldMap class instance with getter (detailedHexTiles returns Map)
			// 2. Plain object with detailedHexTiles as plain object (from toJSON serialization)
			// 3. Plain object with _detailedHexTiles as Map or object (internal storage)
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const worldMapAny = this.worldMap as any;

			// Try detailedHexTiles first (either via getter or direct property)
			let tiles = worldMapAny.detailedHexTiles;

			// If detailedHexTiles is empty or missing, try _detailedHexTiles
			if (!tiles || (typeof tiles === 'object' && !(tiles instanceof Map) && Object.keys(tiles).length === 0)) {
				tiles = worldMapAny._detailedHexTiles;
			}

			if (tiles) {
				if (tiles instanceof Map) {
					// It's a Map
					detailedHex = tiles.get(key);
				} else if (typeof tiles.get === 'function') {
					// It's Map-like
					detailedHex = tiles.get(key);
				} else if (typeof tiles === 'object') {
					// It's a plain object (from serialization)
					detailedHex = tiles[key];
				}
			}

			console.log(`[RegionalHexLayer] Click at (${globalX}, ${globalY}), detailedHex:`, detailedHex ? 'found' : 'not found', 'tiles type:', tiles?.constructor?.name, 'tiles size:', tiles instanceof Map ? tiles.size : (tiles ? Object.keys(tiles).length : 0));

			this.onRegionalHexClick(
				closestHex.planetaryHex,
				closestHex.regionalHex,
				detailedHex,
				globalX,
				globalY
			);
		}
	}

	/**
	 * Unload a chunk to free memory
	 */
	private unloadChunk(key: string): void {
		const chunk = this.chunks.get(key);
		if (chunk) {
			this.container.removeChild(chunk.graphics);
			chunk.graphics.destroy();
			this.chunks.delete(key);
		}
	}

	/**
	 * Rebuild with new world map data
	 */
	rebuild(worldMap: WorldMap): void {
		this.worldMap = worldMap;
		this.clearSelection();

		for (const key of this.chunks.keys()) {
			this.unloadChunk(key);
		}
		this.chunks.clear();
		this.visibleChunkKeys.clear();

		// Ensure selection highlight is on top after rebuild
		this.container.removeChild(this.selectionHighlight);
		this.container.addChild(this.selectionHighlight);
	}

	/**
	 * Get currently selected regional hex
	 */
	getSelectedRegionalHex(): { planetaryHex: HexTile; regionalHex: RegionalHexData } | null {
		return this.selectedRegionalHex;
	}

	/**
	 * Get selected global coordinates
	 */
	getSelectedGlobalCoords(): { globalX: number; globalY: number; px: number; py: number } | null {
		return this.selectedGlobalCoords;
	}
}
