"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowDown01Icon, Cancel01Icon } from "hugeicons-react";
import Logo from "./Logo";
import { isAuthenticated, getUser, getUserRole, logout } from "../lib/authService";
import { useCurrency } from "../context/CurrencyContext";

const GlobeIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

export default function Header() {
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("EN");

  useEffect(() => {
    // Read Google Translate cookie to set initial language
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/googtrans=\/en\/([a-z]{2,3})/i);
      if (match && match[1]) {
        setSelectedLanguage(match[1].toUpperCase());
      }
    }
  }, []);

  const handleLanguageSelect = (langCode: string) => {
    setSelectedLanguage(langCode);
    setLanguageOpen(false);
    
    // Set Google Translate cookie
    const gCode = langCode.toLowerCase();
    
    // If English, clear the cookie to show original text
    if (gCode === 'en') {
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=" + window.location.hostname + "; path=/;";
    } else {
      document.cookie = `googtrans=/en/${gCode}; path=/`;
      document.cookie = `googtrans=/en/${gCode}; domain=${window.location.hostname}; path=/`;
    }
    
    window.location.reload();
  };
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<{ first_name?: string; email?: string } | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'subscriber'>('subscriber');
  const { currency, symbol, setCurrency } = useCurrency();

  const pathname = usePathname();
  const router = useRouter();
  const currencyRef = useRef<HTMLDivElement>(null);
  const mobileCurrencyRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const currencies = [
    { symbol: "$", code: "USD" as const },
    { symbol: "₵", code: "GHS" as const },
  ];

  const languages = [
    { code: "EN", name: "English" },
    { code: "FR", name: "Français" },
    { code: "ES", name: "Español" },
    { code: "DE", name: "Deutsch" },
    { code: "ZH", name: "中文" }
  ];

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/packages", label: "Tours" },
    { href: "/gallery", label: "Gallery" },
    { href: "/blog", label: "Blog and News" },
    { href: "/about-us", label: "About us" },
    { href: "/contact", label: "Contact us" },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  /* Prevent body scroll when mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  /* Check authentication status */
  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await isAuthenticated();
      setAuthenticated(isAuth);
      if (isAuth) {
        const userData = await getUser();
        setUser(userData);
        const role = await getUserRole();
        setUserRole(role);
      }
    };
    checkAuth();
    // Re-check on route changes
    // Using interval for auth check is not ideal with async/network calls. 
    // Better to rely on Supabase onAuthStateChange, but keeping simple fix for now.
    // Reducing frequency to avoid spamming API if interval is kept, or removing interval.
    // Let's keep it simple: check on mount and pathname change.
  }, [pathname]);

  /* Close dropdowns on outside click */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      
      // Only close if clicking outside both the currency dropdown and its button
      if (
        (currencyRef.current && !currencyRef.current.contains(target)) &&
        (mobileCurrencyRef.current && !mobileCurrencyRef.current.contains(target))
      ) {
        setCurrencyOpen(false);
      }
      
      // Only close if clicking outside both the user menu and its button
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
    }

    // Use capture phase to ensure we catch the event
    if (currencyOpen || userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside, true);
      return () => document.removeEventListener("mousedown", handleClickOutside, true);
    }
  }, [currencyOpen, userMenuOpen]);

  const handleLogout = async () => {
    await logout();
    setAuthenticated(false);
    setUser(null);
    router.push("/");
  };

  return (
    <header className="print:hidden w-full border-b border-[#ffdfcc] sticky top-0 z-100 bg-white overflow-visible transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 md:px-12 py-3 sm:py-4 md:py-[18px] overflow-visible">
        <div className="flex items-center justify-between w-full overflow-visible">

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Logo />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-[24px]">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[14px] font-semibold transition-colors ${
                  isActive(link.href)
                    ? "text-[#ff5e00] font-bold bg-gray-100 rounded-full px-4 py-2"
                    : "text-[#222] hover:text-[#ff5e00]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-4">

            {/* Auth Buttons / User Menu */}
            {authenticated ? (
              <div className="relative z-50" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="bg-[#ff5e00] text-white flex items-center gap-2 h-[40px] px-4 rounded-full transition-colors hover:bg-[#e55500] font-semibold text-[12px]"
                >
                  <span>{user?.first_name || "Account"}</span>
                  <ArrowDown01Icon
                    className={`w-4 h-4 transition-transform duration-200 ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`absolute right-0 top-full mt-2 w-[180px] bg-white rounded-lg shadow-xl border border-gray-100 transition-all duration-200 origin-top overflow-hidden ${
                    userMenuOpen
                      ? "opacity-100 scale-100 pointer-events-auto z-60"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                  style={{ zIndex: 9999 }}
                >
                  <div className="py-1">
                    <Link
                      href={userRole === 'admin' ? '/admin' : '/dashboard'}
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-[12px] text-[#222] hover:bg-[#fff5e6] transition-colors"
                    >
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        handleLogout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-[12px] text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-[12px] font-semibold text-[#222] hover:text-[#ff5e00] transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-[12px] font-semibold text-white bg-[#ff5e00] rounded-full hover:bg-[#e55500] transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Preferences Pill */}
            <div className="hidden md:flex items-center bg-gray-100 rounded-full h-[40px] p-0.5 border border-gray-200/50">
              
              {/* Currency Picker */}
              <div className="relative h-full" ref={currencyRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrencyOpen((prev) => !prev);
                  }}
                  className="flex items-center gap-1.5 h-full px-3 rounded-full transition-colors hover:bg-white"
                >
                  <span className="text-[12px] text-[#222] font-medium">
                    {symbol} {currency}
                  </span>
                  <ArrowDown01Icon
                    className={`w-4 h-4 text-[#222] transition-transform duration-200 ${
                      currencyOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown */}
                {currencyOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-[140px] bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden"
                    style={{ zIndex: 9999 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-3 py-2 text-[12px] text-[#8e8e8e] border-b border-gray-100">
                      Change currency
                    </div>
                    <div className="py-1">
                      {currencies.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrency(c.code);
                            setCurrencyOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-[12px] transition-colors ${
                            currency === c.code
                              ? "bg-[#fff5e6] text-[#ff5e00] font-semibold"
                              : "hover:bg-[#fff5e6] text-[#222]"
                          }`}
                        >
                          {c.symbol} {c.code}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="w-px h-4 bg-gray-300 mx-0.5"></div>

              {/* Language Picker */}
              <button
                type="button"
                onClick={() => setLanguageOpen(true)}
                className="flex items-center gap-1.5 h-full px-3 rounded-full transition-colors hover:bg-white text-[12px] text-[#222] font-medium"
              >
                <GlobeIcon size={16} />
                <span>{selectedLanguage}</span>
              </button>
            </div>

            {/* Language Modal */}
            {languageOpen && (
              <div 
                className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4"
                onClick={() => setLanguageOpen(false)}
              >
                <div 
                  className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="font-bold text-lg font-sans">Select Language</h3>
                    <button onClick={() => setLanguageOpen(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                      <Cancel01Icon size={24} className="text-gray-500" />
                    </button>
                  </div>
                  <div className="p-2 max-h-[60vh] overflow-y-auto">
                    {languages.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageSelect(lang.code)}
                        className={`w-full flex items-center justify-between text-left px-4 py-3 rounded-xl transition-colors font-sans ${
                          selectedLanguage === lang.code ? "bg-[#fff5e6] text-[#ff5e00] font-semibold" : "hover:bg-gray-50 text-gray-800"
                        }`}
                      >
                        <span>{lang.name}</span>
                        <span className="text-sm opacity-60">{lang.code}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Button */}
          <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className={`md:hidden flex flex-col gap-1.5 p-2 rounded-lg transition-colors ${
                mobileMenuOpen ? "bg-gray-100" : ""
              }`}
            aria-label="Toggle menu"
          >
            <span
              className={`w-6 h-0.5 transition-all duration-300 ${
                mobileMenuOpen 
                  ? "rotate-45 translate-y-2 bg-[#222]" 
                  : "bg-[#222]"
              }`}
            />
            <span
              className={`w-6 h-0.5 bg-[#222] transition-all duration-300 ${
                mobileMenuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`w-6 h-0.5 transition-all duration-300 ${
                mobileMenuOpen 
                  ? "-rotate-45 -translate-y-2 bg-[#222]" 
                  : "bg-[#222]"
              }`}
            />
          </button>

          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`md:hidden fixed inset-0 z-200 transition-opacity duration-500 ease-in-out ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />

            {/* Drawer */}
            <div
          className={`absolute right-0 top-0 h-dvh w-80 max-w-[85vw] bg-white shadow-2xl transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <Logo />
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 -mr-2 text-gray-400 hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 rounded-full"
              >
                <Cancel01Icon size={24} />
              </button>
            </div>

            {/* Links */}
            <nav className="flex-1 px-6 py-8 space-y-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block text-[18px] font-bold tracking-wide transition-colors ${
                    isActive(link.href)
                      ? "text-[#ff5e00]"
                      : "text-gray-900 hover:text-[#ff5e00]"
                  }`}
                  style={{ fontFamily: isActive(link.href) ? 'var(--font-unlimited-pie)' : 'inherit' }}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile Preferences (Currency/Language) */}
              <div className="pt-4 flex items-center gap-4 border-t border-gray-100 mt-6">
                {/* Currency Picker */}
                <div className="relative" ref={mobileCurrencyRef}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrencyOpen((prev) => !prev);
                    }}
                    className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-sm font-medium"
                  >
                    <span>{symbol} {currency}</span>
                    <ArrowDown01Icon className={`w-4 h-4 transition-transform ${currencyOpen ? "rotate-180" : ""}`} />
                  </button>
                  {currencyOpen && (
                    <div className="absolute left-0 top-full mt-2 w-[140px] bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50">
                      <div className="py-1">
                        {currencies.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrency(c.code);
                              setCurrencyOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-orange-50"
                          >
                            {c.symbol} {c.code}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Language Picker */}
                <button
                  type="button"
                  onClick={() => setLanguageOpen(true)}
                  className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-sm font-medium"
                >
                  <GlobeIcon size={16} />
                  <span>{selectedLanguage}</span>
                </button>
              </div>
            </nav>

            {/* Mobile Auth Buttons */}
            <div className="p-6 bg-gray-50 mt-auto border-t border-gray-200">
              {authenticated ? (
                <div className="flex flex-col gap-3">
                  <div className="text-sm font-semibold text-gray-500 mb-2">
                    Signed in as {user?.first_name || 'User'}
                  </div>
                  <Link
                    href={userRole === 'admin' ? '/admin' : '/dashboard'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex justify-center items-center h-[50px] bg-white border-2 border-[#ff5e00] text-[#ff5e00] rounded-xl font-bold hover:bg-orange-50 transition-colors"
                  >
                    My Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex justify-center items-center h-[50px] text-red-600 rounded-xl font-bold hover:bg-red-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex justify-center items-center h-[50px] bg-[#ff5e00] text-white rounded-xl font-bold hover:bg-[#e55500] hover:shadow-lg transition-all"
                  >
                    Create Account
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex justify-center items-center h-[50px] bg-white text-gray-900 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}