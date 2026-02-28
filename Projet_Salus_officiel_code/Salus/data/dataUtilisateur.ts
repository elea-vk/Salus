import * as SQLite from 'expo-sqlite';

//https://www.w3schools.com/sql/sql_delete.asp

//database sommeil
export async function dataBaseSommeil() {
    
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
    return db.getAllAsync ('SELECT * FROM activite')
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
            date TEXT NOT NULL
            heures TEXT NOT NULL
            quantite REAL NOT NULL
        );    
    `)
}

export async function ajouterHydratation(db : any, date : string, heures : string, quantite : number) {
    return db.runAsync ('INSERT INTO hydratation(date, heures, quantite), VALUES (?,?,?)', [date,heures,quantite])
}

export async function recupererHydratation(db : any, date : string) {
    return db.getFirstAsync ('SELECT * FROM hydratation WHERE date =?', date)
}

export async function recupererToutesHydratations(db : any) {
    return db.getAllAsync ('SELECT * FROM hydratation')
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
            date TEXT NOT NULL
            heures TEXT NOT NULL
            contenu TEXT NOT NULL
        );    
    `)
}
export async function ajouterEntree(db : any, date : string, heures : string, quantite : number) {
    return db.runAsync ('INSERT INTO journal(date, heures, quantite), VALUES (?,?,?)', [date,heures,quantite])
}

export async function recupererEntree(db : any, date : string) {
    return db.getFirstAsync ('SELECT * FROM journal WHERE date =?', date)
}

export async function recupererToutesEntrees(db : any) {
    return db.getAllAsync ('SELECT * FROM journal')
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
    const dbJournal = await SQLite.openDatabaseAsync ('dataUtilisateur')
    await dbJournal.execAsync (`
        CREATE TABLE IF NOT EXISTS utilisateur(
            id INTEGER PRIMARY KEY NOT NULL,
            email TEXT NOT NULL,
            motDePasse TEXT NOT NULL,
        );    
    `)
}

export async function modifierMotDePasse(db : any, nouveauMotDePasse : string) {
    return db.runAsync ('UPDATE utilisateur SET motDePasse =? WHERE id = ?)', [nouveauMotDePasse])
}

export async function supprimerCompte(db : any, email : string) {
    return db.runAsync ('DELETE FROM utilisateur WHERE email =?', email)
}


//database niveauStress
export async function databaseStress() {
    const dbStress = await SQLite.openDatabaseAsync ('dataStress')
    await dbStress.execAsync (`
        CREATE TABLE IF NOT EXISTS stress(
            id INTEGER PRIMARY KEY NOT NULL,
            date TEXT NOT NULL,
            niveau TEXT NOT NULL,
        );    
    `)
}

export async function ajouterStress(db : any, date : string, niveau : number) {
    return db.runAsync ('INSERT INTO stress')
}

//database alimentation