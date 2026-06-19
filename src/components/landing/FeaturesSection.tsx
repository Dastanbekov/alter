"use client";

import { useState, useRef } from "react";
import { Play, X } from "lucide-react";

const FEATURES = [
  { emoji: "✍️", text: "AI drafts posts instantly" },
  { emoji: "📲", text: "LinkedIn, X, Telegram in one click" },
  { emoji: "🎯", text: "Tailored tone for every platform" },
  { emoji: "📅", text: "Auto-schedule while you sleep" },
];

export function FeaturesSection() {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    setPlaying(true);
    setTimeout(() => videoRef.current?.play(), 100);
  };

  return (
    <section
      id="features"
      className="py-[100px] px-6 lg:px-8 bg-[#f8f6f0] overflow-hidden"
    >
      <div className="max-w-[1100px] mx-auto">
        {/* Heading */}
        <div className="text-center mb-[60px] sm:mb-[72px]">
          <h2 className="font-['Outfit'] text-[clamp(32px,4vw,48px)] font-extrabold text-[#1a1a1a] mb-4">
            Everything you need to{" "}
            <span className="bg-gradient-to-br from-[#1a7352] to-[#2d9e6f] text-transparent bg-clip-text">
              grow online
            </span>
          </h2>
          <p className="text-[16px] sm:text-[18px] text-[#4a5568] max-w-[520px] mx-auto leading-[1.65]">
            From AI writing to cross-platform publishing — Alter handles the entire
            content workflow so you can focus on building.
          </p>
        </div>

        {/* Video wrapper */}
        <div className="relative rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.13)] border border-[#e5e5e5] bg-[#0f0f0f] aspect-video max-w-[900px] mx-auto">

          {/* Poster / Placeholder when not playing */}
          {!playing && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-br from-[#111] via-[#1a1a1a] to-[#0a0a0a]">

              {/* Subtle grid overlay */}
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />

              {/* Glow blobs */}
              <div className="absolute top-[-30%] left-[-10%] w-[60%] h-[60%] bg-[#1a7352]/30 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#2d9e6f]/20 rounded-full blur-[80px] pointer-events-none" />

              {/* Badge */}
              <div className="relative z-10 mb-8 bg-white/10 backdrop-blur-md border border-white/10 text-white text-[12px] font-semibold px-4 py-2 rounded-full tracking-wider uppercase">
                Product Demo
              </div>

              {/* Play button */}
              <button
                onClick={handlePlay}
                className="relative z-10 group flex items-center justify-center w-[80px] h-[80px] sm:w-[96px] sm:h-[96px] rounded-full bg-white shadow-[0_8px_40px_rgba(255,255,255,0.2)] transition-all duration-300 hover:scale-110 hover:shadow-[0_12px_60px_rgba(255,255,255,0.35)]"
                aria-label="Play demo"
              >
                <Play
                  size={32}
                  className="text-[#1a7352] ml-1 group-hover:scale-110 transition-transform duration-200"
                  fill="#1a7352"
                />
              </button>

              {/* Label under button */}
              <p className="relative z-10 mt-5 text-white/50 text-[13px] font-medium tracking-wide">
                Watch how it works — 2 min
              </p>

              {/* Feature chips */}
              <div className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-2.5 max-w-[520px] px-4">
                {FEATURES.map((f) => (
                  <div
                    key={f.text}
                    className="flex items-center gap-1.5 bg-white/8 border border-white/10 rounded-full px-3.5 py-1.5 text-white/70 text-[12px] font-medium backdrop-blur-sm"
                  >
                    <span>{f.emoji}</span>
                    {f.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actual video — swap /demo.mp4 with your real file */}
          <video
            ref={videoRef}
            src="/demo.mp4"
            controls={playing}
            playsInline
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              playing ? "opacity-100" : "opacity-0"
            }`}
            onEnded={() => setPlaying(false)}
          />

          {/* Close / reset button when playing */}
          {playing && (
            <button
              onClick={() => {
                videoRef.current?.pause();
                if (videoRef.current) videoRef.current.currentTime = 0;
                setPlaying(false);
              }}
              className="absolute top-4 right-4 z-20 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors"
              aria-label="Close video"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Bottom caption */}
        <p className="text-center text-[14px] text-[#9ca3af] mt-6 font-medium">
          No credit card needed to try · Works with LinkedIn, X &amp; Telegram
        </p>
      </div>
    </section>
  );
}
