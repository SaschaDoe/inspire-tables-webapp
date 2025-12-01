import { db, useIndexedDB } from './database';
import type { StoryBoard } from '$lib/types/storyboard';

export interface MigrationResult {
	success: boolean;
	alreadyMigrated?: boolean;
	error?: string;
	canRetry?: boolean;
}

/**
 * Wrap a promise with a timeout
 */
function withTimeout<T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> {
	return Promise.race([
		promise,
		new Promise<T>((_, reject) =>
			setTimeout(() => reject(new Error(errorMessage)), ms)
		)
	]);
}

/**
 * Migrates data from localStorage to IndexedDB (Dexie)
 * This runs once on first load after upgrading to Dexie
 */
export async function migrateFromLocalStorage(): Promise<MigrationResult> {
	// If IndexedDB not available, skip migration
	if (!useIndexedDB) {
		console.log('[Migration] IndexedDB not available, skipping migration');
		return { success: true, alreadyMigrated: true };
	}

	try {
		// Check if already migrated (with timeout to prevent hanging)
		const migrationStatus = await withTimeout(
			db.metadata.get('migrationVersion'),
			5000,
			'Database connection timeout - try refreshing the page or clearing IndexedDB'
		);
		if (migrationStatus && migrationStatus.value >= 1) {
			console.log('[Migration] Already migrated to version', migrationStatus.value);
			return { success: true, alreadyMigrated: true };
		}

		console.log('[Migration] Starting localStorage → IndexedDB migration...');

		// Wrap entire migration in a transaction for atomicity
		await db.transaction(
			'rw',
			[db.entities, db.campaigns, db.tabs, db.storyboards, db.soloRpgSessions, db.metadata],
			async () => {
				// 1. Migrate entities
				const entitiesJson = localStorage.getItem('entities');
				if (entitiesJson) {
					try {
						const entities = JSON.parse(entitiesJson);
						if (Array.isArray(entities) && entities.length > 0) {
							await db.entities.bulkAdd(entities);
							console.log(`[Migration] Migrated ${entities.length} entities`);
						}
					} catch (error) {
						console.error('[Migration] Error migrating entities:', error);
					}
				}

				// 2. Migrate campaigns
				const campaignsJson = localStorage.getItem('campaigns');
				if (campaignsJson) {
					try {
						const campaigns = JSON.parse(campaignsJson);
						if (Array.isArray(campaigns) && campaigns.length > 0) {
							await db.campaigns.bulkAdd(campaigns);
							console.log(`[Migration] Migrated ${campaigns.length} campaigns`);
						}
					} catch (error) {
						console.error('[Migration] Error migrating campaigns:', error);
					}
				}

				// 3. Migrate tabs
				const tabsJson = localStorage.getItem('tabs');
				if (tabsJson) {
					try {
						const tabsData = JSON.parse(tabsJson);
						// Add tabs array
						if (Array.isArray(tabsData.tabs) && tabsData.tabs.length > 0) {
							await db.tabs.bulkAdd(tabsData.tabs);
							console.log(`[Migration] Migrated ${tabsData.tabs.length} tabs`);
						}
						// Store tab navigation state in metadata
						await db.metadata.put({
							key: 'tabState',
							value: {
								activeTabId: tabsData.activeTabId || null,
								navigationHistory: tabsData.navigationHistory || [],
								currentHistoryIndex: tabsData.currentHistoryIndex ?? -1
							}
						});
					} catch (error) {
						console.error('[Migration] Error migrating tabs:', error);
					}
				}

				// 4. Migrate recently used & favorites
				try {
					const recentlyUsedJson = localStorage.getItem('recentlyUsed');
					await db.metadata.put({
						key: 'recentlyUsed',
						value: recentlyUsedJson ? JSON.parse(recentlyUsedJson) : []
					});

					const favoritesJson = localStorage.getItem('favorites');
					await db.metadata.put({
						key: 'favorites',
						value: favoritesJson ? JSON.parse(favoritesJson) : []
					});
				} catch (error) {
					console.error('[Migration] Error migrating recently used/favorites:', error);
				}

				// 5. Migrate storyboards
				const storyboardsJson = localStorage.getItem('storyboards');
				if (storyboardsJson) {
					try {
						const data = JSON.parse(storyboardsJson);
						if (data.boards) {
							const boards = Object.values(data.boards) as StoryBoard[];
							if (boards.length > 0) {
								await db.storyboards.bulkAdd(boards);
								console.log(`[Migration] Migrated ${boards.length} storyboards`);
							}
						}
						await db.metadata.put({
							key: 'activeStoryboardId',
							value: data.activeBoardId || null
						});
					} catch (error) {
						console.error('[Migration] Error migrating storyboards:', error);
					}
				}

				// 6. Migrate solo RPG sessions
				const sessionsJson = localStorage.getItem('soloRpgSessions');
				if (sessionsJson) {
					try {
						const sessions = JSON.parse(sessionsJson);
						if (Array.isArray(sessions) && sessions.length > 0) {
							await db.soloRpgSessions.bulkAdd(sessions);
							console.log(`[Migration] Migrated ${sessions.length} solo RPG sessions`);
						}
					} catch (error) {
						console.error('[Migration] Error migrating solo RPG sessions:', error);
					}
				}

				const currentSessionId = localStorage.getItem('soloRpgCurrentSessionId');
				await db.metadata.put({
					key: 'soloRpgCurrentSessionId',
					value: currentSessionId || null
				});

				// 7. Migrate entity ID counter
				const entityIdCounter = localStorage.getItem('entityIdCounter');
				await db.metadata.put({
					key: 'entityIdCounter',
					value: entityIdCounter ? parseInt(entityIdCounter, 10) : 0
				});

				// Mark migration complete
				await db.metadata.put({
					key: 'migrationVersion',
					value: 1
				});
			}
		);

		console.log('[Migration] Migration complete!');

		// Note: We keep localStorage intact as a backup
		// It will be cleared in a future version after stability is confirmed

		return { success: true, alreadyMigrated: false };
	} catch (error) {
		console.error('[Migration] Migration failed:', error);

		// Don't clear localStorage on failure - data is safe
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
			canRetry: true
		};
	}
}

/**
 * Check if migration has been completed
 */
export async function isMigrationComplete(): Promise<boolean> {
	if (!useIndexedDB) return true;

	try {
		const migrationStatus = await db.metadata.get('migrationVersion');
		return migrationStatus?.value >= 1;
	} catch {
		return false;
	}
}
