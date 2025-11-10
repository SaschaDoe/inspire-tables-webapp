import type { DiceRole } from '../tables/diceRole';

export class Dice {
	role(diceRole: DiceRole): number {
		let sum = 0;
		for (let i = 0; i < diceRole.numberOfDice; i++) {
			sum += this.randomInt(1, diceRole.sidesOfDice);
		}
		return sum + diceRole.modifier;
	}

	private randomInt(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
}
