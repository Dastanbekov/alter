"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, ArrowLeft, BookOpen, Zap, Check } from "lucide-react";
import type { SocialPlatform } from "@/types";

type Phase = "choose" | "prompt" | "questions" | "platforms" | "generating" | "done";

interface ClarifyingQuestion {
  id: string;
  label: string;
}

const PLATFORM_OPTIONS: {
  value: SocialPlatform;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}[] = [
  {
    value: "linkedin",
    label: "LinkedIn",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    color: "#0a66c2",
    description: "Professional, B2B",
  },
  {
    value: "x",
    label: "X (Twitter)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    color: "#1a1a1a",
    description: "Short-form, viral",
  },
  {
    value: "telegram",
    label: "Telegram",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
    color: "#229ed9",
    description: "Channel, community",
  },
];

const FIXED_QUESTIONS: ClarifyingQuestion[] = [
  { id: "audience", label: "Who is your target audience?" },
  { id: "tone", label: "What tone should the content have? (professional / friendly / inspiring)" },
  { id: "cta", label: "Any specific call-to-action you want to include?" },
];

interface Props {
  workspaceId: string;
  workspaceName: string;
  onComplete: (data?: { context: string; posts?: any[]; story?: any }) => void;
}

export function DashboardOnboarding({ workspaceId, workspaceName, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>("choose");
  const [contentType, setContentType] = useState<"post" | "story" | null>(null);
  const [prompt, setPrompt] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(["linkedin", "x", "telegram"]);
  const [error, setError] = useState("");
  const [generatedData, setGeneratedData] = useState<{ context: string; posts?: any[]; story?: any } | null>(null);

  const allQuestionsAnswered = FIXED_QUESTIONS.every((q) => answers[q.id]?.trim().length > 0);
  const canGenerate = selectedPlatforms.length > 0;

  const togglePlatform = (p: SocialPlatform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleGenerate = async () => {
    setPhase("generating");
    setError("");
    try {
      const context = prompt;

      if (contentType === "story") {
        const planRes = await fetch("/api/ai/story-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspaceId,
            brief: context,
            answers: { platforms: ["linkedin", "x", "telegram"] },
            platforms: ["linkedin", "x", "telegram"],
          }),
        });
        const planData = await planRes.json();
        if (!planRes.ok) throw new Error(planData.error || "Failed to generate story plan");

        if (planData.phase === "plan") {
          const saveRes = await fetch("/api/stories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              workspaceId,
              title: planData.data.title,
              brief: context,
              platforms: ["linkedin", "x", "telegram"],
              nodes: planData.data.nodes,
            }),
          });
          const saved = await saveRes.json();
          if (!saveRes.ok) throw new Error("Failed to save story");

          setGeneratedData({ context, story: saved });
          setPhase("done");
        } else {
          throw new Error("Story generation requires additional info. Please use the dashboard for stories.");
        }
      } else {
        const res = await fetch("/api/ai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            context,
            workspaceId,
            platforms: selectedPlatforms,
            isTourGeneration: true, // billing: skip credit deduction
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Generation failed");
        }

        const responseData = await res.json();
        setGeneratedData({ context, posts: responseData.posts });
        setPhase("done");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setPhase("prompt");
    }
  };

  const content = (
    <div
      className="fixed inset-0 z-[8000] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-white rounded-[24px] shadow-[0_24px_80px_rgba(0,0,0,0.25)] w-full max-w-[520px] overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-[rgba(26,115,82,0.1)] rounded-full flex items-center justify-center">
              <Zap size={12} color="#1a7352" />
            </div>
            <span className="text-[12px] font-semibold text-[#1a7352] uppercase tracking-wider">
              First Generation · Free
            </span>
          </div>
          <h2 className="font-['Outfit'] text-[20px] font-bold text-[var(--text-primary)]">
            {phase === "choose" && "What do you want to create?"}
            {phase === "prompt" && "What's happening?"}
            {phase === "generating" && "Generating your content..."}
            {phase === "done" && "Your posts are ready! 🎉"}
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5">

          {/* ──── Phase: Choose ──── */}
          {phase === "choose" && (
            <div className="flex flex-col gap-3">
              {/* Story */}
              <button
                onClick={() => { setContentType("story"); setPhase("prompt"); }}
                className="flex gap-4 p-4 rounded-[14px] text-left border-2 border-[var(--border)] hover:border-[#1a7352] hover:bg-[rgba(26,115,82,0.04)] transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-xl bg-[rgba(26,115,82,0.1)] flex items-center justify-center shrink-0 group-hover:bg-[rgba(26,115,82,0.15)] transition-colors">
                  <BookOpen size={20} color="#1a7352" />
                </div>
                <div>
                  <div className="font-bold text-[15px] text-[var(--text-primary)] mb-1">Story</div>
                  <div className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                    A series of connected posts that tell one narrative: a product launch, founder journey, or behind-the-scenes. Published automatically on schedule.
                  </div>
                </div>
              </button>

              {/* Post */}
              <button
                onClick={() => { setContentType("post"); setPhase("prompt"); }}
                className="flex gap-4 p-4 rounded-[14px] text-left border-2 border-[var(--border)] hover:border-[#1a7352] hover:bg-[rgba(26,115,82,0.04)] transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-xl bg-[rgba(26,115,82,0.1)] flex items-center justify-center shrink-0 group-hover:bg-[rgba(26,115,82,0.15)] transition-colors">
                  <Zap size={20} color="#1a7352" />
                </div>
                <div>
                  <div className="font-bold text-[15px] text-[var(--text-primary)] mb-1">Post</div>
                  <div className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                    One bright post for multiple platforms at once. Perfect for news, milestones and quick updates. Generated instantly.
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* ──── Phase: Prompt ──── */}
          {phase === "prompt" && (
            <div>
              <p className="text-[13px] text-[var(--text-secondary)] mb-3">
                Tell Alter what happened — a milestone, news, idea, or anything you want to share.
              </p>
              <textarea
                className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-[12px] px-4 py-3 text-[14px] outline-none focus:border-[#1a7352] transition-colors resize-none leading-relaxed"
                rows={5}
                autoFocus
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  contentType === "story"
                    ? "e.g., We're launching our product next week after 2 years of building. Share our founder journey..."
                    : "e.g., We just hit $10k MRR! Want to share this milestone with our community..."
                }
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setPhase("choose")}
                  className="btn btn-secondary flex-1 justify-center"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={prompt.trim().length < 10}
                  className="btn btn-primary flex-[2] justify-center"
                >
                  Generate
                </button>
              </div>
            </div>
          )}

          {/* ──── Phase: Generating ──── */}
          {phase === "generating" && (
            <div className="flex flex-col items-center py-8 gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-[rgba(26,115,82,0.1)] flex items-center justify-center">
                  <Zap size={28} color="#1a7352" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-[#1a7352] border-t-transparent animate-spin" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-[15px] text-[var(--text-primary)] mb-1">
                  Crafting your posts...
                </p>
                <p className="text-[13px] text-[var(--text-secondary)]">
                  Alter is writing perfectly tailored content for {selectedPlatforms.join(", ")}
                </p>
              </div>
            </div>
          )}

          {/* ──── Phase: Done ──── */}
          {phase === "done" && (
            <div className="flex flex-col items-center py-6 gap-5 text-center">
              <div className="text-[56px] leading-none">🎉</div>
              <div>
                <h3 className="font-['Outfit'] font-bold text-[20px] text-[var(--text-primary)] mb-2">
                  You&apos;re a natural!
                </h3>
                <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed max-w-[380px]">
                  Your first posts are ready in the workspace. Now you know how Alter works — keep creating amazing content!
                </p>
              </div>
              <button
                onClick={() => onComplete(generatedData || undefined)}
                className="btn btn-primary px-8 py-3 text-[15px] justify-center"
              >
                Go to my workspace →
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}
