# Unciv Analysis and Implementation Comparison

## Repository Overview

**Unciv** is a complete open-source Civilization V clone written in Kotlin, available at: https://github.com/yairm210/Unciv

Cloned to: `C:\proj\games\Unciv`

## Architecture Analysis

### Data-Driven Design

Unciv uses a **data-driven architecture** with JSON files defining game rules:

**Location**: `android/assets/jsons/Civ V - Gods & Kings/`

**Key Data Files**:
- `Buildings.json` - All building definitions with stats, costs, uniques
- `Units.json` - All unit types with stats, costs, upgrades, promotions
- `Techs.json` - Complete tech tree with prerequisites, costs, era grouping
- `TileResources.json` - Strategic, luxury, and bonus resources
- `TileImprovements.json` - Farms, mines, roads, etc.
- `Terrains.json` - Terrain types and features
- `Policies.json` - Social policy trees with bonuses
- `Nations.json` - Civilizations with unique units/buildings/abilities
- `Difficulties.json` - Game difficulty settings
- `Eras.json` - Era definitions with costs
- `Religions.json` - Religion system
- `Beliefs.json` - Religious beliefs
- `Personalities.json` - AI personality types
- `Specialists.json` - City specialists

### Core Logic Structure

**Location**: `core/src/com/unciv/logic/`

**Key Directories**:
- `civilization/` - Civilization class and managers
- `city/` - City class and city management
- `map/` - Hex map, tiles, and terrain
- `battle/` - Combat resolution system
- `automation/` - AI automation for units, cities, diplomacy
- `trade/` - Trade routes system
- `event/` - Event system

### Entity Structure

#### City (City.kt)
```kotlin
class City {
    var location: Vector2
    var id: String
    var name: String
    var foundingCiv: String
    var previousOwner: String
    var turnAcquired: Int
    var health: Int = 200

    var population: CityPopulationManager
    var cityConstructions: CityConstructions
    var expansion: CityExpansionManager
    var religion: CityReligionManager
    var espionage: CityEspionageManager
    var cityStats: CityStats

    var tiles: HashSet<Vector2>           // All controlled tiles
    var workedTiles: HashSet<Vector2>     // Worked tiles
    var lockedTiles: HashSet<Vector2>     // Locked from reassignment
    var manualSpecialists: Boolean
    var isBeingRazed: Boolean
    var isPuppet: Boolean
    var isOriginalCapital: Boolean
    var demandedResource: String          // We Love The King Day
    var flagsCountdown: HashMap<String, Int>
    var avoidGrowth: Boolean
}
```

#### Civilization (Civilization.kt)
```kotlin
class Civilization {
    var civName: String
    var nation: Nation                     // Reference to ruleset nation
    var playerType: PlayerType             // Human, AI
    var tech: TechManager
    var policies: PolicyManager
    var religionManager: ReligionManager
    var goldenAges: GoldenAgeManager
    var greatPeople: GreatPeopleManager
    var victoryManager: VictoryManager
    var diplomacy: HashMap<String, DiplomacyManager>
    var notifications: ArrayList<Notification>
    var cities: ArrayList<City>
    var exploredTiles: HashSet<Vector2>
    var lastSeenImprovement: HashMap<Vector2, String>
}
```

## Comparison with Our Phase 1 Implementation

### ✅ What We Got Right

1. **Entity Structure** - Our entities align well with Unciv's structure
   - City, Nation, Unit, HistoricalEvent concepts match
   - Yield system (food, production, gold, science, culture) correct
   - Building and tech tree structure compatible

2. **Combat System** - Our approach matches Unciv
   - Strength-based combat with modifiers
   - HP system (200 max for cities, 100 for units)
   - Ranged vs melee units
   - Promotions/experience system

3. **Diplomacy** - Core concepts correct
   - Opinion system
   - Treaties, wars, alliances
   - Grievances tracking

4. **Historical Events** - Good addition (not in Unciv)
   - Event sourcing for replay
   - This is a unique feature for our worldbuilding focus

### ⚠️ What Needs Adjustment

1. **Missing "Unique" System** ⭐ CRITICAL
   - Unciv uses a flexible **"uniques"** system for modifiers
   - Buildings, units, policies, nations all have unique bonuses
   - Format: `"[+10]% [Food] [in all cities]"`
   - This is more flexible than hard-coded bonuses

2. **Manager Classes**
   - Unciv separates concerns with manager classes:
     - `CityPopulationManager` - Growth, food consumption, starvation
     - `CityConstructions` - Production queue, building, units
     - `CityExpansionManager` - Border growth, culture costs
     - `CityReligionManager` - Religious pressure, conversion
     - `TechManager` - Research progress, tech costs
     - `PolicyManager` - Policy unlocking, culture costs
   - **Recommendation**: Use similar manager pattern for clean separation

3. **Tile Management**
   - Unciv tracks:
     - `workedTiles` - Citizens actually working tiles
     - `lockedTiles` - Tiles locked from reassignment
     - `tiles` - All owned tiles
   - Our `RegionalHexTile` has basic ownership but lacks work assignment

4. **Resource System Details**
   - Three resource types: **Bonus, Strategic, Luxury**
   - Bonus: Cattle, Wheat, Fish (improve yields)
   - Strategic: Iron, Horses, Oil (needed for units)
   - Luxury: Gold, Gems, Silk (provide happiness)
   - Resources are **stockpiled** (e.g., 5 Iron)
   - Units consume resources (e.g., Swordsman needs 1 Iron)

5. **Great People System**
   - Missing from our implementation
   - Great Scientists, Engineers, Merchants, Artists, Generals, Prophets
   - Cities generate Great Person Points through specialists
   - Can be expended for powerful one-time effects

6. **Religion System**
   - Missing from our implementation
   - Founding pantheons and religions
   - Religious pressure and spreading
   - Beliefs provide bonuses

7. **Victory Conditions**
   - Missing from our implementation
   - Domination, Science, Cultural, Diplomatic victories
   - Important for AI goal setting

8. **City States**
   - Missing from our implementation
   - Minor civilizations that cannot expand
   - Can be allied for bonuses
   - Provide quests

9. **Espionage System**
   - Missing from our implementation (but in Unciv)
   - Spies can steal techs, rig elections, perform coups

### 📊 JSON Data Structure Examples

#### Building Example
```json
{
    "name": "Library",
    "hurryCostModifier": 25,
    "maintenance": 1,
    "uniques": [
        "[+1 Science] per [2] population [in this city]"
    ],
    "requiredTech": "Writing"
}
```

#### Unit Example
```json
{
    "name": "Archer",
    "unitType": "Archery",
    "movement": 2,
    "strength": 5,
    "rangedStrength": 7,
    "cost": 40,
    "requiredTech": "Archery",
    "obsoleteTech": "Construction",
    "upgradesTo": "Composite Bowman",
    "attackSound": "arrow"
}
```

#### Tech Example
```json
{
    "name": "Writing",
    "row": 3,
    "prerequisites": ["Pottery"],
    "uniques": ["Enables establishment of embassies"],
    "quote": "'He who destroys a good book kills reason itself.' - John Milton"
}
```

#### Resource Example
```json
{
    "name": "Iron",
    "resourceType": "Strategic",
    "revealedBy": "Iron Working",
    "terrainsCanBeFoundOn": ["Grassland", "Plains", "Desert", "Tundra", "Snow", "Hill"],
    "production": 1,
    "improvement": "Mine",
    "improvementStats": {"production": 1}
}
```

#### Policy Example
```json
{
    "name": "Tradition",
    "era": "Ancient era",
    "uniques": [
        "[+3 Culture] [in capital]",
        "[-25]% Culture cost of natural border growth [in all cities]"
    ],
    "policies": [
        {
            "name": "Aristocracy",
            "uniques": [
                "[+15]% Production when constructing [All] wonders [in all cities]",
                "[+1 Happiness] per [10] population [in all cities]"
            ],
            "row": 1,
            "column": 1
        }
    ]
}
```

## Available Assets from Unciv

### Images (All Open Source, GPL v3 Licensed)

**Location**: `android/assets/`

**Available Assets**:
- `Icons.png` - Sprite sheet with UI icons
- `NationIcons.png` - Civilization flag icons
- `PolicyIcons.png` - Social policy icons
- `ReligionIcons.png` - Religion symbols
- `UnitPromotionIcons.png` - Unit promotion icons
- `Tech.png` - Technology icons
- `ConstructionIcons.png` - Building icons
- `Flags.png` - National flags
- `Tilesets.png` - Hex tile graphics
- `Skin.png` - UI skin elements

**Tutorial Images**: `ExtraImages/Tutorials/`
- Found city, Move unit, Pick technology, etc.

### JSON Game Data

**Complete game data files** for:
- 100+ Buildings (Ancient → Information era)
- 80+ Units (Warrior → Stealth Bomber)
- 75+ Technologies in tree
- 15+ Social Policy trees
- 40+ Nations with unique abilities
- 30+ Strategic/Luxury resources
- 20+ Tile improvements
- 15+ Terrain types and features

**License**: GPL v3 - Can be used/adapted with attribution

## Recommendations for Our Implementation

### Priority 1: Critical Improvements

1. **Implement "Uniques" System** ⭐
   - Add flexible bonus system like Unciv
   - Store as string arrays: `uniques: string[]`
   - Parse at runtime for effects
   - Example: `"[+2 Science] from [Jungle] tiles [in this city]"`

2. **Add Manager Classes**
   - Separate concerns like Unciv does
   - `CityPopulationManager` for growth
   - `CityProductionManager` for construction
   - `TechManager` for research
   - `DiplomacyManager` per-nation relationships

3. **Resource Stockpiling**
   - Track quantities: `strategicResources: Map<string, number>`
   - Units consume resources on creation
   - Resources tradeable between nations

4. **Tile Work Assignment**
   - Add `workedTileIds`, `lockedTileIds` to City
   - Implement citizen assignment algorithm
   - Manual vs automatic assignment mode

### Priority 2: Additional Systems

5. **Great People System**
   - Add GreatPerson entity type
   - Great Person Points from specialists/buildings
   - Special abilities (Golden Age, Tech boost, etc.)

6. **Religion System** (Optional - Fantasy Mode)
   - Founding religions with beliefs
   - Religious pressure spreading
   - Holy wars, inquisitors

7. **Victory Conditions**
   - Track progress toward victories
   - AI prioritizes based on chosen victory type

8. **City States** (Optional)
   - Mini-civilizations
   - Quest system
   - Alliance bonuses

### Priority 3: Data-Driven Architecture

9. **JSON Data Files**
   - Move building/unit/tech definitions to JSON
   - Load at runtime like Unciv
   - Allows modding without code changes

10. **Use Unciv Assets**
    - Adapt icon sprite sheets for UI
    - Use tech tree layout
    - Leverage building/unit definitions

## Updated Phase Structure

### Phase 1: Entity Structure ✅ COMPLETE
- Core entities created
- Basic properties defined

### Phase 1.5: Unciv Integration (NEW) 🔄 IN PROGRESS
- Add "uniques" system to entities
- Implement manager classes
- Add resource stockpiling
- Improve tile work assignment
- Add Great People framework

### Phase 2: Regional Map Generation
- Terrain generation
- Resource placement (strategic, luxury, bonus)
- Feature placement (forests, jungles, rivers)

### Phase 3: Basic Simulation
- Nation spawning
- City founding
- Resource consumption
- Basic AI

### Phase 4: Technology & Culture
- Tech tree implementation (use Unciv's tree structure)
- Social policies (use Unciv's policy trees)
- Culture border expansion
- Golden Ages

### Phase 5: Combat & Diplomacy
- Battle resolution
- AI warfare
- Diplomacy actions
- Treaties and alliances

### Phase 6: Time Slider & Visualization
- Event timeline
- Historical replay
- Border changes over time
- Statistics tracking

### Phase 7: Cross-Boundary Interactions
- Adjacent map detection
- Cross-boundary warfare
- Trade routes between maps

### Phase 8: Advanced Features
- Great People
- Religion (optional)
- Victory conditions
- City States (optional)

### Phase 9: Performance Optimization
- Event sourcing optimization
- Web Workers for simulation
- IndexedDB storage

### Phase 10: Manual Controls (Future)
- Player intervention
- Strategic planning
- What-if scenarios

## Key Insights from Unciv

1. **Modular Design** - Separate managers for each concern
2. **Data-Driven** - JSON defines rules, code interprets
3. **Flexible Bonuses** - "Uniques" system is powerful
4. **Resource Management** - Stockpiling is crucial
5. **Tile Assignment** - Complex but important for city optimization
6. **GPL Licensed** - Can use/adapt their assets and data

## Assets We Can Use

### Directly Usable
- JSON game data (buildings, units, techs) - adapt for our needs
- Icon sprite sheets - extract for UI
- Tech tree structure - follow their layout
- Policy tree structure - use their trees

### With Adaptation
- Terrain graphics - may need to fit our hex system
- Unit graphics - adapt to our art style
- Building definitions - simplify or extend

### Cannot Use Directly
- Kotlin code - different language, but learn from architecture
- Game logic - implement in TypeScript following their patterns

## Conclusion

Our Phase 1 implementation is **solid and well-structured**, but we should:

1. ✅ **Keep** our entity structure (City, Nation, Unit, etc.)
2. ✅ **Keep** our historical event system (unique feature)
3. ✅ **Keep** our yield calculation approach
4. ⚠️ **Add** "uniques" system for flexible bonuses
5. ⚠️ **Add** manager classes for separation of concerns
6. ⚠️ **Add** resource stockpiling and consumption
7. ⚠️ **Improve** tile work assignment system
8. 📊 **Consider** using Unciv's JSON data as reference
9. 🎨 **Use** Unciv's icon assets with attribution
10. 📚 **Follow** their modular architecture patterns

**Next Steps**: Update HIERARCHICAL_HEXMAP_PLAN.md with these findings and create Phase 1.5 tasks.
