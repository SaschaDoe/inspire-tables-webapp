/**
 * Keyed Scene Tables (Mythic Magazine Volume 2)
 * Generate Events and Triggers for Keyed Scenes
 */

import { rollD100 } from '$lib/utils/mythicDice';

// Keyed Scene Events - What must happen in the scene
export const KEYED_SCENE_EVENTS = [
	'Character must find emotional support or break down',
	'Character discovers a shocking truth about their past',
	'Character must make peace with an enemy or rival',
	'Character faces their greatest fear',
	'Character must rescue someone important to them',
	'Character receives devastating news',
	'Character uncovers a conspiracy or hidden plot',
	'Character must defend their beliefs or values',
	'Character experiences a betrayal from someone trusted',
	'Character finds a crucial clue or missing piece', // 10
	'Character must confront their mentor or authority figure',
	'Character loses something precious or important',
	'Character forms an unexpected alliance',
	'Character witnesses something that changes their worldview',
	'Character must make an impossible choice',
	'Character discovers their destiny or purpose',
	'Character experiences a moment of triumph or victory',
	'Character must atone for a past mistake',
	'Character reunites with someone from their past',
	'Character faces the consequences of their actions', // 20
	'Character must prevent a disaster or catastrophe',
	'Character learns a dark secret about an ally',
	'Character experiences a profound loss',
	'Character must prove their worth or capabilities',
	'Character discovers they were deceived or manipulated',
	'Character must choose between duty and desire',
	'Character finds redemption or forgiveness',
	'Character experiences a supernatural or unexplained event',
	'Character must compete in a test or challenge',
	'Character discovers a hidden truth about their world', // 30
	'Character must escape from captivity or imprisonment',
	'Character forms a deep personal connection',
	'Character must sacrifice something valuable',
	'Character experiences a moment of clarity or revelation',
	'Character must defend the innocent or helpless',
	'Character discovers an ancient secret or artifact',
	'Character must outwit a dangerous opponent',
	'Character experiences a crisis of faith or doubt',
	'Character must solve a complex mystery or puzzle',
	'Character reaches their breaking point', // 40
	'Character must negotiate a dangerous situation',
	'Character discovers their true heritage or identity',
	'Character must overcome a personal weakness',
	'Character experiences an act of kindness that moves them',
	'Character must protect a secret at all costs',
	'Character discovers they have a special ability or gift',
	'Character must make amends with someone they wronged',
	'Character experiences a supernatural transformation',
	'Character must lead others through a crisis',
	'Character discovers the cost of their ambitions', // 50
	'Character must survive against overwhelming odds',
	'Character experiences a moment of perfect happiness',
	'Character must choose between two equally important people',
	'Character discovers a plot against them or their allies',
	'Character must face judgment for their actions',
	'Character experiences a prophetic vision or dream',
	'Character must break a curse or supernatural affliction',
	'Character discovers they are connected to a greater destiny',
	'Character must resist a powerful temptation',
	'Character experiences the return of a forgotten memory', // 60
	'Character must protect an important secret or artifact',
	'Character discovers they were wrong about everything',
	'Character must make a stand for what they believe',
	'Character experiences a devastating defeat',
	'Character must find the strength to continue',
	'Character discovers hidden enemies among friends',
	'Character must unlock a mysterious power or ability',
	'Character experiences a reunion that changes everything',
	'Character must prevent someone from making a terrible mistake',
	'Character discovers the true nature of their quest', // 70
	'Character must face the truth about someone they love',
	'Character experiences a test of their loyalty',
	'Character must save themselves through cleverness alone',
	'Character discovers they are the key to solving a crisis',
	'Character must choose between vengeance and mercy',
	'Character experiences a spiritual or emotional awakening',
	'Character must confront their own darkness',
	'Character discovers a way to achieve the impossible',
	'Character must accept help from an unlikely source',
	'Character experiences the weight of leadership', // 80
	'Character must make a decision that affects many lives',
	'Character discovers they have been manipulated all along',
	'Character must prove their innocence',
	'Character experiences a moment that defines who they are',
	'Character must let go of the past to move forward',
	'Character discovers their actions had unintended consequences',
	'Character must take responsibility for their mistakes',
	'Character experiences a miracle or impossible event',
	'Character must bridge the gap between opposing forces',
	'Character discovers the price of their choices', // 90
	'Character must inspire others to follow them',
	'Character experiences a moment of perfect understanding',
	'Character must break free from control or manipulation',
	'Character discovers they are more capable than they knew',
	'Character must face an enemy who is their equal',
	'Character experiences the full impact of their growth',
	'Character must accept their true nature',
	'Character discovers the key to their salvation',
	'Character must make the hardest choice of their life',
	'Character experiences their defining moment' // 100
];

// Keyed Scene Triggers - Conditions that activate the keyed scene
export const KEYED_SCENE_TRIGGERS = [
	'When Chaos Factor reaches 5 or more',
	'After 3 scenes with horror or fear elements',
	'When Character suffers 2 or more negative outcomes in one scene',
	'After discovering 3 clues about a specific mystery',
	'When a Thread goes unresolved for 5+ scenes',
	'After Character fails an important skill check',
	'When a specific NPC appears for the 3rd time',
	'After a Random Event about betrayal occurs',
	'When Character reaches a specific location',
	'After 2 combat encounters in a row', // 10
	'When Chaos Factor drops to 3 or less',
	'After discovering evidence of a conspiracy',
	'When Character is alone without allies',
	'After a Thread is completed successfully',
	'When a Timer or countdown reaches zero',
	'After receiving 3 warnings or omens',
	'When Character breaks an oath or promise',
	'After meeting all members of a specific group',
	'When a prophecy or prediction comes true',
	'After spending a night in a dangerous place', // 20
	'When Character loses someone important',
	'After 3 failed Fate Questions in a row',
	'When Character finds a specific item or artifact',
	'After betraying or being betrayed by an ally',
	'When moon is full or at a specific time',
	'After completing a specific quest or mission',
	'When Character uses a forbidden power or ability',
	'After 5 scenes without progress on main goal',
	'When Character defeats a major enemy',
	'After receiving contradictory information', // 30
	'When Character returns to their home or origin',
	'After 3 Interrupted Scenes occur',
	'When Character breaks a fundamental rule or law',
	'After discovering a hidden truth',
	'When an NPC from backstory appears',
	'After 2 consecutive positive outcomes',
	'When Character is at their lowest point',
	'After solving a complex puzzle or mystery',
	'When Character makes a critical sacrifice',
	'After 7 scenes have passed', // 40
	'When a specific Thread becomes urgent',
	'After Character gains a significant reward',
	'When an Altered Scene occurs',
	'After Character refuses an important request',
	'When all Threads point to same conclusion',
	'After a Random Event about secrets occurs',
	'When Character confronts a specific NPC',
	'After acquiring 3 important items',
	'When Character experiences a Random Event twist',
	'After 3 scenes in the same location', // 50
	'When Character achieves a personal milestone',
	'After uncovering information about the villain',
	'When Chaos Factor changes by 2 points in one scene',
	'After Character makes an enemy',
	'When a natural disaster or catastrophe occurs',
	'After 2 NPCs from different threads meet',
	'When Character is forced to make a hard choice',
	'After discovering a conspiracy affects them personally',
	'When Character receives a mysterious message',
	'After 4 combat-free scenes', // 60
	'When a previously closed Thread reopens',
	'After Character learns a painful truth',
	'When 2 major NPCs conflict',
	'After Character completes their training or preparation',
	'When a deadline or time limit is approaching',
	'After 3 clues about the same thing are found',
	'When Character enters forbidden territory',
	'After a PC Negative Random Event occurs',
	'When Character discovers their purpose',
	'After achieving 50% of active Threads', // 70
	'When an NPC makes an ultimatum',
	'After Character experiences a vision or omen',
	'When 3 different sources say the same thing',
	'After Character defies authority',
	'When a season changes or time passes',
	'After Random Event involves a specific Theme',
	'When Character finds evidence of time running out',
	'After 2 Ancient/Mystical elements appear',
	'When Character crosses a point of no return',
	'After all allies gather together', // 80
	'When a trap or ambush is triggered',
	'After Character makes a public declaration',
	'When 2 mysteries connect unexpectedly',
	'After traveling to 3 different locations',
	'When Character breaks under pressure',
	'After an NPC dies or disappears',
	'When a prophecy starts coming true',
	'After 3 consecutive Altered Scenes',
	'When Character discovers a pattern or connection',
	'After achieving a victory that feels hollow', // 90
	'When an innocent person is threatened',
	'After Character questions their beliefs',
	'When 3 NPCs warn about the same danger',
	'After discovering the stakes are higher than thought',
	'When Character must choose sides in a conflict',
	'After a major revelation about the world',
	'When all preparation is complete',
	'After Character experiences a near-death moment',
	'When the final piece falls into place',
	'At the moment of greatest uncertainty' // 100
];

/**
 * Roll for a random Keyed Scene Event
 */
export function rollKeyedSceneEvent(): { event: string; roll: number } {
	const roll = rollD100();
	return {
		event: KEYED_SCENE_EVENTS[roll - 1],
		roll
	};
}

/**
 * Roll for a random Keyed Scene Trigger
 */
export function rollKeyedSceneTrigger(): { trigger: string; roll: number } {
	const roll = rollD100();
	return {
		trigger: KEYED_SCENE_TRIGGERS[roll - 1],
		roll
	};
}

/**
 * Get guidance on using Keyed Scenes
 */
export function getKeyedSceneGuidance(): string {
	return `Keyed Scenes are special scenes that trigger when specific conditions are met.

EVENT: What must happen in the scene - this is the dramatic moment or story beat that occurs.

TRIGGER: The condition that activates this keyed scene - track these manually and activate when they're true.

Keyed Scenes help structure your adventure and ensure important story moments happen at the right time.`;
}
