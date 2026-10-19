# Phase 10 — Production Deployment

## Status

Production deployment configuration and runbooks are complete. No external deployment has been executed because this workspace has no Git repository, provider accounts, production domains, Atlas cluster, or deployment credentials.

## Selected platform

| Layer | Platform | Deployment unit |
|---|---|---|
| Frontend | Vercel | Next.js project rooted at `frontend/` |
| Backend | Render | Image-backed web service using an immutable GHCR digest |
| Database | MongoDB Atlas | Dedicated production cluster with TLS |
| Media | Cloudinary | Production cloud/folder credentials |
| Email | SMTP provider | TLS-authenticated transactional sender |

The browser calls the public Render API directly. Authentication uses secure HTTP-only cookies, so the exact Vercel production origin must be allowlisted by the backend.

## 1. Domain plan

Use stable HTTPS names before configuring cookies and CORS:

```text
Application: https://crm.your-domain.example
API:         https://api.crm.your-domain.example/api/v1
```

For subdomains of the same parent domain, use secure cookies and choose `SameSite=lax` unless the final browser topology requires cross-site cookies. The default Vercel (`vercel.app`) and Render (`onrender.com`) domains are cross-site, so use `SameSite=none`, keep `COOKIE_SECURE=true`, and verify browser third-party-cookie constraints.

## 2. MongoDB Atlas

1. Create a dedicated production project and cluster.
2. Create a least-privilege application database user; do not use an Atlas owner account.
3. Allow network access only from Render's documented outbound ranges or private connectivity. Do not use `0.0.0.0/0` for normal production operation.
4. Enable backups, point-in-time recovery where supported, alerts, and encryption.
5. Store the `mongodb+srv://` server URL only as Render's secret `MONGODB_URL`, and configure `DB_NAME` separately.
6. Test backup restoration before launch.

## 3. GHCR and Render

Create an image-backed Render web service whose image repository exactly matches:

```text
ghcr.io/<github-owner>/estateflow-backend
```

If the package is private, add a read-only GHCR credential in Render. Configure:

- Port: `5000`
- Health check: `/api/v1/health/ready`
- Pre-deploy command: `npm run deploy:check && npm run db:indexes && npm run seed`
- Auto-deploy: disabled, because the protected GitHub release workflow controls deployment
- Minimum instances: select a non-sleeping production plan

Render environment secrets:

```text
NODE_ENV=production
PORT=5000
API_PREFIX=/api/v1
MONGODB_URL=<Atlas SRV server URL without a database name>
DB_NAME=Codex_realstate_db
CORS_ORIGINS=https://crm.your-domain.example
FRONTEND_URL=https://crm.your-domain.example
TRUST_PROXY=1
ACCESS_TOKEN_SECRET=<independent random secret, 32+ characters>
REFRESH_TOKEN_SECRET=<different independent random secret, 32+ characters>
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
SMTP_HOST=<provider host>
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<provider user>
SMTP_PASSWORD=<provider secret>
SMTP_FROM=<verified sender>
ADMIN_EMAIL=<controlled bootstrap account>
ADMIN_PASSWORD=<one-time high-entropy password>
```

Also copy rate limits, token TTLs, bcrypt rounds, and email-token TTLs from `backend/.env.example` when values need to differ from safe defaults.

For a copy-ready, grouped Render variable list, use `backend/.env.render.example`. The corresponding Vercel list is `frontend/.env.vercel.example`.

The pre-deploy command validates production settings before traffic changes and runs the idempotent role/permission seed. Rotate the bootstrap password immediately after first login.

## 4. Vercel

Import the Git repository and configure:

- Root directory: `frontend`
- Framework: Next.js
- Install command: `npm ci`
- Build command: `npm run build`
- Node.js: 22
- Production branch: `main`

Production environment variables:

```text
NEXT_PUBLIC_APP_NAME=EstateFlow
NEXT_PUBLIC_API_URL=https://api.crm.your-domain.example/api/v1
NEXT_PUBLIC_DEFAULT_LOCALE=en
NEXT_PUBLIC_DEFAULT_TIMEZONE=Asia/Kolkata
```

These variables are public and compiled into the browser bundle. Never put secrets in a `NEXT_PUBLIC_*` variable. `frontend/vercel.json` preserves deterministic install/build behavior.

## 5. GitHub production environment

Configure the secrets and variables listed in `PHASE-9-CI-CD.md`. Require reviewer approval, restrict the environment to semantic version tags, and configure branch protection before issuing a release.

## 6. First release

1. Verify CI and CodeQL on `main`.
2. Verify Atlas backup, network access, Render secrets, domains, TLS, SMTP sender, and Vercel variables.
3. Create an annotated semantic version tag from the approved commit.
4. Push the tag to start the protected release workflow.
5. Approve the GitHub `production` environment after reviewing the image digest and scan.
6. The workflow deploys Render, waits for its deployment to become `live`, deploys Vercel, and runs production smoke tests.
7. Log in with the bootstrap administrator, rotate its password, verify email delivery, then test role restrictions with a non-admin account.

Example release commands after the folder is initialized and connected to GitHub:

```powershell
git tag -a v1.0.0 -m "EstateFlow v1.0.0"
git push origin v1.0.0
```

## Automated smoke tests

`scripts/production-smoke.mjs` verifies:

- API liveness response contract
- MongoDB-backed API readiness
- Credentialed CORS for the exact frontend origin
- Backend security headers
- Frontend availability and security headers

Manual release acceptance must additionally verify login, refresh-token rotation, logout, password reset email, RBAC restrictions, one CRUD workflow, a report export, and responsive navigation.

## Observability and alerts

Before launch, connect provider alerts for:

- Render deploy failures, restarts, high latency, 5xx rate, CPU, and memory
- Atlas connection saturation, storage, replication, slow queries, and backup failures
- Vercel deployment failures and elevated function/edge errors
- SMTP bounce/rejection rates
- Domain and certificate expiry

Application logs are structured JSON in production and must be forwarded to a retained log platform without recording tokens, passwords, or cookie values.

## Rollback

### Backend

Use Render's rollback operation or deploy the last healthy retained GHCR digest. The image must remain available in GHCR. Confirm readiness and authentication afterward.

### Frontend

Promote the last healthy Vercel deployment from deployment history, then rerun the smoke script.

### Database

Application releases must use backward-compatible schema changes. A database restore is a last resort and requires incident approval, a verified recovery point, and a maintenance window. Never delete or rewrite production data merely to make an older application image start.

## Validation evidence

- Backend and frontend deployment-preflight script syntax: valid
- Backend lint and tests: passing
- Frontend lint, tests, deployment check, and production build: passing
- Vercel configuration JSON: valid
- Production smoke-test script syntax: valid
- External deployment: not executed because required infrastructure and authority are unavailable
