import React, { useState } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Platform, StatusBar } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "ChangePassword">;

const ChangePasswordScreen: React.FC<Props> = ({ navigation }) => {
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            Alert.alert("Error", "Please fill all fields");
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "New passwords do not match");
            return;
        }

        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            Alert.alert("Success", "Password changed successfully", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        }, 1500);
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 6 }}>
                    <Feather name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Change Password</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <Text style={styles.label}>Old Password</Text>
                <TextInput
                    style={styles.input}
                    secureTextEntry
                    placeholder="Enter old password"
                    placeholderTextColor={colors.textMuted}
                    value={oldPassword}
                    onChangeText={setOldPassword}
                />

                <Text style={styles.label}>New Password</Text>
                <TextInput
                    style={styles.input}
                    secureTextEntry
                    placeholder="Enter new password"
                    placeholderTextColor={colors.textMuted}
                    value={newPassword}
                    onChangeText={setNewPassword}
                />

                <Text style={styles.label}>Confirm New Password</Text>
                <TextInput
                    style={styles.input}
                    secureTextEntry
                    placeholder="Confirm new password"
                    placeholderTextColor={colors.textMuted}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />

                <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
                    {loading ? <ActivityIndicator color={isDark ? "#111" : "#fff"} /> : <Text style={styles.btnText}>Change Password</Text>}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background , paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
    headerTitle: { fontSize: 18, fontWeight: "700", color: colors.text },

    content: { padding: 20 },
    label: { fontWeight: "700", marginBottom: 8, marginTop: 16, color: colors.text },
    input: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, backgroundColor: colors.inputBg, color: colors.text },

    btn: { backgroundColor: isDark ? "#fff" : "#111", height: 50, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 32 },
    btnText: { color: isDark ? "#111" : "#fff", fontWeight: "700", fontSize: 16 },
});

export default ChangePasswordScreen;
