
export class utilisateur {
    nom : string
    adresse_mail : string
    mot_de_passe : string

    public constructor (nom : string, adresse_mail: string, mot_de_passe : string){
        this.nom = nom
        this.adresse_mail = adresse_mail
        this.mot_de_passe = mot_de_passe
    }

    public modifierMotDePasse (nouveauMotDePasse : string){
        return nouveauMotDePasse
    }

    public modifierNom (nouveauNom : string) : string {
        return nouveauNom
    }
    public modifierAdresseMail (nouvelleAdresseMail : string) : string {
        return nouvelleAdresseMail
    }
}