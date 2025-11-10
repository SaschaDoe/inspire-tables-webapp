<script lang="ts">
	interface Props {
		gridSize?: number;
		showGrid?: boolean;
	}

	let { gridSize = 20, showGrid = true }: Props = $props();
</script>

{#if showGrid}
	<defs>
		<pattern
			id="grid-pattern"
			x="0"
			y="0"
			width={gridSize}
			height={gridSize}
			patternUnits="userSpaceOnUse"
		>
			<circle cx={gridSize / 2} cy={gridSize / 2} r="1" fill="rgb(168 85 247 / 0.2)" />
		</pattern>
	</defs>
	<rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#grid-pattern)" />
{/if}
