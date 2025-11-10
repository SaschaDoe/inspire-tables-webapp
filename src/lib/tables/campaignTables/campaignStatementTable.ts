import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

const campaignStatements: string[] = [
	'Power corrupts, and absolute power corrupts absolutely',
	'The journey matters more than the destination',
	'Those who cannot remember the past are condemned to repeat it',
	'The road to hell is paved with good intentions',
	'The enemy of my enemy is my friend',
	'Nothing is as it seems',
	'Knowledge is power, but power can be dangerous',
	'The end justifies the means',
	'United we stand, divided we fall',
	'What is dead may never die',
	'The truth shall set you free',
	'Fortune favors the bold',
	'Every hero needs a villain',
	'Change is the only constant',
	'The price of freedom is eternal vigilance',
	'Those who hunt monsters should be careful not to become one',
	'Blood is thicker than water',
	'Revenge is a dish best served cold',
	'The strongest steel is forged in the hottest fire',
	'Trust no one',
	'Hope is the last thing to die',
	'War never changes',
	'History is written by the victors',
	'The pen is mightier than the sword',
	'Love conquers all',
	'Absolute freedom is absolute chaos',
	'The needs of the many outweigh the needs of the few',
	'All that glitters is not gold',
	'The truth is out there',
	'When you play the game of thrones, you win or you die',
	'Fear is the mind-killer',
	'With great power comes great responsibility',
	'The only thing we have to fear is fear itself',
	'The darkest hour is just before the dawn',
	'Every action has an equal and opposite reaction',
	'The gods have forsaken us',
	'Chaos is a ladder',
	'All men must die',
	'The night is dark and full of terrors',
	'Winter is coming',
	'Not all who wander are lost',
	'Even the smallest person can change the course of the future',
	'One does not simply walk into Mordor',
	'I am inevitable',
	'Balance must be maintained',
	'The cycle must be broken',
	'Destiny is not a matter of chance, it is a matter of choice',
	'There is no such thing as destiny, only choices',
	'The past can hurt, but you can either run from it or learn from it',
	'The world is changed by your example, not your opinion'
];

export class CampaignStatementTable extends Table {
	constructor() {
		const entries = campaignStatements.map((statement) => new TableEntry(statement));
		super(entries, TableTitles.CampaignStatement);
		this.tableType = TableType.Campaign;
	}
}
