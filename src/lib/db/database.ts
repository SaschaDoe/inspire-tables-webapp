import Dexie, { type Table } from 'dexie';
import type { Entity } from '$lib/types/entity';
import type { Campaign } from '$lib/entities/campaign';
import type { Tab } from '$lib/stores/tabStore';
import type { StoryBoard } from '$lib/types/storyboard';
import type { SoloRpgSession } from '$lib/stores/soloRpgStore.svelte';
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

export class InspireTablesDatabase extends Dexie {
	// Entity tables
	entities!: Table<DbEntity, string>; // Primary key: id
	campaigns!: Table<Campaign, string>; // Legacy campaigns

	// UI state tables
	tabs!: Table<Tab, string>; // Primary key: id
	storyboards!: Table<StoryBoard, string>; // Primary key: id

	// Solo RPG tables
	soloRpgSessions!: Table<SoloRpgSession, string>; // Primary key: id

	// Metadata table (for counters, current IDs, etc.)
	metadata!: Table<DbMetadata, string>; // Primary key: key

	constructor() {
		super('InspireTablesDB');

		this.version(1).stores({
			// Entities: simple indexes only (no nested paths)
			// Primary: id
			// Indexes: type, campaignId, parentId
			entities: 'id, type, campaignId, parentId',

			// Legacy campaigns
			campaigns: 'id',

			// UI state
			tabs: 'id, entityId',
			storyboards: 'id',

			// Solo RPG
			soloRpgSessions: 'id',

			// Metadata (key-value store)
			metadata: 'key'
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
