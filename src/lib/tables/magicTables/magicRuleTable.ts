import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

const magicSystemRules: string[] = [
	'you have to say a spell out loud',
	'every spell creates a unique musical note when cast',
	'casters must name each spell they invent',
	"the color of a mage's aura changes based on the type of magic used",
	'magical spells leave a temporary glittering trail in the air',
	'the first spell a mage learns becomes their signature spell and is slightly stronger',
	'spells cast on a birthday are doubly effective',
	"a mage's shadow moves independently while casting spells",
	'spells must be cast with a rhythm, like following the beat of a song',
	'magic users experience the scent of specific flowers when casting',
	"every time a spell is cast, it leaves a unique pattern on the caster's palms",
	"the tone of voice affects the spell's intensity",
	"spellcasting temporarily changes the color of the caster's eyes",
	"a caster's hair briefly floats as if underwater when casting",
	'animal companions can sense when their owner is casting a spell',
	"casting a spell leaves a fleeting taste of a specific fruit in the caster's mouth",
	'magical duels must be preceded by a formal bow or gesture',
	'casters can see faint auras around other magic users',
	'the sound of casting is unique to each wizard, like a magical fingerprint',
	"a mage's first successfully cast spell determines their affinity for certain types of magic",
	'spells cast during a storm draw additional power from the lightning',
	'casting a spell in a language not native to the caster increases its potency',
	'if two mages cast the same spell simultaneously, a rare magical phenomenon occurs',
	'casting spells near ancient ruins amplifies their effects',
	'using magic in a dream can affect the real world in unpredictable ways',
	'whispering a spell backwards creates a subtle, altered effect',
	'casting a spell under emotional distress can unpredictably alter its outcome',
	'spells cast at dusk or dawn have a chance of invoking ancient spirits',
	"a mage's spell can resonate with another's, creating a harmonic magic",
	'law of equivalent exchange: something cannot be created from nothing; to create something, something of equal value must be exchanged and lost.',
	'principle of magical balance: every spell cast must maintain the natural balance, avoiding the overuse of magic in any one area.',
	'rule of energy conservation: the energy used in casting a spell must come from somewhere, and its source must be specified.',
	'doctrine of intent: the effectiveness of a spell is directly related to the clarity and strength of the caster\'s intent.',
	'axiom of elemental harmony: spells must respect the harmony of the elements, ensuring that no element is overpowered or depleted.',
	'edict of magical consequences: every spell has consequences, intended or not, and the caster must be prepared to face them.',
	'tenet of knowledge limitation: a caster can only perform spells that are within their understanding and skill level.',
	'maxim of ethical use: magic must be used ethically and responsibly, avoiding harm to others and the environment.',
	'law of magical secrecy: the knowledge of magic should be kept secret from non-magical beings to avoid misuse and panic.',
	'principle of incantation precision: the words and gestures used in a spell must be precise to ensure its proper and safe execution.',
	'curse of binding: a spell that binds a soul to an object or place may result in eternal entrapment or suffering.',
	'pact of shadows: deals made with dark entities grant immense power, but at a cost that is often more than the caster anticipates.',
	"ritual of blood magic: spells that draw power from the life force of others can grant great strength, but corrode the caster's humanity."
];

export class MagicRuleTable extends Table {
	constructor() {
		const entries = magicSystemRules.map((rule) => new TableEntry(rule));
		super(entries, TableTitles.Default);
	}
}
