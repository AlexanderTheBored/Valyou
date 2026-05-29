import { NextRequest } from "next/server";

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    city?: string;
    district?: string;
    state?: string;
    country?: string;
    type?: string;
  };
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  const lat = request.nextUrl.searchParams.get("lat");
  const lon = request.nextUrl.searchParams.get("lon");

  if (lat && lon) {
    const url = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "ValYou/1.0" },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) return Response.json(null);
      const data = await res.json();
      const feature = data.features?.[0];
      if (!feature) return Response.json(null);

      const p = feature.properties;
      const parts = [p.name, p.district, p.city, p.state, p.country].filter(
        (v, i, arr) => v && arr.indexOf(v) === i
      );
      return Response.json({ display_name: parts.join(", ") });
    } catch {
      clearTimeout(timeoutId);
      return Response.json(null);
    }
  }

  if (!q || q.trim().length < 2) return Response.json([]);

  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&countrycode=ph&limit=6&lang=en`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "ValYou/1.0" },
      next: { revalidate: 60 },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) return Response.json([]);

    const data = await res.json();

    const results = (data.features ?? []).map((f: PhotonFeature) => {
      const [lon, lat] = f.geometry.coordinates;
      const p = f.properties;
      const parts = [p.name, p.district, p.city, p.state, p.country].filter(
        (v, i, arr) => v && arr.indexOf(v) === i
      );
      return {
        lat: String(lat),
        lon: String(lon),
        display_name: parts.join(", "),
        type: p.type ?? "place",
        importance: 0.5,
      };
    });

    return Response.json(results);
  } catch {
    clearTimeout(timeoutId);
    return Response.json([]);
  }
}
