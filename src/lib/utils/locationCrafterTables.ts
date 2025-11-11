/**
 * Location Crafter Tables (from Mythic Magazine Volume 2 & 3)
 * Tables for randomized location generation
 */

import { rollD10, rollD100 } from './mythicDice';

// ============================================================================
// Types
// ============================================================================

export type RegionType =
	| 'Wilderness'
	| 'City'
	| 'Structure'
	| 'Cavern Dungeon'
	| 'Ancient Dungeon'
	| 'Palatial Dungeon';
export type CategoryType = 'Locations-Large' | 'Locations-Small' | 'Encounters-Objects';
export type AreaElement = 'Expected' | 'Random' | 'Known' | 'Special' | 'Complete' | 'None';

export interface RegionDescriptor {
	roll: number;
	wilderness: string;
	city: string;
	structure: string;
}

export interface AreaElementResult {
	element: AreaElement;
	alternate?: AreaElement; // For Known fallback
	progressPointModifier?: number; // For PP-6 results
}

export interface RandomElementDescriptor {
	roll: number;
	locations: string;
	encounters: string;
	objects: string;
}

// ============================================================================
// Region Descriptors Table
// ============================================================================

const REGION_DESCRIPTORS: RegionDescriptor[] = [
	{ roll: 1, wilderness: 'Dry and arid', city: 'Sprawling and large', structure: 'Well made and tended' },
	{ roll: 6, wilderness: 'Wet', city: 'Simple and sparse', structure: 'Run down' },
	{ roll: 11, wilderness: 'Dense vegetation', city: 'Modern', structure: 'Busy' },
	{ roll: 16, wilderness: 'Rocky', city: 'Old', structure: 'Inactive or abandoned' },
	{ roll: 21, wilderness: 'Lots of open space', city: 'Thriving or bustling', structure: 'Ancient, of a bygone era' },
	{ roll: 26, wilderness: 'Sandy, dirty, or rough', city: 'Inactive or abandoned', structure: 'Old' },
	{ roll: 31, wilderness: 'Barren', city: 'Quiet, sleepy', structure: 'Modern' },
	{ roll: 36, wilderness: 'Active natural elements, such as a volcano, waterfall, river, winds, rain, etc.', city: 'Incorporates a natural element, roll on the Wilderness column', structure: 'Incorporates a natural element, roll on the Wilderness column' },
	{ roll: 41, wilderness: 'Hot', city: 'Dangerous', structure: 'Simple or small' },
	{ roll: 46, wilderness: 'Cold', city: 'Well ordered and organized', structure: 'Tall or large' },
	{ roll: 51, wilderness: 'Hilly or sloping', city: 'In crisis', structure: 'Imposing' },
	{ roll: 56, wilderness: 'Difficult to travel through', city: 'Crumbling or run down', structure: 'Welcoming' },
	{ roll: 61, wilderness: 'Plant life', city: 'Wealthy and booming', structure: 'Functional' },
	{ roll: 66, wilderness: 'Active animals', city: 'Densely populated', structure: 'Quiet' },
	{ roll: 71, wilderness: 'Mountainous', city: 'Clean', structure: 'Sturdy' },
	{ roll: 76, wilderness: 'Cliffs', city: 'Friendly', structure: 'Dangerous' },
	{ roll: 81, wilderness: 'Dangerous', city: 'Hostile', structure: 'Occupied' },
	{ roll: 86, wilderness: 'Body of water', city: 'Specific purpose', structure: 'Specific purpose' },
	{ roll: 91, wilderness: 'Exotic', city: 'Exotic', structure: 'Exotic' },
	{ roll: 96, wilderness: 'Roll on Description Tables', city: 'Roll on Description Tables', structure: 'Roll on Description Tables' }
];

export function rollRegionDescriptor(regionType: RegionType): string {
	const roll = rollD100();
	const descriptor = REGION_DESCRIPTORS.find(d => roll >= d.roll && (REGION_DESCRIPTORS[REGION_DESCRIPTORS.indexOf(d) + 1]?.roll > roll || roll >= 96)) || REGION_DESCRIPTORS[0];

	switch (regionType) {
		case 'Wilderness': return descriptor.wilderness;
		case 'City': return descriptor.city;
		case 'Structure': return descriptor.structure;
	}
}

// ============================================================================
// Area Elements Table (1d10 + Progress Points)
// ============================================================================

export function rollAreaElement(progressPoints: number, category: CategoryType): AreaElementResult {
	const roll = rollD10() + progressPoints;

	if (category === 'Locations-Large') {
		if (roll <= 5) return { element: 'Expected' };
		if (roll <= 8) return { element: 'Expected' };
		if (roll <= 10) return { element: 'Random' };
		if (roll === 11) return { element: 'Known', alternate: 'Random' };
		if (roll === 12) return { element: 'Known', alternate: 'Expected' };
		if (roll === 13) return { element: 'Special' };
		if (roll === 14) return { element: 'Complete' };
		if (roll === 15) return { element: 'Complete' };
		return { element: 'Expected', progressPointModifier: -6 };
	} else if (category === 'Locations-Small') {
		if (roll <= 5) return { element: 'Expected' };
		if (roll <= 8) return { element: 'Expected' };
		if (roll <= 10) return { element: 'Random' };
		if (roll === 11) return { element: 'Known', alternate: 'Random' };
		if (roll === 12) return { element: 'Complete' };
		if (roll === 13) return { element: 'Known', alternate: 'Special' };
		if (roll === 14) return { element: 'Complete' };
		if (roll === 15) return { element: 'Complete' };
		return { element: 'Expected', progressPointModifier: -6 };
	} else { // Encounters-Objects
		if (roll <= 5) return { element: 'None' };
		if (roll <= 8) return { element: 'Expected' };
		if (roll <= 10) return { element: 'Random' };
		if (roll === 11) return { element: 'Known', alternate: 'Random' };
		if (roll === 12) return { element: 'None' };
		if (roll === 13) return { element: 'Known', alternate: 'Special' };
		if (roll === 14) return { element: 'Expected' };
		if (roll === 15) return { element: 'Expected' };
		return { element: 'Expected', progressPointModifier: -6 };
	}
}

// ============================================================================
// Random Element Descriptors Table
// ============================================================================

const RANDOM_ELEMENT_DESCRIPTORS: RandomElementDescriptor[] = [
	{ roll: 1, locations: 'Abandoned', encounters: 'Abnormal', objects: 'Amusing' },
	{ roll: 2, locations: 'Amusing', encounters: 'Aggressive', objects: 'Ancient' },
	{ roll: 3, locations: 'Ancient', encounters: 'Angry', objects: 'Aromatic' },
	{ roll: 4, locations: 'Aromatic', encounters: 'Anxious', objects: 'Average' },
	{ roll: 5, locations: 'Beautiful', encounters: 'Beautiful', objects: 'Beautiful' },
	{ roll: 6, locations: 'Bleak', encounters: 'Average', objects: 'Bizarre' },
	{ roll: 7, locations: 'Average', encounters: 'Bold', objects: 'Classy' },
	{ roll: 8, locations: 'Bizarre', encounters: 'Busy', objects: 'Colorful' },
	{ roll: 9, locations: 'Calm', encounters: 'Calm', objects: 'Creepy' },
	{ roll: 10, locations: 'Classy', encounters: 'Careless', objects: 'Cute' },
	{ roll: 11, locations: 'Clean', encounters: 'Cautious', objects: 'Damaged' },
	{ roll: 12, locations: 'Colorful', encounters: 'Cheerful', objects: 'Delicate' },
	{ roll: 13, locations: 'Creepy', encounters: 'Combative', objects: 'Disgusting' },
	{ roll: 14, locations: 'Cold', encounters: 'Bizarre', objects: 'Cold' },
	{ roll: 15, locations: 'Cute', encounters: 'Crazy', objects: 'Empty' },
	{ roll: 16, locations: 'Damaged', encounters: 'Curious', objects: 'Enormous' },
	{ roll: 17, locations: 'Dangerous', encounters: 'Dangerous', objects: 'Dangerous' },
	{ roll: 18, locations: 'Dark', encounters: 'Defiant', objects: 'Exotic' },
	{ roll: 19, locations: 'Dirty', encounters: 'Classy', objects: 'Deliberate' },
	{ roll: 20, locations: 'Delightful', encounters: 'Delightful', objects: 'Delightful' },
	{ roll: 21, locations: 'Drab', encounters: 'Creepy', objects: 'Faded' },
	{ roll: 22, locations: 'Disgusting', encounters: 'Energetic', objects: 'Familiar' },
	{ roll: 23, locations: 'Enormous', encounters: 'Enormous', objects: 'Enormous' },
	{ roll: 24, locations: 'Dry', encounters: 'Excited', objects: 'Fancy' },
	{ roll: 25, locations: 'Empty', encounters: 'Fearful', objects: 'Hard' },
	{ roll: 26, locations: 'Enormous', encounters: 'Ferocious', objects: 'Heavy' },
	{ roll: 27, locations: 'Exotic', encounters: 'Foolish', objects: 'Horrible' },
	{ roll: 28, locations: 'Fortunate', encounters: 'Fortunate', objects: 'Fortunate' },
	{ roll: 29, locations: 'Familiar', encounters: 'Frantic', objects: 'Important' },
	{ roll: 30, locations: 'Frightening', encounters: 'Frightening', objects: 'Frightening' },
	{ roll: 31, locations: 'Full', encounters: 'Cute', objects: 'Large' },
	{ roll: 32, locations: 'Fancy', encounters: 'Generous', objects: 'Lethal' },
	{ roll: 33, locations: 'Festive', encounters: 'Gentle', objects: 'Magnificent' },
	{ roll: 34, locations: 'Harsh', encounters: 'Glad', objects: 'Military' },
	{ roll: 35, locations: 'Horrible', encounters: 'Graceful', objects: 'Modern' },
	{ roll: 36, locations: 'Important', encounters: 'Happy', objects: 'Extravagant' },
	{ roll: 37, locations: 'Helpful', encounters: 'Helpful', objects: 'Helpful' },
	{ roll: 38, locations: 'Lavish', encounters: 'Helpless', objects: 'Mundane' },
	{ roll: 39, locations: 'Magnificent', encounters: 'Innocent', objects: 'Natural' },
	{ roll: 40, locations: 'Intense', encounters: 'Intense', objects: 'Powerful' },
	{ roll: 41, locations: 'Messy', encounters: 'Lazy', objects: 'Rare' },
	{ roll: 42, locations: 'Military', encounters: 'Defeated', objects: 'Light' },
	{ roll: 43, locations: 'Loud', encounters: 'Loud', objects: 'Loud' },
	{ roll: 44, locations: 'Modern', encounters: 'Loyal', objects: 'Reassuring' },
	{ roll: 45, locations: 'Majestic', encounters: 'Majestic', objects: 'Majestic' },
	{ roll: 46, locations: 'Meaningful', encounters: 'Disgusting', objects: 'Meaningful' },
	{ roll: 47, locations: 'Extravagant', encounters: 'Enormous', objects: 'Mechanical' },
	{ roll: 48, locations: 'Mundane', encounters: 'Miserable', objects: 'Ruined' },
	{ roll: 49, locations: 'Mysterious', encounters: 'Mysterious', objects: 'Mysterious' },
	{ roll: 50, locations: 'Natural', encounters: 'Feeble', objects: 'New' },
	{ roll: 51, locations: 'Odd', encounters: 'Odd', objects: 'Odd' },
	{ roll: 52, locations: 'Official', encounters: 'Official', objects: 'Official' },
	{ roll: 53, locations: 'Peaceful', encounters: 'Peaceful', objects: 'Small' },
	{ roll: 54, locations: 'Small', encounters: 'Playful', objects: 'Smelly' },
	{ roll: 55, locations: 'Positive', encounters: 'Positive', objects: 'Positive' },
	{ roll: 56, locations: 'Reassuring', encounters: 'Powerful', objects: 'Powerful' },
	{ roll: 57, locations: 'Quaint', encounters: 'Exotic', objects: 'Smooth' },
	{ roll: 58, locations: 'Quiet', encounters: 'Familiar', objects: 'Valuable' },
	{ roll: 59, locations: 'Ruined', encounters: 'Slow', objects: 'Warm' },
	{ roll: 60, locations: 'Rustic', encounters: 'Horrible', objects: 'Soft' },
	{ roll: 61, locations: 'Simple', encounters: 'Swift', objects: 'Watery' },
	{ roll: 62, locations: 'Threatening', encounters: 'Threatening', objects: 'Threatening' },
	{ roll: 63, locations: 'Smelly', encounters: 'Violent', objects: 'Weapon' },
	{ roll: 64, locations: 'Tranquil', encounters: 'Wild', objects: 'Useful' },
	{ roll: 65, locations: 'Warm', encounters: 'Important', objects: 'Clothing' },
	{ roll: 66, locations: 'Watery', encounters: 'Lonely', objects: 'Travel' },
	{ roll: 67, locations: 'Negative', encounters: 'Mighty', objects: 'Tool' },
	{ roll: 68, locations: 'Enclosed', encounters: 'Military', objects: 'Negative' },
	{ roll: 69, locations: 'Domestic', encounters: 'Mundane', objects: 'Communication' },
	{ roll: 70, locations: 'New', encounters: 'Powerful', objects: 'Food' },
	{ roll: 71, locations: 'Open', encounters: 'Reassuring', objects: 'Domestic' },
	{ roll: 72, locations: 'Safe', encounters: 'Small', objects: 'Artistic' },
	{ roll: 73, locations: 'Expected', encounters: 'Smelly', objects: 'Expected' },
	{ roll: 74, locations: 'Unexpected', encounters: 'Strong', objects: 'Unexpected' },
	{ roll: 75, locations: 'Strange', encounters: 'Watery', objects: 'Strange' },
	{ roll: 76, locations: 'Active', encounters: 'Weak', objects: 'Resource' },
	{ roll: 77, locations: 'Inactive', encounters: 'Ambush', objects: 'Fuel' },
	{ roll: 78, locations: 'Harmful', encounters: 'Harmful', objects: 'Harmful' },
	{ roll: 79, locations: 'Primitive', encounters: 'Trap', objects: 'Energy' },
	{ roll: 80, locations: 'Protection', encounters: 'Friend', objects: 'Multiple' },
	{ roll: 81, locations: 'Unusual', encounters: 'Foe', objects: 'Single' },
	{ roll: 82, locations: 'Bright', encounters: 'Negative', objects: 'Unusual' },
	{ roll: 83, locations: 'Ornate', encounters: 'Evil', objects: 'Bright' },
	{ roll: 84, locations: 'Atmosphere', encounters: 'Animal', objects: 'Ornate' },
	{ roll: 85, locations: 'Sounds', encounters: 'Expected', objects: 'Broken' },
	{ roll: 86, locations: 'Resourceful', encounters: 'Unexpected', objects: 'Liquid' },
	{ roll: 87, locations: 'Purposeful', encounters: 'Strange', objects: 'Personal' },
	{ roll: 88, locations: 'Personal', encounters: 'Armed', objects: 'Intriguing' },
	{ roll: 89, locations: 'Exclusive', encounters: 'Active', objects: 'Active' },
	{ roll: 90, locations: 'Intriguing', encounters: 'Inactive', objects: 'Inactive' },
	{ roll: 91, locations: 'Echo', encounters: 'Multiple', objects: 'Garbage' },
	{ roll: 92, locations: 'Unsteady', encounters: 'Single', objects: 'Useless' },
	{ roll: 93, locations: 'Moving', encounters: 'Primitive', objects: 'Primitive' },
	{ roll: 94, locations: 'Cluttered', encounters: 'Unusual', objects: 'Desired' },
	{ roll: 95, locations: 'Storage', encounters: 'Fast', objects: 'Healing' },
	{ roll: 96, locations: 'Confusing', encounters: 'Hidden', objects: 'Hidden' },
	{ roll: 97, locations: 'Lonely', encounters: 'Natural', objects: 'Prized' },
	{ roll: 98, locations: 'Long', encounters: 'Quiet', objects: 'Flora' },
	{ roll: 99, locations: 'Tall', encounters: 'Unnatural', objects: 'Moving' },
	{ roll: 100, locations: 'Artistic', encounters: 'Resourceful', objects: 'Confusing' }
];

export function rollRandomElementDescriptor(category: 'Locations' | 'Encounters' | 'Objects'): { word1: string; word2: string; roll1: number; roll2: number } {
	const roll1 = rollD100();
	const roll2 = rollD100();

	const desc1 = RANDOM_ELEMENT_DESCRIPTORS.find(d => d.roll === roll1) || RANDOM_ELEMENT_DESCRIPTORS[roll1 - 1];
	const desc2 = RANDOM_ELEMENT_DESCRIPTORS.find(d => d.roll === roll2) || RANDOM_ELEMENT_DESCRIPTORS[roll2 - 1];

	let word1 = '';
	let word2 = '';

	switch (category) {
		case 'Locations':
			word1 = desc1.locations;
			word2 = desc2.locations;
			break;
		case 'Encounters':
			word1 = desc1.encounters;
			word2 = desc2.encounters;
			break;
		case 'Objects':
			word1 = desc1.objects;
			word2 = desc2.objects;
			break;
	}

	return { word1, word2, roll1, roll2 };
}

// ============================================================================
// Special Element Table
// ============================================================================

export type SpecialElementType =
	| 'Random + Expected'
	| 'Random + Random'
	| 'Expected + Expected'
	| 'Roll Twice';

export function rollSpecialElement(): SpecialElementType {
	const roll = rollD10();

	if (roll <= 3) return 'Random + Expected';
	if (roll <= 6) return 'Random + Random';
	if (roll <= 9) return 'Expected + Expected';
	return 'Roll Twice';
}

// ============================================================================
// Complete Element Interpretation
// ============================================================================

export function getCompleteElementGuidance(): string {
	return 'Complete means this Area contains everything the Region has to offer for this Category. ' +
		'For Large Locations: This Area and its Sub-Areas contain all remaining unexplored areas. ' +
		'For Small Locations: All sub-locations are present here. ' +
		'For Encounters/Objects: All significant encounters/objects that would be found in this Region are present.';
}
