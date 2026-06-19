"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Zap } from "lucide-react";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        scrolled ? "bg-[rgba(248,246,240,0.92)] backdrop-blur-[20px] border-b border-[rgba(0,0,0,0.08)]" : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-[60px] sm:h-[68px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="h-10 sm:h-14 flex items-center justify-center">
              <img src="/logo.png" alt="Alter Logo" className="h-full w-auto object-contain" style={{ filter: "brightness(0)" }} />
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 rounded-lg text-gray-700 no-underline text-[14px] font-medium transition-all duration-200 hover:text-[#1a1a1a] hover:bg-black/5"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-gray-700 no-underline text-[14px] font-medium hover:text-[#1a1a1a] transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center px-4 py-2 bg-[#1a1a1a] text-white rounded-lg text-[14px] font-bold no-underline transition-all duration-200 border-2 border-[#1a1a1a] hover:bg-white hover:text-[#1a1a1a]"
            >
              Try for free
            </Link>
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-gray-700 focus:outline-none"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-[rgba(248,246,240,0.95)] backdrop-blur-md absolute top-full left-0 w-full border-b border-[rgba(0,0,0,0.08)] shadow-lg">
            <div className="flex flex-col px-4 pt-2 pb-6 gap-2">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-gray-800 text-[16px] font-medium hover:bg-black/5 rounded-lg transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="h-px bg-gray-200 my-2 mx-2"></div>
              <Link
                href="/login"
                className="px-4 py-3 text-gray-800 text-[16px] font-medium hover:bg-black/5 rounded-lg transition-colors text-center"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="mx-2 mt-2 py-3 bg-[#1a1a1a] text-white rounded-lg text-[16px] font-bold text-center border-2 border-[#1a1a1a] hover:bg-white hover:text-[#1a1a1a] transition-all"
              >
                Try for free
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
