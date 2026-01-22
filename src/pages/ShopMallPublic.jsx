// ShopMallPublic.jsx (Updated to match Editor engine + Search/Cart)
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { COMPONENT_MAP, THEMES, ShopLayout } from "../components/ShopMallTheme";
import { apiGet } from "../api"; // Assuming apiGet is available for public routes?
// Actually simpler to use raw fetch for public endpoints if apiGet assumes auth, 
// BUT in user-frontend apiGet is robust. Let's use apiGet.
// Note: apiGet injects token effectively.

import { Loader2 } from "lucide-react";

// Helper to normalize props (Same logic as Editor/Preview)
function resolveProps(section, shopInfo = null) {
    if (!section) return {};
    
    // 1. Editor Structure (Priority)
    if (section.props) {
        const props = section.props;
        
        // ✅ CRITICAL: ProfileHeader should ALWAYS use live shop data
        if (section.type === 'ProfileHeader' && shopInfo) {
            return {
                ...props,
                shopName: shopInfo.shopName || shopInfo.name || props.shopName,
                bio: shopInfo.bio || props.bio,
                avatarUrl: shopInfo.logoUrl || shopInfo.logo || props.avatarUrl,
                coverUrl: shopInfo.coverImage || props.coverUrl,
            };
        }
        
        return props;
    }

    // 2. Backend Structure (Flat + Content)
    const flatProps = {
        ...section, 
        ...(section.content || {}), 
        content: section.content?.content || section.content?.value || section.content,
        title: section.title || section.content?.title,
        subtitle: section.subtitle || section.content?.subtitle,
        productIds: section.productIds || section.content?.productIds
    };
    
    // ✅ CRITICAL: ProfileHeader should ALWAYS use live shop data
    if (section.type === 'ProfileHeader' && shopInfo) {
        return {
            ...flatProps,
            shopName: shopInfo.shopName || shopInfo.name || flatProps.shopName,
            bio: shopInfo.bio || flatProps.bio,
            avatarUrl: shopInfo.logoUrl || shopInfo.logo || flatProps.avatarUrl,
            coverUrl: shopInfo.coverImage || flatProps.coverUrl,
        };
    }
    
    return flatProps;
}

export default function ShopMallPublic() {
    const { shopId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [data, setData] = useState(null);
    const [shopInfo, setShopInfo] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Feature: Search & Cart
    const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
    const [cartCount, setCartCount] = useState(0);

    // Fetch Shop Data
    useEffect(() => {
        if (!shopId) return;
        setLoading(true);
        setError(null);

        console.log(`[ShopMallPublic] Fetching mall for shopId=${shopId}`);

        apiGet(`/public/shops/${shopId}/mall`)
            .then(res => {
                console.log("[ShopMallPublic] API Response:", res);

                if (!res.ok && !res.mallPage && !res.page) {
                    throw new Error(res.message || "Failed to load shop");
                }
                
                // ✅ Normalize response - backend returns { ok, shop, page }
                const mallPage = res.page || res.mallPage || {};
                const sections = Array.isArray(mallPage.sections) ? mallPage.sections : [];
                
                // ✅ Extract theme - CRITICAL for proper styling
                const themeId = mallPage.themeId || res.themeId || 'midnight';
                const pageBg = mallPage.pageBg || res.pageBg || '';
                
                setData({ ...mallPage, sections, themeId, pageBg });
                setShopInfo(res.shop || {});
                
                console.log(`[ShopMallPublic] Theme: ${themeId}`);
                console.log(`[ShopMallPublic] Sections count: ${sections.length}`);
                console.log(`[ShopMallPublic] Shop info:`, res.shop);
                
                // Helper to dedupe products from all sources
                const prodMap = new Map();
                const collect = p => {
                    if(!p) return;
                    const id = String(p._id || p.id || p.productId || "").trim();
                    if(id && !prodMap.has(id)) prodMap.set(id, p);
                };
                
                // ✅ Check all possible product sources
                if (Array.isArray(res.products)) res.products.forEach(collect);
                if (Array.isArray(res.featuredProducts)) res.featuredProducts.forEach(collect);
                if (Array.isArray(mallPage.products)) mallPage.products.forEach(collect);
                sections.forEach(s => {
                    if (Array.isArray(s.products)) s.products.forEach(collect);
                });

                const allProducts = Array.from(prodMap.values());
                console.log(`[ShopMallPublic] Total products: ${allProducts.length}`);
                setProducts(allProducts);
            })
            .catch(err => {
                console.error("[ShopMallPublic] Mall load error:", err);
                setError(err.message);
            })
            .finally(() => setLoading(false));
    }, [shopId]);

    // Fetch Cart Count
    useEffect(() => {
        // Read cart from localStorage or API
        // In user-frontend-vite, we often check '/cart' API on mount
        async function loadCart() {
            try {
                const res = await apiGet('/cart');
                const items = Array.isArray(res) ? res : (res.items || []);
                const count = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
                setCartCount(count);
            } catch (e) {
                // Ignore auth errors or guest mode issues
            }
        }
        loadCart();
    }, []);

    /* =========================================
       DERIVED STATE
       ========================================= */
    const safeData = data || {};
    const themeId = safeData.themeId || 'midnight';
    const theme = THEMES[themeId] || THEMES.midnight;

    // Filter Logic
    const filterInd = searchParams.get('industry'); 
    const filterCat = searchParams.get('category');
    
    // Sync Search Query with URL if needed, but local is smoother. 
    // We already init from URL.
    
    const normalize = (str) => {
        if (!str) return '';
        return String(str).trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            // 1. Search Query
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const title = String(p.title || p.name || "").toLowerCase();
                if (!title.includes(q)) return false;
            }

            // 2. Industry
            if (filterInd) {
                const pInd = normalize(p.industry || p.industryLabel || p.industryName || 'Other Industries');
                if (pInd !== filterInd) return false;
            }

            // 3. Category
            if (filterCat) {
                const pCat = normalize(p.category || p.categoryLabel || p.categoryName || 'Other');
                if (pCat !== filterCat) return false;
            }
            return true;
        });
    }, [products, filterInd, filterCat, searchQuery]);

    // Sidebar Links
    const industryLinks = useMemo(() => {
        const hierarchy = {};
        products.forEach(p => {
            const rawInd = p.industry || p.industryLabel || p.industryName || "Other Industries";
            const rawCat = p.category || p.categoryLabel || p.categoryName || "Other";
            
            const ind = normalize(rawInd);
            const cat = normalize(rawCat);

            if (!hierarchy[ind]) hierarchy[ind] = new Set();
            hierarchy[ind].add(cat);
        });
        return Object.entries(hierarchy).sort().map(([ind, cats]) => ({
            label: ind,
            children: Array.from(cats).sort().map(c => ({
                label: c,
                url: `?industry=${encodeURIComponent(ind)}&category=${encodeURIComponent(c)}`
            }))
        }));
    }, [products]);

    // Section Logic
    const rawSections = Array.isArray(safeData.sections) ? safeData.sections : [];
    const visualSections = rawSections.filter(s => String(s.type).toLowerCase() !== 'navigationmenu');
    const navSection = rawSections.find(s => String(s.type).toLowerCase() === 'navigationmenu');
    
    const navProps = resolveProps(navSection, shopInfo);
    const finalNavLinks = (navProps.useManualLinks && navProps.links?.length > 0) 
        ? navProps.links 
        : industryLinks;

    // Shop Info Fallback
    const finalShopName = shopInfo?.shopName || shopInfo?.name || safeData.shopName || "Shop";

    const handleSearch = (q) => {
        setSearchQuery(q);
        if(!q) {
            searchParams.delete("q");
        } else {
            searchParams.set("q", q);
        }
        setSearchParams(searchParams, { replace: true });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-purple-500" size={32} />
                <p className="text-zinc-500">Loading Store...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4">
                <h2 className="text-xl font-bold mb-2">Shop Unavailable</h2>
                <p className="text-zinc-500 mb-6">{error}</p>
                <a href="/" className="px-4 py-2 bg-zinc-800 rounded hover:bg-zinc-700">Go Home</a>
            </div>
        );
    }

    const hasActiveFilters = !!(filterInd || filterCat || searchQuery);

    // If searching or filtering, show results grid instead of sections
    if (hasActiveFilters) {
        const profileSection = visualSections.find(s => s.type === 'ProfileHeader');
        const profileProps = profileSection ? resolveProps(profileSection, shopInfo) : { shopName: finalShopName, bio: shopInfo?.bio };
        
        // Build Title
        let viewTitle = "";
        if (searchQuery) viewTitle += `Results for "${searchQuery}"`;
        if (filterInd) viewTitle += (viewTitle ? " in " : "") + filterInd;
        if (filterCat) viewTitle += ` › ${filterCat}`;

        return (
            <ShopLayout 
                theme={theme} 
                shopName={finalShopName} 
                navLinks={finalNavLinks}
                searchQuery={searchQuery}
                onSearch={handleSearch}
                cartCount={cartCount}
            >
                 <div className="w-full min-h-[80vh] flex flex-col items-center">
                    <div className="w-full max-w-6xl">
                        {profileSection && !searchQuery && (
                             <div className="relative group">
                                <COMPONENT_MAP.ProfileHeader data={profileProps} theme={theme} />
                             </div>
                        )}
                        <div className="px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3" style={{ color: theme.text }}>
                                <span className="opacity-50 font-normal">Browsing:</span> 
                                {viewTitle}
                            </h2>
                            {filteredProducts.length > 0 ? (
                                <COMPONENT_MAP.ProductGrid data={{ products: filteredProducts, title: "" }} theme={theme} />
                            ) : (
                                <div className="text-center py-24 opacity-50" style={{ color: theme.text }}>
                                    No products found.
                                </div>
                            )}
                        </div>
                    </div>
                 </div>
            </ShopLayout>
        );
    }

    /* 
       === STANDARD HOME VIEW === 
    */
    return (
        <ShopLayout 
            theme={theme} 
            shopName={finalShopName} 
            navLinks={finalNavLinks}
            searchQuery={searchQuery}
            onSearch={handleSearch}
            cartCount={cartCount}
        >
            <div className="w-full min-h-screen pb-20 flex flex-col items-center">
                <div className="w-full max-w-6xl">
                    {visualSections.length === 0 ? (
                        /* ✅ Default mall page when shop hasn't customized yet */
                        <div className="w-full">
                            {/* Default Profile Header */}
                            <COMPONENT_MAP.ProfileHeader 
                                data={{ 
                                    shopName: finalShopName, 
                                    bio: shopInfo?.bio || "Welcome to our store",
                                    avatarUrl: shopInfo?.logoUrl || shopInfo?.logo,
                                }} 
                                theme={theme} 
                            />
                            
                            {/* Show all products in a grid */}
                            {products.length > 0 ? (
                                <div className="px-6 py-8">
                                    <h2 className="text-2xl font-bold mb-6" style={{ color: theme.text }}>
                                        Our Products
                                    </h2>
                                    <COMPONENT_MAP.ProductGrid 
                                        data={{ products: products, title: "" }} 
                                        theme={theme} 
                                    />
                                </div>
                            ) : (
                                <div className="py-20 text-center opacity-50" style={{ color: theme.text }}>
                                    <p>This shop doesn't have any products yet.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        visualSections.map((section, idx) => {
                            const Component = COMPONENT_MAP[section.type];
                            if (!Component) return null;
                            const props = resolveProps(section, shopInfo);
                            return (
                                <div key={section.id || idx} className="mb-8">
                                    <Component data={props} theme={theme} />
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </ShopLayout>
    );
}
