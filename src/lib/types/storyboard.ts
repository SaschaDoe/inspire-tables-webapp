import type { EntityType } from './entity';

export interface StoryBoardNode {
	id: string;
	entityId: string | null; // Reference to Entity (null for free-form cards)
	entityType?: EntityType; // Campaign, Character, Location, etc.

	// Positioning
	x: number; // Canvas coordinates
	y: number;
	width: number; // Default: 150
	height: number; // Auto-size based on content

	// Visual
	color?: string; // Override default color
	icon?: string; // Override default icon

	// Content
	label?: string; // Override entity name
	notes?: string; // Quick notes (multiline)

	// State
	selected: boolean; // Currently selected for editing
	locked: boolean; // Prevent accidental moves
	collapsed: boolean; // Show minimal info
	layer: number; // Z-index layer (0 = back, 10 = front)

	// Entity sync
	entityError?: 'deleted' | 'not-found'; // Track broken references

	metadata: {
		createdAt: Date;
		updatedAt: Date;
	};
}

export interface StoryBoardDrawing {
	id: string;
	type: 'freehand' | 'line' | 'arrow' | 'rectangle' | 'circle' | 'text';

	// Path data (for freehand, line, arrow)
	points?: { x: number; y: number }[];

	// Shape data (for rectangle, circle)
	x?: number;
	y?: number;
	width?: number;
	height?: number;
	radius?: number;

	// Text data
	text?: string;
	fontSize?: number;
	fontFamily?: string;

	// Style
	stroke: string; // Color
	strokeWidth: number; // Thickness
	fill?: string; // For shapes
	opacity: number; // 0-1

	// Rendering
	layer: number; // Z-index (can draw behind or in front of cards)
	smoothing?: number; // Curve smoothing (0-1)

	metadata: {
		createdAt: Date;
	};
}

export interface StoryBoardConnection {
	id: string;
	fromNodeId: string;
	toNodeId: string;

	// Style
	lineType: 'solid' | 'dashed' | 'dotted';
	color?: string;

	// Labels
	label?: string; // e.g., "leads to", "causes"

	// Visual
	startMarker?: 'none' | 'arrow' | 'circle';
	endMarker?: 'arrow' | 'circle';

	// Routing
	points?: { x: number; y: number }[]; // For curved/manual routing

	metadata: {
		createdAt: Date;
	};
}

export interface BoardSnapshot {
	timestamp: Date;
	nodes: StoryBoardNode[];
	connections: StoryBoardConnection[];
	drawings: StoryBoardDrawing[];
	action: string; // Description for undo UI: "Add card", "Move 3 cards"
}

export interface SwimLane {
	id: string;
	name: string;
	y: number; // Y position on canvas
	height: number;
	color: string;
}

export interface NodeGroup {
	id: string;
	name: string;
	nodeIds: string[];
	color: string;
	collapsed: boolean;
}

export interface StoryBoard {
	id: string;
	adventureId: string; // Which adventure this board belongs to
	name: string; // E.g., "Main Plot", "Character Relationships"

	// Content
	nodes: StoryBoardNode[];
	connections: StoryBoardConnection[];
	drawings: StoryBoardDrawing[]; // Freehand annotations

	// Canvas state
	viewport: {
		x: number; // Pan offset
		y: number;
		zoom: number; // 0.5 - 2.0
	};

	// Interaction state
	mode: 'select' | 'draw' | 'pan'; // Current tool mode
	selectedNodeIds: string[]; // Multi-select

	// History for undo/redo
	history: BoardSnapshot[];
	historyIndex: number; // Current position in history
	maxHistory: number; // Keep last N snapshots (default 20)

	// Organization
	swimLanes?: SwimLane[];
	groups?: NodeGroup[];

	// Settings
	settings: {
		gridSize: number; // Default: 20
		snapToGrid: boolean; // Default: false
		showGrid: boolean; // Default: true
		autoArrange: boolean;
		theme: 'dark' | 'light';
		drawingColor: string; // Current drawing color
		drawingWidth: number; // Current stroke width
	};

	metadata: {
		createdAt: Date;
		updatedAt: Date;
	};
}
