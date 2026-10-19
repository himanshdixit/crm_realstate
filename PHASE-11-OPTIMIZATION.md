# Phase 11 — Performance Optimization

## Status

Phase 11 code-level optimization is complete. Deterministic quality and bundle budgets pass. Database execution plans, Web Vitals, and capacity limits require production-like data and traffic and must be measured after deployment.

## Backend improvements

### Fewer database round trips

- Dashboard trend counts now use one aggregation per model instead of three separate count queries.
- Revenue total, current-month revenue, and previous-month revenue now use one aggregation instead of three queries.
- Independent dashboard operations remain parallelized.

### Smaller database responses

Dashboard task, appointment, activity, and notification queries explicitly project only fields rendered by the UI. All read-heavy queries continue to use lean objects.

### Query safety

- Generic resource list and count queries have a five-second MongoDB execution ceiling.
- Pagination remains capped at 100 records.
- Sort fields remain allowlisted and search expressions escaped.

### Index alignment

Compound indexes now match tenant isolation, soft-delete, status, ownership, and date predicates for:

- Properties
- Leads and agent performance
- Bookings
- Payments and revenue
- Tasks
- Appointments
- Activities
- Notifications

Production keeps Mongoose `autoIndex` disabled. `npm run db:indexes` performs additive `createIndexes` calls during the Render pre-deploy phase; it does not drop existing indexes.

### Connection pooling

MongoDB pool size and idle lifetime are configurable with bounded validated values:

```text
MONGODB_MIN_POOL_SIZE=2
MONGODB_MAX_POOL_SIZE=20
MONGODB_MAX_IDLE_TIME_MS=60000
```

Tune these against Atlas connection limits, Render instance count, and observed concurrency—not workstation benchmarks.

## Frontend improvements

- Chart.js is removed from the initial dashboard client path and loaded through client-only dynamic chunks.
- Chart datasets/options are memoized, and chart components avoid rerendering when inputs are unchanged.
- CRM search is debounced by 350 ms while explicit Enter/Search submission remains supported.
- React Query retains useful data for 30 seconds, releases inactive queries after two minutes, avoids focus refetch storms, and refreshes after reconnection.
- Next.js standalone production output keeps compression enabled, browser source maps disabled, and optimizes `react-icons` and `date-fns` imports.

Server pagination makes table virtualization unnecessary at the current 15-row page size. Virtualization should only be introduced if a future view intentionally renders hundreds of rows at once.

## Performance budget

`npm run perf:check` enforces post-build JavaScript limits:

- All emitted chunks combined: at most 1,750,000 bytes
- Largest individual chunk: at most 350,000 bytes

Verified optimized build: 33 JavaScript chunks, 1,511,682 total bytes, and a 286,708-byte largest chunk.

The budget runs in CI and the production release gate. It prevents silent dependency or bundling regressions while allowing independently cached route chunks.

## Deployment sequence

The backend production pre-deploy command is:

```text
npm run deploy:check && npm run db:indexes && npm run seed
```

Index creation should be monitored during the first production deployment. For large existing collections, build new indexes during a low-traffic window and observe Atlas CPU, I/O, and replication lag.

## Post-deployment measurement

Capture before changing budgets or pool sizes:

- Vercel Core Web Vitals: LCP, INP, CLS, and TTFB by route and device
- API p50/p95/p99 latency and error rate by endpoint
- MongoDB `explain("executionStats")` results, examined/returned ratio, slow queries, pool wait time, and connections
- Render CPU, memory, restarts, event-loop lag, and response time
- Frontend chunk cache hit rates and real-user navigation timings

Performance changes must be driven by these measurements. Redis caching remains optional because tenant/user cache keys, invalidation, and multi-instance consistency must be designed from observed read patterns rather than added speculatively.

## Verification

- Backend lint and automated tests: passing
- Frontend lint and automated tests: passing
- Next.js production build: passing
- JavaScript bundle budget: passing
- Docker Compose and production environment templates include pool settings
- Database index creation command: syntax validated; execution requires MongoDB
