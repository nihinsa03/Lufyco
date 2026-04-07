import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Platform,
  Animated,
  Modal,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useCartStore } from "../store/useCartStore";
import { useWishlistStore } from "../store/useWishlistStore";
import { useProductsStore } from "../store/useProductsStore";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { useTheme } from "../context/ThemeContext";

type Props = NativeStackScreenProps<RootStackParamList, "ProductDetails">;

const { width } = Dimensions.get("window");

const isLightColor = (hex: string): boolean => {
  try {
    const h = hex.replace("#", "");
    const fullHex = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const r = parseInt(fullHex.substring(0, 2), 16);
    const g = parseInt(fullHex.substring(2, 4), 16);
    const b = parseInt(fullHex.substring(4, 6), 16);
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance > 160;
  } catch {
    return false;
  }
};

const getImageUri = (product: any): string => {
  if (!product) return "";

  if (Array.isArray(product.images) && product.images.length > 0) {
    const first = product.images[0];
    return typeof first === "string" ? first : "";
  }

  if (typeof product.images === "string") {
    return product.images;
  }

  if (typeof product.image === "string") {
    return product.image;
  }

  return "";
};

const getColorValue = (color: string): string => {
  if (!color) return "#000000";

  const trimmed = color.trim();

  if (trimmed.startsWith("#")) return trimmed;

  const colorMap: Record<string, string> = {
    black: "#000000",
    white: "#FFFFFF",
    red: "#EF4444",
    blue: "#3B82F6",
    green: "#22C55E",
    yellow: "#EAB308",
    pink: "#EC4899",
    purple: "#A855F7",
    orange: "#F97316",
    brown: "#8B5E3C",
    grey: "#6B7280",
    gray: "#6B7280",
    navy: "#1E3A8A",
    maroon: "#7F1D1D",
    beige: "#D6C7A1",
    cream: "#F5F0E6",
    gold: "#D4AF37",
    silver: "#C0C0C0",
    khaki: "#B6A06A",
  };

  return colorMap[trimmed.toLowerCase()] || "#000000";
};

const ProductDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { id, product: paramProduct } = route.params;

  const getProductById = useProductsStore((state) => state.getProductById);
  const addItemToCart = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const fullProduct = paramProduct || getProductById?.(id);
  const imageUri = getImageUri(fullProduct);

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("Successfully Added to Cart");
  const [sizeGuideVisible, setSizeGuideVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReadMoreButton, setShowReadMoreButton] = useState(false);

  const buttonScale = useRef(new Animated.Value(1)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  if (!fullProduct) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={{ padding: 16 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ padding: 8 }}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Feather name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <Text style={{ padding: 20, textAlign: "center", color: colors.text }}>
          Product not found
        </Text>
      </SafeAreaView>
    );
  }

  const isWishlisted = isInWishlist(fullProduct.id || fullProduct._id);

  const productSizes =
    Array.isArray(fullProduct.sizes) && fullProduct.sizes.length > 0
      ? fullProduct.sizes
      : ["S", "M", "L", "XL"];

  const productColors =
    Array.isArray(fullProduct.colors) && fullProduct.colors.length > 0
      ? fullProduct.colors
      : ["Black", "White", "Blue"];

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);

    Animated.sequence([
      Animated.timing(successOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(1500),
      Animated.timing(successOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setShowSuccess(false));
  };

  const validateSelection = () => {
    if (fullProduct.sizes?.length > 0 && !selectedSize) {
      Alert.alert("Required", "Please select a size");
      return false;
    }

    if (fullProduct.colors?.length > 0 && !selectedColor) {
      Alert.alert("Required", "Please select a color");
      return false;
    }

    return true;
  };

  const addToCart = () => {
    addItemToCart({
      productId: fullProduct.id || fullProduct._id,
      title: fullProduct.title || fullProduct.name,
      price: fullProduct.price,
      image: imageUri,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      qty,
    });
  };

  const handleBuyNow = () => {
    if (validateSelection()) {
      addToCart();
      navigation.navigate("CheckoutShipping" as never);
    }
  };

  const handleAddToCart = () => {
    animateButton();
    if (validateSelection()) {
      addToCart();
      showSuccessMessage("Successfully Added to Cart");
    }
  };

  const handleToggleWishlist = () => {
    const item = {
      id: fullProduct.id || fullProduct._id,
      productId: fullProduct.id || fullProduct._id,
      title: fullProduct.title || fullProduct.name,
      price: fullProduct.price,
      image: imageUri,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
    };

    if (!isWishlisted) {
      showSuccessMessage("Successfully Added to Wishlist");
    }

    toggleWishlist(item);
  };

  const renderRating = (rating: number, count: number) => (
    <View style={styles.ratingRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= Math.round(rating) ? "star" : "star-outline"}
          size={16}
          color="#FBBF24"
        />
      ))}
      <Text style={styles.reviewCount}>({count} Reviews)</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>Product Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <Image
          source={
            imageUri ? { uri: imageUri } : require("../../assets/images/clothing.png")
          }
          style={styles.heroImage}
          resizeMode="cover"
        />

        <View style={[styles.content, { backgroundColor: colors.card }]}>
          <View style={styles.topRow}>
            {renderRating(fullProduct.rating || 4.5, fullProduct.reviewsCount || fullProduct.reviews || 88)}
          </View>

          <View style={styles.titlePriceRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.text }]}>
                {fullProduct.title || fullProduct.name}
              </Text>
              <Text style={[styles.categoryText, { color: colors.textSecondary }]}>
                {fullProduct.category || "Fashion"}
              </Text>
            </View>

            <View>
              <Text style={[styles.price, { color: colors.text }]}>
                LKR {Number(fullProduct.price || 0).toFixed(2)}
              </Text>
            </View>
          </View>

          <Text
            style={[styles.description, { color: colors.textSecondary }]}
            numberOfLines={isExpanded ? undefined : 3}
            onTextLayout={(e) => {
              if (e.nativeEvent.lines.length > 3 && !showReadMoreButton) {
                setShowReadMoreButton(true);
              }
            }}
          >
            {fullProduct.description ||
              "A stylish comfortable piece for your wardrobe. Made from premium materials designed to last."}
          </Text>

          {showReadMoreButton && (
            <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} style={{ marginTop: 4 }}>
              <Text style={[styles.readMore, { color: colors.text }]}>
                {isExpanded ? "Show less" : "Read more"}
              </Text>
            </TouchableOpacity>
          )}

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Color</Text>
            <View style={styles.optionsRow}>
              {productColors.map((c: string) => {
                const colorValue = getColorValue(c);
                return (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setSelectedColor(c)}
                    style={[
                      styles.colorDot,
                      { backgroundColor: colorValue, borderColor: isDark ? "#555" : "#ddd" },
                      selectedColor === c && styles.colorSelected,
                    ]}
                  >
                    {selectedColor === c && (
                      <Feather
                        name="check"
                        size={14}
                        color={isLightColor(colorValue) ? "#000" : "#fff"}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sizeHeader}>
              <Text style={[styles.label, { color: colors.text }]}>Size</Text>
              <TouchableOpacity onPress={() => setSizeGuideVisible(true)}>
                <Text style={[styles.sizeGuide, { color: colors.textSecondary }]}>Size Guide</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.optionsRow}>
              {productSizes.map((s: string) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setSelectedSize(s)}
                  style={[
                    styles.sizeChip,
                    { borderColor: isDark ? "#444" : "#E5E7EB" },
                    selectedSize === s && styles.sizeChipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.sizeText,
                      { color: colors.text },
                      selectedSize === s && styles.sizeTextSelected,
                    ]}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Quantity</Text>
            <View style={[styles.stepperContainer, { backgroundColor: colors.iconBg }]}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setQty(Math.max(1, qty - 1))}>
                <Feather name="minus" size={20} color={colors.text} />
              </TouchableOpacity>

              <Text style={[styles.stepVal, { color: colors.text }]}>{qty}</Text>

              <TouchableOpacity style={styles.stepBtn} onPress={() => setQty(qty + 1)}>
                <Feather name="plus" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.wishBtn, { borderColor: colors.border }]}
          onPress={handleToggleWishlist}
        >
          <Ionicons
            name={isWishlisted ? "heart" : "heart-outline"}
            size={28}
            color={isWishlisted ? "red" : colors.text}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buyBtn, { borderColor: colors.text }]}
          onPress={handleBuyNow}
        >
          <Text style={[styles.buyBtnText, { color: colors.text }]}>Buy Now</Text>
        </TouchableOpacity>

        <Animated.View style={{ flex: 1.5, transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity style={styles.addBtn} onPress={handleAddToCart} activeOpacity={0.9}>
            <Feather
              name="shopping-bag"
              size={20}
              color={isDark ? "#000" : "#fff"}
              style={{ marginRight: 8 }}
            />
            <Text style={[styles.addBtnText, { color: isDark ? "#000" : "#fff" }]}>
              Add to Cart
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {showSuccess && (
        <Animated.View style={[styles.successOverlay, { opacity: successOpacity }]}>
          <View style={styles.successBox}>
            <View style={styles.checkCircle}>
              <Feather name="check" size={24} color="#fff" />
            </View>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        </Animated.View>
      )}

      <Modal
        visible={sizeGuideVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setSizeGuideVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Size Guide</Text>
              <TouchableOpacity onPress={() => setSizeGuideVisible(false)} style={{ padding: 4 }}>
                <Feather name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableHeader, { color: colors.text }]}>Size</Text>
              <Text style={[styles.tableCell, styles.tableHeader, { color: colors.text }]}>
                Chest (in)
              </Text>
              <Text style={[styles.tableCell, styles.tableHeader, { color: colors.text }]}>
                Waist (in)
              </Text>
            </View>

            {[
              ["S", "34-36", "28-30"],
              ["M", "38-40", "32-34"],
              ["L", "42-44", "36-38"],
              ["XL", "46-48", "40-42"],
            ].map(([s, c, w]) => (
              <View key={s} style={styles.tableRow}>
                <Text style={[styles.tableCell, { color: colors.textSecondary }]}>{s}</Text>
                <Text style={[styles.tableCell, { color: colors.textSecondary }]}>{c}</Text>
                <Text style={[styles.tableCell, { color: colors.textSecondary }]}>{w}</Text>
              </View>
            ))}
          </View>
        </View>
      </Modal>
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
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 10,
      zIndex: 10,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "bold",
    },
    backBtn: {
      padding: 8,
    },

    heroImage: {
      width: width,
      height: 420,
      backgroundColor: colors.iconBg,
    },

    content: {
      padding: 24,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      marginTop: -30,
      backgroundColor: colors.card,
    },

    topRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    ratingRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    reviewCount: {
      color: colors.textSecondary,
      fontSize: 13,
      marginLeft: 6,
      fontWeight: "500",
    },

    titlePriceRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 15,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
      lineHeight: 30,
      marginBottom: 4,
    },
    categoryText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    price: {
      fontSize: 22,
      fontWeight: "bold",
      color: colors.text,
    },

    description: {
      color: colors.textSecondary,
      lineHeight: 22,
      fontSize: 14,
    },
    readMore: {
      color: colors.text,
      fontWeight: "bold",
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 20,
    },

    section: {
      marginBottom: 24,
    },
    label: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 12,
      color: colors.text,
    },
    optionsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
    },

    colorDot: {
      width: 36,
      height: 36,
      borderRadius: 18,
      marginRight: 15,
      marginBottom: 8,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    colorSelected: {
      borderWidth: 2,
      borderColor: colors.text,
    },

    sizeHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    sizeGuide: {
      color: colors.textSecondary,
      textDecorationLine: "underline",
      fontSize: 13,
    },
    sizeChip: {
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
      marginBottom: 8,
    },
    sizeChipSelected: {
      backgroundColor: colors.text,
      borderColor: colors.text,
    },
    sizeText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
    },
    sizeTextSelected: {
      color: colors.background,
    },

    stepperContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.iconBg,
      alignSelf: "flex-start",
      borderRadius: 12,
      paddingHorizontal: 5,
    },
    stepBtn: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    stepVal: {
      width: 40,
      textAlign: "center",
      fontSize: 18,
      fontWeight: "600",
    },

    bottomBar: {
      position: "absolute",
      bottom: 0,
      width: "100%",
      backgroundColor: colors.card,
      padding: 20,
      paddingBottom: 30,
      borderTopWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 10,
    },
    wishBtn: {
      width: 52,
      height: 52,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
      backgroundColor: colors.card,
    },
    buyBtn: {
      flex: 1,
      height: 52,
      borderRadius: 16,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.text,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    buyBtnText: {
      fontWeight: "700",
      fontSize: 15,
      color: colors.text,
    },
    addBtn: {
      width: "100%",
      height: 52,
      borderRadius: 16,
      backgroundColor: colors.text,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    addBtnText: {
      fontWeight: "700",
      fontSize: 15,
      color: colors.background,
    },

    successOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 200,
      pointerEvents: "none",
    },
    successBox: {
      backgroundColor: isDark ? "#333" : "rgba(0,0,0,0.85)",
      paddingHorizontal: 25,
      paddingVertical: 20,
      borderRadius: 16,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
    },
    checkCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#22c55e",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 10,
    },
    successText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.7)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    modalContent: {
      width: "85%",
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingVertical: 12,
    },
    tableCell: {
      flex: 1,
      textAlign: "center",
      fontSize: 14,
      color: colors.text,
    },
    tableHeader: {
      fontWeight: "700",
      color: colors.text,
    },
  });

export default ProductDetailsScreen;