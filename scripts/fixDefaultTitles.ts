import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

/**
 * List of tables that currently use TableTitles.Default
 * Generated from: grep -B3 "title: TableTitles.Default" tableMetadata.generated.ts
 */
const tablesWithDefaultTitle = [
	'BalancingForTalentTable',
	'CurseTable',
	'ImprovementTable',
	'KnowledgeTable',
	'MagicAbilityTable',
	'MagicAttributeTable',
	'MagicChannelTable',
	'MagicCostTable',
	'MagicDifferentiationTable',
	'MagicEventTable',
	'MagicFailConsequenceTable',
	'MagicFluffTable',
	'MagicOriginTable',
	'MagicRuleTable',
	'MagicSecondLevelUseTable',
	'MagicSourceTable',
	'MagicSpellModifierTable',
	'MagicSystemFantasyNameFirstTable',
	'MagicSystemFantasyNameSecondTable',
	'MagicSystemReligionNameFirstTable',
	'MagicSystemReligionNameSecondTable',
	'MagicSystemSciFiNameFirstTable',
	'MagicSystemSciFiNameSecondTable',
	'MagicSystemWordingTable',
	'MagicVisualTable',
	'MagicWeaknessTable',
	'PowerArcTable',
	'PrevalenceTable',
	'QuantityTable',
	'SideEffectTable',
	'SimplifiedNpcActionTable',
	'TransferabilityTable'
];

/**
 * Convert className to TableTitle enum name
 * e.g., "SideEffectTable" -> "SideEffect"
 */
function classNameToEnumName(className: string): string {
	return className.replace(/Table$/, '');
}

/**
 * Convert className to human-readable title
 * e.g., "SideEffectTable" -> "Side Effect"
 */
function classNameToDisplayName(className: string): string {
	const enumName = classNameToEnumName(className);
	// Insert spaces before capital letters
	const withSpaces = enumName.replace(/([A-Z])/g, ' $1').trim();
	return withSpaces;
}

/**
 * Find the table file for a given class name
 */
function findTableFile(className: string): string | null {
	const files = glob.sync(`src/lib/tables/**/${className.charAt(0).toLowerCase() + className.slice(1)}.ts`, {
		cwd: process.cwd()
	});

	if (files.length === 0) {
		// Try without lowercasing first char
		const files2 = glob.sync(`src/lib/tables/**/${className}.ts`, {
			cwd: process.cwd()
		});
		return files2[0] || null;
	}

	return files[0];
}

/**
 * Main function to fix default titles
 */
function fixDefaultTitles(): void {
	console.log('🔧 Fixing Default Titles\n');
	console.log(`Found ${tablesWithDefaultTitle.length} tables to fix\n`);

	// Step 1: Generate enum entries for tableTitles.ts
	console.log('📝 Generated TableTitles enum entries:\n');
	console.log('Add these to src/lib/tables/tableTitles.ts:\n');

	const enumEntries: string[] = [];
	const updates: Array<{file: string, enumName: string}> = [];

	for (const className of tablesWithDefaultTitle) {
		const enumName = classNameToEnumName(className);
		const displayName = classNameToDisplayName(className);

		enumEntries.push(`\t${enumName} = '${displayName}',`);

		// Find the table file
		const filePath = findTableFile(className);
		if (filePath) {
			updates.push({ file: filePath, enumName });
		} else {
			console.warn(`⚠️  Could not find file for ${className}`);
		}
	}

	console.log(enumEntries.join('\n'));
	console.log('\n');

	// Step 2: Show file updates needed
	console.log('🔄 Table files to update:\n');
	for (const update of updates) {
		console.log(`   ${update.file}`);
		console.log(`   Change: TableTitles.Default → TableTitles.${update.enumName}`);
		console.log();
	}

	// Step 3: Offer to auto-update files
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
	console.log('\n📋 STEPS TO FIX:\n');
	console.log('1. Add the enum entries above to src/lib/tables/tableTitles.ts');
	console.log('2. Run: npm run fix:update-titles   (to update table files)');
	console.log('3. Run: npm run generate:metadata  (to regenerate metadata)');
	console.log('\nAlternatively, manually update each file to use the correct TableTitle.');
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

/**
 * Update table files to use proper titles (called after enum is updated)
 */
export function updateTableFiles(): void {
	console.log('🔄 Updating table files...\n');

	let updated = 0;
	let failed = 0;

	for (const className of tablesWithDefaultTitle) {
		const enumName = classNameToEnumName(className);
		const filePath = findTableFile(className);

		if (!filePath) {
			console.warn(`⚠️  Could not find file for ${className}`);
			failed++;
			continue;
		}

		const fullPath = path.join(process.cwd(), filePath);
		const content = fs.readFileSync(fullPath, 'utf-8');

		// Replace TableTitles.Default with TableTitles.EnumName
		const updatedContent = content.replace(
			/TableTitles\.Default/g,
			`TableTitles.${enumName}`
		);

		if (content !== updatedContent) {
			fs.writeFileSync(fullPath, updatedContent, 'utf-8');
			console.log(`✅ Updated: ${filePath} → TableTitles.${enumName}`);
			updated++;
		} else {
			console.log(`⏭️  Skipped: ${filePath} (no changes needed)`);
		}
	}

	console.log(`\n✨ Updated ${updated} files`);
	if (failed > 0) {
		console.log(`⚠️  Failed to find ${failed} files`);
	}
	console.log('\nNext step: npm run generate:metadata\n');
}

// Check if we're running in update mode
const args = process.argv.slice(2);
if (args.includes('--update')) {
	updateTableFiles();
} else {
	fixDefaultTitles();
}
