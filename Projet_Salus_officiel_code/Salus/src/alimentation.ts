import { Utilisateur } from "./utilisateur"


export enum repas {
    PetitDejeuner = "Petit déjeuner",
    Dejeuner = "Déjeuner",
    Snack = "Snack",
    Diner = "Dîner"
}


export class Alimentation {
    nom : string
    repas : string
    date : Date
    heures : Date
    caloriesRecommandees : number
    

    constructor (nom : string, repas : string, date : Date,heures : Date){
        this.nom = nom
        this.repas = repas
        this.date = date
        this.heures = heures
        this.caloriesRecommandees = 0
    }

    /*public calculerNbrCaloriesRecommandees ():{
        sexeUtilisateur = 
    }*/

}