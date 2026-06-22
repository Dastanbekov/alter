"use client";

import { ArrowRight, Sparkles, Loader2 } from "lucide-react";
import type { OnboardingData } from "@/types";

interface Props {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
  onFinish: () => void;
  loading: boolean;
}

export function OnboardingStep5({ data, onChange, onFinish, loading }: Props) {
  return (
    <div className="glass rounded-[20px] p-6 sm:p-10">
      <div className="mb-8 border-b border-[var(--border)] pb-6 text-center">
        <div className="w-16 h-16 bg-[#1a7352]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#1a7352]">
          <Sparkles size={32} />
        </div>
        <h2 className="font-['Outfit'] text-[24px] sm:text-[28px] font-bold mb-2 text-[var(--text-primary)]">
          Your Marketing Strategy is Ready
        </h2>
        <p className="text-[14px] sm:text-[15px] text-[var(--text-secondary)]">
          Here is what we predict if you follow our suggestions.
        </p>
      </div>

      <div className="mb-8 bg-[var(--surface-1)] border border-[var(--border)] rounded-[16px] p-6">
        <h3 className="text-[14px] font-bold text-[var(--text-primary)] mb-3 uppercase tracking-wider text-[#1a7352]">
          Your Angle
        </h3>
        <p className="text-[16px] text-[var(--text-secondary)] leading-relaxed font-medium italic">
          "{data.angle || "Your brand is unique and has great potential to reach the right audience with the correct approach."}"
        </p>
      </div>

      <div className="text-center text-[14px] text-[var(--text-muted)] mb-8 max-w-[400px] mx-auto">
        When you proceed, we'll set up your workspace with actionable strategy suggestions based on this angle.
      </div>

      <div className="flex justify-center pt-6 mt-8">
        <button
          onClick={onFinish}
          disabled={loading}
          className="flex items-center gap-2 bg-[#d14f3b] text-white px-8 py-3 rounded-[12px] font-semibold hover:bg-[#b84331] transition-colors shadow-sm disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Creating Workspace...
            </>
          ) : (
            <>
              Go to Workspace <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
