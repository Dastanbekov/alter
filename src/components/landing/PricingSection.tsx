"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

// Pricing logic: price per X posts
const PACKAGES = [
  { posts: 10, price: 3.0 },
  { posts: 50, price: 10.0 },
  { posts: 100, price: 18.0 },
  { posts: 200, price: 32.0 },
  { posts: 500, price: 69.0 },
];

function getPrice(posts: number): number {
  if (posts <= 10) return 3.0;
  if (posts <= 50) return 10.0;
  if (posts <= 100) return 18.0;
  if (posts <= 200) return 32.0;
  return (posts / 500) * 69.0;
}

function getPricePerPost(posts: number): string {
  return (getPrice(posts) / posts).toFixed(3);
}

function getDiscount(posts: number): number {
  const baseRate = 3.0 / 10; // $0.30 per post (smallest pack)
  const currentRate = getPrice(posts) / posts;
  return Math.round(((baseRate - currentRate) / baseRate) * 100);
}

export function PricingSection() {
  const [posts, setPosts] = useState(50);
  const price = getPrice(posts);
  const perPost = getPricePerPost(posts);
  const discount = getDiscount(posts);

  return (
    <section
      id="pricing"
      className="py-[100px] px-6 lg:px-8 bg-[#f8f6f0]"
    >
      <div className="max-w-[1050px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-['Outfit'] text-[clamp(32px,4vw,48px)] font-extrabold text-[#1a1a1a] mb-4">
            Pay for what you{" "}
            <span className="text-[#1a7352]">
              actually use
            </span>
          </h2>
          <p className="text-[16px] sm:text-[18px] text-[#4a5568] max-w-[500px] mx-auto leading-[1.65]">
            No monthly subscriptions. 1 free post daily. Top up credits when you need them — the more you buy, the less you pay per post.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-stretch">
          
          {/* Top Left: Pay-as-you-go Slider */}
          <div className="md:col-span-7 bg-white rounded-[32px] p-8 sm:p-10 border border-[#e5e5e5] shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300">
            <div className="absolute top-0 right-0 bg-[#ecfdf5] text-[#10b981] px-5 py-2.5 rounded-bl-[24px] font-bold text-[13px] border-b border-l border-[#10b981]/20">
              ✦ Pay-as-you-go
            </div>
            
            <div>
              <h3 className="text-[20px] font-bold mb-6 text-[#1a1a1a]">Calculate your credits</h3>
              
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-['Outfit'] text-[56px] font-extrabold text-[#1a1a1a] leading-none">
                  ${price.toFixed(2)}
                </span>
                <span className="text-[15px] text-[#9ca3af] font-medium">for {posts} posts</span>
              </div>
              
              <div className="flex items-center gap-3 mb-10">
                <span className="text-[15px] text-[#6b7280]">
                  = <strong className="text-[#1a1a1a]">${perPost}</strong> per post
                </span>
                {discount > 0 && (
                  <span className="bg-[#ecfdf5] text-[#10b981] px-3 py-1 rounded-full text-[13px] font-bold border border-[#10b981]/20">
                    {discount}% cheaper
                  </span>
                )}
              </div>
            </div>

            <div>
              {/* Slider Area */}
              <div className="bg-[#f9f9f9] rounded-[20px] p-6 mb-8 border border-[#f0f0f0]">
                <div className="flex justify-between mb-4">
                  <span className="font-bold text-[#1a1a1a]">{posts} posts</span>
                  <span className="font-bold text-[#1a7352]">${price.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={posts}
                  onChange={(e) => setPosts(Number(e.target.value))}
                  className="w-full accent-[#1a7352] h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between mt-3 text-[12px] text-[#9ca3af] font-medium">
                  <span>10 posts</span>
                  <span>500 posts</span>
                </div>
              </div>

              {/* Packages */}
              <div className="flex gap-2.5 flex-wrap">
                {PACKAGES.map((pkg) => (
                  <button
                    key={pkg.posts}
                    onClick={() => setPosts(pkg.posts)}
                    className={`px-4 py-2 rounded-full text-[13px] font-bold cursor-pointer transition-all duration-200 ${
                      posts === pkg.posts
                        ? "bg-[#1a7352] text-white shadow-md border-transparent"
                        : "bg-white border border-[#e5e5e5] text-[#6b7280] hover:border-[#1a7352]/30 hover:text-[#1a1a1a]"
                    }`}
                  >
                    {pkg.posts} → ${pkg.price}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Top Right: PRO Features */}
          <div className="md:col-span-5 bg-[#1a7352] rounded-[32px] p-8 sm:p-10 shadow-[0_12px_40px_rgba(26,115,82,0.2)] text-white flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] bg-white/10 rounded-full blur-3xl pointer-events-none transition-transform duration-700 group-hover:scale-150"></div>
            
            <div className="relative z-10">
              <h3 className="text-[26px] font-bold mb-2 text-white">PRO Features</h3>
              <p className="text-white/80 text-[15px] mb-10 leading-[1.6]">Included with every top-up. You get full access to the platform instantly.</p>
              
              <ul className="flex flex-col gap-5">
                {[
                  "Unlocks PRO status instantly",
                  "Kanban scheduling board",
                  "Multi-platform generation",
                  "Credits never expire",
                  "Advanced AI models",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3.5">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-[2px]">
                      <Check size={13} className="text-white" strokeWidth={3} />
                    </div>
                    <span className="text-[15px] font-medium leading-[1.4] text-white/95">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-12 relative z-10">
              <Link href="/register" className="flex items-center justify-center gap-2 w-full py-4 bg-white text-[#1a7352] rounded-xl font-bold text-[16px] hover:bg-[#f0f0f0] transition-colors shadow-lg group-hover:shadow-xl">
                Top up when ready <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          {/* Bottom: Free Plan (Full Width) */}
          <div className="md:col-span-12 bg-white rounded-[32px] p-8 sm:p-12 border border-[#e5e5e5] shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300">
            <div className="flex-1 max-w-lg">
              <div className="inline-block bg-[#f3f4f6] text-[#4b5563] px-3.5 py-1.5 rounded-[8px] text-[12px] font-bold uppercase tracking-[0.1em] mb-4">
                Free Forever
              </div>
              <h3 className="text-[32px] font-bold text-[#1a1a1a] mb-3">
                $0 <span className="text-[16px] text-gray-500 font-medium">/ no credit card required</span>
              </h3>
              <p className="text-[16px] text-[#6b7280] leading-[1.6]">
                Start creating and publishing content with no upfront cost. Perfect for casual users and trying out the platform.
              </p>
            </div>
            
            <div className="flex-1 w-full border-t md:border-t-0 md:border-l border-gray-200 pt-8 md:pt-0 md:pl-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6">
                {[
                  "1 free post per day",
                  "LinkedIn, X, Telegram",
                  "AI content generation",
                  "1 workspace",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <div className="w-[22px] h-[22px] rounded-full bg-[#ecfdf5] border border-[#10b981]/20 flex items-center justify-center shrink-0">
                      <Check size={12} className="text-[#10b981]" strokeWidth={3} />
                    </div>
                    <span className="text-[15px] text-[#374151] font-medium">{f}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-start">
                <Link href="/register" className="px-8 py-3.5 bg-[#f5f5f5] hover:bg-[#e5e5e5] text-[#1a1a1a] rounded-xl font-bold text-[15px] transition-colors border border-[#e5e5e5] hover:border-[#d1d5db]">
                  Get started for free
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
