"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { ChatArea } from "./ChatArea";
import { ScheduledBoard } from "./ScheduledBoard";
import { BillingView } from "./BillingView";
import { Menu, X } from "lucide-react";
import type { Workspace } from "@/types";

export function DashboardLayout() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<"chat" | "scheduled" | "billing">("chat");
  const [billingInfo, setBillingInfo] = useState<{ paidCredits: number; availableFree: number; totalAvailable: number; isPro: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
    fetchBilling();
  }, []);

  const fetchWorkspaces = async () => {
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
  };

  const fetchBilling = async () => {
    try {
      const res = await fetch("/api/user/billing");
      if (res.ok) {
        setBillingInfo(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || null;

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
        onSelectWorkspace={setActiveWorkspaceId}
        onWorkspacesChange={fetchWorkspaces}
        currentView={currentView}
        onSelectView={(view) => {
          setCurrentView(view);
          setIsMobileOpen(false);
        }}
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
            {currentView === "chat" ? activeWorkspace?.name || "Alter" : currentView === "scheduled" ? "Scheduled Posts" : "Billing"}
          </div>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>
        {loading ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div className="spinner" style={{ width: 32, height: 32 }} />
          </div>
        ) : currentView === "billing" ? (
          <BillingView onSuccess={() => { fetchBilling(); setCurrentView("chat"); }} />
        ) : currentView === "scheduled" ? (
          <ScheduledBoard />
        ) : activeWorkspace ? (
          <ChatArea workspace={activeWorkspace} billingInfo={billingInfo} onBillingUpdate={fetchBilling} onUpgrade={() => setCurrentView("billing")} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-[var(--text-muted)] p-6 text-center">
            <div className="text-[48px]">👈</div>
            <p className="text-[16px]">Select or create a workspace to get started</p>
          </div>
        )}
      </main>
    </div>
  );
}
