"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Search, MapPin } from "lucide-react";

const MapClientDark = dynamic(() => import("./MapClientDark"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#f5f5f3] dark:bg-[#0f0f0e]" />,
});

const stats: ReadonlyArray<readonly [string, string]> = [
  ["14,000+", "Listings"],
  ["7", "Cities"],
  ["Real-time", "Data"],
  ["Free", "Tool"],
];

export default function HeroMapClient() {
  return (
    <section className="relative h-[78vh] min-h-[520px] md:h-[72vh] overflow-hidden">
      <div className="absolute inset-0">
        <MapClientDark interactive={false} />
      </div>

      {/* Bottom fade — matches page bg in both modes */}
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#f5f5f3] dark:from-[#0f0f0e] via-[#f5f5f3]/60 dark:via-[#0f0f0e]/60 to-transparent z-[500] pointer-events-none" />

      {/* Glass panel */}
      <div className="absolute inset-x-0 bottom-0 z-[600] pb-6 sm:pb-8 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto bg-white/85 dark:bg-[#0f0f0e]/85 supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-[#0f0f0e]/70 backdrop-blur-md border border-black/[0.08] dark:border-white/[0.08] rounded-2xl p-5 sm:p-6 shadow-xl shadow-black/5 dark:shadow-black/40 valyou-fade-up">
          <h1 className="text-[#242420] dark:text-white text-lg sm:text-xl font-bold text-center mb-5 leading-snug tracking-tight">
            Know the real market value of any property in the Philippines.
          </h1>

          <form
            action="/map"
            className="flex items-stretch bg-black/[0.04] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl overflow-hidden focus-within:border-[#C3110F]/40 focus-within:ring-2 focus-within:ring-[#C3110F]/15 transition-all"
          >
            <div className="flex-1 flex items-center gap-2.5 px-3 sm:px-4 min-w-0">
              <MapPin size={15} className="text-[#242420]/35 dark:text-white/35 shrink-0" />
              <input
                type="text"
                name="q"
                placeholder="Search a location or drop a pin..."
                aria-label="Search a location"
                className="flex-1 min-w-0 bg-transparent text-[#242420] dark:text-white text-sm outline-none placeholder:text-[#242420]/30 dark:placeholder:text-white/30 py-3"
              />
            </div>
            <Link
              href="/map"
              className="bg-[#C3110F] hover:bg-[#a80e0d] active:scale-[0.98] text-white px-4 sm:px-5 text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0"
            >
              <Search size={14} />
              <span className="hidden sm:inline">Search</span>
            </Link>
          </form>

          <div className="grid grid-cols-4 gap-1 mt-5 pt-4 border-t border-black/[0.07] dark:border-white/[0.07]">
            {stats.map(([val, label], i) => (
              <div
                key={label}
                className={`text-center px-1 sm:px-2 ${i > 0 ? "border-l border-black/[0.07] dark:border-white/[0.07]" : ""}`}
              >
                <p className="text-[#242420] dark:text-white font-bold text-xs sm:text-sm tabular-nums">{val}</p>
                <p className="text-[#242420]/40 dark:text-white/40 text-[10px] sm:text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
