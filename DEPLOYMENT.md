# Cloudflare Pages

- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/`

Set this environment variable in Cloudflare Pages:

- `VITE_API_BASE_URL=https://your-render-backend.onrender.com/api`

The file `public/_redirects` is included so client-side routes like `/login` and `/retailer` resolve to `index.html`.
