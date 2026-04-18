import React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import Couleurs from "../constantes/couleurs";

export default function Ouverture(){
   return (<View style={styles.container}>
        <Text style={styles.titre}>
            SALUS
        </Text>
        <Pressable 
        style={styles.boutonOuverture}
        onPress={()=>router.push("/homePage")}
        >
            <Text style={styles.texteBouton}>
                Commencer!
            </Text>

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
  },
  texteBouton:{
    textAlign:"center",
    color:Couleurs.darkText,
    fontSize:30,
    

  }
});