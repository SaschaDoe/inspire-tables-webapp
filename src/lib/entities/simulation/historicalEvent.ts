import { Entity } from '../base/entity';

/**
 * Event types for categorization and filtering
 */
export enum HistoricalEventType {
	// Nation events
	NationFounded = 'nation_founded',
	NationEliminated = 'nation_eliminated',
	LeadershipChange = 'leadership_change',
	GovernmentChange = 'government_change',

	// City events
	CityFounded = 'city_founded',
	CityConquered = 'city_conquered',
	CityRazed = 'city_razed',
	CityGrew = 'city_grew',
	CityStarved = 'city_starved',
	CityRevolted = 'city_revolted',

	// Military events
	WarDeclared = 'war_declared',
	PeaceTreaty = 'peace_treaty',
	BattleFought = 'battle_fought',
	UnitCreated = 'unit_created',
	UnitDestroyed = 'unit_destroyed',
	UnitPromoted = 'unit_promoted',

	// Diplomacy events
	AllianceFormed = 'alliance_formed',
	AllianceBroken = 'alliance_broken',
	TradeAgreement = 'trade_agreement',
	DiplomaticIncident = 'diplomatic_incident',
	TreatyViolated = 'treaty_violated',

	// Technology and culture
	TechDiscovered = 'tech_discovered',
	PolicyUnlocked = 'policy_unlocked',
	EraEntered = 'era_entered',
	WonderCompleted = 'wonder_completed',
	BuildingConstructed = 'building_constructed',

	// Territory and exploration
	HexDiscovered = 'hex_discovered',
	BorderExpansion = 'border_expansion',
	TerritoryLost = 'territory_lost',
	ImprovementBuilt = 'improvement_built',
	ImprovementPillaged = 'improvement_pillaged',

	// Economy
	ResourceDiscovered = 'resource_discovered',
	TradeRouteEstablished = 'trade_route_established',
	TradeRouteDisrupted = 'trade_route_disrupted',

	// Special events
	NaturalDisaster = 'natural_disaster',
	BarbarianRaid = 'barbarian_raid',
	CulturalVictory = 'cultural_victory',
	MilitaryVictory = 'military_victory',
	ScienceVictory = 'science_victory',

	// Generic
	Other = 'other'
}

/**
 * Event significance level (for filtering important events)
 */
export enum EventSignificance {
	Minor = 1, // Routine events (unit moved, improvement built)
	Normal = 3, // Standard events (city founded, tech discovered)
	Major = 5, // Important events (war declared, wonder completed)
	Critical = 8, // Very important (nation eliminated, era entered)
	Historic = 10 // Legendary events (victory achieved, civilization destroyed)
}

/**
 * Participant in an event (nation, city, unit, etc.)
 */
export interface EventParticipant {
	entityType: string; // 'nation', 'city', 'unit', etc.
	entityId: string;
	entityName: string;
	role: 'primary' | 'secondary' | 'affected' | 'witness';
}

/**
 * State change captured by this event
 */
export interface StateChange {
	entityId: string;
	entityType: string;
	property: string;
	oldValue: any;
	newValue: any;
}

/**
 * HistoricalEvent - Record of everything that happens in the simulation
 *
 * This is the core of the event sourcing pattern:
 * - Every state change is recorded as an event
 * - Events can be replayed to reconstruct history
 * - Events can be filtered and displayed in timelines
 * - Events enable historical analysis and storytelling
 */
export class HistoricalEvent extends Entity {
	// Basic properties
	name = ''; // Short title (e.g., "Battle of Thermopylae")
	description = ''; // Detailed description of what happened

	// Event classification
	eventType: HistoricalEventType = HistoricalEventType.Other;
	significance: EventSignificance = EventSignificance.Normal;
	category: 'military' | 'diplomatic' | 'economic' | 'cultural' | 'territorial' | 'disaster' | 'other' = 'other';

	// When and where
	year = 0; // Simulation year when event occurred
	turnNumber = 0; // Turn number (for precise ordering within a year)
	hexTileId?: string; // DetailedHexTile where event occurred (if location-specific)
	coordinates?: { x: number; y: number }; // Global coordinates (for display on map)
	parentPlanetId = ''; // Planet where event occurred

	// Who was involved
	participants: EventParticipant[] = []; // All entities involved in the event
	primaryNationId?: string; // Primary nation involved (for filtering)
	affectedNationIds: string[] = []; // All nations affected by this event

	// State changes (for event sourcing)
	stateChanges: StateChange[] = []; // All state changes caused by this event

	// Event context and data
	eventData: Record<string, any> = {}; // Flexible data storage for event-specific information

	// Relationships to other events
	causedByEventId?: string; // Event that caused this event (causal chain)
	triggeredEventIds: string[] = []; // Events this event caused
	relatedEventIds: string[] = []; // Other related events (same battle, same war, etc.)

	// Related entities
	relatedCityIds: string[] = []; // Cities involved
	relatedUnitIds: string[] = []; // Units involved
	relatedBattleId?: string; // Battle entity if this is a battle event

	// Display and narrative
	narrative: string[] = []; // Multiple narrative perspectives (attacker, defender, neutral)
	shortSummary = ''; // One-line summary for timeline
	detailedLog = ''; // Detailed technical log of what happened

	// Visibility and discovery
	knownByNations: string[] = []; // Which nations know about this event
	discoveredByNationIds: string[] = []; // Which nations have discovered evidence of this historical event

	// Tags for filtering
	tags: string[] = []; // Tags like 'major_battle', 'founding', 'conquest', etc.

	constructor() {
		super();
		this.name = 'Historical Event';
	}

	/**
	 * Add a participant to the event
	 */
	addParticipant(
		entityType: string,
		entityId: string,
		entityName: string,
		role: EventParticipant['role']
	): void {
		this.participants.push({
			entityType,
			entityId,
			entityName,
			role
		});

		// Update nation tracking if participant is a nation
		if (entityType === 'nation') {
			if (role === 'primary' && !this.primaryNationId) {
				this.primaryNationId = entityId;
			}
			if (!this.affectedNationIds.includes(entityId)) {
				this.affectedNationIds.push(entityId);
			}
		}
	}

	/**
	 * Record a state change
	 */
	recordStateChange(
		entityId: string,
		entityType: string,
		property: string,
		oldValue: any,
		newValue: any
	): void {
		this.stateChanges.push({
			entityId,
			entityType,
			property,
			oldValue,
			newValue
		});
	}

	/**
	 * Set event data (flexible storage for any event-specific info)
	 */
	setEventData(key: string, value: any): void {
		this.eventData[key] = value;
	}

	/**
	 * Get event data
	 */
	getEventData(key: string): any {
		return this.eventData[key];
	}

	/**
	 * Add a narrative perspective
	 */
	addNarrative(narrative: string): void {
		this.narrative.push(narrative);
	}

	/**
	 * Link this event as caused by another event
	 */
	setCausedBy(eventId: string): void {
		this.causedByEventId = eventId;
	}

	/**
	 * Link an event that was triggered by this event
	 */
	addTriggeredEvent(eventId: string): void {
		if (!this.triggeredEventIds.includes(eventId)) {
			this.triggeredEventIds.push(eventId);
		}
	}

	/**
	 * Link a related event
	 */
	addRelatedEvent(eventId: string): void {
		if (!this.relatedEventIds.includes(eventId)) {
			this.relatedEventIds.push(eventId);
		}
	}

	/**
	 * Mark event as known by a nation
	 */
	makeKnownTo(nationId: string): void {
		if (!this.knownByNations.includes(nationId)) {
			this.knownByNations.push(nationId);
		}
	}

	/**
	 * Check if event is known by a nation
	 */
	isKnownBy(nationId: string): boolean {
		return this.knownByNations.includes(nationId);
	}

	/**
	 * Get primary participant
	 */
	getPrimaryParticipant(): EventParticipant | undefined {
		return this.participants.find(p => p.role === 'primary');
	}

	/**
	 * Get all participants of a specific type
	 */
	getParticipantsByType(entityType: string): EventParticipant[] {
		return this.participants.filter(p => p.entityType === entityType);
	}

	/**
	 * Get nations involved
	 */
	getNationParticipants(): EventParticipant[] {
		return this.getParticipantsByType('nation');
	}

	/**
	 * Generate a short summary if not set
	 */
	generateShortSummary(): string {
		if (this.shortSummary) {
			return this.shortSummary;
		}

		const primary = this.getPrimaryParticipant();
		const primaryName = primary?.entityName || 'Unknown';

		switch (this.eventType) {
			case HistoricalEventType.CityFounded:
				this.shortSummary = `${primaryName} founded a city`;
				break;
			case HistoricalEventType.WarDeclared:
				const target = this.participants.find(p => p.role === 'secondary');
				this.shortSummary = `${primaryName} declared war on ${target?.entityName || 'unknown'}`;
				break;
			case HistoricalEventType.BattleFought:
				this.shortSummary = `Battle at ${this.name}`;
				break;
			case HistoricalEventType.TechDiscovered:
				this.shortSummary = `${primaryName} discovered ${this.eventData.techName || 'a technology'}`;
				break;
			case HistoricalEventType.NationEliminated:
				this.shortSummary = `${primaryName} was eliminated`;
				break;
			default:
				this.shortSummary = this.name || 'Event occurred';
		}

		return this.shortSummary;
	}

	/**
	 * Get display string for timeline
	 */
	getTimelineDisplay(): string {
		const yearStr = this.year >= 0 ? `${this.year} AD` : `${Math.abs(this.year)} BC`;
		const summary = this.generateShortSummary();
		return `${yearStr}: ${summary}`;
	}

	/**
	 * Check if event matches filter criteria
	 */
	matchesFilter(filter: {
		eventTypes?: HistoricalEventType[];
		nationIds?: string[];
		minSignificance?: EventSignificance;
		categories?: string[];
		tags?: string[];
		yearRange?: { start: number; end: number };
	}): boolean {
		// Check event type
		if (filter.eventTypes && filter.eventTypes.length > 0) {
			if (!filter.eventTypes.includes(this.eventType)) {
				return false;
			}
		}

		// Check nation involvement
		if (filter.nationIds && filter.nationIds.length > 0) {
			const hasMatchingNation = this.affectedNationIds.some(id =>
				filter.nationIds!.includes(id)
			);
			if (!hasMatchingNation) {
				return false;
			}
		}

		// Check significance
		if (filter.minSignificance !== undefined) {
			if (this.significance < filter.minSignificance) {
				return false;
			}
		}

		// Check category
		if (filter.categories && filter.categories.length > 0) {
			if (!filter.categories.includes(this.category)) {
				return false;
			}
		}

		// Check tags
		if (filter.tags && filter.tags.length > 0) {
			const hasMatchingTag = this.tags.some(tag => filter.tags!.includes(tag));
			if (!hasMatchingTag) {
				return false;
			}
		}

		// Check year range
		if (filter.yearRange) {
			if (this.year < filter.yearRange.start || this.year > filter.yearRange.end) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Create a clone for replay/reconstruction
	 */
	clone(): HistoricalEvent {
		const cloned = new HistoricalEvent();
		Object.assign(cloned, JSON.parse(JSON.stringify(this)));
		return cloned;
	}
}
