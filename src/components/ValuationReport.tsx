"use client";

import dynamic from "next/dynamic";
import NavbarDark from "@/components/NavbarDark";
import {
  ChevronLeft,
  MapPin,
  Download,
  Activity,
  Database,
  Sparkles,
  Coins,
  CheckCircle2,
  Loader2,
  Home,
  LandPlot,
  CalendarDays,
  Radar,
} from "lucide-react";

const MapClientDark = dynamic(() => import("@/components/MapClientDark"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#f5f5f3] dark:bg-[#0f0f0e] flex items-center justify-center min-h-[240px]">
      <div className="w-5 h-5 border-2 border-[#C3110F] border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

// Maps backend property-type codes to display labels.
const PROPERTY_TYPE_LABELS: Record<string, string> = {
  hnl: "House & Lot",
};

export interface ValuationData {
  id: string;
  latitude: number;
  longitude: number;
  scan_area: number;
  area: number;
  lot_area?: number;
  age: number;
  type: string;
  market_value: number;
  zonal_value: number;
  scraped_value: number;
  total_value: number;
  listings_used: number;
  r_squared: number;
  confidence: string;
  status: string;
  created_at: string;
  updated_at?: string;
  error_message?: string;
  street?: string;
  barangay?: string;
  city?: string;
  province?: string;
}

interface ValuationReportProps {
  valuation: ValuationData;
  address: string | null;
  primaryLocation: string;
  secondaryLocation: string;
  onModifyParams: () => void;
  onExportPDF: () => void;
  isExporting: boolean;
  // Recalculate-location section
  hasUpdatedOnce: boolean;
  isUpdatingLocation: boolean;
  provinceOptions: string[];
  cityOptions: string[];
  barangayOptions: string[];
  streetOptions: string[];
  selectedProvince: string;
  selectedCity: string;
  selectedBarangay: string;
  selectedStreet: string;
  onProvinceChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onBarangayChange: (value: string) => void;
  onStreetChange: (value: string) => void;
  onUpdateLocation: () => void;
  // PDF preview modal
  pdfUrl: string | null;
  onDownloadPDF: () => void;
  onClosePreview: () => void;
}

export default function ValuationReport({
  valuation,
  address,
  primaryLocation,
  secondaryLocation,
  onModifyParams,
  onExportPDF,
  isExporting,
  hasUpdatedOnce,
  isUpdatingLocation,
  provinceOptions,
  cityOptions,
  barangayOptions,
  streetOptions,
  selectedProvince,
  selectedCity,
  selectedBarangay,
  selectedStreet,
  onProvinceChange,
  onCityChange,
  onBarangayChange,
  onStreetChange,
  onUpdateLocation,
  pdfUrl,
  onDownloadPDF,
  onClosePreview,
}: ValuationReportProps) {
  const r2Pct = Math.round(valuation.r_squared * 100);
  const gaugeCirc = 2 * Math.PI * 42;
  const gaugeOffset = gaugeCirc * (1 - valuation.r_squared);

  return (
    <div className="min-h-screen bg-[#f5f5f3] dark:bg-[#0f0f0e] text-[#242420] dark:text-white flex flex-col">
      <div className="no-print"><NavbarDark /></div>

      {/* Print-only Header */}
      <div className="hidden print:block text-center mb-6 border-b border-black/10 pb-4">
        <h1 className="text-xl font-bold text-[#242420] uppercase tracking-wider">Valyou Property Report</h1>
        {address && <p className="text-sm font-bold text-[#242420] mt-1 max-w-2xl mx-auto">{address}</p>}
        <p className="text-xs text-[#242420]/60 mt-1">Generated: {new Date(valuation.created_at).toLocaleDateString()} · Coordinates: {valuation.latitude.toFixed(5)}, {valuation.longitude.toFixed(5)}</p>
      </div>

      {/* Top Report Bar */}
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 border-b border-black/[0.06] dark:border-white/[0.06] no-print">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#242420]/50 dark:text-white/50 mb-1">
            <button
              onClick={onModifyParams}
              className="hover:text-[#242420] dark:hover:text-white font-medium flex items-center gap-0.5"
            >
              <ChevronLeft size={13} /> Edit parameters
            </button>
            <span>/</span>
            <span>Valuation Report</span>
          </div>
          <div className="flex flex-col gap-1 mt-1">
            <h1 className="text-xl font-bold text-[#242420] dark:text-white flex items-center gap-2">
              <MapPin size={16} className="text-[#C3110F] shrink-0" />
              <span className="truncate max-w-md md:max-w-xl select-all">
                {primaryLocation}
              </span>
            </h1>
            {secondaryLocation && (
              <p className="text-xs text-[#242420]/50 dark:text-white/50 pl-6 font-medium leading-none">
                {secondaryLocation}
              </p>
            )}
            <div className="pl-6 mt-1.5">
              <p className="text-[10px] text-[#C3110F] dark:text-[#E52E2C] font-mono leading-none bg-black/[0.04] dark:bg-white/[0.04] px-1.5 py-0.5 rounded w-fit select-all">
                {valuation.latitude.toFixed(5)}, {valuation.longitude.toFixed(5)}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onExportPDF}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 bg-[#C3110F] hover:bg-[#a80e0d] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#C3110F]/20 hover:shadow-lg transition-all"
        >
          {isExporting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download size={14} /> Export Report PDF
            </>
          )}
        </button>
      </div>

      {/* Report Content Grid */}
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 sm:space-y-8">

        {/* Main Pricing Banner */}
        <div className="bg-white dark:bg-[#141413] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl shadow-sm relative overflow-hidden">
          {/* Embedded Wide Map */}
          <div className="h-[280px] w-full border-b border-black/[0.06] dark:border-white/[0.06] relative">
            <MapClientDark
              droppedPin={{ lat: valuation.latitude, lng: valuation.longitude }}
              radiusKm={valuation.scan_area}
              interactive={false}
            />
            <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-[#141413]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-black/5 dark:border-white/5 text-[10px] font-bold uppercase tracking-wider text-[#242420]/75 dark:text-white/75 shadow-md no-print">
              Target Location Area
            </div>
          </div>

          <div className="p-6 md:p-8 relative">
            <div className="text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-[10px] font-bold text-[#242420]/45 dark:text-white/45 uppercase tracking-[0.2em] mb-2">
                  Estimated Fair Market Value
                </p>
                <h2 className="text-4xl md:text-5xl font-black text-[#242420] dark:text-white tabular-nums tracking-tight leading-none">
                  ₱ {valuation.total_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </h2>
                <p className="text-xs text-[#242420]/50 dark:text-white/50 mt-2 font-medium">
                  ₱ {Math.round(valuation.market_value).toLocaleString()} per sqm · {valuation.area} sqm Lot Area
                </p>
              </div>

              <div className="flex flex-col items-center md:items-end justify-center shrink-0 border-t md:border-t-0 md:border-l border-black/[0.06] dark:border-white/[0.06] pt-4 md:pt-0 md:pl-8">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-sm bg-emerald-500/[0.08] px-3.5 py-1.5 rounded-full w-fit">
                  <Sparkles size={14} />
                  {valuation.confidence} Confidence
                </div>
                <p className="text-[10px] text-[#242420]/45 dark:text-white/45 mt-2 font-bold uppercase tracking-wider">
                  Model reliability rating
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Three-Way Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Market Value Card */}
          <div className="bg-white dark:bg-[#141413] border border-[#C3110F]/20 dark:border-[#C3110F]/30 rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#C3110F]/5 rounded-bl-full flex items-center justify-center no-print">
              <Sparkles size={16} className="text-[#C3110F] translate-x-1.5 -translate-y-1.5" />
            </div>
            <p className="text-[9px] font-bold text-[#C3110F] uppercase tracking-wider mb-2">Regression Estimate</p>
            <h3 className="text-xl font-bold text-[#242420] dark:text-white">₱{valuation.total_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
            <p className="text-xs text-[#242420]/50 dark:text-white/50 mt-1 font-medium">Computed fair value rate</p>
            <div className="border-t border-black/[0.04] dark:border-white/[0.04] mt-4 pt-3 text-[10px] text-[#242420]/45 dark:text-white/45 leading-relaxed">
              Standard rate: <strong className="text-[#242420] dark:text-white font-mono">₱{Math.round(valuation.market_value).toLocaleString()}/sqm</strong>. Derived using multivariate spatial regression.
            </div>
          </div>

          {/* BIR Zonal Value Card */}
          <div className="bg-white dark:bg-[#141413] border border-blue-500/20 dark:border-blue-500/30 rounded-xl p-5 shadow-sm relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-full flex items-center justify-center no-print">
              <Coins size={16} className="text-blue-500 translate-x-1.5 -translate-y-1.5" />
            </div>
            <p className="text-[9px] font-bold text-blue-500 uppercase tracking-wider mb-2">BIR Zonal Value</p>
            <h3 className="text-xl font-bold text-[#242420] dark:text-white">₱{(valuation.zonal_value * valuation.area).toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
            <p className="text-xs text-[#242420]/50 dark:text-white/50 mt-1 font-medium">Official statutory reference</p>
            <div className="border-t border-black/[0.04] dark:border-white/[0.04] mt-4 pt-3 text-[10px] text-[#242420]/45 dark:text-white/45 leading-relaxed">
              Standard rate: <strong className="text-[#242420] dark:text-white font-mono">₱{Math.round(valuation.zonal_value).toLocaleString()}/sqm</strong>. Used as capital gains tax baseline.
            </div>
          </div>

          {/* Scraped Listing Value Card */}
          <div className="bg-white dark:bg-[#141413] border border-orange-500/20 dark:border-orange-500/30 rounded-xl p-5 shadow-sm relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/5 rounded-bl-full flex items-center justify-center no-print">
              <Database size={16} className="text-orange-500 translate-x-1.5 -translate-y-1.5" />
            </div>
            <p className="text-[9px] font-bold text-orange-500 uppercase tracking-wider mb-2">Avg Market Listings</p>
            <h3 className="text-xl font-bold text-[#242420] dark:text-white">₱{(valuation.scraped_value * valuation.area).toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
            <p className="text-xs text-[#242420]/50 dark:text-white/50 mt-1 font-medium">Active listings baseline</p>
            <div className="border-t border-black/[0.04] dark:border-white/[0.04] mt-4 pt-3 text-[10px] text-[#242420]/45 dark:text-white/45 leading-relaxed">
              Standard rate: <strong className="text-[#242420] dark:text-white font-mono">₱{Math.round(valuation.scraped_value).toLocaleString()}/sqm</strong>. Average price extracted from active comparisons.
            </div>
          </div>
        </div>

        {/* Property Profile & Model Fit Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Property Profile — icon tiles */}
          <div className="bg-white dark:bg-[#141413] border border-black/[0.06] dark:border-white/[0.06] rounded-xl p-5 sm:p-6 shadow-sm">
            <h3 className="text-xs font-bold text-[#242420] dark:text-white uppercase tracking-[0.15em] mb-4">
              Property Profile
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Home, label: "Property Type", value: PROPERTY_TYPE_LABELS[valuation.type] ?? valuation.type },
                { icon: LandPlot, label: "Lot Area", value: `${valuation.area} sqm` },
                {
                  icon: CalendarDays,
                  label: "Property Age",
                  value: `${valuation.age} ${valuation.age === 1 ? "year" : "years"}`,
                },
                { icon: Radar, label: "Search Radius", value: `${valuation.scan_area} km` },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-xl p-3.5"
                >
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#C3110F]/[0.08] flex items-center justify-center shrink-0">
                      <Icon size={14} className="text-[#C3110F] dark:text-[#E52E2C]" />
                    </div>
                    <span className="text-[10px] font-bold text-[#242420]/55 dark:text-white/55 uppercase tracking-wider leading-tight">
                      {label}
                    </span>
                  </div>
                  <p className="text-base font-bold text-[#242420] dark:text-white tabular-nums">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Valuation Reliability — radial gauge + stats */}
          <div className="bg-white dark:bg-[#141413] border border-black/[0.06] dark:border-white/[0.06] rounded-xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#242420] dark:text-white uppercase tracking-[0.15em] mb-4">
                Valuation Reliability
              </h3>

              <div className="flex items-center gap-5 sm:gap-6">
                {/* R² gauge */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="relative w-28 h-28">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        strokeWidth="9"
                        className="stroke-black/[0.07] dark:stroke-white/10"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        strokeWidth="9"
                        strokeLinecap="round"
                        className="stroke-[#C3110F] dark:stroke-[#E52E2C]"
                        strokeDasharray={gaugeCirc}
                        strokeDashoffset={gaugeOffset}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-black text-[#242420] dark:text-white tabular-nums leading-none">
                        {r2Pct}%
                      </span>
                    </div>
                  </div>
                  <p className="text-[9px] font-bold text-[#242420]/55 dark:text-white/55 uppercase tracking-[0.12em] mt-2">
                    R² Model Fit
                  </p>
                </div>

                {/* Supporting stats */}
                <div className="flex-1 space-y-4 min-w-0">
                  <div>
                    <p className="text-[10px] font-bold text-[#242420]/55 dark:text-white/55 uppercase tracking-wider mb-1">
                      Listings Used
                    </p>
                    <p className="text-xl font-black text-[#242420] dark:text-white tabular-nums leading-none">
                      {valuation.listings_used}
                      <span className="text-xs font-medium text-[#242420]/50 dark:text-white/50 ml-1.5">comparisons</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#242420]/55 dark:text-white/55 uppercase tracking-wider mb-1.5">
                      Confidence
                    </p>
                    <span className="inline-flex items-center gap-1.5 bg-emerald-500/[0.08] text-emerald-600 dark:text-emerald-400 rounded-full px-2.5 py-1 text-xs font-bold">
                      <Sparkles size={12} />
                      {valuation.confidence}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#242420]/55 dark:text-white/55 leading-relaxed mt-5 no-print">
              The R-squared (R²) score represents statistical goodness-of-fit. Ratings above 70% represent excellent alignment with current geographical market trends.
            </p>
          </div>
        </div>

        {/* Recalculate location section */}
        <div className="bg-white dark:bg-[#141413] border border-black/[0.06] dark:border-white/[0.06] rounded-xl p-5 sm:p-6 shadow-sm no-print">
          <h3 className="text-xs font-bold text-[#242420] dark:text-white uppercase tracking-[0.15em] mb-2 flex items-center gap-1.5">
            <Activity size={14} className="text-[#C3110F]" />
            Recalculate Zonal Value
          </h3>
          <p className="text-[11px] text-[#242420]/50 dark:text-white/50 mb-4 leading-normal font-medium">
            Refine the spatial zonal calculations by selecting a specific Province, City, Barangay, and Street.
            <span className="text-[#C3110F] dark:text-[#E52E2C] font-semibold"> (Can only be updated once per valuation)</span>
          </p>

          {hasUpdatedOnce ? (
            <div className="bg-emerald-500/[0.06] border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs px-4 py-3 rounded-lg font-medium flex items-center gap-2">
              <CheckCircle2 size={14} />
              <span>The property location has been updated. Recalculation is locked.</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {/* Province Dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-[#242420]/55 dark:text-white/55 uppercase tracking-wider">Province</label>
                  <select
                    value={selectedProvince}
                    onChange={(e) => onProvinceChange(e.target.value)}
                    className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-[#C3110F]/40 transition-colors text-[#242420] dark:text-white"
                  >
                    <option value="" disabled className="bg-white dark:bg-[#141413]">Select Province...</option>
                    {provinceOptions.map((prov) => (
                      <option key={prov} value={prov} className="bg-white dark:bg-[#141413]">{prov}</option>
                    ))}
                  </select>
                </div>

                {/* City Dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-[#242420]/55 dark:text-white/55 uppercase tracking-wider">City / Municipality</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => onCityChange(e.target.value)}
                    disabled={!selectedProvince}
                    className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-[#C3110F]/40 transition-colors text-[#242420] dark:text-white disabled:opacity-40"
                  >
                    <option value="" disabled className="bg-white dark:bg-[#141413]">Select City...</option>
                    {cityOptions.map((city) => (
                      <option key={city} value={city} className="bg-white dark:bg-[#141413]">{city}</option>
                    ))}
                  </select>
                </div>

                {/* Barangay Dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-[#242420]/55 dark:text-white/55 uppercase tracking-wider">Barangay</label>
                  <select
                    value={selectedBarangay}
                    onChange={(e) => onBarangayChange(e.target.value)}
                    disabled={!selectedCity}
                    className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-[#C3110F]/40 transition-colors text-[#242420] dark:text-white disabled:opacity-40"
                  >
                    <option value="" disabled className="bg-white dark:bg-[#141413]">Select Barangay...</option>
                    {barangayOptions.map((brgy) => (
                      <option key={brgy} value={brgy} className="bg-white dark:bg-[#141413]">{brgy}</option>
                    ))}
                  </select>
                </div>

                {/* Street Dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-[#242420]/55 dark:text-white/55 uppercase tracking-wider">Street</label>
                  <select
                    value={selectedStreet}
                    onChange={(e) => onStreetChange(e.target.value)}
                    disabled={!selectedBarangay}
                    className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-[#C3110F]/40 transition-colors text-[#242420] dark:text-white disabled:opacity-40"
                  >
                    <option value="" disabled className="bg-white dark:bg-[#141413]">Select Street...</option>
                    {streetOptions.map((str) => (
                      <option key={str} value={str} className="bg-white dark:bg-[#141413]">{str}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={onUpdateLocation}
                  disabled={!selectedProvince || !selectedCity || !selectedBarangay || isUpdatingLocation}
                  className="bg-[#C3110F] hover:bg-[#a80e0d] disabled:opacity-40 disabled:pointer-events-none text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#C3110F]/15 hover:shadow-lg active:scale-[0.99] flex items-center gap-1.5"
                >
                  {isUpdatingLocation ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      Recalculating...
                    </>
                  ) : (
                    "Update & Recalculate"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* PDF Report Preview Modal */}
        {pdfUrl && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#141413] border border-black/10 dark:border-white/10 rounded-2xl w-full max-w-4xl h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01]">
                <div className="flex items-center gap-2">
                  <Download className="text-[#C3110F]" size={16} />
                  <h3 className="text-sm font-bold text-[#242420] dark:text-white uppercase tracking-wider">
                    Report PDF Preview
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={onDownloadPDF}
                    className="flex items-center gap-1.5 bg-[#C3110F] hover:bg-[#a80e0d] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#C3110F]/15 active:scale-[0.98]"
                  >
                    <Download size={13} />
                    Download PDF
                  </button>
                  <button
                    onClick={onClosePreview}
                    className="text-xs font-bold text-[#242420]/50 hover:text-[#242420] dark:text-white/50 dark:hover:text-white px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                  >
                    Close Preview
                  </button>
                </div>
              </div>

              {/* Modal Body (Embed PDF) */}
              <div className="flex-1 bg-neutral-100 dark:bg-neutral-900 relative">
                <iframe
                  src={pdfUrl}
                  className="w-full h-full border-0"
                  title="Valuation Report PDF Preview"
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
