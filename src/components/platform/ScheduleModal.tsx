"use client";

import { useState } from "react";
import { X, Calendar, Clock } from "lucide-react";
import toast from "react-hot-toast";
import type { GeneratedPostItem, Workspace } from "@/types";

interface Props {
  post: GeneratedPostItem;
  workspace: Workspace;
  onClose: () => void;
  onScheduled: () => void;
}

export function ScheduleModal({ post, workspace, onClose, onScheduled }: Props) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSchedule = async () => {
    if (!date || !time) {
      toast.error("Please select date and time");
      return;
    }

    const scheduledAt = new Date(`${date}T${time}`);
    if (scheduledAt <= new Date()) {
      toast.error("Please select a future date and time");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace.id,
          platform: post.platform,
          content: post.content,
          scheduledAt: scheduledAt.toISOString(),
        }),
      });

      if (!res.ok) {
        toast.error("Failed to schedule post");
        return;
      }

      onScheduled();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // Get min date (today)
  const today = new Date().toISOString().split("T")[0];

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[1000] p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="scale-in bg-[var(--surface-2)] border border-[var(--border)] rounded-[20px] p-6 md:p-8 w-full max-w-[420px] shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[10px] bg-[rgba(67,56,255,0.15)] flex items-center justify-center">
              <Calendar size={18} color="#1a7352" />
            </div>
            <h3 className="font-['Outfit'] text-[18px] font-bold text-[var(--text-primary)]">
              Schedule Post
            </h3>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon btn-sm"
          >
            <X size={16} />
          </button>
        </div>

        {/* Date */}
        <div className="mb-4">
          <label className="text-[13px] font-semibold text-[var(--text-secondary)] block mb-2">
            Date
          </label>
          <div className="relative">
            <Calendar
              size={15}
              className="text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              id="schedule-date"
              type="date"
              className="input"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ paddingLeft: 42, colorScheme: "dark" }}
            />
          </div>
        </div>

        {/* Time */}
        <div className="mb-7">
          <label className="text-[13px] font-semibold text-[var(--text-secondary)] block mb-2">
            Time
          </label>
          <div className="relative">
            <Clock
              size={15}
              className="text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              id="schedule-time"
              type="time"
              className="input"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={{ paddingLeft: 42, colorScheme: "dark" }}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="btn btn-secondary flex-1 justify-center"
          >
            Cancel
          </button>
          <button
            onClick={handleSchedule}
            disabled={!date || !time || saving}
            className="btn btn-primary flex-[2] justify-center"
          >
            {saving ? (
              <div className="spinner w-4 h-4" />
            ) : (
              <>
                <Clock size={16} />
                Schedule
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
