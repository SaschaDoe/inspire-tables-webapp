import { writable, derived } from 'svelte/store';
import type {
	StoryBoard,
	StoryBoardNode,
	StoryBoardConnection,
	StoryBoardDrawing,
	BoardSnapshot
} from '$lib/types/storyboard';

interface StoryBoardState {
	boards: Map<string, StoryBoard>; // boardId -> StoryBoard
	activeBoardId: string | null;
}

const STORAGE_KEY = 'storyboards';

function createStoryBoardStore() {
	const { subscribe, set, update } = writable<StoryBoardState>({
		boards: new Map(),
		activeBoardId: null
	});

	// Load from localStorage on init
	function loadFromStorage(): StoryBoardState {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				// Convert plain object to Map and reconstruct Dates
				const boards = new Map<string, StoryBoard>();
				for (const [id, board] of Object.entries(parsed.boards || {})) {
					const b = board as any;
					// Reconstruct dates
					b.metadata.createdAt = new Date(b.metadata.createdAt);
					b.metadata.updatedAt = new Date(b.metadata.updatedAt);
					b.nodes.forEach((n: any) => {
						n.metadata.createdAt = new Date(n.metadata.createdAt);
						n.metadata.updatedAt = new Date(n.metadata.updatedAt);
					});
					b.history.forEach((h: any) => {
						h.timestamp = new Date(h.timestamp);
					});
					boards.set(id, b as StoryBoard);
				}
				return {
					boards,
					activeBoardId: parsed.activeBoardId || null
				};
			}
		} catch (error) {
			console.error('Failed to load storyboards from localStorage:', error);
		}
		return { boards: new Map(), activeBoardId: null };
	}

	function saveToStorage(state: StoryBoardState) {
		try {
			// Convert Map to plain object for JSON
			const toSave = {
				boards: Object.fromEntries(state.boards),
				activeBoardId: state.activeBoardId
			};
			localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
		} catch (error) {
			console.error('Failed to save storyboards to localStorage:', error);
		}
	}

	// Initialize from storage
	const initialState = loadFromStorage();
	set(initialState);

	function createSnapshot(board: StoryBoard, action: string): BoardSnapshot {
		return {
			timestamp: new Date(),
			nodes: JSON.parse(JSON.stringify(board.nodes)),
			connections: JSON.parse(JSON.stringify(board.connections)),
			drawings: JSON.parse(JSON.stringify(board.drawings)),
			action
		};
	}

	function addToHistory(board: StoryBoard, snapshot: BoardSnapshot) {
		// Clear redo stack (everything after current index)
		board.history = board.history.slice(0, board.historyIndex + 1);
		// Add new snapshot
		board.history.push(snapshot);
		// Limit history size
		if (board.history.length > board.maxHistory) {
			board.history.shift();
		} else {
			board.historyIndex++;
		}
	}

	return {
		subscribe,

		// Board operations
		createBoard(adventureId: string, name: string): StoryBoard {
			const board: StoryBoard = {
				id: crypto.randomUUID(),
				adventureId,
				name,
				nodes: [],
				connections: [],
				drawings: [],
				viewport: { x: 0, y: 0, zoom: 1 },
				mode: 'select',
				selectedNodeIds: [],
				history: [],
				historyIndex: -1,
				maxHistory: 20,
				settings: {
					gridSize: 20,
					snapToGrid: false,
					showGrid: true,
					autoArrange: false,
					theme: 'dark',
					drawingColor: '#a855f7',
					drawingWidth: 2
				},
				metadata: {
					createdAt: new Date(),
					updatedAt: new Date()
				}
			};

			update((state) => {
				state.boards.set(board.id, board);
				state.activeBoardId = board.id;
				saveToStorage(state);
				return state;
			});

			return board;
		},

		deleteBoard(boardId: string) {
			update((state) => {
				state.boards.delete(boardId);
				if (state.activeBoardId === boardId) {
					state.activeBoardId = null;
				}
				saveToStorage(state);
				return state;
			});
		},

		setActiveBoard(boardId: string) {
			update((state) => {
				if (state.boards.has(boardId)) {
					state.activeBoardId = boardId;
				}
				return state;
			});
		},

		// Node operations
		addNode(boardId: string, node: Partial<StoryBoardNode>, action = 'Add card') {
			update((state) => {
				const board = state.boards.get(boardId);
				if (!board) return state;

				// Create snapshot before adding
				const snapshot = createSnapshot(board, action);
				addToHistory(board, snapshot);

				const newNode: StoryBoardNode = {
					id: node.id || crypto.randomUUID(),
					entityId: node.entityId || null,
					entityType: node.entityType,
					x: node.x ?? 100,
					y: node.y ?? 100,
					width: node.width ?? 150,
					height: node.height ?? 80,
					color: node.color,
					icon: node.icon,
					label: node.label || '',
					notes: node.notes || '',
					selected: false,
					locked: false,
					collapsed: false,
					layer: node.layer ?? 5,
					metadata: {
						createdAt: new Date(),
						updatedAt: new Date()
					}
				};

				board.nodes.push(newNode);
				board.metadata.updatedAt = new Date();
				saveToStorage(state);
				return state;
			});
		},

		updateNode(boardId: string, nodeId: string, updates: Partial<StoryBoardNode>) {
			update((state) => {
				const board = state.boards.get(boardId);
				if (!board) return state;

				const node = board.nodes.find((n) => n.id === nodeId);
				if (node) {
					Object.assign(node, updates);
					node.metadata.updatedAt = new Date();
					board.metadata.updatedAt = new Date();
					saveToStorage(state);
				}
				return state;
			});
		},

		deleteNode(boardId: string, nodeId: string, action = 'Delete card') {
			update((state) => {
				const board = state.boards.get(boardId);
				if (!board) return state;

				// Create snapshot before deleting
				const snapshot = createSnapshot(board, action);
				addToHistory(board, snapshot);

				board.nodes = board.nodes.filter((n) => n.id !== nodeId);
				board.selectedNodeIds = board.selectedNodeIds.filter((id) => id !== nodeId);
				// Also remove connections to/from this node
				board.connections = board.connections.filter(
					(c) => c.fromNodeId !== nodeId && c.toNodeId !== nodeId
				);
				board.metadata.updatedAt = new Date();
				saveToStorage(state);
				return state;
			});
		},

		deleteNodes(boardId: string, nodeIds: string[], action = 'Delete cards') {
			update((state) => {
				const board = state.boards.get(boardId);
				if (!board) return state;

				// Create snapshot before deleting
				const snapshot = createSnapshot(board, action);
				addToHistory(board, snapshot);

				board.nodes = board.nodes.filter((n) => !nodeIds.includes(n.id));
				board.selectedNodeIds = board.selectedNodeIds.filter((id) => !nodeIds.includes(id));
				// Remove connections
				board.connections = board.connections.filter(
					(c) => !nodeIds.includes(c.fromNodeId) && !nodeIds.includes(c.toNodeId)
				);
				board.metadata.updatedAt = new Date();
				saveToStorage(state);
				return state;
			});
		},

		moveNode(boardId: string, nodeId: string, x: number, y: number, skipSnapshot = false) {
			update((state) => {
				const board = state.boards.get(boardId);
				if (!board) return state;

				const node = board.nodes.find((n) => n.id === nodeId);
				if (node) {
					if (!skipSnapshot) {
						const snapshot = createSnapshot(board, 'Move card');
						addToHistory(board, snapshot);
					}
					node.x = x;
					node.y = y;
					node.metadata.updatedAt = new Date();
					board.metadata.updatedAt = new Date();
					if (!skipSnapshot) {
						saveToStorage(state);
					}
				}
				return state;
			});
		},

		moveNodes(boardId: string, nodeIds: string[], deltaX: number, deltaY: number) {
			update((state) => {
				const board = state.boards.get(boardId);
				if (!board) return state;

				const snapshot = createSnapshot(board, `Move ${nodeIds.length} cards`);
				addToHistory(board, snapshot);

				nodeIds.forEach((nodeId) => {
					const node = board.nodes.find((n) => n.id === nodeId);
					if (node) {
						node.x += deltaX;
						node.y += deltaY;
						node.metadata.updatedAt = new Date();
					}
				});

				board.metadata.updatedAt = new Date();
				saveToStorage(state);
				return state;
			});
		},

		// Selection operations
		selectNode(boardId: string, nodeId: string, addToSelection: boolean) {
			update((state) => {
				const board = state.boards.get(boardId);
				if (!board) return state;

				if (!addToSelection) {
					// Deselect all first
					board.nodes.forEach((n) => (n.selected = false));
					board.selectedNodeIds = [];
				}

				const node = board.nodes.find((n) => n.id === nodeId);
				if (node) {
					node.selected = true;
					if (!board.selectedNodeIds.includes(nodeId)) {
						board.selectedNodeIds.push(nodeId);
					}
				}

				return state;
			});
		},

		selectNodes(boardId: string, nodeIds: string[]) {
			update((state) => {
				const board = state.boards.get(boardId);
				if (!board) return state;

				// Select all specified nodes (adds to existing selection)
				nodeIds.forEach((nodeId) => {
					const node = board.nodes.find((n) => n.id === nodeId);
					if (node) {
						node.selected = true;
						if (!board.selectedNodeIds.includes(nodeId)) {
							board.selectedNodeIds.push(nodeId);
						}
					}
				});

				return state;
			});
		},

		deselectAll(boardId: string) {
			update((state) => {
				const board = state.boards.get(boardId);
				if (!board) return state;

				board.nodes.forEach((n) => (n.selected = false));
				board.selectedNodeIds = [];
				return state;
			});
		},

		selectAll(boardId: string) {
			update((state) => {
				const board = state.boards.get(boardId);
				if (!board) return state;

				board.nodes.forEach((n) => (n.selected = true));
				board.selectedNodeIds = board.nodes.map((n) => n.id);
				return state;
			});
		},

		// History operations
		undo(boardId: string) {
			update((state) => {
				const board = state.boards.get(boardId);
				if (!board || board.historyIndex < 0) return state;

				const snapshot = board.history[board.historyIndex];
				if (snapshot) {
					board.nodes = JSON.parse(JSON.stringify(snapshot.nodes));
					board.connections = JSON.parse(JSON.stringify(snapshot.connections));
					board.drawings = JSON.parse(JSON.stringify(snapshot.drawings));
					board.historyIndex--;
					board.metadata.updatedAt = new Date();
					saveToStorage(state);
				}

				return state;
			});
		},

		redo(boardId: string) {
			update((state) => {
				const board = state.boards.get(boardId);
				if (!board || board.historyIndex >= board.history.length - 1) return state;

				board.historyIndex++;
				const snapshot = board.history[board.historyIndex + 1];
				if (snapshot) {
					board.nodes = JSON.parse(JSON.stringify(snapshot.nodes));
					board.connections = JSON.parse(JSON.stringify(snapshot.connections));
					board.drawings = JSON.parse(JSON.stringify(snapshot.drawings));
					board.metadata.updatedAt = new Date();
					saveToStorage(state);
				}

				return state;
			});
		},

		// Viewport operations
		setViewport(boardId: string, viewport: StoryBoard['viewport']) {
			update((state) => {
				const board = state.boards.get(boardId);
				if (!board) return state;

				board.viewport = viewport;
				// Don't save to storage on every pan/zoom for performance
				return state;
			});
		},

		zoomIn(boardId: string) {
			update((state) => {
				const board = state.boards.get(boardId);
				if (!board) return state;

				board.viewport.zoom = Math.min(2, board.viewport.zoom * 1.2);
				return state;
			});
		},

		zoomOut(boardId: string) {
			update((state) => {
				const board = state.boards.get(boardId);
				if (!board) return state;

				board.viewport.zoom = Math.max(0.5, board.viewport.zoom / 1.2);
				return state;
			});
		},

		resetViewport(boardId: string) {
			update((state) => {
				const board = state.boards.get(boardId);
				if (!board) return state;

				board.viewport = { x: 0, y: 0, zoom: 1 };
				saveToStorage(state);
				return state;
			});
		},

		// Mode operations
		setMode(boardId: string, mode: 'select' | 'draw' | 'pan') {
			update((state) => {
				const board = state.boards.get(boardId);
				if (!board) return state;

				board.mode = mode;
				return state;
			});
		},

		// Utility
		getBoardsByAdventure(adventureId: string): StoryBoard[] {
			let boards: StoryBoard[] = [];
			update((state) => {
				boards = Array.from(state.boards.values()).filter(
					(b) => b.adventureId === adventureId
				);
				return state;
			});
			return boards;
		}
	};
}

export const storyboardStore = createStoryBoardStore();

// Derived stores
export const activeBoard = derived(storyboardStore, ($store) =>
	$store.activeBoardId ? $store.boards.get($store.activeBoardId) : null
);

export const activeNodes = derived(activeBoard, ($board) => $board?.nodes || []);

export const selectedNodes = derived(activeNodes, ($nodes) => $nodes.filter((n) => n.selected));

export const activeConnections = derived(activeBoard, ($board) => $board?.connections || []);

export const activeDrawings = derived(activeBoard, ($board) => $board?.drawings || []);

export const canUndo = derived(activeBoard, ($board) => ($board?.historyIndex || -1) >= 0);

export const canRedo = derived(activeBoard, ($board) => {
	if (!$board) return false;
	return $board.historyIndex < $board.history.length - 1;
});

export const boardMode = derived(activeBoard, ($board) => $board?.mode || 'select');
