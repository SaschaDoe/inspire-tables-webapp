import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface Recategorization {
	pattern: RegExp | string;
	fromType: string;
	toType: string;
	description: string;
}

/**
 * Tables to recategorize
 */
const recategorizations: Recategorization[] = [
	// All name tables → Name category
	{
		pattern: /Name|Nickname/i,
		fromType: 'Character|Other|Dungeon|Fraction',
		toType: 'Name',
		description: 'Name generation tables'
	},
	// World Creation Method → Location
	{
		pattern: 'WorldCreationMethodTable',
		fromType: 'Other',
		toType: 'Location',
		description: 'World Creation Method'
	},
	// Fraction tables from Other → Fraction
	{
		pattern: /^(FractionName|FractionQuest)Table$/,
		fromType: 'Other',
		toType: 'Fraction',
		description: 'Fraction tables'
	},
	// Generic Location table → Location
	{
		pattern: /^LocationTable$/,
		fromType: 'Other',
		toType: 'Location',
		description: 'Generic Location table'
	}
];

/**
 * Check if a file matches a pattern
 */
function matchesPattern(fileName: string, pattern: RegExp | string): boolean {
	if (typeof pattern === 'string') {
		return fileName.includes(pattern);
	}
	return pattern.test(fileName);
}

/**
 * Get the table type from file content
 */
function getCurrentType(content: string): string | null {
	const directMatch = content.match(/this\.tableType\s*=\s*TableType\.(\w+)/);
	if (directMatch) return directMatch[1];

	const superMatch = content.match(/super\s*\([^)]*,\s*[^,]+,\s*TableType\.(\w+)/);
	if (superMatch) return superMatch[1];

	// Default to Character if only 2 params
	if (/super\s*\(\s*entries\s*,\s*TableTitles\.\w+\s*\)/.test(content)) {
		return 'Character';
	}

	return null;
}

/**
 * Update table type in file
 */
function updateTableType(filePath: string, newType: string): boolean {
	let content = fs.readFileSync(filePath, 'utf-8');
	const currentType = getCurrentType(content);

	// Ensure TableType is imported
	if (!content.includes('TableType')) {
		const importMatch = content.match(/(import.*from ['"]\.\.\/table['"]);/);
		if (importMatch) {
			content = content.replace(
				importMatch[1],
				`${importMatch[1]}\nimport { TableType } from '../tableType';`
			);
		}
	}

	// Update or add type
	if (currentType && currentType !== newType) {
		if (content.includes(`this.tableType = TableType.${currentType}`)) {
			content = content.replace(
				`this.tableType = TableType.${currentType}`,
				`this.tableType = TableType.${newType}`
			);
		} else {
			// In super call
			content = content.replace(
				new RegExp(`TableType\\.${currentType}`, 'g'),
				`TableType.${newType}`
			);
		}
		fs.writeFileSync(filePath, content, 'utf-8');
		return true;
	} else if (!currentType) {
		// Add type to super call
		const superMatch = content.match(/(super\s*\(\s*entries\s*,\s*TableTitles\.\w+)(\s*\))/);
		if (superMatch) {
			content = content.replace(
				superMatch[0],
				`${superMatch[1]}, TableType.${newType}${superMatch[2]}`
			);
			fs.writeFileSync(filePath, content, 'utf-8');
			return true;
		}
	}

	return false;
}

/**
 * Main recategorization function
 */
function recategorizeTables() {
	console.log('🔄 Recategorizing tables...\n');

	const allTableFiles = glob.sync('src/lib/tables/**/*Table.ts', {
		cwd: process.cwd(),
		ignore: ['**/table.ts', '**/tableEntry.ts', '**/tableList.ts', '**/tableType.ts', '**/tableTitles.ts']
	});

	const changes: Array<{ file: string; from: string; to: string; desc: string }> = [];

	for (const file of allTableFiles) {
		const fileName = path.basename(file, '.ts');
		const fullPath = path.join(process.cwd(), file);
		const content = fs.readFileSync(fullPath, 'utf-8');
		const currentType = getCurrentType(content);

		if (!currentType) continue;

		// Check each recategorization rule
		for (const rule of recategorizations) {
			const fromTypes = rule.fromType.split('|');

			if (
				matchesPattern(fileName, rule.pattern) &&
				fromTypes.includes(currentType)
			) {
				if (updateTableType(fullPath, rule.toType)) {
					changes.push({
						file: fileName,
						from: currentType,
						to: rule.toType,
						desc: rule.description
					});
				}
				break; // Only apply first matching rule
			}
		}
	}

	// Print summary
	console.log(`✅ Recategorized ${changes.length} tables:\n`);

	const byCategory = new Map<string, typeof changes>();
	changes.forEach((change) => {
		const key = `${change.from} → ${change.to}`;
		if (!byCategory.has(key)) byCategory.set(key, []);
		byCategory.get(key)!.push(change);
	});

	byCategory.forEach((tables, category) => {
		console.log(`\n${category} (${tables.length} tables):`);
		tables.forEach((t) => console.log(`  ✓ ${t.file}`));
	});

	console.log(`\n\n🔄 Next step: npm run generate:metadata\n`);
}

// Run
recategorizeTables();
