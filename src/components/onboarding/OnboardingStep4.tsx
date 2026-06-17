"use client";

import { ArrowLeft, CheckCircle2 } from "lucide-react";
import type { OnboardingData } from "@/types";

interface Props {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
  onFinish: () => void;
  onBack: () => void;
  loading: boolean;
}

const PLATFORM_LABELS: Record<string, string> = {
  linkedin: "💼 LinkedIn",
  x: "✕ X (Twitter)",
  telegram: "✈️ Telegram",
};

export function OnboardingStep4({ data, onChange, onFinish, onBack, loading }: Props) {
  const canFinish = data.workspaceName.trim().length >= 2;

  return (
    <div className="glass rounded-[20px] p-6 sm:p-10">
      <div className="text-center mb-8 sm:mb-9">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(26,115,82,0.2)] bg-gradient-to-br from-[#1a735220] to-[#2d9e6f20] border border-[rgba(26,115,82,0.3)]">
          <CheckCircle2 size={30} color="#1a7352" />
        </div>
        <h2 className="font-['Outfit'] text-2xl sm:text-[28px] font-bold mb-3 text-[var(--text-primary)]">
          What should we name your workspace?
        </h2>
        <p className="text-[14px] sm:text-[15px] text-[var(--text-secondary)]">
          This will be your workspace environment.
        </p>
      </div>
      {/* Summary of choices */}
      <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-[14px] p-4 sm:px-5 mb-6">
        <div className="text-[11px] sm:text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2.5">
          Your Settings
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-[12px] sm:text-[13px]">
            <span className="text-[var(--text-muted)]">Type</span>
            <span className="text-[var(--text-primary)] font-semibold">
              {data.purpose === "project" ? "🚀 Project" : data.purpose === "blog" ? "📝 Personal Blog" : "💡 Other"}
            </span>
          </div>
          <div className="flex justify-between text-[12px] sm:text-[13px]">
            <span className="text-[var(--text-muted)]">Details</span>
            <span className="text-[var(--text-primary)] font-semibold">{data.details || "—"}</span>
          </div>
          <div className="flex justify-between text-[12px] sm:text-[13px]">
            <span className="text-[var(--text-muted)]">Platforms</span>
            <span className="text-[var(--text-primary)] font-semibold text-right max-w-[60%] sm:max-w-none">
              {data.platforms.map((p) => PLATFORM_LABELS[p]).join(", ")}
            </span>
          </div>
        </div>
      </div>

      {/* Workspace name input */}
      <div className="mb-8">
        <label className="text-[13px] font-semibold text-[var(--text-secondary)] block mb-2">
          Workspace Name
        </label>
        <input
          id="onboarding-workspace-name"
          type="text"
          className="input text-[16px] px-[18px] py-[14px]"
          value={data.workspaceName}
          onChange={(e) => onChange({ workspaceName: e.target.value })}
          placeholder="e.g., My Workspace, Acme Corp..."
          autoFocus
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={loading}
          className="btn btn-secondary btn-lg flex-1 justify-center"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <button
          onClick={onFinish}
          disabled={!canFinish || loading}
          className="btn btn-primary btn-lg flex-[2] justify-center bg-gradient-to-br from-[#1a7352] to-[#2d9e6f]"
        >
          {loading ? (
            <div className="spinner w-[18px] h-[18px]" />
          ) : (
            <>
              🚀 Finish!
            </>
          )}
        </button>
      </div>
    </div>
  );
}
