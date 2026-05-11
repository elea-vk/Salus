import React, { useEffect, useState,useRef } from "react"
import { View, Text, TextInput, StyleSheet, Pressable } from "react-native"
import { DateTimeSpinner } from "react-native-date-time-spinner"
import { LinearGradient } from "expo-linear-gradient"
import {initDatabase, modifierDateDeNaissance,getUtilisateur,modifierPrenom,getDernierSuivi,ajouterMesure,modifierSexe} from "@/data/dataAPP"
import { Picker } from '@react-native-picker/picker'
import {Utilisateur } from "@/src/utilisateur"
import { ScrollView } from "react-native"
import Couleurs from "@/constantes/couleurs"



export default function PageUtilisateur() {

  //constantes utilisées dans l'affichage graphique :

  const [db, setDb] = useState<any>(null); //la database

  const [utilisateurObj, setUtilisateurObj] = useState<Utilisateur | null>(null);

  const [nom, setNom] = useState("")
  const [taille, setTaille] = useState("")
  const [poids, setPoids] = useState("")
  const [datedeNaissance, setDateDeNaissance] = useState (new Date(2000,0,1))
  const [sexe, setSexe] = useState ("")
  const [niveauActPhys, setNiveauActPhys] = useState ("")

  const [montrerSpinner,setMontrerSpinner] = useState (false)


  const [editerNom, setEditerNom] = useState (false)
  const [editerTaille, setEditerTaille] = useState (false)
  const [editerPoids,setEditerPoids] = useState (false)
  const [editerSexe, setEditerSexe] = useState (false)
  const [editerNiveauActPhys, setEditerActPhys] = useState (false)
  


  const [montrerInfo, setMontrerInfo] = useState(false)
  const [tempDate, setTempDate] = useState(datedeNaissance)
  
  
  


  //ouverture de la database

  useEffect(() => {
    async function init() {
      const database = await initDatabase()
      

      const utilisateur = await getUtilisateur(database,1)
      const suivi = await getDernierSuivi(database,1)


      if (utilisateur) {
        const user = new Utilisateur(utilisateur.prenom,new Date(utilisateur.dateDeNaissance),utilisateur.sexe,utilisateur.id) //création d'un utilisateur à partir des infos de la db
        setUtilisateurObj(user);
        setNom(utilisateur.prenom || "")
        setSexe(utilisateur.sexe || "")
        setDateDeNaissance(new Date(utilisateur.dateDeNaissance))
      }

      if (suivi) {
        setTaille(suivi.taille?.toString() || "")
        setPoids(suivi.poids?.toString() || "")
      }
      setDb(database)
    }
  init();}, 
  []);

//méthode pour sauvegarder les informations actualisées de l'utilisateur

const sauvegarderUtilisateur = async () => {
  if (!db) return;

  try {
    const dateUtil = datedeNaissance instanceof Date && !isNaN(datedeNaissance.getTime())? datedeNaissance.toISOString().split("T")[0]: new Date().toISOString().split("T")[0];

    await Promise.all([
      modifierPrenom(db, 1, nom),
      modifierSexe(db, 1, sexe),
      modifierDateDeNaissance(db, 1, dateUtil),
    ]);

    //console.log("SAVE OK");

    // (optionnel debug)
    /*console.log({
      nom,
      sexe,
      dateUtil,
    });*/

  } catch (e) {
    console.log("SAVE ERROR:", e);
  }
};


  //affichage graphique
    return (
    <View style={{ flex: 1, backgroundColor: Couleurs.background }}>
    <ScrollView contentContainerStyle={styles.container}>
    <View style={{ height: 30, backgroundColor: Couleurs.background }} />
    <Text style={styles.titre}>Profil utilisateur</Text>
    <View style={styles.diviseur} />

    {/* PRÉNOM */}
    <View style={styles.sousboite}>
      <View style={styles.enTete}>
        <Text style={styles.label}>Prénom</Text>
        <Pressable onPress={() => setEditerNom(!editerNom)}>
          <Text style={styles.icone}>⚙️</Text>
        </Pressable>
      </View>

      {editerNom ? (
        <TextInput
          style={styles.input}
          value={nom}
          onChangeText={setNom}
          placeholder="Entrez votre prénom"
        />
      ) : (
        <Text style={styles.valeur}>{nom || "Aucun prénom"}</Text>
      )}
    </View>

    {/* DATE NAISSANCE */}
    <View style={styles.sousboite}>
      <View style={styles.enTete}>
        <Text style={styles.label}>Date de naissance</Text>
        <Pressable onPress={() => setMontrerSpinner(!montrerSpinner)}>
          <Text style={styles.icone}>⚙️</Text>
        </Pressable>
      </View>

      

      <Text style={styles.valeur}>
        {datedeNaissance.toLocaleDateString("fr-FR")}
      </Text>
    </View>

    <Text style={styles.soustitre}>
      Âge : {utilisateurObj ? utilisateurObj.calculAge() : 0} ans
    </Text>

    {/* TAILLE */}
    <View style={styles.sousboite}>
      <View style={styles.enTete}>
        <Text style={styles.label}>Taille</Text>
        <Pressable onPress={() => setEditerTaille(!editerTaille)}>
          <Text style={styles.icone}>⚙️</Text>
        </Pressable>
      </View>

      {editerTaille ? (
        <TextInput
          style={styles.input}
          value={taille}
          onChangeText={setTaille}
          keyboardType="numeric"
        />
      ) : (
        <Text style={styles.valeur}>{taille || "Non renseignée"}</Text>
      )}
    </View>

    {/* POIDS  : pas utilisé au final mais aurait dû être connecté à la database suivi*/}
    <View style={styles.sousboite}>
      <View style={styles.enTete}>
        <Text style={styles.label}>Poids</Text>
        <Pressable onPress={() => setEditerPoids(!editerPoids)}>
          <Text style={styles.icone}>⚙️</Text>
        </Pressable>
      </View>

      {editerPoids ? (
        <TextInput
          style={styles.input}
          value={poids}
          onChangeText={setPoids}
          keyboardType="numeric"
        />
      ) : (
        <Text style={styles.valeur}>{poids || "Non renseigné"}</Text>
      )}
    </View>

    {/* SEXE */}
    <View style={styles.sousboite}>
      <View style={styles.enTete}>
        <Text style={styles.label}>Sexe</Text>
        <View style={{ flexDirection: "row" }}>
          <Pressable onPress={() => setMontrerInfo(!montrerInfo)}>
            <Text style={{ marginRight: 12 }}>💡</Text>
          </Pressable>
          <Pressable onPress={() => setEditerSexe(!editerSexe)}>
            <Text style={styles.icone}>⚙️</Text>
          </Pressable>
        </View>
      </View>

      {montrerInfo && (
        <Text style={styles.info}>Sexe biologique déclaré à la naissance</Text>
      )}

      {editerSexe ? (
        <Picker selectedValue={sexe} onValueChange={setSexe}>
          <Picker.Item label="Femme" value="Femme" />
          <Picker.Item label="Homme" value="Homme" />
        </Picker>
      ) : (
        <Text style={styles.valeur}>{sexe || "Non renseigné"}</Text>
      )}
    </View>
    
    
    <View style={styles.sousboite}>
      <View style={styles.enTete}>
          <Text style={styles.label}>Niveau actif</Text>
          <View style={{ flexDirection: "row" }}>
            <Pressable onPress={() => setEditerActPhys(!editerNiveauActPhys)}>
              <Text style={styles.icone}>⚙️</Text>
            </Pressable>
          </View>
      </View>
      {editerNiveauActPhys ? (
          <Picker selectedValue={niveauActPhys} onValueChange={setNiveauActPhys}>
            <Picker.Item label="Sédentaire" value="0" />
            <Picker.Item label="Peu actif" value="1" />
            <Picker.Item label="Actif" value="2" />
            <Picker.Item label="Très actif" value="3" />
          </Picker>
        ) : (
          <Text style={styles.valeur}>{niveauActPhys || "Non renseigné"}</Text>
        )}
    </View>

    {/* SAUVEGARDE */}
    <Pressable
  style={({ pressed }) => [
    styles.sauvegarderBouton,
    {
      opacity: pressed ? 0.8 : 1,
      transform: [{ scale: pressed ? 0.98 : 1 }],
    },
  ]}
  onPress={() => {
    sauvegarderUtilisateur();
  }}
>
  <Text style={styles.sauvegarderTexte}>
    Sauvegarder
  </Text>
</Pressable>
  </ScrollView>

  {/*affichage de la roue de choix de la date de naissance en dehors du scrollview, sinon ça apportait un bug */}

  {montrerSpinner && (
    <View style={styles.auDessus}>
        <View style={styles.boiteSpinner}>
          <DateTimeSpinner
            mode="date"
            dateTimeOrder={["date"]}
            minDate={new Date("1920-01-01")}
            maxDate={new Date()}
            onDateChange={(value) => {
              {/*permet d'éviter les bugs de date : soit on prend la valeur déjà donnée soit on met la date d'auourd'hui */}
              const newDate = value?.date ?? value ?? new Date() 
              setTempDate(newDate)
            }}
            LinearGradient={LinearGradient}
            styles={styles.spinner}
          />

          <Pressable
            onPress={() => {
              setDateDeNaissance(tempDate)
              setMontrerSpinner(false)
            }}
            style={styles.bouton}
          >
            <Text style={styles.boutonTexte}>Valider</Text>
          </Pressable>
        </View>
      </View>
      )}
  </View>


)
}
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: Couleurs.background,

    flexGrow: 1,
  },

  auDessus: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.4)",
  justifyContent: "center",
  alignItems: "center",
},

boiteSpinner: {
  backgroundColor: Couleurs.background,
  padding: 20,
  borderRadius: 16,
  width: "85%",
},

  titre: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
    color : Couleurs.darkText,
    textAlign: "center",
  },

  soustitre: {
    marginVertical: 10,
    fontSize: 16,
    fontWeight: "600",
  },

  spinner: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 10,
    backgroundColor: "#ffffff",
    marginTop: 10,
  },

  sousboite: {
    backgroundColor: Couleurs.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  enTete: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color : Couleurs.secondary
  },

  icone: {
    fontSize: 18,
  },

  valeur: {
    fontSize: 15,
    color: "#281a38",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#fafafa",
  },

  info: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },


  bouton: {
    marginTop: 5,
    backgroundColor: Couleurs.secondary,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  boutonTexte: {
    color: "white",
    fontWeight: "600",
  },

  sauvegarderBouton: {
    marginTop: 20,
    backgroundColor: Couleurs.secondary,
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  sauvegarderTexte: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },

    diviseur: {
    height: 4,
    backgroundColor: Couleurs.secondary,
    width: "100%",
    borderRadius: 10,
    marginBottom: 18,
  },
})