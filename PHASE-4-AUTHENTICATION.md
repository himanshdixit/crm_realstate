# Phase 4 — Authentication, Sessions, and Authorization

## Status

Phase 4 is complete across the Express API and Next.js frontend.

## Backend delivery

- Customer registration with strong password validation and default Customer role
- Single-use, hashed, expiring email-verification tokens
- Login with bcrypt verification, generic credential errors, history, progressive account locking, and device metadata
- Short-lived access tokens and rotating refresh-token families
- Atomic refresh claiming and refresh-token reuse detection with family revocation
- Secure HttpOnly access/refresh cookies and readable double-submit CSRF cookie
- CSRF enforcement on authenticated mutations
- Current-device logout, all-device logout, session listing, and owned-session revocation
- Privacy-safe forgot-password response and single-use reset links
- Password reset revoking every session
- Authenticated password change revoking other sessions
- Current-user, profile-update, and permission-resolution APIs
- Authentication and account audit events
- SMTP delivery in production and Nodemailer JSON transport in development
- Idempotent role/permission seeders and guarded Super Admin bootstrap script

## Frontend delivery

- Session bootstrap through `/auth/me` with refresh fallback
- Deduplicated refresh requests and one-time original-request retry
- CSRF and persistent device-fingerprint request headers
- Redux authentication state without browser-stored tokens
- Protected dashboard routes and guest-only authentication routes
- Permission guard component and authorization hook
- Login, registration, forgot-password, reset-password, and email-verification workflows
- Profile update, password change, active-session list, and device revocation
- Authenticated header identity and sign-out
- React Hook Form and Zod validation for authentication forms

## API endpoints

```text
POST   /api/v1/auth/register
POST   /api/v1/auth/verify-email
POST   /api/v1/auth/resend-verification
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
GET    /api/v1/auth/me
PATCH  /api/v1/auth/profile
POST   /api/v1/auth/change-password
POST   /api/v1/auth/logout
POST   /api/v1/auth/logout-all
GET    /api/v1/auth/sessions
DELETE /api/v1/auth/sessions/:sessionId
```

## Required initialization

1. Configure backend `.env`, including unique JWT secrets and SMTP credentials for production.
2. Run `npm run seed` in `backend/` to create permissions and system roles.
3. Configure the `ADMIN_*` variables and run `npm run seed:admin` once.
4. Configure frontend `NEXT_PUBLIC_API_URL` and matching backend CORS/frontend origins.

Raw access and refresh tokens are never returned to frontend JavaScript and are never stored in Redux, local storage, or Redux Persist.

## Verification

```text
backend:  npm run lint && npm test
frontend: npm run lint && npm test && npm run build
```

- Backend: zero lint errors; 11 passing tests covering route protection, validation, refresh-cookie requirements, JWT claims/expiry, health behavior, unsafe-input rejection, and permission resolution.
- Frontend: zero lint errors; 6 passing validation/utility tests; successful Next.js production build with 14 generated routes and metadata assets.

Database-backed email and login flows require the configured MongoDB instance and seeded reference data described above; secrets are intentionally not committed to the repository.
