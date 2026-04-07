require("dotenv").config();
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const XLSX = require("xlsx");

const connectDB = require("./config/db");
const Product = require("./models/Product");
const { extractFeatures } = require("./services/mlFeatureExtractor");

/* ---------- helpers ---------- */

function normalizeValue(value) {
  if (value === undefined || value === null) return undefined;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return undefined;

    const lower = trimmed.toLowerCase();
    if (["none", "null", "undefined", "nan"].includes(lower)) {
      return undefined;
    }

    return trimmed;
  }

  return value;
}

function toString(value, fallback = "") {
  const normalized = normalizeValue(value);
  if (normalized === undefined) return fallback;
  return String(normalized).trim();
}


function toNumber(value, fallback = 0) {
  const normalized = normalizeValue(value);
  if (normalized === undefined) return fallback;

  const n = Number(normalized);
  return Number.isFinite(n) ? n : fallback;
}

function toBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;

  const normalized = normalizeValue(value);
  if (normalized === undefined) return fallback;

  const v = String(normalized).trim().toLowerCase();

  if (["true", "1", "yes", "y"].includes(v)) return true;
  if (["false", "0", "no", "n"].includes(v)) return false;

  return fallback;
}

function getRowValue(row, possibleKeys = []) {
  for (const key of possibleKeys) {
    if (Object.prototype.hasOwnProperty.call(row, key)) {
      const value = row[key];
      if (value !== undefined && value !== null && value !== "") {
        return value;
      }
    }
  }
  return undefined;
}

function parseFeatureVector(value) {
  const normalized = normalizeValue(value);
  if (!normalized) return [];

  try {
    if (Array.isArray(normalized)) {
      return normalized
        .map((v) => Number(v))
        .filter((n) => Number.isFinite(n));
    }

    let str = String(normalized).trim();

    // "[1,2,3]" or "1,2,3" dekaama support
    str = str.replace(/^\[/, "").replace(/\]$/, "");

    if (!str) return [];

    return str
      .split(",")
      .map((v) => Number(v.trim()))
      .filter((n) => Number.isFinite(n));
  } catch (err) {
    return [];
  }
}

function resolveImagePath(rawImagePath, baseDir) {
  const img = normalizeValue(rawImagePath);
  if (!img) return null;

  // image url nam local path ekak widiyata read karanne na
  if (/^https?:\/\//i.test(img)) return null;

  const cleaned = String(img)
    .replace(/\\/g, path.sep)
    .replace(/\//g, path.sep);

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

function toStringArray(value) {
  const normalized = normalizeValue(value);
  if (!normalized) return [];

  // 🔥 JSON array ekak nam (["a","b"])
  if (typeof normalized === "string" && normalized.startsWith("[") && normalized.endsWith("]")) {
    try {
      const parsed = JSON.parse(normalized);
      if (Array.isArray(parsed)) {
        return parsed.map((v) => String(v).trim()).filter(Boolean);
      }
    } catch (err) {
      // fallback
    }
  }

  if (Array.isArray(normalized)) {
    return normalized.map((v) => String(v).trim()).filter(Boolean);
  }

  // normal comma split
  return String(normalized)
    .split(",")
    .map((v) => v.replace(/[\[\]"]/g, "").trim())
    .filter(Boolean);
}

/* ---------- main ---------- */

async function main() {
  const excelPath = process.env.PRODUCT_XLSX_PATH || "C:\\Users\\U S E R\\Desktop\\LUFYCO CLOTHING\\Lufyco_Clothing\\Lufyco_Backend\\data\\productDataSet.xlsx";
  console.log("Excel path:", excelPath);
  const sheetName = process.env.PRODUCT_SHEET_NAME || "shopProducts";
  const imageBaseDir = process.env.PRODUCT_IMAGE_BASE_DIR || process.cwd();
  const clearExisting = String(process.env.CLEAR_EXISTING || "false") === "true";
  const skipDuplicates = String(process.env.SKIP_DUPLICATES || "true") === "true";

  if (!fs.existsSync(excelPath)) {
    throw new Error("Excel file not found: " + excelPath);
  }

  await connectDB();
  console.log("Mongoose readyState:", mongoose.connection.readyState);

  const workbook = XLSX.readFile(excelPath);
  const sheet = workbook.Sheets[sheetName];

  if (!sheet) {
    throw new Error("Sheet not found: " + sheetName);
  }

  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });
  console.log("Total rows:", rows.length);

  if (clearExisting) {
    await Product.deleteMany({});
    console.log("Product collection cleared");
  }

  let inserted = 0;
  let skipped = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    try {
      const rawProductId = getRowValue(row, ["product_id(obj)", "productId"]);
      const rawSeller = getRowValue(row, ["seller"]);
      const rawName = getRowValue(row, ["name", "title"]);
      const rawDescription = getRowValue(row, ["description"]);
      const rawImage = getRowValue(row, ["image", "imageUrl", "img"]);
      const rawCategory = getRowValue(row, ["category"]);
      const rawSubCategory = getRowValue(row, ["subCategory", "subcategory"]);
      const rawType = getRowValue(row, ["type"]);
      const rawGender = getRowValue(row, ["gender"]);
      const rawColors = getRowValue(row, ["colors", "color"]);
      const rawSizes = getRowValue(row, ["sizes", "size"]);
      const rawOccasion = getRowValue(row, ["occasion"]);
      const rawStyleTags = getRowValue(row, ["style_tags", "styleTags"]);
      const rawSeasonTags = getRowValue(row, ["season_tags", "seasonTags"]);
      const rawMaterial = getRowValue(row, ["material"]);
      const rawFit = getRowValue(row, ["fit"]);
      const rawPrice = getRowValue(row, ["price"]);
      const rawQuantity = getRowValue(row, ["quantity", "stock"]);
      const rawRating = getRowValue(row, ["rating"]);
      const rawReviewsCount = getRowValue(row, ["reviewsCount", "reviews_count"]);
      const rawIsNewArrival = getRowValue(row, ["isNewArrival", "is_new_arrival"]);
      const rawIsActive = getRowValue(row, ["is_active", "isActive"]);
      const rawFeatureVector = getRowValue(row, ["feature_vector", "featureVector"]);
      const rawCompareAtPrice = getRowValue(row, ["compareAtPrice", "compare_at_price"]);

      const productId = toString(rawProductId, "");
      const image = toString(rawImage, "");

      if (!productId || !rawName || !rawCategory || !image || !rawDescription) {
        console.log(`Skipped row ${i + 1} - missing required fields`);
        skipped++;
        continue;
      }

      if (skipDuplicates) {
        const exists = await Product.findOne({ productId }).lean();
        if (exists) {
          console.log(`Skipped row ${i + 1} - duplicate productId: ${productId}`);
          skipped++;
          continue;
        }
      }

      const imagePath = resolveImagePath(image, imageBaseDir);

      let featureVector = parseFeatureVector(rawFeatureVector);

      // Excel eke feature_vector nathnam image eken generate karanawa
      if (!featureVector.length && imagePath) {
        try {
          const buffer = fs.readFileSync(imagePath);
          featureVector = await extractFeatures(buffer);
          console.log(`Generated feature vector for row ${i + 1} (${featureVector.length})`);
        } catch (err) {
          console.log(`Feature extract error row ${i + 1}: ${err.message}`);
          featureVector = [];
        }
      } else if (featureVector.length) {
        console.log(`Used Excel feature vector for row ${i + 1} (${featureVector.length})`);
      } else {
        console.log(`Image not found or no local image for row ${i + 1}`);
      }

      const doc = {
        productId: productId,
        seller: toString(rawSeller, ""),
        name: toString(rawName, ""),
        price: toNumber(rawPrice, 0),
        description: toString(rawDescription, ""),
        image: image,
        category: toString(rawCategory, ""),
        subCategory: toString(rawSubCategory, ""),
        type: toString(rawType, ""),
        gender: toString(rawGender, ""),
        compareAtPrice: toNumber(rawCompareAtPrice, 0),
        colors: toStringArray(rawColors),
        rating: toNumber(rawRating, 0),
        reviewsCount: toNumber(rawReviewsCount, 0),
        featureVector: featureVector,
        occasion: toStringArray(rawOccasion),
        quantity: toNumber(rawQuantity, 0),

        // additional fields
        sizes: toStringArray(rawSizes),
        style_tags: toStringArray(rawStyleTags),
        season_tags: toStringArray(rawSeasonTags),
        material: toString(rawMaterial, ""),
        fit: toString(rawFit, ""),
        isNewArrival: toBoolean(rawIsNewArrival, false),
        isActive: toBoolean(rawIsActive, true),
      };

      await Product.create(doc);

      inserted++;
      console.log(`Inserted ${inserted}/${rows.length} -> ${doc._id}`);
    } catch (err) {
      skipped++;
      console.log(`Row error ${i + 1}: ${err.message}`);
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