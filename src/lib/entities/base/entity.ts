import { db, useIndexedDB } from '$lib/db/database';
import { browser } from '$app/environment';

// Load the last ID from Dexie or localStorage or start from 0
let currentId = 0;
let loadingPromise: Promise<void> | null = null;

// Initialize current ID
async function loadCurrentId(): Promise<void> {
	if (!browser) return;

	// Use Dexie if available
	if (useIndexedDB) {
		try {
			const metadata = await db.metadata.get('entityIdCounter');
			if (metadata?.value !== undefined) {
				currentId = metadata.value;
				return;
			}
		} catch (error) {
			console.error('[Entity] Error loading counter from Dexie:', error);
		}
	}

	// Fallback to localStorage
	if (typeof localStorage !== 'undefined') {
		const savedId = localStorage.getItem('entityIdCounter');
		if (savedId) {
			currentId = parseInt(savedId, 10);
		}
	}
}

// Start loading immediately
if (browser) {
	loadingPromise = loadCurrentId();
}

async function saveCurrentId(): Promise<void> {
	if (!browser) return;

	// Use Dexie if available
	if (useIndexedDB) {
		try {
			await db.metadata.put({
				key: 'entityIdCounter',
				value: currentId
			});
			return;
		} catch (error) {
			console.error('[Entity] Error saving counter to Dexie:', error);
		}
	}

	// Fallback to localStorage
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem('entityIdCounter', currentId.toString());
	}
}

export class Entity {
	id: string;
	name: string = '';
	description: string = '';

	constructor() {
		// Ensure ID is loaded before using it
		if (browser && loadingPromise) {
			loadingPromise.then(() => {
				currentId++;
				saveCurrentId();
			});
			loadingPromise = null; // Only wait once
		}

		currentId++;
		this.id = currentId.toString();
		saveCurrentId();
	}

	static async getNextNumericId(): Promise<number> {
		if (browser && loadingPromise) {
			await loadingPromise;
			loadingPromise = null;
		}

		currentId++;
		await saveCurrentId();
		return currentId;
	}

	static async resetNumericId(): Promise<void> {
		currentId = 0;
		await saveCurrentId();
	}
}
