import type {Table} from "../table";
import {SouthAmericanFemaleNameTable} from "../nameTables/southAmericanFemaleNameTable";
import {SouthAmericanMaleNameTable} from "../nameTables/southAmericanMaleNameTable";
import {SouthAmericanLastNameTable} from "../nameTables/southAmericanLastNameTable";
import {GermanFemaleNameTable} from "../nameTables/germanFemaleNameTable";
import {GermanMaleNameTable} from "../nameTables/germanMaleNameTable";
import {RussianFemaleNameTable} from "../nameTables/russianFemaleNameTable";
import {RussianMaleNameTable} from "../nameTables/russianMaleNameTable";
import {RussianLastNameTable} from "../nameTables/russianLastNameTable";
import {GreekFemaleNameTable} from "../nameTables/greekFemaleNameTable";
import {GreekMaleNameTable} from "../nameTables/greekMaleNameTable";
import {GreekPlaceName} from "../nameTables/greekPlaceName";
import {AfricanNameTable} from "../nameTables/africanNameTable";
import {BarbaricFemaleNameTable} from "../nameTables/barbaricFemaleNameTable";
import {BarbaricMaleNameTable} from "../nameTables/barbaricMaleNameTable";
import {BarbaricLastNameTable} from "../nameTables/barbaricLastNameTable";
import {FrenchFemaleNameTable} from "../nameTables/frenchFemaleNameTable";
import {FrenchMaleNameTable} from "../nameTables/frenchMaleNameTable";
import {FrenchLastNameTable} from "../nameTables/frenchLastNameTable";
import {IndianFemaleNameTable} from "../nameTables/indianFemaleNameTable";
import {IndianMaleNameTable} from "../nameTables/indianMaleNameTable";
import {NordicMaleNameTable} from "../nameTables/nordicMaleNameTable";
import {NordicFemaleNameTable} from "../nameTables/nordicFemaleNameTable";
import {NordicMaleLastNameTable} from "../nameTables/nordicMaleLastNameTable";
import {ArabicFemaleNameTable} from "../nameTables/arabicFemaleNameTable";
import {ArabicMaleNameTable} from "../nameTables/arabicMaleNameTable";
import {ArabicMaleLastNameTable} from "../nameTables/arabicMaleLastNameTable";
import {NordicFemaleLastNameTable} from "../nameTables/nordicFemaleLastNameTable";
import {ArabicFemaleLastNameTable} from "../nameTables/arabicFemaleLastNameTable";
import {ElfenFemaleNameTable} from "../nameTables/elfenFemaleNameTable";
import {ElfenMaleNameTable} from "../nameTables/elfenMaleNameTable";
import {ElfenLastName} from "../nameTables/elfenLastName";

export let cultureAndNameDictionary: {[culture: string]: [Table, Table, Table, Table]} = {};

cultureAndNameDictionary.southAmerican = [
    new SouthAmericanFemaleNameTable(),
    new SouthAmericanMaleNameTable(),
    new SouthAmericanLastNameTable(),
    new SouthAmericanLastNameTable(),
]

cultureAndNameDictionary.german = [
    new GermanFemaleNameTable(),
    new GermanMaleNameTable(),
    new GermanMaleNameTable(),
    new GermanMaleNameTable(),
]

cultureAndNameDictionary.russian = [
    new RussianFemaleNameTable(),
    new RussianMaleNameTable(),
    new RussianLastNameTable(),
    new RussianLastNameTable(),
]

cultureAndNameDictionary.greek = [
    new GreekFemaleNameTable(),
    new GreekMaleNameTable(),
    new GreekPlaceName(),
    new GreekPlaceName(),
]

cultureAndNameDictionary.african = [
    new AfricanNameTable(),
    new AfricanNameTable(),
    new AfricanNameTable(),
    new AfricanNameTable(),
]

cultureAndNameDictionary.barbaric = [
    new BarbaricFemaleNameTable(),
    new BarbaricMaleNameTable(),
    new BarbaricLastNameTable(),
    new BarbaricLastNameTable(),
]

cultureAndNameDictionary.french = [
    new FrenchFemaleNameTable(),
    new FrenchMaleNameTable(),
    new FrenchLastNameTable(),
    new FrenchLastNameTable(),
]

cultureAndNameDictionary.indian = [
    new IndianFemaleNameTable(),
    new IndianMaleNameTable(),
    new IndianMaleNameTable(),
    new IndianMaleNameTable(),
]

cultureAndNameDictionary.nordic = [
    new NordicFemaleNameTable(),
    new NordicMaleNameTable(),
    new NordicMaleLastNameTable(),
    new NordicFemaleLastNameTable(),
]

cultureAndNameDictionary.arabic = [
    new ArabicFemaleNameTable(),
    new ArabicMaleNameTable(),
    new ArabicMaleLastNameTable(),
    new ArabicFemaleLastNameTable(),
]

cultureAndNameDictionary.elfen = [
    new ElfenFemaleNameTable(),
    new ElfenMaleNameTable(),
    new ElfenLastName(),
    new ElfenLastName(),
]

