export enum EntityType {
	Campaign = 'campaign',
	Adventure = 'adventure',
	Character = 'character',
	Location = 'location',
	Artifact = 'artifact',
	Plot = 'plot',
	Faction = 'faction',
	Session = 'session',
	Event = 'event',
	Monster = 'monster'
}

export interface EntityMetadata {
	createdAt: Date;
	updatedAt: Date;
	createdBy?: string;
}

export interface Relationship {
	targetId: string;
	type: 'parent' | 'child' | 'reference';
	label?: string; // e.g., "appears in", "owns", "located in"
}

export interface Entity {
	id: string;
	type: EntityType;
	name: string;
	description: string;
	tags: string[];
	parentId?: string; // Parent entity
	campaignId?: string; // Top-level campaign
	metadata: EntityMetadata;
	relationships: Relationship[];
	customFields: Record<string, any>;
}

// Specific entity type interfaces
export interface CampaignEntity extends Entity {
	type: EntityType.Campaign;
	narrativeMediumType: string;
	genreMix: any; // We'll use the existing GenreMix type
	creationLog: string[];
}

export interface AdventureEntity extends Entity {
	type: EntityType.Adventure;
	status: 'planned' | 'in-progress' | 'completed';
	plotStructure?: {
		beginning?: string;
		middle?: string;
		end?: string;
	};
	sessions: string[]; // Session entity IDs
}

export interface CharacterEntity extends Entity {
	type: EntityType.Character;
	race?: string;
	profession?: string;
	gender?: string;
	alignment?: string;
	motivation?: string;
	backstory?: string;
	attributes?: Record<string, any>;
	inventory?: string[]; // Artifact entity IDs
}

export interface LocationEntity extends Entity {
	type: EntityType.Location;
	locationType: 'continent' | 'region' | 'city' | 'building' | 'room' | 'other';
	subLocations: string[]; // Location entity IDs
	npcs: string[]; // Character entity IDs
}

export interface ArtifactEntity extends Entity {
	type: EntityType.Artifact;
	artifactType: 'weapon' | 'armor' | 'jewelry' | 'magical' | 'other';
	quality?: string;
	rarity?: string;
	ownerId?: string; // Character entity ID
	enchantments?: string[];
}
