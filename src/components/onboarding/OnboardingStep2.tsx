"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import type { OnboardingData } from "@/types";

interface Props {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function OnboardingStep2({ data, onChange, onNext, onBack }: Props) {
  const canProceed = data.workspaceName.trim() && data.details.trim();

  return (
    <div className="glass rounded-[20px] p-6 sm:p-10">
      <div className="mb-8 border-b border-[var(--border)] pb-6">
        <h2 className="font-['Outfit'] text-[24px] sm:text-[28px] font-bold mb-2 text-[var(--text-primary)]">
          Here's what we learned about you
        </h2>
        <p className="text-[14px] sm:text-[15px] text-[var(--text-secondary)]">
          We pulled this from your website. Have a look and fix anything that's not quite right.
        </p>
      </div>

      <div className="flex flex-col gap-6 mb-8">
        <div>
          <label className="block text-[14px] font-medium text-[var(--text-primary)] mb-2">
            Business name
          </label>
          <input
            type="text"
            value={data.workspaceName}
            onChange={(e) => onChange({ workspaceName: e.target.value })}
            className="w-full bg-[var(--surface-1)] border border-[var(--border)] rounded-[12px] px-4 py-3 text-[15px] focus:outline-none focus:border-[#1a7352]"
          />
        </div>

        <div>
          <label className="block text-[14px] font-medium text-[var(--text-primary)] mb-2">
            Description
          </label>
          <textarea
            value={data.details}
            onChange={(e) => onChange({ details: e.target.value })}
            rows={5}
            className="w-full bg-[var(--surface-1)] border border-[var(--border)] rounded-[12px] px-4 py-3 text-[15px] focus:outline-none focus:border-[#1a7352] resize-y"
          />
        </div>

        <div>
          <label className="block text-[14px] font-medium text-[var(--text-primary)] mb-2">
            Services
          </label>
          <input
            type="text"
            value={(data.services || []).join(", ")}
            onChange={(e) => onChange({ services: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
            placeholder="e.g. Web Development, UI/UX Design"
            className="w-full bg-[var(--surface-1)] border border-[var(--border)] rounded-[12px] px-4 py-3 text-[15px] focus:outline-none focus:border-[#1a7352]"
          />
          <span className="text-[12px] text-[var(--text-muted)] mt-1.5 block">Separate with commas</span>
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-[var(--border)] mt-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-[12px] font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-2)] transition-colors"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="flex items-center gap-2 bg-[#d14f3b] text-white px-6 py-2.5 rounded-[12px] font-semibold hover:bg-[#b84331] transition-colors disabled:opacity-50"
        >
          Continue <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
