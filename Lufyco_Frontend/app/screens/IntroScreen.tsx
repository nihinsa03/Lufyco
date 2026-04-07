import React from "react";
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, Platform, StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator"; // Import RootStackParamList

const { width } = Dimensions.get("window");

// Type the navigation prop
type IntroScreenNavigationProp = StackNavigationProp<RootStackParamList, "Intro">;

const IntroScreen = () => {
  const navigation = useNavigation<IntroScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <Image source={require("../../assets/images/clothing.png")} style={styles.image} />
      <Text style={styles.title}>Explore a wide range of {"\n"}Clothing Products</Text>
      <Text style={styles.subtitle}>
        Explore a wide range of clothing products at your fingertips. Fashion offers an extensive
        collection to suit your needs.
      </Text>
      {/* Next Button to Navigate to Offers Screen */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Offers")}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
      <View style={styles.pagination}>
        <View style={[styles.dot, styles.activeDot]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  image: {
    width: width * 0.8,
    height: 440,
    borderRadius: 20,
    resizeMode: "cover",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
  },
  subtitle: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 30, // Added space before button
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 15, // Increased vertical padding
    width: "100%", // Full width
    alignItems: "center", // Center text
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  pagination: {
    flexDirection: "row",
    marginTop: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: "#007BFF", // Blue color
  },
});

export default IntroScreen;
