/**
 * Service for managing AI provider API keys
 * Stores keys in IndexedDB via Dexie
 */

import { db, useIndexedDB } from '$lib/db/database';
import type { StoredApiKey } from './types';
import { aiProviderRegistry } from './providerRegistry';

/**
 * Save or update an API key for a provider
 */
export async function saveApiKey(providerId: string, apiKey: string): Promise<void> {
	if (!useIndexedDB) {
		// Fallback to localStorage
		localStorage.setItem(`apiKey_${providerId}`, apiKey);
		configureProvider(providerId, apiKey);
		return;
	}

	const existing = await db.apiKeys.where('providerId').equals(providerId).first();
	const now = new Date();

	if (existing) {
		await db.apiKeys.update(existing.id, {
			apiKey,
			updatedAt: now
		});
	} else {
		const newKey: StoredApiKey = {
			id: `apikey_${providerId}_${Date.now()}`,
			providerId,
			apiKey,
			createdAt: now,
			updatedAt: now
		};
		await db.apiKeys.add(newKey);
	}

	configureProvider(providerId, apiKey);
}

/**
 * Get the API key for a provider
 */
export async function getApiKey(providerId: string): Promise<string | null> {
	if (!useIndexedDB) {
		return localStorage.getItem(`apiKey_${providerId}`);
	}

	const stored = await db.apiKeys.where('providerId').equals(providerId).first();
	return stored?.apiKey || null;
}

/**
 * Delete the API key for a provider
 */
export async function deleteApiKey(providerId: string): Promise<void> {
	if (!useIndexedDB) {
		localStorage.removeItem(`apiKey_${providerId}`);
		return;
	}

	await db.apiKeys.where('providerId').equals(providerId).delete();

	// Deconfigure the provider
	const provider = aiProviderRegistry.get(providerId);
	if (provider) {
		provider.configure({ apiKey: '' });
	}
}

/**
 * Get all stored API keys (without exposing the actual keys)
 */
export async function listStoredProviders(): Promise<{ providerId: string; hasKey: boolean }[]> {
	const providers = aiProviderRegistry.getAll();
	const result: { providerId: string; hasKey: boolean }[] = [];

	for (const provider of providers) {
		const key = await getApiKey(provider.id);
		result.push({
			providerId: provider.id,
			hasKey: !!key
		});
	}

	return result;
}

/**
 * Configure a provider with its API key
 */
function configureProvider(providerId: string, apiKey: string): void {
	const provider = aiProviderRegistry.get(providerId);
	if (provider) {
		provider.configure({ apiKey });
	}
}

/**
 * Initialize all providers with stored API keys
 * Should be called on app startup
 */
export async function initializeProviders(): Promise<void> {
	const providers = aiProviderRegistry.getAll();

	for (const provider of providers) {
		const key = await getApiKey(provider.id);
		if (key) {
			provider.configure({ apiKey: key });
		}
	}
}

/**
 * Check if any image-capable provider is configured
 */
export async function hasImageProvider(): Promise<boolean> {
	const geminiKey = await getApiKey('gemini');
	return !!geminiKey;
}
