import { Sommeil } from "../models/sommeil.ts";
import { Activite } from "../models/activite.ts";

const nouveauSommeil = new Sommeil(
  new Date(2026, 1, 5),
  new Date(2026, 1, 5, 22, 30),
  new Date(2026, 1, 6, 6, 45)
);

const mesActivites :  Activite[] = [];

mesActivites.push (new Activite ("course","2 avril ", 50, 5));
mesActivites.forEach(a => console.log(a.description()));

console.log(nouveauSommeil.calculerHeuresSommeil());