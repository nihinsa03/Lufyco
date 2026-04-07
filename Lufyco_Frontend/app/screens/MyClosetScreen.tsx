import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  Platform,
  StatusBar,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import api from "../api/api";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { useAuthStore } from "../store/useAuthStore";

type Props = NativeStackScreenProps<RootStackParamList, "MyCloset">;

const chips = [
  "All",
  "Men's Wear",
  "Women's Wear",
  "Kids' Wear",
  "Footwear",
  "Jewellery",
  "Beauty Products",
  "Accessories",
  "Shirts",
  "T-Shirts",
  "Jeans",
  "Trousers",
  "Tops",
  "Dresses",
];

interface ClosetItem {
  _id: string;
  name: string;
  category?: string;
  subCategory?: string;
  type?: string;
  color?: string;
  colors?: string[];
  image: string;
  notes?: string;
  createdAt?: string;
  occasion?: string;
}

const normalize = (v?: string) => (v || "").trim().toLowerCase();

const includesAny = (value: string, list: string[]) =>
  list.some((x) => value.includes(x));

const itemMatchesChip = (item: ClosetItem, chip: string) => {
  const category = normalize(item.category);
  const subCategory = normalize(item.subCategory);
  const type = normalize(item.type);
  const name = normalize(item.name);
  const chipValue = normalize(chip);

  if (chipValue === "all") return true;

  if (chipValue === "men's wear") {
    return category === "men";
  }

  if (chipValue === "women's wear") {
    return category === "women";
  }

  if (chipValue === "kids' wear") {
    return category === "kids";
  }

  if (chipValue === "footwear") {
    return (
      subCategory === "footwear" ||
      includesAny(type, [
        "shoe",
        "shoes",
        "heel",
        "heels",
        "boot",
        "boots",
        "sandal",
        "sandals",
        "slipper",
        "sneaker",
        "sneakers",
        "loafer",
      ]) ||
      includesAny(name, [
        "shoe",
        "shoes",
        "heel",
        "heels",
        "boot",
        "boots",
        "sandal",
        "sandals",
        "slipper",
        "sneaker",
        "sneakers",
        "loafer",
      ])
    );
  }

  if (chipValue === "jewellery") {
    return (
      subCategory === "jewellery" ||
      includesAny(type, [
        "jewellery",
        "jewelry",
        "necklace",
        "ring",
        "earring",
        "bracelet",
        "chain",
        "pendant",
      ]) ||
      includesAny(name, [
        "necklace",
        "ring",
        "earring",
        "bracelet",
        "chain",
        "pendant",
        "jewellery",
        "jewelry",
      ])
    );
  }

  if (chipValue === "beauty products") {
    return (
      subCategory === "beauty products" ||
      includesAny(type, [
        "perfume",
        "makeup",
        "lipstick",
        "foundation",
        "cream",
        "beauty",
        "cosmetic",
      ]) ||
      includesAny(name, [
        "perfume",
        "makeup",
        "lipstick",
        "foundation",
        "cream",
        "beauty",
        "cosmetic",
      ])
    );
  }

  if (chipValue === "accessories") {
    return (
      subCategory === "accessories" ||
      includesAny(type, [
        "watch",
        "belt",
        "bag",
        "cap",
        "hat",
        "wallet",
        "scarf",
        "accessory",
        "accessories",
      ]) ||
      includesAny(name, [
        "watch",
        "belt",
        "bag",
        "cap",
        "hat",
        "wallet",
        "scarf",
        "accessory",
        "accessories",
      ])
    );
  }

  if (chipValue === "shirts") {
    return type === "shirt" || name.includes("shirt");
  }

  if (chipValue === "t-shirts") {
    return type === "t-shirt" || type === "tshirt" || name.includes("t-shirt") || name.includes("t shirt");
  }

  if (chipValue === "jeans") {
    return type === "jeans" || name.includes("jeans");
  }

  if (chipValue === "trousers") {
    return (
      type === "trousers" ||
      type === "trouser" ||
      type === "pants" ||
      name.includes("trousers") ||
      name.includes("trouser")
    );
  }

  if (chipValue === "tops") {
    return (
      subCategory === "tops" ||
      includesAny(type, ["top", "t-shirt", "tshirt", "shirt", "blouse", "polo", "hoodie", "sweater"]) ||
      includesAny(name, ["top", "t-shirt", "t shirt", "shirt", "blouse", "polo", "hoodie", "sweater"])
    );
  }

  if (chipValue === "dresses") {
    return (
      subCategory === "dresses" ||
      includesAny(type, ["dress", "gown", "frock", "jumpsuit"]) ||
      includesAny(name, ["dress", "gown", "frock", "jumpsuit"])
    );
  }

  return false;
};

const MyClosetScreen = ({ navigation }: Props) => {
  const [allItems, setAllItems] = useState<ClosetItem[]>([]);
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const [active, setActive] = useState("All");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [editItem, setEditItem] = useState<ClosetItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("Tops");
  const [editColor, setEditColor] = useState("#000000");
  const [editOccasion, setEditOccasion] = useState("casual");

  const user = useAuthStore.getState().user?.id;

  // fetch only once per load / refresh / focus
  const fetchItems = useCallback(async () => {
    try {
      const res = await api.get("/closet", {
        params: { userId: user },
      });
      setAllItems(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to fetch closet items:", error);
      Alert.alert("Error", "Could not load closet items. Please check your connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchItems();
    }, [fetchItems])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  const filteredItems = useMemo(() => {
    let items = [...allItems];

    if (active !== "All") {
      items = items.filter((item) => itemMatchesChip(item, active));
    }

    if (q.trim()) {
      const query = normalize(q);
      items = items.filter((item) => {
        const name = normalize(item.name);
        const category = normalize(item.category);
        const subCategory = normalize(item.subCategory);
        const type = normalize(item.type);
        const occasion = normalize(item.occasion);

        return (
          name.includes(query) ||
          category.includes(query) ||
          subCategory.includes(query) ||
          type.includes(query) ||
          occasion.includes(query)
        );
      });
    }

    return items;
  }, [allItems, active, q]);

  const emptyMessage = useMemo(() => {
    if (allItems.length === 0) {
      return "No items in your closet yet";
    }

    if (q.trim() && active !== "All") {
      return `No matching items found for "${active}"`;
    }

    if (q.trim()) {
      return "No items match your search";
    }

    if (active !== "All") {
      return `No matching items found for "${active}"`;
    }

    return "No items found";
  }, [allItems.length, active, q]);

  const handleDelete = async (id: string, name: string) => {
    Alert.alert(
      "Delete Item",
      `Are you sure you want to permanently delete "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/closet/${id}`);
              setAllItems((prev) => prev.filter((i) => i._id !== id));
            } catch (error) {
              console.error("Failed to delete item:", error);
              Alert.alert("Error", "Could not delete item. Please try again.");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Closet</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.searchBar, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          placeholder="Search for clothes..."
          style={[styles.searchInput, { color: colors.text }]}
          value={q}
          onChangeText={setQ}
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <View style={styles.chipsWrap}>
        {chips.map((c) => {
          const selected = c === active;
          return (
            <TouchableOpacity
              key={c}
              onPress={() => setActive(c)}
              style={[styles.chip, selected && styles.chipActive]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading your closet...
          </Text>
        </View>
      ) : filteredItems.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Feather name="inbox" size={48} color={isDark ? "#444" : "#ccc"} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {emptyMessage}
          </Text>
          <Text style={[styles.emptySubText, { color: colors.textMuted }]}>
            {allItems.length === 0 ? "Tap + to add your first item!" : "Try another category or search term."}
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563EB"]} />
          }
        >
          {filteredItems.map((item) => (
            <View key={item._id} style={[styles.itemCard, { backgroundColor: colors.card }]}>
              <View style={styles.itemRow}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.itemImage}
                />
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                    {item.category || "-"}
                    {item.subCategory ? ` • ${item.subCategory}` : ""}
                    {item.type ? ` • ${item.type}` : ""}
                  </Text>

                  {item.color && (
                    <View style={[styles.colorDot, { backgroundColor: item.color, borderColor: colors.border }]} />
                  )}
                </View>
              </View>

              <View style={[styles.separator, { backgroundColor: colors.border }]} />

              <View style={[styles.actions, { backgroundColor: isDark ? colors.inputBg : "#E5E7EB" }]}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => {
                    setEditItem(item);
                    setEditName(item.name);
                    setEditCategory(item.category || "Tops");
                    setEditColor(item.color || "#000000");
                    setEditOccasion(item.occasion || "casual");
                  }}
                >
                  <Feather name="edit-2" size={18} color={colors.text} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { marginLeft: 12 }]}
                  onPress={() => handleDelete(item._id, item.name)}
                >
                  <Feather name="trash-2" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate("AddToCloset")}
      >
        <View style={styles.fabInner}>
          <Feather name="plus" size={32} color="#fff" />
        </View>
      </TouchableOpacity>

      <Modal visible={!!editItem} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Item</Text>

            <Text style={[styles.label, { color: colors.textSecondary }]}>Name</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text },
              ]}
              value={editName}
              onChangeText={setEditName}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {[
                "Men's Wear",
                "Women's Wear",
                "Kids' Wear",
                "Footwear",
                "Jewellery",
                "Beauty Products",
                "Accessories",
                "Shirts",
                "T-Shirts",
                "Jeans",
                "Trousers",
                "Tops",
                "Dresses",
              ].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.catChip,
                    { backgroundColor: isDark ? colors.inputBg : "#F3F4F6" },
                    editCategory === cat && styles.catChipActive,
                  ]}
                  onPress={() => setEditCategory(cat)}
                >
                  <Text
                    style={[
                      styles.catChipText,
                      { color: colors.textSecondary },
                      editCategory === cat && styles.catChipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.label, { color: colors.textSecondary }]}>Color</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {["#000000", "#FFFFFF", "#FF0000", "#0000FF", "#00FF00", "#FFFF00", "#808080", "#FFC0CB", "#A52A2A", "#800080"].map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.modalColorDotBtn, editColor === c && styles.modalColorDotBtnActive]}
                  onPress={() => setEditColor(c)}
                >
                  <View style={[styles.modalColorDot, { backgroundColor: c, borderColor: colors.border }]} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.label, { color: colors.textSecondary }]}>Occasion</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {["formal", "casual", "wedding", "date"].map((occ) => (
                <TouchableOpacity
                  key={occ}
                  style={[
                    styles.catChip,
                    { backgroundColor: isDark ? colors.inputBg : "#F3F4F6" },
                    editOccasion === occ && styles.catChipActive,
                  ]}
                  onPress={() => setEditOccasion(occ)}
                >
                  <Text
                    style={[
                      styles.catChipText,
                      { color: colors.textSecondary },
                      editOccasion === occ && styles.catChipTextActive,
                    ]}
                  >
                    {occ.charAt(0).toUpperCase() + occ.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: isDark ? colors.border : "#E5E7EB" }]}
                onPress={() => setEditItem(null)}
              >
                <Text style={{ fontWeight: "700", color: colors.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#2563EB" }]}
                onPress={async () => {
                  if (!editItem) return;
                  try {
                    await api.put(`/closet/${editItem._id}`, {
                      name: editName,
                      category: editCategory,
                      color: editColor,
                      occasion: editOccasion,
                    });

                    setAllItems((prev) =>
                      prev.map((i) =>
                        i._id === editItem._id
                          ? {
                              ...i,
                              name: editName,
                              category: editCategory,
                              color: editColor,
                              occasion: editOccasion,
                            }
                          : i
                      )
                    );

                    setEditItem(null);
                  } catch (e) {
                    Alert.alert("Error", "Could not update item.");
                  }
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const getStyles = (colors: any, dark: boolean) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },

    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 10,
      justifyContent: "space-between",
    },
    headerTitle: { fontSize: 20, fontWeight: "700" },

    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 15,
    },
    searchInput: { marginLeft: 10, flex: 1, fontSize: 14 },

    chipsWrap: {
      paddingHorizontal: 16,
      paddingBottom: 10,
      flexDirection: "row",
      flexWrap: "wrap",
    },
    chip: {
      alignSelf: "flex-start",
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: dark ? "#333" : "#D9D9D9",
      marginRight: 10,
      marginBottom: 10,
    },
    chipActive: { backgroundColor: "#7DD3FC" },
    chipText: { fontWeight: "600", fontSize: 13, color: colors.textSecondary },
    chipTextActive: { color: "#000" },

    loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
    loadingText: { marginTop: 12, fontSize: 14 },
    emptyWrap: { flex: 1, justifyContent: "center", alignItems: "center", paddingBottom: 80 },
    emptyText: { marginTop: 12, fontSize: 16, fontWeight: "600", textAlign: "center" },
    emptySubText: { marginTop: 4, fontSize: 13, textAlign: "center" },

    itemCard: {
      borderRadius: 12,
      paddingTop: 12,
      marginTop: 15,
      overflow: "hidden",
      borderWidth: 1,
    },
    itemRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingBottom: 12 },
    itemImage: {
      width: 100,
      height: 110,
      borderRadius: 8,
      resizeMode: "cover",
      backgroundColor: dark ? "#222" : "#E5E7EB",
    },
    itemTitle: { fontSize: 16, fontWeight: "700" },
    itemSub: { marginTop: 2, fontSize: 13 },
    colorDot: {
      width: 24,
      height: 24,
      borderRadius: 12,
      marginTop: 8,
      borderWidth: 1,
    },

    separator: { height: 1 },
    actions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    actionBtn: { padding: 4 },

    fab: { position: "absolute", right: 20, bottom: 40 },
    fabInner: {
      width: 60,
      height: 60,
      borderRadius: 12,
      backgroundColor: "#2563EB",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },

    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
    modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 16 },
    label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
    input: {
      height: 48,
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 16,
      fontSize: 15,
      marginBottom: 16,
    },
    catChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 8,
      height: 36,
      justifyContent: "center",
    },
    catChipActive: { backgroundColor: "#2563EB" },
    catChipText: { fontSize: 13, fontWeight: "600" },
    catChipTextActive: { color: "#fff" },
    modalColorDotBtn: {
      padding: 2,
      borderRadius: 16,
      marginRight: 8,
      height: 32,
      width: 32,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: "transparent",
    },
    modalColorDotBtnActive: { borderColor: "#2563EB" },
    modalColorDot: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 1,
    },
    modalBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
    },
  });

export default MyClosetScreen;