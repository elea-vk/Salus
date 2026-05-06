import { ajouterNuit, initDatabase, recupererToutesNuits, supprimerToutesNuits } from "@/data/dataAPP";

import { getDay, getMonth, getYear } from "date-fns";
import { DataPoint } from "./DataPoint";

   const aujourdhui:Date=new Date(Date.now());
   const anneeEnCours = new Date().getFullYear();
   const moisActuel = new Date().getMonth();



export class Statistique{
    dataBase:any;
    donnees:any[]=[];
    

    constructor(){
        
        



    }
    async ouvrirDataBase(){
        
        this.dataBase= await initDatabase() ;
        
        await this.recupererDonnees(this.dataBase);

    }
    async recupererDonnees (db:any){
        const toutesNuits = await recupererToutesNuits (db)
            
            
        this.donnees = toutesNuits
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map ((item : any) =>({
                value : item.heuresSommeil,
                label : item.date.slice (5,10),
                frontColor : "#ac2b51",
                date: new Date(item.date), 
                heuresSommeil: item.heuresSommeil
    
        }))
        
            
            
    }
    public async calculerMoyenneHeuresSommeilIntervalle(intervalle:string):Promise<number>{
        await this.ouvrirDataBase();
        
        

        let index:number=0; 
        let moyenne:number=0;
        


        switch(intervalle){ 
        case "Annuel":
            
            for (let nuit of this.donnees) {
                
                if(nuit.date.getFullYear()==anneeEnCours){
                    moyenne+=nuit?.heuresSommeil?? 0;
                    index++;
                    
                }
                
            }
            
            
        
        break;
        case "Mensuel":
             
            for (let nuit of this.donnees) {
                

                if(nuit.date.getMonth()==moisActuel&& nuit.date.getFullYear()==anneeEnCours){
                    
                    moyenne+=nuit?.heuresSommeil?? 0;
                    index++;
                    
                }
                
            }
            
        break;
        case "Hebdomadaire": //calcule pour les 7 derniers jours d'entrés, pas la semaine exacte
          for (let i=0; i< Math.min(7,this.donnees.length); i++) {
            const nuit = this.donnees[this.donnees.length-i-1];
                if (nuit?.heuresSommeil != null) {
                 moyenne += nuit?.heuresSommeil?? 0;
                 index++;
                }
          }
          
        break;
        }


        return Math.round(((moyenne/index)*10))/10;
    }
    public async TrierTableauDonnees(intervalle:string): Promise<DataPoint[]>{
        await this.ouvrirDataBase();
       

        const tableau: DataPoint[] = [];
       



        switch(intervalle){
            case "Annuel":
                for (let nuit of this.donnees) {
                
                 if(nuit.date.getFullYear()==anneeEnCours){
                    tableau.push({
                         value : nuit.heuresSommeil,
                         label : "date",//nuit.date.slice (5,10),
                         frontColor : "#ac2b51",
                         date: new Date(nuit.date), 
                         heuresSommeil: nuit.heuresSommeil
                    });
                
                 }
                
                }
                


            break;

            case "Mensuel":
                 for (let nuit of this.donnees) {
                
                 if(nuit.date.getFullYear()==anneeEnCours && nuit.date.getMonth()==moisActuel){
                    tableau.push({
                         value : nuit.heuresSommeil,
                         label : "date",//nuit.date.slice (5,10),
                         frontColor : "#ac2b51",
                         date: new Date(nuit.date), 
                         heuresSommeil: nuit.heuresSommeil
                    });
                
                 }
                
                }


            break;
            case "Hebdomadaire":
                let index = 0;

                for (let nuit of this.donnees) {
                
                 if(index<7){
                    tableau.push({
                         value : nuit.heuresSommeil,
                         label : "date",//nuit.date.slice (5,10),
                         frontColor : "#ac2b51",
                         date: new Date(nuit.date), 
                         heuresSommeil: nuit.heuresSommeil
                        
                    });
                    index++;
                
                 }
                
                }


            break;    
        }
        return tableau;

    }



    
    
}