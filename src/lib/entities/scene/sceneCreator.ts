import { Creator } from '../base/creator';
import { Scene } from './scene';
import { LocationTable } from '$lib/tables/otherTables/locationTable';
import { MoodTable } from '$lib/tables/otherTables/moodTable';
import { SensoryDetailTable } from '$lib/tables/otherTables/sensoryDetailTable';
import { NarrationTable } from '$lib/tables/adventureTables/narrationTable';

export class SceneCreator extends Creator<Scene> {
	create(): Scene {
		const scene = new Scene();

		scene.location = new LocationTable().roleWithCascade(this.dice).text;
		scene.mood = new MoodTable().roleWithCascade(this.dice).text;
		scene.purpose = new NarrationTable().roleWithCascade(this.dice).text;

		// Generate 2-4 sensory details
		const numDetails = this.dice.rollInterval(2, 4);
		for (let i = 0; i < numDetails; i++) {
			scene.sensoryDetails.push(new SensoryDetailTable().roleWithCascade(this.dice).text);
		}

		// Generate a name based on location and mood
		scene.name = `${this.capitalize(scene.mood)} ${this.capitalize(scene.location)}`;

		// Generate description combining all elements
		scene.description = this.generateDescription(scene);

		return scene;
	}

	private generateDescription(scene: Scene): string {
		const details = scene.sensoryDetails.join(', ');
		return `A ${scene.mood} scene at ${scene.location}. ${this.capitalize(
			scene.purpose
		)}. You notice: ${details}.`;
	}

	private capitalize(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}
}
