import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
  StatusBar,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import api from "../api/api";
import { useAuthStore } from "../store/useAuthStore";

type Props = NativeStackScreenProps<RootStackParamList, "AddToClosetPreview">;

type TypePrediction = {
  type: string;
  confidence: number;
  raw_types?: string[];
};

const VISUAL_CATEGORIES = [
  { name: "Men", image: require("../../assets/images/categories/men/mens_wear_hero.png") },
  { name: "Women", image: require("../../assets/images/categories/women/womens_wear_hero.png") },
  { name: "Kids", image: require("../../assets/images/categories/kids_wear_hero.png") },
];

const OCCASIONS = ["formal", "casual", "wedding", "date", "party", "office", "travel"];
const SEASONS = ["Summer", "Winter", "Spring", "Autumn", "All Season"];
const MATERIALS = ["Cotton", "Denim", "Linen", "Polyester", "Wool", "Silk", "Leather", "Mixed"];
const FITS = ["Slim", "Regular", "Oversized", "Relaxed", "Loose"];
const WEATHER_TAGS = ["Hot", "Warm", "Cool", "Cold", "Rainy"];

const AddToClosetPreviewScreen: React.FC<Props> = ({ route, navigation }) => {
  const { uri } = route.params;
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [status, setStatus] = React.useState<"idle" | "saving" | "processed" | "error">("idle");

  const [name, setName] = React.useState("New Upload");
  const [category, setCategory] = React.useState<"Men" | "Women" | "Kids">("Men");
  const [color, setColor] = React.useState("#000000");
  const [aiColor, setAiColor] = React.useState<string | null>(null);

  const [occasion, setOccasion] = React.useState<string[]>(["casual"]);
  const [seasonTags, setSeasonTags] = React.useState<string[]>([]);
  const [material, setMaterial] = React.useState("Cotton");
  const [fit, setFit] = React.useState("Regular");
  const [weatherTag, setWeatherTag] = React.useState("Hot");

  const [extracting, setExtracting] = React.useState(true);
  const [extractError, setExtractError] = React.useState(false);

  const [typePredictions, setTypePredictions] = React.useState<TypePrediction[]>([]);
  const [selectedType, setSelectedType] = React.useState<string>("");

  const user = useAuthStore.getState().user?.id;

  const toggleOccasion = (value: string) => {
    setOccasion((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      }
      return [...prev, value];
    });
  };

  const toggleSeasonTag = (value: string) => {
    setSeasonTags((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      }
      return [...prev, value];
    });
  };

  React.useEffect(() => {
    const extractDetails = async () => {
      try {
        setExtracting(true);
        setExtractError(false);

        const formData = new FormData();
        const filename = uri.split("/").pop() || "photo.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const mimeType = match ? `image/${match[1]}` : "image/jpeg";

        formData.append("image", { uri, name: filename, type: mimeType } as any);

        const res = await api.post("/ai-new/extract-details", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 20000,
        });

        if (res.data?.color) {
          setColor(res.data.color);
          setAiColor(res.data.color);
        }

        if (Array.isArray(res.data?.top_k_predictions) && res.data.top_k_predictions.length > 0) {
          const predictions: TypePrediction[] = res.data.top_k_predictions.map((item: any) => ({
            type: item.type,
            confidence: Number(item.confidence || 0),
            raw_types: Array.isArray(item.raw_types) ? item.raw_types : [],
          }));

          setTypePredictions(predictions);
          setSelectedType(predictions[0].type);
        } else if (res.data?.type) {
          const fallbackPredictions: TypePrediction[] = [
            {
              type: res.data.type,
              confidence: Number(res.data.confidence || 0),
              raw_types: [],
            },
          ];
          setTypePredictions(fallbackPredictions);
          setSelectedType(res.data.type);
        }
      } catch (err) {
        console.warn("Failed to extract details", err);
        setExtractError(true);
      } finally {
        setExtracting(false);
      }
    };

    extractDetails();
  }, [uri]);

  const handleSave = async () => {
  try {
    setStatus("saving");

    const formData = new FormData();

    const filename = uri.split("/").pop() || "photo.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const mimeType = match ? `image/${match[1]}` : "image/jpeg";

    formData.append("image", {
      uri,
      name: filename,
      type: mimeType,
    } as any);

    formData.append("user", String(user));
    formData.append("name", name);
    formData.append("category", category);
    formData.append("type", selectedType);
    formData.append("color", color);

    formData.append("occasion", JSON.stringify(occasion));
    formData.append("season_tags", JSON.stringify(seasonTags));

    formData.append("material", material);
    formData.append("fit", fit);
    formData.append("weather_tag", weatherTag);

    const res = await api.post("/closet/save", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000,
    });

    setStatus("processed");
  } catch (e: any) {
    const errorMsg = e.response?.data?.message || e.message || "Unknown error";
    console.error("Save to closet failed:", errorMsg, e);
    setStatus("error");
  }
};

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.hIcon}>
          <Feather name="arrow-left" size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add to Closet</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.cardWrap}>
          <View style={styles.previewCard}>
            <Image source={{ uri }} style={styles.previewImage} />

            {extracting && (
              <View style={styles.aiBanner}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.aiBannerText}>AI is detecting color and type...</Text>
              </View>
            )}

            {!extracting && !extractError && (
              <View style={[styles.aiBanner, { backgroundColor: "#10b981" }]}>
                <Feather name="check-circle" size={14} color="#fff" />
                <Text style={styles.aiBannerText}>Auto-detected. You can change it below.</Text>
              </View>
            )}

            {!extracting && extractError && (
              <View style={[styles.aiBanner, { backgroundColor: "#f59e0b" }]}>
                <Feather name="alert-circle" size={14} color="#fff" />
                <Text style={styles.aiBannerText}>AI unavailable. Please select manually.</Text>
              </View>
            )}

            <View style={styles.detailsForm}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Name</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Blue Shirt"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.visualCategoryRow}>
                {VISUAL_CATEGORIES.map((cat) => {
                  const isActive = category === cat.name;
                  return (
                    <TouchableOpacity
                      key={cat.name}
                      style={styles.visualCatCard}
                      onPress={() => setCategory(cat.name as "Men" | "Women" | "Kids")}
                    >
                      <View
                        style={[
                          styles.visualCatImageBox,
                          { backgroundColor: isDark ? colors.inputBg : "#F3F4F6" },
                          isActive && styles.visualCatImageBoxActive,
                        ]}
                      >
                        <Image source={cat.image} style={styles.visualCatImage} resizeMode="contain" />
                      </View>
                      <Text
                        style={[
                          styles.visualCatText,
                          { color: colors.textSecondary },
                          isActive && styles.visualCatTextActive,
                        ]}
                        numberOfLines={1}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Types
                {!extracting && !extractError && typePredictions.length > 0 && (
                  <Text style={styles.aiTag}> · AI detected</Text>
                )}
              </Text>

              <View style={styles.typesWrap}>
                {extracting ? (
                  <View style={styles.typesLoadingRow}>
                    <ActivityIndicator size="small" color="#2563EB" />
                    <Text style={[styles.typesLoadingText, { color: colors.textMuted }]}>
                      Detecting types...
                    </Text>
                  </View>
                ) : typePredictions.length > 0 ? (
                  typePredictions.map((item, index) => {
                    const isTopAi = index === 0;
                    const isSelected = selectedType === item.type;

                    return (
                      <TouchableOpacity
                        key={`${item.type}-${index}`}
                        style={[
                          styles.typeCard,
                          {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                          },
                          isTopAi && styles.typeCardAiTop,
                          isSelected && styles.typeCardSelected,
                        ]}
                        onPress={() => setSelectedType(item.type)}
                      >
                        <View style={styles.typeCardTopRow}>
                          <Text
                            style={[
                              styles.typeTitle,
                              { color: colors.text },
                              isSelected && styles.typeTitleSelected,
                            ]}
                          >
                            {item.type}
                          </Text>

                          <View style={styles.typeCardBadges}>
                            {isTopAi && (
                              <View style={styles.aiBestBadge}>
                                <Text style={styles.aiBestBadgeText}>AI Best</Text>
                              </View>
                            )}
                            {isSelected && (
                              <View style={styles.selectedBadge}>
                                <Text style={styles.selectedBadgeText}>Selected</Text>
                              </View>
                            )}
                          </View>
                        </View>

                        <Text style={[styles.typeConfidence, { color: colors.textSecondary }]}>
                          Confidence: {(item.confidence * 100).toFixed(1)}%
                        </Text>

                        {!!item.raw_types?.length && (
                          <Text style={[styles.rawTypesText, { color: colors.textMuted }]}>
                            Raw: {item.raw_types.join(", ")}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <Text style={[styles.noTypesText, { color: colors.textMuted }]}>
                    No AI types found. You can continue later with manual save logic.
                  </Text>
                )}
              </View>

              {!!selectedType && (
                <View style={styles.selectedInfoBox}>
                  <Text style={[styles.selectedInfoText, { color: colors.text }]}>
                    Selected Type: <Text style={styles.selectedInfoValue}>{selectedType}</Text>
                  </Text>
                </View>
              )}

              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Color
                {!extracting && !extractError && aiColor && (
                  <Text style={styles.aiTag}> · AI detected</Text>
                )}
              </Text>

              {aiColor ? (
                <View style={styles.exactColorRow}>
                  <View style={[styles.exactColorCircle, { backgroundColor: aiColor, borderColor: "#2563EB" }]} />
                  <Text style={[styles.exactColorHex, { color: colors.text }]}>{aiColor.toUpperCase()}</Text>
                </View>
              ) : extracting ? (
                <View style={styles.exactColorRow}>
                  <ActivityIndicator size="small" color="#2563EB" />
                  <Text style={[styles.exactColorHex, { color: colors.textMuted }]}>Detecting...</Text>
                </View>
              ) : (
                <View style={styles.exactColorRow}>
                  <View style={[styles.exactColorCircle, { backgroundColor: color, borderColor: "#2563EB" }]} />
                  <Text style={[styles.exactColorHex, { color: colors.text }]}>{color.toUpperCase()}</Text>
                </View>
              )}

              <Text style={[styles.label, { color: colors.textSecondary }]}>Occasion</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                {OCCASIONS.map((occ) => {
                  const isActive = occasion.includes(occ);

                  return (
                    <TouchableOpacity
                      key={occ}
                      style={[
                        styles.occasionCard,
                        { borderColor: colors.border },
                        isActive && styles.occasionCardActive,
                      ]}
                      onPress={() => toggleOccasion(occ)}
                    >
                      <Text
                        style={[
                          styles.occasionText,
                          { color: colors.textSecondary },
                          isActive && styles.occasionTextActive,
                        ]}
                      >
                        {occ.charAt(0).toUpperCase() + occ.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {!!occasion.length && (
                <View style={styles.selectedInfoBox}>
                  <Text style={[styles.selectedInfoText, { color: colors.text }]}>
                    Selected Occasions: <Text style={styles.selectedInfoValue}>{occasion.join(", ")}</Text>
                  </Text>
                </View>
              )}

              <Text style={[styles.label, { color: colors.textSecondary }]}>Season Tags</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                {SEASONS.map((season) => {
                  const isActive = seasonTags.includes(season);

                  return (
                    <TouchableOpacity
                      key={season}
                      style={[
                        styles.occasionCard,
                        { borderColor: colors.border },
                        isActive && styles.occasionCardActive,
                      ]}
                      onPress={() => toggleSeasonTag(season)}
                    >
                      <Text
                        style={[
                          styles.occasionText,
                          { color: colors.textSecondary },
                          isActive && styles.occasionTextActive,
                        ]}
                      >
                        {season}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {!!seasonTags.length && (
                <View style={styles.selectedInfoBox}>
                  <Text style={[styles.selectedInfoText, { color: colors.text }]}>
                    Selected Seasons: <Text style={styles.selectedInfoValue}>{seasonTags.join(", ")}</Text>
                  </Text>
                </View>
              )}

              <Text style={[styles.label, { color: colors.textSecondary }]}>Material</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                {MATERIALS.map((item) => {
                  const isActive = material === item;

                  return (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.occasionCard,
                        { borderColor: colors.border },
                        isActive && styles.occasionCardActive,
                      ]}
                      onPress={() => setMaterial(item)}
                    >
                      <Text
                        style={[
                          styles.occasionText,
                          { color: colors.textSecondary },
                          isActive && styles.occasionTextActive,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={styles.selectedInfoBox}>
                <Text style={[styles.selectedInfoText, { color: colors.text }]}>
                  Material: <Text style={styles.selectedInfoValue}>{material}</Text>
                </Text>
              </View>

              <Text style={[styles.label, { color: colors.textSecondary }]}>Fit</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                {FITS.map((item) => {
                  const isActive = fit === item;

                  return (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.occasionCard,
                        { borderColor: colors.border },
                        isActive && styles.occasionCardActive,
                      ]}
                      onPress={() => setFit(item)}
                    >
                      <Text
                        style={[
                          styles.occasionText,
                          { color: colors.textSecondary },
                          isActive && styles.occasionTextActive,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={styles.selectedInfoBox}>
                <Text style={[styles.selectedInfoText, { color: colors.text }]}>
                  Fit: <Text style={styles.selectedInfoValue}>{fit}</Text>
                </Text>
              </View>

              <Text style={[styles.label, { color: colors.textSecondary }]}>Weather Tag</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                {WEATHER_TAGS.map((item) => {
                  const isActive = weatherTag === item;

                  return (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.occasionCard,
                        { borderColor: colors.border },
                        isActive && styles.occasionCardActive,
                      ]}
                      onPress={() => setWeatherTag(item)}
                    >
                      <Text
                        style={[
                          styles.occasionText,
                          { color: colors.textSecondary },
                          isActive && styles.occasionTextActive,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={styles.selectedInfoBox}>
                <Text style={[styles.selectedInfoText, { color: colors.text }]}>
                  Weather Tag: <Text style={styles.selectedInfoValue}>{weatherTag}</Text>
                </Text>
              </View>
            </View>

            <View style={styles.btnRow}>
              {status === "idle" && (
                <>
                  <TouchableOpacity
                    style={[
                      styles.blackBtn,
                      { backgroundColor: colors.text },
                      extracting && styles.blackBtnDisabled,
                    ]}
                    onPress={handleSave}
                    disabled={extracting}
                  >
                    {extracting ? (
                      <ActivityIndicator size="small" color={colors.background} />
                    ) : (
                      <Text style={[styles.blackBtnText, { color: colors.background }]}>Add to Closet</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.blackBtn, { backgroundColor: isDark ? colors.border : "#444" }]}
                    onPress={() => navigation.replace("AddToCloset")}
                  >
                    <Text style={[styles.blackBtnText, { color: colors.text }]}>Retake</Text>
                  </TouchableOpacity>
                </>
              )}

              {status === "saving" && (
                <TouchableOpacity style={[styles.blackBtn, { backgroundColor: colors.text, opacity: 0.7 }]} disabled>
                  <Text style={[styles.blackBtnText, { color: colors.background }]}>Saving...</Text>
                </TouchableOpacity>
              )}

              {status === "processed" && (
                <>
                  <View style={[styles.blackBtn, { backgroundColor: "#10b981" }]}>
                    <Text style={styles.blackBtnText}>Saved!</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.blackBtn, { backgroundColor: colors.text }]}
                    onPress={() => navigation.navigate("MyCloset")}
                  >
                    <Text style={[styles.blackBtnText, { color: colors.background }]}>Go to Closet</Text>
                  </TouchableOpacity>
                </>
              )}

              {status === "error" && (
                <>
                  <TouchableOpacity style={[styles.blackBtn, { backgroundColor: "#ef4444" }]} onPress={handleSave}>
                    <Text style={styles.blackBtnText}>Retry</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.blackBtn, { backgroundColor: isDark ? colors.border : "#444" }]}
                    onPress={() => navigation.replace("AddToCloset")}
                  >
                    <Text style={[styles.blackBtnText, { color: colors.text }]}>Retake</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        {[
          { label: "Home", icon: "home", onPress: () => navigation.navigate("Main", { screen: "Home" } as any) },
          { label: "AI Stylist", icon: "grid", onPress: () => navigation.navigate("Main", { screen: "AIStylist" } as any) },
          { label: "My Cart", icon: "shopping-cart", onPress: () => navigation.navigate("Main", { screen: "MyCart" } as any) },
          { label: "Wishlist", icon: "heart", onPress: () => navigation.navigate("Main", { screen: "Wishlist" } as any) },
          { label: "Profile", icon: "user", onPress: () => navigation.navigate("Main", { screen: "Profile" } as any) },
        ].map((t, i) => (
          <TouchableOpacity key={t.label} style={styles.tabBtn} onPress={t.onPress}>
            <Feather name={t.icon as any} size={22} color={i === 0 ? "#000" : "#777"} />
            <Text style={[styles.tabLabel, { color: i === 0 ? "#000" : "#777" }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
    scroll: { paddingBottom: 100 },

    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingTop: 6,
      paddingBottom: 10,
      justifyContent: "space-between",
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    hIcon: { padding: 4 },
    headerTitle: { fontSize: 22, fontWeight: "700", color: colors.text },

    cardWrap: { paddingHorizontal: 14, marginTop: 12 },
    previewCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 14,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    previewImage: {
      width: "100%",
      height: 240,
      borderRadius: 14,
      backgroundColor: dark ? colors.border : "#eee",
    },

    aiBanner: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#2563EB",
      borderRadius: 10,
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginTop: 10,
      gap: 6,
    },
    aiBannerText: {
      color: "#fff",
      fontSize: 13,
      fontWeight: "600",
      marginLeft: 6,
    },

    detailsForm: { marginTop: 16 },

    label: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
    aiTag: { fontSize: 11, fontWeight: "500", color: "#2563EB" },

    input: {
      height: 42,
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 12,
      fontSize: 14,
      marginBottom: 14,
    },

    visualCategoryRow: {
      paddingBottom: 6,
      marginBottom: 12,
    },
    visualCatCard: {
      alignItems: "center",
      marginRight: 15,
      width: 72,
    },
    visualCatImageBox: {
      width: 60,
      height: 60,
      borderRadius: 14,
      overflow: "hidden",
      marginBottom: 6,
      borderWidth: 2,
      borderColor: "transparent",
    },
    visualCatImageBoxActive: {
      borderColor: "#3B82F6",
      backgroundColor: "#F0F7FF",
    },
    visualCatImage: { width: "100%", height: "100%" },
    visualCatText: {
      fontSize: 11,
      textAlign: "center",
      fontWeight: "500",
    },
    visualCatTextActive: {
      color: "#3B82F6",
      fontWeight: "700",
    },

    typesWrap: {
      marginBottom: 14,
    },
    typesLoadingRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
    },
    typesLoadingText: {
      marginLeft: 8,
      fontSize: 14,
    },
    typeCard: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
      marginBottom: 10,
    },
    typeCardAiTop: {
      borderColor: "#2563EB",
      borderWidth: 1.5,
    },
    typeCardSelected: {
      borderColor: "#10b981",
      borderWidth: 2,
      backgroundColor: dark ? colors.card : "#F0FDF4",
    },
    typeCardTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 6,
    },
    typeCardBadges: {
      flexDirection: "row",
      alignItems: "center",
    },
    typeTitle: {
      fontSize: 15,
      fontWeight: "700",
    },
    typeTitleSelected: {
      color: "#10b981",
    },
    typeConfidence: {
      fontSize: 13,
      fontWeight: "500",
      marginBottom: 4,
    },
    rawTypesText: {
      fontSize: 12,
      lineHeight: 18,
    },
    aiBestBadge: {
      backgroundColor: "#DBEAFE",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      marginLeft: 6,
    },
    aiBestBadgeText: {
      color: "#1D4ED8",
      fontSize: 11,
      fontWeight: "700",
    },
    selectedBadge: {
      backgroundColor: "#DCFCE7",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      marginLeft: 6,
    },
    selectedBadgeText: {
      color: "#15803D",
      fontSize: 11,
      fontWeight: "700",
    },
    noTypesText: {
      fontSize: 13,
      marginBottom: 8,
    },

    selectedInfoBox: {
      marginBottom: 14,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: dark ? colors.inputBg : "#F8FAFC",
      borderWidth: 1,
      borderColor: colors.border,
    },
    selectedInfoText: {
      fontSize: 14,
      fontWeight: "600",
    },
    selectedInfoValue: {
      color: "#2563EB",
      fontWeight: "700",
    },

    occasionCard: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
      marginRight: 10,
    },
    occasionCardActive: {
      borderColor: "#3B82F6",
      backgroundColor: "#F0F7FF",
    },
    occasionText: {
      fontSize: 14,
      fontWeight: "500",
    },
    occasionTextActive: {
      color: "#3B82F6",
      fontWeight: "700",
    },

    exactColorRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 14,
    },
    exactColorCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 2,
      marginRight: 12,
    },
    exactColorHex: {
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: 1,
    },

    btnRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 18 },
    blackBtn: {
      flex: 1,
      borderRadius: 12,
      paddingVertical: 13,
      alignItems: "center",
      marginHorizontal: 5,
    },
    blackBtnDisabled: { opacity: 0.7 },
    blackBtnText: { fontWeight: "700", fontSize: 14, color: "#fff" },

    bottomBar: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 84,
      borderTopWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      paddingBottom: 8,
    },
    tabBtn: { alignItems: "center" },
    tabLabel: { fontSize: 12, marginTop: 2, fontWeight: "500" },
  });

export default AddToClosetPreviewScreen;