"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import type { OnboardingData } from "@/types";
import toast from "react-hot-toast";

interface Props {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
}

export function OnboardingStep4({ data, onChange, onNext }: Props) {
  const generatedRef = useRef(false);

  useEffect(() => {
    if (generatedRef.current) return;
    generatedRef.current = true;

    const generateStrategy = async () => {
      try {
        const res = await fetch("/api/ai/generate-strategy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Failed to generate strategy");

        const strategy = await res.json();
        
        onChange({
          angle: strategy.angle,
          strategyChecklist: strategy.checklist,
        });
        
        onNext();
      } catch (e: any) {
        toast.error("Could not generate strategy. Let's finish up anyway.");
        onNext();
      }
    };

    generateStrategy();
  }, [data, onChange, onNext]);

  return (
    <div className="glass rounded-[20px] p-6 sm:p-10 flex flex-col items-center justify-center min-h-[300px]">
      <Loader2 size={48} className="animate-spin text-[#1a7352] mb-6" />
      <h2 className="font-['Outfit'] text-[24px] sm:text-[28px] font-bold mb-2 text-[var(--text-primary)] text-center">
        Generating strategy for you...
      </h2>
      <p className="text-[15px] text-[var(--text-secondary)] text-center max-w-[400px]">
        We are analyzing your brand and crafting the perfect angle and actionable tasks to dominate your niche.
      </p>
    </div>
  );
}
