import React from "react";


import { Redirect } from "expo-router";



export default function Index() {
  return <Redirect href="/ouverture" />; // redirige l'application vers la page d'ouverture au lieu d'ouvrir sur la page index comme par défaut 
}
 