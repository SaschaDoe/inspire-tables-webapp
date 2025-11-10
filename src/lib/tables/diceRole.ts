export class DiceRole {
	numberOfDice: number;
	sidesOfDice: number;
	modifier: number;

	constructor(numberOfDice = 1, sidesOfDice = 6, modifier = 0) {
		this.numberOfDice = numberOfDice;
		this.sidesOfDice = sidesOfDice;
		this.modifier = modifier;
	}

	withNumberOfDice(numberOfDice: number): DiceRole {
		this.numberOfDice = numberOfDice;
		return this;
	}

	withSidesOfDice(sidesOfDice: number): DiceRole {
		this.sidesOfDice = sidesOfDice;
		return this;
	}

	withModifier(modifier: number): DiceRole {
		this.modifier = modifier;
		return this;
	}

	toString(): string {
		const modifierStr = this.modifier !== 0 ? ` ${this.modifier > 0 ? '+' : ''}${this.modifier}` : '';
		return `${this.numberOfDice}d${this.sidesOfDice}${modifierStr}`;
	}
}

export class EquallyDistributed extends DiceRole {
	constructor() {
		super(0, 0, 0);
	}

	toString(): string {
		return 'Equally Distributed';
	}
}
