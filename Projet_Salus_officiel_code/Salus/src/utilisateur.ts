import { DonneeBiologique } from "./donneesBiologiques"

export enum SexeUtilisateur {
    Feminin = "féminin",
    Masculin = "masculin"
}

export class Utilisateur {
    nom : string
    
   
    private _dateDeNaissance : Date
    private _sexe : SexeUtilisateur
    private donneesBio?: DonneeBiologique;
    private id?: number;

    constructor (nom : string, dateDeNaissance : Date, sexe : SexeUtilisateur, id : number){
        this.nom = nom
        this._dateDeNaissance = dateDeNaissance
        this._sexe = sexe
        this.id = id
        
    }

    public setDonneesBio(donnees: DonneeBiologique): void {
        this.donneesBio = donnees;
    }

     public getId(): number | undefined {
        return this.id;
    }

    public setId(id: number): void {
        this.id = id;
    }


    public getDonneesBio(): DonneeBiologique | undefined {
        return this.donneesBio;
    }

    public set sexe(sexeChoisi: SexeUtilisateur) {
        this._sexe = sexeChoisi
    }

    public get sexe(): SexeUtilisateur {
        return this._sexe
    }

    public calculAge(): number {
        const aujourdHui = new Date();
        let age = aujourdHui.getFullYear() - this._dateDeNaissance.getFullYear();

        const mois = aujourdHui.getMonth() - this._dateDeNaissance.getMonth();
        if (mois < 0 ||(mois === 0 && aujourdHui.getDate() < this._dateDeNaissance.getDate())) {
            age--;
        }
        return age;
    }

    public get dateDeNaissance() : Date {
        return this._dateDeNaissance
    }


}