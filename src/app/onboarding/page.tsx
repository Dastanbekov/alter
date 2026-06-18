"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Zap } from "lucide-react";
import type { OnboardingData } from "@/types";
import { WorkspaceFormFlow } from "@/components/onboarding/WorkspaceFormFlow";

export default function OnboardingPage() {
  const router = useRouter();
  const { update } = useSession();

  const handleFinish = async (data: OnboardingData) => {
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

    // Update the session token with the new onboarded status
    await update();

    toast.success("Workspace created! Let's go 🚀");
    // Hard redirect to clear any cached Next-Auth session state
    window.location.href = "/dashboard";
  };

  return (
    <div className="gradient-bg min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Orbs */}
      <div className="fixed w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] rounded-full pointer-events-none top-0 left-[5%] sm:left-[10%]" style={{ background: "radial-gradient(circle, rgba(26,115,82,0.1) 0%, transparent 70%)" }} />
      <div className="fixed w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full pointer-events-none bottom-0 right-[5%]" style={{ background: "radial-gradient(circle, rgba(45,158,111,0.08) 0%, transparent 70%)" }} />

      {/* Header */}
      <div className="flex items-center gap-[10px] mb-8 sm:mb-12 relative z-10">
        <div className="h-12 sm:h-16 flex items-center justify-center">
          <img src="/logo.png" alt="Alter Logo" style={{ height: "100%", width: "auto", objectFit: "contain" }} />
        </div>
      </div>

      <WorkspaceFormFlow onComplete={handleFinish} />
    </div>
  );
}
