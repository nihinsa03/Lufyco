import React from 'react';
import { View, StyleSheet, Text, SafeAreaView, Dimensions, Platform, StatusBar } from "react-native";
import { PrimaryButton } from '../../components/AuthComponents';
import { Feather } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';

interface Props {
    navigation: StackNavigationProp<any>;
}

const PasswordResetSuccessScreen = ({ navigation }: Props) => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.iconCircle}>
                        <Feather name="check" size={50} color="#fff" />
                    </View>

                    <Text style={styles.title}>New password set successfully</Text>
                    <Text style={styles.subtitle}>
                        Congratulations! Your password has been set successfully.
                        Please proceed to login.
                    </Text>
                </View>

                <PrimaryButton
                    title="Login"
                    onPress={() => navigation.navigate('Login')}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' , paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
    container: { padding: 24, flex: 1, justifyContent: 'space-between' , paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
    content: { alignItems: 'center', marginTop: 100 },
    iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
    subtitle: { fontSize: 16, textAlign: 'center', color: '#666', lineHeight: 24 }
});

export default PasswordResetSuccessScreen;
