import { Creator } from '../base/creator';
import { FableCharacter, type AnimalSize, type FableAnimal } from './fableCharacter';
import { AnimalTable } from '$lib/tables/charTables/animalTable';
import { LittleAnimalArtefactTable } from '$lib/tables/fableTables/littleAnimalArtefactTable';
import { SmallAnimalArtefactTable } from '$lib/tables/fableTables/smallAnimalArtefactTable';
import { BigAnimalArtefactTable } from '$lib/tables/fableTables/bigAnimalArtefactTable';

/**
 * Animals categorized by size for fable characters.
 */
const LITTLE_ANIMALS = new Set([
	'ant', 'bee', 'butterfly', 'grasshopper', 'hornet', 'bumblebee', 'mantis',
	'dung beetle', 'moth', 'slug', 'scarab', 'millipede', 'termite', 'wasp',
	'worm', 'black widow', 'tarantula', 'vineyard snail', 'bacteria', 'slime',
	'seahorse', 'starfish', 'sea urchin', 'jellyfish', 'coral', 'hummingbird',
	'newt', 'axolotl', 'frog', 'toad'
]);

const SMALL_ANIMALS = new Set([
	'hamster', 'rat', 'mole', 'ferret', 'squirrel', 'hedgehog', 'rabbit', 'hare',
	'cat', 'fox', 'badger', 'skunk', 'racoon', 'possum', 'red panda', 'otter',
	'plumploris', 'dikdik', 'armadillo', 'platypus', 'echidna', 'chicken', 'duck',
	'owl', 'raven', 'bat', 'swallow', 'puffin', 'kea', 'screech owl', 'cardinal bird',
	'crab', 'lobster', 'octopus', 'turtle', 'snake', 'rattlesnake', 'mamba',
	'capuchin monkey', 'gibbon', 'goat', 'sheep', 'pig', 'dog', 'coyote'
]);

const BIG_ANIMALS = new Set([
	'black bear', 'grizzly bear', 'ice bear', 'lion', 'tiger', 'jaguar', 'leopard',
	'elephant', 'see elephant', 'hippo', 'rhino', 'buffalo', 'horse', 'reindeer',
	'elk', 'giraffe', 'gorilla', 'chimpanzee', 'orangutan', 'lama', 'alpaca',
	'dromedary', 'camel', 'kangaroo', 'wild boar', 'wolf', 'hyena', 'walrus',
	'panda', 'tapir', 'okapi', 'capybara', 'porcupine', 'sloth',
	'eagle', 'pelican', 'stork', 'crane', 'flamingo', 'peacock', 'emu', 'kasuar',
	'goose', 'uhu', 'buzzard', 'ara', 'toco toucan', 'frigate bird',
	'shark', 'hammerhead shark', 'dolphin', 'blue whale', 'manta ray', 'baracuda',
	'anaconda', 'caiman', 'waran', 'raptor', 'long-necked dinosaur',
	'armored dinosaur', 'horned dinosaur', 'snow goat', 'lux', 'rob'
]);

/**
 * Roles a fable character might have in a story.
 */
const FABLE_ROLES = [
	'the wise elder', 'the brave hero', 'the cunning trickster', 'the loyal friend',
	'the curious explorer', 'the gentle healer', 'the skilled craftsman',
	'the merry musician', 'the wandering merchant', 'the village protector',
	'the keeper of secrets', 'the humble farmer', 'the bold adventurer',
	'the patient teacher', 'the cheerful baker', 'the clever inventor',
	'the kind innkeeper', 'the mysterious stranger', 'the forest guardian',
	'the storytelling bard'
];

/**
 * Personality traits for fable characters.
 */
const PERSONALITIES = [
	'brave but reckless', 'wise and patient', 'cunning and witty',
	'kind and generous', 'shy but determined', 'proud and stubborn',
	'cheerful and optimistic', 'cautious and thoughtful', 'curious and eager',
	'gentle and caring', 'mischievous but good-hearted', 'grumpy but loyal',
	'bold and confident', 'humble and hardworking', 'dreamy and imaginative',
	'practical and resourceful', 'noble and just', 'playful and energetic'
];

/**
 * Motivations for fable characters.
 */
const MOTIVATIONS = [
	'to protect their family', 'to find their true home', 'to prove their worth',
	'to help those in need', 'to discover hidden treasures', 'to learn ancient wisdom',
	'to make new friends', 'to right an old wrong', 'to explore the wide world',
	'to keep a sacred promise', 'to find a legendary place', 'to earn respect',
	'to bring peace to their land', 'to master their craft', 'to solve a great mystery',
	'to reunite with a lost friend', 'to break an old curse', 'to save their village'
];

/**
 * Flaws for fable characters (makes them relatable).
 */
const FLAWS = [
	'too trusting of strangers', 'afraid of the dark', 'easily distracted by shiny things',
	'cannot resist a dare', 'talks too much when nervous', 'forgets important things',
	'too proud to ask for help', 'scared of heights', 'always hungry',
	'impatient with slow things', 'cannot keep a secret', 'afraid of water',
	'too stubborn to admit mistakes', 'worries too much', 'clumsy when excited',
	'gets lost easily', 'too competitive', 'afraid of loud noises'
];

/**
 * Special talents for fable characters.
 */
const TALENTS = [
	'can talk to birds', 'knows every plant in the forest', 'never gets lost',
	'can smell rain coming', 'remembers every story ever heard', 'can run incredibly fast',
	'makes the best soup in the land', 'can fix anything that\'s broken',
	'knows when someone is lying', 'can hold their breath for ages',
	'has the keenest ears', 'can climb any tree', 'makes friends with anyone',
	'can find water anywhere', 'tells the funniest jokes', 'has the warmest heart',
	'can predict the weather', 'has the steadiest paws', 'can sing beautifully',
	'knows all the secret paths'
];

/**
 * Types of homes for fable characters.
 */
const HOMES = [
	'a cozy burrow under the old oak', 'a treehouse in the tallest maple',
	'a cottage by the babbling brook', 'a cave behind the waterfall',
	'a converted windmill on the hill', 'a houseboat on the river',
	'a snug den in the hillside', 'rooms above the village bakery',
	'a hollow in the ancient tree', 'a nest high in the bell tower',
	'a tiny house made of mushrooms', 'a canal boat painted bright colors',
	'a warm kitchen in the village inn', 'a lighthouse on the rocky shore',
	'a mill house by the stream', 'a wagon that travels the roads',
	'a cabin in the snowy mountains', 'a beach hut by the sea'
];

/**
 * Catchphrases for fable characters.
 */
const CATCHPHRASES = [
	'"Every acorn dreams of being an oak!"',
	'"Patience fills the pantry."',
	'"The longest journey starts with a single hop."',
	'"A friend in need is a friend indeed!"',
	'"Fortune favors the brave-hearted!"',
	'"When in doubt, make tea."',
	'"Every problem looks smaller after a good meal."',
	'"The forest provides for those who listen."',
	'"Adventure awaits around every corner!"',
	'"A kind word costs nothing but means everything."',
	'"Work hard, nap harder!"',
	'"The stars know the way."',
	'"Together we are stronger!"',
	'"Never trust a shortcut through the swamp."',
	'"Home is where the heart rests."',
	'"A good story is worth any journey."'
];

export class FableCharacterCreator extends Creator<FableCharacter> {
	create(): FableCharacter {
		const character = new FableCharacter();
		this.setParentReference(character);

		// Determine number of animals (1-2, with 70% chance of 1)
		const numberOfAnimals = this.dice.random() > 0.7 ? 2 : 1;

		// Generate animals and determine sizes
		const animalTable = new AnimalTable();
		for (let i = 0; i < numberOfAnimals; i++) {
			const animalType = animalTable.roleWithCascade(this.dice).text;
			const size = this.determineAnimalSize(animalType);
			character.animals.push({ type: animalType, size });
		}

		// Set overall size (use largest animal's size)
		character.size = this.determineLargestSize(character.animals);

		// Generate character properties
		character.role = this.pickRandom(FABLE_ROLES);
		character.personality = this.pickRandom(PERSONALITIES);
		character.motivation = this.pickRandom(MOTIVATIONS);
		character.flaw = this.pickRandom(FLAWS);
		character.talent = this.pickRandom(TALENTS);
		character.home = this.pickRandom(HOMES);
		character.catchphrase = this.pickRandom(CATCHPHRASES);

		// Generate size-appropriate artefacts (1-3)
		const numberOfArtefacts = this.dice.rollInterval(1, 3);
		const artefactTable = this.getArtefactTableForSize(character.size);
		for (let i = 0; i < numberOfArtefacts; i++) {
			character.artefacts.push(artefactTable.roleWithCascade(this.dice).text);
		}

		// Generate name and appearance
		character.name = this.generateName(character);
		character.appearance = this.generateAppearance(character);
		character.description = this.generateDescription(character);

		return character;
	}

	/**
	 * Determine the size category of an animal.
	 */
	private determineAnimalSize(animal: string): AnimalSize {
		const lowerAnimal = animal.toLowerCase();

		if (LITTLE_ANIMALS.has(lowerAnimal)) return 'little';
		if (BIG_ANIMALS.has(lowerAnimal)) return 'big';
		if (SMALL_ANIMALS.has(lowerAnimal)) return 'small';

		// Default to small for unknown animals
		return 'small';
	}

	/**
	 * Determine the largest size among multiple animals.
	 */
	private determineLargestSize(animals: FableAnimal[]): AnimalSize {
		const sizeOrder: AnimalSize[] = ['little', 'small', 'big'];
		let maxIndex = 0;

		for (const animal of animals) {
			const index = sizeOrder.indexOf(animal.size);
			if (index > maxIndex) maxIndex = index;
		}

		return sizeOrder[maxIndex];
	}

	/**
	 * Get the appropriate artefact table for the given size.
	 */
	private getArtefactTableForSize(size: AnimalSize) {
		switch (size) {
			case 'little':
				return new LittleAnimalArtefactTable();
			case 'small':
				return new SmallAnimalArtefactTable();
			case 'big':
				return new BigAnimalArtefactTable();
		}
	}

	/**
	 * Pick a random element from an array.
	 */
	private pickRandom<T>(array: T[]): T {
		const index = this.dice.rollInterval(0, array.length - 1);
		return array[index];
	}

	/**
	 * Generate a whimsical fable-appropriate name.
	 */
	private generateName(character: FableCharacter): string {
		const prefixes = [
			'Old', 'Young', 'Brave', 'Wise', 'Clever', 'Swift', 'Kind',
			'Merry', 'Bold', 'Little', 'Big', 'Gentle', 'Noble'
		];

		const names = [
			'Bramble', 'Clover', 'Thistle', 'Willow', 'Hazel', 'Rowan',
			'Basil', 'Sage', 'Pippin', 'Nutkin', 'Moss', 'Fern',
			'Heather', 'Briar', 'Flint', 'River', 'Brook', 'Meadow',
			'Aspen', 'Cedar', 'Maple', 'Birch', 'Oak', 'Elm',
			'Pepper', 'Ginger', 'Cinnamon', 'Honey', 'Berry', 'Apple'
		];

		const suffixes = ['whiskers', 'paw', 'tail', 'nose', 'ear', 'foot', 'heart', 'song'];

		// 50% chance to add a prefix
		const usePrefix = this.dice.random() > 0.5;
		// 30% chance to add a suffix
		const useSuffix = this.dice.random() > 0.7;

		let name = this.pickRandom(names);

		if (usePrefix) {
			name = this.pickRandom(prefixes) + ' ' + name;
		}

		if (useSuffix) {
			name = name + this.pickRandom(suffixes);
		}

		return name;
	}

	/**
	 * Generate a description of the character's appearance.
	 */
	private generateAppearance(character: FableCharacter): string {
		const primaryAnimal = character.animals[0];
		const secondaryAnimal = character.animals[1];

		const coatColors = [
			'brown', 'grey', 'red', 'golden', 'black', 'white', 'spotted',
			'striped', 'silver', 'tawny', 'russet', 'cream-colored'
		];

		const clothing = {
			little: [
				'a tiny vest made from a flower petal', 'a cap fashioned from an acorn top',
				'a cloak of woven spider silk', 'boots made from seed husks'
			],
			small: [
				'a well-worn traveling cloak', 'a vest with many pockets',
				'a wide-brimmed hat', 'a warm knitted scarf', 'sturdy leather boots'
			],
			big: [
				'a great fur-trimmed coat', 'armor of polished bark',
				'a magnificent cloak', 'a vest of chainmail leaves'
			]
		};

		const color = this.pickRandom(coatColors);
		const garment = this.pickRandom(clothing[character.size]);

		let appearance = `A ${color} ${primaryAnimal.type}`;

		if (secondaryAnimal) {
			appearance += ` with features of a ${secondaryAnimal.type}`;
		}

		appearance += `, wearing ${garment}`;

		return appearance;
	}

	/**
	 * Generate a full description of the character.
	 */
	private generateDescription(character: FableCharacter): string {
		const animalDesc =
			character.animals.length > 1
				? `${character.animals[0].type} with ${character.animals[1].type} traits`
				: character.animals[0].type;

		return `${character.name} is ${character.role}, a ${character.personality} ${animalDesc}. ` +
			`They live in ${character.home} and their greatest wish is ${character.motivation}. ` +
			`${character.talent.charAt(0).toUpperCase() + character.talent.slice(1)}, though they are ${character.flaw}. ` +
			`Their favorite saying is ${character.catchphrase}`;
	}
}
