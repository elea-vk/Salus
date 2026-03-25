export class Sommeil {
    date : Date
    heure_coucher : Date
    heure_lever : Date
    temps_recommende : number

    constructor (date : Date, heure_coucher : Date, heure_lever : Date, temps_recommende : number){
        this.date = date
        this.heure_coucher = heure_coucher
        this.heure_lever = heure_lever
        this.temps_recommende = 8
    }

    calculerHeuresSommeil () : number {
        
        let coucher = this.heure_coucher.getTime();
        let lever = this.heure_lever.getTime();

    
        if (lever < coucher) {
            lever += 24 * 60 * 60 * 1000;
        }

        const dureeMs = lever - coucher;
        return dureeMs / (1000 * 60 * 60);
    }

    calculerIndice () : number {
        const heuresSommeilUtil = this.calculerHeuresSommeil ()
        const indice = heuresSommeilUtil/this.temps_recommende
        return Math.min (indice,1)
    }
}