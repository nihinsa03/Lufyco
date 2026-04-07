import React from "react";
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Switch, StatusBar, Alert, Modal, TextInput, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../store/useAuthStore";
import { useProfileStore } from "../store/useProfileStore";
import { useTheme } from "../context/ThemeContext";
import * as ImagePicker from "expo-image-picker";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";

type NavProp = NativeStackNavigationProp<RootStackParamList, "Profile">;

const ProfileScreen = () => {
    const navigation = useNavigation<NavProp>();
    const { logout, user } = useAuthStore();
    const { isDark, toggleTheme, colors } = useTheme();
    const { user: profileUser, updateUser: updateProfileAvatar } = useProfileStore();

    const [isEditModalVisible, setIsEditModalVisible] = React.useState(false);
    const [editName, setEditName] = React.useState(user?.name || "");
    const [editEmail, setEditEmail] = React.useState(user?.email || "");
    const { updateUser } = useAuthStore();

    const handleSaveProfile = () => {
        updateUser({ name: editName, email: editEmail });
        setIsEditModalVisible(false);
        Alert.alert("Success", "Profile updated successfully!");
    };

    const handleOpenEdit = () => {
        setEditName(user?.name || (user?.email?.split('@')[0] || "Guest"));
        setEditEmail(user?.email || "guest@example.com");
        setIsEditModalVisible(true);
    };

    const [localAvatar, setLocalAvatar] = React.useState<string | null>(null);

    const pickImageFromGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission Denied", "We need camera roll permissions to change your profile picture.");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.1,
        });
        if (!result.canceled && result.assets[0]) {
            const uri = result.assets[0].uri;
            setLocalAvatar(uri);
            try {
                updateProfileAvatar({ avatar: uri });
            } catch (e) {
                console.warn("Could not persist avatar to storage", e);
            }
        }
    };

    const pickImageFromCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission Denied", "We need camera permissions to take a profile picture.");
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.1,
        });
        if (!result.canceled && result.assets[0]) {
            const uri = result.assets[0].uri;
            setLocalAvatar(uri);
            try {
                updateProfileAvatar({ avatar: uri });
            } catch (e) {
                console.warn("Could not persist avatar to storage", e);
            }
        }
    };

    const handleChangeProfilePicture = () => {
        Alert.alert("Change Profile Picture", "Choose an option", [
            { text: "📷 Take Photo", onPress: pickImageFromCamera },
            { text: "🖼️ Choose from Gallery", onPress: pickImageFromGallery },
            { text: "Cancel", style: "cancel" },
        ]);
    };

    const personalItems = [
        { label: "Shipping Address", icon: "map-pin", action: () => navigation.navigate("ShippingAddress") },
        { label: "Payment Method", icon: "credit-card", action: () => navigation.navigate("PaymentMethod") },
        { label: "Order History", icon: "clock", action: () => navigation.navigate("OrderHistory") },
        { label: "My Closet", icon: "briefcase", action: () => navigation.navigate("MyCloset") },
    ];

    const supportItems = [
        { label: "Privacy Policy", icon: "shield", action: () => navigation.navigate("PrivacyPolicy") },
        { label: "Terms & Conditions", icon: "file-text", action: () => navigation.navigate("TermsConditions") },
        { label: "FAQs", icon: "help-circle", action: () => navigation.navigate("FAQ") },
    ];

    const renderMenuItem = (item: any, idx: number) => (
        <TouchableOpacity key={idx} style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={item.action}>
            <View style={[styles.iconBox, { backgroundColor: isDark ? colors.iconBg : '#F0F4FF' }]}>
                <Feather name={item.icon as any} size={18} color={isDark ? colors.text : '#4A90D9'} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={[styles.headerGradient, { backgroundColor: isDark ? colors.card : '#4A90D9', borderBottomColor: isDark ? colors.border : 'transparent', borderBottomWidth: isDark ? 1 : 0 }]}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Feather name="arrow-left" size={24} color={isDark ? colors.text : "#fff"} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: isDark ? colors.text : "#fff" }]}>Profile</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={styles.profileRow}>
                    <TouchableOpacity onPress={handleChangeProfilePicture} activeOpacity={0.7}>
                        <Image
                            source={(localAvatar || profileUser?.avatar) ? { uri: localAvatar || profileUser?.avatar } : require("../../assets/images/clothing.png")}
                            style={[styles.avatar, { borderColor: isDark ? colors.border : 'rgba(255,255,255,0.5)' }]}
                        />
                        <View style={[styles.cameraIcon, { backgroundColor: isDark ? colors.card : '#4A90D9', borderColor: isDark ? colors.border : '#fff' }]}>
                            <Feather name="camera" size={12} color={isDark ? colors.text : "#fff"} />
                        </View>
                    </TouchableOpacity>
                    <View style={styles.profileInfo}>
                        <Text style={[styles.userName, { color: isDark ? colors.text : "#fff" }]}>{user?.name || user?.email?.split('@')[0] || "Guest"}</Text>
                        <Text style={[styles.userEmail, { color: isDark ? colors.textMuted : "rgba(255,255,255,0.8)" }]}>{user?.email || "guest@example.com"}</Text>
                    </View>
                    <TouchableOpacity style={[styles.editBtn, { backgroundColor: isDark ? colors.iconBg : 'rgba(255,255,255,0.2)' }]} onPress={handleOpenEdit}>
                        <Feather name="edit-2" size={18} color={isDark ? colors.text : "#fff"} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Personal Information */}
                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Personal Information</Text>
                <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    {personalItems.map(renderMenuItem)}
                </View>

                {/* Support & Information */}
                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Support & Information</Text>
                <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    {supportItems.map(renderMenuItem)}
                </View>

                {/* Account Management */}
                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Account Management</Text>
                <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={() => navigation.navigate("ChangePassword")}>
                        <View style={[styles.iconBox, { backgroundColor: isDark ? colors.iconBg : '#F0F4FF' }]}>
                            <Feather name="lock" size={18} color={isDark ? colors.text : '#4A90D9'} />
                        </View>
                        <Text style={[styles.menuLabel, { color: colors.text }]}>Change Password</Text>
                        <Feather name="chevron-right" size={18} color={colors.textMuted} />
                    </TouchableOpacity>

                    <View style={[styles.menuItem, { borderBottomWidth: 0 }]}>
                        <View style={[styles.iconBox, { backgroundColor: isDark ? colors.iconBg : '#F0F4FF' }]}>
                            <Feather name="moon" size={18} color={isDark ? colors.text : '#4A90D9'} />
                        </View>
                        <Text style={[styles.menuLabel, { color: colors.text }]}>Dark Theme</Text>
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: "#E5E7EB", true: "#4A90D9" }}
                            thumbColor={isDark ? "#fff" : "#f4f3f4"}
                        />
                    </View>
                </View>

                {/* Logout */}
                <TouchableOpacity
                    style={[styles.logoutBtn, { backgroundColor: isDark ? '#2A1515' : '#FEF2F2', borderColor: isDark ? '#5C2020' : '#FECACA' }]}
                    onPress={logout}
                >
                    <Feather name="log-out" size={18} color="#EF4444" />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <View style={{ height: 30 }} />
            </ScrollView>

            <Modal
                visible={isEditModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalCard, { backgroundColor: colors.card, shadowColor: isDark ? 'transparent' : '#000', borderColor: colors.border, borderWidth: 1 }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Profile</Text>
                            <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                                <Feather name="x" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        {/* Profile Picture Changer */}
                        <TouchableOpacity
                            style={{ alignItems: 'center', marginBottom: 20 }}
                            onPress={async () => {
                                setIsEditModalVisible(false);
                                setTimeout(() => pickImageFromGallery(), 400);
                            }}
                            activeOpacity={0.7}
                        >
                            <View>
                                <Image
                                    source={(localAvatar || profileUser?.avatar) ? { uri: localAvatar || profileUser?.avatar } : require("../../assets/images/clothing.png")}
                                    style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: isDark ? colors.border : '#4A90D9' }}
                                />
                                <View style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: isDark ? '#3B5BFF' : '#4A90D9', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: isDark ? colors.card : '#fff' }}>
                                    <Feather name="camera" size={13} color="#fff" />
                                </View>
                            </View>
                            <View style={{ marginTop: 12, backgroundColor: '#2563EB', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}>
                                <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Upload from Device</Text>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Name</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? colors.background : '#F3F4F6', color: colors.text, borderColor: colors.border }]}
                                value={editName}
                                onChangeText={setEditName}
                                placeholder="Enter your name"
                                placeholderTextColor={colors.textMuted}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Email</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? colors.background : '#F3F4F6', color: colors.text, borderColor: colors.border }]}
                                value={editEmail}
                                onChangeText={setEditEmail}
                                placeholder="Enter your email"
                                keyboardType="email-address"
                                placeholderTextColor={colors.textMuted}
                                autoCapitalize="none"
                            />
                        </View>

                        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: isDark ? '#3B5BFF' : '#4A90D9' }]} onPress={handleSaveProfile}>
                            <Text style={styles.saveBtnText}>Save Changes</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1 , paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },

    headerGradient: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 25,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        backgroundColor: '#4A90D9',
    },
    headerRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20,
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },

    profileRow: {
        flexDirection: 'row', alignItems: 'center',
    },
    avatar: {
        width: 56, height: 56, borderRadius: 28,
        borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
        backgroundColor: '#fff',
    },
    cameraIcon: {
        position: 'absolute', bottom: 0, right: 0,
        width: 22, height: 22, borderRadius: 11,
        backgroundColor: '#4A90D9', alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: '#fff',
    },
    profileInfo: { flex: 1, marginLeft: 14 },
    userName: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 2 },
    userEmail: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
    editBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center', justifyContent: 'center',
    },

    scrollContent: { padding: 16 },

    sectionTitle: {
        fontSize: 12, fontWeight: '600', textTransform: 'uppercase',
        letterSpacing: 1, marginTop: 20, marginBottom: 10, marginLeft: 4,
    },
    sectionCard: {
        borderRadius: 16, borderWidth: 1,
        overflow: 'hidden',
    },

    menuItem: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 1,
    },
    iconBox: {
        width: 36, height: 36, borderRadius: 10,
        alignItems: 'center', justifyContent: 'center', marginRight: 14,
    },
    menuLabel: { flex: 1, fontSize: 15, fontWeight: '600' },

    logoutBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 14, borderRadius: 14, marginTop: 24,
        borderWidth: 1,
    },
    logoutText: { fontSize: 15, fontWeight: '600', color: '#EF4444', marginLeft: 8 },

    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', alignItems: 'center'
    },
    modalCard: {
        width: '85%', backgroundColor: '#fff',
        borderRadius: 20, padding: 24,
        shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: { fontSize: 20, fontWeight: '700', color: '#111' },
    inputContainer: { marginBottom: 16 },
    inputLabel: { fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 8 },
    input: {
        backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 16,
        paddingVertical: 14, fontSize: 15, color: '#111', borderWidth: 1, borderColor: '#E5E7EB',
    },
    saveBtn: {
        backgroundColor: '#4A90D9', borderRadius: 12, paddingVertical: 14,
        alignItems: 'center', marginTop: 10,
    },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default ProfileScreen;
