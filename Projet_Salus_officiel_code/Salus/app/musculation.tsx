import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  Image,
} from "react-native";
import Body, { ExtendedBodyPart } from "react-native-body-highlighter";

type SideView = "front" | "back";

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
    description: "Région supérieure du dos, impliquée dans la stabilité scapulaire et le tirage.",
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

const FRONT_BUTTONS = [
  { slug: "chest", label: "Pectoraux" },
  { slug: "deltoids", label: "Épaules" },
  { slug: "biceps", label: "Biceps" },
  { slug: "forearm", label: "Avant-bras" },
  { slug: "abs", label: "Abdos" },
  { slug: "obliques", label: "Obliques" },
  { slug: "quadriceps", label: "Quadriceps" },
  { slug: "adductors", label: "Intérieur des cuisses" },
  { slug: "calves", label: "Mollets" },
] as const;

const BACK_BUTTONS = [
  { slug: "deltoids", label: "Épaules (arrière)" },
  { slug: "triceps", label: "Triceps" },
  { slug: "forearm", label: "Avant-bras" },
  { slug: "trapezius", label: "Trapèzes" },
  { slug: "upper-back", label: "Haut du dos" },
  { slug: "lower-back", label: "Bas du dos" },
  { slug: "gluteal", label: "Fessiers" },
  { slug: "hamstring", label: "Ischio-jambiers" },
  { slug: "adductors", label: "Intérieur des cuisses" },
  { slug: "calves", label: "Mollets" },
] as const;

export default function MusculationScreen() {
  const [viewSide, setViewSide] = useState<SideView>("front");
  const [selectedPart, setSelectedPart] = useState<ExtendedBodyPart | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const selectedSlug = selectedPart?.slug;
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

  const visibleButtons = viewSide === "front" ? FRONT_BUTTONS : BACK_BUTTONS;

  useEffect(() => {
    if (selectedPart) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.95);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 70,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [selectedPart, fadeAnim, scaleAnim]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Musculation 💪</Text>

      <View style={styles.switchRow}>
        <Pressable
          style={[
            styles.switchBtn,
            viewSide === "front" && styles.switchBtnActive,
          ]}
          onPress={() => {
            setViewSide("front");
            setSelectedPart(null);
          }}
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
          onPress={() => {
            setViewSide("back");
            setSelectedPart(null);
          }}
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

      <Animated.View
        style={[styles.bodyCard, { transform: [{ scale: scaleAnim }] }]}
      >
        <Body
          data={highlightedData}
          onBodyPartPress={(bodyPart, side) => {
            setSelectedPart({
              slug: bodyPart.slug,
              intensity: 2,
              side,
            });
          }}
          gender="male"
          side={viewSide}
          scale={1.65}
          border="#2f2f2f"
          defaultFill="#f3f3f3"
          defaultStroke="#2f2f2f"
          defaultStrokeWidth={1}
        />
      </Animated.View>

      <View style={styles.buttonsWrap}>
        {visibleButtons.map((item) => (
          <Pressable
            key={item.slug}
            style={[
              styles.muscleBtn,
              selectedPart?.slug === item.slug && styles.muscleBtnActive,
            ]}
            onPress={() =>
              setSelectedPart({
                slug: item.slug,
                intensity: 2,
              })
            }
          >
            <Text
              style={[
                styles.muscleBtnText,
                selectedPart?.slug === item.slug && styles.muscleBtnTextActive,
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Animated.View
        style={[
          styles.infoCard,
          {
            opacity: selectedPart ? fadeAnim : 1,
            transform: [{ scale: selectedPart ? scaleAnim : 1 }],
          },
        ]}
      >
        {selectedInfo ? (
          <>
            <Text style={styles.infoTitle}>{selectedInfo.title}</Text>

            <Text style={styles.infoText}>
              <Text style={styles.bold}>Nom scientifique : </Text>
              {selectedInfo.scientific}
            </Text>

            <Text style={styles.infoText}>
              <Text style={styles.bold}>Description : </Text>
              {selectedInfo.description}
            </Text>

            <Text style={styles.infoText}>
              <Text style={styles.bold}>Fonctions : </Text>
              {selectedInfo.functions.join(", ")}
            </Text>

            <Text style={styles.infoText}>
              <Text style={styles.bold}>Repos recommandé : </Text>
              {selectedInfo.rest}
            </Text>

            <Text style={styles.infoText}>
              <Text style={styles.bold}>Conseil de sécurité : </Text>
              {selectedInfo.safety}
            </Text>

            <Text style={[styles.infoText, styles.exerciseTitle]}>
              Exercices recommandés
            </Text>

            {selectedInfo.exercises.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.exerciseRow}
              >
                {selectedInfo.exercises.map((exercise, index) => (
                  <View key={`${exercise.name}-${index}`} style={styles.exerciseCard}>
                    {exercise.image ? (
                      <Image source={exercise.image} style={styles.exerciseImage} />
                    ) : null}
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.noExerciseText}>
                Aucun visuel ajouté pour le moment.
              </Text>
            )}
          </>
        ) : (
          <Text style={styles.infoTitle}>Clique sur un muscle</Text>
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 28,
    gap: 14,
    backgroundColor: "#e8c0d7",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 10,
  },

  switchRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },
  switchBtn: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d7d7d7",
  },
  switchBtnActive: {
    backgroundColor: "#efb6d4",
    borderColor: "#efb6d4",
  },
  switchText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  switchTextActive: {
    color: "white",
  },

  bodyCard: {
    backgroundColor: "white",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  buttonsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  muscleBtn: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  muscleBtnActive: {
    backgroundColor: "#efb6d4",
    borderColor: "#efb6d4",
  },
  muscleBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  muscleBtnTextActive: {
    color: "white",
  },

  infoCard: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 15,
    lineHeight: 22,
  },
  bold: {
    fontWeight: "700",
  },

  exerciseTitle: {
    marginTop: 8,
    fontWeight: "800",
    fontSize: 17,
  },
  exerciseRow: {
    paddingTop: 6,
    paddingBottom: 4,
    gap: 12,
  },
  exerciseCard: {
    width: 185,
    backgroundColor: "#fafafa",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ececec",
  },
  exerciseImage: {
    width: "100%",
    height: 140,
    resizeMode: "cover",
    backgroundColor: "#f2f2f2",
  },
  exerciseName: {
    padding: 10,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  noExerciseText: {
    fontSize: 15,
    fontStyle: "italic",
    color: "#666",
    marginTop: 4,
  },
});