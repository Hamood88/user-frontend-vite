// user-frontend-vite/src/pages/ShopPublicPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  API_BASE,
  getPublicShop,
  getPublicShopFeed,
  getPublicShopMall,
  getPublicShopProducts,
  followShop,
  unfollowShop,
  checkShopFollowStatus,
} from "../api.jsx";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function absUrl(u) {
  if (!u) return "";
  const s = String(u).trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  const base = String(API_BASE || "https://moondala-backend.onrender.com").replace(/\/+$/, "");
  if (s.startsWith("/")) return base + s;
  return base + "/" + s;
}

function pickProductImage(p) {
  if (!p) return "";
  const img =
    (Array.isArray(p.images) && p.images[0]) ||
    p.image ||
    p.thumbnail ||
    p.coverImage ||
    p.photo ||
    "";
  return absUrl(img);
}

function money(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "0.00";
  return x.toFixed(2);
}

function safeTab(v) {
  const t = String(v || "").toLowerCase().trim();
  return t === "feed" ? "feed" : "mall";
}

export default function ShopPublicPage() {
  const { shopId } = useParams();
  const nav = useNavigate();
  const query = useQuery();

  // ✅ read ?tab=feed
  const tabFromUrl = safeTab(query.get("tab"));
  const [tab, setTab] = useState(tabFromUrl || "mall");

  // keep tab synced with URL
  useEffect(() => {
    setTab(tabFromUrl || "mall");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabFromUrl]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [shop, setShop] = useState(null);
  
  // ✅ Follow state
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // feed
  const [feedLoading, setFeedLoading] = useState(false);
  const [feed, setFeed] = useState([]);
  const [feedPage, setFeedPage] = useState(1);
  const [feedHasMore, setFeedHasMore] = useState(false);

  // mall page
  const [mallLoading, setMallLoading] = useState(false);
  const [mall, setMall] = useState({ sections: [] });
  const [featuredProducts, setFeaturedProducts] = useState([]);

  const featuredIds = useMemo(() => {
    const sections = Array.isArray(mall?.sections) ? mall.sections : [];
    const sec = sections.find((s) => s?.type === "featured_products" && s?.enabled !== false);
    return (sec?.productIds || []).map(String).filter(Boolean);
  }, [mall]);

  // ✅ Load shop + mall + first feed
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        const sid = String(shopId || "").replace(/^:/, "").trim();
        if (!sid) throw new Error("Missing shopId");

        const [shopRes, mallRes, feedRes] = await Promise.all([
          getPublicShop(sid),
          getPublicShopMall(sid),
          getPublicShopFeed(sid, 1, 10),
        ]);

        if (!alive) return;

        setShop(shopRes?.shop || null);

        // mallRes.page could be { shopId, coverImage, sections: [] }
        setMall(mallRes?.page || { sections: [] });

        setFeed(Array.isArray(feedRes?.items) ? feedRes.items : []);
        setFeedPage(Number(feedRes?.page || 1));
        setFeedHasMore(!!feedRes?.hasMore);
        
        // ✅ Check if user is following this shop
        try {
          const followStatus = await checkShopFollowStatus(sid);
          if (alive) setIsFollowing(followStatus?.following === true);
        } catch {
          // Not logged in or error - ignore
        }
      } catch (e) {
        if (!alive) return;
        setErr(String(e?.response?.data?.message || e?.message || e));
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [shopId]);

  // ✅ When featured ids change, load those products
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const sid = String(shopId || "").replace(/^:/, "").trim();
        if (!sid) return;

        if (!featuredIds.length) {
          setFeaturedProducts([]);
          return;
        }

        setMallLoading(true);
        const res = await getPublicShopProducts(sid, featuredIds);
        if (!alive) return;

        const list = Array.isArray(res?.products) ? res.products : [];
        const map = new Map(list.map((p) => [String(p._id), p]));
        const ordered = featuredIds.map((id) => map.get(String(id))).filter(Boolean);

        setFeaturedProducts(ordered);
      } catch {
        if (!alive) return;
        setFeaturedProducts([]);
      } finally {
        if (alive) setMallLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopId, featuredIds.join("|")]);

  async function loadMoreFeed() {
    try {
      const sid = String(shopId || "").replace(/^:/, "").trim();
      if (!sid) return;

      setFeedLoading(true);
      const next = feedPage + 1;
      const res = await getPublicShopFeed(sid, next, 10);

      setFeed((prev) => [...prev, ...(Array.isArray(res?.items) ? res.items : [])]);
      setFeedPage(Number(res?.page || next));
      setFeedHasMore(!!res?.hasMore);
    } catch {
      // ignore
    } finally {
      setFeedLoading(false);
    }
  }

  function goBuy(productId) {
    if (!productId) return;
    nav(`/checkout/${encodeURIComponent(String(productId))}`);
  }

  // ✅ Handle Follow/Unfollow Shop
  async function handleFollowToggle() {
    const sid = String(shopId || "").replace(/^:/, "").trim();
    if (!sid || followLoading) return;

    try {
      setFollowLoading(true);
      
      if (isFollowing) {
        await unfollowShop(sid);
        setIsFollowing(false);
      } else {
        await followShop(sid);
        setIsFollowing(true);
      }
    } catch (e) {
      console.error("Follow toggle error", e);
      alert(e?.message || "Failed to update follow status");
    } finally {
      setFollowLoading(false);
    }
  }

  function goTab(nextTab) {
    const sid = String(shopId || "").replace(/^:/, "").trim();
    const t = nextTab === "feed" ? "feed" : "mall";
    // keep URL in sync
    nav(`/shop/${encodeURIComponent(sid)}?tab=${t}`, { replace: true });
  }

  if (loading) {
    return (
      <div style={{ padding: 16, color: "#fff", maxWidth: 1100, margin: "0 auto" }}>
        Loading shop...
      </div>
    );
  }

  if (err) {
    return (
      <div style={{ padding: 16, color: "#fff", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ color: "crimson", fontWeight: 800 }}>Error</div>
        <div style={{ marginTop: 8, opacity: 0.9 }}>{err}</div>
      </div>
    );
  }

  const cover = absUrl(shop?.coverImage || mall?.coverImage || "");
  const logo = absUrl(shop?.logo || "");

  const sections = Array.isArray(mall?.sections) ? mall.sections : [];
  const visibleSections = sections
    .filter((s) => s && s.enabled !== false)
    .sort((a, b) => Number(a?.sort || 0) - Number(b?.sort || 0));

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto", color: "#fff" }}>
      {/* Profile Card */}
      <div
        style={{
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(0,0,0,0.25)",
          marginBottom: 14,
        }}
      >
        {/* Cover Image */}
        {cover ? (
          <div 
            style={{ 
              height: 220, 
              background: `url(${cover}) center/cover no-repeat`,
              position: "relative",
            }} 
          />
        ) : (
          <div 
            style={{ 
              height: 160, 
              background: "linear-gradient(135deg, rgba(147,51,234,0.3), rgba(59,130,246,0.3))",
              position: "relative",
            }} 
          />
        )}

        {/* Profile Info */}
        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginTop: -40 }}>
            {/* Avatar/Logo */}
            {logo ? (
              <img
                src={logo}
                alt="logo"
                style={{ 
                  width: 100, 
                  height: 100, 
                  borderRadius: 20, 
                  objectFit: "cover",
                  border: "4px solid rgba(0,0,0,0.3)",
                  background: "rgba(0,0,0,0.5)",
                  flexShrink: 0,
                }}
              />
            ) : (
              <div 
                style={{ 
                  width: 100, 
                  height: 100, 
                  borderRadius: 20, 
                  background: "rgba(255,255,255,0.12)",
                  border: "4px solid rgba(0,0,0,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  fontWeight: 900,
                  flexShrink: 0,
                }}
              >
                {(shop?.name || "S").charAt(0).toUpperCase()}
              </div>
            )}

            <div style={{ flex: 1, minWidth: 0, marginTop: 50 }}>
              <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>
                {shop?.name || "Shop"}
              </div>
              
              {/* Industry & Category */}
              {(shop?.industry || shop?.category) && (
                <div style={{ 
                  opacity: 0.75, 
                  fontSize: 14,
                  marginBottom: 12,
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}>
                  {shop?.industry && (
                    <span style={{
                      padding: "4px 12px",
                      borderRadius: 8,
                      background: "rgba(147,51,234,0.2)",
                      border: "1px solid rgba(147,51,234,0.3)",
                      fontSize: 12,
                      fontWeight: 700,
                    }}>
                      {shop.industry}
                    </span>
                  )}
                  {shop?.category && (
                    <span style={{
                      padding: "4px 12px",
                      borderRadius: 8,
                      background: "rgba(59,130,246,0.2)",
                      border: "1px solid rgba(59,130,246,0.3)",
                      fontSize: 12,
                      fontWeight: 700,
                    }}>
                      {shop.category}
                    </span>
                  )}
                </div>
              )}

              {/* Bio */}
              {shop?.bio && (
                <div style={{ 
                  fontSize: 14,
                  lineHeight: 1.6,
                  opacity: 0.85,
                  marginBottom: 16,
                  whiteSpace: "pre-wrap",
                }}>
                  {shop.bio}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {/* Follow Button */}
                <button
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 12,
                    border: isFollowing ? "1px solid #9333ea" : "none",
                    background: isFollowing ? "rgba(147,51,234,0.15)" : "rgba(147,51,234,0.9)",
                    color: "white",
                    cursor: followLoading ? "wait" : "pointer",
                    fontWeight: 800,
                    fontSize: 14,
                    opacity: followLoading ? 0.6 : 1,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!followLoading) {
                      e.target.style.background = isFollowing ? "rgba(147,51,234,0.25)" : "rgba(147,51,234,1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = isFollowing ? "rgba(147,51,234,0.15)" : "rgba(147,51,234,0.9)";
                  }}
                >
                  {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
                </button>
                
                {/* Mall Tab */}
                <button
                  onClick={() => goTab("mall")}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: tab === "mall" ? "rgba(255,255,255,0.15)" : "transparent",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: 800,
                    fontSize: 14,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (tab !== "mall") e.target.style.background = "rgba(255,255,255,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    if (tab !== "mall") e.target.style.background = "transparent";
                  }}
                >
                  Mall
                </button>
                
                {/* Feed Tab */}
                <button
                  onClick={() => goTab("feed")}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: tab === "feed" ? "rgba(255,255,255,0.15)" : "transparent",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: 800,
                    fontSize: 14,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (tab !== "feed") e.target.style.background = "rgba(255,255,255,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    if (tab !== "feed") e.target.style.background = "transparent";
                  }}
                >
                  Feed
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ marginTop: 14 }}>
        {tab === "mall" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* ✅ Never blank: show message if mall empty */}
            {visibleSections.length === 0 ? (
              <div
                style={{
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(0,0,0,0.25)",
                  padding: 14,
                  opacity: 0.9,
                }}
              >
                This shop has not built their Mall page yet.
              </div>
            ) : null}

            {visibleSections.map((section, idx) => {
              if (section.type === "hero") {
                const heroImg = absUrl(section.heroImage || "");
                return (
                  <div
                    key={idx}
                    style={{
                      borderRadius: 16,
                      overflow: "hidden",
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(0,0,0,0.25)",
                    }}
                  >
                    {heroImg ? (
                      <div style={{ height: 240, background: `url(${heroImg}) center/cover no-repeat` }} />
                    ) : null}
                    <div style={{ padding: 14 }}>
                      <div style={{ fontSize: 20, fontWeight: 900 }}>
                        {section.heroHeadline || "Welcome"}
                      </div>
                      {section.heroSubtext ? (
                        <div style={{ opacity: 0.85, marginTop: 6 }}>{section.heroSubtext}</div>
                      ) : null}
                    </div>
                  </div>
                );
              }

              if (section.type === "featured_products") {
                return (
                  <div
                    key={idx}
                    style={{
                      borderRadius: 16,
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(0,0,0,0.25)",
                      padding: 14,
                    }}
                  >
                    <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 10 }}>
                      {section.title || "Featured Products"}
                    </div>

                    {mallLoading ? (
                      <div style={{ opacity: 0.8 }}>Loading products...</div>
                    ) : featuredProducts.length === 0 ? (
                      <div style={{ opacity: 0.75 }}>No featured products yet.</div>
                    ) : (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                          gap: 12,
                        }}
                      >
                        {featuredProducts.map((p) => (
                          <div
                            key={p._id}
                            style={{
                              borderRadius: 14,
                              overflow: "hidden",
                              border: "1px solid rgba(255,255,255,0.10)",
                              background: "rgba(255,255,255,0.04)",
                            }}
                          >
                            <div style={{ height: 170, background: "rgba(255,255,255,0.06)" }}>
                              {pickProductImage(p) ? (
                                <img
                                  src={pickProductImage(p)}
                                  alt={p.name || p.title || "product"}
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                              ) : null}
                            </div>

                            <div style={{ padding: 10 }}>
                              <div style={{ fontWeight: 900 }}>{p.name || p.title || "Product"}</div>
                              <div style={{ opacity: 0.85, marginTop: 4 }}>${money(p.price)}</div>

                              <button
                                onClick={() => goBuy(p._id)}
                                style={{
                                  marginTop: 10,
                                  width: "100%",
                                  padding: "10px 12px",
                                  borderRadius: 12,
                                  border: "1px solid rgba(255,255,255,0.12)",
                                  background: "rgba(255,255,255,0.10)",
                                  color: "white",
                                  cursor: "pointer",
                                  fontWeight: 900,
                                }}
                              >
                                Buy
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              if (section.type === "text") {
                return (
                  <div
                    key={idx}
                    style={{
                      borderRadius: 16,
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(0,0,0,0.25)",
                      padding: 14,
                    }}
                  >
                    <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>
                      {section.title || "About"}
                    </div>
                    <div style={{ opacity: 0.85, whiteSpace: "pre-wrap" }}>{section.body || ""}</div>
                  </div>
                );
              }

              return null;
            })}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* ✅ Never blank: show message if feed empty */}
            {feed.length === 0 ? (
              <div
                style={{
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(0,0,0,0.25)",
                  padding: 14,
                  opacity: 0.9,
                }}
              >
                No posts yet.
              </div>
            ) : (
              feed.map((post) => {
                const media = absUrl(post.mediaUrl || post.imageUrl || post.videoUrl || "");
                const isVideo =
                  String(media).toLowerCase().endsWith(".mp4") ||
                  String(media).toLowerCase().endsWith(".webm") ||
                  String(media).toLowerCase().includes("video");

                return (
                  <div
                    key={post._id}
                    style={{
                      borderRadius: 16,
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(0,0,0,0.25)",
                      padding: 14,
                    }}
                  >
                    <div style={{ fontWeight: 900, marginBottom: 8 }}>{post.title || "Post"}</div>
                    {post.text ? (
                      <div style={{ opacity: 0.9, whiteSpace: "pre-wrap" }}>{post.text}</div>
                    ) : null}

                    {media ? (
                      <div style={{ marginTop: 10, borderRadius: 14, overflow: "hidden" }}>
                        {isVideo ? (
                          <video src={media} controls style={{ width: "100%", maxHeight: 420 }} />
                        ) : (
                          <img
                            src={media}
                            alt="post"
                            style={{ width: "100%", maxHeight: 520, objectFit: "cover" }}
                          />
                        )}
                      </div>
                    ) : null}
                  </div>
                );
              })
            )}

            {feedHasMore ? (
              <button
                onClick={loadMoreFeed}
                disabled={feedLoading}
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.08)",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 900,
                  width: 220,
                  opacity: feedLoading ? 0.7 : 1,
                }}
              >
                {feedLoading ? "Loading..." : "Load more"}
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
