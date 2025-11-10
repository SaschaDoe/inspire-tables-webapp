<script lang="ts">
	import type { AdventureEntity } from '$lib/types/entity';

	interface Props {
		adventure: AdventureEntity;
		showActions?: boolean;
		onDelete?: (id: string) => void;
		onNameChange?: (id: string, name: string) => void;
		onStatusChange?: (id: string, status: string) => void;
		onOpenStoryBoard?: (adventureId: string) => void;
	}

	let {
		adventure,
		showActions = true,
		onDelete,
		onNameChange,
		onStatusChange,
		onOpenStoryBoard
	}: Props = $props();

	function handleNameChange(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		onNameChange?.(adventure.id, target.value);
	}

	function handleStatusChange(newStatus: string) {
		onStatusChange?.(adventure.id, newStatus);
	}
</script>

<div class="adventure-card group relative bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/20 hover:border-blue-400/40 transition-all shadow-xl">
	<!-- Glow effect on hover -->
	<div class="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-lg opacity-0 group-hover:opacity-25 transition-opacity"></div>

	<div class="relative">
		<!-- Header -->
		<div class="flex items-start justify-between mb-4">
			<div class="flex items-center gap-3 flex-1 mr-4">
				<span class="text-4xl">🗺️</span>
				{#if showActions && onNameChange}
					<input
						type="text"
						value={adventure.name}
						onchange={handleNameChange}
						class="text-2xl font-bold bg-transparent text-white border-b-2 border-transparent hover:border-blue-500/50 focus:border-blue-500 focus:outline-none transition-colors flex-1"
					/>
				{:else}
					<h2 class="text-2xl font-bold text-white">{adventure.name}</h2>
				{/if}
			</div>

			{#if showActions && onDelete}
				<button
					onclick={() => onDelete?.(adventure.id)}
					class="px-3 py-1 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white rounded-lg transition-colors"
				>
					Delete
				</button>
			{/if}
		</div>

		<div class="space-y-4">
			<!-- Status -->
			<div>
				<h4 class="text-sm font-semibold text-blue-300 mb-2">Status:</h4>
				{#if showActions && onStatusChange}
					<div class="flex gap-2">
						{#each ['planned', 'in-progress', 'completed'] as status}
							<button
								onclick={() => handleStatusChange(status)}
								class="px-3 py-1 rounded-lg text-sm transition-all {adventure.status === status
									? 'bg-blue-600 text-white'
									: 'bg-slate-800 text-blue-200 hover:bg-slate-700'}"
							>
								{status}
							</button>
						{/each}
					</div>
				{:else}
					<span class="px-3 py-1 bg-blue-900/30 rounded-full text-blue-200 text-sm border border-blue-500/30">
						{adventure.status}
					</span>
				{/if}
			</div>

			<!-- Story Board Button -->
			{#if showActions && onOpenStoryBoard}
				<div>
					<button
						onclick={() => onOpenStoryBoard?.(adventure.id)}
						class="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
					>
						<span class="text-xl">📋</span>
						<span>Open Story Board</span>
					</button>
				</div>
			{/if}

			<!-- Description -->
			{#if adventure.description}
				<div>
					<h4 class="text-sm font-semibold text-blue-300 mb-2">Description:</h4>
					<p class="text-blue-100 leading-relaxed">{adventure.description}</p>
				</div>
			{/if}

			<!-- Plot Structure -->
			{#if adventure.plotStructure}
				<div>
					<h4 class="text-sm font-semibold text-blue-300 mb-2">Plot Structure:</h4>
					<div class="space-y-2">
						{#if adventure.plotStructure.beginning}
							<div class="p-3 bg-blue-900/20 rounded-lg border border-blue-500/20">
								<span class="text-xs font-semibold text-blue-400 uppercase">Beginning:</span>
								<p class="text-blue-100 text-sm mt-1">{adventure.plotStructure.beginning}</p>
							</div>
						{/if}
						{#if adventure.plotStructure.middle}
							<div class="p-3 bg-blue-900/20 rounded-lg border border-blue-500/20">
								<span class="text-xs font-semibold text-blue-400 uppercase">Middle:</span>
								<p class="text-blue-100 text-sm mt-1">{adventure.plotStructure.middle}</p>
							</div>
						{/if}
						{#if adventure.plotStructure.end}
							<div class="p-3 bg-blue-900/20 rounded-lg border border-blue-500/20">
								<span class="text-xs font-semibold text-blue-400 uppercase">End:</span>
								<p class="text-blue-100 text-sm mt-1">{adventure.plotStructure.end}</p>
							</div>
						{/if}
					</div>
				</div>
			{/if}

			<!-- Sessions -->
			{#if adventure.sessions && adventure.sessions.length > 0}
				<div>
					<h4 class="text-sm font-semibold text-blue-300 mb-2">Sessions ({adventure.sessions.length}):</h4>
					<div class="flex flex-wrap gap-2">
						{#each adventure.sessions as sessionId}
							<span class="px-3 py-1 bg-blue-900/30 rounded-full text-blue-100 text-sm border border-blue-500/30">
								Session #{sessionId.slice(0, 8)}
							</span>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Tags -->
			{#if adventure.tags && adventure.tags.length > 0}
				<div>
					<h4 class="text-sm font-semibold text-blue-300 mb-2">Tags:</h4>
					<div class="flex flex-wrap gap-2">
						{#each adventure.tags as tag}
							<span class="px-3 py-1 bg-slate-800 rounded-full text-blue-200 text-sm">
								#{tag}
							</span>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Metadata -->
			<div class="flex gap-4 text-sm text-blue-300">
				<span>📅 Created: {new Date(adventure.metadata.createdAt).toLocaleDateString()}</span>
				{#if adventure.metadata.updatedAt}
					<span>🔄 Updated: {new Date(adventure.metadata.updatedAt).toLocaleDateString()}</span>
				{/if}
			</div>
		</div>
	</div>
</div>
