import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView, Alert, Platform, StatusBar } from "react-native";
import { AuthHeader, OTPInput, PrimaryButton } from '../../components/AuthComponents';
import { useAuthStore } from '../../store/useAuthStore';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

interface Props {
    navigation: StackNavigationProp<any>;
    route: RouteProp<any, any>;
}

const EmailVerificationScreen = ({ navigation, route }: Props) => {
    const { verifyOtp, loading } = useAuthStore();
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(30);

    const email = route.params?.email || 'your email';

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleVerify = async () => {
        if (otp.length < 6) return;
        const success = await verifyOtp(otp);
        if (success) {
            // Navigate to Main Stack
            navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
            });
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
                    subtitle={`Please enter the code we sent to ${email}`}
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

                {timer === 0 && (
                    <TouchableOpacity onPress={() => { setTimer(30); /* mock resend */ }}>
                        <Text style={styles.resendLink}>Resend Code</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' , paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
    container: { padding: 24, flex: 1 , paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
    backBtn: { marginBottom: 20 },
    backArrow: { fontSize: 24, fontWeight: 'bold' },
    timerText: { textAlign: 'center', marginBottom: 20, color: '#666' },
    resendLink: { textAlign: 'center', marginTop: 20, color: '#000', fontWeight: 'bold' }
});

export default EmailVerificationScreen;
