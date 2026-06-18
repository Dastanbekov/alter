"use client";

import { useState } from "react";
import { CheckCircle, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import type { Story, StoryNode, SocialPlatform, Workspace } from "@/types";
import { PostCard } from "./PostCard";

const PLATFORM_INFO: Record<
  SocialPlatform,
  { label: string; color: string; icon: React.ReactNode }
> = {
  linkedin: {
    label: "LinkedIn",
    color: "#0a66c2",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  x: {
    label: "X",
    color: "#e7e9ea",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  telegram: {
    label: "Telegram",
    color: "#229ed9",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
};

// ── Skeleton Loader (shown while AI generates) ─────────────────────────────
export function StoryCanvasSkeleton() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 gap-10">
      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
        <Loader2 size={18} className="animate-spin" style={{ color: "#1a7352" }} />
        <span className="text-[14px] font-medium">
          AI is architecting your campaign…
        </span>
      </div>

      {/* Skeleton nodes row */}
      <div className="w-full max-w-[900px] overflow-x-auto">
        <div className="flex items-start gap-0 min-w-max mx-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start">
              {/* Node skeleton */}
              <div
                className="w-[180px] rounded-[14px] overflow-hidden"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  animation: `pulse 1.5s ease-in-out ${i * 0.15}s infinite`,
                }}
              >
                <div
                  className="h-8 w-full"
                  style={{ background: "var(--surface-3)" }}
                />
                <div className="p-3 flex flex-col gap-2">
                  <div
                    className="h-3 rounded-full w-3/4"
                    style={{ background: "var(--surface-3)" }}
                  />
                  <div
                    className="h-2.5 rounded-full w-1/2"
                    style={{ background: "var(--surface-3)" }}
                  />
                  <div
                    className="h-2 rounded-full w-full mt-1"
                    style={{ background: "var(--surface-3)" }}
                  />
                  <div
                    className="h-2 rounded-full w-5/6"
                    style={{ background: "var(--surface-3)" }}
                  />
                </div>
              </div>
              {/* Arrow between nodes */}
              {i < 4 && (
                <div className="flex items-center self-center mx-1">
                  <div
                    className="w-6 h-px"
                    style={{ background: "var(--border)" }}
                  />
                  <svg width="8" height="10" viewBox="0 0 8 10" fill="var(--border)">
                    <path d="M0 0 L8 5 L0 10 Z" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

// ── Main Canvas ────────────────────────────────────────────────────────────
interface Props {
  story: Story;
  workspace: Workspace;
  readOnly?: boolean;
  onApprove?: (updatedNodes: StoryNode[]) => void;
  onNodesChange?: (nodes: StoryNode[]) => void;
}

export function StoryCanvas({ story, workspace, readOnly = false, onApprove, onNodesChange }: Props) {
  const [nodes, setNodes] = useState<StoryNode[]>(story.nodes);
  const [openNode, setOpenNode] = useState<StoryNode | null>(null);
  const [approving, setApproving] = useState(false);
  const isApproved = story.status === "approved";

  const handleNodeUpdate = (nodeId: string, content: string) => {
    const updated = nodes.map((n) => (n.id === nodeId ? { ...n, content } : n));
    setNodes(updated);
    onNodesChange?.(updated);
  };

  const handleApprove = async () => {
    if (!onApprove) return;
    setApproving(true);
    try {
      await onApprove(nodes);
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-1)] shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-[#1a7352] uppercase tracking-wider bg-[rgba(26,115,82,0.12)] px-2 py-0.5 rounded-full">
                Story Campaign
              </span>
              {isApproved && (
                <span className="text-[11px] font-bold text-[#22c55e] uppercase tracking-wider bg-[rgba(34,197,94,0.12)] px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle size={10} /> Approved
                </span>
              )}
            </div>
            <h1 className="font-['Outfit'] text-[18px] sm:text-[22px] font-bold text-[var(--text-primary)]">
              {story.title}
            </h1>
            <p className="text-[13px] text-[var(--text-secondary)] mt-0.5 line-clamp-1">
              {story.brief}
            </p>
          </div>
          {!isApproved && onApprove && (
            <button
              onClick={handleApprove}
              disabled={approving}
              className="btn btn-primary shrink-0 px-5 py-2.5 text-[13px]"
              style={{
                background: "linear-gradient(135deg, #1a7352, #2d9e6f)",
                boxShadow: "0 4px 14px rgba(26,115,82,0.3)",
              }}
            >
              {approving ? (
                <div className="spinner w-4 h-4" />
              ) : (
                <>
                  <CheckCircle size={15} />
                  Approve Campaign
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex-1 overflow-auto p-6 sm:p-10 flex flex-col items-center justify-start gap-8">
        {/* Top row: campaign timeline */}
        <div className="w-full max-w-[960px] overflow-x-auto pb-4">
          <div className="flex items-start gap-0 min-w-max mx-auto">
            {nodes.map((node, idx) => {
              const platform = PLATFORM_INFO[node.platform] || PLATFORM_INFO.linkedin;
              const date = new Date(node.scheduledAt);

              return (
                <div key={node.id} className="flex items-center">
                  {/* Node Card */}
                  <button
                    onClick={() => setOpenNode(node)}
                    className="w-[190px] sm:w-[210px] rounded-[14px] overflow-hidden text-left transition-all duration-200 group"
                    style={{
                      border: `1.5px solid ${platform.color}40`,
                      background: "var(--surface-2)",
                      boxShadow: `0 4px 20px ${platform.color}15`,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 28px ${platform.color}30`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 20px ${platform.color}15`;
                    }}
                  >
                    {/* Platform header */}
                    <div
                      className="px-3 py-2 flex items-center justify-between"
                      style={{
                        background: `${platform.color}15`,
                        borderBottom: `1px solid ${platform.color}25`,
                      }}
                    >
                      <div
                        className="flex items-center gap-1.5 text-[11px] font-bold"
                        style={{ color: platform.color }}
                      >
                        {platform.icon}
                        {platform.label}
                      </div>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{
                          background: `${platform.color}20`,
                          color: platform.color,
                        }}
                      >
                        Day {node.day}
                      </span>
                    </div>

                    {/* Node content */}
                    <div className="p-3">
                      <div className="text-[13px] font-bold text-[var(--text-primary)] mb-1.5">
                        {node.label}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 mb-2">
                        <Clock size={10} />
                        {format(date, "MMM d, h:mm a")}
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)] leading-relaxed line-clamp-3 opacity-70 group-hover:opacity-100 transition-opacity">
                        {node.content}
                      </div>
                    </div>

                    {/* Open hint */}
                    <div
                      className="px-3 py-2 text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: platform.color }}
                    >
                      Click to view & edit →
                    </div>
                  </button>

                  {/* Arrow connector */}
                  {idx < nodes.length - 1 && (
                    <div className="flex items-center self-center mx-0.5 shrink-0">
                      <div
                        className="w-5 h-px"
                        style={{ background: "var(--border)" }}
                      />
                      <svg
                        width="7"
                        height="9"
                        viewBox="0 0 8 10"
                        fill="var(--text-muted)"
                        style={{ opacity: 0.5 }}
                      >
                        <path d="M0 0 L8 5 L0 10 Z" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary row */}
        <div className="w-full max-w-[960px] flex flex-wrap gap-3 justify-center">
          {nodes.map((node) => {
            const platform = PLATFORM_INFO[node.platform] || PLATFORM_INFO.linkedin;
            return (
              <div
                key={node.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold"
                style={{
                  background: `${platform.color}10`,
                  border: `1px solid ${platform.color}30`,
                  color: platform.color,
                }}
              >
                {platform.icon}
                Day {node.day} — {node.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Post modal (click a node) */}
      {openNode && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4"
          onClick={(e) => e.target === e.currentTarget && setOpenNode(null)}
        >
          <div className="w-full max-w-[520px] relative">
            <PostCard
              post={{
                id: openNode.id,
                platform: openNode.platform,
                content: openNode.content,
                status: "draft",
              }}
              workspace={workspace}
              onUpdate={(content) => {
                handleNodeUpdate(openNode.id, content);
                setOpenNode({ ...openNode, content });
              }}
            />
            <button
              onClick={() => setOpenNode(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[var(--surface-3)] border border-[var(--border)] text-[var(--text-secondary)] flex items-center justify-center cursor-pointer hover:bg-[var(--surface-4)] transition-colors z-10"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
