"use client";

import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import type { OnboardingData } from "@/types";

interface Props {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function OnboardingStep2({ data, onChange, onNext, onBack }: Props) {
  const canProceed = data.details.trim().length >= 2;

  const config = {
    project: {
      title: "What is your project's name?",
      placeholder: "e.g., Acme SaaS, ProductX, My Startup...",
      label: "Project Name",
      hint: null,
    },
    blog: {
      title: "What should we call you?",
      placeholder: "Your name or nickname...",
      label: "Name / Nickname",
      hint: "You can always change this in settings or tell the AI directly which name to use in a specific post.",
    },
    other: {
      title: "Describe briefly",
      placeholder: "Tell us a bit about why you want to manage social media...",
      label: "Description",
      hint: null,
    },
  };

  const currentConfig = config[data.purpose || "other"];

  return (
    <div className="glass rounded-[20px] p-6 sm:p-10">
      <div className="text-center mb-8 sm:mb-9">
        <h2 className="font-['Outfit'] text-2xl sm:text-[28px] font-bold mb-3 text-[var(--text-primary)]">
          {currentConfig.title}
        </h2>
        <p className="text-[14px] sm:text-[15px] text-[var(--text-secondary)]">
          We will use this to generate posts tailored for you.
        </p>
      </div>
      <div className="mb-6">
        <label className="text-[13px] font-semibold text-[var(--text-secondary)] block mb-2">
          {currentConfig.label}
        </label>
        <input
          id="onboarding-details"
          type="text"
          className="input text-[16px] px-[18px] py-[14px]"
          value={data.details}
          onChange={(e) => onChange({ details: e.target.value })}
          placeholder={currentConfig.placeholder}
          autoFocus
        />
      </div>

      {currentConfig.hint && (
        <div className="flex gap-[10px] p-3 sm:p-4 bg-[rgba(26,115,82,0.08)] border border-[rgba(26,115,82,0.2)] rounded-xl mb-8">
          <Info size={16} color="#1a7352" className="shrink-0 mt-[2px]" />
          <p className="text-[12px] sm:text-[13px] text-[var(--text-secondary)] leading-relaxed">
            {currentConfig.hint}
          </p>
        </div>
      )}

      {!currentConfig.hint && <div className="mb-8" />}

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
