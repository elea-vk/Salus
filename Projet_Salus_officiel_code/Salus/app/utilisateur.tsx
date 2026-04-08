import React, { useState } from "react"
import { View, Text, TextInput, StyleSheet, ScrollView, Touchable, Pressable } from "react-native"
import { DateTimeSpinner } from "react-native-date-time-spinner"

export default function Utilisateur() {
  const [nom, setNom] = useState("")
  const [age, setAge] = useState("")
  const [taille, setTaille] = useState("")
  const [poids, setPoids] = useState("")
  const [datedeNaissance, setDateDeNaissance] = useState (new Date(2000,0,1))
  const [montrerSpinner,setMontrerSpinner] = useState (false)


  return (
    <View style={styles.container}>

      {/*onglet prénom */}

      <View style={styles.field}>
        <Text style={styles.label}>Prénom</Text>
        <TextInput
          style={styles.input}
          placeholder= "nom"
          value={nom}
          onChangeText={setNom}
        />
      </View>

      {/* onglet date de naissance */}
      <View style={[styles.field, {backgroundColor: "#a39abd", borderRadius: 12, padding: 10 }]}>
        <Pressable
          onPress={()=>setMontrerSpinner (!montrerSpinner)}
        >
          <Text style = {styles.roueParametre}>⚙️</Text>
        </Pressable>
        <Text style={styles.label}>Date de naissance</Text>
        
        {montrerSpinner && (<DateTimeSpinner
          mode="date"
          dateTimeOrder={["date"]}
          minDate={new Date("1920-01-01")}
          maxDate={new Date()}
          onDateChange={({ date }) => setDateDeNaissance(date)}
        />)}

        {montrerSpinner && (<Pressable style={styles.pressable}>
          <Text>Valider</Text>
        </Pressable>)}
        <Text>{datedeNaissance.toLocaleDateString("fr-FR")}</Text>
      </View>
      
      <View>
        <TextInput
          style={styles.input}
          placeholder="Entre ton âge"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Taille (cm)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 159"
          value={taille}
          onChangeText={setTaille}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Poids (kg)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 55"
          value={poids}
          onChangeText={setPoids}
          keyboardType="numeric"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#f8f8f8",
  },
  pressable : {
    left : 10,
    marginHorizontal : 15,
    borderColor : "#c595e5",
    borderRadius : 12,
    paddingHorizontal : 5,
    paddingVertical : 5,
    marginTop : 5,
    fontSize : 16,
    backgroundColor : "#e4c8f7",
    alignSelf : "flex-end"
    
  },
  
  roueParametre : {
    alignSelf : "flex-end",
  }
  
});

