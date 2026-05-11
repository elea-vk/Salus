import React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";

import Couleurs from "../constantes/couleurs";

export default function Index() {
  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>⊱ SALUS ⊰</Text>

        <View style={styles.diviseur} />
      </View>

      {/* CATEGORIES */}
      <View style={styles.categoriesContainer}>

        {/* SECTION FITNESS */}
        <View style={styles.categoryColumn}>

          <Text style={styles.categoryTitle}>
            FITNESS
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.fitnessCard,
              {
                transform: [{ scale: pressed ? 0.96 : 1 }],
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            onPress={() => router.push("/musculation")}
          >
            <Ionicons
              name="barbell-outline"
              size={38}
              color={Couleurs.primary}
            />

            <Text style={styles.fitnessText}>
              Musculation
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.fitnessCard,
              {
                transform: [{ scale: pressed ? 0.96 : 1 }],
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            onPress={() => router.push("/alimentation")}
          >
            <Ionicons
              name="restaurant-outline"
              size={38}
              color={Couleurs.primary}
            />

            <Text style={styles.fitnessText}>
              Alimentation
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.fitnessCard,
              {
                transform: [{ scale: pressed ? 0.96 : 1 }],
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            onPress={() => router.push("/poid")}
          >
            <Ionicons
              name="scale-outline"
              size={38}
              color={Couleurs.primary}
            />

            <Text style={styles.fitnessText}>
              Poids
            </Text>
          </Pressable>

        </View>

        {/* SECTION BIEN-ÊTRE */}
        <View style={styles.categoryColumn}>

          <Text style={styles.categoryTitle}>
            BIEN-ÊTRE
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.card,
              {
                transform: [{ scale: pressed ? 0.96 : 1 }],
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            onPress={() => router.push("/activite")}
          >
            <Ionicons
              name="calendar-outline"
              size={38}
              color={Couleurs.secondary}
            />

            <Text style={styles.cardText}>
              Activités
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.card,
              {
                transform: [{ scale: pressed ? 0.96 : 1 }],
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            onPress={() => router.push("/sommeiltest")}
          >
            <Ionicons
              name="moon-outline"
              size={38}
              color={Couleurs.secondary}
            />

            <Text style={styles.cardText}>
              Sommeil
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.card,
              {
                transform: [{ scale: pressed ? 0.96 : 1 }],
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            onPress={() => router.push("/habitudes")}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={38}
              color={Couleurs.secondary}
            />

            <Text style={styles.cardText}>
              Habitudes
            </Text>
          </Pressable>

        </View>

      </View>

      <View style={styles.diviseur} />

      {/* PROFILE BAR */}
      <Pressable
        style={({ pressed }) => [
          styles.profileBar,
          {
            transform: [{ scale: pressed ? 0.98 : 1 }],
            opacity: pressed ? 0.9 : 1,
          },
        ]}
        onPress={() => router.push("/utilisateur")}
      >
        <Text style={styles.profileText}>
          Gérer le profil
        </Text>

        <Ionicons
          name="person-outline"
          size={28}
          color={Couleurs.darkText}
        />
      </Pressable>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Couleurs.background,
    paddingHorizontal: 20,
    paddingTop: 20,
    justifyContent: "space-between",
  },

  // HEADER
  header: {
    alignItems: "center",
    marginTop: 10,
  },

  title: {
    fontSize: 38,
    fontWeight: "bold",
    color: Couleurs.darkText,
    letterSpacing: 2,
  },

  // CATEGORIES
  categoriesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 10,
  },

  categoryColumn: {
    width: "47%",
    gap: 15,
  },

  categoryTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Couleurs.darkText,
    marginBottom: 5,
    marginLeft: 5,
  },

  diviseur: {
    height: 4,
    backgroundColor: Couleurs.secondary,
    width: "100%",
    borderRadius: 10,
    marginTop: 18,
  },

  // WHITE CARDS
  card: {
    height: 145,
    backgroundColor: "white",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",

    borderWidth: 1.5,
    borderColor: "#ececec",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 10,

    elevation: 12,
  },

  cardText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },

  // FITNESS CARDS
  fitnessCard: {
    height: 145,
    backgroundColor: "#1f1f1f",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#3a3a3a",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 12,

    elevation: 14,
  },

  fitnessText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },

  // PROFILE BAR
  profileBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    backgroundColor: Couleurs.primary,

    paddingVertical: 18,
    paddingHorizontal: 22,

    borderRadius: 24,

    marginBottom: 10,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,

    elevation: 12,
  },

  profileText: {
    fontSize: 17,
    fontWeight: "700",
    color: Couleurs.darkText,
  },
});