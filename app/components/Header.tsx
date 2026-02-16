"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowDown01Icon } from "hugeicons-react";
import Logo from "./Logo";
import { isAuthenticated, getUser, logout } from "../lib/authService";

export default function Header() {
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<{ firstName?: string; email?: string } | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState({
    symbol: "$",
    code: "USD",
  });

  const pathname = usePathname();
  const router = useRouter();
  const currencyRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const currencies = [
    { symbol: "$", code: "USD" },
    { symbol: "₵", code: "CEDIS" },
  ];

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/packages", label: "Packages" },
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
    const checkAuth = () => {
      setAuthenticated(isAuthenticated());
      setUser(getUser());
    };
    checkAuth();
    // Re-check on route changes
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, [pathname]);

  /* Close dropdowns on outside click */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      
      // Only close if clicking outside both the currency dropdown and its button
      if (currencyRef.current && !currencyRef.current.contains(target)) {
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

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    setUser(null);
    router.push("/");
  };

  return (
    <header className="w-full border-b border-[#ffdfcc] sticky top-0 z-50 bg-white overflow-visible">
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
                  <span>{user?.firstName || "Account"}</span>
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
                      href="/dashboard"
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

            {/* Currency Picker */}
            <div className="relative z-50" ref={currencyRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrencyOpen((prev) => !prev);
                }}
                className="bg-gray-100 flex items-center gap-2 h-[40px] px-3 rounded-full transition-colors hover:bg-gray-200"
              >
                <span className="text-[12px] text-[#222]">
                  {selectedCurrency.symbol} {selectedCurrency.code}
                </span>

                <ArrowDown01Icon
                  className={`w-5 h-5 text-[#222] transition-transform duration-200 ${
                    currencyOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown (always mounted for stability) */}
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
                    {currencies.map((currency) => (
                      <button
                        key={currency.code}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCurrency(currency);
                          setCurrencyOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-[12px] transition-colors ${
                          selectedCurrency.code === currency.code
                            ? "bg-[#fff5e6] text-[#ff5e00] font-semibold"
                            : "hover:bg-[#fff5e6] text-[#222]"
                        }`}
                      >
                        {currency.symbol} {currency.code}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

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

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        />

        <div
          className={`absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transition-transform duration-300 ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full p-6">
            <nav className="space-y-4">
              {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                  className={`block py-3 font-semibold transition-colors ${
                      isActive(link.href)
                      ? "text-[#ff5e00]"
                        : "text-[#222] hover:text-[#ff5e00]"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
            </nav>
            
            {/* Mobile Auth Buttons */}
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
              {authenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-3 px-4 bg-[#ff5e00] text-white rounded-full text-center font-semibold hover:bg-[#e55500] transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-3 px-4 text-red-600 rounded-full text-center font-semibold hover:bg-red-50 transition-colors border border-red-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-3 px-4 text-center font-semibold text-[#222] hover:text-[#ff5e00] transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-3 px-4 bg-[#ff5e00] text-white rounded-full text-center font-semibold hover:bg-[#e55500] transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}