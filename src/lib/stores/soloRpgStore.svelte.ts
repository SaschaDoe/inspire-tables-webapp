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

export interface SoloRpgSession {
	id: string;
	adventureName: string;
	adventureDescription?: string;
	chaosFactor: number; // 1-9

	// Lists
	threads: Thread[];
	characters: CharacterListEntry[];

	// Scenes
	scenes: Scene[];
	currentSceneNumber: number;

	// History
	fateQuestionHistory: FateQuestion[];
	randomEventHistory: RandomEvent[];

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
			threads: [],
			characters: [],
			scenes: [],
			currentSceneNumber: 0,
			fateQuestionHistory: [],
			randomEventHistory: [],
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
}

// Export singleton instance
export const soloRpgStore = new SoloRpgStore();
