export interface OracleGeneral {
	noun: string;
	verb: string;
	adjective: string;
	adverb: string;
	question: string;
	detailedAnswer: string;
}

export interface OracleSocialCombat {
	description: string;
	role?: string;
	context?: string;
	choice?: string;
	result?: string;
	outcome?: string;
	targeting?: string;
	roleSize?: string;
	stance?: string;
	randomEncounter?: string;
}

export interface OracleQuestEncounter {
	newQuest?: string;
	questDevelopment?: string;
	reward?: string;
	penalty?: string;
}

export interface OracleQuest {
	archetype?: string;
	sub?: string;
}

export interface ParsedOracle {
	number: string;
	title: string;
	general: OracleGeneral;
	social: OracleSocialCombat[];
	combat: OracleSocialCombat[];
	questEncounter: OracleQuestEncounter;
	quest: OracleQuest;
}

/**
 * Parse oracle text into structured data
 */
export function parseOracleText(text: string): ParsedOracle {
	const lines = text.split('\n').map((l) => l.trimEnd());

	// Remove empty lines at start/end
	while (lines.length > 0 && lines[0].trim() === '') lines.shift();
	while (lines.length > 0 && lines[lines.length - 1].trim() === '') lines.pop();

	let i = 0;

	// Parse number and title
	const number = lines[i++].trim();
	const title = lines[i++].trim();

	// Skip "General" header
	i++; // "General"

	// Parse General section
	const general: OracleGeneral = {
		noun: '',
		verb: '',
		adjective: '',
		adverb: '',
		question: '',
		detailedAnswer: ''
	};

	// Noun
	i++; // "Noun"
	general.noun = lines[i++].trim();
	// Verb
	i++; // "Verb"
	general.verb = lines[i++].trim();
	// Adjective
	i++; // "Adjective"
	general.adjective = lines[i++].trim();
	// Adverb
	i++; // "Adverb"
	general.adverb = lines[i++].trim();
	// Question
	i++; // "Question"
	general.question = lines[i++].trim();
	// Detailed Answer
	i++; // "Detailed" or "Detailed Answer"
	if (lines[i].trim() === 'Answer') i++; // Skip "Answer" if separate line
	// Read multi-line answer
	let answer = '';
	while (i < lines.length && !isSectionHeader(lines[i])) {
		if (answer) answer += '\n';
		answer += lines[i++].trim();
	}
	general.detailedAnswer = answer;

	// Parse Social sections
	const social: OracleSocialCombat[] = [];
	while (i < lines.length && lines[i].trim() === 'Social') {
		social.push(parseSocialOrCombatSection(lines, i));
		i = findNextSectionStart(lines, i + 1);
	}

	// Parse Combat sections
	const combat: OracleSocialCombat[] = [];
	while (i < lines.length && lines[i].trim() === 'Combat') {
		combat.push(parseSocialOrCombatSection(lines, i));
		i = findNextSectionStart(lines, i + 1);
	}

	// Parse Quest & Encounter section
	const questEncounter: OracleQuestEncounter = {};
	if (i < lines.length && lines[i].includes('Quest & Encounter')) {
		i++; // Skip header
		questEncounter.newQuest = readSubsection(lines, i, '  New Quest');
		i = skipToNextSubsection(lines, i);
		questEncounter.questDevelopment = readSubsection(lines, i, '  Quest Development');
		i = skipToNextSubsection(lines, i);
		questEncounter.reward = readSubsection(lines, i, '  Reward');
		i = skipToNextSubsection(lines, i);
		questEncounter.penalty = readSubsection(lines, i, '  Penalty');
		i = skipToNextSubsection(lines, i);
	}

	// Parse Quest section
	const quest: OracleQuest = {};
	if (i < lines.length && lines[i].trim() === 'Quest') {
		i++; // Skip header
		if (i < lines.length && lines[i].trim() === 'Archetype') {
			i++;
			quest.archetype = lines[i++].trim();
		}
		if (i < lines.length && lines[i].trim() === 'Sub') {
			i++;
			quest.sub = lines[i++].trim();
		}
	}

	return {
		number,
		title,
		general,
		social,
		combat,
		questEncounter,
		quest
	};
}

function isSectionHeader(line: string): boolean {
	const trimmed = line.trim();
	return (
		trimmed === 'Social' ||
		trimmed === 'Combat' ||
		trimmed === 'Quest' ||
		trimmed.includes('Quest & Encounter')
	);
}

function findNextSectionStart(lines: string[], startIdx: number): number {
	for (let i = startIdx; i < lines.length; i++) {
		if (isSectionHeader(lines[i])) return i;
	}
	return lines.length;
}

function parseSocialOrCombatSection(lines: string[], startIdx: number): OracleSocialCombat {
	let i = startIdx + 1; // Skip section header
	const section: OracleSocialCombat = { description: '' };

	// Read description until we hit a subsection
	let desc = '';
	while (i < lines.length && !isSubsectionHeader(lines[i]) && !isSectionHeader(lines[i])) {
		if (desc) desc += '\n';
		desc += lines[i++].trim();
	}
	section.description = desc;

	// Parse subsections
	while (i < lines.length && isSubsectionHeader(lines[i]) && !isSectionHeader(lines[i])) {
		const header = lines[i++].trim();

		if (header === 'Role') {
			section.role = lines[i++].trim();
		} else if (header === 'Context') {
			section.context = lines[i++].trim();
		} else if (header === 'Choice') {
			section.choice = lines[i++].trim();
		} else if (header === 'Result') {
			section.result = lines[i++].trim();
		} else if (header === 'Outcome') {
			section.outcome = lines[i++].trim();
		} else if (header === 'Targeting') {
			section.targeting = lines[i++].trim();
		} else if (header === 'Role Size') {
			section.roleSize = lines[i++].trim();
		} else if (header === 'Stance') {
			section.stance = lines[i++].trim();
		} else if (header.includes('Random Encounter')) {
			let encounter = '';
			while (i < lines.length && !isSubsectionHeader(lines[i]) && !isSectionHeader(lines[i])) {
				if (encounter) encounter += '\n';
				encounter += lines[i++].trim();
			}
			section.randomEncounter = encounter;
		}
	}

	return section;
}

function isSubsectionHeader(line: string): boolean {
	const trimmed = line.trim();
	return (
		trimmed === 'Role' ||
		trimmed === 'Context' ||
		trimmed === 'Choice' ||
		trimmed === 'Result' ||
		trimmed === 'Outcome' ||
		trimmed === 'Targeting' ||
		trimmed === 'Role Size' ||
		trimmed === 'Stance' ||
		trimmed.includes('Random Encounter')
	);
}

function readSubsection(lines: string[], startIdx: number, header: string): string | undefined {
	for (let i = startIdx; i < lines.length; i++) {
		if (lines[i].includes(header)) {
			i++; // Skip header
			let content = '';
			while (i < lines.length && !lines[i].trim().startsWith('  ') && !isSectionHeader(lines[i])) {
				if (content) content += '\n';
				content += lines[i++].trim();
			}
			return content || undefined;
		}
	}
	return undefined;
}

function skipToNextSubsection(lines: string[], startIdx: number): number {
	for (let i = startIdx; i < lines.length; i++) {
		if (lines[i].trim().startsWith('  ') || isSectionHeader(lines[i])) {
			return i;
		}
	}
	return lines.length;
}
