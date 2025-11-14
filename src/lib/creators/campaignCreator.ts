import { Campaign, NarrativeMediumType } from '$lib/entities/campaign';
import { GenreMix } from '$lib/entities/genreMix';
import { Genre, getGenreFullName } from '$lib/entities/genre';
import { Creator } from '$lib/entities/base/creator';
import { MainGenreTable } from '$lib/tables/genreTables/mainGenreTable';
import { FantasySubGenreTable } from '$lib/tables/genreTables/fantasySubGenreTable';
import { SciFiSubGenreTable } from '$lib/tables/genreTables/sciFiSubGenreTable';
import { CampaignNameTable } from '$lib/tables/campaignTables/campaignNameTable';

// Map genres to their sub-genre tables
const genreToSubGenreMap: { [key: string]: any } = {
	fantasy: FantasySubGenreTable,
	'sci-fi': SciFiSubGenreTable
	// Add more as we create them
};

export class CampaignCreator extends Creator<Campaign> {
	private creationLog: string[] = [];

	create(): Campaign {
		const campaign = new Campaign();
		this.setParentReference(campaign); // Set parent if provided

		// Use override or roll for name
		campaign.name = this.overrides['name'] || new CampaignNameTable().roleWithCascade(this.dice).text;

		// Use override or default for narrativeMediumType
		campaign.narrativeMediumType =
			this.overrides['narrativeMediumType'] || NarrativeMediumType.RPG;

		// Create genre mix (can be overridden per property)
		campaign.genreMix = this.createGenreMix();
		campaign.creationLog = this.creationLog;
		campaign.description = this.generateCampaignDescription(campaign);

		return campaign;
	}

	private createGenreMix(): GenreMix {
		const genreMix = new GenreMix();
		genreMix.id = crypto.randomUUID();

		// Create primary genre
		genreMix.primaryGenre = this.createGenre();
		this.creationLog.push(`🎭 Primary Genre: ${getGenreFullName(genreMix.primaryGenre.name, genreMix.primaryGenre.subGenreName)}`);

		// Determine if we have multiple genres (20% chance of single genre)
		const hasMultipleGenres = this.dice.getRandom() > 0.2;
		const numberOfSubGenres = hasMultipleGenres ? this.dice.rollInterval(1, 3) : 0;

		this.creationLog.push(`🎲 Number of additional genres: ${numberOfSubGenres}`);

		// Create sub-genres
		for (let i = 0; i < numberOfSubGenres; i++) {
			const genre = this.createGenre();
			// Avoid duplicates
			const fullName = getGenreFullName(genre.name, genre.subGenreName);
			const primaryFullName = getGenreFullName(
				genreMix.primaryGenre.name,
				genreMix.primaryGenre.subGenreName
			);

			if (fullName !== primaryFullName) {
				genreMix.subGenres.push(genre);
				this.creationLog.push(`🎭 Sub-Genre ${i + 1}: ${fullName}`);
			}
		}

		// Assign genre weights
		this.assignGenreWeights(genreMix);

		// Set blend intensity
		genreMix.blendIntensity = this.dice.rollInterval(1, 10);
		this.creationLog.push(`⚡ Blend Intensity: ${genreMix.blendIntensity}/10`);

		genreMix.description = this.generateGenreMixDescription(genreMix);

		return genreMix;
	}

	private createGenre(): Genre {
		const genre = new Genre();
		genre.id = crypto.randomUUID();

		// Roll main genre
		const mainGenreTable = new MainGenreTable();
		const mainGenreResult = mainGenreTable.roleWithCascade(this.dice);
		genre.name = mainGenreResult.text;

		// 80% chance to have a sub-genre
		const hasSubGenre = this.dice.getRandom() > 0.2;

		if (hasSubGenre && genreToSubGenreMap[genre.name]) {
			const SubGenreTableClass = genreToSubGenreMap[genre.name];
			const subGenreTable = new SubGenreTableClass();
			const subGenreResult = subGenreTable.roleWithCascade(this.dice);
			genre.subGenreName = subGenreResult.text;
		}

		return genre;
	}

	private assignGenreWeights(genreMix: GenreMix) {
		if (!genreMix.primaryGenre) return;

		let remainingWeight = 100;

		// Primary genre gets 40-70% (or 100% if no sub-genres)
		const primaryWeight =
			genreMix.subGenres.length === 0 ? 100 : this.dice.rollInterval(40, 70);

		const primaryFullName = getGenreFullName(
			genreMix.primaryGenre.name,
			genreMix.primaryGenre.subGenreName
		);
		genreMix.genreWeights[primaryFullName] = primaryWeight;
		this.creationLog.push(`⚖️ ${primaryFullName}: ${primaryWeight}%`);

		remainingWeight -= primaryWeight;

		// Distribute remaining weight among sub-genres
		for (let i = 0; i < genreMix.subGenres.length; i++) {
			const genre = genreMix.subGenres[i];
			let weight: number;

			if (i === genreMix.subGenres.length - 1) {
				// Last genre gets all remaining weight
				weight = remainingWeight;
			} else {
				// Roll for weight, leaving some for remaining genres
				const minRemaining = genreMix.subGenres.length - i - 1;
				const maxForThis = remainingWeight - minRemaining;
				weight = this.dice.rollInterval(1, maxForThis);
				remainingWeight -= weight;
			}

			const fullName = getGenreFullName(genre.name, genre.subGenreName);
			genreMix.genreWeights[fullName] = weight;
			this.creationLog.push(`⚖️ ${fullName}: ${weight}%`);
		}
	}

	private generateGenreMixDescription(genreMix: GenreMix): string {
		if (!genreMix.primaryGenre) return '';

		const primaryName = getGenreFullName(
			genreMix.primaryGenre.name,
			genreMix.primaryGenre.subGenreName
		);
		const primaryWeight = genreMix.genreWeights[primaryName];

		let description = `A ${primaryName} campaign`;

		if (genreMix.subGenres.length > 0) {
			const subGenreNames = genreMix.subGenres
				.map((g) => getGenreFullName(g.name, g.subGenreName))
				.join(', ');

			if (genreMix.blendIntensity >= 7) {
				description += ` deeply intertwined with ${subGenreNames}`;
			} else if (genreMix.blendIntensity >= 4) {
				description += ` blended with ${subGenreNames}`;
			} else {
				description += ` with touches of ${subGenreNames}`;
			}
		}

		description += `.`;
		return description;
	}

	private generateCampaignDescription(campaign: Campaign): string {
		if (!campaign.genreMix) return '';

		let desc = `${campaign.genreMix.description}\n\n`;
		desc += `Created for ${campaign.narrativeMediumType.toLowerCase()}.`;

		return desc;
	}
}
