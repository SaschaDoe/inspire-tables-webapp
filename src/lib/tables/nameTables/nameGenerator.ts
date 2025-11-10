import {randomIntFromInterval} from "../../utils/randomUtils";
import {ConsonantTable} from "../otherTables/consonantTable";
import {VocalTable} from "../otherTables/vocalTable";
import {FractionNameTable} from "../otherTables/fractionNameTable";
import {cultureAndNameDictionary} from "../cultureTables/cultureAndNameDictionary";
import {Gender} from "../charTables/gender";

function generateNameOfLength(numberOfSyllabus: number) {
    let name = "";

    let isFirstVocal = randomIntFromInterval(0,1);
    if(isFirstVocal === 1){
        name = new VocalTable().role().text;
    }

    for (let i = 0; i < numberOfSyllabus; i++) {
        let isTwoConsonants = randomIntFromInterval(0,1);
        let consonant = new ConsonantTable().role().text;
        if(isTwoConsonants){
            consonant = consonant + new ConsonantTable().role().text;
        }
        let vocal = new VocalTable().role().text;
        let newSyllabus = consonant + vocal;
        name = name + newSyllabus
    }

    return name;
}

export function generateName(maxNumberOfSyllabus = 7){
    let numberOfSyllabus = randomIntFromInterval(1,maxNumberOfSyllabus);

    return generateNameOfLength(numberOfSyllabus);
}

export function generateFractionName(){
    let numberOfSyllabus = randomIntFromInterval(1,4);
    let first = generateNameOfLength(numberOfSyllabus);
    let second = new FractionNameTable().roleWithCascade().text;
    return first + " " + second;
}

export function generateContinentName(){
    let numberOfSyllabus = randomIntFromInterval(0,4);

    let name = generateNameOfLength(numberOfSyllabus);

    let consonant = new ConsonantTable().role().text;

    let ending = randomIntFromInterval(0,3);

    if(ending === 0){
        let vocal = "a";
        let newSyllabus = consonant + vocal;
        name = name + newSyllabus;
    }else if(ending === 1){
        name = name + "ien";
    }else if(ending === 2){
        name = name + "ion"
    }else{
        name = name + "guard"
    }

    return name;
}

export function getCultureName(culture: string, gender: string) {
    let tables = cultureAndNameDictionary[culture];
    if(tables === undefined){
        tables = cultureAndNameDictionary.german;
    }
    let firstName: string;
    let lastName: string;

    if (gender === Gender.Male) {
        firstName = tables[1].roleWithCascade().text;
        lastName = tables[2].roleWithCascade().text;
    }else{
        firstName = tables[0].roleWithCascade().text;
        lastName = tables[3].roleWithCascade().text;
    }

    firstName = changeFirstVocal(firstName);
    if(culture !== "elfen"){
        lastName = changeFirstVocal(lastName);
    }


    return firstName + " " + lastName;
}

export function changeFirstVocal(name: string){
    let vocals = ["a", "e", "i", "o", "u"];
    name = name.toLocaleLowerCase();
    let indexOfA = name.indexOf("a");
    let indexOfE = name.indexOf("e");
    let indexOfI = name.indexOf("i");
    let indexOfO = name.indexOf("o");
    let indexOfU = name.indexOf("u");

    let randomVocalNumber = randomIntFromInterval(0,4);
    let randomVocal = vocals[randomVocalNumber];

    if(indexOfA !== -1 && indexOfA !== name.length-1){
        name = replaceAt(name, indexOfA, randomVocal);

    }else if(indexOfE !== -1 && indexOfE !== name.length-1){
        name = replaceAt(name, indexOfE, randomVocal);

    }else if(indexOfI !== -1 && indexOfI !== name.length-1){
        name = replaceAt(name, indexOfI, randomVocal);

    }else if(indexOfO !== -1 && indexOfO !== name.length-1){
        name = replaceAt(name, indexOfO, randomVocal);

    }else if(indexOfU !== -1 && indexOfU !== name.length-1){
        name = replaceAt(name, indexOfU, randomVocal);
    }
    if(name === "" || name === undefined){
        name = "a";
    }

    name = firstLetterToUppercase(name);

    return name;
}

export function replaceAt(input: string, index: number, replacement: string){
    return input.substring(0, index) + replacement + input.substring(index+1);
}

export function firstLetterToUppercase(input: string){
    if(input === undefined || input.length < 1){
        return "";
    }
    return input[0].toUpperCase() + input.substring(1)
}