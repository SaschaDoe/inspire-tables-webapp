<script lang="ts">
	import type { Campaign } from '$lib/entities/campaign';

	interface Props {
		campaign: Campaign;
		parentEntity?: any;
	}

	let { campaign, parentEntity }: Props = $props();
</script>

<div class="campaign-viewer">
	<!-- Campaign viewer is intentionally empty - all editing is done in the property editor above -->
</div>

<style>
	.campaign-viewer {
		padding: 0;
	}
</style>
