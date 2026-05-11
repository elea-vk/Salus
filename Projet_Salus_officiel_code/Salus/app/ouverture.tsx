import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import Couleurs from "../constantes/couleurs";
import React, { useEffect } from "react";

import {
  ajouterUtilisateur,
  getUtilisateur,
  initDatabase,
} from "@/data/dataAPP";

export default function Ouverture() {

  const [db, setDb] = React.useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const database = await initDatabase();
      setDb(database);
    };

    init();
  }, []);

  const skipInscription = false;

  const gererSuite = async () => {
    if (!db) return;

    const utilisateur = await getUtilisateur(db, 1);

    if (utilisateur?.id || skipInscription) {
      router.replace("/homePage");
    } else {
      router.replace("/homePage");
    }
  };

  const devUtil = async () => {
    if (!db) return;

    let utilisateur = await getUtilisateur(db, 1);

    if (!utilisateur) {
      await ajouterUtilisateur(
        db,
        "Dev",
        "2000-01-01",
        "Femme"
      );

      utilisateur = await getUtilisateur(db, 1);
    }

    router.replace("/homePage");
  };

  return (
    <View style={styles.container}>

      {/* TOP SPACE */}
      <View style={styles.topSpacing} />

      {/* TITLE */}
      <Text style={styles.titre}>
        ⊱ SALUS ⊰
      </Text>

      <Text style={styles.subtitle}>
        votre espace de bien-être
      </Text>

      {/* BUTTONS */}
      <View style={styles.buttonsContainer}>

        <Pressable
          style={styles.boutonOuverture}
          onPress={() => gererSuite()}
        >
          <Text style={styles.texteBouton}>
            Commencer
          </Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => devUtil()}
        >
          <Text style={styles.secondaryButtonText}>
            Se connecter comme dev
          </Text>
        </Pressable>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: Couleurs.background,
    paddingHorizontal: 28,
    alignItems: "center",
  },

  topSpacing: {
    height: 110,
  },

  titre: {
    fontSize: 52,
    fontWeight: "bold",
    color: Couleurs.darkText,
    letterSpacing: 2,
  },

  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: "#464452",
    marginBottom: 60,
  },

  buttonsContainer: {
    width: "100%",
    gap: 18,
    alignItems: "center",
  },

  boutonOuverture: {
    width: "100%",
    backgroundColor: Couleurs.primary,

    paddingVertical: 18,

    borderRadius: 22,

    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.14,
    shadowRadius: 8,

    elevation: 6,
  },

  texteBouton: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
  },

  secondaryButton: {
    width: "100%",
    backgroundColor: "white",

    paddingVertical: 18,

    borderRadius: 22,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor: "#e7e7e7",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,

    elevation: 4,
  },

  secondaryButtonText: {
    color: Couleurs.darkText,
    fontSize: 17,
    fontWeight: "600",
  },
});