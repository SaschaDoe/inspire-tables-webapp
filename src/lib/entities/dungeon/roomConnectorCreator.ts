import { Creator } from '../base/creator';
import { RoomConnector, type RoomConnectorType } from './roomConnector';
import { TrapCreator } from './trapCreator';
import { ObstacleTable } from '$lib/tables/dungeonTables/obstacleTable';

export class RoomConnectorCreator extends Creator<RoomConnector> {
	create(): RoomConnector {
		const connector = new RoomConnector();

		// Randomly determine connector type
		// 50% door, 30% tunnel, 20% obstacle
		const rand = this.dice.random();
		if (rand < 0.5) {
			connector.connectorType = 'door';
		} else if (rand < 0.8) {
			connector.connectorType = 'tunnel';
		} else {
			connector.connectorType = 'obstacle';
		}

		// Generate name and description based on type
		this.generateConnectorDetails(connector);

		// 15% chance to have a trap
		if (this.dice.random() < 0.15) {
			connector.trap = new TrapCreator(this.dice).create();
		}

		// If it's an obstacle, it might not be passable
		if (connector.connectorType === 'obstacle') {
			connector.isPassable = this.dice.random() > 0.3; // 70% passable
			if (!connector.isPassable) {
				connector.difficulty = this.generateDifficulty();
			}
		}

		return connector;
	}

	private generateConnectorDetails(connector: RoomConnector): void {
		switch (connector.connectorType) {
			case 'door':
				connector.name = this.generateDoorName();
				connector.description = this.generateDoorDescription(connector.name);
				break;
			case 'tunnel':
				connector.name = this.generateTunnelName();
				connector.description = this.generateTunnelDescription(connector.name);
				break;
			case 'obstacle':
				const obstacleText = new ObstacleTable().roleWithCascade(this.dice).text;
				connector.name = `Blocked by ${obstacleText}`;
				connector.description = `The path is blocked by ${obstacleText.toLowerCase()}.`;
				break;
		}
	}

	private generateDoorName(): string {
		const types = [
			'Wooden Door',
			'Iron Door',
			'Stone Door',
			'Ancient Portal',
			'Heavy Gate',
			'Reinforced Door',
			'Ornate Doorway',
			'Hidden Passage',
			'Secret Door',
			'Archway'
		];
		const index = Math.floor(this.dice.random() * types.length);
		return types[index];
	}

	private generateDoorDescription(name: string): string {
		const conditions = ['sturdy', 'weathered', 'ornate', 'plain', 'reinforced', 'ancient'];
		const conditionIndex = Math.floor(this.dice.random() * conditions.length);
		return `A ${conditions[conditionIndex]} ${name.toLowerCase()} connects the rooms.`;
	}

	private generateTunnelName(): string {
		const adjectives = ['Dark', 'Narrow', 'Winding', 'Carved', 'Natural', 'Ancient', 'Damp', 'Echoing'];
		const types = ['Passage', 'Tunnel', 'Corridor', 'Hallway', 'Pathway'];

		const adjIndex = Math.floor(this.dice.random() * adjectives.length);
		const typeIndex = Math.floor(this.dice.random() * types.length);

		return `${adjectives[adjIndex]} ${types[typeIndex]}`;
	}

	private generateTunnelDescription(name: string): string {
		const features = [
			'stretches between the rooms',
			'winds its way through the stone',
			'connects the chambers',
			'leads through the darkness',
			'runs between the areas'
		];
		const featureIndex = Math.floor(this.dice.random() * features.length);
		return `A ${name.toLowerCase()} ${features[featureIndex]}.`;
	}

	private generateDifficulty(): string {
		const difficulties = ['Easy to bypass', 'Moderate challenge', 'Difficult to pass', 'Nearly impassable'];
		const index = Math.floor(this.dice.random() * difficulties.length);
		return difficulties[index];
	}
}
