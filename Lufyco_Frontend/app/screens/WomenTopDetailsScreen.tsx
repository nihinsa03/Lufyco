import React, { useMemo, useRef, useState } from "react";
import { SafeAreaView, View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Animated, Platform, StatusBar } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { useCart } from "../context/CartContext";

type Props = NativeStackScreenProps<RootStackParamList, "WomenTopDetails">;

const FALLBACK_COLORS = ["#111111", "#2563EB", "#7C3AED", "#1D4ED8", "#6B7280"];
const money = (n: number) => `$ ${n.toFixed(2)}`;
const fmtReviews = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });

const WomenTopDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { addItem } = useCart();

  const {
    id,
    title = "Sunset Bloom Wrap Top",
    price = 15.25,
    compareAtPrice = 20,
    image,
    colors = FALLBACK_COLORS,
    rating = 4.5,
    reviewsCount = 2495,
  } = route.params ?? ({} as any);

  const [activeColor, setActiveColor] = useState(colors[0]);
  const [qty, setQty] = useState(1);

  // toast
  const [toastVisible, setToastVisible] = useState(false);
  const toastY = useRef(new Animated.Value(-100)).current;
  const showToast = () => {
    setToastVisible(true);
    Animated.spring(toastY, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start(() =>
      setTimeout(() => {
        Animated.timing(toastY, { toValue: -100, duration: 220, useNativeDriver: true }).start(
          () => setToastVisible(false)
        );
      }, 2500)
    );
  };

  const onAddToCart = () => {
    addItem(
      {
        id: id ?? "women-top-1",
        title,
        price,
        compareAtPrice,
        image: image ?? require("../../assets/images/categories/women/tops.jpg"),
        color: activeColor,
        size: "M",
      },
      qty
    );
    showToast();
  };

  const onBuyNow = () => {
    addItem(
      {
        id: id ?? "women-top-1",
        title,
        price,
        compareAtPrice,
        image: image ?? require("../../assets/images/categories/women/tops.jpg"),
        color: activeColor,
        size: "M",
      },
      qty
    );
    // @ts-ignore
    navigation.navigate("CheckoutShipping");
  };

  const starRow = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => (
        <Feather
          key={i}
          name="star"
          size={14}
          color={i < Math.round(rating) ? "#F59E0B" : "#E5E7EB"}
          style={{ marginRight: 2 }}
        />
      )),
    [rating]
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* hero image + top icons */}
      <View>
        <Image
          source={image ?? require("../../assets/images/categories/women/tops.jpg")}
          style={styles.hero}
        />
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconLight}>
            <Feather name="arrow-left" size={18} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconDark}>
            <Feather name="heart" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.pager}>
          {[0, 1, 2, 3, 4].map(i => (
            <View key={i} style={[styles.dot, i === 2 && styles.dotActive]} />
          ))}
        </View>
      </View>

      {/* body */}
      <ScrollView contentContainerStyle={{ paddingBottom: 160 }} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {/* badges */}
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: "#E0F2FE" }]}>
              <Text style={[styles.badgeText, { color: "#0284C7" }]}>Top Rated</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: "#DCFCE7", marginLeft: 8 }]}>
              <Text style={[styles.badgeText, { color: "#16A34A" }]}>Free Shipping</Text>
            </View>
          </View>

          {/* title + price */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.price}>{money(price)}</Text>
              {compareAtPrice > price && <Text style={styles.compare}>{money(compareAtPrice)}</Text>}
            </View>
          </View>

          {/* rating */}
          <View style={styles.ratingRow}>
            <View style={{ flexDirection: "row", marginRight: 6 }}>{starRow}</View>
            <Text style={styles.ratingText}>
              {rating.toFixed(1)} ({fmtReviews(reviewsCount)} reviews)
            </Text>
          </View>

          {/* description */}
          <Text style={styles.lead}>
            Add a touch of effortless elegance to your wardrobe with our Sunset Bloom Wrap Top.
            Featuring a stunning floral print on a vibrant burnt–orange background, this wrap–style
            blouse flatters every figure with its adjustable tie–waist design. Made from lightweight,
            breathable fabric, it’s perfect for warm days and stylish outings. Pair it with
            high–waisted denim for a chic, casual look or dress it up with a skirt for a more
            sophisticated vibe.{" "}
            <Text style={{ color: "#10B981", fontWeight: "700" }}>Read more</Text>
          </Text>

          {/* specs */}
          <Text style={styles.spec}>Available Sizes: XS, S, M, L, XL</Text>
          <Text style={styles.spec}>Material: Soft & breathable fabric</Text>
          <Text style={[styles.spec, { marginBottom: 12 }]}>
            Color: Burnt Orange with floral print
          </Text>

          {/* color */}
          <Text style={styles.label}>Color</Text>
          <View style={{ flexDirection: "row" }}>
            {colors.map(c => (
              <TouchableOpacity
                key={c}
                onPress={() => setActiveColor(c)}
                style={[
                  styles.colorPick,
                  { backgroundColor: c },
                  activeColor === c && styles.colorPickActive,
                ]}
              />
            ))}
          </View>

          {/* quantity */}
          <Text style={[styles.label, { marginTop: 12 }]}>Quantity</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(q => Math.max(1, q - 1))}>
              <Feather name="minus" size={18} />
            </TouchableOpacity>
            <Text style={styles.qtyVal}>{qty}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(q => q + 1)}>
              <Feather name="plus" size={18} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* footer buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.buyNow} onPress={onBuyNow}>
          <Text style={styles.buyText}>Buy Now</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addCart} onPress={onAddToCart}>
          <Text style={styles.cartText}>Add To Cart</Text>
          <Feather name="shopping-cart" size={18} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>

      {/* toast */}
      {toastVisible && (
        <Animated.View style={[styles.toastWrap, { transform: [{ translateY: toastY }] }]} pointerEvents="box-none">
          <View style={styles.toast}>
            <View style={styles.toastIcon}>
              <Feather name="check" size={16} color="#10B981" />
            </View>
            <Text style={styles.toastTxt} numberOfLines={2}>
              The product has been added to your cart
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("MyCart")}>
              <Text style={styles.toastLink}>View Cart</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" , paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  hero: { width: "100%", height: 340, resizeMode: "cover" },
  topRow: { position: "absolute", top: 10, left: 12, right: 12, flexDirection: "row", justifyContent: "space-between" },
  iconLight: { backgroundColor: "#fff", width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  iconDark: { backgroundColor: "#111", width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  pager: { position: "absolute", bottom: 10, left: 0, right: 0, flexDirection: "row", justifyContent: "center" },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#E5E7EB", marginHorizontal: 3 },
  dotActive: { width: 22, backgroundColor: "#34D399" },

  card: { marginTop: -18, marginHorizontal: 12, backgroundColor: "#fff", borderRadius: 18, padding: 16, elevation: 2 },
  badges: { flexDirection: "row", marginBottom: 10 },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14 },
  badgeText: { fontWeight: "700", fontSize: 12 },

  titleRow: { flexDirection: "row", justifyContent: "space-between" },
  title: { fontSize: 18, fontWeight: "800", flex: 1, paddingRight: 8 },
  price: { fontSize: 18, fontWeight: "800" },
  compare: { fontSize: 14, textDecorationLine: "line-through", color: "#9CA3AF" },

  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  ratingText: { fontSize: 12, color: "#374151", fontWeight: "600" },

  lead: { color: "#374151", lineHeight: 21, marginTop: 8 },
  spec: { color: "#6B7280", marginTop: 6 },

  label: { fontWeight: "800", color: "#111", marginTop: 14, marginBottom: 8 },
  colorPick: { width: 36, height: 36, borderRadius: 18, marginRight: 10, borderWidth: 2, borderColor: "#fff" },
  colorPickActive: { borderColor: "#111", borderWidth: 3 },

  qtyRow: { flexDirection: "row", alignItems: "center" },
  qtyBtn: { width: 48, height: 48, borderRadius: 12, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" },
  qtyVal: { width: 50, textAlign: "center", fontSize: 18, fontWeight: "800" },

  footer: { position: "absolute", left: 12, right: 12, bottom: 82, flexDirection: "row" },
  buyNow: { flex: 1, height: 56, borderRadius: 14, backgroundColor: "#F8FAFC", alignItems: "center", justifyContent: "center", marginRight: 10, borderWidth: 1, borderColor: "#E5E7EB" },
  buyText: { fontWeight: "800", fontSize: 16 },
  addCart: { flex: 1, height: 56, borderRadius: 14, backgroundColor: "#111", alignItems: "center", justifyContent: "center", flexDirection: "row" },
  cartText: { color: "#fff", fontWeight: "800", fontSize: 16 },

  toastWrap: { position: "absolute", left: 0, right: 0, top: 58, alignItems: "center" },
  toast: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, width: "92%", elevation: 6 },
  toastIcon: { width: 26, height: 26, borderRadius: 13, backgroundColor: "#ECFDF5", alignItems: "center", justifyContent: "center", marginRight: 10 },
  toastTxt: { flex: 1, fontWeight: "600" },
  toastLink: { color: "#10B981", fontWeight: "800" },
});

export default WomenTopDetailsScreen;
