"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Search,
  Compass,
  Menu,
  X,
} from "lucide-react";

const navLinks = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "Search",
    href: "/search",
    icon: Search,
  },
  {
    label: "Explore",
    href: "/explore",
    icon: Compass,
  },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-border">
        <div className="container-main">
          <div className="flex h-16 items-center justify-between">

            {/* ================= Logo ================= */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-md">
                <span className="text-white text-lg font-bold">A</span>
              </div>

              <span className="text-2xl font-extrabold tracking-tight text-primary">
                Ani
                <span className="text-accent">Verse</span>
              </span>
            </Link>

            {/* ================= Desktop Navigation ================= */}
            <div className="hidden md:flex items-center gap-8">

              {navLinks.map((link) => {
                const Icon = link.icon;

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="flex items-center gap-2 text-secondary hover:text-primary transition font-medium"
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}

            </div>

            {/* ================= Right ================= */}
            <div className="flex items-center gap-3">

              <Link
                href="/login"
                className="hidden md:flex px-5 py-2.5 rounded-xl bg-accent text-white font-medium hover:opacity-90 transition"
              >
                Login
              </Link>

              {/* Mobile Menu */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface transition"
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

        {/* ================= Mobile Menu ================= */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden overflow-hidden border-t bg-white"
            >
              <div className="container-main py-4 space-y-2">

                {navLinks.map((link) => {
                  const Icon = link.icon;

                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-surface transition"
                    >
                      <Icon className="w-5 h-5" />
                      {link.label}
                    </Link>
                  );
                })}

                <div className="border-t pt-4">

                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full rounded-xl bg-accent py-3 text-center font-semibold text-white hover:opacity-90 transition"
                  >
                    Login
                  </Link>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}