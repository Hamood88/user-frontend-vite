// ShopMallPublic.jsx (Updated to match Editor engine + Search/Cart)
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { COMPONENT_MAP, THEMES, ShopLayout } from "../components/ShopMallTheme";
import { apiGet } from "../api"; // Assuming apiGet is available for public routes?
// Actually simpler to use raw fetch for public endpoints if apiGet assumes auth, 
// BUT in user-frontend apiGet is robust. Let's use apiGet.
// Note: apiGet injects token effectively.

import { Loader2, Layout } from "lucide-react";

// Helper: Normalize strings for consistent comparison (Title Case)
const normalize = (str) => {
    if (!str) return '';
    return String(str).trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

// Helper to normalize props (Same logic as Editor/Preview)
function resolveProps(section) {
    if (!section) return {};
    
    // 1. Editor Structure (Priority) - use saved props exactly as they are
    if (section.props && typeof section.props === 'object') {
        return section.props;
    }

    // 2. Backend Structure (Flat + Content) - merge all fields
    // ProfileHeader needs: shopName, bio, avatarUrl, coverUrl
    // HeroBanner needs: title, subtitle, imageUrl, buttonText, buttonLink
    // ProductGrid needs: title, productIds
    // LinkList needs: links
    // RichText needs: content, align
    // NavigationMenu needs: links (or auto-generated)
    
    const base = { ...section }; // Get all root fields
    const content = section.content || {};
    
    // Merge content fields into base (content takes priority)
    return {
        ...base,
        ...content,
        // Ensure specific fields are properly mapped
        shopName: content.shopName || section.shopName || base.shopName,
        bio: content.bio || section.bio || base.bio,
        avatarUrl: content.avatarUrl || section.avatarUrl || base.avatarUrl,
        coverUrl: content.coverUrl || section.coverUrl || base.coverUrl,
        title: content.title || section.title || base.title,
        subtitle: content.subtitle || section.subtitle || base.subtitle,
        imageUrl: content.imageUrl || section.imageUrl || base.imageUrl,
        buttonText: content.buttonText || section.buttonText || base.buttonText,
        buttonLink: content.buttonLink || section.buttonLink || base.buttonLink,
        productIds: content.productIds || section.productIds || base.productIds,
        links: content.links || section.links || base.links,
        content: content.content || section.content?.value || content.value || section.value,
        align: content.align || section.align || base.align,
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

    // ✅ Redirect to mall feed if error occurs
    useEffect(() => {
        if (error) {
            // Try to find any available product from this shop
            apiGet(`/public/shops/${shopId}/products?limit=1`)
                .then(res => {
                    const products = res?.products || [];
                    if (products.length > 0) {
                        // Redirect to first available product
                        const productId = products[0]._id || products[0].id;
                        navigate(`/product/${productId}`, { replace: true });
                    } else {
                        // No products available, go to mall feed
                        navigate('/mall', { replace: true });
                    }
                })
                .catch(() => {
                    // If can't fetch products, go to mall feed
                    navigate('/mall', { replace: true });
                });
        }
    }, [error, navigate, shopId]);

    // Fetch Shop Data
    useEffect(() => {
        if (!shopId) return;
        setLoading(true);
        setError(null);

        const timestamp = Date.now();
        console.log(`[ShopMallPublic] Fetching mall for shopId=${shopId} (cache-bust: ${timestamp})`);

        // ✅ Fetch Mall Page AND All Products (for sidebar/search)
        Promise.all([
            apiGet(`/public/shops/${shopId}/mall?_t=${timestamp}`)
                .catch(err => {
                    console.error("Failed to load mall page:", err);
                    return { ok: false, message: err.message || "Mall not found" };
                }),
            apiGet(`/public/shops/${shopId}/products?limit=500`)
                .then(res => res.products || [])
                .catch(err => {
                    console.warn("Failed to load shop products:", err);
                    return [];
                })
        ])
            .then(([res, productList]) => {
                console.log("[ShopMallPublic] API Response:", res);
                console.log("[ShopMallPublic] Response structure check:", {
                    hasOk: !!res.ok,
                    hasPage: !!res.page,
                    hasMallPage: !!res.mallPage,
                    pageThemeId: res.page?.themeId,
                    pagePageBg: res.page?.pageBg
                });

                if (!res.ok && !res.mallPage && !res.page) {
                    throw new Error(res.message || "Failed to load shop");
                }
                
                // ✅ Normalize response - backend returns { ok, shop, page }
                const mallPage = res.page || res.mallPage || {};
                const sections = Array.isArray(mallPage.sections) ? mallPage.sections : [];
                
                // ✅ Extract theme with fallback chain
                const themeId = mallPage.themeId || res.themeId || 'midnight';
                const pageBg = mallPage.pageBg || res.pageBg || '';
                
                console.log("[ShopMallPublic] Extracted theme:", { themeId, pageBg });
                
                setData({ ...mallPage, sections, themeId, pageBg });
                setShopInfo(res.shop || {});
                
                // Helper to dedupe products from all sources
                const prodMap = new Map();
                const collect = p => {
                    if(!p) return;
                    const id = String(p._id || p.id || p.productId || "").trim();
                    if(id && !prodMap.has(id)) prodMap.set(id, p);
                };
                
                // ✅ 1. Add ALL products from inventory (so sidebar works)
                productList.forEach(collect);

                // ✅ 2. Add products pinned in sections
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
    
    const normalizedProducts = useMemo(() => {
        return products.map(p => ({
             ...p,
             id: p._id || p.id || p.productId,
             price: p.localPrice || p.price
        }));
    }, [products]);

    // Product Map for fast hydration
    const productMap = useMemo(() => {
        const map = {};
        normalizedProducts.forEach(p => {
            if(p.id) map[p.id] = p;
        });
        return map;
    }, [normalizedProducts]);

    const filteredProducts = useMemo(() => {
        return normalizedProducts.filter(p => {
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
    }, [normalizedProducts, filterInd, filterCat, searchQuery]);

    // Fallback products (top 8 newest) for empty grids
    const fallbackProducts = useMemo(() => {
        return normalizedProducts.slice(0, 8);
    }, [normalizedProducts]);

    // Sidebar Links
    const industryLinks = useMemo(() => {
        const hierarchy = {};
        normalizedProducts.forEach(p => {
            const rawInd = p.industry || p.industryLabel || p.industryName || "Other Industries";
            const rawCat = p.category || p.categoryLabel || p.categoryName || "Other";
            
            const ind = normalize(rawInd);
            const cat = normalize(rawCat);

            if (!hierarchy[ind]) hierarchy[ind] = new Set();
            hierarchy[ind].add(cat);
        });
        
        const generated = Object.entries(hierarchy).sort().map(([ind, cats]) => ({
            label: ind,
            children: Array.from(cats).sort().map(c => ({
                label: c,
                url: `?industry=${encodeURIComponent(ind)}&category=${encodeURIComponent(c)}`
            }))
        }));

        return generated;
    }, [products]);

    // Section Logic
    const rawSections = Array.isArray(safeData.sections) ? safeData.sections : [];
    const visualSections = rawSections.filter(s => String(s.type).toLowerCase() !== 'navigationmenu');
    const navSection = rawSections.find(s => String(s.type).toLowerCase() === 'navigationmenu');
    
    const navProps = resolveProps(navSection);
    // ✅ FORCE industryLinks to match ShopMallPreview behavior (which ignores custom nav currently)
    const finalNavLinks = industryLinks;

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
        return null; // Don't render anything, redirect happens via useEffect
    }

    const showAll = searchParams.get("showAll") === "true";
    const hasActiveFilters = !!(filterInd || filterCat || searchQuery || showAll);

    // If searching or filtering, show results grid instead of sections
    if (hasActiveFilters) {
        const profileSection = visualSections.find(s => s.type === 'ProfileHeader');
        const profileProps = profileSection ? resolveProps(profileSection) : { shopName: finalShopName, bio: shopInfo?.bio };
        
        // Build Title
        let viewTitle = "";
        if (searchQuery) viewTitle = `Results for "${searchQuery}"`;
        else if (showAll) viewTitle = "All Products";
        else {
            if (filterInd) viewTitle += filterInd;
            if (filterCat) viewTitle += ` › ${filterCat}`;
        }

        return (
            <ShopLayout 
                theme={theme} 
                shopName={finalShopName} 
                navLinks={finalNavLinks}
                shopId={shopId}
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
                                showAll ? (
                                    // ✅ Grouped View for Show All
                                    <div className="space-y-12">
                                        {industryLinks.filter(i => i.children).map((industry, iIdx) => (
                                            <div key={iIdx} className="space-y-8">
                                                <div className="border-b-2 pb-3" style={{ borderColor: theme.primary }}>
                                                    <h3 className="text-2xl font-bold" style={{ color: theme.primary }}>
                                                        {industry.label}
                                                    </h3>
                                                </div>
                                                {industry.children.map((cat, cIdx) => {
                                                    const catName = cat.label;
                                                    const catProducts = filteredProducts.filter(p => {
                                                        const pInd = normalize(p.industry || p.industryLabel || p.industryName || 'Other Industries');
                                                        const pCat = normalize(p.category || p.categoryLabel || p.categoryName || 'Other');
                                                        return pInd === industry.label && pCat === catName;
                                                    });
                                                    
                                                    if (catProducts.length === 0) return null;
                                                    
                                                    return (
                                                        <div key={cIdx} className="space-y-4">
                                                            <div 
                                                                onClick={() => navigate(cat.url)}
                                                                className="text-lg font-semibold opacity-90 cursor-pointer hover:underline decoration-2 underline-offset-4 flex items-center gap-2"
                                                                style={{ color: theme.text }}
                                                            >
                                                                {catName}
                                                                <span className="text-xs opacity-50 font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: theme.primary + '20' }}>
                                                                    {catProducts.length}
                                                                </span>
                                                            </div>
                                                            <COMPONENT_MAP.ProductGrid 
                                                                data={{ products: catProducts, title: "" }} 
                                                                theme={theme}
                                                                shopId={shopId}
                                                                themeId={themeId}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    // Standard filtered list
                                    <COMPONENT_MAP.ProductGrid data={{ products: filteredProducts, title: "" }} theme={theme} shopId={shopId} themeId={themeId} />
                                )
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
            shopId={shopId}
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
                                        shopId={shopId}
                                        themeId={themeId}
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
                            const props = resolveProps(section);
                            
                            // ✅ Hydrate ProductGrid with fallback logic (Matches ShopMallPreview behavior)
                            let componentData = props;
                            
                            // ✅ CRITICAL FIX: Hydrate ProfileHeader with actual shop data
                            if (section.type === 'ProfileHeader') {
                                componentData = {
                                    ...props,
                                    shopName: props.shopName || shopInfo?.shopName || shopInfo?.name || finalShopName,
                                    bio: props.bio || shopInfo?.bio || shopInfo?.description || "Welcome to our store",
                                    avatarUrl: props.avatarUrl || shopInfo?.logoUrl || shopInfo?.logo || shopInfo?.avatar,
                                    coverUrl: props.coverUrl || shopInfo?.coverImage || shopInfo?.cover
                                };
                            }
                            
                            if (section.type === 'ProductGrid') {
                                const rawIds = Array.isArray(props.productIds) ? props.productIds : [];
                                const ids = rawIds.map(id => String(id || "").trim()).filter(Boolean);
                                
                                // Try to find selected products in our full inventory map
                                const selectedProducts = ids
                                    .map(id => productMap[id])
                                    .filter(Boolean);

                                // If user picked products, show them. 
                                // If NO products picked (empty grid in editor), fall back to "Newest 8" (fallbackProducts)
                                const productsForGrid = selectedProducts.length > 0 
                                    ? selectedProducts 
                                    : fallbackProducts;

                                componentData = {
                                    ...props,
                                    productIds: ids,
                                    products: productsForGrid
                                };
                            }

                            return (
                                <div key={section.id || idx} className="mb-8">
                                    <Component 
                                        data={componentData} 
                                        theme={theme}
                                        shopId={shopId}
                                        themeId={themeId}
                                    />
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </ShopLayout>
    );
}
