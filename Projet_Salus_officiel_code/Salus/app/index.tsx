import React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

import Couleurs from "../constantes/couleurs";

export default function Index() {
  return (
    <View style={styles.container}>

      {/* --- BAR DU HAUT (date) --- */}
      <View style={styles.dateBar}>
        <Pressable style={styles.arrowBtn}>
          <Ionicons name="caret-back-outline" size={28} color = {Couleurs.secondary} />
        </Pressable>

        <Text style={styles.dateTxt}>₊︵‿  DATE  ‿︵₊</Text>

        <Pressable style={styles.arrowBtn}>
          <Ionicons name="caret-forward-outline" size={28} color={Couleurs.secondary} />
        </Pressable>
      </View>

    <View style={styles.diviseur1} />

      {/* --- MILIEU (pages) --- */}
      <View style={styles.grid}>
        {/* Rangée 1 */}
        <View style={styles.row}>
          <Pressable
            style={styles.pageButton}
            onPress={() => router.push("/stress")}
          >
            <Ionicons name="book-outline" size={41} color={Couleurs.secondary} />
          </Pressable>

          <Pressable
            style={styles.pageButton}
            onPress={() => router.push("/alimentation")}
          >
            <Ionicons name="restaurant-outline" size={41} color={Couleurs.secondary} />
          </Pressable>
        </View>

        {/* Rangée 2 */}
        <View style={styles.row}>
          <Pressable
            style={styles.pageButton}
            onPress={() => router.push("/sommeilPage")}
          >
            <Ionicons name="moon-outline" size={41} color={Couleurs.secondary} />
          </Pressable>

          <Pressable
            style={styles.pageButton}
            onPress={() => router.push("/musculation")}
          >
            <Ionicons name="barbell-outline" size={41} color={Couleurs.secondary} />
          </Pressable>
        </View>

        {/* Rangée 3 */}
        <View style={styles.row}>
          <Pressable
            style={styles.pageButton}
            onPress={() => router.push("/graphique")}
          >
            <Ionicons name="bar-chart-outline" size={41} color={Couleurs.secondary} />
          </Pressable>

          <Pressable
            style={styles.pageButton}
            onPress={() => router.push("/habitudes")}
          >
            <Ionicons name="checkmark-circle-outline" size={41} color={Couleurs.secondary} />
          </Pressable>
        </View>
      </View>

      <View style={styles.diviseur2} />

      {/* --- BAR DU BAS --- */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.bottomButton}>
          <Ionicons name="settings-outline" size={32} color={Couleurs.primary} />
        </Pressable>

        <Pressable style={styles.bottomButton}>
          <Ionicons name="person-outline" size={32} color={Couleurs.primary} />
        </Pressable>

        <Pressable style={styles.bottomButton}>
          <Ionicons name="ribbon-outline" size={32} color={Couleurs.primary} />
        </Pressable>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:Couleurs.background,
    padding: 20,
    justifyContent: "space-between", // space between top, middle, bottom
  },

  // --- HAUT ---
  dateBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
     marginBottom: 0,
  },
  dateTxt: {
    fontSize: 22,
    fontWeight: "bold",
    color: Couleurs.darkText,
  },
  arrowBtn: {
    backgroundColor: Couleurs.background,
    padding: 5,
    borderRadius: 10,
  },

  diviseur1: {
  height: 5,
  backgroundColor: Couleurs.secondary,
  alignSelf: "stretch",
  marginBottom: 20,
},

  // --- MILIEU ---
  grid: {
    justifyContent: "center",
    gap: 18, // espace entre rangées
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 25, // espace entre colonnes
    marginBottom: 10, // closer spacing between buttons
  },
  pageButton: {
    width: 125,
    height: 110,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Couleurs.primary,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },

  diviseur2: {
  height: 5,
  backgroundColor: Couleurs.secondary,
  opacity: 1,
  alignSelf: "stretch",
  marginBottom: 2,
},

  // --- BAS ---
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  bottomButton: {
    backgroundColor: Couleurs.secondary,
    padding: 15,
    borderRadius: 15,
  },
});