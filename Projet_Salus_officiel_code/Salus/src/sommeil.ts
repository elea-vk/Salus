export class Sommeil {
    date : Date
    heure_coucher : Date
    heure_lever : Date

    constructor (date : Date, heure_coucher : Date, heure_lever : Date){
        this.date = date
        this.heure_coucher = heure_coucher
        this.heure_lever = heure_lever
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
}