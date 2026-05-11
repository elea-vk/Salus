import Couleurs from "@/constantes/couleurs";
// Importation des hooks React utilisés dans la page.
// useEffect sert aux chargements/sauvegardes.
// useMemo sert à recalculer certaines valeurs seulement quand les données changent.
// useState sert à garder les valeurs en mémoire pendant l'utilisation de la page.
import React, { useEffect, useMemo, useState } from "react";

// Importation des composants React Native utilisés pour construire l'interface.
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

// AsyncStorage permet de sauvegarder les données localement sur l'appareil.
import AsyncStorage from "@react-native-async-storage/async-storage";

// Ionicons sert à afficher des icônes, comme la poubelle ou le bouton ajouter.
import Ionicons from "@expo/vector-icons/Ionicons";

// react-native-svg sert à dessiner le graphique du poids.
import Svg, {
  Circle,
  Line,
  Polyline,
  Text as SvgText,
} from "react-native-svg";

// -------------------------
// Types TypeScript
// -------------------------

// Unité utilisée pour le poids.
type UnitePoids = "kg" | "lbs";

// Périodes possibles pour afficher la tendance de prise/perte de poids.
type PeriodeTendance = "jour" | "semaine" | "mois" | "annee";

// Onglets internes de la page poids.
type OngletPoids = "entrees" | "graphique";

// Structure d'une entrée de poids sauvegardée.
type EntreePoids = {
  id: string;
  poids: string;
  date: string;
  unite: UnitePoids;
};

// Structure de l'objectif de poids de l'utilisateur.
type ObjectifPoids = {
  poids: string;
  date: string;
  unite: UnitePoids;
};

// -------------------------
// Clés AsyncStorage
// -------------------------

// Clé utilisée pour sauvegarder toutes les entrées de poids.
const CLE_ENTREES_POIDS = "@salus_poids_entrees";

// Clé utilisée pour sauvegarder l'objectif de poids.
const CLE_OBJECTIF_POIDS = "@salus_poids_objectif";

// -------------------------
// Fonctions utilitaires
// -------------------------

// Crée un identifiant unique pour chaque entrée ajoutée.
function creerIdUnique() {
  return `${Date.now()}-${Math.random()}`;
}

// Retourne la date d'aujourd'hui au format AAAA-MM-JJ.
function obtenirDateAujourdhui() {
  return new Date().toISOString().split("T")[0];
}

// Convertit un texte en nombre.
// La fonction accepte aussi les virgules, par exemple "80,5".
function convertirEnNombre(valeur: string): number {
  const nombre = Number(valeur.replace(",", "."));
  return Number.isFinite(nombre) ? nombre : 0;
}

// Convertit une valeur de poids en kilogrammes.
// Les calculs internes utilisent le kg pour garder une unité commune.
function convertirEnKg(poids: number, unite: UnitePoids) {
  return unite === "kg" ? poids : poids * 0.45359237;
}

// Convertit un poids en kg vers l'unité choisie par l'utilisateur.
function convertirDepuisKg(poidsKg: number, unite: UnitePoids) {
  return unite === "kg" ? poidsKg : poidsKg / 0.45359237;
}

// Arrondit une valeur numérique.
function arrondir(valeur: number, decimales = 1) {
  const facteur = Math.pow(10, decimales);
  return Math.round(valeur * facteur) / facteur;
}

// Transforme une date au format AAAA-MM-JJ en timestamp.
// Cela permet de comparer les dates et de les placer sur l'axe X du graphique.
function convertirDateEnTemps(date: string) {
  return new Date(`${date}T00:00:00`).getTime();
}

// Transforme une date AAAA-MM-JJ en format JJ/MM/AAAA pour l'affichage.
function formaterDate(date: string) {
  const morceaux = date.split("-");
  if (morceaux.length !== 3) return date;
  return `${morceaux[2]}/${morceaux[1]}/${morceaux[0]}`;
}

// Crée une date complète à partir d'une année, d'un mois et d'un jour.
function creerDate(annee: string, mois: string, jour: string) {
  return `${annee}-${mois.padStart(2, "0")}-${jour.padStart(2, "0")}`;
}

// Sépare une date AAAA-MM-JJ en année, mois et jour.
function separerDate(date: string) {
  const morceaux = date.split("-");
  return {
    annee: morceaux[0] || String(new Date().getFullYear()),
    mois: morceaux[1] || "01",
    jour: morceaux[2] || "01",
  };
}

// Calcule une régression linéaire simple.
// Elle sert à obtenir une ligne de tendance du poids selon le temps.
function calculerRegression(points: { x: number; y: number }[]) {
  if (points.length < 2) return null;

  const n = points.length;
  const sommeX = points.reduce((somme, point) => somme + point.x, 0);
  const sommeY = points.reduce((somme, point) => somme + point.y, 0);
  const sommeXY = points.reduce((somme, point) => somme + point.x * point.y, 0);
  const sommeX2 = points.reduce((somme, point) => somme + point.x * point.x, 0);

  const denominateur = n * sommeX2 - sommeX * sommeX;
  if (denominateur === 0) return null;

  const pente = (n * sommeXY - sommeX * sommeY) / denominateur;
  const ordonnee = (sommeY - pente * sommeX) / n;

  return { pente, ordonnee };
}

// Convertit la tendance par jour en tendance par semaine, mois ou année.
function convertirTendanceParPeriode(
  tendanceParJour: number,
  periode: PeriodeTendance
) {
  if (periode === "jour") return tendanceParJour;
  if (periode === "semaine") return tendanceParJour * 7;
  if (periode === "mois") return tendanceParJour * 30;
  return tendanceParJour * 365;
}

// Retourne le texte affiché pour la période choisie.
function libellePeriode(periode: PeriodeTendance) {
  if (periode === "jour") return "jour";
  if (periode === "semaine") return "semaine";
  if (periode === "mois") return "mois";
  return "année";
}

// Calcule des limites propres pour l'axe Y du graphique.
// Cela évite que le graphique soit trop serré autour des points.
function calculerLimitesAxeY(valeurs: number[]) {
  if (valeurs.length === 0) {
    return { minY: 0, maxY: 10 };
  }

  const min = Math.min(...valeurs);
  const max = Math.max(...valeurs);
  const ecart = max - min;

  const marge = Math.max(ecart * 0.25, 2);
  const minY = Math.floor((min - marge) / 5) * 5;
  const maxY = Math.ceil((max + marge) / 5) * 5;

  if (minY === maxY) {
    return {
      minY: minY - 5,
      maxY: maxY + 5,
    };
  }

  return { minY, maxY };
}

// -------------------------
// Composant SelecteurDate
// -------------------------

type SelecteurDateProps = {
  date: string;
  onChangeDate: (date: string) => void;
};

// Ce composant affiche trois listes scrollables : année, mois et jour.
// Il sert à choisir une date sans écrire manuellement dans un TextInput.
function SelecteurDate({ date, onChangeDate }: SelecteurDateProps) {
  const { annee, mois, jour } = separerDate(date);

  const anneeActuelle = new Date().getFullYear();

  // Liste d'années disponibles : de 30 ans avant aujourd'hui à 10 ans après.
  const annees = Array.from({ length: 41 }, (_, index) =>
    String(anneeActuelle - 30 + index)
  );

  // Liste des mois de 01 à 12.
  const moisListe = Array.from({ length: 12 }, (_, index) =>
    String(index + 1).padStart(2, "0")
  );

  // Liste des jours de 01 à 31.
  const joursListe = Array.from({ length: 31 }, (_, index) =>
    String(index + 1).padStart(2, "0")
  );

  // Met à jour la date complète quand l'utilisateur choisit une année, un mois ou un jour.
  const mettreAJour = (
    nouvelleAnnee: string,
    nouveauMois: string,
    nouveauJour: string
  ) => {
    onChangeDate(creerDate(nouvelleAnnee, nouveauMois, nouveauJour));
  };

  return (
    <View style={styles.selecteurDate}>
      {/* Colonne pour choisir l'année */}
      <View style={styles.colonneDate}>
        <Text style={styles.libelleChamp}>Année</Text>
        <ScrollView style={styles.listeDate} showsVerticalScrollIndicator={false}>
          {annees.map((valeur) => (
            <Pressable
              key={valeur}
              style={[
                styles.optionDate,
                annee === valeur && styles.optionDateActive,
              ]}
              onPress={() => mettreAJour(valeur, mois, jour)}
            >
              <Text
                style={[
                  styles.texteOptionDate,
                  annee === valeur && styles.texteOptionDateActive,
                ]}
              >
                {valeur}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Colonne pour choisir le mois */}
      <View style={styles.colonneDate}>
        <Text style={styles.libelleChamp}>Mois</Text>
        <ScrollView style={styles.listeDate} showsVerticalScrollIndicator={false}>
          {moisListe.map((valeur) => (
            <Pressable
              key={valeur}
              style={[
                styles.optionDate,
                mois === valeur && styles.optionDateActive,
              ]}
              onPress={() => mettreAJour(annee, valeur, jour)}
            >
              <Text
                style={[
                  styles.texteOptionDate,
                  mois === valeur && styles.texteOptionDateActive,
                ]}
              >
                {valeur}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Colonne pour choisir le jour */}
      <View style={styles.colonneDate}>
        <Text style={styles.libelleChamp}>Jour</Text>
        <ScrollView style={styles.listeDate} showsVerticalScrollIndicator={false}>
          {joursListe.map((valeur) => (
            <Pressable
              key={valeur}
              style={[
                styles.optionDate,
                jour === valeur && styles.optionDateActive,
              ]}
              onPress={() => mettreAJour(annee, mois, valeur)}
            >
              <Text
                style={[
                  styles.texteOptionDate,
                  jour === valeur && styles.texteOptionDateActive,
                ]}
              >
                {valeur}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

// -------------------------
// Écran principal
// -------------------------

export default function Poid() {
  // Onglet actif : soit la section des entrées, soit la section graphique.
  const [ongletActif, setOngletActif] = useState<OngletPoids>("entrees");

  // Valeurs du formulaire pour ajouter une nouvelle entrée de poids.
  const [poids, setPoids] = useState("");
  const [date, setDate] = useState(obtenirDateAujourdhui());
  const [unite, setUnite] = useState<UnitePoids>("kg");

  // Liste de toutes les entrées de poids sauvegardées.
  const [entreesPoids, setEntreesPoids] = useState<EntreePoids[]>([]);

  // Objectif de poids choisi par l'utilisateur.
  const [objectifPoids, setObjectifPoids] = useState<ObjectifPoids>({
    poids: "",
    date: obtenirDateAujourdhui(),
    unite: "kg",
  });

  // Période choisie pour afficher la tendance.
  const [periodeTendance, setPeriodeTendance] =
    useState<PeriodeTendance>("semaine");

  // Charge les données sauvegardées quand la page s'ouvre.
  useEffect(() => {
    const chargerDonnees = async () => {
      try {
        const [entreesSauvegardees, objectifSauvegarde] = await Promise.all([
          AsyncStorage.getItem(CLE_ENTREES_POIDS),
          AsyncStorage.getItem(CLE_OBJECTIF_POIDS),
        ]);

        if (entreesSauvegardees) {
          setEntreesPoids(JSON.parse(entreesSauvegardees));
        }

        if (objectifSauvegarde) {
          setObjectifPoids(JSON.parse(objectifSauvegarde));
        }
      } catch (erreur) {
        console.log("Erreur chargement poids :", erreur);
      }
    };

    chargerDonnees();
  }, []);

  // Sauvegarde automatiquement les entrées de poids dès que la liste change.
  useEffect(() => {
    AsyncStorage.setItem(CLE_ENTREES_POIDS, JSON.stringify(entreesPoids)).catch(
      (erreur) => {
        console.log("Erreur sauvegarde poids :", erreur);
      }
    );
  }, [entreesPoids]);

  // Sauvegarde automatiquement l'objectif de poids dès qu'il change.
  useEffect(() => {
    AsyncStorage.setItem(CLE_OBJECTIF_POIDS, JSON.stringify(objectifPoids)).catch(
      (erreur) => {
        console.log("Erreur sauvegarde objectif poids :", erreur);
      }
    );
  }, [objectifPoids]);

  // Trie les entrées de poids par date, de la plus ancienne à la plus récente.
  const entreesTriees = useMemo(() => {
    return [...entreesPoids].sort(
      (a, b) => convertirDateEnTemps(a.date) - convertirDateEnTemps(b.date)
    );
  }, [entreesPoids]);

  // Prépare les données utilisées pour le graphique.
  // Chaque poids est converti en kg pour avoir une base commune.
  const donneesGraphique = useMemo(() => {
    return entreesTriees
      .map((entree) => {
        const poidsNombre = convertirEnNombre(entree.poids);
        return {
          id: entree.id,
          date: entree.date,
          x: convertirDateEnTemps(entree.date),
          yKg: convertirEnKg(poidsNombre, entree.unite),
        };
      })
      .filter((point) => point.yKg > 0);
  }, [entreesTriees]);

  // L'unité d'affichage dépend du bouton kg/lbs choisi dans la section entrée.
  const uniteAffichage = unite;

  // Calcule le poids actuel, donc la dernière entrée selon la date.
  const poidsActuel = useMemo(() => {
    if (donneesGraphique.length === 0) return 0;
    return convertirDepuisKg(
      donneesGraphique[donneesGraphique.length - 1].yKg,
      uniteAffichage
    );
  }, [donneesGraphique, uniteAffichage]);

  // Calcule le premier poids enregistré.
  const premierPoids = useMemo(() => {
    if (donneesGraphique.length === 0) return 0;
    return convertirDepuisKg(donneesGraphique[0].yKg, uniteAffichage);
  }, [donneesGraphique, uniteAffichage]);

  // Différence entre le poids actuel et le premier poids.
  const differenceTotale = poidsActuel - premierPoids;

  // Calcule la régression linéaire pour la tendance.
  const regression = useMemo(() => {
    if (donneesGraphique.length < 2) return null;

    const premierJour = donneesGraphique[0].x;

    // Convertit les dates en nombre de jours depuis la première entrée.
    const points = donneesGraphique.map((point) => ({
      x: (point.x - premierJour) / (1000 * 60 * 60 * 24),
      y: convertirDepuisKg(point.yKg, uniteAffichage),
    }));

    return calculerRegression(points);
  }, [donneesGraphique, uniteAffichage]);

  // Pente de la régression : variation de poids par jour.
  const tendanceParJour = regression?.pente ?? 0;

  // Convertit la tendance selon la période choisie.
  const tendanceSelonPeriode = convertirTendanceParPeriode(
    tendanceParJour,
    periodeTendance
  );

  // Ajoute une nouvelle entrée de poids.
  const ajouterEntreePoids = () => {
    const poidsNombre = convertirEnNombre(poids);

    // Empêche d'ajouter une entrée vide ou invalide.
    if (!poidsNombre || !date) return;

    const nouvelleEntree: EntreePoids = {
      id: creerIdUnique(),
      poids,
      date,
      unite,
    };

    setEntreesPoids((precedent) => [...precedent, nouvelleEntree]);

    // Réinitialise le formulaire après ajout.
    setPoids("");
    setDate(obtenirDateAujourdhui());
  };

  // Supprime une entrée selon son identifiant.
  const supprimerEntreePoids = (id: string) => {
    setEntreesPoids((precedent) =>
      precedent.filter((entree) => entree.id !== id)
    );
  };

  // Met à jour une valeur dans l'objectif de poids.
  const mettreAJourObjectif = (
    champ: keyof ObjectifPoids,
    valeur: string | UnitePoids
  ) => {
    setObjectifPoids((precedent) => ({
      ...precedent,
      [champ]: valeur,
    }));
  };

  // Prépare toutes les données nécessaires pour dessiner le graphique SVG.
  const graphique = useMemo(() => {
    const largeurMinimale = 360;
    const hauteur = 390;
    const pixelsParJour = 10;

    const paddingGauche = 58;
    const paddingBas = 58;
    const paddingHaut = 34;
    const paddingDroite = 24;

    // Si aucune donnée n'existe, on retourne une structure vide.
    if (donneesGraphique.length === 0) {
      return {
        largeur: largeurMinimale,
        hauteur,
        paddingGauche,
        paddingBas,
        paddingHaut,
        paddingDroite,
        points: "",
        pointsBruts: [],
        ligneRegression: null,
        ligneObjectif: null,
        minY: 0,
        maxY: 0,
        milieuY: 0,
        etiquettesTemps: [],
        etiquettesPoids: [],
      };
    }

    // Convertit l'objectif de poids en kg.
    const objectifNombre = convertirEnNombre(objectifPoids.poids);
    const objectifKg = objectifNombre
      ? convertirEnKg(objectifNombre, objectifPoids.unite)
      : null;

    // Dates et poids réels utilisés dans le graphique.
    const datesX = donneesGraphique.map((point) => point.x);
    const poidsY = donneesGraphique.map((point) =>
      convertirDepuisKg(point.yKg, uniteAffichage)
    );

    // Date objectif convertie en timestamp.
    const dateObjectifTemps = objectifPoids.date
      ? convertirDateEnTemps(objectifPoids.date)
      : null;

    const minX = Math.min(...datesX);

    // Le maxX inclut la date objectif pour que la ligne objectif soit visible.
    const maxX = Math.max(
      ...datesX,
      dateObjectifTemps !== null ? dateObjectifTemps : minX
    );

    // Calcule la largeur du graphique selon la durée totale.
    // Plus la date objectif est loin, plus le graphique devient large.
    const nombreJours = Math.max(
      1,
      (maxX - minX) / (1000 * 60 * 60 * 24)
    );

    const largeur = Math.max(
      largeurMinimale,
      nombreJours * pixelsParJour + paddingGauche + paddingDroite
    );

    // Convertit le poids objectif dans l'unité d'affichage.
    const poidsObjectifAffiche =
      objectifKg !== null ? convertirDepuisKg(objectifKg, uniteAffichage) : null;

    // Inclut le poids objectif dans le calcul des limites de l'axe Y.
    const toutesValeursY =
      poidsObjectifAffiche !== null
        ? [...poidsY, poidsObjectifAffiche]
        : poidsY;

    const { minY, maxY } = calculerLimitesAxeY(toutesValeursY);
    const milieuY = (minY + maxY) / 2;

    // Convertit une date/timestamp en position horizontale sur le SVG.
    const convertirX = (x: number) => {
      if (maxX === minX) return largeur / 2;
      return (
        paddingGauche +
        ((x - minX) / (maxX - minX)) *
          (largeur - paddingGauche - paddingDroite)
      );
    };

    // Convertit un poids en position verticale sur le SVG.
    const convertirY = (y: number) => {
      if (maxY === minY) return hauteur / 2;
      return (
        hauteur -
        paddingBas -
        ((y - minY) / (maxY - minY)) *
          (hauteur - paddingHaut - paddingBas)
      );
    };

    // Points réels du graphique après conversion en positions SVG.
    const pointsBruts = donneesGraphique.map((point) => {
      const poidsAffiche = convertirDepuisKg(point.yKg, uniteAffichage);

      return {
        x: convertirX(point.x),
        y: convertirY(poidsAffiche),
        poids: poidsAffiche,
        date: point.date,
      };
    });

    // Polyline a besoin d'une chaîne de points sous la forme "x,y x,y x,y".
    const points = pointsBruts.map((point) => `${point.x},${point.y}`).join(" ");

    let ligneRegression = null;

    // Prépare la ligne de tendance si au moins deux points existent.
    if (regression && donneesGraphique.length >= 2) {
      const premierJour = donneesGraphique[0].x;
      const xDebutJour = (minX - premierJour) / (1000 * 60 * 60 * 24);
      const xFinJour = (maxX - premierJour) / (1000 * 60 * 60 * 24);

      const yDebut = regression.pente * xDebutJour + regression.ordonnee;
      const yFin = regression.pente * xFinJour + regression.ordonnee;

      ligneRegression = {
        x1: convertirX(minX),
        y1: convertirY(yDebut),
        x2: convertirX(maxX),
        y2: convertirY(yFin),
      };
    }

    let ligneObjectif = null;

    // Prépare la ligne pointillée de l'objectif.
    if (
      objectifKg !== null &&
      objectifPoids.date &&
      donneesGraphique.length >= 1
    ) {
      const debut = donneesGraphique[0];
      const poidsDebut = convertirDepuisKg(debut.yKg, uniteAffichage);
      const poidsObjectif = convertirDepuisKg(objectifKg, uniteAffichage);

      ligneObjectif = {
        x1: convertirX(debut.x),
        y1: convertirY(poidsDebut),
        x2: convertirX(convertirDateEnTemps(objectifPoids.date)),
        y2: convertirY(poidsObjectif),
      };
    }

    // Étiquettes de temps affichées sur l'axe X.
    const etiquettesTemps =
      donneesGraphique.length === 1
        ? [
            {
              x: convertirX(donneesGraphique[0].x),
              label: formaterDate(donneesGraphique[0].date).slice(0, 5),
            },
          ]
        : [
            {
              x: convertirX(minX),
              label: formaterDate(
                new Date(minX).toISOString().split("T")[0]
              ).slice(0, 5),
            },
            {
              x: convertirX(minX + (maxX - minX) / 2),
              label: formaterDate(
                new Date(minX + (maxX - minX) / 2)
                  .toISOString()
                  .split("T")[0]
              ).slice(0, 5),
            },
            {
              x: convertirX(maxX),
              label: formaterDate(
                new Date(maxX).toISOString().split("T")[0]
              ).slice(0, 5),
            },
          ];

    // Étiquettes de poids affichées sur l'axe Y.
    const etiquettesPoids = [
      {
        y: convertirY(maxY),
        label: `${arrondir(maxY, 1)} ${uniteAffichage}`,
      },
      {
        y: convertirY(milieuY),
        label: `${arrondir(milieuY, 1)} ${uniteAffichage}`,
      },
      {
        y: convertirY(minY),
        label: `${arrondir(minY, 1)} ${uniteAffichage}`,
      },
    ];

    return {
      largeur,
      hauteur,
      paddingGauche,
      paddingBas,
      paddingHaut,
      paddingDroite,
      points,
      pointsBruts,
      ligneRegression,
      ligneObjectif,
      minY,
      maxY,
      milieuY,
      etiquettesTemps,
      etiquettesPoids,
    };
  }, [donneesGraphique, objectifPoids, regression, uniteAffichage]);

  return (
    <View style={styles.ecran}>
      <ScrollView contentContainerStyle={styles.conteneur}>
        <Text style={styles.titre}>Poids</Text>

        {/* Onglets pour changer entre la page d'entrées et la page graphique. */}
        <View style={styles.barreOnglets}>
          <Pressable
            style={[
              styles.boutonOnglet,
              ongletActif === "entrees" && styles.boutonOngletActif,
            ]}
            onPress={() => setOngletActif("entrees")}
          >
            <Text
              style={[
                styles.texteOnglet,
                ongletActif === "entrees" && styles.texteOngletActif,
              ]}
            >
              Entrées
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.boutonOnglet,
              ongletActif === "graphique" && styles.boutonOngletActif,
            ]}
            onPress={() => setOngletActif("graphique")}
          >
            <Text
              style={[
                styles.texteOnglet,
                ongletActif === "graphique" && styles.texteOngletActif,
              ]}
            >
              Graphique
            </Text>
          </Pressable>
        </View>

        {ongletActif === "entrees" ? (
          <>
            {/* Carte qui affiche le poids actuel et le changement total. */}
            <View style={styles.carteResume}>
              <Text style={styles.sousTitre}>Poids actuel</Text>
              <Text style={styles.grosNombre}>
                {poidsActuel ? arrondir(poidsActuel, 1) : "--"} {uniteAffichage}
              </Text>

              <Text style={styles.texteResume}>
                Changement total :{" "}
                {donneesGraphique.length >= 2
                  ? `${differenceTotale >= 0 ? "+" : ""}${arrondir(
                      differenceTotale,
                      1
                    )} ${uniteAffichage}`
                  : "pas assez de données"}
              </Text>
            </View>

            {/* Formulaire pour ajouter une nouvelle entrée de poids. */}
            <View style={styles.carteSection}>
              <Text style={styles.titreSection}>Ajouter une entrée</Text>

              {/* Choix de l'unité de poids pour la nouvelle entrée. */}
              <View style={styles.rangeeChoix}>
                {(["kg", "lbs"] as UnitePoids[]).map((choix) => (
                  <Pressable
                    key={choix}
                    style={[
                      styles.boutonChoix,
                      unite === choix && styles.boutonChoixActif,
                    ]}
                    onPress={() => setUnite(choix)}
                  >
                    <Text
                      style={[
                        styles.texteChoix,
                        unite === choix && styles.texteChoixActif,
                      ]}
                    >
                      {choix.toUpperCase()}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Champ pour écrire le poids. */}
              <View style={styles.groupeChamp}>
                <Text style={styles.libelleChamp}>Poids</Text>
                <TextInput
                  style={styles.champ}
                  value={poids}
                  onChangeText={setPoids}
                  placeholder={`Ex. : ${unite === "kg" ? "80" : "176"}`}
                  keyboardType="numeric"
                  placeholderTextColor="#8c8c8c"
                />
              </View>

              {/* Sélecteur de date pour l'entrée de poids. */}
              <View style={styles.groupeChamp}>
                <Text style={styles.libelleChamp}>Date</Text>
                <Text style={styles.dateSelectionnee}>
                  Date choisie : {formaterDate(date)}
                </Text>
                <SelecteurDate date={date} onChangeDate={setDate} />
              </View>

              {/* Bouton qui ajoute l'entrée dans la liste. */}
              <Pressable
                style={styles.boutonPrincipal}
                onPress={ajouterEntreePoids}
              >
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.texteBoutonPrincipal}>
                  Ajouter le poids
                </Text>
              </Pressable>
            </View>

            {/* Liste des entrées déjà sauvegardées. */}
            <View style={styles.carteSection}>
              <Text style={styles.titreSection}>Entrées de poids</Text>

              {entreesTriees.length === 0 ? (
                <Text style={styles.texteVide}>Aucune entrée pour le moment.</Text>
              ) : (
                [...entreesTriees].reverse().map((entree) => (
                  <View key={entree.id} style={styles.carteEntree}>
                    <View>
                      <Text style={styles.texteDate}>
                        {formaterDate(entree.date)}
                      </Text>
                      <Text style={styles.textePoids}>
                        {entree.poids} {entree.unite}
                      </Text>
                    </View>

                    <Pressable
                      style={styles.boutonSupprimer}
                      onPress={() => supprimerEntreePoids(entree.id)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#d9534f"
                      />
                    </Pressable>
                  </View>
                ))
              )}
            </View>
          </>
        ) : (
          <>
            {/* Section graphique. */}
            <View style={styles.carteSection}>
              <Text style={styles.titreSection}>Graphique</Text>
              <Text style={styles.sousTexte}>
                Ligne rose : poids réel. Ligne blanche : tendance. Ligne pointillée :
                objectif.
              </Text>

              {donneesGraphique.length === 0 ? (
                <Text style={styles.texteVide}>
                  Ajoute une entrée de poids pour afficher le graphique.
                </Text>
              ) : (
                <View style={styles.conteneurGraphique}>
                  {/* Scroll horizontal pour voir les objectifs ou tendances plus loin dans le temps. */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={true}
                    contentContainerStyle={styles.contenuGraphiqueHorizontal}
                  >
                    <Svg width={graphique.largeur} height={graphique.hauteur}>
                      {/* Axe horizontal */}
                      <Line
                        x1={graphique.paddingGauche}
                        y1={graphique.hauteur - graphique.paddingBas}
                        x2={graphique.largeur - graphique.paddingDroite}
                        y2={graphique.hauteur - graphique.paddingBas}
                        stroke="#555"
                        strokeWidth={1}
                      />

                      {/* Axe vertical */}
                      <Line
                        x1={graphique.paddingGauche}
                        y1={graphique.paddingHaut}
                        x2={graphique.paddingGauche}
                        y2={graphique.hauteur - graphique.paddingBas}
                        stroke="#555"
                        strokeWidth={1}
                      />

                      {/* Lignes horizontales et valeurs de l'axe Y */}
                      {graphique.etiquettesPoids.map((etiquette, index) => (
                        <React.Fragment key={`poids-${index}`}>
                          <Line
                            x1={graphique.paddingGauche}
                            y1={etiquette.y}
                            x2={graphique.largeur - graphique.paddingDroite}
                            y2={etiquette.y}
                            stroke="#333"
                            strokeWidth={1}
                          />
                          <SvgText
                            x={4}
                            y={etiquette.y + 4}
                            fill="#d8d8d8"
                            fontSize="11"
                          >
                            {etiquette.label}
                          </SvgText>
                        </React.Fragment>
                      ))}

                      {/* Ligne pointillée de l'objectif de poids */}
                      {graphique.ligneObjectif ? (
                        <Line
                          x1={graphique.ligneObjectif.x1}
                          y1={graphique.ligneObjectif.y1}
                          x2={graphique.ligneObjectif.x2}
                          y2={graphique.ligneObjectif.y2}
                          stroke="#ffffff"
                          strokeWidth={2}
                          strokeDasharray="7 6"
                        />
                      ) : null}

                      {/* Ligne blanche de régression/tendance */}
                      {graphique.ligneRegression ? (
                        <Line
                          x1={graphique.ligneRegression.x1}
                          y1={graphique.ligneRegression.y1}
                          x2={graphique.ligneRegression.x2}
                          y2={graphique.ligneRegression.y2}
                          stroke="#ffffff"
                          strokeWidth={2}
                        />
                      ) : null}

                      {/* Ligne rose reliant les vrais points de poids */}
                      {graphique.points ? (
                        <Polyline
                          points={graphique.points}
                          fill="none"
                          stroke={Couleurs.flash}
                          strokeWidth={3}
                        />
                      ) : null}

                      {/* Points roses individuels sur le graphique */}
                      {graphique.pointsBruts.map((point, index) => (
                        <Circle
                          key={`${point.date}-${index}`}
                          cx={point.x}
                          cy={point.y}
                          r={5}
                          fill={Couleurs.flash}
                        />
                      ))}

                      {/* Étiquettes de date sur l'axe X */}
                      {graphique.etiquettesTemps.map((etiquette, index) => (
                        <SvgText
                          key={`${etiquette.label}-${index}`}
                          x={etiquette.x - 16}
                          y={graphique.hauteur - 20}
                          fill="#d8d8d8"
                          fontSize="11"
                        >
                          {etiquette.label}
                        </SvgText>
                      ))}
                    </Svg>
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Section pour définir l'objectif de poids. */}
            <View style={styles.carteSection}>
              <Text style={styles.titreSection}>Objectif de poids</Text>

              {/* Choix de l'unité de l'objectif. */}
              <View style={styles.rangeeChoix}>
                {(["kg", "lbs"] as UnitePoids[]).map((choix) => (
                  <Pressable
                    key={choix}
                    style={[
                      styles.boutonChoix,
                      objectifPoids.unite === choix &&
                        styles.boutonChoixActif,
                    ]}
                    onPress={() => mettreAJourObjectif("unite", choix)}
                  >
                    <Text
                      style={[
                        styles.texteChoix,
                        objectifPoids.unite === choix &&
                          styles.texteChoixActif,
                      ]}
                    >
                      {choix.toUpperCase()}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Champ pour le poids objectif. */}
              <View style={styles.groupeChamp}>
                <Text style={styles.libelleChamp}>Poids objectif</Text>
                <TextInput
                  style={styles.champ}
                  value={objectifPoids.poids}
                  onChangeText={(valeur) =>
                    mettreAJourObjectif("poids", valeur)
                  }
                  placeholder="Ex. : 75"
                  keyboardType="numeric"
                  placeholderTextColor="#8c8c8c"
                />
              </View>

              {/* Date objectif avec le même sélecteur de date. */}
              <View style={styles.groupeChamp}>
                <Text style={styles.libelleChamp}>Date objectif</Text>
                <Text style={styles.dateSelectionnee}>
                  Date choisie : {formaterDate(objectifPoids.date)}
                </Text>
                <SelecteurDate
                  date={objectifPoids.date}
                  onChangeDate={(nouvelleDate) =>
                    mettreAJourObjectif("date", nouvelleDate)
                  }
                />
              </View>
            </View>

            {/* Section tendance : variation par jour, semaine, mois ou année. */}
            <View style={styles.carteSection}>
              <Text style={styles.titreSection}>Tendance</Text>

              <View style={styles.rangeeChoix}>
                {(["jour", "semaine", "mois", "annee"] as PeriodeTendance[]).map(
                  (periode) => (
                    <Pressable
                      key={periode}
                      style={[
                        styles.boutonChoix,
                        periodeTendance === periode &&
                          styles.boutonChoixActif,
                      ]}
                      onPress={() => setPeriodeTendance(periode)}
                    >
                      <Text
                        style={[
                          styles.texteChoix,
                          periodeTendance === periode &&
                            styles.texteChoixActif,
                        ]}
                      >
                        {periode === "annee" ? "Année" : periode}
                      </Text>
                    </Pressable>
                  )
                )}
              </View>

              <Text style={styles.texteTendance}>
                {donneesGraphique.length >= 2
                  ? `${tendanceSelonPeriode >= 0 ? "+" : ""}${arrondir(
                      tendanceSelonPeriode,
                      2
                    )} ${uniteAffichage} / ${libellePeriode(periodeTendance)}`
                  : "Ajoute au moins deux entrées pour calculer une tendance."}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

// -------------------------
// Styles
// -------------------------

const styles = StyleSheet.create({
  ecran: {
    flex: 1,
    backgroundColor: Couleurs.background,
  },
  conteneur: {
    padding: 16,
    paddingBottom: 36,
    gap: 16,
  },
  titre: {
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 10,
    color: "#111",
  },
  barreOnglets: {
    flexDirection: "row",
    gap: 12,
  },
  boutonOnglet: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#dcdcdc",
  },
  boutonOngletActif: {
    backgroundColor: Couleurs.secondary,
    borderColor: Couleurs.secondary,
  },
  texteOnglet: {
    fontSize: 16,
    fontWeight: "800",
    color: "#333",
  },
  texteOngletActif: {
    color: "white",
  },
  carteResume: {
    backgroundColor: "#050505",
    borderRadius: 28,
    padding: 22,
    alignItems: "center",
  },
  sousTitre: {
    color: "#d8d8d8",
    fontSize: 17,
    fontWeight: "700",
  },
  grosNombre: {
    color: Couleurs.flash,
    fontSize: 52,
    fontWeight: "900",
    marginTop: 8,
  },
  texteResume: {
    color: "white",
    fontSize: 15,
    marginTop: 8,
    textAlign: "center",
  },
  carteSection: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  titreSection: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111",
  },
  sousTexte: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  rangeeChoix: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  boutonChoix: {
    backgroundColor: "#f4f4f4",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  boutonChoixActif: {
    backgroundColor: Couleurs.secondary,
  },
  texteChoix: {
    color: "#333",
    fontWeight: "700",
    textTransform: "capitalize",
  },
  texteChoixActif: {
    color: "white",
  },
  groupeChamp: {
    gap: 6,
  },
  libelleChamp: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
  },
  champ: {
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#222",
  },
  boutonPrincipal: {
    backgroundColor: "#222",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  texteBoutonPrincipal: {
    color: "white",
    fontWeight: "800",
    fontSize: 15,
  },
  selecteurDate: {
    flexDirection: "row",
    gap: 10,
  },
  colonneDate: {
    flex: 1,
  },
  listeDate: {
    maxHeight: 130,
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 14,
    padding: 6,
  },
  optionDate: {
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: "center",
  },
  optionDateActive: {
    backgroundColor: Couleurs.secondary,
  },
  texteOptionDate: {
    fontWeight: "700",
    color: "#333",
  },
  texteOptionDateActive: {
    color: "white",
  },
  dateSelectionnee: {
    fontSize: 14,
    color: "#666",
    fontWeight: "700",
  },
  texteTendance: {
    fontSize: 26,
    fontWeight: "900",
    color: "#111",
  },
  conteneurGraphique: {
    backgroundColor: "#111",
    borderRadius: 18,
    paddingVertical: 16,
    overflow: "hidden",
  },
  contenuGraphiqueHorizontal: {
    paddingHorizontal: 8,
  },
  texteVide: {
    color: "#666",
    fontSize: 15,
    fontStyle: "italic",
  },
  carteEntree: {
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#ececec",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  texteDate: {
    fontSize: 14,
    color: "#666",
    fontWeight: "700",
  },
  textePoids: {
    fontSize: 22,
    color: "#111",
    fontWeight: "900",
    marginTop: 4,
  },
  boutonSupprimer: {
    backgroundColor: "#fff3f3",
    borderRadius: 10,
    padding: 8,
  },
});