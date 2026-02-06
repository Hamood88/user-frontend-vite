import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Search, Settings, Loader2 } from "lucide-react";
import { toAbsUrl, apiPut, apiGet, getToken } from "../api.jsx";
import RecentlyViewed from "../components/RecentlyViewed.jsx";
import ForYouFeed from "../components/ForYouFeed.jsx";
import "../styles/Engagement.css";

export default function Mall() {
  const navigate = useNavigate();
  
  // AI Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [exactMatches, setExactMatches] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [products, setProducts] = useState([]); // Keep for feed
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [aiPowered, setAiPowered] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Sidebar offset for fixed bottom bar (avoid covering sidebar)
  const [sidebarOffset, setSidebarOffset] = useState(0);

  useEffect(() => {
    const calcOffset = () => {
      try {
        if (window.innerWidth < 768) return 0;
        const collapsed = localStorage.getItem("sidebarCollapsed") === "true";
        return collapsed ? 80 : 260;
      } catch {
        return 0;
      }
    };

    const update = () => setSidebarOffset(calcOffset());
    update();

    window.addEventListener("resize", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("storage", update);
    };
  }, []);
  
  // Targeting state
  const [showTargeting, setShowTargeting] = useState(false);
  const [savingTargeting, setSavingTargeting] = useState(false);
  const [targeting, setTargeting] = useState({
    favoriteSport: "",
    country: "",
    interests: []
  });

  // Load personalized feed on mount
  useEffect(() => {
    loadPersonalizedFeed();
    loadUserTargeting();
  }, []);

  async function loadPersonalizedFeed() {
    setLoading(true);
    setError("");
    try {
      // Use mall feed endpoint for personalized feed
      const response = await apiGet("/mall/feed?limit=30");
      const items = response?.items || response?.products || [];
      setProducts(items);
      setAiPowered(false);
    } catch (err) {
      setError(err?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  async function loadUserTargeting() {
    try {
      const user = await apiGet("/users/me");
      if (user) {
        setTargeting({
          favoriteSport: user.favoriteSport || "",
          country: user.country || "",
          interests: user.interests || []
        });
      }
    } catch (err) {
      console.error("Failed to load targeting:", err);
    }
  }

  async function handleSearch(e) {
    e?.preventDefault();
    const query = searchQuery.trim();
    
    if (!query) {
      setHasSearched(false);
      setExactMatches([]);
      setSuggestions([]);
      loadPersonalizedFeed();
      return;
    }

    setSearching(true);
    setError("");
    setHasSearched(true);
    try {
      // Fetch exact matches (STRICT threshold) and suggestions (moderate threshold)
      const [exactResult, suggestResult] = await Promise.all([
        apiGet(`/mall/ai-search?${new URLSearchParams({ q: query, limit: "10", minScore: "0.60" }).toString()}`),
        apiGet(`/mall/ai-search?${new URLSearchParams({ q: query, limit: "20", minScore: "0.45" }).toString()}`)
      ]);
      
      const exact = exactResult?.products || [];
      const all = suggestResult?.products || [];
      
      // Filter suggestions to exclude exact matches
      const exactIds = new Set(exact.map(p => p._id));
      const suggest = all.filter(p => !exactIds.has(p._id));
      
      setExactMatches(exact);
      setSuggestions(suggest);
      setAiPowered(exactResult?.aiPowered || suggestResult?.aiPowered || false);
    } catch (err) {
      setError(err?.message || "Search failed");
      setExactMatches([]);
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  }

  async function saveTargeting() {
    setSavingTargeting(true);
    try {
      await apiPut("/users/me", {
        favoriteSport: targeting.favoriteSport,
        country: targeting.country,
        interests: targeting.interests
      });
      setShowTargeting(false);
      // Reload feed with new targeting
      loadPersonalizedFeed();
    } catch (err) {
      alert("Failed to update targeting: " + err.message);
    } finally {
      setSavingTargeting(false);
    }
  }

  function toggleInterest(interest) {
    setTargeting(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  }

  const interestOptions = ["Tech", "Fashion", "Sports", "Gaming", "Music", "Food", "Travel", "Art"];
  const sportOptions = ["Football", "Basketball", "Soccer", "Tennis", "Baseball", "Swimming", "Running"];
  const countryOptions = ["US", "UK", "Canada", "Australia", "Germany", "France", "Japan"];

  return (
    <div style={S.page}>
      <div style={S.container}>
        {/* AI Search Section */}
        <div style={S.searchCard}>
        <div style={S.searchHeader}>
          <Sparkles className="w-6 h-6" style={{ color: "#fbbf24" }} />
          <div>
            <div style={S.searchTitle}>AI Product Search</div>
            <div style={S.searchSub}>Find products by describing what you want</div>
          </div>
        </div>

        <form onSubmit={handleSearch} style={S.searchForm}>
          <div style={S.searchInputWrapper}>
            <Search className="w-5 h-5" style={S.searchIcon} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Try: 'comfortable running shoes' or 'gift for mom'..."
              style={S.searchInput}
            />
          </div>
          <button type="submit" disabled={searching} style={S.searchBtn}>
            {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
          </button>
        </form>

        {aiPowered && (
          <div style={S.aiBadge}>
            <Sparkles className="w-4 h-4" />
            <span>AI-powered semantic search active</span>
          </div>
        )}
      </div>

        {/* Loading State */}
        {loading && (
          <div style={S.loading}>
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "hsl(var(--primary))" }} />
            <div style={{ marginTop: 16 }}>Loading products...</div>
          </div>
        )}

        {/* Error State */}
        {error && <div style={S.error}>{error}</div>}

        {/* Exact Matches Section */}
        {hasSearched && exactMatches.length > 0 && (
          <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: "hsl(var(--foreground))" }}>Exact Matches</h2>
            <span style={{
              padding: "6px 14px",
              background: "rgba(34, 197, 94, 0.2)",
              color: "#22c55e",
              fontSize: 14,
              fontWeight: 600,
              borderRadius: 20
            }}>
              {exactMatches.length} {exactMatches.length === 1 ? 'product' : 'products'}
            </span>
          </div>
          <div style={S.grid}>
            {exactMatches.map((product) => (
              <ProductCard key={product._id} product={product} navigate={navigate} />
            ))}
          </div>
          </div>
        )}

        {/* You May Also Like Section */}
        {hasSearched && suggestions.length > 0 && (
          <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: "hsl(var(--muted-foreground))" }}>You May Also Like</h2>
            <span style={{
              padding: "6px 14px",
              background: "rgba(168, 85, 247, 0.2)",
              color: "#a855f7",
              fontSize: 14,
              fontWeight: 600,
              borderRadius: 20
            }}>
              {suggestions.length} {suggestions.length === 1 ? 'product' : 'products'}
            </span>
          </div>
          <div style={S.grid}>
            {suggestions.map((product) => (
              <ProductCard key={product._id} product={product} navigate={navigate} />
            ))}
          </div>
          </div>
        )}

        {/* No Results */}
        {hasSearched && exactMatches.length === 0 && suggestions.length === 0 && !searching && !loading && (
          <div style={S.empty}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>No products found for "{searchQuery}"</div>
            <div style={{ opacity: 0.7, marginTop: 8 }}>Try different keywords or browse our personalized feed</div>
          </div>
        )}

        {/* Personalized Feed (when not searching) */}
        {!hasSearched && !loading && !error && (
          <>
            {/* For You - AI Recommendations */}
            {getToken() && (
              <div style={{ marginBottom: 40 }}>
                <ForYouFeed limit={24} showHeader={true} showRefresh={true} layout="grid" />
              </div>
            )}

            {/* Recently Viewed Products */}
            {getToken() && (
              <div style={{ marginBottom: 40 }}>
                <RecentlyViewed limit={8} showClear={true} />
              </div>
            )}

            {/* General Products Grid (Only for guests OR if logged-in user has specific feed needs) */}
            {/* If logged in, we rely on <ForYouFeed> as the main view to avoid clutter/duplication. */}
            {!getToken() && products.length > 0 && (
              <div style={S.grid}>
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} navigate={navigate} />
                ))}
              </div>
            )}
            
            {/* Empty state for GUESTS only */}
            {!getToken() && products.length === 0 && (
              <div style={S.empty}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🛍️</div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>No specific recommendations yet</div>
                <div style={{ opacity: 0.7, marginTop: 8 }}>Search for products to get started!</div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Targeting Controls - Fixed at bottom */}
      <div
        style={{
          ...S.targetingContainer,
          left: sidebarOffset,
          width: `calc(100% - ${sidebarOffset}px)`,
        }}
      >
        <button
          onClick={() => setShowTargeting(!showTargeting)}
          style={S.targetingToggle}
        >
          <Settings className="w-5 h-5" />
          <span>Update Targeting Preferences</span>
        </button>

        {showTargeting && (
          <div style={S.targetingPanel}>
            <div style={S.targetingTitle}>Personalization Settings</div>
            <div style={S.targetingSub}>Help us show you better products</div>

            {/* Favorite Sport */}
            <div style={S.formGroup}>
              <label style={S.label}>Favorite Sport</label>
              <select
                value={targeting.favoriteSport}
                onChange={(e) => setTargeting({ ...targeting, favoriteSport: e.target.value })}
                style={S.select}
              >
                <option value="">Select...</option>
                {sportOptions.map(sport => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
            </div>

            {/* Country */}
            <div style={S.formGroup}>
              <label style={S.label}>Country</label>
              <select
                value={targeting.country}
                onChange={(e) => setTargeting({ ...targeting, country: e.target.value })}
                style={S.select}
              >
                <option value="">Select...</option>
                {countryOptions.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            {/* Interests */}
            <div style={S.formGroup}>
              <label style={S.label}>Interests</label>
              <div style={S.chipsContainer}>
                {interestOptions.map((interest) => {
                  const active = targeting.interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      style={active ? S.chipActive : S.chip}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={S.targetingActions}>
              <button
                onClick={() => setShowTargeting(false)}
                style={S.btnCancel}
              >
                Cancel
              </button>
              <button
                onClick={saveTargeting}
                disabled={savingTargeting}
                style={S.btnSave}
              >
                {savingTargeting ? "Saving..." : "Save & Refresh Feed"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ProductCard Component
function ProductCard({ product, navigate }) {
  const pid = product._id || product.id;
  const mainImage = Array.isArray(product.images) ? product.images[0] : product.image;
  
  return (
    <div
      style={S.productCard}
      onClick={() => navigate(`/product/${pid}`)}
    >
      {product.searchScore && product.searchScore > 0.5 && (
        <div style={S.matchBadge}>{Math.round(product.searchScore * 100)}%</div>
      )}
      
      <div style={S.productImage}>
        <img
          src={toAbsUrl(mainImage)}
          alt={product.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f3f4f6' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af'%3E📦%3C/text%3E%3C/svg%3E";
          }}
        />
      </div>
      
      <div style={S.productInfo}>
        <div style={S.productTitle}>{product.title}</div>
        <div style={S.productPrice}>${(product.localPrice || 0).toFixed(2)}</div>
        {product.ai?.tags && product.ai.tags.length > 0 && (
          <div style={S.tags}>
            {product.ai.tags.slice(0, 3).map((tag, i) => (
              <span key={i} style={S.tag}>{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const S = {
  page: {
    background: "hsl(var(--background))",
    color: "hsl(var(--foreground))",
    minHeight: "100vh"
  },
  container: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "24px 18px 120px"
  },
  searchCard: {
    background: "hsl(var(--card))",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
    border: "1px solid hsl(var(--border))"
  },
  searchHeader: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 20
  },
  searchTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "hsl(var(--card-foreground))"
  },
  searchSub: {
    fontSize: 14,
    opacity: 0.8,
    marginTop: 4,
    color: "hsl(var(--muted-foreground))"
  },
  searchForm: {
    display: "flex",
    gap: 12,
    alignItems: "center"
  },
  searchInputWrapper: {
    flex: 1,
    position: "relative"
  },
  searchIcon: {
    position: "absolute",
    left: 16,
    top: "50%",
    transform: "translateY(-50%)",
    color: "hsl(var(--muted-foreground))"
  },
  searchInput: {
    width: "100%",
    padding: "14px 14px 14px 48px",
    background: "hsl(var(--input))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 12,
    color: "hsl(var(--foreground))",
    fontSize: 15,
    outline: "none"
  },
  searchBtn: {
    padding: "14px 24px",
    background: "hsl(var(--primary))",
    color: "hsl(var(--primary-foreground))",
    border: "none",
    borderRadius: 12,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8
  },
  aiBadge: {
    marginTop: 16,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 16px",
    background: "hsl(var(--muted))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 20,
    fontSize: 13,
    color: "hsl(var(--primary))"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 16
  },
  sectionBlock: {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16
  },
  productCard: {
    background: "hsl(var(--card))",
    borderRadius: 12,
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.2s",
    border: "1px solid hsl(var(--border))",
    position: "relative"
  },
  matchBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    background: "hsl(var(--primary))",
    color: "hsl(var(--primary-foreground))",
    padding: "4px 8px",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    zIndex: 1
  },
  productImage: {
    width: "100%",
    height: 200,
    background: "hsl(var(--muted))"
  },
  productInfo: {
    padding: 12
  },
  productTitle: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 8,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "hsl(var(--card-foreground))"
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 700,
    color: "hsl(var(--primary))",
    marginBottom: 8
  },
  tags: {
    display: "flex",
    gap: 4,
    flexWrap: "wrap"
  },
  tag: {
    fontSize: 11,
    padding: "2px 6px",
    background: "hsl(var(--muted))",
    borderRadius: 4,
    color: "hsl(var(--muted-foreground))"
  },
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
    color: "hsl(var(--muted-foreground))"
  },
  error: {
    padding: 20,
    background: "hsl(var(--destructive) / 0.1)",
    border: "1px solid hsl(var(--destructive) / 0.3)",
    borderRadius: 12,
    color: "hsl(var(--destructive))",
    textAlign: "center"
  },
  empty: {
    textAlign: "center",
    padding: 60,
    color: "hsl(var(--muted-foreground))"
  },
  targetingContainer: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    background: "hsl(var(--background))",
    borderTop: "1px solid hsl(var(--border))",
    padding: 16,
    zIndex: 100
  },
  targetingToggle: {
    width: "100%",
    maxWidth: 600,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: "14px 24px",
    background: "hsl(var(--muted))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 12,
    color: "hsl(var(--primary))",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s"
  },
  targetingPanel: {
    maxWidth: 600,
    margin: "16px auto 0",
    padding: 24,
    background: "hsl(var(--card))",
    borderRadius: 12,
    border: "1px solid hsl(var(--border))"
  },
  targetingTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 4,
    color: "hsl(var(--card-foreground))"
  },
  targetingSub: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 20,
    color: "hsl(var(--muted-foreground))"
  },
  formGroup: {
    marginBottom: 20
  },
  label: {
    display: "block",
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 8,
    color: "hsl(var(--muted-foreground))"
  },
  select: {
    width: "100%",
    padding: "12px 16px",
    background: "hsl(var(--input))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 8,
    color: "hsl(var(--foreground))",
    fontSize: 15,
    outline: "none"
  },
  chipsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8
  },
  chip: {
    padding: "8px 16px",
    background: "hsl(var(--muted))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 20,
    color: "hsl(var(--muted-foreground))",
    fontSize: 14,
    cursor: "pointer",
    transition: "all 0.2s"
  },
  chipActive: {
    padding: "8px 16px",
    background: "hsl(var(--primary))",
    border: "1px solid hsl(var(--primary))",
    borderRadius: 20,
    color: "hsl(var(--primary-foreground))",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer"
  },
  targetingActions: {
    display: "flex",
    gap: 12,
    marginTop: 24
  },
  btnCancel: {
    flex: 1,
    padding: "12px 24px",
    background: "hsl(var(--muted))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 8,
    color: "hsl(var(--foreground))",
    fontWeight: 600,
    cursor: "pointer"
  },
  btnSave: {
    flex: 1,
    padding: "12px 24px",
    background: "hsl(var(--primary))",
    border: "none",
    borderRadius: 8,
    color: "hsl(var(--primary-foreground))",
    fontWeight: 600,
    cursor: "pointer"
  }
};
