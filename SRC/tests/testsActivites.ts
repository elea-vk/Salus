import { Activite } from "../models/activite.ts";

const mesActivites :  Activite[] = [];

mesActivites.push (new Activite ("course","2 avril ", 50, 5));
mesActivites.forEach(a => console.log(a.description()));
