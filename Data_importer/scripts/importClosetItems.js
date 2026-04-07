require("dotenv").config();

const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const mongoose = require("mongoose");

const connectDB = require("../config/db");
const MyClosetItem = require("../models/MyClosetItem");
const { extractFeatures } = require("../services/mlFeatureExtractor");

const EXCEL_PATH =
  process.argv[2] || path.join(__dirname, "../data/cloths data set.xlsx");
const USER_ID = process.argv[3];

if (!USER_ID) {
  console.error("Please provide user ObjectId");
  console.log(
    'Example: npm run import -- "./data/cloths data set.xlsx" 69c246a2013a4c20783120be'
  );
  process.exit(1);
}

function toArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map(String).map((v) => v.trim()).filter(Boolean);
  }

  const str = String(value).trim();
  if (!str) return [];

  try {
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed)) {
      return parsed.map(String).map((v) => v.trim()).filter(Boolean);
    }
  } catch (_) {}

  return str
    .split(/[,|;]/)
    .map((v) => v.trim())
    .filter(Boolean);
}

function toNumber(value, def = 0) {
  if (value === undefined || value === null || value === "") return def;
  const num = Number(value);
  return Number.isFinite(num) ? num : def;
}

function toBoolean(value, def = false) {
  if (value === undefined || value === null || value === "") return def;
  if (typeof value === "boolean") return value;
  const v = String(value).trim().toLowerCase();
  return ["true", "1", "yes", "y"].includes(v);
}

function getProductId(row, index) {
  const raw =
    row.product_id ??
    row["product_id(obj)"] ??
    row.productId ??
    row["product id"] ??
    "";

  const num = Number(raw);
  if (Number.isFinite(num) && num > 0) return num;

  // excel eke product id empty nam auto generate
  return index + 1;
}

function projectRootPath(...segments) {
  return path.resolve(__dirname, "..", ...segments);
}

function resolveImagePath(rawPath) {
  if (!rawPath) return null;

  const normalized = String(rawPath).trim().replace(/\\/g, path.sep);

  if (fs.existsSync(normalized)) return normalized;

  const fromExcelDir = path.resolve(path.dirname(EXCEL_PATH), normalized);
  if (fs.existsSync(fromExcelDir)) return fromExcelDir;

  const fromProjectRoot = projectRootPath(normalized);
  if (fs.existsSync(fromProjectRoot)) return fromProjectRoot;

  return null;
}

async function main() {
  console.log("🚀 Import started...");

  if (!mongoose.Types.ObjectId.isValid(USER_ID)) {
    throw new Error("Invalid user ObjectId");
  }

  if (!fs.existsSync(EXCEL_PATH)) {
    throw new Error(`Excel file not found: ${EXCEL_PATH}`);
  }

  await connectDB();
  console.log("✅ MongoDB connected");

  const workbook = xlsx.readFile(EXCEL_PATH);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

  console.log(`📄 Rows found: ${rows.length}`);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    try {
      const productId = getProductId(row, i);
      const imageRaw = row.image || row.image_path || row.img || "";

      if (!row.name || !imageRaw) {
        console.log("--------------------------------------------------");
        console.log(`❌ Skipping row ${i + 2}`);
        console.log("productId:", productId);
        console.log("name:", row.name);
        console.log("imageRaw:", imageRaw);
        console.log("FULL ROW:", row);
        console.log("--------------------------------------------------");
        skipped++;
        continue;
      }

      console.log(`➡️ Processing row ${i + 2}`);
      console.log("productId:", productId);
      console.log("name:", row.name);
      console.log("imageRaw:", imageRaw);

      const imagePath = resolveImagePath(imageRaw);
      console.log("Resolved imagePath:", imagePath);

      if (!imagePath) {
        console.log(`❌ Image not found for row ${i + 2}: ${imageRaw}`);
        skipped++;
        continue;
      }

      const imageBuffer = fs.readFileSync(imagePath);

      console.log("🧠 Extracting features...");
      const featureVector = await extractFeatures(imageBuffer);
      console.log("✅ Feature vector length:", featureVector?.length || 0);

      const doc = {
        product_id: productId,
        user: new mongoose.Types.ObjectId(USER_ID),
        name: String(row.name || "").trim(),
        description: String(row.description || "").trim(),
        category: String(row.category || "").trim(),
        image: String(imageRaw).trim(),
        subCategory: String(row.subCategory || "").trim(),
        type: String(row.type || "").trim(),
        colors: toArray(row.colors),
        occasion: toArray(row.occasion),
        style_tags: toArray(row.style_tags),
        season_tags: toArray(row.season_tags),
        material: String(row.material || "").trim(),
        fit: String(row.fit || "").trim(),
        weather_tag: String(row.weather_tag || "").trim(),
        pattern: String(row.pattern || "").trim(),
        price_lkr: toNumber(row.price_lkr, 0),
        quantity: toNumber(row.quantity, 0),
        rating: toNumber(row.rating, 0),
        reviews_count: toNumber(row.reviews_count, 0),
        is_new_arrival: toBoolean(row.is_new_arrival, false),
        is_active: toBoolean(row.is_active, true),
        featureVector,
      };

      const exists = await MyClosetItem.findOne({ product_id: productId });

      if (exists) {
        await MyClosetItem.updateOne({ product_id: productId }, { $set: doc });
        updated++;
        console.log(`🔄 Updated product_id=${productId}`);
      } else {
        await MyClosetItem.create(doc);
        inserted++;
        console.log(`✅ Inserted product_id=${productId}`);
      }
    } catch (err) {
      failed++;
      console.error(`❌ Failed row ${i + 2}:`, err.message);
    }
  }

  console.log("\n🎉 Import completed");
  console.log("Inserted:", inserted);
  console.log("Updated :", updated);
  console.log("Skipped :", skipped);
  console.log("Failed  :", failed);

  await mongoose.connection.close();
  console.log("🔌 MongoDB connection closed");
}

main().catch(async (err) => {
  console.error("Import error:", err.message);
  try {
    await mongoose.connection.close();
  } catch (_) {}
  process.exit(1);
});