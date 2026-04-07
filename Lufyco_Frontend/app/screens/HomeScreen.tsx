import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Platform,
  ListRenderItem,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useShopStore } from "../store/useShopStore";
import { useWishlistStore } from "../store/useWishlistStore";
import { useTheme } from "../context/ThemeContext";
import { RootStackParamList } from "../navigation/AppNavigator";
import { SafeAreaView } from "react-native-safe-area-context";

const screenWidth = Dimensions.get("window").width;

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

type TypeHighlight = {
  id: string;
  category: string;
  type: string;
  label: string;
  image: any;
};

type ProductLike = {
  id?: string;
  title?: string;
  name?: string;
  price?: number;
  image?: string;
  images?: string[] | string;
  colors?: string[];
  isNewArrival?: boolean;
  description?: string;
  category?: string;
  type?: string;
};

type HomeHeaderProps = {
  colors: any;
  textSecondary: string;
  activeBanner: number;
  bannerWidth: number;
  bannerScrollRef: React.RefObject<ScrollView | null>;
  banners: {
    image: any;
    discount: string;
    title: string;
    subtitle: string;
  }[];
  onBannerScroll: (event: any) => void;
  onTypePress: (item: TypeHighlight) => void;
  onGoCategories: () => void;
  onGoSearch: () => void;
  onGoImageSearch: () => void;
  onGoSale: () => void;
  onGoAIStylist: () => void;
  onGoNotifications: () => void;
  onGoWishlist: () => void;
  onGoProfile: () => void;
  onGoShopNewStyles: () => void;
};

const TYPE_HIGHLIGHTS: TypeHighlight[] = [
  {
    id: "men_tshirt",
    category: "Men",
    type: "T-Shirt",
    label: "Men T-Shirts",
    image: require("../../assets/images/men/casual/tshirts.jpg"),
  },
  {
    id: "men_jeans",
    category: "Men",
    type: "Jeans",
    label: "Men Jeans",
    image: require("../../assets/images/men/casual/jeans.jpg"),
  },
  {
    id: "men_shirts",
    category: "Men",
    type: "Shirt",
    label: "Men Shirts",
    image: require("../../assets/images/men/casual/shirts.jpg"),
  },
  {
    id: "women_dresses",
    category: "Women",
    type: "Dress",
    label: "Women Dresses",
    image: require("../../assets/images/categories/women/dresses.jpg"),
  },
  {
    id: "women_tops",
    category: "Women",
    type: "Top",
    label: "Women Tops",
    image: require("../../assets/images/categories/women/tops_new.jpg"),
  },
  {
    id: "women_jeans",
    category: "Women",
    type: "Jeans",
    label: "Women Jeans",
    image: require("../../assets/images/categories/women/jeans.jpg"),
  },
  {
    id: "kids_dresses",
    category: "Kids",
    type: "Dress",
    label: "Kids Dresses",
    image: require("../../assets/images/categories/kids/dresses.jpg"),
  },
  {
    id: "kids_tshirts",
    category: "Kids",
    type: "T-Shirt",
    label: "Kids T-Shirts",
    image: require("../../assets/images/categories/kids/boys_tshirts.jpg"),
  },
  {
    id: "shoes_sneakers",
    category: "Shoes",
    type: "Sneakers",
    label: "Sneakers",
    image: require("../../assets/images/categories/footwear/men_sports.jpg"),
  },
  {
    id: "shoes_heels",
    category: "Shoes",
    type: "Heels",
    label: "Heels",
    image: require("../../assets/images/categories/footwear/women_heels.jpg"),
  },
  {
    id: "accessories_handbags",
    category: "Accessories",
    type: "Handbag",
    label: "Handbags",
    image: require("../../assets/images/categories/accessories/handbag_hero.png"),
  },
  {
    id: "jewellery_necklace",
    category: "Jewellery",
    type: "Necklace",
    label: "Necklaces",
    image: require("../../assets/images/categories/jewellery/jewellery.png"),
  },
];

const COLOR_MAP: Record<string, string> = {
  black: "#000000",
  white: "#FFFFFF",
  red: "#EF4444",
  blue: "#3B82F6",
  green: "#22C55E",
  yellow: "#EAB308",
  pink: "#EC4899",
  purple: "#8B5CF6",
  orange: "#F97316",
  brown: "#8B5E3C",
  grey: "#9CA3AF",
  gray: "#9CA3AF",
  silver: "#C0C0C0",
  gold: "#D4AF37",
  beige: "#D6C4A1",
  cream: "#FFFDD0",
  navy: "#1E3A8A",
  maroon: "#7F1D1D",
  olive: "#708238",
  khaki: "#C3B091",
  cyan: "#06B6D4",
  teal: "#14B8A6",
  lavender: "#C4B5FD",
};

const isValidHexColor = (value: string) => {
  return /^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(value.trim());
};

const normalizeColorToHex = (color?: string) => {
  if (!color || typeof color !== "string") return null;

  const trimmed = color.trim();
  if (!trimmed) return null;

  if (isValidHexColor(trimmed)) {
    return trimmed;
  }

  return COLOR_MAP[trimmed.toLowerCase()] || null;
};

const formatColorName = (color?: string) => {
  if (!color || typeof color !== "string") return "";
  const trimmed = color.trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

const HomeHeader = React.memo(
  ({
    colors,
    textSecondary,
    activeBanner,
    bannerWidth,
    bannerScrollRef,
    banners,
    onBannerScroll,
    onTypePress,
    onGoCategories,
    onGoSearch,
    onGoImageSearch,
    onGoSale,
    onGoAIStylist,
    onGoNotifications,
    onGoWishlist,
    onGoProfile,
    onGoShopNewStyles,
  }: HomeHeaderProps) => {
    return (
      <>
        <View style={styles.header}>
          <Text style={[styles.logo, { color: colors.text }]}>Fashion</Text>

          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={onGoAIStylist}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="sparkles-outline" size={24} color="#667eea" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconBtn}
              onPress={onGoNotifications}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="bell" size={24} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconBtn}
              onPress={onGoWishlist}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="heart" size={24} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconBtn}
              onPress={onGoProfile}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="user" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.searchBox, { backgroundColor: colors.searchBg }]}
          onPress={onGoSearch}
          activeOpacity={0.9}
        >
          <Ionicons
            name="search-outline"
            size={20}
            color={textSecondary}
          />
          <Text style={[styles.searchInput, { color: textSecondary }]}>
            Search for brands and products
          </Text>
          <TouchableOpacity
            onPress={onGoImageSearch}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="camera" size={20} color="#667eea" />
          </TouchableOpacity>
        </TouchableOpacity>

        <View style={styles.tabContainer}>
          <View style={styles.tabsWrapper}>
            <TouchableOpacity
              style={[styles.tab, styles.activeTab]}
              activeOpacity={1}
            >
              <Text style={[styles.tabText, styles.activeTabText]}>
                Fashion
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.gridIcon} onPress={onGoCategories}>
            <Ionicons name="grid-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Shop by Type
          </Text>
        </View>

        <View style={styles.typeSectionWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 0 }}
          >
            {[0, 1, 2, 3, 4, 5].map((colIndex) => {
              const topItem = TYPE_HIGHLIGHTS[colIndex];
              const bottomItem = TYPE_HIGHLIGHTS[colIndex + 6];
              const colWidth = (screenWidth - 32) / 3.7;

              return (
                <View
                  key={colIndex}
                  style={{ width: colWidth, paddingRight: 10, rowGap: 16 }}
                >
                  {topItem && (
                    <TouchableOpacity
                      style={{ alignItems: "center" }}
                      onPress={() => onTypePress(topItem)}
                    >
                      <View
                        style={[
                          styles.typeImageContainer,
                          {
                            width: colWidth - 16,
                            height: colWidth - 10,
                            backgroundColor: colors.card,
                          },
                        ]}
                      >
                        <Image
                          source={topItem.image}
                          style={styles.typeImage}
                          resizeMode="cover"
                        />
                      </View>
                      <Text
                        style={[
                          styles.typeName,
                          { color: colors.text, fontSize: 10 },
                        ]}
                        numberOfLines={2}
                      >
                        {topItem.label}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {bottomItem && (
                    <TouchableOpacity
                      style={{ alignItems: "center" }}
                      onPress={() => onTypePress(bottomItem)}
                    >
                      <View
                        style={[
                          styles.typeImageContainer,
                          {
                            width: colWidth - 16,
                            height: colWidth - 10,
                            backgroundColor: colors.card,
                          },
                        ]}
                      >
                        <Image
                          source={bottomItem.image}
                          style={styles.typeImage}
                          resizeMode="cover"
                        />
                      </View>
                      <Text
                        style={[
                          styles.typeName,
                          { color: colors.text, fontSize: 10 },
                        ]}
                        numberOfLines={2}
                      >
                        {bottomItem.label}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.bannerContainer}>
          <ScrollView
            ref={bannerScrollRef}
            horizontal
            pagingEnabled={false}
            snapToInterval={bannerWidth}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onBannerScroll}
            style={{ borderRadius: 20 }}
          >
            {banners.map((banner, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.bannerSlide, { width: bannerWidth }]}
                activeOpacity={0.9}
                onPress={onGoSale}
              >
                <Image
                  source={banner.image}
                  style={styles.banner}
                  resizeMode="cover"
                />
                <View style={styles.bannerOverlay}>
                  <View style={styles.discountTag}>
                    <Text style={styles.discountText}>{banner.discount}</Text>
                  </View>
                  <Text style={styles.bannerTitle}>{banner.title}</Text>
                  <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.paginationDots}>
            {banners.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === activeBanner && styles.activeDot,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Latest Products
          </Text>
          <TouchableOpacity onPress={onGoShopNewStyles}>
            <Text style={styles.seeAll}>SEE ALL</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }
);

const HomeScreen = ({ navigation }: Props) => {
  const {
    products,
    fetchProducts,
    fetchCategories,
    pagination,
    isFetchingProducts,
  } = useShopStore();

  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { colors } = useTheme();

  const textSecondary =
    colors.textSecondary || colors.textMuted || "#6B7280";

  const [loading, setLoading] = useState(true);
  const [activeBanner, setActiveBanner] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const bannerScrollRef = useRef<ScrollView>(null);
  const bannerWidth = screenWidth - 32;

  const banners = useMemo(
    () => [
      {
        image: require("../../assets/images/categories/men/watches.jpg"),
        discount: "30% OFF",
        title: "On Watches",
        subtitle: "Exclusive Sales",
      },
      {
        image: require("../../assets/images/categories/men/jackets.jpg"),
        discount: "25% OFF",
        title: "On Jackets",
        subtitle: "Winter Collection",
      },
      {
        image: require("../../assets/images/categories/men/perfume1.png"),
        discount: "40% OFF",
        title: "On Perfumes",
        subtitle: "Premium Fragrances",
      },
      {
        image: require("../../assets/images/categories/men/sports-shoes.jpg"),
        discount: "20% OFF",
        title: "On Sneakers",
        subtitle: "Trending Now",
      },
      {
        image: require("../../assets/images/categories/men/sweater.jpg"),
        discount: "35% OFF",
        title: "On Sweaters",
        subtitle: "Season Sale",
      },
    ],
    []
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await fetchCategories();
        await fetchProducts({
          page: 1,
          limit: 10,
          append: false,
          sort: "whats_new",
        });
      } catch (err) {
        console.log("[HomeScreen] Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchCategories, fetchProducts]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner((prev) => {
        const next = (prev + 1) % banners.length;
        bannerScrollRef.current?.scrollTo({
          x: next * bannerWidth,
          animated: true,
        });
        return next;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [bannerWidth, banners.length]);

  const handleBannerScroll = useCallback((event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / bannerWidth);
    setActiveBanner(index);
  }, [bannerWidth]);

  const handleTypeHighlightPress = useCallback((item: TypeHighlight) => {
    navigation.navigate("Categories", {
      selectedCategory: item.category,
      selectedType: item.type,
      title: item.label,
    });
  }, [navigation]);

  const getImageUri = useCallback((item: ProductLike | null | undefined) => {
    if (!item) return "";

    if (Array.isArray(item.images) && item.images.length > 0) {
      return item.images[0];
    }

    if (typeof item.images === "string") {
      return item.images;
    }

    if (typeof item.image === "string") {
      return item.image;
    }

    return "";
  }, []);

  const getDisplayColors = useCallback((item: ProductLike) => {
    if (!Array.isArray(item.colors)) return [];

    return item.colors
      .map((color) => ({
        raw: color,
        hex: normalizeColorToHex(color),
        label: formatColorName(color),
      }))
      .filter((c) => c.raw);
  }, []);

  const latestProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return (products as ProductLike[]).filter((p) => p?.isNewArrival);
  }, [products]);

  const productsToShow = latestProducts.length > 0
    ? latestProducts
    : (products as ProductLike[]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || isFetchingProducts || !pagination.hasNextPage) {
      return;
    }

    try {
      setLoadingMore(true);
      await fetchProducts({
        page: pagination.page + 1,
        limit: pagination.limit || 10,
        append: true,
        sort: "whats_new",
      });
    } catch (err) {
      console.log("[HomeScreen] Error loading more products:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [
    fetchProducts,
    isFetchingProducts,
    loading,
    loadingMore,
    pagination.hasNextPage,
    pagination.limit,
    pagination.page,
  ]);

  const renderProductCard: ListRenderItem<ProductLike> = useCallback(
    ({ item }) => {
      const imageUri = getImageUri(item);
      const displayColors = getDisplayColors(item);
      const visibleColors = displayColors.slice(0, 3);
      const extraColorCount = displayColors.length - visibleColors.length;

      return (
        <TouchableOpacity
          style={[styles.productCard, { backgroundColor: colors.card }]}
          activeOpacity={0.92}
          onPress={() =>
            navigation.navigate("ProductDetails", {
            id: item.id || "",
            product: item as any,
            })
          }

        >
          <View style={styles.imageWrapper}>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={styles.productImage}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  styles.productImage,
                  styles.noImageBox,
                  { backgroundColor: colors.iconBg || "#E5E7EB" },
                ]}
              >
                <Feather name="image" size={24} color={textSecondary} />
              </View>
            )}

            {item.isNewArrival ? (
              <View style={styles.newArrivalBadge}>
                <Text style={styles.newArrivalBadgeText}>NEW</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[
                styles.wishlistBtn,
                {
                  backgroundColor:
                    colors.card === "#1E1E1E"
                      ? "rgba(30, 30, 30, 0.82)"
                      : "rgba(255, 255, 255, 0.92)",
                },
              ]}
              onPress={(e) => {
                e.stopPropagation();
                toggleWishlist({
                  id: item.id || "",
                  productId: item.id || "",
                  title: item.title || item.name || "Untitled Product",
                  price: Number(item.price || 0),
                  image: imageUri || "",
                });
              }}
            >
              <Feather
                name="heart"
                size={16}
                color={isInWishlist(item.id || "") ? "#ef4444" : "#111827"}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.productInfo}>
            {(item.category || item.type) ? (
              <View style={styles.metaRow}>
                {item.category ? (
                  <View
                    style={[
                      styles.metaChip,
                      { backgroundColor: colors.searchBg || "#F3F4F6" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.metaChipText,
                        { color: textSecondary },
                      ]}
                      numberOfLines={1}
                    >
                      {item.category}
                    </Text>
                  </View>
                ) : null}

                {item.type ? (
                  <View
                    style={[
                      styles.metaChip,
                      { backgroundColor: colors.searchBg || "#F3F4F6" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.metaChipText,
                        { color: textSecondary },
                      ]}
                      numberOfLines={1}
                    >
                      {item.type}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            <Text
              numberOfLines={1}
              style={[styles.productName, { color: colors.text }]}
            >
              {item.title || item.name}
            </Text>

            {displayColors.length > 0 ? (
              <View style={styles.cardColorRow}>
                <View style={styles.colorCirclesWrap}>
                  {visibleColors.map((color, index) => (
                    <View
                      key={`${color.raw}_${index}`}
                      style={[
                        styles.colorCircle,
                        {
                          backgroundColor: color.hex || "#D1D5DB",
                          borderColor:
                            color.hex?.toLowerCase() === "#ffffff"
                              ? "#D1D5DB"
                              : "#FFFFFF",
                          marginLeft: index === 0 ? 0 : -4,
                        },
                      ]}
                    />
                  ))}
                </View>

                <Text
                  style={[styles.colorText, { color: textSecondary }]}
                  numberOfLines={1}
                >
                  {visibleColors.map((c) => c.label).join(", ")}
                  {extraColorCount > 0 ? ` +${extraColorCount}` : ""}
                </Text>
              </View>
            ) : (
              <View style={styles.cardColorRow}>
                <Text style={[styles.colorText, { color: textSecondary }]}>
                  No colors
                </Text>
              </View>
            )}

            <Text style={[styles.productPrice, { color: colors.text }]}>
              LKR {Number(item.price || 0).toFixed(2)}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [
      colors.card,
      colors.iconBg,
      colors.searchBg,
      colors.text,
      getDisplayColors,
      getImageUri,
      isInWishlist,
      navigation,
      textSecondary,
      toggleWishlist,
    ]
  );

  const headerComponent = useMemo(
    () => (
      <HomeHeader
        colors={colors}
        textSecondary={textSecondary}
        activeBanner={activeBanner}
        bannerWidth={bannerWidth}
        bannerScrollRef={bannerScrollRef}
        banners={banners}
        onBannerScroll={handleBannerScroll}
        onTypePress={handleTypeHighlightPress}
        onGoCategories={() => navigation.navigate("Categories")}
        onGoSearch={() => navigation.navigate("Search")}
        onGoImageSearch={() => navigation.navigate("ImageSearch")}
        onGoSale={() => navigation.navigate("Sale")}
        onGoAIStylist={() => navigation.navigate("AIStylist")}
        onGoNotifications={() => navigation.navigate("Notifications")}
        onGoWishlist={() => navigation.navigate("Main", { screen: "Wishlist" })}
        onGoProfile={() => navigation.navigate("Main", { screen: "Profile" })}
        onGoShopNewStyles={() => navigation.navigate("ShopNewStyles")}
      />
    ),
    [
      activeBanner,
      bannerWidth,
      banners,
      colors,
      handleBannerScroll,
      handleTypeHighlightPress,
      navigation,
      textSecondary,
    ]
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {loading ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#667eea" />
          </View>
        ) : (
          <FlatList
            key="2col"
            data={productsToShow}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.columnWrapper}
            keyExtractor={(item, index) => `${item.id || "product"}_${index}`}
            renderItem={renderProductCard}
            ListHeaderComponent={headerComponent}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text
                  style={[styles.emptyText, { color: textSecondary }]}
                >
                  No products found
                </Text>
              </View>
            }
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color="#667eea" />
                </View>
              ) : null
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.45}
            extraData={colors}
            removeClippedSubviews={true}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },

  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 0 : 0,
  },

  listContent: {
    paddingBottom: 100,
  },

  columnWrapper: {
    justifyContent: "space-between",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 15,
  },

  logo: {
    fontSize: 26,
    fontWeight: "800",
    color: "#000",
  },

  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBtn: {
    marginLeft: 15,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 20,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },

  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  tabsWrapper: {
    flexDirection: "row",
  },

  tab: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#eee",
    marginRight: 10,
    backgroundColor: "#fff",
  },

  activeTab: {
    backgroundColor: "#000",
    borderColor: "#000",
  },

  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },

  activeTabText: {
    color: "#fff",
  },

  gridIcon: {
    padding: 8,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },

  seeAll: {
    color: "#2DD4BF",
    fontSize: 12,
    fontWeight: "600",
  },

  typeSectionWrap: {
    marginBottom: 28,
  },

  typeImageContainer: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  typeImage: {
    width: "100%",
    height: "100%",
  },

  typeName: {
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 14,
    paddingHorizontal: 4,
  },

  bannerContainer: {
    height: 180,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 36,
    position: "relative",
  },

  bannerSlide: {
    height: 180,
    borderRadius: 20,
    overflow: "hidden",
  },

  banner: {
    width: "100%",
    height: "100%",
  },

  bannerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    justifyContent: "center",
  },

  discountTag: {
    backgroundColor: "#111",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 5,
  },

  discountText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },

  bannerTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.9,
  },

  bannerSubtitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },

  paginationDots: {
    position: "absolute",
    bottom: 15,
    right: 20,
    flexDirection: "row",
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.5)",
    marginHorizontal: 3,
  },

  activeDot: {
    backgroundColor: "#3b82f6",
  },

  productCard: {
    width: (screenWidth - 48) / 2,
    marginBottom: 22,
    borderRadius: 20,
    overflow: "hidden",
  },

  imageWrapper: {
    width: "100%",
    aspectRatio: 0.98,
    backgroundColor: "#E5E7EB",
    borderRadius: 20,
    marginBottom: 10,
    overflow: "hidden",
    position: "relative",
  },

  productImage: {
    width: "100%",
    height: "100%",
  },

  noImageBox: {
    justifyContent: "center",
    alignItems: "center",
  },

  wishlistBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },

  newArrivalBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#111827",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },

  newArrivalBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  productInfo: {
    paddingHorizontal: 4,
    paddingTop: 2,
    paddingBottom: 10,
  },

  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 6,
  },

  metaChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginRight: 6,
    marginBottom: 4,
  },

  metaChipText: {
    fontSize: 10,
    fontWeight: "600",
  },

  productName: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 5,
  },

  cardColorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    minHeight: 18,
  },

  colorCirclesWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },

  colorCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.3,
  },

  colorText: {
    fontSize: 10,
    flexShrink: 1,
  },

  productPrice: {
    fontSize: 15,
    fontWeight: "800",
  },

  loaderBox: {
    flex: 1,
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  footerLoader: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyBox: {
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    fontSize: 14,
  },
});

export default HomeScreen;