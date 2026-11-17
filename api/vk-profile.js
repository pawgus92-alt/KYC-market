/**
 * Server-side VK users.get — avoids browser CORS when Open API is unavailable.
 * Query: ?access_token=...&user_id=optional
 */
module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const accessToken = String(req.query?.access_token || "").trim();
  const userId = String(req.query?.user_id || "").trim();
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
