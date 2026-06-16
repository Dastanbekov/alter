import type { Metadata } from "next";
import { LandingNav } from "@/components/landing/LandingNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { FooterSection } from "@/components/landing/FooterSection";

export const metadata: Metadata = {
  title: "Alter — AI-Powered Social Media Management",
  description: "Tell Alter what happened. Our AI crafts platform-perfect posts for LinkedIn, X, Telegram and more — then schedules them automatically.",
};

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8f6f0" }}>
      <LandingNav />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <FaqSection />
      </main>
      <FooterSection />
    </div>
  );
}
