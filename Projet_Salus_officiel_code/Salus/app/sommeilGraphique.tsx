import { useState } from "react";
import { View,Text, Dimensions} from "react-native"
import { LineChart } from "react-native-gifted-charts" //importation depuis https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts/tree/master
import { useEffect } from "react";
import { initDatabase,recupererToutesNuits } from "@/data/dataAPP";
import { StyleSheet,Pressable } from "react-native";
import { Statistique } from "@/src/statistiques";
import { TouchEventType } from "react-native-gesture-handler/lib/typescript/web/interfaces";
import Couleurs from "@/constantes/couleurs";
import { Picker } from '@react-native-picker/picker';
import { DataPoint } from "@/src/DataPoint";



//documentation graphique : https://gifted-charts.web.app/linechart/#negative

//set des données plus méthodes pour utilisateur peut entrer des données
const SommeilGraphique = () => {
    //const [value,setValue] = useState ("")
    const [db, setDb] = useState<any>(null);
    const [donnee, setDonnee] = useState <DataPoint[]>([]); ;
    const [intervalle,setIntervalle]=useState("");
    
    const stats=new Statistique();
    let [moyenne,setMoyenne] = useState <number | null>(null);
    
    

   
    
    

    useEffect (()=>{
        async function init() {
          const temp = await stats.TrierTableauDonnees(intervalle);
          setDonnee(temp);
          stats.calculerMoyenneHeuresSommeilIntervalle(intervalle).then((data) => {
          setMoyenne(data);});
        }
        init()
      },[intervalle]) //ouverture de la base de données et récupération des données

    
    
     
     //récupération des données et ytransformation pour affichage sur l'axe x
  
    return (
        <View style = {styles.container}>
            
       <Picker
            selectedValue={intervalle}
             onValueChange={(itemValue) => setIntervalle(itemValue)}
            style={{ width: 200 }}
            >
            <Picker.Item label="Mensuel" value="Mensuel" />
            <Picker.Item label="Annuel" value="Annuel" />
            <Picker.Item label="7 derniers jours" value="Hebdomadaire" />
        </Picker>
        <Text>Moyenne : {intervalle}</Text>
        <LineChart
            color1="#c96675"
            dataPointsColor1="#630f1a"
            data={donnee}
            spacing1={50}
            thickness1={4}
            hideRules
            yAxisColor={"#630f1a"}
            xAxisColor={"#630f1a"}
            yAxisThickness={3}
            
            xAxisThickness={3}
            curved
            width={Dimensions.get("window").width-100}
            backgroundColor={Couleurs.lightText}
            showReferenceLine1
            referenceLine1Position={moyenne !== null ? moyenne : 0}
            referenceLine1Config={{color:Couleurs.darkText,thickness:3,labelText:"Moyenne",dashWidth:Dimensions.get("screen").width-10}}/>
            
            
        
        

        <View>
           <Text>Moyenne de l'année:{stats.calculerMoyenneHeuresSommeilIntervalle("Annuel")} </Text> 
           <Text>Moyenne du mois: {stats.calculerMoyenneHeuresSommeilIntervalle("Mensuel")}</Text>
           <Text>Moyenne des 7 dernières entrées: {stats.calculerMoyenneHeuresSommeilIntervalle("Hebdomadaire")}</Text>
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
}) 


export default SommeilGraphique
