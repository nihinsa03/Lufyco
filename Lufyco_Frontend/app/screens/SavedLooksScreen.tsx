import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import api from "../api/api";
import { useAuthStore } from "../store/useAuthStore";

type SavedLookItem = {
  _id?: string;
  id?: string;
  name?: string;
  image?: string;
  source?: "closet" | "product" | string;
  slot?: string;
  price?: number;
  [key: string]: any;
};

type SavedLook = {
  id: string;
  mood: string;
  weather: string;
  occasion: string;
  items: SavedLookItem[];
  date: string;
  timeNeed?: string;
  selectedDate?: string;
};

const SavedLooksScreen = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [looks, setLooks] = useState<SavedLook[]>([]);
  const userId = useAuthStore.getState().user?.id;

  const loadLooks = async () => {
    try {
      const response = await api.get(`/ai/saved-my-looks?userId=${userId}`);
      const data = response.data || [];

      const mapped = data.map((item: any) => ({
        ...item,
        id: item._id,
      }));

      setLooks(mapped);
    } catch (error) {
      console.error("Failed to fetch saved looks:", error);
      Alert.alert("Error", "Failed to load saved looks from server.");
    }
  };

  const deleteLook = async (id: string) => {
    try {
      await api.delete(`/ai/saved-my-looks/${id}`);
      setLooks((prev) => prev.filter((l) => l.id !== id));
    } catch (error) {
      console.error("Failed to delete look:", error);
      Alert.alert("Error", "Failed to delete the look.");
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadLooks);
    return unsubscribe;
  }, [navigation]);

  const handleSavedItemPress = (it: SavedLookItem) => {
    if (it.source !== "product") return;

    navigation.navigate("ProductDetails", {
      id: it._id || it.id,
      product: it,
    });
  };

  const getModeLabel = (item: SavedLook) => {
    const mode = String(item.timeNeed || "").toLowerCase();
    return mode === "future" ? "FUTURE" : "NOW";
  };

  const renderLookItem = (it: SavedLookItem, idx: number) => {
    const isProduct = it.source === "product";

    return (
      <TouchableOpacity
        key={`${it._id || it.id || idx}`}
        activeOpacity={isProduct ? 0.85 : 1}
        disabled={!isProduct}
        onPress={() => handleSavedItemPress(it)}
        style={styles.itemWrap}
      >
        <View style={styles.imageWrap}>
          <Image source={{ uri: it.image }} style={styles.thumb} />

          {isProduct && (
            <View style={styles.productOverlay}>
              <Feather name="shopping-cart" size={20} color="#fff" />
            </View>
          )}
        </View>

        <Text style={styles.itemName} numberOfLines={1}>
          {it.name || "Item"}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: SavedLook }) => (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>
              {item.occasion} – {item.mood}
            </Text>

            <View
              style={[
                styles.modeTag,
                getModeLabel(item) === "FUTURE"
                  ? styles.futureTag
                  : styles.nowTag,
              ]}
            >
              <Text style={styles.modeTagText}>{getModeLabel(item)}</Text>
            </View>
          </View>

          <Text style={styles.sub}>Weather: {item.weather || "N/A"}</Text>

          {item.selectedDate ? (
            <Text style={styles.sub}>
              Date: {new Date(item.selectedDate).toDateString()}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity onPress={() => deleteLook(item.id)}>
          <Feather name="trash-2" size={20} color="#c00" />
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        {Array.isArray(item.items) && item.items.length > 0 ? (
          item.items.map((it, idx) => renderLookItem(it, idx))
        ) : (
          <Text style={styles.emptyInline}>No items in this look.</Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Saved Looks
        </Text>

        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={looks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>No saved looks yet.</Text>
        }
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
};

export default SavedLooksScreen;

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
      paddingTop: 10,
      paddingBottom: 10,
    },

    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
    },

    list: {
      padding: 16,
      paddingBottom: 40,
    },

    card: {
      backgroundColor: isDark ? colors.card : "#f5f5f5",
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },

    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 10,
    },

    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 4,
    },

    title: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.text,
    },

    sub: {
      color: colors.textSecondary,
      marginBottom: 2,
    },

    modeTag: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      alignSelf: "flex-start",
    },

    futureTag: {
      backgroundColor: "#0A58FF",
    },

    nowTag: {
      backgroundColor: "#16A34A",
    },

    modeTagText: {
      color: "#fff",
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 0.4,
    },

    row: {
      flexDirection: "row",
      flexWrap: "wrap",
    },

    itemWrap: {
      width: 88,
      marginRight: 8,
      marginBottom: 10,
      alignItems: "center",
    },

    imageWrap: {
      width: 80,
      height: 80,
      borderRadius: 8,
      overflow: "hidden",
      position: "relative",
    },

    thumb: {
      width: 80,
      height: 80,
      borderRadius: 8,
      backgroundColor: isDark ? "#222" : "#eaeaea",
    },

    productOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.32)",
      alignItems: "center",
      justifyContent: "center",
    },

    itemName: {
      marginTop: 6,
      fontSize: 12,
      fontWeight: "700",
      color: colors.text,
      textAlign: "center",
      width: 80,
    },

    empty: {
      textAlign: "center",
      marginTop: 40,
      color: colors.textSecondary,
    },

    emptyInline: {
      color: colors.textSecondary,
      fontStyle: "italic",
    },
  });