"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, X } from "lucide-react";

interface TourStep {
  targetId: string;
  title: string;
  description: string;
  position: "right" | "left" | "bottom" | "top";
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: "tour-workspaces",
    title: "Your Workspace",
    description: "This is your workspace — home for all your content projects. You can create multiple workspaces for different brands or clients.",
    position: "right",
  },
  {
    targetId: "tour-scheduled",
    title: "Scheduled Posts",
    description: "All your scheduled publications live here. Posts go out automatically at the time you set.",
    position: "right",
  },
  {
    targetId: "tour-chat-input",
    title: "Tell Alter what happened",
    description: "Just describe your news, milestone or idea here. Alter will turn it into perfect posts for every platform.",
    position: "top",
  },
  {
    targetId: "tour-mode-switcher",
    title: "Post or Story?",
    description: "Choose a one-time Post for quick updates, or a Story — a multi-day content campaign that publishes automatically.",
    position: "top",
  },
];

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface Props {
  onComplete: () => void;
}

export function DashboardTour({ onComplete }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const currentStep = TOUR_STEPS[stepIndex];
  const isLast = stepIndex === TOUR_STEPS.length - 1;

  // Mount after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Measure target element position
  useEffect(() => {
    if (!mounted) return;

    const measureTarget = () => {
      const el = document.getElementById(currentStep.targetId);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    };

    measureTarget();

    // Re-measure on resize
    window.addEventListener("resize", measureTarget);
    return () => window.removeEventListener("resize", measureTarget);
  }, [currentStep.targetId, mounted, stepIndex]);

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!mounted || !targetRect) return null;

  // Calculate tooltip position
  const PADDING = 16;
  const TOOLTIP_WIDTH = 320;
  const TOOLTIP_HEIGHT = 180;

  let tooltipStyle: React.CSSProperties = {};
  const pos = currentStep.position;

  if (pos === "right") {
    tooltipStyle = {
      top: targetRect.top + targetRect.height / 2 - TOOLTIP_HEIGHT / 2,
      left: targetRect.left + targetRect.width + PADDING,
    };
  } else if (pos === "left") {
    tooltipStyle = {
      top: targetRect.top + targetRect.height / 2 - TOOLTIP_HEIGHT / 2,
      left: targetRect.left - TOOLTIP_WIDTH - PADDING,
    };
  } else if (pos === "top") {
    tooltipStyle = {
      top: targetRect.top - TOOLTIP_HEIGHT - PADDING,
      left: Math.max(PADDING, targetRect.left + targetRect.width / 2 - TOOLTIP_WIDTH / 2),
    };
  } else if (pos === "bottom") {
    tooltipStyle = {
      top: targetRect.top + targetRect.height + PADDING,
      left: Math.max(PADDING, targetRect.left + targetRect.width / 2 - TOOLTIP_WIDTH / 2),
    };
  }

  // Clamp to viewport
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (tooltipStyle.left !== undefined) {
    tooltipStyle.left = Math.min(Number(tooltipStyle.left), vw - TOOLTIP_WIDTH - PADDING);
    tooltipStyle.left = Math.max(PADDING, Number(tooltipStyle.left));
  }
  if (tooltipStyle.top !== undefined) {
    tooltipStyle.top = Math.min(Number(tooltipStyle.top), vh - TOOLTIP_HEIGHT - PADDING);
    tooltipStyle.top = Math.max(PADDING, Number(tooltipStyle.top));
  }

  const content = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9000]"
      style={{ pointerEvents: "none" }}
    >
      {/* Dark overlay with cutout */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: "none" }}
      >
        <defs>
          <mask id="tour-cutout">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={targetRect.left - 6}
              y={targetRect.top - 6}
              width={targetRect.width + 12}
              height={targetRect.height + 12}
              rx="10"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.55)"
          mask="url(#tour-cutout)"
        />
      </svg>

      {/* Highlight ring around target */}
      <div
        className="absolute rounded-[10px] pointer-events-none"
        style={{
          top: targetRect.top - 6,
          left: targetRect.left - 6,
          width: targetRect.width + 12,
          height: targetRect.height + 12,
          boxShadow: "0 0 0 2px #1a7352, 0 0 0 4px rgba(26,115,82,0.25)",
          transition: "all 0.3s ease",
        }}
      />

      {/* Tooltip */}
      <div
        className="absolute bg-white rounded-[16px] shadow-[0_8px_40px_rgba(0,0,0,0.18)] border border-[var(--border)] p-5"
        style={{
          ...tooltipStyle,
          width: TOOLTIP_WIDTH,
          pointerEvents: "all",
          zIndex: 9001,
        }}
      >
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-1.5">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === stepIndex ? 20 : 6,
                  background: i === stepIndex ? "#1a7352" : "var(--surface-3)",
                }}
              />
            ))}
          </div>
          <button
            onClick={handleSkip}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1 rounded"
          >
            <X size={14} />
          </button>
        </div>

        <h3 className="font-['Outfit'] font-bold text-[16px] text-[var(--text-primary)] mb-1.5">
          {currentStep.title}
        </h3>
        <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-4">
          {currentStep.description}
        </p>

        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-[12px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            Skip tour
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1a7352] hover:bg-[#155f43] text-white text-[13px] font-bold rounded-[8px] transition-colors"
          >
            {isLast ? "Let's try it! 🚀" : "Next"}
            {!isLast && <ArrowRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
