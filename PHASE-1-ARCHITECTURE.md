# EstateFlow — Phase 1 Architecture Blueprint

> Status: Complete  
> Stack: Next.js App Router (JavaScript), React, Tailwind CSS, Node.js, Express, MongoDB, Mongoose  
> Repository model: Independently deployable `frontend` and `backend` applications

No application code is included in Phase 1. This document is the implementation contract for the phases that follow.

## 1. Repository structure

```text
EstateFlow/
├── frontend/
├── backend/
├── .github/
│   └── workflows/
│       ├── frontend-ci.yml
│       ├── backend-ci.yml
│       ├── frontend-deploy.yml
│       └── backend-deploy.yml
├── docs/
│   ├── architecture.md
│   ├── api-contracts.md
│   ├── authentication.md
│   ├── authorization.md
│   ├── database-schema.md
│   ├── deployment.md
│   └── security.md
├── docker-compose.yml
├── .editorconfig
├── .gitignore
├── LICENSE
└── README.md
```

- `frontend/`: Independent Next.js application containing no Express, Mongoose, or backend business logic.
- `backend/`: Independent Express API containing no React or browser UI code.
- `.github/workflows/`: CI and deployment pipelines.
- `docs/`: Architecture, API, database, authentication, security, and deployment documentation.
- `docker-compose.yml`: Local orchestration for frontend, backend, MongoDB, and Redis.
- `.editorconfig`: Shared editor and formatting defaults.
- `.gitignore`: Excludes dependencies, secrets, logs, uploads, and generated output.
- `LICENSE`: Project licensing terms.
- `README.md`: Setup, scripts, architecture overview, and deployment instructions.

## 2. Frontend structure

```text
frontend/
├── app/
│   ├── (auth)/
│   │   ├── layout.js
│   │   ├── login/page.js
│   │   ├── register/page.js
│   │   ├── forgot-password/page.js
│   │   ├── reset-password/page.js
│   │   ├── verify-email/page.js
│   │   └── verify-otp/page.js
│   ├── (dashboard)/
│   │   ├── layout.js
│   │   ├── dashboard/{page.js,loading.js,error.js}
│   │   ├── users/{page.js,create/page.js,[id]/page.js,[id]/edit/page.js}
│   │   ├── roles/{page.js,create/page.js,[id]/edit/page.js}
│   │   ├── permissions/page.js
│   │   ├── properties/{page.js,create/page.js,[id]/page.js,[id]/edit/page.js}
│   │   ├── projects/{page.js,create/page.js,[id]/page.js}
│   │   ├── builders/{page.js,[id]/page.js}
│   │   ├── leads/{page.js,pipeline/page.js,[id]/page.js}
│   │   ├── customers/{page.js,[id]/page.js}
│   │   ├── visits/page.js
│   │   ├── bookings/page.js
│   │   ├── tasks/page.js
│   │   ├── appointments/page.js
│   │   ├── calendar/page.js
│   │   ├── invoices/page.js
│   │   ├── payments/page.js
│   │   ├── transactions/page.js
│   │   ├── reports/{page.js,sales/page.js,revenue/page.js,leads/page.js,agents/page.js,properties/page.js}
│   │   ├── analytics/page.js
│   │   ├── documents/page.js
│   │   ├── notifications/page.js
│   │   ├── activities/page.js
│   │   ├── chat/page.js
│   │   ├── marketing/{campaigns/page.js,templates/page.js}
│   │   ├── support/{tickets/page.js,knowledge-base/page.js}
│   │   ├── content/{blogs/page.js,testimonials/page.js,faqs/page.js}
│   │   ├── profile/page.js
│   │   └── settings/{page.js,company/page.js,integrations/page.js,notifications/page.js,security/page.js}
│   ├── unauthorized/page.js
│   ├── api-health/page.js
│   ├── error.js
│   ├── global-error.js
│   ├── loading.js
│   ├── not-found.js
│   ├── layout.js
│   ├── page.js
│   └── sitemap.js
├── components/
│   ├── ui/{Alert,Avatar,Badge,Button,Card,Checkbox,ConfirmDialog,DataTable,DatePicker,Drawer,Dropdown,EmptyState,Input,Modal,OTPInput,Pagination,RadioGroup,Select,Skeleton,Spinner,Switch,Tabs,Textarea,Tooltip,Upload}.js
│   ├── forms/{FormField,FormError,ControlledInput,ControlledSelect,ControlledCheckbox,ControlledDatePicker,FileUploadField,ImageUploadField,RichTextEditorField}.js
│   ├── layout/{AppShell,Header,Sidebar,SidebarItem,MobileNavigation,Breadcrumbs,GlobalSearch,NotificationMenu,ProfileMenu,MegaMenu,Footer}.js
│   ├── auth/{AuthGuard,GuestGuard,PermissionGuard,LoginForm,RegisterForm,ForgotPasswordForm,ResetPasswordForm}.js
│   ├── dashboard/{MetricCard,RevenueChart,LeadFunnelChart,ConversionChart,PropertyStatusChart,LeadSourcesChart,TopAgents,RecentActivities,RecentTransactions,TodayTasks,UpcomingAppointments}.js
│   ├── property/{PropertyCard,PropertyTable,PropertyForm,PropertyFilters,PropertyGallery,PropertyMap,AmenitySelector,FloorPlanEditor,PropertyStatusBadge}.js
│   ├── leads/{LeadTable,LeadForm,LeadFilters,LeadPipeline,LeadPipelineColumn,LeadTimeline,LeadScore}.js
│   ├── customers/{CustomerTable,CustomerForm,CustomerOverview,CustomerHistory,CustomerDocuments}.js
│   ├── calendar/{CalendarView,CalendarToolbar,EventForm}.js
│   ├── chat/{ChatList,ChatWindow,MessageBubble,MessageComposer}.js
│   ├── reports/{ReportFilters,ReportChart,ReportTable,ExportActions}.js
│   └── common/{PageHeader,SearchInput,FilterPanel,StatusBadge,ErrorBoundary,NoPermission,ClientOnly,ThemeToggle}.js
├── hooks/{useAuth,useAuthorization,useDebounce,useDisclosure,usePagination,useQueryParams,useSocket,useTheme,useUpload}.js
├── redux/
│   ├── slices/{authSlice,uiSlice,notificationSlice,filterSlice}.js
│   ├── persistConfig.js
│   └── store.js
├── services/{apiClient,authService,userService,roleService,permissionService,propertyService,projectService,builderService,leadService,customerService,visitService,bookingService,taskService,appointmentService,calendarService,invoiceService,paymentService,transactionService,dashboardService,reportService,documentService,notificationService,chatService,marketingService,supportService,contentService,uploadService,settingsService}.js
├── queries/{queryKeys,useDashboardQueries,usePropertyQueries,useLeadQueries,useCustomerQueries,useReportQueries}.js
├── providers/{AppProviders,ReduxProvider,QueryProvider,ThemeProvider,AuthProvider,SocketProvider}.js
├── contexts/{ThemeContext,SocketContext}.js
├── validations/{authSchemas,userSchemas,propertySchemas,leadSchemas,customerSchemas,bookingSchemas,paymentSchemas}.js
├── lib/{axios,queryClient,crypto,cookies,permissions,charts}.js
├── config/{env,navigation,permissions,site}.js
├── constants/{api,roles,permissions,routes,property,lead}.js
├── utils/{formatCurrency,formatDate,formatNumber,buildQueryString,downloadFile,fileValidation,classNames}.js
├── helpers/{errorMessage,tableColumns,permissionTree}.js
├── middleware/{authMiddleware,routePermissions}.js
├── styles/{globals.css,components.css,themes.css}
├── assets/{images,icons,fonts}/
├── public/{favicon.ico,manifest.json,robots.txt,images/}
├── tests/{unit,integration,e2e,mocks,setup.js}
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── Dockerfile
├── jsconfig.json
├── next.config.js
├── package.json
├── postcss.config.js
└── tailwind.config.js
```

### Frontend responsibilities

- `app/`: App Router layouts, pages, loading states, errors, metadata, and route groups. Dynamic `[id]` directories render individual resources.
- `components/ui/`: Domain-neutral visual primitives.
- `components/forms/`: React Hook Form adapters and complex reusable controls.
- `components/layout/`: Application shell and navigation.
- Domain component folders: Presentation components belonging to one business area.
- `hooks/`: Reusable client behavior without markup.
- `redux/`: Cross-page client state. Redux Persist retains safe UI/session metadata only; it never stores raw tokens.
- `queries/`: TanStack Query keys and reusable domain queries/mutations.
- `services/`: One API service per domain. Components never use Axios directly.
- `providers/` and `contexts/`: Application-wide infrastructure and narrowly scoped contexts.
- `validations/`: Zod schemas shared by forms.
- `lib/`: Configured third-party infrastructure.
- `config/`: Environment, navigation, permission, and site configuration.
- `constants/`: Immutable domain values.
- `utils/`: Pure transformations.
- `helpers/`: Higher-level application helpers.
- `middleware/`: Route matching and coarse authentication redirects; the backend remains authoritative.
- `tests/`: Unit, integration, and end-to-end coverage.

## 3. Backend structure

```text
backend/
├── src/
│   ├── config/{env,cors,cloudinary,mailer,redis,logger}.js
│   ├── database/{mongoose,indexes,transaction}.js
│   ├── constants/{roles,permissions,tokenTypes,activityTypes,propertyStatuses,leadStatuses}.js
│   ├── models/
│   │   ├── User.js, Role.js, Permission.js, RefreshToken.js
│   │   ├── PasswordResetToken.js, EmailVerificationToken.js, LoginHistory.js
│   │   ├── Property.js, PropertyImage.js, PropertyType.js, PropertyStatus.js, Amenity.js
│   │   ├── Project.js, Builder.js, Lead.js, Customer.js, Agent.js
│   │   ├── Visit.js, Booking.js, Transaction.js, Invoice.js, Payment.js
│   │   ├── Task.js, Appointment.js, CalendarEvent.js, Activity.js, Notification.js
│   │   ├── Chat.js, Message.js, Team.js, Document.js, Note.js, Setting.js, AuditLog.js
│   │   ├── Favorite.js, Wishlist.js, Enquiry.js, Blog.js, Testimonial.js, FAQ.js
│   │   ├── Country.js, State.js, City.js, Area.js, Location.js, Tag.js
│   │   └── Report.js, DashboardMetric.js, SupportTicket.js, KnowledgeBaseArticle.js,
│   │       MarketingCampaign.js, CommunicationTemplate.js
│   ├── repositories/{baseRepository,userRepository,roleRepository,propertyRepository,leadRepository,customerRepository,bookingRepository,paymentRepository,reportRepository}.js
│   ├── services/{authService,tokenService,sessionService,userService,roleService,permissionService,propertyService,leadService,customerService,bookingService,paymentService,dashboardService,reportService,uploadService,emailService,notificationService,auditService,searchService,exportService}.js
│   ├── controllers/{authController,userController,roleController,permissionController,propertyController,projectController,builderController,leadController,customerController,visitController,bookingController,taskController,appointmentController,calendarController,invoiceController,paymentController,reportController,documentController,notificationController,chatController,supportController,contentController,uploadController,settingsController}.js
│   ├── validators/{commonValidators,authValidators,userValidators,roleValidators,propertyValidators,leadValidators,customerValidators,bookingValidators,paymentValidators}.js
│   ├── middlewares/{authenticate,authorize,validate,errorHandler,notFound,rateLimiter,requestId,sanitize,csrfProtection,upload,audit,pagination}.js
│   ├── routes/
│   │   ├── index.js
│   │   └── v1/{index,authRoutes,userRoutes,roleRoutes,permissionRoutes,propertyRoutes,projectRoutes,builderRoutes,leadRoutes,customerRoutes,visitRoutes,bookingRoutes,taskRoutes,appointmentRoutes,calendarRoutes,invoiceRoutes,paymentRoutes,transactionRoutes,dashboardRoutes,reportRoutes,documentRoutes,notificationRoutes,chatRoutes,searchRoutes,uploadRoutes,supportRoutes,contentRoutes,settingsRoutes}.js
│   ├── utils/{ApiError,ApiResponse,asyncHandler,pagination,queryBuilder,encryption,hashing,jwt,cookies,device,file,slug}.js
│   ├── helpers/{permissionResolver,auditDiff,emailRenderer,notificationFactory}.js
│   ├── integrations/
│   │   ├── cloudinary/cloudinaryClient.js
│   │   ├── email/nodemailerClient.js
│   │   ├── sms/smsProvider.js
│   │   ├── whatsapp/whatsappProvider.js
│   │   └── maps/geocodingProvider.js
│   ├── emails/
│   │   ├── templates/{verifyEmail,resetPassword,welcomeUser,leadAssigned,appointmentReminder}.js
│   │   └── layouts/baseEmail.js
│   ├── sockets/{index,authentication,chatHandlers,notificationHandlers}.js
│   ├── jobs/{emailQueue,notificationQueue,reportQueue,imageQueue}.js
│   ├── cron/{appointmentReminders,staleLeadReminders,metricAggregation,tokenCleanup}.js
│   ├── events/{eventBus,leadEvents,bookingEvents,paymentEvents}.js
│   ├── templates/{reports,invoices,exports}/
│   ├── app.js
│   └── server.js
├── seeders/{permissionsSeeder,rolesSeeder,adminSeeder,locationSeeder,index}.js
├── scripts/{createAdmin,migrateIndexes,cleanupTokens,generateOpenApi}.js
├── tests/{unit,integration,fixtures,helpers,setup.js}
├── uploads/.gitkeep
├── logs/.gitkeep
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── Dockerfile
├── nodemon.json
├── package.json
└── README.md
```

### Backend responsibilities

- `app.js`: Configures Express without opening a port, allowing isolated integration tests.
- `server.js`: Connects infrastructure, starts HTTP/WebSocket servers, and handles graceful shutdown.
- `routes/`: Declares URLs and assembles middleware.
- `validators/`: Validates and normalizes params, queries, and bodies.
- `controllers/`: Translates HTTP requests into service calls and remains thin.
- `services/`: Owns business rules and transaction boundaries.
- `repositories/`: Encapsulates persistence queries and aggregation pipelines.
- `models/`: Defines Mongoose schemas, indexes, hooks, and model behavior.
- `middlewares/`: Handles cross-cutting HTTP concerns.
- `integrations/`: Hides third-party vendors behind replaceable adapters.
- `jobs/`: Executes email, export, notification, and media work asynchronously.
- `cron/`: Runs reminders, aggregation, and cleanup tasks.
- `events/`: Publishes and consumes domain events.
- `sockets/`: Provides authorized real-time chat and notifications.
- `seeders/`: Inserts repeatable reference data.
- `scripts/`: Provides explicit administration and migration utilities.
- `uploads/`: Temporary staging only; Cloudinary holds durable uploads.
- `logs/`: Development logs; production uses centralized structured logging.

## 4. System architecture

```text
Browser / Mobile Web
        |
        | HTTPS
        v
Next.js Frontend
  |-- App Router
  |-- Reusable UI and domain components
  |-- Redux client state
  |-- TanStack Query server state
  |-- Central Axios service layer
        |
        | REST /api/v1 + WebSocket
        v
Express API
  |-- Security middleware
  |-- Authentication and authorization
  |-- Validation and controllers
  |-- Domain services and repositories
        |
        +------------+-------------+-------------+
        |            |             |             |
        v            v             v             v
     MongoDB       Redis       Cloudinary    Email/SMS/
                                              WhatsApp
```

- Frontend and backend deploy independently.
- REST is the primary contract; WebSockets handle transient real-time events.
- Controllers are transport adapters, services own decisions, and repositories own persistence.
- External vendors are isolated behind adapters.
- MongoDB is the source of truth.
- Redis is optional for cache, queues, distributed rate limiting, and socket coordination.
- Background jobs remain outside request processing.
- Server-side permission checks are mandatory even when frontend controls are hidden.
- High-value multi-record operations use MongoDB transactions where supported.

## 5. API flow

```text
UI interaction
   -> React Hook Form + Zod
   -> Frontend domain service
   -> Central Axios client
   -> /api/v1/<resource>
   -> Request ID / security / rate limit / authentication
   -> Validation / authorization / controller
   -> Service / repository / Mongoose / MongoDB
   -> Standard API response
   -> TanStack Query cache update or invalidation
   -> UI refresh with toast or inline feedback
```

Successful response contract:

```text
success: true
message: Human-readable result
data: Resource or result payload
errors: null
```

Failure response contract:

```text
success: false
message: Safe error summary
data: null
errors: Structured validation or domain errors
```

HTTP status codes remain authoritative. Stack traces and internal infrastructure details are never returned in production.

## 6. Authentication flow

### Login

```text
Credentials + remember-me + device metadata
  -> Validate request and find active user
  -> Compare bcrypt password hash
  -> Check verified, locked, and suspended status
  -> Create short-lived access token
  -> Create rotating refresh-token record
  -> Set Secure HttpOnly cookies
  -> Record login history and device session
```

- Access tokens have short lifetimes and restricted claims.
- Refresh tokens have longer lifetimes and rotate on every refresh.
- Production cookies are `Secure`, `HttpOnly`, narrowly scoped, and use an explicit `SameSite` policy.
- Stored refresh-token material is hashed and includes device, expiry, revocation, family, and replacement metadata.
- Remember Me changes refresh-session lifetime, not access-token lifetime.
- Redux and browser storage never persist raw tokens.

### Refresh rotation

```text
Expired access token
  -> API returns 401 TOKEN_EXPIRED
  -> Axios performs one coordinated refresh request
  -> Backend validates cookie and stored token hash
  -> Backend revokes old token and creates its replacement
  -> Backend issues new cookies
  -> Axios retries the original request
```

Reuse of a rotated refresh token indicates possible theft. The backend revokes the token family and terminates the affected session.

### Recovery, verification, and logout

- Password reset and email verification tokens are short-lived, hashed, and single-use.
- A successful password reset revokes active refresh sessions.
- Current logout revokes the current session and clears cookies.
- Logout-all revokes every active session for the user.
- Auto logout occurs after refresh expiry, session revocation, account disabling, or token-reuse detection.

## 7. Role and permission flow

Roles are configurable collections of permissions. Code checks permission keys instead of hard-coded role names, except guarded Super Admin bootstrap behavior.

Permission format:

```text
resource.action
```

Examples: `properties.read`, `properties.create`, `properties.publish`, `leads.assign`, `leads.convert`, `payments.approve`, `reports.export`, and `roles.manage`.

```text
Authenticated user
  -> Load assigned role(s)
  -> Resolve enabled permissions
  -> Check route permission
  -> Apply ownership, team, organization, and territory constraints
  -> Execute or return 403 and create an audit record
```

| Role | Default scope |
|---|---|
| Super Admin | Full system and tenant control |
| Admin | Operational administration except protected platform controls |
| Manager | Team, property, lead, booking, and report oversight |
| Sales Manager | Sales pipeline, agents, bookings, and sales reporting |
| Agent | Assigned leads, customers, properties, visits, and tasks |
| Telecaller | Lead contact, follow-up, notes, and appointments |
| Marketing | Campaigns, content, enquiries, and source analytics |
| Accountant | Invoices, payments, transactions, and finance reports |
| Customer Support | Tickets, communication, and knowledge base |
| Builder | Own projects, inventory, enquiries, and reports |
| Customer | Own profile, documents, wishlist, visits, and bookings |
| Guest | Publicly permitted property and content access |

## 8. Request lifecycle

1. Request reaches the reverse proxy or load balancer over HTTPS.
2. Transport and request-size policies are enforced.
3. Express assigns a correlation ID.
4. Helmet applies security headers.
5. CORS evaluates the origin.
6. Cookies and bodies are parsed with strict limits.
7. Sanitization rejects unsafe input shapes and operators.
8. Global or route-specific rate limits run.
9. Authentication validates the session.
10. CSRF protection runs for cookie-authenticated mutations.
11. Express Validator validates params, query, and body.
12. Authorization checks permissions and record scope.
13. The controller extracts transport-level input.
14. The service applies domain rules.
15. The repository performs indexed persistence operations.
16. Audit and domain-event records are created.
17. The transaction commits when atomicity is required.
18. The response is normalized.
19. Structured logs capture status, timing, and correlation ID.
20. Background jobs and real-time updates execute asynchronously.

All thrown errors flow through one error handler that maps validation, authentication, authorization, conflict, missing-resource, database, and internal failures to safe responses.

## 9. Database flow and conventions

```text
Service
  -> domain rules and transaction boundary
Repository
  -> projection, filters, sorting, pagination, aggregation
Mongoose model
  -> schema validation, hooks, indexes
MongoDB
```

- References are used for entities with independent lifecycles.
- Small immutable snapshots may be embedded where historical accuracy matters.
- Soft deletion uses `deletedAt` and `deletedBy`.
- Standard governance fields include `createdBy`, `updatedBy`, team, and organization scope.
- Audit logs are append-only.
- Money uses integer minor units or MongoDB Decimal128, never floating-point values.
- Dates are stored in UTC and converted at presentation boundaries.
- Expensive dashboard aggregates may be precomputed.

## 10. Collection plan

### Identity and access

| Collection | Responsibility |
|---|---|
| Users | Credentials, profile, status, roles, preferences |
| Roles | Named configurable permission groups |
| Permissions | Canonical resource-action capabilities |
| Refresh Tokens | Rotating device sessions and revocation |
| Password Reset Tokens | Single-use password recovery |
| Email Verification Tokens | Single-use email verification |
| Login History | Successful and failed login events |
| Teams | Organizational grouping and management hierarchy |

### Property catalog

| Collection | Responsibility |
|---|---|
| Properties | Listing, pricing, location, availability, and SEO |
| Property Images | Cloudinary assets, order, metadata, and type |
| Property Types | Apartment, villa, plot, commercial, and custom types |
| Property Status | Draft, available, reserved, sold, rented, archived |
| Amenities | Reusable property and project facilities |
| Projects | Developments containing inventory |
| Builders | Builder and developer organizations |
| Locations | Searchable normalized location metadata |
| Countries / States / Cities / Areas | Geographic reference hierarchy |
| Tags | Flexible classification and discovery |
| Favorites | User-property favorite relation |
| Wishlist | Named customer property collections |
| Enquiries | Public and customer property enquiries |

### CRM and finance

| Collection | Responsibility |
|---|---|
| Leads | Prospect identity, source, status, score, and owner |
| Customers | Converted customer profiles and relationships |
| Agents | Sales profile linked to a user |
| Activities | Immutable CRM interaction timeline |
| Notes | Permission-aware notes on domain records |
| Tasks | Assigned work, priority, due date, reminders |
| Appointments | Scheduled lead/customer meetings |
| Calendar Events | Unified calendar representation |
| Visits | Property-viewing schedule and outcome |
| Bookings | Reservation and purchase workflow |
| Transactions | Accounting-level money-movement ledger |
| Invoices | Numbered charges and line items |
| Payments | Gateway/manual records and reconciliation |

### Collaboration, content, and operations

| Collection | Responsibility |
|---|---|
| Notifications | Delivery and read state |
| Chats / Messages | Conversations, membership, messages, attachments |
| Documents | Private/public file metadata |
| Communication Templates | Email, SMS, and WhatsApp templates |
| Marketing Campaigns | Audience, schedule, content, and results |
| Support Tickets | Customer support lifecycle |
| Knowledge Base Articles | Searchable support content |
| Blogs / Testimonials / FAQs | Managed public content |
| Settings | Platform, company, and user configuration |
| Audit Logs | Security and mutation audit trail |
| Reports | Saved definitions and generated exports |
| Dashboard Metrics | Pre-aggregated analytics snapshots |

## 11. Key relationships

```text
User --< RefreshToken
User --< LoginHistory
User >--< Role >--< Permission
User >-- Team

Builder --< Project --< Property
Property --< PropertyImage
Property >--< Amenity
Property -- PropertyType / PropertyStatus / Country / State / City / Area

Lead -- assignedTo(User/Agent)
Lead --< Activity / Note / Task / Appointment
Lead -- convertsTo -- Customer

Customer --< Visit >-- Property
Customer --< Booking >-- Property
Booking --< Invoice --< Payment
Payment -- Transaction

Chat --< Message
User >--< Chat
User --< Notification
```

## 12. Indexing plan

- Unique normalized user email and, when required, tenant-scoped phone.
- Unique role and permission keys.
- Refresh-token hash, family ID, user ID, and expiry.
- Property status, type, location, builder, project, price, assignee, and creation date.
- A `2dsphere` index for property map searches.
- Search indexes for properties, leads, customers, and knowledge-base content.
- Lead status, source, score, assignee, follow-up date, and creation date.
- Customer email, phone, assigned agent, and creation date.
- Task assignee, state, priority, and due date.
- Appointment participant and start time.
- Booking customer, property, status, and creation date.
- Invoice number, customer, status, and due date.
- Payment reference, invoice, status, and paid date.
- Audit resource, actor, event, and timestamp.
- TTL indexes for reset and verification tokens where appropriate.
- Deterministic secondary sorting, normally `_id`, on every paginated query.

## 13. API plan

Base URL: `/api/v1`

### Authentication

```text
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
POST   /auth/logout-all
POST   /auth/forgot-password
POST   /auth/reset-password
POST   /auth/verify-email
POST   /auth/resend-verification
POST   /auth/change-password
GET    /auth/me
GET    /auth/sessions
DELETE /auth/sessions/:sessionId
```

### Standard resource contract

```text
GET    /resources
POST   /resources
GET    /resources/:id
PATCH  /resources/:id
DELETE /resources/:id
POST   /resources/bulk-delete
PATCH  /resources/bulk-update
POST   /resources/:id/restore
```

List endpoints accept `page`, `limit`, `search`, `sort`, `fields`, `status`, `createdFrom`, `createdTo`, and structured filters.

Major route groups include users, roles, permissions, teams, properties, property types/statuses, amenities, projects, builders, leads, customers, visits, bookings, tasks, appointments, calendar events, invoices, payments, transactions, reports, dashboard, documents, activities, notifications, chats, messages, search, uploads, settings, support tickets, knowledge base, blogs, testimonials, FAQs, campaigns, templates, and locations.

### Specialized operations

```text
PATCH  /leads/:id/assign
PATCH  /leads/:id/status
POST   /leads/:id/convert
POST   /leads/:id/activities
POST   /leads/:id/notes

POST   /properties/:id/images
PATCH  /properties/:id/images/reorder
DELETE /properties/:id/images/:imageId
PATCH  /properties/:id/feature
GET    /properties/search
GET    /properties/map-search

PATCH  /bookings/:id/status
POST   /bookings/:id/cancel
POST   /invoices/:id/send
POST   /payments/:id/refund

GET    /dashboard/summary
GET    /dashboard/revenue
GET    /dashboard/lead-funnel
GET    /dashboard/property-status
GET    /dashboard/top-agents

POST   /reports/generate
GET    /reports/:id/export
GET    /search/global
```

## 14. Module plan

| Module | Capabilities |
|---|---|
| Authentication | Secure identity, recovery, verification, sessions |
| Dashboard | KPIs, charts, tasks, activities, transactions |
| Users | Lifecycle, teams, status, sessions |
| Roles and Permissions | Configurable RBAC and permission matrix |
| Properties | Inventory, media, pricing, map, availability, SEO |
| Projects and Builders | Development hierarchy and portfolios |
| Leads | Capture, scoring, assignment, pipeline, conversion |
| Customers | Profile, history, documents, communication |
| Tasks | Assignment, priority, reminders, completion |
| Appointments and Calendar | Meetings, visits, reminders, shared calendar |
| Visits | Viewing schedule, feedback, outcome |
| Bookings | Reservation and sales workflow |
| Finance | Invoices, payments, transactions, reconciliation |
| Reports | Analytics, PDF/Excel export, printing |
| Documents | Secure uploads, associations, visibility |
| Notifications | In-app, email, SMS, WhatsApp-ready delivery |
| Chat | Real-time internal and customer conversations |
| Marketing | Campaigns, templates, audiences, results |
| Support | Tickets and knowledge base |
| Content | Blogs, testimonials, FAQs |
| Settings | Company, integrations, security, templates |
| Audit | Immutable activity and security history |

## 15. Security architecture

- Strict environment validation at startup.
- Helmet headers and restrictive production CSP.
- Explicit CORS origin allowlist.
- Global and route-specific rate limits.
- Configurable bcrypt work factor and hash-upgrade policy.
- Short-lived access tokens, rotating refresh tokens, and hashed stored token values.
- Secure HttpOnly cookies and CSRF protection for authenticated mutations.
- Mongo-operator and prototype-pollution defenses.
- Request-body and upload-size limits.
- MIME type and file-signature validation.
- Controlled Cloudinary transformations and asset allowlists.
- Response projections that exclude secrets.
- Login lockout or progressive backoff.
- Permission and ownership checks on every protected operation.
- Audit events for auth, configuration, finance, permissions, and destructive actions.
- Secrets excluded from source control and images.
- Safe production error responses.
- WebSocket authentication and room authorization.
- Signed or authenticated access to private documents.

## 16. Performance architecture

- Route-level splitting and dynamic imports.
- Responsive optimized images.
- Domain-specific TanStack Query cache policies.
- Debounced search and cancelable requests.
- Server-side filtering, pagination, projection, and sorting.
- Optional table virtualization.
- Compound MongoDB indexes based on observed query patterns.
- Aggregation pipelines and precomputed dashboard metrics.
- Redis caching for stable reference data and dashboard summaries.
- Compression and background queues.
- Cursor pagination for activity feeds and messages.
- Event-driven cache invalidation.
- Memoization only for measured render bottlenecks.

## 17. Deployment architecture

```text
GitHub
  |-- CI: lint, test, build, dependency audit
  |-- Frontend deployment: Vercel
  `-- Backend deployment: Render, Railway, or AWS
        |-- MongoDB Atlas
        |-- Redis
        |-- Cloudinary
        `-- Email/SMS/WhatsApp providers
```

Docker Compose supports local development. Production uses managed secrets, HTTPS, health/readiness checks, structured logs, database backups, and rollback-capable releases.

## 18. Delivery phases

1. Architecture, folder structure, database plan, module plan, and API plan — complete.
2. Backend foundation and core infrastructure.
3. Frontend foundation and reusable design system.
4. Authentication, sessions, RBAC, and permissions.
5. Dashboard and analytics.
6. CRM modules and integrations.
7. Unit, integration, and end-to-end testing.
8. Docker and Docker Compose.
9. GitHub Actions and CI/CD.
10. Production deployment configuration.
11. Performance and security optimization.
12. Production-readiness checklist and final documentation.
