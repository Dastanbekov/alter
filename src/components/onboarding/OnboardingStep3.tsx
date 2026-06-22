"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Upload, X } from "lucide-react";
import type { OnboardingData } from "@/types";

interface Props {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function OnboardingStep3({ data, onChange, onNext, onBack }: Props) {
  // Simplified for now - no actual file upload logic, just simple string inputs/displays 
  // corresponding to the mockup
  
  return (
    <div className="glass rounded-[20px] p-6 sm:p-10">
      <div className="mb-8 border-b border-[var(--border)] pb-6">
        <h2 className="font-['Outfit'] text-[24px] sm:text-[28px] font-bold mb-2 text-[var(--text-primary)]">
          Here's your brand
        </h2>
        <p className="text-[14px] sm:text-[15px] text-[var(--text-secondary)]">
          We picked up your brand style, and the way you talk. Tweak anything that looks or sounds off, so your posts stay on brand.
        </p>
      </div>

      <div className="flex flex-col gap-8 mb-8">
        {/* Fonts */}
        <div>
          <label className="block text-[15px] font-semibold text-[var(--text-primary)] mb-3">
            Fonts
          </label>
          <input
            type="text"
            value={(data.fonts || []).join(", ")}
            onChange={(e) => onChange({ fonts: e.target.value.split(",").map(f => f.trim()).filter(Boolean) })}
            placeholder="e.g. Inter, Roboto"
            className="w-full bg-[var(--surface-1)] border border-[var(--border)] rounded-[12px] px-4 py-3 text-[15px] focus:outline-none focus:border-[#1a7352]"
          />
        </div>

        {/* Tone of voice */}
        <div>
          <label className="block text-[15px] font-semibold text-[var(--text-primary)] mb-3">
            Tone of voice
          </label>
          <textarea
            value={data.toneOfVoice || ""}
            onChange={(e) => onChange({ toneOfVoice: e.target.value })}
            rows={3}
            className="w-full bg-[var(--surface-1)] border border-[var(--border)] rounded-[12px] px-4 py-3 text-[15px] focus:outline-none focus:border-[#1a7352] resize-y"
          />
        </div>

        {/* Who you speak to */}
        <div>
          <label className="block text-[15px] font-semibold text-[var(--text-primary)] mb-3">
            Who you speak to
          </label>
          <input
            type="text"
            value={data.targetAudience || ""}
            onChange={(e) => onChange({ targetAudience: e.target.value })}
            placeholder="e.g. businesses and developers"
            className="w-full bg-[var(--surface-1)] border border-[var(--border)] rounded-[12px] px-4 py-3 text-[15px] focus:outline-none focus:border-[#1a7352]"
          />
        </div>

        {/* Brand Style */}
        <div>
          <label className="block text-[15px] font-semibold text-[var(--text-primary)] mb-3">
            Brand style
          </label>
          <input
            type="text"
            value={(data.brandStyle || []).join(", ")}
            onChange={(e) => onChange({ brandStyle: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
            placeholder="e.g. technological, ambitious, energetic"
            className="w-full bg-[var(--surface-1)] border border-[var(--border)] rounded-[12px] px-4 py-3 text-[15px] focus:outline-none focus:border-[#1a7352]"
          />
          <span className="text-[12px] text-[var(--text-muted)] mt-1 block">Separate with commas</span>
        </div>

        {/* Tagline */}
        <div>
          <label className="block text-[15px] font-semibold text-[var(--text-primary)] mb-3">
            Tagline
          </label>
          <input
            type="text"
            value={data.tagline || ""}
            onChange={(e) => onChange({ tagline: e.target.value })}
            placeholder="e.g. Real food, made with love"
            className="w-full bg-[var(--surface-1)] border border-[var(--border)] rounded-[12px] px-4 py-3 text-[15px] focus:outline-none focus:border-[#1a7352]"
          />
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
          className="flex items-center gap-2 bg-[#d14f3b] text-white px-6 py-2.5 rounded-[12px] font-semibold hover:bg-[#b84331] transition-colors"
        >
          Continue <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
