//import * as SQLite from 'expo-sqlite';

//https://www.w3schools.com/sql/sql_delete.asp

//database sommeil
/*export async function dataBaseSommeil() {
    
    const dbSommeil = await SQLite.openDatabaseAsync ('dataSommeil')
    await dbSommeil.execAsync (`
      CREATE TABLE IF NOT EXISTS sommeil (
        id INTEGER PRIMARY KEY NOT NULL, 
        date TEXT NOT NULL,
        heuresSommeil REAL NOT NULL
      );
    `) //id integer = numero de ligne
    return dbSommeil
}
export async function ajouterNuit(db : any, date :string, heures : number) {
    return db.runAsync ('INSERT INTO sommeil (date,heuresSommeil) VALUES (?,?)',[date, heures])
}

export async function recupererNuit(db : any, date : string) {
    return db.getFirstAsync('SELECT * FROM sommeil WHERE date =?', date)
}

export async function recupererToutesNuits(db : any) {
    return db.getAllAsync ('SELECT * FROM sommeil ORDER BY date DESC')
}
export async function supprimerNuit(db : any, date : string) {
    return db.runAsync ('DELETE FROM sommeil  WHERE date =?',date)
}

export async function supprimerToutesNuits(db : any) {
    return db.runAsync ('DELETE FROM sommeil')
}

//database activité

export async function databaseActivite() {
    const dbActvite = await SQLite.openDatabaseAsync ("dataActivite")
    await dbActvite.execAsync (`
        CREATE TABLE IF NOT EXISTS activite (
            id INTEGER PRIMARY KEY NOT NULL,
            nom TEXT NOT NULL,
            date TEXT NOT NULL,
            tempsActivite REAL NOT NULL
        );
    `)
    return dbActvite
}

export async function ajouterActivite(db : any, nom : string, date : string, temps : number) {
    return db.runAsync ('INSERT INTO activite (nom,date,tempsActivite) VALUES (?,?,?)',[nom,date,temps])
}

export async function recupererActivite(db : any, date : string) {
    return db.getFirstAsync ('SELECT * FROM activite WHERE date = ?', date)
}

export async function recupererToutesActivites(db : any) {
    return db.getAllAsync ('SELECT * FROM activite ORDER BY date DESC')
}

export async function supprimerActivite(db : any, nom : string, date : string) {
    return db.runAsync ('DELETE FROM activite WHERE nom =? AND date = ?  ', [nom, date])
}

export async function supprimerToutesActivites(db : any) {
    return db.runAsync ('DELETE FROM activite')
}

export async function supprimerJourneeActivites(db : any, date : string) {
    return db.runAsync ('DELETE FROM activite WHERE date =?', date)    
}

//database hydratation

export async function databaseHydratation() {
    const dbHydratation = await SQLite.openDatabaseAsync ('dataHydratation')
    await dbHydratation.execAsync (`
        CREATE TABLE IF NOT EXISTS hydratation(
            id INTEGER PRIMARY KEY NOT NULL,
            date TEXT NOT NULL,
            heures TEXT NOT NULL,
            quantite REAL NOT NULL
        );    
    `)
    return dbHydratation
}

export async function ajouterHydratation(db : any, date : string, heures : string, quantite : number) {
    return db.runAsync ('INSERT INTO hydratation(date, heures, quantite) VALUES (?,?,?)', [date,heures,quantite])
}

export async function recupererHydratation(db : any, date : string) {
    return db.getFirstAsync ('SELECT * FROM hydratation WHERE date =?', date)
}

export async function recupererToutesHydratations(db : any) {
    return db.getAllAsync ('SELECT * FROM hydratation ORDER BY date DESC')
}

export async function supprimerHydratationHeure(db : any, date : string, heures : string) {
    return db.runAsync ('DELETE FROM hydratation WHERE date =? AND heures =?', [date,heures])
}
export async function supprimerHydratation(db : any, date : string) {
    return db.runAsync ('DELETE FROM hydratation WHERE date = ?', date)
}

export async function supprimerToutesHydratations(db : any) {
    return db.runAsync ('DELETE FROM hydratation')
}


//database journal

export async function databaseJournal() {
    const dbJournal = await SQLite.openDatabaseAsync ('dataJournal')
    await dbJournal.execAsync (`
        CREATE TABLE IF NOT EXISTS journal(
            id INTEGER PRIMARY KEY NOT NULL,
            date TEXT NOT NULL,
            heures TEXT NOT NULL,
            contenu TEXT NOT NULL
        );    
    `)
    return dbJournal
}
export async function ajouterEntree(db : any, date : string, heures : string, contenu : string) {
    return db.runAsync ('INSERT INTO journal(date, heures, contenu) VALUES (?,?,?)', [date,heures,contenu])
}

export async function recupererEntree(db : any, date : string) {
    return db.getFirstAsync ('SELECT * FROM journal WHERE date =?', date)
}

export async function recupererToutesEntrees(db : any) {
    return db.getAllAsync ('SELECT * FROM journal ORDER BY date DESC')
}

export async function supprimerEntreeHeures(db : any, date : string, heures : string) {
    return db.runAsync ('DELETE FROM journal WHERE date =? AND heures =?',[date,heures])
}
export async function supprimerEntree(db : any, date : string) {
    return db.runAsync ('DELETE FROM journal WHERE date = ?', date)
}

export async function supprimerToutesEntrees(db : any) {
    return db.runAsync ('DELETE FROM journal')
}



//database utilisateur (jsp si on va l'utiliser pour le moment mais la voici au cas ou)
export async function databaseUtilisateur() {
    const dbUtilisateur = await SQLite.openDatabaseAsync ('dataUtilisateur')
    await dbUtilisateur.execAsync (`
        CREATE TABLE IF NOT EXISTS utilisateur(
            id INTEGER PRIMARY KEY NOT NULL,
            prenom TEXT NOT NULL,
            dateDeNaissance TEXT NOT NULL
        );    
    `)
    return dbUtilisateur
}

export async function ajouterUtilisateur (db : any, prenom : string, dateDeNaissance : string, age : number){
    return db.runAsync ('INSERT INTO utilisateur (prenom,dateDeNaissance) VALUES (?,?)', [prenom,dateDeNaissance,age])
}
export async function modifierDateDeNaissance(db : any, id : number, dateDeNaissance : string) {
    return db.runAsync ('UPDATE utilisateur SET dateDeNaissance WHERE id =?', [dateDeNaissance,id])
}

export async function modifierPrenom(db : any, id : number, prenom : string) {
    return db.runAsync ('UPDATE utilisateur SET prenom =? WHERE id =?', [prenom,id])
}

export async function age(db : any, id : number, age : number) {
    return db.runAsync ('UPDATE utilisateur SET age =? WHERE id =?', [age,id])
}


export async function dataBaseSuivi() {
    const dbSuivi = await SQLite.openDatabaseAsync ('dbSuivi')
    await dbSuivi.execAsync (`
        CREATE TABLE IF NOT EXISTS suivi(
        id INTEGER PRIMARY KEY NOT NULL,
        utilisateur_id INTEGER,
        date TEXT NOT NULL,
        poids REAL,
        taille REAL,
        FOREIGN KEY(utilisateur_id) REFERENCES utilisateur(id)
        );
    `)
    return dbSuivi
}
export async function ajouterMesure(db: any, utilisateur_id: number, date: string, poids: number, taille: number) {
    return db.runAsync('INSERT INTO suivi (utilisateur_id, date, poids, taille) VALUES (?,?,?,?)',[utilisateur_id, date, poids, taille]);
}


//database niveauStress
export async function databaseStress() {
    const dbStress = await SQLite.openDatabaseAsync ('dataStress')
    await dbStress.execAsync (`
        CREATE TABLE IF NOT EXISTS stress(
            id INTEGER PRIMARY KEY NOT NULL,
            date TEXT NOT NULL,
            niveau INTEGER NOT NULL,
            niveauAssocie TEXT NOT NULL
        );    
    `)
    return dbStress
}

export async function ajouterStress(db : any, date : string, niveau : number, niveauAssocie : string) {
    return db.runAsync ('INSERT INTO stress(date,niveau,niveauAssocie) VALUES (?,?,?)', [date,niveau,niveauAssocie])
}

export async function recupererTousStress (db : any){
    return db.getAllAsync ('SELECT * FROM stress ORDER BY date DESC')
}

export async function supprimerStress (db : any, date : string){
    return db.runAsync ('DELETE FROM stress WHERE date =?', date)
}

export async function supprimerTousStress (db : any){
    return db.runAsync ('DELETE FROM stress')
}

//database alimentation 

export async function databaseAlimentation() {
    const dbAlimentation = await SQLite.openDatabaseAsync ('dataAlimentation')
    await dbAlimentation.execAsync (`
        CREATE TABLE IF NOT EXISTS alimentation (
        id INTEGER PRIMARY KEY NOT NULL,
        date TEXT NOT NULL,
        repas TEXT NOT NULL,
        contenu TEXT NOT NULL
        )
    `)
    return dbAlimentation
}

export async function ajouterAliment (db : any, date : string, nom : string){
    return db.runAsync ('INSERT INTO alimentation (date,nom)')
}

//database habitude

export async function databaseHabitudes () {
    const dbHabitudes = await SQLite.openDatabaseAsync ('dataHabitudes')
    await dbHabitudes.execAsync (`
        CREATE TABLE IF NOT EXISTS habitudes (
            id INTERGER PRIMARY KEY NOT NULL,
            date TEXT NOT NULL,
            contenu TEXT NOT NULL,
            faite INTEGER NOT NULL
        )
        
    `)
    return dbHabitudes
}

export async function databaseHabitudesFaites (){
    const dbHabitudesFaites = await SQLite.openDatabaseAsync ('dataHabitudesFaites')
    await dbHabitudesFaites.execAsync (`
        CREATE TABLE IF NOT EXISTS habitudesFaites (
        id INTEGER PRIMARY KEY NOT NULL,
        dateFaite TEXT NOT NULL,
        contenu TEXT NOT NULL
        )        
    `)
    return dbHabitudesFaites
}


export async function ajouterHabitudes(db : any, date : string, contenu : string) {
    return db.runAsync ('INSERT INTO habitudes (date, contenu) VALUES (?,?)', [date,contenu])
}
export async function supprimerHabitude(db : any, contenu : string) {
    return db.runAsync ('DELETE FROM habitudes WHERE contenu = ?', contenu)
}
export async function supprimerToutesHabitudes(db : any) {
    return db.runAsync ('DELETE FROM habitudes')
}

export async function recupererHabitude(db : any, contenu : string) {
    return db.runAsync ('SELECT * FROM habitudes WHERE contenu = ?', contenu)
}
export async function creerTrackingHabitudesFaites(db : any, contenu : string, faite : boolean) {
    return db.runAsync (`INSERT INTO habitudesFaites SELECT * FROM habitudes WHERE faite = true`, faite)
}

export async function recupererHabitudeFaite(db : any, contenu : string) {
    return db.runAsync ('SELECT * FROM habitudesFaites WHERE contenu = ?', contenu)
}

export async function recupererToutesHabitudesFaites (db : any) {
    return db.runAsync ('SELECT * FROM habitudesFaites')
}*/