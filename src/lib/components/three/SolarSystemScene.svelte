<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
	import type { SolarSystem } from '$lib/entities/celestial/solarSystem';
	import { SeededNoise } from '$lib/utils/three/SeededNoise';
	import {
		getScale,
		getResolution,
		calculateAtmospherePixelColor,
		disposeMesh,
		disposeLine,
		calculateOrbitalVelocity
	} from '$lib/utils/three/celestialRendering';

	interface Props {
		solarSystem: SolarSystem;
		containerWidth?: number;
		containerHeight?: number;
		selectedPlanetId?: string | null;
	}

	let {
		solarSystem,
		containerWidth = 600,
		containerHeight = 600,
		selectedPlanetId = $bindable(null)
	}: Props = $props();

	const dispatch = createEventDispatcher();

	let container: HTMLDivElement;
	let scene: THREE.Scene;
	let camera: THREE.PerspectiveCamera;
	let renderer: THREE.WebGLRenderer;
	let controls: OrbitControls;
	let animationFrameId: number;

	// Scene objects
	let starMeshes: THREE.Mesh[] = [];
	let planetData: Array<{
		meshes: THREE.Mesh[];
		distance: number;
		velocity: number;
		planetId: string;
		orbitLine: THREE.Line;
	}> = [];
	let habitableZoneRing: THREE.Mesh | null = null;

	// Mouse interaction
	let raycaster: THREE.Raycaster;
	let mouse: THREE.Vector2;
	let hoveredPlanetId: string | null = $state(null);
	let clickedPlanetId: string | null = $state(null);
	let lastClickTime = 0;

	const ringScale = 50;
	let maxDistance = 0;

	onMount(() => {
		initScene();
		createStars();
		createHabitableZone();
		createPlanets();
		animate();
	});

	onDestroy(() => {
		cleanup();
	});

	function initScene() {
		scene = new THREE.Scene();

		// Calculate max distance for camera positioning
		const baseDistance = 20;
		const distancePerPlanet = 5;
		maxDistance =
			(baseDistance + distancePerPlanet * solarSystem.planets.length) * solarSystem.stars.length;

		camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);
		camera.position.set(0, maxDistance, maxDistance);

		renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.setSize(containerWidth, containerHeight);
		container.appendChild(renderer.domElement);

		controls = new OrbitControls(camera, renderer.domElement);
		controls.update();

		// Initialize raycaster for mouse picking
		raycaster = new THREE.Raycaster();
		mouse = new THREE.Vector2();

		// Add mouse event listeners
		renderer.domElement.addEventListener('mousemove', onMouseMove);
		renderer.domElement.addEventListener('click', onMouseClick);
	}

	function createStars() {
		for (let i = 0; i < solarSystem.stars.length; i++) {
			const star = solarSystem.stars[i];
			const starMesh = createStar(star);

			if (solarSystem.stars.length === 1) {
				starMesh.position.set(0, 0, 0);
			} else {
				const angle = (i / solarSystem.stars.length) * Math.PI * 2;
				const distance = 10;
				starMesh.position.set(distance * Math.cos(angle), 0, distance * Math.sin(angle));
			}

			starMeshes.push(starMesh);
			scene.add(starMesh);
		}
	}

	function createStar(star: any): THREE.Mesh {
		const scale = getScale(star.size, 0.3);
		const resolution = getResolution(star.size);
		const geometry = new THREE.SphereGeometry(scale, resolution, resolution);
		const texture = new THREE.DataTexture(
			new Uint8Array(resolution * resolution * 4),
			resolution,
			resolution,
			THREE.RGBAFormat
		);
		const material = new THREE.MeshBasicMaterial({ map: texture });

		// Convert old string colors to RGB objects (backward compatibility)
		const STAR_COLORS: Record<string, { r: number; g: number; b: number }> = {
			'blue-white': { r: 155, g: 176, b: 255 },
			white: { r: 248, g: 247, b: 255 },
			'yellow-white': { r: 255, g: 244, b: 234 },
			yellow: { r: 255, g: 237, b: 227 },
			orange: { r: 255, g: 209, b: 178 },
			'orange-red': { r: 255, g: 204, b: 111 },
			red: { r: 255, g: 159, b: 104 }
		};

		// Handle both old string format and new RGB format
		let color: { r: number; g: number; b: number };
		if (typeof star.color === 'string') {
			color = STAR_COLORS[star.color] || { r: 255, g: 237, b: 227 };
		} else if (star.color && typeof star.color === 'object') {
			color = star.color;
		} else {
			color = { r: 255, g: 237, b: 227 };
		}

		// Generate star texture
		const noise = new SeededNoise(star.id ? hashString(star.id) : 12345);
		for (let i = 0; i < resolution; i++) {
			for (let j = 0; j < resolution; j++) {
				const pixelIndex = (i + j * resolution) * 4;
				const noiseValue =
					(noise.noise(i / 2, j / 2, 0) * 0.5 + 0.5 + noise.noise((i + 1) / 2, (j + 1) / 2, 0) * 0.5 + 0.5) / 2;
				texture.image.data[pixelIndex] = color.r * noiseValue;
				texture.image.data[pixelIndex + 1] = color.g * noiseValue;
				texture.image.data[pixelIndex + 2] = color.b * noiseValue;
				texture.image.data[pixelIndex + 3] = 255;
			}
		}

		texture.needsUpdate = true;
		return new THREE.Mesh(geometry, material);
	}

	function createHabitableZone() {
		const material = new THREE.MeshBasicMaterial({
			color: 0x00ff00,
			side: THREE.DoubleSide,
			transparent: true,
			opacity: 0.2
		});

		const geometry = new THREE.RingGeometry(
			solarSystem.habitableZoneStart * ringScale,
			solarSystem.habitableZoneEnd * ringScale,
			64
		);

		habitableZoneRing = new THREE.Mesh(geometry, material);
		habitableZoneRing.position.set(0, 0, 0);
		habitableZoneRing.lookAt(new THREE.Vector3(0, 1, 0));
		scene.add(habitableZoneRing);
	}

	function createPlanets() {
		for (let i = 0; i < solarSystem.planets.length; i++) {
			const planet = solarSystem.planets[i];
			const meshes = createPlanetMeshes(planet);
			const distance = planet.distanceFromStar * ringScale;
			const velocity = calculateOrbitalVelocity(distance);
			const angle = Math.random() * Math.PI * 2;

			// Add planetId to userData for raycasting and make clickable
			meshes.forEach((mesh) => {
				mesh.userData = { planetId: planet.id, isPlanet: true };
				mesh.position.set(distance * Math.cos(angle), 0, distance * Math.sin(angle));
				scene.add(mesh);
			});

			// Create orbital path
			const orbitGeometry = new THREE.BufferGeometry();
			const orbitVertices: number[] = [];
			for (let j = 0; j <= 100; j++) {
				const theta = (j / 100) * Math.PI * 2;
				orbitVertices.push(distance * Math.cos(theta), 0, distance * Math.sin(theta));
			}
			orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitVertices, 3));
			const orbitLine = new THREE.Line(
				orbitGeometry,
				new THREE.LineBasicMaterial({ color: 0x555555, linewidth: 1 })
			);
			scene.add(orbitLine);

			planetData.push({
				meshes,
				distance,
				velocity,
				planetId: planet.id,
				orbitLine
			});
		}
	}

	function createPlanetMeshes(planet: any): THREE.Mesh[] {
		const meshes: THREE.Mesh[] = [];
		const scale = getScale(planet.size, 1.5); // Increased from 0.3 to 1.5 for bigger planets
		const resolution = getResolution(planet.size);

		// Handle backward compatibility for planet colors
		let planetColor: { r: number; g: number; b: number };
		if (typeof planet.color === 'string') {
			// Old format - just use a default color based on string
			planetColor = { r: 100, g: 150, b: 200 };
		} else if (planet.color && typeof planet.color === 'object') {
			planetColor = planet.color;
		} else {
			planetColor = { r: 100, g: 150, b: 200 };
		}

		// Planet surface
		const geometry = new THREE.SphereGeometry(scale, resolution, resolution);
		const noise = new SeededNoise(planet.seed || 0);
		const texture = new THREE.DataTexture(
			new Uint8Array(resolution * resolution * 4),
			resolution,
			resolution,
			THREE.RGBAFormat
		);

		const noiseScale = planet.noiseScale || 2;
		const brightness = planet.brightness || 0.5;

		for (let i = 0; i < resolution; i++) {
			for (let j = 0; j < resolution; j++) {
				const pixelIndex = (i + j * resolution) * 4;
				const noiseValue = (noise.noise(i / noiseScale, j / noiseScale, 0) * 0.5 + 0.5) * brightness;
				texture.image.data[pixelIndex] = planetColor.r * noiseValue;
				texture.image.data[pixelIndex + 1] = planetColor.g * noiseValue;
				texture.image.data[pixelIndex + 2] = planetColor.b * noiseValue;
				texture.image.data[pixelIndex + 3] = 100;
			}
		}

		texture.needsUpdate = true;
		const planetMesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: texture }));
		planetMesh.rotation.x = THREE.MathUtils.degToRad(planet.obliquity || 0);
		meshes.push(planetMesh);

		// Atmosphere (simplified for solar system view)
		if (planet.atmosphere && planet.atmosphere !== 'none') {
			const atmGeometry = new THREE.SphereGeometry(scale * 1.05, resolution / 2, resolution / 2);
			// Handle old atmosphere color format
			let atmColor = { r: 135, g: 206, b: 235 };
			let atmTransparency = 0.3;

			if (planet.atmosphereColor && Array.isArray(planet.atmosphereColor)) {
				const [color, transparency] = planet.atmosphereColor;
				if (color && typeof color === 'object') {
					atmColor = color;
					atmTransparency = transparency || 0.3;
				}
			}

			const atmMaterial = new THREE.MeshBasicMaterial({
				color: `rgb(${atmColor.r}, ${atmColor.g}, ${atmColor.b})`,
				transparent: true,
				opacity: atmTransparency
			});
			const atmMesh = new THREE.Mesh(atmGeometry, atmMaterial);
			atmMesh.rotation.x = THREE.MathUtils.degToRad(planet.obliquity || 0);
			meshes.push(atmMesh);
		}

		return meshes;
	}

	function animate() {
		animationFrameId = requestAnimationFrame(animate);

		// Rotate stars
		starMeshes.forEach((star) => {
			star.rotation.y += 0.01;
		});

		// Orbit planets and update orbital path highlighting
		planetData.forEach((data) => {
			const primaryMesh = data.meshes[0];
			const angle = Math.atan2(primaryMesh.position.z, primaryMesh.position.x) + data.velocity;

			data.meshes.forEach((mesh) => {
				mesh.position.set(data.distance * Math.cos(angle), 0, data.distance * Math.sin(angle));
				mesh.rotation.y += 0.002;
			});

			// Update orbital line color based on selection
			const material = data.orbitLine.material as THREE.LineBasicMaterial;
			if (data.planetId === clickedPlanetId) {
				// Highlighted: bright purple
				material.color.setHex(0xc084fc);
				material.opacity = 1.0;
				material.transparent = false;
			} else if (data.planetId === hoveredPlanetId) {
				// Hovered: lighter gray
				material.color.setHex(0x999999);
				material.opacity = 0.8;
				material.transparent = true;
			} else {
				// Default: dark gray
				material.color.setHex(0x555555);
				material.opacity = 0.5;
				material.transparent = true;
			}
		});

		// Focus on selected planet
		if (selectedPlanetId) {
			const selectedData = planetData.find((d) => d.planetId === selectedPlanetId);
			if (selectedData && selectedData.meshes[0]) {
				const planetPos = selectedData.meshes[0].position;
				camera.position.set(planetPos.x + 3, planetPos.y + 3, planetPos.z + 3);
				camera.lookAt(planetPos);
				controls.target.copy(planetPos);
			}
		}

		controls.update();
		renderer.render(scene, camera);
	}

	function hashString(str: string): number {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			hash = (hash << 5) - hash + str.charCodeAt(i);
			hash = hash & hash;
		}
		return Math.abs(hash);
	}

	function onMouseMove(event: MouseEvent) {
		const rect = renderer.domElement.getBoundingClientRect();
		mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
		mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

		// Update raycaster
		raycaster.setFromCamera(mouse, camera);

		// Check for planet intersections
		const allPlanetMeshes = planetData.flatMap((data) => data.meshes);
		const intersects = raycaster.intersectObjects(allPlanetMeshes);

		if (intersects.length > 0 && intersects[0].object.userData.isPlanet) {
			hoveredPlanetId = intersects[0].object.userData.planetId;
			renderer.domElement.style.cursor = 'pointer';
		} else {
			hoveredPlanetId = null;
			renderer.domElement.style.cursor = 'default';
		}
	}

	function onMouseClick(event: MouseEvent) {
		const now = Date.now();
		const timeSinceLastClick = now - lastClickTime;
		lastClickTime = now;

		// Check if this is a double click (within 300ms)
		const isDoubleClick = timeSinceLastClick < 300;

		if (hoveredPlanetId) {
			if (isDoubleClick) {
				// Double click: navigate to planet viewer
				const planet = solarSystem.planets.find((p) => p.id === hoveredPlanetId);
				if (planet) {
					dispatch('openEntity', { entity: planet });
				}
			} else {
				// Single click: select/highlight orbital path
				clickedPlanetId = clickedPlanetId === hoveredPlanetId ? null : hoveredPlanetId;
			}
		} else {
			// Click on empty space: deselect
			clickedPlanetId = null;
		}
	}

	function cleanup() {
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
		}

		// Remove event listeners
		if (renderer && renderer.domElement) {
			renderer.domElement.removeEventListener('mousemove', onMouseMove);
			renderer.domElement.removeEventListener('click', onMouseClick);
		}

		starMeshes.forEach((mesh) => disposeMesh(mesh));
		planetData.forEach((data) => {
			data.meshes.forEach((mesh) => disposeMesh(mesh));
			disposeLine(data.orbitLine);
		});

		if (habitableZoneRing) {
			disposeMesh(habitableZoneRing);
		}

		if (scene) {
			scene.clear();
		}

		if (renderer) {
			renderer.dispose();
			if (container && container.contains(renderer.domElement)) {
				container.removeChild(renderer.domElement);
			}
		}

		if (controls) {
			controls.dispose();
		}
	}

	export function resetCamera() {
		selectedPlanetId = null;
		camera.position.set(0, maxDistance, maxDistance);
		controls.target.set(0, 0, 0);
	}
</script>

<div bind:this={container} class="solar-system-scene"></div>

<style>
	.solar-system-scene {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		background: radial-gradient(ellipse at center, rgb(20 15 35) 0%, rgb(10 8 20) 100%);
		border-radius: 0.5rem;
	}

	.solar-system-scene :global(canvas) {
		border-radius: 0.5rem;
	}
</style>
