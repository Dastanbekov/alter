"use client";

import { useState } from "react";
import { CheckCircle, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";
import type { Story, StoryNode, SocialPlatform, Workspace } from "@/types";
import { PostCard } from "./PostCard";
import { LinkedInPostPreviewModal } from "./LinkedInPostPreviewModal";

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
  const dummyPlatforms: SocialPlatform[] = ["linkedin", "telegram"];
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 gap-10">
      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
        <Loader2 size={18} className="animate-spin" style={{ color: "#1a7352" }} />
        <span className="text-[14px] font-medium">
          AI is architecting your campaign…
        </span>
      </div>

      <div className="w-full max-w-[960px] overflow-x-auto pb-4">
        <div className="flex flex-col gap-8 min-w-max mx-auto">
          {/* Header Row */}
          <div className="flex gap-4 pl-[72px]">
            {dummyPlatforms.map((p) => {
              const platform = PLATFORM_INFO[p];
              return (
                <div key={p} className="w-[260px] text-center font-bold text-[13px] uppercase tracking-wider" style={{ color: platform.color }}>
                  <div className="flex items-center justify-center gap-1.5 opacity-80">
                    {platform.icon} {platform.label}
                  </div>
                </div>
              );
            })}
          </div>

          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 items-center relative">
              <div className="w-14 h-14 shrink-0 rounded-full bg-[var(--surface-2)] border-2 border-[var(--border)] flex items-center justify-center font-bold text-[20px] text-[var(--text-muted)] z-10 animate-pulse shadow-sm">
                {i}
              </div>
              {dummyPlatforms.map((p, colIdx) => (
                <div key={p} className="w-[260px] flex justify-center relative">
                  {colIdx === (i % 2) ? (
                    <div className="w-[240px] h-[160px] rounded-[14px] bg-[var(--surface-2)] border border-[var(--border)] animate-pulse shadow-sm" />
                  ) : (
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-[var(--border)] opacity-30 -z-10" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
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

  // Derive columns from the story's selected platforms or infer from nodes
  const platforms: SocialPlatform[] = story.platforms?.length 
    ? story.platforms 
    : Array.from(new Set(nodes.map(n => n.platform)));

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

      {/* Canvas area (Grid Layout) */}
      <div className="flex-1 overflow-auto p-6 sm:p-10 flex flex-col items-center justify-start gap-8 relative">
        <div className="w-full max-w-[960px] overflow-x-auto pb-4">
          <div className="flex flex-col gap-8 min-w-max mx-auto">
            {/* Column Headers */}
            <div className="flex gap-4 pl-[72px]">
              {platforms.map((p) => {
                const platform = PLATFORM_INFO[p] || PLATFORM_INFO.linkedin;
                return (
                  <div key={p} className="w-[260px] text-center font-bold text-[13px] uppercase tracking-wider" style={{ color: platform.color }}>
                    <div className="flex items-center justify-center gap-1.5 opacity-80">
                      {platform.icon} {platform.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Grid Rows (Sequential Steps) */}
            {nodes.map((node, idx) => {
              const date = new Date(node.scheduledAt);
              return (
                <div key={node.id} className="flex gap-4 items-center relative">
                  {/* Step Number Column */}
                  <div className="w-14 h-14 shrink-0 rounded-full bg-[var(--surface-2)] border-2 border-[var(--border)] flex items-center justify-center font-['Outfit'] font-bold text-[20px] text-[var(--text-primary)] shadow-sm z-10 relative">
                    {idx + 1}
                    {/* Vertical connecting line to the next number (except the last one) */}
                    {idx < nodes.length - 1 && (
                      <div className="absolute top-[54px] left-[25px] w-0.5 h-10 bg-[var(--border)] opacity-60" />
                    )}
                  </div>
                  
                  {/* Platform Columns */}
                  {platforms.map((p) => {
                    const platform = PLATFORM_INFO[p] || PLATFORM_INFO.linkedin;
                    const isTargetPlatform = node.platform === p;

                    return (
                      <div key={p} className="w-[260px] flex justify-center relative">
                        {isTargetPlatform ? (
                          <button
                            onClick={() => setOpenNode(node)}
                            className="w-[240px] rounded-[14px] overflow-hidden text-left transition-all duration-200 group relative z-10"
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

                            <div className="p-3">
                              <div className="text-[14px] font-bold text-[var(--text-primary)] mb-1.5">
                                {node.label}
                              </div>
                              <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 mb-2">
                                <Clock size={10} />
                                {format(date, "MMM d, h:mm a")}
                              </div>
                              <div className="text-[12px] text-[var(--text-secondary)] leading-relaxed line-clamp-3 opacity-70 group-hover:opacity-100 transition-opacity">
                                {node.content}
                              </div>
                            </div>

                            <div
                              className="px-3 py-2 text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ color: platform.color }}
                            >
                              Click to view & edit →
                            </div>
                          </button>
                        ) : (
                          // Horizontal Connector Line if this isn't the active card
                          <div className="absolute top-1/2 left-0 right-0 h-px bg-[var(--border)] opacity-40 -z-10" />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Post modal */}
      {openNode && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4"
          onClick={(e) => e.target === e.currentTarget && setOpenNode(null)}
        >
          <div className="w-full max-w-[520px] relative">
            {openNode.platform === "linkedin" ? (
              <LinkedInPostPreviewModal
                post={{
                  id: openNode.id,
                  platform: openNode.platform,
                  content: openNode.content,
                  status: "draft",
                  imageRecommendations: openNode.imageRecommendations,
                }}
                workspace={workspace}
                onClose={() => setOpenNode(null)}
                onUpdate={(content) => {
                  handleNodeUpdate(openNode.id, content);
                  setOpenNode({ ...openNode, content });
                }}
              />
            ) : (
              <PostCard
                post={{
                  id: openNode.id,
                  platform: openNode.platform,
                  content: openNode.content,
                  status: "draft",
                  imageRecommendations: openNode.imageRecommendations,
                }}
                workspace={workspace}
                onUpdate={(content) => {
                  handleNodeUpdate(openNode.id, content);
                  setOpenNode({ ...openNode, content });
                }}
              />
            )}
            {openNode.platform !== "linkedin" && (
              <button
                onClick={() => setOpenNode(null)}
                className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[var(--surface-3)] border border-[var(--border)] text-[var(--text-secondary)] flex items-center justify-center cursor-pointer hover:bg-[var(--surface-4)] transition-colors z-10"
              >
                ×
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
