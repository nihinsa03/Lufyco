import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  StatusBar,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import dayjs from "dayjs";
import { useTheme } from "../context/ThemeContext";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import api from "../api/api";
import { MOCK_PRODUCTS } from "../data/mockProducts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "../store/useAuthStore";

type Props = NativeStackScreenProps<RootStackParamList, "SuggestedOutfit">;

const moodEmoji: Record<string, string> = {
  Happy: "😊",
  Confident: "😎",
  Sad: "☹️",
  Tired: "😐",
  Excited: "😁",
};

const SuggestedOutfitScreen: React.FC<Props> = ({ route, navigation }) => {
  const {
    mood,
    weather,
    occasion,
    category,
    timeNeed,
    selectedDate,
    gender,
    nowFlag,
  } = route.params;

  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [generatedOutfit, setGeneratedOutfit] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [history, setHistory] = React.useState<any[][]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(-1);
  const userId = useAuthStore.getState().user?.id;

  React.useEffect(() => {
    generateLook();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mood, weather, occasion, category, gender, nowFlag]);

  const handleRegenerate = () => {
    setHistory((prev) => prev.slice(0, currentIndex + 1));
    generateLook();
  };

  const generateLook = async () => {
    setLoading(true);

    try {
      const response = await api.post("/ai/recommend-outfit", {
        userId: userId,
        mood: mood.toLowerCase(),
        occasion: occasion.toLowerCase(),
        weather: weather || "",
        category: category.toLowerCase(),
        gender: gender || "",
        preferredColors: "",
        selectedDate: selectedDate || dayjs().toISOString(),
        nowFlag: nowFlag || "NOW",
      });

      console.log("API outfit recommendation response:", response.data);

      const recommendedOutfit = response.data?.outfit?.items || response.data || [];
      console.log("Recommended outfit items from API:", recommendedOutfit);

      let outfitItems: any[] = [];

      if (recommendedOutfit.length > 0) {
        if (typeof recommendedOutfit[0] === "string") {
          outfitItems = recommendedOutfit
            .map((id: string) => MOCK_PRODUCTS.find((p) => p._id === id))
            .filter(Boolean);
        } else {
          outfitItems = recommendedOutfit;
        }
      } else {
        console.warn("[SuggestedOutfit] API returned empty outfit, using mock logic");
      }

      setHistory((prev) => {
        const newHistory = [...prev, outfitItems];
        setCurrentIndex(newHistory.length - 1);
        return newHistory;
      });

      setGeneratedOutfit(outfitItems);
    } catch (error) {
      console.warn("[SuggestedOutfit] API failed, using mock data:", error);

      const mockOutfit = generateMockOutfit();

      setHistory((prev) => {
        const newHistory = [...prev, mockOutfit];
        setCurrentIndex(newHistory.length - 1);
        return newHistory;
      });

      setGeneratedOutfit(mockOutfit);
    } finally {
      setLoading(false);
    }
  };

  const generateMockOutfit = () => {
    let relevantItems = [...MOCK_PRODUCTS];

    const w = weather.toLowerCase();
    const isCold =
      w.includes("rain") ||
      w.includes("snow") ||
      w.includes("fog") ||
      w.includes("cloud") ||
      w.includes("cool");
    const isHot =
      w.includes("sun") ||
      w.includes("clear") ||
      w.includes("warm") ||
      w.includes("hot");

    let relevantTops = relevantItems.filter(
      (i) =>
        i.subCategory === "Tops" ||
        i.type === "T-Shirt" ||
        i.type === "Shirt" ||
        i.type === "Blouse" ||
        i.type === "Hoodie" ||
        i.type === "Sweater"
    );

    let relevantBottoms = relevantItems.filter(
      (i) =>
        i.subCategory === "Bottoms" ||
        i.type === "Jeans" ||
        i.type === "Pants" ||
        i.type === "Skirt" ||
        i.type === "Shorts"
    );

    let relevantShoes = relevantItems.filter(
      (i) =>
        i.category === "Shoes" ||
        i.subCategory === "Shoes" ||
        i.type === "Shoes"
    );

    let relevantOuterwear = relevantItems.filter(
      (i) => i.subCategory === "Outerwear" || i.type === "Jacket"
    );

    let relevantDresses = relevantItems.filter(
      (i) => i.subCategory === "Dresses" || i.type === "Dress"
    );

    if (occasion === "Office") {
      relevantTops = relevantTops.filter(
        (i) => i.type !== "T-Shirt" && i.type !== "Hoodie"
      );
      relevantBottoms = relevantBottoms.filter((i) => i.type !== "Shorts");
      relevantDresses = relevantDresses.filter(
        (i) => i.name.includes("Summer") === false
      );
    }

    if (category === "Men") {
      relevantItems = relevantItems.filter(
        (i) => i.category === "Men" || i.category === "Unisex"
      );
    } else if (category === "Women") {
      relevantItems = relevantItems.filter(
        (i) => i.category === "Women" || i.category === "Unisex"
      );
    } else if (category === "Kids") {
      relevantItems = relevantItems.filter(
        (i) => i.category === "Kids" || i.category === "Unisex"
      );
    }

    if (isCold) {
      const warmTops = relevantTops.filter(
        (i) => i.type === "Hoodie" || i.type === "Sweater"
      );
      if (warmTops.length > 0) relevantTops = warmTops;
    } else if (isHot) {
      relevantOuterwear = [];
      relevantTops = relevantTops.filter(
        (i) => i.type === "T-Shirt" || i.type === "Blouse"
      );
      relevantBottoms = relevantBottoms.filter(
        (i) => i.type === "Shorts" || i.type === "Skirt" || i.type === "Jeans"
      );
    }

    const outfit: any[] = [];
    const random = (arr: any[]) =>
      arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;

    const useDress = relevantDresses.length > 0 && Math.random() > 0.7;

    if (useDress) {
      const dress = random(relevantDresses);
      if (dress) outfit.push({ ...dress, source: "closet" });
    } else {
      const top = random(relevantTops);
      const bottom = random(relevantBottoms);
      if (top) outfit.push({ ...top, source: "closet" });
      if (bottom) outfit.push({ ...bottom, source: "closet" });
    }

    const shoe = random(relevantShoes);
    if (shoe) outfit.push({ ...shoe, source: "product" });

    if (isCold && relevantOuterwear.length > 0) {
      const jacket = random(relevantOuterwear);
      if (jacket && !outfit.find((i) => i._id === jacket._id)) {
        outfit.push({ ...jacket, source: "product" });
      }
    }

    return outfit;
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      setGeneratedOutfit(history[prevIdx]);
    }
  };

  const handleRedo = () => {
    if (currentIndex < history.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setGeneratedOutfit(history[nextIdx]);
    }
  };

  const handleSave = async () => {
  try {
    const existingStr = await AsyncStorage.getItem("saved_looks");
    const existing = existingStr ? JSON.parse(existingStr) : [];

    const normalizeImagePath = (image: string) => {
      if (!image) return image;

      if (image.startsWith("http://") || image.startsWith("https://")) {
        try {
          const url = new URL(image);
          return url.pathname.replace(/^\/+/, "");
        } catch {
          return image;
        }
      }

      return image.replace(/^\/+/, "");
    };

    const newLook = {
      id: Date.now().toString(),
      mood,
      weather,
      occasion,
      category,
      timeNeed,
      selectedDate,
      items: generatedOutfit.map((item) => ({
        ...item,
        image: normalizeImagePath(item.image),
      })),
      date: new Date().toISOString(),
    };

    console.log("Saving new look:", newLook);

    await AsyncStorage.setItem("saved_looks", JSON.stringify([newLook, ...existing]));

    try {
      const response = await api.post(
        "/ai/saved-my-looks",
        {
          userId,
          ...newLook,
        },
        {
          timeout: 20000,
        }
      );

      console.log("Saved to backend:", response.data);
      alert("Outfit also saved on server!");
    } catch (apiError) {
      console.error("Failed to save on server:", apiError);
      alert("Failed to save outfit on server, but saved locally.");
    }

    alert("Outfit Saved!");
    navigation.navigate("AIStylist");
  } catch (e) {
    console.error(e);
    alert("Failed to save outfit");
  }
};

  const handleSuggestedProductPress = (product: any) => {
    navigation.navigate("ProductDetails", {
      id: product._id || product.id,
      product,
    });
  };

  const closetItems = React.useMemo(
    () => generatedOutfit.filter((item) => item?.source === "closet"),
    [generatedOutfit]
  );

  const productItems = React.useMemo(
    () => generatedOutfit.filter((item) => item?.source === "product"),
    [generatedOutfit]
  );

  const renderItemCard = (item: any, idx: number) => (
    <View key={`${item?._id || item?.id || idx}`} style={styles.outfitItem}>
      <Image
        source={{ uri: item.image }}
        style={styles.outfitImg}
        onLoad={() => console.log("Image loaded:", item.image)}
        onError={(e) =>
          console.log("Image load error:", item.image, e.nativeEvent)
        }
      />
      <Text
        style={[styles.outfitLabel, { color: colors.text }]}
        numberOfLines={2}
      >
        {item.name}
      </Text>
    </View>
  );

  const renderSuggestionRow = (item: any, idx: number) => (
    <TouchableOpacity
      key={`${item?._id || item?.id || idx}`}
      activeOpacity={0.9}
      style={[styles.suggestionRow, { backgroundColor: colors.card }]}
      onPress={() => handleSuggestedProductPress(item)}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.suggestionImg}
        onLoad={() => console.log("Suggestion image loaded:", item.image)}
        onError={(e) =>
          console.log("Suggestion image load error:", item.image, e.nativeEvent)
        }
      />

      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text
          style={[styles.suggestionTitle, { color: colors.text }]}
          numberOfLines={1}
        >
          {item.name}
        </Text>

        <Text
          style={[styles.suggestionSub, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {item.type || item.subCategory || "Matches your outfit"}
        </Text>

        {typeof item.price === "number" && (
          <Text style={[styles.suggestionPrice, { color: colors.text }]}>
            LKR {item.price.toFixed(2)}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.cartBtn}
        onPress={() => handleSuggestedProductPress(item)}
      >
        <Feather name="shopping-cart" size={18} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ paddingRight: 8 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Suggested Outfit
        </Text>

        <TouchableOpacity
          onPress={() => navigation.navigate("SavedLooks")}
          style={{ paddingLeft: 8 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="bookmark" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View
          style={[
            styles.pill,
            { backgroundColor: isDark ? colors.border : "#DFF6FF" },
          ]}
        >
          <Text style={styles.pillEmoji}>{moodEmoji[mood] ?? "🙂"}</Text>
          <Text style={[styles.pillText, { color: colors.text }]}>
            {mood} + {weather} + {occasion} + {category}{" "}
            {gender ? `+ ${gender}` : ""}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Your Closet Suggested Outfit
        </Text>

        <View style={[styles.outfitCard, { backgroundColor: colors.card }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.outfitRow}
          >
            {loading ? (
              <Text style={{ padding: 20, color: colors.textSecondary }}>
                Loading outfit...
              </Text>
            ) : closetItems.length === 0 ? (
              <Text style={{ padding: 20, color: colors.textSecondary }}>
                No closet items found for this look.
              </Text>
            ) : (
              closetItems.map((item, idx) => renderItemCard(item, idx))
            )}
          </ScrollView>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 12, color: colors.text }]}>
          Complete Your Look
        </Text>

        {loading ? (
          <View
            style={[
              styles.suggestionRow,
              { backgroundColor: colors.card, justifyContent: "center" },
            ]}
          >
            <Text style={{ color: colors.textSecondary }}>
              Loading suggestions...
            </Text>
          </View>
        ) : productItems.length === 0 ? (
          <View
            style={[
              styles.suggestionRow,
              { backgroundColor: colors.card, justifyContent: "center" },
            ]}
          >
            <Text style={{ color: colors.textSecondary }}>
              No product suggestions available.
            </Text>
          </View>
        ) : (
          productItems.map((item, idx) => renderSuggestionRow(item, idx))
        )}

        {productItems.length > 0 && (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ProductListing", {
                title: "Suggested Products",
                productsN: productItems,
              })
            }
          >
            <Text style={styles.moreLink}>View More Suggestions</Text>
          </TouchableOpacity>
        )}

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              styles.actionGhost,
              {
                backgroundColor: isDark ? colors.border : "#F1F1F1",
                flex: 0.5,
                marginRight: 5,
                opacity: currentIndex > 0 ? 1 : 0.4,
              },
            ]}
            onPress={handleUndo}
            disabled={currentIndex <= 0}
          >
            <Feather name="corner-up-left" size={20} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              styles.actionGhost,
              {
                backgroundColor: isDark ? colors.border : "#F1F1F1",
                flex: 1,
                marginHorizontal: 5,
              },
            ]}
            onPress={handleRegenerate}
          >
            <Feather name="thumbs-down" size={20} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              styles.actionGhost,
              {
                backgroundColor: isDark ? colors.border : "#F1F1F1",
                flex: 1,
                marginHorizontal: 5,
              },
            ]}
            onPress={handleRegenerate}
          >
            <Feather name="repeat" size={20} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              styles.actionGhost,
              {
                backgroundColor: isDark ? colors.border : "#F1F1F1",
                flex: 0.5,
                marginLeft: 5,
                opacity: currentIndex < history.length - 1 ? 1 : 0.4,
              },
            ]}
            onPress={handleRedo}
            disabled={currentIndex >= history.length - 1}
          >
            <Feather name="corner-up-right" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={[styles.actionsRow, { marginTop: 10 }]}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: colors.text },
              { flex: 1, marginLeft: 0 },
            ]}
            onPress={handleSave}
          >
            <Text style={[styles.actionText, { color: colors.background }]}>
              Save This Look
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (colors: any, dark: boolean) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingTop: 6,
      paddingBottom: 10,
      justifyContent: "space-between",
    },
    headerTitle: { fontSize: 24, fontWeight: "800" },

    pill: {
      marginHorizontal: 16,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
    },
    pillEmoji: { fontSize: 18, marginRight: 8 },
    pillText: { fontSize: 16, fontWeight: "700" },

    sectionTitle: {
      fontSize: 22,
      fontWeight: "800",
      marginHorizontal: 16,
      marginTop: 14,
      marginBottom: 8,
    },

    outfitCard: {
      marginHorizontal: 16,
      borderRadius: 14,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    outfitRow: {
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "flex-start",
    },
    outfitItem: { alignItems: "center", marginRight: 24, width: 130 },
    outfitImg: {
      width: 130,
      height: 110,
      borderRadius: 10,
      resizeMode: "cover",
      backgroundColor: dark ? "#222" : "#eee",
    },
    outfitLabel: {
      marginTop: 8,
      fontWeight: "700",
      textAlign: "center",
    },

    suggestionRow: {
      marginHorizontal: 16,
      borderRadius: 14,
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    suggestionImg: {
      width: 64,
      height: 64,
      borderRadius: 10,
      resizeMode: "cover",
      backgroundColor: dark ? "#222" : "#eee",
    },
    suggestionTitle: { fontWeight: "800", fontSize: 16 },
    suggestionSub: { marginTop: 2 },
    suggestionPrice: {
      marginTop: 4,
      fontWeight: "700",
      fontSize: 14,
    },

    cartBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: "#2C63FF",
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 10,
    },

    moreLink: {
      color: "#3F51FF",
      fontWeight: "700",
      textAlign: "center",
      marginTop: 4,
      marginBottom: 10,
    },

    actionsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginHorizontal: 16,
      marginTop: 6,
    },
    actionBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
    },
    actionGhost: {
      marginRight: 10,
    },
    actionText: { fontWeight: "800", fontSize: 16 },
  });

export default SuggestedOutfitScreen;