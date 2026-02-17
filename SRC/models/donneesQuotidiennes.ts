import { Donnee } from "./donnees";
import { Hydratation } from "./hydratation";
import { Sommeil } from "./sommeil";

export class DonneeQuotidienne extends Donnee{
   sommeil : Sommeil
   hydratation : Hydratation

   public constructor(sommeil : Sommeil, date : Date, hydratation:Hydratation){
    super(date);
    this.sommeil = sommeil;
    this.hydratation = hydratation;
   }
}