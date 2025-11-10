import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class GreekFemaleNameTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("Aglaya"))
        entries.push(new TableEntry("Aldara"))
        entries.push(new TableEntry("Alrike"))
        entries.push(new TableEntry("Apogea"))
        entries.push(new TableEntry("Arakne"))
        entries.push(new TableEntry("Aurike"))
        entries.push(new TableEntry("Avesinna"))
        entries.push(new TableEntry("Belenike"))
        entries.push(new TableEntry("Borothea"))
        entries.push(new TableEntry("Chysalis"))
        entries.push(new TableEntry("Efferdiana"))
        entries.push(new TableEntry("Garafania"))
        entries.push(new TableEntry("Harika"))
        entries.push(new TableEntry("Ingerydike"))
        entries.push(new TableEntry("Insina"))
        entries.push(new TableEntry("Iokaste"))
        entries.push(new TableEntry("Iolanthe"))
        entries.push(new TableEntry("Korina"))
        entries.push(new TableEntry("Kyklania"))
        entries.push(new TableEntry("Lanike"))
        entries.push(new TableEntry("Leonore"))
        entries.push(new TableEntry("Liaella"))
        entries.push(new TableEntry("Menkirde"))
        entries.push(new TableEntry("Mira"))
        entries.push(new TableEntry("Myrtale"))
        entries.push(new TableEntry("Nautika"))
        entries.push(new TableEntry("Nemekathe"))
        entries.push(new TableEntry("Nermaka"))
        entries.push(new TableEntry("Odenia"))
        entries.push(new TableEntry("Peraina"))
        entries.push(new TableEntry("Phaylionya"))
        entries.push(new TableEntry("Phylinna"))
        entries.push(new TableEntry("Phyllis"))
        entries.push(new TableEntry("Praiaste"))
        entries.push(new TableEntry("Praiope"))
        entries.push(new TableEntry("Rahjanidis"))
        entries.push(new TableEntry("Rahjamandra"))
        entries.push(new TableEntry("Rondrike"))
        entries.push(new TableEntry("Sapeidra"))
        entries.push(new TableEntry("Telemache"))
        entries.push(new TableEntry("Personephone"))
        entries.push(new TableEntry("Thalassandra"))
        entries.push(new TableEntry("Tsaiadne"))
        entries.push(new TableEntry("Xelena"))
        entries.push(new TableEntry("Xera"))
        entries.push(new TableEntry("Yppodamea"))
        entries.push(new TableEntry("Zoira"))
        entries.push(new TableEntry("Zyraste"))
        entries.push(new TableEntry("Semiokate"))
        entries.push(new TableEntry("Indirmenes"))
        entries.push(new TableEntry("Perinope"))
        entries.push(new TableEntry("Dolopia"))
        super(entries, TableTitles.GreekFemaleName);
        this.tableType = TableType.Other;
    }
}