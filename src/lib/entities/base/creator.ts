import { GenerationOption } from './generationOption';
import { Dice } from '$lib/utils/dice';

export abstract class Creator<T> {
	generationOption: GenerationOption = GenerationOption.Gonzo;
	dice: Dice = new Dice();
	protected parentId?: string; // Optional parent reference
	protected overrides: Record<string, any> = {}; // Property overrides

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

	/**
	 * Set property overrides for entity generation
	 * @param overrides - Object with property names as keys and override values
	 */
	withOverrides(overrides: Record<string, any>): this {
		this.overrides = overrides;
		return this;
	}

	/**
	 * Automatically sets parentId on the entity if a parent was provided.
	 * Call this at the start of create() for any entity that has a parent.
	 *
	 * @param entity - The entity to set parentId on
	 * @example
	 * create(): SolarSystem {
	 *   const solarSystem = new SolarSystem();
	 *   this.setParentReference(solarSystem);
	 *   // ... rest of creation
	 * }
	 */
	protected setParentReference(entity: any): void {
		if (this.parentId && entity && typeof entity === 'object') {
			entity.parentId = this.parentId;
		}
	}

	abstract create(): T;
}
