<script lang="ts">
	interface Props {
		title: string;
	}

	let { title }: Props = $props();
</script>

<h3 class="section-title">{title}</h3>

<style>
	.section-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: rgb(216 180 254);
		margin-bottom: 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid rgb(168 85 247 / 0.2);
	}
</style>
