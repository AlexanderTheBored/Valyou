"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MapPin, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const stats = [
  { value: "120K+", label: "Properties Valued" },
  { value: "81", label: "Provinces Covered" },
  { value: "Free", label: "Always" },
];

function AuthForm() {
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [mode, setMode] = useState<"login" | "signup">(
    searchParams.get("mode") === "signup" ? "signup" : "login"
  );
  const [showPass, setShowPass] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    document.cookie = "valyou_auth=1; path=/; max-age=86400";
    window.location.href = mode === "signup" ? "/onboarding" : "/map";
  }

  return (
    <div className="min-h-screen flex bg-[#f5f5f3] dark:bg-[#0c0c0b]">

      {/* ── Left branding panel ── */}
      <div className="hidden md:flex w-[46%] flex-col justify-between relative overflow-hidden bg-[#eaeae8] dark:bg-[#080807] border-r border-black/[0.05] dark:border-white/[0.05] p-14">

        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.08] dark:opacity-[0.03]"
          style={{
            backgroundImage: isDark
              ? "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)"
              : "linear-gradient(#000 1px,transparent 1px),linear-gradient(90deg,#000 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Red orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#C3110F]/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#C3110F]/6 blur-[80px] pointer-events-none" />

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-2 w-fit group">
          <div className="w-8 h-8 rounded-lg bg-[#C3110F] flex items-center justify-center shadow-lg shadow-[#C3110F]/30">
            <MapPin size={15} className="text-white" />
          </div>
          <span className="text-[#242420] dark:text-white font-bold text-xl tracking-tight">
            Val<span className="text-[#C3110F]">You</span>
          </span>
        </Link>

        {/* Headline */}
        <div className="relative">
          <div className="inline-flex items-center gap-2 mb-5">
            <div className="w-4 h-px bg-[#C3110F]" />
            <p className="text-[#C3110F] text-[9px] font-bold uppercase tracking-[0.2em]">
              Philippines Real Estate Intelligence
            </p>
          </div>
          <h2 className="text-[#242420] dark:text-white font-bold text-[2.4rem] leading-[1.15] tracking-tight">
            Know what a<br />
            <span className="text-[#242420]/40 dark:text-white/40">property is</span><br />
            actually worth.
          </h2>
        </div>

        {/* Stats row */}
        <div className="relative flex items-center gap-0 divide-x divide-black/[0.08] dark:divide-white/[0.08]">
          {stats.map(({ value, label }) => (
            <div key={label} className="pr-8 first:pl-0 pl-8">
              <p className="text-[#242420] dark:text-white font-bold text-xl leading-none mb-1">{value}</p>
              <p className="text-[#242420]/25 dark:text-white/25 text-[9px] uppercase tracking-[0.15em]">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 bg-[#f5f5f3] dark:bg-[#0c0c0b]">

        {/* Mobile logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-10 md:hidden">
          <div className="w-7 h-7 rounded-lg bg-[#C3110F] flex items-center justify-center">
            <MapPin size={13} className="text-white" />
          </div>
          <span className="text-[#242420] dark:text-white">Val<span className="text-[#C3110F]">You</span></span>
        </Link>

        <div className="w-full max-w-[340px]">

          {/* Heading */}
          <h1 className="text-[1.6rem] font-bold text-[#242420] dark:text-white tracking-tight mb-8">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>

          {/* Tab switcher */}
          <div className="flex bg-black/[0.04] dark:bg-white/[0.04] rounded-lg p-1 mb-7 border border-black/[0.06] dark:border-white/[0.06]">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  mode === m
                    ? "bg-[#C3110F] text-white shadow-md shadow-[#C3110F]/20"
                    : "text-[#242420]/35 dark:text-white/35 hover:text-[#242420]/60 dark:hover:text-white/60"
                }`}
              >
                {m === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <div>
                <label className="block text-[10px] font-bold text-[#242420]/25 dark:text-white/25 uppercase tracking-[0.15em] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Juan dela Cruz"
                  className="w-full bg-white dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] rounded-lg px-4 py-3 text-sm text-[#242420] dark:text-white placeholder:text-[#242420]/20 dark:placeholder:text-white/15 outline-none focus:border-[#C3110F]/60 focus:ring-1 focus:ring-[#C3110F]/20 transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-[#242420]/25 dark:text-white/25 uppercase tracking-[0.15em] mb-1.5">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full bg-white dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] rounded-lg px-4 py-3 text-sm text-[#242420] dark:text-white placeholder:text-[#242420]/20 dark:placeholder:text-white/15 outline-none focus:border-[#C3110F]/60 focus:ring-1 focus:ring-[#C3110F]/20 transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[10px] font-bold text-[#242420]/25 dark:text-white/25 uppercase tracking-[0.15em]">
                  Password
                </label>
                {mode === "login" && (
                  <a href="#" className="text-[11px] text-[#C3110F]/70 hover:text-[#C3110F] transition-colors">
                    Forgot?
                  </a>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-white dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] rounded-lg px-4 py-3 text-sm text-[#242420] dark:text-white placeholder:text-[#242420]/20 dark:placeholder:text-white/15 outline-none focus:border-[#C3110F]/60 focus:ring-1 focus:ring-[#C3110F]/20 transition-all pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#242420]/20 dark:text-white/20 hover:text-[#242420]/50 dark:hover:text-white/50 transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#C3110F] text-white py-3 rounded-lg font-semibold text-sm hover:bg-[#a80e0d] active:scale-[0.98] transition-all shadow-lg shadow-[#C3110F]/20 mt-1 flex items-center justify-center gap-2 group"
            >
              {mode === "login" ? "Log In" : "Create Account"}
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>

          <p className="text-center text-xs text-[#242420]/20 dark:text-white/20 mt-6">
            {mode === "login" ? "No account? " : "Have an account? "}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-[#C3110F]/80 font-medium hover:text-[#C3110F] transition-colors"
            >
              {mode === "login" ? "Sign up free" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
