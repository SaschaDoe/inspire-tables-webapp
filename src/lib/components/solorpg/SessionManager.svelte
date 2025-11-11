<script lang="ts">
	// Session Manager Component
	// Handles session load/save/export/import UI

	import { soloRpgStore } from '$lib/stores/soloRpgStore.svelte';
	import type { SoloRpgSession } from '$lib/stores/soloRpgStore.svelte';

	interface Props {
		onClose?: () => void;
	}

	let { onClose }: Props = $props();

	// State
	let activeView = $state<'sessions' | 'new' | 'export' | 'import'>('sessions');
	let newSessionName = $state('');
	let newSessionDesc = $state('');
	let exportData = $state('');
	let importData = $state('');
	let importError = $state('');
	let selectedSessionId = $state<string | null>(null);

	// Derived
	let allSessions = $derived(soloRpgStore.allSessions);
	let currentSession = $derived(soloRpgStore.currentSession);
	let sortedSessions = $derived(
		[...allSessions].sort((a, b) =>
			new Date(b.lastPlayedAt).getTime() - new Date(a.lastPlayedAt).getTime()
		)
	);

	// Functions
	function createSession() {
		if (newSessionName.trim()) {
			soloRpgStore.createSession(newSessionName.trim(), newSessionDesc.trim());
			newSessionName = '';
			newSessionDesc = '';
			activeView = 'sessions';
		}
	}

	function loadSession(id: string) {
		soloRpgStore.loadSession(id);
		onClose?.();
	}

	function deleteSession(id: string) {
		if (confirm('Are you sure you want to delete this session? This cannot be undone.')) {
			soloRpgStore.deleteSession(id);
		}
	}

	function exportSession(id: string) {
		try {
			exportData = soloRpgStore.exportSession(id);
			selectedSessionId = id;
			activeView = 'export';
		} catch (error) {
			alert('Failed to export session');
		}
	}

	function copyExportData() {
		navigator.clipboard.writeText(exportData);
		alert('Copied to clipboard!');
	}

	function downloadExportData() {
		const session = allSessions.find(s => s.id === selectedSessionId);
		const filename = session ? `${session.adventureName.replace(/[^a-z0-9]/gi, '_')}.json` : 'session.json';

		const blob = new Blob([exportData], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	}

	function importSession() {
		try {
			soloRpgStore.importSession(importData);
			importData = '';
			importError = '';
			activeView = 'sessions';
			alert('Session imported successfully!');
		} catch (error) {
			importError = 'Invalid session data. Please check the JSON format.';
		}
	}

	function formatDate(date: Date): string {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<!-- Modal Overlay -->
<div class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
	<div class="bg-slate-900 rounded-2xl border border-orange-500/30 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
		<!-- Header -->
		<div class="flex items-center justify-between p-6 border-b border-orange-500/20">
			<div class="flex items-center gap-3">
				<span class="text-3xl">💾</span>
				<h2 class="text-2xl font-bold text-white">Session Manager</h2>
			</div>
			<button
				onclick={onClose}
				class="text-slate-400 hover:text-white transition-colors text-2xl"
			>
				✕
			</button>
		</div>

		<!-- View Tabs -->
		<div class="flex gap-2 px-6 pt-4 border-b border-orange-500/10">
			<button
				onclick={() => activeView = 'sessions'}
				class="px-4 py-2 font-medium transition-colors rounded-t-lg {activeView === 'sessions' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}"
			>
				My Sessions
			</button>
			<button
				onclick={() => activeView = 'new'}
				class="px-4 py-2 font-medium transition-colors rounded-t-lg {activeView === 'new' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}"
			>
				+ New
			</button>
			<button
				onclick={() => activeView = 'import'}
				class="px-4 py-2 font-medium transition-colors rounded-t-lg {activeView === 'import' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}"
			>
				Import
			</button>
		</div>

		<!-- Content -->
		<div class="flex-1 overflow-y-auto p-6">
			<!-- Sessions List View -->
			{#if activeView === 'sessions'}
				{#if sortedSessions.length === 0}
					<div class="text-center py-20">
						<div class="text-6xl mb-4">📁</div>
						<h3 class="text-xl font-bold text-white mb-2">No Sessions Yet</h3>
						<p class="text-slate-400 mb-6">Create your first Solo RPG session to get started</p>
						<button
							onclick={() => activeView = 'new'}
							class="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
						>
							Create Session
						</button>
					</div>
				{:else}
					<div class="space-y-3">
						{#each sortedSessions as session (session.id)}
							<div class="group p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-slate-700 hover:border-orange-500/50 transition-all">
								<div class="flex items-start justify-between gap-4">
									<div class="flex-1 min-w-0">
										<div class="flex items-center gap-2 mb-1">
											<h3 class="text-lg font-bold text-white truncate">{session.adventureName}</h3>
											{#if session.id === currentSession?.id}
												<span class="px-2 py-0.5 bg-green-600/20 text-green-400 text-xs rounded flex-shrink-0">
													Current
												</span>
											{/if}
										</div>
										{#if session.adventureDescription}
											<p class="text-sm text-slate-400 mb-2 line-clamp-2">{session.adventureDescription}</p>
										{/if}
										<div class="flex flex-wrap gap-3 text-xs text-slate-500">
											<div class="flex items-center gap-1">
												<span>🎬</span>
												<span>Scene {session.currentSceneNumber}</span>
											</div>
											<div class="flex items-center gap-1">
												<span>📋</span>
												<span>{session.threads.filter(t => !t.completed).length} threads</span>
											</div>
											<div class="flex items-center gap-1">
												<span>👥</span>
												<span>{session.characters.filter(c => c.active).length} characters</span>
											</div>
											<div class="flex items-center gap-1">
												<span>🎲</span>
												<span>CF {session.chaosFactor}</span>
											</div>
										</div>
										<div class="text-xs text-slate-600 mt-2">
											Last played: {formatDate(session.lastPlayedAt)}
										</div>
									</div>

									<!-- Action Buttons -->
									<div class="flex flex-col gap-2">
										{#if session.id !== currentSession?.id}
											<button
												onclick={() => loadSession(session.id)}
												class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded transition-colors whitespace-nowrap"
											>
												Load
											</button>
										{/if}
										<button
											onclick={() => exportSession(session.id)}
											class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors whitespace-nowrap"
										>
											Export
										</button>
										<button
											onclick={() => deleteSession(session.id)}
											class="px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 text-sm rounded transition-colors whitespace-nowrap"
										>
											Delete
										</button>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			{/if}

			<!-- New Session View -->
			{#if activeView === 'new'}
				<div class="max-w-2xl mx-auto space-y-4">
					<div>
						<label class="block text-sm font-medium text-white mb-2">
							Adventure Name <span class="text-red-400">*</span>
						</label>
						<input
							type="text"
							bind:value={newSessionName}
							placeholder="e.g., The Lost Temple, Starship Investigation, etc."
							class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
							onkeydown={(e) => e.key === 'Enter' && createSession()}
						/>
					</div>

					<div>
						<label class="block text-sm font-medium text-white mb-2">
							Description (Optional)
						</label>
						<textarea
							bind:value={newSessionDesc}
							placeholder="Brief description of your adventure setup, characters, setting, etc."
							class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 min-h-32 resize-y"
						></textarea>
					</div>

					<div class="flex gap-3">
						<button
							onclick={createSession}
							disabled={!newSessionName.trim()}
							class="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
						>
							Create Session
						</button>
						<button
							onclick={() => activeView = 'sessions'}
							class="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
						>
							Cancel
						</button>
					</div>
				</div>
			{/if}

			<!-- Export View -->
			{#if activeView === 'export'}
				<div class="max-w-2xl mx-auto space-y-4">
					<div>
						<label class="block text-sm font-medium text-white mb-2">
							Session Data (JSON)
						</label>
						<textarea
							readonly
							value={exportData}
							class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 font-mono text-xs min-h-96 resize-y"
						></textarea>
					</div>

					<div class="flex gap-3">
						<button
							onclick={copyExportData}
							class="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
						>
							📋 Copy to Clipboard
						</button>
						<button
							onclick={downloadExportData}
							class="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
						>
							💾 Download File
						</button>
					</div>

					<button
						onclick={() => { activeView = 'sessions'; exportData = ''; }}
						class="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
					>
						Back to Sessions
					</button>
				</div>
			{/if}

			<!-- Import View -->
			{#if activeView === 'import'}
				<div class="max-w-2xl mx-auto space-y-4">
					<div>
						<label class="block text-sm font-medium text-white mb-2">
							Paste Session Data (JSON)
						</label>
						<textarea
							bind:value={importData}
							placeholder="Paste exported session JSON here..."
							class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 font-mono text-xs min-h-96 resize-y"
						></textarea>
						{#if importError}
							<p class="text-red-400 text-sm mt-2">{importError}</p>
						{/if}
					</div>

					<div class="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
						<div class="flex items-start gap-2">
							<span class="text-blue-400 text-xl">ℹ️</span>
							<div class="text-sm text-blue-200">
								<p class="font-medium mb-1">Import Note:</p>
								<p>Imported sessions will be assigned a new ID to avoid conflicts with existing sessions.</p>
							</div>
						</div>
					</div>

					<div class="flex gap-3">
						<button
							onclick={importSession}
							disabled={!importData.trim()}
							class="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
						>
							Import Session
						</button>
						<button
							onclick={() => { activeView = 'sessions'; importData = ''; importError = ''; }}
							class="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
						>
							Cancel
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
