import React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { Redirect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

import Couleurs from "../constantes/couleurs";

export default function Index() {
  return <Redirect href="/ouverture" />;
}