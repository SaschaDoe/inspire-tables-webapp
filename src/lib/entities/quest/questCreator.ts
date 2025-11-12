import { Creator } from '../base/creator';
import { Quest } from './quest';
import { QuestTypeTable } from '$lib/tables/questTables/questTypeTable';
import { QuestRewardTable } from '$lib/tables/questTables/questRewardTable';
import { QuestDifficultyTable } from '$lib/tables/questTables/questDifficultyTable';
import { LocationTable } from '$lib/tables/otherTables/locationTable';
import { ProfessionTable } from '$lib/tables/charTables/professionTable';

export class QuestCreator extends Creator<Quest> {
	create(): Quest {
		const quest = new Quest();

		quest.type = new QuestTypeTable().roleWithCascade(this.dice).text;
		quest.reward = new QuestRewardTable().roleWithCascade(this.dice).text;
		quest.difficulty = new QuestDifficultyTable().roleWithCascade(this.dice).text;
		quest.location = new LocationTable().roleWithCascade(this.dice).text;
		quest.giver = new ProfessionTable().roleWithCascade(this.dice).text;

		// Generate objective based on type
		quest.objective = this.generateObjective(quest.type);

		// Generate name
		quest.name = this.generateName(quest);

		// Generate description
		quest.description = this.generateDescription(quest);

		return quest;
	}

	private generateObjective(type: string): string {
		const objectives: Record<string, string[]> = {
			assassination: ['Eliminate the target', 'Remove the threat', 'Silence the witness'],
			retrieval: ['Recover the lost item', 'Find the stolen goods', 'Retrieve the artefact'],
			escort: ['Safely deliver the person', 'Protect during travel', 'Guide to destination'],
			investigation: [
				'Uncover the truth',
				'Solve the mystery',
				'Discover what happened'
			],
			exploration: ['Map the unknown', 'Discover new lands', 'Find the hidden place'],
			delivery: ['Transport the package', 'Deliver the message', 'Bring supplies'],
			rescue: ['Save the captive', 'Free the prisoner', 'Retrieve the hostage'],
			defense: ['Protect the location', 'Hold the line', 'Defend against attack'],
			conquest: ['Claim the territory', 'Defeat the enemy', 'Take control'],
			diplomacy: ['Negotiate peace', 'Broker an alliance', 'Convince the leader'],
			sabotage: ['Disrupt operations', 'Destroy the target', 'Undermine their efforts'],
			infiltration: ['Gain access', 'Penetrate defenses', 'Reach the inner sanctum'],
			hunting: ['Track down the beast', 'Slay the creature', 'Capture the monster'],
			gathering: ['Collect resources', 'Harvest materials', 'Gather ingredients'],
			protection: ['Guard the asset', 'Keep safe', 'Prevent harm'],
			negotiation: ['Secure a deal', 'Arrange terms', 'Make an agreement'],
			heist: ['Steal the treasure', 'Acquire the prize', 'Take what is guarded'],
			cleansing: ['Purify the area', 'Remove the corruption', 'Banish the evil']
		};

		const options = objectives[type.toLowerCase()] || ['Complete the task'];
		return options[Math.floor(this.dice.random() * options.length)];
	}

	private generateName(quest: Quest): string {
		return `The ${this.capitalize(quest.type)} of ${this.capitalize(quest.location)}`;
	}

	private generateDescription(quest: Quest): string {
		return `A ${quest.difficulty} ${quest.type} quest. ${quest.objective} at ${quest.location}. Quest giver: ${quest.giver}. Reward: ${quest.reward}.`;
	}

	private capitalize(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}
}
