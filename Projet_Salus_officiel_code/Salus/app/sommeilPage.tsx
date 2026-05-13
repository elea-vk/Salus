import Couleurs from "../constantes/couleurs";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DateTimeSpinner } from "react-native-date-time-spinner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { LinearGradient } from "expo-linear-gradient";
import * as SQLite from "expo-sqlite";
import { router } from "expo-router";
import {
  ajouterNuit,
  initDatabase,
  recupererToutesNuits,
  supprimerToutesNuits,
  supprimerNuit,
} from "@/data/dataAPP";
import { Sommeil } from "@/src/sommeil";

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
            new Date(b.date).getTime() -
            new Date(a.date).getTime()
        )[0]
      : null;

  // OUVERTURE DE LA BASE DE DONNÉES
  useEffect(() => {
    async function init() {
      const database = await initDatabase();
      setDb(database);

      const toutes = await recupererToutesNuits(database);
      setNuitListe(toutes);
    }

    init();
  }, []);

  // Message en fonction du nombre d'heures de sommeil calculé
  const getMessageSommeil = (heures: number) => {
    if (heures < 7) return "Sommeil insuffisant";
    if (heures > 9) return "Excès de sommeil";
    return "Quantité de sommeil optimale";
  };

  // Ajout d'une nuit de sommeil
  const ajouter = async () => {
    if (!db) return;

    const nuit = new Sommeil(lever, coucher, lever);

    const dateUtil = lever
      .toISOString()
      .split("T")[0];

    const heures = Number(
      nuit.calculerHeuresSommeil().toFixed(2)
    );

    await ajouterNuit(db, dateUtil, heures);
    await afficher();
  };

  // Affichage des nuits enregistrées
  const afficher = async () => {
    if (!db) return;

    const toutes = await recupererToutesNuits(db);
    setNuitListe(toutes);
  };

  // Suppression de toutes les nuits
  const supprimerToutes = async () => {
    if (!db) return;

    await supprimerToutesNuits(db);
    setNuitListe([]);
  };

  // Suppression d'une seule nuit
  const supprimerUneNuit = async (date: string) => {
    if (!db) return;

    await supprimerNuit(db, date);
    afficher();
  };

  // Selecteur de date et temps trouver en ligne
  const PickerBlock = ({
    value,
    setValue,
  }: {
    value: Date;
    setValue: (d: Date) => void;
  }) => (
    <View style={styles.conteneurSpinner}>
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
        pickerGradientOverlayProps={{
          locations: [0, 0.5, 0.5, 1],
        }}
        timeSeparator=":"
        onDateChange={({ date }) => setValue(date)}
      />

      <View style={styles.cadreSelection} />
    </View>
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Couleurs.secondary,
      }}
    >
      <View style={styles.conteneur}>

        {/* TITRE DE LA PAGE */}
        <View style={styles.entete}>
          <Text style={styles.titre}>
            SOMMEIL
          </Text>

          <View style={styles.diviseur} />
        </View>

        {/* BLOC AVEC LES INFOS SUR LA DERNIÈRE NUIT */}
        <View style={styles.blocInfoDerniereNuit}>
          <Text style={styles.titreInfo}>
            Dernière nuit
          </Text>

          {derniereNuit ? (
            <>
              <Text style={styles.texteInfo}>
                {format(
                  new Date(derniereNuit.date),
                  "eee d MMM",
                  { locale: fr }
                )}{" "}
                — {derniereNuit.heuresSommeil} h
              </Text>

              <Text style={styles.texteMessageInfo}>
                {getMessageSommeil(
                  derniereNuit.heuresSommeil
                )}
              </Text>
            </>
          ) : (
            <Text style={styles.texteInfo}>
              Aucune nuit enregistrée pour le moment
            </Text>
          )}
        </View>

        {/* BOUTTONS AJOUT ET ÉVOLUTION */}
        <TouchableOpacity
          style={styles.boutonAjouter}
          onPress={() => setShowModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.texteBoutton}>
            Ajouter une nuit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.boutonGraphique}
          onPress={() =>
            router.push("/sommeilGraphique")
          }
          activeOpacity={0.8}
        >
          <Text style={styles.texteBoutton}>
            Voir l’évolution
          </Text>
        </TouchableOpacity>

        {/* HISTORIQUE */}
        <View style={{ marginTop: 10, width: "100%" }}>
          
          {/* bouton permettant d'afficher ou cacher l'historique */}
          <TouchableOpacity
            onPress={() => {
              setAfficherDonnees(!afficherDonnees);
              afficher();
            }}
            style={styles.enteteHistorique}
            activeOpacity={0.8}
          >
            <Text style={styles.titreHistorique}>
              Historique
            </Text>

            {/* flèche qui change selon l'état d'ouverture*/}
            <Text style={styles.fleche}>
              {afficherDonnees ? "▲" : "▼"} 
            </Text>
          </TouchableOpacity>

          {/* affiche le contenu seulement si l'utilisateur ouvre l'historique */}
          {afficherDonnees && (
            <View style={{ marginTop: 10 }}>

              {nuitListe.length === 0 && (
                <Text style={{ color: "#666" }}>
                  Aucune entrée pour le moment.
                </Text>
              )}

              {/* affichage des nuits enregistrées */}
              {nuitListe.map((item, index) => (
                <View
                  key={index}
                  style={styles.elementHistorique}
                >
                  <Text style={styles.texteHistorique}>
                    {format(
                      new Date(item.date),
                      "d MMM yyyy",
                      { locale: fr }
                    )} — {item.heuresSommeil} h
                  </Text>

                  {/* bouton pour supprimer une seule nuit */}
                  <TouchableOpacity
                    onPress={() =>
                      supprimerUneNuit(item.date)
                    }
                  >
                    <Ionicons
                      name="trash-outline"
                      size={22}
                      color="#d9534f"
                    />
                  </TouchableOpacity>
                </View>
              ))}

              {/* bouton supprimant toutes les entrées */}
              <TouchableOpacity
                onPress={supprimerToutes}
                style={styles.boutonSupprimer}
                activeOpacity={0.8}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "600",
                  }}
                >
                  Supprimer toutes les entrées
                </Text>
              </TouchableOpacity>

            </View>
          )}
        </View>

        {/* FENÊTRE MODALE POUR AJOUTER UNE NUIT (aide de l'IA pour cette section) */}
        <Modal
          visible={showModal}
          animationType="slide"
          transparent
        >
          <View style={styles.conteneurModale}>
            <View style={styles.blocModale}>

              <Text style={styles.titreModale}>
                Nouvelle nuit
              </Text>

              <Text style={styles.titreSelection}>
                Heure du coucher :
              </Text>

              <Text style={styles.texteSelection}>
                {format(
                  coucher,
                  "eee d MMM yyyy - HH:mm",
                  { locale: fr }
                )}
              </Text>

              <PickerBlock
                value={coucher}
                setValue={setCoucher}
              />

              <Text style={styles.titreSelection}>
                Heure du réveil :
              </Text>

              <Text style={styles.texteSelection}>
                {format(
                  lever,
                  "eee d MMM yyyy - HH:mm",
                  { locale: fr }
                )}
              </Text>

              <PickerBlock
                value={lever}
                setValue={setLever}
              />

              <View
                style={{
                  flexDirection: "row",
                  gap: 10,
                  marginTop: 15,
                }}
              >
                <TouchableOpacity
                  style={styles.boutonAnnuler}
                  onPress={() => setShowModal(false)}
                  activeOpacity={0.8}
                >
                  <Text>Annuler</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.boutonConfirmer}
                  activeOpacity={0.8}
                  onPress={async () => {
                    await ajouter();
                    setShowModal(false);
                  }}
                >
                  <Text style={{ color: "white" }}>
                    Ajouter
                  </Text>
                </TouchableOpacity>

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
    padding: 20,
    backgroundColor: Couleurs.background,
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

  diviseur: {
    height: 4,
    backgroundColor: Couleurs.secondary,
    width: "100%",
    borderRadius: 10,
    marginTop: 18,
  },

  boutonAjouter: {
    backgroundColor: Couleurs.primary,
    padding: 14,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },

  boutonGraphique: {
    backgroundColor: Couleurs.primary,
    padding: 14,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },

  texteBoutton: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },

  titreSelection: {
    fontSize: 18,
    marginTop: 15,
    color: "#444",
  },

  texteSelection: {
    fontSize: 14,
    marginBottom: 5,
    color: "#666",
  },

  conteneurSpinner: {
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

  cadreSelection: {
    borderColor: "#1F5E73",
    borderRadius: 12,
    borderWidth: 3,
    height: 40,
    position: "absolute",
    width: 280,
  },

  enteteHistorique: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  titreHistorique: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },

  fleche: {
    fontSize: 22,
  },

  elementHistorique: {
  paddingVertical: 10,
  borderBottomWidth: 1,
  borderColor: "#ddd",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  },

  texteHistorique: {
    fontSize: 16,
    color: "#444",
  },

  boutonSupprimer: {
    marginTop: 15,
    backgroundColor: "#d9534f",
    padding: 12,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
  },

  conteneurModale: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  blocModale: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    width: "90%",
  },

  titreModale: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: Couleurs.darkText,
  },

  boutonAnnuler: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#ddd",
    alignItems: "center",
  },

  boutonConfirmer: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: Couleurs.primary,
    alignItems: "center",
  },

  blocInfoDerniereNuit: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 20,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  titreInfo: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },

  texteInfo: {
    fontSize: 16,
    color: "#555",
  },

  texteMessageInfo: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#791d31",
  },
});