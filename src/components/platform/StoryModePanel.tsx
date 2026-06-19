"use client";

import { useState, useEffect } from "react";
import { ArrowRight, CheckCircle, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import type { Story, StoryNode, Workspace, SocialPlatform } from "@/types";
import { StoryCanvas, StoryCanvasSkeleton } from "./StoryCanvas";

type Step = "brief" | "questions" | "generating" | "canvas" | "approved";

interface Question {
  id: string;
  label: string;
  type: "text" | "multiselect";
  options?: string[];
}

interface Props {
  workspace: Workspace;
  onBillingUpdate: () => void;
}

const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  linkedin: "LinkedIn",
  x: "X / Twitter",
  telegram: "Telegram",
};

export function StoryModePanel({ workspace, onBillingUpdate }: Props) {
  const [step, setStep] = useState<Step>("brief");
  const [brief, setBrief] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([]);
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const wsPlats = workspace.socials.map((s) => s.platform as SocialPlatform);
    setSelectedPlatforms(wsPlats.length > 0 ? wsPlats : ["linkedin"]);
  }, [workspace]);

  // ── Step 1: Submit brief, get questions from AI ───────────────────────────
  const handleBriefSubmit = async () => {
    const text = brief.trim();
    if (!text) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/story-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: workspace.id, brief: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to start campaign planning");
        return;
      }
      if (data.phase === "questions") {
        const generatedQuestions = data.data.questions || [];
        setQuestions(generatedQuestions);
        
        if (generatedQuestions.length === 0) {
          // No questions needed, proceed immediately to plan generation
          setStep("generating");
          const planRes = await fetch("/api/ai/story-plan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              workspaceId: workspace.id,
              brief: text,
              answers: { platforms: selectedPlatforms },
              platforms: selectedPlatforms,
            }),
          });
          const planData = await planRes.json();
          if (!planRes.ok) throw new Error(planData.error || "Failed to generate plan");
          if (planData.phase === "plan") {
            const saveRes = await fetch("/api/stories", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                workspaceId: workspace.id,
                title: planData.data.title,
                brief: text,
                platforms: selectedPlatforms,
                nodes: planData.data.nodes,
              }),
            });
            const saved = await saveRes.json();
            if (!saveRes.ok) throw new Error("Failed to save campaign");
            onBillingUpdate();
            setStory(saved);
            setStep("canvas");
          }
        } else {
          setStep("questions");
        }
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Submit answers, generate campaign plan ────────────────────────
  const handleAnswersSubmit = async () => {
    setStep("generating");
    try {
      const res = await fetch("/api/ai/story-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace.id,
          brief: brief.trim(),
          answers: { ...answers, platforms: selectedPlatforms },
          platforms: selectedPlatforms,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "insufficient_credits") {
          toast.error(`Not enough credits. Available: ${data.totalAvailable}`);
        } else {
          toast.error(data.error || "Failed to generate campaign");
        }
        setStep("questions");
        return;
      }

      if (data.phase === "plan") {
        // Save story to DB
        const saveRes = await fetch("/api/stories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspaceId: workspace.id,
            title: data.data.title,
            brief: brief.trim(),
            platforms: selectedPlatforms,
            nodes: data.data.nodes,
          }),
        });
        const saved = await saveRes.json();
        if (!saveRes.ok) {
          toast.error("Failed to save campaign");
          setStep("questions");
          return;
        }
        onBillingUpdate();
        setStory(saved);
        setStep("canvas");
      }
    } catch {
      toast.error("Something went wrong");
      setStep("questions");
    }
  };

  // ── Approve campaign ──────────────────────────────────────────────────────
  const handleApprove = async (updatedNodes: StoryNode[]) => {
    if (!story) return;
    const res = await fetch(`/api/stories/${story.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodes: updatedNodes }),
    });
    if (res.ok) {
      const updated = await res.json();
      setStory(updated);
      setStep("approved");
      toast.success("Campaign approved! All posts scheduled 🎉");
    } else {
      toast.error("Failed to approve campaign");
    }
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setStep("brief");
    setBrief("");
    setQuestions([]);
    setAnswers({});
    setSelectedPlatforms([]);
    setStory(null);
  };

  const togglePlatform = (p: SocialPlatform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  // ────────────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────────────

  // After approval: show approved banner inside canvas
  if (step === "approved" && story) {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <StoryCanvas
          story={{ ...story, status: "approved" }}
          workspace={workspace}
          readOnly
        />
        <div className="shrink-0 border-t border-[var(--border)] bg-[var(--surface-1)] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#22c55e] text-[13px] font-semibold">
            <CheckCircle size={16} />
            {story.nodes.length} posts scheduled
          </div>
          <button onClick={handleReset} className="btn btn-ghost btn-sm gap-1.5">
            <RotateCcw size={13} /> New Campaign
          </button>
        </div>
      </div>
    );
  }

  // Generating skeleton
  if (step === "generating") {
    return <StoryCanvasSkeleton />;
  }

  // Graph canvas view
  if (step === "canvas" && story) {
    return (
      <StoryCanvas
        story={story}
        workspace={workspace}
        onApprove={handleApprove}
        onNodesChange={(nodes) => setStory({ ...story, nodes })}
      />
    );
  }

  // ── Step 0: Brief entry ────────────────────────────────────────────────
  if (step === "brief") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        <div className="w-full max-w-[560px] text-center">
          <div className="text-[40px] mb-3">🗺️</div>
          <h2 className="font-['Outfit'] text-[22px] font-bold text-[var(--text-primary)] mb-2">
            Start a Content Campaign
          </h2>
          <p className="text-[14px] text-[var(--text-secondary)] mb-8 leading-relaxed">
            Describe what you&apos;re launching, announcing, or telling the world. AI will craft a full
            multi-post campaign with optimal timing.
          </p>

          <div
            className="rounded-[16px] border border-[var(--border)] bg-[var(--surface-2)] p-4 text-left"
            style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}
          >
            <textarea
              className="w-full bg-transparent text-[14px] text-[var(--text-primary)] resize-none outline-none leading-relaxed placeholder:text-[var(--text-muted)]"
              placeholder={`Describe your campaign briefly…\n\nE.g. "We just launched our new AI writing tool for indie hackers. I want to build hype over 2 weeks on LinkedIn and Telegram."`}
              rows={5}
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleBriefSubmit();
              }}
            />
            {/* Native Platform Selector */}
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-2.5">
                Which platforms should we publish on?
              </label>
              <div className="flex gap-2">
                {(["linkedin", "x", "telegram"] as SocialPlatform[]).map((opt) => {
                  const isSelected = selectedPlatforms.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => togglePlatform(opt)}
                      className="px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all duration-200 cursor-pointer"
                      style={{
                        borderColor: isSelected ? "#1a7352" : "var(--border)",
                        background: isSelected ? "rgba(26,115,82,0.15)" : "var(--surface-3)",
                        color: isSelected ? "#1a7352" : "var(--text-secondary)",
                      }}
                    >
                      {PLATFORM_LABELS[opt]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end mt-4">
              <button
                onClick={handleBriefSubmit}
                disabled={!brief.trim() || loading}
                className="btn btn-primary px-5 py-2.5"
                style={{
                  background: "linear-gradient(135deg, #1a7352, #2d9e6f)",
                  boxShadow: "0 4px 14px rgba(26,115,82,0.3)",
                }}
              >
                {loading ? (
                  <div className="spinner w-4 h-4" />
                ) : (
                  <>
                    Plan Campaign
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-3">
            Tip: Ctrl/⌘ + Enter to submit
          </p>
        </div>
      </div>
    );
  }

  // ── Step 1: Clarifying questions ───────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col items-center justify-start p-6 overflow-y-auto">
      <div className="w-full max-w-[560px] pt-4">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-[#1a7352] uppercase tracking-wider bg-[rgba(26,115,82,0.12)] px-2 py-0.5 rounded-full">
              Step 2 of 2
            </span>
          </div>
          <h2 className="font-['Outfit'] text-[20px] font-bold text-[var(--text-primary)] mt-2">
            A few quick questions
          </h2>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1">
            Help AI tailor the campaign to your exact needs.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          {questions.map((q) => {
            if (q.type === "multiselect" && q.options) {
              return (
                <div key={q.id}>
                  <label className="block text-[13px] font-semibold text-[var(--text-secondary)] mb-2.5">
                    {q.label}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((opt) => {
                      const isSelected = selectedPlatforms.includes(opt as SocialPlatform);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => togglePlatform(opt as SocialPlatform)}
                          className="px-4 py-2 rounded-full text-[13px] font-semibold border transition-all duration-200 cursor-pointer"
                          style={{
                            borderColor: isSelected ? "#1a7352" : "var(--border)",
                            background: isSelected ? "rgba(26,115,82,0.15)" : "var(--surface-2)",
                            color: isSelected ? "#1a7352" : "var(--text-secondary)",
                          }}
                        >
                          {PLATFORM_LABELS[opt as SocialPlatform] || opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            }

            return (
              <div key={q.id}>
                <label className="block text-[13px] font-semibold text-[var(--text-secondary)] mb-2">
                  {q.label}
                </label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="Your answer…"
                  value={(answers[q.id] as string) || ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                  }
                />
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handleReset}
            className="btn btn-ghost btn-sm gap-1.5 text-[var(--text-muted)]"
          >
            <RotateCcw size={13} /> Start over
          </button>
          <button
            onClick={handleAnswersSubmit}
            disabled={selectedPlatforms.length === 0}
            className="btn btn-primary px-6 py-2.5"
            style={{
              background: "linear-gradient(135deg, #1a7352, #2d9e6f)",
              boxShadow: "0 4px 14px rgba(26,115,82,0.3)",
            }}
          >
            Generate Campaign
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
