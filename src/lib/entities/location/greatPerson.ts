/**
 * GreatPerson - Represents exceptional individuals that provide powerful one-time bonuses
 *
 * Inspired by Civ 5's Great People system.
 *
 * Types of Great People:
 * - Great Scientist: Discover technology or build Academy (+5 Science)
 * - Great Engineer: Rush production or build Manufactory (+4 Production)
 * - Great Merchant: Conduct trade mission or build Customs House (+4 Gold)
 * - Great Artist: Start Golden Age or build Landmark (+6 Culture)
 * - Great General: Citadel improvement or provide combat bonus
 * - Great Prophet: Found/enhance religion or build Holy Site
 * - Great Admiral: Naval combat bonus or repair ships
 */

/**
 * Types of Great People
 */
export enum GreatPersonType {
	Scientist = 'Great Scientist',
	Engineer = 'Great Engineer',
	Merchant = 'Great Merchant',
	Artist = 'Great Artist',
	General = 'Great General',
	Prophet = 'Great Prophet',
	Admiral = 'Great Admiral'
}

/**
 * Special abilities that Great People can perform
 */
export enum GreatPersonAbility {
	// Great Scientist
	DiscoverTechnology = 'discover_technology', // Free tech
	BuildAcademy = 'build_academy', // +5 Science tile improvement

	// Great Engineer
	RushProduction = 'rush_production', // Complete production in city
	BuildManufactory = 'build_manufactory', // +4 Production tile improvement

	// Great Merchant
	TradeMission = 'trade_mission', // Large gold bonus + influence
	BuildCustomsHouse = 'build_customs_house', // +4 Gold tile improvement

	// Great Artist
	StartGoldenAge = 'start_golden_age', // 8 turns of Golden Age
	BuildLandmark = 'build_landmark', // +6 Culture tile improvement

	// Great General
	BuildCitadel = 'build_citadel', // Defensive improvement + culture bomb
	ProvideCombatBonus = 'provide_combat_bonus', // Passive: +15% strength to nearby units

	// Great Prophet
	FoundReligion = 'found_religion', // Create a new religion
	EnhanceReligion = 'enhance_religion', // Add beliefs to religion
	SpreadReligion = 'spread_religion', // Convert city
	BuildHolySite = 'build_holy_site', // +6 Faith tile improvement

	// Great Admiral
	RepairFleet = 'repair_fleet', // Heal nearby naval units
	ProvideNavalBonus = 'provide_naval_bonus' // Passive: +15% strength to nearby naval units
}

/**
 * Result of using a Great Person's ability
 */
export interface GreatPersonAbilityResult {
	success: boolean;
	ability: GreatPersonAbility;
	consumed: boolean; // Was the Great Person consumed?
	effectDescription: string;
	value?: number; // Numeric value of effect (science, gold, production, etc.)
}

/**
 * GreatPerson entity
 */
export class GreatPerson {
	// ID
	id: string;

	// Basic info
	type: GreatPersonType;
	name: string; // Specific name (e.g., "Albert Einstein", "Leonardo da Vinci")

	// Owner
	ownerId: string; // Nation ID
	ownerName: string;

	// Location
	currentCityId?: string; // City where Great Person is located
	currentHexId?: string; // Hex tile location (if traveling)

	// State
	isUsed: boolean = false; // Has this Great Person been consumed?
	turnCreated: number;

	// Movement (for Great Generals and Admirals that can move)
	movement: number = 2;
	movementRemaining: number = 2;

	// Abilities
	availableAbilities: GreatPersonAbility[] = [];

	// Stats (for Great Generals/Admirals that provide combat bonuses)
	combatBonusRange: number = 2; // Tiles within this range get bonus
	combatBonusStrength: number = 15; // +15% combat strength

	constructor(
		id: string,
		type: GreatPersonType,
		ownerId: string,
		ownerName: string,
		turnCreated: number,
		name?: string
	) {
		this.id = id;
		this.type = type;
		this.ownerId = ownerId;
		this.ownerName = ownerName;
		this.turnCreated = turnCreated;
		this.name = name || this.generateDefaultName();

		// Set available abilities based on type
		this.availableAbilities = this.getAbilitiesForType(type);
	}

	/**
	 * Generate a default placeholder name
	 * In production, call setNameByCulture() after creation to set proper name
	 */
	private generateDefaultName(): string {
		// Placeholder - should be replaced by calling setNameByCulture()
		return `Great ${this.type.replace('Great ', '')} ${this.id.slice(-4)}`;
	}

	/**
	 * Set name based on nation's cultural identity using the name generation system
	 *
	 * This generates culturally appropriate names based on the nation's culture:
	 * - Celtic names for Celtic nations (e.g., "Brennus Swiftblade")
	 * - Germanic names for Germanic nations (e.g., "Aldric Ironforge")
	 * - Roman names for Roman nations (e.g., "Marcus Aurelius")
	 * etc.
	 *
	 * @param culturalIdentity The nation's cultural identity (from nation.culturalIdentity)
	 * @param gender Gender for name generation ('Male' or 'Female')
	 *
	 * Example usage:
	 * ```typescript
	 * import { getCultureName } from '$lib/tables/nameTables/nameGenerator';
	 *
	 * const greatPerson = new GreatPerson('gp-123', GreatPersonType.Scientist, 'nation-1', 'Rome', 500);
	 * greatPerson.setNameByCulture('roman', 'Male'); // Uses getCultureName internally
	 * // Result: name = "Marcus Scientia" (roman name)
	 * ```
	 */
	setNameByCulture(culturalIdentity: string, gender: 'Male' | 'Female' = 'Male'): void {
		// Import will happen at runtime in the SimulationEngine
		// For now, this is a placeholder that will be filled in when wired up
		// The actual implementation would be:
		// import { getCultureName } from '$lib/tables/nameTables/nameGenerator';
		// this.name = getCultureName(culturalIdentity, gender);

		// Temporary placeholder until we wire this up with the simulation engine
		this.name = `${culturalIdentity.charAt(0).toUpperCase() + culturalIdentity.slice(1)} ${this.type.replace('Great ', '')}`;
	}

	/**
	 * Get available abilities for a Great Person type
	 */
	private getAbilitiesForType(type: GreatPersonType): GreatPersonAbility[] {
		switch (type) {
			case GreatPersonType.Scientist:
				return [GreatPersonAbility.DiscoverTechnology, GreatPersonAbility.BuildAcademy];

			case GreatPersonType.Engineer:
				return [GreatPersonAbility.RushProduction, GreatPersonAbility.BuildManufactory];

			case GreatPersonType.Merchant:
				return [GreatPersonAbility.TradeMission, GreatPersonAbility.BuildCustomsHouse];

			case GreatPersonType.Artist:
				return [GreatPersonAbility.StartGoldenAge, GreatPersonAbility.BuildLandmark];

			case GreatPersonType.General:
				return [GreatPersonAbility.BuildCitadel, GreatPersonAbility.ProvideCombatBonus];

			case GreatPersonType.Prophet:
				return [
					GreatPersonAbility.FoundReligion,
					GreatPersonAbility.EnhanceReligion,
					GreatPersonAbility.SpreadReligion,
					GreatPersonAbility.BuildHolySite
				];

			case GreatPersonType.Admiral:
				return [GreatPersonAbility.RepairFleet, GreatPersonAbility.ProvideNavalBonus];

			default:
				return [];
		}
	}

	/**
	 * Use a Great Person ability
	 * @param ability Which ability to use
	 * @param context Additional context (cityId, hexId, etc.)
	 */
	useAbility(ability: GreatPersonAbility, context?: any): GreatPersonAbilityResult {
		// Check if ability is available
		if (!this.availableAbilities.includes(ability)) {
			return {
				success: false,
				ability,
				consumed: false,
				effectDescription: 'This Great Person does not have this ability'
			};
		}

		// Check if already used
		if (this.isUsed) {
			return {
				success: false,
				ability,
				consumed: false,
				effectDescription: 'This Great Person has already been used'
			};
		}

		// Execute ability (simplified - actual implementation would interact with game state)
		const result = this.executeAbility(ability, context);

		// Mark as used if consumed
		if (result.consumed) {
			this.isUsed = true;
		}

		return result;
	}

	/**
	 * Execute a specific ability (simplified implementation)
	 */
	private executeAbility(ability: GreatPersonAbility, context?: any): GreatPersonAbilityResult {
		switch (ability) {
			case GreatPersonAbility.DiscoverTechnology:
				// Grant free tech worth last 8 turns of science
				return {
					success: true,
					ability,
					consumed: true,
					effectDescription: 'Discovered a new technology!',
					value: context?.sciencePerTurn ? context.sciencePerTurn * 8 : 0
				};

			case GreatPersonAbility.BuildAcademy:
				return {
					success: true,
					ability,
					consumed: true,
					effectDescription: 'Built an Academy (+5 Science)',
					value: 5
				};

			case GreatPersonAbility.RushProduction:
				// Complete production worth last 8 turns of production
				return {
					success: true,
					ability,
					consumed: true,
					effectDescription: 'Rushed production in city!',
					value: context?.productionPerTurn ? context.productionPerTurn * 8 : 0
				};

			case GreatPersonAbility.BuildManufactory:
				return {
					success: true,
					ability,
					consumed: true,
					effectDescription: 'Built a Manufactory (+4 Production)',
					value: 4
				};

			case GreatPersonAbility.TradeMission:
				// Generate gold based on era and trade routes
				const goldValue = context?.era ? (context.era + 1) * 350 : 500;
				return {
					success: true,
					ability,
					consumed: true,
					effectDescription: 'Conducted a trade mission!',
					value: goldValue
				};

			case GreatPersonAbility.BuildCustomsHouse:
				return {
					success: true,
					ability,
					consumed: true,
					effectDescription: 'Built a Customs House (+4 Gold)',
					value: 4
				};

			case GreatPersonAbility.StartGoldenAge:
				// Start 8-turn golden age
				return {
					success: true,
					ability,
					consumed: true,
					effectDescription: 'Started a Golden Age (8 turns)!',
					value: 8
				};

			case GreatPersonAbility.BuildLandmark:
				return {
					success: true,
					ability,
					consumed: true,
					effectDescription: 'Built a Landmark (+6 Culture)',
					value: 6
				};

			case GreatPersonAbility.BuildCitadel:
				return {
					success: true,
					ability,
					consumed: true,
					effectDescription: 'Built a Citadel (Defense +100%, Culture Bomb)',
					value: 100
				};

			case GreatPersonAbility.ProvideCombatBonus:
				// Passive ability - not consumed
				return {
					success: true,
					ability,
					consumed: false,
					effectDescription: `Provides +${this.combatBonusStrength}% combat strength to nearby units`,
					value: this.combatBonusStrength
				};

			case GreatPersonAbility.FoundReligion:
				return {
					success: true,
					ability,
					consumed: true,
					effectDescription: 'Founded a new religion!',
					value: 1
				};

			case GreatPersonAbility.EnhanceReligion:
				return {
					success: true,
					ability,
					consumed: true,
					effectDescription: 'Enhanced religion with new beliefs!',
					value: 1
				};

			case GreatPersonAbility.SpreadReligion:
				return {
					success: true,
					ability,
					consumed: false, // Can spread multiple times
					effectDescription: 'Spread religion to city',
					value: 1
				};

			case GreatPersonAbility.BuildHolySite:
				return {
					success: true,
					ability,
					consumed: true,
					effectDescription: 'Built a Holy Site (+6 Faith)',
					value: 6
				};

			case GreatPersonAbility.RepairFleet:
				return {
					success: true,
					ability,
					consumed: true,
					effectDescription: 'Repaired all nearby naval units',
					value: 100 // % health restored
				};

			case GreatPersonAbility.ProvideNavalBonus:
				// Passive ability - not consumed
				return {
					success: true,
					ability,
					consumed: false,
					effectDescription: `Provides +${this.combatBonusStrength}% combat strength to nearby naval units`,
					value: this.combatBonusStrength
				};

			default:
				return {
					success: false,
					ability,
					consumed: false,
					effectDescription: 'Unknown ability'
				};
		}
	}

	/**
	 * Check if can use ability
	 */
	canUseAbility(ability: GreatPersonAbility): boolean {
		return !this.isUsed && this.availableAbilities.includes(ability);
	}

	/**
	 * Move Great Person (for Generals and Admirals)
	 */
	move(hexId: string, cost: number = 1): boolean {
		if (cost > this.movementRemaining) {
			return false;
		}

		this.currentHexId = hexId;
		this.movementRemaining -= cost;
		return true;
	}

	/**
	 * Reset movement for new turn
	 */
	resetMovement(): void {
		this.movementRemaining = this.movement;
	}

	/**
	 * Get description of Great Person
	 */
	getDescription(): string {
		const abilities = this.availableAbilities
			.map(a => this.getAbilityName(a))
			.join(' or ');

		return `${this.name} (${this.type}): Can ${abilities}`;
	}

	/**
	 * Get human-readable ability name
	 */
	private getAbilityName(ability: GreatPersonAbility): string {
		const names: Record<GreatPersonAbility, string> = {
			[GreatPersonAbility.DiscoverTechnology]: 'discover technology',
			[GreatPersonAbility.BuildAcademy]: 'build Academy',
			[GreatPersonAbility.RushProduction]: 'rush production',
			[GreatPersonAbility.BuildManufactory]: 'build Manufactory',
			[GreatPersonAbility.TradeMission]: 'conduct trade mission',
			[GreatPersonAbility.BuildCustomsHouse]: 'build Customs House',
			[GreatPersonAbility.StartGoldenAge]: 'start Golden Age',
			[GreatPersonAbility.BuildLandmark]: 'build Landmark',
			[GreatPersonAbility.BuildCitadel]: 'build Citadel',
			[GreatPersonAbility.ProvideCombatBonus]: 'provide combat bonus',
			[GreatPersonAbility.FoundReligion]: 'found religion',
			[GreatPersonAbility.EnhanceReligion]: 'enhance religion',
			[GreatPersonAbility.SpreadReligion]: 'spread religion',
			[GreatPersonAbility.BuildHolySite]: 'build Holy Site',
			[GreatPersonAbility.RepairFleet]: 'repair fleet',
			[GreatPersonAbility.ProvideNavalBonus]: 'provide naval bonus'
		};

		return names[ability] || ability;
	}

	/**
	 * Clone this Great Person (for state snapshots)
	 */
	clone(): GreatPerson {
		const cloned = new GreatPerson(
			this.id,
			this.type,
			this.ownerId,
			this.ownerName,
			this.turnCreated,
			this.name
		);
		cloned.currentCityId = this.currentCityId;
		cloned.currentHexId = this.currentHexId;
		cloned.isUsed = this.isUsed;
		cloned.movement = this.movement;
		cloned.movementRemaining = this.movementRemaining;
		cloned.availableAbilities = [...this.availableAbilities];
		cloned.combatBonusRange = this.combatBonusRange;
		cloned.combatBonusStrength = this.combatBonusStrength;
		return cloned;
	}

	/**
	 * Serialize to JSON
	 */
	toJSON(): any {
		return {
			id: this.id,
			type: this.type,
			name: this.name,
			ownerId: this.ownerId,
			ownerName: this.ownerName,
			currentCityId: this.currentCityId,
			currentHexId: this.currentHexId,
			isUsed: this.isUsed,
			turnCreated: this.turnCreated,
			movement: this.movement,
			movementRemaining: this.movementRemaining,
			availableAbilities: this.availableAbilities,
			combatBonusRange: this.combatBonusRange,
			combatBonusStrength: this.combatBonusStrength
		};
	}

	/**
	 * Restore from JSON
	 */
	static fromJSON(data: any): GreatPerson {
		const greatPerson = new GreatPerson(
			data.id,
			data.type ?? GreatPersonType.Scientist,
			data.ownerId ?? '',
			data.ownerName ?? '',
			data.turnCreated ?? 0,
			data.name
		);
		greatPerson.currentCityId = data.currentCityId;
		greatPerson.currentHexId = data.currentHexId;
		greatPerson.isUsed = data.isUsed ?? false;
		greatPerson.movement = data.movement ?? 2;
		greatPerson.movementRemaining = data.movementRemaining ?? 2;
		greatPerson.availableAbilities = data.availableAbilities ?? greatPerson.availableAbilities;
		greatPerson.combatBonusRange = data.combatBonusRange ?? 2;
		greatPerson.combatBonusStrength = data.combatBonusStrength ?? 15;
		return greatPerson;
	}
}
