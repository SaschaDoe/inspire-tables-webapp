import type { Creator } from './base/creator';
import { CharacterCreator } from './character/characterCreator';
import { VillainCreator } from './character/villainCreator';
import { ArtefactCreator } from './artefact/artefactCreator';
import { DungeonCreator } from './dungeon/dungeonCreator';
import { MonsterCreator } from './monster/monsterCreator';
import { SceneCreator } from './scene/sceneCreator';
import { ClueCreator } from './clue/clueCreator';
import { AdventureCreator } from './adventure/adventureCreator';
import { RegionCreator } from './location/regionCreator';
import { BuildingCreator } from './location/buildingCreator';
import { SettlementCreator } from './location/settlementCreator';
import { HexTileCreator } from './location/hexTileCreator';
import { TalentCreator } from './talent/talentCreator';
import { TrapCreator } from './dungeon/trapCreator';
import { RoomCreator } from './dungeon/roomCreator';
import { StoryBeatCreator } from './adventure/storyBeatCreator';
import { FactionCreator } from './faction/factionCreator';
import { QuestCreator } from './quest/questCreator';
import { EventCreator } from './event/eventCreator';
import { RumorCreator } from './rumor/rumorCreator';
import { ProphecyCreator } from './prophecy/prophecyCreator';
import { IllnessCreator } from './illness/illnessCreator';
import { SpellCreator } from './spell/spellCreator';
import { GodCreator } from './god/godCreator';
import { RitualCreator } from './ritual/ritualCreator';
import { EntranceCreator } from './dungeon/entranceCreator';
import { TreasureCreator } from './dungeon/treasureCreator';
import { SignCreator } from './other/signCreator';
import { InitialMeetingCreator } from './adventure/initialMeetingCreator';
import { NationCreator } from './location/nationCreator';
import { ContinentCreator } from './location/continentCreator';
import { OrganizationCreator } from './faction/organizationCreator';
import { VehicleCreator } from './vehicle/vehicleCreator';
import { WeatherEventCreator } from './event/weatherEventCreator';
import { MagicSystemCreator } from './magic/magicSystemCreator';
import { UniverseCreator } from './celestial/universeCreator';
import { SphereCreator } from './celestial/sphereCreator';
import { SphereConnectionCreator } from './celestial/sphereConnectionCreator';
import { GalaxyCreator } from './celestial/galaxyCreator';
import { SolarSystemCreator } from './celestial/solarSystemCreator';
import { PlanetCreator } from './celestial/planetCreator';
import { StarCreator } from './celestial/starCreator';
import { CampaignCreator } from '../creators/campaignCreator';

export interface EntityTypeInfo {
	name: string;
	displayName: string;
	icon: string;
	description: string;
	creator: () => Creator<any>;
	category?: string;
}

export const entityRegistry: Record<string, EntityTypeInfo> = {
	// === META ===
	campaign: {
		name: 'campaign',
		displayName: 'Campaign',
		icon: '🎲',
		description: 'Generate a complete campaign with themes and structure',
		creator: () => new CampaignCreator(),
		category: 'Meta'
	},
	adventure: {
		name: 'adventure',
		displayName: 'Adventure',
		icon: '📖',
		description: 'Generate a complete adventure with story structure and plot',
		creator: () => new AdventureCreator(),
		category: 'Meta'
	},

	// === COSMIC/CELESTIAL HIERARCHY ===
	universe: {
		name: 'universe',
		displayName: 'Universe',
		icon: '🌐',
		description: 'Generate an entire universe with dimensional structure and fundamental laws',
		creator: () => new UniverseCreator(),
		category: 'Cosmic'
	},
	sphere: {
		name: 'sphere',
		displayName: 'Sphere',
		icon: '🌌',
		description: 'Generate a cosmic sphere with galaxies, rules, and creation method',
		creator: () => new SphereCreator(),
		category: 'Cosmic'
	},
	sphereConnection: {
		name: 'sphereConnection',
		displayName: 'Sphere Connection',
		icon: '🔗',
		description:
			'Generate a connection between spheres with travel methods, rules, and journey conditions',
		creator: () => new SphereConnectionCreator(),
		category: 'Cosmic'
	},
	galaxy: {
		name: 'galaxy',
		displayName: 'Galaxy',
		icon: '🌀',
		description: 'Generate a galaxy with solar systems and size',
		creator: () => new GalaxyCreator(),
		category: 'Cosmic'
	},
	solarSystem: {
		name: 'solarSystem',
		displayName: 'Solar System',
		icon: '☀️',
		description: 'Generate a solar system with stars and planets',
		creator: () => new SolarSystemCreator(),
		category: 'Cosmic'
	},
	star: {
		name: 'star',
		displayName: 'Star',
		icon: '⭐',
		description: 'Generate a star with temperature, size, mass, and color',
		creator: () => new StarCreator(),
		category: 'Cosmic'
	},
	planet: {
		name: 'planet',
		displayName: 'Planet',
		icon: '🌍',
		description: 'Generate a planet with type, livability, and continents',
		creator: () => new PlanetCreator(),
		category: 'Cosmic'
	},

	// === LOCATIONS ===
	continent: {
		name: 'continent',
		displayName: 'Continent',
		icon: '🌍',
		description: 'Generate a continent with size, climate, and dominant landscape',
		creator: () => new ContinentCreator(),
		category: 'Locations'
	},
	nation: {
		name: 'nation',
		displayName: 'Nation',
		icon: '🏴',
		description: 'Generate a nation with government, technology level, and resources',
		creator: () => new NationCreator(),
		category: 'Locations'
	},
	region: {
		name: 'region',
		displayName: 'Region',
		icon: '🗺️',
		description: 'Generate a region with landscape, weather, and resources',
		creator: () => new RegionCreator(),
		category: 'Locations'
	},
	settlement: {
		name: 'settlement',
		displayName: 'Settlement',
		icon: '🏘️',
		description: 'Generate a town or city with size, fame, and events',
		creator: () => new SettlementCreator(),
		category: 'Locations'
	},
	building: {
		name: 'building',
		displayName: 'Building',
		icon: '🏛️',
		description: 'Generate a building with type, quality, and characteristics',
		creator: () => new BuildingCreator(),
		category: 'Locations'
	},
	dungeon: {
		name: 'dungeon',
		displayName: 'Dungeon',
		icon: '🏰',
		description: 'Generate a complete dungeon with rooms and features',
		creator: () => new DungeonCreator(),
		category: 'Locations'
	},
	room: {
		name: 'room',
		displayName: 'Room',
		icon: '🚪',
		description: 'Generate a dungeon room with furnishings, obstacles, and treasures',
		creator: () => new RoomCreator(),
		category: 'Locations'
	},
	entrance: {
		name: 'entrance',
		displayName: 'Entrance',
		icon: '🚪',
		description: 'Generate a dungeon entrance with type, condition, and potential traps',
		creator: () => new EntranceCreator(),
		category: 'Locations'
	},
	hexTile: {
		name: 'hexTile',
		displayName: 'Hex Tile',
		icon: '⬡',
		description: 'Generate a hex map tile with terrain and features',
		creator: () => new HexTileCreator(),
		category: 'Locations'
	},

	// === STORY STRUCTURE ===
	quest: {
		name: 'quest',
		displayName: 'Quest',
		icon: '📜',
		description: 'Generate a quest with objective, reward, and difficulty',
		creator: () => new QuestCreator(),
		category: 'Meta'
	},
	scene: {
		name: 'scene',
		displayName: 'Scene',
		icon: '🎬',
		description: 'Generate a scene with location, mood, and sensory details',
		creator: () => new SceneCreator(),
		category: 'Meta'
	},
	storyBeat: {
		name: 'storyBeat',
		displayName: 'Story Beat',
		icon: '📝',
		description: 'Generate a narrative story beat for your adventure',
		creator: () => new StoryBeatCreator(),
		category: 'Meta'
	},
	initialMeeting: {
		name: 'initialMeeting',
		displayName: 'Initial Meeting',
		icon: '🤝',
		description: 'Generate how characters first meet with type, location, and tone',
		creator: () => new InitialMeetingCreator(),
		category: 'Meta'
	},

	// === CHARACTERS ===
	character: {
		name: 'character',
		displayName: 'Character',
		icon: '🧙',
		description: 'Generate a random character with attributes, profession, and personality',
		creator: () => new CharacterCreator(),
		category: 'Characters'
	},
	villain: {
		name: 'villain',
		displayName: 'Villain',
		icon: '😈',
		description: 'Generate an evil villain with schemes and shadow archetype',
		creator: () => new VillainCreator(),
		category: 'Characters'
	},
	monster: {
		name: 'monster',
		displayName: 'Monster',
		icon: '👹',
		description: 'Generate a fearsome monster or creature for encounters',
		creator: () => new MonsterCreator(),
		category: 'Characters'
	},

	// === ORGANIZATIONS ===
	faction: {
		name: 'faction',
		displayName: 'Faction',
		icon: '⚔️',
		description: 'Generate a faction with alignment, size, and motivation',
		creator: () => new FactionCreator(),
		category: 'Characters'
	},
	organization: {
		name: 'organization',
		displayName: 'Organization',
		icon: '🏢',
		description: 'Generate an organization with type, influence, and reputation',
		creator: () => new OrganizationCreator(),
		category: 'Characters'
	},

	// === ARTEFACTS ===
	artefact: {
		name: 'artefact',
		displayName: 'Artefact',
		icon: '⚔️',
		description: 'Generate a random magical or mundane artefact',
		creator: () => new ArtefactCreator(),
		category: 'Artefacts'
	},
	treasure: {
		name: 'treasure',
		displayName: 'Treasure',
		icon: '💰',
		description: 'Generate treasure with contents, quantity, and hiding method',
		creator: () => new TreasureCreator(),
		category: 'Artefacts'
	},
	vehicle: {
		name: 'vehicle',
		displayName: 'Vehicle',
		icon: '🚗',
		description: 'Generate a vehicle with type, propulsion, and special features',
		creator: () => new VehicleCreator(),
		category: 'Artefacts'
	},
	sign: {
		name: 'sign',
		displayName: 'Sign',
		icon: '🛡️',
		description: 'Generate a heraldic sign with symbol, colors, and meaning',
		creator: () => new SignCreator(),
		category: 'Artefacts'
	},

	// === OTHERS (MAGIC, RELIGION, EVENTS, ETC.) ===
	magicSystem: {
		name: 'magicSystem',
		displayName: 'Magic System',
		icon: '🔮',
		description: 'Generate a complete magic system with rules, costs, sources, and spells',
		creator: () => new MagicSystemCreator(),
		category: 'Others'
	},
	spell: {
		name: 'spell',
		displayName: 'Spell',
		icon: '✨',
		description: 'Generate a magical spell with abilities, requirements, and lore',
		creator: () => new SpellCreator(),
		category: 'Others'
	},
	ritual: {
		name: 'ritual',
		displayName: 'Ritual',
		icon: '🕯️',
		description: 'Generate a sacred ritual with preparations, invocations, and magical effects',
		creator: () => new RitualCreator(),
		category: 'Others'
	},
	talent: {
		name: 'talent',
		displayName: 'Talent',
		icon: '✨',
		description: 'Generate a magical or profane talent/ability',
		creator: () => new TalentCreator(),
		category: 'Others'
	},
	god: {
		name: 'god',
		displayName: 'God',
		icon: '⚡',
		description: 'Generate a deity with domains, sacred symbols, and divine status',
		creator: () => new GodCreator(),
		category: 'Others'
	},
	trap: {
		name: 'trap',
		displayName: 'Trap',
		icon: '🪤',
		description: 'Generate a dungeon trap with trigger and function',
		creator: () => new TrapCreator(),
		category: 'Others'
	},
	event: {
		name: 'event',
		displayName: 'Event',
		icon: '🎭',
		description: 'Generate a historical or world event with consequences',
		creator: () => new EventCreator(),
		category: 'Others'
	},
	weatherEvent: {
		name: 'weatherEvent',
		displayName: 'Weather Event',
		icon: '🌪️',
		description: 'Generate a weather event with type, severity, and effects',
		creator: () => new WeatherEventCreator(),
		category: 'Others'
	},
	rumor: {
		name: 'rumor',
		displayName: 'Rumor',
		icon: '💬',
		description: 'Generate a rumor with varying levels of truth',
		creator: () => new RumorCreator(),
		category: 'Others'
	},
	prophecy: {
		name: 'prophecy',
		displayName: 'Prophecy',
		icon: '🔮',
		description: 'Generate a prophecy with interpretation and timeframe',
		creator: () => new ProphecyCreator(),
		category: 'Others'
	},
	clue: {
		name: 'clue',
		displayName: 'Clue',
		icon: '🔍',
		description: 'Generate a clue with source, evidence type, and conclusion',
		creator: () => new ClueCreator(),
		category: 'Others'
	},
	illness: {
		name: 'illness',
		displayName: 'Illness',
		icon: '🦠',
		description: 'Generate a disease with symptoms, transmission, and cure',
		creator: () => new IllnessCreator(),
		category: 'Others'
	}
};

export function getEntityTypesList(): EntityTypeInfo[] {
	return Object.values(entityRegistry);
}

export function getEntityCreator(entityType: string): Creator<any> | null {
	const info = entityRegistry[entityType];
	return info ? info.creator() : null;
}
