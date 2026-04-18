import { View, Text, StyleSheet,Pressable, Modal, TextInput, ScrollView ,Dimensions,Animated, Touchable} from "react-native";
import {useEffect, useState,useRef } from "react";

import Couleurs from "@/constantes/couleurs";
import { ajouterActivite, databaseActivite, recupererToutesActivites } from "@/data/dataUtilisateur";
import {DateTimeSpinner} from "react-native-date-time-spinner";

import { LinearGradient } from "expo-linear-gradient";
import { setStatusBarBackgroundColor } from "expo-status-bar";

const SCREEN_HEIGHT = Dimensions.get("window").height;


export default function Activite() {
  const [db, setDb] = useState<any>(null);
  const[nomActivite,setNomActivite]=useState('');
  const[date,setDate]=useState(new Date());
  const[nbHeuresDuree,setNbHeuresDuree]=useState(0);
  const[nbMinutesDuree,setNbMinutesDuree]=useState(0);
  const[mois,setMois]=useState(0);
  const[jour,setJour]=useState(1);
  const[annee,setAnnee]=useState(0);
  const[desactive,isDesactive]=useState(true);
  const[visibiliteAjout,isVisibiliteAjout]=useState(false);
  const sheetTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
 const backdropOpacity = useRef(new Animated.Value(0)).current;
 const [activiteListe, setActiviteListe] = useState<any[]>([]);




  useEffect (()=>{
      async function init() {
        const database = await databaseActivite()
        setDb (database)
      }
      init()
    },[])
    const ajouter = async()=>{
      if(!db) return

      ajouterActivite(db,nomActivite,date.toDateString(),(nbHeuresDuree*60)+nbMinutesDuree)
      afficher()

    }
    const afficher=async()=>{
      if(!db) return

      const toutes = await recupererToutesActivites(db);
      setActiviteListe(toutes);
    }
    const openSheet = () => {
   
     isVisibiliteAjout(true);
     backdropOpacity.setValue(0);
     sheetTranslateY.setValue(SCREEN_HEIGHT);
     Animated.parallel([
     Animated.timing(backdropOpacity, {
       toValue: 1,
       duration: 220,
       useNativeDriver: true,
     }),
     Animated.spring(sheetTranslateY, {
       toValue: 0,
       friction: 9,
       tension: 70,
       useNativeDriver: true,
     }),
      ]).start();
    };
    const closeSheet = () => {
     Animated.parallel([
     Animated.timing(backdropOpacity, {
       toValue: 0,
       duration: 180,
       useNativeDriver: true,
     }),
     Animated.timing(sheetTranslateY, {
       toValue: SCREEN_HEIGHT,
       duration: 220,
       useNativeDriver: true,
     }),
      ]).start(() => {
     isVisibiliteAjout(false);
      });
    };

  
  
  return (
    <View style={styles.container}>
      <Text style={styles.titre}> -Activité- </Text>
      <View style={styles.separateur}/>

       {/* affichage des activités à venir*/ }
       <View>
         <Text style={styles.titre}> Activités à venir: </Text>
         <ScrollView style={styles.scrollViewStyle}>
          {activiteListe.map((item, index) => (
          
            <Text style={{color:Couleurs.darkText, fontSize:30,backgroundColor:Couleurs.secondary}} key={index}>
                 {item.nom} - {item.date} - {item.tempsActivite} minutes
           </Text> 
    
          ))} 
          
         </ScrollView>
        </View>
      <View style={styles.separateur}/>
      
      {/* Bouton ajout d'activité  */ }
      <Pressable style={styles.boutonGestionActivite} onPress={()=>openSheet()}>
        <Text style={styles.texteBoutonAjout}> Gérer les activités  </Text>
          
      </Pressable>

      <View style={styles.separateur}/>
     


{/* Début de la page d'ajout d'activités */ }
<Modal visible={visibiliteAjout} transparent animationType="none">
<View style={styles.modalRoot}>
<Animated.View
           style={[
             styles.backdrop,
             {
               opacity: backdropOpacity,
             },
           ]}
>
<Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />
</Animated.View>
   <Animated.View
           style={[
             styles.sheet,
             {
               transform: [{ translateY: sheetTranslateY }],
             },
           ]}
            >
      <View style={styles.containerMenuActivite}>{/** container principal du menu de gestion des activités */}
        <View style={styles.menuHeader}>{/**container du titre du menu et du bouton annuler */}
          <Text style={styles.textMenuActivite}> -Gestion des activités- </Text>
          <Pressable style={styles.boutonAnnuler} onPress={closeSheet}>
           <Text style={styles.texteBoutonAnnuler}> Fermer </Text>
          </Pressable>
        </View>

        
         <View style={styles.nomActivite}>{/**container nom de l'activité */}
            <Text style={styles.textePlanifActivite}> Nom: </Text>
            <TextInput 
            style={styles.textInputNomActivite}
            placeholder="Ex: Jogging"
            placeholderTextColor={Couleurs.darkText}
            onChangeText={setNomActivite}

            />

          </View>

        <View style={styles.containerAjoutActivite}>{/**container planification de l'activité*/}
          <Text style={styles.textePlanifActivite}> Planifier une activité le: </Text>
          <DateTimeSpinner
            mode="datetime"
            dateTimeOrder={["date", "hour", "minute"]}
            dateTimeSpacing={16}
            styles={{backgroundColor:"#f6f6f6"}}
            
            minDate={new Date(2026, 0, 1)}
            maxDate={new Date(2030, 11, 31)}
            padHourWithZero
            padMinuteWithZero
            LinearGradient={LinearGradient}
            pickerGradientOverlayProps={{ locations: [0, 0.5, 0.5, 1] }}
            timeSeparator=":"
            onDateChange={({ date }) => (setDate(date))}
          />
        </View>

        <View style={styles.containerAjoutActivite}> 

          <Text style={styles.textePlanifActivite}> Durée de l'activité: </Text>

          <View style={styles.containerSelectionDuree}>
            <TextInput keyboardType="numeric"
             style={styles.textInputDuree}
             placeholder=" 1 "
             textAlign="center"
             onChangeText={(duree)=>setNbHeuresDuree(Number(duree))}
             /> 
             <Text style={styles.textePlanifActivite}> heure(s)</Text>

             <TextInput keyboardType="numeric"
               style={styles.textInputDuree}
               placeholder=" 1 "
               textAlign="center"
               onChangeText={(duree)=> setNbMinutesDuree(Number(duree))}
               />
             <Text style={styles.textePlanifActivite}> minute(s)</Text>

          </View>
        </View>

        <View style={styles.containerBoutonAjouter}>
          <Pressable style={styles.boutonAjoutActivite} onPress={ajouter}>
           <Text style={styles.texteBoutonAjout}> Ajouter  </Text>
          
          </Pressable>
        </View>


      </View>        
     
   </Animated.View>


</View>
</Modal>
</View>

   
);
}





{/**LocaleConfig.defaultLocale = 'fr';
LocaleConfig.locales['fr'] = {
  monthNames: [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre'
  ],
  monthNamesShort: ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
  dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  dayNamesShort: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
  today: "Aujourd'hui"
}; */}


const styles=StyleSheet.create({
  container:{
    flex:1,
    justifyContent:"flex-start",
    
    alignItems:"center",
    backgroundColor:Couleurs.background,
    padding:20,
    
    
  },
  titre:{
    fontSize:30,
    color:Couleurs.lightText,
    fontWeight:"200",
    marginVertical:20
  },
  separateur:{
    height: 5,
  backgroundColor: Couleurs.secondary,
  alignSelf: "stretch",
  marginBottom: 20,
  marginVertical:20,
  },
   separateur2:{
    height: 5,
  backgroundColor: Couleurs.lightText,
  alignSelf: "stretch",
  marginBottom: 20,
  },
  calendrier:{
    flex:2,
    backgroundColor:Couleurs.lightText,
    width:350,
    maxHeight:320,
    marginVertical:20
    
  
  },
  boutonGestionActivite:{
    flex:1,
    backgroundColor:Couleurs.secondary,
    width:300,
    maxHeight:90,
    justifyContent:"center",
    alignItems:"center",
    borderRadius:12,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    marginVertical:10

  
  },
  texteBoutonAjout:{
    fontSize:30,
    paddingVertical:40,
    color:Couleurs.lightText,
    fontWeight:"200",
    


  },
  containerMenuActivite:{
    flex:1,
    justifyContent:"flex-start",
    alignContent:"center",
    borderRadius:10,
    gap:20
  },
  menuHeader:{
    flex:1,
    flexDirection:"row",
    gap:10,
    padding:10,
    justifyContent:"center",    
    alignItems:"center",
    maxHeight:60,
    
    
  },
  textMenuActivite:{
    justifyContent:"center",
    fontSize:25,
    color:Couleurs.darkText,
    fontWeight:200,


  },
  boutonAnnuler:{
    backgroundColor: "#f6f6f6",
   paddingVertical:8,
   paddingHorizontal: 14,
   borderRadius: 12,
   
  },
  texteBoutonAnnuler:{
    fontSize:14,
    color:Couleurs.darkText,
    fontWeight:"300",
  },
  nomActivite:{
    flex:1,
    flexDirection:"row",
    maxHeight:50,

  },
  textInputNomActivite:{
    flex:1,
    fontSize:22,
    marginBottom:10,
    borderWidth:1,
    maxHeight:40,
    maxWidth:300,
    color:Couleurs.darkText,
    borderColor:Couleurs.darkText
  },
  sheet: {
   height: SCREEN_HEIGHT * 0.72,
   backgroundColor: "#fff",
   borderTopLeftRadius: 26,
   borderTopRightRadius: 26,
   overflow: "hidden",
 },
  modalRoot: {
   flex: 1,
   justifyContent: "flex-end",
 },
 backdrop: {
   ...StyleSheet.absoluteFillObject,
   backgroundColor: "rgba(0,0,0,0.28)",
 },
 textePlanifActivite:{
  fontSize:25,
  
  color:Couleurs.darkText,
  fontWeight:"300",
  textAlign:"left",


 },
 containerAjoutActivite:{
  flex:1,
  alignSelf:"center",
  backgroundColor:"#f6f6f6",
  borderRadius:12,
  width:"90%",
  maxHeight:300,
  paddingTop:10,

 },
 scrollViewStyle:{
  backgroundColor:Couleurs.lightText,
  width:350,
  maxHeight:400,


 },
 textInputDuree:{
    flex:1,
    fontSize:22,
    marginBottom:10,
    borderWidth:1,
    maxHeight:40,
    maxWidth:100,
    color:Couleurs.darkText,
    borderColor:Couleurs.darkText
  },
  containerSelectionDuree:{
    flex:1,
    flexDirection:"row",
    
    alignSelf:"center",
    backgroundColor:"#f6f6f6",
    borderRadius:12,
    width:"90%",
    maxHeight:300,
    paddingTop:10,
  },
  containerBoutonAjouter:{
    flex:1,
  alignSelf:"center",
  alignItems:"center",
  justifyContent:"center",
  backgroundColor:"#f6f6f6",
  borderRadius:12,
  width:"90%",
  maxHeight:150,
  paddingTop:10,
  },
  boutonAjoutActivite:{
    flex:1,
    backgroundColor:Couleurs.secondary,
    width:200,
    maxHeight:90,
    justifyContent:"center",
    alignItems:"center",
    borderRadius:12,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    marginVertical:10
  }



});
