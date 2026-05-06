import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "@expo/vector-icons/Ionicons";
import Svg, { Circle } from "react-native-svg";

// -------------------------
// Types
// -------------------------

// Représente les deux sections principales de la page alimentation.
type OngletAlimentation = "journal" | "calculateur";

// Représente les catégories de repas où l'utilisateur peut ajouter une entrée.
type TypeRepas = "dejeuner" | "diner" | "souper" | "collation";

// Représente le sexe choisi dans le calculateur de calories.
type Sexe = "homme" | "femme";

// Représente les niveaux d'activité utilisés pour calculer le TDEE.
type NiveauActivite =
  | "sedentaire"
  | "leger"
  | "modere"
  | "eleve"
  | "tres_eleve";

// Représente l'objectif principal de l'utilisateur.
type TypeObjectifPoids = "perdre" | "maintenir" | "gagner";

// Représente une entrée alimentaire ajoutée dans le journal.
type EntreeRepas = {
  id: string;
  nom: string;
  calories: string;
  proteines: string;
  glucides: string;
  lipides: string;
  autreInfo: string;
  typeRepas: TypeRepas;
};

// Représente les objectifs nutritionnels de la journée.
type ObjectifsJournalier = {
  calories: string;
  proteines: string;
  glucides: string;
  lipides: string;
  objectifPoids: TypeObjectifPoids;
};

// Représente les données personnelles utilisées pour calculer les calories.
type DonneesPersonnelles = {
  poids: string;
  age: string;
  sexe: Sexe;
  taille: string;
  niveauActivite: NiveauActivite;
};

// Représente une stratégie calorique calculée selon le TDEE.
type StrategieCalories = {
  titre: string;
  calories: number;
  variationKgParSemaine: number;
  description: string;
};

// -------------------------
// Constantes
// -------------------------

// Clés utilisées pour sauvegarder les données localement avec AsyncStorage.
const CLE_REPAS = "@salus_alimentation_repas";
const CLE_OBJECTIFS = "@salus_alimentation_objectifs";
const CLE_DONNEES_PERSONNELLES = "@salus_alimentation_donnees_personnelles";

// Liste des catégories de repas affichées dans le journal.
const TYPES_REPAS: TypeRepas[] = ["dejeuner", "diner", "souper", "collation"];

// Noms affichés à l'écran pour chaque type de repas.
const ETIQUETTES_REPAS: Record<TypeRepas, string> = {
  dejeuner: "Déjeuner",
  diner: "Dîner",
  souper: "Souper",
  collation: "Collation",
};

// Noms affichés à l'écran pour chaque niveau d'activité.
const ETIQUETTES_ACTIVITE: Record<NiveauActivite, string> = {
  sedentaire: "Sédentaire",
  leger: "Léger",
  modere: "Modéré",
  eleve: "Élevé",
  tres_eleve: "Très élevé",
};

// Multiplicateurs standards utilisés pour passer du BMR au TDEE.
const MULTIPLICATEURS_ACTIVITE: Record<NiveauActivite, number> = {
  sedentaire: 1.2,
  leger: 1.375,
  modere: 1.55,
  eleve: 1.725,
  tres_eleve: 1.9,
};

// -------------------------
// Fonctions utilitaires
// -------------------------

// Crée un identifiant unique pour chaque repas ajouté.
function creerIdUnique() {
  return `${Date.now()}-${Math.random()}`;
}

// Crée une entrée vide dans une section de repas précise.
function creerEntreeVide(typeRepas: TypeRepas): EntreeRepas {
  return {
    id: creerIdUnique(),
    nom: "",
    calories: "",
    proteines: "",
    glucides: "",
    lipides: "",
    autreInfo: "",
    typeRepas,
  };
}

// Convertit une valeur texte en nombre.
// Permet aussi d'accepter les virgules comme décimales.
function convertirEnNombre(valeur: string): number {
  const nombre = Number(valeur.replace(",", "."));
  return Number.isFinite(nombre) ? nombre : 0;
}

// Arrondit une valeur numérique selon le nombre de décimales voulu.
function arrondir(valeur: number, decimales = 0) {
  const facteur = Math.pow(10, decimales);
  return Math.round(valeur * facteur) / facteur;
}

// Calcule le métabolisme de base avec la formule de Mifflin-St Jeor.
function calculerBMR(donnees: DonneesPersonnelles): number {
  const poids = convertirEnNombre(donnees.poids);
  const taille = convertirEnNombre(donnees.taille);
  const age = convertirEnNombre(donnees.age);

  // Si une donnée obligatoire manque, on retourne 0.
  if (!poids || !taille || !age) return 0;

  // Formule pour homme.
  if (donnees.sexe === "homme") {
    return 10 * poids + 6.25 * taille - 5 * age + 5;
  }

  // Formule pour femme.
  return 10 * poids + 6.25 * taille - 5 * age - 161;
}

// Calcule le TDEE en multipliant le BMR par le niveau d'activité.
function calculerTDEE(donnees: DonneesPersonnelles): number {
  const bmr = calculerBMR(donnees);
  const multiplicateur = MULTIPLICATEURS_ACTIVITE[donnees.niveauActivite] ?? 1.2;
  return bmr * multiplicateur;
}

// Génère les recommandations caloriques autour du maintien.
function genererStrategiesCalories(tdee: number): StrategieCalories[] {
  // Si le TDEE n'est pas encore calculable, on ne retourne aucune stratégie.
  if (!tdee) return [];

  return [
    {
      titre: "Perte agressive",
      calories: Math.max(1200, arrondir(tdee - 750)),
      variationKgParSemaine: -0.68,
      description: "Déficit élevé pour perdre plus rapidement.",
    },
    {
      titre: "Perte normale",
      calories: Math.max(1200, arrondir(tdee - 500)),
      variationKgParSemaine: -0.45,
      description: "Déficit modéré plus facile à soutenir.",
    },
    {
      titre: "Maintien",
      calories: arrondir(tdee),
      variationKgParSemaine: 0,
      description: "Apport estimé pour maintenir le poids.",
    },
    {
      titre: "Gain normal",
      calories: arrondir(tdee + 250),
      variationKgParSemaine: 0.23,
      description: "Surplus modéré pour prendre du poids lentement.",
    },
    {
      titre: "Gain agressif",
      calories: arrondir(tdee + 500),
      variationKgParSemaine: 0.45,
      description: "Surplus plus élevé pour une prise plus rapide.",
    },
  ];
}

// Détermine le message affiché selon les calories consommées et l'objectif choisi.
function obtenirStatutCalories(
  totalCalories: number,
  objectifCalories: number,
  objectifPoids: TypeObjectifPoids
) {
  if (!objectifCalories) {
    return "Ajoute un objectif calorique pour suivre ta progression.";
  }

  // Logique pour un objectif de maintien.
  if (objectifPoids === "maintenir") {
    const difference = totalCalories - objectifCalories;
    if (Math.abs(difference) <= 50) return "Tu es très proche de ton objectif de maintien.";
    if (difference < 0) return "Tu n’as pas encore atteint ton objectif de maintien.";
    return "Tu as dépassé ton objectif de maintien.";
  }

  // Logique pour un objectif de perte de poids.
  if (objectifPoids === "perdre") {
    if (totalCalories < objectifCalories) return "Tu es encore sous ta limite calorique de perte de poids.";
    if (totalCalories === objectifCalories) return "Tu as atteint exactement ta cible de perte de poids.";
    return "Tu as dépassé la limite prévue pour la perte de poids.";
  }

  // Logique pour un objectif de prise de poids.
  if (totalCalories < objectifCalories) return "Tu n’as pas encore atteint ton objectif de prise de poids.";
  if (totalCalories === objectifCalories) return "Tu as atteint exactement ton objectif de prise de poids.";
  return "Tu as dépassé ton objectif de prise de poids.";
}

// -------------------------
// Composant cercle de progression
// -------------------------

type CercleProgressionProps = {
  valeurActuelle: number;
  valeurCible: number;
  titre: string;
  sousTitre?: string;
  taille?: number;
  epaisseur?: number;
  couleur?: string;
};

// Composant réutilisable qui affiche un cercle de progression.
// Il sert pour les calories, protéines, glucides et lipides.
function CercleProgression({
  valeurActuelle,
  valeurCible,
  titre,
  sousTitre,
  taille = 170,
  epaisseur = 18,
  couleur = "#ff6bdf",
}: CercleProgressionProps) {
  // Rayon du cercle selon la taille et l'épaisseur.
  const rayon = (taille - epaisseur) / 2;

  // Circonférence utilisée pour contrôler le remplissage du cercle.
  const circonference = 2 * Math.PI * rayon;

  // Ratio de progression limité à 100% pour l'affichage du cercle.
  const ratio = valeurCible > 0 ? Math.min(valeurActuelle / valeurCible, 1) : 0;

  // Permet de changer la couleur si l'utilisateur dépasse l'objectif.
  const depassement = valeurCible > 0 && valeurActuelle > valeurCible;

  // Décalage utilisé par SVG pour afficher seulement une partie du cercle.
  const offset = circonference * (1 - ratio);

  return (
    <View style={[styles.conteneurCercle, { width: taille, height: taille }]}>
      <Svg width={taille} height={taille}>
        {/* Cercle de fond */}
        <Circle
          cx={taille / 2}
          cy={taille / 2}
          r={rayon}
          stroke="#5a1450"
          strokeWidth={epaisseur}
          fill="none"
        />

        {/* Cercle de progression */}
        <Circle
          cx={taille / 2}
          cy={taille / 2}
          r={rayon}
          stroke={depassement ? "#ff6bdf" : couleur}
          strokeWidth={epaisseur}
          fill="none"
          strokeDasharray={`${circonference} ${circonference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation={-90}
          origin={`${taille / 2}, ${taille / 2}`}
        />
      </Svg>

      {/* Texte affiché au centre du cercle */}
      <View style={styles.contenuCercle}>
        <Text style={styles.pourcentageCercle}>
          {valeurCible > 0 ? `${Math.round((valeurActuelle / valeurCible) * 100)}%` : "0%"}
        </Text>
        <Text style={styles.valeurCercle}>
          {arrondir(valeurActuelle)}
          {sousTitre ? ` ${sousTitre}` : ""}
        </Text>
        <Text style={styles.titreCercle}>{titre}</Text>
      </View>
    </View>
  );
}

// -------------------------
// Écran principal
// -------------------------

export default function Alimentation() {
  // Onglet actuellement sélectionné : journal ou calculateur.
  const [ongletActif, setOngletActif] = useState<OngletAlimentation>("journal");

  // Liste de tous les repas ajoutés dans la journée.
  const [entreesRepas, setEntreesRepas] = useState<EntreeRepas[]>([]);

  // Objectifs nutritionnels journaliers.
  const [objectifs, setObjectifs] = useState<ObjectifsJournalier>({
    calories: "2000",
    proteines: "150",
    glucides: "220",
    lipides: "70",
    objectifPoids: "maintenir",
  });

  // Données personnelles utilisées pour calculer BMR et TDEE.
  const [donneesPersonnelles, setDonneesPersonnelles] = useState<DonneesPersonnelles>({
    poids: "",
    age: "",
    sexe: "homme",
    taille: "",
    niveauActivite: "modere",
  });

  // Charge les repas, objectifs et données personnelles déjà sauvegardés sur l'appareil.
  useEffect(() => {
    const chargerDonnees = async () => {
      try {
        const [repasSauvegardes, objectifsSauvegardes, donneesSauvegardees] =
          await Promise.all([
            AsyncStorage.getItem(CLE_REPAS),
            AsyncStorage.getItem(CLE_OBJECTIFS),
            AsyncStorage.getItem(CLE_DONNEES_PERSONNELLES),
          ]);

        if (repasSauvegardes) {
          setEntreesRepas(JSON.parse(repasSauvegardes));
        }

        if (objectifsSauvegardes) {
          setObjectifs(JSON.parse(objectifsSauvegardes));
        }

        if (donneesSauvegardees) {
          setDonneesPersonnelles(JSON.parse(donneesSauvegardees));
        }
      } catch (erreur) {
        console.log("Erreur lors du chargement des données alimentation :", erreur);
      }
    };

    chargerDonnees();
  }, []);

  // Sauvegarde automatiquement les repas chaque fois que la liste change.
  useEffect(() => {
    AsyncStorage.setItem(CLE_REPAS, JSON.stringify(entreesRepas)).catch((erreur) => {
      console.log("Erreur sauvegarde repas :", erreur);
    });
  }, [entreesRepas]);

  // Sauvegarde automatiquement les objectifs chaque fois qu'ils changent.
  useEffect(() => {
    AsyncStorage.setItem(CLE_OBJECTIFS, JSON.stringify(objectifs)).catch((erreur) => {
      console.log("Erreur sauvegarde objectifs :", erreur);
    });
  }, [objectifs]);

  // Sauvegarde automatiquement les données personnelles chaque fois qu'elles changent.
  useEffect(() => {
    AsyncStorage.setItem(
      CLE_DONNEES_PERSONNELLES,
      JSON.stringify(donneesPersonnelles)
    ).catch((erreur) => {
      console.log("Erreur sauvegarde données personnelles :", erreur);
    });
  }, [donneesPersonnelles]);

  // Calcule les totaux de la journée à partir de toutes les entrées.
  // useMemo évite de recalculer les totaux inutilement si les repas n'ont pas changé.
  const totaux = useMemo(() => {
    return entreesRepas.reduce(
      (accumulateur, entree) => {
        accumulateur.calories += convertirEnNombre(entree.calories);
        accumulateur.proteines += convertirEnNombre(entree.proteines);
        accumulateur.glucides += convertirEnNombre(entree.glucides);
        accumulateur.lipides += convertirEnNombre(entree.lipides);
        return accumulateur;
      },
      { calories: 0, proteines: 0, glucides: 0, lipides: 0 }
    );
  }, [entreesRepas]);

  // Convertit les objectifs écrits en texte en nombres utilisables pour les calculs.
  const objectifCalories = convertirEnNombre(objectifs.calories);
  const objectifProteines = convertirEnNombre(objectifs.proteines);
  const objectifGlucides = convertirEnNombre(objectifs.glucides);
  const objectifLipides = convertirEnNombre(objectifs.lipides);

  // Calcule le BMR, le TDEE et les stratégies recommandées.
  const bmr = useMemo(() => calculerBMR(donneesPersonnelles), [donneesPersonnelles]);
  const tdee = useMemo(() => calculerTDEE(donneesPersonnelles), [donneesPersonnelles]);
  const strategiesCalories = useMemo(() => genererStrategiesCalories(tdee), [tdee]);

  // Ajoute une nouvelle entrée vide dans le type de repas choisi.
  const ajouterEntree = (typeRepas: TypeRepas) => {
    setEntreesRepas((precedent) => [...precedent, creerEntreeVide(typeRepas)]);
  };

  // Supprime une entrée précise selon son identifiant.
  const supprimerEntree = (id: string) => {
    setEntreesRepas((precedent) => precedent.filter((entree) => entree.id !== id));
  };

  // Met à jour un champ précis d'une entrée de repas.
  const mettreAJourEntree = (
    id: string,
    champ: keyof Omit<EntreeRepas, "id">,
    valeur: string
  ) => {
    setEntreesRepas((precedent) =>
      precedent.map((entree) =>
        entree.id === id ? { ...entree, [champ]: valeur } : entree
      )
    );
  };

  // Met à jour un objectif nutritionnel.
  const mettreAJourObjectif = (
    champ: keyof ObjectifsJournalier,
    valeur: string | TypeObjectifPoids
  ) => {
    setObjectifs((precedent) => ({ ...precedent, [champ]: valeur }));
  };

  // Met à jour une donnée personnelle utilisée dans le calculateur.
  const mettreAJourDonneesPersonnelles = (
    champ: keyof DonneesPersonnelles,
    valeur: string | Sexe | NiveauActivite
  ) => {
    setDonneesPersonnelles((precedent) => ({ ...precedent, [champ]: valeur }));
  };

  // Quand l'utilisateur clique sur "Utiliser", cette fonction applique
  // la recommandation calorique choisie dans les objectifs journaliers.
  const appliquerStrategieAuxObjectifs = (calories: number, type: TypeObjectifPoids) => {
    setObjectifs((precedent) => ({
      ...precedent,
      calories: String(arrondir(calories)),
      objectifPoids: type,
    }));

    // Retourne automatiquement vers le journal après l'application.
    setOngletActif("journal");
  };

  // Message affiché sous le cercle de calories.
  const statutCalories = obtenirStatutCalories(
    totaux.calories,
    objectifCalories,
    objectifs.objectifPoids
  );

  return (
    <View style={styles.ecran}>
      <ScrollView contentContainerStyle={styles.conteneur}>
        <Text style={styles.titre}>Alimentation</Text>

        {/* Barre d'onglets pour passer entre Journal et Calculateur */}
        <View style={styles.barreOngletsHaut}>
          <Pressable
            style={[styles.boutonOngletHaut, ongletActif === "journal" && styles.boutonOngletHautActif]}
            onPress={() => setOngletActif("journal")}
          >
            <Text
              style={[styles.texteOngletHaut, ongletActif === "journal" && styles.texteOngletHautActif]}
            >
              Journal
            </Text>
          </Pressable>

          <Pressable
            style={[styles.boutonOngletHaut, ongletActif === "calculateur" && styles.boutonOngletHautActif]}
            onPress={() => setOngletActif("calculateur")}
          >
            <Text
              style={[
                styles.texteOngletHaut,
                ongletActif === "calculateur" && styles.texteOngletHautActif,
              ]}
            >
              Calculateur
            </Text>
          </Pressable>
        </View>

        {ongletActif === "journal" ? (
          <>
            {/* Résumé principal des calories et macros de la journée */}
            <View style={styles.carteResumeCalories}>
              <Text style={styles.sousTitreResume}>Aujourd’hui</Text>
              <Text style={styles.libelleResume}>Calories</Text>
              <Text style={styles.grosNombreBleu}>{arrondir(totaux.calories)}</Text>
              <Text style={styles.objectifResume}>sur {objectifCalories || 0}</Text>

              {/* Petits cercles pour les macros */}
              <View style={styles.rangeePetitsCercles}>
                <View style={styles.petitIndicateur}>
                  <CercleProgression
                    valeurActuelle={totaux.glucides}
                    valeurCible={objectifGlucides || 1}
                    titre="glucides"
                    taille={90}
                    epaisseur={8}
                    couleur="#ff6bdf"
                  />
                  <Text style={styles.texteValeurPetit}>{arrondir(totaux.glucides)} g</Text>
                </View>

                <View style={styles.petitIndicateur}>
                  <CercleProgression
                    valeurActuelle={totaux.proteines}
                    valeurCible={objectifProteines || 1}
                    titre="protéines"
                    taille={90}
                    epaisseur={8}
                    couleur="#ff6bdf"
                  />
                  <Text style={styles.texteValeurPetit}>{arrondir(totaux.proteines)} g</Text>
                </View>

                <View style={styles.petitIndicateur}>
                  <CercleProgression
                    valeurActuelle={totaux.lipides}
                    valeurCible={objectifLipides || 1}
                    titre="lipides"
                    taille={90}
                    epaisseur={8}
                    couleur="#bf6be6"
                  />
                  <Text style={styles.texteValeurPetit}>{arrondir(totaux.lipides)} g</Text>
                </View>
              </View>
            </View>

            {/* Grand cercle de progression pour l'objectif calorique */}
            <View style={styles.cartePrincipaleProgression}>
              <CercleProgression
                valeurActuelle={totaux.calories}
                valeurCible={objectifCalories || 1}
                titre="Objectif calorique"
                sousTitre="kcal"
                taille={240}
                epaisseur={24}
                couleur="#ff6bdf"
              />
              <Text style={styles.texteStatutCalories}>{statutCalories}</Text>
            </View>

            {/* Section permettant de modifier les objectifs journaliers */}
            <View style={styles.carteSection}>
              <Text style={styles.titreSection}>Objectifs journaliers</Text>

              {/* Choix du type d'objectif */}
              <View style={styles.rangeeObjectifsType}>
                {(["perdre", "maintenir", "gagner"] as TypeObjectifPoids[]).map((type) => (
                  <Pressable
                    key={type}
                    style={[
                      styles.boutonChoix,
                      objectifs.objectifPoids === type && styles.boutonChoixActif,
                    ]}
                    onPress={() => mettreAJourObjectif("objectifPoids", type)}
                  >
                    <Text
                      style={[
                        styles.texteChoix,
                        objectifs.objectifPoids === type && styles.texteChoixActif,
                      ]}
                    >
                      {type === "perdre" ? "Perdre" : type === "maintenir" ? "Maintenir" : "Gagner"}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Champs d'objectifs nutritionnels */}
              <View style={styles.listeChampsVerticaux}>
                <View style={styles.groupeChampVertical}>
                  <Text style={styles.libelleChamp}>Calories</Text>
                  <TextInput
                    style={styles.champ}
                    value={objectifs.calories}
                    onChangeText={(valeur) => mettreAJourObjectif("calories", valeur)}
                    placeholder="Calories"
                    keyboardType="numeric"
                    placeholderTextColor="#8c8c8c"
                  />
                </View>

                <View style={styles.groupeChampVertical}>
                  <Text style={styles.libelleChamp}>Protéines (g)</Text>
                  <TextInput
                    style={styles.champ}
                    value={objectifs.proteines}
                    onChangeText={(valeur) => mettreAJourObjectif("proteines", valeur)}
                    placeholder="Protéines (g)"
                    keyboardType="numeric"
                    placeholderTextColor="#8c8c8c"
                  />
                </View>

                <View style={styles.groupeChampVertical}>
                  <Text style={styles.libelleChamp}>Glucides (g)</Text>
                  <TextInput
                    style={styles.champ}
                    value={objectifs.glucides}
                    onChangeText={(valeur) => mettreAJourObjectif("glucides", valeur)}
                    placeholder="Glucides (g)"
                    keyboardType="numeric"
                    placeholderTextColor="#8c8c8c"
                  />
                </View>

                <View style={styles.groupeChampVertical}>
                  <Text style={styles.libelleChamp}>Lipides (g)</Text>
                  <TextInput
                    style={styles.champ}
                    value={objectifs.lipides}
                    onChangeText={(valeur) => mettreAJourObjectif("lipides", valeur)}
                    placeholder="Lipides (g)"
                    keyboardType="numeric"
                    placeholderTextColor="#8c8c8c"
                  />
                </View>
              </View>
            </View>

            {/* Affiche les quatre sections de repas automatiquement */}
            {TYPES_REPAS.map((typeRepas) => {
              // Filtre seulement les repas appartenant à la section actuelle.
              const entreesDuType = entreesRepas.filter((entree) => entree.typeRepas === typeRepas);

              return (
                <View key={typeRepas} style={styles.carteSection}>
                  <View style={styles.enteteRepas}>
                    <Text style={styles.titreSection}>{ETIQUETTES_REPAS[typeRepas]}</Text>

                    {/* Ajoute une entrée vide dans cette section */}
                    <Pressable style={styles.boutonAjouter} onPress={() => ajouterEntree(typeRepas)}>
                      <Ionicons name="add" size={18} color="white" />
                      <Text style={styles.texteBoutonAjouter}>Ajouter</Text>
                    </Pressable>
                  </View>

                  {entreesDuType.length === 0 ? (
                    <Text style={styles.texteVide}>Aucune entrée pour cette section.</Text>
                  ) : (
                    entreesDuType.map((entree) => (
                      <View key={entree.id} style={styles.carteEntreeRepas}>
                        <View style={styles.enteteCarteRepas}>
                          <Text style={styles.titreCarteRepas}>Repas</Text>

                          {/* Supprime cette entrée de repas */}
                          <Pressable
                            onPress={() => supprimerEntree(entree.id)}
                            style={styles.boutonSupprimer}
                          >
                            <Ionicons name="trash-outline" size={18} color="#d9534f" />
                          </Pressable>
                        </View>

                        {/* Nom du repas ou aliment */}
                        <TextInput
                          style={styles.champ}
                          value={entree.nom}
                          onChangeText={(valeur) => mettreAJourEntree(entree.id, "nom", valeur)}
                          placeholder="Nom de l’aliment ou du repas"
                          placeholderTextColor="#8c8c8c"
                        />

                        {/* Calories du repas */}
                        <TextInput
                          style={styles.champ}
                          value={entree.calories}
                          onChangeText={(valeur) => mettreAJourEntree(entree.id, "calories", valeur)}
                          placeholder="Calories"
                          keyboardType="numeric"
                          placeholderTextColor="#8c8c8c"
                        />

                        {/* Macros du repas */}
                        <View style={styles.rangeeTroisChamps}>
                          <TextInput
                            style={[styles.champ, styles.champPetit]}
                            value={entree.proteines}
                            onChangeText={(valeur) => mettreAJourEntree(entree.id, "proteines", valeur)}
                            placeholder="Prot."
                            keyboardType="numeric"
                            placeholderTextColor="#8c8c8c"
                          />
                          <TextInput
                            style={[styles.champ, styles.champPetit]}
                            value={entree.glucides}
                            onChangeText={(valeur) => mettreAJourEntree(entree.id, "glucides", valeur)}
                            placeholder="Gluc."
                            keyboardType="numeric"
                            placeholderTextColor="#8c8c8c"
                          />
                          <TextInput
                            style={[styles.champ, styles.champPetit]}
                            value={entree.lipides}
                            onChangeText={(valeur) => mettreAJourEntree(entree.id, "lipides", valeur)}
                            placeholder="Lip."
                            keyboardType="numeric"
                            placeholderTextColor="#8c8c8c"
                          />
                        </View>

                        {/* Section libre pour écrire d'autres informations */}
                        <TextInput
                          style={[styles.champ, styles.champGrand]}
                          value={entree.autreInfo}
                          onChangeText={(valeur) => mettreAJourEntree(entree.id, "autreInfo", valeur)}
                          placeholder="Autres infos (fibres, sodium, sucre, note personnelle, etc.)"
                          multiline
                          placeholderTextColor="#8c8c8c"
                        />
                      </View>
                    ))
                  )}
                </View>
              );
            })}
          </>
        ) : (
          <>
            {/* Section du calculateur : informations personnelles */}
            <View style={styles.carteSection}>
              <Text style={styles.titreSection}>Données personnelles</Text>

              <View style={styles.listeChampsVerticaux}>
                <View style={styles.groupeChampVertical}>
                  <Text style={styles.libelleChamp}>Poids (kg)</Text>
                  <TextInput
                    style={styles.champ}
                    value={donneesPersonnelles.poids}
                    onChangeText={(valeur) => mettreAJourDonneesPersonnelles("poids", valeur)}
                    placeholder="Poids (kg)"
                    keyboardType="numeric"
                    placeholderTextColor="#8c8c8c"
                  />
                </View>

                <View style={styles.groupeChampVertical}>
                  <Text style={styles.libelleChamp}>Âge</Text>
                  <TextInput
                    style={styles.champ}
                    value={donneesPersonnelles.age}
                    onChangeText={(valeur) => mettreAJourDonneesPersonnelles("age", valeur)}
                    placeholder="Âge"
                    keyboardType="numeric"
                    placeholderTextColor="#8c8c8c"
                  />
                </View>

                <View style={styles.groupeChampVertical}>
                  <Text style={styles.libelleChamp}>Taille (cm)</Text>
                  <TextInput
                    style={styles.champ}
                    value={donneesPersonnelles.taille}
                    onChangeText={(valeur) => mettreAJourDonneesPersonnelles("taille", valeur)}
                    placeholder="Taille (cm)"
                    keyboardType="numeric"
                    placeholderTextColor="#8c8c8c"
                  />
                </View>

                {/* Choix du sexe, utilisé dans la formule BMR */}
                <View style={styles.groupeChampVertical}>
                  <Text style={styles.libelleChamp}>Sexe</Text>
                  <View style={styles.rangeeChoixCompacte}>
                    {(["homme", "femme"] as Sexe[]).map((sexe) => (
                      <Pressable
                        key={sexe}
                        style={[
                          styles.boutonChoixCompact,
                          donneesPersonnelles.sexe === sexe && styles.boutonChoixActif,
                        ]}
                        onPress={() => mettreAJourDonneesPersonnelles("sexe", sexe)}
                      >
                        <Text
                          style={[
                            styles.texteChoixCompact,
                            donneesPersonnelles.sexe === sexe && styles.texteChoixActif,
                          ]}
                        >
                          {sexe === "homme" ? "Homme" : "Femme"}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Choix du niveau d'activité, utilisé pour calculer le TDEE */}
                <View style={styles.groupeChampVertical}>
                  <Text style={styles.libelleChamp}>Niveau d’exercice</Text>
                  <View style={styles.groupeBoutonsWrap}>
                    {(Object.keys(ETIQUETTES_ACTIVITE) as NiveauActivite[]).map((niveau) => (
                      <Pressable
                        key={niveau}
                        style={[
                          styles.boutonChoixWrap,
                          donneesPersonnelles.niveauActivite === niveau && styles.boutonChoixActif,
                        ]}
                        onPress={() => mettreAJourDonneesPersonnelles("niveauActivite", niveau)}
                      >
                        <Text
                          style={[
                            styles.texteChoix,
                            donneesPersonnelles.niveauActivite === niveau && styles.texteChoixActif,
                          ]}
                        >
                          {ETIQUETTES_ACTIVITE[niveau]}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>
            </View>

            {/* Résultats de base : BMR et TDEE */}
            <View style={styles.rangeeResultatsBase}>
              <View style={styles.carteMiniResultat}>
                <Text style={styles.titreMiniResultat}>BMR</Text>
                <Text style={styles.valeurMiniResultat}>{arrondir(bmr)} kcal</Text>
                <Text style={styles.descriptionMiniResultat}>Métabolisme de base</Text>
              </View>

              <View style={styles.carteMiniResultat}>
                <Text style={styles.titreMiniResultat}>TDEE</Text>
                <Text style={styles.valeurMiniResultat}>{arrondir(tdee)} kcal</Text>
                <Text style={styles.descriptionMiniResultat}>Maintien estimé</Text>
              </View>
            </View>

            {/* Liste des recommandations caloriques calculées avec le TDEE */}
            <View style={styles.carteSection}>
              <Text style={styles.titreSection}>Cibles recommandées</Text>
              <Text style={styles.sousTexteSection}>
                Estimation basée sur la formule standard du TDEE. Les chiffres sont des repères.
              </Text>

              {strategiesCalories.length === 0 ? (
                <Text style={styles.texteVide}>
                  Entre tes données personnelles pour obtenir tes recommandations.
                </Text>
              ) : (
                strategiesCalories.map((strategie) => {
                  // Détermine automatiquement le type d'objectif selon le nom de la stratégie.
                  const typeObjectif: TypeObjectifPoids =
                    strategie.titre.includes("Perte")
                      ? "perdre"
                      : strategie.titre.includes("Maintien")
                      ? "maintenir"
                      : "gagner";

                  return (
                    <View key={strategie.titre} style={styles.carteStrategie}>
                      <View style={styles.enteteStrategie}>
                        <View>
                          <Text style={styles.titreStrategie}>{strategie.titre}</Text>
                          <Text style={styles.descriptionStrategie}>{strategie.description}</Text>
                        </View>

                        {/* Applique cette cible calorique dans les objectifs journaliers */}
                        <Pressable
                          style={styles.boutonAppliquer}
                          onPress={() =>
                            appliquerStrategieAuxObjectifs(strategie.calories, typeObjectif)
                          }
                        >
                          <Text style={styles.texteBoutonAppliquer}>Utiliser</Text>
                        </Pressable>
                      </View>

                      <Text style={styles.valeurStrategie}>{strategie.calories} kcal / jour</Text>
                      <Text style={styles.variationStrategie}>
                        {strategie.variationKgParSemaine === 0
                          ? "Environ 0 kg / semaine"
                          : `${strategie.variationKgParSemaine > 0 ? "+" : ""}${arrondir(
                              strategie.variationKgParSemaine,
                              2
                            )} kg / semaine`}
                      </Text>
                    </View>
                  );
                })
              )}
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
    backgroundColor: "#e8c0d7",
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

  barreOngletsHaut: {
    flexDirection: "row",
    gap: 12,
  },
  boutonOngletHaut: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#dcdcdc",
  },
  boutonOngletHautActif: {
    backgroundColor: "#efb6d4",
    borderColor: "#efb6d4",
  },
  texteOngletHaut: {
    fontSize: 16,
    fontWeight: "800",
    color: "#333",
  },
  texteOngletHautActif: {
    color: "white",
  },

  carteResumeCalories: {
    backgroundColor: "#050505",
    borderRadius: 28,
    padding: 20,
    alignItems: "center",
  },
  sousTitreResume: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  libelleResume: {
    color: "#d8d8d8",
    fontSize: 17,
    marginTop: 2,
  },
  grosNombreBleu: {
    color: "#ff6bdf",
    fontSize: 56,
    fontWeight: "900",
    lineHeight: 62,
    marginTop: 6,
  },
  objectifResume: {
    color: "#d8d8d8",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 2,
  },
  rangeePetitsCercles: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 18,
  },
  petitIndicateur: {
    flex: 1,
    alignItems: "center",
  },
  texteValeurPetit: {
    color: "white",
    fontSize: 13,
    marginTop: 6,
    fontWeight: "700",
  },

  cartePrincipaleProgression: {
    backgroundColor: "#111",
    borderRadius: 26,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  texteStatutCalories: {
    color: "white",
    fontSize: 15,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 22,
  },

  conteneurCercle: {
    justifyContent: "center",
    alignItems: "center",
  },
  contenuCercle: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  pourcentageCercle: {
    color: "white",
    fontSize: 26,
    fontWeight: "900",
  },
  valeurCercle: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 2,
  },
  titreCercle: {
    color: "#d6d6d6",
    fontSize: 13,
    marginTop: 4,
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
  sousTexteSection: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },

  rangeeObjectifsType: {
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
  boutonChoixWrap: {
    backgroundColor: "#f4f4f4",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  boutonChoixCompact: {
    backgroundColor: "#f4f4f4",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    flex: 1,
    alignItems: "center",
  },
  boutonChoixActif: {
    backgroundColor: "#efb6d4",
  },
  texteChoix: {
    color: "#333",
    fontWeight: "700",
  },
  texteChoixCompact: {
    color: "#333",
    fontWeight: "700",
    fontSize: 13,
  },
  texteChoixActif: {
    color: "white",
  },

  listeChampsVerticaux: {
    gap: 12,
  },
  groupeChampVertical: {
    gap: 6,
  },
  libelleChamp: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
  },

  rangeeTroisChampsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  rangeeTroisChamps: {
    flexDirection: "row",
    gap: 10,
  },
  rangeeDeuxChamps: {
    flexDirection: "row",
    gap: 10,
    alignItems: "stretch",
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
    minWidth: 130,
    flexGrow: 1,
  },
  champPetit: {
    flex: 1,
    minWidth: 0,
  },
  champDemi: {
    flex: 1,
    minWidth: 0,
  },
  champGrand: {
    minHeight: 90,
    textAlignVertical: "top",
  },

  enteteRepas: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  boutonAjouter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#222",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  texteBoutonAjouter: {
    color: "white",
    fontWeight: "800",
    fontSize: 14,
  },

  carteEntreeRepas: {
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#ececec",
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  enteteCarteRepas: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titreCarteRepas: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111",
  },
  boutonSupprimer: {
    backgroundColor: "#fff3f3",
    borderRadius: 10,
    padding: 6,
  },
  texteVide: {
    color: "#666",
    fontSize: 15,
    fontStyle: "italic",
  },

  groupeChoixVerticalCompact: {
    flex: 1,
    justifyContent: "space-between",
  },
  rangeeChoixCompacte: {
    flexDirection: "row",
    gap: 8,
  },
  groupeBoutonsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  libellePetit: {
    fontSize: 14,
    fontWeight: "700",
    color: "#444",
    marginBottom: 6,
  },

  rangeeResultatsBase: {
    flexDirection: "row",
    gap: 12,
  },
  carteMiniResultat: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
  },
  titreMiniResultat: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
  },
  valeurMiniResultat: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111",
    marginTop: 8,
  },
  descriptionMiniResultat: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },

  carteStrategie: {
    backgroundColor: "#fafafa",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ececec",
    padding: 14,
    gap: 8,
  },
  enteteStrategie: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  titreStrategie: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111",
  },
  descriptionStrategie: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
    maxWidth: 220,
  },
  valeurStrategie: {
    fontSize: 21,
    fontWeight: "900",
    color: "#111",
  },
  variationStrategie: {
    fontSize: 14,
    color: "#444",
  },
  boutonAppliquer: {
    backgroundColor: "#efb6d4",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  texteBoutonAppliquer: {
    color: "white",
    fontWeight: "800",
  },
});