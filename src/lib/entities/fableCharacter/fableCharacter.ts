import { Entity } from '../base/entity';

/**
 * Size category for fable animals, determining appropriate artefacts.
 */
export type AnimalSize = 'little' | 'small' | 'big';

/**
 * An animal type with its determined size category.
 */
export interface FableAnimal {
	type: string;
	size: AnimalSize;
}

/**
 * A fable character - an anthropomorphic animal character for children's stories.
 * Think of characters like those in Redwall, Wind in the Willows, or classic fables.
 */
export class FableCharacter extends Entity {
	name = '';

	/**
	 * The animal(s) this character is based on (1-2 animals).
	 * If 2 animals, the character might be a hybrid or have traits of both.
	 */
	animals: FableAnimal[] = [];

	/**
	 * The primary size category (determined by largest animal).
	 */
	size: AnimalSize = 'small';

	/**
	 * Character's role in the story/fable.
	 */
	role = '';

	/**
	 * Personality trait.
	 */
	personality = '';

	/**
	 * What the character wants or strives for.
	 */
	motivation = '';

	/**
	 * The character's flaw or weakness.
	 */
	flaw = '';

	/**
	 * A special talent or skill this character has.
	 */
	talent = '';

	/**
	 * Size-appropriate artefacts/items the character owns.
	 */
	artefacts: string[] = [];

	/**
	 * Where the character lives.
	 */
	home = '';

	/**
	 * A characteristic catchphrase or saying.
	 */
	catchphrase = '';

	/**
	 * Description of appearance.
	 */
	appearance = '';
}
