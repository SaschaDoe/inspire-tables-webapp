<script lang="ts">
	import SectionTitle from './SectionTitle.svelte';

	interface Props {
		title: string;
		children: any;
	}

	let { title, children }: Props = $props();
</script>

<div class="section">
	<SectionTitle {title} />
	{@render children()}
</div>

<style>
	.section {
		margin-bottom: 2rem;
	}
</style>
