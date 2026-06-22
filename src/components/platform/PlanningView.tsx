"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import type { Workspace } from "@/types";

interface Props {
  workspace: Workspace;
  onStartChat: (prompt: string) => void;
}

export function PlanningView({ workspace, onStartChat }: Props) {
  const { angle, strategyChecklist } = workspace;

  if (!strategyChecklist || strategyChecklist.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[var(--surface-0)] overflow-y-auto">
        <div className="text-center max-w-[500px]">
          <div className="w-16 h-16 bg-[var(--surface-2)] rounded-full flex items-center justify-center mx-auto mb-6 text-[var(--text-muted)]">
            <Sparkles size={32} />
          </div>
          <h2 className="text-[24px] font-bold text-[var(--text-primary)] mb-3 font-['Outfit']">No strategy yet</h2>
          <p className="text-[15px] text-[var(--text-secondary)]">
            This workspace was created without an AI-generated strategy. You can still use the Chat view to generate posts manually.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[var(--surface-0)] overflow-y-auto relative">
      <div className="max-w-[800px] mx-auto w-full p-6 md:p-10">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-[28px] md:text-[32px] font-bold text-[var(--text-primary)] font-['Outfit'] mb-4 flex items-center gap-3">
            <Sparkles className="text-[#1a7352]" size={28} />
            Strategy & Planning
          </h1>
          <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
            Here is your custom marketing strategy. Work through these suggestions to establish your brand and drive growth.
          </p>
        </div>

        {/* Angle */}
        {angle && (
          <div className="mb-10 bg-gradient-to-br from-[#1a7352]/10 to-transparent border border-[#1a7352]/20 rounded-[16px] p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#1a7352]/5 rounded-bl-full -z-10" />
            <h3 className="text-[13px] font-bold text-[#1a7352] mb-3 uppercase tracking-wider">
              Your Angle
            </h3>
            <p className="text-[16px] text-[var(--text-primary)] leading-relaxed font-medium">
              "{angle}"
            </p>
          </div>
        )}

        {/* Checklist */}
        <div>
          <h3 className="text-[18px] font-bold text-[var(--text-primary)] mb-6 font-['Outfit']">
            Action Plan
          </h3>
          <div className="flex flex-col gap-4">
            {strategyChecklist.map((task, index) => (
              <div 
                key={task.id || index} 
                className="bg-[var(--surface-1)] border border-[var(--border)] rounded-[16px] p-5 hover:border-[#1a7352]/30 transition-colors flex flex-col sm:flex-row gap-5"
              >
                <div className="shrink-0 pt-1 hidden sm:block">
                  <div className="w-8 h-8 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-[13px] font-bold text-[var(--text-secondary)]">
                    {index + 1}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h4 className="text-[16px] font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                    {task.title}
                  </h4>
                  <p className="text-[14px] text-[var(--text-secondary)] mb-4 leading-relaxed">
                    {task.description}
                  </p>
                  
                  <div className="bg-[var(--surface-2)] rounded-[8px] p-3 border border-[var(--border)] mb-4">
                    <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Prompt Idea</div>
                    <p className="text-[13px] text-[var(--text-secondary)] italic">
                      "{task.suggestedPrompt}"
                    </p>
                  </div>

                  <button
                    onClick={() => onStartChat(task.suggestedPrompt)}
                    className="flex items-center gap-2 bg-[#1a7352] text-white px-5 py-2.5 rounded-[10px] text-[13px] font-semibold hover:bg-[#145d42] transition-colors"
                  >
                    Start <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
