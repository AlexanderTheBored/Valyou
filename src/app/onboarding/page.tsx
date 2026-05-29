"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Home, Briefcase, ClipboardList, ArrowRight, Check } from "lucide-react";

const roles = [
  {
    id: "buyer",
    Icon: Home,
    title: "Buyer",
    desc: "Find the market value of a property before you make an offer.",
  },
  {
    id: "seller",
    Icon: Briefcase,
    title: "Seller",
    desc: "Price your property confidently with real market data.",
  },
  {
    id: "appraiser",
    Icon: ClipboardList,
    title: "Appraiser",
    desc: "Research comparable listings and validate appraisals professionally.",
  },
];

export default function OnboardingPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f5f5f3] dark:bg-[#0f0f0e] flex flex-col items-center justify-center px-4 sm:px-6 py-10 sm:py-12 relative overflow-hidden">

      {/* Background flourish */}
      <div className="absolute top-0 right-0 w-[36rem] h-[36rem] rounded-full bg-[#C3110F]/[0.06] dark:bg-[#C3110F]/[0.08] blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[28rem] h-[28rem] rounded-full bg-[#C3110F]/[0.04] dark:bg-[#C3110F]/[0.05] blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/4" />

      <div className="flex items-center gap-2 mb-8 relative">
        <div className="w-8 h-8 rounded-lg bg-[#C3110F] flex items-center justify-center shadow-md shadow-[#C3110F]/30">
          <MapPin size={14} className="text-white" />
        </div>
        <span className="font-bold text-xl sm:text-2xl text-[#242420] dark:text-white tracking-tight">
          Val<span className="text-[#C3110F]">you</span>
        </span>
      </div>

      <div className="bg-white dark:bg-[#141413] rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/40 p-6 sm:p-8 w-full max-w-2xl border border-black/[0.06] dark:border-white/[0.08] relative valyou-fade-up">
        <div className="text-center mb-8">
          <p className="text-[#C3110F] text-[10px] font-bold uppercase tracking-[0.18em] mb-2">Step 1 of 1</p>
          <h1 className="text-xl sm:text-2xl font-bold text-[#242420] dark:text-white mb-2 tracking-tight">
            Welcome! How will you be using Valyou?
          </h1>
          <p className="text-[#242420]/55 dark:text-white/55 text-sm">
            We&apos;ll tailor your dashboard based on your role.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
          {roles.map((role) => {
            const isSelected = selected === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setSelected(role.id)}
                aria-pressed={isSelected}
                className={`relative flex flex-col items-center text-center p-5 sm:p-6 rounded-xl border-2 transition-all duration-200 ${isSelected
                  ? "border-[#C3110F] bg-[#C3110F]/[0.05] shadow-md shadow-[#C3110F]/10"
                  : "border-black/[0.08] dark:border-white/[0.08] hover:border-[#C3110F]/50 hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                  }`}
              >
                {isSelected && (
                  <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#C3110F] flex items-center justify-center valyou-fade-up">
                    <Check size={12} className="text-white" strokeWidth={3} />
                  </span>
                )}
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-colors ${isSelected
                  ? "bg-[#C3110F]/15"
                  : "bg-black/[0.04] dark:bg-white/[0.06]"
                  }`}>
                  <role.Icon size={28} className="text-[#C3110F]" />
                </div>
                <h3 className="font-bold text-[#242420] dark:text-white mb-1.5">{role.title}</h3>
                <p className="text-[#242420]/55 dark:text-white/55 text-xs leading-relaxed">{role.desc}</p>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button
            onClick={() => router.push("/map")}
            className="flex-1 border border-black/10 dark:border-white/10 text-[#242420]/55 dark:text-white/55 py-3 rounded-lg text-sm hover:text-[#242420] dark:hover:text-white hover:border-black/25 dark:hover:border-white/25 transition-colors"
          >
            Skip for now
          </button>
          <button
            disabled={!selected}
            onClick={() => router.push("/map")}
            className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 group ${selected
              ? "bg-[#C3110F] text-white hover:bg-[#a80e0d] active:scale-[0.98] shadow-md shadow-[#C3110F]/20 hover:shadow-lg hover:shadow-[#C3110F]/30"
              : "bg-black/[0.06] dark:bg-white/[0.06] text-[#242420]/35 dark:text-white/35 cursor-not-allowed"
              }`}
          >
            Continue
            <ArrowRight size={14} className={selected ? "group-hover:translate-x-0.5 transition-transform" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
}
