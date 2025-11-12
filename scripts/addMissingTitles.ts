import * as fs from 'fs';
import * as path from 'path';

/**
 * Convert CamelCase to Title Case with spaces
 * e.g., "ElfenFemaleName" -> "Elfen Female Name"
 */
function camelToTitleCase(str: string): string {
	// Add space before capital letters (except first)
	const withSpaces = str.replace(/([A-Z])/g, ' $1').trim();
	return withSpaces;
}

/**
 * Find all missing TableTitles enum entries
 */
function findMissingTitles() {
	// Read generated metadata to find titles
	const metadataPath = path.join(process.cwd(), 'src', 'lib', 'data', 'tableMetadata.generated.ts');
	const metadata = fs.readFileSync(metadataPath, 'utf-8');

	// Extract all titles that are CamelCase (missing from enum)
	const titleMatches = metadata.matchAll(/"title":\s*"([A-Z][a-z]*[A-Z][^"]*)"/g);
	const missingTitles = new Set<string>();

	for (const match of titleMatches) {
		missingTitles.add(match[1]);
	}

	return Array.from(missingTitles).sort();
}

/**
 * Add missing titles to tableTitles.ts
 */
function addMissingTitlesToEnum(missingTitles: string[]) {
	const tableTitlesPath = path.join(process.cwd(), 'src', 'lib', 'tables', 'tableTitles.ts');
	let content = fs.readFileSync(tableTitlesPath, 'utf-8');

	// Find the last enum entry
	const lastEnumMatch = content.match(/\n\t([A-Z]\w+)\s*=\s*'[^']+',?\n\}/);
	if (!lastEnumMatch) {
		console.error('Could not find last enum entry');
		return;
	}

	// Generate new enum entries
	const newEntries = missingTitles.map((title) => {
		const displayName = camelToTitleCase(title);
		return `\t${title} = '${displayName}',`;
	});

	// Insert before the closing brace
	const insertPosition = content.lastIndexOf('\n}');
	const before = content.substring(0, insertPosition);
	const after = content.substring(insertPosition);

	const newContent = before + '\n\n\t// Auto-added missing titles\n' + newEntries.join('\n') + after;

	fs.writeFileSync(tableTitlesPath, newContent, 'utf-8');
	console.log(`✅ Added ${missingTitles.length} missing titles to tableTitles.ts`);
}

// Run
const missingTitles = findMissingTitles();

console.log(`Found ${missingTitles.length} missing titles:\n`);
missingTitles.forEach((title) => {
	console.log(`  ${title} → "${camelToTitleCase(title)}"`);
});

if (process.argv.includes('--add')) {
	console.log('\n🔧 Adding missing titles...\n');
	addMissingTitlesToEnum(missingTitles);
	console.log('\n🔄 Next step: npm run generate:metadata\n');
} else {
	console.log('\n\nTo add these titles, run: npm run fix:add-missing-titles');
	console.log('Then regenerate metadata: npm run generate:metadata\n');
}
