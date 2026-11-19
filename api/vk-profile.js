/**
 * Server-side VK users.get — avoids browser CORS.
 * Token must be sent in POST JSON body (never query string / access logs).
 */
module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch {
      body = {};
    }
  }
  body = body && typeof body === "object" ? body : {};

  const accessToken = String(body.access_token || "").trim();
  const userId = String(body.user_id || "").trim();
  if (!accessToken) {
    return res.status(400).json({ error: "access_token required" });
  }

  try {
    const api = new URL("https://api.vk.com/method/users.get");
    api.searchParams.set("access_token", accessToken);
    api.searchParams.set("fields", "photo_100,photo_200,screen_name");
    api.searchParams.set("v", "5.199");
    if (userId) api.searchParams.set("user_ids", userId);

    const upstream = await fetch(api.toString());
    const data = await upstream.json();
    if (data?.error) {
      return res.status(502).json({ error: data.error.error_msg || "VK API error" });
    }
    const user = data?.response?.[0];
    if (!user) {
      return res.status(502).json({ error: "empty VK profile" });
    }
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(502).json({ error: err?.message || "VK proxy failed" });
  }
};
