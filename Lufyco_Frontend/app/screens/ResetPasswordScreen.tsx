import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform, StatusBar } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../store/useAuthStore";

type RouteParams = {
  ResetPassword: {
    email: string;
    otp: string;
  };
};

const ResetPasswordScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'ResetPassword'>>();
  const { resetPassword, loading } = useAuthStore();

  const email = route.params?.email || '';
  const otp = route.params?.otp || '';

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSave = async () => {
    if (!password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match. Please try again.");
      return;
    }

    const success = await resetPassword(email, otp, password);

    if (success) {
      Alert.alert(
        "Success!",
        "Your password has been reset successfully. You can now login with your new password.",
        [
          {
            text: "Login",
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
    } else {
      Alert.alert("Error", "Failed to reset password. Please try again or request a new code.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#000" />
        <Text style={styles.backText}>  Create Password</Text>
      </TouchableOpacity>

      {/* Step Indicator */}
      <Text style={styles.stepIndicator}>03/03</Text>

      {/* Title */}
      <Text style={styles.title}>New Password</Text>
      <Text style={styles.subtitle}>Enter your new password and remember it.</Text>

      {/* Password Input */}
      <Text style={styles.label}>Password</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Enter your Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={22}
            color="#999"
          />
        </TouchableOpacity>
      </View>

      {/* Confirm Password Input */}
      <Text style={styles.label}>Confirm Password</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Re-enter your Password"
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <Ionicons
            name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
            size={22}
            color="#999"
          />
        </TouchableOpacity>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingHorizontal: 30,
  paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  backButton: {
    alignSelf: "flex-start",
    marginTop: 60,
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  stepIndicator: {
    alignSelf: "flex-end",
    fontSize: 14,
    color: "#777",
    marginTop: -20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    color: "#000",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    marginTop: 8,
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
    color: "#000",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 15,
    width: "100%",
    marginBottom: 20,
    backgroundColor: "#f9fafb",
  },
  passwordInput: {
    flex: 1,
    height: 50,
    fontSize: 15,
    color: "#000",
  },
  saveButton: {
    backgroundColor: "#000",
    padding: 16,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ResetPasswordScreen;
