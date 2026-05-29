"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import ValuationReport, { ValuationData } from "@/components/ValuationReport";

// Standalone harness for iterating on the report UI without auth or a backend.
// Edit ValuationReport.tsx and refresh /valuation/preview to see changes live.
const MOCK_VALUATION: ValuationData = {
  id: "preview",
  latitude: 10.3157,
  longitude: 123.8854,
  scan_area: 1,
  area: 150,
  age: 5,
  type: "hnl",
  market_value: 55000,
  zonal_value: 12000,
  scraped_value: 60000,
  total_value: 8250000,
  listings_used: 24,
  r_squared: 0.82,
  confidence: "High",
  status: "completed",
  created_at: new Date().toISOString(),
  province: "CEBU",
  city: "CEBU CITY",
  barangay: "LAHUG",
  street: "SALINAS DRIVE",
};

export default function ValuationPreviewPage() {
  const [selectedProvince, setSelectedProvince] = useState(MOCK_VALUATION.province ?? "");
  const [selectedCity, setSelectedCity] = useState(MOCK_VALUATION.city ?? "");
  const [selectedBarangay, setSelectedBarangay] = useState(MOCK_VALUATION.barangay ?? "");
  const [selectedStreet, setSelectedStreet] = useState(MOCK_VALUATION.street ?? "");

  // Dev-only harness: hide this route entirely in production builds.
  if (process.env.NODE_ENV !== "development") notFound();

  const noop = () => {};

  return (
    <ValuationReport
      valuation={MOCK_VALUATION}
      address="Salinas Drive, Lahug, Cebu City, Central Visayas, Philippines"
      primaryLocation="Salinas Drive"
      secondaryLocation="Lahug, Cebu City, Central Visayas"
      onModifyParams={noop}
      onExportPDF={noop}
      isExporting={false}
      hasUpdatedOnce={false}
      isUpdatingLocation={false}
      provinceOptions={[MOCK_VALUATION.province!]}
      cityOptions={[MOCK_VALUATION.city!]}
      barangayOptions={[MOCK_VALUATION.barangay!]}
      streetOptions={[MOCK_VALUATION.street!]}
      selectedProvince={selectedProvince}
      selectedCity={selectedCity}
      selectedBarangay={selectedBarangay}
      selectedStreet={selectedStreet}
      onProvinceChange={setSelectedProvince}
      onCityChange={setSelectedCity}
      onBarangayChange={setSelectedBarangay}
      onStreetChange={setSelectedStreet}
      onUpdateLocation={noop}
      pdfUrl={null}
      onDownloadPDF={noop}
      onClosePreview={noop}
    />
  );
}
