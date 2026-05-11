import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  ScrollView,
  Dimensions,
  Animated,
} from "react-native";

import { useEffect, useState, useRef } from "react";

import Couleurs from "@/constantes/couleurs";

import {
  ajouterActivite,
  initDatabase,
  recupererToutesActivites,
  supprimerToutesActivites,
} from "@/data/dataAPP";

import { DateTimeSpinner } from "react-native-date-time-spinner";

import { LinearGradient } from "expo-linear-gradient";

import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { SafeAreaView } from "react-native-safe-area-context";

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function Activite() {
  const [db, setDb] = useState<any>(null);

  const [nomActivite, setNomActivite] = useState("");
  const [date, setDate] = useState(new Date());

  const [nbHeuresDuree, setNbHeuresDuree] = useState(0);
  const [nbMinutesDuree, setNbMinutesDuree] = useState(0);

  const [visibiliteAjout, isVisibiliteAjout] =
    useState(false);

  const [activiteListe, setActiviteListe] = useState<
    any[]
  >([]);

  const sheetTranslateY = useRef(
    new Animated.Value(SCREEN_HEIGHT)
  ).current;

  const backdropOpacity = useRef(
    new Animated.Value(0)
  ).current;

  useEffect(() => {
    async function init() {
      const database = await initDatabase();

      setDb(database);

      const toutes =
        await recupererToutesActivites(database);

      setActiviteListe(toutes);
    }

    init();
  }, []);

  const ajouter = async () => {
    if (!db) return;

    await ajouterActivite(
      db,
      nomActivite,
      date.toISOString(),
      nbHeuresDuree * 60 + nbMinutesDuree
    );

    afficher();
  };

  const afficher = async () => {
    if (!db) return;

    const toutes =
      await recupererToutesActivites(db);

    setActiviteListe(toutes);
  };

  const supprimer = async () => {
    if (!db) return;

    await supprimerToutesActivites(db);

    setActiviteListe([]);
  };

  const openSheet = () => {
    isVisibiliteAjout(true);

    backdropOpacity.setValue(0);

    sheetTranslateY.setValue(SCREEN_HEIGHT);

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),

      Animated.spring(sheetTranslateY, {
        toValue: 0,
        friction: 9,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeSheet = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),

      Animated.timing(sheetTranslateY, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      isVisibiliteAjout(false);
    });
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Couleurs.secondary,
      }}
    >
      <View style={styles.container}>

        {/* TITLE */}
        <View style={styles.header}>
          <Text style={styles.titre}>
            ACTIVITÉS
          </Text>

          <View style={styles.separateur} />
        </View>

        {/* CARD */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Activités à venir
          </Text>

          {activiteListe.length === 0 ? (
            <Text style={styles.emptyText}>
              Aucune activité prévue pour le moment
            </Text>
          ) : (
            <ScrollView
              style={styles.scrollViewStyle}
              showsVerticalScrollIndicator={false}
            >
              {activiteListe.map((item, index) => (
                <View
                  key={index}
                  style={styles.activityCard}
                >
                  <Text style={styles.activityName}>
                    {item.nom}
                  </Text>

                  <Text style={styles.activityDate}>
                    {format(
                      new Date(item.date),
                      "EEEE d MMMM yyyy • HH:mm",
                      { locale: fr }
                    )}
                  </Text>

                  <Text style={styles.activityDuration}>
                    {item.tempsActivite} minutes
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* BUTTON */}
        <Pressable
          style={styles.manageButton}
          onPress={openSheet}
        >
          <Text style={styles.manageButtonText}>
            Gérer les activités
          </Text>
        </Pressable>

        {/* MODAL */}
        <Modal
          visible={visibiliteAjout}
          transparent
          animationType="none"
        >
          <View style={styles.modalRoot}>

            <Animated.View
              style={[
                styles.backdrop,
                {
                  opacity: backdropOpacity,
                },
              ]}
            >
              <Pressable
                style={StyleSheet.absoluteFill}
                onPress={closeSheet}
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.sheet,
                {
                  transform: [
                    {
                      translateY: sheetTranslateY,
                    },
                  ],
                },
              ]}
            >
              <View
                style={styles.containerMenuActivite}
              >

                <View style={styles.menuHeader}>
                  <Text style={styles.textMenuActivite}>
                    Gestion des activités
                  </Text>

                  <Pressable
                    style={styles.closeButton}
                    onPress={closeSheet}
                  >
                    <Text
                      style={styles.closeButtonText}
                    >
                      Fermer
                    </Text>
                  </Pressable>
                </View>

                {/* NOM */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>
                    Nom de l'activité
                  </Text>

                  <TextInput
                    style={styles.textInput}
                    placeholder="Ex: Jogging"
                    placeholderTextColor="#888"
                    onChangeText={setNomActivite}
                  />
                </View>

                {/* DATE */}
                <View style={styles.spinnerContainer}>
                  <Text style={styles.label}>
                    Planifier une activité
                  </Text>

                  <DateTimeSpinner
                    mode="datetime"
                    dateTimeOrder={[
                      "date",
                      "hour",
                      "minute",
                    ]}
                    dateTimeSpacing={16}
                    styles={{
                      backgroundColor: "#f6f6f6",
                    }}
              
                    minDate={new Date(2025, 0, 1)}
                    maxDate={new Date(2030, 11, 31)}
                    padHourWithZero
                    padMinuteWithZero
                    LinearGradient={LinearGradient}
                    pickerGradientOverlayProps={{
                      locations: [0, 0.5, 0.5, 1],
                    }}
                    timeSeparator=":"
                    onDateChange={({ date }) =>
                      setDate(date)
                    }
                  />
                </View>

                {/* DURÉE */}
                <View style={styles.durationBox}>
                  <Text style={styles.label}>
                    Durée
                  </Text>

                  <View
                    style={styles.containerSelectionDuree}
                  >
                    <TextInput
                      keyboardType="numeric"
                      style={styles.textInputDuree}
                      placeholder="1"
                      textAlign="center"
                      onChangeText={(duree) =>
                        setNbHeuresDuree(
                          Number(duree)
                        )
                      }
                    />

                    <Text style={styles.durationText}>
                      heure(s)
                    </Text>

                    <TextInput
                      keyboardType="numeric"
                      style={styles.textInputDuree}
                      placeholder="30"
                      textAlign="center"
                      onChangeText={(duree) =>
                        setNbMinutesDuree(
                          Number(duree)
                        )
                      }
                    />

                    <Text style={styles.durationText}>
                      minute(s)
                    </Text>
                  </View>
                </View>

                {/* BUTTONS */}
                <View
                  style={styles.containerBoutonAjouter}
                >
                  <Pressable
                    style={styles.addButton}
                    onPress={() => {
                      ajouter();
                      closeSheet();
                    }}
                  >
                    <Text
                      style={styles.addButtonText}
                    >
                      Ajouter
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => {
                      supprimer();
                      closeSheet();
                    }}
                  >
                    <Text
                      style={styles.deleteButtonText}
                    >
                      Supprimer tout
                    </Text>
                  </Pressable>
                </View>

              </View>
            </Animated.View>

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
    padding: 20,
  },

  header: {
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

  card: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 18,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,

    elevation: 5,
  },

  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Couleurs.darkText,
    marginBottom: 15,
  },

  emptyText: {
    color: "#666",
    fontSize: 16,
  },

  scrollViewStyle: {
    maxHeight: 420,
  },

  activityCard: {
    backgroundColor: Couleurs.primary,
    padding: 14,
    borderRadius: 18,
    marginBottom: 12,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,

    elevation: 4,
  },

  activityName: {
    fontSize: 19,
    fontWeight: "700",
    color: Couleurs.darkText,
    marginBottom: 5,
  },

  activityDate: {
    fontSize: 15,
    color: "#444",
    textTransform: "capitalize",
  },

  activityDuration: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },

  manageButton: {
    marginTop: 20,
    backgroundColor: Couleurs.primary,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 8,

    elevation: 6,
  },

  manageButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },

  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)",
  },

  sheet: {
    height: SCREEN_HEIGHT * 0.78,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    padding: 20,
  },

  containerMenuActivite: {
    flex: 1,
    gap: 18,
  },

  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  textMenuActivite: {
    fontSize: 24,
    fontWeight: "700",
    color: Couleurs.darkText,
  },

  closeButton: {
    backgroundColor: "#eee",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },

  closeButtonText: {
    fontSize: 14,
    color: Couleurs.darkText,
    fontWeight: "600",
  },

  inputContainer: {
    backgroundColor: "#f6f6f6",
    borderRadius: 18,
    padding: 15,
  },

  spinnerContainer: {
  backgroundColor: "#f6f6f6",
  borderRadius: 18,
  paddingVertical: 8,
  paddingHorizontal: 10,
  height: 180,
  overflow: "hidden",
  justifyContent: "center",
  },

  durationBox: {
    backgroundColor: "#f6f6f6",
    borderRadius: 18,
    padding: 15,
  },

  label: {
    fontSize: 18,
    fontWeight: "600",
    color: Couleurs.darkText,
    marginBottom: 10,
  },

  textInput: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    color: Couleurs.darkText,
  },

  textInputDuree: {
    backgroundColor: "white",
    borderRadius: 12,
    width: 70,
    height: 50,
    fontSize: 18,
    borderWidth: 1,
    borderColor: "#ddd",
    color: Couleurs.darkText,
  },

  containerSelectionDuree: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flexWrap: "wrap",
  },

  durationText: {
    fontSize: 16,
    color: Couleurs.darkText,
  },

  containerBoutonAjouter: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 10,
  },

  addButton: {
    flex: 1,
    backgroundColor: Couleurs.primary,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },

  addButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },

  deleteButton: {
    flex: 1,
    backgroundColor: "#d9534f",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },

  deleteButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});
