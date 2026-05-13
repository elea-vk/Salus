import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Couleurs from "../constantes/couleurs";
import { Ionicons } from "@expo/vector-icons";
import {
  initDatabase,
  ajouterHabitudes,
  recupererToutesHabitudes,
  supprimerHabitude,
  supprimerToutesHabitudes,
  ajouterHabitudeFaite,
  recupererToutesHabitudesFaites,
  supprimerHabitudeFaite,
} from "@/data/dataAPP";

export default function Habitudes() {
  const [db, setDb] = useState<any>(null);
  const [habitudesListe, setHabitudesListe] = useState<any[]>([]);
  const [habitudesFaitesListe, setHabitudesFaitesListe] = useState<any[]>([]);
  const [visibiliteAjoutHabitude, setVisibiliteAjoutHabitude] = useState(false);
  const [nouvelleHabitude, setNouvelleHabitude] = useState("");
  const [afficherListeHabitudes, setAfficherListeHabitudes] = useState(false);

  // OUVERTURE DE LA BASE DE DONNÉES
  useEffect(() => {
    async function init() {
      const database = await initDatabase();
      setDb(database);
      await afficherDonnees(database);
    }

    init();
  }, []);

  // Afficher les données des habitudes
  const afficherDonnees = async (database = db) => {
    if (!database) return;

    const toutes = await recupererToutesHabitudes(database);
    setHabitudesListe(toutes);

    const faites = await recupererToutesHabitudesFaites(database);
    setHabitudesFaitesListe(faites);
  };

  // Ajouter une habitude
  const ajouterHabitude = async () => {
    if (!nouvelleHabitude.trim() || !db) return;

    const today = new Date().toISOString().split("T")[0];

    await ajouterHabitudes(db, today, nouvelleHabitude);

    setNouvelleHabitude("");
    setVisibiliteAjoutHabitude(false);

    afficherDonnees();
  };

  // Marquer une habitude comme faite ou le contraire
  const toggleHabitude = async (contenu: string) => {
    if (!db) return;

    const today = new Date().toISOString().split("T")[0];

    const dejaFaite = habitudesFaitesListe.some(
      (h) => h.contenu === contenu && h.dateFaite === today
    );

    if (dejaFaite) {
      await supprimerHabitudeFaite(db, today, contenu);
    } else {
      await ajouterHabitudeFaite(db, today, contenu);
    }

    afficherDonnees();
  };

  // Vérifier si une habitude est faite
  const estFaitAujourdhui = (contenu: string) => {
    const today = new Date().toISOString().split("T")[0];

    return habitudesFaitesListe.some(
      (h) => h.contenu === contenu && h.dateFaite === today
    );
  };

  // Calcul du streak (jours consécutifs)
  const calculerStreak = (contenu: string) => {
    const dates = habitudesFaitesListe
      .filter((h) => h.contenu === contenu)
      .map((h) => h.dateFaite)
      .sort()
      .reverse();

    let streak = 0;
    let current = new Date();

    for (let i = 0; i < dates.length; i++) {
      const d = new Date(dates[i]);

      if (
        d.toISOString().split("T")[0] ===
        current.toISOString().split("T")[0]
      ) {
        streak++;
        current.setDate(current.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  // Supprimer une habitude
  const supprimerUneHabitude = async (contenu: string) => {
    if (!db) return;

    await supprimerHabitude(db, contenu);
    afficherDonnees();
  };

  // Supprimer toutes les habitudes
  const supprimerToutesLesHabitudes = async () => {
    if (!db) return;

    await supprimerToutesHabitudes(db);
    afficherDonnees();
  };

  const nombreHabitudesCompleteesAujourdhui = habitudesListe.filter((h) =>
    estFaitAujourdhui(h.contenu)
  ).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Couleurs.secondary }}>
      <View style={styles.conteneur}>

        {/* TITRE DE LA PAGE */}
        <View style={styles.entete}>
          <Text style={styles.titre}>HABITUDES</Text>
          <View style={styles.separateur} />
        </View>

        {/* BLOC QUI INDIQUE COMBIEN D'HABITUDES SONT COMPLÉTÉES */}
        <View style={styles.blocStats}>
          <Text style={styles.titreBlocStats}>
            Habitudes complétées : {nombreHabitudesCompleteesAujourdhui}
          </Text>

          <Text style={styles.dateTexte}>
            {new Date().toLocaleDateString()}
          </Text>
        </View>

        {/* LISTE DES HABITUDES DU JOUR */}
        {habitudesListe.map((item, index) => (
          <View key={index} style={styles.ligneHabitude}>

            <Pressable
              style={[
                styles.caseCheck,
                {
                  backgroundColor: estFaitAujourdhui(item.contenu)
                    ? Couleurs.secondary
                    : "white",
                },
              ]}
              onPress={() => toggleHabitude(item.contenu)}
            />

            <Text style={styles.texteHabitude}>
              {item.contenu}
            </Text>

            <Text style={styles.streak}>
              🔥 {calculerStreak(item.contenu)}
            </Text>

          </View>
        ))}

        {/* HABITUDES ET GESTION */}

        {/* bouton permettant d'afficher ou cacher la liste */}
        <Pressable
          style={styles.enteteListe}
          onPress={() =>
            setAfficherListeHabitudes(!afficherListeHabitudes)
          }
        >
          <Text style={styles.titreListe}>Mes habitudes</Text>

          {/* flèche qui change selon l'état d'ouverture*/}
          <Text style={styles.fleche}>
            {afficherListeHabitudes ? "▲" : "▼"}
          </Text>
        </Pressable>

        {/* LISTE DE GESTION DES HABITUDES */}
        {afficherListeHabitudes && (
          <View style={{ marginTop: 10 }}>

            {habitudesListe.map((item, index) => (
              <View key={index} style={styles.itemListe}>

                <Text style={styles.texteListe}>
                  {item.contenu}
                </Text>
                
                {/* bouton pour en supprimer une*/}
                <Pressable
                  onPress={() =>
                    supprimerUneHabitude(item.contenu)
                  }
                >
                  <Ionicons
                    name="trash-outline"
                    size={22}
                    color="#f05752"
                  />
                </Pressable>

              </View>
            ))}

            <Pressable
              style={styles.boutonSupprimerTout}
              onPress={supprimerToutesLesHabitudes}
            >
              <Text style={styles.texteBouton}>
                Supprimer toutes les habitudes
              </Text>
            </Pressable>

            {/* bouton pour en ajouter une */}
            <Pressable
              style={styles.boutonAjouter}
              onPress={() =>
                setVisibiliteAjoutHabitude(true)
              }
            >
              <Text style={styles.texteBouton}>
                Ajouter une habitude
              </Text>
            </Pressable>
          </View>
        )}

        {/* FENÊTRE MODALE POUR AJOUTER UNE HABITUDE (aide de l'IA pour cette section) */}
        <Modal
          visible={visibiliteAjoutHabitude}
          transparent
          animationType="fade"
        >
          <View style={styles.conteneurModale}>

            <View style={styles.boiteModale}>

              <Text style={styles.titreModale}>
                Nouvelle habitude
              </Text>

              <TextInput
                style={styles.champTexte}
                placeholder="Ex: Lire 10 min"
                value={nouvelleHabitude}
                onChangeText={setNouvelleHabitude}
              />

              <View style={{ flexDirection: "row", gap: 10 }}>

                <Pressable
                  style={styles.boutonAnnuler}
                  onPress={() =>
                    setVisibiliteAjoutHabitude(false)
                  }
                >
                  <Text>Annuler</Text>
                </Pressable>

                <Pressable
                  style={styles.boutonConfirmer}
                  onPress={ajouterHabitude}
                >
                  <Text style={{ color: "white" }}>
                    Ajouter
                  </Text>
                </Pressable>

              </View>

            </View>

          </View>
        </Modal>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
    backgroundColor: Couleurs.background,
    padding: 20,
  },

  entete: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },

  titre: {
    fontSize: 30,
    fontWeight: "bold",
    color: Couleurs.darkText,
    letterSpacing: 2,
  },

  separateur: {
    height: 4,
    backgroundColor: Couleurs.secondary,
    width: "100%",
    borderRadius: 10,
    marginTop: 18,
  },

  blocStats: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 20,
    marginBottom: 18,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },

  titreBlocStats: {
    fontSize: 18,
    fontWeight: "bold",
    color: Couleurs.darkText,
  },

  dateTexte: {
    marginTop: 5,
    color: "#666",
  },

  ligneHabitude: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Couleurs.primary,
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },

  caseCheck: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: Couleurs.darkText,
    borderRadius: 6,
  },

  texteHabitude: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#222",
  },

  streak: {
    fontSize: 15,
    fontWeight: "600",
  },

  enteteListe: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },

  titreListe: {
    fontSize: 22,
    fontWeight: "bold",
    color: Couleurs.darkText,
  },

  fleche: {
    fontSize: 20,
  },

  itemListe: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    backgroundColor: "white",
    padding: 14,
    borderRadius: 14,

    marginBottom: 10,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  texteListe: {
    fontSize: 16,
    color: "#333",
  },

  boutonSupprimerTout: {
    backgroundColor: "#f05752",
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
    elevation: 3,
  },

  boutonAjouter: {
    backgroundColor: "#84c284",
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
    elevation: 3,
  },

  texteBouton: {
    color: "white",
    fontWeight: "600",
  },

  conteneurModale: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  boiteModale: {
    backgroundColor: "white",
    margin: 20,
    padding: 20,
    borderRadius: 20,
  },

  titreModale: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: Couleurs.darkText,
  },

  champTexte: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 15,
    borderRadius: 10,
  },

  boutonAnnuler: {
    flex: 1,
    padding: 12,
    backgroundColor: "#ddd",
    borderRadius: 10,
    alignItems: "center",
  },

  boutonConfirmer: {
    flex: 1,
    padding: 12,
    backgroundColor: Couleurs.primary,
    borderRadius: 10,
    alignItems: "center",
  },
});