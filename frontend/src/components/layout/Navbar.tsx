"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  Menu,
  X,
  Home,
  TrendingUp,
  Grid3X3,
  Bookmark,
  ListVideo,
  User as UserIcon,
  LogOut,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { axiosInstance } from "@/lib/axios";
import { useRouter } from "next/navigation";
import IconButton from "../buttons/IconButton";

// ─── Navbar ───────────────────────────────────────────────────────────────────
// Sticky premium navbar with search, nav links, and responsive mobile menu.
// ──────────────────────────────────────────────────────────────────────────────

const navLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "Popular", href: "#popular", icon: TrendingUp },
  { label: "Categories", href: "#categories", icon: Grid3X3 },
  { label: "Watchlist", href: "#watchlist", icon: Bookmark },
  { label: "Playlists", href: "#playlists", icon: ListVideo },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      clearAuth();
      router.push("/login");
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-border">
        <div className="container-main">
          <div className="flex items-center justify-between h-16">
            {/* ── Logo ───────────────────────────────────────────────────── */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-extrabold text-primary tracking-tight">
                Ani<span className="gradient-text-accent">Verse</span>
              </span>
            </Link>

            {/* ── Center Nav (Desktop) ───────────────────────────────────── */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-secondary
                             hover:text-primary hover:bg-surface rounded-lg
                             transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* ── Search Bar ─────────────────────────────────────────────── */}
            <div className="hidden md:flex items-center flex-1 max-w-sm mx-6">
              <div
                className={`relative w-full transition-all duration-200 ${
                  searchFocused ? "scale-[1.02]" : ""
                }`}
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                <input
                  type="text"
                  placeholder="Search anime..."
                  className="w-full pl-10 pr-4 py-2 text-sm bg-surface border border-border
                             rounded-xl text-primary placeholder:text-secondary/60
                             focus:outline-none focus:border-accent/50 focus:bg-white
                             focus:shadow-[0_0_0_3px_rgba(245,158,11,0.1)]
                             transition-all duration-200"
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
              </div>
            </div>

            {/* ── Right Side ─────────────────────────────────────────────── */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <IconButton
                icon={<Bell className="w-4 h-4" />}
                variant="ghost"
                size="sm"
                badge
                label="Notifications"
                className="hidden sm:flex"
              />

              {/* Auth Buttons */}
              {isAuthenticated ? (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium
                               text-secondary hover:text-primary hover:bg-surface
                               rounded-lg transition-all duration-200"
                  >
                    <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
                      <UserIcon className="w-3.5 h-3.5 text-accent" />
                    </div>
                    <span className="hidden md:inline">
                      {user?.username || "Profile"}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium
                               text-danger hover:bg-danger/5 rounded-lg
                               transition-all duration-200 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden md:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium
                               text-secondary hover:text-primary hover:bg-surface
                               rounded-xl border border-border
                               transition-all duration-200"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium
                               text-white bg-accent hover:bg-accent-secondary
                               rounded-xl shadow-sm hover:shadow-md
                               transition-all duration-200"
                  >
                    <UserPlus className="w-4 h-4" />
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center
                           text-secondary hover:bg-surface hover:text-primary
                           transition-all duration-200 cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ──────────────────────────────────────────────────── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden overflow-hidden border-t border-border bg-white"
            >
              <div className="container-main py-4 space-y-1">
                {/* Mobile Search */}
                <div className="md:hidden relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                  <input
                    type="text"
                    placeholder="Search anime..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-surface border border-border
                               rounded-xl text-primary placeholder:text-secondary/60
                               focus:outline-none focus:border-accent/50
                               transition-all duration-200"
                  />
                </div>

                {/* Nav Links */}
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium
                                 text-secondary hover:text-primary hover:bg-surface
                                 rounded-xl transition-all duration-200"
                    >
                      <Icon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  );
                })}

                {/* Mobile Auth */}
                <div className="sm:hidden border-t border-border pt-3 mt-3 space-y-1">
                  {isAuthenticated ? (
                    <>
                      <Link
                        href="/profile"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium
                                   text-secondary hover:text-primary hover:bg-surface
                                   rounded-xl transition-all duration-200"
                      >
                        <UserIcon className="w-4 h-4" />
                        {user?.username || "Profile"}
                      </Link>
                      <button
                        onClick={() => {
                          setMobileOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium
                                   text-danger hover:bg-danger/5 rounded-xl
                                   transition-all duration-200 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium
                                   text-secondary hover:text-primary hover:bg-surface
                                   rounded-xl transition-all duration-200"
                      >
                        <LogIn className="w-4 h-4" />
                        Login
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium
                                   text-white bg-accent hover:bg-accent-secondary
                                   rounded-xl transition-all duration-200"
                      >
                        <UserPlus className="w-4 h-4" />
                        Register
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-16" />
    </>
  );
}
