<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import BurgerMenu from '$lib/components/BurgerMenu.svelte';
	import OracleImageModal from '$lib/components/OracleImageModal.svelte';

	let { children } = $props();

	let isOracleModalOpen = $state(false);

	function openOracleModal() {
		isOracleModalOpen = true;
	}

	function closeOracleModal() {
		isOracleModalOpen = false;
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<BurgerMenu onOracleImageClick={openOracleModal} />
<OracleImageModal bind:isOpen={isOracleModalOpen} onClose={closeOracleModal} />

{@render children()}
