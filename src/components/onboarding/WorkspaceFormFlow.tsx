"use client";

import { useState } from "react";
import { OnboardingStep1 } from "./OnboardingStep1";
import { OnboardingStep2 } from "./OnboardingStep2";
import { OnboardingStep3 } from "./OnboardingStep3";
import type { OnboardingData } from "@/types";

// Platforms step removed — user picks platforms during the in-dashboard tour/first generation
const TOTAL_STEPS = 3;

interface Props {
  onComplete: (data: OnboardingData) => Promise<void>;
}

export function WorkspaceFormFlow({ onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    purpose: null,
    details: "",
    // Default to all platforms; user picks specific ones during the first generation tour
    platforms: ["linkedin", "x", "telegram"],
    workspaceName: "",
  });

  const handleFinish = async () => {
    setLoading(true);
    try {
      await onComplete(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Progress bar */}
      <div className="w-full max-w-[560px] mb-8 relative z-10 mx-auto px-4 sm:px-0">
        <div className="flex justify-between mb-2">
          <span className="text-[13px] text-[var(--text-secondary)]">Step {step} of {TOTAL_STEPS}</span>
          <span className="text-[13px] text-[var(--text-muted)]">{Math.round((step / TOTAL_STEPS) * 100)}%</span>
        </div>
        <div className="h-1 bg-[var(--surface-3)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${(step / TOTAL_STEPS) * 100}%`,
              background: "linear-gradient(90deg, #1a7352, #2d9e6f)",
            }}
          />
        </div>
      </div>

      {/* Step content */}
      <div
        className="w-full max-w-[560px] relative z-10 mx-auto px-4 sm:px-0 fade-in"
        key={step}
      >
        {step === 1 && (
          <OnboardingStep1
            data={data}
            onChange={(updates) => setData((d) => ({ ...d, ...updates }))}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <OnboardingStep2
            data={data}
            onChange={(updates) => setData((d) => ({ ...d, ...updates }))}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <OnboardingStep3
            data={data}
            onChange={(updates) => setData((d) => ({ ...d, ...updates }))}
            onFinish={handleFinish}
            onBack={() => setStep(2)}
            loading={loading}
          />
        )}
      </div>
    </>
  );
}
