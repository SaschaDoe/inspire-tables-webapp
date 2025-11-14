import { GenerationOption } from './generationOption';
import { Dice } from '$lib/utils/dice';

export abstract class Creator<T> {
	generationOption: GenerationOption = GenerationOption.Gonzo;
	dice: Dice = new Dice();
	protected parentId?: string; // Optional parent reference

	withGenerationOption(option: GenerationOption): this {
		this.generationOption = option;
		return this;
	}

	withDice(dice: Dice): this {
		this.dice = dice;
		return this;
	}

	withParent(parentId: string): this {
		this.parentId = parentId;
		return this;
	}

	abstract create(): T;
}
