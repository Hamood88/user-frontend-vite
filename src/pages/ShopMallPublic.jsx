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
function resolveProps(section) {
    if (!section) return {};
    
    // 1. Editor Structure (Priority)
    if (section.props) return section.props; 

    // 2. Backend Structure (Flat + Content)
    return {
        ...section, 
        ...(section.content || {}), 
        content: section.content?.content || section.content?.value || section.content,
        title: section.title || section.content?.title,
        subtitle: section.subtitle || section.content?.subtitle,
        productIds: section.productIds || section.content?.productIds
    };
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

        apiGet(`/public/shops/${shopId}/mall`)
            .then(res => {
                if (!res.ok && !res.mallPage) {
                    throw new Error(res.message || "Failed to load shop");
                }
                
                // Normalize response
                const mallPage = res.mallPage || res.page || {};
                const sections = Array.isArray(mallPage.sections) ? mallPage.sections : [];
                setData({ ...mallPage, sections });
                setShopInfo(res.shop || {});
                
                // Helper to dedupe products from all sources
                const prodMap = new Map();
                const collect = p => {
                    if(!p) return;
                    const id = String(p._id || p.id || p.productId || "").trim();
                    if(id && !prodMap.has(id)) prodMap.set(id, p);
                };
                
                if (Array.isArray(res.products)) res.products.forEach(collect);
                if (Array.isArray(res.featuredProducts)) res.featuredProducts.forEach(collect);
                sections.forEach(s => {
                    if (Array.isArray(s.products)) s.products.forEach(collect);
                });

                setProducts(Array.from(prodMap.values()));
            })
            .catch(err => {
                console.error("Mall load error:", err);
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
    
    const navProps = resolveProps(navSection);
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
        const profileProps = profileSection ? resolveProps(profileSection) : { shopName: finalShopName, bio: shopInfo?.bio };
        
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
                        <div className="py-20 text-center opacity-50">
                            <p>This shop hasn't set up their page yet.</p>
                        </div>
                    ) : (
                        visualSections.map((section, idx) => {
                            const Component = COMPONENT_MAP[section.type];
                            if (!Component) return null;
                            const props = resolveProps(section);
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
