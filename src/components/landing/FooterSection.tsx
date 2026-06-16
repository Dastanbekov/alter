"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

export function FooterSection() {
  return (
    <footer className="bg-[#1a1a1a] border-t border-[rgba(255,255,255,0.06)] pt-[60px] pb-8 px-6 lg:px-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-10 lg:gap-12 mb-12">
          {/* Brand */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-10 sm:h-12 flex items-center justify-center">
                <img src="/logo.png" alt="Alter Logo" className="h-full w-auto object-contain brightness-[100]" />
              </div>
            </div>
            <p className="text-[14px] text-[#9ca3af] leading-[1.7] max-w-[280px] mb-5">
              AI-powered social media management for founders, creators, and agencies. One message — every platform.
            </p>
            <div className="flex gap-2.5">
              {[
                { label: "X", href: "#" },
                { label: "LinkedIn", href: "#" },
                { label: "GitHub", href: "#" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className="px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] text-[#9ca3af] text-[12px] font-semibold no-underline transition-all duration-200 hover:text-white hover:border-[rgba(255,255,255,0.2)]"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-[12px] font-bold text-[#6b7280] uppercase tracking-[0.1em] mb-4">
              Product
            </h4>
            {["Features", "Pricing", "FAQ", "Changelog"].map((item) => (
              <a
                key={item}
                href="#"
                className="block text-[14px] text-[#9ca3af] no-underline mb-2.5 transition-colors duration-200 hover:text-white"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[12px] font-bold text-[#6b7280] uppercase tracking-[0.1em] mb-4">
              Company
            </h4>
            {["About", "Blog", "Careers", "Contact"].map((item) => (
              <a
                key={item}
                href="#"
                className="block text-[14px] text-[#9ca3af] no-underline mb-2.5 transition-colors duration-200 hover:text-white"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[12px] font-bold text-[#6b7280] uppercase tracking-[0.1em] mb-4">
              Legal
            </h4>
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
              <a
                key={item}
                href="#"
                className="block text-[14px] text-[#9ca3af] no-underline mb-2.5 transition-colors duration-200 hover:text-white"
              >
                {item}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-[rgba(255,255,255,0.06)] flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <span className="text-[13px] text-[#6b7280]">© 2025 Alter. All rights reserved.</span>
          <span className="text-[13px] text-[#6b7280]">Made with ❤️ for creators everywhere</span>
        </div>
      </div>
    </footer>
  );
}
