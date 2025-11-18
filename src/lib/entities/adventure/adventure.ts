import { Entity } from '../base/entity';

export interface RisingActionEntity {
	entityId: string;
	entityType: string;
	entityName: string;
}

export class Adventure extends Entity {
	name = '';
	description = '';
	beginning = '';
	risingAction: string[] = [];
	climax = '';
	ending = '';
	plotTropes: string[] = [];
	// Map rising action index to entity reference
	risingActionEntities: Record<number, RisingActionEntity> = {};
}
