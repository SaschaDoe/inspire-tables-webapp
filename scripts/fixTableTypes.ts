import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

/**
 * Find tables that are incorrectly categorized
 * These are tables in specific directories but defaulting to Character type
 */
function findMiscategorizedTables() {
	console.log('🔍 Finding miscategorized tables...\n');

	const categoryDirs = [
		{ dir: 'dungeonTables', expectedType: 'Dungeon' },
		{ dir: 'factionTables', expectedType: 'Fraction' },
		{ dir: 'locationTables', expectedType: 'Location' },
		{ dir: 'monsterTables', expectedType: 'Monster' },
		{ dir: 'townTables', expectedType: 'Town' },
		{ dir: 'adventureTables', expectedType: 'Adventure' },
		{ dir: 'artefactTables', expectedType: 'Artefact' },
		{ dir: 'talentTables', expectedType: 'Talent' },
		{ dir: 'mythicTables', expectedType: 'SoloRPG' },
		{ dir: 'nationTables', expectedType: 'Nation' },
		{ dir: 'cultureTables', expectedType: 'Culture' },
		{ dir: 'campaignTables', expectedType: 'Campaign' },
		{ dir: 'magicTables', expectedType: 'Other' },
		{ dir: 'spellTables', expectedType: 'Other' },
		{ dir: 'questTables', expectedType: 'Other' },
		{ dir: 'illnessTables', expectedType: 'Other' }
	];

	const fixes: Array<{ file: string; currentType: string | null; expectedType: string }> = [];

	for (const { dir, expectedType } of categoryDirs) {
		const files = glob.sync(`src/lib/tables/${dir}/*Table.ts`, {
			cwd: process.cwd()
		});

		for (const file of files) {
			const content = fs.readFileSync(path.join(process.cwd(), file), 'utf-8');

			// Check if table specifies a type
			const hasDirectAssignment = /this\.tableType\s*=\s*TableType\.(\w+)/.test(content);
			const superWithTypeMatch = content.match(/super\s*\([^)]*,\s*[^,]+,\s*TableType\.(\w+)/);

			let currentType: string | null = null;
			if (hasDirectAssignment) {
				const match = content.match(/this\.tableType\s*=\s*TableType\.(\w+)/);
				currentType = match ? match[1] : null;
			} else if (superWithTypeMatch) {
				currentType = superWithTypeMatch[1];
			}

			// Check if super is called with only 2 params (defaults to Character)
			const superTwoParamsMatch = content.match(/super\s*\(\s*entries\s*,\s*TableTitles\.\w+\s*\)/);

			if (!currentType && superTwoParamsMatch) {
				currentType = 'Character'; // Default
			}

			if (currentType !== expectedType) {
				fixes.push({ file, currentType, expectedType });
			}
		}
	}

	console.log(`Found ${fixes.length} miscategorized tables:\n`);

	// Group by expected type
	const byType = new Map<string, typeof fixes>();
	for (const fix of fixes) {
		if (!byType.has(fix.expectedType)) {
			byType.set(fix.expectedType, []);
		}
		byType.get(fix.expectedType)!.push(fix);
	}

	byType.forEach((tables, type) => {
		console.log(`\n${type} (${tables.length} tables):`);
		tables.forEach((t) => {
			console.log(`  ${path.basename(t.file)} (currently: ${t.currentType || 'Character (default)'})`);
		});
	});

	return fixes;
}

/**
 * Fix the miscategorized tables
 */
function fixMiscategorizedTables(fixes: Array<{ file: string; currentType: string | null; expectedType: string }>) {
	console.log('\n\n🔧 Fixing miscategorized tables...\n');

	let fixed = 0;

	for (const { file, currentType, expectedType } of fixes) {
		const fullPath = path.join(process.cwd(), file);
		let content = fs.readFileSync(fullPath, 'utf-8');

		// Check if TableType is imported
		if (!content.includes('import') || !content.includes('TableType')) {
			// Add import
			const importMatch = content.match(/(import.*from ['"]\.\.\/table['"]);/);
			if (importMatch) {
				content = content.replace(
					importMatch[1],
					`${importMatch[1]}\nimport { TableType } from '../tableType';`
				);
			}
		}

		// If table currently has no type (defaults to Character), add it
		if (!currentType || currentType === 'Character') {
			// Find super call and add type
			const superMatch = content.match(/(super\s*\(\s*entries\s*,\s*TableTitles\.\w+)(\s*\))/);
			if (superMatch) {
				content = content.replace(
					superMatch[0],
					`${superMatch[1]}, TableType.${expectedType}${superMatch[2]}`
				);
				fs.writeFileSync(fullPath, content, 'utf-8');
				console.log(`✅ Fixed: ${path.basename(file)} → TableType.${expectedType}`);
				fixed++;
			}
		} else {
			// Table has wrong type, replace it
			if (content.includes(`this.tableType = TableType.${currentType}`)) {
				content = content.replace(
					`this.tableType = TableType.${currentType}`,
					`this.tableType = TableType.${expectedType}`
				);
				fs.writeFileSync(fullPath, content, 'utf-8');
				console.log(`✅ Fixed: ${path.basename(file)} → TableType.${expectedType}`);
				fixed++;
			}
		}
	}

	console.log(`\n✨ Fixed ${fixed} tables`);
}

// Run
const fixes = findMiscategorizedTables();

if (process.argv.includes('--fix')) {
	fixMiscategorizedTables(fixes);
	console.log('\n🔄 Next step: npm run generate:metadata\n');
} else {
	console.log('\n\nTo fix these tables, run: npm run fix:table-types');
	console.log('Then regenerate metadata: npm run generate:metadata\n');
}
