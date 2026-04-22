import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { DateTimeSpinner } from "react-native-date-time-spinner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { LinearGradient } from "expo-linear-gradient";
import * as SQLite from "expo-sqlite";
import { router } from "expo-router"; // idk

import {
  ajouterNuit,
  initDatabase,
  recupererToutesNuits,
  supprimerToutesNuits,
} from "@/data/dataAPP";

import { Sommeil } from "@/src/sommeil";
import Couleurs from "../constantes/couleurs";

type Nuit = {
  date: string;
  heuresSommeil: number;
};

export default function SommeilPage() {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [coucher, setCoucher] = useState(new Date());
  const [lever, setLever] = useState(new Date());
  const [nuitListe, setNuitListe] = useState<Nuit[]>([]);
  const [afficherDonnees, setAfficherDonnees] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const derniereNuit =
  nuitListe.length > 0
    ? [...nuitListe].sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0]
    : null;

  const getSleepMessage = (heures: number) => {
  if (heures < 7) return "Sommeil insuffisant";
  if (heures > 9) return "Excès de sommeil";
  else return "Quantité de sommeil optimale";
};

  useEffect(() => {
  async function init() {
    const database = await initDatabase();
    setDb(database);

    // 👇 LOAD DATA IMMEDIATELY
    const toutes = await recupererToutesNuits(database);
    setNuitListe(toutes);
  }

  init();
}, []);

  const ajouter = async () => {
    if (!db) return;

    const nuit = new Sommeil(lever, coucher, lever);
    const dateUtil = lever.toISOString().split("T")[0];
    const heures = Number(nuit.calculerHeuresSommeil().toFixed(2));

    await ajouterNuit(db, dateUtil, heures);
    await afficher();
  };

  const afficher = async () => {
    if (!db) return;
    const toutes = await recupererToutesNuits(db);
    setNuitListe(toutes);
  };

  const supprimerToutes = async () => {
    if (!db) return;
    await supprimerToutesNuits(db);
    setNuitListe([]);
  };

  // Spinner component
  const PickerBlock = ({
    value,
    setValue,
  }: {
    value: Date;
    setValue: (d: Date) => void;
  }) => (
    <View style={styles.pickerWrapper}>
      <DateTimeSpinner
        mode="datetime"
        dateTimeOrder={["date", "hour", "minute"]}
        dateTimeSpacing={16}
        formatDateLabel={(date) =>
          format(date, "eee, MMM d", { locale: fr })
        }
        initialValue={value}
        minDate={new Date(2020, 0, 1)}
        maxDate={new Date(2030, 11, 31)}
        padHourWithZero
        padMinuteWithZero
        LinearGradient={LinearGradient}
        pickerGradientOverlayProps={{ locations: [0, 0.5, 0.5, 1] }}
        timeSeparator=":"
        onDateChange={({ date }) => setValue(date)}
      />
      <View style={styles.outlineBox} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titre}>Sommeil</Text>

      <View style={styles.card}>
  <Text style={styles.cardTitle}>Dernière nuit</Text>

  {derniereNuit ? (
    <>
      <Text style={styles.cardText}>
        {format(new Date(derniereNuit.date), "eee d MMM", { locale: fr })} — {derniereNuit.heuresSommeil} h
      </Text>

      <Text style={styles.cardMessage}>
        {getSleepMessage(derniereNuit.heuresSommeil)}
      </Text>
    </>
  ) : (
    <Text style={styles.cardText}>
      Aucune nuit enregistrée pour le moment
    </Text>
  )}
</View>

      {/* ADD BUTTON */}
      <TouchableOpacity
        style={styles.addMainButton}
        onPress={() => setShowModal(true)}
      >
        <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>
          Ajouter une nuit
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
  style={styles.btnGraphique}
  onPress={() => router.push("/sommeilGraphique")}
>
  <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>Voir l’évolution</Text>
</TouchableOpacity>

      {/* HISTORIQUE */}
      <View style={{ marginTop: 10, width: "100%" }}>
        <TouchableOpacity
          onPress={() => {
            setAfficherDonnees(!afficherDonnees);
            afficher();
          }}
          style={styles.toggleHeader}
        >
          <Text style={styles.historiqueTitre}>Historique</Text>
          <Text style={styles.arrow}>{afficherDonnees ? "▲" : "▼"}</Text>
        </TouchableOpacity>

        {afficherDonnees && (
          <View style={{ marginTop: 10 }}>
            {nuitListe.length === 0 && (
              <Text style={{ color: "#666" }}>
                Aucune entrée pour le moment.
              </Text>
            )}

            {nuitListe.map((item, index) => (
              <View key={index} style={styles.historiqueItem}>
                <Text style={styles.historiqueTexte}>
                  {item.date} — {item.heuresSommeil} h
                </Text>
              </View>
            ))}

            <TouchableOpacity
              onPress={supprimerToutes}
              style={styles.deleteButton}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>
                Supprimer toutes les entrées
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* MODAL */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.titre}>Nouvelle nuit</Text>

            <Text style={styles.label}>Heure du coucher :</Text>
            <Text style={styles.selected}>
              {format(coucher, "eee d MMM yyyy - HH:mm", { locale: fr })}
            </Text>
            <PickerBlock value={coucher} setValue={setCoucher} />

            <Text style={styles.label}>Heure du réveil :</Text>
            <Text style={styles.selected}>
              {format(lever, "eee d MMM yyyy - HH:mm", { locale: fr })}
            </Text>
            <PickerBlock value={lever} setValue={setLever} />

            <View style={{ flexDirection: "row", gap: 10, marginTop: 15 }}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowModal(false)}
              >
                <Text>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.addBtn}
                onPress={async () => {
                  await ajouter();
                  setShowModal(false);
                }}
              >
                <Text style={{ color: "white" }}>Ajouter</Text>
              </TouchableOpacity>
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
    padding: 20,
    backgroundColor: Couleurs.background,
  },

  titre: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: Couleurs.darkText,
  },

  addMainButton: {
    backgroundColor: Couleurs.primary,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },

  btnGraphique: {
    backgroundColor: Couleurs.primary,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },

  label: {
    fontSize: 18,
    marginTop: 15,
    color: "#444",
  },

  selected: {
    fontSize: 14,
    marginBottom: 5,
    color: "#666",
  },

  pickerWrapper: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    height: 160,
    width: 290,
    overflow: "hidden",
    borderRadius: 20,
    backgroundColor: "#fff",
  },

  outlineBox: {
    borderColor: "#1F5E73",
    borderRadius: 12,
    borderWidth: 3,
    height: 40,
    position: "absolute",
    width: 280,
  },

  toggleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  historiqueTitre: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },

  arrow: {
    fontSize: 22,
  },

  historiqueItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },

  historiqueTexte: {
    fontSize: 16,
    color: "#444",
  },

  deleteButton: {
    marginTop: 15,
    backgroundColor: "#d9534f",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  modalBox: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    width: "90%",
  },

  cancelBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#ddd",
    alignItems: "center",
  },

  addBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: Couleurs.primary,
    alignItems: "center",
  },

  card: {
  backgroundColor: "white",
  padding: 15,
  borderRadius: 16,
  marginBottom: 15,
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: 10,
  elevation: 4,
},

cardTitle: {
  fontSize: 18,
  fontWeight: "bold",
  marginBottom: 5,
  color: "#333",
},

cardText: {
  fontSize: 16,
  color: "#555",
},

cardMessage: {
  marginTop: 8,
  fontSize: 16,
  fontWeight: "600",
  color: "#791d31",
},
});