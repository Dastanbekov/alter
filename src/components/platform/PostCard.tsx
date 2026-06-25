"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil, Send, Clock, Check, X as XIcon, Zap, Image as ImageIcon, Globe, Smile, MapPin, Trash2, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { ScheduleModal } from "./ScheduleModal";
import type { GeneratedPostItem, Workspace, SocialPlatform } from "@/types";

interface Props {
  post: GeneratedPostItem;
  workspace: Workspace;
  onUpdate?: (content: string, mediaUrls?: string[]) => void;
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
  threads: {
    label: "Threads",
    icon: (
      <svg width="14" height="14" viewBox="0 0 192 192" fill="currentColor">
        <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.3109C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.708C154.894 45.6981 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 28.1872C147.036 10.1422 125.202 0.455304 97.0203 0C65.3116 0.460835 41.6508 10.3015 25.8643 30.3444C10.4578 49.8974 2.82522 75.3853 2.50024 96C2.82522 116.615 10.4578 142.103 25.8643 161.656C41.6508 181.699 65.3116 191.539 97.0203 192C126.18 191.562 146.903 183.056 163.66 166.309C184.28 145.704 180.199 116.711 166.702 96.0645C158.828 83.9935 149.658 75.6426 138.868 69.8322C138.799 71.189 138.69 72.5354 138.544 73.8697C140.237 78.4316 141.258 83.5684 141.537 88.9883ZM121.666 98.7188C121.22 113.886 112.981 125.327 98.5369 126.046C92.6841 126.364 87.2346 125.105 82.5259 122.259C77.4098 119.222 74.321 113.784 73.9189 106.326C73.1903 92.6834 83.9926 84.773 99.426 84.4533C104.996 84.3377 110.366 84.8251 115.351 85.875C118.847 90.1691 121.054 94.6983 121.666 98.7188Z" />
      </svg>
    ),
    color: "#000000",
    bg: "rgba(0,0,0,0.06)",
  },
};

export function PostCard({ post, workspace, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);
  const [editInstruction, setEditInstruction] = useState("");
  const [refining, setRefining] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [generatingImageFor, setGeneratingImageFor] = useState<number | null>(null);

  const [mediaList, setMediaList] = useState<string[]>(post.mediaUrls || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const newB64s = await Promise.all(newFiles.map(f => getBase64(f)));
      const updatedMedia = [...mediaList, ...newB64s];
      setMediaList(updatedMedia);

      if (onUpdate) {
        onUpdate(post.content, updatedMedia);
      }
    }
  };

  const removeImage = async (index: number) => {
    const updatedMedia = mediaList.filter((_, i) => i !== index);
    setMediaList(updatedMedia);

    if (onUpdate) {
      onUpdate(post.content, updatedMedia);
    }
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

  const handleGenerateImage = async (prompt: string, index: number) => {
    setGeneratingImageFor(index);
    try {
      const res = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to generate image");
        return;
      }
      
      const b64 = `data:image/jpeg;base64,${data.imageBase64}`;
      const updatedMedia = [...mediaList, b64];
      setMediaList(updatedMedia);

      if (onUpdate) {
        onUpdate(post.content, updatedMedia);
      }
      toast.success("Image generated!");
    } catch (e) {
      toast.error("Failed to generate image");
    } finally {
      setGeneratingImageFor(null);
    }
  };

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

      onUpdate?.(data.content);
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
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace.id,
          platform: post.platform,
          content: post.content,
          images: mediaList,
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
        {post.platform === "x" || post.platform === "threads" ? (
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
                  {idx === 0 && mediaList.length > 0 && (
                    <div className="w-full relative mt-3 group">
                      <div className={`grid gap-0.5 ${mediaList.length === 1 ? 'grid-cols-1' : mediaList.length === 2 ? 'grid-cols-2' : 'grid-cols-2 grid-rows-2'}`}>
                        {mediaList.slice(0, 4).map((url, i) => (
                          <div 
                            key={i} 
                            className={`relative bg-[var(--surface-3)] border border-[var(--border)] overflow-hidden rounded-md ${
                              mediaList.length === 3 && i === 0 ? 'row-span-2' : ''
                            }`}
                          >
                            <img 
                              src={url.startsWith('data:') || url.startsWith('blob:') ? url : `data:image/jpeg;base64,${url}`}
                              alt="Preview" 
                              className="w-full h-full object-cover max-h-[200px]" 
                            />
                            {!published && (
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
                        {post.imageRecommendations.map((rec, idx) => (
                          <li key={idx} className="text-[13px] text-[var(--text-secondary)] flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-[rgba(26,115,82,0.1)] text-[#1a7352] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <div className="flex-1 leading-snug">
                              {rec}
                              {!published && (
                                <div className="mt-2">
                                  <button
                                    onClick={() => handleGenerateImage(rec, idx)}
                                    disabled={generatingImageFor !== null}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--surface-2)] hover:bg-[#1a7352]/10 text-[12px] font-semibold text-[var(--text-primary)] hover:text-[#1a7352] transition-colors border border-[var(--border)] hover:border-[#1a7352]/30 disabled:opacity-50"
                                  >
                                    {generatingImageFor === idx ? (
                                      <span className="animate-spin border-[1.5px] border-[#1a7352]/20 border-t-[#1a7352] rounded-full w-3.5 h-3.5" />
                                    ) : (
                                      <Sparkles size={14} className="text-[#1a7352]" />
                                    )}
                                    Generate it!
                                  </button>
                                </div>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Twitter/Threads actions (show on last tweet only) */}
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
            {mediaList.length > 0 && (
              <div className="w-full relative mt-3 group">
                <div className={`grid gap-0.5 rounded-md overflow-hidden ${mediaList.length === 1 ? 'grid-cols-1' : mediaList.length === 2 ? 'grid-cols-2' : 'grid-cols-2 grid-rows-2'}`}>
                  {mediaList.slice(0, 4).map((url, i) => (
                    <div 
                      key={i} 
                      className={`relative bg-[var(--surface-3)] border border-[var(--border)] ${
                        mediaList.length === 3 && i === 0 ? 'row-span-2' : ''
                      }`}
                    >
                      <img 
                        src={url.startsWith('data:') || url.startsWith('blob:') ? url : `data:image/jpeg;base64,${url}`}
                        alt="Preview" 
                        className="w-full h-full object-cover max-h-[300px]" 
                      />
                      {!published && (
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
                      <div className="flex-1 leading-snug">
                        {rec}
                        {!published && (
                          <div className="mt-2">
                            <button
                              onClick={() => handleGenerateImage(rec, idx)}
                              disabled={generatingImageFor !== null}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--surface-2)] hover:bg-[#1a7352]/10 text-[12px] font-semibold text-[var(--text-primary)] hover:text-[#1a7352] transition-colors border border-[var(--border)] hover:border-[#1a7352]/30 disabled:opacity-50"
                            >
                              {generatingImageFor === idx ? (
                                <span className="animate-spin border-[1.5px] border-[#1a7352]/20 border-t-[#1a7352] rounded-full w-3.5 h-3.5" />
                              ) : (
                                <Sparkles size={14} className="text-[#1a7352]" />
                              )}
                              Generate it!
                            </button>
                          </div>
                        )}
                      </div>
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
                onClick={() => setShowSchedule(true)}
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
          images={mediaList}
          workspace={workspace}
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
