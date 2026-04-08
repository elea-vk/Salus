import React, { useMemo, useRef, useState } from "react";
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
} from "react-native";
import Body, { ExtendedBodyPart } from "react-native-body-highlighter";
type SideView = "front" | "back";
type SheetTab = "infos" | "exercices";
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
const SCREEN_HEIGHT = Dimensions.get("window").height;
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
export default function MusculationScreen() {
 const [viewSide, setViewSide] = useState<SideView>("front");
 const [selectedPart, setSelectedPart] = useState<ExtendedBodyPart | null>(null);
 const [sheetVisible, setSheetVisible] = useState(false);
 const [activeTab, setActiveTab] = useState<SheetTab>("infos");
 const sheetTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
 const backdropOpacity = useRef(new Animated.Value(0)).current;
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
 return (
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
</View>
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