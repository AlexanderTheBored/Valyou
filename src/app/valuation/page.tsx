"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import NavbarDark from "@/components/NavbarDark";
import { getAreaEstimate } from "@/lib/marketEstimate";
import {
  ChevronLeft, MapPin, Download,
  Activity, Database,
} from "lucide-react";

const PROPERTY_TYPES = ["House", "Condo", "Land"] as const;
type PropertyType = typeof PROPERTY_TYPES[number];

function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="bg-white dark:bg-[#141413] border border-black/[0.07] dark:border-white/[0.07] rounded-xl p-4 hover:border-black/[0.12] dark:hover:border-white/[0.12] transition-colors">
      <p className="text-[#242420]/45 dark:text-white/45 text-[10px] uppercase tracking-[0.15em] font-semibold mb-2">{label}</p>
      <div className="text-[#242420] dark:text-white font-bold text-lg leading-none">{value}</div>
      {sub && <p className="text-[#242420]/45 dark:text-white/45 text-xs mt-1.5">{sub}</p>}
    </div>
  );
}

function ValuationContent() {
  const searchParams = useSearchParams();
  const lat    = parseFloat(searchParams.get("lat")    ?? "10.3157");
  const lng    = parseFloat(searchParams.get("lng")    ?? "123.8854");
  const radius = parseInt(searchParams.get("radius")   ?? "3", 10);

  const [floorArea,     setFloorArea]     = useState(95);
  const [lotArea,       setLotArea]       = useState(120);
  const [bedrooms,      setBedrooms]      = useState(3);
  const [propertyType,  setPropertyType]  = useState<PropertyType>("House");
  const base = useMemo(() => getAreaEstimate(lat, lng, radius), [lat, lng, radius]);

  const sqmRate =
    propertyType === "House" ? base.byType.House :
    propertyType === "Condo" ? base.byType.Condo :
                               base.byType.Land;

  const estimate  = Math.round(sqmRate * floorArea);
  const variance  = 0.06 + radius * 0.028;
  const low       = Math.round(estimate * (1 - variance));
  const high      = Math.round(estimate * (1 + variance));
  const rangePct  = Math.round(((estimate - low) / (high - low)) * 100);

  return (
    <div className="min-h-screen bg-[#f5f5f3] dark:bg-[#0f0f0e] text-[#242420] dark:text-white">
      <div className="no-print"><NavbarDark /></div>

      {/* Breadcrumb */}
      <div className="no-print border-b border-black/[0.07] dark:border-white/[0.07] px-4 sm:px-6 py-2.5 bg-white dark:bg-[#141413]">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-[#242420]/45 dark:text-white/45 overflow-x-auto scrollbar-hide">
          <Link href="/map" className="flex items-center gap-1 hover:text-[#242420] dark:hover:text-white transition-colors shrink-0">
            <ChevronLeft size={14} /> Map
          </Link>
          <span className="text-[#242420]/20 dark:text-white/20">/</span>
          <span className="flex items-center gap-1.5 shrink-0">
            <MapPin size={12} className="text-[#C3110F]" />
            <span className="text-[#242420]/70 dark:text-white/70 font-mono text-xs tabular-nums">
              {lat.toFixed(4)}, {lng.toFixed(4)}
            </span>
            <span className="text-[#242420]/30 dark:text-white/30">· {radius}km</span>
          </span>
        </div>
      </div>

      {/* ── Estimate banner ── */}
      <div className="bg-white dark:bg-[#141413] border-b border-black/[0.07] dark:border-white/[0.07]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <p className="text-[#242420]/45 dark:text-white/45 text-[10px] uppercase tracking-[0.15em] mb-3 sm:mb-4 font-semibold">
            Fair Market Value · {radius}km Radius
          </p>

          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="flex-1 min-w-0">
              <p className="text-[#242420] dark:text-white text-4xl sm:text-5xl font-bold tracking-tight tabular-nums leading-none valyou-fade-up">
                ₱ {estimate.toLocaleString()}
              </p>
              <p className="text-[#242420]/55 dark:text-white/55 text-sm mt-2">
                ₱{sqmRate.toLocaleString()} / sqm · {floorArea} sqm floor area
              </p>

              <div className="mt-5 max-w-xs">
                <div className="relative h-1.5 bg-black/[0.08] dark:bg-white/[0.08] rounded-full">
                  <div className="absolute inset-y-0 left-[18%] right-[18%] bg-[#C3110F]/25 rounded-full" />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#C3110F] shadow-md shadow-[#C3110F]/40 ring-2 ring-white dark:ring-[#141413]"
                    style={{ left: `${rangePct}%`, transform: "translate(-50%, -50%)" }}
                  />
                </div>
                <div className="flex justify-between text-xs text-[#242420]/45 dark:text-white/45 mt-2 tabular-nums">
                  <span>Low  ₱{(low / 1_000_000).toFixed(2)}M</span>
                  <span>High ₱{(high / 1_000_000).toFixed(2)}M</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <div className="h-1 w-28 bg-black/[0.08] dark:bg-white/[0.08] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C3110F] rounded-full transition-[width] duration-500 ease-out"
                    style={{ width: `${base.confidence.pct}%` }}
                  />
                </div>
                <span className="text-[#242420]/55 dark:text-white/55 text-xs">
                  {base.confidence.label} confidence · {base.dataPoints} data points
                </span>
              </div>
            </div>

            <div className="no-print flex gap-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => {
                  const root = document.documentElement;
                  const wasDark = root.classList.contains("dark");
                  if (wasDark) root.classList.remove("dark");
                  requestAnimationFrame(() => {
                    window.print();
                    if (wasDark) root.classList.add("dark");
                  });
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 border border-black/10 dark:border-white/10 hover:border-black/25 dark:hover:border-white/25 text-[#242420]/65 dark:text-white/65 hover:text-[#242420] dark:hover:text-white px-4 py-2.5 rounded-lg text-sm transition-colors"
              >
                <Download size={14} />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">

        <div className="grid grid-cols-2 gap-3">
          <Stat
            label="Price / sqm"
            value={<span className="tabular-nums">₱{sqmRate.toLocaleString()}</span>}
            sub={`${propertyType} · ${radius}km area`}
          />
          <Stat
            label="Market Activity"
            value={
              <span className={`flex items-center gap-1.5 ${
                base.activity === "Hot"    ? "text-orange-500" :
                base.activity === "Active" ? "text-emerald-600 dark:text-emerald-400" :
                                             "text-[#242420]/70 dark:text-white/70"
              }`}>
                <Activity size={15} />
                {base.activity}
              </span>
            }
            sub="Buyer demand signal"
          />
        </div>

        {/* Property details */}
        <div className="bg-white dark:bg-[#141413] border border-black/[0.07] dark:border-white/[0.07] rounded-xl p-5 sm:p-6">
          <p className="text-[#242420]/50 dark:text-white/50 text-[10px] uppercase tracking-[0.15em] mb-5 font-semibold">
            Property Details
          </p>

          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#242420]/55 dark:text-white/55 mb-1.5">Floor Area (sqm)</label>
                <input
                  type="number"
                  value={floorArea}
                  onChange={(e) => setFloorArea(Math.max(1, +e.target.value))}
                  className="w-full bg-[#f5f5f3] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-lg px-3 py-2.5 text-[#242420] dark:text-white text-sm outline-none focus:border-[#C3110F]/60 focus:ring-2 focus:ring-[#C3110F]/15 transition-all tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs text-[#242420]/55 dark:text-white/55 mb-1.5">Lot Area (sqm)</label>
                <input
                  type="number"
                  value={lotArea}
                  onChange={(e) => setLotArea(Math.max(1, +e.target.value))}
                  className="w-full bg-[#f5f5f3] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-lg px-3 py-2.5 text-[#242420] dark:text-white text-sm outline-none focus:border-[#C3110F]/60 focus:ring-2 focus:ring-[#C3110F]/15 transition-all tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#242420]/55 dark:text-white/55 mb-1.5">Property Type</label>
              <div className="flex gap-1.5">
                {PROPERTY_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setPropertyType(t)}
                    className={`flex-1 py-2 rounded-md text-sm font-medium border transition-colors ${
                      propertyType === t
                        ? "bg-[#C3110F] text-white border-[#C3110F] shadow-sm shadow-[#C3110F]/20"
                        : "border-black/10 dark:border-white/10 text-[#242420]/55 dark:text-white/55 hover:border-black/25 dark:hover:border-white/25 hover:text-[#242420]/85 dark:hover:text-white/85"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#242420]/55 dark:text-white/55 mb-1.5">Bedrooms</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setBedrooms(n)}
                    className={`flex-1 py-2 rounded-md text-sm font-medium border transition-colors tabular-nums ${
                      bedrooms === n
                        ? "bg-[#C3110F] text-white border-[#C3110F] shadow-sm shadow-[#C3110F]/20"
                        : "border-black/10 dark:border-white/10 text-[#242420]/55 dark:text-white/55 hover:border-black/25 dark:hover:border-white/25 hover:text-[#242420]/85 dark:hover:text-white/85"
                    }`}
                  >
                    {n === 5 ? "5+" : n}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-black/[0.07] dark:border-white/[0.07]">
              <p className="text-[#242420]/45 dark:text-white/45 text-[10px] uppercase tracking-[0.15em] mb-1 font-semibold">
                Adjusted Estimate
              </p>
              <p className="text-[#242420] dark:text-white text-2xl font-bold tabular-nums tracking-tight">
                ₱ {estimate.toLocaleString()}
              </p>
              <p className="text-[#242420]/45 dark:text-white/45 text-xs mt-0.5 tabular-nums">
                ₱{(low / 1_000_000).toFixed(2)}M — ₱{(high / 1_000_000).toFixed(2)}M range
              </p>
            </div>
          </div>
        </div>

        {/* Price by property type */}
        <div className="bg-white dark:bg-[#141413] border border-black/[0.07] dark:border-white/[0.07] rounded-xl p-5 sm:p-6">
          <p className="text-[#242420]/50 dark:text-white/50 text-[10px] uppercase tracking-[0.15em] mb-5 font-semibold">
            Price per sqm by Property Type · {radius}km radius
          </p>

          <div className="space-y-4">
            {(["House", "Condo", "Land"] as const).map((type) => {
              const val = base.byType[type];
              const maxVal = Math.max(...Object.values(base.byType));
              const pct = Math.round((val / maxVal) * 100);
              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-sm font-medium ${propertyType === type ? "text-[#C3110F]" : "text-[#242420] dark:text-white"}`}>
                      {type}
                    </span>
                    <span className="text-[#242420] dark:text-white font-bold tabular-nums text-sm">
                      ₱{val.toLocaleString()} / sqm
                    </span>
                  </div>
                  <div className="h-2 bg-black/[0.06] dark:bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-[width] duration-500 ease-out ${propertyType === type ? "bg-[#C3110F]" : "bg-[#C3110F]/40"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Context */}
        <div className="bg-white dark:bg-[#141413] border border-black/[0.07] dark:border-white/[0.07] rounded-xl p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <p className="text-[#242420]/50 dark:text-white/50 text-[10px] uppercase tracking-[0.15em] mb-2 font-semibold">
                About This Estimate
              </p>
              <p className="text-[#242420]/70 dark:text-white/70 text-sm leading-relaxed max-w-2xl">
                This valuation is derived from {base.dataPoints} aggregated data points within a {radius}km radius of the selected pin.
                Estimates reflect current market conditions and may vary based on specific property attributes, condition, and exact location.
                Confidence is rated <strong className="text-[#242420] dark:text-white">{base.confidence.label}</strong> at {base.confidence.pct}% for this radius.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2 text-[#242420]/40 dark:text-white/40">
              <Database size={14} />
              <span className="text-xs tabular-nums">{base.dataPoints} sources</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function ValuationPage() {
  return (
    <Suspense>
      <ValuationContent />
    </Suspense>
  );
}
