import { Creator } from '../base/creator';
import { Dungeon, Room } from './dungeon';
import { DungeonTypeTable } from '$lib/tables/dungeonTables/dungeonTypeTable';
import { DungeonAdjectiveTable } from '$lib/tables/dungeonTables/dungeonAdjectiveTable';
import { SizeTable } from '$lib/tables/otherTables/sizeTable';
import { DungeonStateTable } from '$lib/tables/dungeonTables/dungeonStateTable';
import { DungeonPurposeTable } from '$lib/tables/dungeonTables/dungeonPurposeTable';
import { DungeonRoomArrangementsTable } from '$lib/tables/dungeonTables/dungeonArrangementsTable';
import { LocationChangeEventTable } from '$lib/tables/dungeonTables/locationChangeEventTable';
import { RealWorldDungeonNameTable } from '$lib/tables/dungeonTables/realWorldDungeonNameTable';
import { RealWorldEnemyTable } from '$lib/tables/dungeonTables/realWorldEnemyTable';
import { DungeonNameTable } from '$lib/tables/nameTables/dungeonNameTable';
import { EntranceCreator } from './entranceCreator';
import { MonsterCreator } from '../monster/monsterCreator';
import { FurnishingTable } from '$lib/tables/dungeonTables/furnishingTable';
import { ObstacleTable } from '$lib/tables/dungeonTables/obstacleTable';
import { TreasureTable } from '$lib/tables/artefactTables/treasureTable';

export class DungeonCreator extends Creator<Dungeon> {
	private isRealWorld = false;

	create(): Dungeon {
		const dungeon = new Dungeon();

		if (this.isRealWorld) {
			this.createRealWorldDungeon(dungeon);
		} else {
			this.createFantasyDungeon(dungeon);
		}

		this.createRestOfDungeon(dungeon);
		this.generateDescription(dungeon);
		return dungeon;
	}

	withRealWorld(): this {
		this.isRealWorld = true;
		return this;
	}

	private createFantasyDungeon(dungeon: Dungeon): void {
		dungeon.name = new DungeonNameTable().roleWithCascade(this.dice).text;
		dungeon.type = new DungeonTypeTable().roleWithCascade(this.dice).text;

		// Create monsters
		const numberOfMonsters = this.dice.rollInterval(1, 3) + 1; // 2-4 monsters
		for (let i = 0; i < numberOfMonsters; i++) {
			const monsterCreator = new MonsterCreator();
			monsterCreator.dice = this.dice;
			dungeon.monsters.push(monsterCreator.create());
		}
	}

	private createRealWorldDungeon(dungeon: Dungeon): void {
		dungeon.name = new RealWorldDungeonNameTable().roleWithCascade(this.dice).text;
		dungeon.type = dungeon.name;

		// Create real world enemies
		const numberOfEnemies = this.dice.rollInterval(1, 3) - 1; // 0-2 enemies
		for (let i = 0; i < numberOfEnemies; i++) {
			dungeon.realWorldEnemies.push(new RealWorldEnemyTable().roleWithCascade(this.dice).text);
		}
	}

	private createRestOfDungeon(dungeon: Dungeon): void {
		// Adjective (50% chance)
		if (this.dice.random() > 0.5) {
			dungeon.adjective = new DungeonAdjectiveTable().roleWithCascade(this.dice).text;
		}

		dungeon.size = new SizeTable().roleWithCascade(this.dice).text;
		dungeon.state = new DungeonStateTable().roleWithCascade(this.dice).text;

		// Create entrances
		const entranceCreator = new EntranceCreator();
		entranceCreator.dice = this.dice;
		const numberOfEntrances = this.dice.rollInterval(1, 3); // 1-3 entrances
		for (let i = 0; i < numberOfEntrances; i++) {
			dungeon.entrances.push(entranceCreator.create());
		}

		// Create purposes
		const numberOfPurposes = this.dice.rollInterval(1, 3); // 1-3 purposes
		for (let i = 0; i < numberOfPurposes; i++) {
			dungeon.purposes.push(new DungeonPurposeTable().roleWithCascade(this.dice).text);
		}

		// Create location change events (one less than purposes)
		for (let i = 0; i < numberOfPurposes - 1; i++) {
			dungeon.locationChangeEvents.push(
				new LocationChangeEventTable().roleWithCascade(this.dice).text
			);
		}

		// Create arrangements
		const numberOfArrangements = this.dice.rollInterval(1, 3); // 1-3 arrangements
		for (let i = 0; i < numberOfArrangements; i++) {
			dungeon.arrangements.push(
				new DungeonRoomArrangementsTable().roleWithCascade(this.dice).text
			);
		}

		// Generate rooms
		const numberOfRooms = this.dice.rollInterval(3, 12);
		for (let i = 0; i < numberOfRooms; i++) {
			dungeon.rooms.push(this.createRoom(i + 1));
		}
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

	private generateDescription(dungeon: Dungeon): void {
		const parts: string[] = [];

		if (dungeon.adjective) {
			parts.push(`A ${dungeon.adjective} ${dungeon.state} ${dungeon.type}`);
		} else {
			parts.push(`A ${dungeon.state} ${dungeon.type}`);
		}

		parts.push(`of ${dungeon.size} size`);

		if (dungeon.purposes.length > 0) {
			parts.push(`originally built for ${dungeon.purposes[0]}`);
		}

		if (dungeon.monsters.length > 0) {
			parts.push(
				`inhabited by ${dungeon.monsters.length} monster${dungeon.monsters.length > 1 ? 's' : ''}`
			);
		}

		if (dungeon.realWorldEnemies.length > 0) {
			parts.push(`guarded by ${dungeon.realWorldEnemies.join(', ')}`);
		}

		parts.push(`with ${dungeon.entrances.length} entrance${dungeon.entrances.length > 1 ? 's' : ''}`);
		parts.push(`and ${dungeon.rooms.length} rooms`);

		dungeon.description = parts.join(', ') + '.';
	}
}
