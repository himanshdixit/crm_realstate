# Phase 8 — Docker and Docker Compose

## Status

Phase 8 containerization is implemented. Application lint, tests, and the standalone Next.js production build pass. Runtime container validation is pending because Docker is not installed or not available on PATH on this workstation.

## Container architecture

```text
Browser
  |
  +--> frontend:3000 (Next.js standalone, non-root)
           |
           +--> backend:5000 (Express API, non-root)
                    |
                    +--> mongodb:27017 (authenticated, internal network only)
```

- `frontend` and `backend` share the `web` network.
- Only `backend` and `mongodb` share the internal `data` network.
- MongoDB is not published to the host and persists to the named `mongodb_data` volume.
- Compose waits for MongoDB readiness before starting the API and waits for API readiness before starting the frontend.
- All application containers use `init`, restart policies, health checks, and `no-new-privileges`.

## Images

### Backend

The backend Dockerfile contains:

- `dependencies`: deterministic production dependencies with `npm ci`
- `test`: lint and automated test gate
- `runner`: minimal non-root production runtime containing only runtime code
- API readiness health check and graceful SIGTERM handling

### Frontend

The frontend Dockerfile contains:

- `dependencies`: deterministic dependency installation
- `test`: lint and automated test gate
- `builder`: optimized Next.js standalone compilation with public build arguments
- `runner`: non-root standalone server without source or development dependencies

`NEXT_PUBLIC_*` values are compiled into the browser bundle. Changing the public API URL requires rebuilding the frontend image.

## Secure local startup

Create the untracked Docker environment file and replace every placeholder:

```powershell
Copy-Item .env.docker.example .env.docker
docker compose --env-file .env.docker config
docker compose --env-file .env.docker build
docker compose --env-file .env.docker up -d
docker compose --env-file .env.docker ps
```

Use URL-safe random characters for `MONGO_ROOT_PASSWORD`, because it is embedded in the MongoDB connection URI. Use independent secrets of at least 32 random characters for access and refresh tokens.

Endpoints after startup:

```text
Frontend:          http://localhost:3000
API liveness:      http://localhost:5000/api/v1/health/live
API readiness:     http://localhost:5000/api/v1/health/ready
```

## Seed the database

After all services are healthy:

```powershell
docker compose --env-file .env.docker run --rm backend npm run seed
```

The seeder is idempotent and synchronizes permission and system-role definitions. Do not leave the bootstrap administrator password unchanged after first login.

## Quality-gated image targets

```powershell
docker build --target test -t estateflow-backend-test ./backend
docker build --target test -t estateflow-frontend-test ./frontend
docker build --target runner -t estateflow-backend ./backend
docker build --target runner -t estateflow-frontend ./frontend
```

## Operations

View logs and stop safely:

```powershell
docker compose --env-file .env.docker logs -f backend frontend
docker compose --env-file .env.docker down
```

`docker compose down` retains MongoDB data. Removing the named volume destroys the database and must only be done after a verified backup and explicit approval.

Back up MongoDB without exposing its port:

```powershell
docker compose --env-file .env.docker exec mongodb sh -c 'mongodump --username "$MONGO_INITDB_ROOT_USERNAME" --password "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin --archive=/tmp/estateflow.archive'
docker compose --env-file .env.docker cp mongodb:/tmp/estateflow.archive ./estateflow.archive
```

For production, use managed MongoDB, orchestrator-managed secrets, TLS ingress, immutable image tags, centralized logs, automated encrypted backups, and a registry vulnerability scan. Do not deploy `.env.docker` or placeholder credentials.

## Validation evidence

- Backend lint and automated tests: passing
- Frontend lint and automated tests: passing
- Next.js standalone production build: passing
- Standalone runtime artifact (`.next/standalone/server.js`): verified
- Compose YAML syntax: parsed successfully
- Docker runtime/build: not executed because the `docker` command is unavailable locally
