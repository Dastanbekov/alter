"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import { ChatArea } from "./ChatArea";
import { ScheduledBoard } from "./ScheduledBoard";
import { BillingView } from "./BillingView";
import { StoryCanvas } from "./StoryCanvas";
import { DashboardTour } from "./DashboardTour";
import { DashboardOnboarding } from "./DashboardOnboarding";
import { Menu } from "lucide-react";
import type { Workspace, Story } from "@/types";



type TourPhase = "idle" | "tour" | "onboarding" | "done";

export function DashboardLayout() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<"chat" | "scheduled" | "billing" | "story">("chat");
  const [billingInfo, setBillingInfo] = useState<{ paidCredits: number; availableFree: number; totalAvailable: number; isPro: boolean; tourCompleted: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [tourPhase, setTourPhase] = useState<TourPhase>("idle");
  const [tourGeneratedData, setTourGeneratedData] = useState<{ context: string; posts: any[] } | null>(null);

  // Fetch story when activeStoryId changes
  useEffect(() => {
    if (!activeStoryId) return;
    fetch(`/api/stories/${activeStoryId}`)
      .then((r) => r.json())
      .then((data) => setActiveStory(data))
      .catch(() => {});
  }, [activeStoryId]);

  const fetchWorkspaces = useCallback(async () => {
    try {
      const res = await fetch("/api/workspaces");
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data);
        if (data.length > 0 && !activeWorkspaceId) {
          setActiveWorkspaceId(data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activeWorkspaceId]);

  const fetchBilling = useCallback(async () => {
    try {
      const res = await fetch("/api/user/billing");
      if (res.ok) {
        setBillingInfo(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaces();
    fetchBilling();
  }, [fetchWorkspaces, fetchBilling]);

  // Determine if we should show the tour (only once, for new users)
  useEffect(() => {
    if (loading || !billingInfo) return;
    if (!billingInfo.tourCompleted) {
      // Small delay so the dashboard renders first
      const timer = setTimeout(() => setTourPhase("tour"), 800);
      return () => clearTimeout(timer);
    }
  }, [loading, billingInfo]);

  const handleTourComplete = async (skipped?: boolean) => {
    if (skipped) {
      setTourPhase("done");
      try {
        await fetch("/api/user/complete-tour", { method: "PATCH" });
      } catch (e) {
        console.error(e);
      }
      fetchBilling();
    } else {
      setTourPhase("onboarding");
    }
  };

  const handleOnboardingComplete = async (data?: { context: string; posts?: any[]; story?: any }) => {
    setTourPhase("done");
    if (data?.posts) {
      setTourGeneratedData({ context: data.context, posts: data.posts });
      setCurrentView("chat");
    } else if (data?.story) {
      setActiveStoryId(data.story.id);
      setCurrentView("story");
    }

    // Call API to mark tour completed (affects billing)
    try {
      await fetch("/api/user/complete-tour", { method: "PATCH" });
    } catch (e) {
      console.error(e);
    }
    
    // Refresh billing info since first generation was free
    fetchBilling();
  };

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || null;

  // Find the workspace for the active story
  const storyWorkspace = activeStory
    ? workspaces.find((w) => w.id === activeStory.workspaceId) || activeWorkspace
    : null;

  return (
    <div className="flex h-screen bg-[var(--surface-0)] overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <Sidebar
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        onSelectWorkspace={(id) => {
          setActiveWorkspaceId(id);
        }}
        onWorkspacesChange={fetchWorkspaces}
        currentView={currentView}
        onSelectView={(view) => {
          setCurrentView(view);
          setIsMobileOpen(false);
        }}
        onSelectStory={(id) => {
          setActiveStoryId(id);
          setCurrentView("story");
          setIsMobileOpen(false);
        }}
        activeStoryId={activeStoryId}
        isPro={billingInfo?.isPro || false}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      <main className="flex-1 overflow-hidden flex flex-col w-full md:w-auto">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-[var(--surface-1)] border-b border-[var(--border)] shrink-0">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 -ml-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <Menu size={20} />
          </button>
          <div className="font-['Outfit'] font-bold text-[16px]">
            {currentView === "chat"
              ? activeWorkspace?.name || "Alter"
              : currentView === "scheduled"
              ? "Scheduled Posts"
              : currentView === "story"
              ? activeStory?.title || "Campaign"
              : "Billing"}
          </div>
          <div className="w-9" />
        </div>

        {loading ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="spinner" style={{ width: 32, height: 32 }} />
          </div>
        ) : currentView === "billing" ? (
          <BillingView onSuccess={() => { fetchBilling(); setCurrentView("chat"); }} />
        ) : currentView === "scheduled" ? (
          <ScheduledBoard />
        ) : currentView === "story" && activeStory && storyWorkspace ? (
          <StoryCanvas
            story={activeStory}
            workspace={storyWorkspace}
            readOnly
          />
        ) : activeWorkspace ? (
          <ChatArea
            workspace={activeWorkspace}
            billingInfo={billingInfo}
            onBillingUpdate={fetchBilling}
            onUpgrade={() => setCurrentView("billing")}
            initialGeneratedData={tourGeneratedData}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-[var(--text-muted)] p-6 text-center">
            <div className="text-[48px]">👈</div>
            <p className="text-[16px]">Select or create a workspace to get started</p>
          </div>
        )}
      </main>

      {/* Dashboard Tour overlay */}
      {tourPhase === "tour" && (
        <DashboardTour onComplete={handleTourComplete} />
      )}

      {/* First generation onboarding overlay */}
      {tourPhase === "onboarding" && activeWorkspace && (
        <DashboardOnboarding
          workspaceId={activeWorkspace.id}
          workspaceName={activeWorkspace.name}
          onComplete={handleOnboardingComplete}
        />
      )}
    </div>
  );
}
