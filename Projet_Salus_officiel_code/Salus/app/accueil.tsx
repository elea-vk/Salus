import React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import Couleurs from "../constantes/couleurs";

export default function Index() {
  return (
    <SafeAreaView style={styles.conteneur}>

      {/* ENTÊTE */}
      <View style={styles.entete}>
        <Text style={styles.titre}>⊱ SALUS ⊰</Text>

        <View style={styles.diviseur} />
      </View>

      {/* CATÉGORIES */}
      <View style={styles.conteneurCategories}>

        {/* SECTION FITNESS */}
        <View style={styles.colonneCategorie}>

          <Text style={styles.titreCategorie}>
            FITNESS
          </Text>

          {/* bouton page musculation */}
          <Pressable
            style={({ pressed }) => [
              styles.carteFitness,
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

            <Text style={styles.texteFitness}>
              Musculation
            </Text>
          </Pressable>

          {/* bouton page alimentation */}
          <Pressable
            style={({ pressed }) => [
              styles.carteFitness,
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

            <Text style={styles.texteFitness}>
              Alimentation
            </Text>
          </Pressable>

          {/* bouton page poids*/}
          <Pressable
            style={({ pressed }) => [
              styles.carteFitness,
              {
                transform: [{ scale: pressed ? 0.96 : 1 }],
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            onPress={() => router.push("/poids")}
          >
            <Ionicons
              name="scale-outline"
              size={38}
              color={Couleurs.primary}
            />

            <Text style={styles.texteFitness}>
              Poids
            </Text>
          </Pressable>

        </View>

        {/* SECTION BIEN-ÊTRE */}
        <View style={styles.colonneCategorie}>

          <Text style={styles.titreCategorie}>
            BIEN-ÊTRE
          </Text>
          {/* bouton page activités */}
          <Pressable
            style={({ pressed }) => [
              styles.carteBienEtre,
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

            <Text style={styles.texteBienEtre}>
              Activités
            </Text>
          </Pressable>

          {/* bouton page sommeil */}
          <Pressable
            style={({ pressed }) => [
              styles.carteBienEtre,
              {
                transform: [{ scale: pressed ? 0.96 : 1 }],
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            onPress={() => router.push("/sommeilPage")}
          >
            <Ionicons
              name="moon-outline"
              size={38}
              color={Couleurs.secondary}
            />

            <Text style={styles.texteBienEtre}>
              Sommeil
            </Text>
          </Pressable>

          {/* bouton page habitude */}
          <Pressable
            style={({ pressed }) => [
              styles.carteBienEtre,
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

            <Text style={styles.texteBienEtre}>
              Habitudes
            </Text>
          </Pressable>

        </View>

      </View>

      <View style={styles.diviseur} />

      {/* BARRE DE LA SECTION PROFIL */}
      <Pressable
        style={({ pressed }) => [
          styles.barreProfil,
          {
            transform: [{ scale: pressed ? 0.98 : 1 }],
            opacity: pressed ? 0.9 : 1,
          },
        ]}
        onPress={() => router.push("/utilisateur")}
      >
        <Text style={styles.texteProfil}>
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
  conteneur: {
    flex: 1,
    backgroundColor: Couleurs.background,
    paddingHorizontal: 20,
    paddingTop: 20,
    justifyContent: "space-between",
  },

  entete: {
    alignItems: "center",
    marginTop: 10,
  },

  titre: {
    fontSize: 38,
    fontWeight: "bold",
    color: Couleurs.darkText,
    letterSpacing: 2,
  },

  conteneurCategories: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 10,
  },

  colonneCategorie: {
    width: "47%",
    gap: 15,
  },

  titreCategorie: {
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

  carteBienEtre: {
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

  texteBienEtre: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },

  carteFitness: {
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

  texteFitness: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },

  barreProfil: {
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

  texteProfil: {
    fontSize: 17,
    fontWeight: "700",
    color: Couleurs.darkText,
  },
});