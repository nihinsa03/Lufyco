import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Easing, Pressable, Platform, StatusBar } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export type FilterKey =
  | "whats_new"
  | "price_low_to_high"
  | "price_high_to_low"
  | "discount"
  | "popularity";

export const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: "whats_new", label: "What’s new" },
  { key: "price_low_to_high", label: "Price (Low to High)" },
  { key: "price_high_to_low", label: "Price (High to Low)" },
  { key: "discount", label: "Discount" },
  { key: "popularity", label: "Popularity" },
];

type Props = {
  visible: boolean;
  selected: FilterKey | null;
  onClose: () => void;
  onApply: (key: FilterKey | null) => void;
};

const FilterSheet: React.FC<Props> = ({ visible, selected, onClose, onApply }) => {
  const { colors, isDark: dark } = useTheme();
  const styles = getStyles(colors, dark);
  const [current, setCurrent] = React.useState<FilterKey | null>(selected);
  const slide = useRef(new Animated.Value(0)).current; // 0 hidden, 1 shown

  useEffect(() => {
    setCurrent(selected);
  }, [selected, visible]);

  useEffect(() => {
    if (visible) {
      Animated.timing(slide, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      slide.setValue(0);
    }
  }, [visible]);

  const translateY = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [420, 0],
  });

  const Overlay = () => (
    <Pressable style={styles.overlay} onPress={onClose} />
  );

  const Row = ({
    label,
    active,
    onPress,
  }: {
    label: string;
    active: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.checkbox, active && styles.checkboxActive]}>
        {active && <Feather name="check" size={16} color={dark ? "#000" : "#fff"} />}
      </View>
      <Text style={styles.rowText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Overlay />
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        <Text style={styles.sheetTitle}>Filter</Text>

        <View style={styles.rows}>
          {FILTER_OPTIONS.map((opt) => (
            <Row
              key={opt.key}
              label={opt.label}
              active={current === opt.key}
              onPress={() => setCurrent(opt.key)}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.apply}
          activeOpacity={0.9}
          onPress={() => onApply(current)}
        >
          <Text style={styles.applyText}>Apply</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

const getStyles = (colors: any, dark: boolean) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background || (dark ? '#121212' : '#ffffff'),
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: colors.text,
  },
  rows: {
    marginVertical: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: dark ? "#333" : "#EAEAEA",
  },
  rowText: { fontSize: 16, marginLeft: 14, color: colors.text },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: dark ? "#444" : "#D7D7D7",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
  },
  checkboxActive: {
    backgroundColor: dark ? "#fff" : "#2D8CFF",
    borderColor: dark ? "#fff" : "#2D8CFF",
  },
  apply: {
    marginTop: 16,
    backgroundColor: colors.text || (dark ? '#ffffff' : '#111111'),
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 14,
  },
  applyText: { color: colors.background || (dark ? '#121212' : '#ffffff'), fontWeight: "700", fontSize: 16 },
});

export default FilterSheet;
