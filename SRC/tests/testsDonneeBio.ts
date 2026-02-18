import { DonneeBiologique } from "../models/donneeBiologique.ts";
import { SexeBiologique } from "../models/SexeBiologique.ts";



let test = new DonneeBiologique(new Date(3,3,3),19,155,64,SexeBiologique.getSexeBiologique("Femme"),1);

console.log(test.calculDepenseEnergetiqueTotale()); //verifier formule