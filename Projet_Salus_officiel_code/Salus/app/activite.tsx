import Couleurs from "@/constantes/couleurs";
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
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState, useRef } from "react";
import {
  ajouterActivite,
  initDatabase,
  recupererToutesActivites,
  supprimerToutesActivites,
  supprimerActivite
} from "@/data/dataAPP";
import { DateTimeSpinner } from "react-native-date-time-spinner";
import { LinearGradient } from "expo-linear-gradient";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { SafeAreaView } from "react-native-safe-area-context";

const ECRAN_HAUTEUR = Dimensions.get("window").height;

export default function Activite() {
  const [db, setDb] = useState<any>(null);
  const [nomActivite, setNomActivite] = useState("");
  const [date, setDate] = useState(new Date());
  const [nbHeuresDuree, setNbHeuresDuree] = useState(0);
  const [nbMinutesDuree, setNbMinutesDuree] = useState(0);
  const [visibiliteAjout, isVisibiliteAjout] =  useState(false);
  const [activiteListe, setActiviteListe] = useState< any[] >([]);

  const panneauTranslationY = useRef(
    new Animated.Value(ECRAN_HAUTEUR)
  ).current;

  const diminuerOppaciteFond = useRef(
    new Animated.Value(0)
  ).current;

  // OUVERTURE DE LA BASE DE DONNÉES
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

  // Ajout d'une activité
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

  // Affichage des activités enregistrées
  const afficher = async () => {
    if (!db) return;

    const toutes =
      await recupererToutesActivites(db);

    setActiviteListe(toutes);
  };

  // Supprimer toutes les activités
  const supprimer = async () => {
    if (!db) return;

    await supprimerToutesActivites(db);

    setActiviteListe([]);
  };

  // Supprimer une seule activité
  const supprimerUneActivite = async (
    nom: string,
    date: string
  ) => {
    if (!db) return;

    await supprimerActivite(db, nom, date);

    afficher();
  };

  // aide de l'IA pour les animations permettant d’ouvrir et fermer le panneau des activités (effet de fondu et glissement vers le haut)
  const ouvrirPanneau = () => {
    isVisibiliteAjout(true);

    diminuerOppaciteFond.setValue(0);

    panneauTranslationY.setValue(ECRAN_HAUTEUR);

    Animated.parallel([
      Animated.timing(diminuerOppaciteFond, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),

      Animated.spring(panneauTranslationY, {
        toValue: 0,
        friction: 9,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const fermerPanneau = () => {
    Animated.parallel([
      Animated.timing(diminuerOppaciteFond, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),

      Animated.timing(panneauTranslationY, {
        toValue: ECRAN_HAUTEUR,
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
    <View style={styles.conteneur}>

      {/* TITRE DE LA PAGE */}
      <View style={styles.entete}>
        <Text style={styles.titre}>
          ACTIVITÉS
        </Text>

        <View style={styles.separateur} />
      </View>

      {/* BLOC AFFICHANT LES ACTIVITÉS ENREGISTRÉES */}
      <View style={styles.blocActivites}>
        <Text style={styles.titreBlocActivites}>
          Activités à venir
        </Text>

        {activiteListe.length === 0 ? (
          <Text style={styles.texteVide}>
            Aucune activité prévue pour le moment
          </Text>
        ) : (

          <ScrollView
            style={styles.scrollViewStyle}
            showsVerticalScrollIndicator={false}
          >
            {/* affichage des activités */}
            {activiteListe.map((item, index) => (
              <View
                key={index}
                style={styles.blocActivite}
              >
                
                {/* rangée avec nom et bouton supprimer */}
                <View style={styles.enteteActivite}>
                  <Text style={styles.activiteNom}>
                    {item.nom}
                  </Text>

                  {/* suppression d'une seule activité */}
                  <Pressable
                    onPress={() =>
                      supprimerUneActivite(
                        item.nom,
                        item.date
                      )
                    }
                  >
                    <Ionicons
                      name="trash-outline"
                      size={22}
                      color="#d9534f"
                    />
                  </Pressable>
                </View>

                {/* date et heure */}
                <Text style={styles.activiteDate}>
                  {format(
                    new Date(item.date),
                    "EEEE d MMMM yyyy • HH:mm",
                    { locale: fr }
                  )}
                </Text>

                {/* durée */}
                <Text style={styles.activiteDuree}>
                  {item.tempsActivite} minutes
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      <Pressable
        style={styles.boutonGestion}
        onPress={ouvrirPanneau}
      >
        <Text style={styles.texteBoutonGestion}>
          Gérer les activités
        </Text>
      </Pressable>

      {/* FENÊTRE MODALE POUR AJOUTER UNE ACTIVITÉ (aide de l'IA pour cette section) */}
      <Modal
        visible={visibiliteAjout}
        transparent
        animationType="none"
      >
        <View style={styles.conteneurModale}>

          <Animated.View
            style={[
              styles.fondAssombri,
              {
                opacity: diminuerOppaciteFond,
              },
            ]}
          >
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={fermerPanneau}
            />
          </Animated.View>

          {/* panneau animé qui glisse vers le haut */}
          <Animated.View
            style={[
              styles.panneau,
              {
                transform: [
                  {
                    translateY: panneauTranslationY,
                  },
                ],
              },
            ]}
          >
            
           {/* MENU DE GESTION */}
            <View
              style={styles.conteneurMenuGestion}
            >
              {/* en-tête du menu */}
              <View style={styles.enteteMenuGestion}>
                <Text style={styles.titreMenuGestion}>
                  Gestion des activités
                </Text>

                {/* bouton pour fermer le menu */}
                <Pressable
                  style={styles.boutonFermer}
                  onPress={fermerPanneau}
                >
                  <Text
                    style={styles.texteBoutonFermer}
                  >
                    Fermer
                  </Text>
                </Pressable>
              </View>

              {/* champ pour le nom de l'activité */}
              <View style={styles.conteneurEntree}>
                <Text style={styles.titreChamp}>
                  Nom de l'activité
                </Text>

                <TextInput
                  style={styles.champTexte}
                  placeholder="Ex: Jogging"
                  placeholderTextColor="#888"
                  onChangeText={setNomActivite}
                />
              </View>

              {/* SÉLECTION DE LA DATE ET DE L'HEURE DE DÉBUT */}
              <View style={styles.conteneurSpinner}>
                <Text style={styles.titreChamp}>
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

              {/* CHOIX DE LA DURÉE */}
              <View style={styles.dureeBox}>
                <Text style={styles.titreChamp}>
                  Durée
                </Text>

                <View
                  style={styles.conteneurSelectionDuree}
                >
                  {/* nombre d'heures */}
                  <TextInput
                    keyboardType="numeric"
                    style={styles.champDuree}
                    placeholder="1"
                    textAlign="center"
                    onChangeText={(duree) =>
                      setNbHeuresDuree(
                        Number(duree)
                      )
                    }
                  />

                  <Text style={styles.texteDuree}>
                    heure(s)
                  </Text>

                  {/* nombre de minutes */}
                  <TextInput
                    keyboardType="numeric"
                    style={styles.champDuree}
                    placeholder="30"
                    textAlign="center"
                    onChangeText={(duree) =>
                      setNbMinutesDuree(
                        Number(duree)
                      )
                    }
                  />

                  <Text style={styles.texteDuree}>
                    minute(s)
                  </Text>
                </View>
              </View>

              {/* BOUTONS D'ACTION */}
              <View
                style={styles.conteneurBoutons}
              >
                {/* ajoute une activité */}
                <Pressable
                  style={styles.boutonAjouter}
                  onPress={() => {
                    ajouter();
                    fermerPanneau();
                  }}
                >
                  <Text
                    style={styles.texteBoutonAjouter}
                  >
                    Ajouter
                  </Text>
                </Pressable>

                {/* supprime toutes les activités */}
                <Pressable
                  style={styles.boutonEffacer}
                  onPress={() => {
                    supprimer();
                    fermerPanneau();
                  }}
                >
                  <Text
                    style={styles.texteBoutonEffacer}
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

  blocActivites: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },

  titreBlocActivites: {
    fontSize: 22,
    fontWeight: "700",
    color: Couleurs.darkText,
    marginBottom: 15,
  },

  texteVide: {
    color: "#666",
    fontSize: 16,
  },

  scrollViewStyle: {
    maxHeight: 420,
  },

  blocActivite: {
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

  activiteNom: {
    fontSize: 19,
    fontWeight: "700",
    color: Couleurs.darkText,
    marginBottom: 5,
  },

  activiteDate: {
    fontSize: 15,
    color: "#444",
    textTransform: "capitalize",
  },

  activiteDuree: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },

  boutonGestion: {
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

  texteBoutonGestion: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },

  conteneurModale: {
    flex: 1,
    justifyContent: "flex-end",
  },

  fondAssombri: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
 
  panneau: {
    height: ECRAN_HAUTEUR * 0.78,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    padding: 20,
  },

  conteneurMenuGestion: {
    flex: 1,
    gap: 18,
  },

  enteteMenuGestion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  titreMenuGestion: {
    fontSize: 24,
    fontWeight: "700",
    color: Couleurs.darkText,
  },

  boutonFermer: {
    backgroundColor: "#eee",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },

  texteBoutonFermer: {
    fontSize: 14,
    color: Couleurs.darkText,
    fontWeight: "600",
  },

  conteneurEntree: {
    backgroundColor: "#f6f6f6",
    borderRadius: 18,
    padding: 15,
  },

  conteneurSpinner: {
  backgroundColor: "#f6f6f6",
  borderRadius: 18,
  paddingVertical: 8,
  paddingHorizontal: 10,
  height: 180,
  overflow: "hidden",
  justifyContent: "center",
  },

  dureeBox: {
    backgroundColor: "#f6f6f6",
    borderRadius: 18,
    padding: 15,
  },

  titreChamp: {
    fontSize: 18,
    fontWeight: "600",
    color: Couleurs.darkText,
    marginBottom: 10,
  },

  champTexte: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    color: Couleurs.darkText,
  },

  champDuree: {
    backgroundColor: "white",
    borderRadius: 12,
    width: 70,
    height: 50,
    fontSize: 18,
    borderWidth: 1,
    borderColor: "#ddd",
    color: Couleurs.darkText,
  },

  conteneurSelectionDuree: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flexWrap: "wrap",
  },

  texteDuree: {
    fontSize: 16,
    color: Couleurs.darkText,
  },

  conteneurBoutons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 10,
  },

  boutonAjouter: {
    flex: 1,
    backgroundColor: Couleurs.primary,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },

  texteBoutonAjouter: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },

  boutonEffacer: {
    flex: 1,
    backgroundColor: "#d9534f",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },

  texteBoutonEffacer: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },

  enteteActivite: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},
});
