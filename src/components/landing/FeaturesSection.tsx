"use client";

import { Check, Sparkles, PenTool } from "lucide-react";

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-[100px] px-6 lg:px-8 bg-[#f8f6f0]"
    >
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-[60px] sm:mb-[80px]">
          <h2 className="font-['Outfit'] text-[clamp(32px,4vw,48px)] font-extrabold text-[#1a1a1a] mb-4">
            Everything you need to{" "}
            <span className="bg-gradient-to-br from-[#1a7352] to-[#2d9e6f] text-transparent bg-clip-text">
              grow online
            </span>
          </h2>
          <p className="text-[16px] sm:text-[18px] text-[#4a5568] max-w-[520px] mx-auto leading-[1.65]">
            From AI writing to cross-platform publishing — Alter handles the entire content workflow so you can focus on building.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
          
          {/* Card 1: Top Left - 5 cols */}
          <div className="md:col-span-5 bg-white rounded-[32px] p-8 md:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#e5e5e5] flex flex-col justify-between min-h-[420px] group transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
            <div className="relative flex-1 bg-gradient-to-br from-[#f8f9fa] to-white rounded-[20px] border border-[#e5e5e5] p-6 flex flex-col justify-center items-center mb-8 overflow-hidden">
               <div className="w-[90%] bg-white rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-[#f0f0f0] p-5 relative z-10 group-hover:-translate-y-2 transition-transform duration-500">
                  <div className="flex gap-2 mb-5 overflow-hidden">
                    <span className="bg-[#ecfdf5] text-[#1a7352] text-[11px] font-bold px-3 py-1.5 rounded-full border border-[#1a7352]/20">Professional</span>
                    <span className="bg-gray-50 text-gray-400 text-[11px] font-semibold px-3 py-1.5 rounded-full border border-gray-100">Engaging</span>
                    <span className="bg-gray-50 text-gray-400 text-[11px] font-semibold px-3 py-1.5 rounded-full border border-gray-100">Humorous</span>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 w-full bg-gray-100 rounded-full"></div>
                    <div className="h-2 w-[85%] bg-gray-100 rounded-full"></div>
                    <div className="h-2 w-[60%] bg-gray-100 rounded-full"></div>
                  </div>
                  <div className="mt-6 p-3 bg-gradient-to-r from-[#eef5f2] to-white rounded-lg border border-[#e5f0eb] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-[#1a7352]" />
                      <span className="text-[11px] font-bold text-[#1a7352]">Perfectly tailored</span>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-[#1a7352] flex items-center justify-center shadow-md">
                      <Check size={12} className="text-white" strokeWidth={3} />
                    </div>
                  </div>
               </div>
               {/* Background decors */}
               <div className="absolute top-[-20px] left-[-20px] w-24 h-24 bg-green-100/50 rounded-full blur-2xl"></div>
               <div className="absolute bottom-[-20px] right-[-20px] w-32 h-32 bg-blue-50/50 rounded-full blur-2xl"></div>
            </div>

            <div>
              <h3 className="text-[22px] font-bold text-[#1a1a1a] mb-3">Precision generation</h3>
              <p className="text-[15px] text-[#666] leading-[1.6]">Forget the mirage of incorrect outputs. With Alter, your content is crafted perfectly for every platform, every time.</p>
            </div>
          </div>

          {/* Card 2: Top Right - 7 cols */}
          <div className="md:col-span-7 bg-white rounded-[32px] p-8 md:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#e5e5e5] flex flex-col relative overflow-hidden min-h-[420px] group transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
             <div className="md:w-[60%] z-10 relative">
               <h3 className="text-[22px] font-bold text-[#1a1a1a] mb-3">Seamless Multi-Platform</h3>
               <p className="text-[15px] text-[#666] leading-[1.6]">Easily generate content for LinkedIn, X, and Telegram. Watch your workflow flow like dunes in a gentle desert breeze.</p>
             </div>
             
             {/* Visual - Floating file icons mimicking the image */}
             <div className="absolute right-[-10%] bottom-[-15%] w-[80%] h-[90%] md:w-[75%] md:h-[100%] flex items-end justify-end pointer-events-none">
                <div className="relative w-full h-full">
                  <div className="absolute right-[10%] bottom-[15%] w-[320px] h-[220px] bg-[#f5f5f5] rounded-[32px] rotate-[-4deg]"></div>
                  
                  {/* Icons */}
                  <div className="absolute right-[45%] bottom-[25%] w-[100px] h-[130px] bg-[#1a7352] rounded-[16px] shadow-[0_16px_40px_rgba(26,115,82,0.3)] rotate-[-12deg] flex flex-col items-center justify-end pb-5 group-hover:rotate-[-16deg] group-hover:-translate-y-2 transition-all duration-500">
                    <div className="absolute top-0 right-0 w-[36px] h-[36px] bg-[#125039] rounded-bl-[16px]"></div>
                    <span className="text-white font-bold text-2xl">LI</span>
                  </div>
                  <div className="absolute right-[25%] bottom-[20%] w-[100px] h-[130px] bg-[#1a1a1a] rounded-[16px] shadow-[0_16px_40px_rgba(0,0,0,0.3)] rotate-[5deg] flex flex-col items-center justify-end pb-5 z-10 group-hover:rotate-[0deg] group-hover:-translate-y-4 transition-all duration-500">
                    <div className="absolute top-0 right-0 w-[36px] h-[36px] bg-[#333] rounded-bl-[16px]"></div>
                    <span className="text-white font-bold text-[32px] leading-none">𝕏</span>
                  </div>
                  <div className="absolute right-[5%] bottom-[30%] w-[100px] h-[130px] bg-[#229ED9] rounded-[16px] shadow-[0_16px_40px_rgba(34,158,217,0.3)] rotate-[18deg] flex flex-col items-center justify-end pb-5 group-hover:rotate-[24deg] group-hover:-translate-y-1 transition-all duration-500">
                    <div className="absolute top-0 right-0 w-[36px] h-[36px] bg-[#1b7bad] rounded-bl-[16px]"></div>
                    <span className="text-white font-bold text-2xl">TG</span>
                  </div>
                </div>
             </div>
          </div>

          {/* Card 3: Bottom Left - 4 cols */}
          <div className="md:col-span-4 bg-white rounded-[32px] p-8 md:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#e5e5e5] flex flex-col justify-between min-h-[380px] group transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
             <div className="relative mb-12 flex justify-center items-center h-[140px]">
                {/* Avatars */}
                <div className="flex items-center justify-center">
                   <div className="w-[44px] h-[44px] rounded-full bg-[#f5f5f5] border-2 border-white flex items-center justify-center text-[20px] shadow-sm relative translate-x-[20px] opacity-70 group-hover:-translate-y-1 transition-transform duration-300 delay-100">👩‍💼</div>
                   <div className="w-[52px] h-[52px] rounded-full bg-[#f5f5f5] border-2 border-white flex items-center justify-center text-[24px] shadow-sm relative translate-x-[10px] z-10 opacity-80 group-hover:-translate-y-2 transition-transform duration-300 delay-75">👨‍🏫</div>
                   <div className="w-[64px] h-[64px] rounded-full bg-[#ecfdf5] border-2 border-[#10b981] flex items-center justify-center text-[32px] shadow-[0_4px_20px_rgba(16,185,129,0.3)] relative z-20 group-hover:-translate-y-3 transition-transform duration-300">😎</div>
                   <div className="w-[52px] h-[52px] rounded-full bg-[#f5f5f5] border-2 border-white flex items-center justify-center text-[24px] shadow-sm relative -translate-x-[10px] z-10 opacity-80 group-hover:-translate-y-2 transition-transform duration-300 delay-75">👩‍🎤</div>
                   <div className="w-[44px] h-[44px] rounded-full bg-[#f5f5f5] border-2 border-white flex items-center justify-center text-[20px] shadow-sm relative -translate-x-[20px] opacity-70 group-hover:-translate-y-1 transition-transform duration-300 delay-100">👴</div>
                </div>
                {/* Tooltip */}
                <div className="absolute top-[-10px] bg-[#4a5568] text-white text-[12px] font-semibold px-4 py-2 rounded-full flex items-center gap-2 shadow-lg z-30 group-hover:-translate-y-2 transition-transform duration-300">
                   <PenTool size={14} className="text-white/80" /> Expert copywriter
                   <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#4a5568] rotate-45 rounded-[2px]"></div>
                </div>
             </div>
             
             <div>
               <h3 className="text-[22px] font-bold text-[#1a1a1a] mb-3">Personalized Tones</h3>
               <p className="text-[15px] text-[#666] leading-[1.6]">Alter offers a selection of specialized personas, each designed to excel in specific areas.</p>
             </div>
          </div>

          {/* Card 4: Bottom Right - 8 cols */}
          <div className="md:col-span-8 bg-white rounded-[32px] p-8 md:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#e5e5e5] flex flex-col justify-between min-h-[380px] group transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] overflow-hidden relative">
             <div className="relative z-20">
               <h3 className="text-[22px] font-bold text-[#1a1a1a] mb-3">Intelligent conversational AI</h3>
               <p className="text-[15px] text-[#666] leading-[1.6] max-w-[400px]">Harness advanced models like GPT, Claude, and Gemini for insightful, tailored interactions that drive creativity and solutions.</p>
             </div>
             
             {/* Visual - AI Models */}
             <div className="absolute right-[5%] bottom-[-5%] w-[80%] h-[100%] flex flex-col justify-center items-end pointer-events-none z-10 opacity-90">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>

                <div className="flex flex-col gap-3.5 w-full max-w-[280px] mr-10 relative z-10">
                   {/* Claude Model */}
                   <div className="bg-white/90 backdrop-blur-sm px-4 py-3.5 rounded-[16px] border border-gray-100 flex items-center gap-3 shadow-[0_8px_24px_rgba(0,0,0,0.04)] transform translate-x-4 group-hover:-translate-y-1 group-hover:-translate-x-0 transition-transform duration-500 delay-100">
                     <div className="w-9 h-9 rounded-full bg-[#f8f6f0] border border-[#eee] flex items-center justify-center">
                        <span className="font-serif text-[#1a1a1a] font-bold text-lg">C</span>
                     </div>
                     <div>
                        <div className="text-[14px] font-bold text-[#1a1a1a] leading-tight mb-0.5">Claude 3.5</div>
                        <div className="text-[11px] text-gray-500 font-medium">Creative & Nuanced</div>
                     </div>
                   </div>

                   {/* Alter Model (Active) */}
                   <div className="bg-white px-5 py-4 rounded-[18px] border border-[#e5f0eb] flex items-center gap-4 shadow-[0_16px_40px_rgba(26,115,82,0.15)] transform -translate-x-6 z-10 group-hover:-translate-y-2 transition-transform duration-500 ring-4 ring-[#f8f6f0]">
                     <div className="w-11 h-11 rounded-full bg-[#1a7352] flex items-center justify-center shadow-inner">
                        {/* Custom Alter A logo */}
                        <span className="font-['Outfit'] font-black text-white text-[22px] italic leading-none pr-[2px]">A</span>
                     </div>
                     <div className="flex-1">
                        <div className="text-[16px] font-black text-[#1a1a1a] leading-tight mb-1 tracking-wide">ALTER-AI</div>
                        <div className="text-[11px] text-[#1a7352] font-bold uppercase tracking-wider">Optimized for Social</div>
                     </div>
                     <div className="w-5 h-5 rounded-full bg-[#ecfdf5] border border-[#10b981]/30 flex items-center justify-center shadow-sm">
                        <Check size={12} className="text-[#10b981]" strokeWidth={3} />
                     </div>
                   </div>

                   {/* GPT Model */}
                   <div className="bg-white/90 backdrop-blur-sm px-4 py-3.5 rounded-[16px] border border-gray-100 flex items-center gap-3 shadow-[0_8px_24px_rgba(0,0,0,0.04)] transform translate-x-2 group-hover:-translate-y-1 transition-transform duration-500 delay-200">
                     <div className="w-9 h-9 rounded-full bg-[#f8f6f0] border border-[#eee] flex items-center justify-center text-gray-600 font-bold">
                        GPT
                     </div>
                     <div>
                        <div className="text-[14px] font-bold text-[#1a1a1a] leading-tight mb-0.5">GPT-4o</div>
                        <div className="text-[11px] text-gray-500 font-medium">General Purpose</div>
                     </div>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}
