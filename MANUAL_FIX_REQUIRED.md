# ⚠️ Manual Fix Required

The implementation is **99% complete**, but one file needs manual editing due to HMR interference.

## File to Edit: `src/lib/entities/base/creator.ts`

### Step 1: Add the `overrides` property

**Find this section (around line 5-7):**
```typescript
export abstract class Creator<T> {
	generationOption: GenerationOption = GenerationOption.Gonzo;
	dice: Dice = new Dice();
	protected parentId?: string; // Optional parent reference

	withGenerationOption(option: GenerationOption): this {
```

**Change it to:**
```typescript
export abstract class Creator<T> {
	generationOption: GenerationOption = GenerationOption.Gonzo;
	dice: Dice = new Dice();
	protected parentId?: string; // Optional parent reference
	protected overrides: Record<string, any> = {}; // Property overrides

	withGenerationOption(option: GenerationOption): this {
```

**➡️ ADD THIS LINE:**
```typescript
protected overrides: Record<string, any> = {}; // Property overrides
```

---

### Step 2: Add the `withOverrides` method

**Find this section (around line 19-22):**
```typescript
	withParent(parentId: string): this {
		this.parentId = parentId;
		return this;
	}

	/**
	 * Automatically sets parentId on the entity if a parent was provided.
```

**Change it to:**
```typescript
	withParent(parentId: string): this {
		this.parentId = parentId;
		return this;
	}

	/**
	 * Set property overrides for entity generation
	 * @param overrides - Object with property names as keys and override values
	 */
	withOverrides(overrides: Record<string, any>): this {
		this.overrides = overrides;
		return this;
	}

	/**
	 * Automatically sets parentId on the entity if a parent was provided.
```

**➡️ ADD THIS METHOD:**
```typescript
/**
 * Set property overrides for entity generation
 * @param overrides - Object with property names as keys and override values
 */
withOverrides(overrides: Record<string, any>): this {
	this.overrides = overrides;
	return this;
}
```

---

## After Making These Changes:

1. **Save the file**
2. **Restart the dev server:** `npm run dev`
3. **Test it:**
   - Open http://localhost:5175/workspace
   - Click "✨ New Entity"
   - Select "🏛️ Building"
   - Click "Generate"
   - You should now see **editable dropdowns** for:
     - Building Type (change to "tower")
     - Adjective (change to "arcane", "mystical", etc.)
     - Quality
   - Change "Building Type" to "**tower**"
   - Click "🔄 Regenerate (keep edits)"
   - The type should stay as "tower" while other properties regenerate!

---

## What's Already Done ✅

- ✅ EntityGeneratorModal updated with editable fields UI
- ✅ BuildingCreator updated to use overrides
- ✅ DungeonCreator updated to use overrides
- ✅ Configuration metadata system created
- ✅ CSS styling added

## What You Get

After this fix, you'll be able to:
1. Generate a building
2. See dropdown menus for Type, Adjective, Quality
3. Change "Type" to "tower"
4. Click "Regenerate"
5. Get a new tower while keeping your "tower" selection!

Perfect for creating that **mage tower** you wanted! 🧙‍♂️✨
