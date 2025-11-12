import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class SpellCounterTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		// Physical countermeasures
		entries.push(new TableEntry('sprinkle salt to disrupt enchantments'));
		entries.push(new TableEntry('place a mirror to deflect mystical energies'));
		entries.push(new TableEntry('employ magnetic fields to interfere with arcane currents'));
		entries.push(new TableEntry('scatter rose petals to calm aggressive forces'));
		entries.push(new TableEntry('wear a pendant of obsidian to absorb negative influences'));
		entries.push(new TableEntry('use a flash of bright light to momentarily blind and disorient'));
		entries.push(new TableEntry('carry a piece of iron for protection against ethereal entities'));
		entries.push(new TableEntry('draw symbols in chalk as a ward against unwanted magic'));
		entries.push(new TableEntry('hum a discordant melody to break concentration'));
		entries.push(
			new TableEntry('throw a handful of dust to create a smokescreen and escape detection')
		);
		entries.push(new TableEntry('wear gloves lined with lead to handle cursed objects safely'));
		entries.push(
			new TableEntry('use a tuning fork to create vibrations that disrupt magical constructs')
		);
		entries.push(
			new TableEntry("carry a locket containing a loved one's hair for emotional grounding")
		);
		entries.push(new TableEntry('place a boundary of running water to block pursuing forces'));
		entries.push(new TableEntry('use a simple string looped in a complex pattern to trap spirits'));
		entries.push(new TableEntry('employ static electricity to neutralize charged magical fields'));
		entries.push(new TableEntry('release a cloud of ink or smoke for a quick concealment'));
		entries.push(new TableEntry('wear a carved wooden talisman as a general safeguard'));
		entries.push(new TableEntry('use a polished steel band to reflect and disperse focused energy'));
		entries.push(new TableEntry('spray vinegar to erode magical sigils and symbols'));
		// Emotional/spiritual countermeasures
		entries.push(
			new TableEntry('achieve a state of complete mindfulness to render the curse powerless')
		);
		entries.push(new TableEntry("find true love to break the spell's hold"));
		entries.push(new TableEntry('repay an act of kindness to someone who wronged you'));
		entries.push(new TableEntry('complete a deed of genuine selflessness'));
		entries.push(new TableEntry("solve an ancient riddle that embodies the curse's essence"));
		entries.push(new TableEntry('forge a bond of trust with an enemy'));
		entries.push(
			new TableEntry('return a lost item of great personal value to its rightful owner')
		);
		entries.push(
			new TableEntry('make peace with a past mistake through a significant act of redemption')
		);
		entries.push(new TableEntry('laugh genuinely in the face of your deepest fears'));
		entries.push(
			new TableEntry(
				"reach a moment of true understanding with someone you've deeply misunderstood"
			)
		);
		entries.push(
			new TableEntry('perform a significant act of bravery without any expectation of reward')
		);
		entries.push(new TableEntry('forgive someone who has caused you irreparable harm'));
		entries.push(new TableEntry('overcome a personal limitation or fear that has held you back'));
		entries.push(
			new TableEntry('reconnect with a forgotten friend or family member with genuine intent')
		);
		entries.push(new TableEntry('dedicate a day to spreading joy without speaking a word of it'));
		entries.push(new TableEntry('witness a natural wonder that leaves you speechless'));
		entries.push(
			new TableEntry(
				"complete a journey on foot that takes you to a place you've never seen before"
			)
		);
		entries.push(
			new TableEntry('teach someone a valuable skill or lesson without seeking anything in return')
		);
		entries.push(new TableEntry('receive a genuine compliment from a child'));
		entries.push(
			new TableEntry(
				'write a letter of gratitude to someone who has influenced your life, without sending it'
			)
		);
		super(entries, TableTitles.SpellCounter);
		this.tableType = TableType.Other;
	}
}
