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
              <img src="/logo.png" alt="Alter Logo" style={{ height: "100%", width: "auto", objectFit: "contain", filter: "brightness(0)" }} />
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
