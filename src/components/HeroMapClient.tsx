"use client";

import dynamic from "next/dynamic";
import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Loader2, X } from "lucide-react";

const MapClientDark = dynamic(() => import("./MapClientDark"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-canvas" />,
});

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  type: string;
  importance: number;
}

const stats: ReadonlyArray<readonly [string, string]> = [
  ["14,000+", "Listings"],
  ["7", "Cities"],
  ["Real-time", "Data"],
  ["Free", "Tool"],
];

export default function HeroMapClient() {
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
    setSearchQuery("");
    setSuggestions([]);
    setShowDropdown(false);
    router.push(`/map?lat=${result.lat}&lng=${result.lon}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      handleSelectResult(suggestions[0]);
    } else {
      router.push("/map");
    }
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

  return (
    <section className="relative h-[78vh] min-h-[520px] md:h-[72vh] overflow-hidden">
      <div className="absolute inset-0">
        <MapClientDark interactive={false} />
      </div>

      {/* Bottom fade — matches page bg in both modes */}
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-canvas via-canvas/60 to-transparent z-[500] pointer-events-none" />

      {/* Glass panel */}
      <div className="absolute inset-x-0 bottom-0 z-[600] pb-6 sm:pb-8 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto bg-surface/85 supports-[backdrop-filter]:bg-surface/70 backdrop-blur-md border border-black/[0.08] dark:border-white/[0.08] rounded-2xl p-5 sm:p-6 shadow-xl shadow-black/5 dark:shadow-black/40 valyou-fade-up">
          <h1 className="text-ink text-lg sm:text-xl font-bold text-center mb-5 leading-snug tracking-tight">
            Know the real market value of any property in the Philippines.
          </h1>

          <div ref={searchContainerRef} className="relative">
            <form
              onSubmit={handleSubmit}
              className="flex items-stretch bg-black/[0.04] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl overflow-hidden focus-within:border-[#C3110F]/40 focus-within:ring-2 focus-within:ring-[#C3110F]/15 transition-all"
            >
              <div className="flex-1 flex items-center gap-2.5 px-3 sm:px-4 min-w-0">
                {isSearching
                  ? <Loader2 size={15} className="text-[#C3110F] shrink-0 animate-spin" />
                  : <MapPin size={15} className="text-ink/35 shrink-0" />}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                  placeholder="Search a location or drop a pin..."
                  aria-label="Search a location"
                  className="flex-1 min-w-0 bg-transparent text-ink text-sm outline-none placeholder:text-ink/30 py-3"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(""); setSuggestions([]); setShowDropdown(false); }}
                    aria-label="Clear search"
                    className="text-ink/35 hover:text-ink/70 transition-colors"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="bg-[#C3110F] hover:bg-[#a80e0d] active:scale-[0.98] text-white px-4 sm:px-5 text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0"
              >
                <Search size={14} />
                <span className="hidden sm:inline">Search</span>
              </button>
            </form>

            {showDropdown && suggestions.length > 0 && (
              <ul className="absolute bottom-full left-0 right-0 mb-1.5 bg-surface border border-black/10 dark:border-white/10 rounded-xl shadow-xl shadow-black/10 dark:shadow-black/40 z-[2000] overflow-hidden valyou-fade-up">
                {suggestions.map((r, i) => {
                  const [primary, ...rest] = r.display_name.split(", ");
                  const secondary = rest.slice(0, 3).join(", ");
                  return (
                    <li key={i}>
                      <button
                        type="button"
                        onMouseDown={() => handleSelectResult(r)}
                        className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors border-b border-black/[0.05] dark:border-white/[0.05] last:border-0"
                      >
                        <MapPin size={13} className="text-[#C3110F] shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-ink text-sm font-medium truncate">{primary}</p>
                          {secondary && (
                            <p className="text-ink/45 text-xs truncate mt-0.5">{secondary}</p>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-4 gap-1 mt-5 pt-4 border-t border-black/[0.07] dark:border-white/[0.07]">
            {stats.map(([val, label], i) => (
              <div
                key={label}
                className={`text-center px-1 sm:px-2 ${i > 0 ? "border-l border-black/[0.07] dark:border-white/[0.07]" : ""}`}
              >
                <p className="text-ink font-bold text-xs sm:text-sm tabular-nums">{val}</p>
                <p className="text-ink/40 text-[10px] sm:text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
