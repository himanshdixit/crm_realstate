# Phase 2 — Backend Foundation

## Status

Phase 2 is complete and verified. The backend is an independent Node.js application in `backend/`.

## Delivered

- Express 5 application factory and separate server entry point
- Strict environment parsing and production secret safeguards
- MongoDB connection lifecycle and readiness reporting
- Graceful HTTP and database shutdown
- Versioned `/api/v1` routing
- Liveness and readiness endpoints
- Standard success and error response contracts
- Centralized operational error normalization
- Correlation IDs and structured Winston/Morgan logging
- Helmet, explicit CORS, compression, HPP protection, request-size limits, and rate limiting
- Recursive rejection of unsafe MongoDB/prototype input keys
- Pagination and allowlisted sorting utilities
- Reusable soft-delete repository foundation
- User, Role, Permission, RefreshToken, LoginHistory, and append-only AuditLog models
- Password hashing, token hashing, JWT, and secure-cookie primitives
- Authentication and configurable permission middleware ready for protected routes
- Idempotent permission and system-role seeders
- ESLint flat configuration and Node test runner
- Production-oriented non-root Docker image
- Locked npm dependency tree

## Verification

The following checks pass:

```text
npm run lint
npm test
```

The test suite covers the health response contract, normalized 404 errors, unsafe-input rejection, permission merging, explicit denials, and inactive-role behavior.

## Phase boundary

Phase 2 establishes backend infrastructure and identity primitives. Phase 4 owns public authentication workflows including registration, login, refresh rotation, logout, password recovery, email verification, device sessions, and account security endpoints. Business-module models and CRUD APIs are delivered with their CRM modules in Phase 6 rather than exposing unfinished resources early.

