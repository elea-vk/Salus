import React, { useEffect, useState,useRef } from "react"
import { View, Text, TextInput, StyleSheet, Pressable } from "react-native"
import { DateTimeSpinner } from "react-native-date-time-spinner"
import { LinearGradient } from "expo-linear-gradient"
import {ajouterUtilisateur, initDatabase, modifierDateDeNaissance,getUtilisateur,modifierPrenom,getDernierSuivi,ajouterMesure,modifierSexe} from "@/data/dataAPP"
import { Picker } from '@react-native-picker/picker'
import { SexeUtilisateur, Utilisateur } from "@/src/utilisateur"
import { ScrollView } from "react-native"
import { SexeBiologique } from "@/src/sexeBiologique"


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
  const [tempDate, setTempDate] = useState(datedeNaissance)
  
  
  


  //////
  useEffect(() => {
    async function init() {
      const database = await initDatabase()
      

      const utilisateur = await getUtilisateur(database,1)
      const suivi = await getDernierSuivi(database,1)
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
  if (!db) return;

  try {
    const dateUtil =
      datedeNaissance instanceof Date && !isNaN(datedeNaissance.getTime())
        ? datedeNaissance.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

    // ⚡ UPDATE DB (fire and wait)
    await Promise.all([
      modifierPrenom(db, 1, nom),
      modifierSexe(db, 1, sexe),
      modifierDateDeNaissance(db, 1, dateUtil),
    ]);

    // ⚡ DB est mise à jour, mais UI ne dépend PLUS de DB ici
    console.log("SAVE OK");

    // (optionnel debug)
    console.log({
      nom,
      sexe,
      dateUtil,
    });
  } catch (e) {
    console.log("SAVE ERROR:", e);
  }
};


  ////
    return (
      <View>
  <ScrollView contentContainerStyle={styles.container}>
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
    
    
    <View style={styles.card}>
      <View style={styles.rowHeader}>
          <Text style={styles.label}>Niveau actif</Text>
          <View style={{ flexDirection: "row" }}>
            <Pressable onPress={() => setEditerActPhys(!editerNiveauActPhys)}>
              <Text style={styles.icon}>⚙️</Text>
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
          <Text style={styles.value}>{niveauActPhys || "Non renseigné"}</Text>
        )}
    </View>

    {/* SAUVEGARDE */}
    <Pressable style={styles.saveButton} 
    onPress={() => {
    sauvegarderUtilisateur()
  }}>
      <Text style={styles.saveText}>Sauvegarder</Text>
    </Pressable>
    <Pressable style={[styles.saveButton, { backgroundColor: "#444" }]}
            onPress={async () => {
              if (!db) return;
              const user = await getUtilisateur(db, 1);
              const suivi = await getDernierSuivi(db, 1);
              console.log("🧠 DB USER:", user);
              console.log("📊 DB SUIVI:", suivi);
            }}
            >
              <Text style={styles.saveText}>Vérifier DB</Text>
              </Pressable>


  </ScrollView>

  {montrerSpinner && (
    <View style={styles.overlay}>
        <View style={styles.spinnerBox}>
          <DateTimeSpinner
            mode="date"
            dateTimeOrder={["date"]}
            minDate={new Date("1920-01-01")}
            maxDate={new Date()}
            onDateChange={(value) => {
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
            style={styles.button}
          >
            <Text style={styles.buttonText}>Valider</Text>
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
    backgroundColor: "#cab5ce",
    flexGrow: 1,
  },
  overlay: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.4)",
  justifyContent: "center",
  alignItems: "center",
},
spinnerBox: {
  backgroundColor: "#cab5ce",
  padding: 20,
  borderRadius: 16,
  width: "85%",
},

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
    color : "#3f2346"
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
    backgroundColor: "#7d6b80",
    marginTop: 10,
  },

  card: {
    backgroundColor: "#7d6b80",
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
    color : "#403352"
  },

  icon: {
    fontSize: 18,
  },

  value: {
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



  button: {
    marginTop: 5,
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
    backgroundColor: "#90809b",
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