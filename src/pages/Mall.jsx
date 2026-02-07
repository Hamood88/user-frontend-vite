import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE, getMallFeed } from "../api";
import ForYouFeed from "../components/ForYouFeed";
import RecentlyViewed from "../components/RecentlyViewed";
import "../styles/Engagement.css";

/* =========================
   Helpers
   ========================= */
function normalizeBase(u) {
  const s = String(u || "").trim();
  if (!s) return "https://moondala-backend.onrender.com";
  return s.endsWith("/") ? s.slice(0, -1) : s;
}

function absUrl(u) {
  const raw = String(u || "").trim();
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;

  const base = normalizeBase(API_BASE);
  if (raw.startsWith("/")) return `${base}${raw}`;
  return `${base}/${raw}`;
}

function toNum(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function hasAnyFilter(f) {
  if (!f) return false;
  if ((f.q || "").trim()) return true;
  if ((f.industryId || "").trim()) return true;
  if ((f.categoryId || "").trim()) return true;
  if ((f.country || "").trim()) return true;
  if ((f.gender || "").trim()) return true;
  if ((f.favoriteSport || "").trim()) return true;
  if (Array.isArray(f.interests) && f.interests.length > 0) return true;

  if (toNum(f.minAge) !== null) return true;
  if (toNum(f.maxAge) !== null) return true;
  if (toNum(f.minPrice) !== null) return true;
  if (toNum(f.maxPrice) !== null) return true;

  if ((f.sort || "").trim() && f.sort !== "relevance") return true;
  return false;
}

// ✅ token helper
function getUserToken() {
  return (
    localStorage.getItem("userToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    ""
  );
}

/* =========================
   Custom Select
   ========================= */
function CustomSelect({
  label,
  value,
  onChange,
  placeholder = "Select...",
  options = [],
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  const currentLabel = useMemo(() => {
    const hit = options.find((o) => String(o.value) === String(value));
    return hit ? hit.label : "";
  }, [options, value]);

  useEffect(() => {
    function onDoc(e) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div style={S.sbGroup} ref={boxRef}>
      {label ? <label style={S.label}>{label}</label> : null}

      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        style={{
          ...S.selectBtn,
          opacity: disabled ? 0.55 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        <span style={S.selectText}>{currentLabel || placeholder}</span>
        <span style={S.chev}>{open ? "▲" : "▼"}</span>
      </button>

      {open && !disabled ? (
        <div style={S.menu}>
          <button
            type="button"
            style={S.menuItem}
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
          >
            {placeholder}
          </button>

          {options.map((o) => (
            <button
              type="button"
              key={String(o.value)}
              style={{
                ...S.menuItem,
                ...(String(o.value) === String(value) ? S.menuItemActive : null),
              }}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function Mall() {
  const nav = useNavigate();

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [editTargetingOpen, setEditTargetingOpen] = useState(false);

  // ===== Targeting Preferences (saved to localStorage) =====
  const [targeting, setTargeting] = useState(() => {
    try {
      const saved = localStorage.getItem("mall_targeting_preferences");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return {
      industryId: "",
      categoryId: "",
      country: "",
      favoriteSport: "",
      interests: [],
      minPrice: "",
      maxPrice: "",
      sort: "relevance",
    };
  });

  // Save targeting to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("mall_targeting_preferences", JSON.stringify(targeting));
    } catch {}
  }, [targeting]);

  // close drawer on resize
  useEffect(() => {
    function onResize() {
      setFiltersOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [isFallback, setIsFallback] = useState(false); // ✅ Track if results are recommendations

  // ===== Sidebar data =====
  const COUNTRIES = useMemo(
    () => [
      "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan",
      "Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi",
      "Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica","Cote d'Ivoire","Croatia","Cuba","Cyprus","Czechia",
      "Denmark","Djibouti","Dominica","Dominican Republic",
      "Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia",
      "Fiji","Finland","France",
      "Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana",
      "Haiti","Honduras","Hungary",
      "Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy",
      "Jamaica","Japan","Jordan",
      "Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan",
      "Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuanian","Luxembourg",
      "Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar",
      "Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway",
      "Oman",
      "Pakistan","Palau","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar",
      "Romania","Russia","Rwanda",
      "Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria",
      "Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu",
      "Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan",
      "Vanuatu","Vatican City","Venezuela","Vietnam",
      "Yemen",
      "Zambia","Zimbabwe",
    ],
    []
  );

  const sports = useMemo(
    () => [
      "Soccer","Basketball","American Football","Baseball","Tennis","Cricket","Rugby","Hockey","Volleyball","Boxing","MMA","Golf","Swimming","Running","Cycling","Wrestling","Formula 1",
    ],
    []
  );

  const interestOptions = useMemo(
    () => ["Tech", "Fashion", "Fitness", "Gaming", "Food", "Travel", "Beauty", "Cars"],
    []
  );

  const [industries, setIndustries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [targetingCategories, setTargetingCategories] = useState([]);
  const [industryLoading, setIndustryLoading] = useState(false);
  const [industryError, setIndustryError] = useState("");

  const [filters, setFilters] = useState({
    q: "",
    industryId: "",
    categoryId: "",
    country: "",
    gender: "",
    minAge: "",
    maxAge: "",
    favoriteSport: "",
    interests: [],
    minPrice: "",
    maxPrice: "",
    sort: "relevance",
  });

  // ===== Load industries =====
  useEffect(() => {
    (async () => {
      setIndustryError("");
      setIndustryLoading(true);
      try {
        const res = await fetch(`${normalizeBase(API_BASE)}/api/public/industries`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok || data?.ok === false) {
          throw new Error(data?.message || "Failed to load industries");
        }

        const list = Array.isArray(data?.industries) ? data.industries : [];
        setIndustries(list);
      } catch (e) {
        console.error("Load industries failed:", e);
        setIndustryError(e?.message || "Failed to load industries");
        setIndustries([]);
      } finally {
        setIndustryLoading(false);
      }
    })();
  }, []);

  // when industry changes in FILTERS => update filter categories + clear invalid category
  useEffect(() => {
    const ind = industries.find((x) => String(x?.industryId) === String(filters.industryId));
    const cats = Array.isArray(ind?.categories) ? ind.categories : [];
    setCategories(cats);

    setFilters((prev) => {
      const stillValid = cats.some((c) => String(c?.categoryId) === String(prev.categoryId));
      return stillValid ? prev : { ...prev, categoryId: "" };
    });
  }, [filters.industryId, industries]);

  // when industry changes in TARGETING => update targeting categories + clear invalid category
  useEffect(() => {
    const ind = industries.find((x) => String(x?.industryId) === String(targeting.industryId));
    const cats = Array.isArray(ind?.categories) ? ind.categories : [];
    setTargetingCategories(cats);

    setTargeting((prev) => {
      const stillValid = cats.some((c) => String(c?.categoryId) === String(prev.categoryId));
      return stillValid ? prev : { ...prev, categoryId: "" };
    });
  }, [targeting.industryId, industries]);

  const toggleInterest = (interest) => {
    setFilters((prev) => {
      const exists = prev.interests.includes(interest);
      return {
        ...prev,
        interests: exists ? prev.interests.filter((x) => x !== interest) : [...prev.interests, interest],
      };
    });
  };

  const toggleTargetingInterest = (interest) => {
    setTargeting((prev) => {
      const exists = prev.interests.includes(interest);
      return {
        ...prev,
        interests: exists ? prev.interests.filter((x) => x !== interest) : [...prev.interests, interest],
      };
    });
  };

  const applyTargetingAsFilters = () => {
    setFilters((prev) => ({
      ...prev,
      q: "",
      industryId: targeting.industryId,
      categoryId: targeting.categoryId,
      country: targeting.country,
      favoriteSport: targeting.favoriteSport,
      interests: [...targeting.interests],
      minPrice: targeting.minPrice,
      maxPrice: targeting.maxPrice,
      sort: targeting.sort,
    }));
    setEditTargetingOpen(false);
  };

  const resetFilters = () => {
    setFilters({
      q: "",
      industryId: "",
      categoryId: "",
      country: "",
      gender: "",
      minAge: "",
      maxAge: "",
      favoriteSport: "",
      interests: [],
      minPrice: "",
      maxPrice: "",
      sort: "relevance",
    });
  };

  function buildSearchUrl() {
    const p = new URLSearchParams();

    const q = (filters.q || "").trim();
    if (q) p.set("q", q);

    if (filters.industryId) p.set("industryId", filters.industryId);
    if (filters.categoryId) p.set("categoryId", filters.categoryId);

    if (filters.country) p.set("country", filters.country);
    if (filters.gender) p.set("gender", filters.gender);

    const minAge = toNum(filters.minAge);
    const maxAge = toNum(filters.maxAge);
    if (minAge !== null) p.set("minAge", String(minAge));
    if (maxAge !== null) p.set("maxAge", String(maxAge));

    if (filters.favoriteSport) p.set("favoriteSport", filters.favoriteSport);

    if (Array.isArray(filters.interests) && filters.interests.length > 0) {
      p.set("interests", filters.interests.join(","));
    }

    const minPrice = toNum(filters.minPrice);
    const maxPrice = toNum(filters.maxPrice);
    if (minPrice !== null) p.set("minPrice", String(minPrice));
    if (maxPrice !== null) p.set("maxPrice", String(maxPrice));

    if (filters.sort) p.set("sort", filters.sort);

    p.set("limit", "30");

    const base = normalizeBase(API_BASE);
    const apiRoot = base.endsWith("/api") ? base : `${base}/api`;
    return `${apiRoot}/mall/search?${p.toString()}`;
  }

  const loadMall = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // ✅ Default personalized feed when no filters
      if (!hasAnyFilter(filters)) {
        // If user is logged in, we let the <ForYouFeed> component handle the main view
        // so we don't need to double-fetch distinct "mall feed" here.
        if (getUserToken()) {
          setProducts([]);
          setLoading(false);
          return;
        }

        const list = await getMallFeed(30);
        setProducts(Array.isArray(list) ? list : []);
        return;
      }

      // ✅ Search mode - AUTH REQUIRED
      const url = buildSearchUrl();
      const token = getUserToken();

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.message || "Search failed");
      }

      const list = Array.isArray(data?.products) ? data.products : Array.isArray(data) ? data : [];
      setProducts(list);
      setIsFallback(!!data.isFallback); // ✅ Capture fallback flag
    } catch (err) {
      setError(err?.message || "Failed to load mall");
      setProducts([]);
      setIsFallback(false);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadMall();
  }, [loadMall]);

  // ✅ OPTIONS
  const industryOptions = useMemo(
    () => (industries || []).map((i) => ({ value: i.industryId, label: i.name })),
    [industries]
  );

  const categoryOptions = useMemo(
    () => (categories || []).map((c) => ({ value: c.categoryId, label: c.label })),
    [categories]
  );

  const targetingCategoryOptions = useMemo(
    () => (targetingCategories || []).map((c) => ({ value: c.categoryId, label: c.label })),
    [targetingCategories]
  );

  const countryOptions = useMemo(() => COUNTRIES.map((c) => ({ value: c, label: c })), [COUNTRIES]);

  const genderOptions = useMemo(
    () => [
      { value: "male", label: "Male" },
      { value: "female", label: "Female" },
      { value: "other", label: "Other" },
    ],
    []
  );

  const sportOptions = useMemo(() => sports.map((s) => ({ value: s, label: s })), [sports]);

  const sortOptions = useMemo(
    () => [
      { value: "relevance", label: "Relevance" },
      { value: "newest", label: "Newest" },
      { value: "price_asc", label: "Price: low → high" },
      { value: "price_desc", label: "Price: high → low" },
      { value: "popular", label: "Popular" },
    ],
    []
  );

  /* =========================
     ✅ TOUCH OPEN SIDEBAR
     - Swipe from RIGHT EDGE to open
     - Swipe right to close (or tap overlay)
     ========================= */
  useEffect(() => {
    let startX = null;
    let startY = null;
    let tracking = false;

    function onTouchStart(e) {
      const t = e.touches?.[0];
      if (!t) return;

      startX = t.clientX;
      startY = t.clientY;

      // ✅ start tracking only if user starts near right edge
      // (so normal scrolling doesn't open sidebar)
      const edge = window.innerWidth - 24; // 24px edge zone
      tracking = startX >= edge;
    }

    function onTouchMove(e) {
      if (!tracking) return;
      const t = e.touches?.[0];
      if (!t) return;

      const dx = t.clientX - startX;
      const dy = t.clientY - startY;

      // ignore mostly-vertical moves
      if (Math.abs(dy) > 30 && Math.abs(dy) > Math.abs(dx)) return;

      // swipe left from right edge -> open
      if (dx < -40) {
        setFiltersOpen(true);
        tracking = false;
      }
    }

    function onTouchEnd() {
      tracking = false;
      startX = null;
      startY = null;
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const SidebarContent = (
    <>
      <div style={S.sbTitle}>Search</div>
      <div style={S.sbSub}>Filter products (does not change your profile)</div>

      {industryError ? <div style={S.sbWarn}>{industryError}</div> : null}

      <div style={S.sbGroup}>
        <label style={S.label}>Keyword</label>
        <input
          value={filters.q}
          onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
          placeholder="Search title / description"
          style={S.input}
        />
      </div>

      <CustomSelect
        label="Industry"
        value={filters.industryId}
        disabled={industryLoading}
        placeholder={industryLoading ? "Loading industries..." : "Any industry"}
        options={industryOptions}
        onChange={(val) =>
          setFilters((p) => ({
            ...p,
            industryId: val,
            categoryId: "",
          }))
        }
      />

      <CustomSelect
        label="Category"
        value={filters.categoryId}
        disabled={!filters.industryId}
        placeholder={!filters.industryId ? "Pick industry first" : "Any category"}
        options={categoryOptions}
        onChange={(val) => setFilters((p) => ({ ...p, categoryId: val }))}
      />

      <div style={S.row2}>
        <CustomSelect
          label="Country"
          value={filters.country}
          placeholder="Any"
          options={countryOptions}
          onChange={(val) => setFilters((p) => ({ ...p, country: val }))}
        />

        <CustomSelect
          label="Gender"
          value={filters.gender}
          placeholder="Any"
          options={genderOptions}
          onChange={(val) => setFilters((p) => ({ ...p, gender: val }))}
        />
      </div>

      <div style={S.row2}>
        <div style={S.sbGroup}>
          <label style={S.label}>Min age</label>
          <input
            value={filters.minAge}
            onChange={(e) => setFilters((p) => ({ ...p, minAge: e.target.value }))}
            placeholder="e.g. 18"
            style={S.input}
          />
        </div>
        <div style={S.sbGroup}>
          <label style={S.label}>Max age</label>
          <input
            value={filters.maxAge}
            onChange={(e) => setFilters((p) => ({ ...p, maxAge: e.target.value }))}
            placeholder="e.g. 45"
            style={S.input}
          />
        </div>
      </div>

      <CustomSelect
        label="Favorite sport"
        value={filters.favoriteSport}
        placeholder="Any"
        options={sportOptions}
        onChange={(val) => setFilters((p) => ({ ...p, favoriteSport: val }))}
      />

      <div style={S.sbGroup}>
        <label style={S.label}>Interests</label>
        <div style={S.chips}>
          {interestOptions.map((opt) => {
            const active = filters.interests.includes(opt);
            return (
              <button
                type="button"
                key={opt}
                onClick={() => toggleInterest(opt)}
                style={active ? S.chipOn : S.chip}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      <div style={S.row2}>
        <div style={S.sbGroup}>
          <label style={S.label}>Min price</label>
          <input
            value={filters.minPrice}
            onChange={(e) => setFilters((p) => ({ ...p, minPrice: e.target.value }))}
            placeholder="0"
            style={S.input}
          />
        </div>
        <div style={S.sbGroup}>
          <label style={S.label}>Max price</label>
          <input
            value={filters.maxPrice}
            onChange={(e) => setFilters((p) => ({ ...p, maxPrice: e.target.value }))}
            placeholder="999"
            style={S.input}
          />
        </div>
      </div>

      <CustomSelect
        label="Sort"
        value={filters.sort}
        placeholder="Relevance"
        options={sortOptions}
        onChange={(val) => setFilters((p) => ({ ...p, sort: val }))}
      />

      <div style={S.sbBtns}>
        <button
          type="button"
          onClick={async () => {
            await loadMall();
            setFiltersOpen(false);
          }}
          disabled={loading}
          style={S.sbPrimary}
        >
          {loading ? "Searching..." : "Search"}
        </button>

        <button
          type="button"
          onClick={() => {
            resetFilters();
            setTimeout(() => loadMall(), 0);
            setFiltersOpen(false);
          }}
          disabled={loading}
          style={S.sbGhost}
        >
          Reset
        </button>
      </div>

      <div style={S.sbHint}>Tip: Leave filters empty to use your default personalized mall.</div>
    </>
  );

  return (
    <div style={S.page}>
      <div style={S.topbar}>
        <div>
          <div style={S.h1}>Mall</div>
          <div style={S.sub}>
            {hasAnyFilter(filters) ? "Search results" : "Products matched to your profile"}
          </div>
        </div>

        <div style={S.topBtns}>
          <button type="button" style={S.topBtn} onClick={() => setFiltersOpen(true)}>
            Search / Filters
            {hasAnyFilter(filters) ? <span style={S.dot} /> : null}
          </button>

          <button type="button" style={S.topBtn} onClick={() => setEditTargetingOpen(true)} title="Edit your targeting preferences">
            ⚙️ Target
          </button>

          <button type="button" style={S.topBtnGhost} onClick={loadMall} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* ✅ Drawer */}
      {filtersOpen ? (
        <div style={S.drawerOverlay} onClick={() => setFiltersOpen(false)}>
          <div style={S.drawer} onClick={(e) => e.stopPropagation()}>
            <div style={S.drawerTop}>
              <div style={S.drawerTitle}>Search / Filters</div>
              <button type="button" style={S.drawerClose} onClick={() => setFiltersOpen(false)}>
                ✕
              </button>
            </div>

            <aside style={S.sidebar}>{SidebarContent}</aside>

            <div style={{ marginTop: 10, opacity: 0.65, fontSize: 12, fontWeight: 800 }}>
              Touch tip: swipe from the right edge to open this panel.
            </div>
          </div>
        </div>
      ) : null}

      {/* ✅ Edit Targeting Modal */}
      {editTargetingOpen ? (
        <div style={S.drawerOverlay} onClick={() => setEditTargetingOpen(false)}>
          <div style={S.drawer} onClick={(e) => e.stopPropagation()}>
            <div style={S.drawerTop}>
              <div style={S.drawerTitle}>Edit Your Targeting Preferences</div>
              <button type="button" style={S.drawerClose} onClick={() => setEditTargetingOpen(false)}>
                ✕
              </button>
            </div>

            <aside style={S.sidebar}>
              <div style={S.sbTitle}>Targeting Preferences</div>
              <div style={S.sbSub}>Update your profile targeting to get better product recommendations</div>

              {industryError ? <div style={S.sbWarn}>{industryError}</div> : null}

              <CustomSelect
                label="Industry"
                value={targeting.industryId}
                disabled={industryLoading}
                placeholder={industryLoading ? "Loading industries..." : "Any industry"}
                options={industryOptions}
                onChange={(val) =>
                  setTargeting((p) => ({
                    ...p,
                    industryId: val,
                    categoryId: "",
                  }))
                }
              />

              <CustomSelect
                label="Category"
                value={targeting.categoryId}
                disabled={!targeting.industryId}
                placeholder={!targeting.industryId ? "Pick industry first" : "Any category"}
                options={targetingCategoryOptions}
                onChange={(val) => setTargeting((p) => ({ ...p, categoryId: val }))}
              />

              <div style={S.row2}>
                <CustomSelect
                  label="Country"
                  value={targeting.country}
                  placeholder="Any"
                  options={countryOptions}
                  onChange={(val) => setTargeting((p) => ({ ...p, country: val }))}
                />

                <CustomSelect
                  label="Favorite sport"
                  value={targeting.favoriteSport}
                  placeholder="Any"
                  options={sportOptions}
                  onChange={(val) => setTargeting((p) => ({ ...p, favoriteSport: val }))}
                />
              </div>

              <div style={S.sbGroup}>
                <label style={S.label}>Interests</label>
                <div style={S.chips}>
                  {interestOptions.map((opt) => {
                    const active = targeting.interests.includes(opt);
                    return (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => toggleTargetingInterest(opt)}
                        style={active ? S.chipOn : S.chip}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={S.row2}>
                <div style={S.sbGroup}>
                  <label style={S.label}>Min price</label>
                  <input
                    value={targeting.minPrice}
                    onChange={(e) => setTargeting((p) => ({ ...p, minPrice: e.target.value }))}
                    placeholder="0"
                    style={S.input}
                  />
                </div>
                <div style={S.sbGroup}>
                  <label style={S.label}>Max price</label>
                  <input
                    value={targeting.maxPrice}
                    onChange={(e) => setTargeting((p) => ({ ...p, maxPrice: e.target.value }))}
                    placeholder="999"
                    style={S.input}
                  />
                </div>
              </div>

              <CustomSelect
                label="Default sort"
                value={targeting.sort}
                placeholder="Relevance"
                options={sortOptions}
                onChange={(val) => setTargeting((p) => ({ ...p, sort: val }))}
              />

              <div style={S.sbBtns}>
                <button
                  type="button"
                  onClick={applyTargetingAsFilters}
                  style={S.sbPrimary}
                >
                  Apply & Search
                </button>

                <button
                  type="button"
                  onClick={() => setEditTargetingOpen(false)}
                  style={S.sbGhost}
                >
                  Close
                </button>
              </div>

              <div style={S.sbHint}>Note: Age and gender are set in your profile and cannot be changed here. These preferences will be saved to your browser.</div>
            </aside>
          </div>
        </div>
      ) : null}

      <div style={S.surface}>
        {/* ✅ 1. AI For You Feed (Main View for Logged In) */}
        {!hasAnyFilter(filters) && getUserToken() && (
          <div style={{ marginBottom: 24 }}>
            <ForYouFeed limit={24} showHeader={true} showRefresh={true} layout="grid" />
          </div>
        )}

        {/* ✅ 2. Recently Viewed (Below AI Feed) */}
        {getUserToken() && (
          <div style={{ marginBottom: 24 }}>
            <RecentlyViewed limit={8} showClear={true} />
          </div>
        )}

        {/* ✅ 3. Main Grid (Search Results OR Guest General Feed) */}
        {error && <div style={S.err}>{error}</div>}

        {/* AI FALLBACK MESSAGE */}
        {isFallback && !loading && (
          <div style={{
            background: "rgba(139, 92, 246, 0.15)",
            border: "1px solid rgba(139, 92, 246, 0.3)",
            borderRadius: 16,
            padding: "16px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 16
          }}>
            <span style={{ fontSize: 24 }}>🤖</span>
            <div>
              <div style={{ fontWeight: 800, color: "#fff", fontSize: 16, marginBottom: 2 }}>No exact matches found.</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
                Our AI found these similar items you might like instead!
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div style={S.note}>Loading products…</div>
        ) : products.length === 0 ? (
          hasAnyFilter(filters) ? (
             <div style={S.note}>No products found for your search.</div>
          ) : getUserToken() ? (
             /* Logged in user with no search results -> handled by ForYouFeed, nothing to show here */
             null
          ) : (
             <div style={S.note}>No products match your profile yet.</div>
          )
        ) : (
          <div style={S.grid}>
            {products.map((p) => {
              const firstImage = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : "";
              const img = firstImage ? absUrl(firstImage) : "";
              const shopId = p?.shopId || p?.shop?._id || p?.shop;
              const shopName = p?.shopName || p?.shop?.shopName || "";

              return (
                <div key={p._id} style={S.card}>
                  {/* Clickable product image */}
                  <div
                    style={{ ...S.imgWrap, cursor: "pointer" }}
                    onClick={() => nav(`/product/${encodeURIComponent(p._id)}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && nav(`/product/${encodeURIComponent(p._id)}`)}
                  >
                    {img ? <img src={img} alt="" style={S.img} /> : <div style={S.noImg}>No image</div>}
                  </div>

                  <div style={S.body}>
                    <div 
                      style={S.title} 
                      onClick={() => nav(`/product/${encodeURIComponent(p._id)}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && nav(`/product/${encodeURIComponent(p._id)}`)}
                    >
                      {p.title || "Untitled"}
                    </div>

                    {/* Store name - clickable to shop feed */}
                    {shopName && shopId && (
                      <div
                        style={S.storeName}
                        onClick={(e) => {
                          e.stopPropagation();
                          nav(`/shop/${encodeURIComponent(shopId)}/mall`);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && nav(`/shop/${encodeURIComponent(shopId)}/mall`)}
                      >
                        {shopName}
                      </div>
                    )}

                    <div style={S.meta}>{p.category || p.categoryLabel || ""}</div>

                    <div style={S.priceRow}>
                      <span style={S.price}>
                        {(p.currency || "USD").toUpperCase()} {Number(p.localPrice ?? p.price ?? 0).toFixed(2)}
                      </span>

                      <span style={p.inStock ? S.badgeGreen : S.badgeRed}>
                        {p.inStock ? "In stock" : "Out"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const S = {
  page: { padding: 0, margin: 0, color: "#fff" },

  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
    padding: 14,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(15,23,42,0.55)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
  },

  topBtns: { display: "flex", gap: 10, alignItems: "center" },

  topBtn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(59,130,246,0.35)",
    background: "rgba(59,130,246,0.18)",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    whiteSpace: "nowrap",
  },

  dot: { width: 8, height: 8, borderRadius: 999, background: "rgba(34,197,94,0.95)", display: "inline-block" },

  topBtnGhost: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  h1: { fontSize: 24, fontWeight: 900 },
  sub: { opacity: 0.78, marginTop: 4, fontSize: 12 },

  drawerOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    zIndex: 9999,
    display: "flex",
    justifyContent: "flex-end",
  },

  drawer: {
    width: "92%",
    maxWidth: 420,
    height: "100%",
    background: "linear-gradient(180deg, rgba(15,23,42,0.98), rgba(7,11,22,0.98))",
    borderLeft: "1px solid rgba(255,255,255,0.10)",
    padding: 14,
    overflowY: "auto",
  },

  drawerTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  drawerTitle: { fontWeight: 900, fontSize: 16 },

  drawerClose: {
    width: 36,
    height: 36,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },

  sidebar: {
    borderRadius: 18,
    padding: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(15,23,42,0.55)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
  },

  sbTitle: { fontSize: 16, fontWeight: 900 },
  sbSub: { opacity: 0.75, fontSize: 12, marginTop: 4, marginBottom: 10 },

  sbWarn: {
    background: "rgba(245,158,11,0.14)",
    border: "1px solid rgba(245,158,11,0.35)",
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
    fontWeight: 800,
    fontSize: 12,
  },

  sbGroup: { display: "grid", gap: 6, marginBottom: 10 },
  label: { fontSize: 12, opacity: 0.8, fontWeight: 800 },

  input: {
    padding: 10,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    outline: "none",
  },

  selectBtn: {
    width: "100%",
    textAlign: "left",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    outline: "none",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },

  selectText: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  chev: { fontSize: 11, opacity: 0.85 },

  menu: {
    marginTop: 6,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(6,10,20,0.98)",
    boxShadow: "0 18px 60px rgba(0,0,0,0.55)",
    overflow: "hidden",
    maxHeight: 260,
    overflowY: "auto",
  },

  menuItem: {
    width: "100%",
    textAlign: "left",
    padding: "10px 12px",
    border: "none",
    background: "transparent",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 13,
  },

  menuItemActive: { background: "rgba(59,130,246,0.18)" },

  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },

  chips: { display: "flex", flexWrap: "wrap", gap: 8 },

  chip: {
    padding: "7px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    fontWeight: 900,
    fontSize: 12,
    cursor: "pointer",
  },

  chipOn: {
    padding: "7px 10px",
    borderRadius: 999,
    border: "1px solid rgba(59,130,246,0.40)",
    background: "rgba(59,130,246,0.18)",
    color: "#fff",
    fontWeight: 900,
    fontSize: 12,
    cursor: "pointer",
  },

  sbBtns: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 },

  sbPrimary: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(59,130,246,0.35)",
    background: "rgba(59,130,246,0.18)",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },

  sbGhost: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },

  sbHint: { marginTop: 10, opacity: 0.7, fontSize: 12, fontWeight: 800 },

  surface: {
    borderRadius: 18,
    padding: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(15,23,42,0.55)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
  },

  err: {
    background: "rgba(239,68,68,0.18)",
    border: "1px solid rgba(239,68,68,0.35)",
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
    fontWeight: 800,
  },

  note: {
    marginTop: 12,
    padding: 12,
    borderRadius: 16,
    border: "1px dashed rgba(255,255,255,0.18)",
    opacity: 0.9,
    fontWeight: 800,
  },

  grid: {
    marginTop: 4,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: 12,
  },

  card: {
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.05)",
    overflow: "hidden",
  },

  imgWrap: {
    position: "relative",
    overflow: "hidden",
    transition: "opacity 0.2s ease",
  },

  img: { width: "100%", height: 170, objectFit: "cover", display: "block", background: "#000" },

  noImg: {
    height: 170,
    display: "grid",
    placeItems: "center",
    opacity: 0.75,
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },

  body: { padding: 12 },

  title: { 
    fontWeight: 900, 
    fontSize: 14, 
    cursor: "pointer",
    transition: "color 0.2s ease",
  },
  
  storeName: {
    fontSize: 12,
    fontWeight: 800,
    color: "rgba(147, 197, 253, 0.95)",
    marginTop: 4,
    cursor: "pointer",
    transition: "color 0.2s ease",
  },

  meta: { opacity: 0.75, marginTop: 4, fontSize: 12 },

  priceRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 },

  price: { fontWeight: 900, fontSize: 12 },

  badgeGreen: {
    padding: "4px 8px",
    borderRadius: 999,
    border: "1px solid rgba(34,197,94,0.35)",
    background: "rgba(34,197,94,0.14)",
    fontWeight: 900,
    fontSize: 11,
  },

  badgeRed: {
    padding: "4px 8px",
    borderRadius: 999,
    border: "1px solid rgba(239,68,68,0.35)",
    background: "rgba(239,68,68,0.14)",
    fontWeight: 900,
    fontSize: 11,
  },

  openBtn: {
    width: "100%",
    marginTop: 12,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(59,130,246,0.35)",
    background: "rgba(59,130,246,0.18)",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },
};
