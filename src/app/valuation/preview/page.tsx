"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import ValuationReport from "@/components/ValuationReport";
import {
  MOCK_VALUATION,
  MOCK_ADDRESS,
  MOCK_PRIMARY_LOCATION,
  MOCK_SECONDARY_LOCATION,
} from "./mock-data";

// Standalone harness for iterating on the report UI without auth or a backend.
// Placeholder values live in ./mock-data.ts — edit there to tweak what the preview shows.

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
      address={MOCK_ADDRESS}
      primaryLocation={MOCK_PRIMARY_LOCATION}
      secondaryLocation={MOCK_SECONDARY_LOCATION}
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
