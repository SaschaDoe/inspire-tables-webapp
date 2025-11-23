<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import BurgerMenu from '$lib/components/BurgerMenu.svelte';
	import OracleImageModal from '$lib/components/OracleImageModal.svelte';
	import { migrateFromLocalStorage } from '$lib/db/migration';

	let { children } = $props();

	let isOracleModalOpen = $state(false);
	let migrationStatus = $state<'pending' | 'running' | 'complete' | 'error'>('pending');
	let migrationError = $state<string | null>(null);

	// Run migration on mount
	onMount(async () => {
		if (!browser) return;

		try {
			migrationStatus = 'running';
			const result = await migrateFromLocalStorage();

			if (result.success) {
				console.log('[Migration] Migration successful', {
					alreadyMigrated: result.alreadyMigrated
				});
			}

			migrationStatus = 'complete';
		} catch (error) {
			console.error('[Migration] Migration failed:', error);
			migrationStatus = 'error';
			migrationError = error instanceof Error ? error.message : 'Unknown error occurred';
		}
	});

	async function retryMigration() {
		migrationError = null;
		migrationStatus = 'running';

		try {
			await migrateFromLocalStorage();
			migrationStatus = 'complete';
		} catch (error) {
			console.error('[Migration] Retry failed:', error);
			migrationStatus = 'error';
			migrationError = error instanceof Error ? error.message : 'Unknown error occurred';
		}
	}

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

{#if migrationStatus === 'running'}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-90"
		role="alert"
		aria-live="polite"
	>
		<div class="text-center">
			<div class="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
			<p class="text-xl text-white">Upgrading storage...</p>
			<p class="mt-2 text-sm text-gray-400">Please wait, this will only happen once.</p>
		</div>
	</div>
{:else if migrationStatus === 'error'}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-90"
		role="alert"
		aria-live="assertive"
	>
		<div class="max-w-md rounded-lg bg-gray-800 p-6 text-center">
			<div class="mb-4 text-4xl">⚠️</div>
			<h2 class="mb-2 text-xl font-bold text-white">Storage Upgrade Failed</h2>
			<p class="mb-4 text-sm text-gray-300">
				{migrationError || 'An unknown error occurred during storage upgrade.'}
			</p>
			<button
				onclick={retryMigration}
				class="rounded bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
			>
				Retry
			</button>
		</div>
	</div>
{/if}

{@render children()}
