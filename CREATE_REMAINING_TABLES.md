# Creating Remaining Mythic Tables

This implementation has created the foundation. Here's how to efficiently create the remaining 6 tables for Sprint 1 Week 1:

## Remaining Tables Needed:

1. **descriptionsTable1.ts** - 100 descriptive adverbs (see solo-rpg-tables.md lines 186-210)
2. **descriptionsTable2.ts** - 100 descriptive adjectives (see solo-rpg-tables.md lines 216-240)
3. **locationsElementsTable.ts** - 100 location descriptors (see solo-rpg-tables.md lines ~246+)
4. **charactersElementsTable.ts** - 100 character descriptors  
5. **objectsElementsTable.ts** - 100 object descriptors

## Template to Use:

```typescript
import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';
import { DiceRole } from '../diceRole';

export class [NAME]Table extends Table {
	constructor() {
		const entries = [
			new TableEntry('[TEXT]').withRoleInterval(1, 1),
			// ... 100 entries total
		];

		super(entries, TableTitles.Mythic[NAME], TableType.SoloRPG, new DiceRole(1, 100));
	}
}
```

## Quick Creation Method:

1. Copy solo-rpg-tables.md data
2. Use find/replace with regex:
   - Find: `\| (\d+) \| ([^|]+) \|`
   - Replace: `new TableEntry('$2').withRoleInterval($1, $1),`
3. Clean up whitespace
4. Add to template

This will complete the 9 core tables for the first deliverable!
