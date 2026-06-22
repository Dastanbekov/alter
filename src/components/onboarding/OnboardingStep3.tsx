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
  
  const handleColorChange = (index: number, newColor: string) => {
    const newColors = [...(data.colors || [])];
    newColors[index] = newColor;
    onChange({ colors: newColors });
  };

  const handleAddColor = () => {
    onChange({ colors: [...(data.colors || []), "#000000"] });
  };

  const handleRemoveColor = (index: number) => {
    const newColors = [...(data.colors || [])];
    newColors.splice(index, 1);
    onChange({ colors: newColors });
  };

  return (
    <div className="glass rounded-[20px] p-6 sm:p-10">
      <div className="mb-8 border-b border-[var(--border)] pb-6">
        <h2 className="font-['Outfit'] text-[24px] sm:text-[28px] font-bold mb-2 text-[var(--text-primary)]">
          Here's your brand
        </h2>
        <p className="text-[14px] sm:text-[15px] text-[var(--text-secondary)]">
          We picked up your colors, and the way you talk. Tweak anything that looks or sounds off, so your posts stay on brand.
        </p>
      </div>

      <div className="flex flex-col gap-8 mb-8">
        
        {/* Colors */}
        <div>
          <label className="block text-[15px] font-semibold text-[var(--text-primary)] mb-3">
            Colors
          </label>
          <div className="flex flex-wrap gap-3">
            {(data.colors || []).map((color, i) => (
              <div key={i} className="flex items-center gap-2 bg-[var(--surface-1)] border border-[var(--border)] rounded-[8px] p-1.5 pr-3 relative group">
                <input
                  type="color"
                  value={color.startsWith('#') ? color : '#000000'}
                  onChange={(e) => handleColorChange(i, e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-none p-0"
                />
                <span className="text-[13px] font-medium uppercase">{color}</span>
                <button
                  onClick={() => handleRemoveColor(i)}
                  className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <button
              onClick={handleAddColor}
              className="w-11 h-11 rounded-[8px] border border-dashed border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--surface-2)] transition-colors"
            >
              +
            </button>
          </div>
        </div>

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
