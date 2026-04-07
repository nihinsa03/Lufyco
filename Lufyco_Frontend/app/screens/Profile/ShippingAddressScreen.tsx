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
  KeyboardAvoidingView,
  Platform,
  ToastAndroid,
  StatusBar,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../context/ThemeContext";
import { useUserDetailsStore } from "../../store/useUserDetailsStore";
import { useAuthStore } from "../../store/useAuthStore";

const PROVINCES = [
  "Western",
  "Central",
  "Southern",
  "Northern",
  "Eastern",
  "North Western",
  "North Central",
  "Uva",
  "Sabaragamuwa",
];

const CITIES: Record<string, string[]> = {
  Western: ["Colombo", "Gampaha", "Kalutara", "Negombo", "Panadura"],
  Central: ["Kandy", "Matale", "Nuwara Eliya"],
  Southern: ["Galle", "Matara", "Hambantota"],
  Northern: ["Jaffna", "Kilinochchi", "Mullaitivu"],
  Eastern: ["Batticaloa", "Trincomalee", "Ampara"],
  "North Western": ["Kurunegala", "Puttalam"],
  "North Central": ["Anuradhapura", "Polonnaruwa"],
  Uva: ["Badulla", "Monaragala"],
  Sabaragamuwa: ["Ratnapura", "Kegalle"],
};

const ShippingAddressScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { user } = useAuthStore();

  const USER_ID = user?.id;

  const {
    shippingDetails,
    fetchShipping,
    saveShipping,
    loading,
  } = useUserDetailsStore();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [showProvinces, setShowProvinces] = useState(false);
  const [showCities, setShowCities] = useState(false);

  useEffect(() => {
    if (!USER_ID) return;
    fetchShipping(USER_ID);
  }, [USER_ID, fetchShipping]);

  useEffect(() => {
    if (shippingDetails) {
      setProvince(shippingDetails.province || "");
      setCity(shippingDetails.city || "");
      setAddressLine(shippingDetails.streetAddress || "");
      setPostalCode(shippingDetails.postalCode || "");
    }
  }, [shippingDetails]);

  const onSave = async () => {
    if (!USER_ID) {
      Alert.alert("Error", "User not found");
      return;
    }

    if (!fullName || !addressLine || !phone) {
      Alert.alert("Required", "Please fill in all required fields.");
      return;
    }

    try {
      await saveShipping(USER_ID, {
        country: "Sri Lanka",
        province,
        city: city || province,
        streetAddress: addressLine,
        postalCode,
      });

      if (Platform.OS === "android") {
        ToastAndroid.show("Address Saved", ToastAndroid.SHORT);
      } else {
        Alert.alert("Success", "Address saved successfully");
      }

      navigation.goBack();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to save address"
      );
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Shipping Address
          </Text>
          <Feather
            name="map-pin"
            size={16}
            color={colors.textMuted}
            style={{ marginLeft: 6 }}
          />
        </View>

        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Full Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.inputBg,
                },
              ]}
              placeholder="Enter full name"
              placeholderTextColor={colors.textMuted}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Phone Number <Text style={styles.required}>*</Text>
            </Text>
            <View
              style={[
                styles.phoneRow,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.inputBg,
                },
              ]}
            >
              <View style={styles.flagBox}>
                <Text style={{ fontSize: 20 }}>🇱🇰</Text>
                <Feather
                  name="chevron-down"
                  size={14}
                  color={colors.textMuted}
                  style={{ marginLeft: 4 }}
                />
              </View>

              <View
                style={[styles.divider, { backgroundColor: colors.border }]}
              />

              <Text style={[styles.countryCode, { color: colors.textMuted }]}>
                +94
              </Text>

              <TextInput
                style={[styles.phoneInput, { color: colors.text }]}
                placeholder=""
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Select Province
            </Text>
            <TouchableOpacity
              style={[
                styles.dropdown,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.inputBg,
                },
              ]}
              onPress={() => {
                setShowProvinces(!showProvinces);
                setShowCities(false);
              }}
            >
              <Text
                style={[
                  styles.dropdownText,
                  { color: province ? colors.text : colors.textMuted },
                ]}
              >
                {province || "Select Province"}
              </Text>
              <Feather
                name="chevron-down"
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>

            {showProvinces && (
              <View
                style={[
                  styles.dropdownList,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                {PROVINCES.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.dropdownItem,
                      { borderBottomColor: colors.border },
                    ]}
                    onPress={() => {
                      setProvince(p);
                      setCity("");
                      setShowProvinces(false);
                    }}
                  >
                    <Text
                      style={[styles.dropdownItemText, { color: colors.text }]}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Select City
            </Text>
            <TouchableOpacity
              style={[
                styles.dropdown,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.inputBg,
                },
              ]}
              onPress={() => {
                if (!province) {
                  Alert.alert("", "Please select a province first.");
                  return;
                }
                setShowCities(!showCities);
                setShowProvinces(false);
              }}
            >
              <Text
                style={[
                  styles.dropdownText,
                  { color: city ? colors.text : colors.textMuted },
                ]}
              >
                {city || "Select City"}
              </Text>
              <Feather
                name="chevron-down"
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>

            {showCities && province && (
              <View
                style={[
                  styles.dropdownList,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                {(CITIES[province] || []).map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.dropdownItem,
                      { borderBottomColor: colors.border },
                    ]}
                    onPress={() => {
                      setCity(c);
                      setShowCities(false);
                    }}
                  >
                    <Text
                      style={[styles.dropdownItemText, { color: colors.text }]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Street Address <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.inputBg,
                },
              ]}
              placeholder="Enter street address"
              placeholderTextColor={colors.textMuted}
              value={addressLine}
              onChangeText={setAddressLine}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Postal Code <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.inputBg,
                },
              ]}
              placeholder="Enter postal code"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              value={postalCode}
              onChangeText={setPostalCode}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View
        style={[
          styles.footer,
          { backgroundColor: colors.background, borderColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.7 }]}
          onPress={onSave}
          disabled={loading}
        >
          <Text style={styles.btnText}>{loading ? "Saving..." : "Save"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerCenter: { flexDirection: "row", alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700" },

  inputGroup: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  required: { color: "#EF4444" },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
  },

  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  flagBox: { flexDirection: "row", alignItems: "center" },
  divider: { width: 1, height: 24, marginHorizontal: 10 },
  countryCode: { fontSize: 15, marginRight: 4 },
  phoneInput: { flex: 1, fontSize: 15, height: 48 },

  dropdown: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownText: { fontSize: 15 },
  dropdownList: {
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 4,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  dropdownItemText: { fontSize: 14 },

  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 20,
    borderTopWidth: 1,
  },
  btn: {
    backgroundColor: "#111",
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

export default ShippingAddressScreen;