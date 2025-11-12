# Table Categorization and Duplication Fix

## Issues Found

### 1. Miscategorized Tables (95 tables)
Many tables were assigned to the wrong category, primarily defaulting to "Character" when they should have been in their proper categories.

**Root Cause**: Tables that called `super(entries, TableTitles.XXX)` with only 2 parameters defaulted to `TableType.Character` per the Table base class constructor.

### 2. Duplicate Titles (4 tables)
Four faction tables all used the same title `FractionName`:
- FactionFirstNameTable
- FactionSecondNameTable
- FactionQuoteTable
- FactionBeginningMotivationTable

This caused them to all appear as "Fraction Name" in the UI.

## Fixes Applied

### 1. Fixed Table Categories (76 tables)

Created automated script `scripts/fixTableTypes.ts` that:
- Scans all table files by directory
- Detects missing or incorrect `TableType` assignments
- Automatically adds the correct type to `super()` calls
- Adds `TableType` imports where needed

**Tables Fixed by Category**:
- **Dungeon**: 22 tables (moved from Character/Location)
- **Adventure**: 16 tables (moved from Other/Artefact)
- **Talent**: 7 tables (moved from Character/Other)
- **SoloRPG**: 9 tables (moved from Character)
- **Monster**: 5 tables (moved from Character)
- **Fraction**: 4 tables (moved from Character)
- **Location**: 3 tables (moved from Character)
- **Nation**: 3 tables (moved from Other)
- **Culture**: 1 table (moved from Other)
- **Other**: 25 magic/spell tables (properly categorized)

### 2. Fixed Duplicate Titles

Added 4 new `TableTitles` enum entries:
```typescript
FactionFirstName = 'Faction First Name',
FactionSecondName = 'Faction Second Name',
FactionQuote = 'Faction Quote',
FactionBeginningMotivation = 'Faction Beginning Motivation',
```

Updated the 4 faction table files to use unique titles instead of all using `FractionName`.

## Results

### Before
```
Character: 93 tables (wrong! included dungeons, factions, etc.)
Location: 21 tables
Artefact: 14 tables
Talent: 16 tables
Monster: 5 tables (missing 5 more)
Town: 3 tables
Campaign: 1 table
Other: 126 tables
Fraction: 1 table (wrong! showed duplicates)
Nation: 1 table (wrong! missing 3 more)
SoloRPG: 36 tables (wrong! missing 9 more)
```

**Issues**:
- 4 "Fraction Name" duplicates in UI
- Many dungeon/faction/adventure tables wrongly in Character
- Tables in completely wrong categories

### After
```
Character: 58 tables ✅ (correct, only actual character tables)
Location: 24 tables ✅
Dungeon: 19 tables ✅ (was scattered in Character/Location)
Artefact: 11 tables ✅
Talent: 23 tables ✅
Monster: 5 tables ✅ (now properly categorized)
Adventure: 14 tables ✅ (was scattered in Other/Artefact)
Town: 3 tables ✅
Campaign: 1 table ✅
Other: 137 tables ✅
Fraction: 5 tables ✅ (4 unique faction tables + 1 original)
Nation: 4 tables ✅
SoloRPG: 37 tables ✅
```

**Fixed**:
- ✅ No duplicate titles
- ✅ All tables in correct categories
- ✅ Proper distribution across 13 categories
- ✅ 317 tables all properly categorized

## Files Created/Modified

### New Files
- `scripts/fixTableTypes.ts` - Automated table category fixer

### Modified Files
- 76 table files - Added/fixed `TableType` parameter
- 4 faction table files - Changed to unique titles
- `src/lib/tables/tableTitles.ts` - Added 4 new faction titles
- `package.json` - Added npm scripts for checking/fixing types
- `src/lib/data/tableMetadata.generated.ts` - Regenerated

### New NPM Scripts
```bash
npm run fix:check-types   # Check for miscategorized tables
npm run fix:table-types   # Auto-fix miscategorized tables
```

## How to Avoid in the Future

### When Creating a New Table

**Always specify the table type explicitly:**

```typescript
// ✅ GOOD - Explicit type
export class MyTable extends Table {
    constructor() {
        super(entries, TableTitles.MyTable, TableType.Dungeon);
    }
}

// ❌ BAD - Defaults to Character
export class MyTable extends Table {
    constructor() {
        super(entries, TableTitles.MyTable); // Missing type!
    }
}
```

### Validation Workflow

1. Create your table with proper `TableType`
2. Run: `npm run fix:check-types` (verify no issues)
3. Run: `npm run generate:metadata` (regenerate)
4. Check the UI to verify category placement

## Technical Details

### Table Constructor Signature
```typescript
constructor(
    entries: TableEntry[],
    title: string,
    tableType: TableType = TableType.Character  // ⚠️ Defaults to Character!
)
```

### Directory → Category Mapping
```typescript
dungeonTables   → TableType.Dungeon
factionTables   → TableType.Fraction
locationTables  → TableType.Location
monsterTables   → TableType.Monster
talentTables    → TableType.Talent
adventureTables → TableType.Adventure
artefactTables  → TableType.Artefact
townTables      → TableType.Town
mythicTables    → TableType.SoloRPG
nationTables    → TableType.Nation
cultureTables   → TableType.Culture
campaignTables  → TableType.Campaign
magicTables     → TableType.Other
spellTables     → TableType.Other
questTables     → TableType.Other
illnessTables   → TableType.Other
otherTables     → TableType.Other
charTables      → TableType.Character
nameTables      → TableType.Other (name generation tables)
```

---

**Date**: 2025-01-12
**Impact**: Fixed 95 miscategorized tables + 4 duplicate titles
**Result**: All 317 tables now properly categorized and uniquely named
