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
  if (!q || q.trim().length < 2) return Response.json([]);

  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&countrycode=ph&limit=6&lang=en`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "ValYou/1.0" },
      next: { revalidate: 60 },
    });

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
    return Response.json([]);
  }
}
