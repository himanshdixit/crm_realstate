# EstateFlow Backend

Independent Express and MongoDB API for EstateFlow.

## Requirements

- Node.js 20.11 or newer (Node.js 22 recommended)
- MongoDB 7 or newer, locally or through MongoDB Atlas

## Local setup

1. Copy `.env.example` to `.env`.
2. Replace both token secrets with different cryptographically random values of at least 32 characters.
3. Set `MONGODB_URL`, `DB_NAME`, and the allowed frontend origins in `CORS_ORIGINS`.
4. Install packages with `npm install`.
5. Seed permissions and system roles with `npm run seed`.
6. Start development mode with `npm run dev`.

The API listens on port `5000` by default.

For Render, use `.env.render.example`; it groups production runtime, Atlas, CORS/cookie, JWT, SMTP, and bootstrap settings without changing local configuration.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Run the API with Node's file watcher |
| `npm start` | Run the API normally |
| `npm run lint` | Check all JavaScript with ESLint |
| `npm test` | Run the Node test suite |
| `npm run seed` | Idempotently seed permissions and system roles |
| `npm run seed:admin` | Create the first Super Admin from guarded `ADMIN_*` environment values |

## Health endpoints

- `GET /api/v1/health/live`: Confirms that the HTTP process can respond.
- `GET /api/v1/health/ready`: Confirms that required infrastructure is ready. It returns `503` until MongoDB is connected.
- `GET /api/v1/dashboard/overview?months=6|12`: Returns the authenticated, permission-protected live dashboard aggregate.

## Layer boundaries

```text
route -> middleware -> controller -> service -> repository -> model -> MongoDB
```

- Routes define the HTTP contract and middleware order.
- Controllers adapt HTTP input and output.
- Services enforce business rules and transaction boundaries.
- Repositories own reusable database queries.
- Models own schemas, indexes, and persistence invariants.
- Integrations will isolate external providers such as Cloudinary and email.

## API response contract

Every response includes `success`, `message`, `data`, and `errors`. Failures additionally include a stable machine-readable `code` and request correlation ID.

## Security foundation

- Helmet headers, explicit CORS origins, request limits, HPP protection, and input-key rejection
- Global and authentication-specific rate-limit primitives
- Secure cookie helpers and separate access/refresh signing keys
- Refresh-token families designed for rotation and reuse detection
- Configurable roles, direct permissions, and explicit permission denials
- Soft-deletion governance fields and append-only audit logs
- Password hashing and constant-time token comparison helpers
- Secret validation that rejects development defaults in production

Authentication endpoints and token-rotation services are fully implemented. Production requires working SMTP configuration; development uses Nodemailer's JSON transport and writes generated email content to structured development logs.

## Production notes

- Set `TRUST_PROXY` to match the exact number of trusted reverse proxies.
- Set `COOKIE_SECURE=true` behind HTTPS.
- Use narrowly scoped production origins rather than wildcards.
- Disable automatic index creation and deploy reviewed indexes through migration scripts.
- Use a distributed rate-limit store when running multiple API instances.
- Forward JSON logs to the deployment platform's centralized log service.
