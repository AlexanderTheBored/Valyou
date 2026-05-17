"use client";

import dynamic from "next/dynamic";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import NavbarDark from "@/components/NavbarDark";
import { MapPin, X, Search, Loader2 } from "lucide-react";
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

function ConfidenceBar({ pct }: { pct: number }) {
  return (
    <div className="h-1 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
      <div
        className="h-full bg-[#C3110F] rounded-full transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function MapPage() {
  const [droppedPin, setDroppedPin] = useState<LatLng | null>(null);
  const [radius, setRadius] = useState(2);
  const router = useRouter();

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

  const estimate = useMemo(
    () => droppedPin ? getAreaEstimate(droppedPin.lat, droppedPin.lng, radius) : null,
    [droppedPin, radius]
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f5f5f3] dark:bg-[#0f0f0e]">
      <NavbarDark />

      {/* Search bar */}
      <div className="bg-white dark:bg-[#141413] border-b border-black/[0.07] dark:border-white/[0.07] px-4 py-2.5 flex items-center gap-3">
        <div ref={searchContainerRef} className="flex-1 relative">
          <div className="flex items-center gap-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-4 py-2">
            {isSearching
              ? <Loader2 size={14} className="text-[#C3110F] shrink-0 animate-spin" />
              : <Search size={14} className="text-[#242420]/30 dark:text-white/30 shrink-0" />}
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
              placeholder="Search for a city, barangay, or address"
              className="flex-1 bg-transparent text-[#242420] dark:text-white text-sm outline-none placeholder:text-[#242420]/25 dark:placeholder:text-white/25"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setSuggestions([]); setShowDropdown(false); }}
                className="text-[#242420]/25 hover:text-[#242420]/60 dark:text-white/25 dark:hover:text-white/60 transition-colors"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {showDropdown && suggestions.length > 0 && (
            <ul className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1a1a18] border border-black/10 dark:border-white/10 rounded-lg shadow-xl z-[2000] overflow-hidden">
              {suggestions.map((r, i) => {
                const [primary, ...rest] = r.display_name.split(", ");
                const secondary = rest.slice(0, 3).join(", ");
                return (
                  <li key={i}>
                    <button
                      onMouseDown={() => handleSelectResult(r)}
                      className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b border-black/[0.05] dark:border-white/[0.05] last:border-0"
                    >
                      <MapPin size={13} className="text-[#C3110F] shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-[#242420] dark:text-white text-sm font-medium truncate">{primary}</p>
                        {secondary && (
                          <p className="text-[#242420]/40 dark:text-white/40 text-xs truncate mt-0.5">{secondary}</p>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex gap-1.5">
          {["House ▾", "For Sale ▾", "Any Price ▾"].map((f) => (
            <button
              key={f}
              className="text-[#242420]/50 dark:text-white/50 hover:text-[#242420] dark:hover:text-white border border-black/10 dark:border-white/10 hover:border-black/25 dark:hover:border-white/25 text-xs px-3 py-2 rounded-lg transition-colors"
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Map */}
        <div className="flex-1 relative">
          <MapClientDark onPinDrop={setDroppedPin} droppedPin={droppedPin} radiusKm={radius} />

          {!droppedPin && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-[#0f0f0e]/90 backdrop-blur-sm text-[#242420]/70 dark:text-white/70 text-xs px-4 py-2 rounded-full z-[1000] flex items-center gap-1.5 pointer-events-none border border-black/[0.08] dark:border-white/[0.08]">
              <MapPin size={11} className="text-[#C3110F]" />
              Click the map to drop a pin
            </div>
          )}

          <div className="absolute bottom-6 left-4 z-[1000] flex flex-col gap-1">
            {["+", "−"].map((c) => (
              <button
                key={c}
                className="w-8 h-8 bg-white dark:bg-[#1a1a18] border border-black/10 dark:border-white/10 text-[#242420]/60 dark:text-white/60 hover:text-[#242420] dark:hover:text-white rounded text-sm flex items-center justify-center transition-colors"
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar — slides in from the right */}
        <aside
          className={`absolute top-0 right-0 bottom-0 w-80 z-20 flex flex-col overflow-hidden
            bg-white dark:bg-[#141413]
            border-l border-black/[0.07] dark:border-white/[0.07]
            transition-transform duration-[380ms] ease-[cubic-bezier(0.16,1,0.3,1)]
            ${droppedPin ? "translate-x-0" : "translate-x-full"}`}
          style={{ boxShadow: droppedPin ? "-12px 0 40px rgba(0,0,0,0.08)" : "none" }}
        >
          <div
            className={`flex flex-col h-full transition-all duration-300 ease-out
              ${droppedPin ? "opacity-100 translate-x-0 delay-[120ms]" : "opacity-0 translate-x-4"}`}
          >
            {/* Header */}
            <div className="p-5 border-b border-black/[0.07] dark:border-white/[0.07] shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#C3110F]/15 flex items-center justify-center">
                    <MapPin size={12} className="text-[#C3110F]" />
                  </div>
                  <p className="text-[#242420] dark:text-white font-semibold text-sm">Pin Dropped</p>
                </div>
                <button
                  onClick={() => setDroppedPin(null)}
                  className="text-[#242420]/20 dark:text-white/20 hover:text-[#242420]/60 dark:hover:text-white/60 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {droppedPin && (
                <p className="text-[#242420]/30 dark:text-white/30 text-xs font-mono bg-black/5 dark:bg-white/5 px-3 py-2 rounded mb-4">
                  {droppedPin.lat.toFixed(5)}, {droppedPin.lng.toFixed(5)}
                </p>
              )}

              {/* Radius selector */}
              <p className="text-[#242420]/40 dark:text-white/40 text-[10px] uppercase tracking-widest mb-2 font-semibold">
                Search Radius
              </p>
              <div className="flex gap-1.5">
                {RADIUS_OPTIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRadius(r)}
                    className={`flex-1 py-1.5 rounded text-sm font-semibold border transition-colors ${
                      radius === r
                        ? "bg-[#C3110F] text-white border-[#C3110F]"
                        : "border-black/10 dark:border-white/10 text-[#242420]/40 dark:text-white/40 hover:border-black/30 dark:hover:border-white/30 hover:text-[#242420]/70 dark:hover:text-white/70"
                    }`}
                  >
                    {r}km
                  </button>
                ))}
              </div>
            </div>

            {/* Market value estimate */}
            {estimate && (
              <div className="flex-1 overflow-y-auto p-5 space-y-5">

                {/* Main value */}
                <div className="bg-[#f5f5f3] dark:bg-[#1a1a18] rounded-xl p-4 border border-black/[0.07] dark:border-white/[0.07]">
                  <p className="text-[#242420]/40 dark:text-white/40 text-[10px] uppercase tracking-widest mb-3 font-semibold">
                    Fair Market Value · {radius}km radius
                  </p>
                  <p className="text-[#242420] dark:text-white text-3xl font-bold tracking-tight tabular-nums leading-none mb-1">
                    ₱ {estimate.avg.toLocaleString()}
                  </p>
                  <p className="text-[#242420]/40 dark:text-white/40 text-xs mt-1">
                    ₱{estimate.pricePerSqm.toLocaleString()} / sqm · ~95 sqm ref.
                  </p>

                  {/* Range bar */}
                  <div className="mt-4">
                    <div className="relative h-1.5 bg-black/10 dark:bg-white/10 rounded-full">
                      <div className="absolute inset-y-0 left-[20%] right-[20%] bg-[#C3110F]/30 rounded-full" />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#C3110F] shadow-md shadow-[#C3110F]/40"
                        style={{ left: "50%" }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-[#242420]/30 dark:text-white/30 mt-1.5">
                      <span>₱{(estimate.low / 1_000_000).toFixed(1)}M</span>
                      <span className="text-[#242420]/50 dark:text-white/50 font-medium">range</span>
                      <span>₱{(estimate.high / 1_000_000).toFixed(1)}M</span>
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                <div className="bg-[#f5f5f3] dark:bg-[#1a1a18] rounded-lg p-3 border border-black/[0.07] dark:border-white/[0.07]">
                  <p className="text-[#242420]/35 dark:text-white/35 text-[10px] uppercase tracking-widest mb-1.5 font-semibold">Data Points</p>
                  <p className="text-[#242420] dark:text-white font-bold text-sm">{estimate.dataPoints} sources</p>
                </div>

                {/* Confidence */}
                <div className="bg-[#f5f5f3] dark:bg-[#1a1a18] rounded-lg p-3 border border-black/[0.07] dark:border-white/[0.07]">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[#242420]/35 dark:text-white/35 text-[10px] uppercase tracking-widest font-semibold">Confidence</p>
                    <span className="text-[#242420] dark:text-white text-xs font-semibold">{estimate.confidence.label} · {estimate.confidence.pct}%</span>
                  </div>
                  <ConfidenceBar pct={estimate.confidence.pct} />
                  <p className="text-[#242420]/30 dark:text-white/30 text-[10px] mt-2 leading-relaxed">
                    {radius <= 3
                      ? "Tighter radius yields a more precise local estimate."
                      : "Wider radius captures more varied property types."}
                  </p>
                </div>

                {/* CTA */}
                <button
                  onClick={() =>
                    droppedPin &&
                    router.push(`/valuation?lat=${droppedPin.lat.toFixed(4)}&lng=${droppedPin.lng.toFixed(4)}&radius=${radius}`)
                  }
                  className="w-full bg-[#C3110F] hover:bg-red-700 active:scale-[0.97] text-white py-2.5 rounded text-sm font-semibold transition-all"
                >
                  View Full Report →
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
