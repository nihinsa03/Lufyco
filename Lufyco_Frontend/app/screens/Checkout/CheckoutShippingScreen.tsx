import React, { useState, useMemo } from "react";
import { SafeAreaView, View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, Modal, FlatList, StatusBar } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useCheckoutStore, Address } from "../../store/useCheckoutStore";
import { useTheme } from "../../context/ThemeContext";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";

type NavProp = NativeStackNavigationProp<RootStackParamList, "CheckoutShipping">;

const calculateTotalCities = (data: typeof sriLankaData) => {
    let count = 0;
    data.forEach(p => p.districts.forEach(d => count += d.cities.length));
    return count;
};

const sriLankaData = [
    {
        "province": "Western",
        "districts": [
            {
                "district": "Colombo",
                "cities": ["Colombo", "Dehiwala-Mount Lavinia", "Moratuwa", "Sri Jayawardenepura Kotte", "Homagama", "Maharagama", "Piliyandala"]
            },
            {
                "district": "Gampaha",
                "cities": ["Gampaha", "Negombo", "Kelaniya", "Wattala", "Ja-Ela", "Minuwangoda", "Mirigama"]
            },
            {
                "district": "Kalutara",
                "cities": ["Kalutara", "Panadura", "Beruwala", "Horana", "Matugama", "Aluthgama"]
            }
        ]
    },
    {
        "province": "Central",
        "districts": [
            {
                "district": "Kandy",
                "cities": ["Kandy", "Gampola", "Nawalapitiya", "Peradeniya", "Katugastota"]
            },
            {
                "district": "Matale",
                "cities": ["Matale", "Dambulla", "Sigiriya", "Ukuwela"]
            },
            {
                "district": "Nuwara Eliya",
                "cities": ["Nuwara Eliya", "Hatton", "Talawakele", "Ragala"]
            }
        ]
    },
    {
        "province": "Southern",
        "districts": [
            {
                "district": "Galle",
                "cities": ["Galle", "Ambalangoda", "Hikkaduwa", "Karapitiya", "Elpitiya"]
            },
            {
                "district": "Matara",
                "cities": ["Matara", "Weligama", "Dikwella", "Kamburupitiya", "Akuressa"]
            },
            {
                "district": "Hambantota",
                "cities": ["Hambantota", "Tangalle", "Tissamaharama", "Ambalantota"]
            }
        ]
    },
    {
        "province": "Northern",
        "districts": [
            {
                "district": "Jaffna",
                "cities": ["Jaffna", "Chavakachcheri", "Point Pedro", "Nallur"]
            },
            {
                "district": "Kilinochchi",
                "cities": ["Kilinochchi", "Pallai", "Paranthan"]
            },
            {
                "district": "Mannar",
                "cities": ["Mannar", "Talaimannar", "Nanattan"]
            },
            {
                "district": "Vavuniya",
                "cities": ["Vavuniya", "Cheddikulam", "Nedunkeni"]
            },
            {
                "district": "Mullaitivu",
                "cities": ["Mullaitivu", "Puthukkudiyiruppu", "Mulliyawalai"]
            }
        ]
    },
    {
        "province": "Eastern",
        "districts": [
            {
                "district": "Trincomalee",
                "cities": ["Trincomalee", "Kinniya", "Kantale"]
            },
            {
                "district": "Batticaloa",
                "cities": ["Batticaloa", "Kattankudy", "Eravur"]
            },
            {
                "district": "Ampara",
                "cities": ["Ampara", "Kalmunai", "Sainthamaruthu", "Akkaraipattu"]
            }
        ]
    },
    {
        "province": "North Western",
        "districts": [
            {
                "district": "Kurunegala",
                "cities": ["Kurunegala", "Kuliyapitiya", "Polgahawela", "Wariyapola"]
            },
            {
                "district": "Puttalam",
                "cities": ["Puttalam", "Chilaw", "Wennappuwa", "Dankotuwa"]
            }
        ]
    },
    {
        "province": "North Central",
        "districts": [
            {
                "district": "Anuradhapura",
                "cities": ["Anuradhapura", "Kekirawa", "Medawachchiya", "Mihintale"]
            },
            {
                "district": "Polonnaruwa",
                "cities": ["Polonnaruwa", "Kaduruwela", "Hingurakgoda", "Medirigiriya"]
            }
        ]
    },
    {
        "province": "Uva",
        "districts": [
            {
                "district": "Badulla",
                "cities": ["Badulla", "Bandarawela", "Haputale", "Ella", "Mahiyanganaya"]
            },
            {
                "district": "Monaragala",
                "cities": ["Monaragala", "Wellawaya", "Kataragama", "Bibile"]
            }
        ]
    },
    {
        "province": "Sabaragamuwa",
        "districts": [
            {
                "district": "Ratnapura",
                "cities": ["Ratnapura", "Balangoda", "Embilipitiya", "Pelmadulla"]
            },
            {
                "district": "Kegalle",
                "cities": ["Kegalle", "Mawanella", "Warakapola", "Rambukkana"]
            }
        ]
    }
];

const CheckoutShippingScreen = () => {
    const navigation = useNavigation<NavProp>();
    const { shippingAddress, setShippingAddress } = useCheckoutStore();
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);

    const [form, setForm] = useState<Address>({
        fullName: shippingAddress?.fullName || "",
        phone: shippingAddress?.phone || "",
        country: shippingAddress?.country || "United States",
        city: shippingAddress?.city || "",
        addressLine: shippingAddress?.addressLine || "",
        postalCode: shippingAddress?.postalCode || "",
    });

    // We can store province in local state or in address if we added a field.
    // Assuming we just keep it local for filtering, or maybe overload a field?
    // Let's keep it local. If user comes back, we might lose it unless we modify Store.
    // For now, local state.
    const [province, setProvince] = useState("");

    const [modalVisible, setModalVisible] = useState(false);
    const [selectionMode, setSelectionMode] = useState<'province' | 'city'>('province');

    const [errors, setErrors] = useState<Partial<Record<keyof Address, string>>>({});

    const validate = () => {
        let valid = true;
        let newErrors: Partial<Record<keyof Address, string>> = {};

        if (!form.fullName) { newErrors.fullName = "Required"; valid = false; }
        if (!form.phone) { newErrors.phone = "Required"; valid = false; }
        if (!form.city) { newErrors.city = "Required"; valid = false; }
        if (!province) { newErrors.city = "Province is required"; valid = false; } // Error on city field visually if needed
        if (!form.addressLine) { newErrors.addressLine = "Required"; valid = false; }
        if (!form.postalCode) { newErrors.postalCode = "Required"; valid = false; }

        setErrors(newErrors);
        return valid;
    };

    const onSave = () => {
        if (validate()) {
            setShippingAddress(form);
            navigation.navigate("CheckoutPayment");
        } else {
            Alert.alert("Error", "Please fill in all required fields.");
        }
    };

    // Derived data for lists
    const provincesList = useMemo(() => sriLankaData.map(p => p.province), []);

    // Flatten cities for the selected province
    const citiesList = useMemo(() => {
        if (!province) return [];
        const provData = sriLankaData.find(p => p.province === province);
        if (!provData) return [];
        const allCities: string[] = [];
        provData.districts.forEach(d => {
            allCities.push(...d.cities);
        });
        return allCities.sort();
    }, [province]);

    const openModal = (mode: 'province' | 'city') => {
        if (mode === 'city' && !province) {
            Alert.alert("Notice", "Please select a province first.");
            return;
        }
        setSelectionMode(mode);
        setModalVisible(true);
    };

    const handleSelect = (item: string) => {
        if (selectionMode === 'province') {
            setProvince(item);
            setForm({ ...form, city: "" }); // Reset city when province changes
        } else {
            setForm({ ...form, city: item });
        }
        setModalVisible(false);
    };

    const renderInput = (label: string, field: keyof Address, placeholder: string, keyboardType: any = 'default', isRequired = true) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label} {isRequired && <Text style={{ color: '#EF4444' }}>*</Text>}</Text>
            <TextInput
                style={[styles.input, errors[field] && styles.inputError]}
                placeholder={placeholder}
                placeholderTextColor={colors.textMuted}
                value={form[field]}
                onChangeText={(t) => setForm({ ...form, [field]: t })}
                keyboardType={keyboardType}
            />
            {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
        </View>
    );

    return (
        <SafeAreaView style={styles.safe}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Feather name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Checkout</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Stepper (Figma Style) */}
            <View style={styles.stepperContainer}>
                <View style={styles.stepItem}>
                    <View style={styles.stepIconContainer}>
                        {/* Shipping Box Icon */}
                        <Feather name="package" size={20} color={colors.background} />
                    </View>
                    <Text style={[styles.stepText, styles.stepTextActive]}>Shipping</Text>
                </View>

                <View style={styles.stepLine} />

                <View style={styles.stepItem}>
                    <View style={styles.stepIconContainerInactive}>
                        <Feather name="credit-card" size={20} color={colors.textMuted} />
                    </View>
                    <Text style={styles.stepText}>Payment</Text>
                </View>

                <View style={styles.stepLine} />

                <View style={styles.stepItem}>
                    <View style={styles.stepIconContainerInactive}>
                        <Feather name="clipboard" size={20} color={colors.textMuted} />
                    </View>
                    <Text style={styles.stepText}>Review</Text>
                </View>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>

                    {renderInput("Full Name", "fullName", "Enter full name")}

                    {/* Phone Number with Flag */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number <Text style={{ color: '#EF4444' }}>*</Text></Text>
                        <View style={[styles.phoneContainer, errors.phone && styles.inputError]}>
                            <View style={styles.flagContainer}>
                                <Text style={{ fontSize: 20 }}>🇱🇰</Text>
                                <Feather name="chevron-down" size={16} color={colors.textSecondary} style={{ marginLeft: 4 }} />
                                <Text style={styles.prefixText}>+94</Text>
                            </View>
                            <TextInput
                                style={styles.phoneInput}
                                placeholder="Enter phone number"
                                placeholderTextColor={colors.textMuted}
                                value={form.phone}
                                onChangeText={(t) => setForm({ ...form, phone: t })}
                                keyboardType="phone-pad"
                            />
                        </View>
                        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
                    </View>

                    {/* Province Dropdown */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Province <Text style={{ color: '#EF4444' }}>*</Text></Text>
                        <TouchableOpacity
                            onPress={() => openModal('province')}
                            style={[styles.input, styles.dropdownInput]}
                        >
                            <Text style={province ? styles.inputText : styles.placeholderText}>
                                {province || "Select Province"}
                            </Text>
                            <Feather name="chevron-down" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* City Dropdown */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>City <Text style={{ color: '#EF4444' }}>*</Text></Text>
                        <TouchableOpacity
                            onPress={() => openModal('city')}
                            style={[styles.input, styles.dropdownInput]}
                        >
                            <Text style={form.city ? styles.inputText : styles.placeholderText}>
                                {form.city || "Select City"}
                            </Text>
                            <Feather name="chevron-down" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                        {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
                    </View>

                    {renderInput("Street Address", "addressLine", "Enter street address")}
                    {renderInput("Postal Code", "postalCode", "Enter postal code", "numeric")}

                </ScrollView>
            </KeyboardAvoidingView>

            {/* Bottom Button */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.btn} onPress={onSave}>
                    <Text style={styles.btnText}>Save</Text>
                </TouchableOpacity>
            </View>

            {/* Selection Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Select {selectionMode === 'province' ? 'Province' : 'City'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Feather name="x" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={selectionMode === 'province' ? provincesList : citiesList}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => handleSelect(item)}
                                >
                                    <Text style={styles.modalItemText}>{item}</Text>
                                    {(selectionMode === 'province' ? province === item : form.city === item) && (
                                        <Feather name="check" size={20} color="#2563EB" />
                                    )}
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <Text style={{ textAlign: 'center', padding: 20, color: colors.textMuted }}>
                                    No options available
                                </Text>
                            }
                        />
                    </View>
                </View>
            </Modal>
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

    // Stepper
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'center',
        marginVertical: 24
    },
    stepItem: { alignItems: 'center', gap: 6 },
    stepIconContainer: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: colors.text, borderWidth: 1.5, borderColor: colors.text,
        alignItems: 'center', justifyContent: 'center'
    },
    stepIconContainerInactive: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
        alignItems: 'center', justifyContent: 'center'
    },
    stepText: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
    stepTextActive: { color: colors.text, fontWeight: '700' },
    stepLine: { width: 30, height: 1, backgroundColor: colors.border, marginHorizontal: 8, marginTop: 20 },

    // Form
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: colors.textSecondary },
    input: {
        height: 52, borderWidth: 1, borderColor: colors.border, borderRadius: 12,
        paddingHorizontal: 16, fontSize: 15, color: colors.text, backgroundColor: colors.inputBg
    },
    dropdownInput: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
    },
    inputText: { color: colors.text, fontSize: 15 },
    placeholderText: { color: colors.textMuted, fontSize: 15 },

    // Phone Input
    phoneContainer: {
        flexDirection: 'row', height: 52, borderWidth: 1, borderColor: colors.border, borderRadius: 12,
        overflow: 'hidden', alignItems: 'center'
    },
    flagContainer: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12,
        borderRightWidth: 1, borderRightColor: colors.border, height: '100%',
        backgroundColor: colors.iconBg
    },
    prefixText: { fontSize: 15, color: colors.textSecondary, marginLeft: 6, fontWeight: '500' },
    phoneInput: { flex: 1, paddingHorizontal: 12, fontSize: 15, color: colors.text, backgroundColor: colors.inputBg },

    inputError: { borderColor: '#EF4444' },
    errorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },

    footer: { position: 'absolute', bottom: 0, width: '100%', padding: 20, backgroundColor: colors.background, borderTopWidth: 1, borderColor: colors.border },
    btn: { backgroundColor: isDark ? '#3B5BFF' : '#111', height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: colors.card,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 40,
        maxHeight: "60%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.text
    },
    modalItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    modalItemText: {
        fontSize: 16,
        color: colors.text,
    },
});

export default CheckoutShippingScreen;
