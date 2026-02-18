// profil.ts
import { Donnee } from "./donnees";
import { DonneeQuotidienne } from "./donneesQuotidiennes";
import { DonneeBiologique } from "./donneeBiologique";

/**
 * Placeholders (à remplacer par vos vraies classes Indice/IndiceSante)
 * - Dans votre UML: historiqueIndices : list<Indice>
 * - historiqueIndiceSante : list<indiceSante>
 */
export interface Indice {
  // exemple minimal : vous pouvez remplacer par votre classe Indice
  valeur: number;
  valeurRecommandee: number;
  dateCalculee: Date;
}

export interface IndiceSante {
  // exemple minimal
  valeur: number; // ex: 0..100
  dateCalculee: Date;
}

export class Profil {
  // UML: listeDeDonneesQt : list <DonneeQuotidienne>
  public listeDeDonneesQt: DonneeQuotidienne[] = [];

  // UML: listeDeDonneesBio : list <DonneeBiologique>
  public listeDeDonneesBio: DonneeBiologique[] = [];

  // UML: historiqueIndices : list <Indice>
  public historiqueIndices: Indice[] = [];

  // UML: historiqueIndiceSante : list <indiceSante>
  public historiqueIndiceSante: IndiceSante[] = [];

  // UML: aRecupere : boolean
  public aRecupere: boolean = false;

  // UML: indiceSante : number
  public indiceSante: number = 0;

  public constructor(init?: Partial<Profil>) {
    if (init) Object.assign(this, init);
  }

  /**
   * UML: entrerDonnee() : Donnee
   * Ici, on accepte une Donnee et on la range au bon endroit.
   */
  public entrerDonnee(donnee: Donnee): void {
    if (donnee instanceof DonneeQuotidienne) {
      this.listeDeDonneesQt.push(donnee);
      return;
    }

    if (donnee instanceof DonneeBiologique) {
      this.listeDeDonneesBio.push(donnee);
      return;
    }

    // Si un autre type de Donnee est ajouté plus tard
    throw new Error("Type de donnée non supporté dans Profil.entrerDonnee()");
  }

  /**
   * UML: effacerDonnee() : void
   * Supprime une donnée (Qt ou Bio) à une date donnée.
   * - target: "qt" | "bio"
   */
  public effacerDonnee(date: Date, target: "qt" | "bio"): void {
    if (target === "qt") {
      this.listeDeDonneesQt = this.listeDeDonneesQt.filter(
        (d) => !Profil.sameDay(d.getDate(), date)
      );
    } else {
      this.listeDeDonneesBio = this.listeDeDonneesBio.filter(
        (d) => !Profil.sameDay(d.getDate(), date)
      );
    }
  }

  /**
   * UML: obtenirDonneesBio(Date) : listeDeDonneesBio
   */
  public obtenirDonneesBio(date: Date): DonneeBiologique[] {
    return this.listeDeDonneesBio.filter((d) => Profil.sameDay(d.getDate(), date));
  }

  /**
   * UML: obtenirDonneesQt(Date) : listeDeDonneesQt
   */
  public obtenirDonneesQt(date: Date): DonneeQuotidienne[] {
    return this.listeDeDonneesQt.filter((d) => Profil.sameDay(d.getDate(), date));
  }

  /**
   * UML: calculerIndiceDeSante() : number
   * Version de base: calcule un indice hebdo simple à partir de ce que vous avez.
   * Ici on fait un indice à partir de:
   * - sommeil (heures) -> cible 8h
   * - hydratation (quantité) -> cible 2000 ml (à ajuster)
   *
   * Vous pourrez ajouter: pas, calories, stress, activité physique, etc.
   */
  public calculerIndiceDeSanteSur7Jours(fin: Date): number {
    const debut = new Date(fin);
    debut.setDate(fin.getDate() - 6);

    // prend les données quotidiennes dans la fenêtre 7 jours
    const qt7j = this.listeDeDonneesQt.filter((d) =>
      Profil.inRange(d.getDate(), debut, fin)
    );

    if (qt7j.length === 0) {
      this.indiceSante = 0;
      return this.indiceSante;
    }

    // Sommeil moyen
    const sommeilMoy =
      qt7j.reduce((sum, d) => sum + d.sommeil.calculerHeuresSommeil(), 0) / qt7j.length;

    // Hydratation moyenne (selon votre classe Hydratation: quantite number)
    const hydratMoy =
      qt7j.reduce((sum, d) => sum + d.hydratation.quantite, 0) / qt7j.length;

    // Indices normalisés 0..1 (min(1, user/reco))
    const indiceSommeil = Math.min(1, sommeilMoy / 8);
    const indiceHydratation = Math.min(1, hydratMoy / 2000);

    // Indice santé simple (moyenne des indices disponibles)
    const indice = (indiceSommeil + indiceHydratation) / 2;
    this.indiceSante = Math.round(indice * 100); // en %

    // Historique indice santé
    this.historiqueIndiceSante.push({
      valeur: this.indiceSante,
      dateCalculee: new Date(fin),
    });

    return this.indiceSante;
  }

  /**
   * Ajoute un indice (ex: IndiceSommeil, IndiceStress, etc.) dans l'historique
   */
  public ajouterIndice(indice: Indice): void {
    this.historiqueIndices.push(indice);
  }

  // -----------------------
  // Helpers date
  // -----------------------

  private static sameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  private static inRange(d: Date, start: Date, end: Date): boolean {
    const t = d.getTime();
    return t >= Profil.startOfDay(start).getTime() && t <= Profil.endOfDay(end).getTime();
  }

  private static startOfDay(d: Date): Date {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  private static endOfDay(d: Date): Date {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x;
  }
}
