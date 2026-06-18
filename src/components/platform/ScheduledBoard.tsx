"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar, Trash2, Clock, Send } from "lucide-react";
import toast from "react-hot-toast";

interface ScheduledPost {
  id: string;
  platform: string;
  content: string;
  scheduledAt: string;
}

interface WorkspaceWithPosts {
  id: string;
  name: string;
  posts: ScheduledPost[];
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  telegram: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  ),
  x: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  linkedin: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
};

const PLATFORM_COLORS: Record<string, string> = {
  telegram: "#229ed9",
  x: "#e7e9ea",
  linkedin: "#0a66c2",
};

export function ScheduledBoard() {
  const [workspaces, setWorkspaces] = useState<WorkspaceWithPosts[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScheduledPosts = async () => {
    try {
      const res = await fetch("/api/posts/scheduled");
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load scheduled posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduledPosts();
  }, []);

  const handleCancel = async (postId: string) => {
    if (!confirm("Are you sure you want to cancel this scheduled post?")) return;

    try {
      const res = await fetch(`/api/posts?id=${postId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Scheduled post cancelled");
        // Update local state
        setWorkspaces((prev) =>
          prev
            .map((ws) => ({
              ...ws,
              posts: ws.posts.filter((p) => p.id !== postId),
            }))
            .filter((ws) => ws.posts.length > 0)
        );
      } else {
        toast.error("Failed to cancel post");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="spinner w-8 h-8" />
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)] gap-4">
        <Calendar size={48} className="opacity-50" />
        <p>No scheduled posts found.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--surface-0)]">
      <div className="px-6 py-5 border-b border-[var(--border)] bg-[var(--surface-1)]">
        <h1 className="font-['Outfit'] text-[22px] font-bold text-[var(--text-primary)] flex items-center gap-2.5">
          <Calendar size={20} className="text-[var(--text-muted)]" />
          Scheduled Posts
        </h1>
        <p className="text-[var(--text-secondary)] text-[14px] mt-1">
          Manage your upcoming content across all workspaces
        </p>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 flex gap-6 items-start">
        {workspaces.map((ws) => (
          <div
            key={ws.id}
            className="w-[320px] min-w-[320px] bg-[var(--surface-1)] rounded-[16px] border border-[var(--border)] flex flex-col max-h-full overflow-hidden"
          >
            {/* Column Header */}
            <div className="p-4 border-b border-[var(--border)] flex items-center gap-2.5 bg-[var(--surface-2)]">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#1a7352] to-[#2d9e6f] flex items-center justify-center text-white text-[12px] font-bold">
                {ws.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="text-[14px] font-bold text-[var(--text-primary)] truncate">
                  {ws.name}
                </div>
                <div className="text-[11px] text-[var(--text-secondary)]">
                  {ws.posts.length} {ws.posts.length === 1 ? "post" : "posts"}
                </div>
              </div>
            </div>

            {/* Column Content */}
            <div className="p-4 overflow-y-auto flex flex-col gap-3">
              {ws.posts.map((post) => {
                const dateObj = new Date(post.scheduledAt);
                const color = PLATFORM_COLORS[post.platform] || "var(--text-primary)";
                return (
                  <div
                    key={post.id}
                    className="card fade-in p-4 flex flex-col gap-3"
                  >
                    <div className="flex justify-between items-start">
                      <div
                        className="flex items-center gap-1.5 text-[12px] font-semibold px-2 py-1 rounded-full"
                        style={{
                          color: color,
                          background: `${color}15`,
                        }}
                      >
                        {PLATFORM_ICONS[post.platform] || <Send size={12} />}
                        <span className="capitalize">{post.platform}</span>
                      </div>
                      
                      <button
                        onClick={() => handleCancel(post.id)}
                        className="bg-transparent border-none cursor-pointer text-[var(--text-muted)] p-1 transition-colors hover:text-red-500"
                        title="Cancel post"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="text-[13px] text-[var(--text-primary)] leading-[1.5] break-words line-clamp-3">
                      {post.content}
                    </div>

                    <div className="flex items-center gap-1.5 text-[12px] text-[var(--text-secondary)] mt-1 pt-3 border-t border-dashed border-[var(--border)]">
                      <Clock size={12} />
                      {format(dateObj, "MMM d, yyyy 'at' h:mm a")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
