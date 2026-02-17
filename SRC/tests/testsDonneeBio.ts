import { DonneeBiologique, SexeBiologique } from "../models/donneeBiologique";



let test = new DonneeBiologique(new Date(3,3,3),19,155,64,SexeBiologique.Femme);

console.log(test.calculCaloriesNecessaires); //ne fonctionne pas pour l'instant