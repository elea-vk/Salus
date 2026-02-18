import { Text, View } from "react-native";
import { Button } from "react-native";
import { router } from "expo-router";

export default function Index() {
  return (
    <View style={{flex: 1,justifyContent: "center",alignItems: "center",}}>
      <Button 
        title="Aller vers Sommeil"
        onPress={() => router.push("/sommeil")}
      />
      <Button
        title = "Aller vers Stress"
        onPress ={()=>router.push("/stress")}
      />
      <Button
        title="Aller vers Alimentation"
        onPress={()=>router.push("/alimentation")}
      />  
      <Text>test.</Text>
    </View>
  );
}
