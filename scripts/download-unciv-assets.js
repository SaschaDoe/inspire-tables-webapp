#!/usr/bin/env node

/**
 * Download Unciv Graphics Assets
 *
 * This script downloads terrain tiles, resource icons, and feature overlays
 * from the Unciv repository for use in the regional map viewer.
 *
 * Usage: node scripts/download-unciv-assets.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const UNCIV_BASE_URL = 'https://raw.githubusercontent.com/yairm210/Unciv/master/android/assets/ExtraImages';
const ASSETS_DIR = path.join(__dirname, '..', 'static', 'civ5-assets');

// Asset mappings: [filename, unciv_path]
const ASSETS = {
	terrain: [
		['Grassland.png', 'TerrainIcons/Grassland.png'],
		['Plains.png', 'TerrainIcons/Plains.png'],
		['Desert.png', 'TerrainIcons/Desert.png'],
		['Tundra.png', 'TerrainIcons/Tundra.png'],
		['Snow.png', 'TerrainIcons/Snow.png'],
		['Ocean.png', 'TerrainIcons/Ocean.png'],
		['Coast.png', 'TerrainIcons/Coast.png'],
		['Mountain.png', 'TerrainIcons/Mountain.png'],
		['Hill.png', 'TerrainIcons/Hill.png']
	],
	resources: [
		// Strategic
		['Iron.png', 'ResourceIcons/Iron.png'],
		['Horses.png', 'ResourceIcons/Horses.png'],
		['Coal.png', 'ResourceIcons/Coal.png'],
		['Oil.png', 'ResourceIcons/Oil.png'],
		['Aluminum.png', 'ResourceIcons/Aluminum.png'],
		['Uranium.png', 'ResourceIcons/Uranium.png'],

		// Luxury
		['Gold.png', 'ResourceIcons/Gold.png'],
		['Silver.png', 'ResourceIcons/Silver.png'],
		['Gems.png', 'ResourceIcons/Gems.png'],
		['Pearls.png', 'ResourceIcons/Pearls.png'],
		['Silk.png', 'ResourceIcons/Silk.png'],
		['Spices.png', 'ResourceIcons/Spices.png'],
		['Dyes.png', 'ResourceIcons/Dyes.png'],
		['Incense.png', 'ResourceIcons/Incense.png'],
		['Wine.png', 'ResourceIcons/Wine.png'],
		['Cotton.png', 'ResourceIcons/Cotton.png'],
		['Furs.png', 'ResourceIcons/Furs.png'],
		['Ivory.png', 'ResourceIcons/Ivory.png'],

		// Bonus
		['Wheat.png', 'ResourceIcons/Wheat.png'],
		['Cattle.png', 'ResourceIcons/Cattle.png'],
		['Deer.png', 'ResourceIcons/Deer.png'],
		['Fish.png', 'ResourceIcons/Fish.png'],
		['Stone.png', 'ResourceIcons/Stone.png'],
		['Sheep.png', 'ResourceIcons/Sheep.png'],
		['Bananas.png', 'ResourceIcons/Bananas.png'],
		['Bison.png', 'ResourceIcons/Bison.png']
	],
	features: [
		['Forest.png', 'TerrainFeatureIcons/Forest.png'],
		['Jungle.png', 'TerrainFeatureIcons/Jungle.png'],
		['Marsh.png', 'TerrainFeatureIcons/Marsh.png'],
		['Ice.png', 'TerrainFeatureIcons/Ice.png']
	],
	rivers: [
		['River-Bottom.png', 'RiverIcons/River-Bottom.png'],
		['River-BottomLeft.png', 'RiverIcons/River-BottomLeft.png'],
		['River-BottomRight.png', 'RiverIcons/River-BottomRight.png'],
		['River-TopLeft.png', 'RiverIcons/River-TopLeft.png'],
		['River-TopRight.png', 'RiverIcons/River-TopRight.png'],
		['River-Top.png', 'RiverIcons/River-Top.png']
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
	const categoryDir = path.join(ASSETS_DIR, category);

	// Ensure directory exists
	if (!fs.existsSync(categoryDir)) {
		fs.mkdirSync(categoryDir, { recursive: true });
	}

	console.log(`\n📦 Downloading ${category} assets...`);

	let successCount = 0;
	let failCount = 0;

	for (const [filename, uncivPath] of assets) {
		const url = `${UNCIV_BASE_URL}/${uncivPath}`;
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
	console.log('🎨 Downloading Unciv Graphics Assets');
	console.log('=====================================\n');
	console.log(`Target directory: ${ASSETS_DIR}`);

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
		console.log('\nNote: Some files may not be available in Unciv.');
		console.log('The viewer will fall back to colored hexes for missing assets.');

	} catch (err) {
		console.error('\n❌ Error during download:', err);
		process.exit(1);
	}
}

// Run if called directly
if (require.main === module) {
	main().catch(console.error);
}

module.exports = { downloadFile, downloadCategory };
