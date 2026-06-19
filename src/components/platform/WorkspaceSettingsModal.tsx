"use client";

import { useState, useEffect, useCallback } from "react";
import { X as XIcon, Check, ExternalLink, Lock, AlertCircle, Trash2, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import type { Workspace } from "@/types";

interface Integration {
  id: string;
  platform: string;
  metadata: { channelUsername?: string; botUsername?: string; screenName?: string; username?: string; name?: string } | null;
  toneOfVoice?: string | null;
  createdAt: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  workspace: Workspace;
  onUpdateName?: (newName: string) => void;
}

export function WorkspaceSettingsModal({ isOpen, onClose, workspace, onUpdateName }: Props) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"integrations" | "tov">("integrations");

  // Rename
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    if (isOpen && workspace.name) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditName(workspace.name);
    }
  }, [isOpen, workspace.name]);

  // Telegram form
  const [tgBotToken, setTgBotToken] = useState("");
  const [tgChannel, setTgChannel] = useState("");
  const [tgSaving, setTgSaving] = useState(false);

  const fetchIntegrations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/integrations?workspaceId=${workspace.id}`);
      if (res.ok) {
        const data = await res.json();
        setIntegrations(data);
      }
    } finally {
      setLoading(false);
    }
  }, [workspace.id]);

  useEffect(() => {
    if (isOpen && workspace.id) {
      fetchIntegrations();
    }
  }, [isOpen, workspace.id, fetchIntegrations]);

  const getIntegration = (platform: string) =>
    integrations.find((i) => i.platform === platform);

  const handleDeleteIntegration = async (platform: string) => {
    if (!confirm(`Remove ${platform} integration from this workspace?`)) return;

    const res = await fetch(`/api/integrations?platform=${platform}&workspaceId=${workspace.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      toast.success("Integration removed");
      fetchIntegrations();
    } else {
      toast.error("Failed to remove integration");
    }
  };

  const handleTelegramSave = async () => {
    if (!tgBotToken || !tgChannel) {
      toast.error("Please fill in bot token and channel username");
      return;
    }
    setTgSaving(true);
    try {
      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: "telegram",
          botToken: tgBotToken,
          channelUsername: tgChannel,
          workspaceId: workspace.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to save integration");
        return;
      }

      toast.success(`Telegram connected! Bot: @${data.botUsername}`);
      setTgBotToken("");
      setTgChannel("");
      fetchIntegrations();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setTgSaving(false);
    }
  };

  const handleSaveName = async () => {
    if (!editName.trim() || editName === workspace.name) {
      setIsEditingName(false);
      return;
    }
    setSavingName(true);
    try {
      const res = await fetch("/api/workspaces", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: workspace.id, name: editName }),
      });
      if (!res.ok) throw new Error();
      toast.success("Workspace renamed");
      setIsEditingName(false);
      onUpdateName?.(editName);
    } catch {
      toast.error("Failed to rename workspace");
    } finally {
      setSavingName(false);
    }
  };

  if (!isOpen) return null;

  const telegramIntegration = getIntegration("telegram");
  const xIntegration = getIntegration("x");
  const linkedinIntegration = getIntegration("linkedin");

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-4"
      onClick={onClose}
    >
      <div
        className="fade-in bg-[var(--surface-1)] w-full max-w-[600px] rounded-[24px] shadow-[0_24px_48px_rgba(0,0,0,0.2)] flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-5 md:px-8 md:pt-6 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 mr-4">
              <h2 className="font-['Outfit'] text-[22px] font-bold text-[var(--text-primary)] mb-1">
                Workspace Settings
              </h2>
              {isEditingName ? (
                <div className="flex items-center gap-2 mt-1 max-w-[300px]">
                  <input
                    autoFocus
                    className="input text-[14px] px-2 py-1 flex-1 min-w-0"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={savingName}
                    className="btn btn-primary btn-sm px-2 py-1 shrink-0"
                  >
                    {savingName ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="btn btn-ghost btn-sm px-2 py-1 shrink-0"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <p className="text-[14px] text-[var(--text-secondary)] flex items-center gap-2">
                  Manage settings for
                  <span className="text-[var(--text-primary)] font-semibold cursor-pointer hover:underline" onClick={() => setIsEditingName(true)} title="Click to rename">
                    {workspace.name} <Pencil size={12} className="inline ml-0.5 text-[var(--text-muted)]" />
                  </span>
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="btn btn-ghost rounded-full p-2"
            >
              <XIcon size={20} />
            </button>
          </div>

          <div className="flex items-center gap-6 mt-2">
            <button
              onClick={() => setActiveTab("integrations")}
              className={`pb-3 text-[14px] font-semibold border-b-2 transition-colors ${activeTab === "integrations" ? "border-[var(--primary)] text-[var(--text-primary)]" : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"}`}
            >
              Integrations
            </button>
            <button
              onClick={() => setActiveTab("tov")}
              className={`pb-3 text-[14px] font-semibold border-b-2 transition-colors ${activeTab === "tov" ? "border-[var(--primary)] text-[var(--text-primary)]" : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"}`}
            >
              Tone of Voice
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center p-10">
              <div className="spinner w-6 h-6" />
            </div>
          ) : activeTab === "integrations" ? (
            <div className="flex flex-col gap-4">
              {/* X (Twitter) */}
              <IntegrationCard
                platform="X (Twitter)"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                }
                color="#e7e9ea"
                description="Connect your X account to post tweets directly"
                connected={!!xIntegration}
                connectedLabel={xIntegration?.metadata?.username ? `@${xIntegration.metadata.username}` : "Connected"}
                onConnect={() => {
                  window.location.href = `/api/integrations/x?workspaceId=${workspace.id}`;
                }}
                onDisconnect={() => handleDeleteIntegration("x")}
                comingSoon={false}
              />

              {/* LinkedIn */}
              <IntegrationCard
                platform="LinkedIn"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                }
                color="#0a66c2"
                description="Connect your LinkedIn profile or company page"
                connected={!!linkedinIntegration}
                connectedLabel={linkedinIntegration?.metadata?.name || "Connected"}
                onConnect={() => {
                  window.location.href = `/api/integrations/linkedin?workspaceId=${workspace.id}`;
                }}
                onDisconnect={() => handleDeleteIntegration("linkedin")}
                comingSoon={false}
              />

              {/* Telegram */}
              <div
                className={`card ${telegramIntegration ? 'bg-[rgba(34,158,217,0.05)] border-[rgba(34,158,217,0.3)]' : 'bg-[var(--surface-1)] border-[var(--border)]'} border`}
              >
                <div className={`flex items-start justify-between gap-4 ${telegramIntegration ? 'mb-0' : 'mb-5'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[rgba(34,158,217,0.15)] border border-[rgba(34,158,217,0.3)] flex items-center justify-center text-[#229ed9]">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[16px] font-bold text-[var(--text-primary)] mb-1">
                        Telegram Channel
                      </div>
                      <div className="text-[13px] text-[var(--text-secondary)]">
                        {telegramIntegration
                          ? `Bot: @${telegramIntegration.metadata?.botUsername} → ${telegramIntegration.metadata?.channelUsername}`
                          : "Post to your Telegram channels via Bot API"}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 items-center">
                    {telegramIntegration ? (
                      <>
                        <div className="badge badge-success flex items-center gap-1">
                          <Check size={11} />
                          Connected
                        </div>
                        <button
                          onClick={() => handleDeleteIntegration("telegram")}
                          className="btn btn-danger btn-sm"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>

                {/* Telegram setup form */}
                {!telegramIntegration && (
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2.5 px-3.5 py-3 bg-[rgba(67,56,255,0.08)] border border-[rgba(67,56,255,0.2)] rounded-[10px]">
                      <AlertCircle size={15} color="#1a7352" className="shrink-0 mt-0.5" />
                      <div className="text-[12px] text-[var(--text-secondary)] leading-[1.6]">
                        <strong className="text-[var(--text-primary)]">Setup:</strong>{" "}
                        1. Create a bot via{" "}
                        <a
                          href="https://t.me/BotFather"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#229ed9] no-underline hover:underline"
                        >
                          @BotFather ↗
                        </a>
                        {" → "}
                        2. Add the bot as admin to your channel{" → "}
                        3. Paste credentials below
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[12px] font-semibold text-[var(--text-secondary)] block mb-1.5">
                          Bot Token
                        </label>
                        <input
                          type="password"
                          className="input text-[13px]"
                          placeholder="1234567890:ABC..."
                          value={tgBotToken}
                          onChange={(e) => setTgBotToken(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[12px] font-semibold text-[var(--text-secondary)] block mb-1.5">
                          Channel @username
                        </label>
                        <input
                          type="text"
                          className="input text-[13px]"
                          placeholder="@mychannel"
                          value={tgChannel}
                          onChange={(e) => setTgChannel(e.target.value)}
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleTelegramSave}
                      disabled={!tgBotToken || !tgChannel || tgSaving}
                      className="btn btn-primary self-start"
                    >
                      {tgSaving ? (
                        <div className="spinner w-4 h-4" />
                      ) : (
                        "Connect Telegram"
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Instagram - Coming soon */}
              <IntegrationCard
                platform="Instagram"
                icon={<span className="text-[20px]">📸</span>}
                color="#e1306c"
                description="Coming soon — Instagram direct publishing"
                connected={false}
                connectedLabel=""
                onConnect={() => {}}
                onDisconnect={() => {}}
                comingSoon={true}
              />
            </div>
          ) : null}

          {/* Danger Zone */}
          {activeTab === "integrations" && (
            <div className="mt-10">
              <div className="text-[14px] font-bold text-[#ef4444] mb-4 pb-2 border-b border-[rgba(239,68,68,0.2)]">
                Danger Zone
              </div>
              <div className="card flex items-center justify-between p-4 md:p-5 bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.2)]">
                <div>
                  <div className="text-[15px] font-bold text-[var(--text-primary)]">
                    Delete Workspace
                  </div>
                  <div className="text-[13px] text-[var(--text-secondary)] mt-0.5 max-w-[300px] md:max-w-none">
                    Permanently remove this workspace and all its data. This action cannot be undone.
                  </div>
                </div>
                <button
                  onClick={async () => {
                    if (confirm("Are you ABSOLUTELY sure you want to delete this workspace? All posts and history will be lost forever.")) {
                      try {
                        const res = await fetch(`/api/workspaces?id=${workspace.id}`, { method: "DELETE" });
                        if (res.ok) {
                          toast.success("Workspace deleted");
                          window.location.href = "/dashboard";
                        } else {
                          toast.error("Failed to delete workspace");
                        }
                      } catch {
                        toast.error("An error occurred");
                      }
                    }
                  }}
                  className="btn btn-danger shrink-0 ml-4"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          )}

          {activeTab === "tov" && (
            <ToneOfVoiceTab workspaceId={workspace.id} linkedinIntegration={linkedinIntegration} telegramIntegration={telegramIntegration} />
          )}

        </div>
      </div>
    </div>
  );
}

// Reusable integration card component
function IntegrationCard({
  platform,
  icon,
  color,
  description,
  connected,
  connectedLabel,
  onConnect,
  onDisconnect,
  comingSoon,
}: {
  platform: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  connected: boolean;
  connectedLabel: string;
  onConnect: () => void;
  onDisconnect: () => void;
  comingSoon: boolean;
}) {
  return (
    <div
      className={`card flex items-center justify-between gap-4 border ${connected ? 'bg-opacity-5' : 'bg-[var(--surface-1)]'}`}
      style={{
        background: connected ? `${color}08` : undefined,
        borderColor: connected ? `${color}30` : "var(--border)",
        opacity: comingSoon ? 0.6 : 1,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-xl border flex items-center justify-center shrink-0"
          style={{
            background: `${color}15`,
            borderColor: `${color}30`,
            color,
          }}
        >
          {icon}
        </div>
        <div>
          <div className="text-[15px] font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
            {platform}
            {comingSoon && (
              <span className="text-[11px] font-bold text-[#f59e0b] bg-[rgba(245,158,11,0.1)] px-2 py-0.5 rounded-full border border-[rgba(245,158,11,0.3)]">
                Coming soon
              </span>
            )}
          </div>
          <div className="text-[13px] text-[var(--text-secondary)]">
            {connected ? connectedLabel : description}
          </div>
        </div>
      </div>

      {!comingSoon && (
        <div className="flex gap-2 shrink-0">
          {connected ? (
            <>
              <div className="badge badge-success">
                <Check size={11} />
                Connected
              </div>
              <button
                onClick={onDisconnect}
                className="btn btn-danger btn-sm"
              >
                <Trash2 size={14} />
              </button>
            </>
          ) : (
            <button onClick={onConnect} className="btn btn-primary btn-sm">
              <ExternalLink size={14} />
              Connect
            </button>
          )}
        </div>
      )}

      {comingSoon && (
        <div className="shrink-0">
          <Lock size={16} className="text-[var(--text-muted)]" />
        </div>
      )}
    </div>
  );
}

function ToneOfVoiceTab({ workspaceId, linkedinIntegration, telegramIntegration }: { workspaceId: string, linkedinIntegration?: { toneOfVoice?: string | null }, telegramIntegration?: { toneOfVoice?: string | null } }) {
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [tovs, setTovs] = useState<Record<string, string>>({
    linkedin: linkedinIntegration?.toneOfVoice || "",
    telegram: telegramIntegration?.toneOfVoice || "",
  });
  const [savingFor, setSavingFor] = useState<string | null>(null);

  const handleGenerateTov = async (platform: string) => {
    setGeneratingFor(platform);
    try {
      const res = await fetch(`/api/integrations/${platform}/tov`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || `Failed to generate Tone of Voice for ${platform}`);
        return;
      }
      setTovs(prev => ({ ...prev, [platform]: data.toneOfVoice }));
      toast.success(`${platform} Tone of Voice generated!`);
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setGeneratingFor(null);
    }
  };

  const handleSaveTov = async (platform: string) => {
    setSavingFor(platform);
    try {
      const res = await fetch(`/api/integrations/${platform}/tov`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, toneOfVoice: tovs[platform] }),
      });
      if (!res.ok) throw new Error();
      toast.success("Saved!");
    } catch (e) {
      toast.error("Failed to save");
    } finally {
      setSavingFor(null);
    }
  };

  const renderPlatform = (platformId: string, platformName: string, isConnected: boolean, canGenerate: boolean = true) => {
    const isGenerating = generatingFor === platformId;
    const isSaving = savingFor === platformId;
    const tov = tovs[platformId];

    return (
      <div className="card border bg-[var(--surface-1)] border-[var(--border)] p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[15px] font-bold text-[var(--text-primary)]">
            {platformName}
          </div>
          {isConnected ? (
            <button
              onClick={() => handleGenerateTov(platformId)}
              disabled={isGenerating || !canGenerate}
              className="btn btn-primary btn-sm"
            >
              {isGenerating ? <div className="spinner w-3 h-3" /> : "Generate Tone of Voice"}
            </button>
          ) : (
            <div className="text-[12px] text-[var(--text-muted)] font-medium bg-[var(--surface-2)] px-2 py-1 rounded">
              Connect first
            </div>
          )}
        </div>

        {isConnected ? (
          <div className="flex flex-col gap-2">
            <textarea
              className="input text-[13px] leading-relaxed resize-y min-h-[100px]"
              placeholder={canGenerate ? "Click 'Generate' to analyze your past posts, or type your Tone of Voice manually here..." : "Type your Tone of Voice manually here..."}
              value={tov}
              onChange={(e) => setTovs(prev => ({ ...prev, [platformId]: e.target.value }))}
            />
            <div className="flex justify-end">
              <button
                onClick={() => handleSaveTov(platformId)}
                disabled={isSaving || !tov.trim()}
                className="btn btn-ghost btn-sm text-[var(--text-secondary)]"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-[13px] text-[var(--text-muted)]">
            You must connect {platformName} in the Integrations tab before you can set a Tone of Voice.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="text-[13px] text-[var(--text-secondary)] mb-2">
        Tone of Voice allows the AI to learn your writing style. Generate it automatically from your past posts, or write it manually.
      </div>
      
      {renderPlatform("linkedin", "LinkedIn", !!linkedinIntegration, true)}
      {renderPlatform("telegram", "Telegram", !!telegramIntegration, false)}
    </div>
  );
}
