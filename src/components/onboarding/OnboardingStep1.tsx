"use client";

import { Rocket, BookOpen, Lightbulb, ArrowRight } from "lucide-react";
import type { OnboardingData } from "@/types";

interface Props {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
}

const OPTIONS = [
  {
    value: "project" as const,
    icon: <Rocket size={28} />,
    color: "#1a7352",
    title: "Project",
    description: "A product, startup, business or company",
  },
  {
    value: "blog" as const,
    icon: <BookOpen size={28} />,
    color: "#a855f7",
    title: "Personal Blog",
    description: "Personal brand, expert content, or side project",
  },
  {
    value: "other" as const,
    icon: <Lightbulb size={28} />,
    color: "#f59e0b",
    title: "Other",
    description: "Something unique",
  },
];

export function OnboardingStep1({ data, onChange, onNext }: Props) {
  const canProceed = data.purpose !== null;

  return (
    <div className="glass rounded-[20px] p-6 sm:p-10">
      <div className="text-center mb-8 sm:mb-9">
        <h2 className="font-['Outfit'] text-2xl sm:text-[28px] font-bold mb-3 text-[var(--text-primary)]">
          Why do you want to manage social media?
        </h2>
        <p className="text-[14px] sm:text-[15px] text-[var(--text-secondary)]">
          This will help us customize the AI to best fit your goals.
        </p>
      </div>
      <div className="flex flex-col gap-3 mb-8">
        {OPTIONS.map((option) => {
          const isSelected = data.purpose === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onChange({ purpose: option.value })}
              className="flex items-center gap-4 sm:gap-5 p-4 sm:p-5 rounded-[14px] text-left transition-all duration-200 w-full"
              style={{
                border: `2px solid ${isSelected ? option.color : "var(--border)"}`,
                background: isSelected ? `${option.color}12` : "var(--surface-2)",
              }}
            >
              {/* Icon */}
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-[14px] flex items-center justify-center shrink-0 transition-all duration-200"
                style={{
                  background: isSelected ? `${option.color}20` : "var(--surface-3)",
                  border: `1px solid ${isSelected ? option.color + "40" : "var(--border)"}`,
                  color: isSelected ? option.color : "var(--text-muted)",
                }}
              >
                {option.icon}
              </div>

              {/* Text */}
              <div>
                <div
                  className="text-[15px] sm:text-[16px] font-bold mb-1 transition-colors duration-200"
                  style={{ color: isSelected ? "var(--text-primary)" : "var(--text-secondary)" }}
                >
                  {option.title}
                </div>
                <div className="text-[12px] sm:text-[13px] text-[var(--text-muted)]">
                  {option.description}
                </div>
              </div>

              {/* Check */}
              {isSelected && (
                <div
                  className="ml-auto w-5 h-5 sm:w-[22px] sm:h-[22px] rounded-full flex items-center justify-center shrink-0"
                  style={{ background: option.color }}
                >
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
                </div>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={onNext}
        disabled={!canProceed}
        className="btn btn-primary w-full h-[48px] text-[15px] group justify-center mt-4 sm:mt-0"
      >
        Next
        <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  );
}
