"use client";

import { useState } from "react";
import { OnboardingStep1 } from "./OnboardingStep1";
import { OnboardingStep2 } from "./OnboardingStep2";
import { OnboardingStep3 } from "./OnboardingStep3";
import { OnboardingStep4 } from "./OnboardingStep4";
import { OnboardingStep5 } from "./OnboardingStep5";
import type { OnboardingData } from "@/types";

const TOTAL_STEPS = 5;

interface Props {
  onComplete: (data: OnboardingData) => Promise<void>;
}

export function WorkspaceFormFlow({ onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    purpose: "project",
    details: "",
    platforms: ["linkedin", "x", "telegram"],
    workspaceName: "",
    website: "",
    services: [],
    colors: [],
    fonts: [],
    brandStyle: [],
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
        className="w-full max-w-[640px] relative z-10 mx-auto px-4 sm:px-0 fade-in"
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
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <OnboardingStep4
            data={data}
            onChange={(updates) => setData((d) => ({ ...d, ...updates }))}
            onNext={() => setStep(5)}
          />
        )}
        {step === 5 && (
          <OnboardingStep5
            data={data}
            onChange={(updates) => setData((d) => ({ ...d, ...updates }))}
            onFinish={handleFinish}
            loading={loading}
          />
        )}
      </div>
    </>
  );
}
