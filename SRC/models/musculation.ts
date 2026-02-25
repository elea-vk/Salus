import { Activite } from "./activite";

export class Musculation extends Activite {

  muscleCible: string;
  exercices: string[];
  tempsRepos: number; // minutes recommandées

  constructor(
    nom: string,
    date: string,
    temps_Act: number,
    intensite: number,
    muscleCible: string,
    exercices: string[],
    tempsRepos: number
  ) {
    super(nom, date, temps_Act, intensite);

    this.muscleCible = muscleCible;
    this.exercices = exercices;
    this.tempsRepos = tempsRepos;
  }

  // retourne description complète séance
  descriptionMusculation(): string {
    return `${this.nom} ciblant ${this.muscleCible} pendant ${this.temps_Act} min (intensité ${this.intensite}). Repos recommandé : ${this.tempsRepos} min.`;
  }

  // ajoute un exercice
  ajouterExercice(exercice: string): void {
    this.exercices.push(exercice);
  }

  // liste exercices format texte
  afficherExercices(): string {
    return this.exercices.join(", ");
  }
}