import { Creator } from '../base/creator';
import {
	SphereConnection,
	type SphereConnectionType,
	type TravelMethod,
	type AccessCondition
} from './sphereConnection';
import { EntityType } from '$lib/types/entity';
import { SphereConnectionNameTable } from '$lib/tables/celestialTables/sphereConnection/sphereConnectionNameTable';

export class SphereConnectionCreator extends Creator<SphereConnection> {
	private fromSphereId = '';
	private fromSphereName = '';
	private toSphereId = '';
	private toSphereName = '';
	private forceOneWay: boolean | null = null;


	withSpheres(
		fromSphereId: string,
		fromSphereName: string,
		toSphereId: string,
		toSphereName: string
	): this {
		this.fromSphereId = fromSphereId;
		this.fromSphereName = fromSphereName;
		this.toSphereId = toSphereId;
		this.toSphereName = toSphereName;
		this.forceOneWay = null; // Reset for new connection
		return this;
	}

	/**
	 * Force this connection to be one-way or bidirectional
	 * If not called, the creator will randomly decide
	 */
	withDirectionality(isOneWay: boolean): this {
		this.forceOneWay = isOneWay;
		return this;
	}

	create(): SphereConnection {
		const connection = new SphereConnection();
		this.setParentReference(connection);
		connection.id = crypto.randomUUID();
		connection.type = EntityType.SphereConnection;
		connection.fromSphereId = this.fromSphereId;
		connection.fromSphereName = this.fromSphereName;
		connection.toSphereId = this.toSphereId;
		connection.toSphereName = this.toSphereName;

		// Generate creative connection name
		connection.name = new SphereConnectionNameTable().roleWithCascade(this.dice).text;

		// Random connection type
		const connectionTypes: SphereConnectionType[] = [
			'aligned',
			'conflicting',
			'adjacent',
			'distant',
			'merged',
			'portal',
			'natural',
			'divine'
		];
		connection.connectionType =
			connectionTypes[this.dice.rollInterval(0, connectionTypes.length - 1)];

		// Random travel method
		const travelMethods: TravelMethod[] = [
			'physical',
			'astral',
			'soul',
			'death',
			'ritual',
			'portal',
			'dream',
			'teleportation'
		];
		connection.travelMethod = travelMethods[this.dice.rollInterval(0, travelMethods.length - 1)];

		// One-way connection? Use forced value or random (30% chance)
		connection.isOneWay = this.forceOneWay !== null
			? this.forceOneWay
			: this.dice.rollInterval(1, 100) <= 30;

		// Generate access conditions based on travel method
		connection.accessConditions = this.generateAccessConditions(connection.travelMethod);

		// Generate travel rules
		connection.travelRules = this.generateTravelRules(connection.travelMethod);

		// Generate behavioral requirements
		connection.behavioralRequirements = this.generateBehavioralRequirements();

		// Generate journey problems
		connection.journeyProblems = this.generateJourneyProblems(connection.travelMethod);

		// Single access point? (40% chance)
		connection.hasSingleAccessPoint = this.dice.rollInterval(1, 100) <= 40;
		if (connection.hasSingleAccessPoint) {
			connection.accessPointDescription = this.generateAccessPointDescription();
		}

		// Commonality
		const commonalities: Array<'common' | 'uncommon' | 'rare' | 'legendary' | 'secret'> = [
			'common',
			'uncommon',
			'rare',
			'legendary',
			'secret'
		];
		connection.commonality = commonalities[this.dice.rollInterval(0, commonalities.length - 1)];

		// Travel duration
		connection.travelDuration = this.generateTravelDuration();

		// Requirements
		connection.requirements = this.generateRequirements(connection.travelMethod);

		// Consequences
		connection.consequencesOfViolation = this.generateConsequences();

		// Generate description
		connection.description = this.generateDescription(connection);

		connection.metadata = {
			createdAt: new Date(),
			updatedAt: new Date()
		};

		return connection;
	}

	private generateAccessConditions(travelMethod: TravelMethod): AccessCondition[] {
		const conditions: AccessCondition[] = [];

		switch (travelMethod) {
			case 'death':
				conditions.push('death');
				// 50% chance to add alignment requirement
				if (this.dice.rollInterval(1, 2) === 1) {
					const alignments: AccessCondition[] = [
						'good-alignment',
						'evil-alignment',
						'neutral-alignment'
					];
					conditions.push(alignments[this.dice.rollInterval(0, alignments.length - 1)]);
				}
				break;
			case 'soul':
			case 'astral':
				// Either dead or requires ritual
				if (this.dice.rollInterval(1, 2) === 1) {
					conditions.push('death');
				} else {
					conditions.push('specific-ritual');
				}
				break;
			case 'ritual':
				conditions.push('specific-ritual');
				break;
			case 'portal':
				if (this.dice.rollInterval(1, 3) === 1) {
					conditions.push('specific-location');
				}
				break;
			case 'dream':
				conditions.push('alive');
				break;
			default:
				// 20% chance for no special conditions
				if (this.dice.rollInterval(1, 100) > 20) {
					const possibleConditions: AccessCondition[] = [
						'alive',
						'specific-ritual',
						'divine-permission',
						'specific-location'
					];
					conditions.push(
						possibleConditions[this.dice.rollInterval(0, possibleConditions.length - 1)]
					);
				} else {
					conditions.push('none');
				}
		}

		return conditions;
	}

	private generateTravelRules(travelMethod: TravelMethod): string[] {
		const rules: string[] = [];
		const possibleRules = [
			'No breathing required',
			'Time flows differently',
			'Memories may be altered',
			'Physical form becomes ethereal',
			'Cannot carry physical objects',
			'Must maintain concentration',
			'Body ages during travel',
			'Experience temporal displacement',
			'Gravity does not apply',
			'Light and darkness behave strangely'
		];

		// Add 1-3 rules
		const ruleCount = this.dice.rollInterval(1, 3);
		for (let i = 0; i < ruleCount; i++) {
			const rule = possibleRules[this.dice.rollInterval(0, possibleRules.length - 1)];
			if (!rules.includes(rule)) {
				rules.push(rule);
			}
		}

		return rules;
	}

	private generateBehavioralRequirements(): string[] {
		const requirements: string[] = [];
		const possible = [
			'Maintain absolute silence',
			'Do not look behind you',
			'Keep your eyes closed',
			'Recite protective prayers continuously',
			'Hold a specific symbol or token',
			'Move only when the wind blows',
			'Follow the light',
			'Do not speak names of the living',
			'Walk backwards',
			'Breathe in specific rhythm'
		];

		// 50% chance to have behavioral requirements
		if (this.dice.rollInterval(1, 2) === 1) {
			const count = this.dice.rollInterval(1, 2);
			for (let i = 0; i < count; i++) {
				const req = possible[this.dice.rollInterval(0, possible.length - 1)];
				if (!requirements.includes(req)) {
					requirements.push(req);
				}
			}
		}

		return requirements;
	}

	private generateJourneyProblems(travelMethod: TravelMethod): string[] {
		const problems: string[] = [];
		const possibleProblems = [
			'Exposure to void energy',
			'Risk of soul fragmentation',
			'Temporal disorientation',
			'Memory loss',
			'Physical exhaustion',
			'Madness from witnessing the void',
			'Risk of getting lost between spheres',
			'Encounters with void entities',
			'Energy drain',
			'Risk of permanent transformation'
		];

		// Add 1-3 problems
		const problemCount = this.dice.rollInterval(1, 3);
		for (let i = 0; i < problemCount; i++) {
			const problem = possibleProblems[this.dice.rollInterval(0, possibleProblems.length - 1)];
			if (!problems.includes(problem)) {
				problems.push(problem);
			}
		}

		return problems;
	}

	private generateAccessPointDescription(): string {
		const locations = [
			'A shimmering portal in the highest mountain peak',
			'An ancient stone circle during specific celestial alignments',
			'The bottom of the deepest ocean trench',
			'A sacred temple at the world\'s edge',
			'The exact center of the sphere',
			'A naturally occurring dimensional tear',
			'The throne room of the sphere\'s ruler',
			'A forgotten underground chamber',
			'The peak of a floating island',
			'A mystical tree older than time'
		];

		return locations[this.dice.rollInterval(0, locations.length - 1)];
	}

	private generateTravelDuration(): string {
		const durations = [
			'Instantaneous',
			'A few heartbeats',
			'Several minutes',
			'Hours that feel like moments',
			'Days that pass like years',
			'An eternity compressed into seconds',
			'Variable, depends on traveler\'s will',
			'Until the next dawn',
			'One complete breath cycle',
			'The time it takes for a prayer'
		];

		return durations[this.dice.rollInterval(0, durations.length - 1)];
	}

	private generateRequirements(travelMethod: TravelMethod): string[] {
		const requirements: string[] = [];
		const possible = [
			'Sacred symbol or holy relic',
			'Blood of a celestial being',
			'Permission from a deity',
			'Completed specific ritual',
			'Pure intentions',
			'Specific magical key',
			'Guidance from a psychopomp',
			'Sacrifice of something valuable',
			'Knowledge of the true name of the destination',
			'A guide who has made the journey before'
		];

		// Add 0-2 requirements
		const count = this.dice.rollInterval(0, 2);
		for (let i = 0; i < count; i++) {
			const req = possible[this.dice.rollInterval(0, possible.length - 1)];
			if (!requirements.includes(req)) {
				requirements.push(req);
			}
		}

		return requirements;
	}

	private generateConsequences(): string {
		const consequences = [
			'Trapped in the void between spheres',
			'Permanent loss of physical form',
			'Banishment from both spheres',
			'Corruption of the soul',
			'Loss of all memories',
			'Transformation into a void entity',
			'Death with no possibility of resurrection',
			'Splintering across multiple realities',
			'Eternal wandering in the between-space',
			'Bound to serve the sphere\'s guardian'
		];

		return consequences[this.dice.rollInterval(0, consequences.length - 1)];
	}

	private generateDescription(connection: SphereConnection): string {
		let desc = `A ${connection.connectionType} connection between ${connection.fromSphereName} and ${connection.toSphereName}. `;

		desc += `Travel is accomplished through ${connection.travelMethod}. `;

		if (connection.isOneWay) {
			desc += 'This is a one-way journey; there is no return. ';
		}

		if (connection.accessConditions.length > 0 && connection.accessConditions[0] !== 'none') {
			desc += `Access requires: ${connection.accessConditions.join(', ')}. `;
		}

		if (connection.hasSingleAccessPoint) {
			desc += `The only access point is: ${connection.accessPointDescription}. `;
		}

		desc += `The journey typically takes ${connection.travelDuration.toLowerCase()}.`;

		return desc;
	}
}
