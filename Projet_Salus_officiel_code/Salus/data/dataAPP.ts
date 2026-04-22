import * as SQLite from 'expo-sqlite';

let dbInstance: any = null;


export async function initDatabase() {
    
    if (dbInstance) return dbInstance;
    
    dbInstance = await SQLite.openDatabaseAsync("app.db");
    await dbInstance.execAsync(`PRAGMA foreign_keys = ON;`);

  await dbInstance.execAsync(`
    CREATE TABLE IF NOT EXISTS utilisateur(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prenom TEXT NOT NULL,
      dateDeNaissance TEXT NOT NULL,
      sexe TEXT NOT NULL
    )
  `);

  await dbInstance.execAsync(`
    CREATE TABLE IF NOT EXISTS suivi(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      utilisateur_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      poids REAL,
      taille REAL,
      FOREIGN KEY(utilisateur_id) REFERENCES utilisateur(id)
    )
  `);

  await dbInstance.execAsync(`
    CREATE TABLE IF NOT EXISTS sommeil(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT UNIQUE,
      heuresSommeil REAL NOT NULL
    )
  `);

  await dbInstance.execAsync(`
    CREATE TABLE IF NOT EXISTS activite(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      date TEXT NOT NULL,
      tempsActivite REAL NOT NULL
    )
  `);

  await dbInstance.execAsync(`
    CREATE TABLE IF NOT EXISTS hydratation(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      heure TEXT NOT NULL,
      quantite REAL NOT NULL
    )
  `);

  await dbInstance.execAsync(`
    CREATE TABLE IF NOT EXISTS journal(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      heure TEXT NOT NULL,
      contenu TEXT NOT NULL
    )
  `);

  await dbInstance.execAsync(`
    CREATE TABLE IF NOT EXISTS stress(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      niveau INTEGER NOT NULL,
      niveauAssocie TEXT NOT NULL
    )
  `);

  await dbInstance.execAsync(`
    CREATE TABLE IF NOT EXISTS alimentation(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      repas TEXT NOT NULL,
      contenu TEXT NOT NULL
    )
  `);

  await dbInstance.execAsync(`
    CREATE TABLE IF NOT EXISTS habitudes(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      contenu TEXT NOT NULL,
      faite INTEGER NOT NULL
    )
  `);

  await dbInstance.execAsync(`
    CREATE TABLE IF NOT EXISTS habitudesFaites(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dateFaite TEXT NOT NULL,
      contenu TEXT NOT NULL
    )
  `);

 
 
  return dbInstance;
}
export async function ajouterNuit(db : any, date :string, heures : number) {
    return db.runAsync ('INSERT OR REPLACE INTO sommeil (date,heuresSommeil) VALUES (?,?)',[date, heures])
}

export async function recupererNuit(db : any, date : string) {
    return db.getFirstAsync('SELECT * FROM sommeil WHERE date =?', [date])
}

export async function recupererToutesNuits(db : any) {
    return db.getAllAsync ('SELECT * FROM sommeil ORDER BY date DESC')
}
export async function supprimerNuit(db : any, date : string) {
    return db.runAsync ('DELETE FROM sommeil  WHERE date =?',[date])
}

export async function supprimerToutesNuits(db : any) {
    return db.runAsync ('DELETE FROM sommeil')
}


export async function ajouterActivite(db : any, nom : string, date : string, temps : number) {
    return db.runAsync ('INSERT INTO activite (nom,date,tempsActivite) VALUES (?,?,?)',[nom,date,temps])
}

export async function recupererActivitesParDate(db: any, date: string) {
  return db.getAllAsync('SELECT * FROM activite WHERE date = ?',[date]);
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
    return db.runAsync ('DELETE FROM activite WHERE date =?', [date])    
}


export async function ajouterHydratation(db : any, date : string, heure : string, quantite : number) {
    return db.runAsync ('INSERT INTO hydratation(date, heure, quantite) VALUES (?,?,?)', [date,heure,quantite])
}

export async function recupererHydratationsParDate(db: any, date: string) {
  return db.getAllAsync('SELECT * FROM hydratation WHERE date = ?',[date]);
}

export async function recupererToutesHydratations(db : any) {
    return db.getAllAsync ('SELECT * FROM hydratation ORDER BY date DESC')
}

export async function supprimerHydratationHeure(db : any, date : string, heure : string) {
    return db.runAsync ('DELETE FROM hydratation WHERE date =? AND heure =?', [date,heure])
}
export async function supprimerHydratation(db : any, date : string) {
    return db.runAsync ('DELETE FROM hydratation WHERE date = ?', [date])
}

export async function supprimerToutesHydratations(db : any) {
    return db.runAsync ('DELETE FROM hydratation')
}


export async function ajouterEntree(db : any, date : string, heure : string, contenu : string) {
    return db.runAsync ('INSERT INTO journal(date, heure, contenu) VALUES (?,?,?)', [date,heure,contenu])
}

export async function recupererEntree(db : any, date : string) {
    return db.getFirstAsync ('SELECT * FROM journal WHERE date =?', [date])
}

export async function recupererToutesEntrees(db : any) {
    return db.getAllAsync ('SELECT * FROM journal ORDER BY date DESC')
}

export async function supprimerEntreeHeures(db : any, date : string, heure : string) {
    return db.runAsync ('DELETE FROM journal WHERE date =? AND heure =?',[date,heure])
}
export async function supprimerEntree(db : any, date : string) {
    return db.runAsync ('DELETE FROM journal WHERE date = ?', [date])
}

export async function supprimerToutesEntrees(db : any) {
    return db.runAsync ('DELETE FROM journal')
}




export async function ajouterUtilisateur (db : any, prenom : string, dateDeNaissance : string,sexe : string){
    return db.runAsync ('INSERT INTO utilisateur (prenom,dateDeNaissance,sexe) VALUES (?,?,?)', [prenom,dateDeNaissance,sexe])
}
export async function modifierDateDeNaissance(db : any, id : number, dateDeNaissance : string) {
    return db.runAsync ('UPDATE utilisateur SET dateDeNaissance =? WHERE id =?', [dateDeNaissance,id])
}

export async function modifierPrenom(db : any, id : number, prenom : string) {
    return db.runAsync ('UPDATE utilisateur SET prenom =? WHERE id =?', [prenom,id])
}

/*export async function age(db : any, id : number, age : number) {
    return db.runAsync ('UPDATE utilisateur SET age =? WHERE id =?', [age,id])
}*/
export async function getUtilisateur(db: any) {
  return db.getFirstAsync('SELECT * FROM utilisateur LIMIT 1');
}

export async function supprimerUtilisateur(db : any, id : number) {
    return db.runAsync ('DELETE FROM utilisateur WHERE id =?', [id])
}

export async function modifierSexe (db : any, id : number, sexe : string){
    return db.runAsync ('UPDATE utilisateur SET sexe =? WHERE id =?', [sexe,id])
}




export async function ajouterMesure(db: any, utilisateur_id: number, date: string, poids: number, taille: number) {
    return db.runAsync('INSERT INTO suivi (utilisateur_id, date, poids, taille) VALUES (?,?,?,?)',[utilisateur_id, date, poids, taille]);
}
export async function getDernierSuivi(db: any, utilisateur_id: number) {
  return db.getFirstAsync(`SELECT * FROM suivi WHERE utilisateur_id = ? ORDER BY date DESC LIMIT 1`,[utilisateur_id]);
}


export async function ajouterStress(db : any, date : string, niveau : number, niveauAssocie : string) {
    return db.runAsync ('INSERT INTO stress(date,niveau,niveauAssocie) VALUES (?,?,?)', [date,niveau,niveauAssocie])
}

export async function recupererTousStress (db : any){
    return db.getAllAsync ('SELECT * FROM stress ORDER BY date DESC')
}

export async function supprimerStress (db : any, date : string){
    return db.runAsync ('DELETE FROM stress WHERE date =?', [date])
}

export async function supprimerTousStress (db : any){
    return db.runAsync ('DELETE FROM stress')
}



export async function ajouterHabitudes(db : any, date : string, contenu : string) {
    return db.runAsync ('INSERT INTO habitudes (date, contenu,faite) VALUES (?,?,?)', [date,contenu,0])
}
export async function supprimerHabitude(db : any, contenu : string) {
    return db.runAsync ('DELETE FROM habitudes WHERE contenu = ?', [contenu])
}
export async function supprimerToutesHabitudes(db : any) {
    return db.runAsync ('DELETE FROM habitudes')
}

export async function recupererHabitude(db : any, contenu : string) {
    return db.getFirstAsync('SELECT * FROM habitudes WHERE contenu = ?',[contenu]);
}
export async function ajouterHabitudeFaite(db: any, date: string, contenu: string) {
  return db.runAsync('INSERT INTO habitudesFaites (dateFaite, contenu) VALUES (?,?)',[date, contenu]);
}

export async function recupererHabitudeFaite(db : any, contenu : string) {
    return db.getFirstAsync ('SELECT * FROM habitudesFaites WHERE contenu = ?', contenu)
}

export async function recupererToutesHabitudesFaites (db : any) {
    return db.getAllAsync ('SELECT * FROM habitudesFaites')
}


