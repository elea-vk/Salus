import { useState } from "react";
import { View} from "react-native"
import { LineChart } from "react-native-gifted-charts" //importation depuis https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts/tree/master
import { useEffect } from "react";
import { dataBaseSommeil,recupererToutesNuits } from "@/data/dataUtilisateur";
import { StyleSheet,Pressable } from "react-native";

//documentation graphique : https://gifted-charts.web.app/linechart/#negative

//set des données plus méthodes pour utilisateur peut entrer des données
const Graphique = () => {
    //const [value,setValue] = useState ("")
    const [db, setDb] = useState<any>(null);
    const [donnee, setDonnee] = useState ([])   

    useEffect (()=>{
        async function init() {
          const database = await dataBaseSommeil() || []
          setDb (database)
          await recupererDonnees(database)
        }
        init()
      },[]) //ouverture de la base de données et récupération des donées

    const recupererDonnees = async (db :any) =>{
        const toutesNuits = await recupererToutesNuits (db)
        const transfData = toutesNuits
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map ((item : any) =>({
            value : item.heuresSommeil,
            label : item.date.slice (5,10),
            frontColor : "#ac2b51"

        }))
        setDonnee (transfData)
    } //récupération des données et ytransformation pour affichage sur l'axe x
  
    return (
        <View style = {styles.container}>
            <LineChart
            color1="#c96675"
            dataPointsColor1="#630f1a"
            data={donnee}
            spacing1={50}
            thickness1={4}
            hideRules
            yAxisColor={'#290f13'}
            xAxisColor={'#290f13'}
            yAxisThickness={3}
            xAxisThickness={3}
            curved
        />
        </View>
    )    
};
const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor:'#e8c0d7',
    gap:16,
    justifyContent: 'center',
    alignItems: 'center',
    },
  }) 

export default Graphique