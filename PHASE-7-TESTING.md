# Phase 7 — Testing and Quality Assurance

## Status

Phase 7 deterministic testing is complete. All automated suites, lint checks, the production frontend build, and the production dependency audit pass.

## Test layers

### Backend unit tests

- JWT signing, verification, and expiry behavior
- Permission merging, inactive roles, and explicit denials
- Dashboard series completion and audience selection
- Pagination bounds and metadata
- Sort-field allowlisting and regular-expression escaping
- Mongoose validation for property media, enquiries, testimonials, FAQs, and communication templates
- Resource registry structure and permission completeness, including restore permissions

### Backend API contract tests

- Standard health and normalized response contracts
- Registration and login validation before database access
- Refresh-cookie and authenticated-account protection
- MongoDB operator input rejection
- Lead pipeline authentication
- PDF and Excel export authentication
- Unregistered resource rejection

### Frontend unit and contract tests

- Login and registration Zod validation
- Currency and machine-label formatting
- CSS class composition
- Every CRM resource has unique fields, table columns, and valid select options
- Shared backend permission namespace mapping
- Generated resource-form schema coercion, JSON parsing, required fields, and malformed JSON rejection

## Commands

Run from each independent project:

```powershell
cd backend
npm.cmd run lint
npm.cmd test
npm.cmd run test:coverage

cd ../frontend
npm.cmd run lint
npm.cmd test
npm.cmd run test:coverage
npm.cmd run build
```

## Environment-dependent integration tests

Authenticated CRUD, refresh-token rotation persistence, organization isolation against real records, report file contents, seed verification, Cloudinary, SMTP, Maps, SMS/WhatsApp, and real-time delivery require disposable test infrastructure and provider credentials. They must run in CI or staging with an isolated MongoDB database and must never target production data.

Required test environment variables:

```text
NODE_ENV=test
MONGODB_URL=mongodb://<isolated-test-server>
DB_NAME=Codex_realstate_db_test
ACCESS_TOKEN_SECRET=<test-only-secret-at-least-32-characters>
REFRESH_TOKEN_SECRET=<different-test-only-secret-at-least-32-characters>
```

The current workstation has no MongoDB service or `backend/.env`, so database-dependent tests and seed verification were not fabricated or reported as passed.

## Acceptance evidence

- Backend: 28 tests passing across 9 suites
- Frontend: 12 tests passing across 6 suites
- Backend deterministic coverage: 77.34% lines, 85.00% branches
- Frontend tested-module coverage: 100% lines, 95.83% branches
- Backend ESLint: passing
- Frontend ESLint: passing
- Next.js production build: passing
- Production npm dependency audit: zero known vulnerabilities

## Regression corrected during Phase 7

Frontend authorization controls for property media, favorites, testimonials, FAQs, templates, chats, messages, notifications, notes, and activity history were using route names instead of their backend permission namespaces. A centralized permission mapper now aligns both layers, with regression coverage.
