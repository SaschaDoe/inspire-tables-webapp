import { writable, derived } from 'svelte/store';
import type { Entity } from '$lib/types/entity';
import { entityStore } from './entityStore';

export interface Tab {
	id: string;
	entityId: string;
	entityType: string;
	title: string;
	isPinned: boolean;
	isModified: boolean;
	customFields?: Record<string, any>;
}

interface TabState {
	tabs: Tab[];
	activeTabId: string | null;
}

function createTabStore() {
	const { subscribe, set, update } = writable<TabState>({
		tabs: [],
		activeTabId: null
	});

	// Load from localStorage on init
	function loadFromStorage() {
		try {
			const stored = localStorage.getItem('tabs');
			if (stored) {
				const state = JSON.parse(stored);
				set(state);
			}
		} catch (error) {
			console.error('Error loading tabs from storage:', error);
		}
	}

	function saveToStorage(state: TabState) {
		try {
			localStorage.setItem('tabs', JSON.stringify(state));
		} catch (error) {
			console.error('Error saving tabs to storage:', error);
		}
	}

	// Initialize
	loadFromStorage();

	return {
		subscribe,

		// Open a new tab or switch to existing one
		openTab(entity: Entity) {
			console.log('[tabStore] Opening tab for entity:', {
				id: entity.id,
				type: entity.type,
				name: entity.name
			});
			update(state => {
				// Check if tab already exists
				const existingTab = state.tabs.find(t => t.entityId === entity.id);

				if (existingTab) {
					// Switch to existing tab and mark as recently used
					console.log('[tabStore] Tab already exists, switching to it');
					entityStore.markAsRecentlyUsed(entity.id);
					const newState = { ...state, activeTabId: existingTab.id };
					saveToStorage(newState);
					return newState;
				}

				// Create new tab
				const newTab: Tab = {
					id: `tab-${entity.id}-${Date.now()}`,
					entityId: entity.id,
					entityType: entity.type,
					title: entity.name,
					isPinned: false,
					isModified: false,
					customFields: entity.customFields
				};

				console.log('[tabStore] Created new tab:', {
					id: newTab.id,
					entityId: newTab.entityId,
					entityType: newTab.entityType,
					title: newTab.title
				});

				// Mark as recently used
				entityStore.markAsRecentlyUsed(entity.id);

				const newState = {
					tabs: [...state.tabs, newTab],
					activeTabId: newTab.id
				};
				saveToStorage(newState);
				return newState;
			});
		},

		// Close a tab
		closeTab(tabId: string) {
			update(state => {
				const index = state.tabs.findIndex(t => t.id === tabId);
				if (index === -1) return state;

				const tab = state.tabs[index];

				// Don't close pinned tabs
				if (tab.isPinned) return state;

				const newTabs = state.tabs.filter(t => t.id !== tabId);

				// Determine new active tab if we closed the active one
				let newActiveTabId = state.activeTabId;
				if (state.activeTabId === tabId) {
					if (newTabs.length > 0) {
						// Activate the tab to the right, or the last tab if we closed the last one
						const nextIndex = index < newTabs.length ? index : newTabs.length - 1;
						newActiveTabId = newTabs[nextIndex]?.id || null;
					} else {
						newActiveTabId = null;
					}
				}

				const newState = {
					tabs: newTabs,
					activeTabId: newActiveTabId
				};
				saveToStorage(newState);
				return newState;
			});
		},

		// Close tab by entity ID (useful when deleting entities)
		closeTabByEntityId(entityId: string) {
			update(state => {
				const tab = state.tabs.find(t => t.entityId === entityId);
				if (!tab) return state;

				// Use the existing closeTab logic
				const index = state.tabs.findIndex(t => t.id === tab.id);
				if (index === -1) return state;

				// Don't close pinned tabs
				if (tab.isPinned) return state;

				const newTabs = state.tabs.filter(t => t.id !== tab.id);

				// Determine new active tab if we closed the active one
				let newActiveTabId = state.activeTabId;
				if (state.activeTabId === tab.id) {
					if (newTabs.length > 0) {
						// Activate the tab to the right, or the last tab if we closed the last one
						const nextIndex = index < newTabs.length ? index : newTabs.length - 1;
						newActiveTabId = newTabs[nextIndex]?.id || null;
					} else {
						newActiveTabId = null;
					}
				}

				const newState = {
					tabs: newTabs,
					activeTabId: newActiveTabId
				};
				saveToStorage(newState);
				return newState;
			});
		},

		// Switch active tab
		setActiveTab(tabId: string) {
			update(state => {
				const newState = { ...state, activeTabId: tabId };
				saveToStorage(newState);
				// Mark as recently used
				const tab = state.tabs.find(t => t.id === tabId);
				if (tab) {
					entityStore.markAsRecentlyUsed(tab.entityId);
				}
				return newState;
			});
		},

		// Pin/unpin tab
		togglePin(tabId: string) {
			update(state => ({
				...state,
				tabs: state.tabs.map(t =>
					t.id === tabId ? { ...t, isPinned: !t.isPinned } : t
				)
			}));
		},

		// Mark tab as modified
		setModified(tabId: string, isModified: boolean) {
			update(state => ({
				...state,
				tabs: state.tabs.map(t =>
					t.id === tabId ? { ...t, isModified } : t
				)
			}));
		},

		// Update tab title
		updateTabTitle(tabId: string, title: string) {
			update(state => ({
				...state,
				tabs: state.tabs.map(t =>
					t.id === tabId ? { ...t, title } : t
				)
			}));
		},

		// Close all tabs except pinned
		closeAllTabs() {
			update(state => {
				const pinnedTabs = state.tabs.filter(t => t.isPinned);
				const newActiveTabId = pinnedTabs.length > 0 ? pinnedTabs[0].id : null;
				return {
					tabs: pinnedTabs,
					activeTabId: newActiveTabId
				};
			});
		},

		// Close all tabs to the right of the specified tab
		closeTabsToRight(tabId: string) {
			update(state => {
				const index = state.tabs.findIndex(t => t.id === tabId);
				if (index === -1) return state;

				const tabsToKeep = state.tabs.slice(0, index + 1);
				const tabsToClose = state.tabs.slice(index + 1).filter(t => !t.isPinned);

				const newTabs = [...tabsToKeep, ...tabsToClose.filter(t => t.isPinned)];

				// Check if active tab was closed
				const newActiveTabId = newTabs.find(t => t.id === state.activeTabId)
					? state.activeTabId
					: tabsToKeep[tabsToKeep.length - 1]?.id || null;

				return {
					tabs: newTabs,
					activeTabId: newActiveTabId
				};
			});
		},

		// Reorder tabs
		reorderTabs(fromIndex: number, toIndex: number) {
			update(state => {
				const newTabs = [...state.tabs];
				const [removed] = newTabs.splice(fromIndex, 1);
				newTabs.splice(toIndex, 0, removed);
				return { ...state, tabs: newTabs };
			});
		}
	};
}

export const tabStore = createTabStore();

// Derived store for active tab
export const activeTab = derived(
	tabStore,
	$tabStore => $tabStore.tabs.find(t => t.id === $tabStore.activeTabId) || null
);
