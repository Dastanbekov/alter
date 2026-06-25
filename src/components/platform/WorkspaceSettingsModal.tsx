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
  const [activeTab, setActiveTab] = useState<"integrations" | "brand" | "tov">("integrations");

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
              onClick={() => setActiveTab("brand")}
              className={`pb-3 text-[14px] font-semibold border-b-2 transition-colors ${activeTab === "brand" ? "border-[var(--primary)] text-[var(--text-primary)]" : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"}`}
            >
              Brand Details
            </button>
            <button
              onClick={() => setActiveTab("tov")}
              className={`pb-3 text-[14px] font-semibold border-b-2 transition-colors ${activeTab === "tov" ? "border-[var(--primary)] text-[var(--text-primary)]" : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"}`}
            >
              Platform TOV
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

              {/* Threads */}
              <IntegrationCard
                platform="Threads"
                icon={
                  <svg width="18" height="18" viewBox="0 0 192 192" fill="currentColor">
                    <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.3109C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.708C154.894 45.6981 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 28.1872C147.036 10.1422 125.202 0.455304 97.0203 0C65.3116 0.460835 41.6508 10.3015 25.8643 30.3444C10.4578 49.8974 2.82522 75.3853 2.50024 96C2.82522 116.615 10.4578 142.103 25.8643 161.656C41.6508 181.699 65.3116 191.539 97.0203 192C126.18 191.562 146.903 183.056 163.66 166.309C184.28 145.704 180.199 116.711 166.702 96.0645C158.828 83.9935 149.658 75.6426 138.868 69.8322C138.799 71.189 138.69 72.5354 138.544 73.8697C140.237 78.4316 141.258 83.5684 141.537 88.9883ZM121.666 98.7188C121.22 113.886 112.981 125.327 98.5369 126.046C92.6841 126.364 87.2346 125.105 82.5259 122.259C77.4098 119.222 74.321 113.784 73.9189 106.326C73.1903 92.6834 83.9926 84.773 99.426 84.4533C104.996 84.3377 110.366 84.8251 115.351 85.875C118.847 90.1691 121.054 94.6983 121.666 98.7188Z" />
                  </svg>
                }
                color="#000000"
                description="Connect your Threads profile to publish multi-node threads"
                connected={!!getIntegration("threads")}
                connectedLabel={getIntegration("threads")?.metadata?.name || "Connected"}
                onConnect={() => {
                  window.location.href = `/api/integrations/threads?workspaceId=${workspace.id}`;
                }}
                onDisconnect={() => handleDeleteIntegration("threads")}
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

          {activeTab === "brand" && (
            <BrandDetailsTab workspace={workspace} onUpdate={onUpdateName} />
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

function BrandDetailsTab({ workspace, onUpdate }: { workspace: Workspace; onUpdate?: (newName: string) => void }) {
  const [details, setDetails] = useState(workspace.details || "");
  const [toneOfVoice, setToneOfVoice] = useState(workspace.toneOfVoice || "");
  const [targetAudience, setTargetAudience] = useState(workspace.targetAudience || "");
  const [brandStyleStr, setBrandStyleStr] = useState(workspace.brandStyle?.join(", ") || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/workspaces", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: workspace.id,
          name: workspace.name, // required by the endpoint
          details,
          toneOfVoice,
          targetAudience,
          brandStyle: brandStyleStr.split(",").map(s => s.trim()).filter(Boolean),
        }),
      });

      if (!res.ok) throw new Error();
      toast.success("Brand details updated!");
      // Ideally we would trigger a re-fetch of the workspace here if needed
      // but the `onUpdate` prop currently just triggers a re-fetch in the parent
      if (onUpdate) onUpdate(workspace.name);
    } catch {
      toast.error("Failed to update brand details");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-[13px] text-[var(--text-secondary)] mb-2">
        Update your core brand details. These guide the AI when generating strategies and posts.
      </div>
      
      <div>
        <label className="text-[13px] font-semibold text-[var(--text-primary)] block mb-1">
          Business Description
        </label>
        <textarea
          className="input text-[13px] leading-relaxed resize-y min-h-[80px]"
          placeholder="What does your business do?"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
      </div>

      <div>
        <label className="text-[13px] font-semibold text-[var(--text-primary)] block mb-1">
          Global Tone of Voice
        </label>
        <textarea
          className="input text-[13px] leading-relaxed resize-y min-h-[60px]"
          placeholder="e.g. Professional, friendly, witty..."
          value={toneOfVoice}
          onChange={(e) => setToneOfVoice(e.target.value)}
        />
      </div>

      <div>
        <label className="text-[13px] font-semibold text-[var(--text-primary)] block mb-1">
          Target Audience
        </label>
        <textarea
          className="input text-[13px] leading-relaxed resize-y min-h-[60px]"
          placeholder="Who are you trying to reach?"
          value={targetAudience}
          onChange={(e) => setTargetAudience(e.target.value)}
        />
      </div>

      <div>
        <label className="text-[13px] font-semibold text-[var(--text-primary)] block mb-1">
          Brand Style Keywords (comma separated)
        </label>
        <input
          type="text"
          className="input text-[13px]"
          placeholder="Modern, minimalist, tech-savvy..."
          value={brandStyleStr}
          onChange={(e) => setBrandStyleStr(e.target.value)}
        />
      </div>

      <div className="flex justify-end mt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
        >
          {saving ? "Saving..." : "Save Brand Details"}
        </button>
      </div>
    </div>
  );
}
