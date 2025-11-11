// Solo RPG Session State Management
// Using Svelte 5 runes for reactivity

import { OddsLevel } from '$lib/utils/fateChart';
import type { EventFocus } from '$lib/utils/eventFocus';
import type { FateAnswer } from '$lib/utils/mythicDice';

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
	regions: Region[]; // Phase 3: Location Crafter regions (Mythic Magazine Vol 2)

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
		// Load sessions from localStorage on init (only in browser)
		if (typeof window !== 'undefined') {
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
			regions: [], // Phase 3: Location Crafter (Mythic Magazine Vol 2)
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

	private saveToLocalStorage(): void {
		if (typeof window === 'undefined') return;

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
			console.error('Failed to save to localStorage:', error);
		}
	}

	private loadAllSessions(): void {
		if (typeof window === 'undefined') return;

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
			console.error('Failed to load from localStorage:', error);
			this.allSessions = [];
		}
	}

	private autoSaveTimeout: number | null = null;

	private autoSave(): void {
		// Debounce auto-save by 500ms
		if (this.autoSaveTimeout) {
			clearTimeout(this.autoSaveTimeout);
		}

		this.autoSaveTimeout = window.setTimeout(() => {
			this.saveToLocalStorage();
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
