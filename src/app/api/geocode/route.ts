import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q || q.trim().length < 2) return Response.json([]);

  const url =
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&countrycodes=ph&limit=6&addressdetails=1`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "ValYou/1.0 (Philippine real estate valuation; valyou-app@example.com)",
      "Accept-Language": "en",
    },
    next: { revalidate: 300 },
  });

  if (!res.ok) return Response.json([]);

  const data = await res.json();
  return Response.json(data);
}
