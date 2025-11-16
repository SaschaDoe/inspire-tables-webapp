# Entity Integration Checklist

This guide provides a comprehensive checklist for adding new entity types to the system. Follow these steps to ensure proper integration across all components.

## 📚 Reference Implementations

Use these **working examples** as templates when creating new entities:

| Entity Type | Use As Reference For | Files |
|-------------|---------------------|-------|
| **Campaign** | Complex entity with nested entities, genre editor, editable properties | `src/lib/entities/campaign.ts`<br>`src/lib/creators/campaignCreator.ts`<br>`src/lib/components/entities/viewers/CampaignViewer.svelte` |
| **Universe** | Simple nested entity pattern with auto-save | `src/lib/entities/celestial/universe.ts`<br>`src/lib/entities/celestial/universeCreator.ts`<br>`src/lib/components/entities/viewers/UniverseViewer.svelte` |
| **SolarSystem** | Multiple nested entity types, visual components | `src/lib/entities/celestial/solarSystem.ts`<br>`src/lib/entities/celestial/solarSystemCreator.ts`<br>`src/lib/components/entities/viewers/SolarSystemViewer.svelte` |
| **Adventure** | Entity with metadata handling in card components | `src/lib/entities/adventure/adventure.ts`<br>`src/lib/entities/adventure/adventureCreator.ts`<br>`src/lib/components/entities/viewers/AdventureViewer.svelte`<br>`src/lib/components/entities/AdventureCard.svelte` |
| **Planet** | Entity with extensive config metadata for editing | `src/lib/entities/celestial/planet.ts`<br>`src/lib/entities/celestial/planetCreator.ts`<br>`src/lib/components/entities/viewers/PlanetViewer.svelte` |

---

## 📋 Complete Checklist for New Entity Types

### 1. **Entity Class Definition** (`src/lib/entities/[category]/[entityName].ts`)

**📖 Reference:** `src/lib/entities/campaign.ts`, `src/lib/entities/celestial/universe.ts`, `src/lib/entities/celestial/solarSystem.ts`

```typescript
import { Entity } from '../base/entity';

export class YourEntity extends Entity {
    name = '';
    description = '';

    // Nested entity arrays (if applicable)
    childEntities: ChildEntity[] = [];

    // Entity-specific properties
    // ...
}
```

**Key Points:**
- ✅ Extend from `Entity` base class
- ✅ Define all nested entity arrays (used for parent-child relationships)
- ✅ Add unique identifying properties for entity type detection

**Working Examples:**
- **Campaign with multiple nested types:** See `src/lib/entities/campaign.ts` (lines 4-17)
- **Simple nested entity:** See `src/lib/entities/celestial/universe.ts` (lines 5-12)
- **Multiple nested arrays:** See `src/lib/entities/celestial/solarSystem.ts` (lines 5-22)

---

### 2. **Entity Creator** (`src/lib/entities/[category]/[entityName]Creator.ts`)

**📖 Reference:** `src/lib/creators/campaignCreator.ts`, `src/lib/entities/celestial/universeCreator.ts`

```typescript
import { Creator } from '../base/creator';
import { YourEntity } from './yourEntity';

export class YourEntityCreator extends Creator<YourEntity> {
    // If entity has nested entities, define rules
    static readonly NESTED_ENTITY_RULES = {
        childEntities: {
            min: 0,
            max: 10,
            entityType: 'childEntity' as const,
            displayName: 'Child Entity'
        }
    };

    create(): YourEntity {
        const entity = new YourEntity();
        this.setParentReference(entity);

        // Generate properties
        entity.name = this.overrides['name'] || /* generate */;

        return entity;
    }
}
```

**Key Points:**
- ✅ Define `NESTED_ENTITY_RULES` if entity has child entities
- ✅ Use `this.setParentReference(entity)` to support parent tracking
- ✅ Support overrides for all editable properties

**Working Examples:**
- **Multiple nested entity rules:** See `src/lib/creators/campaignCreator.ts` (lines 22-36)
- **Single nested entity rule:** See `src/lib/entities/celestial/universeCreator.ts` (lines 9-15)
- **Override handling:** See `src/lib/creators/campaignCreator.ts` (lines 43-65)

---

### 3. **Entity Viewer** (`src/lib/components/entities/viewers/YourEntityViewer.svelte`)

**📖 Reference:** `src/lib/components/entities/viewers/CampaignViewer.svelte`, `src/lib/components/entities/viewers/UniverseViewer.svelte`, `src/lib/components/entities/viewers/SolarSystemViewer.svelte`

```svelte
<script lang="ts">
    import type { YourEntity } from '$lib/entities/[category]/yourEntity';
    import { YourEntityCreator } from '$lib/entities/[category]/yourEntityCreator';
    import Section from '../shared/Section.svelte';
    import InfoGrid from '../shared/InfoGrid.svelte';
    import EntityList from '../shared/EntityList.svelte';
    import { createEventDispatcher, onMount } from 'svelte';
    import { autoSaveNestedEntities, createAddEntityHandler, createEventForwarders } from './viewerUtils';

    interface Props {
        yourEntity: YourEntity;
        parentEntity?: any;
        hideEditableFields?: boolean; // For modal integration
    }

    let { yourEntity, parentEntity, hideEditableFields = false }: Props = $props();

    const dispatch = createEventDispatcher();

    // Auto-save nested entities to navigator
    onMount(() => {
        autoSaveNestedEntities(
            {
                childEntities: { entities: yourEntity.childEntities, entityType: 'childEntity' }
            },
            parentEntity,
            dispatch
        );
    });

    // Create handlers for nested entities
    const childRules = YourEntityCreator.NESTED_ENTITY_RULES.childEntities;
    const { handleOpenEntity, handleEntityUpdated } = createEventForwarders(dispatch);
    const handleAddChild = createAddEntityHandler(yourEntity, 'childEntities', parentEntity, dispatch);

    // Display info
    const basicInfo = $derived([
        { label: 'Name', value: yourEntity.name },
        { label: 'Property', value: yourEntity.someProperty }
    ]);
</script>

<div class="viewer">
    {#if !hideEditableFields}
        <Section title="Basic Information">
            <InfoGrid items={basicInfo} />
        </Section>
    {/if}

    <!-- Nested entities -->
    {#if yourEntity.childEntities}
        <EntityList
            entities={yourEntity.childEntities}
            entityType={childRules.entityType}
            displayName={childRules.displayName}
            displayNamePlural="Child Entities"
            icon="🌟"
            minRequired={childRules.min}
            maxAllowed={childRules.max}
            {parentEntity}
            onAddEntity={handleAddChild}
            on:openEntity={handleOpenEntity}
            on:entityUpdated={handleEntityUpdated}
        />
    {/if}
</div>
```

**Key Points:**
- ✅ Accept `hideEditableFields` prop for modal integration
- ✅ Use `autoSaveNestedEntities` in `onMount` for nested entities
- ✅ Use `createAddEntityHandler` for adding nested entities
- ✅ Use `createEventForwarders` for event bubbling
- ✅ Wrap editable fields in `{#if !hideEditableFields}` blocks

**Working Examples:**
- **Complete implementation with hideEditableFields:** See `src/lib/components/entities/viewers/CampaignViewer.svelte` (lines 11-17, 21-30, 35-38, 94-146)
- **Auto-save nested entities:** See `src/lib/components/entities/viewers/UniverseViewer.svelte` (lines 22-31)
- **Multiple nested entity handlers:** See `src/lib/components/entities/viewers/SolarSystemViewer.svelte` (lines 24-33)
- **Helper utilities:** See `src/lib/components/entities/viewers/viewerUtils.ts` for all helper functions

---

### 4. **Register in EntityViewer** (`src/lib/components/entities/EntityViewer.svelte`)

**📖 Reference:** `src/lib/components/entities/EntityViewer.svelte` (lines 72-114, 119-165)

Add two entries:

```typescript
// 1. In viewerComponent switch (around line 72)
case 'yourEntity':
    return YourEntityViewer;

// 2. In viewerProps switch (around line 119)
case 'yourEntity':
    return { yourEntity: entity as YourEntity, parentEntity, hideEditableFields };
```

**Key Points:**
- ✅ Import the viewer at the top
- ✅ Add both the component mapping AND props mapping
- ✅ Pass `hideEditableFields` to support modal usage

**Working Examples:**
- **Campaign registration:** See lines 73-74 (component) and 125-126 (props)
- **SolarSystem registration:** See lines 108-109 (component) and 159-160 (props)
- **Type imports:** See lines 1-42 for how to import types

---

### 5. **Register in Entity Registry** (`src/lib/entities/entityRegistry.ts`)

**📖 Reference:** `src/lib/entities/entityRegistry.ts`

```typescript
import { YourEntityCreator } from './[category]/yourEntityCreator';

// Add to type union (around line 30)
export type EntityTypeName = 'yourEntity' | /* other types */;

// Add to registry (around line 60)
const registry = {
    yourEntity: {
        name: 'yourEntity' as const,
        displayName: 'Your Entity',
        description: 'Description of entity',
        icon: '🌟',
        category: 'Category',
        creator: YourEntityCreator
    }
};
```

**Key Points:**
- ✅ Add to `EntityTypeName` union type
- ✅ Add registry entry with all metadata
- ✅ Choose appropriate icon and category

**Working Examples:**
- **See all entity registrations:** Browse `src/lib/entities/entityRegistry.ts` lines 60-200
- **Category examples:** 'Meta', 'Locations', 'Characters', 'Artefacts', 'Cosmic'

---

### 6. **Add Entity Type Detection** (`src/routes/workspace/+page.svelte`)

**📖 Reference:** `src/routes/workspace/+page.svelte` (lines 378-392)

In `handleNestedEntityOpen` function:

```typescript
// Determine the entity type from the object structure
let entityType = 'unknown';
if (clickedEntity.uniqueProperty !== undefined && clickedEntity.anotherProperty !== undefined) {
    entityType = 'yourEntity';
}
// ... other entity type checks
```

**Key Points:**
- ✅ Use 2-3 unique properties to identify the entity type
- ✅ Place check in logical order (more specific checks first)
- ✅ Ensure properties are truly unique to this entity type

**Working Examples:**
- **Adventure detection:** See line 388-389 (uses `beginning`, `climax`, `ending`)
- **Universe detection:** See line 386-387 (uses `spheres`)
- **Campaign detection:** See line 390-391 (uses `adventures` and `universes`)
- **SolarSystem detection:** See line 384-385 (uses `planets` or `stars`)

---

### 7. **Optional: Entity Config Metadata** (`src/lib/entities/entityConfigMetadata.ts`)

**📖 Reference:** `src/lib/entities/entityConfigMetadata.ts`

If entity has editable properties in the modal:

```typescript
yourEntity: {
    properties: [
        {
            propertyName: 'name',
            label: 'Entity Name',
            inputType: 'text',
            placeholder: 'Enter name'
        },
        {
            propertyName: 'category',
            label: 'Category',
            inputType: 'select',
            options: ['Option1', 'Option2', 'Option3']
        },
        {
            propertyName: 'count',
            label: 'Count',
            inputType: 'number',
            placeholder: '0'
        },
        {
            propertyName: 'type',
            label: 'Type',
            inputType: 'table',
            table: () => new YourEntityTypeTable()
        }
    ]
}
```

**Input Types:**
- `text` - Free text input
- `number` - Numeric input
- `select` - Dropdown with fixed options
- `table` - Dropdown from table entries
- `genre` - Special genre editor (for genre mix)

**Working Examples:**
- **Campaign config (all input types):** See lines 46-107
- **Planet config (extensive):** See lines 165-215
- **Dungeon config (table inputs):** See lines 131-163
- **Building config (simple):** See lines 109-129

---

### 8. **Entity Type Definition** (`src/lib/types/entity.ts`)

Add to the appropriate section:

```typescript
export interface YourEntityType extends Entity {
    customFields: {
        generatedEntity: YourEntity;
    };
}
```

**Key Points:**
- ✅ Extend from `Entity` base
- ✅ Define `customFields.generatedEntity` structure

---

### 9. **Optional: Specialized Card Component**

**📖 Reference:** `src/lib/components/entities/AdventureCard.svelte`

If entity appears in lists (like AdventureCard):

```svelte
<script lang="ts">
    import type { YourEntityType } from '$lib/types/entity';

    interface Props {
        entity: YourEntityType;
        // ... other props
    }

    let { entity }: Props = $props();
</script>

<!-- Card UI -->
{#if entity.metadata}
    <div>Created: {new Date(entity.metadata.createdAt).toLocaleDateString()}</div>
{/if}
```

**Key Points:**
- ✅ Always check if `metadata` exists before accessing it
- ✅ Handle both Entity wrapper and raw entity objects

**Working Example:**
- **Metadata handling:** See `src/lib/components/entities/AdventureCard.svelte` (lines 164-171)
- **Props structure:** See lines 4-20

---

## 🔍 Common Patterns & Best Practices

### Nested Entity Pattern

When entity has child entities:

1. **Define in entity class:**
   ```typescript
   childEntities: ChildEntity[] = [];
   ```

2. **Define rules in creator:**
   ```typescript
   static readonly NESTED_ENTITY_RULES = {
       childEntities: { min: 0, max: 10, entityType: 'childEntity', displayName: 'Child Entity' }
   };
   ```

3. **Auto-save in viewer:**
   ```typescript
   onMount(() => {
       autoSaveNestedEntities({ childEntities: { entities: entity.childEntities, entityType: 'childEntity' } }, parentEntity, dispatch);
   });
   ```

4. **Add EntityList in viewer:**
   ```svelte
   <EntityList
       entities={entity.childEntities}
       onAddEntity={handleAddChild}
       on:openEntity={handleOpenEntity}
       on:entityUpdated={handleEntityUpdated}
   />
   ```

---

### Entity Type Detection Pattern

Use **unique identifying properties** that are specific to your entity:

```typescript
// ✅ GOOD - Uses specific properties unique to Adventure
if (clickedEntity.beginning !== undefined &&
    clickedEntity.climax !== undefined &&
    clickedEntity.ending !== undefined) {
    entityType = 'adventure';
}

// ❌ BAD - Too generic, many entities have 'name'
if (clickedEntity.name !== undefined) {
    entityType = 'adventure';
}
```

---

### Modal Integration Pattern

Always support `hideEditableFields` for clean modal display:

```svelte
{#if !hideEditableFields}
    <!-- Information that's already shown in modal edit fields -->
    <Section title="Basic Information">
        <InfoGrid items={basicInfo} />
    </Section>
{/if}

<!-- Always show nested entities and other non-editable content -->
<EntityList entities={entity.children} ... />
```

---

### Metadata Handling Pattern

Always check if metadata exists:

```svelte
<!-- ✅ GOOD -->
{#if entity.metadata}
    <div>Created: {new Date(entity.metadata.createdAt).toLocaleDateString()}</div>
{/if}

<!-- ❌ BAD -->
<div>Created: {new Date(entity.metadata.createdAt).toLocaleDateString()}</div>
```

---

## 🧪 Testing Checklist

After implementing a new entity:

- [ ] Generate entity via modal
- [ ] Save entity and verify it appears in navigator
- [ ] Click entity in navigator and verify viewer loads
- [ ] Add nested entities (if applicable)
- [ ] Verify nested entities appear in both lists
- [ ] Reload page and verify everything persists
- [ ] Click nested entity and verify it opens correctly
- [ ] Test from parent entity context (e.g., add Adventure to Campaign)
- [ ] Verify `hideEditableFields` works in modal context
- [ ] Check for console errors

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot read properties of undefined (reading 'metadata')"
**Solution:** Add metadata check: `{#if entity.metadata}`

### Issue: Nested entities don't persist after reload
**Solution:** Ensure `createAddEntityHandler` is used and `autoSaveNestedEntities` is called in `onMount`

### Issue: Entity doesn't open when clicked from parent's nested list
**Solution:** Add entity type detection in `handleNestedEntityOpen` using unique properties

### Issue: Modal shows redundant information
**Solution:** Add `hideEditableFields` prop and wrap editable sections with conditional

### Issue: Entity appears in navigator but not in parent's nested list
**Solution:** Verify parent entity is saved to store after adding nested entity (check `createAddEntityHandler`)

---

## 📝 Quick Reference Files

| Purpose | File Path |
|---------|-----------|
| Entity class | `src/lib/entities/[category]/[name].ts` |
| Creator | `src/lib/entities/[category]/[name]Creator.ts` |
| Viewer | `src/lib/components/entities/viewers/[Name]Viewer.svelte` |
| Viewer registration | `src/lib/components/entities/EntityViewer.svelte` |
| Registry entry | `src/lib/entities/entityRegistry.ts` |
| Type detection | `src/routes/workspace/+page.svelte` |
| Config metadata | `src/lib/entities/entityConfigMetadata.ts` |
| Type definition | `src/lib/types/entity.ts` |

---

## 💡 Example: Adding "Quest" Entity (Simplified)

1. **Create entity class:** `src/lib/entities/quest/quest.ts`
   - Reference: `src/lib/entities/adventure/adventure.ts`

2. **Create creator:** `src/lib/entities/quest/questCreator.ts`
   - Reference: `src/lib/entities/adventure/adventureCreator.ts`

3. **Create viewer:** `src/lib/components/entities/viewers/QuestViewer.svelte`
   - Reference: `src/lib/components/entities/viewers/AdventureViewer.svelte`

4. **Register in EntityViewer:** `src/lib/components/entities/EntityViewer.svelte`
   - Reference: Lines 73-74 and 125-126 (Campaign example)

5. **Register in registry:** `src/lib/entities/entityRegistry.ts`
   - Reference: Browse lines 60-200

6. **Add type detection:** `src/routes/workspace/+page.svelte`
   - Reference: Lines 378-392

7. **Add config (optional):** `src/lib/entities/entityConfigMetadata.ts`
   - Reference: Lines 46-107 (Campaign example)

8. **Add type definition:** `src/lib/types/entity.ts`
   - Reference: Look for `AdventureEntity` or `CampaignEntity`

9. **Test all flows** using the checklist below

---

## 📂 File Location Quick Map

```
src/
├── lib/
│   ├── entities/
│   │   ├── [category]/
│   │   │   ├── [entity].ts              ← Step 1: Entity class
│   │   │   └── [entity]Creator.ts       ← Step 2: Creator
│   │   ├── entityRegistry.ts            ← Step 5: Registry
│   │   └── entityConfigMetadata.ts      ← Step 7: Config (optional)
│   ├── components/
│   │   └── entities/
│   │       ├── viewers/
│   │       │   └── [Entity]Viewer.svelte ← Step 3: Viewer
│   │       ├── EntityViewer.svelte       ← Step 4: Registration
│   │       └── [Entity]Card.svelte       ← Step 9: Card (optional)
│   └── types/
│       └── entity.ts                     ← Step 8: Type definition
└── routes/
    └── workspace/
        └── +page.svelte                  ← Step 6: Type detection
```

---

This checklist ensures consistency and completeness when adding new entity types!
