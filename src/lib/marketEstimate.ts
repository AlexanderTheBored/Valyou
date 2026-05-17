function seed(lat: number, lng: number, salt: number) {
  return Math.abs(Math.sin(lat * (12.9898 + salt) + lng * (78.233 + salt)) * 43758.5453) % 1;
}

export interface AreaEstimate {
  pricePerSqm: number;
  avg: number;
  low: number;
  high: number;
  confidence: { label: string; pct: number };
  dataPoints: number;
  activity: "Hot" | "Active" | "Moderate";
  byType: { House: number; Condo: number; Land: number };
}

export function getAreaEstimate(lat: number, lng: number, radiusKm: number): AreaEstimate {
  const s1 = seed(lat, lng, 0);
  const s2 = seed(lat, lng, 17);
  const s3 = seed(lat, lng, 43);

  const pricePerSqm = Math.round(22_000 + s1 * 73_000);
  const variance    = 0.06 + radiusKm * 0.028;
  const avg  = pricePerSqm * 95;
  const low  = Math.round(avg * (1 - variance));
  const high = Math.round(avg * (1 + variance));

  const confidence =
    radiusKm <= 2 ? { label: "High",     pct: 88 } :
    radiusKm <= 3 ? { label: "High",     pct: 80 } :
    radiusKm <= 5 ? { label: "Moderate", pct: 66 } :
                    { label: "Broad",    pct: 50 };

  const dataPoints = Math.round(12 + s1 * 60 + radiusKm * 8);
  const actSeed    = s3;
  const activity: "Hot" | "Active" | "Moderate" =
    actSeed > 0.66 ? "Hot" : actSeed > 0.33 ? "Active" : "Moderate";

  const byType = {
    House: Math.round(pricePerSqm * (0.85 + s2 * 0.25)),
    Condo: Math.round(pricePerSqm * (1.0  + s3 * 0.55)),
    Land:  Math.round(pricePerSqm * (0.38 + s1 * 0.28)),
  };

  return { pricePerSqm, avg, low, high, confidence, dataPoints, activity, byType };
}
