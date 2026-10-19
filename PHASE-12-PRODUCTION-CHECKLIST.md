# Phase 12 — Production Readiness Checklist

## Release decision

Phase 12 code and documentation review is complete. The application is **code-ready but not approved for production launch**. External infrastructure and operational controls listed under **Launch blockers** must be completed and evidenced first.

## Automated quality gates

- [x] Backend lint passes
- [x] Backend automated tests pass: 28 tests across 9 suites
- [x] Frontend lint passes
- [x] Frontend automated tests pass: 12 tests across 6 suites
- [x] Next.js standalone production build passes
- [x] JavaScript performance budget passes
- [x] Backend and frontend production dependency audits report zero known vulnerabilities
- [x] GitHub Actions, Dependabot, Compose, and Vercel configuration syntax validated
- [x] Production configuration preflight scripts validated
- [x] Deployment and production smoke scripts syntax validated
- [ ] Database-backed integration tests pass against an isolated test MongoDB
- [ ] Container images build and health checks pass in Docker/CI
- [ ] Authenticated end-to-end browser tests pass in staging
- [ ] Load and endurance tests pass with production-like data volume

## Application and API

- [x] Standard API response and error contracts
- [x] API versioning under `/api/v1`
- [x] Server pagination, allowlisted sorting, escaped searching, and query time limits
- [x] Tenant/organization scoping on CRM resource access
- [x] Soft deletion, restoration, audit ownership, and activity records
- [x] Health liveness and database-backed readiness endpoints
- [x] Graceful SIGTERM/SIGINT shutdown
- [x] Additive production index command
- [ ] Confirm every production query plan with Atlas `explain("executionStats")`
- [ ] Verify report limits and export time under production-like load

## Authentication and authorization

- [x] Short-lived access tokens and rotating refresh tokens
- [x] HTTP-only cookies and CSRF protection for mutations
- [x] Secure production-cookie preflight
- [x] Password hashing, lockouts, reset, verification, sessions, and device tracking
- [x] Configurable roles, direct permissions, denials, and permission guards
- [x] Frontend/backend shared permission namespaces regression-tested
- [ ] Run the seed against production Atlas and verify all system roles
- [ ] Rotate the bootstrap administrator password after first login
- [ ] Test one allow and one deny case for every production role
- [ ] Establish privileged-access review and administrator offboarding procedures

## Security

- [x] Helmet, CORS allowlist, HPP, rate limiting, input sanitization, and size limits
- [x] Independent production JWT-secret validation
- [x] CodeQL, dependency review, npm audit, Trivy, provenance, and SBOM gates
- [x] Non-root containers and `no-new-privileges`
- [x] Secrets excluded from Git and container build contexts
- [ ] Configure expiring Render and Vercel credentials in GitHub environment secrets
- [ ] Enable branch protection, required reviews, CodeQL, and `CI success`
- [ ] Complete an external penetration test and remediate findings
- [ ] Configure WAF/bot protection where justified by observed abuse
- [ ] Document secret rotation cadence and emergency revocation ownership
- [ ] Perform privacy, retention, consent, and applicable regulatory review

## Data and recovery

- [ ] Create a dedicated MongoDB Atlas production project and least-privilege user
- [ ] Restrict Atlas network access; no permanent `0.0.0.0/0`
- [ ] Enable encryption, automated backups, and point-in-time recovery where supported
- [ ] Complete and time a full restore rehearsal
- [ ] Define RPO and RTO with business owners
- [ ] Define retention/deletion policies for customers, documents, messages, audits, and logs
- [ ] Verify Cloudinary backup/deletion behavior and orphan cleanup
- [ ] Document data export and subject-deletion processes

## Infrastructure and deployment

- [x] Multi-stage production Dockerfiles
- [x] Authenticated Compose stack with internal MongoDB network and persistent volume
- [x] Immutable GHCR backend releases with digest deployment
- [x] Render deployment polling and Vercel exact-commit deployment
- [x] Serialized protected production releases and post-deploy smoke testing
- [x] Backend/frontend/database rollback runbooks
- [ ] Initialize Git, create the GitHub repository, and push the reviewed history
- [ ] Build and scan final images in GitHub Actions
- [ ] Configure Render image-backed service and GHCR access
- [ ] Configure Vercel project rooted at `frontend/`
- [ ] Configure production domains, DNS, HTTPS, CORS, and cookies
- [ ] Execute staging deployment and obtain acceptance sign-off
- [ ] Execute production release through the protected workflow

## External services

- [ ] Configure and verify Cloudinary upload credentials and signed deletion
- [ ] Configure a verified SMTP sender; test verification and reset delivery
- [ ] Configure Google Maps restrictions by domain/API and billing alerts
- [ ] Configure SMS/WhatsApp providers, templates, consent, rate limits, and failure handling
- [ ] Configure push provider only after permission/consent UX approval
- [ ] Confirm provider quotas, billing alerts, retry policies, and outage fallbacks

## Observability and operations

- [x] Structured production logging and request IDs
- [x] Health/readiness checks suitable for orchestration
- [ ] Centralize logs with access control and retention
- [ ] Configure uptime checks for frontend, liveness, and readiness
- [ ] Configure alerts for 5xx rate, latency, restarts, CPU, memory, database connections, storage, and backup failures
- [ ] Define SLOs and alert thresholds from baseline traffic
- [ ] Create incident severity, escalation, communication, and postmortem procedures
- [ ] Establish on-call ownership and provider-status monitoring
- [ ] Create operational dashboards and a release annotation process

## User experience and compatibility

- [x] Responsive layouts, dark/light mode, loading, empty, and error states
- [x] Lazy-loaded dashboard charts and debounced search
- [x] Bundle-size budgets enforced in CI
- [ ] Complete keyboard-only and screen-reader acceptance testing
- [ ] Run automated accessibility checks and remediate WCAG issues
- [ ] Verify current Chrome, Edge, Firefox, Safari, iOS Safari, and Android Chrome
- [ ] Validate RTL with actual translated content
- [ ] Test slow-network, offline/reconnect, expired-session, and large-file scenarios
- [ ] Confirm legal pages, privacy notice, terms, support contacts, and product analytics consent

## Launch blockers in this workspace

1. The folder is not a Git repository and is not connected to GitHub.
2. Docker is not installed or available on PATH.
3. MongoDB is unavailable locally; seeding and database integration tests cannot run.
4. No Atlas, Cloudinary, SMTP, Maps, SMS/WhatsApp, Render, or Vercel production credentials are available.
5. Production domains, DNS, TLS, GitHub environment protection, monitoring, backups, and operational ownership are not configured.

These are authority/infrastructure blockers, not code that should be fabricated. Production launch must remain blocked until each item has evidence and an accountable owner.

## Executable readiness check

Run the local artifact audit:

```powershell
node scripts/release-readiness.mjs
```

Run the strict production gate after configuring the protected environment:

```powershell
node scripts/release-readiness.mjs --strict
```

The strict command exits non-zero for any unresolved code or external readiness check.

## Final approval record

Before launch, record:

```text
Release version:
Git commit and backend image digest:
Change approval:
Security approval:
Data/backup approval:
Operations/on-call approval:
Product acceptance:
Deployment operator:
Rollback owner:
Launch date and maintenance window:
```

No person should mark the release approved without links to CI results, security scans, staging acceptance, restore evidence, monitoring dashboards, and rollback verification.
