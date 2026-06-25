"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp, Zap, AlertCircle, Settings, Plus, Map, History, X } from "lucide-react";
import toast from "react-hot-toast";
import { PostCard } from "./PostCard";

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
  initialGeneratedData?: { context: string; posts: any[] } | null;
  prefilledPrompt?: string | null;
  onPromptConsumed?: () => void;
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
  threads: {
    label: "Threads",
    icon: (
      <svg width="14" height="14" viewBox="0 0 192 192" fill="currentColor">
        <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.3109C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.708C154.894 45.6981 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 28.1872C147.036 10.1422 125.202 0.455304 97.0203 0C65.3116 0.460835 41.6508 10.3015 25.8643 30.3444C10.4578 49.8974 2.82522 75.3853 2.50024 96C2.82522 116.615 10.4578 142.103 25.8643 161.656C41.6508 181.699 65.3116 191.539 97.0203 192C126.18 191.562 146.903 183.056 163.66 166.309C184.28 145.704 180.199 116.711 166.702 96.0645C158.828 83.9935 149.658 75.6426 138.868 69.8322C138.799 71.189 138.69 72.5354 138.544 73.8697C140.237 78.4316 141.258 83.5684 141.537 88.9883ZM121.666 98.7188C121.22 113.886 112.981 125.327 98.5369 126.046C92.6841 126.364 87.2346 125.105 82.5259 122.259C77.4098 119.222 74.321 113.784 73.9189 106.326C73.1903 92.6834 83.9926 84.773 99.426 84.4533C104.996 84.3377 110.366 84.8251 115.351 85.875C118.847 90.1691 121.054 94.6983 121.666 98.7188Z" />
      </svg>
    ),
    color: "#000000",
  },
};

export function ChatArea({ workspace, billingInfo, onBillingUpdate, onUpgrade, initialGeneratedData, prefilledPrompt, onPromptConsumed }: Props) {
  const connectedPlatforms = workspace.socials.map((s) => s.platform as SocialPlatform);
  
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [generating, setGenerating] = useState(false);

  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([]);
  const [editingPost, setEditingPost] = useState<{groupId: string, post: GeneratedPostItem} | null>(null);
  const [chatMode, setChatMode] = useState<"post" | "story">("post");
  const [chatTitle, setChatTitle] = useState("New Chat");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedPlatforms(workspace.socials.map((s) => s.platform as SocialPlatform));
  }, [workspace]);

  useEffect(() => {
    if (initialGeneratedData && messages.length === 0) {
      const exists = messages.some(m => m.postGroup?.context === initialGeneratedData.context);
      if (!exists) {
        const postGroup: GeneratedPostGroup = {
          id: nanoid(),
          context: initialGeneratedData.context,
          posts: initialGeneratedData.posts.map(
            (p: any) => ({
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
          content: "Here are your first posts! 👇",
          postGroup,
        };

        const userMsg: ChatMsg = {
          id: nanoid(),
          role: "user",
          content: initialGeneratedData.context,
        };

        setMessages([userMsg, assistantMsg]);
      }
    }
  }, [initialGeneratedData, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`/api/chats?workspaceId=${workspace.id}`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [workspace.id]);

  const syncChatSession = async () => {
    if (messages.length === 0) return;
    try {
      const res = await fetch("/api/chats/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace.id,
          sessionId: currentSessionId,
          title: chatTitle,
          messages,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.sessionId && !currentSessionId) {
          setCurrentSessionId(data.sessionId);
        }
        fetchSessions(); // refresh the list
      }
    } catch (e) {
      console.error("Failed to sync chat", e);
    }
  };

  useEffect(() => {
    if (!generating && messages.length > 0) {
      syncChatSession();
    }
  }, [messages, generating, chatTitle]);

  const startNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setChatTitle("New Chat");
  };

  const loadSession = (session: any) => {
    try {
      const loadedMessages = session.messages.map((m: any) => JSON.parse(m.content));
      setMessages(loadedMessages);
      setCurrentSessionId(session.id);
      setChatTitle(session.title);
      setHistoryOpen(false);
    } catch (e) {
      console.error("Failed to load session", e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }, [input]);

  useEffect(() => {
    if (prefilledPrompt) {
      // Simulate sending the prompt
      setInput(prefilledPrompt);
      if (onPromptConsumed) onPromptConsumed();
      
      // Use setTimeout to ensure state is updated before form submission
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.value = prefilledPrompt;
          // Create a synthetic event
          const event = new Event('submit', { bubbles: true, cancelable: true });
          const form = textareaRef.current.closest('form');
          if (form) {
            form.dispatchEvent(event);
          }
        }
      }, 50);
    }
  }, [prefilledPrompt, onPromptConsumed]);

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

      let qMatch = responseContent.match(/\[QUESTIONNAIRE:\s*(\[[\s\S]*?\])\]/);
      if (!qMatch) {
        // Fallback for malformed AI output (missing outer bracket) or new format
        qMatch = responseContent.match(/QUESTIONNAIRE(?:_JSON)?:\s*(\[[\s\S]*\])/);
      }

      if (qMatch) {
        try {
          const jsonString = qMatch[1];
          const firstBracket = jsonString.indexOf('[');
          const lastBracket = jsonString.lastIndexOf(']');
          if (firstBracket !== -1 && lastBracket !== -1) {
            const cleanJson = jsonString.substring(firstBracket, lastBracket + 1);
            questionnaireData = JSON.parse(cleanJson);
            // Remove the matched tag from the display text
            const fullMatchIdx = responseContent.indexOf(qMatch[0]);
            if (fullMatchIdx !== -1) {
              responseContent = responseContent.substring(0, fullMatchIdx) + responseContent.substring(fullMatchIdx + qMatch[0].length);
              responseContent = responseContent.trim();
              
              // Remove any stray trailing `]` if the old format missed the outer closing bracket
              if (responseContent.endsWith("]")) {
                responseContent = responseContent.slice(0, -1).trim();
              }
            }
          }
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
      <div className="w-full bg-[var(--surface-1)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setHistoryOpen(true)}
            className="p-2 -ml-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] rounded-md transition-colors"
            title="Chat History"
          >
            <History size={18} />
          </button>
          <div>
            <div className="font-['Outfit'] font-bold text-[18px] text-[var(--text-primary)] flex items-center gap-2">
              {chatTitle}
            </div>
            <div className="text-[13px] text-[var(--text-secondary)]">
              Workspace: {workspace.name}
            </div>
          </div>
        </div>
        <button
          onClick={startNewChat}
          className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] rounded-md transition-colors flex items-center gap-2 text-[14px] font-medium"
          title="New Chat"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </div>

      {historyOpen && (
        <div className="absolute inset-y-0 left-0 w-full sm:w-[320px] bg-[var(--surface-1)] border-r border-[var(--border)] z-50 flex flex-col shadow-2xl animate-in slide-in-from-left">
          <div className="p-4 border-b border-[var(--border)] flex items-center justify-between shrink-0">
            <h3 className="font-['Outfit'] font-bold text-[18px] text-[var(--text-primary)] flex items-center gap-2">
              <History size={18} className="text-[#1a7352]" />
              Chat History
            </h3>
            <button
              onClick={() => setHistoryOpen(false)}
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] rounded-md transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {sessions.length === 0 ? (
              <div className="text-center text-[var(--text-muted)] text-[13px] mt-10">
                No past chats found
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {sessions.map(s => (
                  <button
                    key={s.id}
                    onClick={() => loadSession(s)}
                    className={`w-full text-left p-3 rounded-[10px] transition-colors ${currentSessionId === s.id ? 'bg-[#1a7352]/10 text-[#1a7352] font-semibold' : 'hover:bg-[var(--surface-2)] text-[var(--text-secondary)]'}`}
                  >
                    <div className="truncate text-[14px] mb-1">{s.title}</div>
                    <div className="text-[11px] opacity-70">
                      {new Date(s.updatedAt).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}



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
        <div id="tour-mode-switcher" className="flex items-center justify-between mb-3">
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
              <span className="flex items-center gap-1.5"><Map size={14} /> Story</span>
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
            <div className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity" onClick={onUpgrade}>
              <Zap size={14} color={billingInfo?.totalAvailable ? "#10b981" : "#ef4444"} />
              <strong className="text-[14px] md:text-[16px]" style={{ color: billingInfo?.totalAvailable ? "#10b981" : "#ef4444" }}>
                {billingInfo?.totalAvailable || 0}
              </strong>
              <Plus size={16} className="text-[var(--text-secondary)] ml-0.5" />
            </div>
          </div>
        </div>

        {chatMode !== "story" && (
          <>
            <div id="tour-chat-input" className="bg-[var(--surface-2)] border border-[var(--border)] rounded-[16px] px-4 py-3 flex gap-3 items-end transition-colors duration-200 focus-within:border-[rgba(67,56,255,0.5)] shadow-sm">
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
