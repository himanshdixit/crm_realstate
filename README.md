# EstateFlow deployment environment variables

This guide separates the browser-safe Vercel configuration from the secret Render configuration. The active local files, `frontend/.env.local` and `backend/.env`, are intentionally unchanged.

## Vercel frontend

1. Create/import a Vercel project with **Root Directory** set to `frontend`.
2. Open **Settings → Environment Variables**.
3. Copy the variables from `frontend/.env.vercel.example`.
4. Replace `YOUR-RENDER-SERVICE` with the public Render service name.
5. Add the values to **Production**. For Preview, use an intentionally configured staging backend rather than the production API.
6. Redeploy after changing any `NEXT_PUBLIC_*` value because these values are compiled into the frontend bundle.

Only browser-safe values belong in Vercel. Never put JWT, MongoDB, SMTP, Cloudinary, or administrator secrets in `NEXT_PUBLIC_*` variables.

## Render backend

1. Create a Render Web Service with **Root Directory** set to `backend`.
2. Use **Build Command**: `npm ci`.
3. Use **Start Command**: `npm start`.
4. Use **Health Check Path**: `/api/v1/health/ready`.
5. Open **Environment** and copy all required variables from `backend/.env.render.example`.
6. Replace every `CHANGE_ME` value. Set both `FRONTEND_URL` and `CORS_ORIGINS` to the exact Vercel production origin.
7. Run `npm run seed` once against production. Run `npm run seed:admin` only when the initial Super Admin is needed, then rotate or remove the bootstrap values.

## Required URL pairing

```text
Vercel NEXT_PUBLIC_API_URL=https://YOUR-RENDER-SERVICE.onrender.com/api/v1
Render FRONTEND_URL=https://YOUR-VERCEL-PROJECT.vercel.app
Render CORS_ORIGINS=https://YOUR-VERCEL-PROJECT.vercel.app
```

Because `vercel.app` and `onrender.com` are cross-site, the provided production template uses `COOKIE_SECURE=true` and `COOKIE_SAME_SITE=none`. `COOKIE_DOMAIN` stays blank so Render issues a host-only cookie.

## MongoDB Atlas

Keep the connection server and database name separate:

```text
MONGODB_URL=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/?retryWrites=true&w=majority
DB_NAME=Codex_realstate_db
```

URL-encode special characters in the Atlas username or password. Allow Render to reach Atlas using the narrowest network rule supported by the selected Render plan.

## Verification

Before deployment, production values can be checked with:

```powershell
cd backend
npm run deploy:check

cd ../frontend
npm run deploy:check
```

After deployment, verify backend readiness, registration email, login, refresh-token rotation, logout, and one authenticated API request from the Vercel origin.
