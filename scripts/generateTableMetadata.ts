import { glob } from 'glob';
import * as path from 'path';
import * as fs from 'fs';

interface TableMetadata {
	title: string;
	type: string;
	importPath: string;
	className: string;
}

interface TableCategory {
	type: string;
	tables: TableMetadata[];
}

/**
 * Extract the exported class name from a TypeScript file
 */
function extractClassName(fileContent: string): string | null {
	const match = fileContent.match(/export\s+class\s+(\w+)/);
	return match ? match[1] : null;
}

/**
 * Convert file path to import path relative to src/lib/tables
 */
function getImportPath(filePath: string): string {
	// Convert absolute path to relative path from src/lib/tables
	const relativePath = path.relative(
		path.join(process.cwd(), 'src', 'lib', 'tables'),
		filePath
	);
	// Remove .ts extension
	return relativePath.replace(/\.ts$/, '').replace(/\\/g, '/');
}

/**
 * Extract table title from super() call
 * Looks for: super(entries, TableTitles.XXX, ...)
 */
function extractTableTitle(fileContent: string): string | null {
	// Match super call with TableTitles
	const superMatch = fileContent.match(/super\([^)]*TableTitles\.(\w+)/);
	if (superMatch) {
		return superMatch[1];
	}

	// Some tables might use different patterns
	const titleMatch = fileContent.match(/this\.title\s*=\s*TableTitles\.(\w+)/);
	return titleMatch ? titleMatch[1] : null;
}

/**
 * Extract table type from tableType assignment or super() call
 * Looks for:
 * - this.tableType = TableType.XXX
 * - super(entries, TableTitles.XXX, TableType.YYY, ...)
 */
function extractTableType(fileContent: string): string | null {
	// First try direct assignment
	const directMatch = fileContent.match(/this\.tableType\s*=\s*TableType\.(\w+)/);
	if (directMatch) {
		return directMatch[1];
	}

	// Try to find it in super() call as third parameter
	// Pattern: super(..., ..., TableType.XXX, ...)
	const superMatch = fileContent.match(/super\s*\([^)]*,\s*[^,]+,\s*TableType\.(\w+)/);
	if (superMatch) {
		return superMatch[1];
	}

	// If no explicit type found, default to Character (as per Table constructor default)
	// Check if super is called with only 2 parameters (entries and title)
	const superCallMatch = fileContent.match(/super\s*\(\s*entries\s*,\s*TableTitles\.\w+\s*\)/);
	if (superCallMatch) {
		return 'Character'; // Default type from Table constructor
	}

	return null;
}

/**
 * Extract table metadata by parsing the file content
 */
function extractTableMetadata(filePath: string): TableMetadata | null {
	try {
		const fileContent = fs.readFileSync(filePath, 'utf-8');
		const className = extractClassName(fileContent);

		if (!className) {
			console.warn(`⚠️  Could not find class name in ${filePath}`);
			return null;
		}

		const title = extractTableTitle(fileContent);
		if (!title) {
			console.warn(`⚠️  Could not find table title in ${filePath}`);
			return null;
		}

		const type = extractTableType(fileContent);
		if (!type) {
			console.warn(`⚠️  Could not find table type in ${filePath}`);
			return null;
		}

		const importPath = getImportPath(filePath);

		return {
			title,
			type,
			importPath,
			className
		};
	} catch (error) {
		console.error(`❌ Error processing ${filePath}:`, error);
		return null;
	}
}

/**
 * Generate table metadata from all table files
 */
function generateTableMetadata(): void {
	console.log('🔍 Scanning for table files...\n');

	// Find all *Table.ts files
	const tableFiles = glob.sync('src/lib/tables/**/*Table.ts', {
		cwd: process.cwd(),
		absolute: true,
		ignore: ['**/table.ts', '**/tableEntry.ts', '**/tableList.ts', '**/tableType.ts', '**/tableTitles.ts']
	});

	console.log(`📊 Found ${tableFiles.length} table files\n`);

	// Extract metadata from each file
	const allMetadata = tableFiles.map(extractTableMetadata).filter(Boolean) as TableMetadata[];

	console.log(`✅ Successfully processed ${allMetadata.length} tables\n`);

	// Group by table type
	const categoriesMap = new Map<string, TableMetadata[]>();

	for (const metadata of allMetadata) {
		if (!categoriesMap.has(metadata.type)) {
			categoriesMap.set(metadata.type, []);
		}
		categoriesMap.get(metadata.type)!.push(metadata);
	}

	// Sort tables within each category alphabetically by title
	categoriesMap.forEach((tables) => {
		tables.sort((a, b) => a.title.localeCompare(b.title));
	});

	// Convert to array and sort categories
	const categories: TableCategory[] = Array.from(categoriesMap.entries())
		.map(([type, tables]) => ({ type, tables }))
		.sort((a, b) => {
			// Custom sort order for categories
			const order = [
				'Character',
				'Location',
				'Dungeon',
				'Artefact',
				'Talent',
				'Monster',
				'Adventure',
				'Town',
				'Campaign',
				'Solo RPG',
				'Other'
			];
			const aIndex = order.indexOf(a.type);
			const bIndex = order.indexOf(b.type);
			if (aIndex === -1 && bIndex === -1) return a.type.localeCompare(b.type);
			if (aIndex === -1) return 1;
			if (bIndex === -1) return -1;
			return aIndex - bIndex;
		});

	// Print summary
	console.log('📋 Summary by category:\n');
	categories.forEach((cat) => {
		console.log(`  ${cat.type}: ${cat.tables.length} tables`);
	});
	console.log();

	// Generate TypeScript file
	const output = generateTypeScriptFile(categories);

	// Write to file
	const outputPath = path.join(process.cwd(), 'src', 'lib', 'data', 'tableMetadata.generated.ts');
	fs.writeFileSync(outputPath, output, 'utf-8');

	console.log(`✨ Generated: ${outputPath}\n`);
	console.log(`Total: ${allMetadata.length} tables across ${categories.length} categories`);
}

/**
 * Generate the TypeScript file content
 */
function generateTypeScriptFile(categories: TableCategory[]): string {
	// Import TableTitles to get actual enum values
	const tableTitlesPath = path.join(process.cwd(), 'src', 'lib', 'tables', 'tableTitles.ts');
	const tableTitlesContent = fs.readFileSync(tableTitlesPath, 'utf-8');

	// Extract enum values from TableTitles
	const titleMap = new Map<string, string>();
	const enumMatch = tableTitlesContent.match(/export\s+enum\s+TableTitles\s*\{([^}]+)\}/s);
	if (enumMatch) {
		const enumContent = enumMatch[1];
		const entries = enumContent.match(/(\w+)\s*=\s*'([^']+)'/g);
		if (entries) {
			entries.forEach((entry) => {
				const match = entry.match(/(\w+)\s*=\s*'([^']+)'/);
				if (match) {
					titleMap.set(match[1], match[2]);
				}
			});
		}
	}

	// Replace title enum keys with actual string values
	const categoriesWithStrings = categories.map((cat) => ({
		type: cat.type,
		tables: cat.tables.map((table) => ({
			...table,
			title: titleMap.get(table.title) || table.title
		}))
	}));

	return `// THIS FILE IS AUTO-GENERATED - DO NOT EDIT MANUALLY
// Run 'npm run generate:metadata' to regenerate this file
// Generated on: ${new Date().toISOString()}

import { TableType } from '$lib/tables/tableType';

export interface TableMetadata {
	title: string;
	type: TableType;
	importPath: string;
	className: string;
}

export interface TableCategory {
	type: TableType;
	tables: TableMetadata[];
}

// Lightweight metadata - no actual table imports
export const tableMetadata: TableCategory[] = ${JSON.stringify(categoriesWithStrings, null, '\t')
	.replace(/"type":\s*"([^"]+)"/g, 'type: TableType.$1')};

// Use Vite's glob import to create a map of all table modules
// This allows Vite to know all possible imports at build time
const tableModules = import.meta.glob('$lib/tables/**/*.ts');

// Helper function to lazy load a table
export async function loadTable(metadata: TableMetadata) {
	// Construct the full path that matches the glob pattern
	const modulePath = \`/src/lib/tables/\${metadata.importPath}.ts\`;

	// Find the matching module
	const moduleLoader = tableModules[modulePath];

	if (!moduleLoader) {
		console.error('Available modules:', Object.keys(tableModules));
		throw new Error(\`Could not find module for: \${modulePath}\`);
	}

	const module = await moduleLoader();
	const TableClass = (module as any)[metadata.className];
	return new TableClass();
}
`;
}

// Run the generator
try {
	generateTableMetadata();
} catch (error) {
	console.error('❌ Failed to generate table metadata:', error);
	process.exit(1);
}
