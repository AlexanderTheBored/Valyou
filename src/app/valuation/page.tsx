"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import NavbarDark from "@/components/NavbarDark";
import { ChevronLeft, AlertCircle, Clock } from "lucide-react";
import ValuationReport, { ValuationData } from "@/components/ValuationReport";

type ValuationStatus = "idle" | "submitting" | "polling" | "completed" | "failed";

function getAuthToken() {
  if (typeof document === "undefined") return null;
  const tokenMatch = document.cookie.match(/(^| )valyou_auth=([^;]*)/);
  return tokenMatch ? tokenMatch[2] : null;
}

function ValuationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract query parameters
  const idParam = searchParams.get("id");
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const radiusParam = searchParams.get("radius");
  const areaParam = searchParams.get("area");
  const ageParam = searchParams.get("age");

  const [status, setStatus] = useState<ValuationStatus>("idle");
  const [valuation, setValuation] = useState<ValuationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const [address, setAddress] = useState<string | null>(null);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);

  const [pollTrigger, setPollTrigger] = useState(0);

  const [provinces, setProvinces] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [barangays, setBarangays] = useState<string[]>([]);
  const [streets, setStreets] = useState<string[]>([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedBarangay, setSelectedBarangay] = useState("");
  const [selectedStreet, setSelectedStreet] = useState("");

  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [hasUpdatedOnce, setHasUpdatedOnce] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const pdfUrlRef = useRef<string | null>(null);
  pdfUrlRef.current = pdfUrl;

  const provinceOptions = useMemo(() => {
    console.log("[Debug] provinceOptions recalculating. selectedProvince:", selectedProvince, "provinces:", provinces);
    if (selectedProvince && !provinces.includes(selectedProvince)) {
      return [selectedProvince, ...provinces];
    }
    return provinces;
  }, [provinces, selectedProvince]);

  const cityOptions = useMemo(() => {
    console.log("[Debug] cityOptions recalculating. selectedCity:", selectedCity, "cities:", cities);
    if (selectedCity && !cities.includes(selectedCity)) {
      return [selectedCity, ...cities];
    }
    return cities;
  }, [cities, selectedCity]);

  const barangayOptions = useMemo(() => {
    console.log("[Debug] barangayOptions recalculating. selectedBarangay:", selectedBarangay, "barangays:", barangays);
    if (selectedBarangay && !barangays.includes(selectedBarangay)) {
      return [selectedBarangay, ...barangays];
    }
    return barangays;
  }, [barangays, selectedBarangay]);

  const streetOptions = useMemo(() => {
    console.log("[Debug] streetOptions recalculating. selectedStreet:", selectedStreet, "streets:", streets);
    if (selectedStreet && !streets.includes(selectedStreet)) {
      return [selectedStreet, ...streets];
    }
    return streets;
  }, [streets, selectedStreet]);

  console.log("[Debug] Render:", {
    selectedProvince,
    selectedCity,
    selectedBarangay,
    selectedStreet,
    provincesCount: provinces.length,
    citiesCount: cities.length,
    barangaysCount: barangays.length,
    streetsCount: streets.length,
    provinceOptions,
    cityOptions,
    barangayOptions,
    streetOptions,
  });

  const initiatedRef = useRef<string | null>(null);
  // Persist interval and mounted flag across re-renders so that a URL silent
  // replace (idParam change) doesn't trigger cleanup that kills an active poll.
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  // Capture initial URL params on mount to preserve them across silent URL updates
  const initialParamsRef = useRef({
    lat: latParam,
    lng: lngParam,
    radius: radiusParam,
    area: areaParam,
    age: ageParam,
  });

  if (latParam && !initialParamsRef.current.lat) {
    initialParamsRef.current = {
      lat: latParam,
      lng: lngParam,
      radius: radiusParam,
      area: areaParam,
      age: ageParam,
    };
  }

  // Status messages for premium loading screen
  const loadingMessages = [
    "Establishing secure connection to Valyou server...",
    "Scanning comparison property coordinates in a 1:1 map search area...",
    "Cross-referencing government Bureau of Internal Revenue (BIR) zonal tables...",
    "Aggregating active and historical area real estate listings...",
    "Calibrating regression coefficients for lot area & age factors...",
    "Generating final valuation report..."
  ];

  // Cycle loading messages for a premium feel
  useEffect(() => {
    if (status !== "polling" && status !== "submitting") return;
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [status]);

  // Reverse geocode valuation coordinates to human-readable address
  useEffect(() => {
    const lat = valuation?.latitude;
    const lng = valuation?.longitude;
    if (!lat || !lng) return;

    let isMounted = true;
    setIsResolvingAddress(true);
    fetch(`/api/geocode?lat=${lat}&lon=${lng}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data && data.display_name) {
          setAddress(data.display_name);
        } else {
          setAddress(null);
        }
      })
      .catch(() => {
        if (isMounted) setAddress(null);
      })
      .finally(() => {
        if (isMounted) setIsResolvingAddress(false);
      });

    return () => {
      isMounted = false;
    };
  }, [valuation?.latitude, valuation?.longitude]);

  // Load recalculated flag from local storage
  useEffect(() => {
    if (valuation?.id) {
      const flag = localStorage.getItem(`valyou_recalculated_${valuation.id}`) === "true";
      setHasUpdatedOnce(flag);
    }
  }, [valuation?.id]);

  // Fetch provinces when valuation completed
  useEffect(() => {
    if (status === "completed" && valuation && !hasUpdatedOnce) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/zonal`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setProvinces(data);
        })
        .catch((err) => console.error("Failed to fetch provinces:", err));
    }
  }, [status, valuation, hasUpdatedOnce]);

  // Autofill dropdowns from current valuation report
  useEffect(() => {
    if (valuation && !selectedProvince && !selectedCity && !selectedBarangay && !selectedStreet) {
      if (valuation.province) setSelectedProvince(valuation.province.toUpperCase().trim());
      if (valuation.city) setSelectedCity(valuation.city.toUpperCase().trim());
      if (valuation.barangay) setSelectedBarangay(valuation.barangay.toUpperCase().trim());
      if (valuation.street) setSelectedStreet(valuation.street.toUpperCase().trim());
    }
  }, [valuation]);

  // Fetch cities when province selected
  useEffect(() => {
    if (!selectedProvince) {
      setCities([]);
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/zonal/${encodeURIComponent(selectedProvince)}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCities(data);
      })
      .catch((err) => console.error("Failed to fetch cities:", err));
  }, [selectedProvince]);

  // Fetch barangays when city selected
  useEffect(() => {
    if (!selectedCity) {
      setBarangays([]);
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/zonal/${encodeURIComponent(selectedProvince)}/${encodeURIComponent(selectedCity)}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBarangays(data);
      })
      .catch((err) => console.error("Failed to fetch barangays:", err));
  }, [selectedProvince, selectedCity]);

  // Fetch streets when barangay selected
  useEffect(() => {
    if (!selectedBarangay) {
      setStreets([]);
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/zonal/${encodeURIComponent(selectedProvince)}/${encodeURIComponent(selectedCity)}/${encodeURIComponent(selectedBarangay)}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setStreets(data);
      })
      .catch((err) => console.error("Failed to fetch streets:", err));
  }, [selectedProvince, selectedCity, selectedBarangay]);

  // Handle location update
  const handleUpdateLocation = async () => {
    if (!valuation?.id) return;
    const token = getAuthToken();
    if (!token) return;

    setIsUpdatingLocation(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/valuations/${valuation.id}/update`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          province: selectedProvince,
          city: selectedCity,
          barangay: selectedBarangay,
          street: selectedStreet
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to update location");
      }

      localStorage.setItem(`valyou_recalculated_${valuation.id}`, "true");
      setHasUpdatedOnce(true);

      // Re-trigger polling
      initiatedRef.current = null;
      setPollTrigger((prev) => prev + 1);

    } catch (err: any) {
      alert(err.message || "An error occurred during recalculation.");
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  // Cascade resets when a higher-level location dropdown changes
  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value);
    setSelectedCity("");
    setSelectedBarangay("");
    setSelectedStreet("");
    setCities([]);
    setBarangays([]);
    setStreets([]);
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    setSelectedBarangay("");
    setSelectedStreet("");
    setBarangays([]);
    setStreets([]);
  };

  const handleBarangayChange = (value: string) => {
    setSelectedBarangay(value);
    setSelectedStreet("");
    setStreets([]);
  };

  // Handle exporting valuation PDF (opens preview modal)
  const handleExportPDF = async () => {
    if (!valuation?.id) return;
    const token = getAuthToken();
    if (!token) return;

    setIsExporting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/valuations/${valuation.id}/report`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to download PDF report");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err: any) {
      alert(err.message || "Failed to download PDF report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const triggerDownload = () => {
    if (!pdfUrl || !valuation?.id) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = `valyou_report_${valuation.id}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleClosePreview = () => {
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  // Format display name for report header
  const [primaryLocation, secondaryLocation] = useMemo(() => {
    if (isResolvingAddress) return ["Resolving address...", ""];
    if (!valuation) return ["", ""];
    if (!address) return [`${valuation.latitude.toFixed(5)}, ${valuation.longitude.toFixed(5)}`, "Coordinates Pinned"];
    const [primary, ...rest] = address.split(", ");
    return [primary, rest.slice(0, 3).join(", ")];
  }, [address, isResolvingAddress, valuation]);

  // Cleanup poll and PDF previews on component unmount only
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      if (pdfUrlRef.current) {
        window.URL.revokeObjectURL(pdfUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      // Not logged in: redirect to auth
      router.push(`/auth?returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    const requestKey = idParam || `${latParam}-${lngParam}-${radiusParam}-${areaParam}-${ageParam}`;
    if (initiatedRef.current === requestKey) {
      // Already handling this request (e.g. re-render after silent URL replace)
      return;
    }
    initiatedRef.current = requestKey;

    const startPolling = (valuationId: string) => {
      if (!isMountedRef.current) return;
      setStatus("polling");
      // Update URL to ?id=valuationId silently — this will re-trigger this effect,
      // but the initiatedRef guard above will short-circuit it harmlessly.
      const newUrl = `${window.location.pathname}?id=${valuationId}`;
      window.history.replaceState(null, "", newUrl);
      // Update the key so the re-triggered effect bails out correctly
      initiatedRef.current = valuationId;

      const fetchStatus = async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/valuations/${valuationId}`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          if (!isMountedRef.current) return;
          if (!res.ok) {
            if (res.status === 401) {
              router.push("/auth");
              return;
            }
            throw new Error(`Valuation failed with status ${res.status}`);
          }
          const data: ValuationData = await res.json();
          if (!isMountedRef.current) return;
          if (data.lot_area && !data.area) {
            data.area = data.lot_area;
          }
          setValuation(data); // Store data to make parameters/progress details accessible immediately

          if (data.status === "completed" || data.status === "done") {
            setStatus("completed");
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
          } else if (data.status === "failed") {
            setErrorMsg(data.error_message || "Valuation processing failed on the server.");
            setStatus("failed");
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
          }
        } catch (err: any) {
          if (!isMountedRef.current) return;
          setErrorMsg(err.message || "Failed to retrieve valuation status.");
          setStatus("failed");
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        }
      };

      // Poll every 1.5 seconds
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      fetchStatus();
      pollIntervalRef.current = setInterval(fetchStatus, 1500);
    };

    const initiateValuation = async () => {
      // If we already have an ID in the URL, go straight to polling/fetching it
      if (idParam) {
        startPolling(idParam);
        return;
      }

      // If we don't have an ID, we need the parameters to start one
      if (!latParam || !lngParam || !radiusParam || !areaParam || !ageParam) {
        setErrorMsg("Missing required valuation parameters. Please drop a pin on the map first.");
        setStatus("failed");
        return;
      }

      if (!isMountedRef.current) return;
      setStatus("submitting");
      try {
        const body = {
          latitude: parseFloat(latParam),
          longitude: parseFloat(lngParam),
          scan_area: parseFloat(radiusParam),
          lot_area: parseFloat(areaParam),
          age: parseFloat(ageParam),
          type: "hnl"
        };

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/valuations/new`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        });

        if (!isMountedRef.current) return;

        if (!res.ok) {
          if (res.status === 401) {
            router.push("/auth");
            return;
          }
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Server returned error status ${res.status}`);
        }

        const data = await res.json();
        if (!isMountedRef.current) return;

        if (data.id) {
          startPolling(data.id);
        } else {
          throw new Error("Invalid response format from server: missing valuation ID.");
        }
      } catch (err: any) {
        if (!isMountedRef.current) return;
        setErrorMsg(err.message || "Failed to start valuation process.");
        setStatus("failed");
      }
    };

    initiateValuation();
    // Note: no cleanup here — interval lifetime is managed by pollIntervalRef
    // and the dedicated unmount effect above.
  }, [idParam, latParam, lngParam, radiusParam, areaParam, ageParam, router, pollTrigger]);

  const handleModifyParams = () => {
    // Navigate back to map prefilled
    const lat = valuation?.latitude || latParam || "10.3157";
    const lng = valuation?.longitude || lngParam || "123.8854";
    const rad = valuation?.scan_area || radiusParam || "1";
    const area = valuation?.area || areaParam || "";
    const age = valuation?.age || ageParam || "";
    router.push(`/map?lat=${lat}&lng=${lng}&radius=${rad}&area=${area}&age=${age}`);
  };

  // 1. Loading/Polling UI
  if (status === "submitting" || status === "polling") {
    const displayArea = areaParam || valuation?.area || valuation?.lot_area || initialParamsRef.current.area || "";
    const displayAge = ageParam || valuation?.age || initialParamsRef.current.age || "";
    const displayRadius = radiusParam || valuation?.scan_area || initialParamsRef.current.radius || "";
    const displayLat = parseFloat(latParam || valuation?.latitude?.toString() || initialParamsRef.current.lat || "0");
    const displayLng = parseFloat(lngParam || valuation?.longitude?.toString() || initialParamsRef.current.lng || "0");

    return (
      <div className="min-h-screen bg-[#f5f5f3] dark:bg-[#0f0f0e] text-[#242420] dark:text-white flex flex-col">
        <NavbarDark />
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          {/* Radar Scanning Ring */}
          <div className="relative w-28 h-28 mb-8 flex items-center justify-center select-none">
            <div className="absolute inset-0 rounded-full border-2 border-[#C3110F]/20 animate-ping" />
            <div className="absolute inset-2 rounded-full border border-[#C3110F]/45 animate-pulse" />
            <div className="w-16 h-16 rounded-full bg-[#C3110F]/10 flex items-center justify-center">
              <Clock className="w-8 h-8 text-[#C3110F] animate-spin duration-3000" />
            </div>
          </div>

          {/* Status Processing Box */}
          <div className="w-full max-w-md bg-white/90 dark:bg-[#141413]/90 backdrop-blur-md border border-black/[0.08] dark:border-white/[0.08] rounded-2xl p-6 shadow-2xl text-center">
            <h3 className="text-sm font-bold text-[#242420] dark:text-white uppercase tracking-widest mb-2">
              Computing Fair Value
            </h3>
            <p className="text-sm text-[#242420]/65 dark:text-white/65 min-h-[48px] flex items-center justify-center font-medium px-2 transition-all">
              {loadingMessages[loadingStep]}
            </p>

            {/* Loader bar */}
            <div className="w-full h-1 bg-black/[0.06] dark:bg-white/[0.06] rounded-full overflow-hidden mt-4">
              <div
                className="h-full bg-[#C3110F] rounded-full transition-all duration-[2500ms] ease-in-out"
                style={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}
              />
            </div>

            <div className="mt-5 text-[10px] text-[#242420]/45 dark:text-white/45 font-mono tracking-wider uppercase leading-relaxed border-t border-black/[0.05] dark:border-white/[0.05] pt-4">
              Lot Area: {displayArea} sqm · Property Age: {displayAge} yrs
              <br />
              Scan Radius: {displayRadius}km · Lat: {displayLat.toFixed(4)}, Lng: {displayLng.toFixed(4)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Error UI
  if (status === "failed") {
    return (
      <div className="min-h-screen bg-[#f5f5f3] dark:bg-[#0f0f0e] text-[#242420] dark:text-white flex flex-col">
        <NavbarDark />
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-[#C3110F]/10 flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-[#C3110F]" />
          </div>
          <h3 className="text-lg font-bold text-[#242420] dark:text-white mb-2">
            Valuation Failed
          </h3>
          <p className="text-sm text-[#242420]/65 dark:text-white/65 max-w-sm mb-6 leading-relaxed">
            {errorMsg || "An error occurred while compiling your valuation report. Please try again."}
          </p>
          <button
            onClick={handleModifyParams}
            className="bg-[#C3110F] hover:bg-[#a80e0d] text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md shadow-[#C3110F]/20 active:scale-[0.98] transition-all flex items-center gap-1.5"
          >
            <ChevronLeft size={16} /> Return to Map & Adjust
          </button>
        </div>
      </div>
    );
  }

  // 3. Completed Valuation Report
  if (status === "completed" && valuation) {
    return (
      <ValuationReport
        valuation={valuation}
        address={address}
        primaryLocation={primaryLocation}
        secondaryLocation={secondaryLocation}
        onModifyParams={handleModifyParams}
        onExportPDF={handleExportPDF}
        isExporting={isExporting}
        hasUpdatedOnce={hasUpdatedOnce}
        isUpdatingLocation={isUpdatingLocation}
        provinceOptions={provinceOptions}
        cityOptions={cityOptions}
        barangayOptions={barangayOptions}
        streetOptions={streetOptions}
        selectedProvince={selectedProvince}
        selectedCity={selectedCity}
        selectedBarangay={selectedBarangay}
        selectedStreet={selectedStreet}
        onProvinceChange={handleProvinceChange}
        onCityChange={handleCityChange}
        onBarangayChange={handleBarangayChange}
        onStreetChange={setSelectedStreet}
        onUpdateLocation={handleUpdateLocation}
        pdfUrl={pdfUrl}
        onDownloadPDF={triggerDownload}
        onClosePreview={handleClosePreview}
      />
    );
  }

  return null;
}

export default function ValuationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f5f5f3] dark:bg-[#0f0f0e] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#C3110F] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ValuationContent />
    </Suspense>
  );
}
