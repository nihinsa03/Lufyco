const ClosetItem = require("../models/ClosetItem");
const Product = require("../models/Product");
const buildImageUrl = require("../utils/buildImageUrl");

/**
 * Normalize text safely
 */
const safeLower = (value) => (value || "").toString().trim().toLowerCase();

const normalizeOccasionList = (occasionValue) => {
  if (!occasionValue) return [];

  if (Array.isArray(occasionValue)) {
    return occasionValue.map((x) => safeLower(x)).filter(Boolean);
  }

  return [safeLower(occasionValue)].filter(Boolean);
};

const normalizeGender = (value) => safeLower(value);

const SOURCE = {
  CLOSET: "closet",
  PRODUCT: "product",
};

const NEUTRAL_COLORS = [
  "black",
  "white",
  "grey",
  "gray",
  "beige",
  "navy",
  "brown",
];

/**
 * Normalize closet item for API response
 */
const normalizeClosetItem = (item, slot = null) => ({
  _id: item._id || null,
  closetID: item.closetID ?? null,
  user: item.user ?? null,
  name: item.name ?? null,
  price: Number(item.price || 0),
  description: item.notes || null,
  image: buildImageUrl(item.image),
  category: item.category || null,
  subCategory: item.subCategory || null,
  type: item.type || null,
  gender: item.category || null,
  colors:
    Array.isArray(item.colors) && item.colors.length > 0
      ? item.colors
      : item.color
      ? [item.color]
      : [],
  sizes: Array.isArray(item.sizes) ? item.sizes : [],
  occasion: item.occasion || null,
  quantity: Number(item.quantity || 0),
  rating: Number(item.rating || 0),
  reviewsCount: Number(item.reviewsCount || 0),
  isNewArrival: Boolean(item.isNewArrival),
  style_tags: Array.isArray(item.style_tags) ? item.style_tags : [],
  season_tags: Array.isArray(item.season_tags) ? item.season_tags : [],
  material: item.material || null,
  fit: item.fit || null,
  weather_tag: item.weather_tag || null,
  pattern: item.pattern || null,
  source: SOURCE.CLOSET,
  slot,
});

/**
 * Normalize product item for API response
 */
const normalizeProductItem = (item, slot = null) => ({
  _id: item._id || null,
  productId: item.productId ?? null,
  seller: item.seller ?? null,
  name: item.name ?? null,
  price: Number(item.price || 0),
  description: item.description || null,
  image: buildImageUrl(item.image),
  category: item.category || null,
  subCategory: item.subCategory || null,
  type: item.type || null,
  gender: item.gender || item.category || null,
  colors: Array.isArray(item.colors) ? item.colors : [],
  sizes: Array.isArray(item.sizes) ? item.sizes : [],
  occasion: item.occasion || null,
  quantity: Number(item.quantity || 0),
  rating: Number(item.rating || 0),
  reviewsCount: Number(item.reviewsCount || 0),
  isNewArrival: Boolean(item.isNewArrival),
  style_tags: Array.isArray(item.style_tags) ? item.style_tags : [],
  season_tags: Array.isArray(item.season_tags) ? item.season_tags : [],
  material: item.material || null,
  fit: item.fit || null,
  pattern: item.pattern || null,
  source: SOURCE.PRODUCT,
  slot,
});

/**
 * Build empty outfit
 */
const buildEmptyOutfit = ({
  mood,
  occasion,
  weather,
  message,
  usedClosetItems = 0,
  usedProductItems = 0,
}) => ({
  items: [],
  accessories: [],
  totalPrice: 0,
  mood: mood || null,
  occasion: occasion || null,
  weather: weather || null,
  mlPowered: false,
  usedClosetItems,
  usedProductItems,
  message,
});

/**
 * Parse weather info from request
 * supports object or string
 */
const parseWeatherBucket = (weather) => {
  if (typeof weather === "string") {
    const condition = safeLower(weather);

    let bucket = "all";
    if (condition.includes("rain") || condition.includes("shower")) bucket = "rain";
    else if (
      condition.includes("sun") ||
      condition.includes("clear") ||
      condition.includes("hot")
    ) {
      bucket = "hot";
    } else if (
      condition.includes("cold") ||
      condition.includes("fog") ||
      condition.includes("snow")
    ) {
      bucket = "cold";
    }

    return {
      condition,
      temperature: null,
      bucket,
    };
  }

  const temp = Number(weather?.temperature);
  const condition = safeLower(weather?.condition);

  let bucket = "all";

  if (condition.includes("rain") || condition.includes("shower")) {
    bucket = "rain";
  } else if (!Number.isNaN(temp)) {
    if (temp >= 28) bucket = "hot";
    else if (temp >= 23) bucket = "warm";
    else if (temp >= 18) bucket = "cool";
    else bucket = "cold";
  }

  return {
    condition,
    temperature: Number.isNaN(temp) ? null : temp,
    bucket,
  };
};

/**
 * Occasion match helper for both closet and product
 */
const hasOccasionMatch = (item, requestedOccasion) => {
  const req = safeLower(requestedOccasion);
  if (!req) return true;

  const itemOccasions = normalizeOccasionList(item.occasion);
  return itemOccasions.includes(req);
};

/**
 * STRICT occasion score
 */
const getOccasionScore = (item, requestedOccasion) => {
  const reqOccasion = safeLower(requestedOccasion);
  if (!reqOccasion) return 5;

  const itemOccasions = normalizeOccasionList(item.occasion);
  if (itemOccasions.includes(reqOccasion)) return 30;

  return -1000;
};

/**
 * Weather score
 */
const getWeatherScore = (item, weatherInfo) => {
  const weatherTag = safeLower(item.weather_tag);

  if (!weatherInfo?.bucket || weatherInfo.bucket === "all") return 5;
  if (!weatherTag || weatherTag === "all") return 8;

  if (weatherInfo.bucket === "hot" && weatherTag === "hot") return 20;
  if (weatherInfo.bucket === "cold" && weatherTag === "cold") return 20;
  if (weatherInfo.bucket === "rain" && weatherTag === "rain") return 20;
  if (weatherInfo.bucket === "warm" && (weatherTag === "all" || weatherTag === "hot")) return 12;
  if (weatherInfo.bucket === "cool" && (weatherTag === "all" || weatherTag === "cold")) return 12;

  return 0;
};

/**
 * Style score
 */
const getStyleScore = (item, occasion) => {
  const tags = Array.isArray(item.style_tags)
    ? item.style_tags.map((t) => safeLower(t))
    : [];
  const reqOccasion = safeLower(occasion);

  if (!reqOccasion) return 5;

  if (reqOccasion === "casual" && tags.includes("casual")) return 10;
  if (
    reqOccasion === "office" &&
    (tags.includes("minimal") || tags.includes("formal"))
  ) {
    return 10;
  }
  if (
    reqOccasion === "party" &&
    (tags.includes("trendy") || tags.includes("bold") || tags.includes("elegant"))
  ) {
    return 10;
  }
  if (
    reqOccasion === "date" &&
    (tags.includes("minimal") || tags.includes("elegant"))
  ) {
    return 10;
  }
  if (
    reqOccasion === "wedding" &&
    (tags.includes("formal") || tags.includes("elegant"))
  ) {
    return 12;
  }

  return 0;
};

/**
 * NOW mode: season / material / fit score with weather
 */
const getSeasonMaterialFitScore = (item, weatherInfo, occasion) => {
  let score = 0;

  const seasonTags = Array.isArray(item.season_tags)
    ? item.season_tags.map((s) => safeLower(s))
    : [];
  const material = safeLower(item.material);
  const fit = safeLower(item.fit);
  const type = safeLower(item.type);
  const reqOccasion = safeLower(occasion);

  if (weatherInfo?.bucket === "hot") {
    if (seasonTags.includes("summer")) score += 10;
    if (material.includes("cotton") || material.includes("linen")) score += 5;
    if (["hoodie", "coat", "sweater", "jacket"].includes(type)) score -= 30;
  }

  if (weatherInfo?.bucket === "cold") {
    if (seasonTags.includes("winter")) score += 10;
    if (
      ["hoodie", "coat", "sweater", "jacket", "blazer", "cardigan"].includes(type)
    ) {
      score += 8;
    }
  }

  if (weatherInfo?.bucket === "rain") {
    if (safeLower(item.weather_tag) === "rain") score += 10;
  }

  if (reqOccasion === "office") {
    if (fit === "regular" || fit === "slim") score += 5;
    if (type === "shorts") score -= 40;
  }

  return score;
};

/**
 * FUTURE mode fit/material score
 * weather ignore
 */
const getFutureFitMaterialScore = (item, occasion) => {
  let score = 0;

  const material = safeLower(item.material);
  const fit = safeLower(item.fit);
  const type = safeLower(item.type);
  const reqOccasion = safeLower(occasion);

  if (reqOccasion === "office") {
    if (fit === "regular" || fit === "slim") score += 5;
    if (material.includes("cotton")) score += 2;
    if (type === "shorts") score -= 40;
  }

  if (reqOccasion === "wedding") {
    if (fit === "slim" || fit === "regular") score += 5;
    if (
      material.includes("cotton") ||
      material.includes("linen") ||
      material.includes("silk")
    ) {
      score += 3;
    }
  }

  if (reqOccasion === "party") {
    if (fit === "slim") score += 4;
  }

  return score;
};

/**
 * Get item colors
 */
const getItemColors = (item) => {
  const list = [];

  if (Array.isArray(item.colors)) {
    for (const c of item.colors) {
      if (c) list.push(safeLower(c));
    }
  }

  if (item.color) {
    list.push(safeLower(item.color));
  }

  return [...new Set(list)];
};

/**
 * Color harmony score
 */
const getColorHarmonyScore = (itemA, itemB = null) => {
  const colorsA = getItemColors(itemA);

  if (!itemB) {
    if (colorsA.some((c) => NEUTRAL_COLORS.includes(c))) return 10;
    return 5;
  }

  const colorsB = getItemColors(itemB);

  const aHasNeutral = colorsA.some((c) => NEUTRAL_COLORS.includes(c));
  const bHasNeutral = colorsB.some((c) => NEUTRAL_COLORS.includes(c));

  if (aHasNeutral || bHasNeutral) return 15;

  const sameColor = colorsA.some((c) => colorsB.includes(c));
  if (sameColor) return 12;

  const multiA = colorsA.includes("multi");
  const multiB = colorsB.includes("multi");

  if (multiA && !bHasNeutral) return -10;
  if (multiB && !aHasNeutral) return -10;

  return 5;
};

/**
 * Pattern penalty
 */
const getPatternPenalty = (itemA, itemB = null) => {
  const patternA = safeLower(itemA.pattern);
  const colorsA = getItemColors(itemA);

  if (!itemB) {
    if (patternA && patternA !== "solid" && colorsA.includes("multi")) return -5;
    return 0;
  }

  const patternB = safeLower(itemB.pattern);
  const colorsB = getItemColors(itemB);

  const loudA = (patternA && patternA !== "solid") || colorsA.includes("multi");
  const loudB = (patternB && patternB !== "solid") || colorsB.includes("multi");

  if (loudA && loudB) return -15;
  return 0;
};

/**
 * Classify item group
 */
const classifyItem = (item) => {
  const sub = safeLower(item.subCategory);
  const type = safeLower(item.type);

  if (
    sub === "tops" ||
    ["t-shirt", "shirt", "blouse", "top", "polo", "crop top", "tunic"].includes(type)
  ) {
    return "top";
  }

  if (
    sub === "bottoms" ||
    ["jeans", "pants", "trouser", "trousers", "shorts", "skirt", "leggings"].includes(type)
  ) {
    return "bottom";
  }

  if (
    sub === "dresses" ||
    ["dress", "gown", "jumpsuit", "romper"].includes(type)
  ) {
    return "dress";
  }

  if (
    sub === "outerwear" ||
    ["jacket", "hoodie", "sweater", "coat", "blazer", "cardigan"].includes(type)
  ) {
    return "outerwear";
  }

  if (
    sub === "shoes" ||
    ["shoe", "shoes", "sneaker", "sneakers", "heels", "loafer", "loafers", "boots", "sandals", "sandal"].includes(type)
  ) {
    return "shoes";
  }

  return "other";
};

/**
 * STRICT occasion hard rule
 */
const passesOccasionHardRule = (item, occasion) => {
  const reqOccasion = safeLower(occasion);

  if (!reqOccasion) return true;
  if (!hasOccasionMatch(item, occasion)) return false;

  const type = safeLower(item.type);
  const pattern = safeLower(item.pattern);
  const styleTags = Array.isArray(item.style_tags)
    ? item.style_tags.map((t) => safeLower(t))
    : [];

  if (reqOccasion === "office") {
    if (type === "shorts") return false;
    if (type === "hoodie") return false;
    if (type === "t-shirt" && pattern && pattern !== "solid") return false;
  }

  if (reqOccasion === "wedding") {
    if (type === "t-shirt" || type === "shorts") return false;
  }

  if (reqOccasion === "party") {
    if (styleTags.includes("casual") && type === "t-shirt" && pattern === "solid") {
      return false;
    }
  }

  return true;
};

/**
 * NOW mode single item score
 */
const scoreSingleItemNow = (item, occasion, weatherInfo) => {
  let score = 0;

  score += getOccasionScore(item, occasion);
  score += getWeatherScore(item, weatherInfo);
  score += getStyleScore(item, occasion);
  score += getSeasonMaterialFitScore(item, weatherInfo, occasion);
  score += getColorHarmonyScore(item);
  score += getPatternPenalty(item);

  return score;
};

/**
 * FUTURE mode single item score
 */
const scoreSingleItemFuture = (item, occasion) => {
  let score = 0;

  score += getOccasionScore(item, occasion);
  score += getStyleScore(item, occasion);
  score += getFutureFitMaterialScore(item, occasion);
  score += getColorHarmonyScore(item);
  score += getPatternPenalty(item);

  const quantity = Number(item.quantity || 0);
  if (quantity > 0) score += 3;

  const rating = Number(item.rating || 0);
  if (rating >= 4) score += 2;

  const type = safeLower(item.type);
  const reqOccasion = safeLower(occasion);

  if (reqOccasion === "wedding") {
    if (
      ["shirt", "blouse", "dress", "gown", "blazer", "trouser", "trousers", "heels", "loafer", "loafers"].includes(type)
    ) {
      score += 8;
    }
  }

  if (reqOccasion === "office") {
    if (
      ["shirt", "blouse", "trouser", "trousers", "skirt", "blazer", "loafer", "loafers"].includes(type)
    ) {
      score += 8;
    }
  }

  return score;
};

/**
 * Score top + bottom combo for NOW
 */
const scoreTopBottomComboNow = (top, bottom, occasion, weatherInfo) => {
  let score = 0;

  score += scoreSingleItemNow(top, occasion, weatherInfo);
  score += scoreSingleItemNow(bottom, occasion, weatherInfo);

  score += getColorHarmonyScore(top, bottom);
  score += getPatternPenalty(top, bottom);

  const topStyle = Array.isArray(top.style_tags)
    ? top.style_tags.map((x) => safeLower(x))
    : [];
  const bottomStyle = Array.isArray(bottom.style_tags)
    ? bottom.style_tags.map((x) => safeLower(x))
    : [];

  const sharedStyle = topStyle.some((tag) => bottomStyle.includes(tag));
  if (sharedStyle) score += 10;

  const reqOccasion = safeLower(occasion);
  const bottomType = safeLower(bottom.type);

  if (
    reqOccasion === "office" &&
    ["pants", "trouser", "trousers", "skirt"].includes(bottomType)
  ) {
    score += 12;
  }

  if (
    reqOccasion === "casual" &&
    ["jeans", "pants", "shorts"].includes(bottomType)
  ) {
    score += 8;
  }

  return score;
};

/**
 * Score dress combo for NOW
 */
const scoreDressComboNow = (dress, occasion, weatherInfo) => {
  let score = 0;
  score += scoreSingleItemNow(dress, occasion, weatherInfo);

  const reqOccasion = safeLower(occasion);
  const dressType = safeLower(dress.type);

  if (
    ["party", "date", "wedding"].includes(reqOccasion) &&
    ["dress", "gown"].includes(dressType)
  ) {
    score += 20;
  }

  if (reqOccasion === "office" && dressType === "dress") {
    score += 5;
  }

  return score;
};

/**
 * Score top + bottom combo for FUTURE
 */
const scoreTopBottomComboFuture = (top, bottom, occasion) => {
  let score = 0;

  score += scoreSingleItemFuture(top, occasion);
  score += scoreSingleItemFuture(bottom, occasion);

  score += getColorHarmonyScore(top, bottom);
  score += getPatternPenalty(top, bottom);

  const topStyle = Array.isArray(top.style_tags)
    ? top.style_tags.map((x) => safeLower(x))
    : [];
  const bottomStyle = Array.isArray(bottom.style_tags)
    ? bottom.style_tags.map((x) => safeLower(x))
    : [];

  const sharedStyle = topStyle.some((tag) => bottomStyle.includes(tag));
  if (sharedStyle) score += 10;

  const reqOccasion = safeLower(occasion);
  const bottomType = safeLower(bottom.type);

  if (
    reqOccasion === "office" &&
    ["pants", "trouser", "trousers", "skirt"].includes(bottomType)
  ) {
    score += 12;
  }

  if (
    reqOccasion === "casual" &&
    ["jeans", "pants", "shorts"].includes(bottomType)
  ) {
    score += 8;
  }

  if (
    reqOccasion === "wedding" &&
    ["trouser", "trousers", "skirt"].includes(bottomType)
  ) {
    score += 12;
  }

  return score;
};

/**
 * Score dress combo for FUTURE
 */
const scoreDressComboFuture = (dress, occasion) => {
  let score = 0;
  score += scoreSingleItemFuture(dress, occasion);

  const reqOccasion = safeLower(occasion);
  const dressType = safeLower(dress.type);

  if (
    ["party", "date", "wedding"].includes(reqOccasion) &&
    ["dress", "gown"].includes(dressType)
  ) {
    score += 20;
  }

  if (reqOccasion === "office" && dressType === "dress") {
    score += 5;
  }

  return score;
};

/**
 * Group items by slot
 */
const groupItemsBySlot = (items) => {
  const grouped = {
    tops: [],
    bottoms: [],
    dresses: [],
    outerwear: [],
    shoes: [],
    others: [],
  };

  for (const item of items) {
    const group = classifyItem(item);

    if (group === "top") grouped.tops.push(item);
    else if (group === "bottom") grouped.bottoms.push(item);
    else if (group === "dress") grouped.dresses.push(item);
    else if (group === "outerwear") grouped.outerwear.push(item);
    else if (group === "shoes") grouped.shoes.push(item);
    else grouped.others.push(item);
  }

  return grouped;
};

/**
 * Outfit template by occasion
 */
const getOutfitTemplateByOccasion = (occasion) => {
  const req = safeLower(occasion);

  if (req === "wedding") {
    return {
      preferDress: true,
      needTopBottomOrDress: true,
      requireShoes: true,
      optionalOuterwear: true,
    };
  }

  if (req === "office") {
    return {
      preferDress: false,
      needTopBottomOrDress: true,
      requireShoes: false,
      optionalOuterwear: true,
    };
  }

  if (req === "party") {
    return {
      preferDress: true,
      needTopBottomOrDress: true,
      requireShoes: false,
      optionalOuterwear: true,
    };
  }

  return {
    preferDress: false,
    needTopBottomOrDress: true,
    requireShoes: false,
    optionalOuterwear: false,
  };
};

/**
 * Find best item from list
 */
const pickBestSingleItem = (items, occasion) => {
  if (!Array.isArray(items) || items.length === 0) return null;

  const ranked = items
    .map((item) => ({
      item,
      score: scoreSingleItemFuture(item, occasion),
    }))
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.item || null;
};

/**
 * Find best shoes based on selected items
 */
const pickBestShoes = (shoeItems, selectedBaseItems, occasion) => {
  if (!Array.isArray(shoeItems) || shoeItems.length === 0) return null;

  const ranked = shoeItems
    .map((item) => {
      let score = scoreSingleItemFuture(item, occasion);

      for (const base of selectedBaseItems) {
        score += getColorHarmonyScore(item, base);
        score += getPatternPenalty(item, base);
      }

      return { item, score };
    })
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.item || null;
};

/**
 * Find best outerwear for NOW
 */
const pickBestOuterwearNow = (outerwearItems, occasion, weatherInfo) => {
  if (!Array.isArray(outerwearItems) || outerwearItems.length === 0) return null;

  const reqOccasion = safeLower(occasion);
  const bucket = weatherInfo?.bucket;

  let candidates = outerwearItems.filter((item) => {
    const type = safeLower(item.type);

    if (bucket === "hot" && ["hoodie", "coat", "sweater", "jacket"].includes(type)) {
      return false;
    }

    if (reqOccasion === "office" && ["blazer", "cardigan"].includes(type)) {
      return true;
    }

    return true;
  });

  if (candidates.length === 0) return null;

  candidates = candidates
    .map((item) => ({
      item,
      score: scoreSingleItemNow(item, occasion, weatherInfo),
    }))
    .sort((a, b) => b.score - a.score);

  const best = candidates[0];
  if (!best) return null;

  if (
    bucket === "cold" ||
    bucket === "rain" ||
    (reqOccasion === "office" &&
      ["blazer", "cardigan"].includes(safeLower(best.item.type)))
  ) {
    return best.item;
  }

  return null;
};

/**
 * Find best outerwear for FUTURE
 */
const pickBestOuterwearFuture = (outerwearItems, selectedBaseItems, occasion) => {
  if (!Array.isArray(outerwearItems) || outerwearItems.length === 0) return null;

  const ranked = outerwearItems
    .map((item) => {
      let score = scoreSingleItemFuture(item, occasion);

      for (const base of selectedBaseItems) {
        score += getColorHarmonyScore(item, base);
        score += getPatternPenalty(item, base);
      }

      return { item, score };
    })
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.item || null;
};

/**
 * Build best base combo for NOW
 */
const buildBestBaseComboNow = (grouped, occasion, weatherInfo) => {
  let bestCombo = null;

  if (grouped.tops.length > 0 && grouped.bottoms.length > 0) {
    for (const top of grouped.tops) {
      for (const bottom of grouped.bottoms) {
        const score = scoreTopBottomComboNow(top, bottom, occasion, weatherInfo);

        if (!bestCombo || score > bestCombo.score) {
          bestCombo = {
            type: "top-bottom",
            score,
            items: [top, bottom],
          };
        }
      }
    }
  }

  if (grouped.dresses.length > 0) {
    for (const dress of grouped.dresses) {
      const score = scoreDressComboNow(dress, occasion, weatherInfo);

      if (!bestCombo || score > bestCombo.score) {
        bestCombo = {
          type: "dress",
          score,
          items: [dress],
        };
      }
    }
  }

  return bestCombo;
};

/**
 * Build best base combo for FUTURE
 */
const buildBestBaseComboFuture = (grouped, occasion) => {
  let bestCombo = null;

  if (grouped.tops.length > 0 && grouped.bottoms.length > 0) {
    for (const top of grouped.tops) {
      for (const bottom of grouped.bottoms) {
        const score = scoreTopBottomComboFuture(top, bottom, occasion);

        if (!bestCombo || score > bestCombo.score) {
          bestCombo = {
            type: "top-bottom",
            score,
            items: [top, bottom],
          };
        }
      }
    }
  }

  if (grouped.dresses.length > 0) {
    for (const dress of grouped.dresses) {
      const score = scoreDressComboFuture(dress, occasion);

      if (!bestCombo || score > bestCombo.score) {
        bestCombo = {
          type: "dress",
          score,
          items: [dress],
        };
      }
    }
  }

  return bestCombo;
};

/**
 * Product compatibility score against selected outfit items
 */
const scoreProductAgainstBase = (product, selectedBaseItems, occasion) => {
  let score = scoreSingleItemFuture(product, occasion);

  for (const base of selectedBaseItems) {
    score += getColorHarmonyScore(product, base);
    score += getPatternPenalty(product, base);

    const baseTags = Array.isArray(base.style_tags)
      ? base.style_tags.map((x) => safeLower(x))
      : [];
    const prodTags = Array.isArray(product.style_tags)
      ? product.style_tags.map((x) => safeLower(x))
      : [];

    if (baseTags.some((tag) => prodTags.includes(tag))) {
      score += 8;
    }
  }

  return score;
};

/**
 * Pick best product for a slot
 */
const pickBestProductForSlot = (products, slot, selectedBaseItems, occasion) => {
  if (!Array.isArray(products) || products.length === 0) return null;

  const slotItems = products.filter((item) => classifyItem(item) === slot);
  if (slotItems.length === 0) return null;

  const ranked = slotItems
    .map((item) => ({
      item,
      score: scoreProductAgainstBase(item, selectedBaseItems, occasion),
    }))
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.item || null;
};

/**
 * Remove duplicates by _id + source
 */
const uniqueSelectedItems = (items) => {
  const seen = new Set();
  const out = [];

  for (const item of items) {
    const sourceKey = item.source || "unknown";
    const key = `${sourceKey}:${String(item._id)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }

  return out;
};

/**
 * Generate NOW outfit from closet only - weather aware
 */
const generate_closet = async ({ userId, mood, occasion, weather }) => {
  const weatherInfo = parseWeatherBucket(weather);

  const closetItems = await ClosetItem.find({
    user: userId,
    isActive: true,
  }).lean();

  if (!closetItems || closetItems.length === 0) {
    return buildEmptyOutfit({
      mood,
      occasion,
      weather,
      message: "No clothes found in your closet.",
    });
  }

  const validItems = closetItems.filter((item) =>
    passesOccasionHardRule(item, occasion)
  );

  if (validItems.length === 0) {
    return buildEmptyOutfit({
      mood,
      occasion,
      weather,
      message: "No matching clothes found for the selected occasion.",
    });
  }

  const grouped = groupItemsBySlot(validItems);
  const bestCombo = buildBestBaseComboNow(grouped, occasion, weatherInfo);

  if (!bestCombo) {
    return buildEmptyOutfit({
      mood,
      occasion,
      weather,
      message: "Not enough matching clothes found to build an outfit for the selected occasion.",
    });
  }

  const selectedRawItems = [...bestCombo.items];

  const bestOuterwear = pickBestOuterwearNow(
    grouped.outerwear,
    occasion,
    weatherInfo
  );

  if (bestOuterwear) {
    const exists = selectedRawItems.some(
      (x) => String(x._id) === String(bestOuterwear._id)
    );
    if (!exists) selectedRawItems.push(bestOuterwear);
  }

  const selectedItems = uniqueSelectedItems(
    selectedRawItems.map((item) =>
      normalizeClosetItem(item, classifyItem(item))
    )
  );

  const totalPrice = selectedItems.reduce(
    (sum, item) => sum + Number(item.price || 0),
    0
  );

  return {
    items: selectedItems,
    accessories: [],
    totalPrice,
    mood: mood || null,
    occasion: occasion || null,
    weather: weather || null,
    mlPowered: false,
    usedClosetItems: selectedItems.length,
    usedProductItems: 0,
    message: "Outfit generated from your closet.",
  };
};

/**
 * Generate FUTURE outfit
 * weather ignore
 * closet first, missing slots product fallback
 */
const generate_future = async ({
  userId,
  mood,
  occasion,
  weather,
  gender,
}) => {
  const reqOccasion = safeLower(occasion);
  const reqGender = normalizeGender(gender);
  const template = getOutfitTemplateByOccasion(occasion);

  const closetItems = await ClosetItem.find({
    user: userId,
    isActive: true,
  }).lean();

  const productQuery = {
    isActive: true,
    quantity: { $gt: 0 },
  };

  if (reqGender) {
    productQuery.$or = [
      { gender: new RegExp(`^${gender}$`, "i") },
      { category: new RegExp(`^${gender}$`, "i") },
    ];
  }

  const products = await Product.find(productQuery).lean();

  const validClosetItems = closetItems.filter((item) =>
    passesOccasionHardRule(item, occasion)
  );

  const validProducts = products.filter((item) =>
    passesOccasionHardRule(item, occasion)
  );

  const groupedCloset = groupItemsBySlot(validClosetItems);
  const groupedProducts = groupItemsBySlot(validProducts);

  const closetBaseCombo = buildBestBaseComboFuture(groupedCloset, occasion);
  const productBaseCombo = buildBestBaseComboFuture(groupedProducts, occasion);

  let selectedBaseItems = [];
  let usedClosetItems = 0;
  let usedProductItems = 0;

  if (closetBaseCombo) {
    selectedBaseItems = [...closetBaseCombo.items];
  } else if (productBaseCombo) {
    selectedBaseItems = [...productBaseCombo.items];
  }

  if (selectedBaseItems.length === 0) {
    return buildEmptyOutfit({
      mood,
      occasion,
      weather,
      message: "No suitable outfit items found for the selected occasion.",
    });
  }

  const hasDress = selectedBaseItems.some((x) => classifyItem(x) === "dress");
  const hasTop = selectedBaseItems.some((x) => classifyItem(x) === "top");
  const hasBottom = selectedBaseItems.some((x) => classifyItem(x) === "bottom");

  if (!hasDress && template.needTopBottomOrDress) {
    if (!hasTop) {
      const closetTop = pickBestSingleItem(groupedCloset.tops, occasion);
      if (closetTop) {
        selectedBaseItems.push(closetTop);
      } else {
        const productTop = pickBestProductForSlot(
          validProducts,
          "top",
          selectedBaseItems,
          occasion
        );
        if (productTop) selectedBaseItems.push(productTop);
      }
    }

    if (!hasBottom) {
      const closetBottom = pickBestSingleItem(groupedCloset.bottoms, occasion);
      if (closetBottom) {
        const exists = selectedBaseItems.some(
          (x) => String(x._id) === String(closetBottom._id)
        );
        if (!exists) selectedBaseItems.push(closetBottom);
      } else {
        const productBottom = pickBestProductForSlot(
          validProducts,
          "bottom",
          selectedBaseItems,
          occasion
        );
        if (productBottom) selectedBaseItems.push(productBottom);
      }
    }
  }

  let selectedOuterwear = null;
  if (template.optionalOuterwear) {
    selectedOuterwear =
      pickBestSingleItem(groupedCloset.outerwear, occasion) ||
      pickBestProductForSlot(validProducts, "outerwear", selectedBaseItems, occasion);
  }

  let selectedShoes = null;
  if (template.requireShoes || reqOccasion === "wedding") {
    selectedShoes =
      pickBestShoes(groupedCloset.shoes, selectedBaseItems, occasion) ||
      pickBestProductForSlot(validProducts, "shoes", selectedBaseItems, occasion);
  }

  let finalRawItems = [...selectedBaseItems];
  if (selectedOuterwear) finalRawItems.push(selectedOuterwear);
  if (selectedShoes) finalRawItems.push(selectedShoes);

  finalRawItems = uniqueSelectedItems(
    finalRawItems.map((item) => ({
      ...item,
      source:
        closetItems.some((c) => String(c._id) === String(item._id))
          ? SOURCE.CLOSET
          : SOURCE.PRODUCT,
    }))
  );

  const finalItems = finalRawItems.map((item) => {
    const slot = classifyItem(item);
    const isCloset = item.source === SOURCE.CLOSET;

    return isCloset
      ? normalizeClosetItem(item, slot)
      : normalizeProductItem(item, slot);
  });

  usedClosetItems = finalItems.filter((x) => x.source === SOURCE.CLOSET).length;
  usedProductItems = finalItems.filter((x) => x.source === SOURCE.PRODUCT).length;

  const totalPrice = finalItems.reduce(
    (sum, item) => sum + Number(item.price || 0),
    0
  );

  let message = "Future outfit generated.";
  if (usedClosetItems > 0 && usedProductItems > 0) {
    message = `Used ${usedClosetItems} item(s) from your closet and ${usedProductItems} product suggestion(s).`;
  } else if (usedClosetItems > 0 && usedProductItems === 0) {
    message = "Built fully from your closet.";
  } else if (usedClosetItems === 0 && usedProductItems > 0) {
    message = "No suitable closet items found, so this recommendation is based on products.";
  }

  return {
    items: finalItems,
    accessories: [],
    totalPrice,
    mood: mood || null,
    occasion: occasion || null,
    weather: weather || null,
    mlPowered: false,
    usedClosetItems,
    usedProductItems,
    message,
  };
};

module.exports = {
  generate_closet,
  generate_future,
};