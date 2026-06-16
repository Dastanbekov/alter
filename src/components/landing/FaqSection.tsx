"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const PANEL_EASE = [0.16, 1, 0.3, 1] as const;
const EXPAND_SPRING = { type: "spring" as const, stiffness: 150, damping: 26, mass: 1.05 };
const COLLAPSE_SPRING = { type: "spring" as const, stiffness: 190, damping: 30, mass: 1.1 };

const FAQ_ITEMS = [
  {
    id: "free-limit",
    question: "How many free posts do I get?",
    answer: "Every user gets 1 free AI-generated post per day — no credit card required. The free limit resets at midnight. This covers casual usage perfectly.",
  },
  {
    id: "pro-unlock",
    question: "How do I unlock PRO features?",
    answer: "PRO is unlocked the moment you make any purchase. Even buying the smallest pack (10 posts for $2.50) instantly gives you access to the Kanban scheduling board, multi-platform generation, and advanced AI models.",
  },
  {
    id: "credits-expire",
    question: "Do purchased credits expire?",
    answer: "Never. Credits you buy are yours forever. There are no monthly fees or subscriptions — you just top up when you need more posts.",
  },
  {
    id: "multi-platform",
    question: "How does multi-platform generation work?",
    answer: "When writing a post, simply check the boxes for the platforms you want (LinkedIn, X, Telegram, Instagram...). Each platform checked consumes 1 credit. Alter will generate a separately optimized version for every platform in one shot.",
  },
  {
    id: "what-platforms",
    question: "Which social networks are supported?",
    answer: "Currently Alter supports LinkedIn, X (Twitter), and Telegram with direct posting. Support for Instagram, Facebook, YouTube, TikTok, WhatsApp, and Reddit is coming soon — you can already generate content for them.",
  },
  {
    id: "scheduling",
    question: "How does auto-posting and scheduling work?",
    answer: "PRO users get access to a visual Kanban calendar. You can schedule any post to be published at a specific time. Alter handles the publishing automatically — even while you sleep.",
  },
  {
    id: "ai-model",
    question: "Which AI model is used to generate posts?",
    answer: "Free users use our fast baseline model. PRO users get access to advanced models (GPT-4 level quality) that produce significantly longer, more nuanced, and platform-appropriate content.",
  },
];

function FaqRow({ item, isOpen, onToggle }: { item: typeof FAQ_ITEMS[0]; isOpen: boolean; onToggle: () => void }) {
  return (
    <div
      className={`rounded-[14px] bg-[#f5f3ee] overflow-hidden transition-colors duration-300 ${
        isOpen ? "border border-[rgba(26,115,82,0.2)]" : "border border-transparent"
      }`}
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-start justify-between gap-4 py-[18px] px-5 text-left bg-transparent border-none cursor-pointer outline-none focus:outline-none"
      >
        <span className="font-semibold text-[15px] text-[#1a1a1a] leading-[1.5] tracking-[-0.01em]">
          {item.question}
        </span>
        <ChevronDown
          size={18}
          color="#6b7280"
          className={`shrink-0 mt-0.5 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
        />
      </button>

      <motion.div
        animate={{ height: isOpen ? "auto" : 0 }}
        initial={false}
        transition={{ height: isOpen ? EXPAND_SPRING : COLLAPSE_SPRING }}
        className="overflow-hidden"
      >
        <motion.div
          animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -6 }}
          initial={false}
          transition={{
            opacity: { duration: isOpen ? 0.35 : 0.2, ease: PANEL_EASE, delay: isOpen ? 0.06 : 0 },
            y: isOpen ? EXPAND_SPRING : COLLAPSE_SPRING,
          }}
          className="px-5 pb-[18px] text-[14px] text-[#4a5568] leading-[1.7]"
        >
          {item.answer}
        </motion.div>
      </motion.div>
    </div>
  );
}

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0].id);

  const toggle = (id: string) => setOpenId((cur) => (cur === id ? null : id));

  return (
    <section
      id="faq"
      className="py-[80px] sm:py-[100px] px-6 lg:px-8 bg-gradient-to-b from-[#f8f6f0] to-[#ede8df]"
    >
      <div className="max-w-[720px] mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="font-['Outfit'] text-[clamp(28px,4vw,44px)] font-extrabold text-[#1a1a1a] mb-3.5">
            Frequently asked questions
          </h2>
          <p className="text-[16px] sm:text-[17px] text-[#4a5568] leading-[1.65]">
            Everything you need to know about Alter. Can&apos;t find an answer?{" "}
            <a href="mailto:hello@alter.app" className="text-[#1a7352] font-semibold underline decoration-[#1a7352] hover:text-[#155f43]">
              Contact us
            </a>
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <AnimatePresence initial={false} mode="popLayout">
            {FAQ_ITEMS.map((item) => (
              <motion.div
                key={item.id}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                initial={{ opacity: 0, y: 4 }}
                layout="position"
                transition={{ duration: 0.2, ease: PANEL_EASE }}
              >
                <FaqRow item={item} isOpen={openId === item.id} onToggle={() => toggle(item.id)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
