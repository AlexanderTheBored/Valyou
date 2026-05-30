"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NavbarDark from "@/components/NavbarDark";
import { 
  MapPin, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Building2, 
  Maximize2,
  Plus,
  ArrowUpRight
} from "lucide-react";

interface Valuation {
  id: string;
  user_id: string;
  status: string;
  latitude: number;
  longitude: number;
  age: number;
  scan_area: number;
  type: string;
  lot_area: number;
  area?: number;
  zonal_value?: number;
  scraped_value?: number;
  market_value?: number;
  total_value?: number;
  listings_used?: number;
  r_squared?: number;
  confidence?: string;
  error_message?: string;
  street?: string;
  barangay?: string;
  city?: string;
  province?: string;
  created_at: string;
  updated_at: string;
}

function getAuthToken() {
  if (typeof document === "undefined") return null;
  const tokenMatch = document.cookie.match(/(^| )valyou_auth=([^;]*)/);
  return tokenMatch ? tokenMatch[2] : null;
}

function formatLocation(v: Valuation) {
  const hasFullAddress = v.province || v.city || v.barangay;
  const title = hasFullAddress
    ? [v.street, v.barangay].filter(Boolean).join(", ") || v.city || ""
    : `${v.latitude.toFixed(5)}, ${v.longitude.toFixed(5)}`;
  const subtitle = hasFullAddress
    ? [v.city, v.province].filter(Boolean).join(", ")
    : "Coordinates";
  return { title, subtitle };
}

function formatRelativeDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function StatusDot({ status }: { status: string }) {
  if (status === "processing") {
    return <span className="relative flex h-2 w-2 shrink-0"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" /></span>;
  }
  if (status === "failed") {
    return <span className="h-2 w-2 rounded-full bg-[#C3110F] shrink-0" />;
  }
  return <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />;
}

export default function ValuationsHistoryPage() {
  const router = useRouter();
  const [valuations, setValuations] = useState<Valuation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push(`/auth?returnUrl=${encodeURIComponent("/valuations")}`);
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/valuations`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
    .then((res) => {
      if (res.status === 401) {
        document.cookie = "valyou_auth=; path=/; max-age=0;";
        localStorage.removeItem("valyou_user");
        router.push("/auth");
        return;
      }
      if (!res.ok) {
        throw new Error("Failed to fetch valuations history");
      }
      return res.json();
    })
    .then((data) => {
      if (data) {
        setValuations(data);
      }
    })
    .catch((err) => {
      setErrorMsg(err.message || "An error occurred while loading valuations history.");
    })
    .finally(() => {
      setIsLoading(false);
    });
  }, [router]);

  const latest = valuations.length > 0 ? valuations[0] : null;
  const rest = valuations.length > 1 ? valuations.slice(1) : [];

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      <NavbarDark />
      
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-10 pb-20">

        {/* ── Page Title Row ───────────────────────────────────── */}
        <div className="flex items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-[10px] font-bold text-[#C3110F] dark:text-[#E52E2C] uppercase tracking-[0.18em] mb-1.5">Dashboard</p>
            <h1 className="text-2xl font-black tracking-tight text-ink leading-none">
              Valuation Reports
            </h1>
          </div>
          <Link
            href="/map"
            className="inline-flex items-center gap-1.5 bg-[#C3110F] hover:bg-[#a80e0d] text-white pl-3.5 pr-4.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-[#C3110F]/20 hover:shadow-lg hover:shadow-[#C3110F]/30 transition-all active:scale-[0.98] shrink-0"
          >
            <Plus size={14} strokeWidth={2.5} />
            New
          </Link>
        </div>

        {/* ── Error ────────────────────────────────────────────── */}
        {errorMsg && (
          <div className="mb-8 p-4 bg-[#C3110F]/[0.05] border border-[#C3110F]/15 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-[#C3110F] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-[#C3110F]">Unable to load reports</p>
              <p className="text-xs text-ink/55 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* ── Loading Skeleton ─────────────────────────────────── */}
        {isLoading ? (
          <div className="space-y-6">
            {/* Featured skeleton */}
            <div className="bg-surface border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-3 w-20 bg-black/[0.06] dark:bg-white/[0.06] rounded-full animate-pulse" />
                <div className="h-5 w-14 bg-black/[0.04] dark:bg-white/[0.04] rounded-full animate-pulse" />
              </div>
              <div className="h-4 w-48 bg-black/[0.07] dark:bg-white/[0.07] rounded animate-pulse mb-2" />
              <div className="h-3 w-32 bg-black/[0.04] dark:bg-white/[0.04] rounded animate-pulse mb-8" />
              <div className="h-8 w-40 bg-black/[0.06] dark:bg-white/[0.06] rounded animate-pulse" />
            </div>
            {/* Row skeletons */}
            <div className="bg-surface border border-black/[0.06] dark:border-white/[0.06] rounded-xl overflow-hidden shadow-sm">
              {[0,1,2].map((i) => (
                <div key={i} className={`flex items-center gap-4 px-5 py-4 ${i > 0 ? "border-t border-black/[0.04] dark:border-white/[0.04]" : ""}`}>
                  <div className="h-2 w-2 rounded-full bg-black/[0.08] dark:bg-white/[0.08] animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-36 bg-black/[0.06] dark:bg-white/[0.06] rounded animate-pulse" />
                    <div className="h-2.5 w-24 bg-black/[0.04] dark:bg-white/[0.04] rounded animate-pulse" />
                  </div>
                  <div className="h-4 w-20 bg-black/[0.05] dark:bg-white/[0.05] rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ) : valuations.length === 0 ? (
          /* ── Empty State ──────────────────────────────────────── */
          <div className="bg-surface border border-black/[0.06] dark:border-white/[0.06] rounded-2xl shadow-sm">
            <div className="px-6 sm:px-8 py-16 sm:py-20 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-[#C3110F]/[0.07] flex items-center justify-center mb-5">
                <MapPin className="w-5 h-5 text-[#C3110F]" />
              </div>
              <h3 className="text-base font-bold text-ink mb-1">
                No reports yet
              </h3>
              <p className="text-sm text-ink/45 max-w-[280px] leading-relaxed mb-8">
                Pin a location on the map to generate your first property valuation report.
              </p>
              <Link
                href="/map"
                className="inline-flex items-center gap-1.5 bg-[#C3110F] hover:bg-[#a80e0d] text-white pl-5 pr-6 py-3 rounded-xl text-sm font-bold shadow-md shadow-[#C3110F]/20 hover:shadow-lg hover:shadow-[#C3110F]/30 transition-all active:scale-[0.98]"
              >
                <MapPin size={14} />
                Open Map
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">

            {/* ── Featured / Latest Report ────────────────────── */}
            {latest && (() => {
              const loc = formatLocation(latest);
              const isClickable = latest.status !== "processing";
              return (
                <div
                  onClick={() => isClickable && router.push(`/valuation?id=${latest.id}`)}
                  className={`bg-surface border border-black/[0.06] dark:border-white/[0.06] rounded-2xl shadow-sm overflow-hidden group ${
                    isClickable ? "cursor-pointer hover:border-black/[0.12] dark:hover:border-white/[0.12] hover:shadow-md transition-all duration-200" : ""
                  }`}
                >
                  <div className="p-6 sm:p-8">
                    {/* Top meta line */}
                    <div className="flex items-center gap-2.5 mb-5">
                      <p className="text-[10px] font-bold text-ink/40 uppercase tracking-[0.15em]">
                        Latest Report
                      </p>
                      {latest.status === "processing" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/[0.08] px-2 py-0.5 rounded-full">
                          <Loader2 size={9} className="animate-spin" />
                          Processing
                        </span>
                      ) : latest.status === "failed" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#C3110F] dark:text-[#E52E2C] bg-[#C3110F]/[0.07] px-2 py-0.5 rounded-full">
                          <AlertCircle size={9} />
                          Failed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/[0.07] px-2 py-0.5 rounded-full">
                          <CheckCircle2 size={9} />
                          Complete
                        </span>
                      )}
                    </div>

                    {/* Location block */}
                    <h2 className="text-lg sm:text-xl font-bold text-ink leading-snug mb-0.5 truncate">
                      {loc.title}
                    </h2>
                    <p className="text-xs text-ink/40 font-medium truncate mb-1">
                      {loc.subtitle}
                    </p>
                    <p className="text-[10px] text-[#C3110F] dark:text-[#E52E2C] font-mono bg-black/[0.03] dark:bg-white/[0.03] px-1.5 py-0.5 rounded w-fit select-all mb-6">
                      {latest.latitude.toFixed(5)}, {latest.longitude.toFixed(5)}
                    </p>

                    {/* Value + Specs */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
                      <div>
                        {latest.status === "failed" ? (
                          <p className="text-xs text-[#C3110F]/70 dark:text-[#E52E2C]/70 font-medium">
                            {latest.error_message || "Valuation could not be completed"}
                          </p>
                        ) : latest.status === "processing" ? (
                          <p className="text-xs text-ink/40 font-medium">
                            Running spatial analysis…
                          </p>
                        ) : latest.total_value ? (
                          <>
                            <p className="text-[9px] font-bold text-ink/35 uppercase tracking-[0.15em] mb-1">Estimated Fair Value</p>
                            <p className="text-3xl sm:text-4xl font-black text-ink tracking-tight tabular-nums leading-none">
                              ₱{latest.total_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </p>
                            {latest.market_value && (
                              <p className="text-[11px] text-ink/40 font-medium mt-1.5">
                                ₱{Math.round(latest.market_value).toLocaleString()}/sqm · {latest.lot_area || latest.area} sqm
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-xs text-ink/45 font-medium">Report available</p>
                        )}
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        {/* Property details */}
                        <div className="flex items-center gap-3 text-[11px] font-medium text-ink/40">
                          <span className="inline-flex items-center gap-1">
                            <Maximize2 size={10} />
                            {latest.lot_area || latest.area} sqm
                          </span>
                          <span className="w-px h-3 bg-black/[0.08] dark:bg-white/[0.08]" />
                          <span className="inline-flex items-center gap-1">
                            <Building2 size={10} />
                            {latest.age} yrs
                          </span>
                        </div>
                        {isClickable && (
                          <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-[#C3110F] dark:text-[#E52E2C] group-hover:gap-1.5 transition-all">
                            Open
                            <ArrowUpRight size={13} />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Thin bottom accent line */}
                  <div className="h-[2px] bg-gradient-to-r from-[#C3110F]/0 via-[#C3110F]/20 to-[#C3110F]/0 group-hover:via-[#C3110F]/40 transition-all duration-300" />
                </div>
              );
            })()}


            {/* ── Previous Reports Table ──────────────────────── */}
            {rest.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-ink/40 uppercase tracking-[0.18em] mb-3 pl-1">
                  Previous Reports
                  <span className="ml-2 text-ink/25 font-semibold normal-case tracking-normal">{rest.length}</span>
                </p>
                <div className="bg-surface border border-black/[0.06] dark:border-white/[0.06] rounded-xl overflow-hidden shadow-sm">
                  {rest.map((v, i) => {
                    const loc = formatLocation(v);
                    const isClickable = v.status !== "processing";

                    return (
                      <div
                        key={v.id}
                        onClick={() => isClickable && router.push(`/valuation?id=${v.id}`)}
                        className={`flex items-center gap-4 px-5 py-3.5 group/row transition-colors duration-150 ${
                          i > 0 ? "border-t border-black/[0.04] dark:border-white/[0.04]" : ""
                        } ${
                          isClickable ? "cursor-pointer hover:bg-black/[0.015] dark:hover:bg-white/[0.015]" : "opacity-70"
                        }`}
                      >
                        {/* Status indicator */}
                        <StatusDot status={v.status} />

                        {/* Location */}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-ink truncate leading-tight">
                            {loc.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-ink/35 font-medium truncate">{loc.subtitle}</span>
                            <span className="hidden sm:inline text-[10px] text-ink/25">·</span>
                            <span className="hidden sm:inline text-[10px] text-ink/25 font-medium shrink-0">
                              {v.lot_area || v.area} sqm · {v.age}y
                            </span>
                          </div>
                        </div>

                        {/* Value column */}
                        <div className="text-right shrink-0 hidden sm:block">
                          {v.status === "failed" ? (
                            <p className="text-[10px] text-[#C3110F]/60 dark:text-[#E52E2C]/60 font-medium">Failed</p>
                          ) : v.status === "processing" ? (
                            <p className="text-[10px] text-amber-500/70 font-medium">Processing…</p>
                          ) : v.total_value ? (
                            <p className="text-sm font-bold text-ink tabular-nums tracking-tight">
                              ₱{v.total_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </p>
                          ) : (
                            <p className="text-[10px] text-ink/35">—</p>
                          )}
                        </div>

                        {/* Time + Arrow */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-ink/30 font-medium tabular-nums w-12 text-right">
                            {formatRelativeDate(v.created_at)}
                          </span>
                          {isClickable && (
                            <ArrowRight size={12} className="text-ink/15 group-hover/row:text-[#C3110F] dark:group-hover/row:text-[#E52E2C] transition-colors" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
