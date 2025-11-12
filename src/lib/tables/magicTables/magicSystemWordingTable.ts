import { Table } from '../table'
import { TableType } from '../tableType';;
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

const magicSystemWordings: string[] = [
	'arcane, wizardry, sorcery, magic, mysticism, thaumaturgy, witchcraft, occultism, theurgy, necromancy',
	'circuit, bug, quantum, nano, cyber, digital, bio, genetic, chemical, elemental, cosmic',
	'force, energy, power, aura, field, flow, essence, spirit, soul, mind, chi, ki, prana, mana, ether',
	'spell, ritual, incantation, charm, hex, curse, jinx, enchantment, bewitchment, conjuration',
	'fractal, algorithm, eigenvalue, parabola, quaternion, hyperbolic, topology, isomorphism',
	'chakra, aura, energy, flow, harmony, spirit, soul, prana, ki, chi',
	'voodoo, obeah, santeria, ifa, juju, orisha, loa, ancestor, shaman, divination',
	'sangoma, muti, nyambe, chitauri, mwari, muzimu, mwene-nyaga, nzambi, dziva, mami wata',
	'the force, the dark side, the light side, the balance, the living force, the unifying force',
	'the one power, the true source, the dark one, the creator, the pattern, the wheel of time',
	'runestone, seer, berserker, futhark, aesir, vanir, norns, valknut',
	'animal names and metaphors',
	'shamanic, totemic, ancestral, spirit, dreamwalker, medicine, vision, earth, sky, sun, moon, star',
	'psyche, ego, id, superego, subconscious, freudian, jungian, archetype, collective unconscious',
	'celestial, cosmic, starlight, nebula, galaxy, astral, comet, constellation, eclipse, supernova',
	'alchemy, philosopher\'s stone, hermetic, occult, renaissance, templar, druid, witch hunt, inquisition',
	'void, voidwalker, shadow, ethereal, phase, warp, rift, portal, dimension, transmutation',
	'cybernetic, enhancement, tech-augment, neural-hack, code-weave, datastream, firewall, encryption',
	'elemental, fire, water, earth, air, storm, lightning, ice, metal, wood, nature',
	'time, chronomancer, temporal, anomaly, continuum, paradox, rewind, fast-forward, pause, time-loop',
	'gravity, graviton, singularity, black hole, orbit, eclipse, anti-gravity, weightless',
	'light, luminary, photon, radiance, prism, spectrum, glow, beacon, aurora, illumination'
];

export class MagicSystemWordingTable extends Table {
	constructor() {
		const entries = magicSystemWordings.map((wording) => new TableEntry(wording));
		super(entries, TableTitles.MagicSystemWording, TableType.Other);
	}
}
