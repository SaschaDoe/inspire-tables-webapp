import { Entity } from '../base/entity';

export class WeatherEvent extends Entity {
	name = '';
	description = '';
	type = '';
	severity = '';
	duration = '';
	effects: string[] = [];
	weather = '';
	adjective = '';
	location = '';
}
