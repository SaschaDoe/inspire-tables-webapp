<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as THREE from 'three';
	import type { Planet } from '$lib/entities/celestial/planet';
	import { SeededNoise } from '$lib/utils/three/SeededNoise';
	import {
		getScale,
		getResolution,
		calculateAtmospherePixelColor,
		disposeMesh
	} from '$lib/utils/three/celestialRendering';

	interface Props {
		planet: Planet;
		containerWidth?: number;
		containerHeight?: number;
	}

	let { planet, containerWidth = 400, containerHeight = 400 }: Props = $props();

	let container: HTMLDivElement;
	let scene: THREE.Scene;
	let camera: THREE.PerspectiveCamera;
	let renderer: THREE.WebGLRenderer;
	let planetMeshes: THREE.Mesh[] = [];
	let animationFrameId: number;

	onMount(() => {
		initScene();
		createPlanet();
		animate();
	});

	onDestroy(() => {
		cleanup();
	});

	function initScene() {
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(
			75,
			containerWidth / containerHeight,
			0.1,
			1000
		);
		camera.position.z = 3.2;

		renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.setSize(containerWidth, containerHeight);
		container.appendChild(renderer.domElement);
	}

	function createPlanet() {
		const scale = getScale(planet.size);
		const resolution = getResolution(planet.size);

		// Create planet surface
		const geometry = new THREE.SphereGeometry(scale, resolution, resolution);
		const noise = new SeededNoise(planet.seed);
		const texture = new THREE.DataTexture(
			new Uint8Array(resolution * resolution * 4),
			resolution,
			resolution,
			THREE.RGBAFormat
		);
		const material = new THREE.MeshBasicMaterial({ map: texture });

		// Generate procedural texture
		for (let i = 0; i < resolution; i++) {
			for (let j = 0; j < resolution; j++) {
				const pixelIndex = (i + j * resolution) * 4;
				const noiseValue =
					(noise.noise(i / planet.noiseScale, j / planet.noiseScale, 0) * 0.5 + 0.5 +
						noise.noise((i + 1) / planet.noiseScale, (j + 1) / planet.noiseScale, 0) * 0.5 +
						0.5) /
					2;
				const color = planet.color;
				texture.image.data[pixelIndex] = color.r * noiseValue * planet.brightness;
				texture.image.data[pixelIndex + 1] = color.g * noiseValue * planet.brightness;
				texture.image.data[pixelIndex + 2] = color.b * noiseValue * planet.brightness;
				texture.image.data[pixelIndex + 3] = 100;
			}
		}

		texture.needsUpdate = true;
		const planetMesh = new THREE.Mesh(geometry, material);
		planetMesh.rotation.x = THREE.MathUtils.degToRad(planet.obliquity);
		scene.add(planetMesh);
		planetMeshes.push(planetMesh);

		// Create atmosphere
		if (planet.atmosphere !== 'none') {
			const atmosphereMesh = createAtmosphere(scale, resolution);
			scene.add(atmosphereMesh);
			planetMeshes.push(atmosphereMesh);
		}

		// Create rings
		if (planet.rings.length > 0) {
			const ringMeshes = createRings(scale);
			ringMeshes.forEach((ringMesh) => {
				scene.add(ringMesh);
				planetMeshes.push(ringMesh);
			});
		}
	}

	function createAtmosphere(scale: number, resolution: number): THREE.Mesh {
		const atmosphereScale = scale * 1.05;
		const atmosphereGeometry = new THREE.SphereGeometry(atmosphereScale, resolution, resolution);
		const atmosphereNoise = new SeededNoise(planet.seed + 1);
		const atmosphereTexture = new THREE.DataTexture(
			new Uint8Array(resolution * resolution * 4),
			resolution,
			resolution,
			THREE.RGBAFormat
		);

		const [atmosphereColor, atmosphereTransparency] = planet.atmosphereColor;
		const atmosphereMaterial = new THREE.MeshBasicMaterial({
			map: atmosphereTexture,
			transparent: true
		});

		for (let i = 0; i < resolution; i++) {
			for (let j = 0; j < resolution; j++) {
				const pixelIndex = (i + j * resolution) * 4;
				const noiseValue =
					(atmosphereNoise.noise(i / 2, j / 2, 0) * 0.5 +
						0.5 +
						atmosphereNoise.noise((i + 1) / 2, (j + 1) / 2, 0) * 0.5 +
						0.5) /
					2;

				const [r, g, b, a] = calculateAtmospherePixelColor(
					planet,
					noiseValue,
					atmosphereColor,
					atmosphereTransparency
				);

				atmosphereTexture.image.data.set([r, g, b, a], pixelIndex);
			}
		}

		atmosphereTexture.needsUpdate = true;
		const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
		atmosphereMesh.rotation.x = THREE.MathUtils.degToRad(planet.obliquity);
		return atmosphereMesh;
	}

	function createRings(planetScale: number): THREE.Mesh[] {
		const meshes: THREE.Mesh[] = [];

		// Create noisy texture for rings
		const textureSize = 64;
		const canvas = document.createElement('canvas');
		canvas.width = textureSize;
		canvas.height = textureSize;
		const context = canvas.getContext('2d')!;

		const imgData = context.createImageData(textureSize, textureSize);
		for (let i = 0; i < imgData.data.length; i += 4) {
			const noise = Math.random() * 255;
			imgData.data[i] = noise;
			imgData.data[i + 1] = noise;
			imgData.data[i + 2] = noise;
			imgData.data[i + 3] = 255;
		}
		context.putImageData(imgData, 0, 0);

		const texture = new THREE.CanvasTexture(canvas);
		texture.magFilter = THREE.NearestFilter;

		for (let i = 0; i < planet.rings.length; i++) {
			const ring = planet.rings[i];
			const ringGeometry = new THREE.RingGeometry(
				ring.innerRadius * planetScale,
				ring.outerRadius * planetScale,
				64
			);
			const ringMaterial = new THREE.MeshBasicMaterial({
				map: texture,
				color: `rgb(${ring.color.r}, ${ring.color.g}, ${ring.color.b})`,
				side: THREE.DoubleSide,
				opacity: ring.color.a || 0.7,
				transparent: true
			});

			const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
			ringMesh.rotation.x = Math.PI / 2 + THREE.MathUtils.degToRad(planet.obliquity);
			meshes.push(ringMesh);
		}

		return meshes;
	}

	function animate() {
		animationFrameId = requestAnimationFrame(animate);

		// Rotate planet
		if (planetMeshes[0]) {
			planetMeshes[0].rotation.y += 0.002;
		}

		// Rotate atmosphere slightly slower
		if (planetMeshes[1] && planet.atmosphere !== 'none') {
			planetMeshes[1].rotation.y += 0.002 * 0.9;
		}

		// Rotate rings
		if (planet.rings.length > 0) {
			const ringStartIndex = planet.atmosphere !== 'none' ? 2 : 1;
			for (let i = 0; i < planet.rings.length; i++) {
				const ringMesh = planetMeshes[ringStartIndex + i];
				if (ringMesh) {
					const ringRotationSpeed = 0.002 - i * 0.0005;
					ringMesh.rotation.z -= ringRotationSpeed;
				}
			}
		}

		renderer.render(scene, camera);
	}

	function cleanup() {
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
		}

		planetMeshes.forEach((mesh) => disposeMesh(mesh));
		planetMeshes = [];

		if (scene) {
			scene.clear();
		}

		if (renderer) {
			renderer.dispose();
			if (container && container.contains(renderer.domElement)) {
				container.removeChild(renderer.domElement);
			}
		}
	}
</script>

<div bind:this={container} class="planet-renderer"></div>

<style>
	.planet-renderer {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.planet-renderer :global(canvas) {
		border-radius: 0.5rem;
	}
</style>
