
export enum MagicUserProfessions{
    priest = "priest",
    paladin = "paladin",
    shaman = "shaman",
    cultist = "cultist",
    clergyman = "clergyman",
    enlightened = "enlightened",
    gildMage = "gild mage",
    inquisitor = "inquisitor",
    blackMage = "black mage",
    alchemist = "alchemist",
    witch = "witch",
    druid = "druid",
    joker = "joker",
}

export function isMagicalProfession(profession: string){
    let magicalProfessions = Object.keys(MagicUserProfessions);
    for(let i = 0; i < magicalProfessions.length; i++){
        let magicUserProfession = magicalProfessions[i].toString();
        if(profession === magicUserProfession){
            return true;
        }
    }
    return false;
}
