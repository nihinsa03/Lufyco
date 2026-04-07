import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView, Alert, Platform, StatusBar } from "react-native";
import { AuthHeader, AuthInput, PrimaryButton } from '../../components/AuthComponents';
import { useAuthStore } from '../../store/useAuthStore';
import { StackNavigationProp } from '@react-navigation/stack';

interface Props {
    navigation: StackNavigationProp<any>;
}

const NewPasswordScreen = ({ navigation }: Props) => {
    const { resetPassword, loading } = useAuthStore();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSave = async () => {
        if (!password || !confirmPassword) {
            Alert.alert("Error", "Please fill all fields");
            return;
        }
        if (password.length < 8) {
            Alert.alert("Error", "Password must be at least 8 characters");
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        await resetPassword(password);
        navigation.navigate('PasswordResetSuccess');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>

                <AuthHeader
                    title="Create New Password"
                    subtitle="Your new password must be different from previous used passwords."
                />

                <AuthInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    secureTextEntry
                    icon="lock"
                />

                <AuthInput
                    label="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm your password"
                    secureTextEntry
                    icon="lock"
                />

                <PrimaryButton
                    title="Save Password"
                    onPress={handleSave}
                    loading={loading}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' , paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
    container: { padding: 24, flex: 1 , paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
    backBtn: { marginBottom: 20 },
    backArrow: { fontSize: 24, fontWeight: 'bold' }
});

export default NewPasswordScreen;
