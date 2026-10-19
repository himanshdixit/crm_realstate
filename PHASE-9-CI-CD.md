# Phase 9 — CI/CD

## Status

Phase 9 CI/CD automation is implemented. Workflow YAML and local application gates are validated. GitHub-hosted execution and provider deployment remain inactive until this folder is committed to a GitHub repository and the protected production environment is configured.

## Continuous integration

`.github/workflows/ci.yml` runs on pull requests and pushes to `main` and `develop`:

1. Backend `npm ci`, lint, tests, coverage, and production dependency audit
2. Frontend `npm ci`, lint, tests, coverage, production build, and production dependency audit
3. Matrix Docker builds of both `test` targets after application checks pass
4. A stable `CI success` aggregation job suitable for a required branch-protection check

Runs use lockfile-aware npm caches, explicit timeouts, least-privilege permissions, and concurrency cancellation for superseded commits.

## Security automation

`.github/workflows/security.yml` provides:

- CodeQL analysis on `main`, pull requests, manual runs, and a weekly schedule
- High-severity dependency review on pull requests
- SARIF upload permission limited to the security workflow

`.github/dependabot.yml` creates grouped npm updates and separate Docker and GitHub Actions updates each week.

## Production release

`.github/workflows/deploy.yml` runs only for semantic version tags (`v*.*.*`) or an explicit manual dispatch.

```text
release gate
   |
   +-- lint + test + build backend/frontend
   |
publish immutable backend image to GHCR
   |
generate provenance + SBOM + Trivy HIGH/CRITICAL gate
   |
protected GitHub production environment approval
   |
   +-- Render API deploys the exact GHCR digest and polls until status=live
   |
   +-- Vercel CLI builds/deploys the exact checked-out frontend commit
   |
post-deployment API readiness + frontend availability checks
```

Production concurrency is serialized and never auto-cancelled. The published backend image receives a commit-SHA tag, a release tag where applicable, OCI metadata, provenance, and an SBOM. Render receives the immutable digest instead of a mutable `latest` reference.

## Required GitHub configuration

Create a GitHub environment named `production`, restrict it to version tags and authorized reviewers, and add:

### Environment secrets

- `RENDER_API_KEY`: expiring Render API key with only the required workspace access
- `VERCEL_TOKEN`: expiring Vercel token for the target project/team

### Environment variables

- `RENDER_SERVICE_ID`: Render image-backed backend service ID
- `VERCEL_ORG_ID`: Vercel account or team ID
- `VERCEL_PROJECT_ID`: Vercel frontend project ID
- `PRODUCTION_API_URL`: public API base ending in `/api/v1`
- `PRODUCTION_FRONTEND_URL`: canonical frontend URL

The standard `GITHUB_TOKEN` publishes the backend image to GHCR. Configure the Render service with the matching `ghcr.io/<owner>/estateflow-backend` image repository and registry credentials if the package is private.

Repository branch protection for `main` should require:

- Pull requests and review approval
- The `CI success` check
- The CodeQL check
- Conversation resolution
- Branches to be current before merge
- No direct pushes or force pushes

Replace repository-specific ownership in GitHub settings or add a real `CODEOWNERS` file after the GitHub organization/team handles are known; invalid placeholder owners are intentionally not committed.

## Provider behavior

- Render supports deploying an image-backed service from a specific tag or digest. The release script uses the authenticated Render API and polls the returned deployment ID to a terminal state.
- Vercel deployment uses its pinned CLI and the project/org identifiers, avoiding a branch-linked hook that could deploy a commit different from the released tag.

The implementation follows the current [Render trigger-deploy API](https://api-docs.render.com/reference/create-deploy), [Render deployment status API](https://api-docs.render.com/reference/retrieve-deploy), and [Vercel deployment documentation](https://vercel.com/docs/deployments/overview).

## Rollback

Backend rollback:

1. Identify the last healthy Render deployment and its retained GHCR digest.
2. Use Render's rollback API/dashboard or manually dispatch a prior release ref.
3. Confirm `/api/v1/health/ready` and smoke-test authentication before closing the incident.

Frontend rollback:

1. Open the Vercel project deployment history.
2. Promote the last verified deployment to production.
3. Verify the canonical URL and frontend-to-API authentication flow.

Do not delete historical GHCR digests required by the rollback retention window. Database changes must remain backward compatible during rolling releases; destructive migrations require a separately approved backup and rollback plan.

## Validation

- Backend lint and 28 tests: passing
- Frontend lint and 12 tests: passing
- Next.js production build: passing
- Production dependency audits: zero known vulnerabilities
- Workflow and Dependabot YAML syntax: validated locally
- Provider deployment: not executed because no GitHub repository/environment or provider credentials are configured
