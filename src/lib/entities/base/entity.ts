// Load the last ID from localStorage or start from 0
let currentId = 0;
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
	const savedId = localStorage.getItem('entityIdCounter');
	if (savedId) {
		currentId = parseInt(savedId, 10);
	}
}

function saveCurrentId() {
	if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
		localStorage.setItem('entityIdCounter', currentId.toString());
	}
}

export class Entity {
	id: string;
	name: string = '';
	description: string = '';

	constructor() {
		currentId++;
		this.id = currentId.toString();
		saveCurrentId();
	}

	static getNextNumericId(): number {
		currentId++;
		saveCurrentId();
		return currentId;
	}

	static resetNumericId(): void {
		currentId = 0;
		saveCurrentId();
	}
}
