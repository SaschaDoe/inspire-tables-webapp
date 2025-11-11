/**
 * Mystery Descriptors Tables (Mythic Magazine Volume 6)
 * Word lists for generating inspiration for clues and suspects
 * Similar to Action/Description tables but themed for mysteries
 */

import { rollD100 } from '$lib/utils/mythicDice';

// Clues Descriptors (100 words)
export const CLUES_DESCRIPTORS = [
	'Abandoned',
	'Abnormal',
	'Academic',
	'Amusing',
	'Animal',
	'Aromatic',
	'Art',
	'Awkward',
	'Beautiful',
	'Bizarre', // 10
	'Business',
	'Careless',
	'Classy',
	'Clean',
	'Clothing',
	'Cold',
	'Colorful',
	'Communication',
	'Complicated',
	'Container', // 20
	'Creepy',
	'Damaged',
	'Dangerous',
	'Delicate',
	'Descriptive',
	'Detailed',
	'Dirty',
	'Disgusting',
	'Dispute',
	'Empty', // 30
	'Exotic',
	'Extravagant',
	'Familiar',
	'Fancy',
	'Feminine',
	'Festive',
	'Food',
	'Frightening',
	'Furnishing',
	'Hard', // 40
	'Heavy',
	'Hidden',
	'Home',
	'Information',
	'Intense',
	'Intrigue',
	'Investment',
	'Juvenile',
	'Large',
	'Legal', // 50
	'Lethal',
	'Lies',
	'Loud',
	'Luxury',
	'Magnificent',
	'Masculine',
	'Meaningful',
	'Mechanical',
	'Messy',
	'Military', // 60
	'Misfortune',
	'Modern',
	'Motive',
	'Mundane',
	'Mysterious',
	'Natural',
	'Neat',
	'Obscure',
	'Odd',
	'Official', // 70
	'Old',
	'Partial',
	'Passion',
	'Personal',
	'Plot',
	'Portal',
	'Possession',
	'Powerful',
	'Quaint',
	'Rare', // 80
	'Reassuring',
	'Ruined',
	'Rumor',
	'Scientific',
	'Simple',
	'Small',
	'Soft',
	'Technology',
	'Threatening',
	'Tool', // 90
	'Travel',
	'Uncertain',
	'Valuable',
	'Vehicle',
	'Warm',
	'Waste',
	'Wealth',
	'Weapon',
	'Wet',
	'Work' // 100
];

// Suspects Descriptors (100 words)
export const SUSPECTS_DESCRIPTORS = [
	'Afraid',
	'Aggressive',
	'Aggrieved',
	'Angry',
	'Anxious',
	'Argumentative',
	'Assist',
	'Associate',
	'Awkward',
	'Beautiful', // 10
	'Bizarre',
	'Bold',
	'Brave',
	'Burden',
	'Business',
	'Busy',
	'Calm',
	'Careful',
	'Careless',
	'Classy', // 20
	'Competition',
	'Connected',
	'Conniving',
	'Corrupt',
	'Creepy',
	'Dangerous',
	'Deceive',
	'Defiant',
	'Desperate',
	'Dispute', // 30
	'Elusive',
	'Emotional',
	'Enemy',
	'Exotic',
	'Failure',
	'Fame',
	'Family',
	'Feminine',
	'Fleeing',
	'Foolish', // 40
	'Friendly',
	'Guilty',
	'Harm',
	'Helpful',
	'Hidden',
	'Inferior',
	'Innocent',
	'Insane',
	'Intelligent',
	'Intimidating', // 50
	'Jealousy',
	'Jovial',
	'Justice',
	'Lazy',
	'Leader',
	'Liar',
	'Lies',
	'Love',
	'Luxury',
	'Manipulation', // 60
	'Masculine',
	'Mature',
	'Misfortune',
	'Missing',
	'Motivated',
	'Mundane',
	'Mysterious',
	'Negligent',
	'Odd',
	'Official', // 70
	'Old',
	'Passionate',
	'Poor',
	'Power',
	'Privileged',
	'Professional',
	'Protective',
	'Quiet',
	'Reassuring',
	'Representative', // 80
	'Resourceful',
	'Rough',
	'Ruthless',
	'Secretive',
	'Skilled',
	'Stealthy',
	'Strong',
	'Success',
	'Suffering',
	'Suspicious', // 90
	'Tension',
	'Threatening',
	'Unhelpful',
	'Unknown',
	'Unusual',
	'Vengeance',
	'Wealthy',
	'Witness',
	'Work',
	'Young' // 100
];

export interface MysteryDescriptorResult {
	word1: string;
	word2: string;
	roll1: number;
	roll2: number;
}

/**
 * Roll for clue descriptors
 * Roll twice and get two words for inspiration
 */
export function rollClueDescriptors(): MysteryDescriptorResult {
	const roll1 = rollD100();
	const roll2 = rollD100();

	return {
		word1: CLUES_DESCRIPTORS[roll1 - 1],
		word2: CLUES_DESCRIPTORS[roll2 - 1],
		roll1,
		roll2
	};
}

/**
 * Roll for suspect descriptors
 * Roll twice and get two words for inspiration
 */
export function rollSuspectDescriptors(): MysteryDescriptorResult {
	const roll1 = rollD100();
	const roll2 = rollD100();

	return {
		word1: SUSPECTS_DESCRIPTORS[roll1 - 1],
		word2: SUSPECTS_DESCRIPTORS[roll2 - 1],
		roll1,
		roll2
	};
}

/**
 * Get guidance on using mystery descriptors
 */
export function getMysteryDescriptorGuidance(): string {
	return `Roll twice on the appropriate table and combine the two words for inspiration.

	For Clues: The words suggest what the clue is, where it's found, or what it reveals.
	For Suspects: The words describe the suspect's personality, motivation, or role.

	If you roll the same word twice, consider it "doubled down" - interpret it more intensely.

	These are just inspiration - use them to spark ideas about your new clue or suspect!`;
}
