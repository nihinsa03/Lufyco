import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform, StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator"; // Import RootStackParamList

// Type the navigation prop
type PasswordResetSuccessScreenNavigationProp = StackNavigationProp<RootStackParamList, "PasswordResetSuccess">;

const PasswordResetSuccessScreen = () => {
  const navigation = useNavigation<PasswordResetSuccessScreenNavigationProp>();

  return (
    <View style={styles.container}>
      {/* Success Icon */}
      <Image source={require("../../assets/images/lock.png")} style={styles.successImage} />

      {/* Title */}
      <Text style={styles.title}>New password set successfully</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Congratulations! Your password has been set successfully. Please proceed to the login screen to verify your account.
      </Text>

      {/* Login Button */}
      <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate("Login")}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingHorizontal: 20,
    justifyContent: "center",
  paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  successImage: {
    width: 150,
    height: 220,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  loginButton: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PasswordResetSuccessScreen;
