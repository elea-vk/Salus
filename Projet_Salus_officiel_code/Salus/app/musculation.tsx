import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  Image,
  Modal,
  Dimensions,
  TextInput,
} from "react-native";
import Body, { ExtendedBodyPart } from "react-native-body-highlighter";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  GestureHandlerRootView,
  Swipeable,
} from "react-native-gesture-handler";

// Représente le côté du corps affiché par le composant Body.
// Les valeurs restent en anglais, car elles sont utilisées par la librairie.
type VueCorps = "front" | "back";

// Onglets de la fiche d'information d'un muscle.
type OngletFiche = "infos" | "exercices";

// Onglets du générateur de programmes.
type OngletProgramme = "creer" | "sauvegardes";

// Représente un exercice visuel associé à un muscle.
type ExerciceVisuel = {
  nom: string;
  image?: any;
};

// Contient toutes les informations affichées pour un muscle.
type InfoMuscle = {
  titre: string;
  nomScientifique: string;
  description: string;
  fonctions: string[];
  exercices: ExerciceVisuel[];
  repos: string;
  securite: string;
};

// Représente un exercice saisi dans un programme personnalisé.
type ExerciceProgramme = {
  id: string;
  nom: string;
  series: string;
  repetitions: string;
  poids: string;
};

// Représente un programme sauvegardé avec son titre et ses exercices.
type ProgrammeSauvegarde = {
  id: string;
  titre: string;
  exercices: ExerciceProgramme[];
};

// Hauteur de l'écran utilisée pour les animations des feuilles modales.
const HAUTEUR_ECRAN = Dimensions.get("window").height;

// Clé utilisée pour sauvegarder les programmes dans AsyncStorage.
const CLE_STOCKAGE_PROGRAMMES = "@salus_saved_workouts";

// Banque de données locale contenant les informations de chaque muscle.
// Les clés comme "chest" ou "upper-back" doivent rester en anglais,
// car elles correspondent aux slugs retournés par la librairie du corps interactif.
const INFOS_MUSCLES: Record<string, InfoMuscle> = {
  chest: {
    titre: "Pectoraux",
    nomScientifique: "Pectoralis major",
    description: "Muscles situés à l’avant du thorax.",
    fonctions: [
      "Adduction du bras",
      "Rotation interne",
      "Flexion de l’épaule",
    ],
    exercices: [
      {
        nom: "Développé incliné avec haltères (haut des pectoraux)",
        image: require("../assets/images/exercices/incline_dumbbell_press.gif"),
      },
      {
        nom: "Pompes (milieu des pectoraux)",
        image: require("../assets/images/exercices/Push_Up.gif"),
      },
      {
        nom: "Développé couché avec haltères (milieu des pectoraux)",
        image: require("../assets/images/exercices/flat_dumbbell_press.gif"),
      },
      {
        nom: "Écarté à la machine pec deck (milieu des pectoraux)",
        image: require("../assets/images/exercices/peckdeck_chest_fly.gif"),
      },
      {
        nom: "Écarté à la poulie (bas des pectoraux)",
        image: require("../assets/images/exercices/cable_chest_fly.gif"),
      },
    ],
    repos: "48 à 72 h",
    securite:
      "Contrôler la charge, garder les épaules stables et éviter de trop cambrer le bas du dos.",
  },

  deltoids: {
    titre: "Épaules / Deltoïdes",
    nomScientifique: "Deltoideus",
    description: "Muscles principaux de l’épaule.",
    fonctions: ["Abduction", "Flexion", "Extension de l’épaule"],
    exercices: [
      {
        nom: "Développé épaules avec haltères",
        image: require("../assets/images/exercices/dumbbell_shoulder_press.jpg"),
      },
      {
        nom: "Développé épaules à la machine",
        image: require("../assets/images/exercices/machine_shoulder_press.jpg"),
      },
      {
        nom: "Élévation latérale avec haltères",
        image: require("../assets/images/exercices/dumbbell_lateral_raise.gif"),
      },
      {
        nom: "Élévation latérale à la poulie",
        image: require("../assets/images/exercices/cable_lateral_raise.gif"),
      },
      {
        nom: "Pompes en pointe",
        image: require("../assets/images/exercices/pike_pushups.gif"),
      },
      {
        nom: "Écarté arrière pour deltoïdes",
        image: require("../assets/images/exercices/rear_delt_fly.gif"),
      },
    ],
    repos: "48 h",
    securite:
      "Éviter l’élan, garder le mouvement contrôlé et ne pas hausser les épaules excessivement.",
  },

  biceps: {
    titre: "Biceps",
    nomScientifique: "Biceps brachii",
    description: "Muscle situé à l’avant du bras.",
    fonctions: ["Flexion du coude", "Supination"],
    exercices: [
      {
        nom: "Curl avec haltères",
        image: require("../assets/images/exercices/dumbbell_curl.gif"),
      },
      {
        nom: "Curl marteau",
        image: require("../assets/images/exercices/hammer_curls.gif"),
      },
      {
        nom: "Curl au pupitre",
        image: require("../assets/images/exercices/preacher_curl.gif"),
      },
    ],
    repos: "48 h",
    securite: "Ne pas balancer le tronc et garder les coudes stables.",
  },

  triceps: {
    titre: "Triceps",
    nomScientifique: "Triceps brachii",
    description: "Muscle situé à l’arrière du bras.",
    fonctions: ["Extension du coude"],
    exercices: [
      {
        nom: "Dips sur banc",
        image: require("../assets/images/exercices/bench_dips.jpg"),
      },
      {
        nom: "Extension des triceps au-dessus de la tête",
        image: require("../assets/images/exercices/over-head_tricep_extension.jpg"),
      },
      {
        nom: "Extension des triceps",
        image: require("../assets/images/exercices/tricep_extension.jpg"),
      },
      {
        nom: "Kickback pour triceps",
        image: require("../assets/images/exercices/tricep_kickback.gif"),
      },
      {
        nom: "Skull crushers",
        image: require("../assets/images/exercices/skull_crushers.gif"),
      },
    ],
    repos: "48 h",
    securite: "Garder les coudes alignés et éviter les mouvements brusques.",
  },

  forearm: {
    titre: "Avant-bras",
    nomScientifique: "Musculi antebrachii",
    description: "Groupe musculaire de l’avant-bras.",
    fonctions: ["Prise", "Flexion/extension du poignet"],
    exercices: [
      {
        nom: "Curl des avant-bras à la barre",
        image: require("../assets/images/exercices/forearm_curl_bar.webp"),
      },
      {
        nom: "Curl des avant-bras avec haltère",
        image: require("../assets/images/exercices/forearm_curl_dumbbell.gif"),
      },
      {
        nom: "Curl inversé",
        image: require("../assets/images/exercices/reverse_curls.gif"),
      },
      {
        nom: "Curl inversé des avant-bras",
        image: require("../assets/images/exercices/reverse_forearm_curl.gif"),
      },
    ],
    repos: "24 à 48 h",
    securite: "Ne pas surcharger les poignets et garder un mouvement contrôlé.",
  },

  abs: {
    titre: "Abdos",
    nomScientifique: "Rectus abdominis",
    description: "Muscles de la paroi abdominale avant.",
    fonctions: ["Flexion du tronc", "Stabilisation"],
    exercices: [
      {
        nom: "Crunch à la poulie",
        image: require("../assets/images/exercices/cable_crunch.gif"),
      },
      {
        nom: "Crunch à la machine",
        image: require("../assets/images/exercices/machine_crunch.gif"),
      },
      {
        nom: "Relevé de jambes",
        image: require("../assets/images/exercices/leg_raise.gif"),
      },
      {
        nom: "Redressements assis",
        image: require("../assets/images/exercices/sit_ups.gif"),
      },
    ],
    repos: "24 à 48 h",
    securite: "Éviter de tirer sur le cou et garder le bas du dos sous contrôle.",
  },

  obliques: {
    titre: "Obliques",
    nomScientifique: "Obliquus externus et internus abdominis",
    description: "Muscles latéraux de l’abdomen.",
    fonctions: ["Rotation du tronc", "Inclinaison latérale"],
    exercices: [
      {
        nom: "Crunch oblique",
        image: require("../assets/images/exercices/oblique_crunch.gif"),
      },
      {
        nom: "Flexion latérale oblique",
        image: require("../assets/images/exercices/oblique_side_bend.gif"),
      },
    ],
    repos: "24 à 48 h",
    securite: "Contrôler les rotations et éviter l’élan.",
  },

  quadriceps: {
    titre: "Quadriceps",
    nomScientifique: "Quadriceps femoris",
    description: "Muscles situés à l’avant de la cuisse.",
    fonctions: ["Extension du genou", "Stabilisation de la jambe"],
    exercices: [
      {
        nom: "Extension des jambes",
        image: require("../assets/images/exercices/leg_extension.gif"),
      },
      {
        nom: "Squat bulgare avec haltères",
        image: require("../assets/images/exercices/dumbbell_bulgarian_split_squat.gif"),
      },
      {
        nom: "Presse à jambes",
        image: require("../assets/images/exercices/leg_press.gif"),
      },
    ],
    repos: "48 à 72 h",
    securite:
      "Garder les genoux alignés avec les pieds et contrôler la descente.",
  },

  calves: {
    titre: "Mollets",
    nomScientifique: "Gastrocnemius et soleus",
    description: "Muscles de la jambe responsables de la flexion plantaire.",
    fonctions: ["Flexion plantaire", "Stabilité à la marche et à la course"],
    exercices: [
      {
        nom: "Élévations des mollets",
        image: require("../assets/images/exercices/calf_raises.gif"),
      },
      {
        nom: "Élévations assises des mollets",
        image: require("../assets/images/exercices/seated_calf_raises.gif"),
      },
    ],
    repos: "24 à 48 h",
    securite: "Faire une amplitude complète sans rebond brusque.",
  },

  "upper-back": {
    titre: "Haut du dos",
    nomScientifique: "Trapezius / upper back / latissimus dorsi",
    description:
      "Région supérieure du dos, impliquée dans la stabilité scapulaire et le tirage.",
    fonctions: ["Rétraction scapulaire", "Adduction", "Stabilité du haut du dos"],
    exercices: [
      {
        nom: "Rowing à la poulie",
        image: require("../assets/images/exercices/cable_row.gif"),
      },
      {
        nom: "Rowing avec haltère",
        image: require("../assets/images/exercices/dumbbell_row.jpg"),
      },
      {
        nom: "Rowing couché avec haltères",
        image: require("../assets/images/exercices/laying_dumbbell_row.gif"),
      },
      {
        nom: "Tirage vertical",
        image: require("../assets/images/exercices/lat_pulldown.jpg"),
      },
      {
        nom: "Traction",
        image: require("../assets/images/exercices/pull_up.gif"),
      },
      {
        nom: "Rowing T-Bar",
        image: require("../assets/images/exercices/t-bar_row.gif"),
      },
    ],
    repos: "48 à 72 h",
    securite: "Garder la colonne neutre et éviter de tirer avec le bas du dos.",
  },

  "lower-back": {
    titre: "Bas du dos",
    nomScientifique: "Erector spinae / lower back",
    description: "Région lombaire et muscles érecteurs de la colonne.",
    fonctions: ["Extension du tronc", "Stabilisation lombaire"],
    exercices: [
      {
        nom: "Soulevé de terre roumain avec haltères",
        image: require("../assets/images/exercices/dumbbell_rdl.gif"),
      },
      {
        nom: "Soulevé de terre jambes tendues",
        image: require("../assets/images/exercices/sldl.gif"),
      },
    ],
    repos: "48 à 72 h",
    securite:
      "Protéger le bas du dos, garder la colonne neutre et éviter l’hyperextension.",
  },

  hamstring: {
    titre: "Ischio-jambiers",
    nomScientifique: "Hamstrings",
    description: "Muscles situés à l’arrière de la cuisse.",
    fonctions: ["Flexion du genou", "Extension de hanche"],
    exercices: [
      {
        nom: "Leg curl couché",
        image: require("../assets/images/exercices/laying_leg_curls.gif"),
      },
      {
        nom: "Leg curl assis",
        image: require("../assets/images/exercices/seated_leg_curls.gif"),
      },
      {
        nom: "Presse à jambes",
        image: require("../assets/images/exercices/leg_press.gif"),
      },
      {
        nom: "Soulevé de terre roumain avec haltères",
        image: require("../assets/images/exercices/dumbbell_rdl.gif"),
      },
      {
        nom: "Soulevé de terre jambes tendues",
        image: require("../assets/images/exercices/sldl.gif"),
      },
    ],
    repos: "48 à 72 h",
    securite: "Contrôler la descente et éviter les mouvements brusques.",
  },

  gluteal: {
    titre: "Fessiers",
    nomScientifique: "Gluteus maximus / medius",
    description: "Muscles de la région glutéale.",
    fonctions: [
      "Extension de hanche",
      "Stabilisation du bassin",
      "Abduction de hanche",
    ],
    exercices: [
      {
        nom: "Hip thrust",
        image: require("../assets/images/exercices/hip_thrust.gif"),
      },
      {
        nom: "Kickback à la poulie",
        image: require("../assets/images/exercices/cable_kick_back.gif"),
      },
      {
        nom: "Machine abducteurs",
        image: require("../assets/images/exercices/abductors.gif"),
      },
      {
        nom: "Squat bulgare avec haltères",
        image: require("../assets/images/exercices/dumbbell_bulgarian_split_squat.gif"),
      },
    ],
    repos: "48 à 72 h",
    securite:
      "Garder le bassin stable et éviter de cambrer excessivement le bas du dos.",
  },

  adductors: {
    titre: "Adducteurs / intérieur des cuisses",
    nomScientifique: "Adductor longus, brevis, magnus",
    description:
      "Muscles situés à l’intérieur des cuisses, visibles à l’avant et importants pour la stabilité des jambes.",
    fonctions: [
      "Adduction de la hanche",
      "Stabilisation du bassin",
      "Contrôle des jambes",
    ],
    exercices: [
      {
        nom: "Machine adducteurs",
        image: require("../assets/images/exercices/adductors.gif"),
      },
    ],
    repos: "48 h",
    securite:
      "Garder un mouvement contrôlé et éviter de fermer les jambes brusquement.",
  },

  trapezius: {
    titre: "Trapèzes",
    nomScientifique: "Trapezius",
    description:
      "Muscles du haut du dos et du cou, responsables de la stabilité et du mouvement des épaules.",
    fonctions: [
      "Élévation des épaules",
      "Stabilité scapulaire",
      "Rétraction scapulaire",
    ],
    exercices: [
      {
        nom: "Haussements d’épaules",
        image: require("../assets/images/exercices/shrugs.gif"),
      },
    ],
    repos: "48 h",
    securite:
      "Éviter de rouler les épaules et contrôler la montée/descente.",
  },

  traps: {
    titre: "Trapèzes",
    nomScientifique: "Trapezius",
    description:
      "Muscles du haut du dos et du cou, responsables de la stabilité et du mouvement des épaules.",
    fonctions: [
      "Élévation des épaules",
      "Stabilité scapulaire",
      "Rétraction scapulaire",
    ],
    exercices: [
      {
        nom: "Haussements d’épaules",
        image: require("../assets/images/exercices/shrugs.gif"),
      },
    ],
    repos: "48 h",
    securite:
      "Éviter de rouler les épaules et contrôler la montée/descente.",
  },
};

// Cette fonction corrige certains slugs retournés par la librairie.
// Par exemple, si la librairie retourne "traps", on redirige vers "trapezius".
function normaliserSlug(slug: string): string {
  if (slug === "traps") return "trapezius";
  return slug;
}

// Cette fonction crée un exercice vide à afficher dans le formulaire.
// Un identifiant unique est généré pour pouvoir modifier ou supprimer la bonne ligne.
function creerExerciceProgrammeVide(): ExerciceProgramme {
  return {
    id: `${Date.now()}-${Math.random()}`,
    nom: "",
    series: "",
    repetitions: "",
    poids: "",
  };
}

export default function EcranMusculation() {
  // Gère la vue du corps actuellement affichée : avant ou arrière.
  const [vueCorps, setVueCorps] = useState<VueCorps>("front");

  // Stocke la partie du corps présentement sélectionnée par l'utilisateur.
  const [partieSelectionnee, setPartieSelectionnee] =
    useState<ExtendedBodyPart | null>(null);

  // Contrôle l'affichage de la fiche d'information du muscle.
  const [ficheVisible, setFicheVisible] = useState(false);

  // Détermine l'onglet actif de la fiche du muscle.
  const [ongletFicheActif, setOngletFicheActif] = useState<OngletFiche>("infos");

  // Contrôle l'affichage de la feuille modale du générateur de programmes.
  const [generateurVisible, setGenerateurVisible] = useState(false);

  // Détermine si l'utilisateur est dans l'onglet créer ou sauvegardes.
  const [ongletProgrammeActif, setOngletProgrammeActif] =
    useState<OngletProgramme>("creer");

  // Stocke le titre du programme actuellement en cours de création.
  const [titreProgramme, setTitreProgramme] = useState("");

  // Stocke les exercices du programme en cours de création.
  const [exercicesProgramme, setExercicesProgramme] = useState<ExerciceProgramme[]>([
    creerExerciceProgrammeVide(),
  ]);

  // Contient tous les programmes sauvegardés localement.
  const [programmesSauvegardes, setProgrammesSauvegardes] = useState<
    ProgrammeSauvegarde[]
  >([]);

  // Représente le programme sélectionné dans la liste des sauvegardes.
  const [programmeSauvegardeSelectionne, setProgrammeSauvegardeSelectionne] =
    useState<ProgrammeSauvegarde | null>(null);

  // Indique si le chargement initial des programmes a déjà été effectué.
  const aChargeLesProgrammes = useRef(false);

  // Valeurs animées utilisées pour la fiche d'information du muscle.
  const translationYFiche = useRef(new Animated.Value(HAUTEUR_ECRAN)).current;
  const opaciteFondFiche = useRef(new Animated.Value(0)).current;

  // Valeurs animées utilisées pour la feuille du générateur de programmes.
  const translationYGenerateur = useRef(new Animated.Value(HAUTEUR_ECRAN)).current;
  const opaciteFondGenerateur = useRef(new Animated.Value(0)).current;

  // Calcule le slug du muscle sélectionné en le normalisant au besoin.
  const slugSelectionne = partieSelectionnee?.slug
    ? normaliserSlug(partieSelectionnee.slug)
    : null;

  // Récupère les informations du muscle actuellement sélectionné.
  const infoSelectionnee = slugSelectionne
    ? INFOS_MUSCLES[slugSelectionne as keyof typeof INFOS_MUSCLES]
    : null;

  // Prépare la liste des zones à surligner sur le corps interactif.
  // Ici, on ne surligne que le muscle actuellement sélectionné.
  const donneesSurlignees = useMemo(() => {
    const base: ExtendedBodyPart[] = [];
    if (partieSelectionnee) {
      base.push(partieSelectionnee);
    }
    return base;
  }, [partieSelectionnee]);

  // Charge les programmes sauvegardés au démarrage de l'écran.
  useEffect(() => {
    const chargerProgrammesSauvegardes = async () => {
      try {
        const stockage = await AsyncStorage.getItem(CLE_STOCKAGE_PROGRAMMES);
        if (stockage) {
          const programmesParses: ProgrammeSauvegarde[] = JSON.parse(stockage);
          setProgrammesSauvegardes(programmesParses);
          if (programmesParses.length > 0) {
            setProgrammeSauvegardeSelectionne(programmesParses[0]);
          }
        }
      } catch (erreur) {
        console.log("Erreur chargement programmes :", erreur);
      } finally {
        aChargeLesProgrammes.current = true;
      }
    };

    chargerProgrammesSauvegardes();
  }, []);

  // Sauvegarde les programmes automatiquement dès que la liste change.
  // On attend que le chargement initial soit terminé pour éviter d'écraser les données.
  useEffect(() => {
    const sauvegarderProgrammes = async () => {
      if (!aChargeLesProgrammes.current) return;
      try {
        await AsyncStorage.setItem(
          CLE_STOCKAGE_PROGRAMMES,
          JSON.stringify(programmesSauvegardes)
        );
      } catch (erreur) {
        console.log("Erreur sauvegarde programmes :", erreur);
      }
    };

    sauvegarderProgrammes();
  }, [programmesSauvegardes]);

  // Ouvre la fiche d'un muscle en lançant les animations nécessaires.
  const ouvrirFicheMuscle = (partie: ExtendedBodyPart) => {
    setPartieSelectionnee(partie);
    setOngletFicheActif("infos");
    setFicheVisible(true);

    opaciteFondFiche.setValue(0);
    translationYFiche.setValue(HAUTEUR_ECRAN);

    Animated.parallel([
      Animated.timing(opaciteFondFiche, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(translationYFiche, {
        toValue: 0,
        friction: 9,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Ferme la fiche du muscle avec une animation vers le bas.
  const fermerFicheMuscle = () => {
    Animated.parallel([
      Animated.timing(opaciteFondFiche, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translationYFiche, {
        toValue: HAUTEUR_ECRAN,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setFicheVisible(false);
    });
  };

  // Ouvre la feuille modale du générateur de programmes.
  const ouvrirGenerateurProgrammes = () => {
    setGenerateurVisible(true);
    opaciteFondGenerateur.setValue(0);
    translationYGenerateur.setValue(HAUTEUR_ECRAN);

    Animated.parallel([
      Animated.timing(opaciteFondGenerateur, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(translationYGenerateur, {
        toValue: 0,
        friction: 9,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Ferme la feuille modale du générateur de programmes.
  const fermerGenerateurProgrammes = () => {
    Animated.parallel([
      Animated.timing(opaciteFondGenerateur, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translationYGenerateur, {
        toValue: HAUTEUR_ECRAN,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setGenerateurVisible(false);
    });
  };

  // Ajoute une nouvelle ligne vide d'exercice dans le formulaire.
  const ajouterExerciceProgramme = () => {
    setExercicesProgramme((precedent) => [
      ...precedent,
      creerExerciceProgrammeVide(),
    ]);
  };

  // Supprime un exercice du formulaire selon son identifiant.
  // Si tous les exercices sont supprimés, on recrée une ligne vide.
  const supprimerExerciceProgramme = (id: string) => {
    setExercicesProgramme((precedent) => {
      const filtres = precedent.filter((element) => element.id !== id);
      return filtres.length > 0 ? filtres : [creerExerciceProgrammeVide()];
    });
  };

  // Met à jour une propriété précise d'un exercice du programme.
  const mettreAJourExerciceProgramme = (
    id: string,
    champ: keyof Omit<ExerciceProgramme, "id">,
    valeur: string
  ) => {
    setExercicesProgramme((precedent) =>
      precedent.map((element) =>
        element.id === id ? { ...element, [champ]: valeur } : element
      )
    );
  };

  // Sauvegarde un nouveau programme si le titre et au moins un exercice sont remplis.
  // Après la sauvegarde, le formulaire est réinitialisé et l'onglet bascule vers les sauvegardes.
  const sauvegarderProgramme = () => {
    const titreNettoye = titreProgramme.trim();
    const exercicesNettoyes = exercicesProgramme.filter(
      (element) =>
        element.nom.trim() !== "" ||
        element.series.trim() !== "" ||
        element.repetitions.trim() !== "" ||
        element.poids.trim() !== ""
    );

    if (!titreNettoye || exercicesNettoyes.length === 0) {
      return;
    }

    const nouveauProgramme: ProgrammeSauvegarde = {
      id: `${Date.now()}-${Math.random()}`,
      titre: titreNettoye,
      exercices: exercicesNettoyes,
    };

    setProgrammesSauvegardes((precedent) => [nouveauProgramme, ...precedent]);
    setProgrammeSauvegardeSelectionne(nouveauProgramme);
    setOngletProgrammeActif("sauvegardes");
    setTitreProgramme("");
    setExercicesProgramme([creerExerciceProgrammeVide()]);
  };

  // Supprime un programme sauvegardé et met à jour le programme sélectionné si nécessaire.
  const supprimerProgrammeSauvegarde = (idProgramme: string) => {
    setProgrammesSauvegardes((precedent) => {
      const misAJour = precedent.filter((element) => element.id !== idProgramme);

      if (programmeSauvegardeSelectionne?.id === idProgramme) {
        setProgrammeSauvegardeSelectionne(
          misAJour.length > 0 ? misAJour[0] : null
        );
      }

      return misAJour;
    });
  };

  // Affiche l'action de suppression à droite lors du swipe sur un programme sauvegardé.
  const rendreActionSupprimerDroite = (
    progression: Animated.AnimatedInterpolation<number>,
    deplacementX: Animated.AnimatedInterpolation<number>,
    idProgramme: string
  ) => {
    const translationX = deplacementX.interpolate({
      inputRange: [-120, 0],
      outputRange: [0, 40],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        style={[
          styles.actionSupprimer,
          {
            transform: [{ translateX: translationX }],
          },
        ]}
      >
        <Pressable
          style={styles.boutonActionSupprimer}
          onPress={() => supprimerProgrammeSauvegarde(idProgramme)}
        >
          <Ionicons name="trash-outline" size={22} color="white" />
          <Text style={styles.texteActionSupprimer}>Supprimer</Text>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.ecran}>
        <ScrollView contentContainerStyle={styles.conteneur}>
          <Text style={styles.titre}>Musculation</Text>

          <View style={styles.rangeeInterrupteur}>
            <Pressable
              style={[
                styles.boutonInterrupteur,
                vueCorps === "front" && styles.boutonInterrupteurActif,
              ]}
              onPress={() => setVueCorps("front")}
            >
              <Text
                style={[
                  styles.texteInterrupteur,
                  vueCorps === "front" && styles.texteInterrupteurActif,
                ]}
              >
                Vue avant
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.boutonInterrupteur,
                vueCorps === "back" && styles.boutonInterrupteurActif,
              ]}
              onPress={() => setVueCorps("back")}
            >
              <Text
                style={[
                  styles.texteInterrupteur,
                  vueCorps === "back" && styles.texteInterrupteurActif,
                ]}
              >
                Vue arrière
              </Text>
            </Pressable>
          </View>

          <View style={styles.rangeeBoutonGenerateur}>
            <Pressable
              style={styles.boutonGenerateur}
              onPress={ouvrirGenerateurProgrammes}
            >
              <Ionicons name="barbell-outline" size={20} color="white" />
              <Text style={styles.texteBoutonGenerateur}>
                Générateur de programmes
              </Text>
            </Pressable>
          </View>

          <View style={styles.carteCorps}>
            <Body
              data={donneesSurlignees}
              onBodyPartPress={(partieDuCorps, cote) => {
                ouvrirFicheMuscle({
                  slug: partieDuCorps.slug,
                  intensity: 2,
                  side: cote,
                });
              }}
              gender="male"
              side={vueCorps}
              scale={1.72}
              border="#2f2f2f"
              defaultFill="#efb6d4"
              defaultStroke="#2f2f2f"
              defaultStrokeWidth={1}
            />
          </View>
        </ScrollView>

        {/* Modal de la fiche d'information du muscle sélectionné. */}
        <Modal visible={ficheVisible} transparent animationType="none">
          <View style={styles.racineModal}>
            <Animated.View
              style={[
                styles.fondAssombri,
                {
                  opacity: opaciteFondFiche,
                },
              ]}
            >
              <Pressable
                style={StyleSheet.absoluteFill}
                onPress={fermerFicheMuscle}
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.fiche,
                {
                  transform: [{ translateY: translationYFiche }],
                },
              ]}
            >
              <View style={styles.poignee} />

              <View style={styles.enteteFiche}>
                <View>
                  <Text style={styles.titreFiche}>
                    {infoSelectionnee?.titre ?? "Muscle"}
                  </Text>
                  <Text style={styles.sousTitreFiche}>
                    {infoSelectionnee?.nomScientifique ?? ""}
                  </Text>
                </View>

                <Pressable
                  style={styles.boutonFermer}
                  onPress={fermerFicheMuscle}
                >
                  <Text style={styles.texteBoutonFermer}>Fermer</Text>
                </Pressable>
              </View>

              <ScrollView
                contentContainerStyle={styles.contenuFiche}
                showsVerticalScrollIndicator={false}
              >
                {ongletFicheActif === "infos" ? (
                  infoSelectionnee ? (
                    <>
                      <View style={styles.blocInfo}>
                        <Text style={styles.titreBloc}>Description</Text>
                        <Text style={styles.texteBloc}>
                          {infoSelectionnee.description}
                        </Text>
                      </View>

                      <View style={styles.blocInfo}>
                        <Text style={styles.titreBloc}>Fonctions</Text>
                        {infoSelectionnee.fonctions.map((fonction, index) => (
                          <Text
                            key={`${fonction}-${index}`}
                            style={styles.textePuce}
                          >
                            • {fonction}
                          </Text>
                        ))}
                      </View>

                      <View style={styles.rangeeCartes}>
                        <View style={styles.petiteCarteInfo}>
                          <Text style={styles.libellePetiteCarte}>Repos</Text>
                          <Text style={styles.valeurPetiteCarte}>
                            {infoSelectionnee.repos}
                          </Text>
                        </View>

                        <View style={styles.petiteCarteInfo}>
                          <Text style={styles.libellePetiteCarte}>Sécurité</Text>
                          <Text style={styles.valeurPetiteCarte}>
                            {infoSelectionnee.securite}
                          </Text>
                        </View>
                      </View>
                    </>
                  ) : (
                    <Text style={styles.texteVide}>Aucune information.</Text>
                  )
                ) : infoSelectionnee ? (
                  infoSelectionnee.exercices.length > 0 ? (
                    <View style={styles.grilleExercices}>
                      {infoSelectionnee.exercices.map((exercice, index) => (
                        <View
                          key={`${exercice.nom}-${index}`}
                          style={styles.carteExercice}
                        >
                          {exercice.image ? (
                            <Image
                              source={exercice.image}
                              style={styles.imageExercice}
                            />
                          ) : null}
                          <Text style={styles.nomExercice}>{exercice.nom}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.texteVide}>
                      Aucun visuel ajouté pour le moment.
                    </Text>
                  )
                ) : (
                  <Text style={styles.texteVide}>Aucun exercice disponible.</Text>
                )}
              </ScrollView>

              <View style={styles.ongletsBas}>
                <Pressable
                  style={[
                    styles.boutonOngletBas,
                    ongletFicheActif === "infos" && styles.boutonOngletBasActif,
                  ]}
                  onPress={() => setOngletFicheActif("infos")}
                >
                  <Text
                    style={[
                      styles.texteOngletBas,
                      ongletFicheActif === "infos" &&
                        styles.texteOngletBasActif,
                    ]}
                  >
                    Infos
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.boutonOngletBas,
                    ongletFicheActif === "exercices" &&
                      styles.boutonOngletBasActif,
                  ]}
                  onPress={() => setOngletFicheActif("exercices")}
                >
                  <Text
                    style={[
                      styles.texteOngletBas,
                      ongletFicheActif === "exercices" &&
                        styles.texteOngletBasActif,
                    ]}
                  >
                    Exercices
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          </View>
        </Modal>

        {/* Modal du générateur de programmes personnalisés. */}
        <Modal visible={generateurVisible} transparent animationType="none">
          <View style={styles.racineModal}>
            <Animated.View
              style={[
                styles.fondAssombri,
                {
                  opacity: opaciteFondGenerateur,
                },
              ]}
            >
              <Pressable
                style={StyleSheet.absoluteFill}
                onPress={fermerGenerateurProgrammes}
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.ficheProgramme,
                {
                  transform: [{ translateY: translationYGenerateur }],
                },
              ]}
            >
              <View style={styles.poignee} />

              <View style={styles.enteteFiche}>
                <View>
                  <Text style={styles.titreFiche}>Générateur de programmes</Text>
                  <Text style={styles.sousTitreFiche}>
                    Crée et sauvegarde tes programmes
                  </Text>
                </View>

                <Pressable
                  style={styles.boutonFermer}
                  onPress={fermerGenerateurProgrammes}
                >
                  <Text style={styles.texteBoutonFermer}>Fermer</Text>
                </Pressable>
              </View>

              <ScrollView
                contentContainerStyle={styles.contenuFiche}
                showsVerticalScrollIndicator={false}
              >
                {ongletProgrammeActif === "creer" ? (
                  <>
                    <View style={styles.blocInfo}>
                      <Text style={styles.titreBloc}>Nommer le programme</Text>
                      <TextInput
                        value={titreProgramme}
                        onChangeText={setTitreProgramme}
                        placeholder="Ex. : Jour des jambes"
                        style={styles.champTexte}
                        placeholderTextColor="#999"
                      />
                    </View>

                    <View style={styles.rangeeEnteteCreation}>
                      <Text style={styles.titreBloc}>Exercices</Text>

                      <Pressable
                        style={styles.boutonAjouterExercice}
                        onPress={ajouterExerciceProgramme}
                      >
                        <Ionicons name="add" size={18} color="white" />
                        <Text style={styles.texteAjouterExercice}>
                          Ajouter un exercice
                        </Text>
                      </Pressable>
                    </View>

                    {exercicesProgramme.map((exercice) => (
                      <View
                        key={exercice.id}
                        style={styles.carteExerciceProgramme}
                      >
                        <View style={styles.rangeeEnteteExercice}>
                          <Text style={styles.libellePetiteCarte}>Exercice</Text>
                          <Pressable
                            onPress={() =>
                              supprimerExerciceProgramme(exercice.id)
                            }
                            style={styles.boutonPoubelle}
                          >
                            <Ionicons
                              name="trash-outline"
                              size={18}
                              color="#d9534f"
                            />
                          </Pressable>
                        </View>

                        <TextInput
                          value={exercice.nom}
                          onChangeText={(valeur) =>
                            mettreAJourExerciceProgramme(
                              exercice.id,
                              "nom",
                              valeur
                            )
                          }
                          placeholder="Nom de l'exercice"
                          style={styles.champTexte}
                          placeholderTextColor="#999"
                        />

                        <View style={styles.rangeeChamps}>
                          <TextInput
                            value={exercice.series}
                            onChangeText={(valeur) =>
                              mettreAJourExerciceProgramme(
                                exercice.id,
                                "series",
                                valeur
                              )
                            }
                            placeholder="Séries"
                            style={[styles.champTexte, styles.petitChampTexte]}
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                          />

                          <TextInput
                            value={exercice.repetitions}
                            onChangeText={(valeur) =>
                              mettreAJourExerciceProgramme(
                                exercice.id,
                                "repetitions",
                                valeur
                              )
                            }
                            placeholder="Répétitions"
                            style={[styles.champTexte, styles.petitChampTexte]}
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                          />

                          <TextInput
                            value={exercice.poids}
                            onChangeText={(valeur) =>
                              mettreAJourExerciceProgramme(
                                exercice.id,
                                "poids",
                                valeur
                              )
                            }
                            placeholder="Poids"
                            style={[styles.champTexte, styles.petitChampTexte]}
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                          />
                        </View>
                      </View>
                    ))}

                    <Pressable
                      style={styles.boutonSauvegarderProgramme}
                      onPress={sauvegarderProgramme}
                    >
                      <Ionicons name="save-outline" size={18} color="white" />
                      <Text style={styles.texteSauvegarderProgramme}>
                        Sauvegarder le programme
                      </Text>
                    </Pressable>
                  </>
                ) : (
                  <>
                    {programmesSauvegardes.length === 0 ? (
                      <Text style={styles.texteVide}>
                        Aucun programme sauvegardé pour le moment.
                      </Text>
                    ) : (
                      <>
                        <View style={styles.listeProgrammesSauvegardes}>
                          {programmesSauvegardes.map((programme) => (
                            <Swipeable
                              key={programme.id}
                              overshootRight={false}
                              renderRightActions={(progression, deplacementX) =>
                                rendreActionSupprimerDroite(
                                  progression,
                                  deplacementX,
                                  programme.id
                                )
                              }
                            >
                              <Pressable
                                style={[
                                  styles.carteProgrammeSauvegarde,
                                  programmeSauvegardeSelectionne?.id ===
                                    programme.id &&
                                    styles.carteProgrammeSauvegardeActive,
                                ]}
                                onPress={() =>
                                  setProgrammeSauvegardeSelectionne(programme)
                                }
                              >
                                <View>
                                  <Text style={styles.titreProgrammeSauvegarde}>
                                    {programme.titre}
                                  </Text>
                                  <Text style={styles.metaProgrammeSauvegarde}>
                                    {programme.exercices.length} exercice
                                    {programme.exercices.length > 1 ? "s" : ""}
                                  </Text>
                                </View>

                                <Ionicons
                                  name="chevron-forward"
                                  size={18}
                                  color="#666"
                                />
                              </Pressable>
                            </Swipeable>
                          ))}
                        </View>

                        {programmeSauvegardeSelectionne ? (
                          <View style={styles.blocInfo}>
                            <Text style={styles.titreBloc}>
                              {programmeSauvegardeSelectionne.titre}
                            </Text>

                            {programmeSauvegardeSelectionne.exercices.map(
                              (element) => (
                                <View
                                  key={element.id}
                                  style={styles.rangeeExerciceSauvegarde}
                                >
                                  <Text style={styles.nomExerciceSauvegarde}>
                                    {element.nom || "Exercice sans nom"}
                                  </Text>
                                  <Text style={styles.metaExerciceSauvegarde}>
                                    Séries : {element.series || "-"} | Répétitions :{" "}
                                    {element.repetitions || "-"} | Poids :{" "}
                                    {element.poids || "-"}
                                  </Text>
                                </View>
                              )
                            )}
                          </View>
                        ) : null}
                      </>
                    )}
                  </>
                )}
              </ScrollView>

              <View style={styles.ongletsBas}>
                <Pressable
                  style={[
                    styles.boutonOngletBas,
                    ongletProgrammeActif === "creer" &&
                      styles.boutonOngletBasActif,
                  ]}
                  onPress={() => setOngletProgrammeActif("creer")}
                >
                  <Text
                    style={[
                      styles.texteOngletBas,
                      ongletProgrammeActif === "creer" &&
                        styles.texteOngletBasActif,
                    ]}
                  >
                    Créer
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.boutonOngletBas,
                    ongletProgrammeActif === "sauvegardes" &&
                      styles.boutonOngletBasActif,
                  ]}
                  onPress={() => setOngletProgrammeActif("sauvegardes")}
                >
                  <Text
                    style={[
                      styles.texteOngletBas,
                      ongletProgrammeActif === "sauvegardes" &&
                        styles.texteOngletBasActif,
                    ]}
                  >
                    Mes programmes
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  ecran: {
    flex: 1,
    backgroundColor: "#e8c0d7",
  },
  conteneur: {
    padding: 16,
    paddingBottom: 28,
    gap: 16,
  },
  titre: {
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 10,
  },

  rangeeInterrupteur: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  boutonInterrupteur: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d7d7d7",
    minWidth: 135,
    alignItems: "center",
  },
  boutonInterrupteurActif: {
    backgroundColor: "#efb6d4",
    borderColor: "#efb6d4",
  },
  texteInterrupteur: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  texteInterrupteurActif: {
    color: "white",
  },

  rangeeBoutonGenerateur: {
    alignItems: "center",
  },
  boutonGenerateur: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#222",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  texteBoutonGenerateur: {
    color: "white",
    fontWeight: "800",
    fontSize: 15,
  },

  carteCorps: {
    backgroundColor: "white",
    borderRadius: 22,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    minHeight: 560,
  },

  racineModal: {
    flex: 1,
    justifyContent: "flex-end",
  },
  fondAssombri: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)",
  },

  fiche: {
    height: HAUTEUR_ECRAN * 0.72,
    backgroundColor: "#fff",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    overflow: "hidden",
  },
  ficheProgramme: {
    height: HAUTEUR_ECRAN * 0.84,
    backgroundColor: "#fff",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    overflow: "hidden",
  },

  poignee: {
    width: 54,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#d4d4d4",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 8,
  },

  enteteFiche: {
    paddingHorizontal: 18,
    paddingBottom: 10,
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  titreFiche: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111",
  },
  sousTitreFiche: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  boutonFermer: {
    backgroundColor: "#f6f6f6",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  texteBoutonFermer: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },

  contenuFiche: {
    padding: 18,
    paddingBottom: 110,
    gap: 14,
  },

  blocInfo: {
    backgroundColor: "#fafafa",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ededed",
  },
  titreBloc: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
    color: "#111",
  },
  texteBloc: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  textePuce: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    marginBottom: 4,
  },

  rangeeCartes: {
    flexDirection: "row",
    gap: 12,
  },
  petiteCarteInfo: {
    flex: 1,
    backgroundColor: "#fafafa",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ededed",
  },
  libellePetiteCarte: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 8,
    color: "#111",
  },
  valeurPetiteCarte: {
    fontSize: 15,
    lineHeight: 22,
    color: "#333",
  },

  grilleExercices: {
    gap: 14,
  },
  carteExercice: {
    backgroundColor: "#fafafa",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ececec",
  },
  imageExercice: {
    width: "100%",
    height: 190,
    resizeMode: "cover",
    backgroundColor: "#f2f2f2",
  },
  nomExercice: {
    padding: 12,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    color: "#222",
  },

  rangeeEnteteCreation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  boutonAjouterExercice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#efb6d4",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  texteAjouterExercice: {
    color: "white",
    fontWeight: "800",
    fontSize: 14,
  },
  carteExerciceProgramme: {
    backgroundColor: "#fafafa",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ededed",
    gap: 10,
  },
  rangeeEnteteExercice: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  boutonPoubelle: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: "#fff5f5",
  },
  champTexte: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e4e4e4",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#222",
  },
  rangeeChamps: {
    flexDirection: "row",
    gap: 10,
  },
  petitChampTexte: {
    flex: 1,
  },
  boutonSauvegarderProgramme: {
    marginTop: 4,
    backgroundColor: "#222",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  texteSauvegarderProgramme: {
    color: "white",
    fontWeight: "800",
    fontSize: 15,
  },

  listeProgrammesSauvegardes: {
    gap: 10,
  },
  carteProgrammeSauvegarde: {
    backgroundColor: "#fafafa",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ededed",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  carteProgrammeSauvegardeActive: {
    borderColor: "#efb6d4",
    backgroundColor: "#fff8fc",
  },
  titreProgrammeSauvegarde: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111",
  },
  metaProgrammeSauvegarde: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  rangeeExerciceSauvegarde: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ededed",
  },
  nomExerciceSauvegarde: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111",
    marginBottom: 4,
  },
  metaExerciceSauvegarde: {
    fontSize: 14,
    color: "#555",
  },

  actionSupprimer: {
    justifyContent: "center",
    alignItems: "flex-end",
    marginBottom: 10,
  },
  boutonActionSupprimer: {
    width: 100,
    height: "100%",
    minHeight: 78,
    backgroundColor: "#d9534f",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  texteActionSupprimer: {
    color: "white",
    fontWeight: "800",
    fontSize: 13,
  },

  texteVide: {
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
  },

  ongletsBas: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 22,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
  },
  boutonOngletBas: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  boutonOngletBasActif: {
    backgroundColor: "#efb6d4",
  },
  texteOngletBas: {
    fontSize: 16,
    fontWeight: "800",
    color: "#333",
  },
  texteOngletBasActif: {
    color: "white",
  },
});
