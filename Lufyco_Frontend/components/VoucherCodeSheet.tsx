import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";

type Props = {
  visible: boolean;
  onClose: () => void;
  // return the validated code and discount amount (absolute value, not %)
  onApply: (payload: { code: string; discountAmount: number }) => void;
  subtotal: number;
};

const VoucherCodeSheet: React.FC<Props> = ({ visible, onClose, onApply, subtotal }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleApply = () => {
    const c = code.trim().toUpperCase();

    // Demo rules — tweak for your backend or more sophisticated rules
    // SAVE10 => 10% off subtotal (capped to 100)
    // SAVE5  => flat $5 off (capped to subtotal)
    // No other codes are valid in this demo
    if (c === "SAVE10") {
      const amount = Math.min(subtotal * 0.1, 100);
      onApply({ code: c, discountAmount: amount });
      setError(null);
      setCode("");
      onClose();
      return;
    }
    if (c === "SAVE5") {
      const amount = Math.min(5, subtotal);
      onApply({ code: c, discountAmount: amount });
      setError(null);
      setCode("");
      onClose();
      return;
    }

    setError("Invalid or expired code. Try SAVE10 or SAVE5.");
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={styles.overlay}
      >
        {/* Gray out the background and let user tap to close */}
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.grabber} />

          <View style={styles.headerRow}>
            <Text style={styles.sheetTitle}>Voucher Code</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x" size={20} />
            </TouchableOpacity>
          </View>

          <Text style={styles.help}>Enter your voucher or promo code below.</Text>

          <TextInput
            placeholder="Enter Voucher Code"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="characters"
            autoCorrect={false}
            value={code}
            onChangeText={(t) => {
              setCode(t);
              setError(null);
            }}
            style={styles.input}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
            <Text style={styles.applyText}>Apply</Text>
          </TouchableOpacity>

          <View style={styles.examples}>
            <Text style={styles.examplesTitle}>Try:</Text>
            <View style={styles.badges}>
              {["SAVE10", "SAVE5"].map((ex) => (
                <TouchableOpacity key={ex} style={styles.badge} onPress={() => setCode(ex)}>
                  <Text style={styles.badgeText}>{ex}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },

  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  grabber: {
    width: 64,
    height: 4,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
    marginVertical: 8,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sheetTitle: { fontSize: 18, fontWeight: "700" },
  help: { color: "#6B7280", marginTop: 8, marginBottom: 12 },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontWeight: "600",
    letterSpacing: 1,
    backgroundColor: "#F9FAFB",
  },
  error: { marginTop: 8, color: "#DC2626", fontWeight: "600" },

  applyBtn: {
    backgroundColor: "#111",
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  applyText: { color: "#fff", fontSize: 16, fontWeight: "800" },

  examples: { marginTop: 16 },
  examplesTitle: { fontWeight: "700", marginBottom: 8 },
  badges: { flexDirection: "row" },
  badge: {
    backgroundColor: "#EEF2FF",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  badgeText: { color: "#3730A3", fontWeight: "700" },
});

export default VoucherCodeSheet;
