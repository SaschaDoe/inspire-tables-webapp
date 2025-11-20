<script lang="ts">
	import { storyboardStore, activeBoard, boardMode } from '$lib/stores/storyboardStore';

	// Preset colors for quick selection
	const colors = [
		{ name: 'Purple', value: '#a855f7' },
		{ name: 'Blue', value: '#3b82f6' },
		{ name: 'Green', value: '#22c55e' },
		{ name: 'Yellow', value: '#eab308' },
		{ name: 'Orange', value: '#f97316' },
		{ name: 'Red', value: '#ef4444' },
		{ name: 'Pink', value: '#ec4899' },
		{ name: 'White', value: '#ffffff' }
	];

	// Preset stroke widths
	const widths = [1, 2, 3, 5, 8];

	function setColor(color: string) {
		if (!$activeBoard) return;
		storyboardStore.updateDrawingSettings($activeBoard.id, color, undefined);
	}

	function setWidth(width: number) {
		if (!$activeBoard) return;
		storyboardStore.updateDrawingSettings($activeBoard.id, undefined, width);
	}

	function clearAll() {
		if (!$activeBoard) return;
		if (confirm('Clear all drawings? This cannot be undone.')) {
			storyboardStore.clearDrawings($activeBoard.id);
		}
	}

	let currentColor = $derived($activeBoard?.settings.drawingColor || '#a855f7');
	let currentWidth = $derived($activeBoard?.settings.drawingWidth || 2);
</script>

{#if $boardMode === 'draw'}
	<div class="drawing-tools">
		<div class="tools-section">
			<span class="section-label">Color</span>
			<div class="color-picker">
				{#each colors as color}
					<button
						class="color-btn {currentColor === color.value ? 'active' : ''}"
						style="background: {color.value}"
						onclick={() => setColor(color.value)}
						title={color.name}
						aria-label="Select {color.name}"
					></button>
				{/each}
			</div>
		</div>

		<div class="tools-section">
			<span class="section-label">Stroke Width</span>
			<div class="width-picker">
				{#each widths as width}
					<button
						class="width-btn {currentWidth === width ? 'active' : ''}"
						onclick={() => setWidth(width)}
						title="{width}px"
					>
						<div class="width-preview" style="height: {width}px; background: {currentColor}"></div>
					</button>
				{/each}
			</div>
		</div>

		<div class="tools-section">
			<button onclick={clearAll} class="clear-btn" title="Clear All Drawings">
				<span class="icon">🗑️</span>
				<span>Clear All</span>
			</button>
		</div>
	</div>
{/if}

<style>
	.drawing-tools {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		padding: 0.75rem 1rem;
		background: rgb(30 27 75 / 0.95);
		border-bottom: 1px solid rgb(168 85 247 / 0.2);
		backdrop-filter: blur(8px);
	}

	.tools-section {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.section-label {
		font-size: 0.75rem;
		color: rgb(216 180 254);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.color-picker {
		display: flex;
		gap: 0.375rem;
	}

	.color-btn {
		width: 2rem;
		height: 2rem;
		border-radius: 0.375rem;
		border: 2px solid transparent;
		cursor: pointer;
		transition: all 0.2s;
		position: relative;
	}

	.color-btn:hover {
		transform: scale(1.1);
		border-color: rgb(168 85 247 / 0.5);
	}

	.color-btn.active {
		border-color: rgb(168 85 247);
		box-shadow: 0 0 0 2px rgb(168 85 247 / 0.3);
		transform: scale(1.1);
	}

	.width-picker {
		display: flex;
		gap: 0.375rem;
	}

	.width-btn {
		width: 2.5rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgb(168 85 247 / 0.1);
		border: 2px solid rgb(168 85 247 / 0.2);
		border-radius: 0.375rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.width-btn:hover {
		background: rgb(168 85 247 / 0.2);
		border-color: rgb(168 85 247 / 0.4);
	}

	.width-btn.active {
		background: rgb(168 85 247 / 0.3);
		border-color: rgb(168 85 247);
		box-shadow: 0 0 0 2px rgb(168 85 247 / 0.2);
	}

	.width-preview {
		width: 1.5rem;
		border-radius: 9999px;
		transition: all 0.2s;
	}

	.clear-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: rgb(220 38 38 / 0.2);
		border: 1px solid rgb(220 38 38 / 0.3);
		border-radius: 0.5rem;
		color: rgb(252 165 165);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
	}

	.clear-btn:hover {
		background: rgb(220 38 38 / 0.3);
		border-color: rgb(220 38 38 / 0.5);
		transform: translateY(-1px);
	}

	.icon {
		font-size: 1.125rem;
		line-height: 1;
	}
</style>
