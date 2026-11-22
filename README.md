# Frontend — Hotel KP website and staff console (Next.js)

Guest website + admin console, exported as static files. Full guide: [`../docs/FRONTEND.md`](../docs/FRONTEND.md).

```bash
npm install
npm run dev            # http://localhost:3000   (the API must run on :4001: use `npm run dev` at the repo root)
npm run check          # typecheck + unit tests
npm run build          # static export → out/   (set NEXT_PUBLIC_API_URL for production)
```

- Replace pictures by overwriting files in [`public/images`](public/images/README.md) (same names).
- Business details: `src/config/site.ts` · static content: `src/content/` · every URL: `src/config/routes.ts` · API client: `src/services/api/`.
- Rooms, prices and availability come from the API, so rooms added in the admin console appear without a rebuild.
