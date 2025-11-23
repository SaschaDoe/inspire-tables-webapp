import { Entity } from '../base/entity';

/**
 * Diplomacy state between two nations
 */
export enum DiplomacyState {
	Peace = 'peace',
	War = 'war',
	Alliance = 'alliance',
	Trade = 'trade',
	Neutral = 'neutral',
	Hostile = 'hostile',
	Friendly = 'friendly'
}

/**
 * Diplomacy relationship with another nation
 */
export interface DiplomacyRelationship {
	targetNationId: string;
	state: DiplomacyState;
	opinion: number; // -100 to +100
	treatySince?: number; // Year treaty started
	warsSince?: number; // Year war started
	tradeSince?: number; // Year trade agreement started
	lastInteraction?: number; // Year of last diplomatic action
	grievances: string[]; // List of active grievances
	diplomaticHistory: Array<{
		year: number;
		action: string;
		description: string;
	}>;
}

/**
 * Culture traits that affect AI behavior (Civ 5 inspired)
 * Each trait is on a 0-100 scale
 */
export interface CultureTraits {
	militaristic: number; // Tendency toward military buildup and conquest
	expansionist: number; // Desire to settle new cities and claim territory
	commercial: number; // Focus on trade and economic development
	scientific: number; // Emphasis on technology research
	seafaring: number; // Preference for naval units and coastal expansion
	diplomatic: number; // Tendency to form alliances and avoid conflict
}

/**
 * Resource accumulation and yields (Civ 5 style)
 */
export interface NationResources {
	food: number; // Surplus food (for growth and trade)
	production: number; // Production capacity (for units/buildings)
	gold: number; // Accumulated gold (for purchases and maintenance)
	science: number; // Science per turn (for tech progress)
	culture: number; // Culture per turn (for policies and borders)
	happiness: number; // Total happiness (-100 to +100)
}

/**
 * Era progression (Civ 5 eras)
 */
export enum Era {
	Prehistoric = 'prehistoric',
	Ancient = 'ancient',
	Classical = 'classical',
	Medieval = 'medieval',
	Renaissance = 'renaissance',
	Industrial = 'industrial',
	Modern = 'modern',
	Atomic = 'atomic',
	Information = 'information'
}

/**
 * Enhanced Nation entity with full Civilization 5-style simulation
 */
export class Nation extends Entity {
	// Basic properties (legacy)
	name = '';
	description = '';
	adjective = '';

	// Racial and cultural identity
	race = ''; // Human, Elf, Dwarf, Orc, etc. (fantasy mode) or ethnic group (realistic mode)
	culturalIdentity = ''; // Celtic, Roman, Chinese, etc.
	foundingYear = -10000; // When this nation was founded

	// Leadership
	leaderName = ''; // Current leader's name
	leaderTitle = 'Chief'; // Chief, King, Emperor, President, etc.
	governmentType = 'Tribal'; // Tribal, Monarchy, Republic, Democracy, etc.

	// Territory and cities
	capitalCityId?: string; // ID of the capital city
	cityIds: string[] = []; // IDs of all cities controlled by this nation
	territoryHexIds: string[] = []; // IDs of all RegionalHexTile entities owned
	territorySize = 0; // Number of hex tiles controlled

	// Population
	totalPopulation = 1000; // Total population across all cities
	populationGrowthRate = 0; // Current growth rate

	// Resources (Civ 5 style)
	resources: NationResources = {
		food: 0,
		production: 0,
		gold: 0,
		science: 0,
		culture: 0,
		happiness: 0
	};

	// Per-turn yields
	yields: NationResources = {
		food: 0,
		production: 0,
		gold: 2,
		science: 0,
		culture: 0,
		happiness: 0
	};

	// Technology (Civ 5 tech tree)
	currentEra: Era = Era.Prehistoric;
	discoveredTechs: string[] = []; // IDs of unlocked technologies
	currentResearch?: string; // Tech currently being researched
	researchProgress = 0; // Beakers accumulated toward current tech
	sciencePerTurn = 0; // Science generated per turn

	// Culture and Social Policies (Civ 5 policies)
	cultureAccumulated = 0; // Total culture accumulated
	culturePerTurn = 0; // Culture generated per turn
	unlockedPolicies: string[] = []; // IDs of unlocked social policies
	unlockedPolicyTrees: string[] = []; // Which policy trees are unlocked

	// Culture traits (affects AI behavior)
	cultureTraits: CultureTraits = {
		militaristic: 50,
		expansionist: 50,
		commercial: 50,
		scientific: 50,
		seafaring: 50,
		diplomatic: 50
	};

	// Military
	militaryUnits: string[] = []; // IDs of military units
	militaryStrength = 0; // Total military power
	armies: string[] = []; // IDs of Army entities
	fleets: string[] = []; // IDs of Fleet entities

	// Diplomacy
	diplomacyRelationships: Map<string, DiplomacyRelationship> = new Map();
	alliedNations: string[] = []; // IDs of allied nations
	atWarWith: string[] = []; // IDs of nations at war with
	tradePartners: string[] = []; // IDs of nations with trade agreements

	// Historical tracking
	historicalEventIds: string[] = []; // All events involving this nation
	battlesParticipated: string[] = []; // IDs of battles this nation fought
	citiesFounded: Array<{ cityId: string; year: number }> = [];
	leadersHistory: Array<{ name: string; title: string; fromYear: number; toYear: number | null }> = [];

	// Strategic resources (Civ 5 resources)
	strategicResources: Map<string, number> = new Map(); // Iron: 5, Horses: 3, etc.
	luxuryResources: Map<string, number> = new Map(); // Gold: 2, Gems: 1, etc.

	// Status
	isActive = true; // Whether nation still exists
	isAIControlled = true; // Whether controlled by AI
	isEliminated = false; // Whether nation has been destroyed
	eliminatedYear?: number; // Year nation was eliminated

	// Parent references
	parentRegionalMapId = ''; // Primary regional map this nation exists in
	expandedToMapIds: string[] = []; // Other regional maps this nation has expanded to

	// Modifiers and bonuses
	happinessModifiers: Array<{ source: string; value: number }> = [];
	goldModifiers: Array<{ source: string; value: number }> = [];
	scienceModifiers: Array<{ source: string; value: number }> = [];

	constructor() {
		super();
		this.initializeLeader();
	}

	/**
	 * Initialize the founding leader
	 */
	private initializeLeader(): void {
		if (!this.leaderName) {
			this.leaderName = 'Founder';
		}
		this.leadersHistory.push({
			name: this.leaderName,
			title: this.leaderTitle,
			fromYear: this.foundingYear,
			toYear: null
		});
	}

	/**
	 * Get diplomacy state with another nation
	 */
	getDiplomacyState(nationId: string): DiplomacyState {
		return this.diplomacyRelationships.get(nationId)?.state || DiplomacyState.Neutral;
	}

	/**
	 * Set diplomacy state with another nation
	 */
	setDiplomacyState(nationId: string, state: DiplomacyState, year: number): void {
		const existing = this.diplomacyRelationships.get(nationId);

		if (existing) {
			existing.state = state;
			existing.lastInteraction = year;
			existing.diplomaticHistory.push({
				year,
				action: state,
				description: `Relations changed to ${state}`
			});
		} else {
			this.diplomacyRelationships.set(nationId, {
				targetNationId: nationId,
				state,
				opinion: 0,
				treatySince: state === DiplomacyState.Alliance ? year : undefined,
				warsSince: state === DiplomacyState.War ? year : undefined,
				tradeSince: state === DiplomacyState.Trade ? year : undefined,
				lastInteraction: year,
				grievances: [],
				diplomaticHistory: [{
					year,
					action: state,
					description: `Initial relations: ${state}`
				}]
			});
		}

		// Update related arrays
		if (state === DiplomacyState.Alliance && !this.alliedNations.includes(nationId)) {
			this.alliedNations.push(nationId);
		} else if (state !== DiplomacyState.Alliance) {
			this.alliedNations = this.alliedNations.filter(id => id !== nationId);
		}

		if (state === DiplomacyState.War && !this.atWarWith.includes(nationId)) {
			this.atWarWith.push(nationId);
		} else if (state !== DiplomacyState.War) {
			this.atWarWith = this.atWarWith.filter(id => id !== nationId);
		}

		if (state === DiplomacyState.Trade && !this.tradePartners.includes(nationId)) {
			this.tradePartners.push(nationId);
		} else if (state !== DiplomacyState.Trade) {
			this.tradePartners = this.tradePartners.filter(id => id !== nationId);
		}
	}

	/**
	 * Get opinion of another nation (-100 to +100)
	 */
	getOpinion(nationId: string): number {
		return this.diplomacyRelationships.get(nationId)?.opinion || 0;
	}

	/**
	 * Modify opinion of another nation
	 */
	modifyOpinion(nationId: string, delta: number, reason: string): void {
		const relationship = this.diplomacyRelationships.get(nationId);
		if (relationship) {
			relationship.opinion = Math.max(-100, Math.min(100, relationship.opinion + delta));
			if (delta !== 0) {
				relationship.grievances.push(reason);
			}
		}
	}

	/**
	 * Check if at war with another nation
	 */
	isAtWarWith(nationId: string): boolean {
		return this.atWarWith.includes(nationId);
	}

	/**
	 * Check if allied with another nation
	 */
	isAlliedWith(nationId: string): boolean {
		return this.alliedNations.includes(nationId);
	}

	/**
	 * Add a discovered technology
	 */
	discoverTech(techId: string, year: number): void {
		if (!this.discoveredTechs.includes(techId)) {
			this.discoveredTechs.push(techId);
			// Update era based on techs (will be implemented with tech tree)
		}
	}

	/**
	 * Check if a technology is discovered
	 */
	hasTech(techId: string): boolean {
		return this.discoveredTechs.includes(techId);
	}

	/**
	 * Unlock a social policy
	 */
	unlockPolicy(policyId: string): void {
		if (!this.unlockedPolicies.includes(policyId)) {
			this.unlockedPolicies.push(policyId);
		}
	}

	/**
	 * Add a city to this nation
	 */
	addCity(cityId: string, year: number, isCapital = false): void {
		if (!this.cityIds.includes(cityId)) {
			this.cityIds.push(cityId);
			this.citiesFounded.push({ cityId, year });

			if (isCapital || !this.capitalCityId) {
				this.capitalCityId = cityId;
			}
		}
	}

	/**
	 * Remove a city (conquered or destroyed)
	 */
	removeCity(cityId: string): void {
		this.cityIds = this.cityIds.filter(id => id !== cityId);
		if (this.capitalCityId === cityId) {
			// Set new capital to first remaining city
			this.capitalCityId = this.cityIds[0];
		}
	}

	/**
	 * Calculate total military strength
	 */
	calculateMilitaryStrength(): number {
		// Will be implemented with unit system
		return this.militaryUnits.length * 10;
	}

	/**
	 * Update per-turn yields from all cities and sources
	 */
	updateYields(): void {
		// Will be implemented with city and yield calculation system
		this.sciencePerTurn = this.yields.science;
		this.culturePerTurn = this.yields.culture;
	}

	/**
	 * Process end of turn
	 */
	processTurn(): void {
		// Accumulate resources
		this.resources.food += this.yields.food;
		this.resources.production += this.yields.production;
		this.resources.gold += this.yields.gold;
		this.resources.science += this.yields.science;
		this.resources.culture += this.yields.culture;

		// Accumulate toward current research
		if (this.currentResearch) {
			this.researchProgress += this.sciencePerTurn;
		}

		// Accumulate culture
		this.cultureAccumulated += this.culturePerTurn;
	}

	/**
	 * Eliminate this nation
	 */
	eliminate(year: number): void {
		this.isEliminated = true;
		this.isActive = false;
		this.eliminatedYear = year;

		// End current leader's reign
		const currentLeader = this.leadersHistory[this.leadersHistory.length - 1];
		if (currentLeader && currentLeader.toYear === null) {
			currentLeader.toYear = year;
		}
	}

	/**
	 * Get a summary of this nation's status
	 */
	getSummary(): string {
		const cityCount = this.cityIds.length;
		const population = this.totalPopulation.toLocaleString();
		const eraName = this.currentEra;
		const status = this.isEliminated ? '(Eliminated)' : this.isActive ? '(Active)' : '(Inactive)';

		return `${this.name} ${status}: ${cityCount} cities, ${population} population, ${eraName} era`;
	}
}
