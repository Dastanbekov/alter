import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "Alter — AI-Powered Social Media Management",
    template: "%s | Alter",
  },
  description:
    "Create, schedule, and publish AI-generated content across LinkedIn, X, and Telegram — all from one intelligent workspace.",
  keywords: [
    "social media management",
    "AI content generation",
    "LinkedIn automation",
    "Twitter automation",
    "content scheduling",
  ],
  openGraph: {
    title: "Alter — AI-Powered Social Media Management",
    description: "Create, schedule, and publish AI-generated content across all your social platforms.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
