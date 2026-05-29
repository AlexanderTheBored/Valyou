# Valyou — Frontend

Web frontend for Valyou, a property-valuation tool, built with [Next.js 16](https://nextjs.org).

## Getting Started

Run the development server:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

> The app is auth-gated: unauthenticated requests are redirected to `/auth` by `src/proxy.ts` (Next 16's middleware).

## Valuation Report

The valuation report is the property-valuation result page, and the main focus of recent work. Its code is split so the UI is easy to iterate on:

| File | Responsibility |
| --- | --- |
| [`src/components/ValuationReport.tsx`](src/components/ValuationReport.tsx) | **Presentation** — all the report markup, driven entirely by props. Edit this to change how the report looks. |
| [`src/app/valuation/page.tsx`](src/app/valuation/page.tsx) | **Logic** — auth, submitting the valuation, polling the backend, PDF export, and recalculation. |

### Preview the report standalone

To work on the report UI **without logging in or running the backend**, open:

**[http://localhost:3000/valuation/preview](http://localhost:3000/valuation/preview)**

This route ([`src/app/valuation/preview/page.tsx`](src/app/valuation/preview/page.tsx)) renders `ValuationReport` with mock data, so you can style it in isolation. Edit `ValuationReport.tsx` and the page hot-reloads.

- Dev-only — the route returns 404 in production builds.
- The map tiles need network access; **Export PDF** and **Update & Recalculate** are no-ops here (they require the backend).

## Configuration

- `NEXT_PUBLIC_API_URL` (in `.env.local`) — base URL of the backend API.
- This is Next.js 16; some conventions differ from older versions (e.g. middleware lives in `src/proxy.ts`). See [`AGENTS.md`](AGENTS.md).
