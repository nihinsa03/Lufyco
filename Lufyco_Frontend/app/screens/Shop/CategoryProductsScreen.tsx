import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, SafeAreaView, Dimensions, Platform, StatusBar } from "react-native";
import { Feather, Ionicons } from '@expo/vector-icons';
import { useShopStore } from '../../store/useShopStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useNavigation } from '@react-navigation/native';
import { Product } from '../../data/mockData';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 45) / 2;

const CategoryProductsScreen = () => {
    const navigation = useNavigation<any>();
    const { getFilteredProducts, activeFilters, categories } = useShopStore();
    const { toggleWishlist, isInWishlist } = useWishlistStore();
    const products = getFilteredProducts();

    let headerTitle = "Products";
    if (activeFilters.query) headerTitle = `"${activeFilters.query}"`;
    else if (activeFilters.discountOnly) headerTitle = "Exclusive Sale";
    else if (activeFilters.categoryId) {
        const cat = categories.find(c => c.id === activeFilters.categoryId);
        if (cat) headerTitle = cat.name;
    }

    const renderItem = ({ item }: { item: Product }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("ProductDetails", { id: item.id, product: item })}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={typeof item.images[0] === 'string' ? { uri: item.images[0] } : item.images[0]}
                    style={styles.image}
                    resizeMode="cover"
                />
                <TouchableOpacity
                    style={styles.favIcon}
                    onPress={() => toggleWishlist({
                        id: item.id,
                        productId: item.id,
                        title: item.title,
                        price: item.price,
                        image: item.images[0]
                    })}
                >
                    <Feather
                        name={isInWishlist(item.id) ? 'heart' : 'heart'}
                        size={16}
                        color={isInWishlist(item.id) ? '#EF4444' : '#000'}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.productInfo}>
                <View style={styles.colorRow}>
                    {item.colors.slice(0, 3).map((c, i) => (
                        <View key={i} style={[styles.dot, { backgroundColor: c }]} />
                    ))}
                    {item.colors.length > 3 && (
                        <Text style={styles.plusText}>+{item.colors.length - 3} Colors</Text>
                    )}
                </View>

                <Text numberOfLines={1} style={styles.title}>{item.title}</Text>

                <View style={styles.priceRow}>
                    <Text style={styles.price}>LKR {item.price.toFixed(2)}</Text>
                    {item.oldPrice && (
                        <Text style={styles.oldPrice}>LKR {item.oldPrice.toFixed(2)}</Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15 }}>
                        <Feather name="arrow-left" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{headerTitle}</Text>
                </View>

                <View style={styles.headerIcons}>
                    <TouchableOpacity onPress={() => navigation.navigate('Filter')} style={{ marginRight: 15 }}>
                        <Ionicons name="options-outline" size={24} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                        <Ionicons name="search" size={24} color="#000" />
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 15 }}
                contentContainerStyle={{ paddingTop: 15, paddingBottom: 20 }}
                renderItem={renderItem}
                ListEmptyComponent={
                    <View style={styles.center}>
                        <Text>No products found.</Text>
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

    card: { width: COLUMN_WIDTH, marginBottom: 25 },
    imageContainer: { position: 'relative', marginBottom: 10, borderRadius: 12, overflow: 'hidden' },
    image: { width: '100%', height: 200, backgroundColor: '#f9f9f9' },
    favIcon: {
        position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.8)',
        width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center',
    },

    productInfo: { paddingHorizontal: 4 },
    colorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    dot: { width: 10, height: 10, borderRadius: 5, marginRight: 4, borderWidth: 1, borderColor: '#fff' },
    plusText: { fontSize: 10, color: '#666', marginLeft: 4 },

    title: { fontSize: 13, fontWeight: '500', marginBottom: 4, color: '#333' },
    priceRow: { flexDirection: 'row', alignItems: 'center' },
    price: { fontSize: 13, fontWeight: 'bold', color: '#000' },
    oldPrice: { fontSize: 11, color: '#999', textDecorationLine: 'line-through', marginLeft: 6 }
});

export default CategoryProductsScreen;
