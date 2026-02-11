import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
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
                            backgroundColor: theme.cardBg || theme.bg, 
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
                style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
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
            <div className="sticky top-0 z-50 border-b backdrop-blur-md bg-opacity-90 transition-colors duration-300" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
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
            style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
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
    const { shopName="My Shop", bio="Welcome", avatarUrl, coverUrl } = data;
    return (
        <div className="w-full flex flex-col items-center text-center relative mb-8">
            <div className="w-full h-48 overflow-hidden rounded-b-[2.5rem] mb-[-48px]">
                {coverUrl ? <img src={toAbsUrl(coverUrl)} alt="Cover" className="w-full h-full object-cover"/> : <div className="w-full h-full" style={{background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.bg} 100%)`, opacity:0.8}}/>}
            </div>
            <div className="relative mb-4 rounded-full border-4 shadow-2xl overflow-hidden w-28 h-28 flex items-center justify-center" style={{borderColor: theme.bg, backgroundColor: theme.cardBg}}>
                {avatarUrl ? <img src={toAbsUrl(avatarUrl)} className="w-full h-full object-cover"/> : <span className="text-3xl font-bold opacity-80" style={{color:theme.text}}>{shopName.slice(0,1)}</span>}
            </div>
            <h1 className="text-3xl font-extrabold mb-2 tracking-tight" style={{color: theme.text}}>{shopName}</h1>
            <p className="text-sm opacity-70 max-w-md px-6 leading-relaxed" style={{color: theme.text}}>{bio}</p>
        </div>
    );
}

// --- 2. HERO BANNER ---
export function HeroBanner({ data, theme }) {
    const { title, subtitle, imageUrl, buttonText, buttonLink } = data;
    return (
        <div className="w-full px-4 mb-6">
            <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden shadow-lg group">
                {imageUrl ? <img src={toAbsUrl(imageUrl)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/> : <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-600"><Layout size={48}/></div>}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-left">
                    {title && <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{title}</h2>}
                    {subtitle && <p className="text-white/90 text-sm md:text-base mb-4 max-w-lg">{subtitle}</p>}
                    {buttonText && <a href={buttonLink||'#'} className="w-max px-6 py-2 rounded-full font-semibold text-sm transition-all hover:brightness-110 active:scale-95 inline-block" style={{backgroundColor: theme.primary, color:theme.onPrimary}}>{buttonText}</a>}
                </div>
            </div>
        </div>
    );
}

// --- 3. PRODUCT GRID ---
export function ProductGrid({ data, theme, shopId, themeId }) {
    const { title = "Featured Products", products = [] } = data;
    const realProducts = Array.isArray(products) ? products.filter(p => p && (p._id || p.id)) : [];

    return (
        <div className="w-full px-4 mb-6">
            {title && <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{color: theme.text}}><ShoppingBag size={20}/>{title}</h3>}
            {realProducts.length === 0 && <div className="mb-4 text-xs text-zinc-500 bg-black/10 border border-dashed border-zinc-700 rounded-lg px-4 py-2">No products to display.</div>}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {realProducts.map((p) => {
                    const id = String(p._id||p.id||"").trim();
                    const rawImage = p.image || p.imageUrl || (Array.isArray(p.images) && p.images[0]);
                    const image = rawImage ? toAbsUrl(rawImage) : "";
                    const price = p.localPrice ?? p.price ?? 0;
                    
                    const productUrl = shopId 
                        ? `/shop-mall/${encodeURIComponent(shopId)}/product/${encodeURIComponent(id)}?theme=${themeId || theme.id}` 
                        : `/product/${id}`;
                    
                    return (
                        <Link 
                            key={id} 
                            to={productUrl}
                            className="rounded-xl overflow-hidden shadow-sm border border-zinc-800 hover:border-purple-500/40 transition block" 
                            style={{backgroundColor: theme.cardBg}}
                        >
                            <div className="aspect-square w-full bg-zinc-900 relative">
                                {image ? <img src={image} className="w-full h-full object-cover"/> : <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600"><ShoppingBag size={32}/></div>}
                            </div>
                            <div className="p-3 space-y-2">
                                <div className="text-sm font-semibold text-white line-clamp-2">{p.title||p.name}</div>
                                <div className="text-[11px] text-zinc-400">${Number(price).toLocaleString()}</div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    );
}

// --- 4. LINK LIST ---
export function LinkList({ data, theme }) {
    const { links = [] } = data;
    return (
        <div className="w-full px-4 mb-6 flex flex-col gap-3">
            {links.map((link, i) => (
                <a key={i} href={link.url} className="w-full p-4 rounded-xl flex items-center justify-between transition-transform active:scale-[0.99] hover:brightness-110" style={{backgroundColor: theme.cardBg, color: theme.text, border: `1px solid ${theme.border}`}}>
                    <div className="flex items-center gap-3 font-medium"><LinkIcon size={20}/>{link.label}</div>
                </a>
            ))}
        </div>
    );
}

// --- 5. RICH TEXT ---
export function RichText({ data, theme }) {
    const { content, align="left" } = data;
    return (
        <div className="w-full px-4 mb-6" style={{textAlign: align}}>
             <div className="prose prose-invert max-w-none" style={{color: theme.text}}>{content}</div>
        </div>
    );
}

export const COMPONENT_MAP = {
    'ProfileHeader': ProfileHeader, 'profileheader': ProfileHeader,
    'HeroBanner': HeroBanner, 'herobanner': HeroBanner,
    'ProductGrid': ProductGrid, 'productgrid': ProductGrid,
    'LinkList': LinkList, 'linklist': LinkList,
    'RichText': RichText, 'richtext': RichText,
    'NavigationMenu': () => null, 'navigationmenu': () => null
};

export const THEMES = {
    midnight: { id: 'midnight', navStyle: 'side', bg: '#09090b', text: '#f4f4f5', primary: '#a78bfa', onPrimary: '#ffffff', cardBg: '#18181b', border: '#27272a', font: 'Inter, sans-serif' },
    ocean: { id: 'ocean', navStyle: 'top', bg: '#0f172a', text: '#f1f5f9', primary: '#38bdf8', onPrimary: '#000000', cardBg: '#1e293b', border: '#334155', font: 'Inter, sans-serif' },
    coral: { id: 'coral', navStyle: 'top', bg: '#fff1f2', text: '#4c0519', primary: '#fb7185', onPrimary: '#ffffff', cardBg: '#ffffff', border: '#fecdd3', font: 'Inter, sans-serif' },
    sunrise: { id: 'sunrise', navStyle: 'top', bg: '#fff7ed', text: '#431407', primary: '#f97316', onPrimary: '#ffffff', cardBg: '#ffffff', border: '#fed7aa', font: 'Serif' },
    forest: { id: 'forest', navStyle: 'side', bg: '#052e16', text: '#ecfdf5', primary: '#4ade80', onPrimary: '#000000', cardBg: '#064e3b', border: '#065f46', font: 'Monospace' }
};
