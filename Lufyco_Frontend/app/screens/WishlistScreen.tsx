import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Dimensions,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useWishlistStore } from "../store/useWishlistStore";
import { useCartStore } from "../store/useCartStore";
import { useTheme } from "../context/ThemeContext";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Wishlist">;
const { width, height } = Dimensions.get("window");

const WishlistScreen: React.FC<Props> = ({ navigation }) => {
  const { items, removeFromWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const { colors, isDark } = useTheme();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const confirmDelete = () => {
    if (deleteId) {
      removeFromWishlist(deleteId);
      setDeleteId(null);
    }
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Wishlist</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.emptyContainer}>
          <Image
            source={require("../../assets/images/bag.png")}
            style={styles.emptyImg}
            resizeMode="contain"
          />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Your wishlist is empty
          </Text>
          <Text style={[styles.emptySub, { color: colors.textMuted }]}>
            Tap the heart icon to start saving your favorites
          </Text>

          <TouchableOpacity
            style={[
              styles.exploreBtn,
              { backgroundColor: isDark ? "#3B5BFF" : "#111" },
            ]}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.exploreText}>Explore Categories</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Wishlist</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {items.map((item) => (
          <View
            key={item.id}
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <TouchableOpacity
              style={{ flexDirection: "row", flex: 1, alignItems: "center" }}
              onPress={() =>
                navigation.navigate(
                  "ProductDetails",
                  { id: item.productId, product: item } as any
                )
              }
            >
              <Image
                source={typeof item.image === "string" ? { uri: item.image } : item.image}
                style={[
                  styles.itemThumb,
                  { backgroundColor: isDark ? colors.iconBg : "#eee" },
                ]}
              />
              <View style={styles.itemInfo}>
                <Text
                  style={[styles.itemTitle, { color: colors.text }]}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
                <Text style={[styles.itemPrice, { color: colors.text }]}>
                  LKR {Number(item.price || 0).toFixed(2)}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[
                  styles.delBtn,
                  { backgroundColor: isDark ? "#5C2020" : "#FEE2E2" },
                ]}
                onPress={() => setDeleteId(item.productId)}
              >
                <Feather name="trash-2" size={18} color="#EF4444" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.cartBtn,
                  { backgroundColor: isDark ? colors.iconBg : "#E5E7EB" },
                ]}
                onPress={() => {
                  try {
                    const imageVal = typeof item.image === "number" ? "" : item.image;
                    addItem({
                      productId: item.productId,
                      title: item.title,
                      price: item.price,
                      image: imageVal,
                      qty: 1,
                    });
                    navigation.navigate("MyCart" as any);
                  } catch (e) {
                    console.error("Add to cart error:", e);
                    Alert.alert("Error", "Could not add item to cart. Please try again.");
                  }
                }}
              >
                <Feather name="shopping-cart" size={16} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={!!deleteId} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Delete product from wishlist?
            </Text>
            <Text style={[styles.modalSub, { color: colors.textMuted }]}>
              Are you sure you want to remove this item?
            </Text>

            <TouchableOpacity
              style={[
                styles.modalDeleteBtn,
                { backgroundColor: isDark ? "#EF4444" : "#111" },
              ]}
              onPress={confirmDelete}
            >
              <Text style={styles.modalDeleteText}>Delete Product</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setDeleteId(null)}
            >
              <Text style={[styles.modalCancelText, { color: colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyImg: {
    width: 140,
    height: 140,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
    marginBottom: 8,
  },
  emptySub: {
    textAlign: "center",
    color: "#666",
    lineHeight: 22,
    fontSize: 14,
  },
  exploreBtn: {
    marginTop: 30,
    backgroundColor: "#111",
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 12,
  },
  exploreText: {
    color: "#fff",
    fontWeight: "700",
  },

  card: {
    flexDirection: "row",
    marginBottom: 16,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
  },
  itemThumb: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: "#eee",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "600",
    color: "#555",
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  delBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
  },
  cartBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: "#111",
  },
  modalSub: {
    color: "#666",
    marginBottom: 24,
  },
  modalDeleteBtn: {
    backgroundColor: "#111",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginBottom: 12,
    width: "100%",
    alignItems: "center",
  },
  modalDeleteText: {
    color: "#fff",
    fontWeight: "700",
  },
  modalCancelBtn: {
    paddingVertical: 12,
  },
  modalCancelText: {
    color: "#666",
    fontWeight: "600",
  },
});

export default WishlistScreen;