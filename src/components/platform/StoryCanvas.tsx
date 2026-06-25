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
    color: "#0f1419",
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
  threads: {
    label: "Threads",
    color: "#000000",
    icon: (
      <svg width="14" height="14" viewBox="0 0 192 192" fill="currentColor">
        <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.3109C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.708C154.894 45.6981 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 28.1872C147.036 10.1422 125.202 0.455304 97.0203 0C65.3116 0.460835 41.6508 10.3015 25.8643 30.3444C10.4578 49.8974 2.82522 75.3853 2.50024 96C2.82522 116.615 10.4578 142.103 25.8643 161.656C41.6508 181.699 65.3116 191.539 97.0203 192C126.18 191.562 146.903 183.056 163.66 166.309C184.28 145.704 180.199 116.711 166.702 96.0645C158.828 83.9935 149.658 75.6426 138.868 69.8322C138.799 71.189 138.69 72.5354 138.544 73.8697C140.237 78.4316 141.258 83.5684 141.537 88.9883ZM121.666 98.7188C121.22 113.886 112.981 125.327 98.5369 126.046C92.6841 126.364 87.2346 125.105 82.5259 122.259C77.4098 119.222 74.321 113.784 73.9189 106.326C73.1903 92.6834 83.9926 84.773 99.426 84.4533C104.996 84.3377 110.366 84.8251 115.351 85.875C118.847 90.1691 121.054 94.6983 121.666 98.7188Z" />
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

  const handleNodeUpdate = (nodeId: string, content: string, mediaUrls?: string[]) => {
    const updated = nodes.map((n) => (n.id === nodeId ? { ...n, content, mediaUrls: mediaUrls || n.mediaUrls } : n));
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

  // Group nodes by day
  const days = Array.from(new Set(nodes.map(n => n.day))).sort((a, b) => a - b);

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
            {days.map((day, idx) => {
              const nodesForDay = nodes.filter((n) => n.day === day);
              const date = new Date(nodesForDay[0].scheduledAt);
              return (
                <div key={day} className="flex gap-4 items-center relative">
                  {/* Step Number Column */}
                  <div className="w-14 h-14 shrink-0 rounded-full bg-[var(--surface-2)] border-2 border-[var(--border)] flex items-center justify-center font-['Outfit'] font-bold text-[20px] text-[var(--text-primary)] shadow-sm z-10 relative">
                    {idx + 1}
                    {/* Vertical connecting line to the next number (except the last one) */}
                    {idx < days.length - 1 && (
                      <div className="absolute top-[54px] left-[25px] w-0.5 h-10 bg-[var(--border)] opacity-60" />
                    )}
                  </div>
                  
                  {/* Platform Columns */}
                  {platforms.map((p) => {
                    const platform = PLATFORM_INFO[p] || PLATFORM_INFO.linkedin;
                    const node = nodesForDay.find((n) => n.platform === p);

                    return (
                      <div key={p} className="w-[260px] flex justify-center relative">
                        {node ? (
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
                              {node.mediaUrls && node.mediaUrls.length > 0 && (
                                <div className="mt-3 text-[11px] flex items-center gap-1.5 font-semibold text-[#1a7352] bg-[#1a7352]/10 w-fit px-2 py-1 rounded-md">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                  {node.mediaUrls.length} image{node.mediaUrls.length > 1 ? "s" : ""} attached
                                </div>
                              )}
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
                  mediaUrls: openNode.mediaUrls,
                  imageRecommendations: openNode.imageRecommendations,
                }}
                workspace={workspace}
                onClose={() => setOpenNode(null)}
                onUpdate={(content, mediaUrls) => {
                  handleNodeUpdate(openNode.id, content, mediaUrls);
                  setOpenNode({ ...openNode, content, mediaUrls: mediaUrls || openNode.mediaUrls });
                }}
              />
            ) : (
              <PostCard
                post={{
                  id: openNode.id,
                  platform: openNode.platform,
                  content: openNode.content,
                  status: "draft",
                  mediaUrls: openNode.mediaUrls,
                  imageRecommendations: openNode.imageRecommendations,
                }}
                workspace={workspace}
                onUpdate={(content, mediaUrls) => {
                  handleNodeUpdate(openNode.id, content, mediaUrls);
                  setOpenNode({ ...openNode, content, mediaUrls: mediaUrls || openNode.mediaUrls });
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
