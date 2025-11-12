import { Creator } from '../base/creator';
import { StoryBeat } from './storyBeat';
import { AdventureBeginningTable } from '$lib/tables/adventureTables/adventureBeginningTable';
import { AdventureRisingTable } from '$lib/tables/adventureTables/adventureRisingTable';
import { AdventureClimaxTable } from '$lib/tables/adventureTables/adventureClimaxTable';
import { AdventureFinalTable } from '$lib/tables/adventureTables/adventureFinalTable';

export class StoryBeatCreator extends Creator<StoryBeat> {
	create(): StoryBeat {
		const storyBeat = new StoryBeat();

		// Randomly choose a story beat type
		const types = ['beginning', 'rising', 'climax', 'finale'];
		storyBeat.type = types[Math.floor(this.dice.random() * types.length)];

		// Generate description based on type
		switch (storyBeat.type) {
			case 'beginning':
				storyBeat.description = new AdventureBeginningTable().roleWithCascade(this.dice).text;
				storyBeat.tension = this.dice.rollInterval(1, 3);
				break;
			case 'rising':
				storyBeat.description = new AdventureRisingTable().roleWithCascade(this.dice).text;
				storyBeat.tension = this.dice.rollInterval(4, 6);
				break;
			case 'climax':
				storyBeat.description = new AdventureClimaxTable().roleWithCascade(this.dice).text;
				storyBeat.tension = this.dice.rollInterval(8, 10);
				break;
			case 'finale':
				storyBeat.description = new AdventureFinalTable().roleWithCascade(this.dice).text;
				storyBeat.tension = this.dice.rollInterval(3, 5);
				break;
		}

		return storyBeat;
	}
}
