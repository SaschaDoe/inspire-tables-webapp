<script lang="ts">
	import { entityStore } from '$lib/stores/entityStore';

	interface Props {
		onOracleImageClick: () => void;
	}

	let { onOracleImageClick }: Props = $props();

	let isOpen = $state(false);

	function toggleMenu() {
		isOpen = !isOpen;
	}

	function handleOracleClick() {
		onOracleImageClick();
		isOpen = false;
	}

	function handleRemoveAllEntities() {
		const confirmed = confirm(
			'⚠️ WARNING: This will permanently delete ALL entities, campaigns, and data!\n\n' +
			'This action cannot be undone.\n\n' +
			'Are you absolutely sure you want to continue?'
		);

		if (confirmed) {
			entityStore.clearAll();
			isOpen = false;

			// Reload the page to reset UI state
			window.location.reload();
		}
	}
</script>

<!-- Burger Menu Button -->
<div class="burger-menu-container">
	<button onclick={toggleMenu} class="burger-button" aria-label="Toggle menu">
		<div class="burger-icon" class:open={isOpen}>
			<span></span>
			<span></span>
			<span></span>
		</div>
	</button>

	<!-- Menu Overlay -->
	{#if isOpen}
		<div class="menu-overlay" onclick={toggleMenu}></div>
	{/if}

	<!-- Slide-out Menu -->
	<div class="menu-panel" class:open={isOpen}>
		<div class="menu-header">
			<h2 class="menu-title">Menu</h2>
			<button onclick={toggleMenu} class="close-btn">✕</button>
		</div>

		<nav class="menu-nav">
			<ul class="menu-list">
				<li>
					<a href="/" class="menu-item">
						<span class="menu-icon">🏠</span>
						<span class="menu-label">Home</span>
					</a>
				</li>
				<li>
					<a href="/tables" class="menu-item">
						<span class="menu-icon">📊</span>
						<span class="menu-label">Tables</span>
					</a>
				</li>
				<li>
					<a href="/workspace" class="menu-item">
						<span class="menu-icon">💼</span>
						<span class="menu-label">Workspace</span>
					</a>
				</li>
				<li>
					<a href="/campaigns" class="menu-item">
						<span class="menu-icon">🎭</span>
						<span class="menu-label">Campaigns</span>
					</a>
				</li>
				<li>
					<a href="/solo-rpg" class="menu-item">
						<span class="menu-icon">🎲</span>
						<span class="menu-label">Solo RPG</span>
					</a>
				</li>
				<li>
					<button onclick={handleOracleClick} class="menu-item menu-button">
						<span class="menu-icon">🔮</span>
						<span class="menu-label">Oracle Image</span>
					</button>
				</li>
				<li>
					<hr class="menu-divider" />
				</li>
				<li>
					<button onclick={handleRemoveAllEntities} class="menu-item menu-button danger">
						<span class="menu-icon">🗑️</span>
						<span class="menu-label">Remove All Entities</span>
					</button>
				</li>
			</ul>
		</nav>
	</div>
</div>

<style>
	.burger-menu-container {
		position: fixed;
		top: 1rem;
		left: 1rem;
		z-index: 1000;
	}

	.burger-button {
		width: 50px;
		height: 50px;
		background: linear-gradient(135deg, rgb(168 85 247), rgb(192 132 252));
		border: 2px solid rgb(168 85 247 / 0.3);
		border-radius: 0.75rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s;
		box-shadow: 0 4px 6px -1px rgba(168, 85, 247, 0.3);
	}

	.burger-button:hover {
		background: linear-gradient(135deg, rgb(192 132 252), rgb(216 180 254));
		transform: scale(1.05);
		box-shadow: 0 10px 15px -3px rgba(168, 85, 247, 0.4);
	}

	.burger-icon {
		width: 24px;
		height: 20px;
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.burger-icon span {
		display: block;
		height: 3px;
		width: 100%;
		background: white;
		border-radius: 3px;
		transition: all 0.3s;
	}

	.burger-icon.open span:nth-child(1) {
		transform: translateY(8.5px) rotate(45deg);
	}

	.burger-icon.open span:nth-child(2) {
		opacity: 0;
	}

	.burger-icon.open span:nth-child(3) {
		transform: translateY(-8.5px) rotate(-45deg);
	}

	.menu-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 999;
		animation: fadeIn 0.3s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.menu-panel {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		width: 280px;
		background: linear-gradient(to bottom, rgb(30 27 75), rgb(88 28 135 / 0.9));
		border-right: 2px solid rgb(168 85 247 / 0.3);
		box-shadow: 4px 0 20px rgba(0, 0, 0, 0.5);
		z-index: 1000;
		transform: translateX(-100%);
		transition: transform 0.3s ease-out;
		display: flex;
		flex-direction: column;
	}

	.menu-panel.open {
		transform: translateX(0);
	}

	.menu-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem;
		border-bottom: 1px solid rgb(168 85 247 / 0.2);
	}

	.menu-title {
		font-size: 1.5rem;
		font-weight: bold;
		color: white;
		margin: 0;
	}

	.close-btn {
		background: transparent;
		border: none;
		color: rgb(216 180 254);
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		transition: all 0.2s;
	}

	.close-btn:hover {
		background: rgb(168 85 247 / 0.2);
		color: white;
	}

	.menu-nav {
		flex: 1;
		overflow-y: auto;
		padding: 1rem 0;
	}

	.menu-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.menu-list li {
		margin: 0;
	}

	.menu-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem 1.5rem;
		color: rgb(216 180 254);
		text-decoration: none;
		transition: all 0.2s;
		border: none;
		background: transparent;
		width: 100%;
		text-align: left;
		cursor: pointer;
		font-size: 1rem;
	}

	.menu-item:hover {
		background: rgb(168 85 247 / 0.2);
		color: white;
	}

	.menu-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
	}

	.menu-label {
		font-size: 1rem;
		font-weight: 500;
	}

	.menu-button {
		font-family: inherit;
	}

	.menu-divider {
		border: none;
		border-top: 1px solid rgb(168 85 247 / 0.2);
		margin: 0.5rem 1rem;
	}

	.menu-item.danger {
		color: rgb(248 113 113);
	}

	.menu-item.danger:hover {
		background: rgb(220 38 38 / 0.2);
		color: rgb(252 165 165);
	}
</style>
