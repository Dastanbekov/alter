"use client";

import { useState } from "react";
import { ArrowRight, Globe, FileText, Loader2 } from "lucide-react";
import type { OnboardingData } from "@/types";
import toast from "react-hot-toast";

interface Props {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
}

export function OnboardingStep1({ data, onChange, onNext }: Props) {
  const [tab, setTab] = useState<"website" | "description">("website");
  const [loading, setLoading] = useState(false);

  const [localWebsite, setLocalWebsite] = useState(data.website || "");
  const [localDescription, setLocalDescription] = useState(data.details || "");

  const handleContinue = async () => {
    if (tab === "website" && !localWebsite.trim()) {
      toast.error("Please enter your website URL");
      return;
    }
    if (tab === "description" && !localDescription.trim()) {
      toast.error("Please describe your business");
      return;
    }

    setLoading(true);
    onChange({
      website: tab === "website" ? localWebsite : "",
      details: tab === "description" ? localDescription : "",
    });

    try {
      const res = await fetch("/api/ai/scrape-brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          websiteUrl: tab === "website" ? localWebsite : "",
          description: tab === "description" ? localDescription : "",
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.details || errorData?.error || "Failed to parse brand data");
      }

      const extracted = await res.json();
      
      onChange({
        workspaceName: extracted.name || "",
        details: extracted.description || "",
        services: extracted.services || [],
        colors: extracted.colors || [],
        fonts: extracted.fonts || [],
        toneOfVoice: extracted.toneOfVoice || "",
        targetAudience: extracted.targetAudience || "",
        brandStyle: extracted.brandStyle || [],
        tagline: extracted.tagline || "",
      });

      onNext();
    } catch (e: any) {
      console.error(e);
      toast.error(`Error: ${e.message || "Could not extract data"}`);
      onNext(); // Proceed anyway so user can manually fill
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-[20px] p-6 sm:p-10">
      <div className="mb-8">
        <h2 className="font-['Outfit'] text-[24px] sm:text-[32px] font-bold mb-3 text-[var(--text-primary)]">
          Let's learn about your business
        </h2>
        <p className="text-[15px] sm:text-[16px] text-[var(--text-secondary)] leading-relaxed">
          Give us your website or a quick description — we'll use it to learn what you do and how you sound, so every post sounds like you.
        </p>
      </div>

      <div className="flex bg-[var(--surface-2)] p-1 rounded-[12px] mb-8">
        <button
          onClick={() => setTab("website")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[14px] font-medium rounded-[10px] transition-all ${tab === "website" ? "bg-white text-[var(--text-primary)] shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
        >
          <Globe size={16} /> I have a website
        </button>
        <button
          onClick={() => setTab("description")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[14px] font-medium rounded-[10px] transition-all ${tab === "description" ? "bg-white text-[var(--text-primary)] shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
        >
          <FileText size={16} /> Describe my business
        </button>
      </div>

      <p className="text-[13px] text-[var(--text-muted)] mb-4">Pick whichever's easier — you only need one.</p>

      {tab === "website" ? (
        <div className="mb-8">
          <label className="flex items-center gap-2 text-[14px] font-medium text-[var(--text-primary)] mb-2">
            <Globe size={16} /> Your website
          </label>
          <input
            type="url"
            placeholder="https://www.yourbusiness.com"
            value={localWebsite}
            onChange={(e) => setLocalWebsite(e.target.value)}
            className="w-full bg-[var(--surface-1)] border border-[var(--border)] rounded-[12px] px-4 py-3 text-[15px] focus:outline-none focus:border-[#1a7352] transition-colors"
          />
        </div>
      ) : (
        <div className="mb-8">
          <label className="flex items-center gap-2 text-[14px] font-medium text-[var(--text-primary)] mb-2">
            <FileText size={16} /> About your business
          </label>
          <textarea
            placeholder="e.g. We're a family-run Italian catering service in Leeds, specializing in homemade lasagna for weddings and events."
            value={localDescription}
            onChange={(e) => setLocalDescription(e.target.value)}
            rows={4}
            className="w-full bg-[var(--surface-1)] border border-[var(--border)] rounded-[12px] px-4 py-3 text-[15px] focus:outline-none focus:border-[#1a7352] transition-colors resize-none"
          />
        </div>
      )}

      <div className="flex justify-end pt-6 border-t border-[var(--border)] mt-8">
        <button
          onClick={handleContinue}
          disabled={loading}
          className="flex items-center gap-2 bg-[#d14f3b] text-white px-6 py-2.5 rounded-[12px] font-semibold hover:bg-[#b84331] transition-colors disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Extracting Data...
            </>
          ) : (
            <>
              Continue <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
