import Dexie, { type Table } from 'dexie';
import type { Entity } from '$lib/types/entity';
import type { Campaign } from '$lib/entities/campaign';
import type { Tab } from '$lib/stores/tabStore';
import type { StoryBoard } from '$lib/types/storyboard';
import type { SoloRpgSession } from '$lib/stores/soloRpgStore.svelte';
import type { StoredApiKey } from '$lib/ai/types';
import { browser } from '$app/environment';

export interface DbEntity extends Entity {
	// Entity already has these fields from the type
	// type: string;
	// campaignId?: string;
	// parentId?: string;
	// metadata: { createdAt: Date, updatedAt: Date }
}

export interface DbMetadata {
	key: string;
	value: any;
}

/**
 * Stored world map tiles data
 * Stored separately from entities to avoid JSON string length limits
 */
export interface DbWorldMapTiles {
	planetId: string; // Primary key - links to planet entity
	tiles: Record<string, unknown>; // DetailedHexTile data keyed by "globalX,globalY"
	updatedAt: Date;
}

export class InspireTablesDatabase extends Dexie {
	// Entity tables
	entities!: Table<DbEntity, string>; // Primary key: id
	campaigns!: Table<Campaign, string>; // Legacy campaigns

	// UI state tables
	tabs!: Table<Tab, string>; // Primary key: id
	storyboards!: Table<StoryBoard, string>; // Primary key: id

	// Solo RPG tables
	soloRpgSessions!: Table<SoloRpgSession, string>; // Primary key: id

	// World map data (stored separately due to size)
	worldMapTiles!: Table<DbWorldMapTiles, string>; // Primary key: planetId

	// Metadata table (for counters, current IDs, etc.)
	metadata!: Table<DbMetadata, string>; // Primary key: key

	// API keys for AI providers
	apiKeys!: Table<StoredApiKey, string>; // Primary key: id

	constructor() {
		super('InspireTablesDB');

		// Version 1: Original schema
		this.version(1).stores({
			entities: 'id, type, campaignId, parentId',
			campaigns: 'id',
			tabs: 'id, entityId',
			storyboards: 'id',
			soloRpgSessions: 'id',
			metadata: 'key'
		});

		// Version 2: Add worldMapTiles table for storing detailed hex tiles
		this.version(2).stores({
			entities: 'id, type, campaignId, parentId',
			campaigns: 'id',
			tabs: 'id, entityId',
			storyboards: 'id',
			soloRpgSessions: 'id',
			metadata: 'key',
			worldMapTiles: 'planetId' // New table for world map detailed tiles
		});

		// Version 3: Add apiKeys table for AI provider API keys
		this.version(3).stores({
			entities: 'id, type, campaignId, parentId',
			campaigns: 'id',
			tabs: 'id, entityId',
			storyboards: 'id',
			soloRpgSessions: 'id',
			metadata: 'key',
			worldMapTiles: 'planetId',
			apiKeys: 'id, providerId' // New table for API keys
		});
	}
}

// Feature detection
function isIndexedDBAvailable(): boolean {
	if (!browser) return false;

	try {
		return 'indexedDB' in window && window.indexedDB !== null;
	} catch {
		return false;
	}
}

// Only create database instance in browser (SSR-safe)
export const db = isIndexedDBAvailable()
	? new InspireTablesDatabase()
	: (null as any as InspireTablesDatabase);

// Export flag for fallback mode
export const useIndexedDB = isIndexedDBAvailable();

// Log initialization
if (browser) {
	if (useIndexedDB) {
		console.log('[Dexie] IndexedDB available, database initialized');
	} else {
		console.warn('[Dexie] IndexedDB not available, using localStorage fallback');
	}
}
