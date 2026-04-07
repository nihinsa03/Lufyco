import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, ScrollView, Alert, ActivityIndicator, Platform, StatusBar } from "react-native";
import { Feather, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import api from '../api/api';

type Props = NativeStackScreenProps<RootStackParamList, 'ImageSearch'>;

const ImageSearchScreen: React.FC<Props> = ({ navigation }) => {
    const { colors, isDark: dark } = useTheme();
    const styles = getStyles(colors, dark);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [searching, setSearching] = useState(false);

    const [searchResults, setSearchResults] = useState<any[]>([]);
    const scrollViewRef = useRef<ScrollView>(null);

    // Request camera permissions
    const requestCameraPermission = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Camera permission is needed to take photos.',
                [{ text: 'OK' }]
            );
            return false;
        }
        return true;
    };

    // Request gallery permissions
    const requestGalleryPermission = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Gallery access is needed to select photos.',
                [{ text: 'OK' }]
            );
            return false;
        }
        return true;
    };

    // Take photo with camera
    const takePhoto = async () => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) return;

        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setSelectedImage(result.assets[0].uri);
                setSearchResults([]); // Clear previous results
            }
        } catch (error) {
            console.error('Camera error:', error);
            Alert.alert('Error', 'Failed to take photo. Please try again.');
        }
    };

    // Pick image from gallery
    const pickImage = async () => {
        const hasPermission = await requestGalleryPermission();
        if (!hasPermission) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setSelectedImage(result.assets[0].uri);
                setSearchResults([]); // Clear previous results
            }
        } catch (error) {
            console.error('Gallery error:', error);
            Alert.alert('Error', 'Failed to select image. Please try again.');
        }
    };

    // Search for similar products using uploaded image
    const searchSimilarProducts = async () => {
        if (!selectedImage) {
            Alert.alert('No Image', 'Please select or capture an image first.');
            return;
        }

        setSearching(true);

        try {
            // Prepare image for upload
            const formData = new FormData();

            // Extract file name from URI
            const filename = selectedImage.split('/').pop() || 'image.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            formData.append('image', {
                uri: selectedImage,
                name: filename,
                type,
            } as any);

            // Call backend API using shared api instance
            const response = await api.post('/ai/image-search', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 30000, // 30s timeout for ML processing
            });

            const data = response.data;

            // Format results
            const formattedResults = data.results.map((item: any) => ({
                _id: item.product._id,
                name: item.product.name,
                price: item.product.price,
                image: item.product.image,
                similarity: item.similarity,
            }));

            setSearchResults(formattedResults);

            if (formattedResults.length > 0) {
                Alert.alert('Search Complete', `Found ${formattedResults.length} similar products! Scroll down to see them.`);
                // Scroll down after a short delay to allow rendering
                setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 500);
            } else {
                Alert.alert('No Results', 'No similar products found in our database.');
            }
        } catch (error: any) {
            console.error('Search error:', error);
            const message = error.response?.data?.message || error.message || 'Unable to search for similar products.';
            Alert.alert('Search Failed', message + ' Please try again.');
        } finally {
            setSearching(false);
        }
    };



    return (
        <SafeAreaView style={styles.safe}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingRight: 8 }}>
                    <Feather name="arrow-left" size={22} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Image Search</Text>
                <View style={{ width: 22 }} />
            </View>

            <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={{ paddingBottom: 30 }}
            >
                {/* Instructions */}
                <View style={styles.instructionsCard}>
                    <Ionicons name="camera-outline" size={32} color="#667eea" />
                    <Text style={styles.instructionsTitle}>Search by Image</Text>
                    <Text style={styles.instructionsText}>
                        Take a photo or upload an image of a clothing item to find similar products
                    </Text>
                </View>

                {/* Image Selection Buttons */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
                        <View style={styles.iconCircle}>
                            <Feather name="camera" size={24} color="#fff" />
                        </View>
                        <Text style={styles.buttonLabel}>Take Photo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
                        <View style={styles.iconCircle}>
                            <Feather name="image" size={24} color="#fff" />
                        </View>
                        <Text style={styles.buttonLabel}>Choose from Gallery</Text>
                    </TouchableOpacity>
                </View>

                {/* Selected Image Preview */}
                {selectedImage && (
                    <View style={styles.imagePreviewContainer}>
                        <Text style={styles.sectionTitle}>Selected Image</Text>
                        <View style={styles.imageWrapper}>
                            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => {
                                    setSelectedImage(null);
                                    setSearchResults([]);
                                }}
                            >
                                <Feather name="x" size={18} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        {/* Search Button */}
                        <TouchableOpacity
                            style={styles.searchButton}
                            onPress={searchSimilarProducts}
                            disabled={searching}
                        >
                            {searching ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Feather name="search" size={20} color="#fff" style={{ marginRight: 8 }} />
                                    <Text style={styles.searchButtonText}>Find Similar Products</Text>
                                </>
                            )}
                        </TouchableOpacity>


                    </View>
                )}

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <View style={styles.resultsContainer}>
                        <Text style={styles.sectionTitle}>
                            Similar Products ({searchResults.length})
                        </Text>

                        {searchResults.map((product) => (
                            <TouchableOpacity
                                key={product._id}
                                style={styles.productCard}
                                onPress={() => {
                                    navigation.navigate("ProductDetails", {
                                        id: product._id,
                                        product: product,
                                    });
                                }}
                            >
                                <Image
                                    source={{ uri: product.image }}
                                    style={styles.productImage}
                                    defaultSource={require('../../assets/images/clothing.png')}
                                />

                                <View style={styles.productInfo}>
                                    <Text style={styles.productName}>{product.name}</Text>
                                    <Text style={styles.productPrice}>
                                        LKR {product.price.toFixed(2)}
                                    </Text>

                                    <View style={styles.similarityBadge}>
                                        <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                                        <Text style={styles.similarityText}>
                                            {product.similarity}% match
                                        </Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={styles.cartButton}
                                    onPress={() => {
                                        navigation.navigate("ProductDetails", {
                                            id: product._id,
                                            product: product,
                                        });
                                    }}
                                >
                                    <Feather name="shopping-cart" size={18} color="#667eea" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Empty State */}
                {!selectedImage && searchResults.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="images-outline" size={64} color={dark ? '#555' : '#ccc'} />
                        <Text style={styles.emptyText}>No image selected</Text>
                        <Text style={styles.emptySubtext}>
                            Choose an option above to get started
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const getStyles = (colors: any, dark: boolean) => StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background , paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 6,
        paddingBottom: 12,
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: dark ? '#333' : '#f0f0f0',
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text },

    instructionsCard: {
        margin: 16,
        padding: 20,
        backgroundColor: dark ? '#1c1c1e' : '#f8f9ff',
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: dark ? '#333' : '#e0e7ff',
    },
    instructionsTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 12,
        marginBottom: 8,
        color: colors.text,
    },
    instructionsText: {
        fontSize: 14,
        color: dark ? '#aaa' : '#666',
        textAlign: 'center',
        lineHeight: 20,
    },

    buttonRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 16,
        gap: 12,
    },
    actionButton: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#2563EB',
        paddingVertical: 20,
        borderRadius: 12,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    buttonLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
    },

    imagePreviewContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 12,
    },
    imageWrapper: {
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
    },
    previewImage: {
        width: '100%',
        height: 300,
        borderRadius: 12,
        resizeMode: 'cover',
    },
    removeButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    searchButton: {
        backgroundColor: '#667eea',
        paddingVertical: 14,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },

    resultsContainer: {
        paddingHorizontal: 16,
    },
    productCard: {
        flexDirection: 'row',
        backgroundColor: dark ? '#1c1c1e' : '#f9fafb',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: dark ? '#222' : '#e5e7eb',
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        resizeMode: 'cover',
    },
    productInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    productName: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#667eea',
        marginBottom: 6,
    },
    similarityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    similarityText: {
        fontSize: 12,
        color: '#10b981',
        fontWeight: '600',
        marginLeft: 4,
    },
    cartButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: dark ? '#2c2c2e' : '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    },

    emptyState: {
        alignItems: 'center',
        marginTop: 60,
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '700',
        color: dark ? '#aaa' : '#999',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: dark ? '#777' : '#bbb',
        marginTop: 8,
        textAlign: 'center',
    },
});

export default ImageSearchScreen;
