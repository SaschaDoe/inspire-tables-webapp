/**
 * EventLogger - Utility service for creating and logging historical events
 *
 * This centralizes event creation to ensure:
 * - Consistent event structure
 * - Proper participant tracking
 * - Automatic narrative generation
 * - Event indexing and storage
 *
 * Usage:
 * ```typescript
 * const event = EventLogger.cityFounded(city, nation, settler, currentYear, turn);
 * await eventStore.save(event);
 * ```
 */

import {
	HistoricalEvent,
	HistoricalEventType,
	EventSignificance,
	type EventParticipant
} from '$lib/entities/simulation/historicalEvent';
import type { City } from '$lib/entities/location/city';
import type { Nation } from '$lib/entities/location/nation';

export class EventLogger {
	/**
	 * Create a city founded event
	 */
	static cityFounded(
		city: City,
		nation: Nation,
		settlerUnitId: string | undefined,
		year: number,
		turnNumber: number,
		hexTileId?: string
	): HistoricalEvent {
		const event = new HistoricalEvent();
		event.eventType = HistoricalEventType.CityFounded;
		event.significance = EventSignificance.Normal;
		event.category = 'territorial';
		event.year = year;
		event.turnNumber = turnNumber;
		event.hexTileId = hexTileId || city.hexTileId;
		event.coordinates = city.coordinates;
		event.parentPlanetId = city.parentPlanetId;

		// Participants
		event.addParticipant('nation', nation.id, nation.name, 'primary');
		event.addParticipant('city', city.id, city.name, 'primary');
		if (settlerUnitId) {
			event.addParticipant('unit', settlerUnitId, 'Settler', 'secondary');
		}

		// Names and descriptions
		event.name = `Foundation of ${city.name}`;
		event.description = `The ${nation.adjective || nation.name} nation founded the city of ${city.name} in year ${year}.`;
		event.shortSummary = `${nation.name} founded ${city.name}`;

		// Event data
		event.setEventData('cityId', city.id);
		event.setEventData('cityName', city.name);
		event.setEventData('nationId', nation.id);
		event.setEventData('isCapital', city.isCapital);
		event.setEventData('population', city.population);

		// Tags
		event.tags = ['founding', 'city'];
		if (city.isCapital) {
			event.tags.push('capital');
			event.significance = EventSignificance.Major;
		}

		// Make known to founding nation
		event.makeKnownTo(nation.id);

		// Related entities
		event.relatedCityIds = [city.id];

		return event;
	}

	/**
	 * Create a war declared event
	 */
	static warDeclared(
		aggressor: Nation,
		target: Nation,
		reason: string,
		year: number,
		turnNumber: number
	): HistoricalEvent {
		const event = new HistoricalEvent();
		event.eventType = HistoricalEventType.WarDeclared;
		event.significance = EventSignificance.Major;
		event.category = 'military';
		event.year = year;
		event.turnNumber = turnNumber;

		// Participants
		event.addParticipant('nation', aggressor.id, aggressor.name, 'primary');
		event.addParticipant('nation', target.id, target.name, 'secondary');

		// Names and descriptions
		event.name = `${aggressor.name} declares war on ${target.name}`;
		event.description = `In year ${year}, ${aggressor.name} declared war on ${target.name}. Reason: ${reason}`;
		event.shortSummary = `${aggressor.name} declared war on ${target.name}`;

		// Event data
		event.setEventData('aggressorId', aggressor.id);
		event.setEventData('targetId', target.id);
		event.setEventData('reason', reason);

		// Narratives from different perspectives
		event.addNarrative(`${aggressor.name} perspective: We declared war on ${target.name} due to ${reason}.`);
		event.addNarrative(
			`${target.name} perspective: ${aggressor.name} has unjustly declared war upon us!`
		);

		// Tags
		event.tags = ['war', 'diplomacy', 'conflict'];

		// Make known to both nations
		event.makeKnownTo(aggressor.id);
		event.makeKnownTo(target.id);

		return event;
	}

	/**
	 * Create a tech discovered event
	 */
	static techDiscovered(
		nation: Nation,
		techId: string,
		techName: string,
		year: number,
		turnNumber: number,
		era?: string
	): HistoricalEvent {
		const event = new HistoricalEvent();
		event.eventType = HistoricalEventType.TechDiscovered;
		event.significance = EventSignificance.Normal;
		event.category = 'cultural';
		event.year = year;
		event.turnNumber = turnNumber;

		// Participants
		event.addParticipant('nation', nation.id, nation.name, 'primary');

		// Names and descriptions
		event.name = `${nation.name} discovers ${techName}`;
		event.description = `${nation.name} has discovered the technology of ${techName} in year ${year}.`;
		event.shortSummary = `${nation.name} discovered ${techName}`;

		// Event data
		event.setEventData('techId', techId);
		event.setEventData('techName', techName);
		event.setEventData('era', era);

		// Tags
		event.tags = ['technology', 'science', 'discovery'];

		// Make known to discovering nation
		event.makeKnownTo(nation.id);

		return event;
	}

	/**
	 * Create a battle fought event
	 */
	static battleFought(
		attackerNation: Nation,
		defenderNation: Nation,
		hexTileId: string,
		coordinates: { x: number; y: number },
		outcome: 'attacker_victory' | 'defender_victory' | 'stalemate',
		casualties: { attacker: number; defender: number },
		year: number,
		turnNumber: number,
		battleId?: string
	): HistoricalEvent {
		const event = new HistoricalEvent();
		event.eventType = HistoricalEventType.BattleFought;
		event.significance = EventSignificance.Major;
		event.category = 'military';
		event.year = year;
		event.turnNumber = turnNumber;
		event.hexTileId = hexTileId;
		event.coordinates = coordinates;

		// Participants
		event.addParticipant('nation', attackerNation.id, attackerNation.name, 'primary');
		event.addParticipant('nation', defenderNation.id, defenderNation.name, 'secondary');

		// Names and descriptions
		const locationName = `(${coordinates.x}, ${coordinates.y})`;
		event.name = `Battle at ${locationName}`;

		const victor =
			outcome === 'attacker_victory'
				? attackerNation.name
				: outcome === 'defender_victory'
					? defenderNation.name
					: 'neither side';

		event.description = `A battle was fought between ${attackerNation.name} and ${defenderNation.name} at ${locationName}. Victor: ${victor}. Casualties: ${casualties.attacker} (${attackerNation.name}), ${casualties.defender} (${defenderNation.name}).`;
		event.shortSummary = `Battle at ${locationName}: ${victor} victorious`;

		// Event data
		event.setEventData('attackerNationId', attackerNation.id);
		event.setEventData('defenderNationId', defenderNation.id);
		event.setEventData('outcome', outcome);
		event.setEventData('casualties', casualties);
		if (battleId) {
			event.relatedBattleId = battleId;
		}

		// Tags
		event.tags = ['battle', 'combat', 'military'];
		if (casualties.attacker + casualties.defender > 10) {
			event.tags.push('major_battle');
			event.significance = EventSignificance.Critical;
		}

		// Make known to both nations
		event.makeKnownTo(attackerNation.id);
		event.makeKnownTo(defenderNation.id);

		return event;
	}

	/**
	 * Create a city conquered event
	 */
	static cityConquered(
		city: City,
		previousOwner: Nation,
		conqueror: Nation,
		year: number,
		turnNumber: number
	): HistoricalEvent {
		const event = new HistoricalEvent();
		event.eventType = HistoricalEventType.CityConquered;
		event.significance = EventSignificance.Major;
		event.category = 'military';
		event.year = year;
		event.turnNumber = turnNumber;
		event.hexTileId = city.hexTileId;
		event.coordinates = city.coordinates;

		// Participants
		event.addParticipant('city', city.id, city.name, 'primary');
		event.addParticipant('nation', conqueror.id, conqueror.name, 'primary');
		event.addParticipant('nation', previousOwner.id, previousOwner.name, 'affected');

		// Names and descriptions
		event.name = `${conqueror.name} conquers ${city.name}`;
		event.description = `The city of ${city.name}, previously held by ${previousOwner.name}, has been conquered by ${conqueror.name} in year ${year}.`;
		event.shortSummary = `${conqueror.name} conquered ${city.name} from ${previousOwner.name}`;

		// Event data
		event.setEventData('cityId', city.id);
		event.setEventData('previousOwnerId', previousOwner.id);
		event.setEventData('conquerorId', conqueror.id);
		event.setEventData('isCapital', city.isCapital);

		// State changes
		event.recordStateChange(city.id, 'city', 'ownerNationId', previousOwner.id, conqueror.id);

		// Tags
		event.tags = ['conquest', 'city', 'military'];
		if (city.isCapital) {
			event.tags.push('capital_conquered');
			event.significance = EventSignificance.Critical;
		}

		// Make known to both nations
		event.makeKnownTo(conqueror.id);
		event.makeKnownTo(previousOwner.id);

		// Related entities
		event.relatedCityIds = [city.id];

		return event;
	}

	/**
	 * Create a policy unlocked event
	 */
	static policyUnlocked(
		nation: Nation,
		policyId: string,
		policyName: string,
		policyTreeId: string,
		year: number,
		turnNumber: number
	): HistoricalEvent {
		const event = new HistoricalEvent();
		event.eventType = HistoricalEventType.PolicyUnlocked;
		event.significance = EventSignificance.Normal;
		event.category = 'cultural';
		event.year = year;
		event.turnNumber = turnNumber;

		// Participants
		event.addParticipant('nation', nation.id, nation.name, 'primary');

		// Names and descriptions
		event.name = `${nation.name} adopts ${policyName}`;
		event.description = `${nation.name} has adopted the social policy "${policyName}" from the ${policyTreeId} tree.`;
		event.shortSummary = `${nation.name} adopted ${policyName}`;

		// Event data
		event.setEventData('policyId', policyId);
		event.setEventData('policyName', policyName);
		event.setEventData('policyTreeId', policyTreeId);

		// Tags
		event.tags = ['policy', 'culture', 'social'];

		// Make known to nation
		event.makeKnownTo(nation.id);

		return event;
	}

	/**
	 * Create a nation eliminated event
	 */
	static nationEliminated(
		eliminatedNation: Nation,
		conqueredBy: Nation | null,
		year: number,
		turnNumber: number
	): HistoricalEvent {
		const event = new HistoricalEvent();
		event.eventType = HistoricalEventType.NationEliminated;
		event.significance = EventSignificance.Historic;
		event.category = 'military';
		event.year = year;
		event.turnNumber = turnNumber;

		// Participants
		event.addParticipant('nation', eliminatedNation.id, eliminatedNation.name, 'primary');
		if (conqueredBy) {
			event.addParticipant('nation', conqueredBy.id, conqueredBy.name, 'secondary');
		}

		// Names and descriptions
		if (conqueredBy) {
			event.name = `${eliminatedNation.name} eliminated by ${conqueredBy.name}`;
			event.description = `The nation of ${eliminatedNation.name} has been completely eliminated by ${conqueredBy.name} in year ${year}.`;
			event.shortSummary = `${conqueredBy.name} eliminated ${eliminatedNation.name}`;
		} else {
			event.name = `${eliminatedNation.name} has fallen`;
			event.description = `The nation of ${eliminatedNation.name} has been eliminated in year ${year}.`;
			event.shortSummary = `${eliminatedNation.name} eliminated`;
		}

		// Event data
		event.setEventData('eliminatedNationId', eliminatedNation.id);
		if (conqueredBy) {
			event.setEventData('conquerorId', conqueredBy.id);
		}

		// State changes
		event.recordStateChange(eliminatedNation.id, 'nation', 'isActive', true, false);

		// Tags
		event.tags = ['elimination', 'nation', 'historic', 'fall'];

		// Make known to conqueror if exists
		if (conqueredBy) {
			event.makeKnownTo(conqueredBy.id);
		}

		return event;
	}

	/**
	 * Create an improvement built event
	 */
	static improvementBuilt(
		nation: Nation,
		improvementType: string,
		hexTileId: string,
		coordinates: { x: number; y: number },
		workerUnitId: string | undefined,
		year: number,
		turnNumber: number
	): HistoricalEvent {
		const event = new HistoricalEvent();
		event.eventType = HistoricalEventType.ImprovementBuilt;
		event.significance = EventSignificance.Minor;
		event.category = 'economic';
		event.year = year;
		event.turnNumber = turnNumber;
		event.hexTileId = hexTileId;
		event.coordinates = coordinates;

		// Participants
		event.addParticipant('nation', nation.id, nation.name, 'primary');
		if (workerUnitId) {
			event.addParticipant('unit', workerUnitId, 'Worker', 'secondary');
		}

		// Names and descriptions
		event.name = `${improvementType} built at (${coordinates.x}, ${coordinates.y})`;
		event.description = `${nation.name} built a ${improvementType} at coordinates (${coordinates.x}, ${coordinates.y}).`;
		event.shortSummary = `${nation.name} built ${improvementType}`;

		// Event data
		event.setEventData('improvementType', improvementType);
		event.setEventData('hexTileId', hexTileId);

		// Tags
		event.tags = ['improvement', 'economic', 'development'];

		// Make known to nation
		event.makeKnownTo(nation.id);

		return event;
	}

	/**
	 * Create a Great Person born event
	 */
	static greatPersonBorn(
		nation: Nation,
		greatPersonId: string,
		greatPersonName: string,
		greatPersonType: string,
		cityId: string | undefined,
		year: number,
		turnNumber: number
	): HistoricalEvent {
		const event = new HistoricalEvent();
		event.eventType = HistoricalEventType.Other; // We'll add GreatPersonBorn to enum later
		event.significance = EventSignificance.Major;
		event.category = 'cultural';
		event.year = year;
		event.turnNumber = turnNumber;

		// Participants
		event.addParticipant('nation', nation.id, nation.name, 'primary');
		event.addParticipant('great_person', greatPersonId, greatPersonName, 'primary');

		// Names and descriptions
		event.name = `${greatPersonName} born in ${nation.name}`;
		event.description = `The ${greatPersonType} ${greatPersonName} has been born in ${nation.name}.`;
		event.shortSummary = `${greatPersonName} (${greatPersonType}) born`;

		// Event data
		event.setEventData('greatPersonId', greatPersonId);
		event.setEventData('greatPersonName', greatPersonName);
		event.setEventData('greatPersonType', greatPersonType);
		if (cityId) {
			event.setEventData('birthCityId', cityId);
			event.relatedCityIds = [cityId];
		}

		// Tags
		event.tags = ['great_person', 'culture', 'birth'];

		// Make known to nation
		event.makeKnownTo(nation.id);

		return event;
	}

	/**
	 * Create a generic event with custom properties
	 */
	static custom(
		eventType: HistoricalEventType,
		name: string,
		description: string,
		significance: EventSignificance,
		category: HistoricalEvent['category'],
		year: number,
		turnNumber: number,
		participants: Array<{ type: string; id: string; name: string; role: EventParticipant['role'] }>,
		eventData: Record<string, any> = {},
		tags: string[] = []
	): HistoricalEvent {
		const event = new HistoricalEvent();
		event.eventType = eventType;
		event.name = name;
		event.description = description;
		event.significance = significance;
		event.category = category;
		event.year = year;
		event.turnNumber = turnNumber;

		// Add participants
		for (const p of participants) {
			event.addParticipant(p.type, p.id, p.name, p.role);
		}

		// Add event data
		for (const [key, value] of Object.entries(eventData)) {
			event.setEventData(key, value);
		}

		// Add tags
		event.tags = tags;

		return event;
	}
}
