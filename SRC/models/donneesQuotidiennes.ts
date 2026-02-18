import { Donnee } from "./donnees.ts";
import { Hydratation } from "./hydratation.ts";
import { Sommeil } from "./sommeil.ts";

export class DonneeQuotidienne extends Donnee{
   sommeil : Sommeil
   hydratation : Hydratation

   public constructor(sommeil : Sommeil, date : Date, hydratation:Hydratation){
    super(date);
    this.sommeil = sommeil;
    this.hydratation = hydratation;
   }
}