import React, { useEffect, useState } from "react"
import { View, Text, TextInput, StyleSheet, Pressable } from "react-native"
import { DateTimeSpinner } from "react-native-date-time-spinner"
import { LinearGradient } from "expo-linear-gradient"
import {ajouterUtilisateur, initDatabase, modifierDateDeNaissance,getUtilisateur,modifierPrenom,getDernierSuivi,ajouterMesure,modifierSexe} from "@/data/dataAPP"
import { Picker } from '@react-native-picker/picker'
import { Utilisateur } from "@/src/utilisateur"


export default function PageUtilisateur() {
  const [db, setDb] = useState<any>(null);
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


  //////
  useEffect(() => {
    async function init() {
      const database = await initDatabase()
      

      const utilisateur = await getUtilisateur(database)
      const suivi = await getDernierSuivi(database, 1)
      if (utilisateur) {
        const user = new Utilisateur(utilisateur.prenom,new Date(utilisateur.dateDeNaissance),utilisateur.sexe,utilisateur.id)
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
  
  const sauvegarderUtilisateur = async () => {
    if (!db) {return}

    const dateUtil = datedeNaissance instanceof Date && !isNaN(datedeNaissance.getTime())? datedeNaissance.toISOString().split("T")[0]: new Date().toISOString().split("T")[0]

    // 1. profil
    const existe = await getUtilisateur(db)
    if (!existe) {
      await ajouterUtilisateur(db, nom, dateUtil, sexe)
    } 
    else {
      await modifierPrenom(db, 1, nom)
      await modifierSexe(db, 1, sexe)
      await modifierDateDeNaissance(db, 1, datedeNaissance.toISOString().split("T")[0])
    }
    
    // 2. suivi 
    const dernier = await getDernierSuivi(db, 1);
    if (!dernier ||dernier.poids !== Number(poids) ||dernier.taille !== Number(taille)) {
      await ajouterMesure(db, 1, dateUtil, Number(poids), Number(taille));
    }
    const suivi = await getDernierSuivi(db, 1)
    if (suivi) {
      setPoids(suivi.poids?.toString() || "")
      setTaille(suivi.taille?.toString() || "")
    }
    console.log ("changement")
  }




  ////
    return (
  <View style={styles.container}>

    <Text style={styles.title}>Profil utilisateur</Text>

    {/* PRÉNOM */}
    <View style={styles.card}>
      <View style={styles.rowHeader}>
        <Text style={styles.label}>Prénom</Text>
        <Pressable onPress={() => setEditerNom(!editerNom)}>
          <Text style={styles.icon}>⚙️</Text>
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
        <Text style={styles.value}>{nom || "Aucun prénom"}</Text>
      )}
    </View>

    {/* DATE NAISSANCE */}
    <View style={styles.card}>
      <View style={styles.rowHeader}>
        <Text style={styles.label}>Date de naissance</Text>
        <Pressable onPress={() => setMontrerSpinner(!montrerSpinner)}>
          <Text style={styles.icon}>⚙️</Text>
        </Pressable>
      </View>

      {montrerSpinner && (
        <View style={styles.spinnerContainer}>
          <DateTimeSpinner
            mode="date"
            dateTimeOrder={["date"]}
            minDate={new Date("1920-01-01")}
            maxDate={new Date()}
           onDateChange={(value) => {
            const newDate = value?.date ?? value ?? new Date()
            setDateDeNaissance(newDate)
          }}
            LinearGradient={LinearGradient}
            styles={styles.spinner}
          />

          <Pressable
            onPress={() => {
              setDateDeNaissance(datedeNaissance)
              setMontrerSpinner(false)
            }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Valider</Text>
          </Pressable>
        </View>
      )}

      <Text style={styles.value}>
        {datedeNaissance.toLocaleDateString("fr-FR")}
      </Text>
    </View>

    <Text style={styles.subtitle}>
      Âge : {utilisateurObj ? utilisateurObj.calculAge() : 0} ans
    </Text>

    {/* TAILLE */}
    <View style={styles.card}>
      <View style={styles.rowHeader}>
        <Text style={styles.label}>Taille</Text>
        <Pressable onPress={() => setEditerTaille(!editerTaille)}>
          <Text style={styles.icon}>⚙️</Text>
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
        <Text style={styles.value}>{taille || "Non renseignée"}</Text>
      )}
    </View>

    {/* POIDS */}
    <View style={styles.card}>
      <View style={styles.rowHeader}>
        <Text style={styles.label}>Poids</Text>
        <Pressable onPress={() => setEditerPoids(!editerPoids)}>
          <Text style={styles.icon}>⚙️</Text>
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
        <Text style={styles.value}>{poids || "Non renseigné"}</Text>
      )}
    </View>

    {/* SEXE */}
    <View style={styles.card}>
      <View style={styles.rowHeader}>
        <Text style={styles.label}>Sexe</Text>
        <View style={{ flexDirection: "row" }}>
          <Pressable onPress={() => setMontrerInfo(!montrerInfo)}>
            <Text style={{ marginRight: 12 }}>💡</Text>
          </Pressable>
          <Pressable onPress={() => setEditerSexe(!editerSexe)}>
            <Text style={styles.icon}>⚙️</Text>
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
        <Text style={styles.value}>{sexe || "Non renseigné"}</Text>
      )}
    </View>

    {/* SAUVEGARDE */}
    <Pressable style={styles.saveButton} onPress={sauvegarderUtilisateur}>
      <Text style={styles.saveText}>Sauvegarder</Text>
    </Pressable>
  </View>
)
}
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#efc2f8",
    flexGrow: 1,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
  },

  subtitle: {
    marginVertical: 10,
    fontSize: 16,
    fontWeight: "600",
  },
  spinner: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 10,
    backgroundColor: "#fff",
    marginTop: 10,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
  },

  icon: {
    fontSize: 18,
  },

  value: {
    fontSize: 15,
    color: "#444",
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

  spinnerContainer: {
    marginTop: 10,
  },

  button: {
    marginTop: 10,
    backgroundColor: "#7C5CFF",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "600",
  },

  saveButton: {
    marginTop: 20,
    backgroundColor: "#ae49f1",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  saveText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
})