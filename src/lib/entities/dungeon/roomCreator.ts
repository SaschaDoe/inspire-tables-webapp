import { Creator } from '../base/creator';
import { Room } from './dungeon';
import { FurnishingTable } from '$lib/tables/dungeonTables/furnishingTable';
import { ObstacleTable } from '$lib/tables/dungeonTables/obstacleTable';
import { TreasureContentTable } from '$lib/tables/dungeonTables/treasureContentTable';
import { TrapTable } from '$lib/tables/dungeonTables/trapTable';

export class RoomCreator extends Creator<Room> {

	create(): Room {
		const room = new Room();
		this.setParentReference(room); // Automatically sets parentId
		room.name = this.generateRoomName();

		// Each room has a chance for different features
		if (this.dice.random() > 0.3) {
			room.furnishing = new FurnishingTable().roleWithCascade(this.dice).text;
		}

		if (this.dice.random() > 0.7) {
			room.obstacle = new ObstacleTable().roleWithCascade(this.dice).text;
		}

		if (this.dice.random() > 0.6) {
			room.treasure = new TreasureContentTable().roleWithCascade(this.dice).text;
		}

		if (this.dice.random() > 0.8) {
			room.trap = new TrapTable().roleWithCascade(this.dice).text;
		}

		room.description = this.generateDescription(room);

		return room;
	}

	private generateRoomName(): string {
		const adjectives = ['Dark', 'Ancient', 'Hidden', 'Forgotten', 'Sacred', 'Cursed', 'Secret', 'Grand'];
		const types = ['Chamber', 'Hall', 'Vault', 'Gallery', 'Sanctum', 'Crypt', 'Passage', 'Court'];

		const adjIndex = Math.floor(this.dice.random() * adjectives.length);
		const typeIndex = Math.floor(this.dice.random() * types.length);

		return `${adjectives[adjIndex]} ${types[typeIndex]}`;
	}

	private generateDescription(room: Room): string {
		const parts: string[] = [];

		if (room.furnishing) {
			parts.push(room.furnishing);
		}

		if (room.obstacle) {
			parts.push(`Blocked by ${room.obstacle.toLowerCase()}`);
		}

		if (room.treasure) {
			parts.push(`Contains ${room.treasure.toLowerCase()}`);
		}

		if (room.trap) {
			parts.push(`Protected by ${room.trap.toLowerCase()}`);
		}

		return parts.length > 0
			? parts.join('. ') + '.'
			: 'An empty chamber.';
	}
}
