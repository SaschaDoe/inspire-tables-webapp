<script lang="ts">
	import { SimulationEngine } from '$lib/simulation/SimulationEngine';
	import type { RegionalMap } from '$lib/entities/location/regionalMap';
	import { entityStore } from '$lib/stores/entityStore';

	/**
	 * SimulationControlPanel - Phase 2.6
	 *
	 * User-driven simulation control:
	 * - User inputs years to simulate (10-10000)
	 * - Live progress bar showing simulation running
	 * - Speed controls (0.5x - Max)
	 * - Start/Pause/Stop/Step buttons
	 */

	interface Props {
		regionalMap: RegionalMap;
		onSimulationUpdate?: (engine: SimulationEngine) => void;
	}

	let { regionalMap, onSimulationUpdate }: Props = $props();

	// Simulation state
	let engine: SimulationEngine | null = $state(null);
	let isInitialized = $state(false);
	let isRunning = $state(false);
	let isPaused = $state(false);

	// User inputs
	let yearInput = $state<number>(100); // Default: 100 years
	let turnsPerYear = $state<number>(1); // Default: 1 turn per year
	let nationCount = $state<number>(4); // Default: 4 nations
	let speedMultiplier = $state<number>(1); // Default: 1x speed

	// Progress tracking
	let currentYear = $state<number>(regionalMap.currentYear || -10000);
	let currentTurn = $state<number>(regionalMap.currentTurn || 0);
	let targetTurn = $state<number>(0);
	let progressPercent = $state<number>(0);

	// Derived values
	const totalTurns = $derived(yearInput * turnsPerYear);
	const estimatedDuration = $derived((totalTurns / speedMultiplier).toFixed(1));

	/**
	 * Initialize simulation engine
	 */
	async function initializeSimulation() {
		console.log('Initializing simulation...');

		// Check if simulation already exists (has nations/cities)
		if (regionalMap.nationIds && regionalMap.nationIds.length > 0) {
			// Load existing simulation
			engine = new SimulationEngine({
				startYear: regionalMap.currentYear || -10000,
				yearsPerTurn: turnsPerYear,
				autoSave: true,
				autoSaveInterval: 10
			});

			await engine.initializeFromEntities(regionalMap.id);
			currentYear = engine['currentYear'];
			currentTurn = engine['currentTurn'];
		} else {
			// Create new simulation
			engine = new SimulationEngine({
				startYear: regionalMap.currentYear || -10000,
				yearsPerTurn: turnsPerYear,
				autoSave: true,
				autoSaveInterval: 10
			});

			// Initialize with regional map
			engine.initialize([regionalMap.id]);
			currentYear = engine['currentYear'];
			currentTurn = 0;

			// TODO: Create initial nations and settlers
			// For now, this would need to be done by the user or another system
		}

		isInitialized = true;
		console.log(`✓ Simulation initialized at year ${currentYear}, turn ${currentTurn}`);
	}

	/**
	 * Start/resume simulation
	 */
	async function startSimulation() {
		if (!engine) {
			await initializeSimulation();
			if (!engine) return;
		}

		isRunning = true;
		isPaused = false;
		engine['isRunning'] = true;
		engine['isPaused'] = false;

		targetTurn = currentTurn + totalTurns;

		// Calculate delay per turn based on speed
		const msPerTurn = speedMultiplier >= 999 ? 0 : 1000 / speedMultiplier;

		console.log(`Starting simulation: ${yearInput} years (${totalTurns} turns) at ${speedMultiplier}x speed`);

		// Run simulation loop
		for (let i = 0; i < totalTurns; i++) {
			if (!isRunning || isPaused) {
				console.log('Simulation paused or stopped');
				break;
			}

			// Process turn
			engine.processTurn();

			// Update UI state
			currentYear = engine['currentYear'];
			currentTurn = engine['currentTurn'];
			progressPercent = ((i + 1) / totalTurns) * 100;

			// Notify parent component
			if (onSimulationUpdate) {
				onSimulationUpdate(engine);
			}

			// Wait before next turn (unless max speed)
			if (msPerTurn > 0) {
				await new Promise((resolve) => setTimeout(resolve, msPerTurn));
			}
		}

		isRunning = false;
		engine['isRunning'] = false;
		progressPercent = 100;

		console.log(`✓ Simulation complete! Final year: ${currentYear}, Turn: ${currentTurn}`);
	}

	/**
	 * Pause simulation
	 */
	function pauseSimulation() {
		if (engine) {
			isPaused = true;
			engine['isPaused'] = true;
		}
		console.log('Simulation paused');
	}

	/**
	 * Resume simulation
	 */
	function resumeSimulation() {
		if (engine) {
			isPaused = false;
			engine['isPaused'] = false;
		}
		// Continue the loop (would need to re-enter startSimulation logic)
		console.log('Simulation resumed');
	}

	/**
	 * Stop simulation
	 */
	function stopSimulation() {
		if (engine) {
			isRunning = false;
			isPaused = false;
			engine.stop();
		}
		progressPercent = 0;
		console.log('Simulation stopped');
	}

	/**
	 * Step one turn
	 */
	function stepSimulation() {
		if (!engine) return;

		engine['isRunning'] = true;
		engine['isPaused'] = false;
		engine.processTurn();

		currentYear = engine['currentYear'];
		currentTurn = engine['currentTurn'];

		if (onSimulationUpdate) {
			onSimulationUpdate(engine);
		}

		console.log(`✓ Stepped to year ${currentYear}, turn ${currentTurn}`);
	}

	/**
	 * Reset simulation
	 */
	async function resetSimulation() {
		stopSimulation();
		engine = null;
		isInitialized = false;
		currentTurn = 0;
		currentYear = regionalMap.currentYear || -10000;
		progressPercent = 0;
		console.log('Simulation reset');
	}
</script>

<div class="simulation-controls">
	<h3>Simulation Controls</h3>

	<!-- Current State -->
	{#if isInitialized}
		<div class="current-state">
			<div class="state-item">
				<span class="label">Current Year:</span>
				<span class="value">{currentYear}</span>
			</div>
			<div class="state-item">
				<span class="label">Turn:</span>
				<span class="value">{currentTurn}</span>
			</div>
		</div>
	{/if}

	<!-- Configuration -->
	<div class="config-section">
		<div class="input-group">
			<label for="years">Simulate how many years?</label>
			<input
				type="number"
				id="years"
				bind:value={yearInput}
				min="10"
				max="10000"
				step="10"
				disabled={isRunning}
			/>
			<span class="help-text">
				{totalTurns} turns total (~{estimatedDuration}s at {speedMultiplier}x speed)
			</span>
		</div>

		<div class="input-group">
			<label for="turns-per-year">Turns per year:</label>
			<select id="turns-per-year" bind:value={turnsPerYear} disabled={isRunning}>
				<option value={1}>1 turn/year (fast)</option>
				<option value={2}>2 turns/year</option>
				<option value={4}>4 turns/year (default)</option>
				<option value={12}>12 turns/year (monthly)</option>
			</select>
		</div>

		<div class="input-group">
			<label for="nations">Number of nations:</label>
			<input
				type="number"
				id="nations"
				bind:value={nationCount}
				min="2"
				max="8"
				disabled={isRunning || isInitialized}
			/>
			<span class="help-text">Only for new simulations</span>
		</div>

		<div class="input-group">
			<label for="speed">Simulation speed:</label>
			<select id="speed" bind:value={speedMultiplier} disabled={!isRunning}>
				<option value={0.5}>0.5x (slow, 1 turn per 2 sec)</option>
				<option value={1}>1x (1 turn per sec)</option>
				<option value={2}>2x (2 turns per sec)</option>
				<option value={5}>5x (5 turns per sec)</option>
				<option value={10}>10x (10 turns per sec)</option>
				<option value={999}>Max speed (instant)</option>
			</select>
		</div>
	</div>

	<!-- Action Buttons -->
	<div class="button-group">
		{#if !isInitialized}
			<button onclick={initializeSimulation} class="btn-primary">Initialize Simulation</button>
		{:else if !isRunning}
			<button onclick={startSimulation} class="btn-primary">▶ Run {yearInput} Years</button>
			<button onclick={stepSimulation} class="btn-secondary">⏭ Step 1 Turn</button>
			<button onclick={resetSimulation} class="btn-secondary">🔄 Reset</button>
		{:else if isPaused}
			<button onclick={resumeSimulation} class="btn-primary">▶ Resume</button>
			<button onclick={stopSimulation} class="btn-secondary">⏹ Stop</button>
		{:else}
			<button onclick={pauseSimulation} class="btn-secondary">⏸ Pause</button>
			<button onclick={stopSimulation} class="btn-secondary">⏹ Stop</button>
			<button onclick={stepSimulation} class="btn-secondary">⏭ Step</button>
		{/if}
	</div>

	<!-- Progress Bar -->
	{#if isRunning || currentTurn > 0}
		<div class="progress-section">
			<div class="progress-bar">
				<div class="progress-fill" style="width: {progressPercent}%"></div>
			</div>
			<div class="progress-text">
				{#if isRunning}
					Running: Year {currentYear} | Turn {currentTurn} / {targetTurn} ({progressPercent.toFixed(
						1
					)}%)
				{:else}
					Completed: Year {currentYear} | Turn {currentTurn}
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.simulation-controls {
		padding: 1rem;
		background: #1e293b;
		border-radius: 8px;
		margin-bottom: 1rem;
	}

	h3 {
		margin: 0 0 1rem 0;
		color: #f1f5f9;
		font-size: 1.25rem;
	}

	.current-state {
		display: flex;
		gap: 2rem;
		margin-bottom: 1rem;
		padding: 0.75rem;
		background: #0f172a;
		border-radius: 4px;
	}

	.state-item {
		display: flex;
		gap: 0.5rem;
	}

	.state-item .label {
		color: #94a3b8;
		font-weight: 500;
	}

	.state-item .value {
		color: #fbbf24;
		font-weight: 700;
	}

	.config-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.input-group label {
		color: #cbd5e1;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.input-group input,
	.input-group select {
		padding: 0.5rem;
		background: #0f172a;
		border: 1px solid #334155;
		border-radius: 4px;
		color: #f1f5f9;
		font-size: 0.875rem;
	}

	.input-group input:disabled,
	.input-group select:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.help-text {
		color: #64748b;
		font-size: 0.75rem;
		font-style: italic;
	}

	.button-group {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	button {
		padding: 0.625rem 1.25rem;
		border: none;
		border-radius: 4px;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-primary {
		background: #3b82f6;
		color: white;
	}

	.btn-primary:hover {
		background: #2563eb;
	}

	.btn-secondary {
		background: #475569;
		color: white;
	}

	.btn-secondary:hover {
		background: #334155;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.progress-section {
		margin-top: 1rem;
	}

	.progress-bar {
		width: 100%;
		height: 8px;
		background: #0f172a;
		border-radius: 4px;
		overflow: hidden;
		margin-bottom: 0.5rem;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #3b82f6, #8b5cf6);
		transition: width 0.3s ease;
	}

	.progress-text {
		color: #cbd5e1;
		font-size: 0.875rem;
		text-align: center;
	}
</style>
