<script lang="ts">
	// Lists Panel Component - Manages Threads and Characters Lists
	import { soloRpgStore } from '$lib/stores/soloRpgStore.svelte';
	import { rollOnList } from '$lib/utils/mythicDice';
	import ThreadDiscoveryModal from './ThreadDiscoveryModal.svelte';
	import CharacterBackstoryGenerator from './CharacterBackstoryGenerator.svelte';

	// State for adding new items
	let newThreadText = $state('');
	let newCharacterName = $state('');
	let newCharacterDesc = $state('');
	let showThreadForm = $state(false);
	let showCharacterForm = $state(false);
	let showBackstoryGenerator = $state(false);
	let rollResult = $state<string>('');
	let showThreadDiscoveryModal = $state(false);
	let expandedCharacterId = $state<string | null>(null);
	let editingCharacterDesc = $state<{[key: string]: string}>({});

	// Derived data from store
	let threads = $derived(soloRpgStore.currentSession?.threads || []);
	let characters = $derived(soloRpgStore.currentSession?.characters || []);
	let activeThreads = $derived(threads.filter(t => !t.completed));
	let activeCharacters = $derived(characters.filter(c => c.active));
	let inactiveCharacters = $derived(characters.filter(c => !c.active));

	// Thread functions
	function addThread() {
		if (newThreadText.trim() && threads.length < 25) {
			soloRpgStore.addThread(newThreadText.trim());
			newThreadText = '';
			showThreadForm = false;
		}
	}

	function toggleThreadComplete(id: string) {
		const thread = threads.find(t => t.id === id);
		if (thread) {
			if (thread.completed) {
				soloRpgStore.updateThread(id, { completed: false });
			} else {
				soloRpgStore.completeThread(id);
			}
		}
	}

	function removeThread(id: string) {
		if (confirm('Remove this thread?')) {
			soloRpgStore.removeThread(id);
		}
	}

	// Character functions
	function addCharacter() {
		if (newCharacterName.trim() && characters.length < 25) {
			soloRpgStore.addCharacter(newCharacterName.trim(), newCharacterDesc.trim());
			newCharacterName = '';
			newCharacterDesc = '';
			showCharacterForm = false;
		}
	}

	function toggleCharacterActive(id: string) {
		soloRpgStore.toggleCharacterActive(id);
	}

	function removeCharacter(id: string) {
		if (confirm('Remove this character?')) {
			soloRpgStore.removeCharacter(id);
		}
	}

	function toggleCharacterExpand(id: string) {
		if (expandedCharacterId === id) {
			expandedCharacterId = null;
		} else {
			expandedCharacterId = id;
			const character = characters.find(c => c.id === id);
			if (character && !editingCharacterDesc[id]) {
				editingCharacterDesc[id] = character.description;
			}
		}
	}

	function saveCharacterDescription(id: string) {
		const desc = editingCharacterDesc[id];
		if (desc !== undefined) {
			soloRpgStore.updateCharacter(id, { description: desc });
		}
	}

	// Roll on list
	function rollOnThreads() {
		if (activeThreads.length === 0) {
			rollResult = 'No active threads!';
			return;
		}

		const result = rollOnList(activeThreads.length);
		if (result.position === 0) {
			rollResult = 'Choose any thread';
		} else {
			const thread = activeThreads[result.position - 1];
			if (thread) {
				rollResult = `Position ${result.position}: ${thread.text}`;
			} else {
				// Position exceeds list size, treat as "choose"
				rollResult = 'Choose any thread';
			}
		}

		setTimeout(() => rollResult = '', 5000);
	}

	function rollOnCharacters() {
		if (activeCharacters.length === 0) {
			rollResult = 'No active characters!';
			return;
		}

		const result = rollOnList(activeCharacters.length);
		if (result.position === 0) {
			rollResult = 'Choose any character';
		} else {
			const character = activeCharacters[result.position - 1];
			if (character) {
				rollResult = `Position ${result.position}: ${character.name}`;
			} else {
				// Position exceeds list size, treat as "choose"
				rollResult = 'Choose any character';
			}
		}

		setTimeout(() => rollResult = '', 5000);
	}
</script>

<div class="lists-panel grid md:grid-cols-2 gap-6">
	<!-- Threads List -->
	<div class="threads-section bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-xl">
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center gap-2">
				<span class="text-3xl">📋</span>
				<h3 class="text-xl font-bold text-white">Threads</h3>
				<span class="text-sm text-slate-500">({activeThreads.length}/25)</span>
			</div>
			<div class="flex gap-2">
				{#if activeThreads.length > 0}
					<button
						onclick={rollOnThreads}
						class="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded-lg transition-colors flex items-center gap-1"
						title="Randomly select a thread"
					>
						<span>🎲</span>
						<span>Random</span>
					</button>
				{/if}
				<button
					onclick={() => showThreadDiscoveryModal = true}
					class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors flex items-center gap-1"
					title="Discover new thread (Mythic Variations)"
				>
					<span>🔍</span>
					<span>Discover</span>
				</button>
				<button
					onclick={() => showThreadForm = !showThreadForm}
					class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-colors"
				>
					+ Add
				</button>
			</div>
		</div>

		<!-- Add Thread Form -->
		{#if showThreadForm}
			<div class="mb-4 p-4 bg-slate-800/50 rounded-lg border border-purple-500/30">
				<input
					type="text"
					bind:value={newThreadText}
					placeholder="New thread/goal..."
					class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500 mb-2"
					onkeydown={(e) => e.key === 'Enter' && addThread()}
				/>
				<div class="flex gap-2">
					<button
						onclick={addThread}
						disabled={!newThreadText.trim()}
						class="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:opacity-50 text-white text-sm rounded transition-colors"
					>
						Add Thread
					</button>
					<button
						onclick={() => showThreadForm = false}
						class="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors"
					>
						Cancel
					</button>
				</div>
			</div>
		{/if}

		<!-- Threads List -->
		<div class="space-y-2 mb-4 max-h-96 overflow-y-auto">
			{#if activeThreads.length === 0}
				<div class="text-center py-8 text-slate-500">
					<p class="text-sm">No active threads</p>
					<p class="text-xs mt-1">Add story goals and plot lines</p>
				</div>
			{:else}
				{#each activeThreads as thread, index (thread.id)}
					<div class="group flex items-start gap-2 p-3 bg-slate-800/30 hover:bg-slate-800/50 rounded-lg border border-transparent hover:border-purple-500/30 transition-all">
						<button
							onclick={() => toggleThreadComplete(thread.id)}
							class="mt-0.5 w-5 h-5 rounded border-2 border-purple-500 hover:bg-purple-500/20 transition-colors flex-shrink-0"
							aria-label="Mark complete"
						>
							{#if thread.completed}
								<span class="text-purple-400 text-xs">✓</span>
							{/if}
						</button>
						<div class="flex-1 min-w-0">
							<div class="text-sm text-white break-words {thread.completed ? 'line-through text-slate-500' : ''}">
								{index + 1}. {thread.text}
							</div>
						</div>
						<button
							onclick={() => {
								if (confirm(`Convert "${thread.text}" to Mystery Mode?\n\nThis will remove it from Threads and activate the Mystery Matrix.`)) {
									soloRpgStore.activateMystery(thread.text);
								}
							}}
							class="opacity-0 group-hover:opacity-100 text-yellow-400 hover:text-yellow-300 text-xs transition-opacity flex-shrink-0"
							aria-label="Convert to Mystery"
							title="Convert to Mystery"
						>
							🔍
						</button>
						<button
							onclick={() => removeThread(thread.id)}
							class="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs transition-opacity flex-shrink-0"
							aria-label="Remove"
						>
							✕
						</button>
					</div>
				{/each}
			{/if}
		</div>
	</div>

	<!-- Characters List -->
	<div class="characters-section bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/20 shadow-xl">
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center gap-2">
				<span class="text-3xl">👥</span>
				<h3 class="text-xl font-bold text-white">Characters</h3>
				<span class="text-sm text-slate-500">({activeCharacters.length}/25)</span>
			</div>
			<div class="flex gap-2">
				{#if activeCharacters.length > 0}
					<button
						onclick={rollOnCharacters}
						class="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded-lg transition-colors flex items-center gap-1"
						title="Randomly select a character"
					>
						<span>🎲</span>
						<span>Random</span>
					</button>
				{/if}
				<button
					onclick={() => showCharacterForm = !showCharacterForm}
					class="px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white text-xs rounded-lg transition-colors flex items-center gap-1"
					title="Quick add character"
				>
					<span>⚡</span>
					<span>Quick Add</span>
				</button>
				<button
					onclick={() => showBackstoryGenerator = true}
					class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-colors flex items-center gap-1"
					title="Generate character with backstory"
				>
					<span>✨</span>
					<span>Generate</span>
				</button>
			</div>
		</div>

		<!-- Add Character Form -->
		{#if showCharacterForm}
			<div class="mb-4 p-4 bg-slate-800/50 rounded-lg border border-cyan-500/30">
				<input
					type="text"
					bind:value={newCharacterName}
					placeholder="Character name..."
					class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500 mb-2"
				/>
				<input
					type="text"
					bind:value={newCharacterDesc}
					placeholder="Description (optional)..."
					class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500 mb-2"
				/>
				<div class="flex gap-2">
					<button
						onclick={addCharacter}
						disabled={!newCharacterName.trim()}
						class="flex-1 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 disabled:opacity-50 text-white text-sm rounded transition-colors"
					>
						Add Character
					</button>
					<button
						onclick={() => showCharacterForm = false}
						class="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors"
					>
						Cancel
					</button>
				</div>
			</div>
		{/if}

		<!-- Characters List -->
		<div class="space-y-2 mb-4 max-h-96 overflow-y-auto">
			{#if activeCharacters.length === 0 && inactiveCharacters.length === 0}
				<div class="text-center py-8 text-slate-500">
					<p class="text-sm">No characters</p>
					<p class="text-xs mt-1">Add NPCs and important people</p>
				</div>
			{:else}
				<!-- Active Characters -->
				{#if activeCharacters.length > 0}
					<div class="text-xs font-bold text-cyan-300 mb-2">Active ({activeCharacters.length})</div>
					{#each activeCharacters as character, index (character.id)}
						<div class="group bg-slate-800/30 hover:bg-slate-800/50 rounded-lg border border-transparent hover:border-cyan-500/30 transition-all">
							<div class="flex items-start gap-2 p-3 cursor-pointer" onclick={() => toggleCharacterExpand(character.id)}>
								<button
									onclick={(e) => {
										e.stopPropagation();
										toggleCharacterActive(character.id);
									}}
									class="mt-0.5 w-5 h-5 rounded border-2 border-cyan-500 bg-cyan-500/30 hover:bg-cyan-500/50 transition-colors flex-shrink-0 flex items-center justify-center"
									aria-label="Toggle active"
									title="Mark as inactive (won't appear in random rolls)"
								>
									<span class="text-cyan-200 text-xs font-bold">✓</span>
								</button>
								<div class="flex-1 min-w-0">
									<div class="text-sm font-medium text-white break-words flex items-center gap-2">
										<span>{index + 1}. {character.name}</span>
										{#if character.description}
											<span class="text-xs text-cyan-400">📝</span>
										{/if}
									</div>
									{#if character.description && expandedCharacterId !== character.id}
										<div class="text-xs text-slate-400 mt-1 break-words line-clamp-2">
											{character.description}
										</div>
									{/if}
								</div>
								<button
									onclick={(e) => {
										e.stopPropagation();
										removeCharacter(character.id);
									}}
									class="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs transition-opacity flex-shrink-0"
									aria-label="Remove"
								>
									✕
								</button>
							</div>

							{#if expandedCharacterId === character.id}
								<div class="px-3 pb-3 border-t border-slate-700 pt-3" onclick={(e) => e.stopPropagation()}>
									<label class="block text-xs text-slate-400 mb-2">Description / Backstory:</label>
									<textarea
										bind:value={editingCharacterDesc[character.id]}
										placeholder="Add character description, backstory, notes..."
										class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
										rows="4"
									></textarea>
									<div class="flex gap-2 mt-2">
										<button
											onclick={() => {
												saveCharacterDescription(character.id);
												expandedCharacterId = null;
											}}
											class="flex-1 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs rounded transition-colors"
										>
											Save
										</button>
										<button
											onclick={() => expandedCharacterId = null}
											class="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded transition-colors"
										>
											Cancel
										</button>
									</div>
								</div>
							{/if}
						</div>
					{/each}
				{/if}

				<!-- Inactive Characters -->
				{#if inactiveCharacters.length > 0}
					<details class="mt-4">
						<summary class="text-xs font-bold text-slate-400 cursor-pointer hover:text-slate-300 mb-2">
							Inactive ({inactiveCharacters.length})
						</summary>
						<div class="space-y-2 mt-2">
							{#each inactiveCharacters as character (character.id)}
								<div class="group bg-slate-800/20 hover:bg-slate-800/30 rounded-lg border border-slate-600/30 transition-all opacity-60">
									<div class="flex items-start gap-2 p-3 cursor-pointer" onclick={() => toggleCharacterExpand(character.id)}>
										<button
											onclick={(e) => {
												e.stopPropagation();
												toggleCharacterActive(character.id);
											}}
											class="mt-0.5 w-5 h-5 rounded border-2 border-slate-500 hover:bg-slate-500/20 transition-colors flex-shrink-0"
											aria-label="Toggle active"
											title="Mark as active (will appear in random rolls)"
										>
										</button>
										<div class="flex-1 min-w-0">
											<div class="text-sm font-medium text-slate-400 break-words flex items-center gap-2">
												<span>{character.name}</span>
												{#if character.description}
													<span class="text-xs text-slate-500">📝</span>
												{/if}
											</div>
											{#if character.description && expandedCharacterId !== character.id}
												<div class="text-xs text-slate-500 mt-1 break-words line-clamp-2">
													{character.description}
												</div>
											{/if}
										</div>
										<button
											onclick={(e) => {
												e.stopPropagation();
												removeCharacter(character.id);
											}}
											class="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs transition-opacity flex-shrink-0"
											aria-label="Remove"
										>
											✕
										</button>
									</div>

									{#if expandedCharacterId === character.id}
										<div class="px-3 pb-3 border-t border-slate-700 pt-3" onclick={(e) => e.stopPropagation()}>
											<label class="block text-xs text-slate-400 mb-2">Description / Backstory:</label>
											<textarea
												bind:value={editingCharacterDesc[character.id]}
												placeholder="Add character description, backstory, notes..."
												class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
												rows="4"
											></textarea>
											<div class="flex gap-2 mt-2">
												<button
													onclick={() => {
														saveCharacterDescription(character.id);
														expandedCharacterId = null;
													}}
													class="flex-1 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs rounded transition-colors"
												>
													Save
												</button>
												<button
													onclick={() => expandedCharacterId = null}
													class="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded transition-colors"
												>
													Cancel
												</button>
											</div>
										</div>
									{/if}
								</div>
							{/each}
						</div>
					</details>
				{/if}
			{/if}
		</div>
	</div>
</div>

<!-- Roll Result Toast -->
{#if rollResult}
	<div class="fixed bottom-4 right-4 p-4 bg-orange-600 text-white rounded-lg shadow-2xl animate-slide-up z-50 max-w-md">
		<div class="font-medium">{rollResult}</div>
	</div>
{/if}

<!-- Thread Discovery Modal -->
<ThreadDiscoveryModal
	isOpen={showThreadDiscoveryModal}
	onClose={() => showThreadDiscoveryModal = false}
/>

<!-- Character Backstory Generator -->
<CharacterBackstoryGenerator
	isOpen={showBackstoryGenerator}
	onClose={() => showBackstoryGenerator = false}
/>

<style>
	@keyframes slide-up {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-slide-up {
		animation: slide-up 0.3s ease-out;
	}
</style>
