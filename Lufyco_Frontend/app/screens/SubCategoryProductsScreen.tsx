import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, SafeAreaView, Platform, StatusBar } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import FilterSheet, { FilterKey } from "../screens/FilterSheet";
import SearchOverlay from "../screens/SearchOverlay";
import { CATEGORY_IMAGE_MAP } from "../data/categoryImages";

type Props = NativeStackScreenProps<RootStackParamList, "SubCategoryProducts">;

type Product = {
  id: string;
  title: string;
  image: any;
  price: number;
  compareAtPrice?: number;
  colors: string[];
  totalColors: number;
};

// Generate 6 products, all using the resolved category image
const generateProducts = (image: any): Product[] => [
  { id: "p1", title: "Libera Casual", image, price: 15.25, compareAtPrice: 20.0, colors: ["#1c1c1e", "#5b5b60", "#5C6AC4", "#5D5FEF", "#4C5BD4"], totalColors: 5 },
  { id: "p2", title: "Libera…",       image, price: 32.0,  compareAtPrice: 35.0, colors: ["#1c6acb", "#8b8e93", "#6f7682", "#9ea4b1"],         totalColors: 4 },
  { id: "p3", title: "Libera",        image, price: 8.95,  compareAtPrice: 15.0, colors: ["#2b5876", "#b53b3b", "#6f6f6f"],                      totalColors: 5 },
  { id: "p4", title: "Libera",        image, price: 12.0,  compareAtPrice: 18.0, colors: ["#2b5876", "#cd7b2e", "#1f4b6e"],                      totalColors: 5 },
  { id: "p5", title: "Libera",        image, price: 14.5,  compareAtPrice: 19.0, colors: ["#1c1c1e", "#5b5b60", "#5C6AC4"],                      totalColors: 5 },
  { id: "p6", title: "Libera",        image, price: 16.9,  compareAtPrice: 22.0, colors: ["#1c6acb", "#8b8e93", "#6f7682"],                      totalColors: 4 },
];

const ColorDots = ({ colors, styles }: { colors: string[], styles: any }) => (
  <View style={styles.colorRow}>
    {colors.slice(0, 3).map((c, i) => (
      <View key={`${c}-${i}`} style={[styles.dot, { backgroundColor: c }]} />
    ))}
  </View>
);

const SubCategoryProductsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors, isDark: dark } = useTheme();
  const styles = getStyles(colors, dark);
  const { title, categoryId } = route.params;

  // Look up the image from the central map – reliable, no param serialisation issues
  const resolvedImage = CATEGORY_IMAGE_MAP[categoryId] ?? require('../../assets/images/categories/men/shirts.png');

  const [filterVisible, setFilterVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterKey | null>("price_high_to_low");

  const products = useMemo(() => generateProducts(resolvedImage), [categoryId]);


  const sorted = useMemo(() => {
    const list = [...products];
    switch (selectedFilter) {
      case "price_low_to_high":
        return list.sort((a, b) => a.price - b.price);
      case "price_high_to_low":
        return list.sort((a, b) => b.price - a.price);
      case "discount":
        return list.sort((a, b) => {
          const da = a.compareAtPrice && a.compareAtPrice > a.price ? (a.compareAtPrice - a.price) / a.compareAtPrice : 0;
          const db = b.compareAtPrice && b.compareAtPrice > b.price ? (b.compareAtPrice - b.price) / b.compareAtPrice : 0;
          return db - da;
        });
      case "popularity":
      case "whats_new":
      default:
        return list;
    }
  }, [selectedFilter, products]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.hIcon}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{title.toUpperCase()}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => setFilterVisible(true)} style={styles.hIcon}>
            <Feather name="sliders" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSearchVisible(true)} style={styles.hIcon}>
            <Feather name="search" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Grid */}
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={item.image} style={styles.image} />
            <TouchableOpacity style={styles.wishBtn}>
              <Feather name="heart" size={18} color={dark ? "#fff" : "#111"} />
            </TouchableOpacity>

            <View style={styles.colorRowWrap}>
              <ColorDots colors={item.colors} styles={styles} />
              <Text style={styles.allColorsText}>{`All ${item.totalColors} Colors`}</Text>
            </View>

            <Text numberOfLines={1} style={styles.pTitle}>{item.title}</Text>

            <View style={styles.priceRow}>
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
              {item.compareAtPrice ? (
                <Text style={styles.compare}>${item.compareAtPrice.toFixed(2)}</Text>
              ) : null}
            </View>
          </View>
        )}
      />

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        {[
          { label: "Home", icon: "home" },
          { label: "Categories", icon: "grid" },
          { label: "My Cart", icon: "shopping-cart" },
          { label: "Wishlist", icon: "heart" },
          { label: "Profile", icon: "user" },
        ].map((t, i) => (
          <TouchableOpacity key={t.label} style={styles.tabBtn}>
            <Feather name={t.icon as any} size={22} color={i === 1 ? "#1E90FF" : "#777"} />
            <Text style={[styles.tabLabel, { color: i === 1 ? "#1E90FF" : "#777" }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filter Bottom Sheet */}
      <FilterSheet
        visible={filterVisible}
        selected={selectedFilter}
        onClose={() => setFilterVisible(false)}
        onApply={(k) => { setSelectedFilter(k); setFilterVisible(false); }}
      />

      {/* Full-screen Search Overlay */}
      <SearchOverlay
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        onOpenFilter={() => { setSearchVisible(false); setFilterVisible(true); }}
      />
    </SafeAreaView>
  );
};

const getStyles = (colors: any, dark: boolean) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background , paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 8,
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: dark ? "#333" : "#eee",
  },
  hIcon: { padding: 6 },
  headerRight: { flexDirection: "row", alignItems: "center" },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: colors.text,
  },

  card: { width: "48%", marginTop: 14 },
  image: { width: "100%", height: 180, borderRadius: 14 },
  wishBtn: {
    position: "absolute",
    right: 10,
    top: 10,
    backgroundColor: dark ? "#2c2c2e" : "#fff",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },

  colorRowWrap: { marginTop: 8, flexDirection: "row", alignItems: "center" },
  colorRow: { flexDirection: "row", alignItems: "center", marginRight: 8 },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 6,
    borderWidth: 1,
    borderColor: dark ? "#333" : "#e5e5e5",
  },
  allColorsText: { fontSize: 12, color: dark ? "#aaa" : "#3b3b3b", textDecorationLine: "underline" },

  pTitle: { fontSize: 14, fontWeight: "600", marginTop: 6, color: colors.text },
  priceRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  price: { fontSize: 14, fontWeight: "700", color: colors.text },
  compare: {
    fontSize: 12,
    color: dark ? "#666" : "#888",
    marginLeft: 8,
    textDecorationLine: "line-through",
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 72,
    borderTopWidth: 1,
    borderColor: dark ? "#333" : "#eee",
    backgroundColor: colors.background,
    flexDirection: "row",
    paddingBottom: 8,
    paddingTop: 6,
    justifyContent: "space-around",
    alignItems: "center",
  },
  tabBtn: { alignItems: "center" },
  tabLabel: { fontSize: 11, marginTop: 2, fontWeight: "500" },
});

export default SubCategoryProductsScreen;
