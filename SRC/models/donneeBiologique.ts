import { Donnee } from "./donnees";

export class DonneeBiologique extends Donnee{
    age : number
    taille : number
    poids : number
    sexeBiologique : SexeBiologique
    public constructor (date:Date,age:number,taille:number,poids:number,sexeBiologique:SexeBiologique){
        super(date);
        this.age = age;
        this.taille = taille;// en cm sinon convertir...
        this.poids = poids;//en kg sinon convertir...
        this.sexeBiologique = sexeBiologique;
    }

    public calculCaloriesNecessaires() : number{// rajouter condition si l'imc est supérieur à 30
        let poidsAjuste : number = this.poids;
        let tailleMetres : number = this.taille/100;


        if((this.poids/(tailleMetres*tailleMetres))>30){
            poidsAjuste=this.calculPoidsIdéal();

        }

        if(this.sexeBiologique==SexeBiologique.Femme){
            return (10 * poidsAjuste) + (6.25 * this.taille) - (5 * this.age) - 161;
        }else{
            return (10 * poidsAjuste) + (6.25 * this.taille) - (5 * this.age) + 5;
        }
    }

    public calculPoidsIdéal(): number{ // besoin de l'imc pour définir si besoin du poids ajusté
        if(this.sexeBiologique==SexeBiologique.Femme){
            return 45 + (0.92 * (this.taille - 152));
        }
        else {
            return 50 + (0.92 * (this.taille - 152));
        }

    }


}
export enum SexeBiologique{
    Femme = "Femme",
    Homme = "Homme",
};