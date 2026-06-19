"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp, Zap, AlertCircle, Settings } from "lucide-react";
import toast from "react-hot-toast";
import { PostCard } from "./PostCard";
import { WorkspaceSettingsModal } from "./WorkspaceSettingsModal";
import { LinkedInPostPreviewModal } from "./LinkedInPostPreviewModal";
import { StoryModePanel } from "./StoryModePanel";
import type { Workspace, GeneratedPostGroup, GeneratedPostItem, SocialPlatform } from "@/types";
import { nanoid } from "nanoid";
import { QuestionnaireForm, type Question } from "./QuestionnaireForm";


interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
  postGroup?: GeneratedPostGroup;
  isPlatformSelector?: boolean;
  questionnaire?: Question[];
  isFormSubmitted?: boolean;
}

interface Props {
  workspace: Workspace;
  billingInfo: { paidCredits: number; availableFree: number; totalAvailable: number; isPro: boolean } | null;
  onBillingUpdate: () => void;
  onUpgrade: () => void;
}

const PLATFORM_INFO: Record<
  SocialPlatform,
  { label: string; icon: React.ReactNode; color: string }
> = {
  linkedin: {
    label: "LinkedIn",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    color: "#0a66c2",
  },
  x: {
    label: "X",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    color: "#e7e9ea",
  },
  telegram: {
    label: "Telegram",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
    color: "#229ed9",
  },
};

export function ChatArea({ workspace, billingInfo, onBillingUpdate, onUpgrade }: Props) {
  const connectedPlatforms = workspace.socials.map((s) => s.platform as SocialPlatform);
  
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([]);
  const [editingPost, setEditingPost] = useState<{groupId: string, post: GeneratedPostItem} | null>(null);
  const [chatMode, setChatMode] = useState<"post" | "story">("post");
  const [chatTitle, setChatTitle] = useState("New Chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedPlatforms(workspace.socials.map((s) => s.platform as SocialPlatform));
  }, [workspace]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }, [input]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || generating) return;

    setInput("");
    setGenerating(true);

    const userMsg: ChatMsg = {
      id: nanoid(),
      role: "user",
      content: text,
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: newMessages,
          workspaceName: workspace.name,
          workspacePurpose: workspace.details || "General social media"
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error("Chat failed");
        return;
      }

      if (data.chatTitle) {
        setChatTitle(data.chatTitle);
      }

      let responseContent = data.text;
      let questionnaireData: Question[] | undefined;

      const qMatch = responseContent.match(/\[QUESTIONNAIRE:\s*(\[[\s\S]*?\])\]/);
      if (qMatch) {
        try {
          questionnaireData = JSON.parse(qMatch[1]);
          responseContent = responseContent.replace(qMatch[0], "").trim();
        } catch (e) {
          console.error("Failed to parse questionnaire", e);
        }
      }

      if (responseContent.includes("[REQUEST_GENERATE_POSTS]")) {
        const assistantMsg: ChatMsg = {
          id: nanoid(),
          role: "assistant",
          content: "Choose platforms to generate posts for:",
          isPlatformSelector: true,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const assistantMsg: ChatMsg = {
          id: nanoid(),
          role: "assistant",
          content: responseContent,
          questionnaire: questionnaireData,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerate = async (platforms: SocialPlatform[], msgId: string) => {
    if (platforms.length === 0 || generating) return;
    setGenerating(true);

    // Concatenate all user messages as context
    const context = messages.filter(m => m.role === "user").map(m => m.content).join("\n");

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, workspaceId: workspace.id, platforms }),
      });

      const data = await res.json();

      if (res.status === 422 && data.error === "no_integrations") {
        toast.error(data.message);
        return;
      }

      if (!res.ok) {
        toast.error(data.error || "Generation failed");
        return;
      }

      // Build post group
      const postGroup: GeneratedPostGroup = {
        id: nanoid(),
        context,
        posts: data.posts.map(
          (p: { platform: SocialPlatform; content: string; imageRecommendations?: string[] }) => ({
            id: nanoid(),
            platform: p.platform,
            content: p.content,
            status: "draft" as const,
            imageRecommendations: p.imageRecommendations,
          })
        ),
        createdAt: new Date(),
      };

      const assistantMsg: ChatMsg = {
        id: nanoid(),
        role: "assistant",
        content: "Here are your posts 👇",
        postGroup,
      };

      setMessages((prev) => [
        ...prev.map(m => m.id === msgId ? { ...m, isPlatformSelector: false, content: "Great! Let's generate posts for the selected platforms." } : m),
        assistantMsg
      ]);
      onBillingUpdate();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdatePost = (groupId: string, postId: string, content: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.postGroup?.id !== groupId) return msg;
        return {
          ...msg,
          postGroup: {
            ...msg.postGroup,
            posts: msg.postGroup.posts.map((p) =>
              p.id === postId ? { ...p, content } : p
            ),
          },
        };
      })
    );
  };

  // connectedPlatforms is defined above now

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Header */}
      <button
        onClick={() => setIsSettingsOpen(true)}
        className="w-full text-left bg-[var(--surface-1)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between transition-colors duration-200 cursor-pointer hover:bg-[var(--surface-2)] shrink-0"
        title="Open workspace settings"
      >
        <div className="flex flex-col">
          <div className="font-['Outfit'] font-bold text-[18px] text-[var(--text-primary)]">
            {chatTitle}
          </div>
          <div className="text-[13px] text-[var(--text-secondary)]">
            Workspace: {workspace.name}
          </div>
        </div>
        <Settings size={20} className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
      </button>

      <WorkspaceSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        workspace={workspace}
        onUpdateName={() => window.location.reload()}
      />

      {/* Story Mode Panel (replaces messages area when in story mode) */}
      {chatMode === "story" ? (
        <StoryModePanel workspace={workspace} onBillingUpdate={onBillingUpdate} />
      ) : (
        <>
      <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-5 relative">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 pt-10 pb-8">
            <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[rgba(67,56,255,0.2)] to-[rgba(168,85,247,0.2)] border border-[rgba(67,56,255,0.3)] flex items-center justify-center shrink-0 shadow-[0_0_24px_rgba(67,56,255,0.15)]">
              <Zap size={32} color="#1a7352" />
            </div>
            <h2 className="font-['Outfit'] text-[22px] font-bold text-[var(--text-primary)]">
              What&apos;s happening?
            </h2>
            <p className="text-[15px] text-[var(--text-secondary)] max-w-[420px] leading-[1.7]">
              Tell me what you want to share and I&apos;ll generate perfect posts for{" "}
              {connectedPlatforms.length > 0
                ? connectedPlatforms.map((p) => PLATFORM_INFO[p].label).join(", ")
                : "your connected platforms"}
              .
            </p>

            {connectedPlatforms.length === 0 && (
              <div className="flex items-center gap-2.5 px-4 py-3 bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)] rounded-xl mt-2 max-w-[480px]">
                <AlertCircle size={16} color="#f59e0b" className="shrink-0" />
                <span className="text-[13px] text-[#f59e0b] text-left">
                  Connect your social accounts in{" "}
                  <a href="/settings" className="text-[#1a7352] font-semibold no-underline hover:underline">
                    Settings → Integrations
                  </a>
                </span>
              </div>
            )}

            {/* Example prompts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-2 max-w-[480px] w-full">
              {[
                "We just launched our new product! 500 signups in 1 hour",
                "Just finished reading a great book about startup growth",
                "We hit $10k MRR today — sharing our journey",
                "Exciting news: we raised our seed round!",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="px-3.5 py-2.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-[10px] text-[12px] text-[var(--text-secondary)] text-left leading-[1.5] transition-all duration-200 cursor-pointer hover:border-[rgba(67,56,255,0.4)] hover:text-[var(--text-primary)]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="fade-in animate-in slide-in-from-bottom-2 duration-300">
            {msg.role === "user" ? (
              <div className="flex justify-end pl-12">
                <div className="bg-gradient-to-br from-[#1a7352] to-[#2d9e6f] text-white px-[18px] py-[12px] rounded-t-[18px] rounded-bl-[18px] rounded-br-[4px] text-[14px] leading-[1.6] shadow-[0_4px_16px_rgba(26,115,82,0.25)] whitespace-pre-wrap">
                  {msg.content}
                </div>
              </div>
            ) : (
              <div className="flex gap-3 items-start pr-12">
                {/* AI avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1a7352] to-[#2d9e6f] flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <Zap size={14} color="white" />
                </div>
                <div className="flex-1 min-w-0">
                  {msg.content !== "Here are your posts 👇" && msg.content.trim() !== "" && (
                    <div className={`bg-[var(--surface-2)] border border-[var(--border)] px-4 py-3 rounded-t-[18px] rounded-br-[18px] rounded-bl-[4px] text-[14px] text-[var(--text-secondary)] leading-[1.6] flex items-center gap-2 ${msg.postGroup ? 'mb-4' : 'mb-0'} whitespace-pre-wrap`}>
                      {msg.content.includes("connect") || msg.content.includes("Connect") ? (
                        <>
                          <AlertCircle size={16} color="#f59e0b" className="shrink-0" />
                          <span>
                            {msg.content}{" "}
                            <a href="/settings" className="text-[#1a7352] font-semibold no-underline hover:underline">
                              Go to Settings
                            </a>
                          </span>
                        </>
                      ) : (
                        msg.content
                      )}
                    </div>
                  )}

                  {msg.questionnaire && !msg.isFormSubmitted && (
                    <QuestionnaireForm
                      questions={msg.questionnaire}
                      onSubmit={async (answersText) => {
                        // Mark as submitted
                        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isFormSubmitted: true } : m));
                        
                        // Add user response visually
                        const userMsg: ChatMsg = {
                          id: nanoid(),
                          role: "user",
                          content: answersText,
                        };
                        setMessages(prev => [...prev, userMsg]);
                        
                        // Send to AI
                        setGenerating(true);
                        try {
                          const res = await fetch("/api/ai/chat", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ 
                              messages: [...messages, userMsg],
                              workspaceName: workspace.name,
                              workspacePurpose: workspace.details || "General social media"
                            }),
                          });
                          const data = await res.json();
                          
                          let responseContent = data.text;
                          let questionnaireData: Question[] | undefined;
                          const qMatch = responseContent.match(/\[QUESTIONNAIRE:\s*(\[[\s\S]*?\])\]/);
                          if (qMatch) {
                            try {
                              questionnaireData = JSON.parse(qMatch[1]);
                              responseContent = responseContent.replace(qMatch[0], "").trim();
                            } catch (e) {
                              console.error("Failed to parse questionnaire", e);
                            }
                          }

                          if (responseContent.includes("[REQUEST_GENERATE_POSTS]")) {
                            setMessages(prev => [
                              ...prev, 
                              {
                                id: nanoid(),
                                role: "assistant",
                                content: "Choose platforms to generate posts for:",
                                isPlatformSelector: true,
                              }
                            ]);
                          } else {
                            setMessages(prev => [
                              ...prev,
                              {
                                id: nanoid(),
                                role: "assistant",
                                content: responseContent,
                                questionnaire: questionnaireData,
                              }
                            ]);
                          }
                        } catch {
                          toast.error("Failed to submit answers");
                        } finally {
                          setGenerating(false);
                        }
                      }}
                    />
                  )}
                  {msg.questionnaire && msg.isFormSubmitted && (
                    <div className="mt-3 text-[13px] text-green-600 flex items-center gap-1.5 font-medium">
                      <AlertCircle size={14} /> Information provided
                    </div>
                  )}

                  {msg.isPlatformSelector && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 w-full max-w-[600px]">
                      {(["linkedin", "x", "telegram"] as SocialPlatform[]).map((p) => {
                        const info = PLATFORM_INFO[p];
                        const isConnected = connectedPlatforms.includes(p);
                        const isSelected = selectedPlatforms.includes(p);
                        return (
                          <button
                            key={p}
                            onClick={() => {
                              if (isSelected) setSelectedPlatforms(selectedPlatforms.filter(x => x !== p));
                              else setSelectedPlatforms([...selectedPlatforms, p]);
                            }}
                            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-[16px] border-2 transition-all duration-200 text-center ${
                              isSelected 
                                ? "border-[#1a7352] bg-[rgba(26,115,82,0.05)] shadow-sm" 
                                : "border-[var(--border)] bg-[var(--surface-1)] hover:border-[#1a7352] hover:bg-[var(--surface-2)] cursor-pointer"
                            }`}
                          >
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: info.color }}>
                              {info.icon}
                            </div>
                            <div className="text-[14px] font-bold text-[var(--text-primary)]">{info.label}</div>
                            {!isConnected && (
                              <div className="text-[11px] text-[#f59e0b] font-medium" onClick={e => e.stopPropagation()}>
                                Not connected
                              </div>
                            )}
                          </button>
                        );
                      })}
                      <div className="sm:col-span-3 mt-2 flex justify-end">
                        <button 
                          onClick={() => handleGenerate(selectedPlatforms, msg.id)}
                          disabled={selectedPlatforms.length === 0 || generating}
                          className="btn btn-primary shadow-md hover:shadow-lg transition-all"
                        >
                          {generating ? <div className="spinner w-4 h-4" /> : <><Zap size={16} /> Generate Selected</>}
                        </button>
                      </div>
                    </div>
                  )}

                  {msg.postGroup && (
                    <div className="flex flex-wrap gap-4 max-w-[600px] mt-2">
                      {msg.postGroup.posts.map((post) => {
                        const info = PLATFORM_INFO[post.platform];
                        return (
                          <div 
                            key={post.id} 
                            onClick={() => setEditingPost({ groupId: msg.postGroup!.id, post })}
                            className="relative group w-[160px] h-[160px] rounded-[16px] border bg-[var(--surface-1)] p-4 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer" 
                            style={{ borderColor: `${info.color}30` }}
                          >
                            <div className="flex items-center gap-2 font-bold text-[13px]" style={{ color: info.color }}>
                              {info.icon} {info.label}
                            </div>
                            <p className="text-[11px] text-[var(--text-secondary)] leading-[1.5] line-clamp-4 mt-2 flex-1 whitespace-pre-wrap">
                              {post.content}
                            </p>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingPost({ groupId: msg.postGroup!.id, post });
                              }}
                              className="w-full py-2 mt-3 rounded-[8px] text-[12px] font-bold text-white transition-opacity sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer hover:brightness-110"
                              style={{ background: info.color }}
                            >
                              Edit / Preview
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Generating indicator */}
        {generating && (
          <div className="flex gap-3 items-start fade-in animate-in slide-in-from-bottom-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1a7352] to-[#2d9e6f] flex items-center justify-center shrink-0 shadow-sm mt-1">
              <Zap size={14} color="white" />
            </div>
            <div className="bg-[var(--surface-2)] border border-[var(--border)] px-4 py-3.5 rounded-t-[18px] rounded-br-[18px] rounded-bl-[4px] flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-[#1a7352] animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
        </>
      )}

      {/* Input area */}
      <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--surface-1)] shrink-0 z-10">
        {/* Mode toggle pill */}
        <div className="flex items-center justify-between mb-3">
          <div className="inline-flex items-center gap-0.5 bg-[var(--surface-3)] rounded-full p-0.5 border border-[var(--border)]">
            <button
              onClick={() => setChatMode("post")}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all duration-200 cursor-pointer ${
                chatMode === "post"
                  ? "bg-[var(--surface-1)] text-[var(--text-primary)] shadow-sm border border-[var(--border)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              Post
            </button>
            <button
              onClick={() => setChatMode("story")}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all duration-200 cursor-pointer ${
                chatMode === "story"
                  ? "bg-gradient-to-r from-[#1a7352] to-[#2d9e6f] text-white shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              🗺️ Story
            </button>
          </div>

          <div className="flex flex-wrap gap-4">
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="btn btn-outline btn-sm gap-1.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer px-3 py-1.5 text-[13px] flex items-center font-medium"
              >
                New Post
              </button>
            )}
          </div>
          <div className="text-[12px] md:text-[13px] flex items-center gap-2 md:gap-3 shrink-0 ml-auto">
            <span className="hidden sm:inline text-[var(--text-secondary)]">Available: </span>
            <div className="flex items-center gap-1">
              <Zap size={14} color={billingInfo?.totalAvailable ? "#10b981" : "#ef4444"} />
              <strong className="text-[14px] md:text-[16px]" style={{ color: billingInfo?.totalAvailable ? "#10b981" : "#ef4444" }}>
                {billingInfo?.totalAvailable || 0}
              </strong>
            </div>
            {(!billingInfo?.isPro || (billingInfo && billingInfo.totalAvailable <= 2)) && (
              <button
                onClick={onUpgrade}
                className="bg-gradient-to-br from-[rgba(245,158,11,0.1)] to-[rgba(239,68,68,0.1)] border border-[rgba(245,158,11,0.3)] text-[#f59e0b] px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-[10px] md:text-[11px] font-bold cursor-pointer uppercase tracking-[0.05em] hover:from-[rgba(245,158,11,0.2)] hover:to-[rgba(239,68,68,0.2)] transition-colors"
              >
                Top up
              </button>
            )}
          </div>
        </div>

        {chatMode !== "story" && (
          <>
            <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-[16px] px-4 py-3 flex gap-3 items-end transition-colors duration-200 focus-within:border-[rgba(67,56,255,0.5)] shadow-sm">
              {(() => {
                const hasPendingQuestionnaire = messages.some(m => m.questionnaire && !m.isFormSubmitted);
                const isInputDisabled = hasPendingQuestionnaire;

                let placeholder = "What's happening? Tell me and I'll create posts for you...";
                if (hasPendingQuestionnaire) {
                  placeholder = "Please fill out the form above to continue.";
                }

                return (
                  <textarea
                    ref={textareaRef}
                    id="chat-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (!isInputDisabled) handleSend();
                      }
                    }}
                    disabled={isInputDisabled}
                    placeholder={placeholder}
                    rows={1}
                    className="flex-1 bg-transparent border-none outline-none resize-none text-[var(--text-primary)] text-[14px] leading-[1.6] font-['Inter'] min-h-[22px] max-h-[140px] py-1 placeholder-[var(--text-muted)] disabled:opacity-50"
                  />
                );
              })()}
              <button
                id="chat-send"
                onClick={handleSend}
                disabled={!input.trim() || generating || messages.some(m => m.questionnaire && !m.isFormSubmitted)}
                className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 transition-all duration-200 disabled:bg-[var(--surface-4)] disabled:cursor-not-allowed disabled:shadow-none disabled:text-[var(--text-muted)] bg-gradient-to-br from-[#1a7352] to-[#2d9e6f] text-white cursor-pointer shadow-[0_4px_12px_rgba(26,115,82,0.3)] hover:shadow-[0_4px_16px_rgba(26,115,82,0.4)] hover:-translate-y-[1px]"
              >
                <ArrowUp size={18} strokeWidth={2.5} />
              </button>
            </div>

            <div className="text-[11px] text-[var(--text-muted)] text-center mt-2.5 hidden sm:block">
              Press <kbd className="bg-[var(--surface-3)] px-1.5 py-0.5 rounded-[4px] border border-[var(--border)] font-sans mx-0.5 shadow-sm text-[10px]">Enter</kbd> to send · <kbd className="bg-[var(--surface-3)] px-1.5 py-0.5 rounded-[4px] border border-[var(--border)] font-sans mx-0.5 shadow-sm text-[10px]">Shift+Enter</kbd> for new line
            </div>
          </>
        )}

      </div>

      {chatMode === "post" && (
        <>
          {editingPost && editingPost.post.platform === "linkedin" && (
        <LinkedInPostPreviewModal
          post={editingPost.post}
          workspace={workspace}
          onClose={() => setEditingPost(null)}
          onUpdate={(content) => handleUpdatePost(editingPost.groupId, editingPost.post.id, content)}
        />
      )}
      {editingPost && editingPost.post.platform !== "linkedin" && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="relative w-full max-w-[500px]">
            <PostCard
              post={editingPost.post}
              workspace={workspace}
              onUpdate={(content) => handleUpdatePost(editingPost.groupId, editingPost.post.id, content)}
            />
            <button 
              onClick={() => setEditingPost(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-black shadow-md flex items-center justify-center cursor-pointer hover:bg-gray-100 z-[1010]"
            >
              <Zap size={14} className="hidden" />
              ×
            </button>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
