import { Text, View } from "react-native";
import { router } from "expo-router";
import { Pressable, StyleSheet, } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import React from 'react';



export default function Index() {
  return (
    <View style={styles.container}>
      
      <Pressable 
        style={({ pressed }) => [
          styles.iconButton,
          { backgroundColor: pressed ? '#f8fafa' : '#efb6d4' } // Feedback
        ]}
        onPress={() => router.push("/stress")}
      >
        <Ionicons name="heart-outline" size={40} color="white" />
      </Pressable>
      <Pressable 
        style={({ pressed }) => [
          styles.iconButton,
          { backgroundColor: pressed ? '#f8fafa' : '#efb6d4' } // Feedback
        ]}
        onPress={() => router.push("/alimentation")}
      >
        <Ionicons name="restaurant-outline" size={40} color="white" />
      </Pressable>
      
      <Pressable 
        style={({ pressed }) => [
          styles.iconButton,
          { backgroundColor: pressed ? '#f8fafa' : '#efb6d4' } // Feedback
        ]}
        onPress={() => router.push("/sommeilPage")}
      >
        <Ionicons name="moon-outline" size={40} color="white" />
        
      </Pressable>
     
     
      <Pressable style={({ pressed }) => [
        styles.iconButton,
        { backgroundColor: pressed ? '#f8fafa' : '#efb6d4' }
      ]}
      onPress={() => router.push("/musculation")}
    >
      <Ionicons name="barbell-outline" size={40} color="white" />
    </Pressable>

    <Pressable style={({ pressed }) => [
      styles.iconButton,
      { backgroundColor: pressed ? '#f8fafa' : '#efb6d4' } // Feedback  
    ]}
    onPress={() => router.push("/graphique")}
    >
      <Ionicons name="bar-chart-outline" size={40} color="white" />
    </Pressable>

      
    </View>
    
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#e8c0d7',
    gap:16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton: {
    width: 90, // Square width
    height: 90, // Square height
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3, // Shadow for Android
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
});
