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
    description: "Muscle principal de l’épaule.",
    functions: ["Abduction", "Flexion", "Extension de l’épaule"],
    exercises: [],
    rest: "48 h",
    safety: "Éviter l’élan et garder le mouvement contrôlé.",
  },

  biceps: {
    title: "Biceps",
    scientific: "Biceps brachii",
    description: "Muscle à l’avant du bras.",
    functions: ["Flexion du coude", "Supination"],
    exercises: [],
    rest: "48 h",
    safety: "Ne pas balancer le tronc.",
  },

  triceps: {
    title: "Triceps",
    scientific: "Triceps brachii",
    description: "Muscle à l’arrière du bras.",
    functions: ["Extension du coude"],
    exercises: [],
    rest: "48 h",
    safety: "Garder les coudes stables.",
  },

  forearm: {
    title: "Avant-bras",
    scientific: "Musculi antebrachii",
    description: "Groupe musculaire de l’avant-bras.",
    functions: ["Prise", "Flexion/extension du poignet"],
    exercises: [],
    rest: "24 à 48 h",
    safety: "Ne pas surcharger les poignets.",
  },

  abs: {
    title: "Abdos",
    scientific: "Rectus abdominis",
    description: "Muscles de la paroi abdominale avant.",
    functions: ["Flexion du tronc", "Stabilisation"],
    exercises: [],
    rest: "24 à 48 h",
    safety: "Éviter de tirer sur le cou.",
  },

  obliques: {
    title: "Obliques",
    scientific: "Obliquus externus et internus abdominis",
    description: "Muscles latéraux de l’abdomen.",
    functions: ["Rotation du tronc", "Inclinaison latérale"],
    exercises: [],
    rest: "24 à 48 h",
    safety: "Contrôler les rotations.",
  },

  quadriceps: {
    title: "Quadriceps",
    scientific: "Quadriceps femoris",
    description: "Muscles à l’avant de la cuisse.",
    functions: ["Extension du genou"],
    exercises: [],
    rest: "48 à 72 h",
    safety: "Aligner genoux et pieds.",
  },

  calves: {
    title: "Mollets",
    scientific: "Gastrocnemius et soleus",
    description: "Muscles de la jambe.",
    functions: ["Flexion plantaire"],
    exercises: [],
    rest: "24 à 48 h",
    safety: "Faire une amplitude complète sans rebond.",
  },

  "upper-back": {
    title: "Haut du dos",
    scientific: "Trapezius / upper back",
    description: "Partie supérieure du dos.",
    functions: ["Stabilité scapulaire", "Extension et rétraction"],
    exercises: [],
    rest: "48 à 72 h",
    safety: "Garder la colonne neutre.",
  },

  "lower-back": {
    title: "Bas du dos",
    scientific: "Erector spinae / lower back",
    description: "Région lombaire et muscles érecteurs.",
    functions: ["Extension du tronc", "Stabilisation"],
    exercises: [],
    rest: "48 à 72 h",
    safety: "Protéger le bas du dos et éviter l’hyperextension.",
  },

  hamstring: {
    title: "Ischio-jambiers",
    scientific: "Hamstrings",
    description: "Muscles à l’arrière de la cuisse.",
    functions: ["Flexion du genou", "Extension de hanche"],
    exercises: [],
    rest: "48 à 72 h",
    safety: "Contrôler la descente et protéger le bas du dos.",
  },

  gluteal: {
    title: "Fessiers",
    scientific: "Gluteus maximus / medius",
    description: "Muscles de la région glutéale.",
    functions: ["Extension de hanche", "Stabilisation du bassin"],
    exercises: [],
    rest: "48 à 72 h",
    safety: "Ne pas cambrer excessivement le bas du dos.",
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
  { slug: "calves", label: "Mollets" },
] as const;

const BACK_BUTTONS = [
  { slug: "deltoids", label: "Épaules (arrière)" },
  { slug: "triceps", label: "Triceps" },
  { slug: "forearm", label: "Avant-bras" },
  { slug: "upper-back", label: "Haut du dos" },
  { slug: "lower-back", label: "Bas du dos" },
  { slug: "gluteal", label: "Fessiers" },
  { slug: "hamstring", label: "Ischio-jambiers" },
  { slug: "calves", label: "Mollets" },
] as const;

export default function MusculationScreen() {
  const [viewSide, setViewSide] = useState<SideView>("front");
  const [selectedPart, setSelectedPart] = useState<ExtendedBodyPart | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const selectedInfo = selectedPart
    ? MUSCLE_INFO[selectedPart.slug as keyof typeof MUSCLE_INFO]
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