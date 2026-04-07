import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  TextInput,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useCartStore } from "../store/useCartStore";
import { useTheme } from "../context/ThemeContext";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "MyCart">;
const { width } = Dimensions.get("window");

const MyCartScreen: React.FC<Props> = ({ navigation }) => {
  const { items, incrementQty, decrementQty, removeItem, getTotalPrice, clearCart } = useCartStore();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [voucher, setVoucher] = useState("");
  const [discount, setDiscount] = useState(0);

  const subtotal = getTotalPrice();
  const shipping = subtotal > 0 ? 1000.0 : 0;
  const total = subtotal + shipping - discount;

  const handleApplyVoucher = () => {
    if (voucher.toLowerCase() === "save10") {
      setDiscount(10);
      Alert.alert("Voucher Applied", "LKR 10.00 discount applied.");
    } else {
      Alert.alert("Invalid Voucher", "Try 'SAVE10'");
    }
  };

  const handleCheckout = () => {
    navigation.navigate("CheckoutShipping");
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>My Cart</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.emptyContainer}>
          <View
            style={[
              styles.emptyCircle,
              { backgroundColor: isDark ? colors.iconBg : "#F3F4F6" },
            ]}
          >
            <Image
              source={require("../../assets/images/bag.png")}
              style={styles.emptyImg}
            />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Your cart is empty
          </Text>
          <Text style={[styles.emptySub, { color: colors.textMuted }]}>
            Looks like you haven't added anything to your cart yet.
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Cart</Text>
        <TouchableOpacity>
          <Text style={styles.voucherLink}>Voucher Code</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {items.map((item) => (
          <View
            key={item.id}
            style={[
              styles.cartItem,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderWidth: 1,
              },
            ]}
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
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <View style={styles.variantRow}>
                <Text style={[styles.variantText, { color: colors.textMuted }]}>
                  Size: {item.size || "N/A"}
                </Text>
                <View
                  style={[
                    styles.variantColor,
                    {
                      backgroundColor: item.color || "#000",
                      borderColor: colors.border,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.itemPrice, { color: colors.text }]}>
                LKR {Number(item.price || 0).toFixed(2)}
              </Text>
            </View>

            <View style={styles.rightCol}>
              <TouchableOpacity
                onPress={() => removeItem(item.id)}
                style={{ alignSelf: "flex-end", padding: 4 }}
              >
                <Feather name="trash-2" size={18} color="#EF4444" />
              </TouchableOpacity>

              <View
                style={[
                  styles.stepper,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <TouchableOpacity
                  onPress={() => decrementQty(item.id)}
                  style={styles.stepBtn}
                >
                  <Feather name="minus" size={14} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.qtyText, { color: colors.text }]}>
                  {item.qty}
                </Text>
                <TouchableOpacity
                  onPress={() => incrementQty(item.id)}
                  style={styles.stepBtn}
                >
                  <Feather name="plus" size={14} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Info</Text>

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
            Subtotal
          </Text>
          <Text style={[styles.summaryVal, { color: colors.text }]}>
            LKR {subtotal.toFixed(2)}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
            Shipping Cost
          </Text>
          <Text style={[styles.summaryVal, { color: colors.text }]}>
            LKR {shipping.toFixed(2)}
          </Text>
        </View>

        {discount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
              Discount
            </Text>
            <Text style={[styles.summaryVal, { color: "#10B981" }]}>
              -LKR {discount.toFixed(2)}
            </Text>
          </View>
        )}

        <View style={[styles.summaryRow, { marginTop: 12 }]}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
          <Text style={[styles.totalVal, { color: colors.text }]}>
            LKR {total.toFixed(2)}
          </Text>
        </View>

        <View style={styles.voucherBox}>
          <Text style={[styles.voucherLabel, { color: colors.textMuted }]}>
            Voucher Code
          </Text>
          <View style={styles.voucherInputRow}>
            <TextInput
              style={[
                styles.voucherInput,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Enter voucher code"
              placeholderTextColor={colors.textMuted}
              value={voucher}
              onChangeText={setVoucher}
            />
            <TouchableOpacity
              style={[
                styles.applyBtn,
                { backgroundColor: isDark ? "#3B5BFF" : "#111" },
              ]}
              onPress={handleApplyVoucher}
            >
              <Text style={styles.applyText}>APPLY</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: colors.background, borderColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.checkoutBtn,
            { backgroundColor: isDark ? "#3B5BFF" : "#111" },
          ]}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutText}>
            Checkout (LKR {total.toFixed(2)})
          </Text>
        </TouchableOpacity>
      </View>
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
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
    voucherLink: {
      color: "#2563EB",
      fontWeight: "600",
      fontSize: 14,
    },

    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 40,
    },
    emptyCircle: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.iconBg,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
    },
    emptyImg: {
      width: 60,
      height: 60,
      opacity: 0.5,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 8,
    },
    emptySub: {
      textAlign: "center",
      color: colors.textSecondary,
      lineHeight: 22,
      fontSize: 14,
    },
    exploreBtn: {
      marginTop: 30,
      backgroundColor: isDark ? "#3B5BFF" : "#111",
      paddingHorizontal: 30,
      paddingVertical: 14,
      borderRadius: 12,
    },
    exploreText: {
      color: "#fff",
      fontWeight: "700",
    },

    cartItem: {
      flexDirection: "row",
      marginBottom: 20,
      backgroundColor: colors.card,
      padding: 10,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    itemThumb: {
      width: 80,
      height: 80,
      borderRadius: 12,
      backgroundColor: colors.iconBg,
    },
    itemInfo: {
      flex: 1,
      marginLeft: 12,
      justifyContent: "center",
    },
    itemTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 4,
    },
    variantRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
    },
    variantText: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    variantColor: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginLeft: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    itemPrice: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
    },

    rightCol: {
      justifyContent: "space-between",
      alignItems: "flex-end",
    },
    stepper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    stepBtn: {
      padding: 6,
    },
    qtyText: {
      width: 20,
      textAlign: "center",
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
    },

    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 20,
    },

    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 12,
      color: colors.text,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    summaryLabel: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    summaryVal: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
    },
    totalLabel: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.text,
    },
    totalVal: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.text,
    },

    voucherBox: {
      marginTop: 30,
    },
    voucherLabel: {
      fontSize: 14,
      fontWeight: "700",
      marginBottom: 8,
      color: colors.textSecondary,
    },
    voucherInputRow: {
      flexDirection: "row",
    },
    voucherInput: {
      flex: 1,
      height: 48,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      backgroundColor: colors.card,
      color: colors.text,
    },
    applyBtn: {
      marginLeft: 12,
      backgroundColor: isDark ? "#3B5BFF" : "#111",
      borderRadius: 12,
      paddingHorizontal: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    applyText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 12,
    },

    footer: {
      position: "absolute",
      bottom: 0,
      width: "100%",
      padding: 16,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderColor: colors.border,
    },
    checkoutBtn: {
      backgroundColor: isDark ? "#3B5BFF" : "#111",
      paddingVertical: 16,
      borderRadius: 14,
      alignItems: "center",
    },
    checkoutText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 16,
    },
  });

export default MyCartScreen;