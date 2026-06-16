"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Zap, Settings, ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div
      className="gradient-bg"
      style={{ minHeight: "100vh", padding: "0" }}
    >
      {/* Top bar */}
      <div
        style={{
          background: "var(--surface-1)",
          borderBottom: "1px solid var(--border)",
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <Link href="/dashboard">
          <button className="btn btn-ghost btn-sm" style={{ gap: 6 }}>
            <ArrowLeft size={16} />
            Back
          </button>
        </Link>
        <div className="divider" style={{ width: 1, height: 20 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img src="/logo.png" alt="Alter Logo" style={{ height: "100%", width: "auto", objectFit: "contain" }} />
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Settings size={16} color="var(--text-muted)" />
          <span
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 16,
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            Account Settings
          </span>
        </div>
      </div>

      <div
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "40px 24px",
        }}
      >
        {/* Account section */}
        <section>
          <h2
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 22,
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: 24,
            }}
          >
            Account
          </h2>

          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #1a7352, #2d9e6f)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "Outfit, sans-serif",
                  fontWeight: 800,
                  fontSize: 20,
                  color: "white",
                }}
              >
                {session?.user?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: 4,
                  }}
                >
                  {session?.user?.name}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  {session?.user?.email}
                </div>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="btn btn-danger btn-sm"
            >
              Sign out
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
