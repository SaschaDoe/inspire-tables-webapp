#!/usr/bin/env node

/**
 * Download HexaRealm Tileset Graphics
 *
 * This script downloads terrain tiles, resource icons, and feature overlays
 * from the HexaRealm-Tileset repository (an Unciv tileset mod) for use in
 * the regional map viewer.
 *
 * Source: https://github.com/GeneralWadaling/HexaRealm-Tileset
 * Usage: node scripts/download-unciv-assets.js
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TILESET_BASE_URL = 'https://raw.githubusercontent.com/GeneralWadaling/HexaRealm-Tileset/main/Images/TileSets/HexaRealm/Tiles';
const ASSETS_DIR = path.join(__dirname, '..', 'static', 'civ5-assets');

// Asset mappings: [local_filename, tileset_filename]
// HexaRealm has all files in the Tiles/ folder
const ASSETS = {
	terrain: [
		['Grassland.png', 'Grassland.png'],
		['Plains.png', 'Plains.png'],
		['Desert.png', 'Desert.png'],
		['Tundra.png', 'Tundra.png'],
		['Snow.png', 'Snow.png'],
		['Ocean.png', 'Ocean.png'],
		['Coast.png', 'Coast.png'],
		['Mountain.png', 'Mountain.png'],
		['Hill.png', 'Hill.png']
	],
	resources: [
		// Strategic
		['Iron.png', 'Iron.png'],
		['Horses.png', 'Horses.png'],
		['Coal.png', 'Coal.png'],
		['Oil.png', 'Oil.png'],
		['Aluminum.png', 'Aluminium.png'], // Note: spelled differently in tileset
		['Uranium.png', 'Uranium.png'],

		// Luxury
		['Gold.png', 'Gold Ore.png'], // Note: "Gold Ore" in tileset
		['Silver.png', 'Silver.png'],
		['Gems.png', 'Gems.png'],
		['Pearls.png', 'Pearls.png'],
		['Silk.png', 'Silk.png'],
		['Spices.png', 'Spices.png'],
		['Dyes.png', 'Dyes.png'],
		['Incense.png', 'Incense.png'],
		['Wine.png', 'Wine.png'],
		['Cotton.png', 'Cotton.png'],
		['Furs.png', 'Furs.png'],
		['Ivory.png', 'Ivory.png'],

		// Bonus
		['Wheat.png', 'Wheat.png'],
		['Cattle.png', 'Cattle.png'],
		['Deer.png', 'Deer.png'],
		['Fish.png', 'Fish.png'],
		['Stone.png', 'Stone.png'],
		['Sheep.png', 'Sheep.png'],
		['Bananas.png', 'Bananas.png'],
		['Bison.png', 'Bison.png']
	],
	features: [
		['Forest.png', 'Forest.png'],
		['Jungle.png', 'Jungle.png'],
		['Marsh.png', 'Marsh.png'],
		['Ice.png', 'Ice.png']
	],
	rivers: [
		// HexaRealm doesn't have separate river sprites, we'll skip these
		// The viewer will fall back to simple blue lines
	]
};

/**
 * Download a file from URL to destination
 */
function downloadFile(url, dest) {
	return new Promise((resolve, reject) => {
		const file = fs.createWriteStream(dest);

		https.get(url, (response) => {
			if (response.statusCode === 200) {
				response.pipe(file);
				file.on('finish', () => {
					file.close();
					resolve();
				});
			} else if (response.statusCode === 404) {
				file.close();
				fs.unlinkSync(dest);
				reject(new Error(`File not found: ${url}`));
			} else {
				file.close();
				fs.unlinkSync(dest);
				reject(new Error(`HTTP ${response.statusCode}: ${url}`));
			}
		}).on('error', (err) => {
			file.close();
			fs.unlinkSync(dest);
			reject(err);
		});
	});
}

/**
 * Download all assets for a category
 */
async function downloadCategory(category, assets) {
	// Skip empty categories
	if (!assets || assets.length === 0) {
		console.log(`\n⏭️  Skipping ${category} - no assets to download`);
		return;
	}

	const categoryDir = path.join(ASSETS_DIR, category);

	// Ensure directory exists
	if (!fs.existsSync(categoryDir)) {
		fs.mkdirSync(categoryDir, { recursive: true });
	}

	console.log(`\n📦 Downloading ${category} assets...`);

	let successCount = 0;
	let failCount = 0;

	for (const [filename, tilesetPath] of assets) {
		const url = `${TILESET_BASE_URL}/${tilesetPath}`;
		const dest = path.join(categoryDir, filename);

		try {
			await downloadFile(url, dest);
			console.log(`  ✓ ${filename}`);
			successCount++;
		} catch (err) {
			console.log(`  ✗ ${filename} - ${err.message}`);
			failCount++;
		}
	}

	console.log(`  ${successCount} succeeded, ${failCount} failed`);
}

/**
 * Main download function
 */
async function main() {
	console.log('🎨 Downloading HexaRealm Tileset Graphics');
	console.log('==========================================\n');
	console.log(`Source: HexaRealm-Tileset by GeneralWadaling`);
	console.log(`Target directory: ${ASSETS_DIR}\n`);

	// Check if directory exists
	if (!fs.existsSync(ASSETS_DIR)) {
		console.error('❌ Error: civ5-assets directory not found!');
		console.error('Please create it first: mkdir -p static/civ5-assets');
		process.exit(1);
	}

	try {
		// Download each category
		for (const [category, assets] of Object.entries(ASSETS)) {
			await downloadCategory(category, assets);
		}

		console.log('\n✅ Download complete!');
		console.log('\nNote: Rivers will use simple lines (HexaRealm has no separate river sprites).');
		console.log('The viewer will fall back to colored hexes for any missing assets.');

	} catch (err) {
		console.error('\n❌ Error during download:', err);
		process.exit(1);
	}
}

// Run if called directly
main().catch(console.error);

export { downloadFile, downloadCategory };
