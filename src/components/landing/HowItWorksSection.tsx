"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PenTool, Sparkles, Send } from "lucide-react";

const steps = [
  {
    id: 0,
    title: "Define your needs",
    icon: PenTool,
    description: "Just tell Alter what happened. Share an update, a milestone, or an idea. Our AI assistant will ask the right questions to gather context.",
    Mockup: ({ isActive }: { isActive: boolean }) => (
      <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] bg-white rounded-t-xl border border-b-0 border-black/10 shadow-lg overflow-hidden transition-all duration-500 flex flex-col ${isActive ? 'h-[55%]' : 'h-[40%]'}`}>
        {/* Fake Browser header */}
        <div className="bg-[#f5f5f5] px-3 py-2 flex gap-1.5 border-b border-black/5 shrink-0">
          <div className="w-2 h-2 rounded-full bg-red-400"></div>
          <div className="w-2 h-2 rounded-full bg-amber-400"></div>
          <div className="w-2 h-2 rounded-full bg-green-400"></div>
        </div>
        <div className="p-4 flex flex-col gap-3 overflow-hidden">
           <div className="self-end bg-[#1a7352] text-white text-[11px] px-3 py-2 rounded-[12px_12px_2px_12px] max-w-[80%] shadow-sm shrink-0">
             We hit $10k MRR today!
           </div>
           {isActive && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="self-start bg-[#f0f0f0] text-gray-700 text-[11px] px-3 py-2 rounded-[12px_12px_12px_2px] max-w-[90%] shadow-sm shrink-0">
               Awesome! To craft the perfect post, could you specify:
               <div className="mt-2 flex flex-col gap-1.5">
                  <div className="bg-white rounded px-2 py-1.5 border border-gray-200 text-gray-400 text-[10px]">Target audience...</div>
                  <div className="bg-white rounded px-2 py-1.5 border border-gray-200 text-gray-400 text-[10px]">Desired tone...</div>
               </div>
             </motion.div>
           )}
        </div>
      </div>
    ),
  },
  {
    id: 1,
    title: "AI Generation",
    icon: Sparkles,
    description: "Alter's AI instantly drafts tailored posts for LinkedIn, X, Telegram, and more, optimizing for each platform's unique style.",
    Mockup: ({ isActive }: { isActive: boolean }) => (
      <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[95%] bg-white rounded-t-xl border border-b-0 border-black/10 shadow-lg overflow-hidden transition-all duration-500 flex gap-3 p-4 bg-gradient-to-b from-[#f9f9f9] to-white ${isActive ? 'h-[55%]' : 'h-[35%]'}`}>
        {/* Mockup cards representing platforms */}
        {isActive ? (
          <>
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex-1 bg-white border border-gray-200 rounded-xl p-3 flex flex-col shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-[#0A66C2] rounded flex items-center justify-center text-white font-bold text-[11px]">in</div>
                <div className="h-2 w-12 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-1.5 mb-3">
                <div className="h-1.5 w-full bg-gray-100 rounded"></div>
                <div className="h-1.5 w-full bg-gray-100 rounded"></div>
                <div className="h-1.5 w-2/3 bg-gray-100 rounded"></div>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex-1 bg-white border border-gray-200 rounded-xl p-3 flex flex-col shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-black rounded flex items-center justify-center text-white font-bold text-[13px] leading-none">𝕏</div>
                <div className="h-2 w-12 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-1.5 mb-3">
                <div className="h-1.5 w-full bg-gray-100 rounded"></div>
                <div className="h-1.5 w-5/6 bg-gray-100 rounded"></div>
                <div className="h-1.5 w-1/2 bg-gray-100 rounded"></div>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex-1 bg-white border border-gray-200 rounded-xl p-3 flex flex-col shadow-sm hidden sm:flex">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-[#229ED9] rounded flex items-center justify-center text-white font-bold text-[10px]">TG</div>
                <div className="h-2 w-12 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-1.5 mb-3">
                <div className="h-1.5 w-full bg-gray-100 rounded"></div>
                <div className="h-1.5 w-3/4 bg-gray-100 rounded"></div>
              </div>
            </motion.div>
          </>
        ) : (
          <div className="w-full flex justify-center gap-3 pt-2">
             <div className="w-8 h-8 bg-[#0A66C2] rounded-lg shadow-md flex items-center justify-center text-white text-[12px] font-bold">in</div>
             <div className="w-8 h-8 bg-black rounded-lg shadow-md flex items-center justify-center text-white text-[16px] font-bold leading-none">𝕏</div>
             <div className="w-8 h-8 bg-[#229ED9] rounded-lg shadow-md flex items-center justify-center text-white text-[12px] font-bold">TG</div>
          </div>
        )}
      </div>
    ),
  },
  {
    id: 2,
    title: "Publish & Schedule",
    icon: Send,
    description: "Review your posts, request quick revisions, and launch your campaigns instantly or schedule them for later.",
    Mockup: ({ isActive }: { isActive: boolean }) => (
      <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[85%] bg-white rounded-t-xl border border-b-0 border-black/10 shadow-lg overflow-hidden transition-all duration-500 flex flex-col ${isActive ? 'h-[55%]' : 'h-[40%]'}`}>
        <div className="bg-[#f5f5f5] px-3 py-2 flex gap-1.5 border-b border-black/5 shrink-0">
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
        </div>
        <div className="flex-1 flex items-start justify-center p-4 pt-6">
           {isActive ? (
             <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <div className="w-24 h-2 bg-gray-200 rounded-full mb-2"></div>
                <div className="w-16 h-2 bg-gray-100 rounded-full mb-5"></div>
                <div className="bg-[#1a7352] text-white text-[11px] font-bold px-5 py-2 rounded-full shadow-md">
                  View Calendar
                </div>
             </motion.div>
           ) : (
             <div className="w-10 h-10 bg-green-50 text-green-300 rounded-full flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
             </div>
           )}
        </div>
      </div>
    ),
  },
];

export function HowItWorksSection() {
  const [activeId, setActiveId] = useState(0);

  return (
    <section id="how-it-works" className="py-24 px-6 lg:px-8 bg-white">
      <div className="max-w-[1100px] mx-auto text-center mb-[60px]">
        <h2 className="font-['Outfit'] text-[clamp(32px,4vw,48px)] font-extrabold text-[#1a1a1a] mb-4">
          How Alter Works
        </h2>
        <p className="text-[16px] sm:text-[18px] text-[#4a5568] max-w-[600px] mx-auto leading-[1.65]">
          From concept to campaign, Alter streamlines every step of content creation, allowing you to generate and schedule posts in minutes.
        </p>
      </div>

      <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row h-auto md:h-[600px] gap-4">
        {steps.map((step) => {
          const isActive = activeId === step.id;
          return (
            <motion.div
              layout
              key={step.id}
              onMouseEnter={() => setActiveId(step.id)}
              className={`relative rounded-[32px] cursor-pointer overflow-hidden transition-colors duration-500 ${
                isActive ? "md:w-[50%] bg-[#eef5f2]" : "md:w-[25%] bg-[#f8f9fa] hover:bg-[#f0f0f0]"
              }`}
            >
              <div className="p-8 md:p-10 z-20 relative">
                <div className="flex items-center gap-3 mb-4">
                  <step.icon size={22} className={isActive ? "text-[#1a7352]" : "text-[#1a1a1a]"} />
                  <h3 className={`font-bold text-[18px] md:text-[20px] transition-colors duration-300 ${isActive ? "text-[#1a1a1a]" : "text-[#1a1a1a]"}`}>
                    {step.title}
                  </h3>
                </div>
                <AnimatePresence>
                  {isActive && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-[15px] text-[#555] leading-[1.6] max-w-[400px]"
                    >
                      {step.description}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* The Mockup area */}
              <div className="absolute bottom-0 left-0 w-full h-full pointer-events-none z-10">
                <step.Mockup isActive={isActive} />
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <div className="flex justify-center mt-12">
        <a
          href="/register"
          className="inline-flex items-center justify-center px-8 py-3.5 bg-[#1a7352] hover:bg-[#155f43] text-white rounded-full text-[15px] font-bold no-underline transition-all duration-200 shadow-lg"
        >
          Get started
        </a>
      </div>
    </section>
  );
}
