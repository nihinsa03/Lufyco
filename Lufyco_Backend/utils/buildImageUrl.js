const buildImageUrl = (imagePath) => {
  if (!imagePath) return null;

  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://")
  ) {
    return imagePath;
  }

  const normalized = imagePath.replace(/\\/g, "/");

  let relativePath = normalized;

  // remove leading uploads/
  if (relativePath.startsWith("uploads/")) {
    relativePath = relativePath.replace(/^uploads\//, "");
  }

  const baseUrl =
    process.env.BACKEND_BASE_URL ||
    `http://localhost:${process.env.PORT || 5001}`;

  return `${baseUrl}/uploads/${relativePath}`;
};

module.exports = buildImageUrl;