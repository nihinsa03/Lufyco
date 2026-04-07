import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, SafeAreaView, Dimensions, Platform, StatusBar } from "react-native";
import { Feather, Ionicons } from '@expo/vector-icons';
import { useShopStore } from '../../store/useShopStore';
import { useNavigation } from '@react-navigation/native';
import { Product } from '../../data/mockData';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 45) / 2;

const SaleScreen = () => {
    const navigation = useNavigation<any>();
    const { getSaleProducts, activeFilters } = useShopStore();

    // In a real app we might combine getSaleProducts with getFilteredProducts logic
    // For now, let's just get sale products.
    const products = getSaleProducts();

    const renderItem = ({ item }: { item: Product }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ProductDetails', { id: item.id })}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={typeof item.images[0] === 'string' ? { uri: item.images[0] } : item.images[0]}
                    style={styles.image}
                    resizeMode="cover"
                />
                <TouchableOpacity style={styles.favIcon}>
                    <Feather name="heart" size={16} color="#000" />
                </TouchableOpacity>
                {item.discountPercent && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>-{item.discountPercent}%</Text>
                    </View>
                )}
            </View>

            <View style={styles.colorRow}>
                {item.colors.slice(0, 3).map((c, i) => (
                    <View key={i} style={[styles.dot, { backgroundColor: c }]} />
                ))}
                {item.colors.length > 3 && <Text style={styles.plusText}>+</Text>}
            </View>

            <Text numberOfLines={1} style={styles.title}>{item.title}</Text>

            <View style={styles.priceRow}>
                <Text style={styles.price}>${item.price.toFixed(2)}</Text>
                {item.oldPrice && <Text style={styles.oldPrice}>${item.oldPrice.toFixed(2)}</Text>}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Feather name="arrow-left" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Products/Sale</Text>
                <View style={styles.headerIcons}>
                    <TouchableOpacity onPress={() => navigation.navigate('Filter')} style={{ marginRight: 15 }}>
                        <Feather name="filter" size={22} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                        <Ionicons name="search" size={22} color="#000" />
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 15 }}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={renderItem}
                ListEmptyComponent={
                    <View style={styles.center}>
                        <Text>No sale items found.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' , paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 15, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0'
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    headerIcons: { flexDirection: 'row' },
    center: { alignItems: 'center', marginTop: 50 },

    card: { width: COLUMN_WIDTH, marginBottom: 20 },
    imageContainer: { position: 'relative', marginBottom: 10 },
    image: { width: '100%', height: 200, borderRadius: 10, backgroundColor: '#f9f9f9' },
    favIcon: {
        position: 'absolute', top: 10, right: 10, backgroundColor: '#fff',
        width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center',
        shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3, elevation: 2
    },
    badge: {
        position: 'absolute', top: 10, left: 10, backgroundColor: '#FF4D4D',
        paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4
    },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

    colorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    dot: { width: 10, height: 10, borderRadius: 5, marginRight: 5, borderWidth: 1, borderColor: '#eee' },
    plusText: { fontSize: 10, color: '#888' },

    title: { fontSize: 14, fontWeight: '600', marginBottom: 4, color: '#000' },
    priceRow: { flexDirection: 'row', alignItems: 'center' },
    price: { fontSize: 14, fontWeight: 'bold', color: '#000', marginRight: 8 },
    oldPrice: { fontSize: 12, color: '#999', textDecorationLine: 'line-through' }
});

export default SaleScreen;
