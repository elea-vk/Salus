import { Donnee } from "./donnees.ts";
import { SexeBiologique } from "./SexeBiologique.ts";

export class DonneeBiologique extends Donnee{
    age : number
    taille : number
    poids : number
    sexeBiologique : SexeBiologique
    niveauActivitePhysique : number
    public constructor (date:Date,age:number,taille:number,poids:number,sexeBiologique:SexeBiologique,niveauActivitePhysique:number){
        super(date);
        this.age = age;
        this.taille = taille; // en cm sinon convertir...
        this.poids = poids; //en kg sinon convertir...
        this.sexeBiologique = sexeBiologique;
        this.niveauActivitePhysique = niveauActivitePhysique; //déterminer jsp trop quand(sedentaire,peu actif, actif,très actif)
    }

    public calculMetabolismeRepos() : number{// rajouter condition si l'imc est supérieur à 30
        let poidsAjuste : number = this.poids;
        let tailleMetres : number = this.taille/100;


        if((this.poids/(tailleMetres*tailleMetres))>30){
            poidsAjuste=this.calculPoidsIdéal();

        }

        if(this.sexeBiologique==SexeBiologique.getSexeBiologique("Femme")){
            return (10 * poidsAjuste) + (6.25 * this.taille) - (5 * this.age) - 161;
        }else{
            return (10 * poidsAjuste) + (6.25 * this.taille) - (5 * this.age) + 5;
        }
    }

    private calculPoidsIdéal(): number{ 
        if(this.sexeBiologique==SexeBiologique.getSexeBiologique("Femme")){
            return 45 + (0.92 * (this.taille - 152));
        }
        else {
            return 50 + (0.92 * (this.taille - 152));
        }

    }
    public calculDepenseEnergetiqueTotale():number{
        return this.calculMetabolismeRepos()*this.convertirNiveauActivitePhysique();
    }
    private convertirNiveauActivitePhysique():number { //selon nautilus +
        switch(this.niveauActivitePhysique){
            case 1:{
                return 1.4;
            }
                
            case 2:{ 
                return 1.5; 
            }
            case 3:{
                return 1.75;
            }
            case 4:{
                return 2.2; 
            }    
            default:{
                return 0;// jsp trop
            }   

        }

    }


}
