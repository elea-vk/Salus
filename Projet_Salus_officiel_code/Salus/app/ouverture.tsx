import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import Couleurs from "../constantes/couleurs";
import React, { useEffect } from "react";
import { ajouterUtilisateur, getUtilisateur, initDatabase, supprimerUtilisateur } from "@/data/dataAPP";
import { Pressable } from "react-native";



export default function Ouverture() {

  const [db, setDb] = React.useState<any>(null)
  useEffect(() => {
    const init = async () => {
      const database = await initDatabase();
      setDb(database);
    };
    init();
  }, []);


  const skipInscription = false
  


  const gererSuite = async () => {
    if (!db) return;
    const utilisateur = await getUtilisateur(db)
    if (utilisateur?.id || skipInscription) {
      router.replace("/homePage")
    } 
    else {
      router.replace("/homePage")
    }
  };


  const devUtil = async () => {
    if (!db) return
    let utilisateur = await getUtilisateur(db)
    if (!utilisateur) {
      await ajouterUtilisateur(db, "Dev", "2000-01-01", "Femme")
      utilisateur = await getUtilisateur(db)
    }
    //console.log("DEV USER:", utilisateur)
    router.replace("/homePage")
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titre}>SALUS</Text>
      <Pressable style={styles.boutonOuverture} onPress={()=>gererSuite ()}>
        <Text style={styles.texteBouton}>
          Commencer!
        </Text>
      </Pressable>
      <Pressable style = {styles.boutonOuverture} onPress={()=>devUtil()}>
        <Text>Se connecter comme un dev</Text>
      </Pressable>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:Couleurs.background,
    padding: 30,
    paddingVertical:30,
    justifyContent: "center",
    alignItems:"center",
     
  },
  titre:{
    fontSize:100,
    color:Couleurs.darkText,
    paddingVertical:20,
    fontStyle:"italic"
  },
  boutonOuverture:{
    flex:1,
    backgroundColor:Couleurs.primary,
    width:200,
    maxHeight:100,
    justifyContent:"center",
    alignItems:"center",
    borderRadius:12,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    paddingVertical : 15
  },
  texteBouton:{
    textAlign:"center",
    color:Couleurs.darkText,
    fontSize:30,
    

  }
});