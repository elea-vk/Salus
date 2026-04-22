import { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { dataBaseSommeil, recupererToutesNuits } from "@/data/dataUtilisateur";
import Couleurs from "../constantes/couleurs";

const GraphiqueSommeil = () => {
  const [donnee, setDonnee] = useState([]);

  useEffect(() => {
    async function init() {
      const db = await dataBaseSommeil();
      const toutesNuits = await recupererToutesNuits(db);

      const transfData = toutesNuits
        .sort(
          (a: any, b: any) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        )
        .map((item: any) => ({
          value: item.heuresSommeil,
          label: item.date.slice(5, 10), // MM-DD
          frontColor: Couleurs.primary,
        }));

      setDonnee(transfData);
    }

    init();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Évolution du sommeil</Text>

      {donnee.length === 0 ? (
        <Text style={styles.emptyText}>
          Aucune donnée pour le moment
        </Text>
      ) : (
        <LineChart
          data={donnee}
          spacing={45}
          thickness={4}
          color={Couleurs.primary}
          dataPointsColor={Couleurs.darkText}
          hideRules
          yAxisColor={Couleurs.darkText}
          xAxisColor={Couleurs.darkText}
          yAxisThickness={2}
          xAxisThickness={2}
          curved
          startFillColor={Couleurs.primary}
          endFillColor="transparent"
          startOpacity={0.2}
          endOpacity={0}
        />
      )}
    </View>
  );
};

export default GraphiqueSommeil;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Couleurs.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: Couleurs.darkText,
  },

  emptyText: {
    fontSize: 16,
    color: "#666",
  },
});