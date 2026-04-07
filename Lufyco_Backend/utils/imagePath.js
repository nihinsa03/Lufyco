const normalizeImagePath = (image) => {
  if (!image || typeof image !== "string") return image;

  // full URL → relative path
  if (image.startsWith("http://") || image.startsWith("https://")) {
    try {
      const url = new URL(image);
      return url.pathname.replace(/^\/+/, "");
    } catch (error) {
      return image;
    }
  }

  // already relative
  return image.replace(/^\/+/, "");
};

module.exports = {
  normalizeImagePath,
};