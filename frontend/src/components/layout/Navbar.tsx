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

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">

              {navLinks.map((link) => {
                const Icon = link.icon;

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="
                      group
                      flex
                      items-center
                      gap-2
                      rounded-xl
                      px-4
                      py-2.5
                      text-gray-300
                      transition-all
                      duration-300
                      hover:bg-white/5
                      hover:text-[#F47521]
                    "
                  >
                    <Icon className="w-5 h-5 transition group-hover:scale-110" />

                    <span className="font-medium">
                      {link.label}
                    </span>
                  </Link>
                );
              })}

            </div>

            {/* Right */}
            <div className="flex items-center gap-3">

              <Link
                href="/login"
                className="
                  hidden
                  md:flex
                  items-center
                  rounded-xl
                  bg-[#F47521]
                  px-6
                  py-2.5
                  font-semibold
                  text-white
                  transition
                  duration-300
                  hover:scale-105
                  hover:bg-orange-500
                  shadow-lg
                  shadow-orange-500/30
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

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              transition={{
                duration: 0.25,
              }}
              className="md:hidden overflow-hidden border-t border-white/10 bg-[#111111]"
            >
              <div className="max-w-7xl mx-auto px-6 py-4 space-y-2">

                {navLinks.map((link) => {
                  const Icon = link.icon;

                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        px-4
                        py-3
                        text-gray-300
                        transition
                        hover:bg-white/5
                        hover:text-[#F47521]
                      "
                    >
                      <Icon className="w-5 h-5" />
                      {link.label}
                    </Link>
                  );
                })}

                <div className="border-t border-white/10 pt-4">

                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="
                      block
                      rounded-xl
                      bg-[#F47521]
                      py-3
                      text-center
                      font-semibold
                      text-white
                      transition
                      hover:bg-orange-500
                    "
                  >
                    Login
                  </Link>

                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <div className="h-16" />
    </>
  );
}