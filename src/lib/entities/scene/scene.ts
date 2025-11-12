import { Entity } from '../base/entity';

export class Scene extends Entity {
	name = '';
	description = '';
	location = '';
	mood = '';
	sensoryDetails: string[] = [];
	purpose = ''; // What happens in this scene
}
