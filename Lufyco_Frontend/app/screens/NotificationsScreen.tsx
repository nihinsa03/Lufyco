import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView, Platform, StatusBar 
} from "react-native";
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../context/ThemeContext';
import api from "../api/api";

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

type Notification = {
    id: string;
    type: 'order' | 'promo' | 'wishlist' | 'delivery' | 'alert' | 'welcome';
    title: string;
    message: string;
    time: string;
    read: boolean;
    icon: string;
    iconColor: string;
    iconBg: string;
};

const NotificationsScreen = ({ navigation }: Props) => {
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch notifications from backend
useEffect(() => {
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await api.get('/users/notification'); // make sure to await
            setNotifications(res.data.data); // <-- use res.data.data
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    fetchNotifications();
}, []);

    useEffect(() => {
        setUnreadCount(notifications?.filter(n => !n.read).length)
    }, [notifications]);

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const renderNotification = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            style={[
                styles.notificationCard, 
                !item.read && styles.unreadCard
            ]}
            onPress={() => markAsRead(item.id)}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, { backgroundColor: item.iconBg }]}>
                <Feather name={item.icon as any} size={18} color={item.iconColor} />
            </View>
            <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                    <Text style={[styles.notificationTitle, !item.read && styles.unreadTitle]} numberOfLines={1}>
                        {item.title}
                    </Text>
                    {!item.read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notificationMessage} numberOfLines={2}>
                    {item.message}
                </Text>
                <Text style={styles.notificationTime}>{item.time}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Feather name="arrow-left" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Notifications</Text>
                    <TouchableOpacity onPress={markAllAsRead} disabled={unreadCount === 0}>
                        <Text style={[styles.markAllText, unreadCount === 0 && { opacity: 0.3 }]}>
                            Mark all read
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Unread Banner */}
                {unreadCount > 0 && (
                    <View style={styles.unreadBanner}>
                        <Feather name="bell" size={16} color="#3B82F6" />
                        <Text style={styles.unreadBannerText}>
                            {`You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`}
                        </Text>
                    </View>
                )}

                {/* Notifications List */}
                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ color: colors.text }}>Loading notifications...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={notifications}
                        keyExtractor={(item) => item._id} // <-- use _id from API
                        renderItem={renderNotification}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Feather name="bell-off" size={48} color={colors.textMuted} />
                                <Text style={styles.emptyText}>No notifications yet</Text>
                                <Text style={styles.emptySubtext}>We'll notify you about deals and order updates!</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background , paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
    container: { flex: 1, backgroundColor: colors.background },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
    markAllText: { fontSize: 13, color: '#3B82F6', fontWeight: '600' },

    unreadBanner: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
        paddingHorizontal: 16, paddingVertical: 10, marginHorizontal: 16, marginTop: 12,
        borderRadius: 10,
    },
    unreadBannerText: { fontSize: 13, color: '#3B82F6', fontWeight: '500', marginLeft: 8 },

    listContainer: { padding: 16, paddingBottom: 40 },

    notificationCard: {
        flexDirection: 'row', padding: 14, borderRadius: 14, backgroundColor: colors.card
    },
    unreadCard: { backgroundColor: isDark ? '#1A1A1A' : '#FAFBFF' },

    iconContainer: {
        width: 42, height: 42, borderRadius: 12, justifyContent: 'center',
        alignItems: 'center', marginRight: 12,
    },

    notificationContent: { flex: 1 },
    notificationHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
    notificationTitle: { fontSize: 14, flex: 1, marginRight: 8, color: colors.text },
    unreadTitle: { fontWeight: '700' },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3B82F6' },

    notificationMessage: { fontSize: 13, color: colors.textMuted, lineHeight: 18, marginBottom: 6 },
    notificationTime: { fontSize: 11, color: colors.textSecondary, fontWeight: '500' },

    separator: { height: 1, marginVertical: 4, backgroundColor: colors.border },

    emptyState: { alignItems: 'center', paddingTop: 100 },
    emptyText: { fontSize: 16, fontWeight: '600', marginTop: 16, color: colors.text },
    emptySubtext: { fontSize: 13, marginTop: 6, color: colors.textMuted },
});

export default NotificationsScreen;