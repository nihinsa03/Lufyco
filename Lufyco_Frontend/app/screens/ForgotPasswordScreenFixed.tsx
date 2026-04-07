import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform, StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../store/useAuthStore";

const ForgotPasswordScreen = () => {
    const navigation = useNavigation<any>();
    const { requestPasswordReset, loading } = useAuthStore();
    const [email, setEmail] = useState("");

    const handleSendCode = async () => {
        if (!email) {
            Alert.alert("Error", "Please enter your email address");
            return;
        }

        const success = await requestPasswordReset(email);

        if (success) {
            Alert.alert(
                "Success",
                "A 6-digit verification code has been sent to your email.",
                [
                    {
                        text: "OK",
                        onPress: () => navigation.navigate("ForgotPasswordVerification", { email })
                    }
                ]
            );
        } else {
            Alert.alert("Error", "Failed to send verification code. Please check your email and try again.");
        }
    };

    return (
        <View style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>

            {/* Title */}
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
                Enter your email for the verification process. We will send 6 digit code to your email.
            </Text>

            {/* Email Input */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputWrapper}>
                    <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        placeholderTextColor="#999"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>
            </View>

            {/* Send Code Button */}
            <TouchableOpacity
                style={[styles.sendButton, loading && styles.sendButtonDisabled]}
                onPress={handleSendCode}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.sendButtonText}>Send Code</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 30,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
    backButton: {
        alignSelf: "flex-start",
        marginTop: 60,
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        marginTop: 30,
        color: "#000",
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        marginTop: 10,
        marginBottom: 40,
        lineHeight: 20,
    },
    inputContainer: {
        marginBottom: 30,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 10,
        color: "#000",
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 12,
        paddingHorizontal: 15,
        backgroundColor: "#f9fafb",
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 15,
        color: "#000",
    },
    sendButton: {
        backgroundColor: "#000",
        padding: 16,
        borderRadius: 25,
        width: "100%",
        alignItems: "center",
        marginTop: 20,
    },
    sendButtonDisabled: {
        backgroundColor: "#9ca3af",
    },
    sendButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default ForgotPasswordScreen;
