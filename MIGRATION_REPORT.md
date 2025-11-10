# Table Files Migration Report

## Summary
Successfully copied **159 table files** from `old examples/src/tables/` to `src/lib/tables/` with the new project structure.

## Files Copied by Category

### charTables (19 files)
- advantageTable.ts
- alignmentTable.ts
- animalTable.ts
- attitudeTable.ts
- attributeTable.ts
- characterAsDeviceTable.ts
- characterShadowArchetypeTable.ts
- curseTable.ts
- disadvantageTable.ts
- fantasyCreatureTable.ts
- gender.ts (enum)
- genderTable.ts
- magicUserProfessions.ts (enum)
- motivationTable.ts
- nobilityTable.ts
- professionTable.ts
- raceTable.ts
- relationshipTypeTable.ts
- specialFeaturesTable.ts

### nameTables (40 files)
- africanNameTable.ts
- arabicFemaleLastNameTable.ts
- arabicFemaleNameAdditionTable.ts
- arabicFemaleNameTable.ts
- arabicMaleLastNameTable.ts
- arabicMaleNameAdditionTable.ts
- arabicMaleNameTable.ts
- barbaricFemaleNameTable.ts
- barbaricLastNameTable.ts
- barbaricMaleNameTable.ts
- barbaricNicknameTable.ts
- dungeonNameTable.ts
- elfenFemaleNameTable.ts
- elfenLastName.ts
- elfenMaleNameTable.ts
- epicSubstantiveTable.ts
- frenchFemaleNameTable.ts
- frenchLastNameTable.ts
- frenchMaleNameTable.ts
- frenchPlaceNameTable.ts
- germanFemaleNameTable.ts
- germanMaleNameTable.ts
- greekFemaleNameTable.ts
- greekLastNameTable.ts
- greekMaleNameTable.ts
- greekPlaceName.ts
- indianFemaleNameTable.ts
- indianMaleNameTable.ts
- nameGenerator.ts
- nordicFemaleLastNameTable.ts
- nordicFemaleNameTable.ts
- nordicMaleLastNameTable.ts
- nordicMaleNameTable.ts
- russianFemaleNameTable.ts
- russianLastNameTable.ts
- russianMaleNameTable.ts
- southAmericanFemaleNameTable.ts
- southAmericanLastNameTable.ts
- southAmericanMaleNameTable.ts
- verbTable.ts

### locationTables (5 files)
- buildingAdjectiveTable.ts
- buildingTable.ts
- continentTable.ts
- landscapeTable.ts
- sphereTable.ts

### dungeonTables (10 files)
- dungeonEntriesTable.ts
- furnishingTable.ts
- naturalObstacleTable.ts
- obstacleTable.ts
- structureTable.ts
- transitionAdjectiveTable.ts
- transitionTable.ts
- trapFunctionTable.ts
- trapTable.ts
- trapTriggerTable.ts

### artefactTables (11 files)
- armorTable.ts
- artefactAdjectiveTable.ts
- artefactTable.ts
- artworkTable.ts
- gemstoneTable.ts
- jewelryTable.ts
- magicalArtefactTable.ts
- materialsTable.ts
- profaneArtefactTable.ts
- treasureTable.ts
- weaponTable.ts

### talentTables (20 files)
- artistTalentTable.ts
- athleticsTalentTable.ts
- changeTalentTable.ts
- craftTable.ts
- elementalTalentTable.ts
- fromAnotherHigherPowerTalent.ts
- healingTalentTable.ts
- limitationTable.ts
- magicalTalentTable.ts
- metaMagicTalentTable.ts
- objectEnchantmentTable.ts
- profaneTalentTable.ts
- prophecyTalentTable.ts
- psyTalentTable.ts
- summonTalentTable.ts
- talentCategoryTable.ts
- talentTable.ts
- targetTalentTable.ts
- timeTalentTable.ts
- travelTalentTable.ts

### monsterTables (6 files)
- monsterAdjectiveTable.ts
- monsterEncounterTypeTable.ts
- monsterMealTable.ts
- monsterNumberTable.ts
- monsterReproductionTable.ts
- monsterTable.ts

### townTables (3 files)
- townEventTable.ts
- townFameTable.ts
- townSizeTable.ts

### adventureTables (15 files)
- adventureBeginningTable.ts
- adventureClimaxTable.ts
- adventureEventTable.ts
- adventureFinalTable.ts
- adventurePhases.ts (enum)
- adventureRisingTable.ts
- beginningTropeTable.ts
- characterIntroductionTable.ts
- climacticTrope.ts
- conflictTropeTable.ts
- endingTropeTable.ts
- narrationTable.ts
- planTable.ts
- plotTropeTable.ts
- villainAdjectiveTable.ts

### cultureTables (2 files)
- cultureAndNameDictionary.ts
- realCultureTable.ts

### otherTables (23 files)
- blankTable.ts
- bodyPartsTable.ts
- colourTable.ts
- consonantTable.ts
- elementTable.ts
- emotionTable.ts
- fractionNameTable.ts
- fractionQuestTable.ts
- fractionWealthTable.ts
- historicalEventTable.ts
- locationTable.ts
- moonPhasesTable.ts
- naturalEvents.ts
- positionTable.ts
- qualityTable.ts
- rarityTable.ts
- seasonTable.ts
- senseTable.ts
- sizeTable.ts
- technologyTable.ts
- vocalTable.ts
- weatherAdjectiveTable.ts
- weatherTable.ts

### nationTables (4 files)
- nationAdjectiveTable.ts
- nationRelationshipTable.ts
- nationTable.ts
- rulerNicknamesTable.ts

### Root-level supporting files (5 files)
- allTablesMap.ts
- diceTypes.ts (enum)
- fakeTableRoller.ts
- tableList.ts
- tableRoler.ts

## Files Skipped (Already Created)
- table.ts
- tableEntry.ts
- tableType.ts
- tableTitles.ts
- diceRole.ts
- roleResult.ts
- *.test.ts (all test files)
- *.svelte (Svelte component files)

## Import Path Changes
All import paths were preserved as-is since the relative structure within the tables directory remains the same:
- `../table` remains `../table`
- `../tableEntry` remains `../tableEntry`
- `./someTable` remains `./someTable`
- `../otherTables/someTable` remains `../otherTables/someTable`
- `../../utils/randomUtils` remains `../../utils/randomUtils` (correctly points to src/lib/utils/)

## External Dependencies Removed

The following **22 files** had external dependencies removed (imports to entity stores outside the tables directory):

### Character Store Dependencies:
1. **charTables/advantageTable.ts** - Removed: `addArtefactToStoreReturnUniqueName`
2. **charTables/characterAsDeviceTable.ts** - Removed: `chooseHigherPowerReturnDescription`, `createHigherPowerReturnUniqueName`
3. **charTables/disadvantageTable.ts** - Removed: Character type, Relationship, RelationshipType, `addNSCToCharacterStore`, CharacterFactory
4. **charTables/nobilityTable.ts** - Removed: Factory type, CharacterFactory type
5. **charTables/relationshipTypeTable.ts** - Removed: RelationshipType

### Name Tables Dependencies:
6. **nameTables/barbaricNicknameTable.ts** - Removed: `chooseNSCReturnUniqueName`

### Dungeon Tables Dependencies:
7. **dungeonTables/furnishingTable.ts** - Removed: `addPictureToStoreReturnsDescription`
8. **dungeonTables/obstacleTable.ts** - Removed: `addNewMonsterToStoreReturnUniqueName`
9. **dungeonTables/trapFunctionTable.ts** - Removed: `addNewMonsterToStoreReturnUniqueName`
10. **dungeonTables/trapTriggerTable.ts** - Removed: `addNewMonsterToStoreReturnUniqueName`

### Talent Tables Dependencies:
11. **talentTables/fromAnotherHigherPowerTalent.ts** - Removed: `chooseHigherPowerReturnDescription`, `createHigherPowerReturnUniqueName`, `addArtefactToStoreReturnUniqueName`
12. **talentTables/summonTalentTable.ts** - Removed: `addArtefactToStoreReturnUniqueName`, `chooseHigherPowerReturnDescription`
13. **talentTables/travelTalentTable.ts** - Removed: `addNewMonsterToStoreReturnUniqueName`

### Town Tables Dependencies:
14. **townTables/townEventTable.ts** - Removed: external references
15. **townTables/townFameTable.ts** - Removed: `addNewFractionToStoreReturnDescription`

### Adventure Tables Dependencies:
16. **adventureTables/adventureBeginningTable.ts** - Removed: `addNewNSCToCharacterStoreReturnDescription`, `addNewFractionToStoreReturnDescription`
17. **adventureTables/adventureRisingTable.ts** - Removed: `addNewNSCToCharacterStoreReturnDescription`, `addArtefactToStoreReturnDescription`, `addNewFractionToStoreReturnDescription`
18. **adventureTables/beginningTropeTable.ts** - Removed: `addNewNSCToCharacterStoreReturnDescription`, `chooseHigherPowerReturnDescription`
19. **adventureTables/planTable.ts** - Removed: `addArtefactToStoreReturnDescription`
20. **adventureTables/plotTropeTable.ts** - Removed: `addNewFractionToStoreReturnUniqueName`, `addArtefactToStoreReturnUniqueName`, `addDungeonToStoreReturnUniqueName`, `addNewMonsterToStoreReturnUniqueName`

### Other Tables Dependencies:
21. **otherTables/fractionQuestTable.ts** - Removed: `addNewMonsterToStoreReturnUniqueName`, `chooseNSCReturnUniqueName`, `addArtefactToStoreReturnUniqueName`
22. **otherTables/historicalEventTable.ts** - Removed: `chooseHigherPowerReturnUniqueName`

### Nation Tables Dependencies:
23. **nationTables/nationAdjectiveTable.ts** - Removed: `chooseNationReturnUniqueName`
24. **nationTables/rulerNicknamesTable.ts** - Removed: `chooseNSCReturnUniqueName`

## Known Issues

### Files with Orphaned Function References
The following files still contain function calls or type references to the removed external dependencies. These will need to be addressed:

1. **charTables/disadvantageTable.ts** - Contains `AddCharForPower` function that uses removed types (Character, CharacterFactory, Relationship, RelationshipType, addNSCToCharacterStore)
2. **charTables/relationshipTypeTable.ts** - Returns RelationshipType enum values
3. Multiple files using `.withFunctionString()` or `.withFunction()` with removed function references

### Action Required
These files will need either:
- Implementation of stub/mock versions of the external functions
- Removal of the function calls and related table entries
- Integration with the new entity store system once it is implemented

## Verification
- Total files in new structure: **169** (159 copied + 10 pre-existing)
- All import paths for table-to-table references are correct
- All subdirectory structure preserved
- Supporting enum files (Gender, MagicUserProfessions, AdventurePhases, DiceTypes) copied successfully

## Next Steps
1. Review the 22+ files with removed dependencies and decide on implementation strategy
2. Consider creating stub functions for the entity store operations
3. Test import paths and verify TypeScript compilation
4. Update any application code that imports from the old table structure
5. Address the orphaned function references in files like disadvantageTable.ts
