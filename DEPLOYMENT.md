# Vercel

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
- Root directory: `./`

Set this environment variable in Vercel:

- `VITE_API_BASE_URL=https://your-render-backend.onrender.com/api`

The file `vercel.json` is included so client-side routes like `/login` and `/retailer` resolve to `index.html` on Vercel.
