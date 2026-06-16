"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { Zap, Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Registration failed");
        return;
      }

      // Auto sign-in after register
      const signInRes = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signInRes?.error) {
        toast.error("Account created! Please sign in.");
        router.push("/login");
        return;
      }

      toast.success("Welcome to Alter! 🚀");
      router.push("/onboarding");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gradient-bg min-h-screen flex items-center justify-center p-4 sm:p-6">
      {/* Orbs */}
      <div className="fixed w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full pointer-events-none top-[5%] -left-[5%] sm:top-[5%] sm:-left-[5%]" style={{ background: "radial-gradient(circle, rgba(26,115,82,0.15) 0%, transparent 70%)" }} />
      <div className="fixed w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] rounded-full pointer-events-none bottom-[10%] right-[5%]" style={{ background: "radial-gradient(circle, rgba(45,158,111,0.12) 0%, transparent 70%)" }} />

      <div className="w-full max-w-[440px] relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8 sm:mb-10">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <div className="h-12 sm:h-16 flex items-center justify-center">
              <img src="/logo.png" alt="Alter Logo" style={{ height: "100%", width: "auto", objectFit: "contain" }} />
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="glass rounded-[20px] p-6 sm:p-10">
          <h1 className="font-['Outfit'] text-2xl sm:text-[26px] font-bold mb-2 text-center">
            Create your account
          </h1>
          <p
            style={{
              textAlign: "center",
              color: "var(--text-secondary)",
              fontSize: 14,
              marginBottom: 32,
            }}
          >
            Start growing your social media presence with AI
          </p>

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Full name
              </label>
              <div style={{ position: "relative" }}>
                <User
                  size={16}
                  color="var(--text-muted)"
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
                <input
                  id="register-name"
                  type="text"
                  required
                  className="input !pl-[42px]"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label className="text-[13px] font-semibold text-[var(--text-secondary)] block mb-2">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                />
                <input
                  id="register-email"
                  type="email"
                  required
                  className="input !pl-[42px]"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="text-[13px] font-semibold text-[var(--text-secondary)] block mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                />
                <input
                  id="register-password"
                  type={showPass ? "text" : "password"}
                  required
                  minLength={8}
                  className="input !pl-[42px] !pr-[42px]"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                />
                <button
                  type="button"
                  className="absolute right-[14px] top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1 flex items-center justify-center rounded-md"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full h-[48px] text-[15px] group justify-center"
            >
              {loading ? (
                <div className="spinner w-[18px] h-[18px]" />
              ) : (
                <>
                  Create account
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center justify-center gap-4 my-6">
            <div className="divider flex-1" />
            <span className="text-[12px] text-[var(--text-muted)] whitespace-nowrap">
              or
            </span>
            <div className="divider flex-1" />
          </div>

          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
            className="btn btn-secondary w-full justify-center gap-[10px]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285f4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34a853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#fbbc05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#ea4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-[14px] text-[var(--text-secondary)] mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#1a7352] no-underline font-semibold"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
