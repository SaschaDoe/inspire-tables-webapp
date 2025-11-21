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
	connectingFromNodeId: string | null; // Node ID when creating connection
}

const STORAGE_KEY = 'storyboards';

function createStoryBoardStore() {
	const { subscribe, set, update } = writable<StoryBoardState>({
		boards: new Map(),
		activeBoardId: null,
		connectingFromNodeId: null
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
					activeBoardId: parsed.activeBoardId || null,
					connectingFromNodeId: null
				};
			}
		} catch (error) {
			console.error('Failed to load storyboards from localStorage:', error);
		}
		return { boards: new Map(), activeBoardId: null, connectingFromNodeId: null };
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
		addNode(boardId: string, node: Partial<StoryBoardNode>, action = 'Add card'): StoryBoardNode | null {
			let createdNode: StoryBoardNode | null = null;

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
					groupId: node.groupId, // Group ID for moving nodes together
				bridgeLinksSpawned: node.bridgeLinksSpawned, // Track spawned bridge links
				parentNodeId: node.parentNodeId, // Track parent node for aspects
					storyEngineCard: node.storyEngineCard, // Story Engine card data
				worldBuilderCard: node.worldBuilderCard, // World Builder card data
					loreCluster: node.loreCluster, // Lore Master's Deck cluster data
					metadata: {
						createdAt: new Date(),
						updatedAt: new Date()
					}
				};

				board.nodes.push(newNode);
				board.metadata.updatedAt = new Date();
				saveToStorage(state);
				createdNode = newNode;
				return state;
			});

			return createdNode;
		},

		updateNode(boardId: string, nodeId: string, updates: Partial<StoryBoardNode>) {
			update((state) => {
				const board = state.boards.get(boardId);
				if (!board) return state;

				const node = board.nodes.find((n) => n.id === nodeId);
			if (node) {
				console.log('[Store] updateNode BEFORE:', { nodeId, bridgeLinksSpawned: node.bridgeLinksSpawned, updates });
				Object.assign(node, updates);
				console.log('[Store] updateNode AFTER:', { nodeId, bridgeLinksSpawned: node.bridgeLinksSpawned });
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

					// Calculate delta for group movement
					const deltaX = x - node.x;
					const deltaY = y - node.y;

					// Move the node
					node.x = x;
					node.y = y;
					node.metadata.updatedAt = new Date();

					// If node is part of a group, move all other nodes in the group
					if (node.groupId) {
						board.nodes.forEach((n) => {
							if (n.id !== nodeId && n.groupId === node.groupId) {
								n.x += deltaX;
								n.y += deltaY;
								n.metadata.updatedAt = new Date();
							}
						});
					}

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

		// Drawing operations
		addDrawing(boardId: string, drawing: Omit<StoryBoardDrawing, 'id' | 'metadata'>) {
			update((state) => {
				const board = state.boards.get(boardId);
				if (!board) return state;

				// Create snapshot before adding
				const snapshot = createSnapshot(board, 'Add drawing');
				addToHistory(board, snapshot);

				const newDrawing: StoryBoardDrawing = {
					...drawing,
					id: `drawing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
					metadata: {
						createdAt: new Date()
					}
				};

				board.drawings.push(newDrawing);
				board.metadata.updatedAt = new Date();
				saveToStorage(state);
				return state;
			});
		},

		deleteDrawing(boardId: string, drawingId: string) {
			update((state) => {
				const board = state.boards.get(boardId);
				if (!board) return state;

				// Create snapshot before deleting
				const snapshot = createSnapshot(board, 'Delete drawing');
				addToHistory(board, snapshot);

				board.drawings = board.drawings.filter((d) => d.id !== drawingId);
				board.metadata.updatedAt = new Date();
				saveToStorage(state);
				return state;
			});
		},

		clearDrawings(boardId: string) {
			update((state) => {
				const board = state.boards.get(boardId);
				if (!board) return state;

				// Create snapshot before clearing
				const snapshot = createSnapshot(board, 'Clear drawings');
				addToHistory(board, snapshot);

				board.drawings = [];
				board.metadata.updatedAt = new Date();
				saveToStorage(state);
				return state;
			});
		},

		updateDrawingSettings(boardId: string, color?: string, width?: number) {
			update((state) => {
				const board = state.boards.get(boardId);
				if (!board) return state;

				if (color !== undefined) {
					board.settings.drawingColor = color;
				}
				if (width !== undefined) {
					board.settings.drawingWidth = width;
				}

				saveToStorage(state);
				return state;
			});
		},

		// Connection operations
		addConnection(boardId: string, fromNodeId: string, toNodeId: string, label?: string) {
			update((state) => {
				const board = state.boards.get(boardId);
				if (!board) return state;

				// Create snapshot before adding
				const snapshot = createSnapshot(board, 'Add connection');
				addToHistory(board, snapshot);

				const newConnection: StoryBoardConnection = {
					id: crypto.randomUUID(),
					fromNodeId,
					toNodeId,
					lineType: 'solid',
					label,
					endMarker: 'arrow',
					metadata: {
						createdAt: new Date()
					}
				};

				board.connections.push(newConnection);
				board.metadata.updatedAt = new Date();
				saveToStorage(state);
				return state;
			});
		},

		deleteConnection(boardId: string, connectionId: string) {
			update((state) => {
				const board = state.boards.get(boardId);
				if (!board) return state;

				// Create snapshot before deleting
				const snapshot = createSnapshot(board, 'Delete connection');
				addToHistory(board, snapshot);

				board.connections = board.connections.filter((c) => c.id !== connectionId);
				board.metadata.updatedAt = new Date();
				saveToStorage(state);
				return state;
			});
		},

		updateConnection(boardId: string, connectionId: string, updates: Partial<StoryBoardConnection>) {
			update((state) => {
				const board = state.boards.get(boardId);
				if (!board) return state;

				const connection = board.connections.find((c) => c.id === connectionId);
				if (connection) {
					Object.assign(connection, updates);
					board.metadata.updatedAt = new Date();
					saveToStorage(state);
				}
				return state;
			});
		},

		// Connection mode operations
		startConnection(nodeId: string) {
			update((state) => {
				state.connectingFromNodeId = nodeId;
				return state;
			});
		},

		completeConnection(toNodeId: string, label?: string) {
			update((state) => {
				if (state.connectingFromNodeId && state.connectingFromNodeId !== toNodeId && state.activeBoardId) {
					const board = state.boards.get(state.activeBoardId);
					if (board) {
						// Create snapshot before adding
						const snapshot = createSnapshot(board, 'Add connection');
						addToHistory(board, snapshot);

						const newConnection: StoryBoardConnection = {
							id: crypto.randomUUID(),
							fromNodeId: state.connectingFromNodeId,
							toNodeId,
							lineType: 'solid',
							label,
							endMarker: 'arrow',
							metadata: {
								createdAt: new Date()
							}
						};

						board.connections.push(newConnection);
						board.metadata.updatedAt = new Date();
						saveToStorage(state);
					}
				}
				state.connectingFromNodeId = null;
				return state;
			});
		},

		cancelConnection() {
			update((state) => {
				state.connectingFromNodeId = null;
				return state;
			});
		},

		// Group operations
		groupNodes(boardId: string, nodeIds: string[], groupId: string) {
			update((state) => {
				const board = state.boards.get(boardId);
				if (!board) return state;

				// Assign groupId to specified nodes
				nodeIds.forEach((nodeId) => {
					const node = board.nodes.find((n) => n.id === nodeId);
					if (node) {
						node.groupId = groupId;
						node.metadata.updatedAt = new Date();
					}
				});

				board.metadata.updatedAt = new Date();
				saveToStorage(state);
				return state;
			});
		},

		ungroupNodes(boardId: string, nodeIds: string[]) {
			update((state) => {
				const board = state.boards.get(boardId);
				if (!board) return state;

				// Remove groupId from specified nodes
				nodeIds.forEach((nodeId) => {
					const node = board.nodes.find((n) => n.id === nodeId);
					if (node) {
						node.groupId = undefined;
						node.metadata.updatedAt = new Date();
					}
				});

				board.metadata.updatedAt = new Date();
				saveToStorage(state);
				return state;
			});
		},

		// Story Engine card operations
		rotateStoryEngineCard(boardId: string, nodeId: string, direction: 'next' | 'prev') {
			update((state) => {
				const board = state.boards.get(boardId);
				if (!board) return state;

				const node = board.nodes.find((n) => n.id === nodeId);
				if (!node || !node.storyEngineCard) return state;

				const maxIndex = node.storyEngineCard.cues.length - 1;
				let newIndex = node.storyEngineCard.activeCueIndex;

				if (direction === 'next') {
					newIndex = newIndex >= maxIndex ? 0 : newIndex + 1;
				} else {
					newIndex = newIndex <= 0 ? maxIndex : newIndex - 1;
				}

				// Create new object reference to trigger reactivity
				node.storyEngineCard = {
					...node.storyEngineCard,
					activeCueIndex: newIndex
				};
				node.metadata.updatedAt = new Date();
				board.metadata.updatedAt = new Date();
				saveToStorage(state);
				return state;
			});
		},

		setStoryEngineCue(boardId: string, nodeId: string, cueIndex: number) {
			update((state) => {
				const board = state.boards.get(boardId);
				if (!board) return state;

				const node = board.nodes.find((n) => n.id === nodeId);
				if (!node || !node.storyEngineCard) return state;

				// Validate index
				if (cueIndex < 0 || cueIndex >= node.storyEngineCard.cues.length) {
					return state;
				}

				// Create new object reference to trigger reactivity
				node.storyEngineCard = {
					...node.storyEngineCard,
					activeCueIndex: cueIndex
				};
				node.metadata.updatedAt = new Date();
				board.metadata.updatedAt = new Date();
				saveToStorage(state);
				return state;
			});
		},

		// World Builder card operations
		rotateWorldBuilderCard(boardId: string, nodeId: string, direction: 'next' | 'prev') {
			update((state) => {
				const board = state.boards.get(boardId);
				if (!board) return state;

				const node = board.nodes.find((n) => n.id === nodeId);
				if (!node || !node.worldBuilderCard || !node.worldBuilderCard.cues) return state;

				const maxIndex = node.worldBuilderCard.cues.length - 1;
				let newIndex = node.worldBuilderCard.activeCueIndex;

				if (direction === 'next') {
					newIndex = newIndex >= maxIndex ? 0 : newIndex + 1;
				} else {
					newIndex = newIndex <= 0 ? maxIndex : newIndex - 1;
				}

				// Create new object reference to trigger reactivity
				node.worldBuilderCard = {
					...node.worldBuilderCard,
					activeCueIndex: newIndex
				};
				node.metadata.updatedAt = new Date();
				board.metadata.updatedAt = new Date();
				saveToStorage(state);
				return state;
			});
		},

		setWorldBuilderCue(boardId: string, nodeId: string, cueIndex: number) {
			update((state) => {
				const board = state.boards.get(boardId);
				if (!board) return state;

				const node = board.nodes.find((n) => n.id === nodeId);
				if (!node || !node.worldBuilderCard || !node.worldBuilderCard.cues) return state;

				// Validate index
				if (cueIndex < 0 || cueIndex >= node.worldBuilderCard.cues.length) {
					return state;
				}

				// Create new object reference to trigger reactivity
				node.worldBuilderCard = {
					...node.worldBuilderCard,
					activeCueIndex: cueIndex
				};
				node.metadata.updatedAt = new Date();
				board.metadata.updatedAt = new Date();
				saveToStorage(state);
				return state;
			});
		},

		// Lore Master card operations
		rotateLoreMasterCard(
			boardId: string,
			nodeId: string,
			position: 'primary' | 'top' | 'right' | 'bottom' | 'left',
			direction: 'next' | 'prev'
		) {
			update((state) => {
				const board = state.boards.get(boardId);
				if (!board) return state;

				const node = board.nodes.find((n) => n.id === nodeId);
				if (!node || !node.loreCluster) return state;

				const cluster = node.loreCluster;

				if (position === 'primary') {
					// Rotate primary card's primary cues
					const maxIndex = cluster.primaryCard.card.primaryCues.length - 1;
					let newIndex = cluster.primaryCard.activeCueIndex;

					if (direction === 'next') {
						newIndex = newIndex >= maxIndex ? 0 : newIndex + 1;
					} else {
						newIndex = newIndex <= 0 ? maxIndex : newIndex - 1;
					}

					// Create new object reference to trigger reactivity
					node.loreCluster = {
						...cluster,
						primaryCard: {
							...cluster.primaryCard,
							activeCueIndex: newIndex
						}
					};
				} else {
					// Rotate secondary card's secondary cues
					const cardKey = `${position}Card` as 'topCard' | 'rightCard' | 'bottomCard' | 'leftCard';
					const secondaryCard = cluster[cardKey];
					if (!secondaryCard) return state;

					const maxIndex = secondaryCard.card.secondaryCues.length - 1;
					let newIndex = secondaryCard.activeCueIndex;

					if (direction === 'next') {
						newIndex = newIndex >= maxIndex ? 0 : newIndex + 1;
					} else {
						newIndex = newIndex <= 0 ? maxIndex : newIndex - 1;
					}

					// Create new object reference to trigger reactivity
					node.loreCluster = {
						...cluster,
						[cardKey]: {
							...secondaryCard,
							activeCueIndex: newIndex
						}
					};
				}

				node.metadata.updatedAt = new Date();
				board.metadata.updatedAt = new Date();
				saveToStorage(state);
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

export const connectingFromNodeId = derived(storyboardStore, ($store) => $store.connectingFromNodeId);
