import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  StatusBar,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import FilterSheet, { FilterKey } from "./FilterSheet";
import SearchOverlay from "./SearchOverlay";
import { useWishlistStore } from "../store/useWishlistStore";

type Props = NativeStackScreenProps<RootStackParamList, "ProductListing">;

type Product = {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  price?: number;
  compareAtPrice?: number;
  oldPrice?: number;
  image?: string;
  images?: string[] | string;
  colors?: string[];
  reviewsCount?: number;
  reviews?: number;
  category?: string;
  subCategory?: string;
  gender?: string;
  type?: string;
  isNewArrival?: boolean;
};

const getImageUri = (item: Product): string => {
  if (!item) return "";

  if (Array.isArray(item.images) && item.images.length > 0) {
    return String(item.images[0] || "");
  }

  if (typeof item.images === "string") {
    return item.images;
  }

  if (typeof item.image === "string") {
    return item.image;
  }

  return "";
};

const ColorDots = ({
  colors,
  styles,
}: {
  colors: string[];
  styles: any;
}) => {
  if (!Array.isArray(colors) || colors.length === 0) return null;

  return (
    <View style={styles.colorRow}>
      {colors.slice(0, 3).map((c, i) => (
        <View
          key={`${String(c)}-${i}`}
          style={[styles.dot, { backgroundColor: String(c) }]}
        />
      ))}

      {colors.length > 3 ? (
        <Text style={styles.moreColors}>{`+${colors.length - 3}`}</Text>
      ) : null}
    </View>
  );
};

const ProductListingScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors, isDark: dark } = useTheme();
  const styles = getStyles(colors, dark);

  const { gender, category, subCategory, type, search, isSale, title, productsN } =
    route.params || {};

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterVisible, setFilterVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] =
    useState<FilterKey | null>("whats_new");

  const { toggleWishlist, isInWishlist } = useWishlistStore();

  useEffect(() => {
    fetchProducts();
  }, [selectedFilter, search, productsN]);

  const fetchProducts = async () => {
    setLoading(true);

    try {
      let data: Product[] = Array.isArray(productsN) ? [...productsN] : [];

      if (selectedFilter === "price_low_to_high") {
        data.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
      } else if (selectedFilter === "price_high_to_low") {
        data.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
      } else if (selectedFilter === "discount") {
        data = data.filter(
          (p) =>
            (p.compareAtPrice != null &&
              Number(p.compareAtPrice) > Number(p.price || 0)) ||
            (p.oldPrice != null && Number(p.oldPrice) > Number(p.price || 0))
        );
      } else if (selectedFilter === "popularity") {
        data.sort(
          (a, b) =>
            Number(b.reviewsCount || b.reviews || 0) -
            Number(a.reviewsCount || a.reviews || 0)
        );
      } else if (selectedFilter === "whats_new") {
        const newArrivals = data.filter((p) => p.isNewArrival);
        data = newArrivals.length > 0 ? newArrivals : data;
      }

      setTimeout(() => {
        setProducts(data);
        setLoading(false);
      }, 300);

      console.log("Applied Filters:", data.length);
      console.log("Query Params:", data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate("ProductDetails", {
      id: product._id || product.id,
      product,
    });
  };

  const displayName = String(
    title || type || subCategory || category || "Products"
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.hIcon}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>

        <Text style={styles.title}>{displayName.toUpperCase()}</Text>

        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => setFilterVisible(true)}
            style={styles.hIcon}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Feather name="sliders" size={22} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSearchVisible(true)}
            style={styles.hIcon}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Feather name="search" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.text} />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item, index) =>
            String(item._id || item.id || index)
          }
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const imageUri = getImageUri(item);
            const itemId = String(item._id || item.id || "");
            const itemTitle = String(item.name || item.title || "Unknown Product");
            const itemPrice = Number(item.price || 0);
            const comparePrice = Number(item.compareAtPrice || item.oldPrice || 0);

            const showComparePrice =
              (item.compareAtPrice != null &&
                Number(item.compareAtPrice) > itemPrice) ||
              (item.oldPrice != null && Number(item.oldPrice) > itemPrice);

            return (
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.card}
                onPress={() => handleProductPress(item)}
              >
                <Image
                  source={
                    imageUri
                      ? { uri: imageUri }
                      : require("../../assets/images/clothing.png")
                  }
                  style={styles.image}
                  resizeMode="cover"
                />

                <TouchableOpacity
                  style={styles.wishBtn}
                  onPress={() => {
                    toggleWishlist({
                      id: itemId,
                      productId: itemId,
                      title: itemTitle,
                      price: itemPrice,
                      image: imageUri,
                    });
                  }}
                >
                  <Ionicons
                    name={isInWishlist(itemId) ? "heart" : "heart-outline"}
                    size={18}
                    color={isInWishlist(itemId) ? "red" : dark ? "#fff" : "#111"}
                  />
                </TouchableOpacity>

                <View style={styles.colorRowWrap}>
                  <ColorDots
                    colors={Array.isArray(item.colors) ? item.colors : []}
                    styles={styles}
                  />
                </View>

                <Text numberOfLines={1} style={styles.pTitle}>
                  {itemTitle}
                </Text>

                <View style={styles.priceRow}>
                  <Text style={styles.price}>{`LKR ${itemPrice.toFixed(2)}`}</Text>

                  {showComparePrice ? (
                    <Text style={styles.compare}>
                      {`LKR ${comparePrice.toFixed(2)}`}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No products found.</Text>
            </View>
          }
        />
      )}

      <FilterSheet
        visible={filterVisible}
        selected={selectedFilter}
        onClose={() => setFilterVisible(false)}
        onApply={(k) => {
          setSelectedFilter(k);
          setFilterVisible(false);
        }}
      />

      <SearchOverlay
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        onOpenFilter={() => {
          setSearchVisible(false);
          setFilterVisible(true);
        }}
        onSearch={(q) => {
          setSearchVisible(false);
          navigation.push("ProductListing", {
            search: q,
            title: `Search: ${q}`,
          });
        }}
      />
    </SafeAreaView>
  );
};

const getStyles = (colors: any, dark: boolean) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 50,
    },
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
    hIcon: {
      padding: 6,
    },
    headerRight: {
      flexDirection: "row",
      alignItems: "center",
    },
    title: {
      flex: 1,
      textAlign: "center",
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: 0.3,
      color: colors.text,
    },
    card: {
      width: "48%",
      marginTop: 14,
    },
    image: {
      width: "100%",
      height: 180,
      borderRadius: 14,
      backgroundColor: "#f0f0f0",
    },
    wishBtn: {
      position: "absolute",
      right: 10,
      top: 10,
      backgroundColor: dark ? "#333" : "#fff",
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      elevation: 2,
    },
    colorRowWrap: {
      marginTop: 8,
      flexDirection: "row",
      alignItems: "center",
      minHeight: 20,
    },
    colorRow: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 8,
    },
    dot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      marginRight: 4,
      borderWidth: 1,
      borderColor: dark ? "#333" : "#e5e5e5",
    },
    moreColors: {
      fontSize: 10,
      color: dark ? "#aaa" : "#666",
    },
    pTitle: {
      fontSize: 14,
      fontWeight: "600",
      marginTop: 6,
      color: colors.text,
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 2,
      flexWrap: "wrap",
    },
    price: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
    },
    compare: {
      fontSize: 12,
      color: dark ? "#777" : "#888",
      marginLeft: 8,
      textDecorationLine: "line-through",
    },
    emptyText: {
      color: colors.text,
    },
  });

export default ProductListingScreen;