import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

const hexTileHazards: string[] = [
	'quick sand or sinkholes',
	'toxic gas emissions from underground sources',
	'thorny or magical vegetation with ensnaring properties',
	'dangerous wildlife, including mythical beasts',
	'haunted or cursed areas causing psychological or magical effects',
	'treacherous cliffs or hidden chasms',
	'muddy or enchanted ground that impedes movement',
	'strong currents or enchanted whirlpools in rivers or lakes',
	'magical anomalies or zones of wild magic that alter or negate spells',
	'unstable portals to other realms',
	'invisible or arcane barriers that block passage',
	'areas of intense magical radiation',
	'ancient traps or wards left by forgotten civilizations',
	'disease outbreaks caused by magical plagues',
	'bandit ambushes or marauding fantasy creatures',
	'hostile tribes of goblins, orcs, or other fantasy races',
	'ancient ruins with protective enchantments or curses',
	'collapsing underground dungeons or caves',
	'mirages conjured by mischievous spirits or magic',
	'confusing mazes or labyrinths appearing in forests or canyons',
	'anti-magic zones that nullify magical abilities',
	'polluted areas cursed by dark magic',
	'entangling magical vines or carnivorous plants',
	'mystical energy storms draining life force or magic',
	'slippery surfaces caused by magical ice or slime',
	'areas with altered gravity or spatial properties',
	'intense magnetic fields created by magical ores',
	'illusory landscapes crafted by powerful illusions',
	'territorial elemental beings or guardians',
	'psychic resonance areas causing shared hallucinations',
	'rogue golems or magical constructs on the loose',
	'deadly magical spores or pollen from ancient plants',
	'ethereal rifts attracting malevolent spirits',
	'narrow passes guarded by dragons or other mythical creatures',
	'subterranean openings leading to magical realms or dungeons',
	'cursed statues or monuments that bring misfortune to those who approach',
	'enchanted forests that rearrange their paths',
	'lakes with siren-like creatures luring travelers',
	'fields of crystals that emit disorienting frequencies',
	'regions where shadows come to life at night',
	'vortexes of wind and magic causing disarray',
	'areas where time flows differently'
];

export class HexTileHazardTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		hexTileHazards.forEach((hazard) => {
			entries.push(new TableEntry(hazard));
		});
		super(entries, TableTitles.HexTileHazard);
		this.tableType = TableType.Location;
	}
}

export { hexTileHazards };
