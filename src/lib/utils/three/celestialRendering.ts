import type { Planet } from '$lib/entities/celestial/planet';
import type { Color } from '$lib/entities/celestial/ring';
import * as THREE from 'three';

/**
 * Calculate 3D scale based on size category
 * @param size - Size category
 * @param baseScale - Base scale multiplier (default: 1)
 * @returns Calculated scale value
 */
export function getScale(size: string, baseScale = 1): number {
	const scaleMap: Record<string, number> = {
		tiny: baseScale * 0.5,
		small: baseScale * 0.75,
		medium: baseScale,
		large: baseScale * 1.25,
		gigantic: baseScale * 1.5
	};
	return scaleMap[size] || baseScale;
}

/**
 * Calculate sphere geometry resolution based on size category
 * Higher resolution = smoother sphere but more polygons
 * @param size - Size category
 * @param baseResolution - Base resolution (default: 32)
 * @returns Calculated resolution value
 */
export function getResolution(size: string, baseResolution = 32): number {
	const resMap: Record<string, number> = {
		tiny: baseResolution / 2,
		small: baseResolution,
		medium: baseResolution * 2,
		large: baseResolution * 4,
		gigantic: baseResolution * 8
	};
	return resMap[size] || baseResolution;
}

/**
 * Calculate pixel color for atmosphere with weather effects
 * @param planetData - Planet entity
 * @param noiseValue - Noise value (0-1)
 * @param atmosphereColor - Base atmosphere color
 * @param transparency - Base transparency (0-1)
 * @returns RGBA values [r, g, b, a]
 */
export function calculateAtmospherePixelColor(
	planetData: Planet,
	noiseValue: number,
	atmosphereColor: Color,
	transparency: number
): [number, number, number, number] {
	// White clouds for nitrogen-oxygen atmosphere with high noise
	if (planetData.atmosphere === 'nitrogen-oxygen' && noiseValue > 0.7) {
		return [255, 255, 255, 255];
	}

	// Weather-specific effects
	if (planetData.atmosphere === 'nitrogen-oxygen') {
		if (planetData.weather === 'foggy') {
			// Foggy: White mist with moderate transparency
			return [255, 255, 255, 150 * transparency];
		}
		if (planetData.weather === 'stormy') {
			// Stormy: Mix of white and dark clouds
			const stormIntensity = noiseValue > 0.6 ? 255 : 100;
			return [stormIntensity, stormIntensity, stormIntensity, 200 * transparency];
		}
	}

	// Default atmospheric color based on composition
	return [
		atmosphereColor.r * noiseValue,
		atmosphereColor.g * noiseValue,
		atmosphereColor.b * noiseValue,
		255 * transparency * (planetData.atmosphere === 'nitrogen-oxygen' ? noiseValue : 1)
	];
}

/**
 * Dispose of three.js mesh and its resources
 * @param mesh - Single mesh or array of meshes to dispose
 */
export function disposeMesh(mesh: THREE.Mesh | THREE.Mesh[]): void {
	const meshes = Array.isArray(mesh) ? mesh : [mesh];
	meshes.forEach((m) => {
		if (m.geometry) {
			m.geometry.dispose();
		}
		if (m.material) {
			if (Array.isArray(m.material)) {
				m.material.forEach((mat) => {
					mat.dispose();
					if ('map' in mat && mat.map) {
						mat.map.dispose();
					}
				});
			} else {
				m.material.dispose();
				if ('map' in m.material && m.material.map) {
					m.material.map.dispose();
				}
			}
		}
	});
}

/**
 * Dispose of three.js line and its resources
 * @param line - Single line or array of lines to dispose
 */
export function disposeLine(line: THREE.Line | THREE.Line[]): void {
	const lines = Array.isArray(line) ? line : [line];
	lines.forEach((l) => {
		if (l.geometry) {
			l.geometry.dispose();
		}
		if (l.material) {
			if (Array.isArray(l.material)) {
				l.material.forEach((mat) => mat.dispose());
			} else {
				l.material.dispose();
			}
		}
	});
}

/**
 * Convert Color object to CSS rgb string
 * @param color - Color object
 * @returns CSS rgb string
 */
export function colorToRGB(color: Color): string {
	return `rgb(${color.r}, ${color.g}, ${color.b})`;
}

/**
 * Calculate orbital velocity based on distance from star
 * Farther objects move slower (Kepler's laws approximation)
 * @param distance - Distance from star
 * @param baseVelocity - Base velocity multiplier
 * @returns Calculated velocity
 */
export function calculateOrbitalVelocity(distance: number, baseVelocity = 0.007): number {
	return (baseVelocity / distance) * 2;
}
