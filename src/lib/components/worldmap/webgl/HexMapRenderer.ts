import { Application, Container } from 'pixi.js';
import type { WorldMap } from '$lib/entities/location/worldMap';
import type { HexTile } from '$lib/entities/location/hexTile';
import type { RegionalHexData } from '$lib/entities/location/regionalHexData';
import type { DetailedHexTile } from '$lib/entities/location/detailedHexTile';
import type { Nation } from '$lib/entities/location/nation';
import { PlanetaryHexLayer } from './PlanetaryHexLayer';
import { RegionalHexLayer } from './RegionalHexLayer';
import { UnitLayer } from './UnitLayer';
import {
	MIN_ZOOM,
	MAX_ZOOM,
	REGIONAL_ZOOM_START,
	REGIONAL_ZOOM_FULL,
	PLANETARY_HEX_SIZE,
	BACKGROUND_COLOR
} from './constants';

export interface HexSelectedEvent {
	hex: HexTile;
}

export interface RegionalHexSelectedEvent {
	planetaryHex: HexTile;
	regionalHex: RegionalHexData;
	detailedHex: DetailedHexTile | undefined;
	globalX: number;
	globalY: number;
}

type EventCallback<T> = (event: T) => void;

/**
 * Main WebGL-based hex map renderer using PixiJS
 */
export class HexMapRenderer {
	private app: Application;
	private worldContainer: Container;
	private planetaryLayer: PlanetaryHexLayer;
	private regionalLayer: RegionalHexLayer;
	private unitLayer: UnitLayer;

	private worldMap: WorldMap;
	private nations: Nation[] = [];
	private scale = 0.6;
	private targetScale = 0.6;
	private panX = 0;
	private panY = 0;
	private targetPanX = 0;
	private targetPanY = 0;

	private isPanning = false;
	private lastMouseX = 0;
	private lastMouseY = 0;

	private containerElement: HTMLElement;
	private isInitialized = false;

	// Event callbacks
	private onHexSelected: EventCallback<HexSelectedEvent> | null = null;
	private onRegionalHexSelected: EventCallback<RegionalHexSelectedEvent> | null = null;

	constructor() {
		this.app = new Application();
		this.worldContainer = new Container();
		this.planetaryLayer = null!;
		this.regionalLayer = null!;
		this.unitLayer = null!;
		this.worldMap = null!;
		this.containerElement = null!;
	}

	/**
	 * Initialize the renderer (async because PixiJS v8 init is async)
	 */
	async init(container: HTMLElement, worldMap: WorldMap): Promise<void> {
		this.containerElement = container;
		this.worldMap = worldMap;

		// Initialize PixiJS Application
		await this.app.init({
			resizeTo: container,
			backgroundColor: BACKGROUND_COLOR,
			antialias: true,
			resolution: window.devicePixelRatio || 1,
			autoDensity: true
		});

		container.appendChild(this.app.canvas);

		// Setup world container (for zoom/pan)
		this.worldContainer.eventMode = 'passive'; // Allow events to propagate to children
		this.app.stage.addChild(this.worldContainer);

		// Create layers
		this.planetaryLayer = new PlanetaryHexLayer(worldMap, PLANETARY_HEX_SIZE);
		this.regionalLayer = new RegionalHexLayer(worldMap, PLANETARY_HEX_SIZE);
		this.unitLayer = new UnitLayer(PLANETARY_HEX_SIZE);

		this.worldContainer.addChild(this.planetaryLayer.container);
		this.worldContainer.addChild(this.regionalLayer.container);
		this.worldContainer.addChild(this.unitLayer.container); // Units on top

		// Set up event forwarding from layers
		this.planetaryLayer.onHexClick = (hex) => {
			if (this.onHexSelected) {
				this.onHexSelected({ hex });
			}
		};

		this.regionalLayer.onRegionalHexClick = (planetaryHex, regionalHex, detailedHex, globalX, globalY) => {
			if (this.onRegionalHexSelected) {
				this.onRegionalHexSelected({ planetaryHex, regionalHex, detailedHex, globalX, globalY });
			}
		};

		// Setup interaction
		this.setupInteraction();

		// Start render loop
		this.app.ticker.add(this.update.bind(this));

		// Initial render
		this.updateLayerVisibility();
		this.centerView();

		this.isInitialized = true;
	}

	/**
	 * Set event callback for hex selection
	 */
	setOnHexSelected(callback: EventCallback<HexSelectedEvent> | null): void {
		this.onHexSelected = callback;
	}

	/**
	 * Set event callback for regional hex selection
	 */
	setOnRegionalHexSelected(callback: EventCallback<RegionalHexSelectedEvent> | null): void {
		this.onRegionalHexSelected = callback;
	}

	/**
	 * Setup mouse/touch interaction
	 */
	private setupInteraction(): void {
		const canvas = this.app.canvas;

		// Mouse wheel zoom
		canvas.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });

		// Pan with mouse drag
		canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
		canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
		canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
		canvas.addEventListener('mouseleave', this.handleMouseUp.bind(this));

		// Touch support
		canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
		canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
		canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
	}

	private handleWheel(e: WheelEvent): void {
		e.preventDefault();

		const zoomFactor = 0.1;
		const delta = e.deltaY > 0 ? -zoomFactor : zoomFactor;

		// Zoom toward cursor position
		const rect = this.app.canvas.getBoundingClientRect();
		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;

		// Calculate world position under cursor before zoom
		const worldX = (mouseX - this.panX) / this.scale;
		const worldY = (mouseY - this.panY) / this.scale;

		// Apply zoom
		this.targetScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, this.targetScale + delta));

		// Adjust pan to keep cursor position stable
		this.targetPanX = mouseX - worldX * this.targetScale;
		this.targetPanY = mouseY - worldY * this.targetScale;
	}

	private handleMouseDown(e: MouseEvent): void {
		if (e.button === 0) {
			this.isPanning = true;
			this.lastMouseX = e.clientX;
			this.lastMouseY = e.clientY;
		}
	}

	private handleMouseMove(e: MouseEvent): void {
		if (this.isPanning) {
			const deltaX = e.clientX - this.lastMouseX;
			const deltaY = e.clientY - this.lastMouseY;
			this.targetPanX += deltaX;
			this.targetPanY += deltaY;
			this.lastMouseX = e.clientX;
			this.lastMouseY = e.clientY;
		}
	}

	private handleMouseUp(): void {
		this.isPanning = false;
	}

	private handleTouchStart(e: TouchEvent): void {
		if (e.touches.length === 1) {
			e.preventDefault();
			this.isPanning = true;
			this.lastMouseX = e.touches[0].clientX;
			this.lastMouseY = e.touches[0].clientY;
		}
	}

	private handleTouchMove(e: TouchEvent): void {
		if (this.isPanning && e.touches.length === 1) {
			e.preventDefault();
			const deltaX = e.touches[0].clientX - this.lastMouseX;
			const deltaY = e.touches[0].clientY - this.lastMouseY;
			this.targetPanX += deltaX;
			this.targetPanY += deltaY;
			this.lastMouseX = e.touches[0].clientX;
			this.lastMouseY = e.touches[0].clientY;
		}
	}

	private handleTouchEnd(): void {
		this.isPanning = false;
	}

	/**
	 * Main update loop
	 */
	private update(): void {
		// Smooth interpolation for zoom and pan
		const lerpFactor = 0.15;

		this.scale += (this.targetScale - this.scale) * lerpFactor;
		this.panX += (this.targetPanX - this.panX) * lerpFactor;
		this.panY += (this.targetPanY - this.panY) * lerpFactor;

		// Apply transform to world container
		this.worldContainer.scale.set(this.scale);
		this.worldContainer.position.set(this.panX, this.panY);

		// Update layer visibility based on zoom
		this.updateLayerVisibility();

		// Update regional layer chunks based on viewport
		this.regionalLayer.updateVisibleChunks(
			-this.panX / this.scale,
			-this.panY / this.scale,
			this.app.screen.width / this.scale,
			this.app.screen.height / this.scale
		);
	}

	/**
	 * Update layer opacity based on zoom level
	 */
	private updateLayerVisibility(): void {
		// Calculate transition progress (0 = planetary only, 1 = regional only)
		let progress = 0;
		if (this.scale < REGIONAL_ZOOM_START) {
			progress = 0;
		} else if (this.scale > REGIONAL_ZOOM_FULL) {
			progress = 1;
		} else {
			progress = (this.scale - REGIONAL_ZOOM_START) / (REGIONAL_ZOOM_FULL - REGIONAL_ZOOM_START);
		}

		// Apply smooth easing
		progress = this.easeInOutCubic(progress);

		this.planetaryLayer.container.alpha = 1 - progress;
		this.regionalLayer.container.alpha = progress;

		// Optimize: hide layers when fully transparent
		this.planetaryLayer.container.visible = progress < 1;
		this.regionalLayer.container.visible = progress > 0;

		// Disable interaction on planetary layer when regional layer is more than 50% visible
		// This prevents planetary hexes from blocking clicks on regional hexes
		this.planetaryLayer.container.interactiveChildren = progress < 0.5;
		this.regionalLayer.container.interactiveChildren = progress >= 0.5;

		// Update unit layer zoom
		this.unitLayer.updateZoom(this.scale);
	}

	private easeInOutCubic(t: number): number {
		return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
	}

	/**
	 * Center the view on the map
	 */
	private centerView(): void {
		const mapPixelWidth = (this.worldMap.width + 1) * PLANETARY_HEX_SIZE * 1.5;
		const mapPixelHeight = this.worldMap.height * PLANETARY_HEX_SIZE * Math.sqrt(3) + PLANETARY_HEX_SIZE;

		const centerX = mapPixelWidth / 2;
		const centerY = mapPixelHeight / 2;

		this.targetPanX = this.app.screen.width / 2 - centerX * this.scale;
		this.targetPanY = this.app.screen.height / 2 - centerY * this.scale;
		this.panX = this.targetPanX;
		this.panY = this.targetPanY;
	}

	/**
	 * Zoom controls - zoom toward selected hex or screen center
	 */
	zoomIn(): void {
		this.zoomTowardFocus(0.3);
	}

	zoomOut(): void {
		this.zoomTowardFocus(-0.3);
	}

	/**
	 * Zoom toward a focus point (selected hex or screen center)
	 */
	private zoomTowardFocus(delta: number): void {
		const selectedHex = this.planetaryLayer.getSelectedHex();

		let focusX: number;
		let focusY: number;

		if (selectedHex) {
			// Zoom toward selected hex
			const hexWorldPos = this.getHexWorldPosition(selectedHex.x, selectedHex.y);
			// Convert world position to screen position
			focusX = hexWorldPos.x * this.scale + this.panX;
			focusY = hexWorldPos.y * this.scale + this.panY;
		} else {
			// Zoom toward screen center
			focusX = this.app.screen.width / 2;
			focusY = this.app.screen.height / 2;
		}

		// Calculate world position under focus point before zoom
		const worldX = (focusX - this.panX) / this.scale;
		const worldY = (focusY - this.panY) / this.scale;

		// Apply zoom
		this.targetScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, this.targetScale + delta));

		// Adjust pan to keep focus point stable
		this.targetPanX = focusX - worldX * this.targetScale;
		this.targetPanY = focusY - worldY * this.targetScale;
	}

	/**
	 * Get world pixel position for a hex coordinate
	 */
	private getHexWorldPosition(x: number, y: number): { x: number; y: number } {
		const pixelX = PLANETARY_HEX_SIZE * 1.5 * x + PLANETARY_HEX_SIZE;
		const pixelY = PLANETARY_HEX_SIZE * Math.sqrt(3) * (y + (x % 2) * 0.5) + (PLANETARY_HEX_SIZE * Math.sqrt(3)) / 2;
		return { x: pixelX, y: pixelY };
	}

	resetZoom(): void {
		this.targetScale = 0.6;
		this.centerView();
	}

	/**
	 * Pan to a specific global hex coordinate
	 */
	panToGlobalHex(globalX: number, globalY: number, zoomLevel?: number): void {
		// Calculate world pixel position from global coordinates
		const gridSize = this.worldMap.gridSize || 10;

		// Calculate planetary hex coordinates
		const px = Math.floor(globalX / gridSize);
		const py = Math.floor(globalY / gridSize);

		// Calculate local coordinates within planetary hex
		const localX = globalX % gridSize;
		const localY = globalY % gridSize;

		// Get planetary hex center
		const planetaryCenter = this.getHexWorldPosition(px, py);

		// Calculate detailed hex offset within the planetary hex
		const hexHeight = PLANETARY_HEX_SIZE * Math.sqrt(3) / gridSize;
		const hexWidth = PLANETARY_HEX_SIZE / gridSize;

		// Offset from planetary hex center
		const regionalOffsetX = (localX - gridSize / 2 + 0.5) * hexWidth * 1.5;
		const regionalOffsetY = (localY - gridSize / 2 + (localX % 2) * 0.5) * hexHeight;

		const worldX = planetaryCenter.x + regionalOffsetX;
		const worldY = planetaryCenter.y + regionalOffsetY;

		// Set target zoom if specified
		if (zoomLevel !== undefined) {
			this.targetScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomLevel));
		}

		// Calculate pan to center this position on screen
		this.targetPanX = this.app.screen.width / 2 - worldX * this.targetScale;
		this.targetPanY = this.app.screen.height / 2 - worldY * this.targetScale;
	}

	/**
	 * Pan to a planetary hex coordinate
	 */
	panToPlanetaryHex(hexX: number, hexY: number, zoomLevel?: number): void {
		const worldPos = this.getHexWorldPosition(hexX, hexY);

		// Set target zoom if specified
		if (zoomLevel !== undefined) {
			this.targetScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomLevel));
		}

		// Calculate pan to center this position on screen
		this.targetPanX = this.app.screen.width / 2 - worldPos.x * this.targetScale;
		this.targetPanY = this.app.screen.height / 2 - worldPos.y * this.targetScale;
	}

	getZoomPercent(): number {
		return Math.round(this.scale * 100);
	}

	getViewMode(): string {
		if (this.scale < REGIONAL_ZOOM_START) return 'Planetary View';
		if (this.scale > REGIONAL_ZOOM_FULL) return 'Regional View';
		return 'Transitioning...';
	}

	/**
	 * Update world map data
	 */
	updateWorldMap(worldMap: WorldMap): void {
		this.worldMap = worldMap;

		// Guard: layers are only available after init() completes
		if (!this.isInitialized) {
			return;
		}

		this.planetaryLayer.rebuild(worldMap);
		this.regionalLayer.rebuild(worldMap);
		this.centerView();
	}

	/**
	 * Update nations to display on the map
	 */
	updateNations(nations: Nation[]): void {
		this.nations = nations;

		// Guard: layers are only available after init() completes
		if (!this.isInitialized) {
			return;
		}

		this.unitLayer.updateNations(nations);
	}

	/**
	 * Cleanup
	 */
	destroy(): void {
		if (this.isInitialized) {
			this.unitLayer.destroy();
			this.app.destroy(true, { children: true, texture: true });
		}
	}
}
