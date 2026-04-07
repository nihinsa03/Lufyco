const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ClosetItem = require("../models/ClosetItem");
const { normalizeImagePath } = require("../utils/imagePath");
const { extractFeatures } = require("../services/mlFeatureExtractor");

function normalizeValue(value) {
  if (value === undefined || value === null) return undefined;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed.toLowerCase() === "none" || trimmed.toLowerCase() === "null") {
      return undefined;
    }
    return trimmed;
  }

  return value;
}

function toStringArray(value) {
  const normalized = normalizeValue(value);
  if (!normalized) return [];

  if (Array.isArray(normalized)) {
    return normalized.map(String).map((v) => v.trim()).filter(Boolean);
  }

  if (typeof normalized === "string") {
    try {
      const parsed = JSON.parse(normalized);
      if (Array.isArray(parsed)) {
        return parsed.map(String).map((v) => v.trim()).filter(Boolean);
      }
    } catch (_) {}

    return normalized
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }

  return [];
}

function toNumber(value, fallback = 0) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "string" && ["none", "null"].includes(value.trim().toLowerCase())) {
    return fallback;
  }

  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;

  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (["true", "1", "yes", "y"].includes(v)) return true;
    if (["false", "0", "no", "n", "none", "null", ""].includes(v)) return false;
  }

  return fallback;
}

async function getNextClosetId() {
  const lastItem = await ClosetItem.findOne({}, { closetID: 1 })
    .sort({ closetID: -1 })
    .lean();

  return lastItem?.closetID ? Number(lastItem.closetID) + 1 : 1;
}

async function saveImageToDisk({ buffer, userId, closetId }) {
  const uploadDir = path.join(
    process.cwd(),
    "uploads",
    "userFiles",
    String(userId),
    "closets"
  );

  fs.mkdirSync(uploadDir, { recursive: true });

  const fileName = `${closetId}.jpg`;
  const absolutePath = path.join(uploadDir, fileName);

  await sharp(buffer)
    .jpeg({ quality: 90 })
    .toFile(absolutePath);

  const relativePath = normalizeImagePath(
    path.join("uploads", "userFiles", String(userId), "closets", fileName)
  );

  return {
    absolutePath,
    relativePath,
  };
}

async function buildClosetPayload({ body, file }) {
  if (!body.user) {
    throw new Error("User is required");
  }

  if (!file || !file.buffer) {
    throw new Error("Image file is required");
  }

  const closetId = await getNextClosetId();

  const { absolutePath, relativePath } = await saveImageToDisk({
    buffer: file.buffer,
    userId: body.user,
    closetId,
  });

  let featureVector = [];
  try {
    featureVector = await extractFeatures(file.buffer);
  } catch (error) {
    console.warn("Feature extraction failed:", error.message);
    featureVector = [];
  }

  const colorValue = normalizeValue(body.color) || "#000000";
  const colorsArray = toStringArray(body.colors);
  const finalColors = colorsArray.length ? colorsArray : [colorValue];

  return {
    closetID: closetId,
    user: String(body.user),

    name: normalizeValue(body.name) || "New Upload",
    category: normalizeValue(body.category) || null,
    image: relativePath,
    notes: normalizeValue(body.notes) || "",

    color: colorValue,
    colors: finalColors,

    subCategory: normalizeValue(body.subCategory) || null,
    type: normalizeValue(body.type) || null,

    style_tags: toStringArray(body.style_tags),
    season_tags: toStringArray(body.season_tags),

    material: normalizeValue(body.material) || null,
    fit: normalizeValue(body.fit) || null,
    weather_tag: normalizeValue(body.weather_tag) || "All",
    pattern: normalizeValue(body.pattern) || null,

    occasion: toStringArray(body.occasion),
    sizes: toStringArray(body.sizes),

    featureVector,

    price: toNumber(body.price, 0),
    quantity: toNumber(body.quantity, 1),
    rating: toNumber(body.rating, 0),
    reviewsCount: toNumber(body.reviewsCount, 0),

    isNewArrival: toBoolean(body.isNewArrival, false),
    isActive: toBoolean(body.isActive, true),
  };
}

async function saveClosetItemWithImage({ body, file }) {
  const payload = await buildClosetPayload({ body, file });

  if (!payload.name || !payload.category || !payload.image) {
    throw new Error("Missing required fields");
  }

  const item = await ClosetItem.create(payload);
  return item;
}

module.exports = {
  saveClosetItemWithImage,
};