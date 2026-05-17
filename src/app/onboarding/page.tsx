"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Home, Briefcase, ClipboardList } from "lucide-react";

const roles = [
  {
    id: "buyer",
    icon: <Home size={32} className="text-[#C3110F]" />,
    title: "Buyer",
    desc: "Find the market value of a property before you make an offer.",
  },
  {
    id: "seller",
    icon: <Briefcase size={32} className="text-[#C3110F]" />,
    title: "Seller",
    desc: "Price your property confidently with real market data.",
  },
  {
    id: "appraiser",
    icon: <ClipboardList size={32} className="text-[#C3110F]" />,
    title: "Appraiser",
    desc: "Research comparable listings and validate appraisals professionally.",
  },
];

export default function OnboardingPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#D9D9D9]/20 dark:bg-[#111110] flex flex-col items-center justify-center px-6 py-12">
      <div className="flex items-center gap-2 mb-8">
        <MapPin size={24} className="text-[#C3110F]" />
        <span className="font-bold text-2xl text-[#242420] dark:text-white">
          Val<span className="text-[#C3110F]">You</span>
        </span>
      </div>

      <div className="bg-white dark:bg-[#1e1e1c] rounded-2xl shadow-lg p-8 w-full max-w-2xl border border-transparent dark:border-white/[0.08]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#242420] dark:text-white mb-2">Welcome! How will you be using ValYou?</h1>
          <p className="text-gray-500 dark:text-white/50 text-sm">We'll tailor your dashboard based on your role.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelected(role.id)}
              className={`flex flex-col items-center text-center p-6 rounded-xl border-2 transition-all ${
                selected === role.id
                  ? "border-[#C3110F] bg-[#C3110F]/5"
                  : "border-gray-200 dark:border-white/[0.08] hover:border-[#C3110F]/40 hover:bg-gray-50 dark:hover:bg-white/5"
              }`}
            >
              <div className="w-14 h-14 rounded-full bg-[#D9D9D9]/40 dark:bg-white/10 flex items-center justify-center mb-3">
                {role.icon}
              </div>
              <h3 className="font-bold text-[#242420] dark:text-white mb-2">{role.title}</h3>
              <p className="text-gray-500 dark:text-white/50 text-xs leading-relaxed">{role.desc}</p>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/map")}
            className="flex-1 border border-gray-200 dark:border-white/[0.08] text-gray-400 dark:text-white/30 py-3 rounded-xl text-sm hover:text-gray-600 dark:hover:text-white/60 transition-colors"
          >
            Skip for now
          </button>
          <button
            disabled={!selected}
            onClick={() => router.push("/map")}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-colors ${
              selected
                ? "bg-[#C3110F] text-white hover:bg-red-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
