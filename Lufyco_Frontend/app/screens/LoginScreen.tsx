import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView, SafeAreaView, Alert, Platform, StatusBar } from "react-native";
import { AuthHeader, AuthInput, PrimaryButton, SocialRow } from '../components/AuthComponents';
import { useAuthStore } from '../store/useAuthStore';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../context/ThemeContext';

interface Props {
  navigation: StackNavigationProp<any>;
}

const LoginScreen = ({ navigation }: Props) => {
  const { login, loading } = useAuthStore();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLogin = async () => {
    // START: Bypass for quick testing (skips backend entirely)
    // AppNavigator automatically switches to app stack when isAuthenticated = true
    if (email.toLowerCase() === 'user' && password === 'user') {
      useAuthStore.setState({
        user: { id: 'offline_user', name: 'Offline User', email: 'user', verified: true },
        token: 'offline-token-123',
        isAuthenticated: true,
        loading: false,
      });
      return; // No navigation.reset() needed — AppNavigator handles it
    }
    // END: Bypass

    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    const success = await login({ email: email.trim(), password });
    if (!success) {
      const { error } = useAuthStore.getState();
      Alert.alert("Login Failed", error || "Invalid credentials");
    }
    // No navigation.reset() needed — AppNavigator automatically switches stack on isAuthenticated
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <AuthHeader
          title="Log in to your account"
          subtitle="Welcome back! Please enter your details."
        />

        <AuthInput
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          icon="mail"
          keyboardType="email-address"
        />

        <AuthInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry={!isPasswordVisible}
          icon="lock"
          rightIcon={isPasswordVisible ? "eye" : "eye-off"}
          onRightIconPress={() => setIsPasswordVisible(!isPasswordVisible)}
        />

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotPass}>Forgot Password?</Text>
        </TouchableOpacity>

        <PrimaryButton
          title="Login"
          onPress={handleLogin}
          loading={loading}
        />

        <Text style={styles.orText}>or continue with</Text>

        <SocialRow />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.link}>Sign up</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background , paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  container: { padding: 24, paddingBottom: 50 , paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  backBtn: { marginBottom: 20 },
  backArrow: { fontSize: 24, fontWeight: 'bold', color: colors.text },
  forgotPass: { textAlign: 'right', color: colors.text, fontWeight: 'bold', marginBottom: 20 },
  orText: { textAlign: 'center', marginVertical: 20, color: colors.textSecondary },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { color: colors.textSecondary },
  link: { color: colors.text, fontWeight: 'bold' }
});

export default LoginScreen;
