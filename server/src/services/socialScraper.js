// ─── Social Media Scraper Service ───
// Fetches posts from Instagram/TikTok via RapidAPI with demo fallbacks.

const https = require("https");

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

/**
 * Make an HTTPS GET request to RapidAPI.
 */
function rapidApiGet(host, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: host,
      path,
      method: "GET",
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": host,
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error("Invalid JSON from RapidAPI"));
        }
      });
    });

    req.on("error", reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error("RapidAPI request timed out"));
    });
    req.end();
  });
}

/**
 * Fetch recent Instagram posts for a handle.
 * Returns { posts: [{imageUrl, caption}], profile: {bio} }
 */
async function fetchInstagramPosts(handle, count = 9) {
  if (!RAPIDAPI_KEY) {
    console.warn("[SocialScraper] No RAPIDAPI_KEY — using fallback");
    return fallbackCreatorImport(handle);
  }

  try {
    const cleanHandle = handle.replace(/^@/, "");
    const host = "instagram-scraper-api2.p.rapidapi.com";

    // Fetch profile info
    const profileData = await rapidApiGet(
      host,
      `/v1/info?username_or_id_or_url=${encodeURIComponent(cleanHandle)}`
    );

    const bio = profileData?.data?.biography || "";

    // Fetch recent media
    const mediaData = await rapidApiGet(
      host,
      `/v1.2/posts?username_or_id_or_url=${encodeURIComponent(cleanHandle)}`
    );

    const items = (mediaData?.data?.items || []).slice(0, count);
    const posts = items
      .filter((item) => item.image_versions2 || item.carousel_media)
      .map((item) => {
        const imageUrl =
          item.image_versions2?.candidates?.[0]?.url ||
          item.carousel_media?.[0]?.image_versions2?.candidates?.[0]?.url ||
          "";
        const caption = item.caption?.text || "";
        return { imageUrl, caption };
      })
      .filter((p) => p.imageUrl);

    return { posts, profile: { bio } };
  } catch (err) {
    console.warn("[SocialScraper] Instagram fetch failed:", err.message);
    return fallbackCreatorImport(handle);
  }
}

/**
 * Fetch recent TikTok posts for a handle.
 * Returns { posts: [{imageUrl, caption}], profile: {bio} }
 */
async function fetchTiktokPosts(handle, count = 6) {
  if (!RAPIDAPI_KEY) {
    console.warn("[SocialScraper] No RAPIDAPI_KEY — using fallback");
    return fallbackCreatorImport(handle);
  }

  try {
    const cleanHandle = handle.replace(/^@/, "");
    const host = "tiktok-scraper7.p.rapidapi.com";

    const userData = await rapidApiGet(
      host,
      `/user/info?unique_id=${encodeURIComponent(cleanHandle)}`
    );

    const bio = userData?.data?.user?.signature || "";

    const postsData = await rapidApiGet(
      host,
      `/user/posts?unique_id=${encodeURIComponent(cleanHandle)}&count=${count}`
    );

    const items = (postsData?.data?.videos || []).slice(0, count);
    const posts = items.map((item) => ({
      imageUrl: item.cover || item.origin_cover || "",
      caption: item.title || "",
    })).filter((p) => p.imageUrl);

    return { posts, profile: { bio } };
  } catch (err) {
    console.warn("[SocialScraper] TikTok fetch failed:", err.message);
    return fallbackCreatorImport(handle);
  }
}

/**
 * Demo fallback data keyed by known seeded creator handles.
 */
const DEMO_CREATORS = {
  mayachen_eats: {
    posts: [
      { imageUrl: "/uploads/demo/creator-maya-1.jpg", caption: "Golden hour at my favorite Evanston spot" },
      { imageUrl: "/uploads/demo/creator-maya-2.jpg", caption: "Latte art is an art form" },
      { imageUrl: "/uploads/demo/creator-maya-3.jpg", caption: "Weekend brunch done right" },
      { imageUrl: "/uploads/demo/creator-maya-4.jpg", caption: "The best pastries in town" },
    ],
    profile: { bio: "Chicago food & lifestyle photographer. Warm tones, real moments." },
  },
  jordanlee_photo: {
    posts: [
      { imageUrl: "/uploads/demo/creator-jordan-1.jpg", caption: "Industrial vibes at the West Loop" },
      { imageUrl: "/uploads/demo/creator-jordan-2.jpg", caption: "Behind the counter stories" },
      { imageUrl: "/uploads/demo/creator-jordan-3.jpg", caption: "Moody mornings, bold coffee" },
      { imageUrl: "/uploads/demo/creator-jordan-4.jpg", caption: "Every dish tells a story" },
    ],
    profile: { bio: "Documentary-style food content. Raw, bold, authentic." },
  },
  samira_creates: {
    posts: [
      { imageUrl: "/uploads/demo/creator-samira-1.jpg", caption: "Clean lines and fresh flavors" },
      { imageUrl: "/uploads/demo/creator-samira-2.jpg", caption: "Minimalist plating goals" },
      { imageUrl: "/uploads/demo/creator-samira-3.jpg", caption: "Light and bright always" },
      { imageUrl: "/uploads/demo/creator-samira-4.jpg", caption: "Seasonal specials deserve attention" },
    ],
    profile: { bio: "Minimalist food photography. Clean aesthetic, natural light." },
  },
};

/**
 * Fallback for demo mode — returns sample data for known handles,
 * or generic data for unknown handles.
 */
function fallbackCreatorImport(handle) {
  const cleanHandle = (handle || "").replace(/^@/, "").toLowerCase();

  // Check known demo creators
  for (const [key, data] of Object.entries(DEMO_CREATORS)) {
    if (cleanHandle.includes(key) || key.includes(cleanHandle)) {
      return data;
    }
  }

  // Generic fallback
  return {
    posts: [
      { imageUrl: "/uploads/demo/placeholder-1.jpg", caption: "Sample content" },
      { imageUrl: "/uploads/demo/placeholder-2.jpg", caption: "Sample content" },
      { imageUrl: "/uploads/demo/placeholder-3.jpg", caption: "Sample content" },
    ],
    profile: {
      bio: "Creative content creator based in Chicago. Passionate about food and local businesses.",
    },
  };
}

module.exports = {
  fetchInstagramPosts,
  fetchTiktokPosts,
  fallbackCreatorImport,
};
