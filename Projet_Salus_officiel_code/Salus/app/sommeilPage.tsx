import {Text, TouchableOpacity, View } from "react-native";
import { useEffect, useState } from "react";
import { ajouterNuit, dataBaseSommeil, recupererToutesNuits, supprimerToutesNuits } from "@/data/dataUtilisateur";
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { StyleSheet } from "react-native";
import { Sommeil } from "@/src/sommeil";
//timePicker : https://github.com/react-native-datetimepicker/datetimepicker?tab=readme-ov-file#getting-started
//reco Expo pr le timePicker : https://docs.expo.dev/versions/latest/sdk/date-time-picker/



export default function SommeilPage() {
  const [db, setDb] = useState<any>(null);
  const [heures, setHeures] = useState("");
  const [coucher,setCoucher] = useState(new Date())
  const [lever,setLever] = useState(new Date ())
  const [nuitListe, setNuitListe] = useState<any[]>([]);
  const [date,setDate] = useState (new Date())
  const [afficherDonnees,setAfficher] = useState(false)
 

  //ouverture de la base de donées
  useEffect (()=>{
    async function init() {
      const database = await dataBaseSommeil()
      setDb (database)
    }
    init()
  },[]) 

  
  //ouverture du "datepicker"
  const ouvrirChoixDate = () =>{
    DateTimePickerAndroid.open ({
      value: date,
      mode : "date",
      is24Hour : true,
      onChange : (_, selectedDate) => selectedDate && setDate(selectedDate)
    })
  }
  const ouvrirChoixHeureCoucher = ()=>{
    DateTimePickerAndroid.open ({
      value : coucher,
      mode : "time",
      is24Hour : true,
      onChange : (_, selectedTime) => selectedTime && setCoucher(selectedTime)

    })
  } 
  const ouvrirChoixHeureLever = ()=>{
    DateTimePickerAndroid.open ({
      value : lever,
      mode : "time",
      is24Hour : true,
      onChange : (_, selectedTime) => selectedTime && setLever(selectedTime)
    })
  }
  

  //création de la méthode d'ajout
  const ajouter = async () => {
    if (!db) return

    const nuit = new Sommeil (date,coucher,lever)
    const dateUtil = date.toISOString().split ("T")[0] //on passe la date en string et on récupère seulement la journée pas les heures
    const heures = nuit.calculerHeuresSommeil()
    

    await ajouterNuit (db, dateUtil, heures )
    await recupererToutesNuits (db)
  } 

    //création de la méthode d'affichage des données
   const afficher = async () => { 
    if (!db) return;

    const toutes = await recupererToutesNuits(db);
    setNuitListe(toutes);
    setAfficher (true)
  };

  //création de la méthode de suppression de TOUTES les données pour le moment
  const supprimerToutes = async ()=> {
    if (!db) return;

    const toutSupp = await supprimerToutesNuits (db)
    setNuitListe ([])
  }

  return (
    <View style={styles.container}>
      <Text style = {styles.titre}>🌙​ Suivi de mon sommeil 🌙​</Text>


      <View>
        <TouchableOpacity style = {styles.bouton} onPress={ouvrirChoixDate}>
          <Text style = {styles.titreSection}> Choisir une date </Text>
        </TouchableOpacity>

        <TouchableOpacity style = {styles.bouton} onPress={ouvrirChoixHeureCoucher}>
          <Text style = {styles.titreSection}> 🌇 Choisir l'heure de mon coucher 🌇</Text>
        </TouchableOpacity>

        <TouchableOpacity style = {styles.bouton} onPress={ouvrirChoixHeureLever}>
          <Text style = {styles.titreSection}> 🌅 Choisir l'heure de mon lever 🌅 </Text>
        </TouchableOpacity>

        <TouchableOpacity style = {styles.bouton} onPress={ajouter}>
          <Text style = {styles.titreSection}> ​🌜​ Ajouter ma nuit 🌛</Text>
        </TouchableOpacity>
      </View>    
      <View>
        <Text style = {styles.titre}> 🕑​ Mon historique</Text>
        <TouchableOpacity style = {styles.bouton} onPress={afficher}>
          <Text style = {styles.titreSection}>Voir mes entrées</Text>
        </TouchableOpacity>
          {afficherDonnees && nuitListe.map((item, index) => (
          <Text key={index}>
            {item.date} - {item.heuresSommeil}h
          </Text>
        ))} 
        <TouchableOpacity style = {styles.bouton}  onPress={supprimerToutes}>
          <Text style = {styles.titreSection}>Supprimer toutes mes entrées</Text>
        </TouchableOpacity>

      </View>         
    </View>
  
    
  );
}


const styles = StyleSheet.create({
  container: {
  flex: 1,
  backgroundColor:'#e8c0d7',
  gap:16,
  justifyContent: 'center',
  alignItems: 'center',
  },
  titre :{
    fontSize : 28,
    fontWeight : 'bold',
    textAlign : 'center',
    marginBottom : 20,
    color : '#791d31'
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4
  },
  bouton : {
    backgroundColor: '#f3a6c6',
    padding: 6,
    borderRadius: 10,
    marginBottom: 8,
    alignItems: 'center'
  },
  texteBouton : {
    color: '#5a1a33',
    fontWeight: '500'
  },
  titreSection : {
    fontSize : 20,
    fontWeight : 600,
    marginBottom : 15,
    color : '#791d31'
  }
}) 

