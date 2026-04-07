import React, { useState } from "react";
import { SafeAreaView, View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Alert, Platform, StatusBar } from "react-native";
import { Feather, MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useCheckoutStore, PaymentMethod } from "../../store/useCheckoutStore";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import { useTheme } from "../../context/ThemeContext";

type NavProp = NativeStackNavigationProp<RootStackParamList, "CheckoutPayment">;
type MethodId = 'visa' | 'mastercard' | 'paypal' | 'googlepay' | 'cash';

const CheckoutPaymentScreen = () => {
    const navigation = useNavigation<NavProp>();
    const { setPaymentMethod } = useCheckoutStore();
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);

    const [selectedMethod, setSelectedMethod] = useState<MethodId>('visa');
    const [cardName, setCardName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");

    const handleExpiryChange = (text: string) => {
        const digits = text.replace(/\D/g, '').slice(0, 4);
        if (digits.length <= 2) {
            setExpiry(digits);
        } else {
            setExpiry(`${digits.slice(0, 2)}/${digits.slice(2)}`);
        }
    };

    const onContinue = () => {
        if (selectedMethod === 'visa' || selectedMethod === 'mastercard') {
            if (!cardNumber || !expiry || !cvv) {
                Alert.alert("Required", "Please fill in all card details.");
                return;
            }
        }

        const method: PaymentMethod = {
            method: selectedMethod,
            cardHolder: cardName,
            last4: selectedMethod === 'cash' ? undefined : (cardNumber.slice(-4) || "0000"),
        };

        setPaymentMethod(method);
        navigation.navigate("CheckoutReview");
    };

    const renderMethodIcon = (id: MethodId) => {
        const isActive = selectedMethod === id;
        const opacity = isActive ? 1 : 0.6;
        const iconColor = isActive ? '#2563EB' : (isDark ? '#666' : '#999');
        
        switch (id) {
            case 'visa':
                try { return <Image source={require('../../../assets/images/visa.png')} style={{ width: 44, height: 28, resizeMode: 'contain', opacity }} />; }
                catch { return <FontAwesome name="cc-visa" size={32} color={iconColor} />; }
            case 'mastercard':
                try { return <Image source={require('../../../assets/images/mastercard.png')} style={{ width: 44, height: 28, resizeMode: 'contain', opacity }} />; }
                catch { return <FontAwesome name="cc-mastercard" size={32} color={iconColor} />; }
            case 'paypal':
                try { return <Image source={require('../../../assets/images/paypal.png')} style={{ width: 44, height: 28, resizeMode: 'contain', opacity }} />; }
                catch { return <FontAwesome name="cc-paypal" size={32} color={iconColor} />; }
            case 'googlepay':
                try { return <Image source={require('../../../assets/images/googlepay.png')} style={{ width: 44, height: 28, resizeMode: 'contain', opacity }} />; }
                catch { return <FontAwesome name="google" size={28} color={iconColor} />; }
            case 'cash':
                return <MaterialCommunityIcons name="cash" size={32} color={iconColor} />;
        }
    };

    const renderMethod = (id: MethodId) => (
        <TouchableOpacity
            key={id}
            style={[
                styles.payOption,
                { backgroundColor: colors.card, borderColor: selectedMethod === id ? '#2563EB' : colors.border },
                selectedMethod === id && styles.payOptionActive
            ]}
            onPress={() => setSelectedMethod(id)}
        >
            {selectedMethod === id && (
                <View style={styles.checkBadge}>
                    <Feather name="check" size={12} color="#fff" />
                </View>
            )}
            {renderMethodIcon(id)}
        </TouchableOpacity>
    );

    const cardNeeded = selectedMethod === 'visa' || selectedMethod === 'mastercard';

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Feather name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Checkout</Text>
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
                    <View style={[styles.stepCircle, styles.stepActive]}>
                        <Feather name="credit-card" size={16} color="#fff" />
                    </View>
                    <Text style={[styles.stepText, styles.stepTextActive]}>Payment</Text>
                </View>
                <View style={styles.line} />
                <View style={styles.stepItem}>
                    <View style={[styles.stepCircle, { backgroundColor: colors.iconBg }]}>
                        <Feather name="check" size={16} color="#999" />
                    </View>
                    <Text style={styles.stepText}>Review</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>

                {/* Top row: card methods */}
                <View style={styles.methodsRow}>
                    {renderMethod('visa')}
                    {renderMethod('mastercard')}
                    {renderMethod('paypal')}
                    {renderMethod('googlepay')}
                </View>

                {/* Cash on Delivery — full-width */}
                <TouchableOpacity
                    style={[
                        styles.cashOption,
                        { backgroundColor: colors.card, borderColor: selectedMethod === 'cash' ? '#2563EB' : colors.border },
                        selectedMethod === 'cash' && styles.payOptionActive
                    ]}
                    onPress={() => setSelectedMethod('cash')}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {selectedMethod === 'cash' && (
                            <View style={[styles.checkBadge, { position: 'relative', top: 0, right: 0, marginRight: 10 }]}>
                                <Feather name="check" size={12} color="#fff" />
                            </View>
                        )}
                        <MaterialCommunityIcons name="cash" size={22} color={selectedMethod === 'cash' ? '#2563EB' : colors.textSecondary} style={{ marginRight: 10 }} />
                        <View>
                            <Text style={[styles.cashTitle, { color: colors.text }]}>Cash on Delivery</Text>
                            <Text style={[styles.cashSub, { color: colors.textSecondary }]}>Pay when your order arrives</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Card Form */}
                {cardNeeded && (
                    <View style={styles.cardForm}>
                        <Text style={[styles.label, { color: colors.text }]}>Card Holder Name</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                            placeholder="Name on Card"
                            placeholderTextColor={colors.textMuted}
                            value={cardName} onChangeText={setCardName}
                        />

                        <Text style={[styles.label, { color: colors.text }]}>Card Number</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                            placeholder="0000 0000 0000 0000"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="numeric"
                            value={cardNumber} onChangeText={setCardNumber}
                        />

                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 10 }}>
                                <Text style={[styles.label, { color: colors.text }]}>Expiration</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                                    placeholder="MM/YY"
                                    placeholderTextColor={colors.textMuted}
                                    value={expiry} onChangeText={handleExpiryChange}
                                    maxLength={5} keyboardType="numeric"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.label, { color: colors.text }]}>CVV</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                                    placeholder="123"
                                    placeholderTextColor={colors.textMuted}
                                    keyboardType="numeric"
                                    secureTextEntry
                                    value={cvv} onChangeText={setCvv}
                                />
                            </View>
                        </View>
                    </View>
                )}

                {(selectedMethod === 'paypal' || selectedMethod === 'googlepay') && (
                    <View style={[styles.infoBox, { backgroundColor: colors.iconBg }]}>
                        <Text style={{ color: colors.textSecondary }}>You will be redirected to complete payment securely.</Text>
                    </View>
                )}
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <TouchableOpacity style={styles.btn} onPress={onContinue}>
                    <Text style={styles.btnText}>Continue</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    safe: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, backgroundColor: colors.background },
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

    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16, color: colors.text },
    methodsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    payOption: {
        flex: 1, height: 56, borderWidth: 1.5, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center',
        position: 'relative', marginHorizontal: 4,
    },
    payOptionActive: { borderColor: '#2563EB', borderWidth: 2 },
    methodLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
    methodLabelActive: { color: '#2563EB', fontWeight: '700' },
    checkBadge: {
        position: 'absolute', top: 6, right: 6,
        width: 20, height: 20, borderRadius: 10, backgroundColor: '#2563EB',
        alignItems: 'center', justifyContent: 'center',
    },

    cashOption: {
        borderWidth: 1.5, borderRadius: 12, padding: 14,
        marginBottom: 20, backgroundColor: colors.card
    },
    cashTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
    cashSub: { fontSize: 13, marginTop: 2, color: colors.textSecondary },

    cardForm: { marginTop: 6 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 12, color: colors.text },
    input: {
        height: 50, borderWidth: 1, borderRadius: 12, borderColor: colors.border,
        paddingHorizontal: 16, fontSize: 15, color: colors.text, backgroundColor: colors.inputBg
    },
    row: { flexDirection: 'row' },

    infoBox: { padding: 20, borderRadius: 12, alignItems: 'center', marginTop: 20, backgroundColor: colors.iconBg },

    footer: { position: 'absolute', bottom: 0, width: '100%', padding: 20, borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
    btn: { backgroundColor: isDark ? '#fff' : '#111', height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    btnText: { color: isDark ? '#111' : '#fff', fontSize: 16, fontWeight: '700' },
});

export default CheckoutPaymentScreen;
