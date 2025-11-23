import { Entity } from '../base/entity';

/**
 * Unit types (Civ 5 inspired)
 */
export enum UnitType {
	// Ancient Era
	Warrior = 'warrior',
	Scout = 'scout',
	Settler = 'settler',
	Worker = 'worker',
	Spearman = 'spearman',
	Archer = 'archer',
	Chariot = 'chariot',
	Galley = 'galley',

	// Classical Era
	Swordsman = 'swordsman',
	Horseman = 'horseman',
	Catapult = 'catapult',
	Trireme = 'trireme',
	Composite_Bowman = 'compositeBowman',

	// Medieval Era
	Longswordsman = 'longswordsman',
	Pikeman = 'pikeman',
	Knight = 'knight',
	Crossbowman = 'crossbowman',
	Trebuchet = 'trebuchet',
	Caravel = 'caravel',

	// Renaissance Era
	Musketman = 'musketman',
	Lancer = 'lancer',
	Cannon = 'cannon',
	Frigate = 'frigate',

	// Industrial Era
	Rifleman = 'rifleman',
	Cavalry = 'cavalry',
	Artillery = 'artillery',
	Ironclad = 'ironclad',

	// Modern Era
	Infantry = 'infantry',
	Tank = 'tank',
	AntiTank = 'antiTank',
	Battleship = 'battleship',
	Destroyer = 'destroyer',
	Submarine = 'submarine',
	Fighter = 'fighter',
	Bomber = 'bomber',

	// Atomic Era
	Mechanized_Infantry = 'mechanizedInfantry',
	Modern_Armor = 'modernArmor',
	Helicopter = 'helicopter',
	Jet_Fighter = 'jetFighter',
	Stealth_Bomber = 'stealthBomber',
	Nuclear_Missile = 'nuclearMissile'
}

/**
 * Unit class (Melee, Ranged, Siege, etc.)
 */
export enum UnitClass {
	Melee = 'melee',
	Ranged = 'ranged',
	Mounted = 'mounted',
	Siege = 'siege',
	Naval = 'naval',
	Air = 'air',
	Support = 'support', // Settler, Worker
	Special = 'special'
}

/**
 * Unit promotion/ability
 */
export interface UnitPromotion {
	id: string;
	name: string;
	description: string;
	effect: string; // e.g., "+15% combat strength"
}

/**
 * Movement plan for AI
 */
export interface MovementPlan {
	targetHexId: string;
	path: string[]; // Array of hex IDs to traverse
	purpose: 'attack' | 'defend' | 'explore' | 'move' | 'settle';
}

/**
 * Unit - Military and civilian units for the simulation
 *
 * Units are the mobile entities that:
 * - Explore the map
 * - Fight battles
 * - Found cities (settlers)
 * - Build improvements (workers)
 * - Defend territory
 */
export class Unit extends Entity {
	// Basic properties
	name = '';
	unitType: UnitType = UnitType.Warrior;
	unitClass: UnitClass = UnitClass.Melee;

	// Ownership
	ownerNationId = ''; // ID of the nation that owns this unit
	createdYear = 0; // Year unit was created
	createdInCityId?: string; // ID of the city that produced this unit

	// Location and movement
	currentHexTileId = ''; // ID of the RegionalHexTile where unit is located
	parentRegionalMapId = ''; // ID of the RegionalMap this unit is in
	coordinates = { x: 0, y: 0 }; // Coordinates on the regional map

	movementPoints = 2; // Current movement points
	maxMovementPoints = 2; // Maximum movement points per turn
	movementType: 'land' | 'sea' | 'air' = 'land';

	// Combat stats
	combatStrength = 10; // Melee combat strength
	rangedStrength = 0; // Ranged attack strength (0 if no ranged attack)
	rangedRange = 0; // Range of ranged attack in tiles
	defensiveStrength = 10; // Defensive combat strength

	hitPoints = 100; // Current HP
	maxHitPoints = 100;
	isWounded = false; // Whether unit has less than full HP

	// Experience and promotions
	experience = 0; // XP gained from combat
	level = 1; // Level based on experience
	promotions: UnitPromotion[] = []; // Unlocked promotions
	availablePromotions: string[] = []; // Promotion IDs available to choose

	// Status
	isActive = true; // Whether unit can act this turn
	hasMoved = false; // Whether unit has moved this turn
	hasAttacked = false; // Whether unit has attacked this turn
	isEmbarkед = false; // Whether unit is on a ship (land unit crossing water)
	isFortified = false; // Whether unit is fortified (defensive bonus)
	fortifyTurns = 0; // Turns spent fortified (stacks defensive bonus)
	isGarrisoned = false; // Whether unit is in a city
	garrisonedCityId?: string; // ID of city if garrisoned

	// Army/fleet grouping
	armyId?: string; // ID of Army entity this unit belongs to
	fleetId?: string; // ID of Fleet entity this unit belongs to

	// AI control
	orders?: MovementPlan; // Current orders from AI
	aiPriority: 'attack' | 'defend' | 'explore' | 'support' = 'defend';

	// Historical tracking
	battlesParticipated: string[] = []; // IDs of battles this unit fought in
	citiesCaptured: string[] = []; // IDs of cities this unit captured
	unitsDefeated: string[] = []; // IDs of units this unit defeated
	hexTilesVisited: string[] = []; // IDs of hexes this unit has visited (for exploration)

	// Maintenance cost
	maintenanceCost = 1; // Gold per turn to maintain this unit

	constructor() {
		super();
		this.initializeUnitStats();
	}

	/**
	 * Initialize stats based on unit type
	 */
	private initializeUnitStats(): void {
		switch (this.unitType) {
			// Ancient Era
			case UnitType.Warrior:
				this.combatStrength = 8;
				this.maxMovementPoints = 2;
				this.unitClass = UnitClass.Melee;
				this.name = 'Warrior';
				break;
			case UnitType.Scout:
				this.combatStrength = 4;
				this.maxMovementPoints = 3;
				this.unitClass = UnitClass.Melee;
				this.name = 'Scout';
				break;
			case UnitType.Settler:
				this.combatStrength = 0;
				this.maxMovementPoints = 2;
				this.unitClass = UnitClass.Support;
				this.name = 'Settler';
				break;
			case UnitType.Worker:
				this.combatStrength = 0;
				this.maxMovementPoints = 2;
				this.unitClass = UnitClass.Support;
				this.name = 'Worker';
				break;
			case UnitType.Spearman:
				this.combatStrength = 11;
				this.maxMovementPoints = 2;
				this.unitClass = UnitClass.Melee;
				this.name = 'Spearman';
				break;
			case UnitType.Archer:
				this.combatStrength = 5;
				this.rangedStrength = 7;
				this.rangedRange = 2;
				this.maxMovementPoints = 2;
				this.unitClass = UnitClass.Ranged;
				this.name = 'Archer';
				break;

			// Classical Era
			case UnitType.Swordsman:
				this.combatStrength = 14;
				this.maxMovementPoints = 2;
				this.unitClass = UnitClass.Melee;
				this.name = 'Swordsman';
				break;
			case UnitType.Horseman:
				this.combatStrength = 12;
				this.maxMovementPoints = 4;
				this.unitClass = UnitClass.Mounted;
				this.name = 'Horseman';
				break;

			// Medieval Era
			case UnitType.Knight:
				this.combatStrength = 20;
				this.maxMovementPoints = 4;
				this.unitClass = UnitClass.Mounted;
				this.name = 'Knight';
				break;
			case UnitType.Crossbowman:
				this.combatStrength = 13;
				this.rangedStrength = 18;
				this.rangedRange = 2;
				this.maxMovementPoints = 2;
				this.unitClass = UnitClass.Ranged;
				this.name = 'Crossbowman';
				break;

			// Add more unit types as needed
			default:
				this.name = this.unitType;
				break;
		}

		this.movementPoints = this.maxMovementPoints;
		this.defensiveStrength = this.combatStrength;
	}

	/**
	 * Move to a hex tile
	 */
	moveTo(hexTileId: string, x: number, y: number, movementCost: number): boolean {
		if (this.movementPoints < movementCost) {
			return false; // Not enough movement
		}

		this.currentHexTileId = hexTileId;
		this.coordinates = { x, y };
		this.movementPoints -= movementCost;
		this.hasMoved = true;

		// Track exploration
		if (!this.hexTilesVisited.includes(hexTileId)) {
			this.hexTilesVisited.push(hexTileId);
		}

		return true;
	}

	/**
	 * Attack another unit or city
	 */
	attack(targetId: string, targetStrength: number): { damage: number; counterDamage: number } {
		// Simplified combat calculation (Civ 5 style)
		const strengthDiff = this.combatStrength - targetStrength;
		const baseDamage = 30;

		// Attacker damage to defender
		const damageMultiplier = Math.pow(Math.E, strengthDiff / 25);
		const damage = Math.floor(baseDamage * damageMultiplier);

		// Counter damage (defender to attacker)
		const counterDamageMultiplier = Math.pow(Math.E, -strengthDiff / 25);
		const counterDamage = Math.floor(baseDamage * counterDamageMultiplier * 0.7); // Attacker takes less damage

		this.hasAttacked = true;
		this.hasMoved = true; // Attacking uses movement

		return { damage, counterDamage };
	}

	/**
	 * Ranged attack
	 */
	rangedAttack(targetId: string, targetStrength: number): number {
		if (this.rangedStrength === 0) {
			return 0; // No ranged attack
		}

		const strengthDiff = this.rangedStrength - targetStrength;
		const baseDamage = 30;
		const damageMultiplier = Math.pow(Math.E, strengthDiff / 25);
		const damage = Math.floor(baseDamage * damageMultiplier);

		this.hasAttacked = true;

		return damage;
	}

	/**
	 * Take damage
	 */
	takeDamage(amount: number): boolean {
		this.hitPoints = Math.max(0, this.hitPoints - amount);
		this.isWounded = this.hitPoints < this.maxHitPoints;

		// Check if unit is destroyed
		return this.hitPoints <= 0;
	}

	/**
	 * Heal
	 */
	heal(amount: number): void {
		this.hitPoints = Math.min(this.maxHitPoints, this.hitPoints + amount);
		this.isWounded = this.hitPoints < this.maxHitPoints;
	}

	/**
	 * Fortify (defensive stance)
	 */
	fortify(): void {
		this.isFortified = true;
		this.fortifyTurns++;
		this.hasMoved = true;

		// Calculate defensive bonus (increases each turn up to +20%)
		const fortifyBonus = Math.min(20, this.fortifyTurns * 5);
		this.defensiveStrength = Math.floor(this.combatStrength * (1 + fortifyBonus / 100));
	}

	/**
	 * Unfortify
	 */
	unfortify(): void {
		this.isFortified = false;
		this.fortifyTurns = 0;
		this.defensiveStrength = this.combatStrength;
	}

	/**
	 * Garrison in a city
	 */
	garrison(cityId: string): void {
		this.isGarrisoned = true;
		this.garrisonedCityId = cityId;
		this.isFortified = true;
	}

	/**
	 * Leave garrison
	 */
	leaveGarrison(): void {
		this.isGarrisoned = false;
		this.garrisonedCityId = undefined;
		this.isFortified = false;
	}

	/**
	 * Gain experience
	 */
	gainExperience(amount: number): boolean {
		this.experience += amount;

		// Check for level up (every 10 XP = 1 level)
		const newLevel = Math.floor(this.experience / 10) + 1;
		if (newLevel > this.level) {
			this.level = newLevel;
			// Could unlock new promotions here
			return true; // Leveled up
		}

		return false;
	}

	/**
	 * Add a promotion
	 */
	addPromotion(promotion: UnitPromotion): void {
		this.promotions.push(promotion);
		// Apply promotion effects here
	}

	/**
	 * Reset turn (restore movement, clear flags)
	 */
	resetTurn(): void {
		this.movementPoints = this.maxMovementPoints;
		this.hasMoved = false;
		this.hasAttacked = false;
		this.isActive = true;

		// Heal if fortified or garrisoned
		if (this.isFortified || this.isGarrisoned) {
			this.heal(10);
		}
	}

	/**
	 * Check if unit can act
	 */
	canAct(): boolean {
		return this.isActive && !this.hasMoved && !this.hasAttacked;
	}

	/**
	 * Check if unit can attack
	 */
	canAttack(): boolean {
		return this.isActive && !this.hasAttacked && this.combatStrength > 0;
	}

	/**
	 * Check if unit can ranged attack
	 */
	canRangedAttack(): boolean {
		return this.isActive && !this.hasAttacked && this.rangedStrength > 0;
	}

	/**
	 * Get unit strength with modifiers
	 */
	getEffectiveStrength(): number {
		let strength = this.combatStrength;

		// HP modifier (wounded units are weaker)
		const hpRatio = this.hitPoints / this.maxHitPoints;
		strength = Math.floor(strength * (0.5 + 0.5 * hpRatio));

		// Fortification bonus
		if (this.isFortified) {
			const fortifyBonus = Math.min(20, this.fortifyTurns * 5);
			strength = Math.floor(strength * (1 + fortifyBonus / 100));
		}

		return strength;
	}

	/**
	 * Get summary for display
	 */
	getSummary(): string {
		const hpStr = `${this.hitPoints}/${this.maxHitPoints} HP`;
		const strengthStr = this.rangedStrength > 0
			? `${this.combatStrength}/${this.rangedStrength} STR`
			: `${this.combatStrength} STR`;
		const statusFlags: string[] = [];

		if (this.isWounded) statusFlags.push('Wounded');
		if (this.isFortified) statusFlags.push('Fortified');
		if (this.isGarrisoned) statusFlags.push('Garrisoned');

		const status = statusFlags.length > 0 ? ` [${statusFlags.join(', ')}]` : '';

		return `${this.name}: ${hpStr}, ${strengthStr}${status}`;
	}
}
