export enum NiveauAssocie {
    Faible = "Faible",
    Modere = "Moderé",
    Eleve = "Elevé"
}

export class Stress {
    date : Date
    niveau : number
    niveauRecommande : number


    constructor (date : Date, niveau : number){
        this.date = date
        this.niveau = niveau
        this.niveauRecommande = 1.5
    }

    public set niveauStress (niveauActuel : number) {
        if (niveauActuel <= 0 || niveauActuel > 5){
            throw new Error ('Niveau invalide, entrer un nombre entre 1 et 5')
        }
        this.niveau = niveauActuel
    }

    public get niveauStress (){
        return this.niveau
    }

    public get niveauAssocie () : NiveauAssocie {
        if (this.niveau <=2){
            return NiveauAssocie.Faible
        }
        else if (this.niveau === 3 ){
            return NiveauAssocie.Modere
        }
        else {
            return NiveauAssocie.Eleve
        }
    }

    public calculerIndice () : number {
        const niveauStressCalcule = this.niveauStress 
        const indice = niveauStressCalcule/this.niveauRecommande
        return Math.min (indice,1)
    }


}
