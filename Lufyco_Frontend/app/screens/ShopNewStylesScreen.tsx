import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  Platform,
  StatusBar,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { useShopStore } from "../store/useShopStore";
import { useTheme } from "../context/ThemeContext";

type Props = NativeStackScreenProps<RootStackParamList, "ShopNewStyles">;

const COLOR_MAP: Record<string, string> = {
  black: "#000000",
  white: "#FFFFFF",
  red: "#EF4444",
  blue: "#3B82F6",
  green: "#22C55E",
  yellow: "#EAB308",
  pink: "#EC4899",
  purple: "#8B5CF6",
  orange: "#F97316",
  brown: "#8B5E3C",
  grey: "#9CA3AF",
  gray: "#9CA3AF",
  silver: "#C0C0C0",
  gold: "#D4AF37",
  beige: "#D6C4A1",
  cream: "#FFFDD0",
  navy: "#1E3A8A",
  maroon: "#7F1D1D",
  olive: "#708238",
  khaki: "#C3B091",
  cyan: "#06B6D4",
  teal: "#14B8A6",
  lavender: "#C4B5FD",
};

const isValidHexColor = (value: string) => {
  return /^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(value.trim());
};

const normalizeColorToHex = (color?: string) => {
  if (!color || typeof color !== "string") return null;

  const trimmed = color.trim();
  if (!trimmed) return null;

  if (isValidHexColor(trimmed)) return trimmed;

  return COLOR_MAP[trimmed.toLowerCase()] || null;
};

const formatColorName = (color?: string) => {
  if (!color || typeof color !== "string") return "";
  const trimmed = color.trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

const ShopNewStylesScreen: React.FC<Props> = ({ navigation }) => {
  const { products } = useShopStore();
  const [query, setQuery] = useState("");
  const { colors, isDark: dark } = useTheme();

  const list = useMemo(() => {
    let data = products.filter((p: any) => p.isNewArrival);

    const q = query.trim().toLowerCase();
    if (q) {
      data = data.filter((i: any) => {
        const itemText = (i.name || i.title || "").toLowerCase();
        const descText = (i.description || "").toLowerCase();
        const categoryText = (i.category || "").toLowerCase();
        const typeText = (i.type || "").toLowerCase();
        return (
          itemText.includes(q) ||
          descText.includes(q) ||
          categoryText.includes(q) ||
          typeText.includes(q)
        );
      });
    }

    return data;
  }, [products, query]);

  const getImageUri = (item: any) => {
    if (!item) return "";

    if (Array.isArray(item.images) && item.images.length > 0) {
      return item.images[0];
    }

    if (typeof item.images === "string") {
      return item.images;
    }

    if (typeof item.image === "string") {
      return item.image;
    }

    return "";
  };

  const getDisplayColors = (item: any) => {
    if (!Array.isArray(item.colors)) return [];

    return item.colors
      .map((color: string) => ({
        raw: color,
        hex: normalizeColorToHex(color),
        label: formatColorName(color),
      }))
      .filter((c: any) => c.raw);
  };

  const renderItem = ({ item }: { item: any }) => {
    const imageUri = getImageUri(item);
    const displayColors = getDisplayColors(item);
    const visibleColors = displayColors.slice(0, 3);
    const extraColorCount = Math.max(displayColors.length - visibleColors.length, 0);

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: dark ? colors.border : "#E5E7EB",
            shadowColor: dark ? "#000" : "#111827",
          },
        ]}
        onPress={() =>
          navigation.navigate("ProductDetails", { id: item.id, product: item })
        }
      >
        <View style={styles.imageSection}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={[styles.thumb, { backgroundColor: colors.iconBg }]}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.thumb,
                styles.noImageBox,
                { backgroundColor: colors.iconBg },
              ]}
            >
              <Feather name="image" size={26} color={colors.textMuted} />
            </View>
          )}

          <View style={styles.imageTopRow}>
            {item.isNewArrival ? (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
            ) : (
              <View />
            )}

            <View
              style={[
                styles.arrowCircle,
                { backgroundColor: dark ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.92)" },
              ]}
            >
              <Feather
                name="arrow-up-right"
                size={16}
                color={dark ? "#fff" : "#111"}
              />
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text
              numberOfLines={1}
              style={[styles.title, { color: colors.text }]}
            >
              {item.title || item.name}
            </Text>
          </View>

          {!!item.description && (
            <Text
              numberOfLines={2}
              style={[styles.description, { color: colors.textMuted }]}
            >
              {item.description}
            </Text>
          )}

          <View style={styles.metaRow}>
            {!!item.category && (
              <View
                style={[
                  styles.metaChip,
                  { backgroundColor: dark ? "#1F2937" : "#F3F4F6" },
                ]}
              >
                <Text style={[styles.metaChipText, { color: colors.textSecondary || colors.textMuted || colors.text }]}>
                  {item.category}
                </Text>
              </View>
            )}

            {!!item.type && (
              <View
                style={[
                  styles.metaChip,
                  { backgroundColor: dark ? "#1F2937" : "#F3F4F6" },
                ]}
              >
                <Text style={[styles.metaChipText, { color: colors.textSecondary || colors.textMuted || colors.text }]}>
                  {item.type}
                </Text>
              </View>
            )}
          </View>

          {displayColors.length > 0 && (
            <View style={styles.colorRow}>
              <View style={styles.colorCirclesWrap}>
                {visibleColors.map((color: any, index: number) => (
                  <View
                    key={`${color.raw}_${index}`}
                    style={[
                      styles.colorCircle,
                      {
                        backgroundColor: color.hex || "#D1D5DB",
                        borderColor:
                          color.hex?.toLowerCase() === "#ffffff" ? "#D1D5DB" : "#FFFFFF",
                        marginLeft: index === 0 ? 0 : -4,
                      },
                    ]}
                  />
                ))}
              </View>

              <Text style={[styles.colorLabel, { color: colors.textMuted }]} numberOfLines={1}>
                {visibleColors.map((c: any) => c.label).join(", ")}
                {extraColorCount > 0 ? ` +${extraColorCount}` : ""}
              </Text>
            </View>
          )}

          <View style={styles.bottomRow}>
            <Text style={[styles.price, { color: colors.text }]}>
              LKR {Number(item.price || 0).toFixed(2)}
            </Text>

            <View style={styles.detailsBtn}>
              <Text style={styles.detailsBtnText}>View</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            borderBottomColor: dark ? "#333" : "transparent",
            borderBottomWidth: dark ? 1 : 0,
          },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.hIcon}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Shop New Styles
        </Text>

        <View style={{ width: 22 }} />
      </View>

      <View
        style={[
          styles.searchBar,
          {
            borderColor: dark ? colors.border : "#D1D5DB",
            backgroundColor: dark ? colors.card : "#fff",
          },
        ]}
      >
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput
          placeholder="Search new styles"
          value={query}
          onChangeText={setQuery}
          style={[styles.searchInput, { color: colors.text }]}
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Feather name="search" size={28} color={colors.textMuted} />
            <Text style={[styles.empty, { color: colors.textMuted }]}>
              No items match "{query}".
            </Text>
          </View>
        }
      />
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
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
    justifyContent: "space-between",
  },
  hIcon: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  searchInput: {
    marginLeft: 10,
    flex: 1,
    fontSize: 14,
  },

  listContent: {
    paddingBottom: 140,
    paddingHorizontal: 16,
  },

  card: {
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },

  imageSection: {
    position: "relative",
  },

  thumb: {
    width: "100%",
    height: 210,
    backgroundColor: "#eee",
  },

  noImageBox: {
    justifyContent: "center",
    alignItems: "center",
  },

  imageTopRow: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  newBadge: {
    backgroundColor: "#111827",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  newBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
  },

  arrowCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    padding: 14,
  },

  titleRow: {
    marginBottom: 6,
  },

  title: {
    fontSize: 17,
    fontWeight: "700",
  },

  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },

  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },

  metaChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },

  metaChipText: {
    fontSize: 11,
    fontWeight: "600",
  },

  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  colorCirclesWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },

  colorCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
  },

  colorLabel: {
    fontSize: 12,
    flex: 1,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },

  price: {
    fontSize: 18,
    fontWeight: "800",
  },

  detailsBtn: {
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },

  detailsBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 70,
  },

  empty: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 14,
    fontStyle: "italic",
  },
});

export default ShopNewStylesScreen;