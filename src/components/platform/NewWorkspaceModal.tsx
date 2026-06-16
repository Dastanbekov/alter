"use client";

import { X } from "lucide-react";
import { WorkspaceFormFlow } from "../onboarding/WorkspaceFormFlow";
import type { OnboardingData } from "@/types";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewWorkspaceModal({ isOpen, onClose, onSuccess }: Props) {
  if (!isOpen) return null;

  const handleComplete = async (data: OnboardingData) => {
    const res = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.workspaceName,
        purpose: data.purpose,
        details: data.details,
        platforms: data.platforms,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error || "Failed to create workspace");
      throw new Error(err.error);
    }

    toast.success("Workspace created! Let's go 🚀");
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-6">
      <div className="glass slide-up w-full max-w-[640px] bg-[var(--surface-1)] rounded-[20px] p-6 md:p-10 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 bg-[var(--surface-2)] text-[var(--text-secondary)] border-none cursor-pointer p-2 rounded-full flex items-center justify-center transition-all duration-200 z-10 hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
        >
          <X size={18} />
        </button>

        <h2 className="font-['Outfit'] text-[24px] font-bold text-[var(--text-primary)] mb-6 text-center">
          Create New Workspace
        </h2>

        <WorkspaceFormFlow onComplete={handleComplete} />
      </div>
    </div>
  );
}
