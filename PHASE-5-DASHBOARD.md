# Phase 5 — Live Dashboard and Analytics

## Status

Phase 5 implements a live, permission-protected dashboard backed by MongoDB aggregations. It contains no fabricated operational metrics.

## Backend delivery

- Organization-scoped and role-aware dashboard service
- Customer-only scope that prevents access to internal lead, revenue, agent, and activity analytics
- Indexed foundational Property, Lead, Booking, Payment, Task, Appointment, Activity, and Notification schemas
- Total and current/previous-month trends for properties, leads, bookings, and revenue
- Lead conversion ratio, funnel stages, and acquisition sources
- Six- or twelve-month revenue time series with empty-month filling
- Property-status distribution
- Top-agent conversion performance
- Signed-in-user task and appointment feeds
- Recent activity, transaction, and notification feeds
- Private short-lived HTTP caching headers
- `dashboard.read` permission integrated into system-role seeding

## Frontend delivery

- TanStack Query dashboard cache, refetching, stale-time, and retry controls
- Live KPI cards with directional trends
- Chart.js revenue line, lead-funnel bar, property-status doughnut, and lead-source doughnut charts
- Top-agent rankings, activity timeline, transactions, notifications, tasks, and appointments
- Customer-safe dashboard variant
- Six/twelve-month selection and manual/background refresh indicators
- Responsive layout, accessible controls, skeletons, empty states, and recoverable errors
- Currency minor-unit formatting and human-readable status labels

## API

```text
GET /api/v1/dashboard/overview?months=6|12
```

The route requires authentication and `dashboard.read`. Run `npm run seed` again after deploying Phase 5 so existing databases receive the new permission and updated role assignments.

## Data behavior

Dashboard values are derived from persisted records. A new database correctly renders zero-value cards and explanatory empty states until CRM modules begin creating records in Phase 6.

## Verification

```text
backend:  npm run lint && npm test
frontend: npm run lint && npm test && npm run build
```

- Backend: zero lint errors and 14 passing tests.
- Frontend: zero lint errors, 8 passing tests, and a successful production build with 14 routes/assets generated.
