import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class SpellLoreTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		// Ancient and mystical origins
		entries.push(
			new TableEntry(
				'originating from ancient texts found in the ruins of a long-forgotten civilization, this knowledge harnesses the mysteries of the past'
			)
		);
		entries.push(
			new TableEntry(
				'discovered in the heart of a dying star, embodying the last whisper of celestial energy from a time long gone'
			)
		);
		entries.push(
			new TableEntry(
				'crafted by the first mages who walked the earth, imbued with the essence of the primal elements'
			)
		);
		entries.push(
			new TableEntry(
				'forged in the dark depths of the underworld, containing the secrets of life and death, a forbidden gift from the gods'
			)
		);
		entries.push(
			new TableEntry(
				'inspired by the songs of the siren, weaving the magic of allure and persuasion through ancient melodies'
			)
		);
		entries.push(
			new TableEntry(
				'drawn from the oldest tree in the enchanted forest, embodying the enduring strength and resilience of nature'
			)
		);
		entries.push(
			new TableEntry(
				'born from a pact with ancient spirits, channeling the wisdom and power of entities from beyond our world'
			)
		);
		entries.push(
			new TableEntry(
				'found etched on the walls of a cave hidden high in the mountains, speaking of the raw fury of the winds'
			)
		);
		entries.push(
			new TableEntry(
				"a creation influenced by the moon's mystic energies during a rare celestial alignment, tied to the ebb and flow of fate"
			)
		);
		entries.push(
			new TableEntry(
				"resulting from a scholar's lifetime of study, compressing the vast knowledge of the universe into arcane symbols"
			)
		);
		entries.push(
			new TableEntry(
				'a gift from the phoenix, carrying the promise of rebirth and renewal, a symbol of the cycle of life'
			)
		);
		entries.push(
			new TableEntry('conceived during a cosmic event, melding the fabric of reality with ancient magic')
		);
		entries.push(
			new TableEntry(
				'extracted from the dreams of dragons, filled with a fire that speaks of creation and destruction'
			)
		);
		entries.push(
			new TableEntry(
				'hewn from the deepest ice of the eternal glacier, holding secrets from a time before the memory of mortals'
			)
		);
		entries.push(
			new TableEntry(
				'whispered in the dead of night by the last of the shadow walkers, a testament to the power of darkness'
			)
		);
		// Sci-fi origins
		entries.push(
			new TableEntry(
				'engineered from the remnants of an ancient alien technology, revealing the possibilities of space and time manipulation'
			)
		);
		entries.push(
			new TableEntry(
				'developed in the secretive labs of the United Planetary Federation, showcasing the fusion of magic and science'
			)
		);
		entries.push(
			new TableEntry(
				'a result of cybernetic enhancements, revealing the ambition of mortals to transcend their natural limits'
			)
		);
		entries.push(
			new TableEntry(
				'born from the fusion of human DNA and extraterrestrial genes, marking a new era in the evolution of life'
			)
		);
		entries.push(
			new TableEntry(
				'extracted from the core of a neutron star, holding the secrets of gravitational forces from the dawn of the universe'
			)
		);
		entries.push(
			new TableEntry(
				'a relic of the first interstellar wars, a symbol of the endless struggle for power and survival'
			)
		);
		entries.push(
			new TableEntry(
				'reverse-engineered from the defensive mechanisms of a space-faring leviathan, a reminder of the adaptability of life'
			)
		);
		entries.push(
			new TableEntry(
				'inspired by the unpredictable storms of the gas giant Jupiter, embodying the chaotic nature of the cosmos'
			)
		);
		entries.push(
			new TableEntry(
				'created as a byproduct of experimental FTL travel research, challenging the boundaries of time and space'
			)
		);
		entries.push(
			new TableEntry(
				'derived from the study of black hole event horizons, exploring the mysteries of light and darkness'
			)
		);
		entries.push(
			new TableEntry(
				'conceived in the zero-gravity labs orbiting Earth, demonstrating the power of magnetic forces'
			)
		);
		entries.push(
			new TableEntry(
				'a gift from a now-extinct alien race, a reminder of the fragility and interconnectedness of life in the cosmos'
			)
		);
		entries.push(
			new TableEntry(
				'developed from the ancient art of galactic alchemy, challenging the very laws of nature and science'
			)
		);
		entries.push(
			new TableEntry(
				'stemming from the last great mind upload experiment, embodying the collective aspirations and fears of humanity'
			)
		);
		entries.push(
			new TableEntry(
				'harnessed from the energy fluctuations of collapsing stars, hinting at the destructive and creative power of the universe'
			)
		);
		// Dark and forbidden origins
		entries.push(
			new TableEntry(
				'conceived under the eclipse of a blood moon, a dark pact that speaks of ambition and sacrifice'
			)
		);
		entries.push(
			new TableEntry(
				'forged in the heart of a dying world, a lament for civilizations lost to time'
			)
		);
		entries.push(
			new TableEntry(
				'born from a pact with the void itself, a reminder of the thin line between creation and oblivion'
			)
		);
		entries.push(
			new TableEntry(
				'crafted from the whispers of the damned, a bridge between the world of the living and the realm of shadows'
			)
		);
		entries.push(
			new TableEntry(
				'discovered in the scorched ruins of a fallen kingdom, a testament to the cyclical nature of empires and civilizations'
			)
		);
		entries.push(
			new TableEntry(
				'a creation of necromantic rites, delving into the forbidden knowledge of life beyond death'
			)
		);
		entries.push(
			new TableEntry(
				'etched into the skin of the forsaken, carrying the weight of curses and the price of power'
			)
		);
		entries.push(
			new TableEntry(
				'spawned from the depths of the abyss, a dark mirror reflecting the fears and desires of the mortal heart'
			)
		);
		entries.push(
			new TableEntry(
				'hewn from the curse of a betrayed witch, a story of revenge and the dark paths it leads us down'
			)
		);
		entries.push(
			new TableEntry(
				'an abomination wrought by forbidden science, blurring the lines between life and the artificial'
			)
		);
		entries.push(
			new TableEntry(
				'whispered through the halls of the insane, exploring the fragility of the mind and the illusions of reality'
			)
		);
		entries.push(
			new TableEntry(
				'a gift from a god of chaos, challenging the illusion of order and the constructs of reality'
			)
		);
		entries.push(
			new TableEntry(
				"drawn from the venom of the galaxy's deadliest creature, a warning of the dangers that lurk in the unknown"
			)
		);
		entries.push(
			new TableEntry(
				'sealed within a tome bound in human skin, a grim collection of knowledge best left forgotten'
			)
		);
		entries.push(
			new TableEntry(
				"crafted in the image of a dark deity's wrath, a harbinger of the end times and the cycles of destruction and rebirth"
			)
		);
		// Academic and research origins
		entries.push(
			new TableEntry(
				'developed in the quiet halls of the Arcanum University, a symbol of the pursuit of knowledge and the thirst for understanding'
			)
		);
		entries.push(
			new TableEntry(
				'a breakthrough from the laboratories of the Advanced Science and Magic Integration Center, embodying the convergence of different realms of thought'
			)
		);
		entries.push(
			new TableEntry(
				'the product of a daring thesis, a challenge to the established norms and a testament to the spirit of innovation'
			)
		);
		entries.push(
			new TableEntry(
				'originating from a secret experiment, a glimpse into the potential futures shaped by our actions today'
			)
		);
		entries.push(
			new TableEntry(
				'conceived during a late-night study session, a reminder of the thin veil between the known and the unknown'
			)
		);
		entries.push(
			new TableEntry(
				'the result of a collaborative project, symbolizing the unity of purpose and the blending of horizons'
			)
		);
		entries.push(
			new TableEntry(
				'crafted in the secluded towers, a guard over secrets too powerful or dangerous for the outside world'
			)
		);
		entries.push(
			new TableEntry(
				'a product of genetic engineering, a beacon of hope for the adaptation and survival of life across the stars'
			)
		);
		entries.push(
			new TableEntry(
				'born from a controversial experiment, a questioning of the moral boundaries in the quest for knowledge'
			)
		);
		entries.push(
			new TableEntry(
				'developed by the Department of Temporal Studies, a speculative foray into the mysteries of time and its flow'
			)
		);
		entries.push(
			new TableEntry(
				'the outcome of an interdisciplinary project, a vision of a future where magic and technology are intertwined'
			)
		);
		entries.push(
			new TableEntry(
				'a discovery made in the dusty archives, an ode to the quest for understanding and the power of knowledge'
			)
		);
		entries.push(
			new TableEntry(
				'synthesized in the bio-magic labs, a symbol of the potential for magic to provide solutions to age-old problems'
			)
		);
		entries.push(
			new TableEntry(
				'hailing from the experimental magic program, a shield against the unknown, protecting the fragile seeds of civilization'
			)
		);
		entries.push(
			new TableEntry(
				'derived from thesis work, a testament to the endless possibilities that await at the intersection of magic and science'
			)
		);
		super(entries, TableTitles.SpellLore);
		this.tableType = TableType.Other;
	}
}
