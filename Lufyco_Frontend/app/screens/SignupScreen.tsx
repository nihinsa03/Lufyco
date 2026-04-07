import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, TextInput, ScrollView, SafeAreaView, Alert, ActivityIndicator, Image, Modal, Dimensions, Platform, StatusBar, KeyboardAvoidingView } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import { StackNavigationProp } from '@react-navigation/stack';
import { validateEmail, getEmailValidationError, isGmailEmail } from '../utils/emailValidation';
import { useTheme } from '../context/ThemeContext';

interface Props {
  navigation: StackNavigationProp<any>;
}

const SignupScreen = ({ navigation }: Props) => {
  const { signup, loading, error } = useAuthStore();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPhoneKeypad, setShowPhoneKeypad] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleEmailChange = (text: string) => {
    setEmail(text);
    // Clear error when user starts typing
    if (emailError) setEmailError('');
  };

  const handleEmailBlur = () => {
    // Validate email when user leaves the field
    const error = getEmailValidationError(email);
    setEmailError(error);
  };

  const handleSignup = async () => {
    // Validate all fields
    if (!name || !phone || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    // Validate phone number (basic validation)
    if (phone.length < 10) {
      Alert.alert("Error", "Please enter a valid phone number (minimum 10 digits)");
      return;
    }

    // Validate email
    const emailValidationError = getEmailValidationError(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      Alert.alert("Invalid Email", emailValidationError);
      return;
    }

    // Check password match
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    // Check password length
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    const success = await signup({ name, phone, email, password });

    if (success) {
      // Navigate to verification screen with email
      navigation.navigate('Verification', { email });
    } else if (error) {
      Alert.alert("Signup Failed", error);
    }
  };

  const handlePhoneKeyPress = (value: string) => {
    if (value === "C") {
      setPhone(""); // Clear
    } else if (value === "<-") {
      setPhone(phone.slice(0, -1)); // Backspace
    } else if (phone.length < 15) {
      setPhone(phone + value); // Add digit
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.brandName}>Fashion</Text>

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerContainer}>
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Make your life More Smarter</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter Name"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.phoneInputWrapper}>
            <TextInput
              style={[styles.input, styles.phoneInputField]}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter Phone Number"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              maxLength={15}
            />
            <TouchableOpacity
              style={styles.keypadIconButton}
              onPress={() => setShowPhoneKeypad(true)}
            >
              <Ionicons name="keypad-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={[styles.input, emailError ? styles.inputError : null]}
            value={email}
            onChangeText={handleEmailChange}
            onBlur={handleEmailBlur}
            placeholder="Enter your Email Address"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}
          {email && validateEmail(email) && !emailError ? (
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.successText}>
                {isGmailEmail(email) ? 'Gmail address verified ✓' : 'Valid email address ✓'}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your Password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your Password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
              <Ionicons name={showConfirmPassword ? "eye" : "eye-off"} size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.signUpButton}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            Already have an account? <Text style={{ fontWeight: 'bold', color: colors.text }} onPress={() => navigation.navigate('Login')}>Login</Text>
          </Text>
        </View>

        <View style={styles.orContainer}>
          <View style={styles.divider} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.divider} />
        </View>

        <View style={{ alignItems: 'center' }}>
          <Text style={styles.socialLoginText}>Sign up with Social Networks</Text>
          <View style={styles.socialIconsContainer}>
            <TouchableOpacity>
              <Image source={require('../../assets/images/facebook.png')} style={styles.socialIcon} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image source={require('../../assets/images/instagram.png')} style={styles.socialIcon} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image source={require('../../assets/images/googlec.png')} style={styles.socialIcon} />
            </TouchableOpacity>
            {/* Assuming tiktok/twitter icon based on other assets or similar placeholder */}
            <TouchableOpacity>
              <Image source={require('../../assets/images/tiktok.png')} style={styles.socialIcon} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Phone Number Keypad Modal */}
      <Modal
        visible={showPhoneKeypad}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPhoneKeypad(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPhoneKeypad(false)}
        >
          <View style={styles.keypadContainer}>
            <View style={styles.keypadHeader}>
              <Text style={styles.keypadTitle}>Enter Phone Number</Text>
              <TouchableOpacity onPress={() => setShowPhoneKeypad(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.phoneDisplay}>
              <Text style={styles.phoneDisplayText}>{phone || '0'}</Text>
            </View>

            <View style={styles.keypad}>
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "<-", "0", "C"].map((key) => (
                <TouchableOpacity
                  key={key}
                  style={styles.key}
                  onPress={() => handlePhoneKeyPress(key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.keyText}>{key}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setShowPhoneKeypad(false)}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  , paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  container: {
    padding: 24,
    paddingTop: 10,
    flexGrow: 1
  },
  brandName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
    marginTop: 10
  },
  backBtn: {
    marginBottom: 20,
  },
  headerContainer: {
    marginBottom: 25,
    alignItems: 'center'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center'
  },
  inputContainer: {
    marginBottom: 16
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 6
  },
  input: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text
  },
  eyeIcon: {
    padding: 4
  },
  signUpButton: {
    backgroundColor: isDark ? '#fff' : '#0c0c0c',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
    marginHorizontal: 30
  },
  signUpButtonText: {
    color: isDark ? '#111' : '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  footerContainer: {
    alignItems: 'center',
    marginBottom: 20
  },
  footerText: {
    fontSize: 13,
    color: colors.text
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
    paddingHorizontal: 30
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border
  },
  orText: {
    marginHorizontal: 10,
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text
  },
  socialLoginText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 15
  },
  socialIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20
  },
  socialIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain'
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  successText: {
    color: '#10b981',
    fontSize: 12,
    marginLeft: 4,
  },
  phoneInput: {
    justifyContent: 'center',
  },
  phoneInputWrapper: {
    position: 'relative',
  },
  phoneInputField: {
    paddingRight: 45,
  },
  keypadIconButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 8,
  },
  phoneText: {
    fontSize: 14,
    color: '#000',
  },
  phonePlaceholder: {
    fontSize: 14,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  keypadContainer: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  keypadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  keypadTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  phoneDisplay: {
    backgroundColor: colors.inputBg,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  phoneDisplayText: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 2,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  key: {
    width: (Dimensions.get('window').width - 80) / 3,
    padding: 20,
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 12,
  },
  keyText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
  },
  doneButton: {
    backgroundColor: isDark ? '#fff' : '#000',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  doneButtonText: {
    color: isDark ? '#111' : '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SignupScreen;
