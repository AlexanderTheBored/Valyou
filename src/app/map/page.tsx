"use client";

import dynamic from "next/dynamic";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import NavbarDark from "@/components/NavbarDark";
import { MapPin, X, Search, Loader2, ChevronUp, SlidersHorizontal } from "lucide-react";
import { getAreaEstimate } from "@/lib/marketEstimate";

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  type: string;
  importance: number;
}

const MapClientDark = dynamic(() => import("@/components/MapClientDark"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 bg-[#f5f5f3] dark:bg-[#0f0f0e] flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-[#C3110F] border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

interface LatLng { lat: number; lng: number }

const RADIUS_OPTIONS = [2, 3, 5, 10];
const FILTERS = ["House", "For Sale", "Any Price"];

function ConfidenceBar({ pct }: { pct: number }) {
  return (
    <div className="h-1 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
      <div
        className="h-full bg-[#C3110F] rounded-full transition-[width] duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function MapPage() {
  const [droppedPin, setDroppedPin] = useState<LatLng | null>(null);
  const [radius, setRadius] = useState(2);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [bottomInset, setBottomInset] = useState(0);
  const router = useRouter();

  // Track how much of the map is covered by overlays (the mobile bottom
  // sheet). Passed to the map so flyToBounds keeps the pin out from under it.
  useEffect(() => {
    const compute = () => {
      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      if (!isMobile) { setBottomInset(0); return; }
      // Sheet peek ≈ 92px when collapsed, ~55vh when expanded.
      setBottomInset(sheetExpanded ? Math.min(window.innerHeight * 0.55, 460) : 100);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [sheetExpanded]);

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setSuggestions([]); return; }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      const data: NominatimResult[] = await res.json();
      setSuggestions(data);
      setShowDropdown(data.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 2) { setSuggestions([]); setShowDropdown(false); return; }
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 350);
  };

  const handleSelectResult = (result: NominatimResult) => {
    setDroppedPin({ lat: parseFloat(result.lat), lng: parseFloat(result.lon) });
    setSearchQuery("");
    setSuggestions([]);
    setShowDropdown(false);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // When the pin clears, also collapse the sheet so it doesn't peek over an
  // empty map. (We don't auto-expand on pin-drop — that would slide the sheet
  // up over the click point.)
  useEffect(() => {
    if (!droppedPin) setSheetExpanded(false);
  }, [droppedPin]);

  const estimate = useMemo(
    () => droppedPin ? getAreaEstimate(droppedPin.lat, droppedPin.lng, radius) : null,
    [droppedPin, radius]
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f5f5f3] dark:bg-[#0f0f0e]">
      <NavbarDark />

      {/* Search + filters bar */}
      <div className="bg-white dark:bg-[#141413] border-b border-black/[0.07] dark:border-white/[0.07] px-3 sm:px-4 py-2.5 flex items-center gap-2 sm:gap-3 relative z-30">
        <div ref={searchContainerRef} className="flex-1 relative min-w-0">
          <div className="flex items-center gap-2.5 bg-black/[0.04] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-lg px-3 sm:px-4 py-2 focus-within:border-[#C3110F]/40 focus-within:ring-2 focus-within:ring-[#C3110F]/15 transition-all">
            {isSearching
              ? <Loader2 size={14} className="text-[#C3110F] shrink-0 animate-spin" />
              : <Search size={14} className="text-[#242420]/40 dark:text-white/40 shrink-0" />}
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
              placeholder="Search city, barangay, or address"
              aria-label="Search location"
              className="flex-1 min-w-0 bg-transparent text-[#242420] dark:text-white text-sm outline-none placeholder:text-[#242420]/35 dark:placeholder:text-white/35"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setSuggestions([]); setShowDropdown(false); }}
                aria-label="Clear search"
                className="text-[#242420]/35 hover:text-[#242420]/70 dark:text-white/35 dark:hover:text-white/70 transition-colors"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {showDropdown && suggestions.length > 0 && (
            <ul className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#1a1a18] border border-black/10 dark:border-white/10 rounded-xl shadow-xl shadow-black/10 dark:shadow-black/40 z-[2000] overflow-hidden valyou-fade-up">
              {suggestions.map((r, i) => {
                const [primary, ...rest] = r.display_name.split(", ");
                const secondary = rest.slice(0, 3).join(", ");
                return (
                  <li key={i}>
                    <button
                      onMouseDown={() => handleSelectResult(r)}
                      className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors border-b border-black/[0.05] dark:border-white/[0.05] last:border-0"
                    >
                      <MapPin size={13} className="text-[#C3110F] shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-[#242420] dark:text-white text-sm font-medium truncate">{primary}</p>
                        {secondary && (
                          <p className="text-[#242420]/45 dark:text-white/45 text-xs truncate mt-0.5">{secondary}</p>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Desktop filter pills */}
        <div className="hidden sm:flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              className="text-[#242420]/60 dark:text-white/60 hover:text-[#242420] dark:hover:text-white border border-black/10 dark:border-white/10 hover:border-black/25 dark:hover:border-white/25 text-xs px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              {f} ▾
            </button>
          ))}
        </div>

        {/* Mobile filter toggle */}
        <button
          onClick={() => setShowMobileFilters((s) => !s)}
          aria-label="Filters"
          className="sm:hidden shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-black/10 dark:border-white/10 text-[#242420]/60 dark:text-white/60 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors"
        >
          <SlidersHorizontal size={14} />
        </button>
      </div>

      {/* Mobile filter row (collapsible) */}
      {showMobileFilters && (
        <div className="sm:hidden bg-white dark:bg-[#141413] border-b border-black/[0.07] dark:border-white/[0.07] px-3 py-2 flex gap-1.5 overflow-x-auto scrollbar-hide z-20">
          {FILTERS.map((f) => (
            <button
              key={f}
              className="shrink-0 text-[#242420]/60 dark:text-white/60 hover:text-[#242420] dark:hover:text-white border border-black/10 dark:border-white/10 text-xs px-3 py-1.5 rounded-lg transition-colors"
            >
              {f} ▾
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {/* Map */}
        <div className="flex-1 relative">
          <MapClientDark
            onPinDrop={setDroppedPin}
            droppedPin={droppedPin}
            radiusKm={radius}
            bottomInset={bottomInset}
          />

          {!droppedPin && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-[#0f0f0e]/95 supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-[#0f0f0e]/80 backdrop-blur text-[#242420]/80 dark:text-white/80 text-xs px-4 py-2 rounded-full z-[1000] flex items-center gap-1.5 pointer-events-none border border-black/[0.08] dark:border-white/[0.08] shadow-sm">
              <MapPin size={11} className="text-[#C3110F]" />
              Tap the map to drop a pin
            </div>
          )}
        </div>

        {/* ── Desktop sidebar (slide from right) ── */}
        <aside
          className={`hidden md:flex absolute top-0 right-0 bottom-0 w-[340px] z-20 flex-col overflow-hidden
            bg-white dark:bg-[#141413]
            border-l border-black/[0.07] dark:border-white/[0.07]
            transition-transform duration-[380ms] ease-[cubic-bezier(0.16,1,0.3,1)]
            ${droppedPin ? "translate-x-0" : "translate-x-full"}`}
          style={{ boxShadow: droppedPin ? "-16px 0 48px rgba(0,0,0,0.08)" : "none" }}
        >
          <SidebarContent
            droppedPin={droppedPin}
            radius={radius}
            setRadius={setRadius}
            estimate={estimate}
            onClose={() => setDroppedPin(null)}
            onViewReport={() =>
              droppedPin &&
              router.push(`/valuation?lat=${droppedPin.lat.toFixed(4)}&lng=${droppedPin.lng.toFixed(4)}&radius=${radius}`)
            }
          />
        </aside>

        {/* ── Mobile bottom sheet ── */}
        <div
          className={`md:hidden absolute inset-x-0 bottom-0 z-30 bg-white dark:bg-[#141413] border-t border-black/[0.08] dark:border-white/[0.08] rounded-t-2xl shadow-2xl shadow-black/20 dark:shadow-black/60
            transition-transform duration-[380ms] ease-[cubic-bezier(0.16,1,0.3,1)]
            ${droppedPin ? (sheetExpanded ? "translate-y-0" : "translate-y-[calc(100%-92px)]") : "translate-y-full"}`}
          style={{ maxHeight: "82vh" }}
        >
          {/* Drag handle / collapse toggle */}
          <button
            onClick={() => setSheetExpanded((e) => !e)}
            aria-label={sheetExpanded ? "Collapse panel" : "Expand panel"}
            className="w-full flex flex-col items-center pt-2.5 pb-1 active:bg-black/[0.03] dark:active:bg-white/[0.03] transition-colors"
          >
            <span className="w-10 h-1 bg-black/15 dark:bg-white/15 rounded-full" />
            {droppedPin && !sheetExpanded && estimate && (
              <div className="w-full px-5 pt-2 pb-1 flex items-center justify-between">
                <div className="text-left min-w-0">
                  <p className="text-[#242420]/45 dark:text-white/45 text-[10px] uppercase tracking-widest font-semibold">
                    Market Value
                  </p>
                  <p className="text-[#242420] dark:text-white text-lg font-bold tabular-nums leading-tight truncate">
                    ₱ {estimate.avg.toLocaleString()}
                  </p>
                </div>
                <ChevronUp size={18} className="text-[#242420]/50 dark:text-white/50 shrink-0" />
              </div>
            )}
          </button>

          <div className="overflow-y-auto" style={{ maxHeight: "calc(82vh - 30px)" }}>
            <SidebarContent
              droppedPin={droppedPin}
              radius={radius}
              setRadius={setRadius}
              estimate={estimate}
              onClose={() => { setDroppedPin(null); setSheetExpanded(false); }}
              onViewReport={() =>
                droppedPin &&
                router.push(`/valuation?lat=${droppedPin.lat.toFixed(4)}&lng=${droppedPin.lng.toFixed(4)}&radius=${radius}`)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarContent({
  droppedPin, radius, setRadius, estimate, onClose, onViewReport,
}: {
  droppedPin: LatLng | null;
  radius: number;
  setRadius: (n: number) => void;
  estimate: ReturnType<typeof getAreaEstimate> | null;
  onClose: () => void;
  onViewReport: () => void;
}) {
  if (!droppedPin) return null;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-5 pt-4 pb-5 border-b border-black/[0.07] dark:border-white/[0.07]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#C3110F]/15 flex items-center justify-center">
              <MapPin size={12} className="text-[#C3110F]" />
            </div>
            <p className="text-[#242420] dark:text-white font-semibold text-sm">Pin Dropped</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="w-7 h-7 flex items-center justify-center rounded-md text-[#242420]/30 dark:text-white/30 hover:text-[#242420]/70 dark:hover:text-white/70 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <p className="text-[#242420]/50 dark:text-white/50 text-xs font-mono bg-black/[0.04] dark:bg-white/[0.04] px-3 py-2 rounded-md mb-4 tabular-nums">
          {droppedPin.lat.toFixed(5)}, {droppedPin.lng.toFixed(5)}
        </p>

        <p className="text-[#242420]/50 dark:text-white/50 text-[10px] uppercase tracking-[0.15em] mb-2 font-semibold">
          Search Radius
        </p>
        <div className="flex gap-1.5">
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className={`flex-1 py-1.5 rounded-md text-sm font-semibold border transition-colors ${
                radius === r
                  ? "bg-[#C3110F] text-white border-[#C3110F] shadow-sm shadow-[#C3110F]/20"
                  : "border-black/10 dark:border-white/10 text-[#242420]/55 dark:text-white/55 hover:border-black/25 dark:hover:border-white/25 hover:text-[#242420]/85 dark:hover:text-white/85"
              }`}
            >
              {r}km
            </button>
          ))}
        </div>
      </div>

      {/* Estimate */}
      {estimate && (
        <div className="p-5 space-y-4">
          <div className="bg-[#f5f5f3] dark:bg-[#1a1a18] rounded-xl p-4 border border-black/[0.07] dark:border-white/[0.07]">
            <p className="text-[#242420]/50 dark:text-white/50 text-[10px] uppercase tracking-[0.15em] mb-3 font-semibold">
              Fair Market Value · {radius}km radius
            </p>
            <p className="text-[#242420] dark:text-white text-3xl font-bold tracking-tight tabular-nums leading-none mb-1">
              ₱ {estimate.avg.toLocaleString()}
            </p>
            <p className="text-[#242420]/50 dark:text-white/50 text-xs mt-1">
              ₱{estimate.pricePerSqm.toLocaleString()} / sqm · ~95 sqm ref.
            </p>

            <div className="mt-4">
              <div className="relative h-1.5 bg-black/[0.08] dark:bg-white/[0.08] rounded-full">
                <div className="absolute inset-y-0 left-[20%] right-[20%] bg-[#C3110F]/30 rounded-full" />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#C3110F] shadow-md shadow-[#C3110F]/40 ring-2 ring-white dark:ring-[#1a1a18]"
                  style={{ left: "50%", transform: "translate(-50%, -50%)" }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#242420]/45 dark:text-white/45 mt-2 tabular-nums">
                <span>₱{(estimate.low / 1_000_000).toFixed(1)}M</span>
                <span className="text-[#242420]/60 dark:text-white/60 font-medium">range</span>
                <span>₱{(estimate.high / 1_000_000).toFixed(1)}M</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#f5f5f3] dark:bg-[#1a1a18] rounded-lg p-3 border border-black/[0.07] dark:border-white/[0.07]">
              <p className="text-[#242420]/45 dark:text-white/45 text-[10px] uppercase tracking-[0.15em] mb-1.5 font-semibold">Data Points</p>
              <p className="text-[#242420] dark:text-white font-bold text-sm tabular-nums">{estimate.dataPoints} sources</p>
            </div>
            <div className="bg-[#f5f5f3] dark:bg-[#1a1a18] rounded-lg p-3 border border-black/[0.07] dark:border-white/[0.07]">
              <p className="text-[#242420]/45 dark:text-white/45 text-[10px] uppercase tracking-[0.15em] mb-1.5 font-semibold">Activity</p>
              <p className={`font-bold text-sm ${
                estimate.activity === "Hot" ? "text-orange-500" :
                estimate.activity === "Active" ? "text-emerald-600 dark:text-emerald-400" :
                "text-[#242420]/70 dark:text-white/70"
              }`}>
                {estimate.activity}
              </p>
            </div>
          </div>

          <div className="bg-[#f5f5f3] dark:bg-[#1a1a18] rounded-lg p-3 border border-black/[0.07] dark:border-white/[0.07]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[#242420]/45 dark:text-white/45 text-[10px] uppercase tracking-[0.15em] font-semibold">Confidence</p>
              <span className="text-[#242420] dark:text-white text-xs font-semibold tabular-nums">{estimate.confidence.label} · {estimate.confidence.pct}%</span>
            </div>
            <ConfidenceBar pct={estimate.confidence.pct} />
            <p className="text-[#242420]/45 dark:text-white/45 text-[10px] mt-2 leading-relaxed">
              {radius <= 3
                ? "Tighter radius yields a more precise local estimate."
                : "Wider radius captures more varied property types."}
            </p>
          </div>

          <button
            onClick={onViewReport}
            className="w-full bg-[#C3110F] hover:bg-[#a80e0d] active:scale-[0.98] text-white py-3 rounded-lg text-sm font-semibold transition-all shadow-md shadow-[#C3110F]/20 hover:shadow-lg hover:shadow-[#C3110F]/30"
          >
            View Full Report →
          </button>
        </div>
      )}
    </div>
  );
}
