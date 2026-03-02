import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import Couleurs from "../constantes/couleurs";

type Muscle =
  // FACE (gauche)
  | "Pectoraux"
  | "Épaules (face)"
  | "Biceps (bras gauche)"
  | "Biceps (bras droit)"
  | "Abdos"
  | "Quadriceps"
  | "Mollets (face)"
  // DOS (droite)
  | "Épaules (dos)"
  | "Triceps"
  | "Dos"
  | "Fessiers"
  | "Ischio-jambiers"
  | "Mollets (dos)";

type ZoneDef = {
  key: Muscle;
  x: number; // 0..1 (par rapport à l'image)
  y: number;
  w: number;
  h: number;
};

// Décalage léger vers la droite (comme tu avais demandé)
const SHIFT_X = 0.03;

// ✅ Zones en % sur l’IMAGE
const ZONES: ZoneDef[] = [
  // =========================
  // FACE (silhouette gauche)
  // =========================
  { key: "Épaules (face)", x: 0.10, y: 0.16, w: 0.28, h: 0.09 },
  { key: "Pectoraux", x: 0.14, y: 0.22, w: 0.20, h: 0.09 },

  { key: "Biceps (bras gauche)", x: 0.03, y: 0.24, w: 0.12, h: 0.20 },
  { key: "Biceps (bras droit)", x: 0.33, y: 0.24, w: 0.12, h: 0.20 },

  { key: "Abdos", x: 0.16, y: 0.30, w: 0.16, h: 0.18 },
  { key: "Quadriceps", x: 0.14, y: 0.50, w: 0.20, h: 0.22 },
  { key: "Mollets (face)", x: 0.16, y: 0.74, w: 0.16, h: 0.17 },

  // =========================
  // DOS (silhouette droite)
  // =========================
  // Épaules dos (haut de la silhouette droite)
  { key: "Épaules (dos)", x: 0.58, y: 0.17, w: 0.26, h: 0.10 },

  // Dos (grand dorsal / haut du dos)
  { key: "Dos", x: 0.60, y: 0.24, w: 0.22, h: 0.22 },

  // Triceps (bras, côté silhouette droite)
  { key: "Triceps", x: 0.82, y: 0.26, w: 0.10, h: 0.20 },

  // Fessiers
  { key: "Fessiers", x: 0.64, y: 0.48, w: 0.16, h: 0.12 },

  // Ischio-jambiers (arrière cuisses)
  { key: "Ischio-jambiers", x: 0.63, y: 0.60, w: 0.18, h: 0.18 },

  // Mollets dos
  { key: "Mollets (dos)", x: 0.66, y: 0.78, w: 0.14, h: 0.16 },
];

// Si ton image est carrée, ça marche (sinon mets les vraies dimensions)
const IMG_W = 1024;
const IMG_H = 1024;

export default function MusculationScreen() {
  const [muscle, setMuscle] = useState<Muscle | null>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  const fitted = useMemo(() => {
    if (box.w === 0 || box.h === 0) return { x: 0, y: 0, w: 0, h: 0 };

    const scale = Math.min(box.w / IMG_W, box.h / IMG_H);
    const w = IMG_W * scale;
    const h = IMG_H * scale;
    const x = (box.w - w) / 2;
    const y = (box.h - h) / 2;

    return { x, y, w, h };
  }, [box.w, box.h]);

  return (
    <View style={styles.container}>
<<<<<<< HEAD
      <Text style={styles.header}>Musculation 💪</Text>
=======
      <Text style={styles.title}>Musculation</Text>
>>>>>>> 2df7c22189a4d40b0b0dc796f5675247e1d839dd

      <View
        style={styles.canvas}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setBox({ w: width, h: height });
        }}
      >
        <Image
          source={require("../assets/images/corps_muscles.png")}
          style={styles.image}
          resizeMode="contain"
        />

        {ZONES.map((z) => {
          const left = fitted.x + (z.x + SHIFT_X) * fitted.w;
          const top = fitted.y + z.y * fitted.h;
          const width = z.w * fitted.w;
          const height = z.h * fitted.h;

          return (
            <Pressable
              key={z.key}
              onPress={() => setMuscle(z.key)}
              style={[
                styles.zone,
                { left, top, width, height },
                muscle === z.key && styles.zoneSelected,
              ]}
            />
          );
        })}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          {muscle ? `Muscle sélectionné : ${muscle}` : "Sélectionner un muscle"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  container: { flex: 1, backgroundColor: "#e8c0d7", padding: 16, gap: 12 },
  header: { fontSize: 28, fontWeight: "800", textAlign: "center", marginTop: 10 },
=======
  container: {
    flex: 1,
    backgroundColor: Couleurs.background,
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 12,
  },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 10 },
>>>>>>> 2df7c22189a4d40b0b0dc796f5675247e1d839dd

  canvas: {
    width: "100%",
    height: 520,
    backgroundColor: "white",
    borderRadius: 18,
    position: "relative",
    overflow: "hidden",
  },
  image: { width: "100%", height: "100%" },

  // Debug ON
  zone: {
    position: "absolute",
    borderRadius: 16,
    backgroundColor: "rgba(0,255,0,0.18)",
  },
  // sélection
  zoneSelected: {
    backgroundColor: "rgba(255,0,0,0.22)",
  },

  infoCard: { backgroundColor: "white", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14 },
  infoText: { fontSize: 18, fontWeight: "700" },
});