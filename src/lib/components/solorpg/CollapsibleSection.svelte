<script lang="ts">
	/**
	 * Collapsible Section Component
	 * Provides expandable/collapsible sections with persistent state
	 */

	interface Props {
		title: string;
		startExpanded?: boolean;
		rememberState?: boolean;
		stateKey?: string;
		icon?: string;
	}

	let {
		title,
		startExpanded = true,
		rememberState = true,
		stateKey = '',
		icon = ''
	}: Props = $props();

	// Load saved state from localStorage
	function getInitialState(): boolean {
		if (rememberState && stateKey && typeof window !== 'undefined') {
			const saved = localStorage.getItem(`collapsible-${stateKey}`);
			if (saved !== null) {
				return saved === 'true';
			}
		}
		return startExpanded;
	}

	let isExpanded = $state(getInitialState());

	function toggle() {
		isExpanded = !isExpanded;

		// Save state to localStorage
		if (rememberState && stateKey && typeof window !== 'undefined') {
			localStorage.setItem(`collapsible-${stateKey}`, String(isExpanded));
		}
	}
</script>

<div class="collapsible-section">
	<!-- Header -->
	<button
		onclick={toggle}
		class="section-header"
		aria-expanded={isExpanded}
		type="button"
	>
		<div class="header-content">
			{#if icon}
				<span class="header-icon">{icon}</span>
			{/if}
			<span class="header-title">{title}</span>
		</div>
		<span class="toggle-icon" class:expanded={isExpanded}>
			{isExpanded ? '▼' : '▶'}
		</span>
	</button>

	<!-- Content -->
	{#if isExpanded}
		<div class="section-content">
			{@render children?.()}
		</div>
	{/if}
</div>

<style>
	.collapsible-section {
		margin-bottom: 1rem;
		border: 1px solid rgba(139, 92, 246, 0.2);
		border-radius: 0.5rem;
		background: rgba(30, 41, 59, 0.3);
		overflow: hidden;
	}

	.section-header {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.25rem;
		background: rgba(139, 92, 246, 0.1);
		border: none;
		cursor: pointer;
		transition: background 0.2s;
		color: white;
		font-size: 1.125rem;
		font-weight: 600;
	}

	.section-header:hover {
		background: rgba(139, 92, 246, 0.15);
	}

	.header-content {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.header-icon {
		font-size: 1.5rem;
	}

	.header-title {
		font-size: 1.125rem;
		font-weight: 600;
	}

	.toggle-icon {
		font-size: 0.875rem;
		color: rgba(139, 92, 246, 0.7);
		transition: transform 0.2s;
	}

	.toggle-icon.expanded {
		transform: rotate(0deg);
	}

	.section-content {
		padding: 1.25rem;
		animation: slideDown 0.2s ease-out;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Mobile responsive */
	@media (max-width: 640px) {
		.section-header {
			padding: 0.875rem 1rem;
		}

		.header-title {
			font-size: 1rem;
		}

		.section-content {
			padding: 1rem;
		}
	}
</style>
