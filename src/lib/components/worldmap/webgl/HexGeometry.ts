/**
 * Hex coordinate and geometry utilities
 * Uses offset-column layout (odd columns offset down)
 */

export interface Point {
	x: number;
	y: number;
}

/**
 * Convert hex grid coordinates to pixel coordinates
 * Uses offset-column layout (odd columns offset down)
 */
export function hexToPixel(hexX: number, hexY: number, hexSize: number): Point {
	const x = hexSize * 1.5 * hexX + hexSize;
	const y = hexSize * Math.sqrt(3) * (hexY + (hexX % 2) * 0.5) + (hexSize * Math.sqrt(3)) / 2;
	return { x, y };
}

/**
 * Convert pixel coordinates to hex grid coordinates
 */
export function pixelToHex(pixelX: number, pixelY: number, hexSize: number): Point {
	// Approximate - for hit detection we can be rough
	const x = (pixelX - hexSize) / (hexSize * 1.5);
	const y = (pixelY - (hexSize * Math.sqrt(3)) / 2) / (hexSize * Math.sqrt(3)) - (Math.round(x) % 2) * 0.5;
	return { x: Math.round(x), y: Math.round(y) };
}

/**
 * Get the 6 corner points of a hexagon
 */
export function getHexCorners(centerX: number, centerY: number, size: number): Point[] {
	const corners: Point[] = [];
	for (let i = 0; i < 6; i++) {
		const angle = (Math.PI / 3) * i;
		corners.push({
			x: centerX + size * Math.cos(angle),
			y: centerY + size * Math.sin(angle)
		});
	}
	return corners;
}

/**
 * Get hex center for a regional hex within a planetary hex
 */
export function getRegionalHexCenter(
	planetaryCenter: Point,
	regionalX: number,
	regionalY: number,
	planetaryHexSize: number,
	regionalGridSize: number
): Point {
	const regionalHexSize = planetaryHexSize / regionalGridSize;
	const regHexWidth = regionalHexSize * 1.5;
	const regHexHeight = regionalHexSize * Math.sqrt(3);

	// Center the regional grid within the planetary hex
	const gridWidth = regionalGridSize * regHexWidth;
	const gridHeight = regionalGridSize * regHexHeight;
	const offsetX = -gridWidth / 2 + regHexWidth / 2;
	const offsetY = -gridHeight / 2 + regHexHeight / 2;

	const x = planetaryCenter.x + offsetX + regionalX * regHexWidth;
	const y = planetaryCenter.y + offsetY + regionalY * regHexHeight + (regionalX % 2) * regHexHeight / 2;

	return { x, y };
}

/**
 * Calculate bounding box for visible area
 */
export function getVisibleHexRange(
	viewportX: number,
	viewportY: number,
	viewportWidth: number,
	viewportHeight: number,
	hexSize: number,
	mapWidth: number,
	mapHeight: number
): { minX: number; maxX: number; minY: number; maxY: number } {
	// Add buffer for hexes at edges
	const buffer = 2;

	const topLeft = pixelToHex(viewportX, viewportY, hexSize);
	const bottomRight = pixelToHex(viewportX + viewportWidth, viewportY + viewportHeight, hexSize);

	return {
		minX: Math.max(0, Math.floor(topLeft.x) - buffer),
		maxX: Math.min(mapWidth - 1, Math.ceil(bottomRight.x) + buffer),
		minY: Math.max(0, Math.floor(topLeft.y) - buffer),
		maxY: Math.min(mapHeight - 1, Math.ceil(bottomRight.y) + buffer)
	};
}

/**
 * Check if a hex is within the visible viewport
 */
export function isHexVisible(
	hexX: number,
	hexY: number,
	hexSize: number,
	viewportX: number,
	viewportY: number,
	viewportWidth: number,
	viewportHeight: number
): boolean {
	const center = hexToPixel(hexX, hexY, hexSize);
	const margin = hexSize * 2; // Extra margin for hex size

	return (
		center.x + margin >= viewportX &&
		center.x - margin <= viewportX + viewportWidth &&
		center.y + margin >= viewportY &&
		center.y - margin <= viewportY + viewportHeight
	);
}

/**
 * Calculate the distance between two hex coordinates
 */
export function hexDistance(x1: number, y1: number, x2: number, y2: number): number {
	// Convert to cube coordinates for accurate distance
	const cube1 = offsetToCube(x1, y1);
	const cube2 = offsetToCube(x2, y2);

	return (Math.abs(cube1.x - cube2.x) + Math.abs(cube1.y - cube2.y) + Math.abs(cube1.z - cube2.z)) / 2;
}

/**
 * Convert offset coordinates to cube coordinates
 */
function offsetToCube(col: number, row: number): { x: number; y: number; z: number } {
	const x = col;
	const z = row - (col - (col & 1)) / 2;
	const y = -x - z;
	return { x, y, z };
}
