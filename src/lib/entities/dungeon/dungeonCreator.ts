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
import { RoomConnectorCreator } from './roomConnectorCreator';
import { RoomCreator } from './roomCreator';

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
		this.generateRoomConnectors(dungeon);
		this.generateDescription(dungeon);
		return dungeon;
	}

	withRealWorld(): this {
		this.isRealWorld = true;
		return this;
	}

	private createFantasyDungeon(dungeon: Dungeon): void {
		// Use overrides if provided
		dungeon.name = this.overrides['name'] || new DungeonNameTable().roleWithCascade(this.dice).text;
		dungeon.type = this.overrides['type'] || new DungeonTypeTable().roleWithCascade(this.dice).text;

		// Create monsters
		const numberOfMonsters = this.dice.rollInterval(1, 3) + 1; // 2-4 monsters
		for (let i = 0; i < numberOfMonsters; i++) {
			const monsterCreator = new MonsterCreator();
			monsterCreator.dice = this.dice;
			dungeon.monsters.push(monsterCreator.withParent(dungeon.id).create());
		}
	}

	private createRealWorldDungeon(dungeon: Dungeon): void {
		dungeon.name = this.overrides['name'] || new RealWorldDungeonNameTable().roleWithCascade(this.dice).text;
		dungeon.type = dungeon.name;

		// Create real world enemies
		const numberOfEnemies = this.dice.rollInterval(1, 3) - 1; // 0-2 enemies
		for (let i = 0; i < numberOfEnemies; i++) {
			dungeon.realWorldEnemies.push(new RealWorldEnemyTable().roleWithCascade(this.dice).text);
		}
	}

	private createRestOfDungeon(dungeon: Dungeon): void {
		// Adjective (50% chance or if override provided)
		if (this.overrides['adjective']) {
			dungeon.adjective = this.overrides['adjective'];
		} else if (this.dice.random() > 0.5) {
			dungeon.adjective = new DungeonAdjectiveTable().roleWithCascade(this.dice).text;
		}

		dungeon.size = this.overrides['size'] || new SizeTable().roleWithCascade(this.dice).text;
		dungeon.state = this.overrides['state'] || new DungeonStateTable().roleWithCascade(this.dice).text;

		// Create entrances
		const entranceCreator = new EntranceCreator();
		entranceCreator.dice = this.dice;
		const numberOfEntrances = this.dice.rollInterval(1, 3); // 1-3 entrances
		for (let i = 0; i < numberOfEntrances; i++) {
			dungeon.entrances.push(entranceCreator.withParent(dungeon.id).create());
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

		// Create rooms using RoomCreator for proper generation
		const roomCreator = new RoomCreator();
		roomCreator.dice = this.dice;
		const numberOfRooms = this.dice.rollInterval(3, 12);
		for (let i = 0; i < numberOfRooms; i++) {
			dungeon.rooms.push(roomCreator.withParent(dungeon.id).create());
		}
	}

	private generateRoomConnectors(dungeon: Dungeon): void {
		if (dungeon.rooms.length === 0) return;

		const connectorCreator = new RoomConnectorCreator(this.dice);

		// Connect each entrance to 1-2 random rooms
		for (const entrance of dungeon.entrances) {
			const roomsToConnect = this.dice.rollInterval(1, Math.min(2, dungeon.rooms.length));
			const connectedRoomIndices = new Set<number>();

			for (let i = 0; i < roomsToConnect; i++) {
				let randomIndex = Math.floor(this.dice.random() * dungeon.rooms.length);
				// Ensure we don't connect to the same room twice
				while (connectedRoomIndices.has(randomIndex)) {
					randomIndex = Math.floor(this.dice.random() * dungeon.rooms.length);
				}
				connectedRoomIndices.add(randomIndex);

				const room = dungeon.rooms[randomIndex];
				const connector = connectorCreator.create();
				connector.fromRoomId = entrance.id;
				connector.toRoomId = room.id;
				dungeon.roomConnectors.push(connector);

				// Track the connection on the entrance
				entrance.connectedRoomIds.push(room.id);
			}
		}

		// Create a connected graph of rooms
		// Ensure all rooms are reachable by creating a spanning tree first
		const visited = new Set<number>();
		visited.add(0); // Start with the first room

		// Connect rooms in a spanning tree pattern (ensures all rooms are reachable)
		for (let i = 1; i < dungeon.rooms.length; i++) {
			const fromIndex = Math.floor(this.dice.random() * i); // Pick a random already-visited room
			const fromRoom = dungeon.rooms[fromIndex];
			const toRoom = dungeon.rooms[i];

			const connector = connectorCreator.create();
			connector.fromRoomId = fromRoom.id;
			connector.toRoomId = toRoom.id;
			dungeon.roomConnectors.push(connector);

			fromRoom.connectedRoomIds.push(toRoom.id);
			toRoom.connectedRoomIds.push(fromRoom.id);
		}

		// Add additional random connections for more interesting layouts (30-50% more connections)
		const additionalConnections = Math.floor(dungeon.rooms.length * (0.3 + this.dice.random() * 0.2));
		for (let i = 0; i < additionalConnections; i++) {
			const fromIndex = Math.floor(this.dice.random() * dungeon.rooms.length);
			let toIndex = Math.floor(this.dice.random() * dungeon.rooms.length);

			// Don't connect a room to itself
			while (toIndex === fromIndex) {
				toIndex = Math.floor(this.dice.random() * dungeon.rooms.length);
			}

			const fromRoom = dungeon.rooms[fromIndex];
			const toRoom = dungeon.rooms[toIndex];

			// Check if connection already exists
			if (!fromRoom.connectedRoomIds.includes(toRoom.id)) {
				const connector = connectorCreator.create();
				connector.fromRoomId = fromRoom.id;
				connector.toRoomId = toRoom.id;
				dungeon.roomConnectors.push(connector);

				fromRoom.connectedRoomIds.push(toRoom.id);
				toRoom.connectedRoomIds.push(fromRoom.id);
			}
		}
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
