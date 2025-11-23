// Solo RPG Session State Management
// Using Svelte 5 runes for reactivity

import { OddsLevel } from '$lib/utils/fateChart';
import type { EventFocus } from '$lib/utils/eventFocus';
import type { FateAnswer } from '$lib/utils/mythicDice';
import { db, useIndexedDB } from '$lib/db/database';
import { browser } from '$app/environment';

// ===== TYPE DEFINITIONS =====

export interface Thread {
	id: string;
	text: string;
	position: number; // 1-25
	completed: boolean;
	createdInScene: number;
	completedInScene?: number;
}

export interface CharacterListEntry {
	id: string;
	name: string;
	description: string;
	position: number; // 1-25
	active: boolean;
	isNPC: boolean;
	createdInScene: number;
}

export type SceneType = 'First' | 'Expected' | 'Altered' | 'Interrupt';

// Phase 2A: Alternate Scenes (Mythic Magazine Vol 2)
export type AlternateSceneTriggerType = 'manual' | 'thread' | 'chaos' | 'scene-count' | 'auto';

export interface AlternateSceneTriggerCondition {
	threadId?: string; // Specific thread must be active
	chaosMin?: number; // CF >= X
	chaosMax?: number; // CF <= X
	sceneMin?: number; // Scene # >= X
}

export interface AlternateScene {
	id: string;
	title: string;
	description: string;
	triggerType: AlternateSceneTriggerType;
	triggerCondition?: AlternateSceneTriggerCondition;
	recurring: boolean; // Can trigger multiple times?
	used: boolean;
	usedInScene?: number;
	createdInScene: number;
	position: number; // For rolling on list
}

// Phase 2B: Keyed Scenes (Mythic Magazine Vol 2)
export interface KeyedScene {
	id: string;
	event: string; // What must happen in the scene
	trigger: string; // Condition that activates the scene
	used: boolean; // Has this keyed scene been activated?
	usedInScene?: number;
	createdInScene: number;
}

// Phase 3: Location Crafter (Mythic Magazine Vol 2)
import type { RegionType, AreaElement } from '$lib/utils/locationCrafterTables';

export interface KnownElement {
	id: string;
	name: string;
	category: 'Locations' | 'Encounters' | 'Objects';
	position: number; // 1-10 for rolling
	crossed: boolean; // Marked as used/exhausted
}

export interface AreaHistoryEntry {
	id: string;
	progressPoints: number; // PP when generated
	event: string; // Historical event description
	timestamp: Date;
}

export interface Area {
	id: string;
	number: number; // Sequential number within region
	progressPoints: number; // PP at time of creation

	// Element results
	largeLoc: AreaElement;
	largeLocDescription?: string;
	smallLoc: AreaElement;
	smallLocDescription?: string;
	encounterObj: AreaElement;
	encounterObjDescription?: string;

	// Mythic Magazine Vol 3: Dungeon Connectors
	connectorFromPrevious?: string; // Connector that led to this area
	connectorDescription?: string; // User interpretation of connector
	isSecretArea?: boolean; // Found via secret door (+1 to rolls)

	notes: string;
	timestamp: Date;
}

export interface Region {
	id: string;
	name: string;
	type: RegionType; // Wilderness, City, Structure, Cavern Dungeon, Ancient Dungeon, Palatial Dungeon
	descriptor1: string;
	descriptor2: string;
	description: string; // Player interpretation

	// Mythic Magazine Vol 3: Dungeon Story Descriptors
	storyDescriptor1?: string; // For dungeons: the "why" behind the dungeon
	storyDescriptor2?: string;
	storyDescription?: string; // Player interpretation of story

	progressPoints: number; // Current PP for this region
	completed: boolean; // When Complete element rolled

	// Known Elements for this region
	knownElements: KnownElement[];

	// Areas explored
	areas: Area[];
	currentAreaNumber: number;

	// History timeline
	history: AreaHistoryEntry[];

	createdInScene: number;
	timestamp: Date;
}

export interface Scene {
	number: number;
	type: SceneType;
	expectedDescription?: string; // What player expected
	actualDescription: string; // What actually happened
	chaosFactorBefore: number;
	chaosFactorAfter: number;
	fateQuestionsAsked: number;
	randomEventsOccurred: number;
	threadsAdded: string[];
	threadsRemoved: string[];
	charactersAdded: string[];
	charactersRemoved: string[];
	notes: string;
	timestamp: Date;
}

export interface FateQuestion {
	id: string;
	sceneNumber: number;
	question: string;
	odds: OddsLevel;
	chaosFactor: number;
	roll: number; // 1-100 or 2-20 for Fate Check
	method: 'chart' | 'check';
	answer: FateAnswer;
	threshold: number; // The percentage threshold
	randomEvent: boolean;
	randomEventDetails?: RandomEvent;
	playerInterpretation?: string;
	timestamp: Date;
}

export interface RandomEvent {
	id: string;
	sceneNumber: number;
	context: string; // Player's notes about current situation
	focus: EventFocus;
	focusRoll?: number;
	focusChosen: boolean; // Was it chosen or rolled?

	// For NPC/Thread focuses
	involvedThread?: string;
	involvedCharacter?: string;
	listRoll?: string; // e.g., "d6: 3, d10: 7"

	// Meaning
	meaningTable1: string; // e.g., "Actions Table 1"
	meaningRoll1: number;
	meaningResult1: string;
	meaningTable2?: string;
	meaningRoll2?: number;
	meaningResult2?: string;

	playerInterpretation: string;
	timestamp: Date;
}

export interface MeaningRoll {
	id: string;
	sceneNumber: number;
	context: string; // What player was trying to learn about
	tableName: string; // Table used for rolling
	roll1: number;
	result1: string;
	roll2: number;
	result2: string;
	playerInterpretation?: string;
	timestamp: Date;
}

// Phase 4: Mystery Matrix (Mythic Magazine Vol 6)
export interface MysteryClue {
	id: string;
	position: number; // 1-100 for d100 rolls
	description: string;
	discoveredInScene: number;
	intensified: number; // Multiplier (default 1, can be 2, 3, etc.)
	isClincherClue: boolean; // The clue that solved the mystery
}

export interface MysterySuspect {
	id: string;
	position: number; // 1-10 for d10 rolls
	name: string;
	characterListId?: string; // Link to Character if applicable
	discoveredInScene: number;
	cluePoints: number; // Calculated from links
}

export interface MysteryLink {
	id: string;
	clueId: string;
	suspectId: string;
	strength: number; // How many times this link has been strengthened
	createdInScene: number;
}

export interface SoloRpgSession {
	id: string;
	adventureName: string;
	adventureDescription?: string;
	chaosFactor: number; // 1-9
	perilPoints?: number; // Optional Mythic Variations feature (0+)

	// Lists
	threads: Thread[];
	characters: CharacterListEntry[];
	alternateScenes: AlternateScene[]; // Phase 2A: Pre-planned scenes (Mythic Magazine Vol 2)
	keyedScenes: KeyedScene[]; // Phase 2B: Keyed Scenes (Mythic Magazine Vol 2)
	regions: Region[]; // Phase 3: Location Crafter regions (Mythic Magazine Vol 2)

	// Mystery Matrix (Phase 4: Mythic Magazine Vol 6)
	mysteryThread?: string; // The Thread designated as "The Mystery"
	mysteryClues: MysteryClue[];
	mysterySuspects: MysterySuspect[];
	mysteryLinks: MysteryLink[];
	mysteryClueProgressPoints: number;
	mysterySuspectProgressPoints: number;
	mysterySolved: boolean; // Has the mystery been solved?
	mysterySolvedInScene?: number;
	mysterySolution?: string; // Description of how it was solved

	// Scenes
	scenes: Scene[];
	currentSceneNumber: number;

	// History
	fateQuestionHistory: FateQuestion[];
	randomEventHistory: RandomEvent[];
	meaningRollHistory: MeaningRoll[];

	// Settings
	useFateCheck: boolean; // Use 2d10 instead of d100
	chaosFlavor: 'standard' | 'mid' | 'low' | 'none';

	// Metadata
	createdAt: Date;
	updatedAt: Date;
	lastPlayedAt: Date;
}

// ===== STORE STATE =====

class SoloRpgStore {
	// Current active session
	currentSession = $state<SoloRpgSession | null>(null);

	// All saved sessions (for session management)
	allSessions = $state<SoloRpgSession[]>([]);

	// UI state
	isLoading = $state(false);
	lastSaveTime = $state<Date | null>(null);

	constructor() {
		// Load sessions from Dexie or localStorage on init (only in browser)
		if (browser) {
			this.loadAllSessions();
		}
	}

	// ===== SESSION MANAGEMENT =====

	createSession(name: string, description?: string): SoloRpgSession {
		const session: SoloRpgSession = {
			id: crypto.randomUUID(),
			adventureName: name,
			adventureDescription: description,
			chaosFactor: 5, // Start at middle chaos
			perilPoints: 0, // Optional Peril Points tracker (Mythic Variations)
			threads: [],
			characters: [],
			alternateScenes: [], // Phase 2A: Pre-planned scenes (Mythic Magazine Vol 2)
			keyedScenes: [], // Phase 2B: Keyed Scenes (Mythic Magazine Vol 2)
			regions: [], // Phase 3: Location Crafter (Mythic Magazine Vol 2)
			// Phase 4: Mystery Matrix (Mythic Magazine Vol 6)
			mysteryClues: [],
			mysterySuspects: [],
			mysteryLinks: [],
			mysteryClueProgressPoints: 0,
			mysterySuspectProgressPoints: 0,
			mysterySolved: false,
			scenes: [],
			currentSceneNumber: 0,
			fateQuestionHistory: [],
			randomEventHistory: [],
			meaningRollHistory: [],
			useFateCheck: false,
			chaosFlavor: 'standard',
			createdAt: new Date(),
			updatedAt: new Date(),
			lastPlayedAt: new Date()
		};

		this.currentSession = session;
		this.allSessions.push(session);
		this.saveToLocalStorage();

		return session;
	}

	loadSession(id: string): void {
		const session = this.allSessions.find((s) => s.id === id);
		if (!session) {
			throw new Error(`Session not found: ${id}`);
		}

		this.currentSession = session;
		this.currentSession.lastPlayedAt = new Date();
		this.saveToLocalStorage();
	}

	deleteSession(id: string): void {
		this.allSessions = this.allSessions.filter((s) => s.id !== id);
		if (this.currentSession?.id === id) {
			this.currentSession = null;
		}
		this.saveToLocalStorage();
	}

	// ===== CHAOS FACTOR =====

	updateChaosFactor(newValue: number): void {
		if (!this.currentSession) return;
		if (newValue < 1 || newValue > 9) {
			throw new Error('Chaos Factor must be between 1 and 9');
		}

		this.currentSession.chaosFactor = newValue;
		this.autoSave();
	}

	incrementChaosFactor(): void {
		if (!this.currentSession) return;
		const newValue = Math.min(9, this.currentSession.chaosFactor + 1);
		this.updateChaosFactor(newValue);
	}

	decrementChaosFactor(): void {
		if (!this.currentSession) return;
		const newValue = Math.max(1, this.currentSession.chaosFactor - 1);
		this.updateChaosFactor(newValue);
	}

	// ===== PERIL POINTS =====

	updatePerilPoints(newValue: number): void {
		if (!this.currentSession) return;
		if (newValue < 0) {
			newValue = 0; // Can't go negative
		}

		// Initialize if undefined (for backward compatibility)
		if (this.currentSession.perilPoints === undefined) {
			this.currentSession.perilPoints = 0;
		}

		this.currentSession.perilPoints = newValue;
		this.autoSave();
	}

	incrementPerilPoints(): void {
		if (!this.currentSession) return;
		const current = this.currentSession.perilPoints || 0;
		this.updatePerilPoints(current + 1);
	}

	decrementPerilPoints(): void {
		if (!this.currentSession) return;
		const current = this.currentSession.perilPoints || 0;
		const newValue = Math.max(0, current - 1);
		this.updatePerilPoints(newValue);
	}

	resetPerilPoints(): void {
		if (!this.currentSession) return;
		this.updatePerilPoints(0);
	}

	// ===== THREADS =====

	addThread(text: string, position?: number): Thread {
		if (!this.currentSession) throw new Error('No active session');

		const thread: Thread = {
			id: crypto.randomUUID(),
			text,
			position: position || this.currentSession.threads.length + 1,
			completed: false,
			createdInScene: this.currentSession.currentSceneNumber
		};

		this.currentSession.threads.push(thread);
		this.autoSave();

		return thread;
	}

	removeThread(id: string): void {
		if (!this.currentSession) return;

		this.currentSession.threads = this.currentSession.threads.filter((t) => t.id !== id);
		this.autoSave();
	}

	completeThread(id: string): void {
		if (!this.currentSession) return;

		const thread = this.currentSession.threads.find((t) => t.id === id);
		if (thread) {
			thread.completed = true;
			thread.completedInScene = this.currentSession.currentSceneNumber;
			this.autoSave();
		}
	}

	updateThread(id: string, updates: Partial<Thread>): void {
		if (!this.currentSession) return;

		const thread = this.currentSession.threads.find((t) => t.id === id);
		if (thread) {
			Object.assign(thread, updates);
			this.autoSave();
		}
	}

	// ===== CHARACTERS =====

	addCharacter(name: string, description: string, position?: number): CharacterListEntry {
		if (!this.currentSession) throw new Error('No active session');

		const character: CharacterListEntry = {
			id: crypto.randomUUID(),
			name,
			description,
			position: position || this.currentSession.characters.length + 1,
			active: true,
			isNPC: true,
			createdInScene: this.currentSession.currentSceneNumber
		};

		this.currentSession.characters.push(character);
		this.autoSave();

		return character;
	}

	removeCharacter(id: string): void {
		if (!this.currentSession) return;

		this.currentSession.characters = this.currentSession.characters.filter((c) => c.id !== id);
		this.autoSave();
	}

	updateCharacter(id: string, updates: Partial<CharacterListEntry>): void {
		if (!this.currentSession) return;

		const character = this.currentSession.characters.find((c) => c.id === id);
		if (character) {
			Object.assign(character, updates);
			this.autoSave();
		}
	}

	toggleCharacterActive(id: string): void {
		if (!this.currentSession) return;

		const character = this.currentSession.characters.find((c) => c.id === id);
		if (character) {
			character.active = !character.active;
			this.autoSave();
		}
	}

	// ===== ALTERNATE SCENES (Phase 2A - Mythic Magazine Vol 2) =====

	addAlternateScene(
		title: string,
		description: string,
		triggerType: AlternateSceneTriggerType = 'manual',
		triggerCondition?: AlternateSceneTriggerCondition,
		recurring: boolean = false
	): AlternateScene {
		if (!this.currentSession) throw new Error('No active session');

		const scene: AlternateScene = {
			id: crypto.randomUUID(),
			title,
			description,
			triggerType,
			triggerCondition,
			recurring,
			used: false,
			createdInScene: this.currentSession.currentSceneNumber,
			position: this.currentSession.alternateScenes.length + 1
		};

		this.currentSession.alternateScenes.push(scene);
		this.autoSave();

		return scene;
	}

	removeAlternateScene(id: string): void {
		if (!this.currentSession) return;

		this.currentSession.alternateScenes = this.currentSession.alternateScenes.filter(
			(s) => s.id !== id
		);
		this.autoSave();
	}

	updateAlternateScene(id: string, updates: Partial<AlternateScene>): void {
		if (!this.currentSession) return;

		const scene = this.currentSession.alternateScenes.find((s) => s.id === id);
		if (scene) {
			Object.assign(scene, updates);
			this.autoSave();
		}
	}

	markAlternateSceneUsed(id: string): void {
		if (!this.currentSession) return;

		const scene = this.currentSession.alternateScenes.find((s) => s.id === id);
		if (scene) {
			scene.used = true;
			scene.usedInScene = this.currentSession.currentSceneNumber;
			this.autoSave();
		}
	}

	// ===== KEYED SCENES MANAGEMENT (Phase 2B) =====

	addKeyedScene(event: string, trigger: string): KeyedScene {
		if (!this.currentSession) throw new Error('No active session');

		// Initialize keyedScenes array if it doesn't exist (for older sessions)
		if (!this.currentSession.keyedScenes) {
			this.currentSession.keyedScenes = [];
		}

		const scene: KeyedScene = {
			id: crypto.randomUUID(),
			event,
			trigger,
			used: false,
			createdInScene: this.currentSession.currentSceneNumber
		};

		this.currentSession.keyedScenes.push(scene);
		this.autoSave();

		return scene;
	}

	removeKeyedScene(id: string): void {
		if (!this.currentSession) return;
		if (!this.currentSession.keyedScenes) return;

		this.currentSession.keyedScenes = this.currentSession.keyedScenes.filter(
			(s) => s.id !== id
		);
		this.autoSave();
	}

	updateKeyedScene(id: string, updates: Partial<KeyedScene>): void {
		if (!this.currentSession) return;
		if (!this.currentSession.keyedScenes) return;

		const scene = this.currentSession.keyedScenes.find((s) => s.id === id);
		if (scene) {
			Object.assign(scene, updates);
			this.autoSave();
		}
	}

	markKeyedSceneUsed(id: string): void {
		if (!this.currentSession) return;
		if (!this.currentSession.keyedScenes) return;

		const scene = this.currentSession.keyedScenes.find((s) => s.id === id);
		if (scene) {
			scene.used = true;
			scene.usedInScene = this.currentSession.currentSceneNumber;
			this.autoSave();
		}
	}

	// Check if any alternate scenes should trigger based on current game state
	checkAlternateScenesTriggered(): AlternateScene[] {
		if (!this.currentSession) return [];

		const triggered: AlternateScene[] = [];

		for (const scene of this.currentSession.alternateScenes) {
			// Skip if already used and not recurring
			if (scene.used && !scene.recurring) continue;

			// Manual scenes never auto-trigger
			if (scene.triggerType === 'manual') continue;

			let shouldTrigger = false;

			if (scene.triggerType === 'auto') {
				// Always check auto scenes
				shouldTrigger = true;
			} else if (scene.triggerType === 'thread' && scene.triggerCondition?.threadId) {
				// Check if specific thread is active
				const thread = this.currentSession.threads.find(
					(t) => t.id === scene.triggerCondition!.threadId && !t.completed
				);
				shouldTrigger = !!thread;
			} else if (scene.triggerType === 'chaos' && scene.triggerCondition) {
				// Check chaos factor range
				const { chaosMin, chaosMax } = scene.triggerCondition;
				const cf = this.currentSession.chaosFactor;
				shouldTrigger =
					(chaosMin === undefined || cf >= chaosMin) &&
					(chaosMax === undefined || cf <= chaosMax);
			} else if (scene.triggerType === 'scene-count' && scene.triggerCondition?.sceneMin) {
				// Check scene number
				shouldTrigger = this.currentSession.currentSceneNumber >= scene.triggerCondition.sceneMin;
			}

			if (shouldTrigger) {
				triggered.push(scene);
			}
		}

		return triggered;
	}

	// Roll on unused alternate scenes list
	rollOnAlternateScenes(): AlternateScene | null {
		if (!this.currentSession) return null;

		const available = this.currentSession.alternateScenes.filter(
			(s) => !s.used || s.recurring
		);
		if (available.length === 0) return null;

		// Roll random
		const roll = Math.floor(Math.random() * available.length);
		return available[roll];
	}

	// ===== LIST WEIGHTING (for important elements) =====

	duplicateThread(id: string): void {
		if (!this.currentSession) return;

		const thread = this.currentSession.threads.find((t) => t.id === id);
		if (!thread) return;

		// Count how many times this thread already appears
		const count = this.currentSession.threads.filter((t) => t.text === thread.text).length;
		if (count >= 3) return; // Max 3 entries per thread

		// Create duplicate with new ID
		const duplicate: Thread = {
			id: crypto.randomUUID(),
			text: thread.text,
			position: this.currentSession.threads.length + 1,
			completed: false,
			createdInScene: this.currentSession.currentSceneNumber
		};

		this.currentSession.threads.push(duplicate);
		this.autoSave();
	}

	duplicateCharacter(id: string): void {
		if (!this.currentSession) return;

		const character = this.currentSession.characters.find((c) => c.id === id);
		if (!character) return;

		// Count how many times this character already appears
		const count = this.currentSession.characters.filter((c) => c.name === character.name).length;
		if (count >= 3) return; // Max 3 entries per character

		// Create duplicate with new ID
		const duplicate: CharacterListEntry = {
			id: crypto.randomUUID(),
			name: character.name,
			description: character.description,
			position: this.currentSession.characters.length + 1,
			active: true,
			isNPC: character.isNPC,
			createdInScene: this.currentSession.currentSceneNumber
		};

		this.currentSession.characters.push(duplicate);
		this.autoSave();
	}

	// ===== LOCATION CRAFTER (Phase 3 - Mythic Magazine Vol 2) =====

	// Create new region
	createRegion(
		name: string,
		type: RegionType,
		descriptor1: string,
		descriptor2: string,
		description: string
	): Region {
		if (!this.currentSession) throw new Error('No active session');

		const region: Region = {
			id: crypto.randomUUID(),
			name,
			type,
			descriptor1,
			descriptor2,
			description,
			progressPoints: 0,
			completed: false,
			knownElements: [],
			areas: [],
			currentAreaNumber: 0,
			history: [],
			createdInScene: this.currentSession.currentSceneNumber,
			timestamp: new Date()
		};

		this.currentSession.regions.push(region);
		this.autoSave();
		return region;
	}

	// Update region
	updateRegion(
		regionId: string,
		updates: Partial<Pick<Region, 'name' | 'description' | 'progressPoints' | 'completed'>>
	): void {
		if (!this.currentSession) return;

		const region = this.currentSession.regions.find((r) => r.id === regionId);
		if (!region) return;

		Object.assign(region, updates);
		this.autoSave();
	}

	// Delete region
	deleteRegion(regionId: string): void {
		if (!this.currentSession) return;

		this.currentSession.regions = this.currentSession.regions.filter((r) => r.id !== regionId);
		this.autoSave();
	}

	// Add known element to region
	addKnownElement(
		regionId: string,
		name: string,
		category: 'Locations' | 'Encounters' | 'Objects'
	): KnownElement {
		if (!this.currentSession) throw new Error('No active session');

		const region = this.currentSession.regions.find((r) => r.id === regionId);
		if (!region) throw new Error('Region not found');

		const element: KnownElement = {
			id: crypto.randomUUID(),
			name,
			category,
			position: region.knownElements.filter((e) => e.category === category).length + 1,
			crossed: false
		};

		region.knownElements.push(element);
		this.autoSave();
		return element;
	}

	// Update known element
	updateKnownElement(regionId: string, elementId: string, name: string): void {
		if (!this.currentSession) return;

		const region = this.currentSession.regions.find((r) => r.id === regionId);
		if (!region) return;

		const element = region.knownElements.find((e) => e.id === elementId);
		if (!element) return;

		element.name = name;
		this.autoSave();
	}

	// Toggle known element crossed status
	toggleKnownElementCrossed(regionId: string, elementId: string): void {
		if (!this.currentSession) return;

		const region = this.currentSession.regions.find((r) => r.id === regionId);
		if (!region) return;

		const element = region.knownElements.find((e) => e.id === elementId);
		if (!element) return;

		element.crossed = !element.crossed;
		this.autoSave();
	}

	// Delete known element
	deleteKnownElement(regionId: string, elementId: string): void {
		if (!this.currentSession) return;

		const region = this.currentSession.regions.find((r) => r.id === regionId);
		if (!region) return;

		region.knownElements = region.knownElements.filter((e) => e.id !== elementId);
		this.autoSave();
	}

	// Add area to region
	addArea(
		regionId: string,
		largeLoc: AreaElement,
		largeLocDescription: string,
		smallLoc: AreaElement,
		smallLocDescription: string,
		encounterObj: AreaElement,
		encounterObjDescription: string,
		notes: string
	): Area {
		if (!this.currentSession) throw new Error('No active session');

		const region = this.currentSession.regions.find((r) => r.id === regionId);
		if (!region) throw new Error('Region not found');

		const area: Area = {
			id: crypto.randomUUID(),
			number: region.currentAreaNumber + 1,
			progressPoints: region.progressPoints,
			largeLoc,
			largeLocDescription,
			smallLoc,
			smallLocDescription,
			encounterObj,
			encounterObjDescription,
			notes,
			timestamp: new Date()
		};

		region.areas.push(area);
		region.currentAreaNumber = area.number;
		this.autoSave();
		return area;
	}

	// Update area
	updateArea(regionId: string, areaId: string, updates: Partial<Pick<Area, 'notes'>>): void {
		if (!this.currentSession) return;

		const region = this.currentSession.regions.find((r) => r.id === regionId);
		if (!region) return;

		const area = region.areas.find((a) => a.id === areaId);
		if (!area) return;

		Object.assign(area, updates);
		this.autoSave();
	}

	// Delete area
	deleteArea(regionId: string, areaId: string): void {
		if (!this.currentSession) return;

		const region = this.currentSession.regions.find((r) => r.id === regionId);
		if (!region) return;

		region.areas = region.areas.filter((a) => a.id !== areaId);
		this.autoSave();
	}

	// Add history entry to region
	addHistoryEntry(regionId: string, event: string): AreaHistoryEntry {
		if (!this.currentSession) throw new Error('No active session');

		const region = this.currentSession.regions.find((r) => r.id === regionId);
		if (!region) throw new Error('Region not found');

		const entry: AreaHistoryEntry = {
			id: crypto.randomUUID(),
			progressPoints: region.progressPoints,
			event,
			timestamp: new Date()
		};

		region.history.push(entry);
		this.autoSave();
		return entry;
	}

	// Delete history entry
	deleteHistoryEntry(regionId: string, entryId: string): void {
		if (!this.currentSession) return;

		const region = this.currentSession.regions.find((r) => r.id === regionId);
		if (!region) return;

		region.history = region.history.filter((h) => h.id !== entryId);
		this.autoSave();
	}

	// ===== SCENE STATS =====

	getSceneStats(sceneNumber: number): { fateQuestions: number; randomEvents: number } {
		if (!this.currentSession) return { fateQuestions: 0, randomEvents: 0 };

		const fateQuestions = this.currentSession.fateQuestionHistory.filter(
			(q) => q.sceneNumber === sceneNumber
		).length;

		const randomEvents = this.currentSession.fateQuestionHistory.filter(
			(q) => q.sceneNumber === sceneNumber && q.randomEvent
		).length;

		return { fateQuestions, randomEvents };
	}

	// ===== FATE QUESTIONS =====

	logFateQuestion(question: FateQuestion): void {
		if (!this.currentSession) return;

		this.currentSession.fateQuestionHistory.push(question);
		this.autoSave();
	}

	// ===== RANDOM EVENTS =====

	logRandomEvent(event: RandomEvent): void {
		if (!this.currentSession) return;

		this.currentSession.randomEventHistory.push(event);
		this.autoSave();
	}

	// ===== MEANING ROLLS =====

	logMeaningRoll(roll: MeaningRoll): void {
		if (!this.currentSession) return;

		this.currentSession.meaningRollHistory.push(roll);
		this.autoSave();
	}

	// ===== SCENES =====

	addScene(scene: Scene): void {
		if (!this.currentSession) return;

		this.currentSession.scenes.push(scene);
		this.currentSession.currentSceneNumber = scene.number;
		this.autoSave();
	}

	updateCurrentScene(updates: Partial<Scene>): void {
		if (!this.currentSession) return;

		const currentScene = this.currentSession.scenes.find(
			(s) => s.number === this.currentSession!.currentSceneNumber
		);
		if (currentScene) {
			Object.assign(currentScene, updates);
			this.autoSave();
		}
	}

	advanceScene(): void {
		if (!this.currentSession) return;

		this.currentSession.currentSceneNumber += 1;
		this.autoSave();
	}

	// ===== PERSISTENCE =====

	// Debounced save to Dexie
	private async saveToDexie(): Promise<void> {
		if (!browser) return;

		if (!useIndexedDB) {
			// Fallback to localStorage
			this.saveToLocalStorage();
			return;
		}

		try {
			await db.transaction('rw', [db.soloRpgSessions, db.metadata], async () => {
				// Save all sessions
				await db.soloRpgSessions.clear();
				if (this.allSessions.length > 0) {
					await db.soloRpgSessions.bulkPut(this.allSessions);
				}

				// Save current session ID
				await db.metadata.put({
					key: 'soloRpgCurrentSessionId',
					value: this.currentSession?.id || null
				});
			});

			this.lastSaveTime = new Date();
		} catch (error) {
			console.error('[SoloRpgStore] Failed to save to Dexie:', error);
			// Fallback to localStorage on error
			this.saveToLocalStorage();
		}
	}

	private saveToLocalStorage(): void {
		if (!browser) return;

		try {
			// Save all sessions
			const sessionsData = JSON.stringify(this.allSessions);
			localStorage.setItem('soloRpgSessions', sessionsData);

			// Save current session ID
			if (this.currentSession) {
				localStorage.setItem('soloRpgCurrentSessionId', this.currentSession.id);
			}

			this.lastSaveTime = new Date();
		} catch (error) {
			console.error('[SoloRpgStore] Failed to save to localStorage:', error);
		}
	}

	private async loadAllSessions(): Promise<void> {
		if (!browser) return;

		this.isLoading = true;

		if (useIndexedDB) {
			try {
				const [sessions, currentIdMetadata] = await Promise.all([
					db.soloRpgSessions.toArray(),
					db.metadata.get('soloRpgCurrentSessionId')
				]);

				this.allSessions = sessions;

				if (currentIdMetadata?.value) {
					const session = sessions.find((s) => s.id === currentIdMetadata.value);
					if (session) {
						this.currentSession = session;
					}
				}

				console.log(`[SoloRpgStore] Loaded ${sessions.length} sessions from Dexie`);
				this.isLoading = false;
				return;
			} catch (error) {
				console.error('[SoloRpgStore] Failed to load from Dexie:', error);
				// Fall through to localStorage
			}
		}

		// Fallback to localStorage
		try {
			const sessionsData = localStorage.getItem('soloRpgSessions');
			if (sessionsData) {
				this.allSessions = JSON.parse(sessionsData, (key, value) => {
					// Parse dates
					if (key.endsWith('At') || key === 'timestamp') {
						return new Date(value);
					}
					return value;
				});
			}

			// Load current session
			const currentSessionId = localStorage.getItem('soloRpgCurrentSessionId');
			if (currentSessionId) {
				const session = this.allSessions.find((s) => s.id === currentSessionId);
				if (session) {
					this.currentSession = session;
				}
			}
		} catch (error) {
			console.error('[SoloRpgStore] Failed to load from localStorage:', error);
			this.allSessions = [];
		} finally {
			this.isLoading = false;
		}
	}

	private autoSaveTimeout: number | null = null;

	private autoSave(): void {
		// Debounce auto-save by 500ms
		if (this.autoSaveTimeout) {
			clearTimeout(this.autoSaveTimeout);
		}

		this.autoSaveTimeout = window.setTimeout(() => {
			this.saveToDexie();
		}, 500);
	}

	// ===== EXPORT / IMPORT =====

	exportSession(id: string): string {
		const session = this.allSessions.find((s) => s.id === id);
		if (!session) {
			throw new Error(`Session not found: ${id}`);
		}

		return JSON.stringify(session, null, 2);
	}

	importSession(jsonData: string): void {
		try {
			const session = JSON.parse(jsonData, (key, value) => {
				// Parse dates
				if (key.endsWith('At') || key === 'timestamp') {
					return new Date(value);
				}
				return value;
			}) as SoloRpgSession;

			// Generate new ID to avoid conflicts
			session.id = crypto.randomUUID();

			this.allSessions.push(session);
			this.saveToLocalStorage();
		} catch (error) {
			console.error('Failed to import session:', error);
			throw new Error('Invalid session data');
		}
	}

	// ===== UTILITY GETTERS =====

	get activeThreads(): Thread[] {
		return this.currentSession?.threads.filter((t) => !t.completed) || [];
	}

	get completedThreads(): Thread[] {
		return this.currentSession?.threads.filter((t) => t.completed) || [];
	}

	// ===== MYSTERY MATRIX METHODS (Phase 4: Mythic Magazine Vol 6) =====

	activateMystery(threadText: string): void {
		if (!this.currentSession) return;

		// Remove thread from threads list and set as mystery
		const threadIndex = this.currentSession.threads.findIndex((t) => t.text === threadText);
		if (threadIndex === -1) return;

		this.currentSession.mysteryThread = threadText;
		this.currentSession.threads.splice(threadIndex, 1);
		this.currentSession.mysteryClues = [];
		this.currentSession.mysterySuspects = [];
		this.currentSession.mysteryLinks = [];
		this.currentSession.mysteryClueProgressPoints = 0;
		this.currentSession.mysterySuspectProgressPoints = 0;
		this.currentSession.mysterySolved = false;
		this.currentSession.updatedAt = new Date();
		this.saveToLocalStorage();
	}

	deactivateMystery(restoreToThread: boolean = true): void {
		if (!this.currentSession || !this.currentSession.mysteryThread) return;

		// Optionally restore to threads list
		if (restoreToThread) {
			const position = this.getNextAvailableThreadPosition();
			this.addThread(this.currentSession.mysteryThread, position);
		}

		// Clear mystery data
		this.currentSession.mysteryThread = undefined;
		this.currentSession.mysteryClues = [];
		this.currentSession.mysterySuspects = [];
		this.currentSession.mysteryLinks = [];
		this.currentSession.mysteryClueProgressPoints = 0;
		this.currentSession.mysterySuspectProgressPoints = 0;
		this.currentSession.mysterySolved = false;
		this.currentSession.mysterySolvedInScene = undefined;
		this.currentSession.mysterySolution = undefined;
		this.currentSession.updatedAt = new Date();
		this.saveToLocalStorage();
	}

	addMysteryClue(description: string, position?: number): MysteryClue | null {
		if (!this.currentSession) return null;

		// Auto-assign position if not provided
		if (!position) {
			const usedPositions = this.currentSession.mysteryClues.map((c) => c.position);
			for (let i = 1; i <= 100; i++) {
				if (!usedPositions.includes(i)) {
					position = i;
					break;
				}
			}
		}

		if (!position) return null; // All positions used

		const clue: MysteryClue = {
			id: crypto.randomUUID(),
			position,
			description,
			discoveredInScene: this.currentSession.currentSceneNumber,
			intensified: 1,
			isClincherClue: false
		};

		this.currentSession.mysteryClues.push(clue);
		this.currentSession.updatedAt = new Date();
		this.saveToLocalStorage();
		return clue;
	}

	addMysterySuspect(name: string, position?: number, characterListId?: string): MysterySuspect | null {
		if (!this.currentSession) return null;

		// Auto-assign position if not provided
		if (!position) {
			const usedPositions = this.currentSession.mysterySuspects.map((s) => s.position);
			for (let i = 1; i <= 10; i++) {
				if (!usedPositions.includes(i)) {
					position = i;
					break;
				}
			}
		}

		if (!position) return null; // All positions used

		const suspect: MysterySuspect = {
			id: crypto.randomUUID(),
			position,
			name,
			characterListId,
			discoveredInScene: this.currentSession.currentSceneNumber,
			cluePoints: 0 // Will be calculated from links
		};

		this.currentSession.mysterySuspects.push(suspect);
		this.currentSession.updatedAt = new Date();
		this.saveToLocalStorage();
		return suspect;
	}

	linkClueToSuspect(clueId: string, suspectId: string): MysteryLink | null {
		if (!this.currentSession) return null;

		// Check if link already exists
		const existingLink = this.currentSession.mysteryLinks.find(
			(l) => l.clueId === clueId && l.suspectId === suspectId
		);

		if (existingLink) {
			// Strengthen existing link
			existingLink.strength++;
			this.recalculateCluePoints(suspectId);
			this.currentSession.updatedAt = new Date();
			this.saveToLocalStorage();
			return existingLink;
		}

		// Create new link
		const link: MysteryLink = {
			id: crypto.randomUUID(),
			clueId,
			suspectId,
			strength: 1,
			createdInScene: this.currentSession.currentSceneNumber
		};

		this.currentSession.mysteryLinks.push(link);
		this.recalculateCluePoints(suspectId);
		this.currentSession.updatedAt = new Date();
		this.saveToLocalStorage();
		return link;
	}

	removeMysteryLink(linkId: string): void {
		if (!this.currentSession) return;

		const link = this.currentSession.mysteryLinks.find((l) => l.id === linkId);
		if (!link) return;

		this.currentSession.mysteryLinks = this.currentSession.mysteryLinks.filter(
			(l) => l.id !== linkId
		);
		this.recalculateCluePoints(link.suspectId);
		this.currentSession.updatedAt = new Date();
		this.saveToLocalStorage();
	}

	removeMysteryClue(clueId: string): void {
		if (!this.currentSession) return;

		// Remove clue and all its links
		this.currentSession.mysteryClues = this.currentSession.mysteryClues.filter(
			(c) => c.id !== clueId
		);
		const linksToRemove = this.currentSession.mysteryLinks.filter((l) => l.clueId === clueId);
		this.currentSession.mysteryLinks = this.currentSession.mysteryLinks.filter(
			(l) => l.clueId !== clueId
		);

		// Recalculate clue points for affected suspects
		linksToRemove.forEach((link) => this.recalculateCluePoints(link.suspectId));

		this.currentSession.updatedAt = new Date();
		this.saveToLocalStorage();
	}

	removeMysterySuspect(suspectId: string): void {
		if (!this.currentSession) return;

		// Remove suspect and all its links
		this.currentSession.mysterySuspects = this.currentSession.mysterySuspects.filter(
			(s) => s.id !== suspectId
		);
		this.currentSession.mysteryLinks = this.currentSession.mysteryLinks.filter(
			(l) => l.suspectId !== suspectId
		);

		this.currentSession.updatedAt = new Date();
		this.saveToLocalStorage();
	}

	intensifyClue(clueId: string): void {
		if (!this.currentSession) return;

		const clue = this.currentSession.mysteryClues.find((c) => c.id === clueId);
		if (!clue) return;

		clue.intensified++;

		// Recalculate clue points for all suspects linked to this clue
		const linksForClue = this.currentSession.mysteryLinks.filter((l) => l.clueId === clueId);
		linksForClue.forEach((link) => this.recalculateCluePoints(link.suspectId));

		this.currentSession.updatedAt = new Date();
		this.saveToLocalStorage();
	}

	markClincherClue(clueId: string, suspectId: string): void {
		if (!this.currentSession) return;

		const clue = this.currentSession.mysteryClues.find((c) => c.id === clueId);
		if (!clue) return;

		clue.isClincherClue = true;

		// Make sure this clue is linked to the suspect
		const existingLink = this.currentSession.mysteryLinks.find(
			(l) => l.clueId === clueId && l.suspectId === suspectId
		);
		if (!existingLink) {
			this.linkClueToSuspect(clueId, suspectId);
		}

		this.currentSession.updatedAt = new Date();
		this.saveToLocalStorage();
	}

	solveMystery(suspectId: string, solution: string): void {
		if (!this.currentSession) return;

		this.currentSession.mysterySolved = true;
		this.currentSession.mysterySolvedInScene = this.currentSession.currentSceneNumber;
		this.currentSession.mysterySolution = solution;
		this.currentSession.updatedAt = new Date();
		this.saveToLocalStorage();
	}

	incrementMysteryProgressPoints(type: 'clues' | 'suspects'): void {
		if (!this.currentSession) return;

		if (type === 'clues') {
			this.currentSession.mysteryClueProgressPoints++;
		} else {
			this.currentSession.mysterySuspectProgressPoints++;
		}

		this.currentSession.updatedAt = new Date();
		this.saveToLocalStorage();
	}

	adjustMysteryProgressPoints(type: 'clues' | 'suspects', adjustment: number): void {
		if (!this.currentSession) return;

		if (type === 'clues') {
			this.currentSession.mysteryClueProgressPoints = Math.max(
				0,
				this.currentSession.mysteryClueProgressPoints + adjustment
			);
		} else {
			this.currentSession.mysterySuspectProgressPoints = Math.max(
				0,
				this.currentSession.mysterySuspectProgressPoints + adjustment
			);
		}

		this.currentSession.updatedAt = new Date();
		this.saveToLocalStorage();
	}

	updateMysteryClue(clueId: string, updates: Partial<MysteryClue>): void {
		if (!this.currentSession) return;

		const clue = this.currentSession.mysteryClues.find((c) => c.id === clueId);
		if (!clue) return;

		Object.assign(clue, updates);
		this.currentSession.updatedAt = new Date();
		this.saveToLocalStorage();
	}

	updateMysterySuspect(suspectId: string, updates: Partial<MysterySuspect>): void {
		if (!this.currentSession) return;

		const suspect = this.currentSession.mysterySuspects.find((s) => s.id === suspectId);
		if (!suspect) return;

		Object.assign(suspect, updates);
		this.currentSession.updatedAt = new Date();
		this.saveToLocalStorage();
	}

	private recalculateCluePoints(suspectId: string): void {
		if (!this.currentSession) return;

		const suspect = this.currentSession.mysterySuspects.find((s) => s.id === suspectId);
		if (!suspect) return;

		// Get all links for this suspect
		const links = this.currentSession.mysteryLinks.filter((l) => l.suspectId === suspectId);

		// Calculate total clue points
		let totalPoints = 0;
		links.forEach((link) => {
			const clue = this.currentSession!.mysteryClues.find((c) => c.id === link.clueId);
			if (clue) {
				// Points = link strength * clue intensified value
				totalPoints += link.strength * clue.intensified;
			}
		});

		suspect.cluePoints = totalPoints;

		// Check if suspect reached 6 clue points (auto-clincher)
		if (suspect.cluePoints >= 6 && !this.currentSession.mysterySolved) {
			// Find the last clue that was linked to trigger the clincher
			const lastLink = links[links.length - 1];
			if (lastLink) {
				this.markClincherClue(lastLink.clueId, suspectId);
			}
		}
	}

	// ===== GETTERS =====

	get isMysteryActive(): boolean {
		return !!this.currentSession?.mysteryThread && !this.currentSession?.mysterySolved;
	}

	get mysterySuspectWithMostCluePoints(): MysterySuspect | null {
		if (!this.currentSession || this.currentSession.mysterySuspects.length === 0) return null;

		return this.currentSession.mysterySuspects.reduce((max, suspect) =>
			suspect.cluePoints > max.cluePoints ? suspect : max
		);
	}

	get mysteryCluesLinkedToSuspect() {
		return (suspectId: string): MysteryClue[] => {
			if (!this.currentSession) return [];

			const links = this.currentSession.mysteryLinks.filter((l) => l.suspectId === suspectId);
			return links
				.map((link) => this.currentSession!.mysteryClues.find((c) => c.id === link.clueId))
				.filter((clue): clue is MysteryClue => clue !== undefined);
		};
	}

	get mysterySuspectsLinkedToClue() {
		return (clueId: string): MysterySuspect[] => {
			if (!this.currentSession) return [];

			const links = this.currentSession.mysteryLinks.filter((l) => l.clueId === clueId);
			return links
				.map((link) => this.currentSession!.mysterySuspects.find((s) => s.id === link.suspectId))
				.filter((suspect): suspect is MysterySuspect => suspect !== undefined);
		};
	}

	get activeCharacters(): CharacterListEntry[] {
		return this.currentSession?.characters.filter((c) => c.active) || [];
	}

	get inactiveCharacters(): CharacterListEntry[] {
		return this.currentSession?.characters.filter((c) => !c.active) || [];
	}

	get currentScene(): Scene | undefined {
		if (!this.currentSession) return undefined;
		return this.currentSession.scenes.find(
			(s) => s.number === this.currentSession!.currentSceneNumber
		);
	}

	get recentFateQuestions(): FateQuestion[] {
		return this.currentSession?.fateQuestionHistory.slice(-5) || [];
	}

	get recentRandomEvents(): RandomEvent[] {
		return this.currentSession?.randomEventHistory.slice(-5) || [];
	}

	get recentMeaningRolls(): MeaningRoll[] {
		return this.currentSession?.meaningRollHistory.slice(-5) || [];
	}
}

// Export singleton instance
export const soloRpgStore = new SoloRpgStore();
