import { Creator } from '../base/creator';
import { Dungeon, Room } from './dungeon';
import { StructureTable } from '$lib/tables/dungeonTables/structureTable';
import { DungeonEntriesTable } from '$lib/tables/dungeonTables/dungeonEntriesTable';
import { FurnishingTable } from '$lib/tables/dungeonTables/furnishingTable';
import { ObstacleTable } from '$lib/tables/dungeonTables/obstacleTable';
import { TreasureTable } from '$lib/tables/artefactTables/treasureTable';

export class DungeonCreator extends Creator<Dungeon> {
	create(): Dungeon {
		const dungeon = new Dungeon();

		dungeon.structure = new StructureTable().roleWithCascade(this.dice).text;
		dungeon.entries = new DungeonEntriesTable().roleWithCascade(this.dice).text;
		dungeon.numberOfRooms = this.dice.rollInterval(3, 12);

		// Generate rooms
		for (let i = 0; i < dungeon.numberOfRooms; i++) {
			dungeon.rooms.push(this.createRoom(i + 1));
		}

		dungeon.name = `${dungeon.structure} Dungeon`;

		return dungeon;
	}

	private createRoom(number: number): Room {
		const room = new Room();

		room.name = `Room ${number}`;

		// Each room has a chance for different features
		if (this.dice.random() > 0.3) {
			room.furnishing = new FurnishingTable().roleWithCascade(this.dice).text;
		}

		if (this.dice.random() > 0.7) {
			room.obstacle = new ObstacleTable().roleWithCascade(this.dice).text;
		}

		if (this.dice.random() > 0.6) {
			room.treasure = new TreasureTable().roleWithCascade(this.dice).text;
		}

		return room;
	}
}
