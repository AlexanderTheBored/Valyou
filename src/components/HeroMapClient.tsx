"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Search, MapPin } from "lucide-react";

const MapClientDark = dynamic(() => import("./MapClientDark"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#f5f5f3] dark:bg-[#0f0f0e]" />,
});

const stats = [
  ["14,000+", "Listings"],
  ["7", "Cities"],
  ["Real-time", "Data"],
  ["Free", "Tool"],
];

export default function HeroMapClient() {
  return (
    <section className="relative h-[72vh] overflow-hidden">
      <div className="absolute inset-0">
        <MapClientDark interactive={false} />
      </div>

      {/* Bottom fade — matches page bg in both modes */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f5f5f3] dark:from-[#0f0f0e] to-transparent z-[500] pointer-events-none" />

      {/* Glass panel */}
      <div className="absolute inset-x-0 bottom-0 z-[600] pb-8 px-6">
        <div className="max-w-2xl mx-auto bg-white/85 dark:bg-[#0f0f0e]/80 backdrop-blur-lg border border-black/[0.08] dark:border-white/[0.08] rounded-2xl p-6 shadow-2xl">
          <h1 className="text-[#242420] dark:text-white text-xl font-bold text-center mb-5 leading-snug">
            Know the real market value of any property in the Philippines.
          </h1>

          <div className="flex items-stretch bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg overflow-hidden">
            <div className="flex-1 flex items-center gap-2.5 px-4">
              <MapPin size={15} className="text-[#242420]/30 dark:text-white/30 shrink-0" />
              <input
                type="text"
                placeholder="Search a location or drop a pin on the map..."
                className="flex-1 bg-transparent text-[#242420] dark:text-white text-sm outline-none placeholder:text-[#242420]/25 dark:placeholder:text-white/25 py-3"
              />
            </div>
            <Link
              href="/map"
              className="bg-[#C3110F] hover:bg-red-700 text-white px-5 text-sm font-semibold transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Search size={14} />
              Search
            </Link>
          </div>

          <div className="flex items-center justify-center gap-0 mt-5 pt-4 border-t border-black/[0.07] dark:border-white/[0.07] divide-x divide-black/[0.07] dark:divide-white/[0.07]">
            {stats.map(([val, label]) => (
              <div key={label} className="text-center px-6">
                <p className="text-[#242420] dark:text-white font-bold text-sm">{val}</p>
                <p className="text-[#242420]/30 dark:text-white/30 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
