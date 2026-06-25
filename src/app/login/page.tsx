"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { Zap, Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: form.email.toLowerCase(),
        password: form.password,
        redirect: false,
      });

      if (res?.error) {
        toast.error("Invalid email or password");
        return;
      }

      toast.success("Welcome back! 👋");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gradient-bg min-h-screen flex items-center justify-center p-4 sm:p-6">
      {/* Orbs */}
      <div className="fixed w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full pointer-events-none -top-10 -right-10 sm:top-[5%] sm:right-[5%]" style={{ background: "radial-gradient(circle, rgba(26,115,82,0.15) 0%, transparent 70%)" }} />

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
            Welcome back
          </h1>
          <p className="text-center text-[var(--text-secondary)] text-sm mb-8">
            Sign in to your Alter account
          </p>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-4">
              <label className="text-[13px] font-semibold text-[var(--text-secondary)] block mb-2">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  color="var(--text-muted)"
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                  className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                />
                <input
                  id="login-email"
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

            {/* Password */}
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
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  required
                  className="input !pl-[42px] !pr-[42px]"
                  placeholder="Your password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-[14px] top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1 flex items-center justify-center rounded-md"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full h-[48px] text-[15px] group justify-center"
            >
              {loading ? (
                <div className="spinner w-[18px] h-[18px]" />
              ) : (
                <>
                  Sign in
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>



          <p className="text-center text-[14px] text-[var(--text-secondary)] mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-[#1a7352] no-underline font-semibold"
            >
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
