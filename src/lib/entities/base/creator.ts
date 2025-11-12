import { GenerationOption } from './generationOption';
import { Dice } from '$lib/utils/dice';

export abstract class Creator<T> {
	generationOption: GenerationOption = GenerationOption.Gonzo;
	dice: Dice = new Dice();

	withGenerationOption(option: GenerationOption): this {
		this.generationOption = option;
		return this;
	}

	withDice(dice: Dice): this {
		this.dice = dice;
		return this;
	}

	abstract create(): T;
}
