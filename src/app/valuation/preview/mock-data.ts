import type { ValuationData } from "@/components/ValuationReport";

// Edit any value below and refresh /valuation/preview to see it reflected in the UI.
// This file is the single source of placeholder data for the preview harness.

export const MOCK_VALUATION: ValuationData = {
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

export const MOCK_ADDRESS =
  "Salinas Drive, Lahug, Cebu City, Central Visayas, Philippines";

export const MOCK_PRIMARY_LOCATION = "Salinas Drive";

export const MOCK_SECONDARY_LOCATION = "Lahug, Cebu City, Central Visayas";
