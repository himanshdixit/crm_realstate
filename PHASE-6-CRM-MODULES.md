# Phase 6 — CRM Operational Modules

## Status

Phase 6 operational module delivery is complete. Database seeding remains pending only because no MongoDB server is available at the configured local address.

## Backend platform

- Explicit resource registry with field allowlists and permission namespaces
- Organization isolation on every query and mutation
- Server pagination, search, status filtering, allowlisted sorting, and population
- Create, read, update, soft delete, restore, bulk update, and bulk delete infrastructure
- Mongoose validation, compound indexes, unique constraints, audit ownership fields, and activity events
- Specialized lead conversion, booking approval/cancellation, and property featuring workflows
- Score-prioritized lead pipeline endpoint and tenant-scoped PDF/Excel-compatible report exports
- Expanded configurable permissions and system-role mappings

## Registered modules

- Properties, leads, customers, builders, projects, visits, bookings
- Tasks, appointments, invoices, payments, documents
- Support tickets, blog content, knowledge base, and marketing campaigns
- Property media/floor plans, favorites/wishlists, notes, enquiries, testimonials, FAQs
- Communication templates, chats, messages, notifications, and activity history

## Frontend platform

- Dynamic registered module routes using a shared production component
- TanStack Table data grids with server pagination
- React Hook Form and generated Zod schemas
- Search, create, edit, delete confirmation, permission-aware controls, and cache invalidation
- JSON validation for structured invoice line items
- Specialized lead, booking, and property workflow actions
- Dedicated lead Kanban pipeline and report download center
- Responsive tables, accessible modals, loading states, empty states, and API errors

## API contract

Each registered resource exposes:

```text
GET    /api/v1/:resource
POST   /api/v1/:resource
GET    /api/v1/:resource/:id
PATCH  /api/v1/:resource/:id
DELETE /api/v1/:resource/:id
POST   /api/v1/:resource/:id/restore
POST   /api/v1/:resource/bulk-delete
PATCH  /api/v1/:resource/bulk-update
```

Specialized endpoints:

```text
POST  /api/v1/leads/:id/convert
PATCH /api/v1/bookings/:id/approve
PATCH /api/v1/bookings/:id/cancel
PATCH /api/v1/properties/:id/feature
GET   /api/v1/leads/pipeline
GET   /api/v1/reports/excel?resource=:resource
GET   /api/v1/reports/pdf?resource=:resource
```

`npm run seed` was executed on 2026-08-18 but could not connect to `127.0.0.1:27017`; MongoDB was not running. No seed data was written. Once MongoDB is available or `MONGODB_URL` is configured, rerun the command to synchronize permissions and system roles in `Codex_realstate_db`.

## Verification

- Backend ESLint: zero errors; 16 tests passed.
- Frontend ESLint: zero errors; 8 tests passed.
- Next.js production build: successful, including the dynamic registered-resource route.
- Production dependency audit: zero known vulnerabilities after upgrading Nodemailer and replacing ExcelJS.

## External integration boundary

Media records retain Cloudinary URLs/public IDs and communication records retain channel-ready content. Cloudinary upload, Google Maps, SMS, WhatsApp, push delivery, and WebSocket transport require provider credentials and must be activated through deployment configuration rather than embedded secrets. Chats and messages are persisted and API-accessible; real-time transport can attach without changing their data model.
