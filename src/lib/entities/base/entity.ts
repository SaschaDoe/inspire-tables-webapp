let currentId = 0;

export class Entity {
	id: string;
	name: string = '';
	description: string = '';

	constructor() {
		this.id = crypto.randomUUID();
	}

	static getNextNumericId(): number {
		return ++currentId;
	}

	static resetNumericId(): void {
		currentId = 0;
	}
}
