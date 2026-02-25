import React, { useState } from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";

type Muscle =
  | "Pectoraux"
  | "Épaules"
  | "Biceps"
  | "Abdos"
  | "Quadriceps"
  | "Mollets";

export default function MusculationScreen() {
  const [muscle, setMuscle] = useState<Muscle | null>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Musculation 💪</Text>

      <View style={styles.canvas}>
        <Image
          // ✅ si tu as renommé en corps_muscles.png
          source={require("../assets/images/corps_muscles.png")}

          // ❌ si tu n’as pas renommé (ça peut marcher mais moins recommandé)
          // source={require("../../assets/corps muscles.png")}

          style={styles.image}
          resizeMode="contain"
        />

        {/* Zones cliquables (transparentes) */}
        <Pressable style={[styles.zone, styles.chest]} onPress={() => setMuscle("Pectoraux")} />
        <Pressable style={[styles.zone, styles.shoulders]} onPress={() => setMuscle("Épaules")} />
        <Pressable style={[styles.zone, styles.biceps]} onPress={() => setMuscle("Biceps")} />
        <Pressable style={[styles.zone, styles.abs]} onPress={() => setMuscle("Abdos")} />
        <Pressable style={[styles.zone, styles.quads]} onPress={() => setMuscle("Quadriceps")} />
        <Pressable style={[styles.zone, styles.calves]} onPress={() => setMuscle("Mollets")} />
      </View>

      <View style={styles.info}>
        <Text style={styles.infoText}>
          {muscle ? `Muscle sélectionné : ${muscle}` : "Clique sur un muscle"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e8c0d7",
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 12,
  },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 10 },

  canvas: {
    width: "100%",
    height: 520,
    backgroundColor: "white",
    borderRadius: 12,
    position: "relative",
    overflow: "hidden",
  },
  image: { width: "100%", height: "100%" },

  zone: {
    position: "absolute",
    borderRadius: 10,
     backgroundColor: "rgba(0,255,0,0.25)",

    // ✅ Décommente pour voir les zones (ajuster)
    // backgroundColor: "rgba(0,255,0,0.25)",
  },

  // 🔧 Ajuste ces valeurs si nécessaire
  chest: { top: 110, left: "32%", width: 130, height: 60 },
  shoulders: { top: 95, left: "25%", width: 200, height: 55 },
  biceps: { top: 140, left: "18%", width: 70, height: 90 },
  abs: { top: 175, left: "36%", width: 100, height: 90 },
  quads: { top: 270, left: "34%", width: 120, height: 120 },
  calves: { top: 410, left: "38%", width: 90, height: 90 },

  info: {
    marginTop: 14,
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    width: "100%",
  },
  infoText: { fontSize: 16, fontWeight: "600" },
});