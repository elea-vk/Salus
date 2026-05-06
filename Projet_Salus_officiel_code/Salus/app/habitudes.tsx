import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  TextInput,
  StyleSheet,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../composantes/entete";
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

  // TOGGLE = SAVE COMPLETION TODAY
  const toggleHabit = async (contenu: string) => {
    if (!db) return;

    const today = new Date().toISOString().split("T")[0];

    await ajouterHabitudeFaite(db, today, contenu);
    loadData();
  };

  // CHECK IF DONE TODAY
  const isDoneToday = (contenu: string) => {
    const today = new Date().toISOString().split("T")[0];

    return habitudesFaites.some(
      (h) => h.contenu === contenu && h.dateFaite === today
    );
  };

  // STREAK CALCULATION
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
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Habitudes" />

      <View style={styles.container}>

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
          <Text>{showList ? "▲" : "▼"}</Text>
        </Pressable>

        {/* LIST */}
        {showList && (
          <View>
            {habits.map((item, index) => (
              <View key={index} style={styles.historiqueItem}>
                <Text>{item.contenu}</Text>

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

            <Pressable style={styles.deleteButton} onPress={deleteAll}>
              <Text style={{ color: "white" }}>
                Supprimer toutes les habitudes
              </Text>
            </Pressable>

            <Pressable
              style={styles.addMainButton}
              onPress={() => setShowModal(true)}
            >
              <Text style={{ color: "white" }}>
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

                <Pressable style={styles.addBtn} onPress={addHabit}>
                  <Text style={{ color: "white" }}>Ajouter</Text>
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
    padding: 20,
    backgroundColor: Couleurs.background,
  },

  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 16,
    marginBottom: 15,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },

  cardText: {
    color: "#666",
  },

  habitRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Couleurs.primary,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },

  square: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 4,
  },

  habitText: {
    flex: 1,
    marginLeft: 10,
  },

  streak: {
    fontSize: 14,
  },

  toggleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  historiqueTitre: {
    fontSize: 20,
    fontWeight: "bold",
  },

  historiqueItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },

  deleteButton: {
    backgroundColor: "#f05752",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },

  addMainButton: {
    backgroundColor: "#84c284",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },

  modalBox: {
    backgroundColor: "white",
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    padding: 8,
    marginBottom: 10,
    borderRadius: 8,
  },

  cancelBtn: {
    flex: 1,
    padding: 10,
    backgroundColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
  },

  addBtn: {
    flex: 1,
    padding: 10,
    backgroundColor: Couleurs.primary,
    borderRadius: 8,
    alignItems: "center",
  },
});