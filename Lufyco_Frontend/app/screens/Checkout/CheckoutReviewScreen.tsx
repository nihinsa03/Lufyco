import React, { useState } from "react";
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator, Platform, StatusBar } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useCartStore } from "../../store/useCartStore";
import { useCheckoutStore } from "../../store/useCheckoutStore";
import { useOrdersStore, Order } from "../../store/useOrdersStore";
import { useAuthStore } from "../../store/useAuthStore";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import { useTheme } from "../../context/ThemeContext";
import api from "../../api/api";

type NavProp = NativeStackNavigationProp<RootStackParamList, "CheckoutReview">;

const CheckoutReviewScreen = () => {
    const navigation = useNavigation<NavProp>();
    const { items, getTotalPrice, clearCart } = useCartStore();
    const { shippingAddress, paymentMethod } = useCheckoutStore();
    const { addOrder } = useOrdersStore();
    const { user } = useAuthStore();
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);
    const [placing, setPlacing] = useState(false);

    const subtotal = getTotalPrice();
    const shippingCost = 0; // Free shipping logic for now
    const total = subtotal + shippingCost;

    const [deliveryType, setDeliveryType] = useState<'standard' | 'express'>('standard');

    const onPlaceOrder = async () => {
        if (!shippingAddress || !paymentMethod) {
            Alert.alert("Error", "Missing shipping or payment info.");
            return;
        }

        setPlacing(true);

        const localOrderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const newOrder: Order = {
            id: localOrderId,
            date: new Date().toISOString(),
            status: 'Processing',
            items: [...items],
            address: shippingAddress,
            payment: paymentMethod,
            subtotal,
            shipping: shippingCost,
            discount: 0,
            total
        };

        // Save to local Zustand store first (works offline too)
        addOrder(newOrder);
        clearCart();

        // Also save to MongoDB via backend API
        try {
            if (user?.id) {
                const apiOrderItems = items.map(item => ({
                    name: item.title,
                    qty: item.qty,
                    image: typeof item.image === 'string' ? item.image : '',
                    price: item.price,
                    product: item.productId,
                    size: item.size,
                    color: item.color,
                }));

                await api.post('/orders', {
                    user: user.id,
                    orderItems: apiOrderItems,
                    shippingAddress: {
                        address: shippingAddress.addressLine,
                        city: shippingAddress.city,
                        postalCode: shippingAddress.postalCode,
                        country: shippingAddress.country,
                    },
                    paymentMethod: paymentMethod.method,
                    taxPrice: 0,
                    shippingPrice: shippingCost,
                    totalPrice: total,
                });
            }
        } catch (err) {
            // Non-blocking: order already saved locally; just log the error
            console.warn('Failed to sync order to MongoDB:', err);
        }

        setPlacing(false);

        navigation.reset({
            index: 0,
            routes: [{ name: 'OrderSuccess' }],
        });
    };

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Feather name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Review Order</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Stepper */}
            <View style={styles.stepperContainer}>
                <View style={styles.stepItem}>
                    <View style={[styles.stepCircle, styles.stepDone]}>
                        <Feather name="check" size={16} color="#fff" />
                    </View>
                    <Text style={[styles.stepText, styles.stepTextDone]}>Shipping</Text>
                </View>
                <View style={[styles.line, { backgroundColor: '#2563EB' }]} />
                <View style={styles.stepItem}>
                    <View style={[styles.stepCircle, styles.stepDone]}>
                        <Feather name="check" size={16} color="#fff" />
                    </View>
                    <Text style={[styles.stepText, styles.stepTextDone]}>Payment</Text>
                </View>
                <View style={[styles.line, { backgroundColor: '#2563EB' }]} />
                <View style={styles.stepItem}>
                    <View style={[styles.stepCircle, styles.stepActive]}>
                        <Feather name="check" size={16} color="#fff" />
                    </View>
                    <Text style={[styles.stepText, styles.stepTextActive]}>Review</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>

                {/* Shipping Summary */}
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <View style={styles.cardHeader}>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>Shipping Address</Text>
                        <TouchableOpacity onPress={() => navigation.navigate("CheckoutShipping")}>
                            <Feather name="edit-2" size={16} color="#2563EB" />
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.cardText, { color: colors.text }]}>{shippingAddress?.fullName}</Text>
                    <Text style={[styles.cardText, { color: colors.text }]}>{shippingAddress?.phone}</Text>
                    <Text style={[styles.cardText, { color: colors.textSecondary }]}>
                        {shippingAddress?.addressLine}, {shippingAddress?.city}, {shippingAddress?.country} {shippingAddress?.postalCode}
                    </Text>
                </View>

                {/* Payment Summary */}
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <View style={styles.cardHeader}>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>Payment Method</Text>
                        <TouchableOpacity onPress={() => navigation.navigate("CheckoutPayment")}>
                            <Feather name="edit-2" size={16} color="#2563EB" />
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Feather name="credit-card" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
                        <Text style={[styles.cardText, { color: colors.text }]}>
                            {paymentMethod?.method === 'cash' ? 'Cash on Delivery' : `${paymentMethod?.method?.toUpperCase()} ending in ${paymentMethod?.last4}`}
                        </Text>
                    </View>
                </View>

                {/* Items Preview */}
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 12 }]}>Items ({items.length})</Text>
                    {items.map((item) => (
                        <View key={item.id} style={styles.itemRow}>
                            <Image
                                source={typeof item.image === 'string' ? { uri: item.image } : item.image}
                                style={styles.thumb}
                            />
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
                                <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>Size: {item.size} • Color: {item.color}</Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                                    <Text style={[styles.itemPrice, { color: colors.text }]}>${item.price}</Text>
                                    <Text style={[styles.itemQty, { color: colors.textSecondary }]}>x{item.qty}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Delivery Option */}
                <View style={[styles.deliveryCard, { backgroundColor: colors.card }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>Delivery</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>Estimated delivery in next 7 days</Text>
                </View>

                {/* Totals */}
                <View style={styles.totalsSection}>
                    <View style={styles.row}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Subtotal</Text>
                        <Text style={[styles.val, { color: colors.text }]}>${subtotal.toFixed(2)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Shipping</Text>
                        <Text style={[styles.val, { color: colors.text }]}>${shippingCost.toFixed(2)}</Text>
                    </View>
                    <View style={[styles.row, { marginTop: 12 }]}>
                        <Text style={[styles.label, { fontSize: 18, color: colors.text }]}>Total</Text>
                        <Text style={[styles.val, { fontSize: 18, color: colors.text }]}>${total.toFixed(2)}</Text>
                    </View>
                </View>

            </ScrollView>

            <View style={[styles.footer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <TouchableOpacity style={[styles.btn, placing && { opacity: 0.7 }]} onPress={onPlaceOrder} disabled={placing}>
                    {placing
                        ? <ActivityIndicator color={isDark ? '#111' : '#fff'} />
                        : <Text style={styles.btnText}>Place Order</Text>
                    }
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background , paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: colors.border
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },

    stepperContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 20 },
    stepItem: { alignItems: 'center' },
    stepCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.iconBg, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
    stepActive: { backgroundColor: '#2563EB' },
    stepDone: { backgroundColor: '#2563EB' },
    stepText: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
    stepTextActive: { color: '#2563EB', fontWeight: '700' },
    stepTextDone: { color: '#2563EB', fontWeight: '700' },
    line: { width: 40, height: 2, backgroundColor: colors.border, marginBottom: 16, marginHorizontal: 8 },

    card: { padding: 16, backgroundColor: colors.card, borderRadius: 12, marginBottom: 16 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
    cardText: { fontSize: 14, color: colors.text, marginBottom: 2 },

    itemRow: { flexDirection: 'row', marginBottom: 12 },
    thumb: { width: 50, height: 50, borderRadius: 8, backgroundColor: colors.iconBg },
    itemTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
    itemMeta: { fontSize: 12, color: colors.textSecondary },
    itemPrice: { fontSize: 13, fontWeight: '700', color: colors.text },
    itemQty: { fontSize: 13, color: colors.textSecondary },

    deliveryCard: { padding: 16, backgroundColor: isDark ? '#064E3B' : '#F0FDF4', borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: isDark ? '#047857' : '#DCFCE7' },

    totalsSection: { marginTop: 10 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    label: { fontSize: 14, color: colors.textSecondary },
    val: { fontSize: 14, fontWeight: '600', color: colors.text },

    footer: { position: 'absolute', bottom: 0, width: '100%', padding: 20, backgroundColor: colors.background, borderTopWidth: 1, borderColor: colors.border },
    btn: { backgroundColor: isDark ? '#fff' : '#111', height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    btnText: { color: isDark ? '#111' : '#fff', fontSize: 16, fontWeight: '700' },
});

export default CheckoutReviewScreen;
