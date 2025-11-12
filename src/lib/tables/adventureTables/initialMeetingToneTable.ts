import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

export class InitialMeetingToneTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('friendly and welcoming'));
		entries.push(new TableEntry('tense and suspicious'));
		entries.push(new TableEntry('hostile and confrontational'));
		entries.push(new TableEntry('awkward and uncomfortable'));
		entries.push(new TableEntry('formal and professional'));
		entries.push(new TableEntry('casual and relaxed'));
		entries.push(new TableEntry('mysterious and intriguing'));
		entries.push(new TableEntry('romantic and charged'));
		entries.push(new TableEntry('fearful and cautious'));
		entries.push(new TableEntry('excited and enthusiastic'));
		entries.push(new TableEntry('somber and serious'));
		entries.push(new TableEntry('humorous and lighthearted'));
		entries.push(new TableEntry('urgent and pressured'));
		entries.push(new TableEntry('calm and peaceful'));
		entries.push(new TableEntry('dramatic and intense'));
		entries.push(new TableEntry('cold and distant'));
		entries.push(new TableEntry('warm and intimate'));
		entries.push(new TableEntry('chaotic and confusing'));
		entries.push(new TableEntry('orderly and structured'));
		entries.push(new TableEntry('magical and otherworldly'));
		entries.push(new TableEntry('gritty and realistic'));
		entries.push(new TableEntry('philosophical and thoughtful'));
		entries.push(new TableEntry('action-packed and dynamic'));
		entries.push(new TableEntry('melancholic and sad'));
		entries.push(new TableEntry('hopeful and optimistic'));

		super(entries, TableTitles.InitialMeetingTone);
	}
}
