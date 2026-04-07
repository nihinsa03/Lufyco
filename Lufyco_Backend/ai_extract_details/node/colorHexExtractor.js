const sharp = require("sharp");

const CONFIG = {
  resizeWidth: 220,
  resizeHeight: 220,
  centerCropRatio: 0.82,
  objectBgDistanceThreshold: 0.36,
  minObjectPixels: 400,
  bboxPadding: -30,
};

function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (d !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h *= 60;
    if (h < 0) h += 360;
  }

  return { h, s, v };
}

function hueDistance(a, b) {
  const d = Math.abs(a - b);
  return Math.min(d, 360 - d);
}

function hsvDistance(a, b) {
  const dh = hueDistance(a.h, b.h) / 180;
  const ds = Math.abs(a.s - b.s);
  const dv = Math.abs(a.v - b.v);
  return dh * 2.2 + ds * 1.2 + dv * 1.0;
}

function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((v) =>
        Math.max(0, Math.min(255, v))
          .toString(16)
          .padStart(2, "0")
      )
      .join("")
      .toUpperCase()
  );
}

async function loadAndCropImageFromBuffer(imageBuffer) {
  const meta = await sharp(imageBuffer).metadata();

  if (!meta.width || !meta.height) {
    throw new Error("Could not read image size.");
  }

  const cropW = Math.round(meta.width * CONFIG.centerCropRatio);
  const cropH = Math.round(meta.height * CONFIG.centerCropRatio);
  const left = Math.max(0, Math.round((meta.width - cropW) / 2));
  const top = Math.max(0, Math.round((meta.height - cropH) / 2));

  return sharp(imageBuffer)
    .extract({ left, top, width: cropW, height: cropH })
    .resize(CONFIG.resizeWidth, CONFIG.resizeHeight, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
}

function estimateBackgroundColor(rawBuffer, width, height) {
  const channels = 3;
  const border = Math.min(12, Math.floor(Math.min(width, height) / 6));
  const samples = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const isEdge =
        x < border ||
        x >= width - border ||
        y < border ||
        y >= height - border;

      if (!isEdge) continue;

      const idx = (y * width + x) * channels;
      const r = rawBuffer[idx];
      const g = rawBuffer[idx + 1];
      const b = rawBuffer[idx + 2];

      samples.push(rgbToHsv(r, g, b));
    }
  }

  if (!samples.length) {
    return { h: 0, s: 0, v: 1 };
  }

  let sumX = 0;
  let sumY = 0;
  let sumS = 0;
  let sumV = 0;

  for (const hsv of samples) {
    const rad = (hsv.h * Math.PI) / 180;
    sumX += Math.cos(rad);
    sumY += Math.sin(rad);
    sumS += hsv.s;
    sumV += hsv.v;
  }

  let avgHue = (Math.atan2(sumY, sumX) * 180) / Math.PI;
  if (avgHue < 0) avgHue += 360;

  return {
    h: avgHue,
    s: sumS / samples.length,
    v: sumV / samples.length,
  };
}

async function detectObjectAndCropFromBuffer(imageBuffer) {
  const { data, info } = await loadAndCropImageFromBuffer(imageBuffer);
  const { width, height } = info;
  const channels = 3;

  const backgroundHsv = estimateBackgroundColor(data, width, height);

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  let objectPixels = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const hsv = rgbToHsv(r, g, b);

      const distance = hsvDistance(hsv, backgroundHsv);

      if (distance >= CONFIG.objectBgDistanceThreshold) {
        objectPixels++;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (objectPixels < CONFIG.minObjectPixels || maxX < minX || maxY < minY) {
    return {
      data,
      width,
      height,
      bbox: {
        left: 0,
        top: 0,
        width,
        height,
      },
    };
  }

  const pad = CONFIG.bboxPadding;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);

  return {
    data,
    width,
    height,
    bbox: {
      left: minX,
      top: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
    },
  };
}

async function extractCroppedRawFromBuffer(imageBuffer) {
  const detected = await detectObjectAndCropFromBuffer(imageBuffer);
  const { data, width, height, bbox } = detected;

  return sharp(data, {
    raw: { width, height, channels: 3 },
  })
    .extract(bbox)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
}

async function extractHexColorFromBuffer(imageBuffer) {
  const { data, info } = await extractCroppedRawFromBuffer(imageBuffer);
  const { width, height } = info;

  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);
  const idx = (centerY * width + centerX) * 3;

  const r = data[idx];
  const g = data[idx + 1];
  const b = data[idx + 2];

  return {
    color: rgbToHex(r, g, b),
    centerPixel: { x: centerX, y: centerY, r, g, b },
  };
}

module.exports = {
  extractHexColorFromBuffer,
};