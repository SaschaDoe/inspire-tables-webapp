import { Entity } from '../base/entity';

export type SphereConnectionType =
	| 'aligned' // Friendly/cooperative connection
	| 'conflicting' // Opposed/hostile connection
	| 'adjacent' // Simply next to each other
	| 'distant' // Far apart but connected
	| 'merged' // Partially overlapping
	| 'portal' // Connected by magical gateway
	| 'natural' // Natural flow between spheres
	| 'divine'; // Divine/supernatural connection

export type TravelMethod =
	| 'physical' // Physical travel
	| 'astral' // Astral projection
	| 'soul' // Only souls can travel
	| 'death' // Travel upon death
	| 'ritual' // Requires specific ritual
	| 'portal' // Through portal/gate
	| 'dream' // Through dreams
	| 'teleportation'; // Magical teleportation

export type AccessCondition =
	| 'none' // No special conditions
	| 'death' // Must be dead
	| 'alive' // Must be alive
	| 'good-alignment' // Must be good aligned
	| 'evil-alignment' // Must be evil aligned
	| 'neutral-alignment' // Must be neutral aligned
	| 'specific-ritual' // Requires specific ritual
	| 'divine-permission' // Requires permission from deity
	| 'specific-location'; // Must be at specific location

export class SphereConnection extends Entity {
	type = 'sphereConnection' as const;
	name = '';
	description = '';

	/** ID of the sphere this connection leads from */
	fromSphereId = '';
	/** Name of the from sphere (for display) */
	fromSphereName = '';

	/** ID of the sphere this connection leads to */
	toSphereId = '';
	/** Name of the to sphere (for display) */
	toSphereName = '';

	/** Type of connection between spheres */
	connectionType: SphereConnectionType = 'natural';

	/** Method of travel through this connection */
	travelMethod: TravelMethod = 'physical';

	/** Is this a one-way connection? */
	isOneWay = false;

	/** Conditions that must be met to use this connection */
	accessConditions: AccessCondition[] = [];

	/** Rules or restrictions while traveling (e.g., "No breathing", "Time flows differently") */
	travelRules: string[] = [];

	/** Behavioral requirements (e.g., "Must maintain silence", "Cannot look back") */
	behavioralRequirements: string[] = [];

	/** Problems or dangers during journey (e.g., "Exposure to void", "Soul fragmentation risk") */
	journeyProblems: string[] = [];

	/** Is there a single specific entry/exit point? */
	hasSingleAccessPoint = false;

	/** Description of the access point if it exists */
	accessPointDescription = '';

	/** How common/known is this connection? */
	commonality: 'common' | 'uncommon' | 'rare' | 'legendary' | 'secret' = 'common';

	/** Travel duration/time description */
	travelDuration = '';

	/** Special requirements or items needed */
	requirements: string[] = [];

	/** What happens if requirements aren't met */
	consequencesOfViolation = '';
}
