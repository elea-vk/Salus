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

type SideView = "front" | "back";
type SheetTab = "infos" | "exercices";
type WorkoutTab = "create" | "saved";

type ExerciseItem = {
  name: string;
  image?: any;
};

type MuscleInfo = {
  title: string;
  scientific: string;
  description: string;
  functions: string[];
  exercises: ExerciseItem[];
  rest: string;
  safety: string;
};

type WorkoutExercise = {
  id: string;
  name: string;
  sets: string;
  reps: string;
  weight: string;
};

type SavedWorkout = {
  id: string;
  title: string;
  exercises: WorkoutExercise[];
};

const SCREEN_HEIGHT = Dimensions.get("window").height;
const WORKOUTS_STORAGE_KEY = "@salus_saved_workouts";

const MUSCLE_INFO: Record<string, MuscleInfo> = {
  chest: {
    title: "Pectoraux",
    scientific: "Pectoralis major",
    description: "Muscles situés à l’avant du thorax.",
    functions: [
      "Adduction du bras",
      "Rotation interne",
      "Flexion de l’épaule",
    ],
    exercises: [
      {
        name: "Incline Dumbbell Press (Haut des pectoraux)",
        image: require("../assets/images/exercices/incline_dumbbell_press.gif"),
      },
      {
        name: "Push Up (Milieu des pectoraux)",
        image: require("../assets/images/exercices/Push_Up.gif"),
      },
      {
        name: "Flat Dumbbell Press (Milieu des pectoraux)",
        image: require("../assets/images/exercices/flat_dumbbell_press.gif"),
      },
      {
        name: "Peck Deck Chest Fly (Milieu des pectoraux)",
        image: require("../assets/images/exercices/peckdeck_chest_fly.gif"),
      },
      {
        name: "Cable Chest Fly (Bas des pectoraux)",
        image: require("../assets/images/exercices/cable_chest_fly.gif"),
      },
    ],
    rest: "48 à 72 h",
    safety:
      "Contrôler la charge, garder les épaules stables et éviter de trop cambrer le bas du dos.",
  },

  deltoids: {
    title: "Épaules / Deltoïdes",
    scientific: "Deltoideus",
    description: "Muscles principaux de l’épaule.",
    functions: ["Abduction", "Flexion", "Extension de l’épaule"],
    exercises: [
      {
        name: "Dumbbell Shoulder Press",
        image: require("../assets/images/exercices/dumbbell_shoulder_press.jpg"),
      },
      {
        name: "Machine Shoulder Press",
        image: require("../assets/images/exercices/machine_shoulder_press.jpg"),
      },
      {
        name: "Dumbbell Lateral Raise",
        image: require("../assets/images/exercices/dumbbell_lateral_raise.gif"),
      },
      {
        name: "Cable Lateral Raise",
        image: require("../assets/images/exercices/cable_lateral_raise.gif"),
      },
      {
        name: "Pike Pushups",
        image: require("../assets/images/exercices/pike_pushups.gif"),
      },
      {
        name: "Rear Delt Fly",
        image: require("../assets/images/exercices/rear_delt_fly.gif"),
      },
    ],
    rest: "48 h",
    safety:
      "Éviter l’élan, garder le mouvement contrôlé et ne pas hausser les épaules excessivement.",
  },

  biceps: {
    title: "Biceps",
    scientific: "Biceps brachii",
    description: "Muscle situé à l’avant du bras.",
    functions: ["Flexion du coude", "Supination"],
    exercises: [
      {
        name: "Dumbbell Curl",
        image: require("../assets/images/exercices/dumbbell_curl.gif"),
      },
      {
        name: "Hammer Curls",
        image: require("../assets/images/exercices/hammer_curls.gif"),
      },
      {
        name: "Preacher Curl",
        image: require("../assets/images/exercices/preacher_curl.gif"),
      },
    ],
    rest: "48 h",
    safety: "Ne pas balancer le tronc et garder les coudes stables.",
  },

  triceps: {
    title: "Triceps",
    scientific: "Triceps brachii",
    description: "Muscle situé à l’arrière du bras.",
    functions: ["Extension du coude"],
    exercises: [
      {
        name: "Bench Dips",
        image: require("../assets/images/exercices/bench_dips.jpg"),
      },
      {
        name: "Over Head Tricep Extension",
        image: require("../assets/images/exercices/over-head_tricep_extension.jpg"),
      },
      {
        name: "Tricep Extension",
        image: require("../assets/images/exercices/tricep_extension.jpg"),
      },
      {
        name: "Tricep Kickback",
        image: require("../assets/images/exercices/tricep_kickback.gif"),
      },
      {
        name: "Skull Crushers",
        image: require("../assets/images/exercices/skull_crushers.gif"),
      },
    ],
    rest: "48 h",
    safety: "Garder les coudes alignés et éviter les mouvements brusques.",
  },

  forearm: {
    title: "Avant-bras",
    scientific: "Musculi antebrachii",
    description: "Groupe musculaire de l’avant-bras.",
    functions: ["Prise", "Flexion/extension du poignet"],
    exercises: [
      {
        name: "Forearm Curl Bar",
        image: require("../assets/images/exercices/forearm_curl_bar.webp"),
      },
      {
        name: "Forearm Curl Dumbbell",
        image: require("../assets/images/exercices/forearm_curl_dumbbell.gif"),
      },
      {
        name: "Reverse Curls",
        image: require("../assets/images/exercices/reverse_curls.gif"),
      },
      {
        name: "Reverse Forearm Curl",
        image: require("../assets/images/exercices/reverse_forearm_curl.gif"),
      },
    ],
    rest: "24 à 48 h",
    safety: "Ne pas surcharger les poignets et garder un mouvement contrôlé.",
  },

  abs: {
    title: "Abdos",
    scientific: "Rectus abdominis",
    description: "Muscles de la paroi abdominale avant.",
    functions: ["Flexion du tronc", "Stabilisation"],
    exercises: [
      {
        name: "Cable Crunch",
        image: require("../assets/images/exercices/cable_crunch.gif"),
      },
      {
        name: "Machine Crunch",
        image: require("../assets/images/exercices/machine_crunch.gif"),
      },
      {
        name: "Leg Raise",
        image: require("../assets/images/exercices/leg_raise.gif"),
      },
      {
        name: "Sit Ups",
        image: require("../assets/images/exercices/sit_ups.gif"),
      },
    ],
    rest: "24 à 48 h",
    safety: "Éviter de tirer sur le cou et garder le bas du dos sous contrôle.",
  },

  obliques: {
    title: "Obliques",
    scientific: "Obliquus externus et internus abdominis",
    description: "Muscles latéraux de l’abdomen.",
    functions: ["Rotation du tronc", "Inclinaison latérale"],
    exercises: [
      {
        name: "Oblique Crunch",
        image: require("../assets/images/exercices/oblique_crunch.gif"),
      },
      {
        name: "Oblique Side Bend",
        image: require("../assets/images/exercices/oblique_side_bend.gif"),
      },
    ],
    rest: "24 à 48 h",
    safety: "Contrôler les rotations et éviter l’élan.",
  },

  quadriceps: {
    title: "Quadriceps",
    scientific: "Quadriceps femoris",
    description: "Muscles situés à l’avant de la cuisse.",
    functions: ["Extension du genou", "Stabilisation de la jambe"],
    exercises: [
      {
        name: "Leg Extension",
        image: require("../assets/images/exercices/leg_extension.gif"),
      },
      {
        name: "Dumbbell Bulgarian Split Squat",
        image: require("../assets/images/exercices/dumbbell_bulgarian_split_squat.gif"),
      },
      {
        name: "Leg Press",
        image: require("../assets/images/exercices/leg_press.gif"),
      },
    ],
    rest: "48 à 72 h",
    safety:
      "Garder les genoux alignés avec les pieds et contrôler la descente.",
  },

  calves: {
    title: "Mollets",
    scientific: "Gastrocnemius et soleus",
    description: "Muscles de la jambe responsables de la flexion plantaire.",
    functions: ["Flexion plantaire", "Stabilité à la marche et à la course"],
    exercises: [
      {
        name: "Calf Raises",
        image: require("../assets/images/exercices/calf_raises.gif"),
      },
      {
        name: "Seated Calf Raises",
        image: require("../assets/images/exercices/seated_calf_raises.gif"),
      },
    ],
    rest: "24 à 48 h",
    safety: "Faire une amplitude complète sans rebond brusque.",
  },

  "upper-back": {
    title: "Haut du dos",
    scientific: "Trapezius / upper back / latissimus dorsi",
    description:
      "Région supérieure du dos, impliquée dans la stabilité scapulaire et le tirage.",
    functions: ["Rétraction scapulaire", "Adduction", "Stabilité du haut du dos"],
    exercises: [
      {
        name: "Cable Row",
        image: require("../assets/images/exercices/cable_row.gif"),
      },
      {
        name: "Dumbbell Row",
        image: require("../assets/images/exercices/dumbbell_row.jpg"),
      },
      {
        name: "Laying Dumbbell Row",
        image: require("../assets/images/exercices/laying_dumbbell_row.gif"),
      },
      {
        name: "Lat Pulldown",
        image: require("../assets/images/exercices/lat_pulldown.jpg"),
      },
      {
        name: "Pull Up",
        image: require("../assets/images/exercices/pull_up.gif"),
      },
      {
        name: "T-Bar Row",
        image: require("../assets/images/exercices/t-bar_row.gif"),
      },
    ],
    rest: "48 à 72 h",
    safety: "Garder la colonne neutre et éviter de tirer avec le bas du dos.",
  },

  "lower-back": {
    title: "Bas du dos",
    scientific: "Erector spinae / lower back",
    description: "Région lombaire et muscles érecteurs de la colonne.",
    functions: ["Extension du tronc", "Stabilisation lombaire"],
    exercises: [
      {
        name: "Dumbbell Romanian Deadlift",
        image: require("../assets/images/exercices/dumbbell_rdl.gif"),
      },
      {
        name: "Stiff Leg Deadlift",
        image: require("../assets/images/exercices/sldl.gif"),
      },
    ],
    rest: "48 à 72 h",
    safety:
      "Protéger le bas du dos, garder la colonne neutre et éviter l’hyperextension.",
  },

  hamstring: {
    title: "Ischio-jambiers",
    scientific: "Hamstrings",
    description: "Muscles situés à l’arrière de la cuisse.",
    functions: ["Flexion du genou", "Extension de hanche"],
    exercises: [
      {
        name: "Laying Leg Curls",
        image: require("../assets/images/exercices/laying_leg_curls.gif"),
      },
      {
        name: "Seated Leg Curls",
        image: require("../assets/images/exercices/seated_leg_curls.gif"),
      },
      {
        name: "Leg Press",
        image: require("../assets/images/exercices/leg_press.gif"),
      },
      {
        name: "Dumbbell Romanian Deadlift",
        image: require("../assets/images/exercices/dumbbell_rdl.gif"),
      },
      {
        name: "Stiff Leg Deadlift",
        image: require("../assets/images/exercices/sldl.gif"),
      },
    ],
    rest: "48 à 72 h",
    safety: "Contrôler la descente et éviter les mouvements brusques.",
  },

  gluteal: {
    title: "Fessiers",
    scientific: "Gluteus maximus / medius",
    description: "Muscles de la région glutéale.",
    functions: [
      "Extension de hanche",
      "Stabilisation du bassin",
      "Abduction de hanche",
    ],
    exercises: [
      {
        name: "Hip Thrust",
        image: require("../assets/images/exercices/hip_thrust.gif"),
      },
      {
        name: "Cable Kick Back",
        image: require("../assets/images/exercices/cable_kick_back.gif"),
      },
      {
        name: "Abductors",
        image: require("../assets/images/exercices/abductors.gif"),
      },
      {
        name: "Dumbbell Bulgarian Split Squat",
        image: require("../assets/images/exercices/dumbbell_bulgarian_split_squat.gif"),
      },
    ],
    rest: "48 à 72 h",
    safety:
      "Garder le bassin stable et éviter de cambrer excessivement le bas du dos.",
  },

  adductors: {
    title: "Adducteurs / Inner Thighs",
    scientific: "Adductor longus, brevis, magnus",
    description:
      "Muscles situés à l’intérieur des cuisses, visibles à l’avant et importants pour la stabilité des jambes.",
    functions: [
      "Adduction de la hanche",
      "Stabilisation du bassin",
      "Contrôle des jambes",
    ],
    exercises: [
      {
        name: "Adductors",
        image: require("../assets/images/exercices/adductors.gif"),
      },
    ],
    rest: "48 h",
    safety:
      "Garder un mouvement contrôlé et éviter de fermer les jambes brusquement.",
  },

  trapezius: {
    title: "Trapèzes",
    scientific: "Trapezius",
    description:
      "Muscles du haut du dos et du cou, responsables de la stabilité et du mouvement des épaules.",
    functions: [
      "Élévation des épaules",
      "Stabilité scapulaire",
      "Rétraction scapulaire",
    ],
    exercises: [
      {
        name: "Shrugs",
        image: require("../assets/images/exercices/shrugs.gif"),
      },
    ],
    rest: "48 h",
    safety:
      "Éviter de rouler les épaules et contrôler la montée/descente.",
  },

  traps: {
    title: "Trapèzes",
    scientific: "Trapezius",
    description:
      "Muscles du haut du dos et du cou, responsables de la stabilité et du mouvement des épaules.",
    functions: [
      "Élévation des épaules",
      "Stabilité scapulaire",
      "Rétraction scapulaire",
    ],
    exercises: [
      {
        name: "Shrugs",
        image: require("../assets/images/exercices/shrugs.gif"),
      },
    ],
    rest: "48 h",
    safety:
      "Éviter de rouler les épaules et contrôler la montée/descente.",
  },
};

function normalizeSlug(slug: string): string {
  if (slug === "traps") return "trapezius";
  return slug;
}

function createEmptyWorkoutExercise(): WorkoutExercise {
  return {
    id: `${Date.now()}-${Math.random()}`,
    name: "",
    sets: "",
    reps: "",
    weight: "",
  };
}

export default function MusculationScreen() {
  const [viewSide, setViewSide] = useState<SideView>("front");
  const [selectedPart, setSelectedPart] = useState<ExtendedBodyPart | null>(null);

  const [sheetVisible, setSheetVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<SheetTab>("infos");

  const [workoutModalVisible, setWorkoutModalVisible] = useState(false);
  const [workoutTab, setWorkoutTab] = useState<WorkoutTab>("create");
  const [workoutTitle, setWorkoutTitle] = useState("");
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([
    createEmptyWorkoutExercise(),
  ]);
  const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkout[]>([]);
  const [selectedSavedWorkout, setSelectedSavedWorkout] =
    useState<SavedWorkout | null>(null);

  const hasLoadedWorkouts = useRef(false);

  const sheetTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const workoutTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const workoutBackdropOpacity = useRef(new Animated.Value(0)).current;

  const selectedSlug = selectedPart?.slug ? normalizeSlug(selectedPart.slug) : null;
  const selectedInfo = selectedSlug
    ? MUSCLE_INFO[selectedSlug as keyof typeof MUSCLE_INFO]
    : null;

  const highlightedData = useMemo(() => {
    const base: ExtendedBodyPart[] = [];
    if (selectedPart) {
      base.push(selectedPart);
    }
    return base;
  }, [selectedPart]);

  useEffect(() => {
    const loadSavedWorkouts = async () => {
      try {
        const stored = await AsyncStorage.getItem(WORKOUTS_STORAGE_KEY);
        if (stored) {
          const parsed: SavedWorkout[] = JSON.parse(stored);
          setSavedWorkouts(parsed);
          if (parsed.length > 0) {
            setSelectedSavedWorkout(parsed[0]);
          }
        }
      } catch (error) {
        console.log("Erreur chargement workouts:", error);
      } finally {
        hasLoadedWorkouts.current = true;
      }
    };

    loadSavedWorkouts();
  }, []);

  useEffect(() => {
    const persistWorkouts = async () => {
      if (!hasLoadedWorkouts.current) return;
      try {
        await AsyncStorage.setItem(
          WORKOUTS_STORAGE_KEY,
          JSON.stringify(savedWorkouts)
        );
      } catch (error) {
        console.log("Erreur sauvegarde workouts:", error);
      }
    };

    persistWorkouts();
  }, [savedWorkouts]);

  const openSheet = (part: ExtendedBodyPart) => {
    setSelectedPart(part);
    setActiveTab("infos");
    setSheetVisible(true);

    backdropOpacity.setValue(0);
    sheetTranslateY.setValue(SCREEN_HEIGHT);

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(sheetTranslateY, {
        toValue: 0,
        friction: 9,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeSheet = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSheetVisible(false);
    });
  };

  const openWorkoutModal = () => {
    setWorkoutModalVisible(true);
    workoutBackdropOpacity.setValue(0);
    workoutTranslateY.setValue(SCREEN_HEIGHT);

    Animated.parallel([
      Animated.timing(workoutBackdropOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(workoutTranslateY, {
        toValue: 0,
        friction: 9,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeWorkoutModal = () => {
    Animated.parallel([
      Animated.timing(workoutBackdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(workoutTranslateY, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setWorkoutModalVisible(false);
    });
  };

  const addWorkoutExercise = () => {
    setWorkoutExercises((prev) => [...prev, createEmptyWorkoutExercise()]);
  };

  const removeWorkoutExercise = (id: string) => {
    setWorkoutExercises((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      return filtered.length > 0 ? filtered : [createEmptyWorkoutExercise()];
    });
  };

  const updateWorkoutExercise = (
    id: string,
    field: keyof Omit<WorkoutExercise, "id">,
    value: string
  ) => {
    setWorkoutExercises((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const saveWorkout = () => {
    const cleanedTitle = workoutTitle.trim();
    const cleanedExercises = workoutExercises.filter(
      (item) =>
        item.name.trim() !== "" ||
        item.sets.trim() !== "" ||
        item.reps.trim() !== "" ||
        item.weight.trim() !== ""
    );

    if (!cleanedTitle || cleanedExercises.length === 0) {
      return;
    }

    const newWorkout: SavedWorkout = {
      id: `${Date.now()}-${Math.random()}`,
      title: cleanedTitle,
      exercises: cleanedExercises,
    };

    setSavedWorkouts((prev) => [newWorkout, ...prev]);
    setSelectedSavedWorkout(newWorkout);
    setWorkoutTab("saved");
    setWorkoutTitle("");
    setWorkoutExercises([createEmptyWorkoutExercise()]);
  };

  const deleteSavedWorkout = (workoutId: string) => {
    setSavedWorkouts((prev) => {
      const updated = prev.filter((item) => item.id !== workoutId);

      if (selectedSavedWorkout?.id === workoutId) {
        setSelectedSavedWorkout(updated.length > 0 ? updated[0] : null);
      }

      return updated;
    });
  };

  const renderRightDeleteAction = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    workoutId: string
  ) => {
    const translateX = dragX.interpolate({
      inputRange: [-120, 0],
      outputRange: [0, 40],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        style={[
          styles.deleteAction,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <Pressable
          style={styles.deleteActionPressable}
          onPress={() => deleteSavedWorkout(workoutId)}
        >
          <Ionicons name="trash-outline" size={22} color="white" />
          <Text style={styles.deleteActionText}>Delete</Text>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Musculation</Text>

          <View style={styles.switchRow}>
            <Pressable
              style={[
                styles.switchBtn,
                viewSide === "front" && styles.switchBtnActive,
              ]}
              onPress={() => setViewSide("front")}
            >
              <Text
                style={[
                  styles.switchText,
                  viewSide === "front" && styles.switchTextActive,
                ]}
              >
                Vue avant
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.switchBtn,
                viewSide === "back" && styles.switchBtnActive,
              ]}
              onPress={() => setViewSide("back")}
            >
              <Text
                style={[
                  styles.switchText,
                  viewSide === "back" && styles.switchTextActive,
                ]}
              >
                Vue arrière
              </Text>
            </Pressable>
          </View>

          <View style={styles.generatorButtonRow}>
            <Pressable style={styles.generatorBtn} onPress={openWorkoutModal}>
              <Ionicons name="barbell-outline" size={20} color="white" />
              <Text style={styles.generatorBtnText}>Workout Generator</Text>
            </Pressable>
          </View>

          <View style={styles.bodyCard}>
            <Body
              data={highlightedData}
              onBodyPartPress={(bodyPart, side) => {
                openSheet({
                  slug: bodyPart.slug,
                  intensity: 2,
                  side,
                });
              }}
              gender="male"
              side={viewSide}
              scale={1.72}
              border="#2f2f2f"
              defaultFill="#efb6d4"
              defaultStroke="#2f2f2f"
              defaultStrokeWidth={1}
            />
          </View>
        </ScrollView>

        <Modal visible={sheetVisible} transparent animationType="none">
          <View style={styles.modalRoot}>
            <Animated.View
              style={[
                styles.backdrop,
                {
                  opacity: backdropOpacity,
                },
              ]}
            >
              <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />
            </Animated.View>

            <Animated.View
              style={[
                styles.sheet,
                {
                  transform: [{ translateY: sheetTranslateY }],
                },
              ]}
            >
              <View style={styles.handle} />

              <View style={styles.sheetHeader}>
                <View>
                  <Text style={styles.sheetTitle}>
                    {selectedInfo?.title ?? "Muscle"}
                  </Text>
                  <Text style={styles.sheetSubtitle}>
                    {selectedInfo?.scientific ?? ""}
                  </Text>
                </View>

                <Pressable style={styles.closeBtn} onPress={closeSheet}>
                  <Text style={styles.closeBtnText}>Fermer</Text>
                </Pressable>
              </View>

              <ScrollView
                contentContainerStyle={styles.sheetContent}
                showsVerticalScrollIndicator={false}
              >
                {activeTab === "infos" ? (
                  selectedInfo ? (
                    <>
                      <View style={styles.infoBlock}>
                        <Text style={styles.blockTitle}>Description</Text>
                        <Text style={styles.blockText}>
                          {selectedInfo.description}
                        </Text>
                      </View>

                      <View style={styles.infoBlock}>
                        <Text style={styles.blockTitle}>Fonctions</Text>
                        {selectedInfo.functions.map((fn, index) => (
                          <Text key={`${fn}-${index}`} style={styles.bulletText}>
                            • {fn}
                          </Text>
                        ))}
                      </View>

                      <View style={styles.rowCards}>
                        <View style={styles.smallInfoCard}>
                          <Text style={styles.smallInfoLabel}>Repos</Text>
                          <Text style={styles.smallInfoValue}>
                            {selectedInfo.rest}
                          </Text>
                        </View>

                        <View style={styles.smallInfoCard}>
                          <Text style={styles.smallInfoLabel}>Sécurité</Text>
                          <Text style={styles.smallInfoValue}>
                            {selectedInfo.safety}
                          </Text>
                        </View>
                      </View>
                    </>
                  ) : (
                    <Text style={styles.emptyText}>Aucune information.</Text>
                  )
                ) : selectedInfo ? (
                  selectedInfo.exercises.length > 0 ? (
                    <View style={styles.exerciseGrid}>
                      {selectedInfo.exercises.map((exercise, index) => (
                        <View
                          key={`${exercise.name}-${index}`}
                          style={styles.exerciseCard}
                        >
                          {exercise.image ? (
                            <Image
                              source={exercise.image}
                              style={styles.exerciseImage}
                            />
                          ) : null}
                          <Text style={styles.exerciseName}>{exercise.name}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.emptyText}>
                      Aucun visuel ajouté pour le moment.
                    </Text>
                  )
                ) : (
                  <Text style={styles.emptyText}>Aucun exercice disponible.</Text>
                )}
              </ScrollView>

              <View style={styles.bottomTabs}>
                <Pressable
                  style={[
                    styles.bottomTabBtn,
                    activeTab === "infos" && styles.bottomTabBtnActive,
                  ]}
                  onPress={() => setActiveTab("infos")}
                >
                  <Text
                    style={[
                      styles.bottomTabText,
                      activeTab === "infos" && styles.bottomTabTextActive,
                    ]}
                  >
                    Infos
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.bottomTabBtn,
                    activeTab === "exercices" && styles.bottomTabBtnActive,
                  ]}
                  onPress={() => setActiveTab("exercices")}
                >
                  <Text
                    style={[
                      styles.bottomTabText,
                      activeTab === "exercices" && styles.bottomTabTextActive,
                    ]}
                  >
                    Exercices
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          </View>
        </Modal>

        <Modal visible={workoutModalVisible} transparent animationType="none">
          <View style={styles.modalRoot}>
            <Animated.View
              style={[
                styles.backdrop,
                {
                  opacity: workoutBackdropOpacity,
                },
              ]}
            >
              <Pressable
                style={StyleSheet.absoluteFill}
                onPress={closeWorkoutModal}
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.workoutSheet,
                {
                  transform: [{ translateY: workoutTranslateY }],
                },
              ]}
            >
              <View style={styles.handle} />

              <View style={styles.sheetHeader}>
                <View>
                  <Text style={styles.sheetTitle}>Workout Generator</Text>
                  <Text style={styles.sheetSubtitle}>
                    Crée et sauvegarde tes workouts
                  </Text>
                </View>

                <Pressable style={styles.closeBtn} onPress={closeWorkoutModal}>
                  <Text style={styles.closeBtnText}>Fermer</Text>
                </Pressable>
              </View>

              <ScrollView
                contentContainerStyle={styles.sheetContent}
                showsVerticalScrollIndicator={false}
              >
                {workoutTab === "create" ? (
                  <>
                    <View style={styles.infoBlock}>
                      <Text style={styles.blockTitle}>Nommer workout</Text>
                      <TextInput
                        value={workoutTitle}
                        onChangeText={setWorkoutTitle}
                        placeholder="Ex: Leg Day"
                        style={styles.input}
                        placeholderTextColor="#999"
                      />
                    </View>

                    <View style={styles.createHeaderRow}>
                      <Text style={styles.blockTitle}>Exercices</Text>

                      <Pressable
                        style={styles.addExerciseBtn}
                        onPress={addWorkoutExercise}
                      >
                        <Ionicons name="add" size={18} color="white" />
                        <Text style={styles.addExerciseText}>Add exercise</Text>
                      </Pressable>
                    </View>

                    {workoutExercises.map((exercise) => (
                      <View key={exercise.id} style={styles.workoutExerciseCard}>
                        <View style={styles.exerciseHeaderRow}>
                          <Text style={styles.smallInfoLabel}>Exercice</Text>
                          <Pressable
                            onPress={() => removeWorkoutExercise(exercise.id)}
                            style={styles.trashBtn}
                          >
                            <Ionicons
                              name="trash-outline"
                              size={18}
                              color="#d9534f"
                            />
                          </Pressable>
                        </View>

                        <TextInput
                          value={exercise.name}
                          onChangeText={(value) =>
                            updateWorkoutExercise(exercise.id, "name", value)
                          }
                          placeholder="Nom de l'exercice"
                          style={styles.input}
                          placeholderTextColor="#999"
                        />

                        <View style={styles.rowInputs}>
                          <TextInput
                            value={exercise.sets}
                            onChangeText={(value) =>
                              updateWorkoutExercise(exercise.id, "sets", value)
                            }
                            placeholder="Sets"
                            style={[styles.input, styles.smallInput]}
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                          />

                          <TextInput
                            value={exercise.reps}
                            onChangeText={(value) =>
                              updateWorkoutExercise(exercise.id, "reps", value)
                            }
                            placeholder="Reps"
                            style={[styles.input, styles.smallInput]}
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                          />

                          <TextInput
                            value={exercise.weight}
                            onChangeText={(value) =>
                              updateWorkoutExercise(exercise.id, "weight", value)
                            }
                            placeholder="Poids"
                            style={[styles.input, styles.smallInput]}
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                          />
                        </View>
                      </View>
                    ))}

                    <Pressable style={styles.saveWorkoutBtn} onPress={saveWorkout}>
                      <Ionicons name="save-outline" size={18} color="white" />
                      <Text style={styles.saveWorkoutText}>
                        Sauvegarder workout
                      </Text>
                    </Pressable>
                  </>
                ) : (
                  <>
                    {savedWorkouts.length === 0 ? (
                      <Text style={styles.emptyText}>
                        Aucun workout sauvegardé pour le moment.
                      </Text>
                    ) : (
                      <>
                        <View style={styles.savedWorkoutList}>
                          {savedWorkouts.map((workout) => (
                            <Swipeable
                              key={workout.id}
                              overshootRight={false}
                              renderRightActions={(progress, dragX) =>
                                renderRightDeleteAction(progress, dragX, workout.id)
                              }
                            >
                              <Pressable
                                style={[
                                  styles.savedWorkoutCard,
                                  selectedSavedWorkout?.id === workout.id &&
                                    styles.savedWorkoutCardActive,
                                ]}
                                onPress={() => setSelectedSavedWorkout(workout)}
                              >
                                <View>
                                  <Text style={styles.savedWorkoutTitle}>
                                    {workout.title}
                                  </Text>
                                  <Text style={styles.savedWorkoutMeta}>
                                    {workout.exercises.length} exercice
                                    {workout.exercises.length > 1 ? "s" : ""}
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

                        {selectedSavedWorkout ? (
                          <View style={styles.infoBlock}>
                            <Text style={styles.blockTitle}>
                              {selectedSavedWorkout.title}
                            </Text>

                            {selectedSavedWorkout.exercises.map((item) => (
                              <View
                                key={item.id}
                                style={styles.savedExerciseRow}
                              >
                                <Text style={styles.savedExerciseName}>
                                  {item.name || "Exercice sans nom"}
                                </Text>
                                <Text style={styles.savedExerciseMeta}>
                                  Sets: {item.sets || "-"} | Reps: {item.reps || "-"}{" "}
                                  | Poids: {item.weight || "-"}
                                </Text>
                              </View>
                            ))}
                          </View>
                        ) : null}
                      </>
                    )}
                  </>
                )}
              </ScrollView>

              <View style={styles.bottomTabs}>
                <Pressable
                  style={[
                    styles.bottomTabBtn,
                    workoutTab === "create" && styles.bottomTabBtnActive,
                  ]}
                  onPress={() => setWorkoutTab("create")}
                >
                  <Text
                    style={[
                      styles.bottomTabText,
                      workoutTab === "create" && styles.bottomTabTextActive,
                    ]}
                  >
                    Créer
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.bottomTabBtn,
                    workoutTab === "saved" && styles.bottomTabBtnActive,
                  ]}
                  onPress={() => setWorkoutTab("saved")}
                >
                  <Text
                    style={[
                      styles.bottomTabText,
                      workoutTab === "saved" && styles.bottomTabTextActive,
                    ]}
                  >
                    Mes workouts
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
  screen: {
    flex: 1,
    backgroundColor: "#e8c0d7",
  },
  container: {
    padding: 16,
    paddingBottom: 28,
    gap: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 10,
  },

  switchRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  switchBtn: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d7d7d7",
    minWidth: 135,
    alignItems: "center",
  },
  switchBtnActive: {
    backgroundColor: "#efb6d4",
    borderColor: "#efb6d4",
  },
  switchText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  switchTextActive: {
    color: "white",
  },

  generatorButtonRow: {
    alignItems: "center",
  },
  generatorBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#222",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  generatorBtnText: {
    color: "white",
    fontWeight: "800",
    fontSize: 15,
  },

  bodyCard: {
    backgroundColor: "white",
    borderRadius: 22,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    minHeight: 560,
  },

  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)",
  },

  sheet: {
    height: SCREEN_HEIGHT * 0.72,
    backgroundColor: "#fff",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    overflow: "hidden",
  },
  workoutSheet: {
    height: SCREEN_HEIGHT * 0.84,
    backgroundColor: "#fff",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    overflow: "hidden",
  },

  handle: {
    width: 54,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#d4d4d4",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 8,
  },

  sheetHeader: {
    paddingHorizontal: 18,
    paddingBottom: 10,
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sheetTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111",
  },
  sheetSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  closeBtn: {
    backgroundColor: "#f6f6f6",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },

  sheetContent: {
    padding: 18,
    paddingBottom: 110,
    gap: 14,
  },

  infoBlock: {
    backgroundColor: "#fafafa",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ededed",
  },
  blockTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
    color: "#111",
  },
  blockText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  bulletText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    marginBottom: 4,
  },

  rowCards: {
    flexDirection: "row",
    gap: 12,
  },
  smallInfoCard: {
    flex: 1,
    backgroundColor: "#fafafa",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ededed",
  },
  smallInfoLabel: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 8,
    color: "#111",
  },
  smallInfoValue: {
    fontSize: 15,
    lineHeight: 22,
    color: "#333",
  },

  exerciseGrid: {
    gap: 14,
  },
  exerciseCard: {
    backgroundColor: "#fafafa",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ececec",
  },
  exerciseImage: {
    width: "100%",
    height: 190,
    resizeMode: "cover",
    backgroundColor: "#f2f2f2",
  },
  exerciseName: {
    padding: 12,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    color: "#222",
  },

  createHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addExerciseBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#efb6d4",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  addExerciseText: {
    color: "white",
    fontWeight: "800",
    fontSize: 14,
  },
  workoutExerciseCard: {
    backgroundColor: "#fafafa",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ededed",
    gap: 10,
  },
  exerciseHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  trashBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: "#fff5f5",
  },
  input: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e4e4e4",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#222",
  },
  rowInputs: {
    flexDirection: "row",
    gap: 10,
  },
  smallInput: {
    flex: 1,
  },
  saveWorkoutBtn: {
    marginTop: 4,
    backgroundColor: "#222",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  saveWorkoutText: {
    color: "white",
    fontWeight: "800",
    fontSize: 15,
  },

  savedWorkoutList: {
    gap: 10,
  },
  savedWorkoutCard: {
    backgroundColor: "#fafafa",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ededed",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  savedWorkoutCardActive: {
    borderColor: "#efb6d4",
    backgroundColor: "#fff8fc",
  },
  savedWorkoutTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111",
  },
  savedWorkoutMeta: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  savedExerciseRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ededed",
  },
  savedExerciseName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111",
    marginBottom: 4,
  },
  savedExerciseMeta: {
    fontSize: 14,
    color: "#555",
  },

  deleteAction: {
    justifyContent: "center",
    alignItems: "flex-end",
    marginBottom: 10,
  },
  deleteActionPressable: {
    width: 100,
    height: "100%",
    minHeight: 78,
    backgroundColor: "#d9534f",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  deleteActionText: {
    color: "white",
    fontWeight: "800",
    fontSize: 13,
  },

  emptyText: {
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
  },

  bottomTabs: {
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
  bottomTabBtn: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  bottomTabBtnActive: {
    backgroundColor: "#efb6d4",
  },
  bottomTabText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#333",
  },
  bottomTabTextActive: {
    color: "white",
  },
});