import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView, Platform, StatusBar } from "react-native";
import { AuthHeader, OTPInput, PrimaryButton } from '../../components/AuthComponents';
import { useAuthStore } from '../../store/useAuthStore';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

interface Props {
    navigation: StackNavigationProp<any>;
    route: RouteProp<any, any>;
}

const ForgotPasswordOtpScreen = ({ navigation, route }: Props) => {
    const { verifyOtp, loading } = useAuthStore();
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(30);

    const email = route.params?.email || '';

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleVerify = async () => {
        // Mock verification - in real app forgot pass might use separate verify action
        // For now using verifyOtp or just navigate
        if (otp === '123456') {
            navigation.navigate('ResetPassword');
        } else {
            // Alert or error state
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>

                <AuthHeader
                    title="Email Verification"
                    subtitle={`Enter the code sent to ${email}`}
                />

                <OTPInput otp={otp} setOtp={setOtp} />

                <Text style={styles.timerText}>
                    {timer > 0 ? `Resend code in 00:${timer < 10 ? `0${timer}` : timer}` : 'Resend code now'}
                </Text>

                <PrimaryButton
                    title="Verify"
                    onPress={handleVerify}
                    loading={loading}
                    disabled={otp.length !== 6}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' , paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
    container: { padding: 24, flex: 1 , paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
    backBtn: { marginBottom: 20 },
    backArrow: { fontSize: 24, fontWeight: 'bold' },
    timerText: { textAlign: 'center', marginBottom: 20, color: '#666' }
});

export default ForgotPasswordOtpScreen;
