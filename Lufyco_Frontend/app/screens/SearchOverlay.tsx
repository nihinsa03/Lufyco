import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, SafeAreaView, TouchableOpacity, TextInput, FlatList, Platform, StatusBar } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";

type Props = {
  visible: boolean;
  onClose: () => void;
  onOpenFilter?: () => void;
  onSearch?: (query: string) => void;
};

const RECENT = [
  "Blue Shirt",
  "White Shirt",
  "Black Shirt",
  "Red Shirt",
  "Purple Shirt",
  "Orange Shirt",
];

const SearchOverlay: React.FC<Props> = ({ visible, onClose, onOpenFilter, onSearch }) => {
  const [query, setQuery] = useState("");
  const { colors, isDark: dark } = useTheme();
  const navigation = useNavigation<any>();

  return (
    <Modal animationType="slide" presentationStyle="fullScreen" visible={visible}>
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Fashion</Text>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
            <Feather name="x" size={26} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={[styles.searchWrap, { backgroundColor: dark ? "#1c1c1e" : "#F6F6F7" }]}>
          <Feather name="search" size={20} color={colors.text} style={{ marginLeft: 10 }} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search"
            style={[styles.input, { color: colors.text }]}
            placeholderTextColor="#8e8e93"
            onSubmitEditing={() => onSearch && onSearch(query)}
          />
          <TouchableOpacity
            onPress={() => {
              onClose();
              if (onOpenFilter) {
                 onOpenFilter();
              } else {
                 navigation.navigate('Filter');
              }
            }}
            style={[styles.iconBtn, { marginRight: 6 }]}
          >
            <Feather name="sliders" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Recent */}
        <Text style={[styles.sectionLabel, { color: dark ? "#a0a0a5" : "#707077" }]}>RECENT SEARCH</Text>
        <FlatList
          data={RECENT.filter((t) =>
            query.trim().length
              ? t.toLowerCase().includes(query.toLowerCase())
              : true
          )}
          keyExtractor={(item) => item}
          ItemSeparatorComponent={() => (
            <View style={{ height: 1, backgroundColor: dark ? "#333" : "#F0F0F0" }} />
          )}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => {
              setQuery(item);
              if (onSearch) onSearch(item);
            }}>
              <Text style={[styles.rowText, { color: colors.text }]}>{item}</Text>
              <Feather name="corner-right-up" size={22} color={dark ? "#666" : "#C4C4C6"} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={{ padding: 24 }}>
              <Text style={{ color: "#8e8e93" }}>No recent results.</Text>
            </View>
          }
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" , paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 12,
    justifyContent: "space-between",
  },
  title: { fontSize: 28, fontWeight: "800" },
  iconBtn: { padding: 6 },

  searchWrap: {
    marginHorizontal: 18,
    marginBottom: 14,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F6F6F7",
    flexDirection: "row",
    alignItems: "center",
  },
  input: { flex: 1, paddingHorizontal: 10, fontSize: 16 },

  sectionLabel: {
    marginTop: 4,
    marginBottom: 8,
    marginHorizontal: 18,
    fontSize: 12,
    fontWeight: "700",
    color: "#707077",
    letterSpacing: 0.4,
  },

  row: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowText: { fontSize: 16 },
});

export default SearchOverlay;
