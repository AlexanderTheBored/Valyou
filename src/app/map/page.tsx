"use client";

import dynamic from "next/dynamic";
import { useState, useMemo, useRef, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NavbarDark from "@/components/NavbarDark";
import { MapPin, X, Search, Loader2, Locate } from "lucide-react";
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
    <div className="flex-1 bg-canvas flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-[#C3110F] border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

interface LatLng { lat: number; lng: number }

const RADIUS_VALUES = [1, 2, 3, 5, 10];

export default function MapPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-canvas">
        <div className="w-5 h-5 border-2 border-[#C3110F] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <MapPageInner />
    </Suspense>
  );
}

function MapPageInner() {
  const searchParams = useSearchParams();
  const [droppedPin, setDroppedPin] = useState<LatLng | null>(() => {
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    if (lat && lng) return { lat: parseFloat(lat), lng: parseFloat(lng) };
    return null;
  });
  const [radius, setRadius] = useState(1);
  const [lotArea, setLotArea] = useState<number | "">("");
  const [age, setAge] = useState<number | "">("");
  const [address, setAddress] = useState<string | null>(null);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const router = useRouter();
  const [isLocating, setIsLocating] = useState(false);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDroppedPin({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Failed to get your location. Please check your browser permissions.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // Resolve address via reverse geocoding on pin drop
  useEffect(() => {
    if (!droppedPin) {
      setAddress(null);
      return;
    }
    setIsResolvingAddress(true);
    fetch(`/api/geocode?lat=${droppedPin.lat}&lon=${droppedPin.lng}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.display_name) {
          setAddress(data.display_name);
        } else {
          setAddress(null);
        }
      })
      .catch(() => setAddress(null))
      .finally(() => setIsResolvingAddress(false));
  }, [droppedPin]);

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

  const [localIndex, setLocalIndex] = useState(RADIUS_VALUES.indexOf(radius));

  useEffect(() => {
    setLocalIndex(RADIUS_VALUES.indexOf(radius));
  }, [radius]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(e.target.value, 10);
    setLocalIndex(index);
  };

  const handleDragEnd = () => {
    setRadius(RADIUS_VALUES[localIndex]);
  };

  // Format display name for location card
  const [primaryLocation, secondaryLocation] = useMemo(() => {
    if (isResolvingAddress) return ["Locating address...", ""];
    if (!droppedPin) return ["", ""];
    if (!address) return [`${droppedPin.lat.toFixed(5)}, ${droppedPin.lng.toFixed(5)}`, "Coordinates Pinned"];
    const [primary, ...rest] = address.split(", ");
    return [primary, rest.slice(0, 3).join(", ")];
  }, [address, isResolvingAddress, droppedPin]);

  // Validation
  const isInvalid = lotArea === "" || age === "" || age > 25 || lotArea < 1;

  const onViewReport = () => {
    if (droppedPin) {
      router.push(`/valuation?lat=${droppedPin.lat.toFixed(4)}&lng=${droppedPin.lng.toFixed(4)}&radius=${radius}&area=${lotArea}&age=${age}`);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-canvas relative">
      <NavbarDark />

      <div className="flex-1 relative overflow-hidden">
        {/* Whole Viewport Map */}
        <div className="absolute inset-0 z-0">
          <MapClientDark
            onPinDrop={setDroppedPin}
            droppedPin={droppedPin}
            radiusKm={radius}
            bottomInset={0}
          />
        </div>

        {/* Pin dropping helper */}
        {!droppedPin && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-surface/90 backdrop-blur-md text-ink/80 text-xs px-4 py-2.5 rounded-full z-10 flex items-center gap-1.5 border border-black/[0.08] dark:border-white/[0.08] shadow-lg pointer-events-none transition-opacity duration-300">
            <MapPin size={12} className="text-[#C3110F] animate-pulse" />
            Tap anywhere on the map to place a pin
          </div>
        )}

        {/* Merged Unified Container (Top Right / Top Center on Mobile) */}
        <div
          ref={searchContainerRef}
          className="absolute top-4 left-4 right-4 md:right-4 md:left-auto md:w-[420px] z-10 bg-surface/90 backdrop-blur-md border border-black/[0.08] dark:border-white/[0.08] rounded-2xl shadow-2xl transition-all duration-[420ms] ease-in-out flex flex-col overflow-visible"
          style={{
            maxHeight: droppedPin ? "450px" : "66px"
          }}
        >
          {/* Search Header */}
          <div className="h-[64px] p-2.5 flex items-center gap-2 shrink-0">
            <div className="flex-1 flex items-center gap-2 bg-black/[0.03] dark:bg-white/[0.03] rounded-xl px-3 py-2 border border-black/5 dark:border-white/5 focus-within:border-[#C3110F]/45 transition-all">
              {isSearching ? (
                <Loader2 size={14} className="text-[#C3110F] shrink-0 animate-spin" />
              ) : (
                <Search size={14} className="text-ink/40 shrink-0" />
              )}
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                placeholder="Search location to begin..."
                aria-label="Search location"
                className="flex-1 min-w-0 bg-transparent text-ink text-sm outline-none placeholder:text-ink/35"
              />
              {(searchQuery || droppedPin) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSuggestions([]);
                    setShowDropdown(false);
                    setDroppedPin(null);
                  }}
                  aria-label="Clear all"
                  className="text-ink/35 hover:text-ink/70 transition-colors"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            {/* Geolocation Button */}
            <button
              onClick={handleGetCurrentLocation}
              disabled={isLocating}
              className="p-2.5 bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 hover:bg-black/[0.06] dark:hover:bg-white/[0.06] hover:border-[#C3110F]/30 text-ink rounded-xl transition-all flex items-center justify-center shrink-0 relative group disabled:opacity-50"
              aria-label="Use current location"
            >
              {isLocating ? (
                <Loader2 size={14} className="text-[#C3110F] animate-spin" />
              ) : (
                <Locate size={14} className="text-[#C3110F] dark:text-[#E52E2C]" />
              )}
              {/* Tooltip */}
              <div className="absolute bottom-full right-0 mb-2 px-2.5 py-1 bg-black/95 dark:bg-neutral-800 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-30">
                Use Current Location
              </div>
            </button>
          </div>

          {/* Search Dropdown Overlay */}
          {showDropdown && suggestions.length > 0 && (
            <ul className="absolute top-[64px] left-2.5 right-2.5 max-h-[220px] overflow-y-auto bg-surface/95 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden divide-y divide-black/[0.04] dark:divide-white/[0.04] valyou-fade-up">
              {suggestions.map((r, i) => {
                const [primary, ...rest] = r.display_name.split(", ");
                const secondary = rest.slice(0, 3).join(", ");
                return (
                  <li key={i}>
                    <button
                      onMouseDown={() => handleSelectResult(r)}
                      className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-[#C3110F]/5 dark:hover:bg-[#C3110F]/10 transition-colors"
                    >
                      <MapPin size={14} className="text-[#C3110F] shrink-0 mt-0.5" />
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

          {/* Details Content Container */}
          <div
            className={`transition-all duration-[420ms] ease-in-out border-t border-black/[0.06] dark:border-white/[0.06] ${
              droppedPin ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
            }`}
          >
            {droppedPin && (
              <div className="flex flex-col p-5 space-y-4">
                {/* Header Info */}
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#C3110F]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin size={16} className="text-[#C3110F]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-ink font-bold text-sm truncate leading-tight">
                      {primaryLocation}
                    </h2>
                    {secondaryLocation && (
                      <p className="text-[11px] text-ink/50 truncate mt-0.5 font-medium leading-none">
                        {secondaryLocation}
                      </p>
                    )}
                    <p className="text-[10px] text-[#C3110F] dark:text-[#E52E2C] font-mono mt-2 leading-none bg-black/[0.04] dark:bg-white/[0.04] px-1.5 py-0.5 rounded w-fit select-all">
                      {droppedPin.lat.toFixed(5)}, {droppedPin.lng.toFixed(5)}
                    </p>
                  </div>
                </div>

                {/* Snapping Radius Slider */}
                <div className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-xl p-4">
                  <label className="block text-[10px] font-bold text-ink/55 uppercase tracking-[0.18em] mb-3">
                    Search Radius
                  </label>
                  <div className="relative select-none">
                    <input
                      type="range"
                      min="0"
                      max="4"
                      step="1"
                      value={localIndex}
                      onChange={handleSliderChange}
                      onMouseUp={handleDragEnd}
                      onTouchEnd={handleDragEnd}
                      className="w-full accent-[#C3110F] h-1.5 bg-black/[0.08] dark:bg-white/[0.08] rounded-lg appearance-none cursor-pointer focus:outline-none"
                    />
                    <div className="relative mt-2.5 h-4">
                      {RADIUS_VALUES.map((val, i) => {
                        const frac = i / (RADIUS_VALUES.length - 1);
                        const thumbHalf = 8;
                        const offset = (1 - 2 * frac) * thumbHalf;
                        return (
                        <span
                          key={val}
                          onClick={() => setRadius(val)}
                          style={{ left: `calc(${frac * 100}% + ${offset}px)` }}
                          className={`absolute -translate-x-1/2 text-[11px] font-bold cursor-pointer transition-colors ${radius === val ? "text-[#C3110F] dark:text-[#E52E2C]" : "text-ink/45 hover:text-ink/70"}`}
                        >
                          {val}km
                        </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Property Details Grid (Lot Area & Age Inputs) */}
                <div className="grid grid-cols-2 gap-3">
                  <div className={`bg-black/[0.02] dark:bg-white/[0.02] border rounded-xl p-3 flex flex-col justify-between relative transition-colors ${
                    lotArea !== "" && lotArea < 1 ? "border-[#C3110F]/50 bg-[#C3110F]/[0.02]" : "border-black/5 dark:border-white/5"
                  }`}>
                    <label className="block text-[9px] font-bold text-ink/55 uppercase tracking-[0.15em] mb-1">
                      Lot Area (sqm)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={lotArea}
                      onChange={(e) => {
                        if (e.target.value === "") {
                          setLotArea("");
                        } else {
                          const val = Number(e.target.value);
                          if (val >= 0) setLotArea(val);
                        }
                      }}
                      className="w-full bg-transparent text-ink text-sm font-bold outline-none border-b border-transparent focus:border-[#C3110F]/40 pb-0.5 placeholder:text-ink/25"
                      placeholder="e.g. 100"
                    />
                    {lotArea !== "" && lotArea < 1 && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-[#C3110F] text-white text-[9px] font-bold rounded-lg shadow-md whitespace-nowrap z-35 pointer-events-none">
                        Min area is 1 sqm
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#C3110F]" />
                      </div>
                    )}
                  </div>
                  <div className={`bg-black/[0.02] dark:bg-white/[0.02] border rounded-xl p-3 flex flex-col justify-between relative transition-colors ${
                    age !== "" && age > 25 ? "border-[#C3110F]/50 bg-[#C3110F]/[0.02]" : "border-black/5 dark:border-white/5"
                  }`}>
                    <label className="block text-[9px] font-bold text-ink/55 uppercase tracking-[0.15em] mb-1">
                      Property Age (yrs)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={age}
                      onChange={(e) => {
                        if (e.target.value === "") {
                          setAge("");
                        } else {
                          const val = Number(e.target.value);
                          if (val >= 0) setAge(val);
                        }
                      }}
                      className="w-full bg-transparent text-ink text-sm font-bold outline-none border-b border-transparent focus:border-[#C3110F]/40 pb-0.5 placeholder:text-ink/25"
                      placeholder="e.g. 5"
                    />
                    {age !== "" && age > 25 && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-[#C3110F] text-white text-[9px] font-bold rounded-lg shadow-md whitespace-nowrap z-35 pointer-events-none">
                        Max age is 25 years
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#C3110F]" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Footer */}
                <div className="pt-1 flex gap-2">
                  <button
                    onClick={onViewReport}
                    disabled={isInvalid}
                    className="flex-1 bg-[#C3110F] hover:bg-[#a80e0d] disabled:opacity-40 disabled:pointer-events-none text-white py-3 rounded-xl text-sm font-bold transition-all shadow-md shadow-[#C3110F]/20 hover:shadow-lg hover:shadow-[#C3110F]/30 active:scale-[0.99]"
                  >
                    View Full Report →
                  </button>
                  <div className="relative group shrink-0">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${droppedPin.lat},${droppedPin.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-3 bg-black/[0.04] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 hover:bg-black/[0.08] dark:hover:bg-white/[0.08] text-ink rounded-xl text-sm font-bold flex items-center justify-center transition-all active:scale-[0.99] h-full"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                    </a>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-black/95 dark:bg-neutral-800 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-30">
                      Open in Google Maps
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
