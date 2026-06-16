"use client";

import { ExternalLink, Globe } from "lucide-react";

const TEAM = [
  {
    name: "Alex Rivera",
    role: "CEO & Co-Founder",
    bio: "Ex-Hubspot. 10+ years in growth marketing and SaaS. Passionate about making AI accessible to everyone.",
    avatar: "AR",
    gradient: "linear-gradient(135deg, #1a7352, #2d9e6f)",
    twitter: "#",
    linkedin: "#",
  },
  {
    name: "Maya Chen",
    role: "CTO & Co-Founder",
    bio: "Former Google engineer. Built AI infrastructure at scale. Believes great tools should be invisible.",
    avatar: "MC",
    gradient: "linear-gradient(135deg, #1a7352, #2d9e6f)",
    twitter: "#",
    linkedin: "#",
  },
  {
    name: "Sam Okafor",
    role: "Head of Product",
    bio: "Product designer turned PM. Shipped products used by millions. Obsessed with user delight.",
    avatar: "SO",
    gradient: "linear-gradient(135deg, #22c55e, #06b6d4)",
    twitter: "#",
    linkedin: "#",
  },
  {
    name: "Lena Müller",
    role: "Head of Growth",
    bio: "Serial marketer. Grew 3 startups to $1M ARR. Now building the tools she always wished she had.",
    avatar: "LM",
    gradient: "linear-gradient(135deg, #f59e0b, #ec4899)",
    twitter: "#",
    linkedin: "#",
  },
];

export function TeamSection() {
  return (
    <section
      id="team"
      className="py-[80px] sm:py-[100px] px-6 lg:px-8 bg-[var(--surface-1)] border-y border-[var(--border)]"
    >
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <div className="badge badge-brand mb-4 inline-flex">
            The Team
          </div>
          <h2 className="text-[clamp(32px,4vw,48px)] mb-4 font-bold">
            Built by people who <span className="gradient-text">understand marketing</span>
          </h2>
          <p className="text-[16px] sm:text-[18px] text-[var(--text-secondary)] max-w-[500px] mx-auto">
            We&apos;ve been in your shoes. That&apos;s why we built Alter.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM.map((member) => (
            <div
              key={member.name}
              className="card glass-hover text-center transition-all duration-300"
            >
              {/* Avatar */}
              <div
                className="w-[72px] h-[72px] rounded-full flex items-center justify-center mx-auto mb-4 font-['Outfit'] font-extrabold text-[22px] text-white shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
                style={{ background: member.gradient }}
              >
                {member.avatar}
              </div>

              <h3 className="text-[17px] font-bold mb-1 text-[var(--text-primary)]">
                {member.name}
              </h3>
              <div className="text-[13px] text-[#1a7352] font-semibold mb-3">
                {member.role}
              </div>
              <p className="text-[13px] text-[var(--text-secondary)] leading-[1.7] mb-4">
                {member.bio}
              </p>

              {/* Social links */}
              <div className="flex justify-center gap-2">
                {[
                  { icon: <ExternalLink size={14} />, href: member.twitter },
                  { icon: <ExternalLink size={14} />, href: member.linkedin },
                ].map((social, i) => (
                  <a
                    key={i}
                    href={social.href}
                    className="w-[30px] h-[30px] rounded-full bg-[var(--surface-3)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] transition-all duration-200 no-underline hover:text-[var(--text-primary)] hover:border-[var(--border-hover)]"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
