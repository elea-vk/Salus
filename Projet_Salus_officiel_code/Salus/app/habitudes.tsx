import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  TextInput,
  StyleSheet,
  Modal,
} from "react-native";
import Couleurs from "../constantes/couleurs";
import { Ionicons } from "@expo/vector-icons";

export default function Habitudes() {
  const [habits, setHabits] = useState<{ id: number; text: string; done: boolean }[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newHabit, setNewHabit] = useState("");

  const addHabit = () => {
    if (!newHabit.trim()) return;
    setHabits([...habits, { id: Date.now(), text: newHabit, done: false }]);
    setNewHabit("");
    setShowModal(false);
  };

const toggleHabit = (id: number) => {
    setHabits(habits.map((h) => (h.id === id ? { ...h, done: !h.done } : h)));
  };

  return (
    <View style={styles.container}>
      {/* Bar du haut */}
      <View style={styles.topBar}>
        <Text style={styles.title}>Habitudes</Text>
        <Pressable onPress={() => setShowModal(true)}>
          <Ionicons name="add-circle-outline" size={30} color={Couleurs.darkText} />
        </Pressable>
      </View>

      {/* Habit list */}
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingTop: 10 }}
        renderItem={({ item }) => (
          <View style={styles.habitRow}>
            <Pressable
              style={[
                styles.square,
                { backgroundColor: item.done ? Couleurs.secondary : "white" },
              ]}
              onPress={() => toggleHabit(item.id)}
            />
            <Text
              style={[
                styles.habitText,
                { textDecorationLine: item.done ? "line-through" : "none" },
              ]}
            >
              {item.text}
            </Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <Text style={{ textAlign: "center", marginTop: 20, color: "#666" }}>
            Aucune habitude pour l'instant — appuie sur + pour en ajouter.
          </Text>
        )}
      />

      {/* Add Habit Modal */}
      <Modal visible={showModal} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Nouvelle habitude</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Méditer 10 minutes"
              value={newHabit}
              onChangeText={setNewHabit}
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelText}>Annuler</Text>
              </Pressable>
              <Pressable style={styles.addBtn} onPress={addHabit}>
                <Text style={styles.addText}>Ajouter</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Couleurs.background,
    padding: 20,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Couleurs.darkText,
  },
  habitRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Couleurs.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  square: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: Couleurs.darkText,
    borderRadius: 4,
    marginRight: 12,
  },
  habitText: {
    fontSize: 18,
    color: "#333",
  },
  // --- modal ---
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "white",
    borderRadius: 10,
    width: "80%",
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#4a004e",
  },
  input: {
    borderWidth: 1,
    borderColor: Couleurs.darkText,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  cancelBtn: {
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    width: "40%",
    alignItems: "center",
  },
  addBtn: {
    backgroundColor: Couleurs.secondary,
    padding: 10,
    borderRadius: 8,
    width: "40%",
    alignItems: "center",
  },
  cancelText: {
    color: "#333",
    fontWeight: "bold",
  },
  addText: {
    color: "white",
    fontWeight: "bold",
  },
});