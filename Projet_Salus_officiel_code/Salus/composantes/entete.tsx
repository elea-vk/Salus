import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import Couleurs from "../constantes/couleurs";

export default function Header({
  title,
  showBack = false,
}: {
  title: string;
  showBack?: boolean;
}) {
  return (
    <View style={styles.header}>

      {/* BACK BUTTON */}
      {showBack ? (
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={26} color={Couleurs.darkText} />
        </Pressable>
      ) : (
        <View style={{ width: 26 }} /> // keeps title centered
      )}

      {/* TITLE */}
      <Text style={styles.title}>{title}</Text>

      {/* EMPTY RIGHT SIDE (for symmetry) */}
      <View style={{ width: 26 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    backgroundColor: Couleurs.secondary,
    borderBottomWidth: 1,
    borderColor: Couleurs.darkText,
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
});