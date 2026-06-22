"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil, Send, Clock, Check, X as XIcon, Zap, Image as ImageIcon, Globe, Smile, MapPin, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { ScheduleModal } from "./ScheduleModal";
import type { GeneratedPostItem, Workspace, SocialPlatform } from "@/types";

interface Props {
  post: GeneratedPostItem;
  workspace: Workspace;
  onUpdate: (content: string) => void;
}

const PLATFORM_CONFIG: Record<
  SocialPlatform,
  { label: string; icon: React.ReactNode; color: string; bg: string; charLimit?: number }
> = {
  linkedin: {
    label: "LinkedIn",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    color: "#0a66c2",
    bg: "rgba(10,102,194,0.1)",
  },
  x: {
    label: "X",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    color: "#e7e9ea",
    bg: "rgba(231,233,234,0.08)",
    charLimit: 280,
  },
  telegram: {
    label: "Telegram",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
    color: "#229ed9",
    bg: "rgba(34,158,217,0.1)",
  },
};

export function PostCard({ post, workspace, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);
  const [editInstruction, setEditInstruction] = useState("");
  const [refining, setRefining] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [base64ImagesForSchedule, setBase64ImagesForSchedule] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const newUrls = newFiles.map((file) => URL.createObjectURL(file));
      setFiles((prev) => [...prev, ...newFiles]);
      setPreviewUrls((prev) => [...prev, ...newUrls]);
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const platform = PLATFORM_CONFIG[post.platform];
  const charLimit = platform.charLimit;
  const overLimit = charLimit && post.content.length > charLimit;
  const isConnected = workspace.socials.some(s => s.platform === post.platform);

  const handleRefine = async () => {
    if (!editInstruction.trim()) return;
    setRefining(true);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: post.content,
          platform: post.platform,
          instruction: editInstruction.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error("Refinement failed");
        return;
      }

      onUpdate(data.content);
      setEditInstruction("");
      setEditing(false);
      toast.success("Post updated!");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setRefining(false);
    }
  };

  const handlePublish = async () => {
    if (!isConnected) {
      toast.error(`Please connect ${platform.label} first in Settings`);
      return;
    }
    setPublishing(true);
    try {
      const base64Images = await Promise.all(files.map(f => getBase64(f)));
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace.id,
          platform: post.platform,
          content: post.content,
          images: base64Images,
        }),
      });

      if (!res.ok) {
        toast.error("Failed to save post");
        return;
      }

      setPublished(true);
      toast.success(`Posted to ${platform.label}!`);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <>
      <div
        className="fade-in bg-[var(--surface-2)] rounded-[16px] overflow-hidden transition-all duration-200"
        style={{
          border: `1px solid ${platform.color}30`,
        }}
      >
        {/* Platform header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{
            background: platform.bg,
            borderBottom: `1px solid ${platform.color}20`,
          }}
        >
          <div
            className="flex items-center gap-2 font-bold text-[13px]"
            style={{ color: platform.color }}
          >
            {platform.icon}
            {platform.label}
          </div>
          <div className="flex items-center gap-2">
            {charLimit && (
              <span
                className={`text-[11px] font-semibold ${overLimit ? 'text-[#ef4444]' : 'text-[var(--text-muted)]'}`}
              >
                {post.content.length} / {charLimit}
              </span>
            )}
            {!published && (
              <button
                onClick={() => setEditing(!editing)}
                className={`w-7 h-7 rounded-md cursor-pointer flex items-center justify-center transition-all duration-200 ${
                  editing
                    ? "bg-[rgba(67,56,255,0.2)] border border-[rgba(67,56,255,0.4)] text-[#1a7352]"
                    : "bg-[var(--surface-3)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
                title="Edit post"
              >
                <Pencil size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {post.platform === "x" ? (
          <div className="flex flex-col pt-4 pb-3">
            {post.content.split("[TWEET_BREAK]").map((tweet, idx, arr) => (
              <div key={idx} className="flex gap-3 px-4 relative group">
                {/* Vertical connecting line for threads */}
                {idx < arr.length - 1 && (
                  <div className="absolute left-[35px] top-10 bottom-[-16px] w-[2px] bg-[var(--border)] z-0" />
                )}
                
                <div className="w-10 h-10 rounded-full bg-[var(--surface-3)] shrink-0 flex items-center justify-center font-bold text-[var(--text-secondary)] z-10 relative mt-1">
                  {workspace.name.substring(0, 2).toUpperCase()}
                </div>
                
                <div className="flex-1 min-w-0 pb-4">
                  <p className="text-[15px] text-[var(--text-primary)] leading-[1.5] whitespace-pre-wrap font-sans pt-1">
                    {tweet.trim()}
                  </p>

                  {/* Attached Images (first tweet only) */}
                  {idx === 0 && (previewUrls.length > 0 || (post.mediaUrls && post.mediaUrls.length > 0)) && (
                    <div className="w-full relative mt-3 group">
                      <div className={`grid gap-0.5 ${(previewUrls.length || post.mediaUrls?.length || 0) === 1 ? 'grid-cols-1' : (previewUrls.length || post.mediaUrls?.length || 0) === 2 ? 'grid-cols-2' : 'grid-cols-2 grid-rows-2'}`}>
                        {(previewUrls.length > 0 ? previewUrls : (post.mediaUrls || [])).slice(0, 4).map((url, i) => (
                          <div 
                            key={i} 
                            className={`relative bg-[var(--surface-3)] border border-[var(--border)] overflow-hidden rounded-md ${
                              (previewUrls.length || post.mediaUrls?.length || 0) === 3 && i === 0 ? 'row-span-2' : ''
                            }`}
                          >
                            <img 
                              src={url.startsWith('data:') || url.startsWith('blob:') ? url : `data:image/jpeg;base64,${url}`}
                              alt="Preview" 
                              className="w-full h-full object-cover max-h-[200px]" 
                            />
                            {!published && previewUrls.length > 0 && (
                              <button
                                onClick={() => removeImage(i)}
                                className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Image Recommendations (show on last tweet only) */}
                  {idx === arr.length - 1 && post.imageRecommendations && post.imageRecommendations.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <ImageIcon size={14} className="text-[#1a7352]" />
                        <span className="text-[12px] font-semibold text-[#1a7352]">
                          AI Image Recommendations
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {post.imageRecommendations.map((rec, i) => (
                          <li key={i} className="text-[13px] text-[var(--text-secondary)] flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-[rgba(26,115,82,0.1)] text-[#1a7352] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span className="leading-snug">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Twitter actions (show on last tweet only) */}
                  {idx === arr.length - 1 && (
                    <>
                      <div className="mt-4 flex items-center gap-1.5 text-[13px] text-[#1d9bf0] font-bold pb-3 border-b border-[var(--border)]">
                        <Globe size={14} /> Everyone can reply
                      </div>
                      
                      <div className="flex items-center justify-between pt-3">
                        <div className="flex items-center gap-4 text-[#1d9bf0]">
                          <ImageIcon size={18} />
                          <Smile size={18} />
                          <MapPin size={18} />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-3.5">
            <p className="text-[14px] text-[var(--text-primary)] leading-[1.7] whitespace-pre-wrap">
              {post.content}
            </p>

            {/* Attached Images */}
            {(previewUrls.length > 0 || (post.mediaUrls && post.mediaUrls.length > 0)) && (
              <div className="w-full relative mt-3 group">
                <div className={`grid gap-0.5 rounded-md overflow-hidden ${(previewUrls.length || post.mediaUrls?.length || 0) === 1 ? 'grid-cols-1' : (previewUrls.length || post.mediaUrls?.length || 0) === 2 ? 'grid-cols-2' : 'grid-cols-2 grid-rows-2'}`}>
                  {(previewUrls.length > 0 ? previewUrls : (post.mediaUrls || [])).slice(0, 4).map((url, i) => (
                    <div 
                      key={i} 
                      className={`relative bg-[var(--surface-3)] border border-[var(--border)] ${
                        (previewUrls.length || post.mediaUrls?.length || 0) === 3 && i === 0 ? 'row-span-2' : ''
                      }`}
                    >
                      <img 
                        src={url.startsWith('data:') || url.startsWith('blob:') ? url : `data:image/jpeg;base64,${url}`}
                        alt="Preview" 
                        className="w-full h-full object-cover max-h-[300px]" 
                      />
                      {!published && previewUrls.length > 0 && (
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Image Recommendations */}
            {post.imageRecommendations && post.imageRecommendations.length > 0 && (
              <div className="mt-4 pt-3 border-t border-[var(--border)]">
                <div className="flex items-center gap-1.5 mb-2">
                  <ImageIcon size={14} className="text-[#1a7352]" />
                  <span className="text-[12px] font-semibold text-[#1a7352]">
                    AI Image Recommendations
                  </span>
                </div>
                <ul className="space-y-2">
                  {post.imageRecommendations.map((rec, idx) => (
                    <li key={idx} className="text-[13px] text-[var(--text-secondary)] flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-[rgba(26,115,82,0.1)] text-[#1a7352] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-snug">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}



        {/* Mini editor */}
        {editing && !published && (
          <div className="fade-in border-t border-[var(--border)] px-4 py-3 bg-[var(--surface-1)]">
            <div className="flex gap-2 items-center mb-2">
              <Zap size={13} color="#1a7352" />
              <span className="text-[12px] text-[var(--text-secondary)] font-semibold">
                Tell AI what to change
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                className="input text-[13px] px-3 py-2 flex-1 min-w-0"
                placeholder='e.g. "Make it more professional" or "Add emojis"'
                value={editInstruction}
                onChange={(e) => setEditInstruction(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRefine()}
                autoFocus
              />
              <button
                onClick={handleRefine}
                disabled={!editInstruction.trim() || refining}
                className="btn btn-primary btn-sm shrink-0 px-3 py-2"
              >
                {refining ? (
                  <div className="spinner w-3.5 h-3.5" />
                ) : (
                  <Send size={14} />
                )}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setEditInstruction("");
                }}
                className="btn btn-ghost btn-sm shrink-0 px-3 py-2"
              >
                <XIcon size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        {!published && (
          <div className="border-t border-[var(--border)] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-8 h-8 rounded-full hover:bg-[var(--surface-3)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                title="Attach media"
              >
                <ImageIcon size={18} />
              </button>
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={async () => {
                  if (!isConnected) {
                    toast.error(`Please connect ${platform.label} first in Settings`);
                    return;
                  }
                  const b64Images = await Promise.all(files.map(f => getBase64(f)));
                  setBase64ImagesForSchedule(b64Images);
                  setShowSchedule(true);
                }}
                className="btn btn-secondary btn-sm"
              >
                <Clock size={14} />
                Schedule
              </button>
              <button
              onClick={() => {
                if (!isConnected) {
                  toast.error(`Please connect ${platform.label} first in Settings`);
                  return;
                }
                handlePublish();
              }}
              disabled={publishing || !!overLimit}
              className="btn btn-primary btn-sm"
              style={{
                background: !isConnected 
                  ? "var(--surface-3)" 
                  : `linear-gradient(135deg, ${platform.color}, ${platform.color}cc)`,
                boxShadow: !isConnected ? "none" : `0 4px 12px ${platform.color}40`,
                color: !isConnected ? "var(--text-muted)" : "white",
                cursor: !isConnected ? "not-allowed" : "pointer"
              }}
              title={!isConnected ? `Connect ${platform.label} in Settings to publish` : ""}
            >
              {publishing ? (
                <div className="spinner w-3.5 h-3.5" />
              ) : (
                <>
                  <Send size={14} />
                  Publish
                </>
              )}
            </button>
            </div>
          </div>
        )}

        {/* Published state */}
        {published && (
          <div className="border-t border-[rgba(34,197,94,0.3)] px-4 py-3 flex items-center gap-2 bg-[rgba(34,197,94,0.05)]">
            <Check size={16} color="#22c55e" />
            <span className="text-[13px] text-[#22c55e] font-semibold">
              Submitted to {platform.label}
            </span>
          </div>
        )}
      </div>

      {showSchedule && (
        <ScheduleModal
          post={post}
          workspace={workspace}
          images={base64ImagesForSchedule}
          onClose={() => setShowSchedule(false)}
          onScheduled={() => {
            setShowSchedule(false);
            setPublished(true);
            toast.success(`Scheduled for ${platform.label}!`);
          }}
        />
      )}
    </>
  );
}
