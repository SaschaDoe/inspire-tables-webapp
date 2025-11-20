<script lang="ts">
	import { GenreMix } from '$lib/entities/genreMix';
	import { Genre, getGenreFullName } from '$lib/entities/genre';
	import { FantasySubGenreTable } from '$lib/tables/genreTables/fantasySubGenreTable';
	import { SciFiSubGenreTable } from '$lib/tables/genreTables/sciFiSubGenreTable';

	interface Props {
		genreMix: GenreMix | null;
		onChange: (genreMix: GenreMix) => void;
	}

	let { genreMix = $bindable(), onChange }: Props = $props();

	// Available main genres
	const mainGenres = [
		'fantasy',
		'action',
		'sci-fi',
		'myth',
		'war',
		'horror',
		'crime',
		'mystery',
		'explorer',
		'western',
		'drama',
		'thriller',
		'love',
		'comedy'
	];

	// Map genres to their sub-genre tables
	const genreToSubGenreMap: { [key: string]: string[] } = {
		fantasy: [
			'swords and sorcery',
			'urban fantasy',
			'high fantasy',
			'grim dark',
			'historical fantasy',
			'alternate history',
			'fairytale',
			'epic fantasy',
			'sword & planet',
			'low fantasy'
		],
		'sci-fi': [
			'space opera',
			'cyberpunk',
			'hard sci-fi',
			'soft sci-fi',
			'steampunk',
			'biopunk',
			'post-apocalyptic',
			'dystopian',
			'time travel',
			'alien invasion',
			'military sci-fi',
			'cli-fi (climate fiction)'
		]
	};

	// Initialize genreMix if null
	if (!genreMix) {
		genreMix = new GenreMix();
		genreMix.id = crypto.randomUUID();
		genreMix.primaryGenre = new Genre();
		genreMix.primaryGenre.id = crypto.randomUUID();
		genreMix.primaryGenre.name = 'fantasy';
		genreMix.primaryGenre.subGenreName = '';
	}

	// Ensure primary genre exists
	if (!genreMix.primaryGenre) {
		genreMix.primaryGenre = new Genre();
		genreMix.primaryGenre.id = crypto.randomUUID();
		genreMix.primaryGenre.name = 'fantasy';
		genreMix.primaryGenre.subGenreName = '';
	}

	function updatePrimaryGenre(mainGenre: string) {
		if (!genreMix) return;

		// Create new GenreMix and update primary genre
		const updatedGenreMix = Object.assign(Object.create(Object.getPrototypeOf(genreMix)), genreMix);
		if (!genreMix.primaryGenre) {
			updatedGenreMix.primaryGenre = new Genre();
		} else {
			updatedGenreMix.primaryGenre = Object.assign(
				Object.create(Object.getPrototypeOf(genreMix.primaryGenre)),
				genreMix.primaryGenre
			);
		}
		updatedGenreMix.primaryGenre.name = mainGenre;
		updatedGenreMix.primaryGenre.subGenreName = ''; // Reset sub-genre when main genre changes
		genreMix = updatedGenreMix;

		recalculateWeights();
		onChange(genreMix);
	}

	function updatePrimarySubGenre(subGenre: string) {
		if (!genreMix || !genreMix.primaryGenre) return;

		// Create new GenreMix and update primary genre
		const updatedGenreMix = Object.assign(Object.create(Object.getPrototypeOf(genreMix)), genreMix);
		updatedGenreMix.primaryGenre = Object.assign(
			Object.create(Object.getPrototypeOf(genreMix.primaryGenre)),
			genreMix.primaryGenre
		);
		updatedGenreMix.primaryGenre.subGenreName = subGenre;
		genreMix = updatedGenreMix;

		recalculateWeights();
		onChange(genreMix);
	}

	function addAdditionalGenre() {
		if (!genreMix) return;

		// Get all currently used genre combinations
		const usedGenres = new Set<string>();
		if (genreMix.primaryGenre) {
			usedGenres.add(getGenreFullName(genreMix.primaryGenre.name, genreMix.primaryGenre.subGenreName));
		}
		genreMix.subGenres.forEach(g => {
			usedGenres.add(getGenreFullName(g.name, g.subGenreName));
		});

		// Get available main genres that aren't fully used
		const availableMainGenres = mainGenres.filter(mainGenre => {
			// Check if this main genre is available (either unused or has unused sub-genre combos)
			const subGenres = getSubGenres(mainGenre);

			if (subGenres.length === 0) {
				// No sub-genres: check if just the main genre is used
				return !usedGenres.has(getGenreFullName(mainGenre, ''));
			} else {
				// Has sub-genres: check if at least one combo is available
				return !usedGenres.has(getGenreFullName(mainGenre, '')) ||
					   subGenres.some(sg => !usedGenres.has(getGenreFullName(mainGenre, sg)));
			}
		});

		if (availableMainGenres.length === 0) {
			// All genre combinations are used
			return;
		}

		// Randomly select a main genre
		const selectedMainGenre = availableMainGenres[Math.floor(Math.random() * availableMainGenres.length)];
		const subGenres = getSubGenres(selectedMainGenre);

		let selectedSubGenre = '';

		// If this genre has sub-genres defined, try to pick one
		if (subGenres.length > 0) {
			// Get available sub-genres for this main genre
			const availableSubGenres = subGenres.filter(sg =>
				!usedGenres.has(getGenreFullName(selectedMainGenre, sg))
			);

			if (availableSubGenres.length > 0) {
				// Pick a random available sub-genre
				selectedSubGenre = availableSubGenres[Math.floor(Math.random() * availableSubGenres.length)];
			}
			// If no sub-genres are available but the main genre without sub-genre is available, use that
			else if (!usedGenres.has(getGenreFullName(selectedMainGenre, ''))) {
				selectedSubGenre = '';
			}
		}

		// Create the new genre
		const newGenre = new Genre();
		newGenre.id = crypto.randomUUID();
		newGenre.name = selectedMainGenre;
		newGenre.subGenreName = selectedSubGenre;

		// Create a new GenreMix object to trigger reactivity
		const updatedGenreMix = Object.assign(Object.create(Object.getPrototypeOf(genreMix)), genreMix);
		updatedGenreMix.subGenres = [...genreMix.subGenres, newGenre];
		genreMix = updatedGenreMix;

		recalculateWeights();
		onChange(genreMix);
	}

	function removeAdditionalGenre(index: number) {
		if (!genreMix) return;

		// Create a new GenreMix object to trigger reactivity
		const updatedGenreMix = Object.assign(Object.create(Object.getPrototypeOf(genreMix)), genreMix);
		updatedGenreMix.subGenres = genreMix.subGenres.filter((_, i) => i !== index);
		genreMix = updatedGenreMix;

		recalculateWeights();
		onChange(genreMix);
	}

	function updateAdditionalGenre(index: number, mainGenre: string) {
		if (!genreMix) return;

		// Create new GenreMix and update the specific genre
		const updatedGenreMix = Object.assign(Object.create(Object.getPrototypeOf(genreMix)), genreMix);
		updatedGenreMix.subGenres = [...genreMix.subGenres];
		updatedGenreMix.subGenres[index] = Object.assign(
			Object.create(Object.getPrototypeOf(genreMix.subGenres[index])),
			genreMix.subGenres[index]
		);
		updatedGenreMix.subGenres[index].name = mainGenre;
		updatedGenreMix.subGenres[index].subGenreName = ''; // Reset sub-genre
		genreMix = updatedGenreMix;

		recalculateWeights();
		onChange(genreMix);
	}

	function updateAdditionalSubGenre(index: number, subGenre: string) {
		if (!genreMix) return;

		// Create new GenreMix and update the specific genre
		const updatedGenreMix = Object.assign(Object.create(Object.getPrototypeOf(genreMix)), genreMix);
		updatedGenreMix.subGenres = [...genreMix.subGenres];
		updatedGenreMix.subGenres[index] = Object.assign(
			Object.create(Object.getPrototypeOf(genreMix.subGenres[index])),
			genreMix.subGenres[index]
		);
		updatedGenreMix.subGenres[index].subGenreName = subGenre;
		genreMix = updatedGenreMix;

		recalculateWeights();
		onChange(genreMix);
	}

	function recalculateWeights() {
		if (!genreMix || !genreMix.primaryGenre) return;

		const totalGenres = 1 + genreMix.subGenres.length;
		if (totalGenres === 1) {
			// Only primary genre
			const primaryFullName = getGenreFullName(
				genreMix.primaryGenre.name,
				genreMix.primaryGenre.subGenreName
			);
			genreMix.genreWeights = { [primaryFullName]: 100 };
		} else {
			// Distribute weights evenly for now
			const weightPerGenre = Math.floor(100 / totalGenres);
			const remainder = 100 - weightPerGenre * totalGenres;

			genreMix.genreWeights = {};

			// Primary genre gets its share + remainder
			const primaryFullName = getGenreFullName(
				genreMix.primaryGenre.name,
				genreMix.primaryGenre.subGenreName
			);
			genreMix.genreWeights[primaryFullName] = weightPerGenre + remainder;

			// Sub-genres get equal shares
			genreMix.subGenres.forEach((genre) => {
				const fullName = getGenreFullName(genre.name, genre.subGenreName);
				genreMix!.genreWeights[fullName] = weightPerGenre;
			});
		}
	}

	function getSubGenres(mainGenre: string): string[] {
		return genreToSubGenreMap[mainGenre] || [];
	}
</script>

<div class="genre-editor">
	<!-- Primary Genre -->
	<div class="genre-group primary-genre-group">
		<h4 class="genre-group-title">Primary Genre</h4>

		<div class="genre-row">
			<div class="field-group">
				<label for="primary-main-genre" class="field-label">Main Genre</label>
				<select
					id="primary-main-genre"
					class="genre-select"
					value={genreMix?.primaryGenre?.name || 'fantasy'}
					onchange={(e) => updatePrimaryGenre(e.currentTarget.value)}
				>
					{#each mainGenres as genre (genre)}
						<option value={genre}>{genre}</option>
					{/each}
				</select>
			</div>

			{#if genreMix?.primaryGenre && getSubGenres(genreMix.primaryGenre.name).length > 0}
				<div class="field-group">
					<label for="primary-sub-genre" class="field-label">Sub-Genre</label>
					<select
						id="primary-sub-genre"
						class="genre-select"
						value={genreMix.primaryGenre.subGenreName || ''}
						onchange={(e) => updatePrimarySubGenre(e.currentTarget.value)}
					>
						<option value="">None</option>
						{#each getSubGenres(genreMix.primaryGenre.name) as subGenre (subGenre)}
							<option value={subGenre}>{subGenre}</option>
						{/each}
					</select>
				</div>
			{/if}

			<div class="field-group weight-field">
				<label for="primary-weight" class="field-label">Weight</label>
				<div id="primary-weight" class="weight-display">
					{genreMix?.primaryGenre
						? genreMix.genreWeights[
								getGenreFullName(genreMix.primaryGenre.name, genreMix.primaryGenre.subGenreName)
							] || 100
						: 100}%
				</div>
			</div>
		</div>
	</div>

	<!-- Additional Genres -->
	{#if genreMix?.subGenres && genreMix.subGenres.length > 0}
		<div class="genre-group additional-genres-group">
			<h4 class="genre-group-title">Additional Genres</h4>

			{#each genreMix.subGenres as subGenre, index (subGenre.id)}
				<div class="genre-row additional-genre-row">
					<div class="field-group">
						<label for="additional-main-genre-{index}" class="field-label">Main Genre</label>
						<select
							id="additional-main-genre-{index}"
							class="genre-select"
							value={subGenre.name}
							onchange={(e) => updateAdditionalGenre(index, e.currentTarget.value)}
						>
							{#each mainGenres as genre (genre)}
								<option value={genre}>{genre}</option>
							{/each}
						</select>
					</div>

					{#if getSubGenres(subGenre.name).length > 0}
						<div class="field-group">
							<label for="additional-sub-genre-{index}" class="field-label">Sub-Genre</label>
							<select
								id="additional-sub-genre-{index}"
								class="genre-select"
								value={subGenre.subGenreName || ''}
								onchange={(e) => updateAdditionalSubGenre(index, e.currentTarget.value)}
							>
								<option value="">None</option>
								{#each getSubGenres(subGenre.name) as sg (sg)}
									<option value={sg}>{sg}</option>
								{/each}
							</select>
						</div>
					{/if}

					<div class="field-group weight-field">
						<label for="additional-weight-{index}" class="field-label">Weight</label>
						<div id="additional-weight-{index}" class="weight-display">
							{genreMix.genreWeights[getGenreFullName(subGenre.name, subGenre.subGenreName)] || 0}%
						</div>
					</div>

					<button class="remove-btn" onclick={() => removeAdditionalGenre(index)} title="Remove genre">
						✕
					</button>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Add Genre Button -->
	<button class="add-genre-btn" onclick={addAdditionalGenre}>+ Add Genre</button>
</div>

<style>
	.genre-editor {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.genre-group {
		background: rgb(30 27 75 / 0.3);
		border: 1px solid rgb(168 85 247 / 0.3);
		border-radius: 0.5rem;
		padding: 1rem;
	}

	.genre-group-title {
		color: rgb(192 132 252);
		font-size: 0.875rem;
		font-weight: 600;
		margin: 0 0 0.75rem 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.genre-row {
		display: flex;
		align-items: flex-end;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}

	.genre-row:last-child {
		margin-bottom: 0;
	}

	.additional-genre-row {
		position: relative;
		padding-right: 2.5rem;
	}

	.field-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		flex: 1;
	}

	.weight-field {
		flex: 0 0 80px;
	}

	.field-label {
		color: rgb(216 180 254);
		font-size: 0.75rem;
		font-weight: 500;
	}

	.genre-select {
		padding: 0.625rem;
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.3);
		border-radius: 0.5rem;
		color: white;
		font-size: 0.875rem;
		outline: none;
		transition: all 0.2s;
		cursor: pointer;
	}

	.genre-select:focus {
		border-color: rgb(168 85 247);
		background: rgb(30 27 75 / 0.7);
	}

	.weight-display {
		padding: 0.625rem;
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.3);
		border-radius: 0.5rem;
		color: rgb(192 132 252);
		font-size: 0.875rem;
		font-weight: 600;
		text-align: center;
	}

	.remove-btn {
		position: absolute;
		right: 0;
		bottom: 0.625rem;
		background: rgb(220 38 38 / 0.2);
		border: 1px solid rgb(220 38 38 / 0.5);
		border-radius: 0.25rem;
		padding: 0.5rem;
		cursor: pointer;
		color: rgb(252 165 165);
		font-size: 0.875rem;
		transition: all 0.2s;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.remove-btn:hover {
		background: rgb(220 38 38 / 0.3);
		border-color: rgb(220 38 38);
		color: rgb(254 202 202);
	}

	.add-genre-btn {
		padding: 0.75rem 1rem;
		background: rgb(168 85 247 / 0.2);
		border: 1px solid rgb(168 85 247 / 0.5);
		border-radius: 0.5rem;
		color: rgb(216 180 254);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		align-self: flex-start;
	}

	.add-genre-btn:hover {
		background: rgb(168 85 247 / 0.3);
		border-color: rgb(168 85 247);
		color: white;
	}
</style>
