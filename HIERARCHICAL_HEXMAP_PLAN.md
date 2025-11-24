# Hierarchical Hex Map System with Civilization Simulation - Implementation Plan

## Overview

Transform the current flat hex tile system into a **two-level hierarchical system** with full **Sid Meier's Civilization 5-style simulation** at the regional level. This enables:

- **Level 1 (Planetary)**: Continental view showing major geographic features (oceans, continents, mountain ranges)
- **Level 2 (Regional/Simulation)**: Detailed hex map where nations compete, expand, trade, and wage war over thousands of years of simulated history

**Key Innovation**: Each planetary hex can be "zoomed into" revealing a detailed 50x50 regional hex map with full civilization simulation, complete with nations, cities, armies, diplomacy, tech trees, culture, and thousands of years of trackable historical events.

## Unciv Integration ⭐ NEW

**Reference Implementation**: [Unciv](https://github.com/yairm210/Unciv) - Open-source Civilization V clone (GPL v3)
- **Location**: Cloned to `C:\proj\games\Unciv`
- **Analysis**: See `UNCIV_ANALYSIS.md` for detailed comparison

### Key Learnings from Unciv

1. **Data-Driven Architecture** - JSON files define game rules, code interprets
2. **"Uniques" System** - Flexible string-based bonus system (e.g., `"[+2 Science] from [Jungle] tiles"`)
3. **Manager Classes** - Separation of concerns (CityPopulationManager, TechManager, etc.)
4. **Resource Stockpiling** - Strategic resources are quantified and consumed
5. **Tile Work Assignment** - Citizens assigned to specific tiles for yields
6. **Complete Game Data** - 100+ buildings, 80+ units, 75+ techs available as reference

### Available Unciv Assets (GPL v3, with attribution)

- **JSON Game Data**: Buildings, Units, Techs, Policies, Resources, Terrains
- **Icon Sprite Sheets**: UI icons, nation flags, policy icons, unit promotions
- **Complete Tech Tree**: Structure and prerequisites
- **Social Policy Trees**: Tradition, Liberty, Honor, Piety, etc.

### Integration Strategy

**Phase 1.5** (NEW): Enhance Phase 1 entities with Unciv patterns:
- Add "uniques" system for flexible bonuses
- Implement manager classes for separation of concerns
- Add resource stockpiling and consumption
- Improve tile work assignment system
- Reference Unciv's JSON data for buildings/units/techs

## Core Concepts

### Two Distinct Hex Tile Types

Instead of a single HexTile entity with zoom levels, we have **two completely separate entity types**:

1. **PlanetaryHexTile** - Large-scale continental hexes (1 hex ≈ 500-1000km)
2. **RegionalHexTile** - Detailed simulation hexes (1 hex ≈ 10-50km)

This separation provides cleaner code, better performance, and distinct purposes.

### Civilization Simulation

The **Regional Map** (Level 2) runs a full Civilization 5-inspired simulation including:
- **Nations** with culture properties, tech trees, and social policies
- **Cities** that grow, produce units/buildings, and generate resources
- **Units** (armies/fleets) that move, explore, and fight battles
- **Diplomacy** with peace, war, alliances, and trade agreements
- **Historical Events** tracking every decision, battle, city founding, etc.
- **Time Progression** from prehistoric settlement through ancient, classical, medieval, renaissance, and beyond

---

## Current System Analysis

### What We Have

1. **HexTile Entity** (`src/lib/entities/location/hexTile.ts`)
   - Extends Entity (has ID, type, metadata)
   - Grid coordinates (x, y)
   - Terrain properties: terrainType, elevation, temperature, dryness
   - Collections: dungeons[], settlements[], hazards[]
   - **Issue**: Used for both planetary and regional purposes without distinction

2. **Continent Entity** (`src/lib/entities/location/continent.ts`)
   - Contains array of HexTile objects
   - Properties: size, climate, dominantLandscape
   - **Issue**: Hex tiles stored as array, not as entities in store

3. **Nation Entity** (`src/lib/entities/location/nation.ts`)
   - Basic properties: government, population, technologyLevel
   - **Issue**: No spatial integration, no simulation mechanics, no historical tracking

4. **Region Entity** (`src/lib/entities/location/region.ts`)
   - Basic properties: landscape, weather, resources[]
   - **Issue**: No hex map, no simulation

5. **Settlement Entity** (`src/lib/entities/location/settlement.ts`)
   - Properties: size, population, fame
   - **Issue**: Not integrated with simulation, no production/growth mechanics

### What's Missing

1. **Hierarchical Structure** - No planetary → regional zoom system
2. **Simulation Engine** - No nation AI, combat, diplomacy, or tech progression
3. **Historical Event Tracking** - No system to record and replay history
4. **Resource & Production System** - No buildings, resource gathering, or unit production
5. **Diplomacy System** - No relationships, treaties, or trade routes
6. **Tech Tree & Culture** - No technology progression or cultural properties
7. **Combat System** - No armies, battles, or tactical warfare
8. **Time System** - No turn-based progression or historical timeline
9. **Cross-Boundary Logic** - No way for nations in adjacent planetary hexes to interact

---

## Proposed Entity Structure

### Level 1: Planetary Entities

#### PlanetaryHexTile
```typescript
export class PlanetaryHexTile extends Entity {
	type = EntityType.PlanetaryHexTile;

	// Grid position on planet
	x: number = 0;
	y: number = 0;

	// Terrain properties (continental scale)
	terrainType: TerrainType; // Ocean, Plains, Mountains, Desert, etc.
	elevation: number = 0; // 0-10 scale
	temperature: number = 50; // 0-100 (affects regional climate)
	climate: string = ''; // Tropical, Temperate, Arctic, etc.

	// References
	parentPlanetId: string; // Planet this hex belongs to
	continentId?: number; // Which continent (if land)

	// Regional map reference
	hasRegionalMap: boolean = false;
	regionalMapId?: string; // ID of RegionalMap entity

	// Visual/UI
	isExplored: boolean = true; // Planetary view always visible
}
```

#### RegionalMap
```typescript
export class RegionalMap extends Entity {
	type = EntityType.RegionalMap;

	// Grid properties
	width: number = 50; // 50x50 grid for detail
	height: number = 50;
	scale: number = 10; // km per hex (adjustable)

	// Parent reference
	parentPlanetaryHexId: string; // Which planetary hex this zooms into

	// Climate inherited from parent
	baseClimate: string; // From parent planetary hex
	baseTemperature: number; // From parent
	baseElevation: number; // Biases regional terrain

	// Simulation state
	currentYear: number = 0; // -10000 (prehistoric) to present
	simulationStartYear: number = -10000;
	lastSimulatedYear: number = 0;

	// Child entities (stored as entity IDs)
	regionalHexTileIds: string[] = []; // All hex tiles in this map
	nationIds: string[] = []; // Nations that exist/existed in this map
	cityIds: string[] = []; // All cities ever founded
	unitIds: string[] = []; // All active units
	historicalEventIds: string[] = []; // All events that occurred here

	// Simulation configuration
	simulationConfig: {
		startingNationCount: number; // 1-20 nations
		startingRaces: string[]; // Elf, Dwarf, Human, Orc, etc.
		fantasyMode: boolean; // Include gods, beasts, magic
		autoSimulateYears: number; // How many years to auto-simulate
	};

	// Generation metadata
	seed: number = 0;
	generatedAt: Date = new Date();
}
```

### Level 2: Regional Simulation Entities

#### RegionalHexTile
```typescript
export class RegionalHexTile extends Entity {
	type = EntityType.RegionalHexTile;

	// Grid position in regional map
	x: number = 0;
	y: number = 0;

	// Terrain (more granular than planetary)
	terrainType: TerrainType; // Plains, Forest, Hills, Mountains, Ocean, Coast, River, etc.
	elevation: number = 0; // 0-10

	// Features
	feature: string = ''; // River, Forest, Jungle, Oasis, etc.
	hasRiver: boolean = false;
	riverDirection?: 'N' | 'NE' | 'SE' | 'S' | 'SW' | 'NW'; // For river flow

	// Resources (Civ 5 style)
	strategicResource?: string; // Iron, Horses, Oil, Uranium, etc.
	luxuryResource?: string; // Gold, Gems, Spices, Wine, etc.
	bonusResource?: string; // Wheat, Cattle, Fish, etc.

	// Ownership (changes over time)
	ownerNationId?: string; // Current owner (null if unclaimed)
	ownerCityId?: string; // Worked by which city
	culturalInfluence: Map<string, number> = new Map(); // NationId → influence points

	// Improvements (built by nations)
	improvement?: string; // Farm, Mine, Lumber Mill, Trading Post, Fort, etc.
	improvementBuiltYear?: number;

	// Combat
	fortificationLevel: number = 0; // 0-100 (affects defense)
	battleSiteIds: string[] = []; // Historical battles fought here

	// Exploration
	discoveredByNations: Map<string, number> = new Map(); // NationId → year discovered
	fogOfWar: Map<string, boolean> = new Map(); // NationId → is visible

	// References
	parentRegionalMapId: string;

	// Historical state
	ownershipHistory: {
		nationId: string;
		fromYear: number;
		toYear: number;
	}[] = []; // Track territorial changes
}
```

#### Nation (Enhanced with Simulation)
```typescript
export class Nation extends Entity {
	type = EntityType.Nation;

	name: string = '';
	adjective: string = ''; // "Roman" for "Rome"
	description: string = '';

	// Race & Starting Info
	race: string = ''; // Human, Elf, Dwarf, Orc, etc.
	foundingYear: number = 0;
	founderLeaderName: string = '';

	// Current State
	isAlive: boolean = true;
	defeatedYear?: number;
	defeatedBy?: string; // Nation ID that conquered them

	// Territory
	capitalCityId?: string;
	cityIds: string[] = []; // All cities owned
	territoryHexIds: string[] = []; // All hexes controlled
	parentRegionalMapId: string;

	// Resources (Civ 5 style)
	resources: {
		food: number; // Total food production
		production: number; // Total hammers/production
		gold: number; // Gold per turn
		science: number; // Science per turn
		culture: number; // Culture per turn
		faith?: number; // If religion enabled
	} = { food: 0, production: 0, gold: 0, science: 0, culture: 0 };

	goldTreasury: number = 0; // Accumulated gold

	// Culture Properties (0-100 scale, affects behavior)
	cultureTraits: {
		militaristic: number; // Bonuses to combat, faster military production
		expansionist: number; // Faster settler production, explores more
		commercial: number; // Trade bonuses, more gold from routes
		scientific: number; // Faster research, science bonuses
		seafaring: number; // Naval bonuses, ocean movement unlocked earlier
		diplomatic: number; // Better diplomatic relations
	} = {
		militaristic: 50,
		expansionist: 50,
		commercial: 50,
		scientific: 50,
		seafaring: 50,
		diplomatic: 50
	};

	// Preferred Terrain (bonus to settling/growth)
	preferredTerrain: TerrainType; // e.g., Dwarves prefer Mountains

	// Technology (Civ 5 style tech tree)
	discoveredTechs: string[] = []; // Tech IDs (e.g., "agriculture", "bronzeWorking", "sailing")
	currentResearch?: string; // Tech currently being researched
	researchProgress: number = 0; // Progress toward current tech

	// Social Policies (Civ 5 style)
	unlockedPolicies: string[] = []; // Policy IDs
	culturePoints: number = 0; // Accumulated culture for policies

	// Diplomacy
	diplomacyStates: Map<string, DiplomacyState> = new Map(); // NationId → state

	// Trade Routes
	tradeRouteIds: string[] = []; // Active trade routes

	// Military
	unitIds: string[] = []; // All units (armies, fleets, settlers, workers, etc.)
	militaryStrength: number = 0; // Calculated from units

	// Historical Events
	historicalEventIds: string[] = []; // Events involving this nation

	// Leaders over time
	leaders: {
		name: string;
		reignStartYear: number;
		reignEndYear?: number;
		traits: string[]; // "Warmonger", "Builder", "Explorer"
	}[] = [];

	// Government
	governmentType: string = 'Chiefdom'; // Chiefdom → Monarchy → Republic → Democracy, etc.
	governmentChangedYear: number = 0;
}

interface DiplomacyState {
	relationshipLevel: number; // -100 (war) to +100 (allied)
	status: 'war' | 'peace' | 'allied' | 'trade_agreement' | 'non_aggression_pact';
	statusSince: number; // Year
	treaties: string[]; // Treaty IDs
	opinionModifiers: {
		reason: string; // "Shared border", "Declared war on ally", "Trade partner"
		value: number; // -50 to +50
	}[];
}
```

#### City (Full Civ 5-style)
```typescript
export class City extends Entity {
	type = EntityType.City;

	name: string = '';

	// Ownership
	ownerNationId: string;
	parentRegionalMapId: string;

	// Location
	hexTileId: string; // Hex where city is located
	x: number = 0; // Convenience copy of hex coords
	y: number = 0;

	// Founding
	foundedYear: number = 0;
	founderNationId: string; // Original founder (might differ from current owner)

	// Population & Growth
	population: number = 1; // Population in thousands
	foodStored: number = 0;
	foodNeededForGrowth: number = 10; // Increases with pop

	// Territory (worked hexes)
	workedHexIds: string[] = []; // Hexes worked by citizens
	ownedHexIds: string[] = []; // Hexes in city's cultural borders

	// Production
	currentProduction?: string; // Building/Unit being produced
	productionProgress: number = 0;
	productionQueue: string[] = []; // Queue of things to build

	// Buildings
	buildings: string[] = []; // Building IDs (e.g., "granary", "library", "barracks")

	// Resources (per turn)
	yields: {
		food: number;
		production: number;
		gold: number;
		science: number;
		culture: number;
	} = { food: 0, production: 0, gold: 0, science: 0, culture: 0 };

	// Combat
	combatStrength: number = 0; // City defense (from walls, garrison)
	isBeingBesieged: boolean = false;
	besiegingUnitIds: string[] = [];

	// Happiness
	happinessLevel: number = 0; // -10 to +10, affects growth/production

	// Status
	isCapital: boolean = false;
	isDestroyed: boolean = false;
	destroyedYear?: number;

	// Historical events
	conquestedHistory: {
		year: number;
		previousOwner: string;
		conqueror: string;
	}[] = [];
}
```

#### Unit (Armies, Fleets, Settlers, Workers)
```typescript
export class Unit extends Entity {
	type = EntityType.Unit;

	unitType: string = ''; // "Warrior", "Settler", "Galley", "Worker", "Archer", etc.
	unitCategory: 'military' | 'naval' | 'civilian' = 'military';

	// Ownership
	ownerNationId: string;
	parentRegionalMapId: string;

	// Location
	currentHexId: string;
	x: number = 0;
	y: number = 0;

	// Stats
	combatStrength: number = 0; // For military units
	movementPoints: number = 2; // Moves per turn
	movementPointsRemaining: number = 2;

	// Experience & Promotions
	experiencePoints: number = 0;
	promotions: string[] = []; // "Shock", "Drill", "Formation", etc.

	// State
	isEmbark: boolean = false; // On ocean as land unit
	health: number = 100; // 0-100

	// Orders
	currentOrder?: 'move' | 'fortify' | 'build_improvement' | 'explore' | 'attack';
	targetHexId?: string;

	// Historical
	createdYear: number = 0;
	createdCityId?: string;
	battlesParticipated: string[] = []; // Battle event IDs
	destroyedYear?: number;
	destroyedByUnitId?: string;
}
```

#### HistoricalEvent (Track Everything)
```typescript
export class HistoricalEvent extends Entity {
	type = EntityType.HistoricalEvent;

	eventType: string; // See event types below
	year: number; // When it occurred

	// Location
	parentRegionalMapId: string;
	hexTileId?: string; // Where it happened (if applicable)

	// Participants
	primaryNationId?: string;
	secondaryNationId?: string;
	involvedNationIds: string[] = [];
	involvedCityIds: string[] = [];
	involvedUnitIds: string[] = [];

	// Event-specific data (flexible)
	eventData: Record<string, any> = {};

	// Narrative
	title: string = ''; // "Rome declares war on Carthage"
	description: string = ''; // Longer description

	// Impact
	significance: number = 1; // 1-10, affects filtering in UI

	// Categorization
	tags: string[] = []; // "war", "discovery", "founding", etc.
}

// Event Types:
// - nation_founded
// - nation_destroyed
// - city_founded
// - city_captured
// - city_destroyed
// - war_declared
// - peace_signed
// - alliance_formed
// - trade_agreement_signed
// - tech_discovered
// - unit_created
// - unit_destroyed
// - battle_fought
// - improvement_built
// - building_constructed
// - leader_changed
// - government_changed
// - culture_shift
// - border_expanded
// - settler_movement
// - army_movement
// - exploration_discovered
// - resource_discovered
// - trade_route_established
// - diplomatic_incident
// - golden_age_started
// - social_policy_adopted
```

#### Battle (Detailed Battle Events)
```typescript
export class Battle extends Entity {
	type = EntityType.Battle;

	name: string = ''; // "Battle of Thermopylae"
	year: number;

	// Location
	hexTileId: string;
	parentRegionalMapId: string;

	// Combatants
	attackerNationId: string;
	defenderNationId: string;

	attackerUnitIds: string[];
	defenderUnitIds: string[];

	// Outcome
	outcome: 'attacker_victory' | 'defender_victory' | 'stalemate';
	casualties: {
		attackerLosses: number;
		defenderLosses: number;
	};

	// Consequences
	territoryChanged: boolean;
	cityCapture?: string; // City ID if captured

	// Famous deaths
	famousDeaths: {
		unitId: string;
		unitName: string;
		leaderName?: string;
	}[] = [];

	// Significance
	isMajorBattle: boolean = false; // Historical importance

	// Description
	description: string = '';
}
```

#### TradeRoute
```typescript
export class TradeRoute extends Entity {
	type = EntityType.TradeRoute;

	// Participants
	originCityId: string;
	destinationCityId: string;
	ownerNationId: string;
	partnerNationId: string;

	// Route
	hexPath: string[] = []; // Hex IDs the route travels through
	routeType: 'land' | 'sea' | 'river' = 'land';

	// Yields
	goldPerTurn: number = 0;
	sciencePerTurn: number = 0;

	// State
	establishedYear: number;
	isActive: boolean = true;
	endedYear?: number;

	parentRegionalMapId: string;
}
```

---

## Simulation Systems

### Time System

**Scale**: 1 turn = 1 year

**Eras**:
- **Prehistoric** (-10,000 to -3000): Tribal settlement, no cities, hunter-gatherers
- **Ancient** (-3000 to 500): First cities, agriculture, bronze working, writing
- **Classical** (500 to 1000): Iron age, philosophy, mathematics, early empires
- **Medieval** (1000 to 1500): Feudalism, castles, compass, guilds
- **Renaissance** (1500 to 1800): Gunpowder, astronomy, printing press, exploration
- **Industrial** (1800 to 1950): Steam power, electricity, railroads
- **Modern** (1950+): Computers, nuclear power, space flight

**User Control**:
- When creating regional map, user specifies:
  - Starting year (default: -10000)
  - Number of starting nations (1-20)
  - Number of years to simulate initially (100, 500, 1000, 5000, etc.)
- Can extend simulation later: "Simulate 500 more years"
- Can step forward 1 year at a time
- Can rewind/replay any point in history

**Simulation Flow**:
1. Generate terrain
2. Place starting nations (tribal settlements)
3. Simulate prehistoric era (settlement spread)
4. Progress through eras with increasing complexity
5. Store all events as HistoricalEvent entities

### Resource & Production System

**City Yields** (per turn):
- **Food**: From farms, fish, bonus resources → population growth
- **Production**: From mines, forests, production resources → build units/buildings
- **Gold**: From trade routes, markets, luxury resources → treasury, unit maintenance
- **Science**: From libraries, universities, specialists → tech research
- **Culture**: From monuments, theaters, great works → social policies, border expansion

**Buildings** (Civ 5 style):
- Granary (+2 food)
- Library (+1 science per 2 population)
- Monument (+2 culture)
- Barracks (units gain +15 XP)
- Walls (+5 city defense)
- Market (+25% gold)
- Workshop (+2 production)
- Harbor (+1 food from water tiles, +1 gold from sea resources)
- University (+50% science)
- Theater (+2 culture, +1 great artist point)

**Resource Types**:
1. **Bonus**: Wheat, Cattle, Deer, Fish (+food/production)
2. **Strategic**: Iron, Horses, Coal, Oil, Uranium (required for certain units)
3. **Luxury**: Gold, Gems, Spices, Wine, Silk (+happiness, tradeable)

### Technology System (Civ 5-style Tech Tree)

**Tech Tree Structure**:
```
Ancient Era:
├─ Agriculture (unlock farms, granary)
├─ Animal Husbandry (pastures, horses resource)
├─ Archery (archer units)
├─ Mining (mines, +1 production from hills)
├─ Pottery (shrine, +1 culture)
├─ Sailing (work boats, coastal trade)
├─ Calendar (plantations for luxury resources)
├─ Writing (library, +1 science)
└─ Bronze Working (unlock warrior units, chop forests)

Classical Era:
├─ Mathematics (courthouse, +1 science from jungle)
├─ Philosophy (temple, +1 culture)
├─ Currency (market, +25% gold)
├─ Iron Working (swordsmen, remove jungle)
├─ Engineering (roads, aqueduct)
└─ Optics (lighthouse, +1 food from coast)

Medieval Era:
├─ Feudalism (longswordsman, +1 food from farms)
├─ Guilds (guild hall, +1 production from forests)
├─ Compass (harbor, +1 gold from sea resources)
├─ Theology (cathedral, +1 faith)
├─ Steel (better swords, cannons)
└─ Education (university, +50% science)

Renaissance Era:
├─ Astronomy (observatory, +1 science, OCEAN CROSSING UNLOCKED)
├─ Navigation (frigate, +1 movement for naval units)
├─ Gunpowder (musketman, +2 range combat)
├─ Printing Press (+1 culture from buildings)
└─ Economics (stock exchange, +25% gold from trade)

Industrial Era:
├─ Steam Power (ironclad ships, +1 production from mines)
├─ Electricity (factory, +4 production)
├─ Railroad (+2 movement on roads)
└─ Biology (+1 food from farms)

Modern Era:
├─ Flight (biplanes, +2 range)
├─ Radio (+1 culture from broadcast towers)
├─ Atomic Theory (nuclear weapons)
└─ Computers (+1 science from research labs)
```

**Tech Requirements**:
- Each tech has prerequisites (must research first)
- Science per turn determines research speed
- Some techs unlock resources, units, buildings, or game mechanics

**Ocean Crossing**:
- **Before Astronomy**: Deep ocean tiles are impassable (instant death for embarked units)
- **After Astronomy**: Ocean movement allowed, naval exploration possible
- **After Navigation**: Faster ocean movement, better naval units

### Social Policies (Civ 5 style)

**Policy Trees**:
1. **Tradition** (growth, culture)
   - Aristocracy: +15% production for wonders
   - Oligarchy: -50% maintenance for garrisons
   - Landed Elite: +10% growth in capital
   - Monarchy: +1 gold and -1 unhappiness per 2 citizens in capital

2. **Liberty** (expansion, production)
   - Republic: +1 production in every city
   - Citizenship: Worker improvements built 25% faster
   - Collective Rule: Free settler when adopted
   - Meritocracy: +1 happiness for each city connected to capital

3. **Honor** (military, combat)
   - Warrior Code: +20% combat bonus vs barbarians
   - Discipline: +15% melee unit strength when adjacent to another
   - Military Tradition: Units gain +50% XP from combat
   - Military Caste: +1 happiness and +2 culture from garrison

4. **Piety** (religion, culture)
   - Organized Religion: +1 happiness per 2 monuments
   - Mandate of Heaven: 50% less unhappiness from population
   - Theocracy: Temples provide +25% gold
   - Free Religion: +1 culture per 4 cities

5. **Patronage** (diplomacy, city-states)
   - Not fully implemented initially (city-states complex)

6. **Commerce** (gold, trade)
   - Naval Tradition: +1 happiness from harbors
   - Trade Unions: Maintenance on roads reduced by 50%
   - Merchant Navy: +2 gold from harbors
   - Mercantilism: Purchase units with gold for -25%

7. **Rationalism** (science)
   - Humanism: +1 happiness per university
   - Secularism: +2 science from specialists
   - Free Thought: +1 science from trading posts
   - Sovereignty: +1 gold from science buildings

**Unlocking Policies**:
- Accumulate culture points
- Each policy costs increasing amounts of culture
- Culture from monuments, theaters, great works, policies, wonders

### Culture Properties & Nation Behavior

**Culture Traits** (0-100 scale):
- **Militaristic**: Higher = more likely to declare war, build armies, research military techs
- **Expansionist**: Higher = build more settlers, explore aggressively, claim territory faster
- **Commercial**: Higher = focus on gold, build markets/harbors, establish trade routes
- **Scientific**: Higher = prioritize science buildings, research faster
- **Seafaring**: Higher = build more naval units, settle coasts, explore oceans early
- **Diplomatic**: Higher = form alliances, avoid wars, trade actively

**Trait Effects**:
- Militaristic Nation: +20% production for military units, +10% combat strength
- Expansionist Nation: Settlers cost -33% production, +1 movement for settlers
- Commercial Nation: +1 gold from trade routes, +25% gold from markets
- Scientific Nation: +10% science, libraries cost -25% production
- Seafaring Nation: Naval units +1 movement, harbors cost -33%
- Diplomatic Nation: +10 to all diplomatic relations, trade routes give +1 gold

**Culture Evolution**:
- Traits drift over time based on events
- Won a major war → +5 Militaristic
- Founded many cities → +5 Expansionist
- Established many trade routes → +5 Commercial
- Discovered 5 techs in a row → +5 Scientific
- User can view culture trait history graph

**Terrain Bonuses**:
Each nation has a preferred terrain (based on race/culture):
- **Dwarves**: Mountains (+2 production in mountain cities, +1 happiness from hills)
- **Elves**: Forests (+1 culture from forests, +1 food from forest tiles)
- **Humans**: Plains (+1 food from plains, +1 production from farms)
- **Orcs**: Hills (+1 production from hills, units move faster through rough terrain)
- **Island Nations**: Coast (+1 food from coast, +1 gold from fish)

### Diplomacy System

**Relationship Levels** (-100 to +100):
- **-100 to -50**: Hostile (at war or near war)
- **-49 to -10**: Unfriendly (tense, no cooperation)
- **-9 to +9**: Neutral (coexist peacefully)
- **+10 to +49**: Friendly (trade, cooperation)
- **+50 to +100**: Allied (defensive pacts, mutual aid)

**Diplomatic States**:
1. **War**: Combat allowed, no trade, -50 relations with other nations
2. **Peace**: Default state, can trade, can sign treaties
3. **Allied**: Defensive pact, shared visibility, mutual military aid
4. **Trade Agreement**: +2 gold per turn each, +10 relations
5. **Non-Aggression Pact**: Cannot declare war for 20 years, +5 relations

**Opinion Modifiers**:
- **Positive**:
  - Trade partner: +5 per active trade route
  - Common enemy: +10 if both at war with same nation
  - Gift sent: +10 for 20 years
  - Similar culture: +5 if culture traits align
  - Long peace: +1 per 10 years of peace

- **Negative**:
  - Shared border: -5 (border tension)
  - Covets our lands: -10 if high expansionist
  - Denounced us: -20
  - Declared war: -50 for 50 years
  - Captured our cities: -30 per city
  - Broke promise: -20

**Diplomacy Actions**:
- Declare War
- Offer Peace
- Propose Alliance
- Propose Trade Agreement
- Request Military Aid
- Denounce Nation
- Send Gift (gold)
- Demand Tribute

**AI Diplomacy Decisions**:
Based on:
- Culture traits (militaristic → more likely to declare war)
- Relationship level
- Military strength comparison
- Strategic resources needed
- Trade route profitability
- Border proximity

### Combat System

**Unit Types**:
1. **Ancient**: Warrior, Archer, Spearman, Chariot
2. **Classical**: Swordsman, Horseman, Catapult
3. **Medieval**: Longswordsman, Knight, Crossbowman, Trebuchet
4. **Renaissance**: Musketman, Cavalry, Cannon
5. **Industrial**: Rifleman, Artillery, Ironclad
6. **Modern**: Infantry, Tank, Bomber, Battleship

**Naval Units**:
1. **Ancient**: Trireme (coastal only)
2. **Classical**: Galley
3. **Medieval**: Caravel
4. **Renaissance**: Frigate (with Navigation tech)
5. **Industrial**: Ironclad
6. **Modern**: Battleship, Submarine

**Civilian Units**:
- **Settler**: Founds new cities
- **Worker**: Builds improvements (farms, mines, roads)
- **Great Person**: Great Scientist, Great Artist, Great General

**Combat Mechanics**:
1. **Strength**: Each unit has combat strength (10-100+)
2. **Ranged**: Some units can attack from 2 hexes away
3. **Terrain**: Hills/forests give +25% defense, crossing river -20% attack
4. **Flanking**: +10% per adjacent friendly unit
5. **Fortification**: +50% defense if fortified for 1+ turn
6. **Experience**: Units gain XP from combat, unlock promotions
7. **Damage**: Units can be damaged (0-100 health), heal when fortified

**Battle Resolution**:
```typescript
function resolveBattle(attacker: Unit, defender: Unit, hex: RegionalHexTile): Battle {
	// Calculate modifiers
	const attackerStrength = calculateCombatStrength(attacker, hex, true);
	const defenderStrength = calculateCombatStrength(defender, hex, false);

	// Random factor (0.8 to 1.2)
	const randomFactor = 0.8 + Math.random() * 0.4;

	// Determine damage
	const damageToDefender = (attackerStrength / defenderStrength) * 30 * randomFactor;
	const damageToAttacker = (defenderStrength / attackerStrength) * 20 * randomFactor;

	// Apply damage
	defender.health -= damageToDefender;
	attacker.health -= damageToAttacker;

	// Award XP
	attacker.experiencePoints += 5;

	// Create battle event
	const battle = new Battle();
	battle.name = `Battle at (${hex.x}, ${hex.y})`;
	battle.year = currentYear;
	// ... fill in details

	// Check for unit death
	if (defender.health <= 0) {
		battle.outcome = 'attacker_victory';
		// Possibly find remnants later (bones, artifacts)
	}

	return battle;
}
```

**Siege Warfare**:
- Cities have combat strength (from walls, garrison)
- Melee units must reduce city health to 0, then can capture
- Ranged units can bombard cities from distance
- Siege units (catapults, cannons) deal extra damage to cities

**Naval Combat**:
- Naval units fight in ocean/coast hexes
- Cannot attack land units (except coastal bombardment)
- Critical for island nations and ocean exploration

### Settlement & Expansion

**City Founding**:
1. Nation builds Settler unit
2. Settler moves to good location (AI evaluates terrain, resources, strategic value)
3. Settler founds city, becomes population 1
4. City expands cultural borders over time
5. Create `city_founded` HistoricalEvent

**Settling Preferences**:
- Near fresh water (river, lake): +5 priority
- Coastal: +3 priority (seafaring nations: +10)
- Luxury resource nearby: +8 priority
- Strategic resource nearby: +5 priority
- On preferred terrain: +10 priority
- Away from other cities: +3 per tile distance (avoid crowding)

**City Growth**:
- Each turn, city accumulates food
- When foodStored >= foodNeededForGrowth, population increases
- Larger populations need more food (foodNeeded = population * 2)
- Happiness affects growth speed
- Growth Events: Create `city_growth` event when pop milestone reached

**Automatic Expansion** (AI):
```typescript
function aiDecideProduction(city: City, nation: Nation): string {
	// Priority system based on nation culture and needs
	const priorities = {
		settler: 0,
		military: 0,
		building: 0
	};

	// Expansionist → more settlers
	priorities.settler = nation.cultureTraits.expansionist / 10;

	// Militaristic → more units
	priorities.military = nation.cultureTraits.militaristic / 10;

	// Scientific → more buildings (libraries, universities)
	priorities.building = nation.cultureTraits.scientific / 10;

	// Threat assessment
	if (nation.diplomacyStates.some(d => d.status === 'war')) {
		priorities.military += 50; // Prioritize defense
	}

	// Low city count → build settlers
	if (nation.cityIds.length < 5) {
		priorities.settler += 30;
	}

	// Choose highest priority
	const choice = getHighestPriority(priorities);

	if (choice === 'settler') {
		return 'settler';
	} else if (choice === 'military') {
		return nation.hasTech('ironWorking') ? 'swordsman' : 'warrior';
	} else {
		return city.buildings.includes('library') ? 'market' : 'library';
	}
}
```

### Movement & Exploration

**Movement Costs** (movement points per hex):
- **Plains, Grassland**: 1 point
- **Forest, Jungle**: 2 points (1 with road)
- **Hills**: 2 points (1 with road)
- **Mountains**: Impassable (until late techs)
- **Desert**: 1 point
- **Ocean**: 1 point (naval units only)
- **Deep Ocean**: Impassable until Astronomy tech
- **River Crossing**: +1 point (unless road on both sides)
- **Road**: Reduces cost to 0.5 (fast travel)

**Embarking** (land units on water):
- Costs 1 movement point to embark/disembark
- Embarked units are vulnerable (-50% combat strength)
- Cannot embark into deep ocean until Astronomy

**Exploration**:
- Fog of War: Initially, all hexes are "unknown"
- Units reveal hexes within 2-tile radius
- Coastal cities reveal coast
- Mountain tops reveal far (line of sight)
- AI sends scouts to explore (high priority for expansionist nations)

**Event Tracking**:
- Create `exploration_discovered` event when new terrain type found
- Create `resource_discovered` event when strategic resource revealed
- Store in nation's exploration history

### Rivers & Geographic Features

**River Generation**:
- Rivers flow from high elevation to ocean
- Follow downhill path (elevation-based pathfinding)
- Rivers provide +1 food to adjacent farms
- Rivers act as natural borders (defensive bonus)
- Rivers enable early trade routes (before ocean sailing)

**River Hexes**:
- Hex has `hasRiver: true` and `riverDirection` (flow direction)
- Trade routes along rivers: +1 gold, faster travel
- Bridge building (requires Engineering tech)

**Mountain Ranges**:
- Connected high-elevation hexes
- Provide strategic defense (block invasion routes)
- Difficult to cross (higher movement cost)
- Can contain strategic resources (iron, gold)

**Regional Features** (generated during map creation):
- Major Rivers (e.g., "The Silvermoon River")
- Mountain Ranges (e.g., "The Ironpeak Mountains")
- Large Forests (e.g., "The Darkwood Forest")
- Deserts (e.g., "The Scorching Wastes")

Store as entities:
```typescript
export class GeographicFeature extends Entity {
	type = EntityType.GeographicFeature;

	featureType: 'river' | 'mountain_range' | 'forest' | 'desert' | 'lake';
	name: string = '';
	hexTileIds: string[] = []; // Hexes that make up this feature
	parentRegionalMapId: string;

	// For rivers
	sourceHexId?: string; // Where river starts
	mouthHexId?: string; // Where river ends (ocean/lake)

	description: string = '';
}
```

### Fantasy Mode

**When `fantasyMode: true`**:
- **Gods**: Can influence events (bless cities, curse enemies)
- **Mythical Creatures**: Dragons, Giants, Sea Monsters occupy hexes
- **Magic**: Nations can discover magical techs (Sorcery, Necromancy)
- **Legendary Heroes**: Great Generals can become immortal heroes
- **Divine Intervention Events**: "The God of War blessed Rome with +10% combat strength for 50 years"

**Prehistoric Fantasy Settlement**:
- Different races start in preferred terrain
- Elves start in forests
- Dwarves start in mountains
- Orcs start in hills
- Humans start in plains
- Dragons claim volcanic regions (cannot be settled)

---

## Historical Event Tracking System

### Event Storage Strategy

**Goal**: Store every decision, movement, and outcome so that history can be fully replayed.

**Approach**: Event Sourcing
- All state changes are events
- Current state = replay all events from beginning
- Efficient: Store events in chronological order
- Snapshot: Save full state every 100 years for faster seeking

**Event Categories**:
1. **Nation Events**: Founding, destruction, culture shift, government change
2. **City Events**: Founded, growth, production, captured, destroyed
3. **Unit Events**: Created, moved, fortified, upgraded, destroyed
4. **Combat Events**: Battles, sieges, victories, defeats
5. **Diplomacy Events**: War, peace, alliances, treaties, trade
6. **Tech Events**: Researched, enabled new units/buildings
7. **Policy Events**: Social policy adopted
8. **Exploration Events**: New land discovered, resource found
9. **Economic Events**: Trade route established, gold trade
10. **Improvement Events**: Farm built, mine constructed
11. **Leader Events**: New leader, leader death

**Event Schema** (examples):
```typescript
// City Founded Event
{
	type: 'city_founded',
	year: 450,
	eventData: {
		cityId: 'city-123',
		cityName: 'Athens',
		nationId: 'nation-greece',
		hexId: 'hex-25-30',
		foundedByUnitId: 'unit-settler-5'
	},
	title: 'Athens founded by Greece',
	description: 'The city of Athens was founded at (25, 30) on the coast.',
	significance: 7
}

// War Declared Event
{
	type: 'war_declared',
	year: 500,
	eventData: {
		aggressorNationId: 'nation-rome',
		targetNationId: 'nation-carthage',
		reason: 'territorial_dispute',
		sharedBorderHexIds: ['hex-30-40', 'hex-31-40']
	},
	title: 'Rome declares war on Carthage',
	description: 'Due to border tensions, Rome has declared war on Carthage.',
	significance: 9
}

// Battle Event
{
	type: 'battle_fought',
	year: 502,
	eventData: {
		battleId: 'battle-501',
		hexId: 'hex-32-41',
		attackerNationId: 'nation-rome',
		defenderNationId: 'nation-carthage',
		attackerUnitIds: ['unit-123', 'unit-124'],
		defenderUnitIds: ['unit-200'],
		outcome: 'attacker_victory',
		casualties: { attacker: 1, defender: 1 },
		famousDeaths: [
			{ unitId: 'unit-200', unitName: 'Carthaginian Spearman', leaderName: 'General Hanno' }
		]
	},
	title: 'Battle at (32, 41): Rome victorious',
	description: 'Roman forces defeated Carthaginian defenders. General Hanno was slain.',
	significance: 6
}

// Tech Discovered
{
	type: 'tech_discovered',
	year: 520,
	eventData: {
		nationId: 'nation-greece',
		techId: 'astronomy',
		enabledBy: ['mathematics', 'optics'],
		unlocks: ['ocean_crossing', 'observatory']
	},
	title: 'Greece discovers Astronomy',
	description: 'Greek scholars have unlocked the secrets of the stars, enabling ocean voyages.',
	significance: 8
}
```

### Event Queries

**Common Queries**:
1. "Get all events in year 500"
2. "Get all events for Nation X"
3. "Get all events in hex (25, 30)"
4. "Get all battles"
5. "Get all city foundings"

**Efficient Indexing**:
```typescript
// In RegionalMap entity
eventsByYear: Map<number, string[]> = new Map(); // Year → Event IDs
eventsByNation: Map<string, string[]> = new Map(); // NationId → Event IDs
eventsByHex: Map<string, string[]> = new Map(); // HexId → Event IDs
eventsByType: Map<string, string[]> = new Map(); // EventType → Event IDs
```

**Timeline Reconstruction**:
```typescript
function getStateAtYear(year: number): RegionalMapState {
	// Load snapshot closest to year (e.g., year 400 snapshot)
	const snapshot = loadSnapshot(Math.floor(year / 100) * 100);

	// Replay events from snapshot to target year
	const events = getEventsBetween(snapshot.year, year);

	let state = snapshot;
	for (const event of events) {
		state = applyEvent(state, event);
	}

	return state;
}
```

---

## Cross-Boundary Nation Interactions

### Adjacent Regional Maps

**Problem**: Nation A is in RegionalMap1 (planetary hex 45, 27). Nation B is in RegionalMap2 (planetary hex 46, 27). They share a border.

**Solution**: Border Detection System

**Implementation**:
```typescript
// When generating regional maps, detect if planetary hexes are adjacent
function detectAdjacentRegionalMaps(planet: Planet): AdjacentMapPair[] {
	const regionalMaps = planet.regionalMaps;
	const pairs: AdjacentMapPair[] = [];

	for (const map1 of regionalMaps) {
		const hex1 = map1.parentPlanetaryHex;

		// Check all neighbors of hex1
		const neighbors = getNeighborHexes(hex1);

		for (const neighbor of neighbors) {
			const map2 = regionalMaps.find(m => m.parentPlanetaryHexId === neighbor.id);

			if (map2) {
				pairs.push({
					map1Id: map1.id,
					map2Id: map2.id,
					direction: getDirection(hex1, neighbor), // 'N', 'NE', 'SE', 'S', 'SW', 'NW'
					borderHexes1: getEdgeHexes(map1, direction),
					borderHexes2: getEdgeHexes(map2, oppositeDirection(direction))
				});
			}
		}
	}

	return pairs;
}

interface AdjacentMapPair {
	map1Id: string;
	map2Id: string;
	direction: string; // Direction from map1 to map2
	borderHexes1: string[]; // Hex IDs on map1's edge
	borderHexes2: string[]; // Hex IDs on map2's edge
}
```

**Border Hexes**:
- Edge hexes are "border hexes" that can interact with other maps
- Unit movement across border: teleport to corresponding hex in adjacent map
- Trade routes can cross borders
- Wars can span multiple regional maps

**Diplomacy Across Borders**:
- Nations in different regional maps can:
  - Discover each other (through exploration)
  - Trade (if route exists)
  - Declare war
  - Form alliances
  - Share diplomatic state

**Nation Registry** (planet-wide):
```typescript
// On Planet entity
allNationIds: string[] = []; // All nations across all regional maps
nationDiplomacy: Map<string, Map<string, DiplomacyState>> = new Map();
```

**Example**: Rome (in Map1) and Carthage (in Map2) at war
- Rome's units can cross border into Map2
- Battle events occur in Map2
- Both nations' event logs record the war
- Player can view conflict across both maps

---

## User Interface Design

### Time Slider & Historical Playback

**Time Slider Component**:
```svelte
<div class="timeline-slider">
	<div class="slider-controls">
		<button onclick={rewindToStart}>⏮</button>
		<button onclick={stepBackward}>◄</button>
		<button onclick={togglePlay}>{isPlaying ? '⏸' : '▶'}</button>
		<button onclick={stepForward}>►</button>
		<button onclick={fastForward}>⏭</button>
	</div>

	<input
		type="range"
		min={simulationStartYear}
		max={currentYear}
		bind:value={viewYear}
		oninput={handleYearChange}
		class="year-slider"
	/>

	<div class="year-display">
		<span>Year: {viewYear}</span>
		<span>Era: {getEra(viewYear)}</span>
	</div>

	<div class="playback-speed">
		Speed:
		<button onclick={() => playbackSpeed = 1}>1x</button>
		<button onclick={() => playbackSpeed = 5}>5x</button>
		<button onclick={() => playbackSpeed = 10}>10x</button>
		<button onclick={() => playbackSpeed = 50}>50x</button>
	</div>
</div>
```

**Playback Animation**:
```typescript
let isPlaying = $state(false);
let viewYear = $state(currentYear);
let playbackSpeed = $state(1); // years per second

$effect(() => {
	if (isPlaying) {
		const interval = setInterval(() => {
			viewYear += playbackSpeed;

			if (viewYear >= currentYear) {
				viewYear = currentYear;
				isPlaying = false;
			}

			updateMapVisualization(viewYear);
		}, 1000);

		return () => clearInterval(interval);
	}
});
```

**Map Visualization at Year X**:
```svelte
{#each regionalmapState.nations as nation}
	<!-- Show nation's territory at viewYear -->
	{#each nation.hexTileIdsAtYear(viewYear) as hexId}
		<polygon
			points={getHexPoints(hexId)}
			fill={nation.color}
			fill-opacity={0.5}
			stroke={nation.color}
		/>
	{/each}

	<!-- Show cities existing at viewYear -->
	{#each nation.citiesAtYear(viewYear) as city}
		<circle
			cx={city.x}
			cy={city.y}
			r={5 + city.population / 10}
			fill={nation.color}
		/>
	{/each}
{/each}
```

### Event Timeline View

**List View** (scrollable):
```svelte
<div class="event-timeline-list">
	<div class="filters">
		<select bind:value={filterNationId}>
			<option value="">All Nations</option>
			{#each nations as nation}
				<option value={nation.id}>{nation.name}</option>
			{/each}
		</select>

		<select bind:value={filterEventType}>
			<option value="">All Event Types</option>
			<option value="city_founded">City Founded</option>
			<option value="war_declared">War</option>
			<option value="battle_fought">Battle</option>
			<option value="tech_discovered">Technology</option>
			<!-- etc. -->
		</select>

		<input type="range" bind:value={significanceFilter} min="1" max="10" />
		<span>Min Significance: {significanceFilter}</span>
	</div>

	<div class="events-list">
		{#each filteredEvents as event}
			<div class="event-item" onclick={() => jumpToEvent(event)}>
				<div class="event-year">{event.year}</div>
				<div class="event-icon">{getEventIcon(event.eventType)}</div>
				<div class="event-content">
					<h4>{event.title}</h4>
					<p>{event.description}</p>
				</div>
				<div class="event-significance">
					{'⭐'.repeat(event.significance)}
				</div>
			</div>
		{/each}
	</div>
</div>
```

**Map View** (events pinned to hexes):
```svelte
<div class="event-map-view">
	<!-- Regional hex map -->
	<svg class="hex-map">
		<!-- Terrain hexes -->
		{#each hexTiles as hex}
			<polygon points={getHexPoints(hex)} fill={terrainColor(hex)} />
		{/each}

		<!-- Event markers -->
		{#each eventsAtYear(viewYear) as event}
			{#if event.hexTileId}
				<g class="event-marker" onclick={() => showEventDetails(event)}>
					<circle
						cx={hexCenter(event.hexTileId).x}
						cy={hexCenter(event.hexTileId).y}
						r="8"
						fill={eventColor(event.eventType)}
					/>
					<text>{getEventIcon(event.eventType)}</text>
				</g>
			{/if}
		{/each}
	</svg>

	<!-- Event details panel (when clicked) -->
	{#if selectedEvent}
		<div class="event-details-panel">
			<h3>{selectedEvent.title}</h3>
			<p>Year: {selectedEvent.year}</p>
			<p>{selectedEvent.description}</p>

			{#if selectedEvent.eventType === 'battle_fought'}
				<div class="battle-details">
					<h4>Battle Report</h4>
					<p>Attacker: {getNation(selectedEvent.eventData.attackerNationId).name}</p>
					<p>Defender: {getNation(selectedEvent.eventData.defenderNationId).name}</p>
					<p>Outcome: {selectedEvent.eventData.outcome}</p>
					<p>Casualties: {selectedEvent.eventData.casualties.attacker} vs {selectedEvent.eventData.casualties.defender}</p>

					{#if selectedEvent.eventData.famousDeaths.length > 0}
						<h5>Famous Deaths:</h5>
						<ul>
							{#each selectedEvent.eventData.famousDeaths as death}
								<li>{death.leaderName} ({death.unitName})</li>
							{/each}
						</ul>
					{/if}

					<button onclick={() => jumpToHex(selectedEvent.hexTileId)}>View Battle Site</button>
				</div>
			{/if}
		</div>
	{/if}
</div>
```

### Nation Overview Panel

**Diplomacy Matrix**:
```svelte
<div class="diplomacy-overview">
	<h3>International Relations (Year {viewYear})</h3>

	<table class="diplomacy-matrix">
		<thead>
			<tr>
				<th></th>
				{#each nations as nation}
					<th>{nation.name}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each nations as nation1}
				<tr>
					<td class="nation-name">{nation1.name}</td>
					{#each nations as nation2}
						<td class="relation-cell" style="background-color: {relationColor(nation1, nation2, viewYear)}">
							{#if nation1.id === nation2.id}
								—
							{:else}
								{getRelationSymbol(nation1, nation2, viewYear)}
							{/if}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>

	<div class="legend">
		<span><span class="war-symbol">⚔️</span> War</span>
		<span><span class="alliance-symbol">🤝</span> Allied</span>
		<span><span class="trade-symbol">💰</span> Trade</span>
		<span><span class="peace-symbol">☮️</span> Peace</span>
	</div>
</div>

<style>
	.relation-cell {
		text-align: center;
		font-size: 1.2rem;
		cursor: pointer;
	}

	/* Color coding */
	/* War: red, Allied: green, Friendly: light green, Neutral: gray, Hostile: orange */
</style>
```

### Nation Details Panel

```svelte
<div class="nation-panel">
	<h2>{nation.name} ({nation.adjective})</h2>

	<div class="nation-stats">
		<div class="stat">
			<label>Race:</label>
			<span>{nation.race}</span>
		</div>
		<div class="stat">
			<label>Founded:</label>
			<span>{nation.foundingYear}</span>
		</div>
		<div class="stat">
			<label>Government:</label>
			<span>{nation.governmentType}</span>
		</div>
		<div class="stat">
			<label>Cities:</label>
			<span>{nation.cityIds.length}</span>
		</div>
		<div class="stat">
			<label>Territory:</label>
			<span>{nation.territoryHexIds.length} hexes</span>
		</div>
	</div>

	<!-- Culture Traits -->
	<h3>Culture Traits</h3>
	<div class="culture-traits">
		{#each Object.entries(nation.cultureTraits) as [trait, value]}
			<div class="trait-bar">
				<label>{capitalize(trait)}:</label>
				<div class="bar">
					<div class="bar-fill" style="width: {value}%; background-color: {traitColor(trait)}"></div>
				</div>
				<span>{value}</span>
			</div>
		{/each}
	</div>

	<!-- Tech Tree -->
	<h3>Technologies</h3>
	<div class="tech-tree">
		{#each techTree as era}
			<div class="tech-era">
				<h4>{era.name}</h4>
				{#each era.techs as tech}
					<div class="tech-node" class:unlocked={nation.discoveredTechs.includes(tech.id)}>
						{tech.name}
					</div>
				{/each}
			</div>
		{/each}
	</div>

	<!-- Social Policies -->
	<h3>Social Policies</h3>
	<div class="policies">
		{#each policyTrees as tree}
			<div class="policy-tree">
				<h4>{tree.name}</h4>
				{#each tree.policies as policy}
					<div class="policy-node" class:unlocked={nation.unlockedPolicies.includes(policy.id)}>
						{policy.name}
					</div>
				{/each}
			</div>
		{/each}
	</div>

	<!-- Territory Timeline Graph -->
	<h3>Territory Growth</h3>
	<LineChart
		data={getTerritoryOverTime(nation)}
		xLabel="Year"
		yLabel="Hexes Controlled"
	/>

	<!-- Historical Events -->
	<h3>Historical Events</h3>
	<EventTimeline events={nation.historicalEventIds.map(id => getEvent(id))} />
</div>
```

### Regional Hex Map Viewer (Enhanced)

```svelte
<script lang="ts">
	import type { RegionalMap } from '$lib/entities/location/regionalMap';
	import Section from '../shared/Section.svelte';

	let { regionalMap }: { regionalMap: RegionalMap } = $props();

	let viewYear = $state(regionalMap.currentYear);
	let selectedNationId = $state<string | null>(null);
	let showBorders = $state(true);
	let showCities = $state(true);
	let showUnits = $state(false);
	let showEvents = $state(true);

	// Get map state at viewYear
	const mapState = $derived(getMapStateAtYear(regionalMap, viewYear));
</script>

<div class="regional-map-viewer">
	<!-- Time Controls -->
	<TimeSlider bind:viewYear regionalMap={regionalMap} />

	<!-- Map Controls -->
	<div class="map-controls">
		<label>
			<input type="checkbox" bind:checked={showBorders} />
			Show Nation Borders
		</label>
		<label>
			<input type="checkbox" bind:checked={showCities} />
			Show Cities
		</label>
		<label>
			<input type="checkbox" bind:checked={showUnits} />
			Show Units
		</label>
		<label>
			<input type="checkbox" bind:checked={showEvents} />
			Show Events
		</label>
	</div>

	<!-- Hex Map -->
	<svg class="regional-hex-map">
		<!-- Terrain layer -->
		<g class="terrain-layer">
			{#each mapState.hexTiles as hex}
				<polygon
					points={getHexPoints(hex)}
					fill={TERRAIN_COLORS[hex.terrainType]}
					stroke="#334155"
				/>
			{/each}
		</g>

		<!-- Nation borders layer -->
		{#if showBorders}
			<g class="border-layer">
				{#each mapState.nations as nation}
					{#each nation.borderHexes as hexId}
						<polygon
							points={getHexPoints(getHex(hexId))}
							fill={nation.color}
							fill-opacity="0.3"
							stroke={nation.color}
							stroke-width="2"
						/>
					{/each}
				{/each}
			</g>
		{/if}

		<!-- Cities layer -->
		{#if showCities}
			<g class="cities-layer">
				{#each mapState.cities as city}
					<g class="city-marker" onclick={() => selectCity(city)}>
						<circle
							cx={cityPixelX(city)}
							cy={cityPixelY(city)}
							r={5 + city.population / 5}
							fill={getNation(city.ownerNationId).color}
							stroke="white"
							stroke-width="2"
						/>
						<text x={cityPixelX(city)} y={cityPixelY(city) - 15}>{city.name}</text>
					</g>
				{/each}
			</g>
		{/if}

		<!-- Units layer -->
		{#if showUnits}
			<g class="units-layer">
				{#each mapState.units as unit}
					<g class="unit-marker">
						<!-- Unit icon based on type -->
						<text x={unitPixelX(unit)} y={unitPixelY(unit)}>{getUnitIcon(unit.unitType)}</text>
					</g>
				{/each}
			</g>
		{/if}

		<!-- Events layer -->
		{#if showEvents}
			<g class="events-layer">
				{#each mapState.eventsThisYear as event}
					{#if event.hexTileId}
						<circle
							cx={hexPixelX(event.hexTileId)}
							cy={hexPixelY(event.hexTileId)}
							r="10"
							fill={eventTypeColor(event.eventType)}
							onclick={() => showEventDetails(event)}
						/>
					{/if}
				{/each}
			</g>
		{/if}
	</svg>

	<!-- Side Panel -->
	<div class="side-panel">
		<NationList nations={mapState.nations} bind:selectedNationId />

		{#if selectedNationId}
			<NationDetailsPanel nation={getNation(selectedNationId)} viewYear={viewYear} />
		{/if}

		<EventTimeline events={mapState.eventsThisYear} />
	</div>
</div>
```

---

## Implementation Phases

### Phase 1: Entity Structure & Data Model (Foundation)
**Goal**: Establish two-tier hex tile system and core simulation entities

**Tasks**:
1. Create `PlanetaryHexTile` entity (separate from `HexTile`)
2. Create `RegionalHexTile` entity
3. Create `RegionalMap` entity
4. Update `Nation` entity with simulation properties
5. Create `City` entity with production/growth
6. Create `Unit` entity
7. Create `HistoricalEvent` entity
8. Create `Battle` entity
9. Create `TradeRoute` entity
10. Update `EntityType` enum with all new types
11. Store planetary hex tiles as entities in entityStore
12. Add viewer registry entries for new types

**Files to Create**:
- `src/lib/entities/location/planetaryHexTile.ts`
- `src/lib/entities/location/regionalHexTile.ts`
- `src/lib/entities/location/regionalMap.ts`
- `src/lib/entities/simulation/city.ts`
- `src/lib/entities/simulation/unit.ts`
- `src/lib/entities/simulation/historicalEvent.ts`
- `src/lib/entities/simulation/battle.ts`
- `src/lib/entities/simulation/tradeRoute.ts`

**Files to Modify**:
- `src/lib/entities/location/nation.ts`
- `src/lib/types/entity.ts`
- `src/lib/entities/location/worldMapCreator.ts`
- `src/lib/components/entities/viewerRegistry.ts`

**Deliverable**: All entity types exist, can be created and stored

**Status**: ✅ **COMPLETE** - All core entities created (8 files changed, 2,592 lines added)

---

### Phase 1.5: Unciv Integration & Entity Enhancement ⭐ NEW
**Goal**: Enhance Phase 1 entities with patterns learned from Unciv

**Tasks**:
1. **Add "Uniques" System** to entities
   - Add `uniques: string[]` property to Building, Unit, Policy entities
   - Create UniqueParser utility to interpret unique strings
   - Examples: `"[+2 Science] from [Jungle] tiles [in this city]"`

2. **Implement Manager Classes** (Unciv pattern)
   - Create `CityPopulationManager` (growth, food, starvation)
   - Create `CityProductionManager` (production queue, building)
   - Create `CityExpansionManager` (border growth, tile claiming)
   - Create `TechManager` (research progress, tech tree navigation)
   - Create `PolicyManager` (culture accumulation, policy unlocking)
   - Create `DiplomacyManager` (per-nation relationships)

3. **Add Resource Stockpiling**
   - Change `strategicResources` to stockpile: `Map<string, number>`
   - Change `luxuryResources` to stockpile: `Map<string, number>`
   - Implement resource consumption when building units
   - Track resource sources (tiles, trade routes)

4. **Improve Tile Work Assignment**
   - Add `workedTileIds: string[]` to City
   - Add `lockedTileIds: string[]` to City (manual assignment)
   - Add `isWorked: boolean` to RegionalHexTile
   - Implement citizen assignment algorithm
   - Add manual vs automatic work mode

5. **Add Great People Framework**
   - Create GreatPerson entity type
   - Add Great Person Points tracking to City
   - Add `greatPersonPoints: Map<string, number>` to City
   - Great Scientist, Engineer, Merchant, Artist, General

6. **Create JSON Game Data Files** (reference Unciv)
   - `src/assets/data/buildings.json` - Building definitions
   - `src/assets/data/units.json` - Unit definitions
   - `src/assets/data/techs.json` - Tech tree
   - `src/assets/data/policies.json` - Social policy trees
   - `src/assets/data/resources.json` - Strategic/Luxury/Bonus resources
   - `src/assets/data/improvements.json` - Tile improvements
   - Load at runtime for data-driven gameplay

7. **Add Missing Mechanics**
   - Implement happiness system (affects growth rate)
   - Add city flags (We Love The King, Resistance)
   - Add puppet city mechanics
   - Add city razing mechanics (already basic version exists)
   - Add golden ages (excess happiness → golden age)

**Files to Create**:
- `src/lib/simulation/managers/CityPopulationManager.ts`
- `src/lib/simulation/managers/CityProductionManager.ts`
- `src/lib/simulation/managers/CityExpansionManager.ts`
- `src/lib/simulation/managers/TechManager.ts`
- `src/lib/simulation/managers/PolicyManager.ts`
- `src/lib/simulation/managers/DiplomacyManager.ts`
- `src/lib/utils/uniqueParser.ts`
- `src/lib/entities/simulation/greatPerson.ts`
- `src/assets/data/buildings.json`
- `src/assets/data/units.json`
- `src/assets/data/techs.json`
- `src/assets/data/policies.json`
- `src/assets/data/resources.json`
- `src/assets/data/improvements.json`

**Files to Modify**:
- `src/lib/entities/location/city.ts` (add manager properties, work tiles)
- `src/lib/entities/location/nation.ts` (add manager properties)
- `src/lib/entities/location/regionalHexTile.ts` (add isWorked property)
- `src/lib/types/entity.ts` (add GreatPerson type)

**Unciv Assets to Reference**:
- Use Unciv's `Buildings.json`, `Units.json`, `Techs.json` as templates
- Adapt Unciv's unique strings format
- Reference Unciv's tech tree structure
- Use Unciv's policy tree layouts

**Deliverable**: Entities enhanced with Unciv patterns, ready for advanced simulation

**Priority**: HIGH - These improvements will make the simulation more authentic and flexible

**Status**: ✅ **COMPLETE** - Phase 1.5 Finished!

**What Was Completed**:
1. ✅ **Uniques System**:
   - Created `UniqueParser.ts` (691 lines) with full parsing and evaluation
   - Supports yield bonuses, percentages, tile bonuses, cost modifiers
   - Supports free units, Great Person generation, special abilities
   - Comprehensive test suite (340+ test cases in uniqueParser.test.ts)

2. ✅ **Manager Classes** (6 managers, 2,260 lines total):
   - `CityPopulationManager.ts` (290 lines) - Growth, food, starvation with Civ 5 formulas
   - `CityProductionManager.ts` (370 lines) - Production queue, overflow, rush buying
   - `CityExpansionManager.ts` (300 lines) - Culture borders, tile acquisition
   - `TechManager.ts` (350 lines) - Tech research, era progression
   - `PolicyManager.ts` (340 lines) - Social policies, culture accumulation
   - `DiplomacyManager.ts` (440 lines) - Per-nation relationships, opinion decay

3. ✅ **Great People Framework**:
   - Created `GreatPerson.ts` (559 lines)
   - 7 Great Person types (Scientist, Engineer, Merchant, Artist, General, Prophet, Admiral)
   - Each type has 2-4 unique abilities
   - **RPG-friendly**: Uses culture-based name generation (no historical names!)
   - Added `setNameByCulture()` method to generate names from nation's culturalIdentity
   - Names generated using existing nameGenerator system (Celtic, Germanic, Roman, etc.)

4. ✅ **JSON Game Data Files** (6 files, 1,652 lines total):
   - `buildings.json` (18 buildings, Ancient to Modern era)
   - `units.json` (18 units, civilian and military)
   - `techs.json` (33 technologies with prerequisite tree)
   - `policies.json` (24 policies across 9 trees)
   - `resources.json` (22 resources: strategic, luxury, bonus)
   - `improvements.json` (17 improvements including Great Person improvements)

5. ✅ **Entity Updates**:
   - Updated `City.ts` with manager properties (populationManager, productionManager, expansionManager)
   - Added `workedTileIds` and `lockedTileIds` arrays to City
   - Added `processTurn()` method to City that delegates to all managers
   - Updated `Nation.ts` with TechManager, PolicyManager, Map of DiplomacyManagers
   - Added `processTurn()` method to Nation
   - Backward compatible with legacy properties

6. ✅ **Historical Event System**:
   - HistoricalEvent entity already exists (403 lines, comprehensive)
   - Created `EventLogger.ts` (545 lines) - Utility for consistent event creation
   - Helper methods for: cityFounded, warDeclared, techDiscovered, battleFought, cityConquered, policyUnlocked, nationEliminated, improvementBuilt, greatPersonBorn
   - Events include participants, narratives, tags, state changes, causal chains
   - Ready for event sourcing pattern (replay history)

**Commits** (5 total):
- Add UniqueParser utility for parsing Unciv-style bonus strings
- Add GreatPerson entity with all Civ 5 Great People types
- Update City entity to use manager classes (Unciv pattern)
- Update Nation entity to use manager classes (Unciv pattern)
- Add JSON game data files (Unciv-inspired)
- Update GreatPerson for RPG simulation + add EventLogger

**Integration with RPG Simulation**:
- Great People now use `getCultureName(culturalIdentity, gender)` from nameGenerator.ts
- Names match nation's culture: Celtic nations get Celtic names, Germanic nations get Germanic names
- All events track participants (nations, cities, units) with full context
- Events can be filtered by nation, type, year, significance
- Historical chronicle system ready for user to read through simulated history

---

### Phase 2: Regional Map Generation (No Simulation Yet)
**Goal**: Generate detailed regional hex maps when planetary hex clicked

**Tasks**:
1. Create `RegionalMapCreator` class
2. Inherit climate/terrain bias from parent planetary hex
3. Generate 50x50 regional hex grid using noise
4. Generate rivers (pathfinding from high elevation to ocean)
5. Place resources (strategic, luxury, bonus)
6. Detect good city starting positions
7. Store regional hex tiles as entities
8. Create UI to zoom from planetary → regional

**Files to Create**:
- `src/lib/entities/location/regionalMapCreator.ts`
- `src/lib/utils/riverGenerator.ts`
- `src/lib/utils/resourcePlacer.ts`
- `src/lib/components/entities/viewers/RegionalMapViewer.svelte`

**Files to Modify**:
- `src/lib/components/entities/viewers/ContinentViewer.svelte` (add zoom button)

**Deliverable**: Can click planetary hex, see detailed regional map

---

### Phase 3: Basic Simulation Engine
**Goal**: Implement turn-based simulation without combat

**Tasks**:
1. Create `SimulationEngine` class
2. Implement turn progression (1 turn = 1 year)
3. Implement city founding (AI settles preferred terrain)
4. Implement city growth (food → population)
5. Implement city production (build settlers, workers, buildings)
6. Implement basic resource system (food, production, gold, science)
7. Implement exploration (units reveal fog of war)
8. Create historical events for all actions
9. Store events by year, nation, hex

**Files to Create**:
- `src/lib/simulation/simulationEngine.ts`
- `src/lib/simulation/cityManager.ts`
- `src/lib/simulation/resourceManager.ts`
- `src/lib/simulation/explorationManager.ts`

**Deliverable**: Can run simulation, nations expand, cities grow, events tracked

---

### Phase 4: Technology & Culture Systems
**Goal**: Add tech tree and social policies

**Tasks**:
1. Create tech tree data (all techs from Ancient → Modern)
2. Implement tech research (science → unlock techs)
3. Implement tech prerequisites and unlocks
4. Create social policy trees (Tradition, Liberty, Honor, etc.)
5. Implement culture accumulation → unlock policies
6. Implement policy effects (bonuses to production, happiness, etc.)
7. Add culture traits to nations
8. Make AI prioritize techs/policies based on culture

**Files to Create**:
- `src/lib/simulation/techTree.ts`
- `src/lib/simulation/techManager.ts`
- `src/lib/simulation/socialPolicies.ts`
- `src/lib/simulation/cultureManager.ts`

**Deliverable**: Nations research techs, adopt policies, culture evolves

---

### Phase 5: Combat & Diplomacy Systems
**Goal**: Add warfare and diplomatic relations

**Tasks**:
1. Implement unit movement (respect terrain costs, embarking)
2. Implement combat resolution (melee, ranged, siege)
3. Implement city capture mechanics
4. Create battle events with detailed tracking
5. Implement diplomacy states (peace, war, alliance, trade)
6. Implement AI diplomacy decisions (declare war, make peace)
7. Implement opinion modifiers
8. Add diplomatic actions (denounce, gift, treaty)
9. Track famous deaths in battles (can find remnants later)

**Files to Create**:
- `src/lib/simulation/combatManager.ts`
- `src/lib/simulation/diplomacyManager.ts`
- `src/lib/simulation/unitAI.ts`

**Deliverable**: Nations wage war, form alliances, negotiate peace

---

### Phase 6: Time Slider & Historical Visualization
**Goal**: Build UI for historical replay

**Tasks**:
1. Create time slider component with play/pause
2. Implement state reconstruction at any year
3. Create event timeline list view
4. Create event map view (events pinned to hexes)
5. Add nation border visualization over time
6. Add filters (nation, event type, significance)
7. Create nation diplomacy matrix view
8. Create nation details panel with graphs
9. Implement playback animation
10. Add speed controls (1x, 5x, 10x, 50x)

**Files to Create**:
- `src/lib/components/simulation/TimeSlider.svelte`
- `src/lib/components/simulation/EventTimeline.svelte`
- `src/lib/components/simulation/EventMapView.svelte`
- `src/lib/components/simulation/NationDiplomacyMatrix.svelte`
- `src/lib/components/simulation/NationDetailsPanel.svelte`

**Files to Modify**:
- `src/lib/components/entities/viewers/RegionalMapViewer.svelte`

**Deliverable**: Can scrub through time, replay history, watch nations evolve

---

### Phase 7: Cross-Boundary Interactions
**Goal**: Enable nations in adjacent regional maps to interact

**Tasks**:
1. Detect adjacent regional maps (planetary hex neighbors)
2. Map border hexes between adjacent maps
3. Enable unit movement across borders
4. Enable trade routes across borders
5. Enable wars across borders
6. Create planet-wide nation registry
7. Implement shared diplomacy across maps

**Files to Create**:
- `src/lib/simulation/borderDetector.ts`
- `src/lib/simulation/crossBoundaryManager.ts`

**Deliverable**: Nations span multiple regional maps, interact seamlessly

---

### Phase 8: Advanced Simulation Features
**Goal**: Polish and add depth

**Tasks**:
1. Implement trade route system
2. Implement road building (workers)
3. Implement improvement building (farms, mines, etc.)
4. Implement happiness system (affects growth)
5. Implement leader system (leaders change over time)
6. Implement government types (Chiefdom → Monarchy → Republic)
7. Add remnants/artifacts from battles (can be discovered later)
8. Implement great people (Great Scientist, General, Artist)
9. Add wonders (optional)
10. Fantasy mode: gods, dragons, magic techs

**Files to Create**:
- `src/lib/simulation/tradeRouteManager.ts`
- `src/lib/simulation/improvementManager.ts`
- `src/lib/simulation/happinessManager.ts`
- `src/lib/simulation/leaderManager.ts`
- `src/lib/simulation/fantasyManager.ts`

**Deliverable**: Full-featured civilization simulation

---

### Phase 9: Performance Optimization
**Goal**: Ensure smooth performance with large simulations

**Tasks**:
1. Implement event snapshots (every 100 years)
2. Lazy load events (pagination)
3. Optimize hex rendering (only render visible hexes)
4. Use Web Workers for simulation (background thread)
5. Implement progressive simulation (simulate as user explores)
6. Add performance monitoring

**Files to Modify**:
- All simulation managers
- `RegionalMapViewer.svelte`

**Deliverable**: Can simulate 10,000 years with 20 nations smoothly

---

### Phase 10: User Simulation Controls (Future)
**Goal**: Manual intervention in simulation (deferred)

**Tasks**:
1. Add "God Mode" toggle
2. Implement manual event triggering
3. Implement nation culture/tech editing
4. Implement "lock nation" (prevent AI changes)
5. Implement scenario saving/loading

**Deliverable**: User can author custom histories

---

## Technical Considerations

### Performance

**Challenges**:
- 50x50 regional map = 2,500 hex tiles
- 20 nations × 10,000 years = 200,000 turns
- Potentially millions of events

**Optimizations**:
1. **Event Snapshots**: Save full state every 100 years, replay events from nearest snapshot
2. **Lazy Loading**: Only load events when needed (pagination)
3. **Indexed Queries**: Use Maps for fast lookups (eventsByYear, eventsByNation)
4. **Web Workers**: Run simulation in background thread
5. **Progressive Rendering**: Only render visible hexes
6. **Batch Updates**: Update UI in chunks, not every single event

### Data Storage

**Size Estimates**:
- 1 regional map: ~2,500 hex tiles × 500 bytes = 1.25 MB
- 1,000 events: 1,000 × 2 KB = 2 MB
- 10,000 years simulation: ~100,000 events = 200 MB

**Strategy**:
- Use IndexedDB (stores up to 1 GB+)
- Compress historical snapshots
- Optionally allow export/import of simulation data

### Code Architecture

**Separation of Concerns**:
```
src/lib/
├─ entities/
│  ├─ location/
│  │  ├─ planetaryHexTile.ts
│  │  ├─ regionalHexTile.ts
│  │  ├─ regionalMap.ts
│  ├─ simulation/
│     ├─ nation.ts (enhanced)
│     ├─ city.ts
│     ├─ unit.ts
│     ├─ historicalEvent.ts
│     ├─ battle.ts
│     ├─ tradeRoute.ts
├─ simulation/
│  ├─ simulationEngine.ts (orchestrator)
│  ├─ techTree.ts
│  ├─ socialPolicies.ts
│  ├─ combatManager.ts
│  ├─ diplomacyManager.ts
│  ├─ cityManager.ts
│  ├─ resourceManager.ts
│  ├─ explorationManager.ts
│  ├─ tradeRouteManager.ts
│  ├─ improvementManager.ts
│  ├─ unitAI.ts
│  ├─ cultureManager.ts
│  ├─ happinessManager.ts
├─ components/
│  ├─ simulation/
│  │  ├─ TimeSlider.svelte
│  │  ├─ EventTimeline.svelte
│  │  ├─ NationDiplomacyMatrix.svelte
│  │  ├─ NationDetailsPanel.svelte
│  ├─ entities/
│     ├─ viewers/
│        ├─ RegionalMapViewer.svelte
```

---

## Example Workflow: Creating & Viewing a Simulated World

### User Flow

1. **Create Planet**:
   - User creates planet "Terra"
   - WorldMapCreator generates planetary hex map
   - Continents detected automatically

2. **Zoom into Continental Hex**:
   - User clicks on planetary hex (45, 27)
   - System checks if RegionalMap exists
   - If not, prompt: "Generate detailed map for this region?"

3. **Configure Simulation**:
   - User sets parameters:
     - Starting nations: 8
     - Starting year: -10000
     - Simulate years: 5000
     - Fantasy mode: No
     - Starting races: Humans, Elves, Dwarves, Orcs

4. **Generate Regional Map**:
   - RegionalMapCreator creates 50×50 hex grid
   - Inherits temperate climate from parent hex
   - Generates rivers, forests, resources
   - Places 8 starting tribal settlements

5. **Run Simulation**:
   - SimulationEngine runs 5000 turns (years)
   - Nations expand, found cities, research techs
   - Wars fought, alliances formed
   - All events tracked in HistoricalEvent entities
   - Shows progress bar: "Simulating Year 2500 / 5000..."

6. **View Results**:
   - Map shows final state (year -5000)
   - 8 nations evolved into 5 (3 were conquered)
   - 42 cities founded
   - 237 battles fought
   - Tech progress: Some nations reached Classical era

7. **Explore History**:
   - User moves time slider to year -8000
   - Map shows early tribal expansion
   - Event timeline shows: "Year -8000: Nation Elaria founds city of Silvermoon"
   - User clicks event → jumps to hex, highlights city

8. **Watch Playback**:
   - User clicks Play (▶)
   - Animation shows nations expanding over centuries
   - Borders change as wars are won/lost
   - Cities appear as they're founded
   - Speed: 10 years per second

9. **Investigate Battle**:
   - User filters events: "Show only battles"
   - Finds "Battle of Red River" (year -6500)
   - Clicks → shows battle details:
     - Combatants: Elaria vs Drakoria
     - Outcome: Elaria victory
     - Famous death: General Thorin of Drakoria
   - Note: "Bones of General Thorin may be found at this site"

10. **Continue Simulation**:
    - User clicks "Simulate 1000 more years"
    - Simulation extends to year -4000
    - New events added to timeline
    - Can continue indefinitely

---

## Next Steps

1. **Review & Approve Plan** - Confirm this vision matches your goals
2. **Prioritize Phases** - Which phases to implement first?
3. **Start Phase 1** - Build entity structure and data model
4. **Iterative Development** - Implement phase by phase, test frequently

This is a **massive undertaking** comparable to building a simplified version of Civilization V. The full implementation could take months. We should proceed **incrementally**, testing each phase before moving to the next.

**Shall we begin with Phase 1?**

---

*This is a living document - update as we refine the design!*
