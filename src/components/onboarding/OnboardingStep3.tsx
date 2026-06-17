"use client";

import { ArrowLeft, ArrowRight, Info, Lock } from "lucide-react";
import type { OnboardingData, SocialPlatform } from "@/types";

interface Props {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const PLATFORMS: {
  value: SocialPlatform;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  available: boolean;
}[] = [
  {
    value: "linkedin",
    label: "LinkedIn",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    description: "Professional content, B2B audience",
    color: "#0a66c2",
    available: true,
  },
  {
    value: "x",
    label: "X (Twitter)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    description: "Short-form, viral content, tech community",
    color: "#e7e9ea",
    available: true,
  },
  {
    value: "telegram",
    label: "Telegram",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
    description: "Channel posts, community updates",
    color: "#229ed9",
    available: true,
  },
];

const COMING_SOON = [
  { label: "Instagram", icon: "📸", color: "#e1306c" },
  { label: "Threads", icon: "🧵", color: "#000000" },
];

export function OnboardingStep3({ data, onChange, onNext, onBack }: Props) {
  const canProceed = data.platforms.length > 0;

  const toggle = (platform: SocialPlatform) => {
    const platforms = data.platforms.includes(platform)
      ? data.platforms.filter((p) => p !== platform)
      : [...data.platforms, platform];
    onChange({ platforms });
  };

  return (
    <div className="glass rounded-[20px] p-6 sm:p-10">
      <div className="text-center mb-8 sm:mb-9">
        <h2 className="font-['Outfit'] text-2xl sm:text-[28px] font-bold mb-3 text-[var(--text-primary)]">
          Select Platforms
        </h2>
        <p className="text-[14px] sm:text-[15px] text-[var(--text-secondary)]">
          Where do you plan to publish?
        </p>
      </div>
      {/* Available platforms */}
      <div className="flex flex-col gap-2.5 mb-5">
        {PLATFORMS.map((platform) => {
          const isSelected = data.platforms.includes(platform.value);
          return (
            <button
              key={platform.value}
              onClick={() => toggle(platform.value)}
              className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-[14px] text-left transition-all duration-200 w-full"
              style={{
                border: `2px solid ${isSelected ? platform.color : "var(--border)"}`,
                background: isSelected ? `${platform.color}12` : "var(--surface-2)",
              }}
            >
              <div
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200"
                style={{
                  background: isSelected ? `${platform.color}20` : "var(--surface-3)",
                  color: isSelected ? platform.color : "var(--text-muted)",
                }}
              >
                {platform.icon}
              </div>
              <div className="flex-1">
                <div
                  className="text-[14px] sm:text-[15px] font-bold mb-0.5"
                  style={{ color: isSelected ? "var(--text-primary)" : "var(--text-secondary)" }}
                >
                  {platform.label}
                </div>
                <div className="text-[11px] sm:text-[12px] text-[var(--text-muted)]">
                  {platform.description}
                </div>
              </div>
              {/* Checkbox */}
              <div
                className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] rounded-md flex items-center justify-center shrink-0 transition-all duration-200"
                style={{
                  border: `2px solid ${isSelected ? platform.color : "var(--border)"}`,
                  background: isSelected ? platform.color : "transparent",
                }}
              >
                {isSelected && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Coming soon */}
      <div className="mb-6">
        <div className="text-[11px] sm:text-[12px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2.5">
          Coming soon
        </div>
        <div className="flex flex-wrap gap-2.5">
          {COMING_SOON.map((p) => (
            <div
              key={p.label}
              className="flex items-center gap-2 px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-[10px] opacity-50 cursor-not-allowed"
            >
              <Lock size={12} color="var(--text-muted)" />
              <span className="text-[12px] sm:text-[13px] text-[var(--text-muted)]">
                {p.icon} {p.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hint */}
      <div className="flex gap-[10px] p-3 sm:p-4 bg-[rgba(26,115,82,0.08)] border border-[rgba(26,115,82,0.2)] rounded-xl mb-7">
        <Info size={15} color="#1a7352" className="shrink-0 mt-[1px]" />
        <p className="text-[11px] sm:text-[12px] text-[var(--text-secondary)] leading-relaxed">
          You can connect your social accounts in settings later. For now, the AI will simply know which formats to generate content for.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="btn btn-secondary btn-lg flex-1 justify-center"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="btn btn-primary btn-lg flex-[2] justify-center"
        >
          Next
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
