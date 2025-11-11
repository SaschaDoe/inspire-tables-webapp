import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';
import { DiceRole } from '../diceRole';

export class PlotTwistsTable extends Table {
	constructor() {
		const descriptors = ['Betrayal','Alliance','Revelation','Deception','Discovery','Loss','Gain','Transformation','Reversal','Escalation','De-Escalation','Complication','Simplification','Arrival','Departure','Death','Rebirth','Corruption','Redemption','Fall','Rise','Prophecy-Fulfilled','Prophecy-Broken','Identity-Revealed','Imposter-Exposed','Hidden-Agenda','True-Motive','Secret-Alliance','Secret-Enemy','Unexpected-Help','Unexpected-Obstacle','Time-Limit','No-Time-Limit','New-Threat','Threat-Eliminated','False-Victory','Pyrrhic-Victory','Total-Victory','Crushing-Defeat','Narrow-Escape','Capture','Release','Rescue','Abandonment','Sacrifice','Selfishness','Heroism','Cowardice','Love','Hatred','Forgiveness','Revenge','Justice','Injustice','Truth-Revealed','Lie-Exposed','Miracle','Disaster','Coincidence','Fate','Choice','Consequence','Cause','Effect','Connection','Separation','Reunion','First-Meeting','Last-Meeting','Beginning','Ending','Continuation','Interruption','Acceleration','Delay','Advancement','Setback','Success','Failure','Partial-Success','Mixed-Results','Unexpected-Ally','Unexpected-Enemy','Resource-Gained','Resource-Lost','Knowledge-Gained','Knowledge-Lost','Power-Gained','Power-Lost','Hope-Gained','Hope-Lost','Freedom-Gained','Freedom-Lost','War-Declared','Peace-Declared','Treaty-Broken','Treaty-Made'];
		const entries = descriptors.map((desc, i) => new TableEntry(desc).withRoleInterval(i + 1, i + 1));
		super(entries, TableTitles.MythicPlotTwists, TableType.SoloRPG, new DiceRole(1, 100));
	}
}
