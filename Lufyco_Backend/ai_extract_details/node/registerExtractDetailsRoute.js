const extractDetailsRoute = require("./extractDetails.route");

function registerExtractDetailsRoute(app) {
  app.use("/api/ai-new", extractDetailsRoute);
}

module.exports = registerExtractDetailsRoute;