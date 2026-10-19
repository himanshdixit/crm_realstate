# EstateFlow Frontend

Independent Next.js App Router frontend for EstateFlow.

## Requirements

- Node.js 20.11 or newer (Node.js 22 recommended)
- The backend API running locally or at a configured HTTPS endpoint

## Setup

1. Copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_API_URL` to the versioned backend URL.
3. Run `npm install`.
4. Run `npm run dev` and open `http://localhost:3000`.

For Vercel, use `.env.vercel.example`; it contains only browser-safe production variables.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run the Next.js ESLint rules |
| `npm test` | Run frontend foundation unit tests |

## Architecture

- `app/`: App Router layouts, routes, metadata, and error/loading boundaries.
- `components/ui/`: Reusable domain-neutral primitives.
- `components/layout/`: Responsive application shell and navigation.
- `components/auth/`: Authentication presentation components.
- `providers/`: Redux, TanStack Query, theme, and toast infrastructure.
- `redux/`: Client-owned state only. Redux Persist saves non-sensitive interface preferences.
- `services/`: Centralized Axios client and domain API services.
- `validations/`: Zod schemas for React Hook Form.
- `config/`: Site and navigation configuration.
- `utils/`: Pure reusable helpers.

## Security model

The frontend never stores access or refresh tokens in Redux, Redux Persist, local storage, or JavaScript-readable cookies. The API client sends backend-managed HttpOnly cookies with `withCredentials`. When the backend reports an expired access token, one shared refresh operation runs and the original request retries once.

Frontend permission checks improve usability but are never treated as an authorization boundary. The backend remains authoritative.

## Styling and accessibility

The interface uses Tailwind CSS 4 with semantic CSS tokens, pre-hydration light/dark theme initialization, RTL-compatible logical properties, visible keyboard focus, reduced-motion support, responsive navigation, and accessible status/error markup. System fonts prevent third-party font calls and keep production builds deterministic.

Business module navigation remains disabled until Phase 6 provides complete workflows. No fake CRUD screens or fabricated production metrics are included.

## Authentication routes

The application provides login, registration, verification, recovery, password reset, protected dashboard routes, profile editing, password change, and device-session management. Authentication tokens remain in backend-managed HttpOnly cookies; frontend state contains only the safe user profile and resolved permission keys.

## Live dashboard

The dashboard reads real organization-scoped aggregates through TanStack Query and renders Chart.js analytics, KPI trends, lead conversion, inventory status, agent performance, tasks, appointments, activities, transactions, and notifications. It provides honest empty states when the database contains no business records and never substitutes fabricated metrics.
