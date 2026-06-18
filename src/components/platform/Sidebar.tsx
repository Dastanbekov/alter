"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Zap,
  Plus,
  Settings,
  Calendar,
  ChevronRight,
  LogOut,
  User,
  Briefcase,
  BookOpen,
  Lightbulb,
  Map,
  X
} from "lucide-react";
import type { Workspace } from "@/types";
import { NewWorkspaceModal } from "./NewWorkspaceModal";


interface Props {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  onSelectWorkspace: (id: string) => void;
  onWorkspacesChange: () => void;
  currentView: "chat" | "scheduled" | "billing" | "story";
  onSelectView: (view: "chat" | "scheduled" | "billing" | "story") => void;
  onSelectStory?: (storyId: string) => void;
  activeStoryId?: string | null;
  isPro: boolean;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const PURPOSE_ICONS: Record<string, React.ReactNode> = {
  project: <Briefcase size={14} />,
  blog: <BookOpen size={14} />,
  other: <Lightbulb size={14} />,
};

export function Sidebar({
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onWorkspacesChange,
  currentView,
  onSelectView,
  onSelectStory,
  activeStoryId,
  isPro,
  isMobileOpen,
  onCloseMobile,
}: Props) {
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stories, setStories] = useState<{ id: string; title: string; workspaceId: string; status: string }[]>([]);

  useEffect(() => {
    fetch("/api/stories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setStories(data);
      })
      .catch(() => {});
  }, [currentView]);

  return (
    <>
    <aside
      className={`flex flex-col shrink-0 overflow-hidden bg-[var(--surface-1)] border-r border-[var(--border)] transition-all duration-300 z-50
        ${collapsed ? "md:w-[64px]" : "md:w-[260px]"}
        fixed inset-y-0 left-0 w-[260px] md:relative
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
    >
      {/* Logo */}
      <div
        className={`flex items-center justify-between gap-2 border-b border-[var(--border)]
          ${collapsed ? "p-4 px-3" : "p-4 px-5"}`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div
            className={`h-10 flex items-center justify-start shrink-0 overflow-hidden ${
              collapsed ? "w-10" : "w-[120px]"
            }`}
          >
            <img 
              src="/logo.png" 
              alt="Alter Logo" 
              style={{ 
                height: "100%", 
                width: collapsed ? "auto" : "100%", 
                objectFit: collapsed ? "cover" : "contain", 
                objectPosition: "left" 
              }} 
            />
          </div>
          {!collapsed && (
            <div className="flex items-center gap-2">
              {isPro && (
                <div className="bg-gradient-to-br from-[#f59e0b] to-[#ef4444] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-[0.05em] shadow-[0_2px_8px_rgba(245,158,11,0.3)]">
                  PRO
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Desktop collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex items-center p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-all shrink-0"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronRight
            size={16}
            style={{
              transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
              transition: "transform 0.3s",
            }}
          />
        </button>

        {/* Mobile close toggle */}
        <button
          onClick={onCloseMobile}
          className="md:hidden flex items-center p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all shrink-0"
          title="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      {/* Workspaces */}
      <div className={`flex-1 overflow-y-auto ${collapsed ? "p-2 px-2" : "p-3"}`}>
        {!collapsed && (
          <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.08em] px-2 pb-2 pt-1">
            Workspaces
          </div>
        )}

        {workspaces.map((ws) => {
          const isActive = ws.id === activeWorkspaceId && currentView === "chat";
          return (
            <button
              key={ws.id}
              onClick={() => {
                onSelectWorkspace(ws.id);
                onSelectView("chat");
                onCloseMobile?.();
              }}
              title={collapsed ? ws.name : undefined}
              className={`w-full flex items-center gap-2.5 rounded-[10px] border-none cursor-pointer text-left transition-all duration-200 mb-0.5
                ${collapsed ? "p-2.5 justify-center" : "py-2.5 px-3 justify-start"}
                ${isActive ? "bg-[rgba(26,115,82,0.15)]" : "bg-transparent hover:bg-[var(--surface-3)]"}
              `}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-['Outfit'] font-bold text-[13px] shrink-0
                  ${isActive ? "bg-gradient-to-br from-[#1a7352] to-[#2d9e6f] text-white border-none" : "bg-[var(--surface-3)] text-[var(--text-muted)] border border-[var(--border)]"}
                `}
              >
                {ws.name.charAt(0).toUpperCase()}
              </div>

              {!collapsed && (
                <div className="flex-1 overflow-hidden">
                  <div
                    className={`truncate text-[14px] font-semibold ${isActive ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}
                  >
                    {ws.name}
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 mt-px">
                    {PURPOSE_ICONS[ws.purpose]}
                    {ws.purpose === "project"
                      ? "Project"
                      : ws.purpose === "blog"
                      ? "Blog"
                      : "Other"}
                  </div>
                </div>
              )}
            </button>
          );
        })}

        {/* New workspace button */}
        <button
          onClick={() => setIsModalOpen(true)}
          title={collapsed ? "New workspace" : undefined}
          className={`w-full flex items-center gap-2.5 rounded-[10px] border border-dashed border-[var(--border)] bg-transparent cursor-pointer text-[var(--text-muted)] text-[13px] font-medium transition-all duration-200 mt-2
            ${collapsed ? "p-2.5 justify-center" : "py-2.5 px-3 justify-start"}
            hover:border-[var(--border-hover)] hover:text-[var(--text-secondary)]
          `}
        >
          <Plus size={16} />
          {!collapsed && "New workspace"}
        </button>

        {/* Divider */}
        <div className="divider" style={{ margin: "16px 0" }} />

        {/* Scheduled posts */}
        <button
          onClick={() => {
            if (!isPro) {
              onSelectView("billing");
            } else {
              onSelectView("scheduled");
            }
            onCloseMobile?.();
          }}
          className={`w-full flex items-center gap-2.5 rounded-[10px] border-none cursor-pointer text-[14px] font-medium transition-all duration-200
            ${collapsed ? "p-2.5 justify-center" : "py-2.5 px-3 justify-start"}
            ${currentView === "scheduled" ? "bg-[rgba(26,115,82,0.15)] text-[var(--text-primary)]" : "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"}
          `}
          title={collapsed ? "Scheduled Posts" : undefined}
        >
          <Calendar size={18} color={currentView === "scheduled" ? "#1a7352" : undefined} />
          {!collapsed && (
            <div className="flex items-center justify-between flex-1">
              <span>Scheduled Posts</span>
              {!isPro && <Zap size={14} color="#f59e0b" />}
            </div>
          )}
        </button>

        {/* Stories */}
        {stories.length > 0 && (
          <>
            {!collapsed && (
              <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.08em] px-2 pb-1 pt-3">
                Stories
              </div>
            )}
            {stories.map((story) => {
              const isActive = currentView === "story" && activeStoryId === story.id;
              return (
                <button
                  key={story.id}
                  onClick={() => {
                    onSelectStory?.(story.id);
                    onSelectView("story");
                    onCloseMobile?.();
                  }}
                  title={collapsed ? story.title : undefined}
                  className={`w-full flex items-center gap-2.5 rounded-[10px] border-none cursor-pointer text-left transition-all duration-200 mb-0.5
                    ${collapsed ? "p-2.5 justify-center" : "py-2 px-3 justify-start"}
                    ${isActive ? "bg-[rgba(26,115,82,0.15)]" : "bg-transparent hover:bg-[var(--surface-3)]"}
                  `}
                >
                  <Map size={15} color={isActive ? "#1a7352" : undefined} className={isActive ? "" : "text-[var(--text-muted)]"} />
                  {!collapsed && (
                    <div className="flex-1 overflow-hidden">
                      <div className={`truncate text-[12px] font-semibold ${isActive ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
                        {story.title}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)]">
                        {story.status === "approved" ? "✓ Approved" : "Draft"}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </>
        )}
      </div>

      {/* Bottom - User + Settings */}
      <div className={`border-t border-[var(--border)] ${collapsed ? "p-2 px-2" : "p-3"}`}>
        <Link href="/settings" className="block no-underline">
          <div className="flex items-center gap-3 px-3 py-2.5 text-[var(--text-secondary)] rounded-lg transition-colors duration-200 hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]">
            <Settings size={18} />
            {!collapsed && <span className="text-[14px] font-medium">Account Settings</span>}
          </div>
        </Link>

        {/* User info */}
        {session?.user && (
          <div className={`flex items-center gap-2.5 mt-1 rounded-[10px] ${collapsed ? "p-2.5 justify-center" : "py-2.5 px-3 justify-start"}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1a7352] to-[#2d9e6f] flex items-center justify-center text-white font-bold text-[13px] shrink-0">
              {session.user.name?.charAt(0)?.toUpperCase() || <User size={14} />}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 overflow-hidden">
                  <div className="truncate text-[13px] font-semibold text-[var(--text-primary)]">
                    {session.user.name}
                  </div>
                  <div className="truncate text-[11px] text-[var(--text-muted)]">
                    {session.user.email}
                  </div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="bg-transparent border-none cursor-pointer text-[var(--text-muted)] p-1 rounded-md flex items-center transition-colors duration-200 shrink-0 hover:text-red-500"
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </aside>

      <NewWorkspaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          onWorkspacesChange();
        }}
      />
    </>
  );
}
