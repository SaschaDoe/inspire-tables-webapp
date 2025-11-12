# Table Metadata Auto-Generation System

## Overview

The table metadata system has been refactored to **eliminate DRY violations** and automatically discover all tables in the codebase.

### Previous Issues

Before the refactoring, table information was manually maintained in **THREE separate places**:

1. `tableList.ts` - Manual imports and instantiations (331 lines)
2. `tableMetadata.ts` - Manual metadata with paths/class names (191 lines)
3. `allTablesMap.ts` - Manual map (incomplete, only ~40 tables)

This caused:
- **Missing tables**: Only 36 tables were displayed in the UI despite 317+ existing
- **Manual maintenance**: Every new table required updates in multiple files
- **Sync issues**: Easy to forget updating one of the files

## New System

### Architecture

**Single Source of Truth**: The actual table class files themselves.

```
Table Files (*.ts)
       ↓
   Generator Script (generateTableMetadata.ts)
       ↓
   Auto-Generated Metadata (tableMetadata.generated.ts)
       ↓
   UI Components (routes/tables/*.svelte)
```

### How It Works

1. **Generator Script** (`scripts/generateTableMetadata.ts`):
   - Scans all `*Table.ts` files in `src/lib/tables/**`
   - Extracts via regex:
     - Class name: `export class XxxTable`
     - Title: From `super(entries, TableTitles.XXX)` or `this.title =`
     - Type: From `this.tableType = TableType.XXX` or super() call
   - Groups tables by `TableType`
   - Generates TypeScript file with proper typing

2. **Generated File** (`src/lib/data/tableMetadata.generated.ts`):
   - Auto-generated metadata for all 317 tables
   - Includes lazy-loading via Vite glob imports
   - Preserves performance (no upfront loading)

3. **Usage in UI**:
   - Routes import from `.generated` file
   - No changes to UI logic needed
   - All tables now automatically appear

## Usage

### When Adding a New Table

1. Create your table class as normal (extending `Table`)
2. Run: `npm run generate:metadata`
3. Done! The table will automatically appear in the UI

### When to Regenerate

Run `npm run generate:metadata` after:
- Creating a new table
- Renaming a table
- Changing a table's type or title
- Moving table files

### Development Workflow

```bash
# During development
npm run generate:metadata  # Regenerate metadata
npm run dev                # Start dev server

# Before committing
npm run generate:metadata  # Ensure metadata is up-to-date
git add src/lib/data/tableMetadata.generated.ts
```

## Results

### Before
- **36 tables** visible in UI (manually registered)
- **3 files** to update per table
- **281 missing tables** not displayed

### After
- **317 tables** automatically discovered and displayed
- **1 command** to update everything: `npm run generate:metadata`
- **0 missing tables** (all are auto-discovered)

### Table Count by Category

```
Character:  93 tables
Other:     126 tables
SoloRPG:    36 tables
Location:   21 tables
Talent:     16 tables
Artefact:   14 tables
Monster:     5 tables
Town:        3 tables
Campaign:    1 table
Fraction:    1 table
Nation:      1 table
─────────────────────
TOTAL:     317 tables
```

## Files Changed

### New Files
- `scripts/generateTableMetadata.ts` - Generator script
- `scripts/fixDefaultTitles.ts` - Script to fix tables with "default title"
- `src/lib/data/tableMetadata.generated.ts` - Auto-generated metadata (317 tables)
- `src/lib/data/tableHelpers.ts` - Helper utilities for lazy-loading tables
- `TABLE_METADATA_REFACTORING.md` - This documentation

### Modified Files
- `package.json` - Added npm scripts + dependencies
- `src/routes/tables/+page.svelte` - Import from .generated
- `src/routes/tables/[tableTitle]/+page.svelte` - Import from .generated
- `src/lib/components/storyboard/StoryBoardGenerator.svelte` - Updated to use lazy-loading
- `src/lib/tables/tableTitles.ts` - Added 33 new enum entries

### Deleted Files (Old System)
- `src/lib/data/tableMetadata.ts` - Manual metadata (191 lines)
- `src/lib/tables/tableList.ts` - Manual imports (331 lines)
- `src/lib/tables/allTablesMap.ts` - Incomplete map (117 lines, only 40 tables)
- `src/lib/stores/tablesStore.ts` - Unused store

### Dependencies Added
- `tsx` - TypeScript execution
- `glob` - File pattern matching
- `@types/node` - Node.js types

## Future Improvements

### Potential Enhancements
1. Auto-generate on file watch (during dev)
2. Pre-commit hook to ensure metadata is current
3. Validate all TableTitles exist in enum
4. Generate tableList.ts as well (deprecate manual version)
5. Extract descriptions/icons from JSDoc comments

### Cleanup Completed ✅

All old files have been removed:
1. ✅ `src/lib/data/tableMetadata.ts` - Deleted (replaced by .generated.ts)
2. ✅ `src/lib/tables/allTablesMap.ts` - Deleted (incomplete, only 40 tables)
3. ✅ `src/lib/tables/tableList.ts` - Deleted (331 lines of manual imports)
4. ✅ `src/lib/stores/tablesStore.ts` - Deleted (unused)

### New Helper Created
- `src/lib/data/tableHelpers.ts` - Utility functions for working with auto-generated metadata

## Technical Details

### Pattern Matching

The generator uses regex to extract:

```typescript
// Class name
/export\s+class\s+(\w+)/

// Table title
/super\([^)]*TableTitles\.(\w+)/
/this\.title\s*=\s*TableTitles\.(\w+)/

// Table type
/this\.tableType\s*=\s*TableType\.(\w+)/
/super\s*\([^)]*,\s*[^,]+,\s*TableType\.(\w+)/

// Default fallback for super(entries, title) with 2 params
→ Defaults to TableType.Character (matches Table constructor)
```

### Lazy Loading

Uses Vite's `import.meta.glob()` for build-time analysis:

```typescript
const tableModules = import.meta.glob('$lib/tables/**/*.ts');

export async function loadTable(metadata: TableMetadata) {
  const modulePath = `/src/lib/tables/${metadata.importPath}.ts`;
  const moduleLoader = tableModules[modulePath];
  const module = await moduleLoader();
  const TableClass = (module as any)[metadata.className];
  return new TableClass();
}
```

This maintains tree-shaking and code-splitting benefits.

## Validation

To verify the system is working:

```bash
# 1. Generate metadata
npm run generate:metadata

# 2. Check output
# Should see: "✅ Successfully processed 317 tables"

# 3. Verify file created
ls src/lib/data/tableMetadata.generated.ts

# 4. Test in browser
npm run dev
# Navigate to /tables
# Should see all 317 tables organized by category
```

## Troubleshooting

### "Could not find class name"
- Ensure file exports a class: `export class XxxTable extends Table`

### "Could not find table title"
- Ensure super() call includes TableTitles: `super(entries, TableTitles.XXX)`
- Or explicit assignment: `this.title = TableTitles.XXX`

### "Could not find table type"
- Add explicit type: `this.tableType = TableType.XXX`
- Or pass to super(): `super(entries, TableTitles.XXX, TableType.YYY)`
- Or accept default `Character` type (if only title is passed)

### Table not showing in UI
1. Run `npm run generate:metadata`
2. Check console output for warnings
3. Verify file matches pattern `*Table.ts`
4. Ensure class extends `Table`
5. Check TableTitles enum includes the title

## Maintenance

The generator should be run:
- **Automatically**: Add to pre-commit hook (future)
- **Manually**: When adding/modifying tables
- **CI/CD**: Verify metadata is up-to-date in builds

To add to git pre-commit hook:
```bash
# .husky/pre-commit
npm run generate:metadata
git add src/lib/data/tableMetadata.generated.ts
```

## Final Result

**Single Source of Truth**: `src/lib/data/tableMetadata.generated.ts` (auto-generated from actual table files)

All components now use:
- `/tables` routes → Direct import from `.generated.ts`
- StoryBoardGenerator → Lazy-loading via `tableHelpers.ts`

**Zero manual maintenance required** - just run `npm run generate:metadata` when adding new tables!

---

**Completed**: 2025-01-12
**Author**: Refactoring via Claude Code
**Impact**:
- Eliminated DRY violation (3 → 1 source of truth)
- Discovered 281 missing tables (36 → 317 visible)
- Fixed 32 tables showing "default title"
- Deleted 4 redundant files (~700 lines)
