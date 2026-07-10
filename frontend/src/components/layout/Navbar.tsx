"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Menu,
  X,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  /* Focus the input when overlay opens */
  useEffect(() => {
    if (searchOpen) {
      // Small delay so the transition plays first
      const t = setTimeout(() => searchInputRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [searchOpen]);

  /* Close on Escape */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false);
      }
    },
    [searchOpen],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  /* Lock body scroll when search overlay is open */
  useEffect(() => {
    document.body.style.overflow = searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [searchOpen]);

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#111111]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex h-16 items-center justify-between">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-[#F47521] flex items-center justify-center shadow-lg shadow-orange-500/30">
                <span className="text-white text-lg font-bold">
                  A
                </span>
              </div>

              <span className="text-2xl font-black tracking-tight text-white">
                Ani
                <span className="text-[#F47521]">
                  Verse
                </span>
              </span>

            </Link>

            {/* Desktop Navigation — Home · Search · Explore */}
            <div className="hidden md:flex items-center gap-1 h-full">

              {/* Home */}
              <Link
                href="/"
                className={`relative flex items-center gap-2 px-4 h-16 font-medium transition-colors duration-200
                  ${pathname === "/"
                    ? "text-[#F47521]"
                    : "text-gray-300 hover:text-white"
                  }`}
              >
                <span>Home</span>
                {pathname === "/" && (
                  <span className="absolute bottom-4 left-2 right-2 h-0.5 bg-[#ffffff] w-16  rounded-full" />
                )}
              </Link>

              {/* Search (button — opens overlay) */}
              <button
                onClick={() => setSearchOpen(true)}
                className={`relative flex items-center gap-2 px-4 h-16 font-medium cursor-pointer transition-colors duration-200
                  ${searchOpen
                    ? "text-[#F47521]"
                    : "text-gray-300 hover:text-white"
                  }`}
              >
                <span>Search</span>
                {searchOpen && (
                    <span className="absolute bottom-4 left-2 right-2 h-1 bg-[#ffffff] w-16  rounded-full" />
                )}
              </button>

              {/* Explore */}
              <Link
                href="/explore"
                className={`relative flex items-center gap-2 px-4 h-16 font-medium transition-colors duration-200
                  ${pathname === "/explore"
                    ? "bg-white/10  "
                    : "text-gray-300 hover:text-white"
                  }`}
              >
                <span>Explore</span>
                {pathname === "/explore" && (
                    <span className="absolute bottom-4 left-2 right-2 h-1 bg-[#ffffff] w-16  rounded-full" />
                )}
              </Link>

            </div>

            {/* Right */}
            <div className="flex items-center gap-3">

              <Link
                href="/login"
                className="
                  hidden
                  md:flex
                  items-center
                  rounded-2xl
                  border
                  border-white/20
                  bg-white/10
                  backdrop-blur-2xl
                  backdrop-saturate-200
                  shadow-[0_8px_32px_rgba(0,0,0,0.35)]
                  px-6
                  py-2
                  font-semibold
                  text-white
                  transition-all
                  duration-300
                  hover:bg-white/15
                  hover:border-white/30
                  hover:shadow-[0_12px_40px_rgba(255,255,255,0.08)]
                  active:scale-[0.98]
                "
              >
                Login
              </Link>

              {/* Mobile Button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="
                  md:hidden
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  text-white
                  hover:bg-white/10
                  transition
                "
              >
                {mobileOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>

            </div>

          </div>
        </div>

        {/* Mobile Menu — plain CSS transition */}
        <div
          className="md:hidden overflow-hidden border-t border-white/10 bg-[#111111] transition-all duration-300 ease-in-out"
          style={{
            maxHeight: mobileOpen ? "400px" : "0px",
            opacity: mobileOpen ? 1 : 0,
          }}
        >
          <div className="max-w-7xl mx-auto px-6 py-4 space-y-2">

            {/* Home */}
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors duration-200
                ${pathname === "/"
                  ? "text-[#F47521] border-l-2 border-[#F47521]"
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
            >
              Home
            </Link>

            {/* Search */}
            <button
              onClick={() => {
                setMobileOpen(false);
                setSearchOpen(true);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-gray-300
                         transition-colors duration-200 hover:bg-white/5 hover:text-white cursor-pointer"
            >
              Search
            </button>

            {/* Explore */}
            <Link
              href="/explore"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors duration-200
                ${pathname === "/explore"
                  ? "text-[#F47521] border-l-2 border-[#F47521]"
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
            >
              Explore
            </Link>

            <div className="border-t border-white/10 pt-4">

<Link
  href="/login"
  onClick={() => setMobileOpen(false)}
  className="
    block
    rounded-2xl
    border
    border-white/20
    bg-white/10
    backdrop-blur-2xl
    backdrop-saturate-200
    shadow-[0_8px_32px_rgba(0,0,0,0.35)]
    py-3
    text-center
    font-semibold
    text-white
    transition-all
    duration-300
    hover:bg-white/15
    hover:border-white/30
    hover:shadow-[0_12px_40px_rgba(255,255,255,0.08)]
    active:scale-[0.98]
  "
>
  Login
</Link>
            </div>

          </div>
        </div>
      </nav>

      <div className="h-16" />

      {/* ── Search Overlay ─────────────────────────────────────────────── */}
      {/* Backdrop + blur */}
      <div
        onClick={closeSearch}
        className="fixed inset-0 z-[100] transition-all duration-300 ease-in-out"
        style={{
          backgroundColor: searchOpen ? "rgba(0, 0, 0, 0.70)" : "rgba(0, 0, 0, 0)",
          backdropFilter: searchOpen ? "blur(12px)" : "blur(0px)",
          WebkitBackdropFilter: searchOpen ? "blur(12px)" : "blur(0px)",
          pointerEvents: searchOpen ? "auto" : "none",
        }}
      >
        {/* Search Container — centred, clicks don't propagate */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-0 left-0 right-0 flex justify-center transition-all duration-300 ease-out"
          style={{
            transform: searchOpen ? "translateY(0)" : "translateY(-30px)",
            opacity: searchOpen ? 1 : 0,
          }}
        >
          <div className="w-full max-w-2xl mx-4 mt-24 sm:mt-32">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search anime..."
                className="
                  w-full
                  rounded-2xl
                  bg-[#1a1a1a]
                  border
                  border-white/10
                  py-4
                  pl-14
                  pr-14
                  text-lg
                  text-white
                  placeholder-gray-500
                  outline-none
                  focus:border-[#F47521]/50
                  focus:ring-2
                  focus:ring-[#F47521]/20
                  transition-all
                  duration-300
                "
              />
              {/* Close button inside input */}
              <button
                onClick={closeSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg
                           flex items-center justify-center text-gray-400
                           hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hint */}
            <p className="text-center text-gray-500 text-sm mt-4">
              Press <kbd className="px-2 py-0.5 rounded bg-white/10 text-gray-400 text-xs font-mono">Esc</kbd> to close
            </p>

            {/* Results placeholder — you can wire this up later */}
            {searchQuery.trim().length > 0 && (
              <div
                className="mt-4 rounded-2xl bg-[#1a1a1a] border border-white/10 p-6 transition-all duration-300"
              >
                <p className="text-gray-400 text-sm text-center">
                  Search results for &ldquo;<span className="text-white font-medium">{searchQuery}</span>&rdquo; will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}