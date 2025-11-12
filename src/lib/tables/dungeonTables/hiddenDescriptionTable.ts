import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

export class HiddenDescriptionTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('buried under the floor'));
		entries.push(new TableEntry('concealed behind a false wall'));
		entries.push(new TableEntry('locked in a puzzle box'));
		entries.push(new TableEntry('guarded by a magical ward'));
		entries.push(new TableEntry('disguised as an ordinary object'));
		entries.push(new TableEntry('hidden within a statue'));
		entries.push(new TableEntry('sealed in a cursed sarcophagus'));
		entries.push(new TableEntry('placed in a chamber accessible only by secret passage'));
		entries.push(new TableEntry('stored in a dimensional pocket'));
		entries.push(new TableEntry('enchanted to be invisible'));
		entries.push(new TableEntry('suspended over a pit or chasm'));
		entries.push(new TableEntry('locked inside an enchanted chest'));
		entries.push(new TableEntry('tucked inside an ancient urn'));
		entries.push(new TableEntry('camouflaged with illusion magic'));
		entries.push(new TableEntry('encased in a block of ice'));
		entries.push(new TableEntry('nestled within the roots of a tree'));
		entries.push(new TableEntry('hidden in a hollowed-out book'));
		entries.push(new TableEntry('embedded in the ceiling or wall'));
		entries.push(new TableEntry('stowed in a compartment under a throne'));
		entries.push(new TableEntry('hidden under a pile of decoy treasures'));
		entries.push(new TableEntry('interred in a crypt with false tombs'));
		entries.push(new TableEntry('placed in plain sight but cursed'));
		entries.push(new TableEntry('buried under a mountain of mundane items'));
		entries.push(new TableEntry('contained in a jar only openable by solving a riddle'));
		entries.push(new TableEntry('hidden in a mirror realm'));
		entries.push(new TableEntry('concealed by a shapeshifting creature'));
		entries.push(new TableEntry('locked away in a time stasis field'));
		entries.push(new TableEntry('secreted away within a painting or tapestry'));
		entries.push(new TableEntry('disguised as a brick in a wall'));
		entries.push(new TableEntry('housed in a golem or animated armor'));
		entries.push(new TableEntry('activated by a hidden lever'));
		entries.push(new TableEntry('revealed by pressing a specific stone'));
		entries.push(new TableEntry('uncovered by pulling a book on a bookshelf'));
		entries.push(new TableEntry('opened by placing a torch in a sconce'));
		entries.push(new TableEntry('accessible by solving a floor tile puzzle'));
		entries.push(new TableEntry('shown when a specific word is spoken aloud'));
		entries.push(new TableEntry('exposed by playing certain notes on a musical instrument'));
		entries.push(
			new TableEntry('discovered by lighting a series of candles in a particular order')
		);
		entries.push(new TableEntry("detected when a magical gem is placed in a statue's eye"));
		entries.push(new TableEntry('revealed by the removal of a specific item'));
		entries.push(new TableEntry('triggered by placing weight on a hidden pressure plate'));
		entries.push(new TableEntry('unveiled by casting a specific spell'));
		entries.push(new TableEntry('found by rotating a wall sconce'));
		entries.push(new TableEntry('made visible by touching a hidden sigil'));
		entries.push(new TableEntry('unsealed by aligning symbols on a dial'));
		entries.push(new TableEntry('shown by inserting a sword into a stone'));
		entries.push(new TableEntry('exposed when a painting is swung aside'));
		entries.push(new TableEntry('uncovered by assembling a broken artifact'));
		entries.push(new TableEntry('revealed by pouring water into a dry fountain'));
		entries.push(new TableEntry('activated by a hidden switch under a desk or table'));
		entries.push(new TableEntry('opened by speaking a password to a statue or guardian'));
		entries.push(new TableEntry('detected by using a magical lantern to reveal the unseen'));
		entries.push(new TableEntry('revealed by the echo of a specific sound or song'));
		entries.push(
			new TableEntry('unlocked by placing coins or jewels into a certain container')
		);
		entries.push(new TableEntry('discovered by pressing a series of bricks in a sequence'));
		entries.push(new TableEntry('revealed when a magical ring is placed on a finger sculpture'));
		entries.push(new TableEntry('exposed by the application of heat or cold to a surface'));
		entries.push(new TableEntry('made apparent when a magical current is disrupted'));
		entries.push(new TableEntry('shown after praying or performing a ritual at an altar'));
		entries.push(new TableEntry('unveiled by piecing together a torn map or document'));

		super(entries, TableTitles.HiddenDescription);
	}
}
