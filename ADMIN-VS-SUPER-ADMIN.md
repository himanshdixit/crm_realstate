# Admin vs Super Admin

This document explains the difference between the `admin` and `super-admin` roles in EstateFlow.

## Summary

Both roles currently receive all seeded application permissions. The important difference is their intended responsibility and usage policy:

| Area | Admin | Super Admin |
|---|---|---|
| Intended purpose | Daily CRM administration | System ownership, bootstrap, and emergency administration |
| Seeded permission access | All permissions | All permissions |
| Typical users | Operations administrator, branch administrator | Platform owner or trusted technical owner |
| Account creation | Assigned through controlled user/role administration | Created initially through the secure bootstrap script |
| Daily use | Appropriate for routine administration | Should not normally be used for routine work |
| System configuration | Full access under the current permission seed | Full access and ultimate system responsibility |
| Role and permission management | Allowed by the current permission configuration | Allowed |
| Business modules | Full CRUD and workflow access | Full CRUD and workflow access |
| Reports and exports | Full access | Full access |
| Security risk if compromised | Critical | Critical and potentially platform-wide |

## Current implementation

The backend defines these role slugs:

```text
admin
super-admin
```

The role seeder currently maps both roles to `*`, meaning that both receive every active seeded permission. Backend authorization resolves permissions from the authenticated user's roles and applies those permissions to API requests.

The effective request flow is:

```text
Authentication cookie or bearer token
    → Active user validation
    → Assigned role resolution
    → Permission resolution
    → Route authorization
    → Controller and database operation
```

Changing or hiding frontend navigation does not change access control. Protected backend endpoints independently verify the required permission.

## Admin responsibilities

An Admin is intended for everyday administration, including:

- Managing properties, projects, builders, leads, and customers
- Managing visits, bookings, tasks, and appointments
- Managing invoices and payments
- Reviewing dashboards, analytics, and reports
- Managing content, campaigns, templates, and support tickets
- Managing documents, notifications, and CRM operations
- Performing authorized bulk updates and soft deletes
- Managing users and access when organizational policy permits it

Even though the current seed grants complete access, Admin accounts should be assigned only to trusted operational personnel.

## Super Admin responsibilities

A Super Admin is the highest-trust account and is intended for:

- Initial platform bootstrap
- Creating and supervising administrators
- Configuring roles and permissions
- Emergency account recovery
- Security and audit oversight
- Organization-wide configuration
- Deployment and production ownership
- Resolving access-control failures

A Super Admin account should be used sparingly and protected with a unique password and strict session hygiene.

## Creation difference

The initial Super Admin is created through the backend bootstrap command:

```powershell
cd "F:\AI Projects mine\codex-realestate\backend"
npm.cmd run seed
npm.cmd run seed:admin
```

The bootstrap script reads `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_FIRST_NAME`, and `ADMIN_LAST_NAME` from `backend/.env`. It creates an active, email-verified account with the `super-admin` role and refuses to overwrite an existing user.

An Admin should normally be created or promoted through controlled user and role management after the initial Super Admin signs in. A public registration must never automatically grant either `admin` or `super-admin`; public registration assigns the limited `customer` role.

## Recommended production policy

Although Admin and Super Admin currently have the same seeded permissions, they should not remain operationally identical in a mature production deployment.

Recommended restrictions for Admin:

- Prevent assignment or removal of the `super-admin` role
- Prevent modification of Super Admin accounts
- Prevent changes to platform-level security configuration
- Prevent access to secrets and infrastructure configuration
- Limit destructive bulk operations where appropriate
- Scope records to the Admin's organization or branch

Recommended protections for Super Admin:

- Maintain as few Super Admin accounts as possible
- Use a unique high-entropy password
- Enable multi-factor authentication when implemented
- Review active sessions regularly
- Record every privileged operation in immutable audit logs
- Avoid using the account for ordinary sales or CRM work
- Keep at least one documented emergency recovery procedure

## Important security note

Role names alone must never determine security in frontend code. Authorization decisions must continue to use backend permission checks. This allows permissions to be changed without duplicating role logic throughout controllers and UI components.

If stronger separation is required, update the role permission mapping so `admin` receives an explicit administrative permission set while `super-admin` retains wildcard access. Existing users should then be reviewed and tested before deploying the change.

________

In your CRM, a normal registered user receives the customer role, while a Super Admin receives the super-admin role.
Capability	Normal user (customer)	Super Admin (super-admin)
Registration	Can self-register	Created using the admin seed script
Email verification	Required after registration	Automatically verified during creation
Initial status	pending until verification	Immediately active
Permissions	Limited customer permissions	All 131 permissions
Dashboard	Customer-focused access	Complete business dashboard
Properties	Can view properties	Full create, view, edit, delete, restore and feature access
Leads	No administrative access	Full lead management and conversion
Customers	Limited/no management access	Full customer management
Users	Cannot manage users	Can manage users and access
Roles and permissions	Cannot configure them	Full role and permission control
Builders and projects	Read access only where allowed	Full management
Visits	Can view and create visits	Full management
Bookings	Can view own allowed bookings	Full booking management and approval
Tasks and appointments	Limited by permissions	Full management
Invoices and payments	Limited customer visibility	Full financial management
Reports	Limited/no export access	Full reports, PDF and Excel exports
Documents	Can access permitted documents	Full document management
Marketing/content	No administrative access	Full campaigns, blogs, FAQs and templates
Support	Can submit or view allowed requests	Full support-ticket management
Audit activity	Cannot manage audit data	Full audit visibility
Bulk operations	Not allowed	Bulk update and deletion allowed
System settings	No access	Full access


Normal user creation
A user registers through:
http://localhost:3000/register
The backend assigns the customer role:
Register → pending account → verification email → active customer
A normal user is intended to:
- Search and view properties
- Create property visits
- View permitted bookings
- Access permitted documents
- Maintain their profile and security sessions
The exact access comes from the permissions assigned to the customer role.
Super Admin creation
A Super Admin is created from the backend:
cd "F:\AI Projects mine\codex-realestate\backend"
npm.cmd run seed
npm.cmd run seed:admin
The script creates:
Active + email verified + super-admin role
The super-admin role contains every seeded permission, so it can operate every CRM module.
Security difference
The distinction is permission-based, not merely a frontend UI difference.
Every protected backend request runs through:
Authentication → user status → roles → permissions → authorization
Therefore, manually opening an administrative frontend URL does not give a normal user access. The backend checks the required permission and returns HTTP 403 when it is missing.
Important recommendation
Use a Super Admin account only for:
- Initial system configuration
- Role and permission administration
- Emergency access
- High-level auditing
For everyday work, create narrower roles such as Admin, Manager, Agent, Accountant or Customer Support. This limits damage if an account is compromised.
