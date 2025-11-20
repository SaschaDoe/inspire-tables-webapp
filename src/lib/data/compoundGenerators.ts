import type { StoryBoardNode } from '$lib/types/storyboard';
import type { StoryEngineCard } from '$lib/types/storyEngine';
import type { WorldBuilderCard } from '$lib/types/worldBuilder';
import type { LoreMasterCard } from '$lib/types/loreMaster';

import { getRandomCard as getRandomStoryEngineCard } from './storyEngineLoader';
import { getRandomCard as getRandomWorldBuilderCard, generateMicrosetting } from './worldBuilderLoader';
import { getRandomCard as getRandomLoreMasterCard, pairWithDeityIfNeeded } from './loreMasterLoader';

// Compound generation result
export interface CompoundGeneration {
	nodes: Partial<StoryBoardNode>[];
	connections: Array<{
		fromIndex: number; // Index in nodes array
		toIndex: number;
		label: string;
		color?: string;
		lineType?: 'solid' | 'dashed' | 'dotted';
	}>;
	layout: 'horizontal' | 'grid' | 'radial' | 'vertical';
	groupId: string; // All nodes share this group ID
}

/**
 * Calculate positions for horizontal layout
 */
function horizontalLayout(count: number, cardWidth: number = 400, gap: number = 50): Array<{ x: number; y: number }> {
	const positions: Array<{ x: number; y: number }> = [];

	for (let i = 0; i < count; i++) {
		positions.push({
			x: i * (cardWidth + gap),
			y: 0
		});
	}

	return positions;
}

/**
 * Calculate positions for grid layout
 */
function gridLayout(count: number, columns: number = 3, cardWidth: number = 400, cardHeight: number = 400, gap: number = 50): Array<{ x: number; y: number }> {
	const positions: Array<{ x: number; y: number }> = [];

	for (let i = 0; i < count; i++) {
		const row = Math.floor(i / columns);
		const col = i % columns;

		positions.push({
			x: col * (cardWidth + gap),
			y: row * (cardHeight + gap)
		});
	}

	return positions;
}

/**
 * Calculate positions for radial layout (center card with cards around it)
 */
function radialLayout(centerCount: number, orbitCount: number, radius: number = 600): Array<{ x: number; y: number }> {
	const positions: Array<{ x: number; y: number }> = [];

	// Center cards
	for (let i = 0; i < centerCount; i++) {
		positions.push({ x: i * 450, y: 0 });
	}

	// Orbit cards
	const angleStep = (2 * Math.PI) / orbitCount;
	for (let i = 0; i < orbitCount; i++) {
		const angle = i * angleStep - Math.PI / 2; // Start at top
		positions.push({
			x: Math.cos(angle) * radius + (centerCount > 1 ? 225 : 0),
			y: Math.sin(angle) * radius + 300
		});
	}

	return positions;
}

// ==================== Compound Generators ====================

/**
 * SETTLEMENT STORY: Landmark + Location Cluster
 * Creates a location with geographic and lore detail
 */
export async function generateSettlementStory(): Promise<CompoundGeneration> {
	const groupId = crypto.randomUUID();

	// 1. Generate World Builder Landmark
	const landmark = await getRandomWorldBuilderCard('landmark');

	// 2. Generate Lore Master Location card (for cluster center)
	const locationCard = await getRandomLoreMasterCard('location');

	// 3. Generate 4 secondary cards for the location cluster
	const secondaryTypes: Array<'faction' | 'figure' | 'event' | 'material'> = ['faction', 'figure', 'event', 'material'];
	const secondaryCards = await Promise.all(
		secondaryTypes.map(type => getRandomLoreMasterCard(type))
	);

	// Create node data
	const positions = horizontalLayout(2, 450, 100);

	const nodes: Partial<StoryBoardNode>[] = [
		// Landmark card
		{
			x: positions[0].x,
			y: positions[0].y,
			width: 400,
			height: 400,
			label: '',
			notes: 'Settlement Story: Geographic Location',
			groupId,
			layer: 0,
			worldBuilderCard: {
				type: landmark.type,
				cues: landmark.cues ? Array.from(landmark.cues) : undefined,
				cue: landmark.cue,
				activeCueIndex: 0,
				expansion: landmark.expansion
			}
		},
		// Location cluster
		{
			x: positions[1].x,
			y: positions[1].y,
			width: 500,
			height: 600,
			label: '',
			notes: 'Settlement Story: Lore Cluster',
			groupId,
			layer: 0,
			loreCluster: {
				primaryCard: {
					card: locationCard,
					activeCueIndex: 0
				},
				topCard: {
					card: secondaryCards[0],
					activeCueIndex: 0,
					position: 'top' as const
				},
				rightCard: {
					card: secondaryCards[1],
					activeCueIndex: 0,
					position: 'right' as const
				},
				bottomCard: {
					card: secondaryCards[2],
					activeCueIndex: 0,
					position: 'bottom' as const
				},
				leftCard: {
					card: secondaryCards[3],
					activeCueIndex: 0,
					position: 'left' as const
				}
			}
		}
	];

	const connections = [
		{
			fromIndex: 0,
			toIndex: 1,
			label: 'Lore details',
			color: 'rgb(14 165 233)',
			lineType: 'dashed' as const
		}
	];

	return {
		nodes,
		connections,
		layout: 'horizontal',
		groupId
	};
}

/**
 * FACTION TERRITORY: Microsetting + Faction Cluster
 * Creates a complete region with the faction that controls it
 */
export async function generateFactionTerritory(): Promise<CompoundGeneration> {
	const groupId = crypto.randomUUID();

	// 1. Generate microsetting (6 cards)
	const microsetting = await generateMicrosetting();
	const microsettingCards = [
		microsetting.region,
		...microsetting.landmarks,
		microsetting.namesake,
		microsetting.origin,
		microsetting.attribute,
		microsetting.advent
	];

	// 2. Generate Faction cluster
	const factionCard = await getRandomLoreMasterCard('faction');
	const secondaryTypes: Array<'figure' | 'event' | 'location' | 'material'> = ['figure', 'event', 'location', 'material'];
	const secondaryCards = await Promise.all(
		secondaryTypes.map(type => getRandomLoreMasterCard(type))
	);

	// Layout: Microsetting in horizontal row, faction cluster below center
	const positions = horizontalLayout(microsettingCards.length, 400, 20);
	const centerX = (positions[0].x + positions[positions.length - 1].x) / 2;

	const nodes: Partial<StoryBoardNode>[] = [
		// Microsetting cards (top row)
		...microsettingCards.map((card, i) => ({
			x: positions[i].x,
			y: 0,
			width: 400,
			height: 400,
			label: '',
			notes: `Faction Territory: Microsetting ${i + 1}/7`,
			groupId,
			layer: 0,
			worldBuilderCard: {
				type: card.type,
				cues: card.cues ? Array.from(card.cues) : undefined,
				cue: card.cue,
				interpretations: card.interpretations,
				activeCueIndex: 0,
				expansion: card.expansion
			}
		})),
		// Faction cluster (centered below)
		{
			x: centerX - 250,
			y: 500,
			width: 500,
			height: 600,
			label: '',
			notes: 'Faction Territory: Ruling Faction',
			groupId,
			layer: 0,
			loreCluster: {
				primaryCard: {
					card: factionCard,
					activeCueIndex: 0
				},
				topCard: {
					card: secondaryCards[0],
					activeCueIndex: 0,
					position: 'top' as const
				},
				rightCard: {
					card: secondaryCards[1],
					activeCueIndex: 0,
					position: 'right' as const
				},
				bottomCard: {
					card: secondaryCards[2],
					activeCueIndex: 0,
					position: 'bottom' as const
				},
				leftCard: {
					card: secondaryCards[3],
					activeCueIndex: 0,
					position: 'left' as const
				}
			}
		}
	];

	// Connections: Region to faction, origin to faction, attribute to faction
	const connections = [
		{
			fromIndex: 0, // Region
			toIndex: microsettingCards.length, // Faction cluster
			label: 'Controlled by',
			color: 'rgb(239 68 68)',
			lineType: 'solid' as const
		},
		{
			fromIndex: 4, // Origin
			toIndex: microsettingCards.length,
			label: 'Historical ties',
			color: 'rgb(14 165 233)',
			lineType: 'dashed' as const
		}
	];

	return {
		nodes,
		connections,
		layout: 'grid',
		groupId
	};
}

/**
 * DIVINE DOMAIN: Region + Deity + Temple + Worshippers
 * Creates a complete deity worship system
 */
export async function generateDivineDomain(): Promise<CompoundGeneration> {
	const groupId = crypto.randomUUID();

	// 1. Generate World Builder Region
	const region = await getRandomWorldBuilderCard('region');

	// 2. Generate World Builder Landmark (temple/shrine)
	const temple = await getRandomWorldBuilderCard('landmark');

	// 3. Generate Deity card
	const deityCard = await getRandomLoreMasterCard('deity');

	// 4. Generate Faction (worshippers)
	const factionCard = await getRandomLoreMasterCard('faction');
	const factionSecondary = await Promise.all([
		getRandomLoreMasterCard('figure'), // High priest
		getRandomLoreMasterCard('event'), // Holy festival
		getRandomLoreMasterCard('location'), // Sacred site
		getRandomLoreMasterCard('material') // Holy relic material
	]);

	// 5. Generate Location cluster (temple interior)
	const locationCard = await getRandomLoreMasterCard('location');
	const locationSecondary = await Promise.all([
		getRandomLoreMasterCard('object'), // Sacred artifact
		getRandomLoreMasterCard('creature'), // Guardian creature
		getRandomLoreMasterCard('event'), // Ritual
		getRandomLoreMasterCard('material') // Temple material
	]);

	// Radial layout: deity at center, other elements around
	const positions = radialLayout(1, 5, 600);

	const nodes: Partial<StoryBoardNode>[] = [
		// Center: Deity
		{
			x: positions[0].x,
			y: positions[0].y,
			width: 500,
			height: 400,
			label: '',
			notes: 'Divine Domain: Deity',
			groupId,
			layer: 1,
			loreCluster: {
				primaryCard: {
					card: deityCard,
					activeCueIndex: 0
				},
				topCard: null,
				rightCard: null,
				bottomCard: null,
				leftCard: null
			}
		},
		// Orbit 1: Region (divine territory)
		{
			x: positions[1].x,
			y: positions[1].y,
			width: 400,
			height: 400,
			label: '',
			notes: 'Divine Domain: Sacred Region',
			groupId,
			layer: 0,
			worldBuilderCard: {
				type: region.type,
				cues: region.cues ? Array.from(region.cues) : undefined,
				activeCueIndex: 0,
				expansion: region.expansion
			}
		},
		// Orbit 2: Temple (landmark)
		{
			x: positions[2].x,
			y: positions[2].y,
			width: 400,
			height: 400,
			label: '',
			notes: 'Divine Domain: Temple/Shrine',
			groupId,
			layer: 0,
			worldBuilderCard: {
				type: temple.type,
				cues: temple.cues ? Array.from(temple.cues) : undefined,
				activeCueIndex: 0,
				expansion: temple.expansion
			}
		},
		// Orbit 3: Worshippers (faction cluster)
		{
			x: positions[3].x,
			y: positions[3].y,
			width: 500,
			height: 600,
			label: '',
			notes: 'Divine Domain: Worshippers',
			groupId,
			layer: 0,
			loreCluster: {
				primaryCard: {
					card: factionCard,
					activeCueIndex: 0
				},
				topCard: {
					card: factionSecondary[0],
					activeCueIndex: 0,
					position: 'top' as const
				},
				rightCard: {
					card: factionSecondary[1],
					activeCueIndex: 0,
					position: 'right' as const
				},
				bottomCard: {
					card: factionSecondary[2],
					activeCueIndex: 0,
					position: 'bottom' as const
				},
				leftCard: {
					card: factionSecondary[3],
					activeCueIndex: 0,
					position: 'left' as const
				}
			}
		},
		// Orbit 4: Temple Interior (location cluster)
		{
			x: positions[4].x,
			y: positions[4].y,
			width: 500,
			height: 600,
			label: '',
			notes: 'Divine Domain: Temple Interior',
			groupId,
			layer: 0,
			loreCluster: {
				primaryCard: {
					card: locationCard,
					activeCueIndex: 0
				},
				topCard: {
					card: locationSecondary[0],
					activeCueIndex: 0,
					position: 'top' as const
				},
				rightCard: {
					card: locationSecondary[1],
					activeCueIndex: 0,
					position: 'right' as const
				},
				bottomCard: {
					card: locationSecondary[2],
					activeCueIndex: 0,
					position: 'bottom' as const
				},
				leftCard: {
					card: locationSecondary[3],
					activeCueIndex: 0,
					position: 'left' as const
				}
			}
		},
		// Orbit 5: Sacred Region attribute
		{
			x: positions[5].x,
			y: positions[5].y,
			width: 400,
			height: 400,
			label: '',
			notes: 'Divine Domain: Divine Attribute',
			groupId,
			layer: 0,
			worldBuilderCard: {
				type: 'attribute',
				cues: ['BLESSED BY DIVINE POWER', 'PILGRIMAGE DESTINATION', 'HOLY GROUND', 'SACRED RITUALS PERFORMED HERE'],
				activeCueIndex: 0
			}
		}
	];

	// Connections: All connect to deity
	const connections = [
		{ fromIndex: 0, toIndex: 1, label: 'Sacred land', color: 'rgb(251 191 36)', lineType: 'solid' as const },
		{ fromIndex: 0, toIndex: 2, label: 'House of worship', color: 'rgb(251 191 36)', lineType: 'solid' as const },
		{ fromIndex: 0, toIndex: 3, label: 'Followers', color: 'rgb(239 68 68)', lineType: 'solid' as const },
		{ fromIndex: 0, toIndex: 4, label: 'Inner sanctum', color: 'rgb(14 165 233)', lineType: 'dashed' as const },
		{ fromIndex: 1, toIndex: 5, label: 'Divine blessing', color: 'rgb(251 191 36)', lineType: 'dotted' as const }
	];

	return {
		nodes,
		connections,
		layout: 'radial',
		groupId
	};
}

/**
 * ADVENTURE SITE: All Three Decks Combined
 * Creates a complete adventure location with plot hooks
 */
export async function generateAdventureSite(): Promise<CompoundGeneration> {
	const groupId = crypto.randomUUID();

	// 1. Story Engine: Conflict + Aspect
	const conflictCard = await getRandomStoryEngineCard('conflict');
	const aspectCard = await getRandomStoryEngineCard('aspect');

	// 2. World Builder: Region + Landmark + Origin + Attribute
	const region = await getRandomWorldBuilderCard('region');
	const landmark = await getRandomWorldBuilderCard('landmark');
	const origin = await getRandomWorldBuilderCard('origin');
	const attribute = await getRandomWorldBuilderCard('attribute');

	// 3. Lore Master: Location cluster + Faction cluster
	const locationCard = await getRandomLoreMasterCard('location');
	const locationSecondary = await Promise.all([
		getRandomLoreMasterCard('object'),
		getRandomLoreMasterCard('creature'),
		getRandomLoreMasterCard('event'),
		getRandomLoreMasterCard('material')
	]);

	const factionCard = await getRandomLoreMasterCard('faction');
	const factionSecondary = await Promise.all([
		getRandomLoreMasterCard('figure'),
		getRandomLoreMasterCard('event'),
		getRandomLoreMasterCard('material'),
		getRandomLoreMasterCard('creature')
	]);

	// Grid layout: 4 columns x 3 rows
	const positions = gridLayout(12, 4, 400, 450, 50);

	const nodes: Partial<StoryBoardNode>[] = [
		// Row 1: Story Engine (Plot)
		{
			x: positions[0].x,
			y: positions[0].y,
			width: 350,
			height: 200,
			label: '',
			notes: 'Adventure Site: Conflict',
			groupId,
			layer: 0,
			storyEngineCard: {
				type: conflictCard.type,
				cues: Array.from(conflictCard.cues),
				activeCueIndex: 0,
				expansion: conflictCard.expansion
			}
		},
		{
			x: positions[1].x,
			y: positions[1].y,
			width: 350,
			height: 200,
			label: '',
			notes: 'Adventure Site: Aspect',
			groupId,
			layer: 0,
			storyEngineCard: {
				type: aspectCard.type,
				cues: Array.from(aspectCard.cues),
				activeCueIndex: 0,
				expansion: aspectCard.expansion
			}
		},
		// Row 2: World Builder (Geography)
		{
			x: positions[4].x,
			y: positions[4].y,
			width: 400,
			height: 400,
			label: '',
			notes: 'Adventure Site: Region',
			groupId,
			layer: 0,
			worldBuilderCard: {
				type: region.type,
				cues: region.cues ? Array.from(region.cues) : undefined,
				activeCueIndex: 0,
				expansion: region.expansion
			}
		},
		{
			x: positions[5].x,
			y: positions[5].y,
			width: 400,
			height: 400,
			label: '',
			notes: 'Adventure Site: Landmark',
			groupId,
			layer: 0,
			worldBuilderCard: {
				type: landmark.type,
				cues: landmark.cues ? Array.from(landmark.cues) : undefined,
				activeCueIndex: 0,
				expansion: landmark.expansion
			}
		},
		{
			x: positions[6].x,
			y: positions[6].y,
			width: 400,
			height: 400,
			label: '',
			notes: 'Adventure Site: Origin',
			groupId,
			layer: 0,
			worldBuilderCard: {
				type: origin.type,
				cues: origin.cues ? Array.from(origin.cues) : undefined,
				activeCueIndex: 0,
				expansion: origin.expansion
			}
		},
		{
			x: positions[7].x,
			y: positions[7].y,
			width: 400,
			height: 400,
			label: '',
			notes: 'Adventure Site: Attribute',
			groupId,
			layer: 0,
			worldBuilderCard: {
				type: attribute.type,
				cues: attribute.cues ? Array.from(attribute.cues) : undefined,
				activeCueIndex: 0,
				expansion: attribute.expansion
			}
		},
		// Row 3: Lore Master (People & Things)
		{
			x: positions[8].x,
			y: positions[8].y,
			width: 500,
			height: 600,
			label: '',
			notes: 'Adventure Site: Location Lore',
			groupId,
			layer: 0,
			loreCluster: {
				primaryCard: {
					card: locationCard,
					activeCueIndex: 0
				},
				topCard: {
					card: locationSecondary[0],
					activeCueIndex: 0,
					position: 'top' as const
				},
				rightCard: {
					card: locationSecondary[1],
					activeCueIndex: 0,
					position: 'right' as const
				},
				bottomCard: {
					card: locationSecondary[2],
					activeCueIndex: 0,
					position: 'bottom' as const
				},
				leftCard: {
					card: locationSecondary[3],
					activeCueIndex: 0,
					position: 'left' as const
				}
			}
		},
		{
			x: positions[9].x,
			y: positions[9].y,
			width: 500,
			height: 600,
			label: '',
			notes: 'Adventure Site: Faction',
			groupId,
			layer: 0,
			loreCluster: {
				primaryCard: {
					card: factionCard,
					activeCueIndex: 0
				},
				topCard: {
					card: factionSecondary[0],
					activeCueIndex: 0,
					position: 'top' as const
				},
				rightCard: {
					card: factionSecondary[1],
					activeCueIndex: 0,
					position: 'right' as const
				},
				bottomCard: {
					card: factionSecondary[2],
					activeCueIndex: 0,
					position: 'bottom' as const
				},
				leftCard: {
					card: factionSecondary[3],
					activeCueIndex: 0,
					position: 'left' as const
				}
			}
		}
	];

	// Connections: Create narrative flow
	const connections = [
		// Conflict → Location
		{ fromIndex: 0, toIndex: 6, label: 'Happens at', color: 'rgb(99 102 241)', lineType: 'solid' as const },
		// Aspect → Faction
		{ fromIndex: 1, toIndex: 7, label: 'Involves', color: 'rgb(139 92 246)', lineType: 'solid' as const },
		// Region → Landmark
		{ fromIndex: 2, toIndex: 3, label: 'Contains', color: 'rgb(34 197 94)', lineType: 'solid' as const },
		// Landmark → Location Lore
		{ fromIndex: 3, toIndex: 6, label: 'Details', color: 'rgb(14 165 233)', lineType: 'dashed' as const },
		// Origin → Faction
		{ fromIndex: 4, toIndex: 7, label: 'Historical tie', color: 'rgb(234 88 12)', lineType: 'dashed' as const }
	];

	return {
		nodes,
		connections,
		layout: 'grid',
		groupId
	};
}
