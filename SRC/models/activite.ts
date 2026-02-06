export class Activite {
    nom : string;
    date : string;
    temps_Act : number;
    intensite : number;

    constructor (nom : string, date : string, temps_Act : number, intensite : number){
        this.nom = nom;
        this.date = date;
        this.temps_Act = temps_Act;
        this.intensite = intensite;
    }

    description () : string {
        return `${this.nom} le ${this.date} pendant ${this.temps_Act} min, intensité ${this.intensite}`;
    }
    
}