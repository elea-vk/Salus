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
  const [habits, setHabits] = useState<any[]>([]);
  const [habitudesFaites, setHabitudesFaites] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newHabit, setNewHabit] = useState("");
  const [showList, setShowList] = useState(false);

  // INIT DB
  useEffect(() => {
    async function init() {
      const database = await initDatabase();
      setDb(database);
      await loadData(database);
    }

    init();
  }, []);

  const loadData = async (database = db) => {
    if (!database) return;

    const toutes = await recupererToutesHabitudes(database);
    setHabits(toutes);

    const faites = await recupererToutesHabitudesFaites(database);
    setHabitudesFaites(faites);
  };

  // ADD HABIT
  const addHabit = async () => {
    if (!newHabit.trim() || !db) return;

    const today = new Date().toISOString().split("T")[0];

    await ajouterHabitudes(db, today, newHabit);

    setNewHabit("");
    setShowModal(false);

    loadData();
  };

  // TOGGLE HABIT
  const toggleHabit = async (contenu: string) => {
    if (!db) return;

    const today = new Date().toISOString().split("T")[0];

    const dejaFaite = habitudesFaites.some(
      (h) => h.contenu === contenu && h.dateFaite === today
    );

    if (dejaFaite) {
      await supprimerHabitudeFaite(db, today, contenu);
    } else {
      await ajouterHabitudeFaite(db, today, contenu);
    }

    loadData();
  };

  // CHECK IF DONE TODAY
  const isDoneToday = (contenu: string) => {
    const today = new Date().toISOString().split("T")[0];

    return habitudesFaites.some(
      (h) => h.contenu === contenu && h.dateFaite === today
    );
  };

  // STREAK
  const getStreak = (contenu: string) => {
    const dates = habitudesFaites
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

  // DELETE ONE
  const deleteHabit = async (contenu: string) => {
    if (!db) return;

    await supprimerHabitude(db, contenu);

    loadData();
  };

  // DELETE ALL
  const deleteAll = async () => {
    if (!db) return;

    await supprimerToutesHabitudes(db);

    loadData();
  };

  const completedToday = habits.filter((h) =>
    isDoneToday(h.contenu)
  ).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Couleurs.secondary,}}>
      <View style={styles.container}>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>HABITUDES</Text>

          <View style={styles.diviseur} />
        </View>

        {/* CARD */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Habitudes complétées : {completedToday}
          </Text>

          <Text style={styles.cardText}>
            {new Date().toLocaleDateString()}
          </Text>
        </View>

        {/* TODAY CHECKLIST */}
        {habits.map((item, index) => (
          <View key={index} style={styles.habitRow}>

            <Pressable
              style={[
                styles.square,
                {
                  backgroundColor: isDoneToday(item.contenu)
                    ? Couleurs.secondary
                    : "white",
                },
              ]}
              onPress={() => toggleHabit(item.contenu)}
            />

            <Text style={styles.habitText}>
              {item.contenu}
            </Text>

            <Text style={styles.streak}>
              🔥 {getStreak(item.contenu)}
            </Text>

          </View>
        ))}

        {/* HEADER */}
        <Pressable
          style={styles.toggleHeader}
          onPress={() => setShowList(!showList)}
        >
          <Text style={styles.historiqueTitre}>
            Mes habitudes
          </Text>

          <Text style={styles.arrow}>
            {showList ? "▲" : "▼"}
          </Text>
        </Pressable>

        {/* LIST */}
        {showList && (
          <View style={{ marginTop: 10 }}>

            {habits.map((item, index) => (
              <View key={index} style={styles.historiqueItem}>

                <Text style={styles.listText}>
                  {item.contenu}
                </Text>

                <Pressable
                  onPress={() => deleteHabit(item.contenu)}
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
              style={styles.deleteButton}
              onPress={deleteAll}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>
                Supprimer toutes les habitudes
              </Text>
            </Pressable>

            <Pressable
              style={styles.addMainButton}
              onPress={() => setShowModal(true)}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>
                Ajouter une habitude
              </Text>
            </Pressable>

          </View>
        )}

        {/* MODAL */}
        <Modal visible={showModal} transparent animationType="fade">

          <View style={styles.modalContainer}>

            <View style={styles.modalBox}>

              <Text style={styles.modalTitle}>
                Nouvelle habitude
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Ex: Lire 10 min"
                value={newHabit}
                onChangeText={setNewHabit}
              />

              <View style={{ flexDirection: "row", gap: 10 }}>

                <Pressable
                  style={styles.cancelBtn}
                  onPress={() => setShowModal(false)}
                >
                  <Text>Annuler</Text>
                </Pressable>

                <Pressable
                  style={styles.addBtn}
                  onPress={addHabit}
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
  container: {
    flex: 1,
    backgroundColor: Couleurs.background,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // HEADER
  header: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: Couleurs.darkText,
    letterSpacing: 2,
  },

  diviseur: {
    height: 4,
    backgroundColor: Couleurs.secondary,
    width: "100%",
    borderRadius: 10,
    marginTop: 18,
  },

  // CARD
  card: {
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

  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Couleurs.darkText,
  },

  cardText: {
    marginTop: 5,
    color: "#666",
  },

  // HABITS
  habitRow: {
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

  square: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: Couleurs.darkText,
    borderRadius: 6,
  },

  habitText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#222",
  },

  streak: {
    fontSize: 15,
    fontWeight: "600",
  },

  // DROPDOWN
  toggleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    marginTop: 20,
  },

  historiqueTitre: {
    fontSize: 22,
    fontWeight: "bold",
    color: Couleurs.darkText,
  },

  arrow: {
    fontSize: 20,
  },

  historiqueItem: {
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

  listText: {
    fontSize: 16,
    color: "#333",
  },

  deleteButton: {
    backgroundColor: "#f05752",

    padding: 12,
    borderRadius: 12,

    marginTop: 10,
    alignItems: "center",

    elevation: 3,
  },

  addMainButton: {
    backgroundColor: "#84c284",

    padding: 12,
    borderRadius: 12,

    marginTop: 10,
    alignItems: "center",

    elevation: 3,
  },

  // MODAL
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  modalBox: {
    backgroundColor: "white",

    margin: 20,
    padding: 20,

    borderRadius: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: Couleurs.darkText,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",

    padding: 12,
    marginBottom: 15,

    borderRadius: 10,
  },

  cancelBtn: {
    flex: 1,

    padding: 12,
    backgroundColor: "#ddd",

    borderRadius: 10,
    alignItems: "center",
  },

  addBtn: {
    flex: 1,

    padding: 12,
    backgroundColor: Couleurs.primary,

    borderRadius: 10,
    alignItems: "center",
  },
});