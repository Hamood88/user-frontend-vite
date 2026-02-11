import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; 
import { toAbsUrl } from "../api"; // Adjusted path
import { useUserMallCart } from "../context/UserMallCartContext";
import { 
    Layout, 
    ShoppingBag, 
    Instagram, 
    Link as LinkIcon,
    Menu,
    X,
    Search,
    ChevronDown,
    ChevronRight
} from "lucide-react";

/* 
   THEME PRIMITIVES
*/

// Dummy Categories
const MOCK_CATS = ["All", "New Arrivals", "Best Sellers", "Sale", "Accessories"];

// --- HELPER ISOLATED COMPONENT FOR NAV ITEM ---
function SidebarNavItem({ item, theme }) {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = item.children && item.children.length > 0;
    const navigate = useNavigate();

    const handleLinkClick = (e, url) => {
        if (url && url.startsWith('?')) {
            e.preventDefault();
            // User frontend uses query params too, so this works
            navigate({ search: url });
        }
    };

    if (hasChildren) {
        return (
            <div className="flex flex-col">
                <button 
                   onClick={() => setIsOpen(!isOpen)}
                   className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-black/5 w-full text-left transition-colors"
                   style={{ color: theme.text }}
                >
                     <span className="font-semibold text-[0.95rem]">{item.label}</span>
                     {isOpen ? <ChevronDown size={14} className="opacity-70"/> : <ChevronRight size={14} className="opacity-70"/>}
                </button>
                {isOpen && (
                    <div className="pl-3 space-y-1 mt-1 border-l-2 ml-3" style={{ borderColor: theme.border }}>
                        {item.children.map((child, idx) => (
                            <Link 
                                key={idx} 
                                to={child.url}
                                className="block px-3 py-1.5 rounded-md text-sm hover:bg-black/5 opacity-80 hover:opacity-100 transition-opacity"
                                style={{ color: theme.text }}
                            >
                                {child.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    }
    
    // Single Link
    return (
        <a 
            href={item.url}
            onClick={(e) => handleLinkClick(e, item.url)}
            className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-black/5 transition-colors" 
            style={{ color: theme.text }}
        >
            <span style={{ fontSize: '0.95rem' }}>{item.label}</span>
        </a>
    );
}

// --- TOP NAV ITEM ---
function TopNavItem({ item, theme }) {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = item.children && item.children.length > 0;
    const dropdownRef = React.useRef(null);
    const navigate = useNavigate();

    // Close on click outside
    React.useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (hasChildren) {
        return (
            <div className="relative" ref={dropdownRef}>
                <button 
                   onClick={() => setIsOpen(!isOpen)}
                   className="flex items-center gap-1 text-sm font-bold cursor-pointer hover:opacity-80 transition-opacity"
                   style={{ color: theme.text }}
                >
                     {item.label}
                     <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isOpen && (
                    <div 
                        className="absolute top-full left-0 mt-2 w-56 rounded-xl shadow-xl border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2"
                        style={{ 
                            backgroundColor: theme.card || theme.bg, 
                            borderColor: theme.border 
                        }}
                    >
                        <div className="py-1">
                            {item.children.map((child, idx) => (
                                <Link 
                                    key={idx} 
                                    to={child.url}
                                    onClick={() => setIsOpen(false)}
                                    className="block px-4 py-2.5 text-sm hover:bg-black/5 transition-colors"
                                    style={{ color: theme.text }}
                                >
                                    {child.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }
    
    // Single Link
    const Icon = item.icon;
    return (
        <a 
            href={item.url} 
            className="flex items-center gap-2 text-sm font-bold cursor-pointer hover:opacity-70 transition-opacity py-1" 
            style={{ color: theme.text }}
        >
            {Icon && <Icon size={18} />}
            {item.label}
        </a>
    );
}

export function ShopLayout({ 
    theme, 
    children, 
    shopName = "My Shop", 
    isMobile = false, 
    navLinks,
    shopId,
    searchQuery = "",
    onSearch
}) {
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [localSearch, setLocalSearch] = useState(searchQuery);
    const isSide = theme.navStyle === 'side';
    const navigate = useNavigate();
    
    // Get mall cart count
    const { itemCount, openCart } = useUserMallCart();

    // Debounce search
    const handleSearchChange = (e) => {
        setLocalSearch(e.target.value);
        if (onSearch) onSearch(e.target.value);
    };

    // Parse links
    const linksToRender = (navLinks && navLinks.length > 0) 
        ? navLinks 
        : MOCK_CATS.map(c => ({ label: c, url: '#' }));

    // Shared Search Input Component
    const SearchInput = () => (
        <div className="relative group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" style={{color: theme.text}} />
            <input 
                type="text"
                placeholder="Search..."
                value={localSearch}
                onChange={handleSearchChange}
                className="pl-9 pr-4 py-2 rounded-full text-sm outline-none border transition-all focus:ring-2 focus:ring-opacity-50"
                style={{
                    backgroundColor: theme.bg, 
                    color: theme.text,
                    borderColor: theme.border,
                    '--tw-ring-color': theme.primary
                }}
            />
        </div>
    );

    // Shared Cart Button Component
    const CartButton = () => (
        <button 
            onClick={openCart}
            className="relative p-2 rounded-full hover:bg-black/5 transition-colors" 
            style={{color: theme.text}}
        >
            <ShoppingBag size={20} />
            {itemCount > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{backgroundColor: theme.primary, color: theme.onPrimary}}>
                    {itemCount > 9 ? '9+' : itemCount}
                </span>
            )}
        </button>
    );

    // --- SIDE NAVIGATION LAYOUT ---
    if (isSide) {
        const containerLayout = isMobile ? 'flex-col' : 'flex-col md:flex-row';
        const headerDisplay = isMobile ? 'flex' : 'flex md:hidden';
        const sidebarPosition = isMobile ? 'fixed' : 'fixed md:sticky';
        const sidebarTransform = isMenuOpen 
            ? 'translate-x-0' 
            : (isMobile ? '-translate-x-full' : '-translate-x-full md:translate-x-0');

        return (
            <div className={`min-h-screen flex ${containerLayout} transition-colors duration-300 font-sans`} style={{ backgroundColor: theme.bg }}>
                {/* Mobile Header */}
                <div className={`${headerDisplay} p-4 items-center justify-between border-b z-40 relative`} style={{ borderColor: theme.border, backgroundColor: theme.bg }}>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setMenuOpen(!isMenuOpen)} style={{ color: theme.text }}>
                            {isMenuOpen ? <X /> : <Menu />}
                        </button>
                        <span className="font-bold text-lg" style={{ color: theme.text }}>{shopName.slice(0,12)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CartButton />
                    </div>
                </div>

                {/* Sidebar */}
                <div className={`
                    ${sidebarPosition} top-0 left-0 h-screen w-64 z-50 transform transition-transform duration-300 border-r overflow-y-auto
                    ${sidebarTransform}
                `} 
                style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                    <div className="p-6 flex flex-col min-h-full">
                        <h2 className={`text-2xl font-bold mb-6 ${isMobile ? 'hidden' : 'hidden md:block'}`} style={{ color: theme.primary }}>{shopName}</h2>
                        <div className={`absolute top-4 right-4 ${isMobile ? 'block' : 'md:hidden'}`}>
                             <button onClick={() => setMenuOpen(false)} style={{ color: theme.text }}><X size={20}/></button>
                        </div>
                        
                        {/* Search in Sidebar */}
                        <div className="mb-6">
                            <SearchInput />
                        </div>

                        {/* Nav Links */}
                        <nav className="flex-1 space-y-2">
                            {/* Show All Link (Explicit, Matches Shop Preview) */}
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (onSearch) onSearch('');
                                    navigate({ search: '?showAll=true' });
                                }}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-black/10 transition-colors font-semibold border-b pb-3 mb-2 w-full text-left" 
                                style={{ color: theme.primary, borderColor: theme.border }}
                            >
                                <Layout size={16} />
                                <span>Show All Products</span>
                            </button>

                            {linksToRender.map((link, i) => (
                                <SidebarNavItem key={i} item={link} theme={theme} />
                            ))}
                        </nav>
                        
                        {/* Footer */}
                        <div className="pt-6 mt-6 border-t font-semibold text-sm" style={{ borderColor: theme.border }}>
                           <Link
                                to={shopId ? `/shop/${encodeURIComponent(shopId)}/feed` : "/shop"}
                                className="flex items-center gap-2 hover:opacity-80 mb-4"
                                style={{color: theme.text}}
                            >
                                <ArrowLeft size={16} /> Exit Store
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 w-full md:max-w-[calc(100%-16rem)] overflow-y-auto min-h-screen relative">
                    {/* Desktop Cart Float */}
                    {!isMobile && (
                        <div className="absolute top-4 right-6 z-30">
                            <div className="bg-black/10 backdrop-blur-sm p-1 rounded-full border border-white/10 shadow-sm" style={{borderColor: theme.border}}>
                                <CartButton />
                            </div>
                        </div>
                    )}
                    {children}
                    {isMenuOpen && <div className={`fixed inset-0 bg-black/50 z-40 ${isMobile ? 'block' : 'md:hidden'}`} onClick={() => setMenuOpen(false)} />}
                </div>
            </div>
        );
    }

    // --- TOP NAVIGATION LAYOUT ---
    const hamClass = isMobile ? '' : 'md:hidden';
    const navClass = isMobile ? 'hidden' : 'hidden md:flex';

    return (
        <div className="min-h-screen flex flex-col transition-colors duration-300 font-sans" style={{ backgroundColor: theme.bg }}>
            {/* Top Bar */}
            <div className="sticky top-0 z-50 border-b backdrop-blur-md bg-opacity-90 transition-colors duration-300" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                         <button className={hamClass} onClick={() => setMenuOpen(!isMenuOpen)} style={{ color: theme.text }}><Menu size={20}/></button>
                         <h1 className="font-extrabold text-xl tracking-tight" style={{ color: theme.primary }}>{shopName}</h1>
                         
                         <nav className={`${navClass} items-center gap-6 ml-4`}>
                            {linksToRender.slice(0, 6).map((link, i) => (
                                <TopNavItem key={i} item={link} theme={theme} />
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:block">
                            <SearchInput />
                        </div>
                        <CartButton />
                        <Link
                            to={shopId ? `/shop/${encodeURIComponent(shopId)}/feed` : "/shop"}
                            className="text-sm font-semibold hover:opacity-80 hidden md:block"
                            style={{color: theme.text}}
                        >
                            Exit
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mobile Drawer */}
             <div className={`
                fixed inset-y-0 left-0 w-64 z-[60] transform transition-transform duration-300 border-r
                ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                ${isMobile ? 'block' : 'md:hidden'}
            `} 
            style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                <div className="p-6 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-8">
                        <span className="font-bold text-lg" style={{ color: theme.primary }}>Menu</span>
                        <button onClick={() => setMenuOpen(false)} style={{ color: theme.text }}><X size={20}/></button>
                    </div>
                    
                    <div className="mb-6 md:hidden">
                        <SearchInput />
                    </div>

                    <nav className="flex-1 space-y-2">
                        {linksToRender.map((link, i) => (
                            <SidebarNavItem key={i} item={link} theme={theme} />
                        ))}
                    </nav>
                    
                     <div className="pt-6 mt-6 border-t font-semibold text-sm" style={{ borderColor: theme.border }}>
                         <Link
                            to={shopId ? `/shop/${encodeURIComponent(shopId)}/feed` : "/shop"}
                            className="flex items-center gap-2 hover:opacity-80"
                            style={{color: theme.text}}
                         >
                                <ArrowLeft size={16} /> Exit Store
                         </Link>
                     </div>
                </div>
            </div>
            {isMenuOpen && <div className={`fixed inset-0 bg-black/50 z-[55] ${isMobile ? 'block' : 'md:hidden'}`} onClick={() => setMenuOpen(false)} />}

            {/* Content */}
            <div className="flex-1 w-full">
                {children}
            </div>
        </div>
    );
}

// Helpers
import { ArrowLeft } from "lucide-react";

// --- 1. PROFILE HEADER ---
export function ProfileHeader({ data, theme }) {
    const coverUrl = data.coverUrl || data.coverImage || data.cover || "";
    const avatarUrl = data.avatarUrl || data.avatar || data.logo || "";
    const name = data.shopName || data.name || "My Shop";
    const bio = data.bio || data.description || "";
    
    return (
        <div className="relative w-full">
            {/* cover */}
            <div className="w-full h-48 sm:h-56 bg-cover bg-center relative" style={{
                backgroundImage: coverUrl ? `url(${toAbsUrl(coverUrl)})` : undefined,
                backgroundColor: coverUrl ? undefined : theme.primary + "20"
            }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
            </div>
            
            {/* avatar + info */}
            <div className="relative px-6 pb-6 -mt-16 flex items-end gap-4">
                {avatarUrl ? (
                    <img src={toAbsUrl(avatarUrl)} alt={name} className="w-24 h-24 rounded-2xl object-cover border-4 shadow-xl" style={{borderColor: theme.bg}}/>
                ) : (
                    <div className="w-24 h-24 rounded-2xl border-4 flex items-center justify-center text-3xl font-bold shadow-xl" style={{borderColor: theme.bg, background: theme.primary, color: "#fff"}}>
                        {name.charAt(0).toUpperCase()}
                    </div>
                )}
                <div className="pb-1">
                    <h1 className="text-xl font-bold" style={{color: theme.text}}>{name}</h1>
                    {bio && <p className="text-sm mt-1 max-w-md" style={{color: theme.muted}}>{bio}</p>}
                </div>
            </div>
        </div>
    );
}

// --- 2. HERO BANNER ---
export function HeroBanner({ data, theme }) {
    const imageUrl = data.imageUrl || data.image || data.backgroundImage || "";
    const title = data.title || data.heading || "";
    const subtitle = data.subtitle || data.subheading || "";
    const btnText = data.buttonText || "";
    const btnLink = data.buttonLink || "#";
    
    return (
        <div className="relative w-full overflow-hidden" style={{minHeight: 280}}>
            {imageUrl ? (
                <img src={toAbsUrl(imageUrl)} alt={title} className="absolute inset-0 w-full h-full object-cover"/>
            ) : (
                <div className="absolute inset-0" style={{background: `linear-gradient(135deg, ${theme.primary}30, ${theme.accent || theme.primary}15)`}}/>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"/>
            <div className="relative z-10 flex flex-col justify-center px-8 py-16 min-h-[280px]">
                {title && <h2 className="text-3xl sm:text-4xl font-bold text-white max-w-lg leading-tight">{title}</h2>}
                {subtitle && <p className="text-base text-white/80 mt-3 max-w-md">{subtitle}</p>}
                {btnText && (
                    <a href={btnLink} className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg" style={{background: theme.primary, color: "#fff"}}>
                        {btnText}
                        <span>→</span>
                    </a>
                )}
            </div>
        </div>
    );
}

// --- 3. PRODUCT GRID ---
export function ProductGrid({ data, theme, shopId, themeId }) {
    const title = data.title || "";
    const products = Array.isArray(data.products) ? data.products : [];
    
    return (
        <div className="px-4 sm:px-6 py-8">
            {title && (
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold" style={{color: theme.text}}>{title}</h2>
                    {products.length > 4 && <span className="text-xs font-medium" style={{color: theme.primary}}>View All →</span>}
                </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {products.length > 0 ? products.map((product, i) => {
                    const img = product.image || product.imageUrl || product.images?.[0] || "";
                    const pName = product.title || product.name || "Product";
                    const price = product.price ?? product.salePrice ?? "";
                    const originalPrice = product.originalPrice || product.compareAtPrice || "";
                    const onSale = originalPrice && Number(originalPrice) > Number(price);
                    const discount = onSale ? Math.round((1 - Number(price) / Number(originalPrice)) * 100) : 0;
                    const productId = product._id || product.id;
                    
                    const productUrl = shopId 
                        ? `/shop-mall/${encodeURIComponent(shopId)}/product/${encodeURIComponent(productId)}?theme=${themeId || theme.id}` 
                        : `/product/${productId}`;
                    
                    return (
                        <Link key={productId || i} to={productUrl} className="group rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer block" style={{background: theme.card, borderColor: theme.border, textDecoration: 'none'}}>
                            <div className="relative aspect-square overflow-hidden bg-zinc-100">
                                {img ? (
                                    <img src={toAbsUrl(img)} alt={pName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center" style={{background: theme.primary + "10"}}>
                                        <ShoppingBag size={28} style={{color: theme.muted}}/>
                                    </div>
                                )}
                                {onSale && (
                                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-bold text-white" style={{background: "#ef4444"}}>-{discount}%</span>
                                )}
                            </div>
                            <div className="p-3">
                                <h3 className="text-sm font-medium truncate" style={{color: theme.text}}>{pName}</h3>
                                <div className="flex items-center gap-2 mt-1.5">
                                    {price !== "" && <span className="text-sm font-bold" style={{color: onSale ? "#ef4444" : theme.primary}}>${Number(price).toFixed(2)}</span>}
                                    {onSale && <span className="text-xs line-through" style={{color: theme.muted}}>${Number(originalPrice).toFixed(2)}</span>}
                                </div>
                            </div>
                        </Link>
                    );
                }) : (
                    Array.from({length: 4}).map((_, i) => (
                        <div key={`ph-${i}`} className="rounded-xl overflow-hidden border" style={{background: theme.card, borderColor: theme.border}}>
                            <div className="aspect-square flex items-center justify-center" style={{background: "#ffffff08"}}>
                                <ShoppingBag size={24} style={{color: theme.border}}/>
                            </div>
                            <div className="p-3 space-y-2">
                                <div className="h-3 rounded-full w-3/4" style={{background: theme.border}}/>
                                <div className="h-3 rounded-full w-1/3" style={{background: theme.border}}/>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// --- 4. LINK LIST ---
export function LinkList({ data, theme }) {
    const title = data.title || "";
    const links = Array.isArray(data.links) ? data.links : [];
    
    return (
        <div className="px-6 py-8 max-w-md mx-auto">
            {title && <h2 className="text-lg font-bold text-center mb-5" style={{color: theme.text}}>{title}</h2>}
            <div className="space-y-3">
                {links.map((link, i) => {
                    const handleMouseEnter = (e) => {
                        e.currentTarget.style.borderColor = theme.primary;
                        e.currentTarget.style.background = theme.primary + "10";
                    };
                    const handleMouseLeave = (e) => {
                        e.currentTarget.style.borderColor = theme.border;
                        e.currentTarget.style.background = theme.card;
                    };
                    return (
                        <a key={i} href={link.url || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-5 py-3.5 rounded-xl border text-sm font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-md" style={{background: theme.card, borderColor: theme.border, color: theme.text}} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                            <span>{link.label || link.title || link.url}</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color: theme.muted}}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        </a>
                    );
                })}
                {links.length === 0 && (
                    <div className="text-center py-8 text-sm rounded-xl border-2 border-dashed" style={{color: theme.muted, borderColor: theme.border}}>No links added yet</div>
                )}
            </div>
        </div>
    );
}

// --- 5. RICH TEXT ---
export function RichText({ data, theme }) {
    const content = data.content || data.text || data.body || "";
    const align = data.textAlign || data.align || "left";
    
    return (
        <div className="px-6 py-8 prose prose-sm max-w-none" style={{color: theme.text, textAlign: align}}>
            {content.includes("<") ? (
                <div dangerouslySetInnerHTML={{__html: content}}/>
            ) : (
                <p style={{color: theme.text, whiteSpace: "pre-wrap"}}>{content}</p>
            )}
        </div>
    );
}

// --- 6. ANNOUNCEMENT BAR ---
export function AnnouncementBar({ data, theme }) {
    const text = data.text || data.content || data.announcement || data.title || "📢 Special Announcement";
    const link = data.link || data.url || data.buttonLink || "";
    const barStyle = data.barStyle || data.style || "primary";
    
    // Debug announcement data
    console.log('📢 User Announcement data:', { text, link, barStyle, rawData: data });
    
    const barStyles = {
        primary: { bg: theme.primary, color: "#ffffff" },
        warning: { bg: "#f59e0b", color: "#1c1917" },
        info: { bg: "#3b82f6", color: "#ffffff" },
        subtle: { bg: theme.card, color: theme.text },
    };
    
    const s = barStyles[barStyle] || barStyles.primary;
    
    const content = (
        <div className="w-full px-4 mb-6">
            <div 
                className="w-full p-4 rounded-xl text-center font-bold text-lg transition-all hover:brightness-110"
                style={{ backgroundColor: s.bg, color: s.color }}
            >
                {text}
                {link && (
                    <span className="ml-2">→</span>
                )}
            </div>
        </div>
    );
    
    return link ? (
        <a 
            href={link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block hover:opacity-90 transition-opacity"
        >
            {content}
        </a>
    ) : (
        content
    );
}

// --- 7. SALE BANNER ---
export function SaleBanner({ data, theme }) {
    const { title = "🔥 Big Sale!", subtitle = "Limited time offer", buttonText = "Shop Now", buttonLink } = data;
    return (
        <div className="w-full px-4 mb-6">
            <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden shadow-lg group" style={{background: `linear-gradient(135deg, ${theme.primary}20 0%, ${theme.primary}40 100%)`}}>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{color: theme.text}}>{title}</h2>
                    {subtitle && <p className="text-lg mb-4 opacity-80" style={{color: theme.text}}>{subtitle}</p>}
                    {buttonText && (
                        <a href={buttonLink || '#'} className="px-8 py-3 rounded-full font-semibold transition-all hover:brightness-110 active:scale-95" style={{backgroundColor: theme.primary, color: theme.onPrimary}}>
                            {buttonText}
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- 8. COUNTDOWN ---
export function Countdown({ data, theme }) {
    const title = data.title || "⏰ Sale Ends In";
    const endDate = data.endDate || data.deadline || data.end_date || data.targetDate || "";
    const [timeLeft, setTimeLeft] = React.useState({ d: 0, h: 0, m: 0, s: 0 });
    
    // Debug countdown data
    console.log('⏰ User Countdown data:', { title, endDate, rawData: data });
    
    React.useEffect(() => {
        if (!endDate) return;
        const target = new Date(endDate).getTime();
        const tick = () => {
            const diff = Math.max(0, target - Date.now());
            setTimeLeft({
                d: Math.floor(diff / 86400000),
                h: Math.floor((diff % 86400000) / 3600000), 
                m: Math.floor((diff % 3600000) / 60000),
                s: Math.floor((diff % 60000) / 1000),
            });
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [endDate]);
    
    const units = [
        { label: "Days", val: timeLeft.d },
        { label: "Hours", val: timeLeft.h },
        { label: "Mins", val: timeLeft.m },
        { label: "Secs", val: timeLeft.s },
    ];
    
    return (
        <div className="w-full px-4 mb-6">
            <div className="w-full p-6 rounded-xl text-center" style={{backgroundColor: theme.card, border: `1px solid ${theme.border}`}}>
                <h3 className="text-xl font-bold mb-4" style={{color: theme.text}}>{title}</h3>
                <div className="flex justify-center gap-4">
                    {units.map(({ label, val }) => (
                        <div key={label} className="flex flex-col items-center">
                            <div 
                                className="w-16 h-16 flex items-center justify-center rounded-lg text-2xl font-bold" 
                                style={{backgroundColor: theme.primary, color: theme.onPrimary}}
                            >
                                {endDate ? String(val).padStart(2, "0") : "--"}
                            </div>
                            <div className="text-xs mt-2 opacity-70" style={{color: theme.text}}>{label}</div>
                        </div>
                    ))}
                </div>
                {!endDate && (
                    <p className="text-xs text-center mt-4" style={{ color: theme.text, opacity: 0.5 }}>
                        Set an end date to activate the countdown
                    </p>
                )}
            </div>
        </div>
    );
}

// --- 9. TESTIMONIALS ---
export function Testimonials({ data, theme }) {
    const { title = "", testimonials = [], items = [] } = data;
    const reviews = Array.isArray(testimonials) && testimonials.length > 0 ? testimonials : Array.isArray(items) ? items : [];
    
    return (
        <div className="w-full px-4 mb-6">
            {title && <h3 className="text-xl font-bold mb-6 text-center" style={{color: theme.text}}>{title}</h3>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {reviews.length > 0 ? reviews.map((item, i) => (
                    <div key={i} className="p-5 rounded-xl border" style={{backgroundColor: theme.card, borderColor: theme.border}}>
                        <div className="flex items-center gap-2 mb-3">
                            {item.avatar && <img src={toAbsUrl(item.avatar)} alt="" className="w-10 h-10 rounded-full object-cover"/>}
                            <div>
                                <p className="text-sm font-semibold" style={{color: theme.text}}>{item.name || item.author || "Customer"}</p>
                                {item.rating && (
                                    <div className="flex gap-0.5 mt-1">
                                        {Array.from({length: 5}).map((_, s) => (
                                            <span key={s} style={{color: s < Number(item.rating) ? "#fbbf24" : theme.border}}>★</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <p className="text-sm leading-relaxed" style={{color: theme.text}}>"{item.text || item.quote || item.content || ""}”</p>
                    </div>
                )) : (
                    <div className="col-span-2 p-8 rounded-xl border-2 border-dashed text-center" style={{borderColor: theme.border}}>
                        <p className="text-sm" style={{color: theme.text, opacity: 0.5}}>No testimonials yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- 10. IMAGE GALLERY ---
export function ImageGallery({ data, theme, shopData, shopId, themeId }) {
    const { title = "", images = [], layout = "grid" } = data;
    const imageList = Array.isArray(images) ? images : [];
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get current shop mall context for proper back navigation
    const getCurrentBackUrl = () => {
        const currentPath = location.pathname + location.search;
        return currentPath;
    };
    
    return (
        <div className="w-full px-4 mb-6">
            {title && <h3 className="text-xl font-bold mb-6" style={{color: theme.text}}>{title}</h3>}
            <div className={layout === "masonry" ? "columns-2 sm:columns-3 gap-3" : "grid grid-cols-2 sm:grid-cols-3 gap-3"}>
                {imageList.length > 0 ? imageList.map((img, i) => {
                    const src = typeof img === "string" ? img : img.url || img.src || "";
                    const caption = typeof img === "object" ? img.caption || "" : "";
                    const productId = typeof img === "object" ? img.productId || "" : "";
                    
                    // ✅ FIX: Use same URL pattern as ProductGrid for consistent shop mall experience
                    const productUrl = productId && shopId
                        ? `/shop-mall/${encodeURIComponent(shopId)}/product/${encodeURIComponent(productId)}?theme=${themeId || theme.id}` 
                        : productId ? `/product/${encodeURIComponent(productId)}` : "";
                        
                    console.log('🖼️ User Image Gallery item:', { src, caption, productId, productUrl, themeId: theme?.id, shopId });
                    
                    const imageContent = (
                        <div 
                            className={`rounded-xl overflow-hidden border group ${
                                layout === "masonry" ? "break-inside-avoid mb-3" : ""
                            } ${productUrl ? "cursor-pointer hover:shadow-lg" : ""}`} 
                            style={{borderColor: theme.border}}
                        >
                            <div className="relative overflow-hidden">
                                <img 
                                    src={toAbsUrl(src)} 
                                    alt={caption || `Image ${i+1}`} 
                                    className={`w-full object-cover group-hover:scale-105 transition-all duration-500 ${
                                        layout === "masonry" ? "" : "aspect-square"
                                    }`}
                                />
                                {productUrl && (
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <div className="bg-white/90 px-3 py-1.5 rounded-full shadow-lg">
                                            <span className="text-xs font-medium text-gray-800">
                                                View Product
                                            </span>
                                        </div>
                                    </div>
                                )}
                                {caption && (
                                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                                        <p className="text-xs text-white font-medium">{caption}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                    
                    return productUrl ? (
                        <Link
                            key={i}
                            to={productUrl}
                            className="block hover:transform hover:-translate-y-1 transition-transform duration-300 cursor-pointer"
                        >
                            {imageContent}
                        </Link>
                    ) : (
                        <div key={i}>
                            {imageContent}
                        </div>
                    );
                }) : (
                    <div className="col-span-2 sm:col-span-3 p-8 rounded-xl border-2 border-dashed text-center" style={{borderColor: theme.border}}>
                        <p className="text-sm" style={{color: theme.text, opacity: 0.5}}>No images yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- 11. VIDEO EMBED ---
export function VideoEmbed({ data, theme }) {
    const { title = "", videoUrl = "", url = "" } = data;
    const rawUrl = videoUrl || url;
    
    const getEmbedUrl = (u) => {
        if (!u) return "";
        const ytMatch = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
        if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
        const vimeoMatch = u.match(/vimeo\.com\/(\d+)/);
        if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
        return u;
    };
    
    const embedUrl = getEmbedUrl(rawUrl);
    
    return (
        <div className="w-full px-4 mb-6">
            {title && <h3 className="text-xl font-bold mb-4" style={{color: theme.text}}>{title}</h3>}
            {embedUrl ? (
                <div className="relative w-full rounded-xl overflow-hidden border" style={{borderColor: theme.border, paddingBottom: "56.25%"}}>
                    <iframe src={embedUrl} title={title || "Video"} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/>
                </div>
            ) : (
                <div className="w-full aspect-video rounded-xl border-2 border-dashed flex items-center justify-center" style={{borderColor: theme.border}}>
                    <p className="text-sm" style={{color: theme.text, opacity: 0.5}}>Add video URL</p>
                </div>
            )}
        </div>
    );
}

// --- 12. DIVIDER ---
export function Divider({ data, theme }) {
    const { dividerStyle = "line", spacing = "md" } = data;
    const py = { sm: "py-3", md: "py-6", lg: "py-12" };
    
    if (dividerStyle === "space") return <div className={py[spacing] || py.md}/>;
    
    return (
        <div className={`w-full px-4 ${py[spacing] || py.md} flex items-center justify-center`}>
            {dividerStyle === "dots" ? (
                <div className="flex items-center gap-2">
                    {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full" style={{background: theme.border}}/>)}
                </div>
            ) : dividerStyle === "gradient" ? (
                <div className="w-full h-px" style={{background: `linear-gradient(to right, transparent, ${theme.border}, transparent)`}}/>
            ) : (
                <div className="w-full h-px" style={{background: theme.border}}/>
            )}
        </div>
    );
}

// --- 13. FEATURED PRODUCT ---
export function FeaturedProduct({ data, theme, shopId, themeId }) {
    const products = Array.isArray(data.products) ? data.products : [];
    const product = products[0];
    
    if (!product) return null;
    
    const img = product.image || product.imageUrl || (Array.isArray(product.images) && product.images[0]) || "";
    const name = product.title || product.name || data.title || "Featured Product";
    const desc = product.description || data.subtitle || "";
    const price = product.price ?? data.price ?? "";
    const originalPrice = product.originalPrice || product.compareAtPrice || data.originalPrice || "";
    const onSale = originalPrice && Number(originalPrice) > Number(price);
    const btnText = data.buttonText || "Shop Now";
    const btnLink = data.buttonLink || "#";
    const badge = data.badge || (onSale ? "SALE" : "");
    
    return (
        <div className="flex flex-col sm:flex-row items-stretch overflow-hidden border rounded-2xl mx-4 sm:mx-6 my-4" style={{background: theme.card, borderColor: theme.border}}>
            {/* image */}
            <div className="relative sm:w-1/2 aspect-square sm:aspect-auto overflow-hidden">
                {img ? (
                    <img src={toAbsUrl(img)} alt={name} className="w-full h-full object-cover"/>
                ) : (
                    <div className="w-full h-full min-h-[200px] flex items-center justify-center" style={{background: theme.primary + "15"}}>
                        <ShoppingBag size={48} style={{color: theme.muted}}/>
                    </div>
                )}
                {badge && (
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-lg text-xs font-bold text-white" style={{background: onSale ? "#ef4444" : theme.primary}}>
                        {badge}
                    </span>
                )}
            </div>
            {/* info */}
            <div className="sm:w-1/2 flex flex-col justify-center p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold" style={{color: theme.text}}>{name}</h2>
                {desc && <p className="text-sm mt-2 line-clamp-3" style={{color: theme.muted}}>{desc}</p>}
                <div className="flex items-center gap-3 mt-4">
                    {price !== "" && <span className="text-2xl sm:text-3xl font-bold" style={{color: onSale ? "#ef4444" : theme.primary}}>${Number(price).toFixed(2)}</span>}
                    {onSale && <span className="text-lg line-through" style={{color: theme.muted}}>${Number(originalPrice).toFixed(2)}</span>}
                </div>
                {btnText && (
                    <a href={btnLink} className="inline-flex items-center justify-center gap-2 mt-6 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg w-full sm:w-auto" style={{background: theme.primary, color: "#fff"}}>
                        {btnText}
                        <span>→</span>
                    </a>
                )}
            </div>
        </div>
    );
}

export const COMPONENT_MAP = {
    'ProfileHeader': ProfileHeader, 'profileheader': ProfileHeader,
    'HeroBanner': HeroBanner, 'herobanner': HeroBanner,
    'ProductGrid': ProductGrid, 'productgrid': ProductGrid,
    'LinkList': LinkList, 'linklist': LinkList,
    'RichText': RichText, 'richtext': RichText,
    'AnnouncementBar': AnnouncementBar, 'announcementbar': AnnouncementBar,
    'SaleBanner': SaleBanner, 'salebanner': SaleBanner,
    'Countdown': Countdown, 'countdown': Countdown,
    'Testimonials': Testimonials, 'testimonials': Testimonials,
    'ImageGallery': ImageGallery, 'imagegallery': ImageGallery,
    'VideoEmbed': VideoEmbed, 'videoembed': VideoEmbed,
    'Divider': Divider, 'divider': Divider,
    'FeaturedProduct': FeaturedProduct, 'featuredproduct': FeaturedProduct,
    'NavigationMenu': () => null, 'navigationmenu': () => null
};

export const THEMES = {
  /* ── Dark ─────────────────────────────── */
  midnight: {
    id: "midnight",
    label: "Midnight",
    group: "Dark",
    bg: "#09090b",
    card: "#18181b",
    text: "#fafafa",
    muted: "#a1a1aa",
    primary: "#8b5cf6",
    primaryHover: "#7c3aed",
    border: "#27272a",
    accent: "#c084fc",
    font: "'Inter', sans-serif",
    navStyle: "side",
    gradient: "from-violet-600/20 to-purple-900/20",
  },
  neon: {
    id: "neon",
    label: "Neon",
    group: "Dark",
    bg: "#0a0a0a",
    card: "#141414",
    text: "#f0f0f0",
    muted: "#888888",
    primary: "#00ff88",
    primaryHover: "#00dd77",
    border: "#222222",
    accent: "#00ffcc",
    font: "'Inter', sans-serif",
    navStyle: "top",
    gradient: "from-emerald-500/20 to-teal-900/20",
  },
  royal: {
    id: "royal",
    label: "Royal",
    group: "Dark",
    bg: "#0c0a1a",
    card: "#1a1530",
    text: "#f5f0ff",
    muted: "#9b8ec4",
    primary: "#d4af37",
    primaryHover: "#c9a02e",
    border: "#2d2550",
    accent: "#ffd700",
    font: "'Georgia', serif",
    navStyle: "side",
    gradient: "from-amber-500/20 to-purple-900/20",
  },
  slate: {
    id: "slate",
    label: "Slate",
    group: "Dark",
    bg: "#0f1419",
    card: "#1c2530",
    text: "#e7e9ea",
    muted: "#8899a6",
    primary: "#1d9bf0",
    primaryHover: "#1a8cd8",
    border: "#2f3940",
    accent: "#79c0ff",
    font: "'Inter', sans-serif",
    navStyle: "top",
    gradient: "from-sky-500/20 to-slate-900/20",
  },

  /* ── Ocean / Cool ────────────────────── */
  ocean: {
    id: "ocean",
    label: "Ocean",
    group: "Cool",
    bg: "#0f172a",
    card: "#1e293b",
    text: "#f1f5f9",
    muted: "#94a3b8",
    primary: "#0ea5e9",
    primaryHover: "#0284c7",
    border: "#334155",
    accent: "#38bdf8",
    font: "'Inter', sans-serif",
    navStyle: "top",
    gradient: "from-sky-500/20 to-blue-900/20",
  },
  arctic: {
    id: "arctic",
    label: "Arctic",
    group: "Cool",
    bg: "#f0f9ff",
    card: "#ffffff",
    text: "#0c4a6e",
    muted: "#64748b",
    primary: "#0284c7",
    primaryHover: "#0369a1",
    border: "#bae6fd",
    accent: "#0ea5e9",
    font: "'Inter', sans-serif",
    navStyle: "top",
    gradient: "from-sky-100 to-blue-50",
  },

  /* ── Warm ─────────────────────────────── */
  sunrise: {
    id: "sunrise",
    label: "Sunrise",
    group: "Warm",
    bg: "#fff7ed",
    card: "#ffffff",
    text: "#1c1917",
    muted: "#78716c",
    primary: "#f97316",
    primaryHover: "#ea580c",
    border: "#fed7aa",
    accent: "#fb923c",
    font: "'Inter', sans-serif",
    navStyle: "top",
    gradient: "from-orange-100 to-amber-50",
  },
  coral: {
    id: "coral",
    label: "Coral",
    group: "Warm",
    bg: "#fff1f2",
    card: "#ffffff",
    text: "#1f1215",
    muted: "#a8a29e",
    primary: "#f43f5e",
    primaryHover: "#e11d48",
    border: "#fecdd3",
    accent: "#fb7185",
    font: "'Inter', sans-serif",
    navStyle: "side",
    gradient: "from-rose-100 to-pink-50",
  },

  /* ── Nature ──────────────────────────── */
  forest: {
    id: "forest",
    label: "Forest",
    group: "Nature",
    bg: "#052e16",
    card: "#14532d",
    text: "#f0fdf4",
    muted: "#86efac",
    primary: "#22c55e",
    primaryHover: "#16a34a",
    border: "#166534",
    accent: "#4ade80",
    font: "'Inter', sans-serif",
    navStyle: "side",
    gradient: "from-green-600/20 to-emerald-900/20",
  },
  earth: {
    id: "earth",
    label: "Earth",
    group: "Nature",
    bg: "#1c1a17",
    card: "#292524",
    text: "#fafaf9",
    muted: "#a8a29e",
    primary: "#d97706",
    primaryHover: "#b45309",
    border: "#44403c",
    accent: "#fbbf24",
    font: "'Georgia', serif",
    navStyle: "side",
    gradient: "from-amber-600/20 to-stone-900/20",
  },

  /* ── Pastel / Light ──────────────────── */
  lavender: {
    id: "lavender",
    label: "Lavender",
    group: "Pastel",
    bg: "#faf5ff",
    card: "#ffffff",
    text: "#2e1065",
    muted: "#7c3aed",
    primary: "#a855f7",
    primaryHover: "#9333ea",
    border: "#e9d5ff",
    accent: "#c084fc",
    font: "'Inter', sans-serif",
    navStyle: "top",
    gradient: "from-purple-100 to-violet-50",
  },
  candy: {
    id: "candy",
    label: "Candy",
    group: "Pastel",
    bg: "#fdf2f8",
    card: "#ffffff",
    text: "#4a044e",
    muted: "#a21caf",
    primary: "#ec4899",
    primaryHover: "#db2777",
    border: "#fbcfe8",
    accent: "#f472b6",
    font: "'Inter', sans-serif",
    navStyle: "top",
    gradient: "from-pink-100 to-fuchsia-50",
  },
};
