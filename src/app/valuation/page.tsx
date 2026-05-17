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
    <div className="bg-white dark:bg-[#141413] border border-black/[0.07] dark:border-white/[0.07] rounded-xl p-4">
      <p className="text-[#242420]/35 dark:text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-2">{label}</p>
      <div className="text-[#242420] dark:text-white font-bold text-lg leading-none">{value}</div>
      {sub && <p className="text-[#242420]/30 dark:text-white/30 text-xs mt-1">{sub}</p>}
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

  // Adjust base estimate by floor area and property type
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
      <div className="no-print border-b border-black/[0.07] dark:border-white/[0.07] px-6 py-2.5 bg-white dark:bg-[#141413]">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-[#242420]/35 dark:text-white/35">
          <Link href="/map" className="flex items-center gap-1 hover:text-[#242420]/70 dark:hover:text-white/70 transition-colors">
            <ChevronLeft size={14} /> Map
          </Link>
          <span className="text-[#242420]/15 dark:text-white/15">/</span>
          <span className="flex items-center gap-1.5">
            <MapPin size={12} className="text-[#C3110F]" />
            <span className="text-[#242420]/60 dark:text-white/60 font-mono text-xs">
              {lat.toFixed(4)}, {lng.toFixed(4)}
            </span>
            <span className="text-[#242420]/20 dark:text-white/20">· {radius}km radius</span>
          </span>
        </div>
      </div>

      {/* ── Estimate banner ── */}
      <div className="bg-white dark:bg-[#141413] border-b border-black/[0.07] dark:border-white/[0.07]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-[#242420]/30 dark:text-white/30 text-[10px] uppercase tracking-widest mb-4 font-semibold">
            Fair Market Value · {radius}km Radius
          </p>

          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-[#242420] dark:text-white text-5xl font-bold tracking-tight tabular-nums">
                ₱ {estimate.toLocaleString()}
              </p>
              <p className="text-[#242420]/40 dark:text-white/40 text-sm mt-2">
                ₱{sqmRate.toLocaleString()} / sqm · {floorArea} sqm floor area
              </p>

              {/* Range track */}
              <div className="mt-5 w-72">
                <div className="relative h-1.5 bg-black/10 dark:bg-white/10 rounded-full">
                  <div className="absolute inset-y-0 left-[18%] right-[18%] bg-[#C3110F]/20 rounded-full" />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#C3110F] shadow-lg shadow-[#C3110F]/40 border-2 border-white dark:border-[#141413]"
                    style={{ left: `${rangePct}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-[#242420]/30 dark:text-white/30 mt-2">
                  <span>Low  ₱{(low / 1_000_000).toFixed(2)}M</span>
                  <span>High ₱{(high / 1_000_000).toFixed(2)}M</span>
                </div>
              </div>

              {/* Confidence */}
              <div className="flex items-center gap-3 mt-4">
                <div className="h-1 w-28 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C3110F] rounded-full transition-all duration-500"
                    style={{ width: `${base.confidence.pct}%` }}
                  />
                </div>
                <span className="text-[#242420]/40 dark:text-white/40 text-xs">
                  {base.confidence.label} confidence · {base.dataPoints} data points
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="no-print flex gap-2 shrink-0">
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
                className="flex items-center gap-2 border border-black/10 dark:border-white/10 hover:border-black/25 dark:hover:border-white/25 text-[#242420]/50 dark:text-white/50 hover:text-[#242420] dark:hover:text-white px-4 py-2.5 rounded text-sm transition-colors"
              >
                <Download size={14} />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ── Market overview stats ── */}
        <div className="grid grid-cols-2 gap-3">
          <Stat
            label="Price / sqm"
            value={`₱${sqmRate.toLocaleString()}`}
            sub={`${propertyType} · ${radius}km area`}
          />
          <Stat
            label="Market Activity"
            value={
              <span className={`flex items-center gap-1.5 ${
                base.activity === "Hot"    ? "text-orange-500" :
                base.activity === "Active" ? "text-emerald-600 dark:text-emerald-400" :
                                             "text-[#242420]/60 dark:text-white/60"
              }`}>
                <Activity size={15} />
                {base.activity}
              </span>
            }
            sub="Buyer demand signal"
          />
        </div>

        {/* ── Property details ── */}
        <div>
          <div className="bg-white dark:bg-[#141413] border border-black/[0.07] dark:border-white/[0.07] rounded-xl p-6">
            <p className="text-[#242420]/40 dark:text-white/40 text-[10px] uppercase tracking-widest mb-5 font-semibold">
              Property Details
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-xs text-[#242420]/35 dark:text-white/35 mb-1.5">Floor Area (sqm)</label>
                <input
                  type="number"
                  value={floorArea}
                  onChange={(e) => setFloorArea(Math.max(1, +e.target.value))}
                  className="w-full bg-[#f5f5f3] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2.5 text-[#242420] dark:text-white text-sm outline-none focus:border-[#C3110F]/60 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-[#242420]/35 dark:text-white/35 mb-1.5">Lot Area (sqm)</label>
                <input
                  type="number"
                  value={lotArea}
                  onChange={(e) => setLotArea(Math.max(1, +e.target.value))}
                  className="w-full bg-[#f5f5f3] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2.5 text-[#242420] dark:text-white text-sm outline-none focus:border-[#C3110F]/60 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-[#242420]/35 dark:text-white/35 mb-1.5">Property Type</label>
                <div className="flex gap-1.5">
                  {PROPERTY_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setPropertyType(t)}
                      className={`flex-1 py-2 rounded text-sm font-medium border transition-colors ${
                        propertyType === t
                          ? "bg-[#C3110F] text-white border-[#C3110F]"
                          : "border-black/10 dark:border-white/10 text-[#242420]/40 dark:text-white/40 hover:border-black/25 dark:hover:border-white/25"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#242420]/35 dark:text-white/35 mb-1.5">Bedrooms</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setBedrooms(n)}
                      className={`flex-1 py-2 rounded text-sm font-medium border transition-colors ${
                        bedrooms === n
                          ? "bg-[#C3110F] text-white border-[#C3110F]"
                          : "border-black/10 dark:border-white/10 text-[#242420]/40 dark:text-white/40 hover:border-black/25 dark:hover:border-white/25"
                      }`}
                    >
                      {n === 5 ? "5+" : n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live estimate feedback */}
              <div className="pt-4 border-t border-black/[0.07] dark:border-white/[0.07]">
                <p className="text-[#242420]/35 dark:text-white/35 text-[10px] uppercase tracking-widest mb-1 font-semibold">
                  Adjusted Estimate
                </p>
                <p className="text-[#242420] dark:text-white text-2xl font-bold tabular-nums">
                  ₱ {estimate.toLocaleString()}
                </p>
                <p className="text-[#242420]/35 dark:text-white/35 text-xs mt-0.5">
                  ₱{(low / 1_000_000).toFixed(2)}M — ₱{(high / 1_000_000).toFixed(2)}M range
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* ── Price by property type ── */}
        <div className="bg-white dark:bg-[#141413] border border-black/[0.07] dark:border-white/[0.07] rounded-xl p-6">
          <p className="text-[#242420]/40 dark:text-white/40 text-[10px] uppercase tracking-widest mb-5 font-semibold">
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
                      className={`h-full rounded-full transition-all duration-500 ${propertyType === type ? "bg-[#C3110F]" : "bg-[#C3110F]/40"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Area context ── */}
        <div className="bg-white dark:bg-[#141413] border border-black/[0.07] dark:border-white/[0.07] rounded-xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[#242420]/40 dark:text-white/40 text-[10px] uppercase tracking-widest mb-2 font-semibold">
                About This Estimate
              </p>
              <p className="text-[#242420]/60 dark:text-white/60 text-sm leading-relaxed max-w-2xl">
                This valuation is derived from {base.dataPoints} aggregated data points within a {radius}km radius of the selected pin.
                Estimates reflect current market conditions and may vary based on specific property attributes, condition, and exact location.
                Confidence is rated <strong className="text-[#242420] dark:text-white">{base.confidence.label}</strong> at {base.confidence.pct}% for this radius.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2 text-[#242420]/25 dark:text-white/25">
              <Database size={14} />
              <span className="text-xs">{base.dataPoints} sources</span>
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
