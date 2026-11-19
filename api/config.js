module.exports = function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).json({
    vkAppId: process.env.VK_APP_ID || "",
    appName: process.env.VK_APP_NAME || "Золотой червонец",
  });
};
