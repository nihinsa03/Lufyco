import React, { useMemo, useRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Keyboard, Platform, StatusBar } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../store/useAuthStore";

type RouteParams = {
  Verification: {
    email: string;
  };
};

const OTP_LENGTH = 6;

const VerificationScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'Verification'>>();
  const { verifyEmail, resendOTP, loading } = useAuthStore();

  const email = route.params?.email || '';

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [resending, setResending] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  const otpString = useMemo(() => otp.join(""), [otp]);
  const isOtpComplete = otpString.length === OTP_LENGTH && !otp.includes("");

  const focusIndex = (index: number) => {
    if (index < 0 || index >= OTP_LENGTH) return;
    inputRefs.current[index]?.focus();
  };

  const clearOtp = () => {
    setOtp(Array(OTP_LENGTH).fill(""));
    focusIndex(0);
  };

  const handleChangeAtIndex = (text: string, index: number) => {
    const clean = text.replace(/\D/g, "");

    // Handle paste of full code (or multiple digits)
    if (clean.length > 1) {
      const digits = clean.slice(0, OTP_LENGTH).split("");
      const filled = Array(OTP_LENGTH).fill("");
      for (let i = 0; i < digits.length; i++) filled[i] = digits[i];
      setOtp(filled);

      const next = Math.min(digits.length, OTP_LENGTH - 1);
      focusIndex(next);
      return;
    }

    // Single digit entry
    const digit = clean.slice(-1) || "";
    setOtp((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });

    if (digit) {
      if (index < OTP_LENGTH - 1) focusIndex(index + 1);
      else Keyboard.dismiss();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace") {
      // If current is empty -> go previous and clear it
      if (otp[index] === "") {
        if (index > 0) {
          setOtp((prev) => {
            const next = [...prev];
            next[index - 1] = "";
            return next;
          });
          focusIndex(index - 1);
        }
      } else {
        // If current has value -> clear current
        setOtp((prev) => {
          const next = [...prev];
          next[index] = "";
          return next;
        });
      }
    }
  };

  const handleProceed = async () => {
    if (!isOtpComplete) {
      Alert.alert("Error", "Please enter the complete 6-digit verification code");
      return;
    }

    const success = await verifyEmail(email, otpString);

    if (success) {
      Alert.alert(
        "Success!",
        "Email verified successfully! You can now login.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
    } else {
      Alert.alert("Verification Failed", "Invalid or expired verification code. Please try again.");
      clearOtp();
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    const success = await resendOTP(email);
    setResending(false);

    if (success) {
      clearOtp();
      Alert.alert("Success", "A new verification code has been sent to your email.");
    } else {
      Alert.alert("Error", "Failed to resend verification code. Please try again.");
    }
  };

  const activeIndex = useMemo(() => {
    const idx = otp.findIndex((d) => d === "");
    return idx === -1 ? OTP_LENGTH - 1 : idx;
  }, [otp]);

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#000" />
        <Text style={styles.backText}>  Signup-Email Verification</Text>
      </TouchableOpacity>

      {/* Notification Box */}
      <View style={styles.notification}>
        <Ionicons name="information-circle" size={20} color="#3b82f6" style={{ marginRight: 8 }} />
        <Text style={styles.notificationText}>
          6-digit Verification code has been send to your email address.
        </Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>Email Verification</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit verification code sent to your email address.
      </Text>

      {/* OTP Input Boxes (Keyboard) */}
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            value={digit}
            onChangeText={(t) => handleChangeAtIndex(t, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            returnKeyType="done"
            maxLength={index === 0 ? 6 : 1} // first box supports paste
            autoCorrect={false}
            autoCapitalize="none"
            textContentType="oneTimeCode"
            importantForAutofill="yes"
            selectionColor="#3b82f6"
            style={[
              styles.otpInput,
              digit !== "" && styles.filledOtpBox,
              activeIndex === index && styles.activeOtpBox,
            ]}
          />
        ))}
      </View>

      {/* Resend Code */}
      <TouchableOpacity onPress={handleResendCode} disabled={resending}>
        {resending ? (
          <ActivityIndicator size="small" color="#3b82f6" style={{ marginBottom: 20 }} />
        ) : (
          <Text style={styles.resendCode}>Resend Code</Text>
        )}
      </TouchableOpacity>

      {/* Proceed Button */}
      <TouchableOpacity
        style={[styles.proceedButton, !isOtpComplete && styles.proceedButtonDisabled]}
        onPress={handleProceed}
        disabled={!isOtpComplete || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.proceedButtonText}>Proceed</Text>
        )}
      </TouchableOpacity>

      {/* Clear Button */}
      <TouchableOpacity onPress={clearOtp} style={styles.clearBtn}>
        <Text style={styles.clearText}>Clear</Text>
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
  notification: {
    backgroundColor: "#e0f2fe",
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  notificationText: {
    fontSize: 13,
    color: "#0369a1",
    flex: 1,
  },
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 30,
    color: "#000",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 40,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  otpContainer: {
    flexDirection: "row",
    marginBottom: 15,
    gap: 10,
    justifyContent: "center",
  },
  otpInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#fff",
    textAlign: "center",
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
  },
  filledOtpBox: {
    borderColor: "#3b82f6",
    borderWidth: 2,
  },
  activeOtpBox: {
    borderColor: "#3b82f6",
    borderWidth: 2,
    backgroundColor: "#f0f9ff",
  },
  resendCode: {
    color: "#3b82f6",
    marginBottom: 20,
    fontSize: 14,
    fontWeight: "500",
  },
  proceedButton: {
    backgroundColor: "#000",
    padding: 16,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  proceedButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  proceedButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  clearBtn: {
    paddingVertical: 10,
  },
  clearText: {
    color: "#6b7280",
    fontSize: 13,
    fontWeight: "500",
  },
});

export default VerificationScreen;
