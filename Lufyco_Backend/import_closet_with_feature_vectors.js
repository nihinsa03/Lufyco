require("dotenv").config();
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const XLSX = require("xlsx");

const connectDB = require("./config/db");
const ClosetItem = require("./models/ClosetItem");
const { extractFeatures } = require("./services/mlFeatureExtractor");

/* ---------- helpers ---------- */

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
  if (Array.isArray(normalized)) return normalized.map(String).map(v => v.trim()).filter(Boolean);

  return String(normalized)
    .split(",")
    .map(v => v.trim())
    .filter(Boolean);
}

function toNumber(value, fallback = 0) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "string" && ["none", "null"].includes(value.trim().toLowerCase())) return fallback;

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

function resolveImagePath(rawImagePath, baseDir) {
  const img = normalizeValue(rawImagePath);
  if (!img) return null;

  if (/^https?:\/\//i.test(img)) return null;

  const cleaned = img.replace(/\\/g, path.sep).replace(/\//g, path.sep);

  const possiblePaths = [
    path.isAbsolute(cleaned) ? cleaned : path.join(baseDir, cleaned),
    path.join(process.cwd(), cleaned),
    path.join(process.cwd(), "uploads", cleaned),
    path.join(process.cwd(), "public", cleaned),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }

  return null;
}

/* ---------- main ---------- */

async function main() {
  const excelPath = process.env.CLOSET_XLSX_PATH || "./clothsDataSet.xlsx";
  
  const sheetName = process.env.CLOSET_SHEET_NAME || "Closet";
  const imageBaseDir = process.env.CLOSET_IMAGE_BASE_DIR || process.cwd();
  const clearExisting = String(process.env.CLEAR_EXISTING || "false") === "true";

  if (!fs.existsSync(excelPath)) {
    throw new Error("Excel file not found: " + excelPath);
  }

  await connectDB();

  console.log("Mongoose readyState:", mongoose.connection.readyState);

  const workbook = XLSX.readFile(excelPath);
  const sheet = workbook.Sheets[sheetName];

  if (!sheet) throw new Error("Sheet not found: " + sheetName);

  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

  console.log("Total rows:", rows.length);

  if (clearExisting) {
    await ClosetItem.deleteMany({});
    console.log("Collection cleared");
  }

  let inserted = 0;
  let skipped = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    try {
      const imagePath = resolveImagePath(row.image, imageBaseDir);

      let featureVector = [];

      if (imagePath) {
        try {
          const buffer = fs.readFileSync(imagePath);
          featureVector = await extractFeatures(buffer);
        } catch (err) {
          console.log("Feature error row", i + 1, err.message);
        }
      } else {
        console.log("Image not found row", i + 1);
      }

      const doc = {
        closetID: row.closetID,
        user: row.user,
        name: row.name,
        category: row.category,
        image: row.image,

        notes: row.description || "",
        color: (row.colors && row.colors.split(",")[0]) || "#000000",

        // NEW FIELDS
        subCategory: row.subCategory,
        type: row.type,
        gender: row.gender,
        colors: row.colors ? row.colors.split(",") : [],
        sizes: row.sizes ? row.sizes.split(",") : [],
        style_tags: row.style_tags ? row.style_tags.split(",") : [],
        season_tags: row.season_tags ? row.season_tags.split(",") : [],
        material: row.material,
        fit: row.fit,
        weather_tag: row.weather_tag,
        pattern: row.pattern,
        price: Number(row.price) || 0,
        quantity: Number(row.quantity) || 0,
        rating: Number(row.rating) || 0,
        reviewsCount: Number(row.reviewsCount) || 0,
        isNewArrival: row.isNewArrival === "true",
        isActive: row.isActive !== "false",

        featureVector,
        occasion: row.occasion,
    };

      if (!doc.name || !doc.category || !doc.image) {
        console.log("Skipped row", i + 1, "missing required");
        skipped++;
        continue;
      }

      await ClosetItem.create(doc);

      inserted++;
      console.log(`Inserted ${inserted}/${rows.length}`);
    } catch (err) {
      skipped++;
      console.log("Row error", i + 1, err.message);
    }
  }

  console.log("DONE");
  console.log({ inserted, skipped });

  await mongoose.connection.close();
}

/* ---------- run ---------- */

main().catch(async (err) => {
  console.error("IMPORT FAILED:", err);
  try {
    await mongoose.connection.close();
  } catch (_) {}
  process.exit(1);
});