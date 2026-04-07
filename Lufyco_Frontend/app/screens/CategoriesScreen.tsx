import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../context/ThemeContext";
import { RootStackParamList } from "../navigation/AppNavigator";
import api from "../api/api";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Categories">;
type CategoriesRouteProp = RouteProp<RootStackParamList, "Categories">;

type MainCategory = {
  id: string;
  name: string;
  image?: string | string[];
  gender?: string;
};

type TypeItem = {
  type: string;
  image?: string | string[];
};

type ProductItem = {
  id: string;
  title?: string;
  name?: string;
  price?: number;
  image?: string;
  images?: string[] | string;
  category?: string;
  subCategory?: string;
  type?: string;
  occasion?: string[] | string;
};

type OccasionGroup = {
  occasion: string;
  products: ProductItem[];
};

const CATEGORY_ORDER = [
  "Men",
  "Women",
  "Kids",
  "Unisex",
  "Shoes",
  "Jewellery",
  "Accessories",
  "Beauty",
];

const sortCategories = (items: MainCategory[]) => {
  return [...items].sort((a, b) => {
    const indexA = CATEGORY_ORDER.indexOf(a.name);
    const indexB = CATEGORY_ORDER.indexOf(b.name);

    const safeA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
    const safeB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;

    return safeA - safeB;
  });
};

const normalizeImage = (value: string | string[] | undefined): string => {
  if (!value) return "";
  if (Array.isArray(value)) return value[0] || "";
  return value;
};

const getProductImage = (product: ProductItem | null | undefined): string => {
  if (!product) return "";

  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images[0];
  }

  if (typeof product.images === "string") {
    return product.images;
  }

  if (typeof product.image === "string") {
    return product.image;
  }

  return "";
};

const buildTypeImageFromProducts = (products: ProductItem[] = []): string => {
  const first = products[0];
  return getProductImage(first);
};

const CategoriesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CategoriesRouteProp>();
  const { colors, isDark } = useTheme();

  const initialSelectedCategory = route.params?.selectedCategory;
  const initialSelectedType = route.params?.selectedType;

  const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);
  const [types, setTypes] = useState<TypeItem[]>([]);
  const [groupedProducts, setGroupedProducts] = useState<OccasionGroup[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialSelectedCategory || ""
  );
  const [selectedType, setSelectedType] = useState<string>(
    initialSelectedType || ""
  );

  const [loadingMainCategories, setLoadingMainCategories] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const selectedCategoryObject = useMemo(
    () => mainCategories.find((c) => c.name === selectedCategory),
    [mainCategories, selectedCategory]
  );

  useEffect(() => {
    fetchMainCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchTypesForCategory(selectedCategory);
    } else {
      setTypes([]);
      setGroupedProducts([]);
      setSelectedType("");
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedCategory && selectedType) {
      fetchProductsByCategoryType(selectedCategory, selectedType);
    } else {
      setGroupedProducts([]);
    }
  }, [selectedCategory, selectedType]);

  const fetchMainCategories = async () => {
    try {
      setLoadingMainCategories(true);
      const res = await api.get("/products/categories");
      const fetched: MainCategory[] =
        res.data?.categories || res.data?.data?.categories || res.data || [];

      const sorted = sortCategories(fetched);
      setMainCategories(sorted);

      if (!selectedCategory && sorted.length > 0) {
        setSelectedCategory(sorted[0].name);
      }
    } catch (err) {
      console.warn("[CategoriesScreen] Failed to fetch main categories.", err);
    } finally {
      setLoadingMainCategories(false);
    }
  };

  const fetchTypesForCategory = async (categoryName: string) => {
    try {
      setLoadingTypes(true);

      const res = await api.get(`/products/types?category=${encodeURIComponent(categoryName)}`);
      const raw = res.data || [];

      let normalizedTypes: TypeItem[] = [];

      if (Array.isArray(raw)) {
        normalizedTypes = raw
          .map((item: any) => {
            if (typeof item === "string") {
              return { type: item };
            }
            if (item?.type) {
              return {
                type: item.type,
                image: item.image,
              };
            }
            return null;
          })
          .filter(Boolean) as TypeItem[];
      }

      setTypes(normalizedTypes);

      const matchedInitialType =
        initialSelectedCategory === categoryName && initialSelectedType
          ? normalizedTypes.find((t) => t.type === initialSelectedType)
          : null;

      if (matchedInitialType) {
        setSelectedType(matchedInitialType.type);
        return;
      }

      if (!normalizedTypes.some((t) => t.type === selectedType)) {
        setSelectedType(normalizedTypes[0]?.type || "");
      }
    } catch (err) {
      console.warn("[CategoriesScreen] Failed to fetch types.", err);
      setTypes([]);
      setSelectedType("");
      setGroupedProducts([]);
    } finally {
      setLoadingTypes(false);
    }
  };

  const fetchProductsByCategoryType = async (categoryName: string, typeName: string) => {
    try {
      setLoadingProducts(true);

      const res = await api.get(
        `/products/byCategoryType?category=${encodeURIComponent(categoryName)}&type=${encodeURIComponent(typeName)}`
      );

      const groups: OccasionGroup[] = res.data?.groups || [];
      setGroupedProducts(groups);
    } catch (err) {
      console.warn("[CategoriesScreen] Failed to fetch products by category/type.", err);
      setGroupedProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleMainCategoryPress = (category: MainCategory) => {
    setSelectedCategory(category.name);
  };

  const handleTypePress = (item: TypeItem) => {
    setSelectedType(item.type);
  };

  const renderTopCategory = (item: MainCategory) => {
    const active = selectedCategory === item.name;
    const imageUri = normalizeImage(item.image);

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.topCategoryChip,
          {
            backgroundColor: active ? (isDark ? "#1E293B" : "#E8F1FF") : colors.card,
            borderColor: active ? "#3B82F6" : colors.border,
          },
        ]}
        onPress={() => handleMainCategoryPress(item)}
      >
        {!!imageUri && (
          <Image source={{ uri: imageUri }} style={styles.topCategoryImage} resizeMode="cover" />
        )}
        <Text
          style={[
            styles.topCategoryText,
            { color: active ? "#3B82F6" : colors.text },
          ]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSidebarType = ({ item }: { item: TypeItem }) => {
    const active = selectedType === item.type;
    const imageUri = normalizeImage(item.image);

    return (
      <TouchableOpacity
        style={[
          styles.sidebarItem,
          {
            backgroundColor: active ? (isDark ? "#1E293B" : "#F0F7FF") : "transparent",
          },
        ]}
        onPress={() => handleTypePress(item)}
      >
        <View style={[styles.imageBox, { backgroundColor: colors.iconBg }]}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.sidebarImage} resizeMode="cover" />
          ) : (
            <View style={[styles.sidebarImage, styles.placeholderCenter]}>
              <Feather name="tag" size={18} color={colors.textSecondary} />
            </View>
          )}
        </View>

        <Text
          style={[
            styles.sidebarText,
            { color: active ? colors.text : colors.textSecondary },
          ]}
          numberOfLines={2}
        >
          {item.type}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderProductCard = (product: ProductItem, index: number) => {
    const imageUri = getProductImage(product);

    return (
      <TouchableOpacity
        key={`${product.id || product.name || "product"}_${index}`}
        style={[styles.productCard, { backgroundColor: colors.card }]}
        onPress={() =>
          navigation.navigate("ProductDetails", {
            id: String(product.id),
            product,
          })
        }
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={[styles.productImage, { backgroundColor: colors.iconBg }]}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.productImage,
              styles.placeholderCenter,
              { backgroundColor: colors.iconBg },
            ]}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 11 }}>No Image</Text>
          </View>
        )}

        <Text
          style={[styles.productName, { color: colors.text }]}
          numberOfLines={1}
        >
          {product.title || product.name}
        </Text>

        <Text style={[styles.productPrice, { color: colors.textSecondary }]}>
          LKR {Number(product.price || 0).toFixed(2)}
        </Text>
      </TouchableOpacity>
    );
  };

  const showMainLoader =
    loadingMainCategories && mainCategories.length === 0;

  const showTypesLoader =
    loadingTypes && types.length === 0;

  const showProductsLoader =
    loadingProducts && groupedProducts.length === 0;

  return (
    <SafeAreaView
      style={[
        styles.safe,
        {
          backgroundColor: colors.background,
          paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        },
      ]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15 }}>
            <Feather name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>

          <View>
            <Text style={[styles.title, { color: colors.text }]}>Categories</Text>
            {!!selectedCategory && (
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {selectedType ? `${selectedCategory} • ${selectedType}` : selectedCategory}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate("Search")}>
            <Feather name="search" size={21} color={colors.text} style={{ marginRight: 14 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Notifications")}>
            <Feather name="bell" size={21} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.topCategoryWrap}>
        {showMainLoader ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="small" color="#667eea" />
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10 }}
          >
            {mainCategories.map(renderTopCategory)}
          </ScrollView>
        )}
      </View>

      <View style={styles.contentContainer}>
        <View
          style={[
            styles.sidebar,
            {
              backgroundColor: colors.card,
              borderColor: isDark ? "#1E3A8A" : "#3B82F6",
            },
          ]}
        >
          {showTypesLoader ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="small" color="#667eea" />
            </View>
          ) : types.length > 0 ? (
            <FlatList
              data={types}
              keyExtractor={(item, index) => `${item.type}_${index}`}
              renderItem={renderSidebarType}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 10 }}
            />
          ) : (
            <View style={styles.centerBox}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No types
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.mainContent, { backgroundColor: colors.background }]}>
          {showProductsLoader ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color="#667eea" />
              <Text style={{ marginTop: 10, color: colors.text }}>Loading...</Text>
            </View>
          ) : groupedProducts.length > 0 ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 14, paddingBottom: 24 }}
            >
              {groupedProducts.map((group, groupIndex) => (
                <View
                  key={`${group.occasion}_${groupIndex}`}
                  style={styles.section}
                >
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {group.occasion}
                  </Text>

                  <View style={styles.productsGrid}>
                    {group.products.map((product, productIndex) =>
                      renderProductCard(product, productIndex)
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.centerBox}>
              <Feather name="package" size={40} color="#ccc" />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {selectedType ? "No products found" : "Select a type"}
              </Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },

  topCategoryWrap: {
    minHeight: 72,
  },
  topCategoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 10,
    minHeight: 44,
  },
  topCategoryImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  topCategoryText: {
    fontSize: 13,
    fontWeight: "600",
  },

  contentContainer: {
    flex: 1,
    flexDirection: "row",
  },

  sidebar: {
    width: 96,
    borderWidth: 2,
    borderRadius: 20,
    marginLeft: 10,
    marginBottom: 10,
    marginRight: 8,
    overflow: "hidden",
  },
  sidebarItem: {
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 4,
    width: "100%",
  },
  imageBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 6,
  },
  sidebarImage: {
    width: "100%",
    height: "100%",
  },
  sidebarText: {
    fontSize: 10,
    textAlign: "center",
    fontWeight: "600",
    paddingHorizontal: 2,
    lineHeight: 13,
  },

  mainContent: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productCard: {
    width: "48%",
    borderRadius: 14,
    padding: 8,
    marginBottom: 14,
  },
  productImage: {
    width: "100%",
    height: 140,
    borderRadius: 12,
    marginBottom: 8,
  },
  productName: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 12,
    fontWeight: "500",
  },

  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderCenter: {
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
  },
});

export default CategoriesScreen;