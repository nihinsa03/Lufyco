import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../context/ThemeContext";
import { useUserDetailsStore } from "../../store/useUserDetailsStore";
import { useAuthStore } from "../../store/useAuthStore";

const PaymentMethodScreen = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const { user } = useAuthStore();

  const USER_ID = user?.id;

  const {
    paymentDetails,
    fetchPayment,
    savePayment,
    loading,
  } = useUserDetailsStore();

  const [cardNumber, setCardNumber] = useState("");
  const [holder, setHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  useEffect(() => {
    if (!USER_ID) return;
    fetchPayment(USER_ID);
  }, [USER_ID, fetchPayment]);

  useEffect(() => {
    if (paymentDetails) {
      setHolder(paymentDetails.cardholderName || "");
      setExpiry(paymentDetails.expDate || "");
      setCardNumber(
        paymentDetails.last4 ? `**** **** **** ${paymentDetails.last4}` : ""
      );
    }
  }, [paymentDetails]);

  const onSave = async () => {
    if (!USER_ID) {
      Alert.alert("Error", "User not found");
      return;
    }

    if (!holder.trim()) {
      Alert.alert("Error", "Card holder name is required");
      return;
    }

    if (!cardNumber.trim() || cardNumber.replace(/\s/g, "").length < 4) {
      Alert.alert("Error", "Invalid card number");
      return;
    }

    if (!expiry.trim()) {
      Alert.alert("Error", "Expiration date is required");
      return;
    }

    if (!cvv.trim()) {
      Alert.alert("Error", "CVV is required");
      return;
    }

    try {
      await savePayment(USER_ID, {
        paymentType: "card",
        cardType: "Visa",
        cardNumber: cardNumber.replace(/\s/g, ""),
        expDate: expiry,
        cardholderName: holder,
        cvv,
      });

      Alert.alert("Success", "Payment method saved");
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to save payment method"
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Method</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.cardPreview}>
          <Text style={styles.cardTitle}>
            {paymentDetails?.cardType?.toUpperCase() || "VISA"}
          </Text>

          <Text style={styles.cardNum}>
            {cardNumber || "**** **** **** ****"}
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 20,
            }}
          >
            <Text style={styles.cardMeta}>{holder || "NAME"}</Text>
            <Text style={styles.cardMeta}>{expiry || "MM/YY"}</Text>
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Card Holder Name</Text>
          <TextInput
            style={styles.input}
            value={holder}
            onChangeText={setHolder}
            placeholder="Full Name"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.label}>Card Number</Text>
          <TextInput
            style={styles.input}
            value={cardNumber}
            onChangeText={setCardNumber}
            placeholder="0000 0000 0000 0000"
            keyboardType="numeric"
            placeholderTextColor={colors.textMuted}
          />

          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Expiration</Text>
              <TextInput
                style={styles.input}
                value={expiry}
                onChangeText={setExpiry}
                placeholder="MM/YY"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.label}>CVV</Text>
              <TextInput
                style={styles.input}
                value={cvv}
                onChangeText={setCvv}
                placeholder="123"
                keyboardType="numeric"
                secureTextEntry
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.7 }]}
          onPress={onSave}
          disabled={loading}
        >
          <Text style={styles.btnText}>
            {loading ? "Saving..." : "Save Card"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const getStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    headerTitle: { fontSize: 18, fontWeight: "700", color: colors.text },

    cardPreview: {
      backgroundColor: "#1E293B",
      borderRadius: 16,
      padding: 24,
      marginBottom: 30,
      height: 180,
      justifyContent: "space-between",
    },
    cardTitle: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "700",
      fontStyle: "italic",
    },
    cardNum: { color: "#fff", fontSize: 22, letterSpacing: 2 },
    cardMeta: { color: "#CBD5E1", fontSize: 14, fontWeight: "600" },

    form: {},
    label: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 8,
      color: colors.text,
      marginTop: 12,
    },
    input: {
      height: 50,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.inputBg,
      paddingHorizontal: 16,
      fontSize: 15,
      color: colors.text,
    },

    footer: {
      position: "absolute",
      bottom: 0,
      width: "100%",
      padding: 20,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderColor: colors.border,
    },
    btn: {
      backgroundColor: isDark ? "#fff" : "#111",
      height: 56,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    btnText: {
      color: isDark ? "#111" : "#fff",
      fontSize: 16,
      fontWeight: "700",
    },
  });

export default PaymentMethodScreen;